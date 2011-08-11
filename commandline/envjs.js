// This code is always run ...

if (typeof FuncUnit == 'undefined') {
	FuncUnit = {};
}
if(!FuncUnit.loader){
	FuncUnit.loader = {};
}

steal('steal/browser/drivers/envjs.js')
.then('funcunit/commandline/utils.js')
.then(function(){
	FuncUnit.loader.envjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = FuncUnit._getPageUrl(page)
		FuncUnit.browser = new steal.browser.envjs({
			scriptTypes: {
				"text/javascript": true,
				"text/envjs": true,
				"": true
			},
			fireLoad: true,
			logLevel: 2,
			dontPrintUserAgent: true
		});
		
		FuncUnit.browser
			.bindEvents()
			.open(FuncUnit.funcunitPage);
	}
})