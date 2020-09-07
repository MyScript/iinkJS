/* eslint-disable no-underscore-dangle */
import style from './iink.css'
import { editorLogger as logger } from './configuration/LoggerConfig'
import * as DefaultBehaviors from './configuration/DefaultBehaviors'
import * as DefaultConfiguration from './configuration/DefaultConfiguration'
import * as DefaultStyles from './configuration/DefaultPenStyle'
import * as DefaultTheme from './configuration/DefaultTheme'
import * as InkModel from './model/InkModel'
import * as UndoRedoContext from './model/UndoRedoContext'
import * as UndoRedoManager from './model/UndoRedoManager'
import * as ImageRenderer from './renderer/canvas/ImageRenderer'
import * as RecognizerContext from './model/RecognizerContext'
import * as SmartGuide from './smartguide/SmartGuide'
import Constants from './configuration/Constants'
import * as eastereggs from './eastereggs/InkImporter'
import {
  handleError,
  handleSuccess,
  emitEvents,
  manageRecognizedModel
} from './recognizer/RecognizerService'
import * as PromiseHelper from './util/PromiseHelper'

/**
 * Check if a clear is required, and does it if it is
 * @param {Editor} editor
 * @param {Model} model Current model
 * @return {Promise<*>}
 */
function manageResetState (editor, model) {
  // If strokes moved in the undo redo stack then a clear is mandatory before sending strokes.
  if (editor.recognizer.reset && RecognizerContext.isResetRequired(editor.recognizerContext, model)) {
    return editor.recognizer.reset(editor.recognizerContext, model)
  }
  return null
}

/**
 * Check if the trigger in parameter is valid.
 * @param {Editor} editor
 * @param {String} type
 * @param {String} [trigger]
 * @return {Boolean}
 */
function isTriggerValid (editor, type, trigger = editor.configuration.triggers[type]) {
  if (editor.recognizer &&
    editor.recognizer.getInfo().availableTriggers[type].includes(trigger)) {
    return true
  }
  logger.error(`${trigger} is not a valid trigger for ${type}`)
  return false
}

/**
 * Launch the recognition with all editor relative configuration and state.
 * @param {Editor} editor
 * @param {Model} model
 * @param {String} [trigger]
 * @return {Promise}
 */
async function addStrokes (editor, model, trigger = editor.configuration.triggers.addStrokes) {
  if (editor.recognizer && editor.recognizer.addStrokes) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      // Firing addStrokes only if recognizer is configure to do it
      if (isTriggerValid(editor, 'addStrokes', trigger)) {
        const res = await manageResetState(editor, model)
        if (res) {
          return editor.recognizer.addStrokes(editor.recognizerContext, res)
        }
        return editor.recognizer.addStrokes(editor.recognizerContext, model)
      }
    }
  }
  return Promise.reject(new Error('Cannot addStrokes'))
}

/**
 * Launch ink import.
 * @param {Editor} editor
 * @param {Model} model
 * @param {PointerEvents} events
 * @return {Promise<*>}
 */
async function launchPointerEvents (editor, model, events) {
  if (editor.recognizer && editor.recognizer.pointerEvents) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.pointerEvents(editor.recognizerContext, model, events)
    }
  }
  return Promise.reject(new Error('Cannot launch pointerEvents'))
}

/**
 * Launch the recognition with all editor relative configuration and state.
 * @param {Editor} editor
 * @param {Model} model
 * @param {String} [requestedMimeTypes]
 * @param {String} [trigger]
 */
