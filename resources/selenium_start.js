steal(function(){
FuncUnit.startSelenium = function(){
	importClass(Packages.com.thoughtworks.selenium.DefaultSelenium);
	
	//first lets ping and make sure the server is up
	var addr = java.net.InetAddress.getByName(FuncUnit.serverHost)
	try {
		var s = new java.net.Socket(addr, FuncUnit.serverPort)
	} 
	catch (ex) {
		spawn(function(){
			if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
				runCommand("cmd", "/C", 'start "selenium" java -jar funcunit\\java\\selenium-server.jar')
			}
			else {
				runCommand("sh", "-c", "nohup ./steal/js -selenium > selenium.log  2> selenium.err &")
			}
		})

		var timeouts = 0;
		var pollSeleniumServer = function(){
			try {
				var s = new java.net.Socket(addr, FuncUnit.serverPort)
			} 
			catch (ex) {
				if (timeouts > 3) {
					print("Selenium is not running. Please use steal/js -selenium to start it.")
					quit();
				} else {
					timeouts++;
					setTimeout( pollSeleniumServer, 1000);
				}
			}					
		}
		setTimeout( pollSeleniumServer, 1000);
	}
}
})