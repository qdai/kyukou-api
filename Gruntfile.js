module.exports = function (grunt) {
  'use strict';

  if (process.env.OPENSHIFT_REPO_DIR) {
    var trgDir = process.env.OPENSHIFT_REPO_DIR + '/public/lib';
  } else {
    var trgDir = './public/lib';
  }

  grunt.util.linefeed = '\n';

  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: trgDir,
          layout: 'byComponent',
          install: true,
          verbose: true,
          cleanTargetDir: true,
          cleanBowerDir: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');

  grunt.registerTask('default', ['bower']);
};
