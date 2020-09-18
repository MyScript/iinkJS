import { recognizerLogger as logger } from '../../configuration/LoggerConfig'
import * as NetworkWSInterface from './networkWSInterface'
import * as PromiseHelper from '../../util/PromiseHelper'
import * as InkModel from '../../model/InkModel'
import * as RecognizerContext from '../../model/RecognizerContext'
import {
  responseCallback,
  setTheme,
  setPenStyle,
  setPenStyleClasses
} from './iinkWsRecognizer'

function buildUrl (configuration, suffixUrl) {
  const scheme = (configuration.recognitionParams.server.scheme === 'https') ? 'wss' : 'ws'
  return `${scheme}://${configuration.recognitionParams.server.host}${suffixUrl}`
}

/**
 * Build websocket function
 * @typedef {function} BuildWebSocketFunction
 * @param {DestructuredPromise} destructuredPromise
 * @param {RecognizerContext} recognizerContext
 * @return {Callback}
 */

/**
 * Init the websocket recognizer.
 * Open the connexion and proceed to the hmac challenge.
 * @param {String} suffixUrl
 * @param {RecognizerContext} recognizerContext
 * @param {BuildWebSocketFunction} buildWebSocketCallback
 * @param {function} reconnect
 * @return {Promise} Fulfilled when the init phase is over.
 */
export function init (suffixUrl, recognizerContext, buildWebSocketCallback, reconnect) {
  const recognitionContext = recognizerContext.recognitionContexts[0]
  const recognizerContextReference = RecognizerContext.updateRecognitionPositions(recognizerContext, recognitionContext.model.lastPositions)
  recognizerContextReference.url = buildUrl(recognizerContext.editor.configuration, suffixUrl)
  recognizerContextReference.reconnect = reconnect

  recognizerContextReference.initPromise = recognitionContext.initPromise.promise

  logger.debug('Opening the websocket for context ', recognizerContext)
  recognizerContextReference.websocketCallback = buildWebSocketCallback(recognizerContextReference)
  recognizerContextReference.websocket = NetworkWSInterface.openWebSocket(recognizerContextReference)
  return recognizerContextReference.initPromise
}

export async function retry (func, recognizerContext, model, buildFunc, ...params) {
  if (RecognizerContext.shouldAttemptImmediateReconnect(recognizerContext) && recognizerContext.reconnect) {
    logger.info('Attempting a retry', recognizerContext.currentReconnectionCount)
    await recognizerContext.reconnect(recognizerContext, model)
      .catch((err) => {
        logger.error('Failed retry', err)
        retry(func, recognizerContext, model, buildFunc, ...params)
      })
    setTheme(recognizerContext, model, recognizerContext.editor.theme)
    setPenStyle(recognizerContext, model, recognizerContext.editor.penStyle)
    setPenStyleClasses(recognizerContext, model, recognizerContext.editor.penStyleClasses)

    return func(recognizerContext, model, buildFunc, ...params)
  } else {
    responseCallback(model, 'Unable to reconnect')
  }
}

/**
 * @param {RecognizerContext} recognizerContext
 * @param {function} buildMessage
 * @param {...Object} params
 * @return {Promise}
 */
export function sendMessage (recognizerContext, buildMessage, ...params) {
  return recognizerContext.initPromise
    .then(() => {
      logger.trace('Init was done. Sending message')
      const message = buildMessage(...params)
      if (message) {
        NetworkWSInterface.send(recognizerContext, message)
        const positions = recognizerContext.recognitionContexts[0].model.lastPositions
        if (positions) {
          RecognizerContext.updateRecognitionPositions(recognizerContext, positions)
        }
      } else {
        logger.warn('empty message')
      }
    })
}

/**
 * Do what is needed to clean the server context.
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function clear (recognizerContext, model, callback) {
  const modelRef = InkModel.clearModel(model)
  const recognizerContextReference = RecognizerContext.updateRecognitionPositions(recognizerContext, modelRef.lastPositions)
  if (recognizerContextReference && recognizerContextReference.websocket) {
    // We have to send again all strokes after a clear.
    delete recognizerContextReference.instanceId
    try {
      NetworkWSInterface.send(recognizerContextReference, { type: 'reset' })
    } catch (sendFailedException) {
      // To force failure without breaking the flow
      // FIXME not working at all
      recognizerContextReference.websocketCallback(PromiseHelper.destructurePromise(), recognizerContextReference, model)
    }
  }
  // We do not keep track of the success of clear.
  callback(undefined, modelRef)
}

/**
 * Close and free all resources that will no longer be used by the recognizer.
 * @param {RecognizerContext} recognizerContext
 * @param {Model} model
 */
export function close (recognizerContext, model) {
  const initPromise = PromiseHelper.destructurePromise()
  const recognizerContextRef = recognizerContext
  const recognitionContext = {
    model,
    initPromise,
    error: (err, res) => responseCallback(model, err, res, recognizerContextRef)
  }

  return recognizerContext.initPromise
    .then(() => {
      recognizerContextRef.recognitionContexts[0] = recognitionContext
      return recognizerContextRef
    })
    .then((context) => {
      NetworkWSInterface.close(context, 1000, RecognizerContext.CLOSE_RECOGNIZER_MESSAGE)
      return recognitionContext.model
    })
}
