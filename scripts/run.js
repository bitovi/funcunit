var fileName = _args[0]

if (!fileName || fileName.indexOf(".html") == -1) {
	print("Usage: funcunit/envjs myapp/funcunit.html");
	quit();
}

load('steal/rhino/env.js');

var dirArr = fileName.split("/"),
	dir = dirArr.slice(0, dirArr.length-1).join("/"),
	settingsPath = dir + "/settings.js";

// try to load a local settings
var foundSettings = true;
try {
	readUrl(settingsPath)
} catch(e){
	foundSettings = false;
}
if(foundSettings){
	load(settingsPath)
} else {
	load('settings.js')
}

var path = new java.io.File(".").getCanonicalPath();
if(!FuncUnit.browserURL)
	FuncUnit.browserURL = "file:///"+path.replace("\\", "/")+"/"+fileName;
Envjs(fileName, {
	scriptTypes: {
		"text/javascript": true,
		"text/envjs": true
	},
	fireLoad: true,
	logLevel: 2
});