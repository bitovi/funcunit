steal('funcunit', function(F) {
	var $ = F.jQuery;

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

			F.add(done);
		});

		it('fail', function(done) {
			F('.clickme').click();
			F('.clickresult').text('clickedz', 'clicked the link');

			F.add(done);
		});

		it('passes after failing', function(done) {
			F('.clickme').click();
			F('.clickresult').text('clicked', 'clicked the link');

			F.add(done);
		
		});
	});

});
