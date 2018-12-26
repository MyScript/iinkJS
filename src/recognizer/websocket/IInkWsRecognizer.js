import uuid from 'uuid-js';
import { recognizerLogger as logger } from '../../configuration/LoggerConfig';
import Constants from '../../configuration/Constants';
import * as DefaultTheme from '../../configuration/DefaultTheme';
import * as DefaultPenStyle from '../../configuration/DefaultPenStyle';
import * as InkModel from '../../model/InkModel';
import * as RecognizerContext from '../../model/RecognizerContext';
import * as DefaultRecognizer from '../DefaultRecognizer';
import * as WsBuilder from './WsBuilder';
import * as WsRecognizerUtil from './WsRecognizerUtil';

export { close } from './WsRecognizerUtil';

function readBlob(blob) {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = event => resolve(event.target.result);
    fileReader.onerror = () => reject(this);
    fileReader.readAsText(blob);
  });
}


function getDPI(element) {
  // const startDpi = 56;
  // for (let dpi = startDpi; dpi < 2000; dpi++) {
  //   if (window.matchMedia(`(max-resolution: ${dpi}dpi)`).matches === true) {
  //     return dpi;
  //   }
  // }
  // return startDpi;
  return 96;
}

/**
 * Recognizer configuration
 * @type {RecognizerInfo}
 */
export const IinkWsConfiguration = {
  types: [Constants.RecognitionType.MATH, Constants.RecognitionType.TEXT, Constants.RecognitionType.DIAGRAM, Constants.RecognitionType.NEBO],
  protocol: Constants.Protocol.WEBSOCKET,
  availableTriggers: {
    exportContent: [Constants.Trigger.POINTER_UP, Constants.Trigger.DEMAND],
    addStrokes: [Constants.Trigger.POINTER_UP]
  }
};

/**
 * Get the configuration supported by this recognizer
 * @return {RecognizerInfo}
 */
export function getInfo() {
  return IinkWsConfiguration;
}

export function buildNewContentPackageInput(configuration, element) {
  return {
    type: 'newContentPackage',
    applicationKey: configuration.recognitionParams.server.applicationKey,
    xDpi: getDPI(element),
    yDpi: getDPI(element),
    viewSizeHeight: element.clientHeight < configuration.renderingParams.minHeight ? configuration.renderingParams.minHeight : element.clientHeight,
    viewSizeWidth: element.clientWidth < configuration.renderingParams.minWidth ? configuration.renderingParams.minWidth : element.clientWidth
  };
}

export function buildRestoreIInkSessionInput(configuration, element, sessionId) {
  return {
    type: 'restoreIInkSession',
    iinkSessionId: sessionId,
    applicationKey: configuration.recognitionParams.server.applicationKey,
    xDpi: getDPI(element),
    yDpi: getDPI(element),
    viewSizeHeight: element.clientHeight < configuration.renderingParams.minHeight ? configuration.renderingParams.minHeight : element.clientHeight,
    viewSizeWidth: element.clientWidth < configuration.renderingParams.minWidth ? configuration.renderingParams.minWidth : element.clientWidth
  };
}

export function buildNewContentPart(configuration) {
  return {
    type: 'newContentPart',
    contentType: configuration.recognitionParams.type,
    mimeTypes: (configuration.triggers.exportContent !== Constants.Trigger.DEMAND) ?
      configuration.recognitionParams.iink[`${configuration.recognitionParams.type.toLowerCase()}`].mimeTypes : undefined
  };
}

export function buildOpenContentPart(configuration, partId) {
  return {
    type: 'openContentPart',
    id: partId,
    mimeTypes: (configuration.triggers.exportContent !== Constants.Trigger.DEMAND) ?
      configuration.recognitionParams.iink[`${configuration.recognitionParams.type.toLowerCase()}`].mimeTypes : undefined
  };
}

export function buildConfiguration(configuration) {
  return Object.assign({ type: 'configuration' }, configuration.recognitionParams.iink);
}

function buildAddStrokes(recognizerContext, model) {
  const strokes = InkModel.extractPendingStrokes(model, recognizerContext.lastPositions.lastSentPosition + 1);
  if (strokes.length > 0) {
    InkModel.updateModelSentPosition(model);
    return {
      type: 'addStrokes',
      strokes: strokes.map(stroke => Object.assign({}, {
        id: stroke.id,
        pointerType: stroke.pointerType,
        pointerId: stroke.pointerId,
        x: stroke.x,
        y: stroke.y,
        t: stroke.t,
        p: stroke.p
      }))
    };
  }
  return undefined;
}

function buildUndo() {
  return {
    type: 'undo'
  };
}

function buildRedo() {
  return {
    type: 'redo'
  };
}

function buildClear() {
  return {
    type: 'clear'
  };
}

function buildConvert(state) {
  return {
    type: 'convert',
    conversionState: state
  };
}

function buildZoom(value) {
  return {
    type: 'zoom',
    zoom: value
  };
}

