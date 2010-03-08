load('funcunit/test/funcunit/settings.js')
load('steal/rhino/loader.js');
rhinoLoader(function(){
    steal.plugins('funcunit/test/funcunit');
}, true);