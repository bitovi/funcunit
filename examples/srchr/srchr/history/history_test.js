steal('funcunit', 
	'srchr/history', 
	'srchr/models/history.js', 
function(F, HistoryControl, HistoryModel) {
	module("srchr/history", {
		setup: function() {
			var currentSearch = this.current = can.compute();

			$("<div id='history'>").appendTo("#qunit-test-area");
			stop();
			// set history to use a different part of the store
			HistoryModel.localStoreName = "history-test"
			// remove all items in the store
			HistoryModel.findAll({}, function(items){
				can.makeArray(items).forEach(function(item){
					item.destroy()
				});

				// create the history control
				new HistoryControl("#history", {
					currentSearch: currentSearch
				});

				start();
			});
		},
		teardown: function() {
			$("#qunit-test-area").empty()
		}
	});

	test("creating history records by changing the current search", function() {
		this.current({
			query: "Cats",
			types: ["Srchr.Models.Flickr"]
		});

		equal($("#history li").length, 1, "there is only one history item");
		equal($("#history li .query").text(), "Cats", "cats created");

		this.current({
			query: "Dogs",
			types: ["Srchr.Models.Twitter"]
		});

		equal($("#history li").length, 2, "there are two items");
		equal($("#history li:first .query").text(), "Dogs", "Dogs created in first stop");

		this.current( {
			query: "Cats",
			types: ["Srchr.Models.Twitter"]
		});

		equal($("#history li").length, 2, "there are two items");
		equal($("#history li:first .query").text(), "Cats", "Cats moved to first stop");
	});

	test("removing a history", function() {
		this.current({
			query: "Cats",
			types: ["Srchr.Models.Flickr"]
		});

		// delete all todos
		F("#history a.remove").click();

		F("#history li").size(0,function(){
			ok(!JSON.parse(localStorage.getItem('history-test')).length,"nothing in local storage");
		},"all todos deleted");
	});

	test("updating current search", function() {
		this.current({
			query: "Cats",
			types: ["Srchr.Models.Flickr"]
		});

		this.current( {
			query: "Dogs",
			types: ["Srchr.Models.Twitter"]
		});
		var self = this;

		F("#history li:eq(1)").click(function() {
			var cur = self.current();
			equal(cur.query,"Cats","set back to cats");
		});
	});
});