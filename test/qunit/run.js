load('steal/rhino/env.js');
Envjs('funcunit/test/qunit/test.html', {
	scriptTypes : {"text/javascript" : true,"text/envjs" : true}, 
	fireLoad: true, 
	logLevel: 2
});
