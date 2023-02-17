const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes } = require('./helper')

const { bigText } = require('../lib/inksDatas')

describe(`${process.env.BROWSER}:v4/websocket_text_iink_no_guides.html`, () => {
  it('should get the correct number of strokes', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, bigText.strokes, 100, 100)
    await page.evaluate(exported)

    const nbStrokes = bigText.strokes.length
    const modelLocator = await page.locator('(//*[@data-layer="MODEL"])')
    const pathModelLocator = await modelLocator.locator('path')
    expect(await pathModelLocator.count()).to.equal(nbStrokes)
  }).timeout(90000)
})
