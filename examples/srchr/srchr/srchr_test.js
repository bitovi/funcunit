steal('funcunit',
	'ui/tabs/tabs_test.js',
	'ui/list/list_test.js',
	'ui/placeholder/placeholder_test.js',
	'srchr/history/history_test.js',
	'srchr/models/models_test.js',
	'srchr/search/search_test.js',
	'srchr/results/results_test.js',

function(F) {
	module("srchr", {
		setup: function() {
			F.open("srchr.html");
		}
	});

	test('Search shows results in selected service', function() {
		F('input[value=Reddit]').click();
		F('#query').click().type('Dogs\r');

		// wait until there are 2 results
		F("#Reddit li").exists(function() {

			ok(true, "We see results in Reddit");
			// make sure we see dogs in the history
			var r = /Dogs\s+r/i;

			ok(r.test(F("#history li.selected").text()), "we see dogs correctly");

			// make sure flickr and everyone else is diabled
			ok(F('#results li:contains(Flickr)').hasClass('disabled'), "Flickr is disabled.");
			ok(F('#results li:contains(Google)').hasClass('disabled'), "Google is disabled.");
		});
	});

	test('Switching results tabs', function() {
		F('input[value=Reddit]').click();
		F('input[value=Flickr]').click();

		F('#query').click().type('Cats\r');

		F("#Flickr li").size(function(size) {
			return size > 1
		}, function() {
			equal(F('#Flickr').css('display'), 'block', 'Reddit results panel is visible');
		});

		F('#results li:contains(Reddit) a').exists().click(function() {
			equal(F('#Flickr').css('display'), 'none', 'Flickr results panel is hidden');
			equal(F('#Reddit').css('display'), 'block', 'Reddit results panel is visible');
		})
	})

	test('Clicking history entries re-creates the search', function() {
		F('#history li:contains(Dogs)').click(function() {
			equal(F('#query').val(), "Dogs", 'Dogs was put back into the query field')
		});
		F("#Reddit li.result").exists(function() {
			ok(true, "We see results in Reddit");
		});
	});

	test('All history entries are deletable', function() {
		for ( var i = F('#history li').size() - 1; i > -1; i-- ) {
			F('#history li a.remove:eq(' + i + ')').click();
		}

		// wait for all entries to be removed
		F('#history li').size(0, 'All history entries were removed.');
	});
});