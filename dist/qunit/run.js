load('rhino/env.rhino.js');
Envjs('qunit/test.html', 
	{scriptTypes : {"text/javascript" : true,"text/envjs" : true}, 
	fireLoad: true, 
	logLevel: 2
});
