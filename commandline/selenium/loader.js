// This code is always run ...

if (typeof FuncUnit == 'undefined') {
	FuncUnit = {};
}

steal('funcunit/commandline/print.js', 'steal/browser/drivers/selenium.js')
.then('funcunit/commandline/events.js')
.then(function(){
		
	/**
	 * 2 ways to include settings.js:
	 * 1. Manually before funcunit.js 
	 * 2. FuncUnit.load will try to load settings.js if there hasn't been one loaded
	 */
	var loadSettingsFile = function(page){
		var dirArr = page.split("/"), 
			dir = dirArr.slice(0, dirArr.length - 1).join("/"), 
			settingsPath = dir + "/settings.js";
			
		// if settings.js was already loaded, don't try to load it again
		if (FuncUnit.browsers === undefined) {
			var backupFunc = FuncUnit;
			
			if(readFile('funcunit/settings.js')){
				load('funcunit/settings.js')
			}
			
			// try to load a local settings
			var foundSettings = false;
			if(/^http/.test(settingsPath)){
				try {
					readUrl(settingsPath)
					foundSettings = true;
				} 
				catch (e) {}
			}else{
				if(readFile(settingsPath)){
					foundSettings = true;
				}

			}
			
			if (foundSettings) {
				print("Reading Settings From "+settingsPath)
				load(settingsPath)
			}else{
				print("Using Default Settings")
			}
			
			steal.extend(FuncUnit, backupFunc)
			
		}
	}
	
	var getPageUrl = function(page){
		if(!/http:|file:/.test(page)){ // if theres no protocol, turn it into a filesystem url
			var cwd = (new java.io.File (".")).getCanonicalPath();
			page = "file://"+cwd+"/"+page;
		}
		
		//convert spaces to %20.
		var newPage = /http:/.test(page) ? page: page.replace(/ /g,"%20");
		
		// add a ?browser=selenium
		// TODO make this add a param, not hijack it (in case there are already params passed)
		newPage += "?browser=selenium"
		return newPage;
	}
	
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
	 * Loads the FuncUnit page in EnvJS.  This loads FuncUnit, but we probably want settings 
	 * on it already ....
	 */ 
	FuncUnit.load = function(page){
		loadSettingsFile(page)
		FuncUnit.funcunitPage = getPageUrl(page)
		FuncUnit.browsers = FuncUnit.browsers || getDefaultBrowsers();
		
		// expose FuncUnit.browser so people can call close themselves
		FuncUnit.browser = new steal.browser.selenium({
			serverHost: FuncUnit.serverHost,
			serverPort: FuncUnit.serverPort,
			serverDomain: FuncUnit.funcunitPage
		});
		
		FuncUnit.browser
			// bind all the events (has to happen before we open the page)
			.bindEvents()
			.open(FuncUnit.funcunitPage, FuncUnit.browsers);
	}
})