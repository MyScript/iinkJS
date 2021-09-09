const playwright = require('playwright')

exports.mochaHooks = {
  async beforeAll () {
    const browserType = process.env.BROWSER || 'chromium'
    let args = []
    if (browserType === 'chromium') {
      args = ['--shm-size=5gb', '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
    }
    global.browser = await playwright[browserType].launch({ headless: JSON.parse(process.env.HEADLESS), args })
    const context = await browser.newContext()
    global.page = await context.newPage()
    return Promise.resolve()
  },
  async beforeEach () {
    const url = this.currentTest.parent.title.split(':')[1]
    return await global.page.goto(`${process.env.LAUNCH_URL}/examples/${url}.html`)
  },
  // async afterEach () {
  //   return await global.page.screenshot({ fullPage: false, path: 'test/e2e/screenshots/' + this.currentTest.fullTitle() + '.png' })
  // },
  async afterAll () {
    return await global.browser.close()
  }
}