export async function launchExport (editor, model, requestedMimeTypes, trigger = editor.configuration.triggers.exportContent) {
  if (editor.recognizer && editor.recognizer.export_) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      if (isTriggerValid(editor, 'exportContent', trigger)) {
        const editorRef = editor
        window.clearTimeout(editor.exportTimer)
        const timeout = trigger === Constants.Trigger.QUIET_PERIOD ? editor.configuration.triggerDelay : 0
        const delayer = PromiseHelper.delay(timeout)
        editorRef.exportTimer = delayer.timer
        await delayer.promise
        const res = await manageResetState(editor, model)
        if (res) {
          return editor.recognizer.export_(editor.recognizerContext, res, requestedMimeTypes)
        }
        return editor.recognizer.export_(editor.recognizerContext, model, requestedMimeTypes)
      }
    }
  }
  return Promise.reject(new Error('Cannot launch export'))
}

/**
 * Launch the import.
 * @param {Editor} editor
 * @param {Model} model
 * @param {Blob} data
 * @return {Promise<*>}
 */
async function launchImport (editor, model, data) {
  if (editor.recognizer && editor.recognizer.import_) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.import_(editor.recognizerContext, model, data)
    }
  }
  return Promise.reject(new Error('Cannot launch import'))
}

/**
 * Get the supported mimetypes for import.
 * @param {Editor} editor
 * @param {Model} model
 * @return {Promise<*>}
 */
async function launchGetSupportedImportMimeTypes (editor, model) {
  if (editor.recognizer && editor.recognizer.getSupportedImportMimeTypes) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.getSupportedImportMimeTypes(editor.recognizerContext, model)
    }
  }
  return Promise.reject(new Error('Cannot launch getSupportedImportMimeTypes'))
}

/**
 * Launch the convert with all editor relative configuration and state.
 * @param {Editor} editor
 * @param {Model} model
 * @param {String} conversionState
 * @return {Promise<*>}
 */
async function launchConvert (editor, model, conversionState) {
  if (editor.recognizer && editor.recognizer.convert) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.convert(editor.recognizerContext, model, conversionState)
    }
  }
  return Promise.reject(new Error('Cannot launch convert'))
}

/**
 * Launch the configuration for the editor
 * @param {Editor} editor
 * @param {Model} model
 * @return {Promise<*>}
 */
async function launchConfig (editor, model) {
  if (editor.recognizer && editor.recognizer.sendConfiguration) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.sendConfiguration(editor.recognizerContext, model)
    }
  }
  return Promise.reject(new Error('Cannot launch config'))
}

/**
 * Launch the resize.
 * @param {Editor} editor
 * @param {Model} model
 */
async function launchResize (editor, model) {
  if (editor.recognizer && editor.recognizer.resize) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      const editorRef = editor
      window.clearTimeout(editor.resizeTimer)
      const delayer = PromiseHelper.delay(editor.configuration.resizeTriggerDelay)
      editorRef.resizeTimer = delayer.timer
      SmartGuide.resize(editor.smartGuide)
      await delayer.promise
      return editor.recognizer.resize(editor.recognizerContext, model, editor.domElement)
    }
  }
  return Promise.reject(new Error('Cannot launch resize'))
}

/**
 * Launch wait for idle
 * @param {Editor} editor
 * @param {Model} model
 * @return {Promise<*>}
 */
async function launchWaitForIdle (editor, model) {
  if (editor.recognizer && editor.recognizer.waitForIdle) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.waitForIdle(editor.recognizerContext, model)
    }
  }
  return Promise.reject(new Error('Cannot launch wait for idle'))
}

/**
 * Launch websocket close
 * @param {Editor} editor
 * @param {Model} model
 * @return {Promise<*>}
 */
async function launchClose (editor, model) {
  if (editor.recognizer && editor.recognizer.close) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.close(editor.recognizerContext, model)
    }
  }
  return Promise.reject(new Error('Cannot launch close'))
}

/**
 * Set pen style.
 * @param {Editor} editor
 * @param {Model} model
 * @return {Promise<*>}
 */
async function setPenStyle (editor, model) {
  if (editor.recognizer && editor.recognizer.setPenStyle) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.setPenStyle(editor.recognizerContext, model, editor.penStyle)
    }
    return Promise.reject(new Error('Cannot set pentStyle'))
  }
  return null
}

