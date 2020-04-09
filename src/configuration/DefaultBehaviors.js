import { editorLogger as logger } from './LoggerConfig'
import * as PointerEventGrabber from '../grabber/PointerEventGrabber'
import * as CanvasRenderer from '../renderer/canvas/CanvasRenderer'
import * as QuadraticCanvasStroker from '../renderer/canvas/stroker/QuadraticCanvasStroker'
import * as SVGRenderer from '../renderer/svg/SVGRenderer'
import * as QuadraticSVGStroker from '../renderer/svg/stroker/QuadraticSVGStroker'
import * as iinkRestRecognizer from '../recognizer/rest/iinkRestRecognizer'
import * as iinkWsRecognizer from '../recognizer/websocket/IInkWsRecognizer'
import emit from '../event/Event'

/**
 * Current behavior
 * @typedef {Object} Behavior
 * @property {Grabber} grabber Grabber to capture strokes
 * @property {Stroker} stroker Stroker to draw stroke
 * @property {Renderer} renderer Renderer to draw on the editor
 * @property {Recognizer} recognizer Recognizer to call the recognition service
 * @property {Array} events Functions to handle model changes
 */

/**
 * Set of behaviors to be used by the {@link Editor}
 * @typedef {Object} Behaviors
 * @property {Grabber} grabber Grabber to capture strokes
 * @property {Array<Stroker>} strokerList List of stroker to draw stroke
 * @property {Array<Renderer>} rendererList List of renderer to draw on the editor
 * @property {Array<Recognizer>} recognizerList Recognizers to call the recognition service
 * @property {function} getBehaviorFromConfiguration Get the current behavior to use regarding the current configuration
 * @property {Array} events Functions to handle model changes
 */

/**
 * Default behaviors
 * @type {Behaviors}
 */
export const defaultBehaviors = {
  grabber: PointerEventGrabber,
  strokerList: [QuadraticCanvasStroker, QuadraticSVGStroker],
  rendererList: [CanvasRenderer, SVGRenderer],
  recognizerList: [iinkRestRecognizer, iinkWsRecognizer],
  events: emit,
  getBehaviorFromConfiguration: (behaviors, configuration) => {
    const behavior = {}
    behavior.grabber = behaviors.grabber
    if (configuration) {
      if (configuration.recognitionParams.protocol === 'REST') {
        behavior.stroker = QuadraticCanvasStroker
        behavior.renderer = CanvasRenderer
        behavior.recognizer = iinkRestRecognizer
      } else {
        behavior.stroker = QuadraticSVGStroker
        behavior.renderer = SVGRenderer
        behavior.recognizer = iinkWsRecognizer
      }
    }
    behavior.events = behaviors.events
    return behavior
  }
}

/**
 * Generate behaviors
 * @param {Behaviors} behaviors Behaviors to be used
 * @return {Behaviors} Overridden behaviors
 */
export function overrideDefaultBehaviors (behaviors) {
  if (behaviors) {
    const currentBehaviors = {
      grabber: behaviors.grabber || defaultBehaviors.grabber,
      rendererList: behaviors.rendererList || defaultBehaviors.rendererList,
      strokerList: behaviors.strokerList || defaultBehaviors.strokerList,
      recognizerList: behaviors.recognizerList || defaultBehaviors.recognizerList,
      events: behaviors.events || defaultBehaviors.events,
      getBehaviorFromConfiguration: behaviors.getBehaviorFromConfiguration || defaultBehaviors.getBehaviorFromConfiguration
    }
    logger.debug('Override default behaviors', currentBehaviors)
    return currentBehaviors
  }
  return defaultBehaviors
}

export default defaultBehaviors
