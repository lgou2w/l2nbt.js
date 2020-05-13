process.env.CHROME_BIN = process.env.CHROME_BIN || require('puppeteer').executablePath()

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'src/**/*.ts',
      'test/**/*.ts'
    ],
    reporters: ['progress', 'karma-typescript', 'coverage'],
    preprocessors: {
      'src/**/*.ts': ['karma-typescript', 'coverage'],
      'test/**/*.ts': ['karma-typescript']
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'json', subdir: '.', file: 'coverage.json' },
        { type: 'cobertura', subdir: '.', file: 'cobertura.xml' },
        { type: 'html' }
      ]
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    plugins: [
      require('karma-chrome-launcher'),
      require('karma-mocha'),
      require('karma-typescript'),
      require('karma-coverage')
    ],
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
