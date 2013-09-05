module.exports = function (config) {
  'use strict';

  config.set({
    basePath: '..',
    frameworks: ['jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/**/*.js',
      'test/**/*.spec.js'
    ],
    reporters: ['dots'],
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome', 'Firefox']
  });
};
