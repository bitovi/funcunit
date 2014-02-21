var pluginify = require('steal').build.pluginify;
var fs = require('fs');

pluginify('funcunit.js', {
	// ignore: [/lib/],
	wrapper: '!function(window) {\n<%= content %>\n\n' +
		'}(window);',
	steal: {
		root: __dirname,
		map: {
			'*': {
                "jquery/jquery.js": "jquery",
                "basejquery/basejquery.js": "basejquery",
				'funcunit/': '',
				'src/': 'lib/syn/src/',
				'syn/': 'lib/syn/src/',
				"basejquery": "lib/jquery/dist/jquery.js",
                "jquery": "browser/jquery.js"
			}
		},
        shim: {
            basejquery: {
                exports: "jQuery"
            }
        }
	}
}, function(error, content) {
	fs.exists('build', function(exists) {
		if(!exists) {
			fs.mkdir('build');
		};

		fs.writeFile(__dirname + '/build/funcunit.js', content);
	});
});