function buildResize(element, minHeight = 0, minWidth = 0) {
  return {
    type: 'changeViewSize',
    height: element.clientHeight < minHeight ? minHeight : element.clientHeight,
    width: element.clientWidth < minWidth ? minWidth : element.clientWidth
  };
}

function buildExport(configuration, partId, requestedMimeType) {
  let usedMimeType;
  if (requestedMimeType && Object.keys(requestedMimeType).length !== 0) {
    usedMimeType = requestedMimeType;
  } else {
    usedMimeType = configuration.recognitionParams.iink[`${configuration.recognitionParams.type.toLowerCase()}`].mimeTypes;
  }

  return {
    type: 'export',
    partId,
    mimeTypes: usedMimeType
  };
}

function buildImportFile(id, mimetype) {
  return {
    type: 'importFile',
    importFileId: id,
    mimeType: mimetype
  };
}

function buildImportChunk(id, data, lastChunk) {
  return {
    type: 'fileChunk',
    importFileId: id,
    data,
    lastChunk
  };
}

function buildPointerEvents(events) {
  return Object.assign({ type: 'pointerEvents' }, events);
}

function buildWaitForIdle() {
  return {
    type: 'waitForIdle'
  };
}

function buildGetSupportedImportMimeTypes() {
  return {
    type: 'getSupportedImportMimeTypes'
  };
}

export function buildSetPenStyle(penStyle) {
  return {
    type: 'setPenStyle',
    style: penStyle ? DefaultPenStyle.toCSS(penStyle) : ''
  };
}

export function buildSetPenStyleClasses(penStyleClasses) {
  return {
    type: 'setPenStyleClasses',
    styleClasses: penStyleClasses
  };
}

export function buildSetTheme(theme) {
  return {
    type: 'setTheme',
    theme: DefaultTheme.toCSS(theme)
  };
}

const responseCallback = (model, err, res, callback) => {
  const modelReference = InkModel.updateModelReceivedPosition(model);
  if (res) {
    if (res.updates !== undefined) {
      if (modelReference.recognizedSymbols) {
        modelReference.recognizedSymbols.push(res);
      } else {
        modelReference.recognizedSymbols = [res];
      }
      return callback(err, modelReference, Constants.EventType.RENDERED);
    }
    if (res.exports !== undefined) {
      modelReference.rawResults.exports = res;
      modelReference.exports = res.exports;
      return callback(err, modelReference, Constants.EventType.EXPORTED);
    }

    if ((res.canUndo !== undefined) || (res.canRedo !== undefined)) {
      return callback(err, modelReference, Constants.EventType.CHANGED);
    }

    if (res.type === 'supportedImportMimeTypes') {
      return callback(err, modelReference, Constants.EventType.SUPPORTED_IMPORT_MIMETYPES);
    }

    if (res.type === 'partChanged') {
      return callback(err, modelReference, Constants.EventType.LOADED);
    }

    if (res.type === 'idle') {
      return callback(err, modelReference, Constants.EventType.IDLE);
    }

    if (res.type === 'close') {
      return callback(err, modelReference, Constants.EventType.CHANGED);
    }
  }
  return callback(err, modelReference);
};

/**
 * Initialize recognition
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function init(recognizerContext, model, callback) {
  const recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, {
    model: InkModel.updateModelSentPosition(model, model.lastPositions.lastReceivedPosition),
    response: (err, res) => responseCallback(model, err, res, callback)
  });
  WsRecognizerUtil.init('/api/v4.0/iink/document', recognizerContextRef, WsBuilder.buildWebSocketCallback, init)
    .catch((err) => {
      if (RecognizerContext.shouldAttemptImmediateReconnect(recognizerContext) && recognizerContext.reconnect) {
        logger.info('Attempting a reconnect', recognizerContext.currentReconnectionCount);
        recognizerContext.reconnect(recognizerContext, model, callback);
      } else {
        logger.error('Unable to reconnect', err);
        responseCallback(model, err, undefined, callback);
      }
    });
}

/**
 *
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 * @param {Function} buildFunction build the websocket message
 * @param {...Object} params spread parameters, will be passed to buildFunction
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
function _prepareMessage(recognizerContext, model, callback, buildFunction, ...params) {
  logger.info(`Prepare message for ${buildFunction.name}`);
  const recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, {
    model,
    response: (err, res) => responseCallback(model, err, res, callback)
  });
  WsRecognizerUtil.sendMessage(recognizerContextRef, buildFunction, ...params)
    .catch((err) => {
      logger.error(err);
      WsRecognizerUtil.retry(_prepareMessage, recognizerContext, model, callback, buildFunction, ...params);
    });
}

/**
 * Create a new content part
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function newContentPart(recognizerContext, model, callback) {
  _prepareMessage(recognizerContext, model, callback, buildNewContentPart, recognizerContext.editor.configuration);
}

/**
 * Open the recognizer context content part
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function openContentPart(recognizerContext, model, callback) {
  const params = [recognizerContext.editor.configuration, recognizerContext.currentPartId];
  _prepareMessage(recognizerContext, model, callback, buildOpenContentPart, params);
}

/**
 * Send the recognizer configuration
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function sendConfiguration(recognizerContext, model, callback) {
  _prepareMessage(recognizerContext, model, callback, buildConfiguration, recognizerContext.editor.configuration);
}

/**
 * Pointer Events
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {PointerEvents} events to be imported
 * @param {RecognizerCallback} callback
 */
