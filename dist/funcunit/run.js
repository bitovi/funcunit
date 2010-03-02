//load("steal\test\qfunctional\test\qfunctional\run_functional.js")

load('settings/selenium.js')

// load qfunctional
load('rhino/loader.js');
rhinoLoader(function(){
	load('jquery.js')
	load('funcunit.js')
	load('funcunit/test.js')
}, true);