/**
 * Set pen style.
 * @param {Editor} editor
 * @param {Model} model
 * @return {Promise<*>}
 */
async function setPenStyleClasses (editor, model) {
  if (editor.recognizer && editor.recognizer.setPenStyleClasses) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.setPenStyleClasses(editor.recognizerContext, model, editor.penStyleClasses)
    }
    return Promise.reject(new Error('Cannot set penStyleClasses'))
  }
  return null
}

/**
 * Set theme.
 * @param {Editor} editor
 * @param {Model} model
 * @return {Promise<*>}
 */
async function setTheme (editor, model) {
  if (editor.recognizer && editor.recognizer.setTheme) {
    const init = await editor.recognizerContext.initPromise
    if (init) {
      return editor.recognizer.setTheme(editor.recognizerContext, model, editor.theme)
    }
    return Promise.reject(new Error('Cannot set theme'))
  }
  return null
}

/**
 * Editor
 */
export class Editor {
  /**
   * @param {Element} element DOM element to attach this editor
   * @param {Configuration} [configuration] Configuration to apply
   * @param {Theme} [theme] Custom theme to apply
   * @param {PenStyle} [penStyle] Custom style to apply
   * @param {Behaviors} [behaviors] Custom behaviors to apply
   */
  constructor (element, configuration, penStyle, theme, behaviors) {
    const styleElement = document.createElement('style')
    styleElement.appendChild(document.createTextNode(''))
    element.appendChild(styleElement)

    const sheet = styleElement.sheet
    styleElement.textContent = style

    this.sheet = sheet
    /**
     * Inner reference to the DOM Element
     * @type {Element}
     */
    this.domElement = element
    this.domElement.classList.add('ms-editor')

    // eslint-disable-next-line no-undef
    this.loader = document.createElement('div')
    this.loader.classList.add('loader')
    this.loader = this.domElement.appendChild(this.loader)

    // eslint-disable-next-line no-undef
    this.error = document.createElement('div')
    this.error.classList.add('error-msg')
    this.error = this.domElement.appendChild(this.error)

    /**
     * Launch export timer
     * @type {Number}
     */
    this.exportTimer = undefined

    /**
     * Launch resize timer
     * @type {Number}
     */
    this.resizeTimer = undefined

    /**
     * Notify delay timer
     * @type {Number}
     */
    this.notifyTimer = undefined

    /**
     * @private
     * @type {Behaviors}
     */
    this.innerBehaviors = DefaultBehaviors.overrideDefaultBehaviors(behaviors)
    this.configuration = configuration
    this.smartGuide = SmartGuide.createSmartGuide(this)

    /**
     * Pen color used only for pending stroke
     * @type {string}
     */
    this.localTheme = ''

    this.theme = theme
    this.penStyle = penStyle
    this.penStyleClasses = ''

    this.domElement.editor = this
  }

  /**
   * Set the recognition parameters
   * WARNING : Need to fire a clear if user have already input some strokes.
   * @param {Configuration} configuration
   */
  set configuration (configuration) {
    this.loader.style.display = 'initial'
    this.error.style.display = 'none'

    /**
     * Update function call when some configuration property is updated
     * @param {string} value
     */
    const update = (value) => {
      const defaultLang = !Object.keys(Constants.Languages).includes(value)
      const armenian = value === 'hy_AM'
      this.theme['.text']['font-family'] = defaultLang || armenian ? Constants.Languages.default : Constants.Languages[value]
      this.behavior = this.behaviors.getBehaviorFromConfiguration(this.behaviors, this.innerConfiguration)
    }

    const watcher = {
      update,
      prop: 'lang'
    }

    /**
     * @private
     * @type {Configuration}
     */
    this.innerConfiguration = DefaultConfiguration.overrideDefaultConfiguration(configuration, watcher)
    this.behavior = this.behaviors.getBehaviorFromConfiguration(this.behaviors, this.innerConfiguration)
  }

