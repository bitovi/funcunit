var F = require('funcunit');
var $ = require('jquery');
require('../../../lib/jasmine2/boot');

F.attach(jasmine);

describe('Adapters', function() {
	beforeEach(function() {
		$('body').append('<a class=\'clickme\' href=\'javascript://\'>clickme</a><div class=\'clickresult\'></div>');
		$('.clickme').click(function() {
			$('.clickresult').text("clicked");
		});
	});

	afterEach(function() {
		$('.clickme, .clickresult').remove();
	});

	it('should use the jasmine adapter', function(done) {
		F('.clickme').click();
		F('.clickresult').text('clicked');

		F.add(done);
	});
});

window.onload();