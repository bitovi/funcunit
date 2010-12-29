load('steal/rhino/steal.js')

/**
 * Build syn, funcunit, user-extensions
 */
steal.File('funcunit/synthetic/dist').mkdir()
steal('//steal/build/pluginify/pluginify', function(s){
	steal.build.pluginify("funcunit/synthetic",{
		global: "true",
		nojquery: true,
		destination: "funcunit/synthetic/dist/syn.js"
	})
})
// add drag/drop

var copyToDist = function(path){
	var fileNameArr = path.split("/"),
		fileName = fileNameArr[fileNameArr.length - 1];
	print("copying to "+fileName)
	steal.File(path).copyTo("funcunit/synthetic/resources/"+fileName);
}
var filesToCopy = [
	"funcunit/resources/jquery.js",
	"jquery/dist/jquery.event.drag.js",
	"jquery/dist/jquery.event.drop.js"
]

for(var i = 0; i < filesToCopy.length; i++) {
	copyToDist(filesToCopy[i])
}