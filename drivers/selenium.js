steal("funcunit/resources/json.js").then(function(){
	
	// TODO: we should not do this if documenting ...
	if (navigator.userAgent.match(/Rhino/) && !window.DocumentJS && !(steal && steal.pluginify)) {

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
		(function(){
			var browser = 0,
				fails = 0,
				totals = 0;
			//convert spaces to %20.
			var location = /file:/.test(window.location.protocol) ? window.location.href.replace(/ /g,"%20") : window.location.href;
			
			
			FuncUnit.browserStart("*iexplore");
			
			FuncUnit.selenium = new DefaultSelenium(FuncUnit.serverHost, 
				FuncUnit.serverPort, 
				 "*iexplore", 
				location);
				
			FuncUnit.starttime = new Date().getTime();
			FuncUnit.selenium.start();
			FuncUnit.selenium.open('http://localhost:8000/funcunit/funcunit.html');
			var resultJSON, 
				res = {},
				foo;
			var pollForResults = function(){
				resultJSON = FuncUnit.selenium.getEval("Selenium.getResult()");
				eval("res = "+resultJSON);
				if(res && res.length){
					print(resultJSON)
				}
				if (resultJSON.indexOf("done") != -1) {
					FuncUnit.selenium.close();
					FuncUnit.selenium.stop();
					if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
						runCommand("cmd", "/C", 'taskkill /fi "Windowtitle eq selenium" > NUL')
						//quit()
					}
				}
				else {
					// keep polling
					setTimeout(arguments.callee, 300)
				}
			}
          	setTimeout(pollForResults, 300);
			
			
			
		})();
	}
});