  /**
   * Get the current recognition parameters
   * @return {Configuration}
   */
  get configuration () {
    return this.innerConfiguration
  }

  /**
   * Set the pen style
   * @param {PenStyle} penStyle
   */
  set penStyle (penStyle) {
    /**
     * @private
     * @type {PenStyle}
     */
    this.innerPenStyle = DefaultStyles.overrideDefaultPenStyle(penStyle)
    this.localPenStyle = this.innerPenStyle
    setPenStyle(this, this.model)
  }

  /**
   * Get the pen style
   * @return {PenStyle}
   */
  get penStyle () {
    return this.innerPenStyle
  }

  /**
   * Set the pen style
   * @param {String} penStyleClasses
   */
  set penStyleClasses (penStyleClasses) {
    /**
     * @private
     * @type {String}
     */
    this.innerPenStyleClasses = penStyleClasses
    this.localPenStyle = this.theme[`.${this.innerPenStyleClasses}`]
    setPenStyleClasses(this, this.model)
  }

  /**
   * Get the pen style
   * @return {String}
   */
  get penStyleClasses () {
    return this.innerPenStyleClasses
  }

  /**
   * Set the theme
   * @param {Theme} theme
   */
  set theme (theme) {
    /**
     * @private
     * @type {Theme}
     */
    this.innerTheme = DefaultTheme.overrideDefaultTheme(theme)
    setTheme(this, this.model)
  }

  /**
   * Get the theme
   * @return {Theme}
   */
  get theme () {
    return this.innerTheme
  }

  /**
   * Get behaviors
   * @return {Behaviors}
   */
  get behaviors () {
    return this.innerBehaviors
  }

  /**
   * @private
   * @param {Behavior} behavior
   */
  set behavior (behavior) {
    if (behavior) {
      if (this.grabber) { // Remove event handlers to avoid multiplication (detach grabber)
        this.grabber.detach(this.domElement, this.grabberContext)
      }
      /**
       * @private
       * @type {Behavior}
       */
      this.innerBehavior = behavior
      this.renderer = this.innerBehavior.renderer
      this.recognizer = this.innerBehavior.recognizer
      /**
       * Current grabber context
       * @type {GrabberContext}
       */
      this.grabberContext = this.grabber.attach(this.domElement, this)
    }
  }

  /**
   * Get current behavior
   * @return {Behavior}
   */
  get behavior () {
    return this.innerBehavior
  }

  /**
   * Set the current recognizer
   * @private
   * @param {Recognizer} recognizer
   */
  set recognizer (recognizer) {
    this.undoRedoContext = UndoRedoContext.createUndoRedoContext(this.configuration)
    this.undoRedoManager = UndoRedoManager

    const initialize = (model) => {
      /**
       * @private
       * @type {Recognizer}
       */
      this.innerRecognizer = recognizer
      if (this.innerRecognizer) {
        /**
         * Current recognition context
         * @type {RecognizerContext}
         */
        this.recognizerContext = RecognizerContext.createEmptyRecognizerContext(this)
        // FIXME: merge undo/redo manager with default recognizer
        if (this.innerRecognizer.undo && this.innerRecognizer.redo && this.innerRecognizer.clear) {
          this.undoRedoContext = this.recognizerContext
          this.undoRedoManager = this.innerRecognizer
        }

        this.innerRecognizer.init(this.recognizerContext, model)
          .then((values) => {
            logger.info('Recognizer initialized !')
            this.loader.style.display = 'none'
          })
          .catch(err => handleError(this, err))
      }
    }

    if (recognizer) {
      if (this.innerRecognizer) {
        this.innerRecognizer.close(this.recognizerContext, this.model)
          .then((model) => {
            logger.info('Recognizer closed')
            handleSuccess(this, model)
            initialize(InkModel.clearModel(model))
          })
          .catch(err => handleError(this, err))
      } else {
        /**
         * Current model
         * @type {Model}
         */
        this.model = InkModel.createModel(this.configuration)

        // INFO: Recognizer needs model to be initialized
        initialize(this.model)
      }
    }
  }

