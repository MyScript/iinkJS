
const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes, getStrokesFromJIIX } = require('./helper')
const { equation3, fence } = require('../lib/inksDatas')

describe(`${process.env.BROWSER}:v4/websocket_math_iink.html`, function () {
  it('should test undo/redo with equation3', async () => {
    const editorEl = await page.waitForSelector('#editor')
    // undo redo default mode (stroke one), then session mode, then stroke mode
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, equation3.strokes, 100, 100)
    await page.evaluate(exported)
    let jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)
    let latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])

    let clearClick = page.click('#clear')
    let exportedEvent = page.evaluate(exported)
    await Promise.all([clearClick, exportedEvent])
    let exports = await editorEl.evaluate(node => node.editor.model.exports)
    if (exports !== undefined) {
      expect(exports['application/x-latex']).to.equal('')
    }

    await page.click('#undo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)

    await page.click('#undo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length - 1)

    await page.click('#undo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length - 2)

    await page.click('#redo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length - 1)

    clearClick = page.click('#clear')
    exportedEvent = page.evaluate(exported)
    await Promise.all([clearClick, exportedEvent])
    await editorEl.evaluate(node => {
      node.editor.close()
        .then(() => {
          console.log('editor close')
        })
        .catch((e) => console.error(e))
      node.editor.configuration.recognitionParams.iink.math['undo-redo'] = { mode: 'session' }
    })
    // TODO
    // isInit = await isEditorInitialized(editorEl)
    // expect(isInit).to.equal(true)

    await playStrokes(page, equation3.strokes, 100, 100)
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)
    latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])

    clearClick = page.click('#clear')
    exportedEvent = page.evaluate(exported)
    await Promise.all([clearClick, exportedEvent])
    exports = await editorEl.evaluate(node => node.editor.model.exports)
    if (exports !== undefined) {
      jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
      expect(getStrokesFromJIIX(jiix).length).to.equal(0)
    }

    await page.click('#undo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)

    await page.click('#undo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(0)

    await page.click('#redo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)
    latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])

    clearClick = page.click('#clear')
    exportedEvent = page.evaluate(exported)
    await Promise.all([clearClick, exportedEvent])
    await editorEl.evaluate(node => {
      node.editor.close()
        .then(() => {
          console.log('editor close')
        })
        .catch((e) => console.error(e))
      node.editor.configuration.recognitionParams.iink.math['undo-redo'] = { mode: 'stroke' }
    })

    // TODO
    // isInit = await isEditorInitialized(editorEl)
    // expect(isInit).to.equal(true)

    await playStrokes(page, equation3.strokes, 100, 100)
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)
    latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])

    clearClick = page.click('#clear')
    exportedEvent = page.evaluate(exported)
    await Promise.all([clearClick, exportedEvent])
    exports = await editorEl.evaluate(node => node.editor.model.exports)
    if (exports !== undefined) {
      expect(exports['application/x-latex']).to.equal('')
    }

    await page.click('#undo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)

    await page.click('#undo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length - 1)

    await page.click('#undo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length - 2)

    await page.click('#redo')
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length - 1)
  })

  it('should test convert with equation3', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, equation3.strokes, 100, 100)
    await page.evaluate(exported)
    const jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)
    const latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])

    await page.click('#convert')
    await page.evaluate(exported)
    const latexConv = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latexConv).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])
  })

  it('should test math flavor with fences', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await editorEl.evaluate(node => {
      node.editor.close()
        .then(() => {
          console.log('editor close')
        })
        .catch((e) => console.error(e))
      node.editor.configuration.recognitionParams.iink.math.mimeTypes.push('application/mathml+xml')
      node.editor.configuration.recognitionParams.iink.export.mathml = { flavor: 'standard' }
    })

    await playStrokes(page, fence.strokes, 100, 175)

    await page.evaluate(exported)
    let jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(fence.strokes.length)
    let mathml = await editorEl.evaluate(node => node.editor.model.exports['application/mathml+xml'])
    expect(mathml.trim().replace(/ /g, '')).to.equal(fence.exports.MATHML.STANDARD[fence.exports.MATHML.STANDARD.length - 1].trim().replace(/ /g, ''))

    await page.click('#clear')
    await page.evaluate(exported)
    await editorEl.evaluate(node => {
      node.editor.close()
        .then(() => {
          console.log('editor close')
        })
        .catch((e) => console.error(e))
      node.editor.configuration.recognitionParams.iink.export.mathml = { flavor: 'ms-office' }
    })

    // TODO
    // isInit = await isEditorInitialized(editorEl)
    // expect(isInit).to.equal(true)

    await playStrokes(page, fence.strokes, 100, 175)
    await page.evaluate(exported)
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(fence.strokes.length)
    mathml = await editorEl.evaluate(node => node.editor.model.exports['application/mathml+xml'])
    expect(mathml.trim().replace(/ /g, '')).to.equal(fence.exports.MATHML.MSOFFICE[fence.exports.MATHML.MSOFFICE.length - 1].trim().replace(/ /g, ''))
  })

  it('should test each label of strokes', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)
    for (const [index, strokes] of equation3.strokes.entries()) {
      await playStrokes(page, [strokes], 100, 100)
      await page.evaluate(exported)
      const latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
      expect(latex).to.equal(equation3.exports.LATEX[index])
    }
  })

  it('should test undo/redo with reconnect', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, equation3.strokes, 100, 100)
    await page.evaluate(exported)

    let jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)
    let latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])

    const clearClick = page.click('#clear')
    const exportedEvent = page.evaluate(exported)
    await Promise.all([clearClick, exportedEvent])
    const exports = await editorEl.evaluate(node => node.editor.model.exports)
    if (exports !== undefined) {
      expect(exports['application/x-latex']).to.equal('')
    }

    await editorEl.evaluate((node) => {
      node.editor.recognizer.close(node.editor.recognizerContext, node.editor.model)
        .then(() => console.log('socket closed'))
    })

    for (const strokes of equation3.strokes) {
      await playStrokes(page, [strokes], 100, 100)
      await page.evaluate(exported)
    }
    jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)
    latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])

    for (const [index] of equation3.strokes.entries()) {
      const undoElement = await page.waitForSelector('#undo')
      const disabled = await undoElement.evaluate(node => node.disabled)
      if (disabled) {
        const exports = await editorEl.evaluate(node => node.editor.model.exports)
        expect(exports).to.equal(undefined)
      } else {
        await undoElement.click()
        await page.evaluate(exported)
        jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
        latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
        expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length - index - 1)
      }
    }
  })
})
