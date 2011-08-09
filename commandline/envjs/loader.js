// This code is always run ...

if (typeof FuncUnit == 'undefined') {
	FuncUnit = {};
}

steal('funcunit/commandline/print.js', 'steal/browser/drivers/envjs.js')
.then('funcunit/commandline/events.js')
.then(function(){
	Envjsloader = {};
	Envjsloader.load = function(page){
		Envjs.browser = new steal.browser.envjs({
			scriptTypes: {
				"text/javascript": true,
				"text/envjs": true,
				"": true
			},
			fireLoad: true,
			logLevel: 2,
			dontPrintUserAgent: true
		});
		
		Envjs.browser
			.bindEvents()
			.open(page);
	}
})