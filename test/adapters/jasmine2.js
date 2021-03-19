var $ = require('jquery');
var F = require('funcunit');

require('steal-jasmine');

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

	it('should use the jasmine adapter', async function(done) {
		await F.wait(1000);
		await F('.clickme').click();
		await F('.clickresult').text('clicked');

		F(function() {
			expect($('.clickresult').text()).toBe('clicked');
			done();
		});
	});
});
