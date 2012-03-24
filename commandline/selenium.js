steal('funcunit/selenium', function(){
	var getDefaultBrowser = function(){
		return "*firefox";
	}
	
	/**
	 * Loads the FuncUnit page in Selenium
	 */ 
	FuncUnit.loader.selenium = function(page, browser){
		FuncUnit.browserName = browser || getDefaultBrowser();
		
		// expose FuncUnit.browser so people can call close themselves
		FuncUnit.browser = new steal.browser.selenium({
			serverHost: FuncUnit.serverHost,
			serverPort: FuncUnit.serverPort
		});
		
		FuncUnit.bindEvents(FuncUnit.browser)
		FuncUnit.browser.open(page)
	}
})