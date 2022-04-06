import Constants from '../configuration/Constants'
import { recognizerLogger as logger } from '../configuration/LoggerConfig'
import * as InkModel from '../model/InkModel'
import * as SmartGuide from '../smartguide/SmartGuide'
import * as RecognizerContext from '../model/RecognizerContext'
import { launchExport } from '../Editor'

/**
 * Emit events
 * @param {Editor} editor
 * @param {Object} data
 * @param {...String} types
 * @return {Model}
 */
export function emitEvents (editor, data, ...types) {
  const editorRef = editor
  types.forEach((type) => {
    switch (type) {
      case Constants.EventType.RENDERED:
        break // Internal use only
      case Constants.EventType.UNDO:
      case Constants.EventType.REDO:
      case Constants.EventType.CLEAR:
      case Constants.EventType.CONVERT:
      case Constants.EventType.EXPORT:
        editor.emit.call(editor.domElement, type)
        break
      case Constants.EventType.LOADED:
      case Constants.EventType.CHANGED:
        editor.emit.call(editor.domElement, type, {
          initialized: editor.initialized,
          canUndo: editor.canUndo,
          canRedo: editor.canRedo,
          canClear: editor.canClear,
          isEmpty: editor.isEmpty,
          possibleUndoCount: editor.possibleUndoCount,
          undoStackIndex: editor.undoStackIndex,
          canConvert: editor.canConvert,
          canExport: editor.canExport
        })
        break
      case Constants.EventType.EXPORTED:
        window.clearTimeout(editorRef.notifyTimer)
        editorRef.notifyTimer = window.setTimeout(() => {
          editor.emit.call(editor.domElement, type, {
            exports: editor.exports
          })
        }, editorRef.configuration.processDelay)
        break
      case Constants.EventType.SUPPORTED_IMPORT_MIMETYPES:
        editor.emit.call(editor.domElement, type, {
          mimeTypes: editor.supportedImportMimeTypes
        })
        break
      case Constants.EventType.ERROR:
        editor.emit.call(editor.domElement, type, data)
        break
      case Constants.EventType.IDLE:
        editor.emit.call(editor.domElement, type, {
          idle: editor.idle
        })
        break
      default:
        logger.debug(`No valid trigger configured for ${type}`)
        break
    }
  })
}

/**
 * Manage recognized model
 * @param {Editor} editor
 * @param {Model} model
 * @param {...String} types
 */
export function manageRecognizedModel (editor, model, ...types) {
  const editorRef = editor
  const modelRef = model
  logger.debug(`model changed callback on ${types} event(s)`, model)
  if (modelRef.creationTime === editor.model.creationTime) {
    // Merge recognized model if relevant and return current editor model
    if ((modelRef.rawStrokes.length === editor.model.rawStrokes.length) &&
      (modelRef.lastPositions.lastSentPosition >= editor.model.lastPositions.lastReceivedPosition)) {
      editorRef.model = InkModel.mergeModels(editorRef.model, modelRef)
      if (InkModel.needRedraw(editorRef.model) || types.includes(Constants.EventType.RENDERED)) {
        editor.renderer.drawModel(editor.rendererContext, editorRef.model, editor.stroker)
      }
    } else {
      editorRef.model = modelRef
      editor.renderer.drawModel(editor.rendererContext, editorRef.model, editor.stroker)
    }
    emitEvents(editor, undefined, ...types)
  }

  if (editor.configuration.recognitionParams.type === 'TEXT' &&
    editor.configuration.recognitionParams.protocol !== 'REST' &&
    editor.configuration.recognitionParams.iink.text.mimeTypes.includes(Constants.Exports.JIIX) &&
    editor.configuration.recognitionParams.iink.text.smartGuide) {
    // eslint-disable-next-line no-use-before-define
    editorRef.smartGuide = SmartGuide.launchSmartGuide(editor.smartGuide, modelRef.exports)
  }

  if ((InkModel.extractPendingStrokes(model).length > 0) &&
    (!editor.recognizer.addStrokes) && // FIXME: Ugly hack to avoid double export (addStrokes + export)
    (editor.configuration.triggers.exportContent !== Constants.Trigger.DEMAND)) {
    launchExport(editor, model)
  }
}

/**
 * Method called when server respond with an error
 * Use in catch on Promises
 * @param {Editor} editor
 * @param {Object} err
 * @param {...String} events
 */
export function handleError (editor, err, ...events) {
  const editorRef = editor
  if (err.type !== 'close') {
    // Handle any error from all above steps
    logger.error('Error while firing the recognition', err)
  }
  let errorCode = err.code
  if (err.type === 'message' && err.data.code) {
    errorCode = err.data.code
  }
  editor.recognizerContext.error = err
  switch (errorCode) {
    case 'no.activity':
      editorRef.error.innerText = Constants.Error.NO_ACTIVITY
      break
    case 'api.invalid.format':
      editorRef.error.innerText = err.message
      break
    case 'access.not.granted':
      editorRef.error.innerText = Constants.Error.WRONG_CREDENTIALS
      break
    case 'session.too.old':
      editorRef.error.innerText = Constants.Error.TOO_OLD
      break
    case 1000:
    case 1006:
      if (editorRef.error.style.display === 'none') {
        editorRef.error.innerText = Constants.Error.NOT_REACHABLE
      }
      break
    default:
      editorRef.error.innerText = err.message || Constants.Error.CANT_ESTABLISH
      break
  }

  if (
    (editorRef.error.innerText === Constants.Error.TOO_OLD || err.reason === 'CLOSE_RECOGNIZER') &&
    RecognizerContext.canReconnect(editor.recognizerContext)
  ) {
    logger.info('Reconnection is available', err)
    editorRef.error.style.display = 'none'
  } else {
    editorRef.loader.style.display = 'none'
    editorRef.error.style.display = 'initial'
    emitEvents(editor, err, Constants.EventType.ERROR, ...events)
  }
}

/**
 * Method called when server respond correctly to request or WS
 * Use in then on Promises
 * @param {Editor} editor
 * @param {Object} model
 * @param {...String} events
 */
export function handleSuccess (editor, model, ...events) {
  const editorRef = editor
  if (editor.undoRedoManager.updateModel) {
    editor.undoRedoManager.updateModel(editor.undoRedoContext, model)
      .then(({ res, types }) => {
        manageRecognizedModel(editorRef, res, ...[...events, ...types].filter((el, i, a) => i === a.indexOf(el)))
      })
  } else {
    if (editorRef.error.style.display === 'initial') {
      editorRef.error.style.display = 'none'
    }
    manageRecognizedModel(editorRef, model, ...events)
  }
}
