const webpackConfig = require('./webpack.config')

process.env.CHROME_BIN = process.env.CHROME_BIN || require('puppeteer').executablePath()

console.info('Chrome bin:', process.env.CHROME_BIN)

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
    plugins: [
      require('karma-chrome-launcher'),
      require('karma-mocha'),
      require('karma-webpack')
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    captureTimeout: 120000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout: 120000,
    browserNoActivityTimeout: 120000,
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
