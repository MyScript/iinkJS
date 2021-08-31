const { expect } = require('chai')
const { exported, isEditorInitialized, playStrokes } = require('./helper')

const { hellov4rest } = require('../lib/inksDatas')

describe(`${process.env.BROWSER}:v4/rest_text_iink.html`, () => {
  it('should test labels', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    let plainText = ''
    for (const strokes of hellov4rest.strokes) {
      await playStrokes(page, [strokes], 100, 100)
      await page.evaluate(exported)
      plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
      // expect(plainText).to.equal(hellov4rest.exports.TEXT[index])
    }

    plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
    expect(plainText).to.equal(hellov4rest.exports.TEXT[hellov4rest.exports.TEXT.length - 1])
  })

  it('should test undo/redo with REST', async () => {
    const editorEl = await page.waitForSelector('#editor')
    const isInit = await isEditorInitialized(editorEl)
    expect(isInit).to.equal(true)

    await playStrokes(page, hellov4rest.strokes, 100, 100)
    await page.evaluate(exported)

    let raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(hellov4rest.strokes.length)
    const plain = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
    expect(plain).to.equal(hellov4rest.exports.TEXT[hellov4rest.exports.TEXT.length - 1])

    const clearClick = page.click('#clear')
    let exportedEvent = page.evaluate(exported)
    await Promise.all([clearClick, exportedEvent])
    const exports = await editorEl.evaluate(node => node.editor.model.exports)
    expect(exports).to.equal(undefined)

    let undoClick = page.click('#undo')
    exportedEvent = page.evaluate(exported)
    await Promise.all([undoClick, exportedEvent])
    raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(hellov4rest.strokes.length)

    undoClick = page.click('#undo')
    exportedEvent = page.evaluate(exported)
    await Promise.all([undoClick, exportedEvent])
    raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(hellov4rest.strokes.length - 1)

    undoClick = page.click('#undo')
    exportedEvent = page.evaluate(exported)
    await Promise.all([undoClick, exportedEvent])
    raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(hellov4rest.strokes.length - 2)

    undoClick = page.click('#redo')
    exportedEvent = page.evaluate(exported)
    await Promise.all([undoClick, exportedEvent])
    raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(hellov4rest.strokes.length - 1)
  })
})
