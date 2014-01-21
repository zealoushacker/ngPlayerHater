module.exports = function (config) {
  'use strict';

  config.set({
    basePath: '..',
    frameworks: ['jasmine'],
    files: [
      'lib/angular/angular.js',
      'lib/angular-mocks/angular-mocks.js',
      'lib/soundmanager/script/soundmanager2.js',
      'test/spec_helper.js',
      'src/**/*.js',
      'test/**/*.spec.js'
    ],
    preprocessors: {
      'src/**/*.js': 'coverage'
    },
    reporters: ['progress', 'coverage', 'osx'],
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome', 'PhantomJS']
  });
};
