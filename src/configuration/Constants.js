/**
 * @typedef {Object} Constants
 */

const Constants = {
  EventType: {
    IDLE: 'idle',
    CHANGED: 'changed',
    IMPORTED: 'imported',
    EXPORTED: 'exported',
    CONVERTED: 'converted',
    RENDERED: 'rendered', // Internal use only
    LOADED: 'loaded',
    UNDO: 'undo',
    REDO: 'redo',
    CLEAR: 'clear',
    IMPORT: 'import',
    SUPPORTED_IMPORT_MIMETYPES: 'supportedImportMimeTypes',
    EXPORT: 'export',
    CONVERT: 'convert',
    ERROR: 'error'
  },
  RecognitionType: {
    TEXT: 'TEXT',
    MATH: 'MATH',
    DIAGRAM: 'DIAGRAM',
    RAWCONTENT: 'Raw Content'
  },
  Protocol: {
    WEBSOCKET: 'WEBSOCKET',
    REST: 'REST'
  },
  ModelState: {
    INITIALIZING: 'INITIALIZING',
    INITIALIZED: 'INITIALIZED',
    EXPORTING: 'EXPORTING',
    EXPORTED: 'EXPORTED',
    PENDING: 'PENDING',
    MODIFIED: 'MODIFIED',
    ERROR: 'ERROR'
  },
  Trigger: {
    QUIET_PERIOD: 'QUIET_PERIOD',
    POINTER_UP: 'POINTER_UP',
    DEMAND: 'DEMAND'
  },
  Logger: {
    EDITOR: 'editor',
    MODEL: 'model',
    GRABBER: 'grabber',
    RENDERER: 'renderer',
    RECOGNIZER: 'recognizer',
    EVENT: 'event',
    UTIL: 'util',
    SMARTGUIDE: 'smartguide'
  },
  LogLevel: {
    TRACE: 'TRACE',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
  },
  Languages: {
    zh_CN: 'Noto Sans CJK tc',
    zh_HK: 'Noto Sans CJK tc',
    zh_TW: 'Noto Sans CJK tc',
    ko_KR: 'Noto Sans CJK kr',
    ja_JP: 'Noto Sans CJK jp',
    default: 'MyScriptInter'
  },
  Error: {
    NOT_REACHABLE: 'MyScript recognition server is not reachable. Please reload once you are connected.',
    WRONG_CREDENTIALS: 'Application credentials are invalid. Please check or regenerate your application key and hmackey.',
    TOO_OLD: 'Session is too old. Max Session Duration Reached.',
    NO_ACTIVITY: 'Session closed due to no activity.',
    CANT_ESTABLISH: 'Unable to establish a connection to the server. Check the host and your connectivity'
  },
  Exports: {
    JIIX: 'application/vnd.myscript.jiix'
  }
}
export default Constants
