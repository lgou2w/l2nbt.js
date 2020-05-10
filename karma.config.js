const puppeteer = require('puppeteer').executablePath()
const webpackConfig = require('./webpack.config')

process.env.CHROME_BIN = puppeteer

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: ['test/**/*.spec.ts'],
    preprocessors: {
      '**/*.ts': ['webpack']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      stats: 'errors-only'
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    captureTimeout: 210000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout: 210000,
    browserNoActivityTimeout: 210000,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--headless',
          '--no-sandbox',
          '--disable-gpu',
          '--disable-translate',
          '--disable-extensions',
          '--remote-debugging-port=9222'
        ]
      }
    },
    singleRun: true,
    concurrency: Infinity
  })
}
