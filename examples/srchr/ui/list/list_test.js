steal('./list.js',
	'funcunit',
	'can/util/fixture',
	function(List, F, fixture) {

	module("ui/list", {
		setup: function() {
			var self = this;

			this.params = can.compute();
			this.searches = 0;

			var Google = can.Model({
				findAll: "/google"
			},{});

			fixture("/google",function(request) {
				var results = [];
				var length = parseInt( Math.random()*10+1 );

				for(var i =0; i < length; i++) {
					results.push({
						title : i+"th search result for "+request.data.query,
					});
				}

				this.searches++;
				return results;
			});

			$("<div id='content'/>").appendTo("#qunit-test-area");
			new List("#content", {
				modelType : Google,
				params: this.params
			});
		},
		teardown: function() {
			$("#qunit-test-area").empty()
		}
	});

	test("results shown", function() {
		this.params({
			query: "Cats"
		});

		F("#content li.result").exists("results have been shown");
	});

	test("results not retrieved when hidden", function() {
		$("#content").hide();

		this.params({
			query: "Cats"
		});
		var self = this;

		F.wait(20, function() {
			equal(self.searches, 0, "")
		});
	});

	test("results retrieved when shown",function() {
		$("#content").hide();

		this.params({
			query: "Cats"
		} );

		var self = this;
		F.wait(40, function(){
			equal( self.searches, 0, "" )
		});

		$("#content").trigger("show");
		F("#content li.result").exists("results have been shown",function(){
			equal( self.searches, 1, "" )
		});
	});
});