# [v1.4.0](https://github.com/MyScript/iinkJS/tree/v1.4.0)

## Breaking changes

- ⚠ Package was renamed from `myscript` to `iink-js` to synchronize our SDK release version
- V3 API is not available anymore, as such, configuration : `recognitionParams.(v3|v4)` was renamed to `recognitionParams.iink`
- Remove stats from editor
- Callbacks have been replaced by Promises

## Features

- Editor exposes a new method to properly close websocket connection
- Editor makes an API call to get list of available languages.

## Bugs fix

@Editor
- Fix `canClear` flag
- Fix `clear` method
- Fix error display
- Fix lost strokes on reconnection

@examples
- Fix scrolling on iOS
- Fix click on iOS after simple recognition
- Fix export to file with FileSaver

### Chore 

- Remove `esdoc` to use `jsdoc` with npx
- Upgrade tooling
