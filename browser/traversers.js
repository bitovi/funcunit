steal('jquery', './core.js', './traversers-types.js', function($, FuncUnit, traversers){

/**
 * @add FuncUnit
 */
	var makeTraverser = function(name){
		var orig = FuncUnit.prototype[name];
		FuncUnit.prototype[name] = function(selector){
			var args = arguments;
			// find is called (with 'this' as document) from FuncUnit.fn.init, so in this case don't queue it up, just run the regular find
			if (FuncUnit.win && this[0] && this[0].parentNode && this[0].parentNode.nodeType !== 9) { // document nodes are 9
				FuncUnit.add({
					method: function(success, error){
						// adjust the collection by using the real traverser method
						var newBind = orig.apply(this.bind, args);
						newBind.prevTraverser = name;
						newBind.prevTraverserSelector = selector;
						success(newBind);
					},
					error: 'Could not traverse: ' + name + ' ' + selector,
					bind: this
				});
			}

			var resultOfTheTraverse = orig.apply(this, arguments);

			if (this.selectorObject) {
				resultOfTheTraverse.selectorObject = this.selectorObject[name](selector);
			}

			return resultOfTheTraverse;
		}
	};

	for(var i = 0; i < traversers.length; i++){
		makeTraverser(traversers[i]);
	}

	return FuncUnit;
});
