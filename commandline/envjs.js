(function(){
	FuncUnit.loader.envjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = FuncUnit._getPageUrl(page)
		FuncUnit.browser = new steal.browser.envjs();
		
		FuncUnit.browser
			.bindEvents()
			.open(FuncUnit.funcunitPage);
	}
})()
