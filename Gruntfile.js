module.exports = function (grunt) {
    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        connect: {
            server: {
                options: {
                    livereload: true,
                    port: 8000,
                    hostname: '*',
                    keepalive: true
                }
            }
        }
    });


    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

    // Dev task.
    grunt.registerTask('dev', ['connect:server']);
};
