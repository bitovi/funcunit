var QUnit = require("steal-qunit2");
var F = require("funcunit");
var $ = require("jquery");
F.attach(QUnit);

QUnit.module('Adapters 2', {
	beforeEach: function() {
		$('#qunit-fixture').append('<a class=\'clickme\' href=\'javascript://\'>clickme</a><div class=\'clickresult\'></div>');
		$('.clickme').click(function() {
			$('.clickresult').text("clicked");
		});
	}
});

QUnit.test('QUnit adapter test', function(assert) {
	F.wait(1000);
	F('.clickme').click();
	F('.clickresult').text('clicked', 'clicked the link');
});
