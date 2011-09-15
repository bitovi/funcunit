steal("funcunit").then(function(){

	module("autosuggest",{
		setup: function() {
			S.open('autosuggest.html')
		}
	});
	
	test("results appear",function(){
		S('input').visible().click().type("Java")
	
		// wait until we have some results
		S('.ui-menu-item').visible(function(){
			equal( S('.ui-menu-item').size(), 2, "there are 2 results")
		})
	});
	
	
	test("keyboard navigation",function(){
		S('input').visible().click().type("JavaS")
	
		S('.ui-menu-item').visible()
		S('input').type('[down][enter]').val("JavaScript")
	});
	

})