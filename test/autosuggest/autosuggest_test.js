steal("funcunit").then(function(){

	module("autosuggest",{
		setup: function() {
			F.open('//test/autosuggest/autosuggest.html')
		}
	});
	
	test("results appear",function(){
		F('input').visible().click().type("Java")
	
		// wait until we have some results
		F('.ui-menu-item').visible().size(2, "there are 2 results")
	});
	
	test("clicking result",function(){
		F('input').visible().click().type("JavaS")
		
		F('.ui-menu-item a:first').visible()
		F('body').move('.ui-menu-item a:first')
		F('.ui-menu-item a:first').visible().click()
		F('input').val("JavaScript", "JavaScript selected");
    })
    
    test("keyboard navigation",function(){
	  F('input').visible().click().type("Java")
	
	  F('.ui-menu-item').visible()
	  F('input').type('[down][down][enter]')
	    .val("JavaScript")
	});

})