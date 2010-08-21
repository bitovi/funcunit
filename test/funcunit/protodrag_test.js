module("funcunit-prototype / scriptaculous drag",{
	setup: function() {
		S.open("test/protodrag/myapp.html", null, 10000);
	}
})


test("Drag", function(){
	
	S("#drag").drag("#drop", function(){
		equals(S("#drop").text(), "Drags 1", 'drag worked correctly')
	})
})