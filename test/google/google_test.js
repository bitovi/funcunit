steal('funcunit', function(){
	module('google test', {
		setup: function(){
			F.open("/")
		}
	})
	
	test('autocomplete', function(){
		F('#lst-ib').type('Angry');
		F('.gssb_e .gsq_a tr').size(4);
		F('#rso a:first').text("Angry Birds - Rovio", "Angry birds is the first link")
		F('.vspii:first').click();
		F('#nycp').visible("Preview shows up")
	})
	
	test('image search', function(){
		F('#lst-ib').type('Angry');
		F('.gssb_e .gsq_a tr').size(4);
		F(".mitem:contains('Images') a").click();
		F('#rg_hi').visible("First image shows up")
	})
})
