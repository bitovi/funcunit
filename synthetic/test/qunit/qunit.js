//we probably have to have this only describing where the tests are
steal
 .apps("jquery")
 .apps("funcunit/synthetic")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("synthetic_test")