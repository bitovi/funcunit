steal('jquery').then(function($){

(function($){
	var getWindow = function( element ) {
		return element.ownerDocument.defaultView || element.ownerDocument.parentWindow
	}

//do traversers
var traversers = ["closest","next","prev","siblings","last","first", "find"],
	makeTraverser = function(name){
		var orig = FuncUnit.prototype[name];
		FuncUnit.prototype[name] = function(selector){
			var args = arguments;
			// find is called (with "this" as document) from FuncUnit.fn.init, so in this case don't queue it up, just run the regular find
			if (FuncUnit._window && this[0] !== FuncUnit._window.document) {
				FuncUnit.add({
					method: function(success, error){
						// adjust the collection by using the real traverser method
						this.bind = orig.apply(this.bind, args);
						success()
					},
					error: "Could not traverse: " + name + " " + selector,
					bind: this
				});
			}
			return orig.apply(this, arguments);
		}
	};
for(var i  =0; i < traversers.length; i++){
	makeTraverser(traversers[i]);
}


}(window.jQuery  || window.FuncUnit.jQuery));


})