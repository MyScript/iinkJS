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
import * as PromiseHelper from '../../util/PromiseHelper';
import { recognizerCallback } from '../RecognizerService';

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

const responseCallback = (model, err, res, recognizerContext) => {
  const modelReference = InkModel.updateModelReceivedPosition(model);
  if (res) {
    let event = '';
    if (res.updates !== undefined) {
      if (modelReference.recognizedSymbols) {
        modelReference.recognizedSymbols.push(res);
      } else {
        modelReference.recognizedSymbols = [res];
      }
      event = Constants.EventType.RENDERED;
    }
    if (res.exports !== undefined) {
      modelReference.rawResults.exports = res;
      modelReference.exports = res.exports;
      event = Constants.EventType.EXPORTED;
    }

    if ((res.canUndo !== undefined) || (res.canRedo !== undefined)) {
      event = Constants.EventType.CHANGED;
    }

    if (res.type === 'supportedImportMimeTypes') {
      event = Constants.EventType.SUPPORTED_IMPORT_MIMETYPES;
    }

    if (res.type === 'partChanged') {
      event = Constants.EventType.LOADED;
    }

    if (res.type === 'idle') {
      event = Constants.EventType.IDLE;
    }

    if (res.type === 'close') {
      event = Constants.EventType.CHANGED;
    }
    return recognizerCallback(recognizerContext.editor, err, model, event);
  }
  return recognizerCallback(recognizerContext.editor, err, modelReference);
};

/**
 * Initialize recognition
 * The init process is in multiple part :
 * - partChange
 * - contentChange
 * - initPromise: resolved only if partChange & contentChange resolved except for MATH recognition
 *
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 */
export async function init(recognizerContext, model) {
  const contentChange = PromiseHelper.destructurePromise();
  const partChange = PromiseHelper.destructurePromise();
  const initPromise = PromiseHelper.destructurePromise();

  let recognizerContextRef;
  let contentChanged = null;

  if (recognizerContext.editor.innerConfiguration.recognitionParams.type === 'MATH') {
    recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, {
      model: InkModel.updateModelSentPosition(model, model.lastPositions.lastReceivedPosition),
      partChange,
      initPromise,
      patch: (err, res) => responseCallback(model, err, res, recognizerContextRef)
    });
  } else {
    recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, {
      model: InkModel.updateModelSentPosition(model, model.lastPositions.lastReceivedPosition),
      contentChange,
      partChange,
      initPromise,
      patch: (err, res) => responseCallback(model, err, res, recognizerContextRef)
    });
    contentChanged = recognizerContextRef.recognitionContexts[0].contentChange.promise;
  }

  const partChanged = recognizerContextRef.recognitionContexts[0].partChange.promise;
  WsRecognizerUtil.init('/api/v4.0/iink/document', recognizerContextRef, WsBuilder.buildWebSocketCallback, init)
    .catch((err) => {
      if (RecognizerContext.shouldAttemptImmediateReconnect(recognizerContext) && recognizerContext.reconnect) {
        logger.info('Attempting a reconnect', recognizerContext.currentReconnectionCount);
        recognizerContext.reconnect(recognizerContext, model);
      } else {
        logger.error('Unable to reconnect', err);
        responseCallback(model, err, undefined, recognizerContext);
      }
    });

  return partChanged
    .then(([err, res]) => {
      responseCallback(model, err, res, recognizerContext);
      recognizerContextRef.recognitionContexts[0].initPromise.resolve();
      if (contentChanged !== null) {
        contentChanged
          .then(([error, result]) => {
            responseCallback(model, error, result, recognizerContext);
            return recognizerContextRef.recognitionContexts[0].initPromise;
          });
      }
      recognizerContextRef.recognitionContexts[0].initPromise.resolve();
      return recognizerContextRef.recognitionContexts[0].initPromise;
    });
}

/**
 *
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {Function} buildFunction build the websocket message
 * @param {...Object} params spread parameters, will be passed to buildFunction
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
async function _prepareMessage(recognizerContext, model, buildFunction, ...params) {
  logger.info(`-- Prepare message for ${buildFunction.name} --`);
  const response = PromiseHelper.destructurePromise();
  const contentChange = PromiseHelper.destructurePromise();
  const recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, {
    model,
    response,
    contentChange,
    patch: (err, res) => responseCallback(model, err, res, recognizerContextRef)
  });
  WsRecognizerUtil.sendMessage(recognizerContextRef, buildFunction, ...params)
    .catch((err) => {
      logger.error(err);
      WsRecognizerUtil.retry(_prepareMessage, recognizerContext, model, buildFunction, ...params);
    });

  const resp = recognizerContextRef.recognitionContexts[0].response.promise;
  const contentChanged = recognizerContextRef.recognitionContexts[0].contentChange.promise;

  resp
    .then(([error, result]) => {
      responseCallback(model, error, result, recognizerContextRef);
    });

  return contentChanged
    .then(([err, res]) => {
      responseCallback(model, err, res, recognizerContextRef);
      return res;
    });
}

/**
 * Create a new content part
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function newContentPart(recognizerContext, model) {
  return _prepareMessage(recognizerContext, model, buildNewContentPart, recognizerContext.editor.configuration);
}

/**
 * Open the recognizer context content part
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function openContentPart(recognizerContext, model) {
  const params = [recognizerContext.editor.configuration, recognizerContext.currentPartId];
  return _prepareMessage(recognizerContext, model, buildOpenContentPart, params);
}

/**
 * Send the recognizer configuration
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function sendConfiguration(recognizerContext, model) {
  return _prepareMessage(recognizerContext, model, buildConfiguration, recognizerContext.editor.configuration);
}

/**
 * Pointer Events
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {PointerEvents} events to be imported
 */
