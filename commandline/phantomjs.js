(function(){
	FuncUnit.loader.phantomjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = page
		FuncUnit.browser = new steal.browser.phantomjs({
			print: true
		});
		
		FuncUnit.browser
			.bindEvents()
			.open(FuncUnit.funcunitPage)
		// load the code that triggers steal.browser events
			.injectJS('funcunit/browser/events.js')
	}
})()
