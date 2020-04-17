import { after, before, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { playStrokes } from './helper'
import config from '../lib/configuration'

describe('[WS][Math] - Import', () => {
  let page
  let init
  const mathConfig = config.getConfiguration('MATH', 'WEBSOCKET', 'V4', '', 'Import')
  const one = mathConfig.inks
    .filter(ink => ['one'].includes(ink.name))

  const exported = `(async () => {
    return new Promise((resolve, reject) => {
      document.getElementById('editor').addEventListener('exported', (e) => {
        resolve('exported');
      });
    });
  })()`

  before(async () => {
    page = await browser.newPage()
  })

  after(async () => {
    await page.close()
  })

  beforeEach(async () => {
    await page.goto(`${process.env.LAUNCH_URL}/${mathConfig.componentPath}`)
  })

  it('should test import', async () => {
    await page.waitFor('#editor')
    const editorEl = await page.$('#editor')
    await editorEl.evaluate(node => node.editor.recognizerContext.initPromise)
    let initialized = await editorEl.evaluate(node => node.editor.initialized)
    expect(initialized).to.be.true

    await playStrokes(page, one[0].strokes, 100, 100)

    await page.evaluate(exported)

    const latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex'])
    expect(latex).to.equal(one[0].exports.LATEX[one[0].exports.LATEX.length - 1])

    const editorEl2 = await page.$('#editor2')
    await editorEl2.evaluate(node => node.editor.recognizerContext.initPromise)
    initialized = await editorEl2.evaluate(node => node.editor.initialized)
    expect(initialized).to.be.true

    await page.click('#import')
    await page.evaluate(`(async () => {
      return new Promise((resolve, reject) => {
        document.getElementById('editor2').addEventListener('exported', (e) => {
          resolve('exported');
        });
      });
    })()`)

    const jiix = await editorEl2.evaluate(node => node.editor.model.exports['application/vnd.myscript.jiix'])
    const jiixParsed = JSON.parse(jiix)
    expect(one[0].exports.LATEX[one[0].exports.LATEX.length - 1]).to.equal(jiixParsed.expressions[0].label)
  })
})
