//load("steal\test\qfunctional\test\qfunctional\run_functional.js")

load('funcunit/test/funcunit/settings.js')

// load qfunctional
load('steal/rhino/loader.js');
rhinoLoader(function(){
    steal.plugins('funcunit/test/funcunit');
}, true);