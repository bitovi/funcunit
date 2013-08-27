steal('funcunit/qunit')
	.then('funcunit')
	.then('./app.js', function(){
		module("Adapters")
		test("QUnit adapter test", function(){
		F('.clickme').click();
		F('.clickresult').text("clicked", "clicked the link")
		})
	})