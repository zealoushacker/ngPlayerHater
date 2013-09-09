module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['bower:install', 'test']);
  grunt.registerTask('test', ['bower:install', 'jshint', 'karma:unit']);
  grunt.registerTask('build', 'builds packaged version of script into dist', function (target) {
    if (typeof target !== 'undefined') {
      grunt.task.run('concat:' + target, 'uglify:' + target);
    } else {
      grunt.task.run('build:debug', 'build:min');
    }
  });

  var karmaOpts = {
    configFile: 'test/karma.conf.js',
    singleRun: true
  };

  if (process.env.TRAVIS) {
    karmaOpts.browsers = ['Firefox', 'PhantomJS'];
    karmaOpts.reporters = ['dots'];
  }
  
  /*jshint camelcase: false */
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: 'bower.json'
    },
    concat:  {
      options: {
        separator: ';'
      },
      min: {
        src: ['lib/soundmanager/script/soundmanager2-nodebug-jsmin.js', 'tmp/<%= pkg.name %>-<%= pkg.version %>.js'],
        dest: 'tmp/<%= pkg.name %>-<%= pkg.version %>.packaged.js'
      },
      debug: {
        options: {
          banner: '/**\n*\n' + grunt.file.read('./src/BANNER').replace(/^/gm, '* ') + '\n*/',
          separator: ';'
        },
        src: ['src/**/*.js'],
        dest: 'tmp/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        compress: {
          unsafe: true,
          global_defs: {
            DEBUG: false
          }
        },
        mangle: true
      },
      debug: {
        options: {
          mangle: false,
          compress: {
            sequences: false,
            properties: true,
            dead_code: true,
            conditionals: true,
            comparisons: false,
            booleans: false,
            loops: false,
            unused: false,
            hoist_funs: false,
            hoist_vars: false,
            if_return: false,
            join_vars: false,
            cascade: false,
            side_effects: false,
            warnings: true,
            global_defs: {
              DEBUG: true
            }
          },
          beautify: {
            indent_level: 2,
            comments: true,
            beautify: true
          },
          preserveComments: true
        },
        files: {
          'ng-player-hater.js': ['tmp/<%= pkg.name %>-<%= pkg.version %>.js']
        }
      },
      min: {
        files: {
          'ng-player-hater.min.js': ['tmp/<%= pkg.name %>-<%= pkg.version %>.packaged.js']
        }
      }
    },
    karma: {
      unit: karmaOpts
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
        lastsemic: true,
        browser: true,
        devel: true,
        strict: true,
        globals: {
          angular: false,
          expect: false,
          it: false,
          describe: false,
          module: false,
          beforeEach: false,
          inject: false,
          DEBUG: true,
          spyOn: false,
          jasmine: true,
          process: false,
          spyOnInjection: false
        }
      }
    }
  });
};