/* eslint-disable no-unused-expressions */
import * as CryptoHelper from '../CryptoHelper'

/**
 * Post request
 * @param {RecognizerContext} recognizerContext Recognizer context
 * @param {String} url URL
 * @param {Object} data Data to be sent
 * @param {String} apiVersion api version
 * @param {String} mimeType MimeType to be used
 * @return {Promise}
 */
export async function post (recognizerContext, url, data, mimeType) {
  const configuration = recognizerContext.editor.configuration
  const recognizerContextRef = recognizerContext
  if (recognizerContextRef) {
    recognizerContextRef.idle = true
  }
  try {
    const headers = new Headers()
    headers.append('Accept', 'application/json,' + mimeType)
    headers.append('applicationKey', configuration.recognitionParams.server.applicationKey)
    headers.append('hmac', CryptoHelper.computeHmac(JSON.stringify(data), configuration.recognitionParams.server.applicationKey, configuration.recognitionParams.server.hmacKey))
    headers.append('Content-Type', 'application/json')
    const reqInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: 'omit'
    }
    const request = new Request(url, reqInit)
    const response = await fetch(request)
    const contentType = response.headers.get('content-type')
    let result = ''
    switch (contentType) {
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'image/png':
      case 'image/jpeg':
        result = await response.blob()
        break
      case 'application/json':
        result = await response.json()
        break
      case 'application/vnd.myscript.jiix':
        result = await response.clone().json().catch(async () => await response.text())
        break
      default:
        result = await response.text()
        break
    }
    return result
  } catch (error) {
    throw new Error({ msg: `Could not connect to ${url} connection error`, recoverable: false })
  }
}
