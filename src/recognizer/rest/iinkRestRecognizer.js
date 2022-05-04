/* eslint-disable no-underscore-dangle */
import * as NetworkInterface from './networkInterface'
import * as RecognizerContext from '../../model/RecognizerContext'
import { recognizerLogger as logger } from '../../configuration/LoggerConfig'
import Constants from '../../configuration/Constants'
import * as InkModel from '../../model/InkModel'
import * as StrokeComponent from '../../model/StrokeComponent'
import * as DefaultTheme from '../../configuration/DefaultTheme'
import * as DefaultPenStyle from '../../configuration/DefaultPenStyle'
import { handleError, handleSuccess } from '../RecognizerService'

export { init, close, clear, reset } from '../DefaultRecognizer'

/**
 * Recognizer configuration
 * @type {RecognizerInfo}
 */
export const iinkRestConfiguration = {
  types: [Constants.RecognitionType.TEXT, Constants.RecognitionType.DIAGRAM, Constants.RecognitionType.MATH, Constants.RecognitionType.RAWCONTENT],
  protocol: Constants.Protocol.REST,
  availableTriggers: {
    exportContent: [
      Constants.Trigger.QUIET_PERIOD,
      Constants.Trigger.DEMAND
    ]
  }
}

/**
 * Get the configuration supported by this recognizer
 * @return {RecognizerInfo}
 */
export function getInfo () {
  return iinkRestConfiguration
}

/**
 * @param {String} suffixUrl
 * @param {RecognizerContext} recognizerContext
 * @param {Model} model
 * @param {function} buildMessage
 * @param {String} conversionState
 * @param {String} mimeType
 * @return {Promise.<Model>} Promise that return an updated model as a result
 */
export function postMessage (suffixUrl, recognizerContext, model, buildMessage, conversionState = '', mimeType) {
  const configuration = recognizerContext.editor.configuration
  return NetworkInterface.post(recognizerContext, `${configuration.recognitionParams.server.scheme}://${configuration.recognitionParams.server.host}${suffixUrl}`, buildMessage(recognizerContext, model, conversionState), mimeType)
    .then((response) => {
      logger.debug('iinkRestRecognizer success', response)
      const positions = recognizerContext.lastPositions
      positions.lastReceivedPosition = positions.lastSentPosition
      const recognizerContextReference = RecognizerContext.updateRecognitionPositions(recognizerContext, positions)
      if (response.instanceId) {
        recognizerContextReference.instanceId = response.instanceId
      }
      return response
    })
}

function buildTextConf (configuration) {
  return {
    text: configuration.recognitionParams.iink.text,
    lang: configuration.recognitionParams.iink.lang,
    export: configuration.recognitionParams.iink.export
  }
}

function buildMathConf (configuration) {
  return {
    math: configuration.recognitionParams.iink.math,
    lang: configuration.recognitionParams.iink.lang,
    export: configuration.recognitionParams.iink.export
  }
}

function buildDiagramConf (configuration) {
  return {
    diagram: configuration.recognitionParams.iink.diagram,
    lang: configuration.recognitionParams.iink.lang,
    export: configuration.recognitionParams.iink.export
  }
}

function buildRawContentConf (configuration) {
  return {
    'raw-content': {
      recognition: configuration.recognitionParams.iink['raw-content'].recognition
    },
    lang: configuration.recognitionParams.iink.lang,
    export: configuration.recognitionParams.iink.export
  }
}

