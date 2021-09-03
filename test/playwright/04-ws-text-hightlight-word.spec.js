const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes, findValuesByKey } = require('./helper')

const { helloHowDecoHighlighted } = require('../lib/inksDatas')

describe(`${process.env.BROWSER}:v4/websocket_text_highlight_words.html`, () => {
  it('should check text decorations', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    let plainText = ''
    for (const [index, strokes] of helloHowDecoHighlighted.strokes.entries()) {
      await playStrokes(page, [strokes], 100, 100)
      await page.evaluate(exported)
      plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
      expect(plainText).to.equal(helloHowDecoHighlighted.exports.TEXT[index])
    }

    const smartguide = await page.waitForSelector('.smartguide')
    const randomString = await smartguide.evaluate(node => node.id.replace('smartguide', ''))

    await page.click(`#ellipsis${randomString}`)
    await page.click(`#convert${randomString}`)

    plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
    expect(plainText).to.equal(helloHowDecoHighlighted.exports.TEXT[helloHowDecoHighlighted.exports.TEXT.length - 1])

    const jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])

    const spanList = findValuesByKey(jiix, 'spans')
    expect(spanList.length).to.equal(2)
    const span0 = spanList[0]
    expect(span0['first-char']).to.equal(0)
    expect(span0['last-char']).to.equal(4)
    expect(span0.class).to.equal('text')

    const span1 = spanList[1]
    expect(span1['first-char']).to.equal(6)
    expect(span1['last-char']).to.equal(8)
    if (helloHowDecoHighlighted.name.includes('Highlighted')) {
      expect(span1.class).to.equal('text text-highlight')
    } else {
      expect(span1.class).to.equal('text text-emphasis1')
    }
  })
})
