module("funcunit-prototype / scriptaculous drag",{
	setup: function() {
		S.open("//test/protodrag/myapp.html");
	}
})


test("Drag", function(){
	
	S("#drag").drag("#drop")
	S("#drop").text("Drags 1", 'drag worked correctly')
})