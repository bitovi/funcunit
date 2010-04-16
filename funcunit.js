load('steal/rhino/env.js');

(function(){
	Funcunit = function(){}
	Funcunit.runTest = function(pageLoc){
		Envjs(pageLoc, {
			scriptTypes: {
				"text/javascript": true,
				"text/envjs": true
			},
			fireLoad: true,
			logLevel: 2
		});
	}
})();