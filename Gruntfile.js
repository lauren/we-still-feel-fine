module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! We Still Feel Fine Client JS v<%= pkg.version %> | Copyright 2013 Lauren Sperber https://github.com/lauren/node-connect-four/blob/master/LICENSE | <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      my_target: {
        files: {
          'public/js/<%= pkg.name %>.min.js': ['client-src/js/<%= pkg.name %>.js'],
        }
      }
    },
    less: {
      production: {
        options: {
          compress: true
        },
        files: {
          "public/css/<%= pkg.name %>.css": "client-src/less/<%= pkg.name %>.less"
        }
      }
    },
    watch: {
      js: {
        files: ['*.js', 'client-src/js/*.js', 'lib/*.js'],
        tasks: ['jshint', 'uglify'],
      },
      less: {
        files: ['client-src/*/*.less'],
        tasks: ['less'],
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'client-src/js/*.js', '*.js', 'lib/*.js'],
      options: {
        laxbreak: true,
        force: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

};