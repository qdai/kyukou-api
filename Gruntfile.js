var path = require('path');

module.exports = function (grunt) {
  'use strict';

  grunt.util.linefeed = '\n';

  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: 'public/lib',
          layout: 'byComponent',
          install: true,
          verbose: true,
          cleanTargetDir: true,
          cleanBowerDir: false
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'public/js/admin.js': 'public/js/admin.js',
          'public/js/app.js': 'public/js/app.js',
          'public/js/status.js': 'public/js/status.js'
        }
      }
    }
  });

  grunt.registerTask('buildjs', 'build amd js', function () {
    var config = {
      SITE_URL: require('./settings/site').url
    };
    var src = 'src';
    var dist = 'public/js';
    var files = ['app.js', 'status.js', 'admin.js'];

    var reConfig = [];
    var file, key;
    for (var i = 0; i < files.length; i++) {
      file = grunt.file.read(path.join(src, files[i]));
      for (key in config) {
        file = file.replace(new RegExp('\\$\\$' + key + '\\$\\$', 'g'), config[key]);
      }
      grunt.file.write(path.join(dist, files[i]), file);
      grunt.log.writeln('build: ' + files[i]);
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['bower', 'buildjs', 'uglify']);
  grunt.registerTask('default', ['build']);
};
