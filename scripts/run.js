var fileName = _args[0], 
	basePath = _args[1] || "";

if (!fileName || fileName.indexOf(".html") == -1) {
	print("Usage: funcunit/envjs myapp/funcunit.html");
	quit();
}

load(basePath+'../steal/rhino/env.js');
load(basePath+'settings.js')

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
}

FuncUnit.basePath = basePath;

Envjs(fileName, {
	scriptTypes: {
		"text/javascript": true,
		"text/envjs": true
	},
	fireLoad: true,
	logLevel: 2
});