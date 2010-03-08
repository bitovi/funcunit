load('funcunit/settings.js')
load('rhino/env.js');
Envjs('funcunit/test.html', 
	{scriptTypes : {"text/javascript" : true,"text/envjs" : true}, 
	fireLoad: true, 
	logLevel: 2
});