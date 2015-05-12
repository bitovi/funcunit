// load('steal/build/pluginify/test/pluginify_test.js')
/**
 * Tests compressing a very basic page and one that is using steal
 */
load('steal/rhino/rhino.js')
steal('steal/test','steal/build', 'steal/build/pluginify', function( s ) {
	
	
	STEALPRINT = false;
	s.test.module("steal/build/pluginify")
	
	s.test.test("other types", function(t){
		s.build.pluginify("steal/build/pluginify/test/app",{
			nojquery: true,
			nocanjs: true,
			out: "steal/build/pluginify/test/app/app.plugin.js"
		})
		s.test.clear();
		s.build.open("steal/build/pluginify/test/app/app_with_plugin.html", function(opener){
			
		});
		
		s.test.wait("APP_ON");
		s.test.ok(true, "APP_ON exists")
		s.test.clear();
		s.test.remove('steal/build/pluginify/test/app/app.plugin.js');
		s.test.remove('steal/build/pluginify/test/app/app.plugin.css')
	});
	
	s.test.test("getFunctions", function(t){
		
		var js = readFile('steal/build/pluginify/test/test_steals.js');
		var firstFunc = s.build.pluginify.getFunction(js, 0);
		
		t.equals(firstFunc, readFile('steal/build/pluginify/test/firstFunc.js'));
		
		var secondFunc = s.build.pluginify.getFunction(js, 1);
		
		t.equals(secondFunc, readFile('steal/build/pluginify/test/secondFunc.js'))
		
	})
	s.test.test("getFunctions2", function(t){
		
		var js = readFile('jquery/view/micro/micro.js');
		var firstFunc = s.build.pluginify.getFunction(js, 0);
		//print(firstFunc);
	})

	s.test.test("parse", function(t){
		var js = readFile('jquery/class/class.js');
		var tokens = js.tokens('=<>!+-*&|/%^', '=<>&|');
		
		var js = readFile('jquery/view/ejs/ejs.js');
		var tokens = js.tokens('=<>!+-*&|/%^', '=<>&|');
		
		var js = readFile('jquery/lang/vector/vector.js');
		var tokens = js.tokens('=<>!+-*&|/%^', '=<>&|');
		
		var js = readFile('jquery/dom/fixture/fixture.js');
		var tokens = js.tokens('=<>!+-*&|/%^', '=<>&|');
		
		var js = readFile('jquery/view/view.js');
		var tokens = js.tokens('=<>!+-*&|/%^', '=<>&|');
		
		var js = readFile('jquery/lang/json/json.js');
		var tokens = js.tokens('=<>!+-*&|/%^', '=<>&|');
		
		js = readFile('steal/build/pluginify/test/weirdRegexps.js');
		var tokens = js.tokens('=<>!+-*&|/%^', '=<>&|');
		
	});
	
	s.test.test("pluginify function", function(t){
		s.build.pluginify("can/control",{
			exclude: ["jquery"],
			shim: {"jquery":"$"},
			out: "steal/build/pluginify/test/controller.js"
		})
		s.test.clear();
		s.build.open("steal/build/pluginify/test/controller.html", function(opener){
			
		})
		
		s.test.wait("can.Control");
		s.test.ok(true, "can.Control exists")
		s.test.clear();
	})
});