steal('funcunit', function() {

	module('Adapters', {
		setup: function() {
			$('#qunit-fixture').append('<a class=\'clickme\' href=\'javascript://\'>clickme</a><div class=\'clickresult\'></div>');
			$('.clickme').click(function() {
				$('.clickresult').text("clicked");
			});
		}
	});

	test('QUnit adapter test', function() {
		F('.clickme').click();
		F('.clickresult').text('clicked', 'clicked the link');
	});

});