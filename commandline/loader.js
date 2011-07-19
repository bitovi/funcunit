// This code is always run ...

if (typeof FuncUnit == 'undefined') {
	FuncUnit = {};
}

load('funcunit/commandline/json.js');
load('funcunit/commandline/selenium_start.js');
(function(){
	var qunitEvents = {
		testStart: function(data){
			print("--" + data.name + "--")
		},
		log: function(data){
			if (!data.message) 
				data.message = ""
			print((data.result ? "  PASS " : "  FAIL ") + data.message)
		},
		testDone: function(data){
			print("  done - fail " + data.failed + ", pass " + data.passed + "\n")
		},
		moduleStart: function(data){
			print("MODULE " + data.name + "\n")
		},
		moduleDone: function(data){
		
		},
		browserStart : function(name){
			print("BROWSER " + name + " ===== \n")
		},
		browserDone : function(data){
			print("\n"+data.name+" DONE " + data.failed + ", " + data.passed + (FuncUnit.showTimestamps? (' - ' 
						+ formattedtime + ' seconds'): ""))
		},
		done: function(data){
			print("\nALL DONE - fail " + data.failed + ", pass " + data.passed)
		}
	};
	
	var browser = 0, 
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
						browserDone(evt);
					}
					else {
						qunitEvents[evt.type](evt);
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
			qunitEvents.browserStart(FuncUnit.browsers[browser]);
			FuncUnit.selenium = new DefaultSelenium(FuncUnit.serverHost, 
				FuncUnit.serverPort, 
				FuncUnit.browsers[browser], 
				FuncUnit.funcunitPage);
				
			FuncUnit.starttime = new Date().getTime();
			FuncUnit.selenium.start();
			
			// TODO don't hard code this, get the right path
			FuncUnit.selenium.open(FuncUnit.funcunitPage);
			pollForResults();
		},
		browserDone = function(evt){
			FuncUnit.endtime = new Date().getTime();
			var formattedtime = (FuncUnit.endtime - FuncUnit.starttime) / 1000;
			evt.name = FuncUnit.browsers[browser];
			qunitEvents.browserDone(evt)
			FuncUnit.selenium.close();
			FuncUnit.selenium.stop();
			browser++;
			if (browser < FuncUnit.browsers.length) {
				browserStart(browser)
			} 
			// kill the process and stop selenium
			else {
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
		
		//convert spaces to %20.
		// TODO figure out the filesystem path using java cwd plus page relative path
		// TODO also remove the spaces and whatever after the path (look in old funcunit)
//		var location = /file:/.test(window.location.protocol) ? window.location.href.replace(/ /g,"%20") : window.location.href;
//		var location = /http:/.test(page) ? page: "file:///opt/local/share/java/tomcat6/webapps/jmvc31/funcunit/funcunit.html";
		
		FuncUnit.funcunitPage = "file:///opt/local/share/java/tomcat6/webapps/jmvc31/funcunit/funcunit.html";
		browserStart(browser, FuncUnit.funcunitPage)
		
	}
})()