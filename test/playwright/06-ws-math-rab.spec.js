const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes } = require('./helper')

const equation = require('../lib/inksDatas')['3times2']

describe(`${process.env.BROWSER}:v4/custom_resources_content_math`, () => {
  it('should test recognition asset builder', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, equation.strokes, 200, 200)
    await page.evaluate(exported)

    const latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(equation.exports.LATEX[equation.exports.LATEX.length - 1])
  })
})
