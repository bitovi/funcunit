var fileName = _args[0], 
	basePath = _args[1] || "";

if (!fileName || fileName.indexOf(".html") == -1) {
	print("Usage: envjs myapp/funcunit.html");
	quit();
}

load(basePath+'selenium/env.js');
load(basePath+'settings.js')
importClass(Packages.com.thoughtworks.selenium.DefaultSelenium);
		
//first lets ping and make sure the server is up
var addr = java.net.InetAddress.getByName(FuncUnit.serverHost || "localhost")
try {
	var s = new java.net.Socket(addr, FuncUnit.serverPort || 4444)
} 
catch (ex) {
	spawn(function(){
		if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
			runCommand("cmd", "/C", 'start "selenium" java -jar '+
				basePath.replace("/", "\\")+
				'selenium\\selenium-server.jar')
		}
		else {
			runCommand("sh", "-c", "nohup java -jar selenium/selenium-server.jar > selenium.log  2> selenium.err &")
		}
	})
}

Envjs(fileName, {
	scriptTypes: {
		"text/javascript": true,
		"text/envjs": true
	},
	fireLoad: true,
	logLevel: 2
});