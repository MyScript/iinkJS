import merge from 'lodash.merge'
import { editorLogger as logger } from './LoggerConfig'

/**
 * Default configuration
 * See https://developer.myscript.com/docs/interactive-ink/latest/reference/web/configuration/ for a full documentation of parameters.
 */
const defaultConfiguration = {
  recognitionParams: {
    type: 'TEXT',
    protocol: 'WEBSOCKET',
    server: {
      scheme: 'https',
      host: 'cloud.myscript.com',
      applicationKey: undefined,
      hmacKey: undefined,
      useWindowLocation: false,
      websocket: {
        pingEnabled: true,
        pingDelay: 30000,
        maxPingLostCount: 10,
        autoReconnect: true,
        maxRetryCount: 2,
        fileChunkSize: 300000
      }
    },
    iink: {
      alwaysConnected: true,
      lang: 'en_US',
      export: {
        'image-resolution': 300,
        jiix: {
          'bounding-box': false,
          strokes: false,
          text: {
            chars: false,
            words: true
          }
        }
      },
      renderer: {
        debug: {
          'draw-text-boxes': false,
          'draw-image-boxes': false
        }
      },
      math: {
        mimeTypes: ['application/x-latex', 'application/mathml+xml'],
        solver: {
          enable: true,
          'fractional-part-digits': 3,
          'decimal-separator': '.',
          'rounding-mode': 'half up',
          'angle-unit': 'deg'
        },
        margin: {
          bottom: 10,
          left: 15,
          right: 15,
          top: 10
        }
      },
      text: {
        guides: {
          enable: true
        },
        smartGuide: true,
        smartGuideFadeOut: {
          enable: false,
          duration: 10000
        },
        mimeTypes: ['text/plain', 'application/vnd.myscript.jiix'],
        margin: {
          top: 20,
          left: 10,
          right: 10
        }
      },
      diagram: {
        mimeTypes: ['application/vnd.myscript.jiix'],
        margin: {
          bottom: 10,
          left: 15,
          right: 15,
          top: 10
        }
      },
      'raw-content': {
        recognition: {
          text: false,
          shape: false
        }
      }
    }
  },
  // @see generated documentation on top
  listenerOptions: {
    capture: false,
    passive: true
  },
  undoRedoMaxStackSize: 20,
  xyFloatPrecision: 0,
  timestampFloatPrecision: 0,
  triggerDelay: 2000,
  processDelay: 0,
  resizeTriggerDelay: 200,
  // Configure when the action is triggered.
  // POINTER_UP : Action is triggered on every PenUP. This is the recommended mode for CDK V3 WebSocket recognitions.
  // QUIET_PERIOD : Action is triggered after a quiet period in milli-seconds on every pointer up. I value is set to 2000 for example the recognition will be fired  when user stop writing 2 seconds. This is the recommended mode for all REST recognitions.
  triggers: {
    exportContent: 'POINTER_UP',
    addStrokes: 'POINTER_UP'
  },
  restConversionState: '',
  renderingParams: {
    stroker: 'quadratic',
    minHeight: 100,
    minWidth: 100
  }
}

/**
 * Generate parameters
 * @param {Configuration} configuration Configuration to be used
 * @param {Object} watcher: { update: function, prop: string} function to call when 'prop' is updated
 * @return {Configuration} Overridden configuration
 */
export function overrideDefaultConfiguration (configuration) {
  const confRef = configuration
  let currentConfiguration
  if (confRef && confRef.recognitionParams.server && confRef.recognitionParams.server.useWindowLocation) {
    confRef.recognitionParams.server.scheme = window.location.protocol.slice(0, -1)
    confRef.recognitionParams.server.host = window.location.host
    currentConfiguration = merge({}, defaultConfiguration, confRef === undefined ? {} : confRef)
  } else {
    currentConfiguration = merge({}, defaultConfiguration, configuration === undefined ? {} : configuration)
  }
  logger.debug('Override default configuration', currentConfiguration)

  return currentConfiguration
}

export default defaultConfiguration
