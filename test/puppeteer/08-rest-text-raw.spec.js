import { after, before, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { playStrokes } from './helper'
import config from '../lib/configuration'

describe('[REST][Text]', () => {
  let page
  let init
  let changeLanguage
  const textConfig = config.getConfiguration('Raw Content', 'REST', 'V4')
  const text = textConfig.inks
    .filter(ink => ['rawContent_fr_FR'].includes(ink.name))

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

  it('should test raw content on rest text', async () => {
    const editorEl = await init()

    await playStrokes(page, text[0].strokes, 200, 200)

    await page.evaluate(exported)

    const jiix = await editorEl.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    const parsed = JSON.parse(JSON.stringify(jiix))
    expect(parsed.type).to.equal('Raw Content')
    expect(parsed.elements.length > 0).to.be.true

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

    expect(nonTextFound).to.be.true
    expect(textFound.length > 0).to.be.true
  })
})
