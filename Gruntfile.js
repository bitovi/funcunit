module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		connect: {
			server: {
				options: {
					port: 8000,
					base: '.'
				}
			}
		},
		exec: {
			pluginify: {
				command: 'node build.js'
			}
		},
		concat: {
			options: {
				banner: '/*\n * <%= pkg.title || pkg.name %> - <%= pkg.version %>\n * <%= pkg.homepage %>\n * Copyright (c) <%= new Date().getFullYear() %> <%= pkg.author.name %>\n * <%= new Date().toUTCString() %>\n * Licensed <%= pkg.licenses[0].type %> */\n\n'
			},

			dist: {
				files: [{
					expand: true,
					cwd: 'build/',
					src: ['*'],
					dest: 'dist/'
				}]
			}
		},
		testee: {
			src: {
				options: {
					urls: ['http://localhost:8000/funcunit.html'],
					browsers: ['phantom']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('testee');

	grunt.registerTask('build', ['exec:pluginify', 'concat']);
	grunt.registerTask('test', ['connect', 'testee']);

};
