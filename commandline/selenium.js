steal('funcunit/selenium', './utils.js', function(){
	var getDefaultBrowsers = function(){
		var browsers;
		if(FuncUnit.jmvcRoot)
			// run all browsers if you supply a jmvcRoot
			// this is because a jmvcRoot means you're not running from filesystem, 
			// so safari and chrome will work correctly 
			browsers = ["*firefox", "*iexplore", "*safari", "*googlechrome"]
		else {
			browsers = ["*firefox"]
			if(java.lang.System.getProperty("os.name").indexOf("Windows") != -1){
				browsers.push("*iexplore")
			}
		}
		return browsers;
	}
	
	/**
	 * Loads the FuncUnit page in Selenium
	 */ 
	FuncUnit.loader.selenium = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = FuncUnit._getPageUrl(page)
		FuncUnit.browsers = FuncUnit.browsers || getDefaultBrowsers();
		
		// expose FuncUnit.browser so people can call close themselves
		FuncUnit.browser = new steal.browser.selenium({
			serverHost: FuncUnit.serverHost,
			serverPort: FuncUnit.serverPort
		});
		
		FuncUnit.browser
			// bind all the events (has to happen before we open the page)
			.bindEvents()
			.bind('clientloaded', function(){
				this.injectJS('funcunit/browser/events.js')
				this.evaluate(function(){
					$.holdReady(false);
				})
			})
			.open(FuncUnit.funcunitPage, FuncUnit.browsers)
	}
})