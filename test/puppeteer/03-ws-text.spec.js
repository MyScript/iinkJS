import { after, before, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { playStrokes, getStrokesFromJIIX } from './helper';
import config from '../lib/configuration';

describe('[WS][Text]', () => {
  let page;
  let init;
  const textConfig = config.getConfiguration('TEXT', 'WEBSOCKET', 'V4');
  const text = textConfig.inks
    .filter(ink => ['hello', 'helloHow'].includes(ink.name));

  const exported = `(async () => {
    return new Promise((resolve, reject) => {
      document.getElementById('editor').addEventListener('exported', (e) => {
        resolve('exported');
      });
    });
  })()`;

  before(async () => {
    page = await browser.newPage();

    init = async () => {
      await page.waitFor('#editor');
      const editorEl = await page.$('#editor');
      await editorEl.evaluate(node => node.editor.recognizerContext.initPromise);
      const initialized = await editorEl.evaluate(node => node.editor.initialized);
      expect(initialized).to.be.true;
      return editorEl;
    };
  });

  after(async () => {
    await page.close();
  });

  beforeEach(async () => {
    await page.goto(`${process.env.LAUNCH_URL}/${textConfig.componentPath}`);
  });

  it('should check smartguide', async () => {
    await init();

    await playStrokes(page, text[0].strokes, 100, 100);
    await page.evaluate(exported);

    await page.waitFor('.smartguide');
    const smartguide = await page.$('.smartguide');
    const randomString = await smartguide.evaluate(node => node.id.replace('smartguide', ''));

    const prompterText = await page.$('.prompter-text');
    let textContent = await prompterText.evaluate(node => node.textContent);
    const labelsWithNbsp = text[0].exports.TEXT[text[0].exports.TEXT.length - 1]
      .replace(/\s/g, '\u00A0');
    expect(labelsWithNbsp).to.equal(textContent);

    await page.click(`#ellipsis${randomString}`);
    await page.click(`#convert${randomString}`);

    await page.evaluate(exported);

    textContent = await prompterText.evaluate(node => node.textContent);
    expect(labelsWithNbsp).to.equal(textContent);

    const words = labelsWithNbsp.toString().split('\u00A0');
    // a random word in the smartGuide
    const wordIdx = Math.floor(Math.random() * words.length);
    await page.click('#word-' + (wordIdx * 2) + randomString);

    await page.waitFor(`#candidates${randomString}`);
    const candidates = await page.$(`#candidates${randomString}`);
    const nbCand = await candidates.evaluate(node => node.getElementsByTagName('span').length);

    // a random candidate in the smartGuide
    const candIdx = Math.floor(Math.random() * nbCand);
    const candidateEl = await page.$(`#cdt-${candIdx}${randomString}`);
    const candidateTextContent = await candidateEl.evaluate(node => node.textContent);

    await page.click(`#cdt-${candIdx}${randomString}`);
    await page.evaluate(exported);

    textContent = await prompterText.evaluate(node => node.textContent);
    expect(textContent).to.equal(candidateTextContent);
  });
});
