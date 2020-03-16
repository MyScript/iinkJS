import { recognizerLogger as logger } from '../configuration/LoggerConfig';
import * as InkModel from '../model/InkModel';
import * as RecognizerContext from '../model/RecognizerContext';
import Constants from '../configuration/Constants';
import { handleSuccess } from './RecognizerService';

/**
 * Triggers
 * @typedef {Object} Triggers
 * @property {Array<String>} exportContent Supported triggers for exporting content.
 * @property {Array<String>} [addStrokes] Supported triggers for adding strokes.
 */

/**
 * Recognizer info
 * @typedef {Object} RecognizerInfo
 * @property {Array<String>} types Supported recognition types (TEXT, MATH, SHAPE, MUSIC, ANALYZER).
 * @property {String} protocol Supported protocol (REST, WEBSOCKET).
 * @property {String} apiVersion Supported API version.
 * @property {Triggers} availableTriggers Supported triggers for this recognizer.
 */

/**
 * Recognizer callback
 * @typedef {function} RecognizerCallback
 * @param {Object} [err] Error
 * @param {Model} [model] Result
 * @param {...String} [types] Result types
 */

/**
 * Simple callback
 * @typedef {function} Callback
 * @param {Object} [err] Error
 * @param {Object} [res] Result
 */

/**
 * Recognition service entry point
 * @typedef {Object} Recognizer
 * @property {function(): RecognizerInfo} getInfo Get information about the supported configuration (protocol, type, apiVersion, ...).
 * @property {function(recognizerContext: RecognizerContext, model: Model)} init Initialize recognition.
 * @property {function(recognizerContext: RecognizerContext, model: Model)} clear Clear server context. Currently nothing to do there.
 * @property {function(recognizerContext: RecognizerContext, model: Model)} close Close and free all resources that will no longer be used by the recognizer.
 * @property {function(recognizerContext: RecognizerContext, model: Model)} [undo] Undo Undo the last done action.
 * @property {function(recognizerContext: RecognizerContext, model: Model)} [redo] Redo Redo the previously undone action.
 * @property {function(recognizerContext: RecognizerContext, model: Model, element: Element)} [resize] Resize.
 * @property {function(recognizerContext: RecognizerContext, model: Model, strokes: Array<Stroke>)} [pointerEvents] Pointer Events.
 * @property {function(recognizerContext: RecognizerContext, model: Model)} [addStrokes] Add strokes.
 * @property {function(recognizerContext: RecognizerContext, model: Model)} [export_] Export content.
 * @property {function(recognizerContext: RecognizerContext, model: Model, data: Blob)} [import_] Import content.
 * @property {function(recognizerContext: RecognizerContext, model: Model, conversionState: String)} [convert] Convert.
 * @property {function(recognizerContext: RecognizerContext, model: Model)} [waitForIdle] Wait for idle.
 * @property {function(recognizerContext: RecognizerContext, model: Model, penStyle: PenStyle)} [setPenStyle] Set pen style.
 * @property {function(recognizerContext: RecognizerContext, model: Model, penStyleClasses: String)} [setPenStyleClasses] Set pen style classes.
 * @property {function(recognizerContext: RecognizerContext, model: Model, theme: Theme)} [setTheme] Set theme.
 */

/**
 * Initialize recognition
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 */
export function init(recognizerContext, model) {
  const modelRef = InkModel.resetModelPositions(model);
  logger.debug('Updated model', modelRef);
  const recognizerContextRef = RecognizerContext.updateRecognitionPositions(recognizerContext, modelRef.lastPositions);
  recognizerContextRef.initPromise = Promise.resolve(modelRef);
  return recognizerContextRef.initPromise
    .then((res) => {
      recognizerContextRef.initialized = true;
      logger.debug('Updated recognizer context', recognizerContextRef);
      handleSuccess(recognizerContextRef.editor, res, Constants.EventType.LOADED);
      return res;
    });
}

/**
 * Reset server context. Currently nothing to do there.
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 */
export function reset(recognizerContext, model) {
  const modelRef = InkModel.resetModelPositions(model);
  logger.debug('Updated model', modelRef);
  const recognizerContextRef = RecognizerContext.updateRecognitionPositions(recognizerContext, modelRef.lastPositions);
  delete recognizerContextRef.instanceId;
  logger.debug('Updated recognizer context', recognizerContextRef);
  return Promise.resolve({
    res: modelRef,
  });
}

/**
 * Clear server context. Currently nothing to do there.
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 */
export function clear(recognizerContext, model) {
  const modelRef = InkModel.clearModel(model);
  logger.debug('Updated model', modelRef);
  const recognizerContextRef = RecognizerContext.updateRecognitionPositions(recognizerContext, modelRef.lastPositions);
  delete recognizerContextRef.instanceId;
  logger.debug('Updated recognizer context', recognizerContextRef);
  return Promise.resolve({
    err: undefined,
    res: modelRef,
    events: [Constants.EventType.CHANGED, Constants.EventType.EXPORTED, Constants.EventType.RENDERED]
  });
}

/**
 * Close and free all resources that will no longer be used by the recognizer.
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 */
export function close(recognizerContext, model) {
  const recognizerContextRef = recognizerContext;
  recognizerContextRef.initialized = false;
  delete recognizerContextRef.instanceId;
  handleSuccess(recognizerContext.editor, model);
}
