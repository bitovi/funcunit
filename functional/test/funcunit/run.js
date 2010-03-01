//load("steal\test\qfunctional\test\qfunctional\run_functional.js")



//load global selenium settings
load('funcunit/settings/selenium.js')

// load qfunctional
load('steal/rhino/loader.js');
rhinoLoader(function(){
    steal.plugins('funcunit/functional/test/funcunit');
}, true);