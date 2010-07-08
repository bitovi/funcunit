load('steal/file/file.js')

var i, fileName, cmd;


var plugin, exclude, fileDest, fileName;
plugin = "synthetic";
exclude = [];
fileName = null;
if (typeof plugin != "string") {
	fileName = plugin.fileName;
	exclude = plugin.exclude || [];
	plugin = plugin.plugin;
}
fileName = plugin+".js";
fileDest = "funcunit/dist/"+fileName
cmd = "js steal/scripts/pluginify.js funcunit/"+plugin+" -destination "+fileDest+" -noJQuery";
runCommand(	"cmd", "/C", cmd)
print("***"+fileName+" pluginified")
