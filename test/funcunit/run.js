load('funcunit/test/funcunit/settings.js')
load('steal/rhino/env.js');
Envjs('funcunit/funcunit_tests.html', 
	{scriptTypes : {"text/javascript" : true,"text/envjs" : true}, 
	fireLoad: true, 
	logLevel: 2
});