export function pointerEvents(recognizerContext, model, events, callback) {
  _prepareMessage(recognizerContext, model, callback, buildPointerEvents, events);
}

/**
 * Add strokes to the model
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function addStrokes(recognizerContext, model, callback) {
  const params = [recognizerContext, model];
  _prepareMessage(recognizerContext, model, callback, buildAddStrokes, ...params);
}

/**
 * Undo last action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function undo(recognizerContext, model, callback) {
  _prepareMessage(recognizerContext, model, callback, buildUndo);
}

/**
 * Redo last action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function redo(recognizerContext, model, callback) {
  _prepareMessage(recognizerContext, model, callback, buildRedo);
}

/**
 * Clear action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function clear(recognizerContext, model, callback) {
  const recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, {
    model,
    response: (err, res) => {
      DefaultRecognizer.clear(recognizerContext, model, (noerr, newModel, ...attrs) => {
        logger.debug('The model after clear is :', newModel);
        responseCallback(newModel, err, res, callback);
      });
    }
  });
  WsRecognizerUtil.sendMessage(recognizerContextRef, buildClear)
    .catch(exception => WsRecognizerUtil.retry(clear, recognizerContext, model, callback));
}

/**
 * Convert action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 * @param {String} conversionState Conversion State, by default DigitalEdit
 */
export function convert(recognizerContext, model, callback, conversionState) {
  _prepareMessage(recognizerContext, model, callback, buildConvert, conversionState);
}

/**
 * Export action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 * @param {Array[String]} requestedMimeTypes
 */
// eslint-disable-next-line no-underscore-dangle
export function export_(recognizerContext, model, callback, requestedMimeTypes) {
  const params = [recognizerContext.editor.configuration, recognizerContext.currentPartId, requestedMimeTypes];
  _prepareMessage(recognizerContext, model, callback, buildExport, params);
}

/**
 * Import action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {Blob} data Import data
 * @param {RecognizerCallback} callback
 */
// eslint-disable-next-line no-underscore-dangle
export function import_(recognizerContext, model, data, callback) {
  const recognitionContext = {
    model,
    response: (err, res) => responseCallback(model, err, res, callback),
    importFileId: uuid.create(4).toString()
  };
  const recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, recognitionContext);

  const chunkSize = recognizerContext.editor.configuration.recognitionParams.server.websocket.fileChunkSize;

  for (let i = 0; i < data.size; i += chunkSize) {
    if (i === 0) {
      _prepareMessage(recognizerContextRef, model, callback, buildImportFile, recognitionContext.importFileId, data.type);
    }
    const blobPart = data.slice(i, chunkSize, data.type);
    readBlob(blobPart).then((res) => {
      const params = [recognitionContext.importFileId, res, i + chunkSize > data.size];
      _prepareMessage(recognizerContextRef, model, callback, buildImportChunk, ...params);
    });
  }
}

/**
 * Ask for the supported mimetypes
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function getSupportedImportMimeTypes(recognizerContext, model, callback) {
  _prepareMessage(recognizerContext, model, callback, buildGetSupportedImportMimeTypes);
}

/**
 * WaitForIdle action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function waitForIdle(recognizerContext, model, callback) {
  _prepareMessage(recognizerContext, model, callback, buildWaitForIdle);
}

/**
 * Resize
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 * @param {Element} element Current element
 */
export function resize(recognizerContext, model, callback, element) {
  const params = [element, recognizerContext.editor.configuration.renderingParams.minHeight, recognizerContext.editor.configuration.renderingParams.minWidth];
  _prepareMessage(recognizerContext, model, callback, buildResize, params);
}

/**
 * Zoom action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {Number} value=10 Zoom value
 * @param {RecognizerCallback} callback
 */
export function zoom(recognizerContext, model, value = 10, callback) {
  _prepareMessage(recognizerContext, model, callback, buildZoom, value);
}

/**
 * SetPenStyle action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {PenStyle} penStyle Current penStyle
 * @param {RecognizerCallback} callback
 */
export function setPenStyle(recognizerContext, model, penStyle, callback) {
  _prepareMessage(recognizerContext, model, callback, buildSetPenStyle, penStyle);
}

/**
 * setPenStyleClasses action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {String} penStyleClasses Current penStyleClasses
 * @param {RecognizerCallback} callback
 */
export function setPenStyleClasses(recognizerContext, model, penStyleClasses, callback) {
  _prepareMessage(recognizerContext, model, callback, buildSetPenStyleClasses, penStyleClasses);
}

/**
 * SetTheme action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {Theme} theme Current theme
 * @param {RecognizerCallback} callback
 */
export function setTheme(recognizerContext, model, theme, callback) {
  _prepareMessage(recognizerContext, model, callback, buildSetTheme, theme);
}
