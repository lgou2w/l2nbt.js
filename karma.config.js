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
    logLevel: config.LOG_WARN,
    autoWatch: false,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true,
    concurrency: Infinity
  })
}
