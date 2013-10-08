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
				'funcunit/': '',
				'syn/syn.js': 'lib/syn/dist/syn.js'
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
	},
	shim: { 'jquery/jquery.js': 'jQuery', 'syn/syn.js': 'Syn' }
}, function(error, content) {
	fs.exists('build', function(exists) {
		if(!exists) {
			fs.mkdir('build');
		};

		fs.writeFile(__dirname + '/build/funcunit.js', content);
	});
});