export async function pointerEvents(recognizerContext, model, events) {
  return _prepareMessage(recognizerContext, model, buildPointerEvents, events);
}

/**
 * Add strokes to the model
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function addStrokes(recognizerContext, model) {
  const params = [recognizerContext, model];
  return _prepareMessage(recognizerContext, model, buildAddStrokes, ...params);
}

/**
 * Undo last action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function undo(recognizerContext, model) {
  return _prepareMessage(recognizerContext, model, buildUndo);
}

/**
 * Redo last action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function redo(recognizerContext, model) {
  return _prepareMessage(recognizerContext, model, buildRedo);
}

/**
 * Clear action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function clear(recognizerContext, model) {
  const response = PromiseHelper.destructurePromise();
  const contentChange = PromiseHelper.destructurePromise();
  const recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, {
    model,
    response,
    contentChange,
    patch: async (error, result) => {
      const { err, res, events } = await DefaultRecognizer.clear(recognizerContext, model);
      responseCallback(res, err, result, recognizerContextRef);
    }
  });
  WsRecognizerUtil.sendMessage(recognizerContextRef, buildClear)
    .catch(exception => WsRecognizerUtil.retry(clear, recognizerContext, model));

  const resp = recognizerContextRef.recognitionContexts[0].response.promise;
  const contentChanged = recognizerContextRef.recognitionContexts[0].contentChange.promise;

  resp
    .then(([error, result]) => {
      responseCallback(model, error, result, recognizerContextRef);
    });

  return contentChanged
    .then((values) => {
      console.log(values);
      return {
        err: undefined,
        res: recognizerContextRef.recognitionContexts[0].model,
        events: []
      };
    });
}

/**
 * Convert action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {String} conversionState Conversion State, by default DigitalEdit
 */
export async function convert(recognizerContext, model, conversionState) {
  return _prepareMessage(recognizerContext, model, buildConvert, conversionState);
}

/**
 * Export action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 * @param {Array[String]} requestedMimeTypes
 */
// eslint-disable-next-line no-underscore-dangle
export async function export_(recognizerContext, model, requestedMimeTypes) {
  const params = [recognizerContext.editor.configuration, recognizerContext.currentPartId, requestedMimeTypes];
  return _prepareMessage(recognizerContext, model, buildExport, ...params);
}

/**
 * Import action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {Blob} data Import data
 */
// eslint-disable-next-line no-underscore-dangle
export function import_(recognizerContext, model, data) {
  const recognitionContext = {
    model,
    response: (err, res) => responseCallback(model, err, res, recognizerContext),
    importFileId: uuid.create(4).toString()
  };
  const recognizerContextRef = RecognizerContext.setRecognitionContext(recognizerContext, recognitionContext);

  const chunkSize = recognizerContext.editor.configuration.recognitionParams.server.websocket.fileChunkSize;

  for (let i = 0; i < data.size; i += chunkSize) {
    if (i === 0) {
      _prepareMessage(recognizerContextRef, model, buildImportFile, recognitionContext.importFileId, data.type);
    }
    const blobPart = data.slice(i, chunkSize, data.type);
    readBlob(blobPart).then((res) => {
      const params = [recognitionContext.importFileId, res, i + chunkSize > data.size];
      _prepareMessage(recognizerContextRef, model, buildImportChunk, ...params);
    });
  }
}

/**
 * Ask for the supported mimetypes
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function getSupportedImportMimeTypes(recognizerContext, model) {
  return _prepareMessage(recognizerContext, model, buildGetSupportedImportMimeTypes);
}

/**
 * WaitForIdle action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 */
export async function waitForIdle(recognizerContext, model) {
  return _prepareMessage(recognizerContext, model, buildWaitForIdle);
}

/**
 * Resize
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {Element} element Current element
 */
export async function resize(recognizerContext, model, element) {
  const params = [element, recognizerContext.editor.configuration.renderingParams.minHeight, recognizerContext.editor.configuration.renderingParams.minWidth];
  return _prepareMessage(recognizerContext, model, buildResize, ...params);
}

/**
 * Zoom action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {Number} value=10 Zoom value
 */
export async function zoom(recognizerContext, model, value = 10) {
  return _prepareMessage(recognizerContext, model, buildZoom, value);
}

/**
 * SetPenStyle action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {PenStyle} penStyle Current penStyle
 */
export async function setPenStyle(recognizerContext, model, penStyle) {
  return _prepareMessage(recognizerContext, model, buildSetPenStyle, penStyle);
}

/**
 * setPenStyleClasses action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {String} penStyleClasses Current penStyleClasses
 */
export async function setPenStyleClasses(recognizerContext, model, penStyleClasses) {
  return _prepareMessage(recognizerContext, model, buildSetPenStyleClasses, penStyleClasses);
}

/**
 * SetTheme action
 * @param {RecognizerContext} recognizerContext Current recognition context
 * @param {Model} model Current model
 * @param {Theme} theme Current theme
 */
export async function setTheme(recognizerContext, model, theme) {
  return _prepareMessage(recognizerContext, model, buildSetTheme, theme);
}
