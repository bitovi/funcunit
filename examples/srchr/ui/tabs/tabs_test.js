steal('ui/tabs', 'funcunit', function(Tabs, F) {
	var tabsHTML ="<ul id='resultsTab'>\
	<li><a class='flickr' href='#flickr'>Flickr</a></li>\
	<li><a class='yahoo' href='#yahoo'>Yahoo</a></li>\
	<li><a class='upcoming' href='#upcoming'>Upcoming</a></li>\
	</ul>\
	<div id='flickr' class='tab'>one</div>\
	<div id='upcoming' class='tab'>three</div>\
	<div id='yahoo' class='tab'>two</div>";

	module("ui/tabs", {
		setup : function() {
			$("#qunit-test-area").html(tabsHTML);
			this.flickrLI = $("#resultsTab li:eq(0)");
			this.upcomingLI = $("#resultsTab li:eq(1)");
			this.yahooLI = $("#resultsTab li:eq(1)");
		},
		teardown: function(){
			$("#qunit-test-area").empty();
		}
	});

	test("Proper hiding and showing", function() {
		var enabled  = can.compute(['flickr','yahoo','upcoming']);
		new Tabs("#resultsTab",{
			enabled: enabled
		});

		F(".yahoo").click();
		F("#yahoo").visible(function() {
			equal(F("#flickr").css('display'), 'none', "Old tab contents are hidden");
			ok(!F(".flickr").parent().hasClass('active'), 'Old tab is not set to active');
			ok(F(".yahoo").parent().hasClass('active'), 'New tab is set to active');
		});
	});

	test("Clicking twice doesn't break anything", function() {
		var enabled  = can.compute(['flickr','yahoo','upcoming']);
		new Tabs("#resultsTab",{
			enabled: enabled
		});

		F(".upcoming").click();
		F(".upcoming").click();

		F("#upcoming").visible(function() {
			equal(F("#upcoming").css('display'), 'block', "New tab contents are visible");
			ok(F(".upcoming").parent().hasClass('active'), 'New tab is set to active');
		});
	});

	test('disabled without any enabled content ids',function(){
		var enabled  = can.compute([]);
		new Tabs("#resultsTab",{
			enabled: enabled
		});

		ok( this.flickrLI.hasClass('disabled'),"first button disabled" );
		ok( this.upcomingLI.hasClass('disabled'),"second button disabled" )
	});

	test('setting enabled to a type enables a tab', function(){
		var enabled  = can.compute([]);
		new Tabs("#resultsTab",{
			enabled: enabled
		});
		enabled(['flickr'])

		// make sure that only flickr looks enabled
		ok(! this.flickrLI.hasClass('disabled'),"first button disabled" );
		ok( this.upcomingLI.hasClass('disabled'),"second button disabled" )
	});

	test('clicking only creates show event on enabled tab content elements', function(){
		var enabled  = can.compute(['flickr']);
		new Tabs("#resultsTab",{
			enabled: enabled
		});

		$("#flickr").bind('show',function(){
			ok(true,"default activate event is called on flickr")
		});

		$("#upcoming").bind('show',function(){
			ok(false,"default activate event is called on flickr")
		})

		F(this.flickrLI).click();
		F(this.upcomingLI).click();
	});

});