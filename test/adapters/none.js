var $ = require('jquery');
var F = require('funcunit');
var QUnit = require('steal-qunit');

QUnit.module('Adapters', {
	setup: function() {
		$('#qunit-fixture').append(
			'<a class=\'clickme\' href=\'javascript://\'>clickme</a>' +
			'<div class=\'clickresult\'></div>'
		);

		$('.clickme').click(function() {
			$('.clickresult').text("clicked");
		});
	}
});

test('QUnit with no adapter test', async function() {
	stop();

	await F.wait(1000);
	console.log('waited');

	await F('.clickme').click();
	console.log('clicked');

	await F('.clickresult').text('clicked');

	ok('clicked the text');
	start();
});
