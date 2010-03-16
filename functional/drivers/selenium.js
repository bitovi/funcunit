steal.plugin("jquery").then(function(){
	if (navigator.userAgent.match(/Rhino/) && window.SeleniumBrowsers && !window.build_in_progress) {
		importClass(Packages.com.thoughtworks.selenium.DefaultSelenium);
		
		//first lets ping and make sure the server is up
		var addr = java.net.InetAddress.getByName(SeleniumDefaults.serverHost)
		try {
			var s = new java.net.Socket(addr, SeleniumDefaults.serverPort)
		} 
		catch (ex) {
			spawn(function(){
				if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
					runCommand("cmd", "/C", 'start "selenium" java -jar funcunit\\dist\\selenium\\selenium\\selenium-server.jar')
				}
				else {
					runCommand("sh", "-c", "nohup ./steal/js -selenium > selenium.log  2> selenium.err &")
				}
			})
			java.lang.Thread.sleep(1000);
			try {
				var s = new java.net.Socket(addr, SeleniumDefaults.serverPort)
			} 
			catch (ex) {
				print("Selenium is not running. Please use steal/js -selenium to start it.")
				quit();
			}
		}


		(function(){
			var browser = 0;
			
			QUnit.done = function(failures, total){
				S.selenium.stop();
				S.endtime = new Date().getTime();
				var formattedtime = (S.endtime - S.starttime) / 1000;
				print("\nALL DONE " + failures + ", " + total + ' - ' + formattedtime + ' seconds')
				browser++;
				if (browser < SeleniumBrowsers.length) {
					print("\nSTARTING " + SeleniumBrowsers[browser])
					S.selenium = new DefaultSelenium(SeleniumDefaults.serverHost, SeleniumDefaults.serverPort, SeleniumBrowsers[browser], SeleniumDefaults.browserURL);
					S.starttime = new Date().getTime();
					S.selenium.start();
					QUnit.restart();
				} else {
					if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
						runCommand("cmd", "/C", 'taskkill /fi "Windowtitle eq selenium"')
					}
					quit();
				}
			}
			
			
			print("\nSTARTING " + SeleniumBrowsers[0])
			S.selenium = new DefaultSelenium(SeleniumDefaults.serverHost, SeleniumDefaults.serverPort, SeleniumBrowsers[0], SeleniumDefaults.browserURL);
			S.starttime = new Date().getTime();
			S.selenium.start();
			S._open = function(url){
				this.selenium.open(url);
			};
			S._onload = function(success, error){
				setTimeout(function(){
					S.selenium.getEval("selenium.browserbot.getCurrentWindow().focus();selenium.browserbot.getCurrentWindow().document.documentElement.tabIndex = 0;");
					success();
				}, 1000)
			};
			var convertToJson = function(arg){
				return arg === S.window ? "selenium.browserbot.getCurrentWindow()" : jQuery.toJSON(arg)
				
			}
			S.prompt = function(answer){
				this.selenium.answerOnNextPrompt(answer);
			}
			S.confirm = function(answer){
				if(answer)
					this.selenium.chooseOkOnNextConfirmation();
				else
					this.selenium.chooseCancelOnNextConfirmation();
			}
			S.$ = function(selector, context, method){
				var args = S.makeArray(arguments);
				for (var a = 0; a < args.length; a++) {
					if (a == 1) { //context
						if (args[a] == S.window.document) {
							args[a] = "_doc()"
						}
						else 
							if (typeof args[a] == "number") {
								args[a] = "_win()[" + args[a] + "].document"
							}
							else 
								if (typeof args[a] == "string") {
									args[a] = "_win()['" + args[a] + "'].document"
								}
					}
					else 
						args[a] = convertToJson(args[a]);
				}
				var response = S.selenium.getEval("jQuery.wrapped(" + args.join(',') + ")");
				return eval("(" + response + ")")//  q[method].apply(q, args);
			}
			
			
			
		})();
	}
});