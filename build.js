load('steal/rhino/steal.js')

steal('//steal/build/pluginify', function(s){
	steal.pluginify("funcunit/synthetic",{
		nojquery: true,
		destination: "funcunit/dist/syn.js"
	})
	
	steal.pluginify("funcunit",{
		nojquery: true,
		destination: "funcunit/dist/funcunit.js",
		packagejquery: true
	})
})

var i, fileName, cmd;

// copy qunit, json, and jquery
steal.File("funcunit/qunit/qunit.css").copyTo("funcunit/dist/qunit.css")
steal.File("jquery/lang/json/json.js").copyTo("funcunit/resources/json.js")

// make user-extensions.js

// read: wrapped, jQuery, json, syn
var userFiles = 
		["funcunit/java/extensions/fakesteal.js", 
		"funcunit/resources/jquery.js", 
		"funcunit/java/extensions/wrapped.js", 
		"funcunit/resources/json.js", 
		"funcunit/dist/syn.js"],
	fileText, 
	userExtensionsText = "";
for(var i=0; i<userFiles.length; i++){
	fileText = readFile(userFiles[i]);
	userExtensionsText += fileText+"\n";
	print("appending "+userFiles[i])
}
steal.File("funcunit/java/user-extensions.js").save(userExtensionsText);
print("saved user-extensions.js")

// copy jars and env
steal.File("funcunit/java/selenium-server-standalone-2.0a5.jar").copyTo("funcunit/dist/selenium/selenium-server-standalone-2.0a5.jar")
steal.File("funcunit/java/selenium-java-client-driver.jar").copyTo("funcunit/dist/selenium/selenium-java-client-driver.jar")
steal.File("steal/rhino/js.jar").copyTo("funcunit/dist/selenium/js.jar")
steal.File("steal/rhino/env.js").copyTo("funcunit/dist/selenium/env.js")
	
print('FuncUnit is built')
