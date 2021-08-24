const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes } = require('./helper')
const { one } = require('../lib/inksDatas')

describe(`${process.env.BROWSER}:v4/import_math_jiix`, () => {
  it('should test import', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, one.strokes, 100, 100)
    await page.evaluate(exported)

    const latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(one.exports.LATEX[one.exports.LATEX.length - 1])

    const editorEl2 = await page.waitForSelector('#editor2')
    const isInit2 = await isEditorInitialized(editorEl2)
    expect(isInit2).to.equal(true)

    await page.click('#import')
    await page.evaluate(`(async () => {
      return new Promise((resolve, reject) => {
        document.getElementById('editor2').addEventListener('exported', (e) => {
          resolve('exported');
        });
      });
    })()`)

    const jiix = await editorEl2.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    const jiixParsed = JSON.parse(jiix)
    expect(one.exports.LATEX[one.exports.LATEX.length - 1]).to.equal(jiixParsed.expressions[0].label)
  })
})
