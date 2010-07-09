load('steal/file/file.js')

var i, fileName, cmd;


var plugin, fileDest, fileName;
plugin = "funcunit/synthetic";
fileName = "syn.js";
fileDest = "funcunit/dist/"+fileName
cmd = "js steal/scripts/pluginify.js "+plugin+" -destination "+fileDest+" -noJQuery";
runCommand(	"cmd", "/C", cmd)
print("***"+fileName+" pluginified")

plugin = "funcunit";
fileName = "funcunit.js";
fileDest = "funcunit/dist/scripts/"+fileName
cmd = "js steal/scripts/pluginify.js "+plugin+" -destination "+fileDest;
runCommand(	"cmd", "/C", cmd)
print("***"+fileName+" pluginified")