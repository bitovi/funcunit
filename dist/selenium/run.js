load('selenium/settings.js')
importClass(Packages.com.thoughtworks.selenium.DefaultSelenium);
		
//first lets ping and make sure the server is up
var addr = java.net.InetAddress.getByName(SeleniumDefaults.serverHost)
try {
	var s = new java.net.Socket(addr, SeleniumDefaults.serverPort)
} 
catch (ex) {
	spawn(function(){
		if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
			runCommand("cmd", "/C", "start java -jar selenium\\selenium-server.jar")
		}
		else {
			runCommand("sh", "-c", "nohup java -jar selenium/selenium-server.jar > selenium.log  2> selenium.err &")
		}
	})
}

load('selenium/env.js');
Envjs('funcunit.html', 
	{scriptTypes : {"text/javascript" : true,"text/envjs" : true}, 
	fireLoad: true, 
	logLevel: 2
});