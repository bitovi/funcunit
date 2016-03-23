var F = require("funcunit");
var $ = require("jquery");

F.attach(jasmine);

describe('Adapters', function() {
	beforeEach(function() {
		$('body').append(
			'<a class=\'clickme\' href=\'javascript://\'>clickme</a>' +
			'<div class=\'clickresult\'></div>'
		);

		$('.clickme').click(function() {
			$('.clickresult').text('clicked');
		});
	});

	afterEach(function() {
		$('.clickme, .clickresult').remove();
	});

	it('should use the jasmine adapter', function() {
		F('.clickme').click();
		F('.clickresult').text('clicked');
	});
});
