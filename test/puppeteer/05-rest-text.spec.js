import { after, before, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { playStrokes } from './helper'
import config from '../lib/configuration'

describe('[REST][Text]', () => {
  let page
  let init
  const textConfig = config.getConfiguration('TEXT', 'REST', 'V4')
  const text = textConfig.inks
    .filter(ink => ['hellov4rest'].includes(ink.name))

  const exported = `(async () => {
    return new Promise((resolve, reject) => {
      document.getElementById('editor').addEventListener('exported', (e) => {
        resolve('exported');
      });
    });
  })()`

  before(async () => {
    page = await browser.newPage()

    page.on('console', (msg) => {
      for (let i = 0; i < msg.args.length; ++i) {
        console.log(`${i}: ${msg.args[i]}`)
      }
    })

    init = async () => {
      await page.waitFor('#editor')
      const editorEl = await page.$('#editor')
      await editorEl.evaluate(node => node.editor.recognizerContext.initPromise)
      const initialized = await editorEl.evaluate(node => node.editor.initialized)
      expect(initialized).to.be.true
      return editorEl
    }
  })

  after(async () => {
    await page.close()
  })

  beforeEach(async () => {
    await page.goto(`${process.env.LAUNCH_URL}/${textConfig.componentPath}`)
  })

  it('should test labels', async () => {
    let plainText = ''
    const editorEl = await init()

    for (const [index, strokes] of text[0].strokes.entries()) {
      await playStrokes(page, [strokes], 100, 100)

      await page.evaluate(exported)

      plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
      expect(plainText).to.equal(text[0].exports.TEXT[index])
    }

    plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
    expect(plainText).to.equal(text[0].exports.TEXT[text[0].exports.TEXT.length - 1])
  })

  it('should test undo/redo with REST', async () => {
    const editorEl = await init()

    await playStrokes(page, text[0].strokes, 100, 100)

    await page.evaluate(exported)

    let raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(text[0].strokes.length)
    const plain = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
    expect(plain).to.equal(text[0].exports.TEXT[text[0].exports.TEXT.length - 1])

    const clearClick = page.click('#clear')
    let exportedEvent = page.evaluate(exported)

    await Promise.all([clearClick, exportedEvent])

    const exports = await editorEl.evaluate(node => node.editor.model.exports)
    expect(exports).to.be.undefined

    let undoClick = page.click('#undo')
    exportedEvent = page.evaluate(exported)
    await Promise.all([undoClick, exportedEvent])

    raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(text[0].strokes.length)

    undoClick = page.click('#undo')
    exportedEvent = page.evaluate(exported)
    await Promise.all([undoClick, exportedEvent])

    raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(text[0].strokes.length - 1)

    undoClick = page.click('#undo')
    exportedEvent = page.evaluate(exported)
    await Promise.all([undoClick, exportedEvent])

    raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(text[0].strokes.length - 2)

    undoClick = page.click('#redo')
    exportedEvent = page.evaluate(exported)
    await Promise.all([undoClick, exportedEvent])

    raw = await editorEl.evaluate(node => node.editor.model.rawStrokes)
    expect(raw.length).to.equal(text[0].strokes.length - 1)
  })
})
