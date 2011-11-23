steal("funcunit/qunit")
.then("funcunit/coverage/parse").then(function(){

module("parse");
// 127.0.0.1:8020/jmvc/funcunit/funcunit.html?steal[startFiles]=funcunit/coverage/parse/parse.js
test("parse testing works", function(){
	steal("funcunit/coverage/parse/test/tabs_test.js", function(){
		
	})
});

})