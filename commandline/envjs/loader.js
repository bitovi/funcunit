// This code is always run ...

if (typeof FuncUnit == 'undefined') {
	FuncUnit = {};
}

steal('steal/browser/drivers/envjs.js')
.then('funcunit/commandline/utils.js')
.then(function(){
	Envjsloader = {};
	Envjsloader.load = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = FuncUnit._getPageUrl(page)
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