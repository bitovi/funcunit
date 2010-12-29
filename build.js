load('steal/rhino/steal.js')

load('funcunit/synthetic/build.js')

steal.File('funcunit/dist').mkdir()
steal.File('funcunit/dist/funcunit').mkdir()
steal.File('funcunit/dist/funcunit/java').mkdir()
steal.File('funcunit/dist/funcunit/qunit').mkdir()
steal.File('funcunit/dist/funcunit/scripts').mkdir()
steal.File('funcunit/dist/steal').mkdir()
steal.File('funcunit/dist/steal/rhino').mkdir()
/**
 * Build funcunit, user-extensions
 */
steal('//steal/build/pluginify/pluginify', function(s){
	steal.build.pluginify("funcunit",{
		global: "true",
		destination: "funcunit/dist/funcunit/funcunit.js",
		packagejquery: true
	})
})

var i, fileName, cmd;

// copy qunit, json, and jquery
steal.File("jquery/lang/json/json.js").copyTo("funcunit/resources/json.js")

// read: wrapped, jQuery, json, syn
var userFiles = 
		["funcunit/java/extensions/fakesteal.js", 
		"funcunit/resources/jquery.js", 
		"funcunit/java/extensions/wrapped.js", 
		"funcunit/resources/json.js", 
		"funcunit/synthetic/dist/syn.js",
		"funcunit/resources/selector.js"],
	fileText, 
	userExtensionsText = "";
for(var i=0; i<userFiles.length; i++){
	fileText = readFile(userFiles[i]);
	userExtensionsText += fileText+"\n";
	print("appending "+userFiles[i])
}
steal.File("funcunit/java/user-extensions.js").save(userExtensionsText);
print("saved user-extensions.js")

/**
 * Build the standalone funcunit
 */
var copyToDist = function(path){
	steal.File(path).copyTo("funcunit/dist/"+path)
}
var filesToCopy = [
	"funcunit/qunit/qunit.css",
	"funcunit/java/selenium-server-standalone-2.0a5.jar",
	"funcunit/java/selenium-java-client-driver.jar",
	"funcunit/java/user-extensions.js",
	"funcunit/scripts/run.js",
	"steal/rhino/js.jar",
	"steal/rhino/env.js",
	"steal/rhino/loader.bat",
	"steal/rhino/loader",
	"funcunit/envjs",
	"funcunit/envjs.bat",
	"funcunit/settings.js",
	"funcunit/loader.js",
	"steal/rhino/steal.js",
	"steal/rhino/utils.js",
	"steal/rhino/file.js"
]

for(var i = 0; i < filesToCopy.length; i++) {
	copyToDist(filesToCopy[i])
}

print('FuncUnit is built')