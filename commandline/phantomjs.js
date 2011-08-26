(function(){
	FuncUnit.loader.phantomjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = page
		FuncUnit.browser = new steal.browser.phantomjs({
			print: true
		});
		
		FuncUnit.browser
			.bind('clientloaded', function(){
				this.injectJS('funcunit/browser/events.js')
			})
			.bindEvents()
			.open(FuncUnit.funcunitPage)
	}
})()
