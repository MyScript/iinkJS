# [v1.5.5]

## Bug fix
- bad link on the Get source code for Change configuration

# [v1.5.4](https://github.com/MyScript/iinkJS/tree/v1.5.4)

## Features
- minor modification for specific integration
# [v1.5.3](https://github.com/MyScript/iinkJS/tree/v1.5.3)

## Bug fix
@Editor
- fix change configuration IInks doesn't set the right font

# [v1.5.2](https://github.com/MyScript/iinkJS/tree/v1.5.2)

## Bug fix
@Editor
- fix change configuration ink disappears in example configured in REST

# [v1.5.1](https://github.com/MyScript/iinkJS/tree/v1.5.1)

## Bug fix
@Editor
- fix change configuration restart websocket connection
- fix lost connection due to inactivity is now displayed
- fix style is wrapped by global class and can be customized

@examples
- fix bad position of the searching highlight in searching text example
- new examples with eraser

## Features
- erase mode is now an option in websocket text

## Chore
- refactor of examples

# [v1.4.5](https://github.com/MyScript/iinkJS/tree/v1.4.5)

## Bug fix

- fix missing ink on iOS with Scribble feature on

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
