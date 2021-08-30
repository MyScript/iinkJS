const path = require('path')

const backendHost = process.env.BACKEND_URL || 'http://localhost:8080'
const resourcesFolder = path.resolve(__dirname, '../files')
const timeoutAmplificator = process.env.NIGHTWATCH_TIMEOUT_FACTOR || 1

const configurations = [{
  type: 'MATH',
  protocol: 'WEBSOCKET',
  apiVersion: 'V4',
  examples: ['/examples/v4/websocket_math_iink.html']
}, {
  type: 'MATH',
  protocol: 'WEBSOCKET',
  apiVersion: 'V4',
  alternate: 'Import',
  examples: ['/examples/v4/import_math_jiix.html']
}, {
  type: 'MATH',
  protocol: 'WEBSOCKET',
  apiVersion: 'V4',
  alternate: 'RAB',
  examples: ['/examples/v4/custom_resources_content_math.html']
}, {
  type: 'TEXT',
  protocol: 'WEBSOCKET',
  apiVersion: 'V4',
  examples: ['/examples/v4/websocket_text_iink.html']
}, {
  type: 'TEXT',
  protocol: 'WEBSOCKET',
  apiVersion: 'V4',
  alternate: 'RAB',
  examples: ['/examples/v4/custom_lexicon_text.html']
}, {
  type: 'TEXT',
  protocol: 'WEBSOCKET',
  apiVersion: 'V4',
  alternate: 'Decoration',
  examples: ['/examples/v4/highlight_words.html']
}, {
  type: 'TEXT',
  protocol: 'REST',
  apiVersion: 'V4',
  examples: ['/examples/v4/rest/rest_text_iink.html']
}, {
  type: 'Raw Content',
  protocol: 'REST',
  apiVersion: 'V4',
  examples: ['/examples/v4/rest/rest_raw_content_iink.html']
}]

module.exports = {
  configurations,
  backendHost,
  resourcesFolder,
  timeoutAmplificator
}
