import { recognizerLogger as logger } from '../../configuration/LoggerConfig'
import * as CryptoHelper from '../CryptoHelper'
import * as NetworkWSInterface from './networkWSInterface'

import {
  buildNewContentPackageInput,
  buildRestoreIInkSessionInput,
  buildNewContentPart,
  buildOpenContentPart,
  buildConfiguration
} from './iinkWsRecognizer'

/**
 * A websocket dialog have this sequence :
 * ---------- Client ------------------------------------- Server ----------------------------------
 * init (send the new content package) ================>
 *                                       <=========== hmacChallenge
 * answerToHmacChallenge (send the hmac) =========>
 * newPart (send the parameters ) ===============>
 *                                       <=========== update
 * addStrokes (send the strokes ) ============>
 *                                       <=========== update
 */

function buildHmacMessage (configuration, message) {
  return {
    type: 'hmac',
    hmac: CryptoHelper.computeHmac(message.data.hmacChallenge, configuration.recognitionParams.server.applicationKey, configuration.recognitionParams.server.hmacKey)
  }
}

/**
 * This function bind the right behaviour when a message is receive by the websocket.
 * @param {DestructuredPromise} destructuredPromise
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @return {function} Callback to handle WebSocket results
 */
export function buildWebSocketCallback (recognizerContext) {
  return (message) => {
    const recognizerContextRef = recognizerContext
    // Handle websocket messages
    logger.trace(`${message.type} websocket callback`, message)
    const recognitionContext = recognizerContext.recognitionContexts[recognizerContext.recognitionContexts.length - 1]
    logger.debug('Current recognition context', recognitionContext)

    switch (message.type) {
      case 'open':
        if (recognizerContext.sessionId) {
          NetworkWSInterface.send(recognizerContext, buildRestoreIInkSessionInput(recognizerContext.editor.configuration, recognizerContext.editor.domElement, recognizerContext.sessionId))
        } else {
          NetworkWSInterface.send(recognizerContext, buildNewContentPackageInput(recognizerContext.editor.configuration, recognizerContext.editor.domElement))
        }
        break
      case 'message':
        logger.debug(`Receiving ${message.data.type} message`, message)
        switch (message.data.type) {
          case 'ack':
            if (message.data.hmacChallenge) {
              NetworkWSInterface.send(recognizerContext, buildHmacMessage(recognizerContext.editor.configuration, message))
            }
            if (message.data.iinkSessionId) {
              recognizerContextRef.sessionId = message.data.iinkSessionId
            }
            break
          case 'newPart':
            break
          case 'contentPackageDescription':
            recognizerContextRef.currentReconnectionCount = 0
            recognizerContextRef.contentPartCount = message.data.contentPartCount
            NetworkWSInterface.send(recognizerContext, buildConfiguration(recognizerContext.editor.configuration))
            if (recognizerContextRef.currentPartId) { // FIXME: Ugly hack to resolve init promise after opening part
              NetworkWSInterface.send(recognizerContext, buildOpenContentPart(recognizerContext.editor.configuration, recognizerContext.currentPartId))
            } else {
              NetworkWSInterface.send(recognizerContext, buildNewContentPart(recognizerContext.editor.configuration))
            }
            break
          case 'partChanged':
            if (message.data.partId) {
              recognizerContextRef.currentPartId = message.data.partId
            }
            recognizerContextRef.initialized = true
            if (recognitionContext.partChange) {
              recognitionContext.partChange.resolve([undefined, message.data])
            } else {
              recognitionContext.error(message)
            }
            break
          case 'contentChanged':
            if (message.data.canUndo !== undefined) {
              recognizerContextRef.canUndo = message.data.canUndo
            }
            if (message.data.canRedo !== undefined) {
              recognizerContextRef.canRedo = message.data.canRedo
            }
            if (message.data.empty !== undefined) {
              recognizerContextRef.isEmpty = message.data.empty
            }
            if (message.data.possibleUndoCount !== undefined) {
              recognizerContextRef.possibleUndoCount = message.data.possibleUndoCount
            }
            if (message.data.undoStackIndex !== undefined) {
              recognizerContextRef.undoStackIndex = message.data.undoStackIndex
            }
            recognitionContext.contentChange.resolve([undefined, message.data])
            break
          case 'exported':
            recognitionContext.response(undefined, message.data)
            break
          case 'svgPatch':
            recognitionContext.patch(undefined, message.data)
            break
          case 'supportedImportMimeTypes':
            recognizerContextRef.supportedImportMimeTypes = message.data.mimeTypes
            recognitionContext.response(undefined, message.data)
            break
          case 'fileChunkAck':
            recognitionContext.response(undefined, message.data)
            break
          case 'idle':
            recognizerContextRef.idle = true
            recognitionContext.patch(undefined, message.data)
            break
          case 'error':
            logger.debug('Error detected stopping all recognition', message)
            if (recognitionContext) {
              let func = () => {}
              if (recognitionContext.patch) {
                func = recognitionContext.patch
              } else if (recognitionContext.response) {
                func = recognitionContext.response
              }
              func(message.data)
            } else {
              recognitionContext.initPromise.reject(Object.assign({}, message.data, { recoverable: false }))
            }
            break
          default :
            logger.warn('This is something unexpected in current recognizer. Not the type of message we should have here.', message)
        }
        break
      case 'error':
        logger.debug('Error detected stopping all recognition', message)
        if (recognitionContext) {
          let func = () => {}
          if (recognitionContext.patch) {
            func = recognitionContext.patch
          } else if (recognitionContext.response) {
            func = recognitionContext.response
          }
          func(Object.assign({}, message, { recoverable: false }))
        } else {
          recognitionContext.initPromise.reject(Object.assign({}, message, { recoverable: false }))
        }
        break
      case 'close':
        logger.debug('Close detected stopping all recognition', message)
        recognizerContextRef.initialized = false
        if (recognitionContext) {
          recognitionContext.error(message)
        } else {
          recognitionContext.initPromise.reject(message)
        }
        break
      default :
        logger.warn('This is something unexpected in current recognizer. Not the type of message we should have here.', message)
    }
  }
}
