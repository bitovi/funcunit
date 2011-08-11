// This code is always run ...

if (typeof FuncUnit == 'undefined') {
	FuncUnit = {};
}
if(!FuncUnit.loader){
	FuncUnit.loader = {};
}

steal('steal/browser/drivers/phantomjs.js')
.then('funcunit/commandline/utils.js')
.then(function(){
	
	/**
	 * Loads the FuncUnit page in Selenium
	 */ 
	FuncUnit.loader.phantomjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = FuncUnit._getPageUrl(page)
		
		// expose FuncUnit.browser so people can call close themselves
		FuncUnit.browser = new steal.browser.phantomjs();
		
		FuncUnit.browser
			// bind all the events (has to happen before we open the page)
			.bindEvents()
//			.open(FuncUnit.funcunitPage);
	}
})