  /**
   * Get current recognizer
   * @return {Recognizer}
   */
  get recognizer () {
    return this.innerRecognizer
  }

  /**
   * Set the current renderer
   * @private
   * @param {Renderer} renderer
   */
  set renderer (renderer) {
    if (renderer) {
      if (this.innerRenderer) {
        this.innerRenderer.detach(this.domElement, this.rendererContext)
      }

      /**
       * @private
       * @type {Renderer}
       */
      this.innerRenderer = renderer
      if (this.innerRenderer) {
        /**
         * Current rendering context
         * @type {Object}
         */
        this.rendererContext = this.innerRenderer.attach(this.domElement, this.configuration.renderingParams.minHeight, this.configuration.renderingParams.minWidth)
      }
    }
  }

  /**
   * Get current renderer
   * @return {Renderer}
   */
  get renderer () {
    return this.innerRenderer
  }

  /**
   * Get current grabber
   * @return {Grabber}
   */
  get grabber () {
    return this.behavior ? this.behavior.grabber : undefined
  }

  /**
   * Get current stroker
   * @return {Stroker}
   */
  get stroker () {
    return this.behavior ? this.behavior.stroker : undefined
  }

  /**
   * Get current events
   * @return {Array}
   */
  get emit () {
    return this.behavior ? this.behavior.events : undefined
  }

  /**
   * Get a PNG image data url from the data model
   * @return {String}
   */
  get png () {
    return ImageRenderer.getImage(this.model, this.stroker)
  }

  /**
   * True if initialized, false otherwise
   * @return {Boolean}
   */
  get initialized () {
    return this.recognizerContext ? this.recognizerContext.initialized : false
  }

  /**
   * Handle a pointer down
   * @param {{x: Number, y: Number, t: Number}} point Captured point coordinates
   * @param {String} [pointerType=mouse] Current pointer type
   * @param {String} [pointerId] Current pointer id
   */
  pointerDown (point, pointerType = 'pen', pointerId) {
    logger.trace('Pointer down', point)
    window.clearTimeout(this.notifyTimer)
    window.clearTimeout(this.exportTimer)
    this.model = InkModel.initPendingStroke(this.model, point, Object.assign({ pointerType, pointerId }, this.theme.ink, this.localPenStyle))
    this.renderer.drawCurrentStroke(this.rendererContext, this.model, this.stroker)
    // Currently no recognition on pointer down
  }

  /**
   * Handle a pointer move
   * @param {{x: Number, y: Number, t: Number}} point Captured point coordinates
   */
  pointerMove (point) {
    logger.trace('Pointer move', point)
    this.model = InkModel.appendToPendingStroke(this.model, point)
    this.renderer.drawCurrentStroke(this.rendererContext, this.model, this.stroker)
    // Currently no recognition on pointer move
  }

  /**
   * Handle a pointer up
   * @param {{x: Number, y: Number, t: Number}} point Captured point coordinates
   */
  pointerUp (point) {
    logger.trace('Pointer up', point)
    this.model = InkModel.endPendingStroke(this.model, point, this.penStyle)
    this.renderer.drawModel(this.rendererContext, this.model, this.stroker)

    if (this.recognizer.addStrokes) {
      addStrokes(this, this.model)
    } else {
      // Push model in undo redo manager
      handleSuccess(this, this.model)
    }
  }

