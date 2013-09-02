var pluginify = require('steal').build.pluginify;
var fs = require('fs');

pluginify('funcunit.js', {
	ignore: [/lib/],
	wrapper: '!function(window) {\n<%= content %>\n\n' +
		'}(window);',
	steal: {
		root: __dirname,
		map: {
			'*': {
				'jquery/jquery.js' : 'lib/jquery/jquery.js',
				'funcunit/': ''
			}
		},
		shim: {
			'jquery/jquery.js': {
				'exports': 'jQuery'
			}
		},
	}
}, function(error, content) {
	fs.exists('dist', function(exists) {
		if(!exists) {
			fs.mkdir('dist');
		};

		fs.writeFile(__dirname + '/dist/funcunit.js', content);
	});
});