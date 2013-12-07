steal('funcunit', function(F) {

	describe('funcunit', function() {
		it('click', function(done) {
			// this.timeout(60000);
			F.timeout = 1900;

			$('#mocha').append('<a class=\'clickme\' href=\'javascript://\'>clickme</a><div class=\'clickresult\'></div>');
				$('.clickme').click(function() {
				$('.clickresult').text("clicked");
			});

			F('.clickme').click();
			F('.clickresult').text('clickedz', 'clicked the link');

			console.log(this);

			F.add({
				method: function(success, error) {
					success();
					done();
				},
				success: function() {},
				error: 'Adapter failure in FuncUnit.prototype.done()',
				bind: self
			});
		});
	});

});