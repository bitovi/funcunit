module("funcunit-prototype / scriptaculous drag",{
	setup: function() {
		F.open("//test/protodrag/myapp.html");
	}
})


test("Drag", function(){
	
	F("#drag").drag("#drop")
	F("#drop").text("Drags 1", 'drag worked correctly')
})