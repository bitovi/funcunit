module("funcunit - jQuery API",{
	setup : function(){
		S.open("demo/myapp.html", null, 10000)
	}
})

test("Copy Test", function(){
		S("#typehere").type("javascriptmvc", function(){
			equals(S("#seewhatyoutyped").text(), "typed javascriptmvc","typing");
		})
		S("#copy").click(function(){
			equals(S("#seewhatyoutyped").text(), "copied javascriptmvc","copy");
			ok(S("#typehere").offset().top,"has values")
		})
		
})