import { after, before, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { playStrokes } from './helper'
import config from '../lib/configuration'

describe('[WS][Text]', () => {
  let init
  let page
  const textConfig = config.getConfiguration('TEXT', 'WEBSOCKET', 'V4', '', 'RAB')
  const text = textConfig.inks
    .filter(ink => ['rabText'].includes(ink.name))

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

  it('should test recognition asset builder lexicon', async () => {
    await init()

    await page.waitFor('#lexicon')
    await page.type('#lexicon', 'covfefe')
    await page.click('#reinit')

    await playStrokes(page, text[0].strokes, 100, 100)

    await page.evaluate(`(async () => {
      return new Promise((resolve, reject) => {
        document.getElementById('editor').addEventListener('exported', (e) => {
          resolve('exported');
        });
      });
    })()`)

    const prompterText = await page.$('.prompter-text')
    const textContent = await prompterText.evaluate(node => node.textContent)
    expect(textContent).to.equal(text[0].exports.TEXT[0])
  })
})
