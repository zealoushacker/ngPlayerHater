module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },
    jshint: {
      files: ['src/**/*.js', 'GruntFile.js', 'test/**/*.js'],
      options: {
        bitwise: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        indent: 2,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        nonew: true,
        plusplus: true,
        quotmark: true,
        undef: true,
        unused: true,
        trailing: true,
        strict: true,
        lastsemic: true,
        browser: true,
        devel: true,
        globals: {
          angular: false,
          expect: false,
          it: false,
          describe: false,
          module: false,
          beforeEach: false,
          inject: false
        }
      }
    }
  });
};