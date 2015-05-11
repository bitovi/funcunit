var Mocha = require("steal-mocha");
var F = require("funcunit");
var $ = require("jquery");

F.attach(Mocha);

describe('funcunit', function() {
	beforeEach(function() {
		$('#testarea').append('<a class=\'clickme\' href=\'javascript://\'>clickme</a><div class=\'clickresult\'></div>');
		$('.clickme').click(function() {
			$('.clickresult').text("clicked");
		});
	});

	afterEach(function() {
		$('#testarea').empty();
	});

	it('pass', function(done) {
		F('.clickme').click();
		F('.clickresult').text('clicked', 'clicked the link');

		F(function() { console.log("before"); })
		F.add(done);
	});

	it('fail', function(done) {
		F('.clickme').click();
		F('.clickresult').text('clickedz', 'clicked the link');

		F.add(done);
	});
});

