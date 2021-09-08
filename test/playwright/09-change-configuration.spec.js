const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes, getStrokesFromJIIX } = require('./helper')

const { hello, equation3 } = require('../lib/inksDatas')

async function openCard (title) {
  return await page.click(`text=${title}`)
}

describe(`${process.env.BROWSER}:non-version-specific/change_configuration.html`, () => {
  it('should test default configuration', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, hello.strokes, 0, 0)
    await page.evaluate(exported)

    // expect(await page.inputValue('#server-scheme')).to.equal('https')
    // expect(await page.inputValue('#server-host')).to.equal('webdemoapi.myscript.com')
    expect(await page.inputValue('#recognition-type')).to.equal('TEXT')
    expect(await page.inputValue('#recognition-type')).to.equal('TEXT')
    expect(await page.inputValue('#recognition-protocol')).to.equal('WEBSOCKET')
    expect(await page.inputValue('#iink-language')).to.equal('en_US')
    expect(await page.isChecked('#iink-smartGuide')).to.equal(true)
    expect(await page.isChecked('#iink-guides')).to.equal(true)
    expect(await page.inputValue('#triggers-delay')).to.equal('2000')
    expect(await page.inputValue('#triggers-exportContent')).to.equal('POINTER_UP')

    const plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
    expect(plainText).to.equal(hello.exports.TEXT[hello.exports.TEXT.length - 1])
  })

  it('should test WEBSOCKET MATH config', async () => {
    let editorEl = await page.waitForSelector('#editor')
    let isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await openCard('Recognition params')
    await page.selectOption('#recognition-type', 'MATH')

    expect(await page.inputValue('#recognition-type')).to.equal('MATH')
    expect(await page.inputValue('#recognition-protocol')).to.equal('WEBSOCKET')
    expect(await page.inputValue('#iink-language')).to.equal('en_US')
    expect(await page.isChecked('#iink-smartGuide')).to.equal(true)
    expect(await page.isChecked('#iink-guides')).to.equal(true)
    expect(await page.inputValue('#triggers-delay')).to.equal('2000')
    expect(await page.inputValue('#triggers-exportContent')).to.equal('POINTER_UP')

    await page.click('#valid-btn')

    editorEl = await page.waitForSelector('#editor')
    isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, equation3.strokes, 0, 0)
    await page.evaluate(exported)

    const jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    expect(getStrokesFromJIIX(jiix).length).to.equal(equation3.strokes.length)

    const latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation3.exports.LATEX[equation3.exports.LATEX.length - 1])
  })
})
