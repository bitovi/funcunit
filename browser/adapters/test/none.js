var QUnit = require("steal-qunit");
var F = require("funcunit");
var $ = require("jquery");

QUnit.module('Adapters', {
	setup: function() {
		$('#qunit-fixture').append('<a class=\'clickme\' href=\'javascript://\'>clickme</a><div class=\'clickresult\'></div>');
		$('.clickme').click(function() {
			$('.clickresult').text("clicked");
		});
	}
});

test('QUnit adapter test', function() {
	stop();

	F('.clickme').click();
	F('.clickresult').text('clicked', function(){
		ok("clicked the text");
		start();
	});
});