function buildData (recognizerContext, model, conversionState) {
  const configuration = recognizerContext.editor.configuration
  let dataConf

  if (configuration.recognitionParams.type === 'TEXT') {
    dataConf = buildTextConf(configuration)
  } else if (configuration.recognitionParams.type === 'MATH') {
    dataConf = buildMathConf(configuration)
  } else if (configuration.recognitionParams.type === 'DIAGRAM') {
    dataConf = buildDiagramConf(configuration)
  } else if (configuration.recognitionParams.type === 'Raw Content') {
    dataConf = buildRawContentConf(configuration)
  }

  const newStrokes = []
  model.strokeGroups.forEach((group) => {
    const newPenStyle = JSON.stringify(group.penStyle) === '{}' ? null : DefaultPenStyle.toCSS(group.penStyle)
    const newGroup = {
      penStyle: newPenStyle,
      strokes: group.strokes.map(stroke => StrokeComponent.toJSON(stroke))
    }
    newStrokes.push(newGroup)
  })

  const contentType = configuration.recognitionParams.type === 'Raw Content' ? 'Raw Content' : configuration.recognitionParams.type.charAt(0)
    .toUpperCase() + configuration.recognitionParams.type.slice(1)
    .toLowerCase()

  const data = {
    configuration: dataConf,
    xDPI: 96,
    yDPI: 96,
    contentType,
    theme: DefaultTheme.toCSS(recognizerContext.editor.theme),
    strokeGroups: newStrokes
  }

  if (recognizerContext.editor.domElement) {
    data.height = recognizerContext.editor.domElement.clientHeight
    data.width = recognizerContext.editor.domElement.clientWidth
  }

  if (conversionState) {
    data.conversionState = 'DIGITAL_EDIT'
  }

  InkModel.updateModelSentPosition(model)
  return data
}

function extractExports (configuration, mimeType, res) {
  const exports = {}
  exports[mimeType] = res
  return exports
}

function resultCallback (recognizerContext, model, configuration, res, mimeType) {
  logger.debug('iinkRestRecognizer result callback', model)
  const modelReference = InkModel.updateModelReceivedPosition(model)
  modelReference.rawResults.exports = res
  if (modelReference.exports) {
    Object.assign(modelReference.exports, extractExports(configuration, mimeType, res))
  } else {
    modelReference.exports = extractExports(configuration, mimeType, res)
  }
  logger.debug('iinkRestRecognizer model updated', modelReference)

  if (recognizerContext.editor.undoRedoManager) {
    handleSuccess(recognizerContext.editor, modelReference, Constants.EventType.EXPORTED, Constants.EventType.IDLE)
  }
}

function callPostMessage (recognizerContext, model, mimeType) {
  const configuration = recognizerContext.editor.configuration
  return postMessage('/api/v4.0/iink/batch', recognizerContext, model, buildData, configuration.restConversionState, mimeType)
    .then((res) => {
      resultCallback(recognizerContext, model, configuration, res, mimeType)
      return model
    })
    .catch((err) => {
      handleError(recognizerContext.editor, err)
      return err
    })
}

/**
 * Export content
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 * @param {Array} requestedMimeTypes
 */
export function export_ (recognizerContext, model, requestedMimeTypes) {
  const configuration = recognizerContext.editor.configuration
  if (requestedMimeTypes) {
    return Promise.all(requestedMimeTypes.map(mimeType => callPostMessage(recognizerContext, model, mimeType)))
  } else if (configuration.recognitionParams.type === 'TEXT') {
    return Promise.all(configuration.recognitionParams.iink.text.mimeTypes.map(mimeType => callPostMessage(recognizerContext, model, mimeType)))
  } else if (configuration.recognitionParams.type === 'DIAGRAM') {
    return Promise.all(configuration.recognitionParams.iink.diagram.mimeTypes.map(mimeType => callPostMessage(recognizerContext, model, mimeType)))
  } else if (configuration.recognitionParams.type === 'MATH') {
    return Promise.all(configuration.recognitionParams.iink.math.mimeTypes.map(mimeType => callPostMessage(recognizerContext, model, mimeType)))
  } else if (configuration.recognitionParams.type === 'Raw Content') {
    return Promise.all(configuration.recognitionParams.iink['raw-content'].mimeTypes.map(mimeType => callPostMessage(recognizerContext, model, mimeType)))
  }
  return Promise.reject(new Error('Export failed'))
}

/**
 * Ask for conversion using DIGITAL_EDIT
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 */
export function convert (recognizerContext, model) {
  const configuration = recognizerContext.editor.configuration
  postMessage('/api/v4.0/iink/batch', recognizerContext, model, buildData, 'DIGITAL_EDIT')
    .then(res => resultCallback(model, configuration, res))
    .catch(err => handleError(recognizerContext.editor, err))
}

/**
 * Resize
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export function resize (recognizerContext, model) {
  if (model.strokeGroups.length) {
    export_(recognizerContext, model)
  }
}
