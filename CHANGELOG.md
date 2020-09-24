# [v1.4.4](https://github.com/MyScript/iinkJS/tree/v1.4.4)

## Features

- REST requests use `fetch` instead of `XMLHttpRequest`

## Bugs fix

@Editor
- fix setTheme not sent on reconnect or language change
- fix resize on REST mode

@examples
- remove mixed-content image

@docs
- generated directly in sub folder /docs and accessible at https://myscript.github.io/iinkJS/docs/

# [v1.4.3](https://github.com/MyScript/iinkJS/tree/v1.4.3)

## Bugs fix

@Editor
- fix `response is not a function` on reconnect
- fix setTheme error on init
- fix setTheme sent twice on init

@examples
- update katex to 0.12.0
- simplify clean latex methods

## Chore

- chore(deps): update rollup-plugin-terser to v7

# [v1.4.2](https://github.com/MyScript/iinkJS/tree/v1.4.2)

## Bugs fix

- fix(reco): last export not taken

## Chore

- chore(deps): update minimist to 1.2.5
- chore(deps): bump lodash from 4.17.15 to 4.17.19

# [v1.4.1](https://github.com/MyScript/iinkJS/tree/v1.4.1)

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
