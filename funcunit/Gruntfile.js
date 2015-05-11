var npmUtils =require("steal/ext/npm-utils");
var isNpm = npmUtils.moduleName.isNpm;
var parseModuleName = npmUtils.moduleName.parse;

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('bower.json'),
		connect: {
			server: {
				options: {
					port: 8000,
					base: '.'
				}
			}
		},
		concat: {
			options: {
				banner: '/*\n * <%= pkg.title || pkg.name %> - <%= pkg.version %>\n * <%= pkg.homepage %>\n * Copyright (c) <%= new Date().getFullYear() %> <%= pkg.author.name %>\n * <%= new Date().toUTCString() %>\n * Licensed <%= pkg.licenses[0].type %> */\n\n'
			},

			dist: {
				files: [{
					src: ['dist/funcunit.js'], 
					dest: 'dist/funcunit.js'
				}]
			}
		},
		"steal-export": {
			dist: {
				system: {
					config: "package.json!npm"
				},
				options: {},
				outputs: {
					"+amd": {},
					"+cjs": {},
					"global": {
						modules: ["funcunit"],
						dest: __dirname + "/dist/funcunit.js",
						format: "global",
						normalize: function(depName) {
							if(isNpm(depName)) {
								var parsed = parseModuleName(depName);
								if(parsed.packageName === "jquery") {
									depName = parsed.packageName;
								} else {
									depName = parsed.packageName + "/" + parsed.modulePath;
								}
							}
							return depName;
						},
						ignore: ["jquery"],
						exports: {
							"jquery": "jQuery"
						}
					}
				}
			}
		},
		testee: {
			core: {
				options: {
					urls: ['http://localhost:8000/funcunit.html'],
					browsers: ['phantom']
				}
			},
			jasmine: {
				options: {
					urls: ['http://localhost:8000/browser/adapters/test/jasmine.html'],
					browsers: ['phantom']
				}
			},
			qunit: {
				options: {
					urls: ['http://localhost:8000/browser/adapters/test/qunit.html'],
					browsers: ['phantom']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('testee');
	grunt.loadNpmTasks("steal-tools");

	grunt.registerTask('build', ['steal-export', 'concat']);
	grunt.registerTask('test', ['connect', 'testee']);

};
