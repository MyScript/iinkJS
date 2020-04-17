import { after, before, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { playStrokes, findValuesByKey } from './helper'
import config from '../lib/configuration'

describe('[WS][Text]', () => {
  let page
  let init
  const textConfig = config.getConfiguration('TEXT', 'WEBSOCKET', 'V4', '', 'Decoration')
  const text = textConfig.inks
    .filter(ink => ink.name.includes('helloHowDeco'))

  const exported = `(async () => {
    return new Promise((resolve, reject) => {
      document.getElementById('editor').addEventListener('exported', (e) => {
        resolve('exported');
      });
    });
  })()`

  before(async () => {
    page = await browser.newPage()

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

  it('should check text decorations', async () => {
    let plainText = ''
    const editorEl = await init()

    for (const [index, strokes] of text[0].strokes.entries()) {
      await playStrokes(page, [strokes], 100, 100)

      await page.evaluate(exported)

      plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
      expect(plainText).to.equal(text[0].exports.TEXT[index])
    }

    await page.waitFor('.smartguide')
    const smartguide = await page.$('.smartguide')
    const randomString = await smartguide.evaluate(node => node.id.replace('smartguide', ''))

    await page.click(`#ellipsis${randomString}`)
    await page.click(`#convert${randomString}`)

    plainText = await editorEl.evaluate(node => node.editor.model.exports['text/plain'])
    expect(plainText).to.equal(text[0].exports.TEXT[text[0].exports.TEXT.length - 1])

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
    if (text[0].name.includes('Highlighted')) {
      expect(span1.class).to.equal('text text-highlight')
    } else {
      expect(span1.class).to.equal('text text-emphasis1')
    }
  })
})
