import puppeteer from 'puppeteer'

const globalVar = {
  browser: {}
}

exports.mochaHooks = {
  async beforeAll () {
    global.browser = await puppeteer.launch({
      executablePath: 'google-chrome-stable',
      args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    })
  },
  afterAll () {
    browser.close()

    global.browser = globalVar.browser
  }
}
