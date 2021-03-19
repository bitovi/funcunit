var QUnit = require("steal-qunit");
var F = require("funcunit");
var $ = require("jquery");

F.attach(QUnit);

QUnit.module('Adapters', {
	setup: function() {
		$('#qunit-fixture').append('<a class=\'clickme\' href=\'javascript://\'>clickme</a><div class=\'clickresult\'></div>');
		$('.clickme').click(function() {
			$('.clickresult').text("clicked");
		});
	}
});

test('QUnit adapter test', async function() {
	await F.wait(1000);
	await F('.clickme').click();
	await F('.clickresult').text('clicked', 'clicked the link');
});
