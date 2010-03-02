rhinoLoader = function( func, fireLoad){
	rhinoLoader.callback =func;
    load('rhino/env.rhino.js');
	Envjs('rhino/empty.html', 
		{scriptTypes : {"text/javascript" : true,"text/envjs" : true}, 
		fireLoad: fireLoad, 
		logLevel: 2
	});
}



