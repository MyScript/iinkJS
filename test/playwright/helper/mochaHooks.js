const { chromium, webkit, firefox } = require('playwright')

exports.mochaHooks = {
  async beforeAll () {
    const browserName = process.env.BROWSER || 'firefox'
    let args = []
    if (browserName === 'chromium') {
      args = ['--shm-size=5gb', '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
    }
    global.browser = await { chromium, webkit, firefox }[browserName].launch({ headless: JSON.parse(process.env.HEADLESS), args })
    const context = await browser.newContext()
    global.page = await context.newPage()
    return Promise.resolve()
  },
  async beforeEach () {
    const exampleFilePath = this.currentTest.parent.title.split(':')[1]
    return await global.page.goto(`${process.env.LAUNCH_URL}/examples/${exampleFilePath}`)
  },
  async afterEach () {
    if (process.env.SCREEN_SHOT) {
      const [browserName, exampleFilePath] = this.currentTest.parent.title.split(':')
      return await global.page.screenshot({ fullPage: false, path: 'test/playwright/screenshots/' + browserName + '/' + exampleFilePath + '.png' })
    }
  },
  async afterAll () {
    return await global.browser.close()
  }
}
