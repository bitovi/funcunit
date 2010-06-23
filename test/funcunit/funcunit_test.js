module("funcunit test")
test("Copy Test", function(){

	S.open("test/myapp.html", null, 10000);
	
	S("#typehere").type("javascriptmvc")
	
	S("#seewhatyoutyped").text(function(val){
		equals(val, "typed javascriptmvc","typing");
	})
	
	S.wait(1000)
	
	S("#copy").click();
	
	S("#seewhatyoutyped").text(function(val){
		equals(val, "copied javascriptmvc","copy");
	})
	S("#typehere").offset(function(offset){
		ok(offset.top,"has values")
	})
})

test("drag test", function(){
	S("#drag").dragTo("#drop")
	S("#drop").waitHasClass("dropover", true)
	
	S("#drag").dragTo({ x: 500, y: 500 })
	S("#drop").waitHasClass("dropout", true)
	
	S.wait(2000)
	S("#drag").dragTo({ x: "+100", y: "-100" })
})