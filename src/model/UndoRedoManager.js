import * as InkModel from '../model/InkModel';
import * as UndoRedoContext from '../model/UndoRedoContext';
import { modelLogger as logger } from '../configuration/LoggerConfig';
import Constants from '../configuration/Constants';

/**
 * Undo/redo manager
 * @typedef {Object} UndoRedoManager
 * @property {function(undoRedoContext: UndoRedoContext, model: Model, callback: RecognizerCallback)} updateModel Push the current model into the undo/redo context.
 * @property {function(undoRedoContext: UndoRedoContext, model: Model, callback: RecognizerCallback)} undo Undo.
 * @property {function(undoRedoContext: UndoRedoContext, model: Model, callback: RecognizerCallback)} redo Redo.
 * @property {function(undoRedoContext: UndoRedoContext, model: Model, callback: RecognizerCallback)} clear Clear.
 */

/**
 * Get current model in stack
 * @param {UndoRedoContext} undoRedoContext Current undo/redo context
 * @param {Boolean} [clone=true] Whether or not to clone the model
 * @param {...String} types
 */
export function getModel(undoRedoContext, clone = true, ...types) {
  const model = undoRedoContext.stack[undoRedoContext.currentPosition];
  const val = {
    res: clone ? InkModel.cloneModel(model) : model,
    types
  };
  return Promise.resolve(val);
}

/**
 * Mutate the undoRedo stack by adding a new model to it.
 * @param {UndoRedoContext} undoRedoContext Current undo/redo context.
 * @param {Model} model Current model.
 */
export function updateModel(undoRedoContext, model) {
  // Used to update the model with the recognition result if relevant
  const modelIndex = undoRedoContext.stack.findIndex(item => (item.modificationTime === model.modificationTime) && (item.rawStrokes.length === model.rawStrokes.length));

  const modelReference = model;
  modelReference.modificationTime = new Date().getTime();

  const types = [];
  if (modelIndex > -1) {
    undoRedoContext.stack.splice(modelIndex, 1, InkModel.cloneModel(modelReference));
    logger.debug('model updated', modelReference);
  } else {
    const undoRedoContextReference = undoRedoContext;
    undoRedoContextReference.currentPosition += 1;
    undoRedoContextReference.stack = undoRedoContextReference.stack.slice(0, undoRedoContextReference.currentPosition);
    undoRedoContextReference.stack.push(InkModel.cloneModel(modelReference));
    if (undoRedoContextReference.stack.length > undoRedoContextReference.maxSize) {
      undoRedoContextReference.stack.shift();
      undoRedoContextReference.currentPosition--;
    }
    logger.debug('model pushed', modelReference);
    types.push(Constants.EventType.CHANGED);
  }
  UndoRedoContext.updateUndoRedoState(undoRedoContext);
  logger.debug('undo/redo stack updated', undoRedoContext);
  return getModel(undoRedoContext, false, ...types);
}

/**
 * Undo
 * @param {UndoRedoContext} undoRedoContext Current undo/redo context.
 * @param {Model} model Current model.
 */
export function undo(undoRedoContext, model) {
  const undoRedoContextReference = undoRedoContext;
  if (undoRedoContextReference.currentPosition > 0) {
    undoRedoContextReference.currentPosition -= 1;
    UndoRedoContext.updateUndoRedoState(undoRedoContext);
    logger.debug('undo index', undoRedoContextReference.currentPosition);
  }
  return getModel(undoRedoContext, true, Constants.EventType.CHANGED, Constants.EventType.EXPORTED);
}

/**
 * Redo
 * @param {UndoRedoContext} undoRedoContext Current undo/redo context.
 * @param {Model} model Current model.
 */
export function redo(undoRedoContext, model) {
  const undoRedoContextReference = undoRedoContext;
  if (undoRedoContextReference.currentPosition < undoRedoContextReference.stack.length - 1) {
    undoRedoContextReference.currentPosition += 1;
    UndoRedoContext.updateUndoRedoState(undoRedoContext);
    logger.debug('redo index', undoRedoContextReference.currentPosition);
  }
  return getModel(undoRedoContext, true, Constants.EventType.CHANGED, Constants.EventType.EXPORTED);
}
