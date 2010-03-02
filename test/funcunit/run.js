//load("steal\test\qfunctional\test\qfunctional\run_functional.js")


if(_args[0] == "-standalone")
	load('funcunit/test/settings/standalone.js')
else
	load('funcunit/test/settings/separate.js')

// load qfunctional
load('steal/rhino/loader.js');
rhinoLoader(function(){
    steal.plugins('funcunit/test/funcunit');
}, true);