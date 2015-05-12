steal('srchr/results','funcunit', 'srchr/models', function(Results, F, Models) {
	var types = []
	for(var modelName in Models) {
		types.push(modelName)
	}

	// tests integration between currentSearch and Tabs and List
	module("srchr/results", {
		setup: function() {
			this.currentSearch = can.compute(false);
			$("<div id='results'/>").appendTo("#qunit-test-area");
			new Results('#results', {currentSearch: this.currentSearch});
		},
		teardown: function() {
			$("#qunit-test-area").empty();
		}
	});

	test("empty current search has disabled tabs", function() {
		for(var modelName in Models) {
			equal(
				$("#results li.disabled:contains("+modelName+")").length,
				1, "Disabled "+modelName );
		}
	});

	test("Adding types enables tabs and shows the first one's content'", function() {
		this.currentSearch({
			types: types.slice(0),
			query: "cats"
		});

		for(var modelName in Models) {
			ok( 
				!$("#results li:contains("+modelName+")").hasClass('disabled'),
				"enabled "+modelName );
		}

		F("#"+types[0]+" li.result").size(function(size) {
			return size > 2
		}, "Showing at least 2 results in first tab");
	});

	test("clicking on a tab shows its results", function() {
		this.currentSearch({
			types: types.slice(0),
			query: "cats"
		});

		F("ul.tabs a:contains(Wikipedia)").click();

		F("#Wikipedia li.result").size(function(size){
			return size > 2
		}, "Showing at least 2 results in wikipedia's tab")
	});
});