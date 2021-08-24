module.exports = {
  exit: false,
  recursive: true,
  spec: './test/playwright/*.spec.js',
  require: '.mocharc.e2e.env.js,./test/playwright/helper/mochaHooks.js',
  timeout: 30000,
  parallel: false,
  reporter: 'spec'
}