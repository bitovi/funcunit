// Load all of the plugin dependencies
steal(
	'srchr/history',
	'srchr/search',
	'srchr/results',
	'./srchr.less',
	function( History, Search, Results ){
	
	// don't run if rhino
	if(steal.isRhino) return;
	
	// Create the state that will be shared by everything
	var currentSearch = can.compute()
	
	// Create a new History controller on the #history element
	new History("#history",{
		currentSearch: currentSearch
	});
	
	// Create a new Search controller on the #searchArea element
	new Search("#search",{
		currentSearch: currentSearch
	});
	
	new Results("#results",{
		currentSearch: currentSearch
	});
	
});






