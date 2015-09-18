module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      version: '<%= pkg.version %>',
      banner: '// Backbone.AdvancedRouter v<%= meta.version %>\n'
    },

    preprocess: {
      advancedRouter: {
        src: 'src/wrapper.js',
        dest: 'dist/backbone.advanced-router.js'
      }
    },

    template: {
      options: {
        data: {
          version: '<%= meta.version %>'
        }
      },
      advancedRouter: {
        src: '<%= preprocess.advancedRouter.dest %>',
        dest: '<%= preprocess.advancedRouter.dest %>'
      }
    },

    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      advancedRouter: {
        src: '<%= preprocess.advancedRouter.dest %>',
        dest: '<%= preprocess.advancedRouter.dest %>'
      }
    },

    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      advancedRouter: {
        src: '<%= preprocess.advancedRouter.dest %>',
        dest: 'dist/backbone.advanced-router.min.js',
        options: {
          sourceMap: true
        }
      }
    }
  });

  grunt.registerTask('build', 'Build the library', [
    'preprocess',
    'template',
    'concat',
    'uglify'
  ]);
};
