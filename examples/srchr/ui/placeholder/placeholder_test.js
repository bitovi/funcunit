steal('ui/placeholder', 'funcunit', function(Placeholder, F) {

	module("ui/placeholder", { 
		setup: function(){
			F.open( window );
			$("#qunit-test-area").html("<input id='placeholder'/>")
		},
		teardown: function(){
			$("#qunit-test-area").empty();
		}
	});
	
	test("Shows placeholder with empty text", function(){
		new Placeholder('#placeholder',{
			placeholder : "placeholder text"
		});
		equal( $('#placeholder').val(), "placeholder text","text set");
		ok( $('#placeholder').hasClass('placeholder'), "placeholder set"  );
		
		F('#placeholder').type("something",function(){
			ok( !$('#placeholder').hasClass('placeholder'), "placeholder removed");
		})
	});

});