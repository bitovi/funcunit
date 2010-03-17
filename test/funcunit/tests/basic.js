module("funcunit test")

test("Copy Test", function(){
    S.open("funcunit.html");
	S("h1").text(function(val){
		equals(val, "Welcome to JavaScriptMVC 3.0!","welcome text");
	})
})