import { after, before, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { playStrokes } from './helper';
import config from '../lib/configuration';

describe('[WS][Math]', () => {
  let init;
  let page;
  const mathConfig = config.getConfiguration('MATH', 'WEBSOCKET', 'V4', '', 'RAB');
  const math = mathConfig.inks
    .filter(ink => ['3times2'].includes(ink.name));

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
    await page.goto(`${process.env.LAUNCH_URL}/${mathConfig.componentPath}`);
  });

  it('should test recognition asset builder', async () => {
    const editorEl = await init();

    await playStrokes(page, math[0].strokes, 200, 200);

    await page.evaluate(`(async () => {
      return new Promise((resolve, reject) => {
        document.getElementById('editor').addEventListener('exported', (e) => {
          resolve('exported');
        });
      });
    })()`);

    const latex = await editorEl.evaluate(node => node.editor.model.exports['application/x-latex']);
    expect(latex).to.equal(math[0].exports.LATEX[math[0].exports.LATEX.length - 1]);
  });
});
