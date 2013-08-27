module("myapp",{
	setup: function(){
		F.open("demo/myapp.html")
	}
})

test("Copy Test", function(){
	F("#typehere").type("javascript1mvc[left][left][left]\b", function(){
		equals(F("#seewhatyoutyped").text(), "typed javascriptmvc","typing");
	})
	F("#copy").click(function(){
		equals(F("#seewhatyoutyped").text(), "copied javascriptmvc","copy");
	})
})

test("Drag Test", function(){
	F("#drag").drag("#drop", function(){
		equals(F("#drop").text(), "Drags 1", 'drag worked correctly')
	})
})