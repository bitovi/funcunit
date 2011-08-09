// used to 'run' a funcunit/envjs command:
load(java.lang.System.getProperty("basepath")+"../steal/rhino/utils.js")
load('steal/rhino/rhino.js');
steal('funcunit/commandline/envjs/loader.js', function(){
	Envjsloader.load(_args.shift())
})