  removeStroke (stroke) {
    this.model.strokeGroups.forEach((group) => {
      const stringStrokes = group.strokes.map(strokeFromGroup => JSON.stringify(strokeFromGroup))
      const strokeIndex = stringStrokes.indexOf(JSON.stringify(stroke))
      if (strokeIndex !== -1) {
        group.strokes.splice(strokeIndex, 1)
      }
    })
    const stringRawStrokes = this.model.rawStrokes.map(strokes => JSON.stringify(strokes))
    const strokeIndex = stringRawStrokes.indexOf(JSON.stringify(stroke))
    if (strokeIndex !== -1) {
      this.model.rawStrokes.splice(strokeIndex, 1)
    }
    this.renderer.drawModel(this.rendererContext, this.model, this.stroker)
    handleSuccess(this, this.model)
    if (!(this.configuration.triggers.exportContent === 'DEMAND')) {
      launchExport(this, this.model)
    }
  }

  /**
   * @Deprecated
   * @param rawStrokes
   * @param strokeGroups
   */
  reDraw (rawStrokes, strokeGroups) {
    rawStrokes.forEach((stroke) => {
      InkModel.addStroke(this.model, stroke)
    })
    strokeGroups.forEach((group) => {
      group.strokes.forEach((strokeFromGroup) => {
        InkModel.addStrokeToGroup(this.model, strokeFromGroup, group.penStyle)
      })
    })
    this.renderer.drawModel(this.rendererContext, this.model, this.stroker)
    handleSuccess(this, this.model)
  }

  /**
   * True if idle state
   * @return {Boolean}
   */
  get idle () {
    return this.recognizerContext.idle
  }

  /**
   * Wait for idle state.
   * @return {Promise<*>}
   */
  waitForIdle () {
    emitEvents(this, undefined, Constants.EventType.IDLE)
    return launchWaitForIdle(this, this.model)
  }

  /**
   * True if can undo, false otherwise.
   * @return {Boolean}
   */
  get canUndo () {
    return this.undoRedoContext.canUndo
  }

  /**
   * Undo the last action.
   * @return {Promise<*>}
   */
  async undo () {
    logger.debug('Undo current model', this.model)
    emitEvents(this, undefined, Constants.EventType.UNDO)
    const { res, types } = await this.undoRedoManager.undo(this.undoRedoContext, this.model)
      .catch(err => handleError(this, err))
    manageRecognizedModel(this, res, ...types)
    return res
  }

  /**
   * True if can redo, false otherwise.
   * @return {Boolean}
   */
  get canRedo () {
    return this.undoRedoContext.canRedo
  }

  /**
   * Redo the last action.
   * @return {Promise<*>}
   */
  async redo () {
    logger.debug('Redo current model', this.model)
    emitEvents(this, undefined, Constants.EventType.REDO)
    const { res, types } = await this.undoRedoManager.redo(this.undoRedoContext, this.model)
      .catch(err => handleError(this, err))
    manageRecognizedModel(this, res, ...types)
    return res
  }

  /**
   * True if empty, false otherwise
   * @return {boolean}
   */
  get isEmpty () {
    return this.recognizerContext.isEmpty
  }

  /**
   * True if can clear, false otherwise.
   * @return {Boolean}
   */
  get canClear () {
    return !this.isEmpty
  }

  /**
   * Clear the output and the recognition result.
   * @return {Promise<*>}
   */
  async clear () {
    if (this.canClear) {
      logger.debug('Clear current model', this.model)
      emitEvents(this, undefined, Constants.EventType.CLEAR)
      const { res, events } = await this.recognizer.clear(this.recognizerContext, this.model)
        .catch(error => handleError(this, error))
      handleSuccess(this, res, ...events)
      return res
    }
    return Promise.reject(new Error('Cannot launch clear'))
  }

  /**
   * True if can convert, false otherwise.
   * @return {Boolean}
   */
  get canConvert () {
    return !!(this.canUndo && this.canClear && this.recognizer && this.recognizer.convert)
  }

  /**
   * Convert the current content
   * @param {string} conversionState
   * @return {Promise<*>}
   */
  convert (conversionState = 'DIGITAL_EDIT') {
    if (this.canConvert) {
      emitEvents(this, undefined, Constants.EventType.CONVERT)
      return launchConvert(this, this.model, conversionState)
    }
    return Promise.reject(new Error('Cannot launch convert'))
  }

