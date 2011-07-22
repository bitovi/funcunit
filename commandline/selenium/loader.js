// This code is always run ...

if (typeof FuncUnit == 'undefined') {
	FuncUnit = {};
}

load('funcunit/commandline/selenium/selenium_start.js');
load('funcunit/qunit/print.js');
(function(){
	
	var browser = 0, 
		failed = 0,
		passed = 0,
		pollForResults = function(){
			var resultJSON, 
				res,
				evt,
				keepPolling = true;
			resultJSON = FuncUnit.selenium.getEval("Selenium.getResult()");
			eval("res = "+resultJSON);
			if(res && res.length){
				for (var i = 0; i < res.length; i++) {
					evt = res[i];
					if (evt.type == "done") {
						keepPolling = false;
						browserDone(evt.data);
					}
					else {
						QUnitPrint[evt.type](evt.data)
					}
				}
			}
			if(keepPolling) {
				// keep polling
				java.lang.Thread.currentThread().sleep(400);
				pollForResults();
			}
		}, 
		browserStart = function(browser){
			QUnitPrint.browserStart(FuncUnit.browsers[browser]);
			FuncUnit.selenium = new DefaultSelenium(FuncUnit.serverHost, 
				FuncUnit.serverPort, 
				FuncUnit.browsers[browser], 
				FuncUnit.funcunitPage);
				
			FuncUnit.starttime = new Date().getTime();
			FuncUnit.selenium.start();
			
			FuncUnit.selenium.open(FuncUnit.funcunitPage);
			pollForResults();
		},
		browserDone = function(evt){
			failed += evt.failed;
			passed += evt.passed;
			FuncUnit.endtime = new Date().getTime();
			var formattedtime = (FuncUnit.endtime - FuncUnit.starttime) / 1000;
			QUnitPrint.browserDone(FuncUnit.browsers[browser], passed, failed)
			FuncUnit.selenium.close();
			FuncUnit.selenium.stop();
			browser++;
			if (browser < FuncUnit.browsers.length) {
				browserStart(browser)
			} 
			// kill the process and stop selenium
			else {
				QUnitPrint.done(passed, failed)
				FuncUnit.stopSelenium();
			}
		}
	
	/**
	 * Loads the FuncUnit page in EnvJS.  This loads FuncUnit, but we probably want settings 
	 * on it already ....
	 * 
	 * 2 ways to include settings.js:
	 * 1. Manually before funcunit.js 
	 * 2. FuncUnit.load will try to load settings.js if there hasn't been one loaded
	 */ 
	FuncUnit.load = function(page){
		
		//clear out steal ... you are done with it...
		var extend = steal.extend;
		steal = undefined;
		
		var dirArr = page.split("/"), 
			dir = dirArr.slice(0, dirArr.length - 1).join("/"), 
			settingsPath = dir + "/settings.js";
			
		// if settings.js was already loaded, don't try to load it again
		if (FuncUnit.browsers === undefined) {
			//this gets the global object, even in rhino
			var window = (function(){return this}).call(null), 
				backupFunc = window.FuncUnit;
			
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
			
			extend(FuncUnit, backupFunc)
			
			
		}
		// configuration defaults
		FuncUnit.serverHost = FuncUnit.serverHost || "localhost";
		FuncUnit.serverPort = FuncUnit.serverPort || 4444;
		
		if(!/http:|file:/.test(page)){ // if theres no protocol, turn it into a filesystem url
			var cwd = (new java.io.File (".")).getCanonicalPath();
			page = "file://"+cwd+"/"+page;
		}
		
		//convert spaces to %20.
		FuncUnit.funcunitPage = /http:/.test(page) ? page: page.replace(/ /g,"%20");
		if(!FuncUnit.browsers){
			if(FuncUnit.jmvcRoot)
				// run all browsers if you supply a jmvcRoot
				// this is because a jmvcRoot means you're not running from filesystem, 
				// so safari and chrome will work correctly 
				FuncUnit.browsers = ["*firefox", "*iexplore", "*safari", "*googlechrome"]
			else {
				FuncUnit.browsers = ["*firefox"]
				if(java.lang.System.getProperty("os.name").indexOf("Windows") != -1){
					FuncUnit.browsers.push("*iexplore")
				}
			}
		}
		
		FuncUnit.startSelenium();
		
		browserStart(browser, FuncUnit.funcunitPage)
	}
})()