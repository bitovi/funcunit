module("myapp",{
	setup : function(){
		S.open("demo/myapp.html")
	}
})

test("Copy Test", function(){
		S("#typehere").type("javascriptmvc", function(){
			equals(S("#seewhatyoutyped").text(), "typed javascriptmvc","typing");
		})
		S("#copy").click(function(){
			equals(S("#seewhatyoutyped").text(), "copied javascriptmvc","copy");
		})
		
})

test("Drag Test", function(){
	
})