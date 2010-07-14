module("funcunit-syn integration")


test("Type and slow Click", function(){
	S.open("test/myapp.html", null, 10000);
	
	S("#typehere").type("javascriptmvc")
	
	//make sure it looks right
	S("#seewhatyoutyped").text(function(val){
		equals(val, "typed javascriptmvc","typing");
	})
	
	//click is going to run slow, to make sure we don't continue
	//until after it is done.
	S("#copy").click();
	
	S("#seewhatyoutyped").text(function(val){
		equals(val, "copied javascriptmvc","copy");
	})
	//S("#typehere").offset(function(offset){
	//	ok(offset.top,"has values")
	//})
})

test("Move To", function(){
	S.open("test/drag.html", null, 10000);
	S("#start").moveTo("#end")
	S("#typer").type("javascriptmvc")
	S("#typer").val(function(val){
		equals(val, "javascriptmvc","move test worked correctly");
	})
})

test("Drag To", function(){
	S.open("test/drag.html", null, 10000);
	S("#drag").dragTo("#drop")
	S("#clicker").click()
	S(".status").text(function(txt){
		equals(txt, "dragged", 'drag worked correctly')
	})
})