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
				'jquery/jquery.js' : 'lib/jquery/jquery.js',
				'funcunit/': '',
				'src/': 'lib/syn/src/',
				'syn/': 'lib/syn/src/'
			}
		},
		shim: {
			'jquery': {
				'exports': 'jQuery'
			},
			'syn': {
				'exports': 'Syn'
			}
		}
	}
	, shim: { 'jquery/jquery.js': 'jQuery' }
}, function(error, content) {
	fs.exists('build', function(exists) {
		if(!exists) {
			fs.mkdir('build');
		};

		fs.writeFile(__dirname + '/build/funcunit.js', content);
	});
});