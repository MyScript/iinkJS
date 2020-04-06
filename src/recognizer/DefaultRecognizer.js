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
 * @property {function} getInfo Get information about the supported configuration (protocol, type, apiVersion, ...).
 * @property {function} init Initialize recognition.
 * @property {function} clear Clear server context. Currently nothing to do there.
 * @property {function} close Close and free all resources that will no longer be used by the recognizer.
 * @property {function} [undo] Undo Undo the last done action.
 * @property {function} [redo] Redo Redo the previously undone action.
 * @property {function} [resize] Resize.
 * @property {function} [pointerEvents] Pointer Events.
 * @property {function} [addStrokes] Add strokes.
 * @property {function} [export_] Export content.
 * @property {function} [import_] Import content.
 * @property {function} [convert] Convert.
 * @property {function} [waitForIdle] Wait for idle.
 * @property {function} [setPenStyle] Set pen style.
 * @property {function} [setPenStyleClasses] Set pen style classes.
 * @property {function} [setTheme] Set theme.
 */

/**
 * Initialize recognition
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 * @return {Promise}
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
 * @return {Promise}
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
 * @return {Promise}
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
 * @return {Promise}
 */
export function close(recognizerContext, model) {
  const recognizerContextRef = recognizerContext;
  recognizerContextRef.initialized = false;
  delete recognizerContextRef.instanceId;
  return Promise.resolve(model);
}
