module.exports = function (config) {
  'use strict';

  config.set({
    basePath: '..',
    frameworks: ['jasmine'],
    files: [
      'lib/angular/angular.js',
      'lib/angular-mocks/angular-mocks.js',
      'src/**/*.js',
      'test/**/*.spec.js'
    ],
    reporters: ['dots'],
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome', 'Firefox']
  });
};
