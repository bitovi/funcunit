//what we need from javascriptmvc or other places
steal('jquery', 'funcunit/syn', './browser/core.js', './browser/adapters/adapters.js',
	'./browser/open.js', './browser/actions.js', './browser/getters.js',
	'./browser/traversers.js', './browser/queue.js', './browser/waits.js',
function($, Syn, FuncUnit) {
	// TODO this can be removed when steal.then works properly
	if ( (window.FuncUnit && window.FuncUnit.jQuery) || window.jQuery ) {
		((window.FuncUnit && window.FuncUnit.jQuery) || window.jQuery).fn.triggerSyn = function( type, options, callback ) {
			if(!this[0]){
				throw "Can't "+type.substring(1)+" because no element matching '"+this.selector+"' was found"
			}
			Syn(type, options, this[0], callback);
			return this;
		};
	}
	window.FuncUnit = window.S = FuncUnit;
});
