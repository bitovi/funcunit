steal('jquery', './browser/resources/json.js',
	'./browser/core.js', './browser/adapters/adapters.js',
	'./browser/open.js', './browser/actions.js', './browser/getters.js',
	'./browser/traversers.js', './browser/queue.js', './browser/waits.js',
function(jQuery, FuncUnit) {
	FuncUnit.jQuery = jQuery.noConflict(true);
	window.FuncUnit = FuncUnit;
	window.S = FuncUnit;
	return FuncUnit;
});
//what we need from javascriptmvc or other places
//steal('./browser/resources/jquery.js', function(){
//		if(!window.FuncUnit){
//			window.FuncUnit = {};
//		}
//		FuncUnit.jQuery = jQuery.noConflict(true);
//	})
//	.then('./browser/resources/json.js', 'funcunit/syn')
//	.then('./browser/core.js')
//	.then('./browser/adapters/adapters.js')
//	.then('./browser/open.js', './browser/actions.js',
//		'./browser/getters.js', './browser/traversers.js', './browser/queue.js',
//		'./browser/waits.js')