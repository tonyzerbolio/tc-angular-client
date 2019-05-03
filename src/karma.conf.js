// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-phantomjs-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-spec-reporter')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage/client'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: true,
      combineBrowserReports: true,
      fixWebpackSourcePaths: true//,
      // thresholds: {
      //   statements: 80,
      //   lines: 80,
      //   branches: 80,
      //   functions: 80
      // }
    },
    reporters: ['coverage-istanbul','progress', 'kjhtml', 'spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS','PhantomJS_custom','ChromeHeadless','Chrome'],
    customLaunchers: {
      'PhantomJS_custom': {
        base: 'PhantomJS',
        options: {
          windowName: 'my-window',
          settings: {
            webSecurityEnabled: false
          },
        },
        flags: ['--load-images=true'],
        debug: true
      },
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--remote-debugging-port=9222',
        ]
      }
    },
    singleRun: true,
    restartOnFileChange: true,
    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
    }
  });
};
