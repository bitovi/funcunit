// This code is always run ...

load('steal/rhino/env.js');
(function(){
	Envjsloader = {};
	Envjsloader.load = function(page){
		
		//clear out steal ... you are done with it...
		var extend = steal.extend;
		steal = undefined;
		Envjs(page, {
			scriptTypes: {
				"text/javascript": true,
				"text/envjs": true,
				"": true
			},
			fireLoad: true,
			logLevel: 2,
			dontPrintUserAgent: true
		});
	}
})()