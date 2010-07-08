//we probably have to have this only describing where the tests are
steal
 .plugins("jquery")
 .plugins("funcunit/synthetic")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("synthetic_test", "mouse_test", "key_test")