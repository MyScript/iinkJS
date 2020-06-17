import { editorLogger as logger } from './configuration/LoggerConfig'
import { Editor } from './Editor'

/**
 * Attach an Editor to a DOMElement
 * @param {Element} element DOM element to attach an editor
 * @param {Configuration} [configuration] Configuration to apply
 * @param {PenStyle} [penStyle] Pen style to apply
 * @param {Theme} [theme] Theme to apply
 * @param {Behaviors} [behaviors] Custom behaviors to apply
 * @return {Editor} New editor
 */
export function register (element, configuration, penStyle, theme, behaviors) {
  logger.debug('Registering a new editor')
  return new Editor(element, configuration, penStyle, theme, behaviors)
}

/**
 * Return the list of available recognition languages
 * @param {Configuration} [configuration] Configuration to get the languages
 * @return {JSON} A list of available languages
 */
export async function getAvailableLanguageList (configuration) {
  try {
    if (configuration && configuration.recognitionParams &&
      configuration.recognitionParams.server && configuration.recognitionParams.server.host) {
      const serverConfig = configuration.recognitionParams.server
      const response = await fetch(`${serverConfig.scheme}://${serverConfig.host}/api/v4.0/iink/availableLanguageList`)
      if (response && response.ok) {
        return response.json()
      }
    } else {
      console.error('Cannot get languages ! Please check your configuration!')
    }
  } catch (error) {
    console.error(error)
  }
}
