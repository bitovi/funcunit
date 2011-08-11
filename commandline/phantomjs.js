(function(){
	FuncUnit.loader.phantomjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = FuncUnit._getPageUrl(page)
		FuncUnit.browser = new steal.browser.phantomjs();
		
		FuncUnit.browser
			.bindEvents()
			.open(FuncUnit.funcunitPage);
	}
})()
