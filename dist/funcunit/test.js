module("funcunit test")

test("Copy Test", function(){
        S.open("myapp.html", null, 10000);
        
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