import puppeteer from 'puppeteer';
import { after, before } from 'mocha';

const globalVar = {
  browser: {}
};

before(async () => {
  global.browser = await puppeteer.launch({
    executablePath: 'google-chrome-stable',
    args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
});

after(() => {
  browser.close();

  global.browser = globalVar.browser;
});