  /**
   * Set the guides for text
   * @param {Boolean} [enable]
   * @return {Promise<*|null>}
   */
  setGuides (enable = true) {
    this.configuration.recognitionParams.iink.text.guides.enable = enable
    return launchConfig(this, this.model)
  }

  /**
   * Return the position of the cursor identifying the current state in the internal iink undo/redo stack.
   * @returns {Number}
   */
  get possibleUndoCount () {
    return this.recognizerContext.possibleUndoCount
  }

  /**
   * The number of operations that it is currently possible to undo.
   * @returns {Number}
   */
  get undoStackIndex () {
    return this.recognizerContext.undoStackIndex
  }

  /**
   * True if can export, false otherwise.
   * @return {Boolean}
   */
  get canExport () {
    return this.canUndo && this.canClear && this.recognizer && this.recognizer.getInfo().availableTriggers.exportContent.includes(Constants.Trigger.DEMAND)
  }

  /**
   * Explicitly ask to perform an export. You have to listen to events to get the content as this function is non blocking and does not have a return type.
   * @param {Array<String>} requestedMimeTypes Requested mime-types. Be sure to ask all the types required by the listeners of exported event.
   */
  export_ (requestedMimeTypes) {
    if (this.canExport) {
      emitEvents(this, undefined, Constants.EventType.EXPORT)
      return launchExport(this, this.model, requestedMimeTypes, Constants.Trigger.DEMAND)
    }
    return Promise.reject(new Error('Cannot launch export'))
  }

  /**
   * Import content.
   * @param {Blob|*} data Data to import
   * @param {String} [mimetype] Mimetype of the data, needed if data is not a Blob
   */
  import_ (data, mimetype) {
    emitEvents(this, undefined, Constants.EventType.IMPORT)
    return launchImport(this, this.model, !(data instanceof Blob) ? new Blob([data], { type: mimetype }) : data)
  }

  /**
   * Get supported import mime types
   * @return {Promise<*|null>}
   */
  getSupportedImportMimeTypes () {
    return launchGetSupportedImportMimeTypes(this, this.model)
  }

  /**
   * pointer events
   * @param {PointerEvents} events
   * @return {Promise<*|null>}
   */
  pointerEvents (events) {
    return launchPointerEvents(this, this.model, events)
  }

  /**
   * Get current state exports
   * @return {Object}
   */
  get exports () {
    return this.model ? this.model.exports : undefined
  }

  get supportedImportMimeTypes () {
    return this.recognizerContext.supportedImportMimeTypes
  }

  /**
   * Function to call when the dom element link to the current ink paper has been resize.
   */
  resize () {
    logger.debug('Resizing editor')
    this.renderer.resize(this.rendererContext, this.model, this.stroker, this.configuration.renderingParams.minHeight, this.configuration.renderingParams.minWidth)
    return launchResize(this, this.model)
  }

  /**
   * Detach event listeners from the DOM element created at editor creation.
   */
  unload () {
    if (this.grabber) { // Remove event handlers to avoid multiplication (detach grabber)
      this.grabber.detach(this.domElement, this.grabberContext)
    }
    if (this.innerRenderer) {
      this.innerRenderer.detach(this.domElement, this.rendererContext)
    }
  }

  /**
   * Close websocket connection
   * @return {Promise<*>}
   */
  close () {
    if (this.configuration.recognitionParams.protocol === Constants.Protocol.WEBSOCKET) {
      return launchClose(this, this.model)
    }
    return null
  }

  /**
   * Trigger the change callbacks (and by default send a change event).
   */
  forceChange () {
    emitEvents(this, undefined, Constants.EventType.CHANGED)
  }

  /* eslint-disable class-methods-use-this */
  /**
   * Get access to some easter egg features link ink injection. Use at your own risk (less tested and may be removed without notice).
   */
  get eastereggs () {
    return eastereggs
  }
  /* eslint-enable class-methods-use-this */
}
