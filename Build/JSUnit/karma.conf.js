'use strict';

const fs = require('fs')
const globImport = require('rollup-plugin-glob-import');

/**
 * Karma configuration
 */

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'Build/JSUnit/Globals.js' },
      { pattern: 'Build/JSUnit/Helper.js' },
      { pattern: 'Build/JSUnit/TestSetup.js', watched: false },
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'Build/JSUnit/TestSetup.js': ['coverage', 'rollup'],
    },


    rollupPreprocessor: {
      /**
       * This is just a normal Rollup config object,
       * except that `input` is handled for you.
       */
      plugins: [
        globImport({}),
        {
          name: 'resolve-modules',
          resolveId: (source, test, foo) => {
            const map = {
              'lit': 'lit/index',
              'lit-html': 'lit-html/lit-html',
              'lit-element': 'lit-element/lit-element',
              '@lit/reactive-element': '@lit/reactive-element/reactive-element',
            };

            if (source in map) {
              source = map[source];
            }

            if (source.startsWith('TYPO3/CMS')) {
              const parts = source.substr(10).split('/');
              const extension = parts.shift().split(/(?=[A-Z])/).join('_').toLowerCase();
              const path = parts.join('/');
              const fullPath = `typo3/sysext/${extension}/Resources/Public/JavaScript/${path}`;

              return {id: fullPath}
            }

            let contribPath = `typo3/sysext/core/Resources/Public/JavaScript/Contrib/${source}.js`;
            if (fs.existsSync(contribPath)) {
              return {id: contribPath}
            }

            contribPath = `typo3/sysext/core/Resources/Public/JavaScript/Contrib/${source}`;
            if (fs.existsSync(contribPath)) {
              return {id: contribPath}
            }

            return null
          }
        }
      ],
      output: {
        format: 'iife',
        name: 'TYPO3TestBundle',
        sourcemap: 'inline',
        inlineDynamicImports: true,
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'coverage', 'junit'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'junit', 'coverage'],

    junitReporter: {
      outputDir: 'typo3temp/var/tests/',
      useBrowserName: false,
      outputFile: 'karma.junit.xml'
    },

    coverageReporter: {
      reporters: [
        {type: 'clover', dir: 'typo3temp', subdir: 'var/tests', file: 'karma.clover.xml'}
      ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Firefox', 'Chrome', 'Safari', 'PhantomJS', 'Opera', 'IE'],
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
};
