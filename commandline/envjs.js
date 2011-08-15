(function(){
	FuncUnit.loader.envjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = FuncUnit._getPageUrl(page)
		FuncUnit.browser = new steal.browser.envjs({
			fireLoad: true
		});
		
		FuncUnit.browser
			.bindEvents()
			.open(FuncUnit.funcunitPage);
	}
})()
