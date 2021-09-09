const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes } = require('./helper')

const { rawContentFr } = require('../lib/inksDatas')

describe(`${process.env.BROWSER}:v4/rest/rest_raw_content_iink`, () => {
  it('should test raw content on rest text', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, rawContentFr.strokes, 200, 200)
    await page.evaluate(exported)

    const jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    const parsed = JSON.parse(JSON.stringify(jiix))

    expect(parsed.type).to.equal('Raw Content')
    expect(parsed.elements.length > 0).to.equal(true)

    let nonTextFound = false
    let textFound = ''
    parsed.elements.forEach((element) => {
      if (element.type === 'Raw Content' && element.kind === 'non-text') {
        nonTextFound = true
      }
      if (element.type === 'Text') {
        textFound = element.label
      }
    })

    expect(nonTextFound).to.equal(true)
    expect(textFound.length > 0).to.equal(true)
  })
})
