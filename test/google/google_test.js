steal('funcunit', function(){
	module('google test', {
		setup: function(){
			S.open("/")
		}
	})
	
	test('autocomplete', function(){
		S('#lst-ib').type('Angry');
		S('.gssb_e .gsq_a tr').size(4);
		// S('.gssb_e .gsq_a tr:first').click();
		S('#rso a:first').text("Angry Birds - Rovio")
	})
})
