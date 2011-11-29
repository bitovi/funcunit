(function(){

var origjQuery, 
	orig$;
	
if(typeof jQuery !== "undefined"){
	origjQuery = jQuery;
	orig$ = $;
}

window.FuncUnit = {};
steal('./resources/jquery.js', function(){
	FuncUnit.jQuery = jQuery.noConflict(true);
	if(typeof origjQuery !== "undefined"){
		jQuery = origjQuery;
		$ = orig$;
	}
})


})()