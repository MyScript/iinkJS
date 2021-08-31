const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes } = require('./helper')

const { rabText } = require('../lib/inksDatas')

describe(`${process.env.BROWSER}:v4/websocket_text_custom_lexicon.html`, () => {
  it('should test recognition asset builder lexicon', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await page.waitForSelector('#lexicon')
    await page.type('#lexicon', 'covfefe')
    await page.click('#reinit')
    await playStrokes(page, rabText.strokes, 100, 100)
    await page.evaluate(exported)

    const prompterText = await page.waitForSelector('.prompter-text')
    const textContent = await prompterText.evaluate(node => node.textContent)
    expect(textContent).to.equal(rabText.exports.TEXT[0])
  })
})
