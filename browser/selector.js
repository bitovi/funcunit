steal(
'jquery',
'./core.js',
'./traversers-types.js',
function($, FuncUnit, traversers) {

	var Selector = function(options, parent) {
		this.parent = parent || null;
		this.action = options.action;
		this.selector = options.selector;
	};


	var makeSelectorsAction = function(name) {
		Selector.prototype[name] = function(sel) {
			return new Selector({
				action: name,
				selector: sel
			}, this);
		};
	};

	var executeAction = function(el, action, selector) {
		// For highest level parent
		if (action === "$") {
			return FuncUnit(selector);
		} else {
			return el[action](selector || '');
		}
	};

	Selector.prototype.reselect = function() {
		var currentElement = this;
		var currentParent;
		var activeElement;
		var parents = [currentElement];

		// Get all the parent elements till the highest one
		while (currentElement.parent) {
			currentElement = currentElement.parent;
			parents.push(currentElement);
		}
		
		// Now go through the parents collection in reverse direction
		// and run selectors on them
		while (parents.length) {
			currentParent = parents.pop();
			activeElement = executeAction(
				activeElement,
				currentParent.action,
				currentParent.selector
			);
		}

		return activeElement;
	};

	for (var i = 0; i < traversers.length; i++) {
		makeSelectorsAction(traversers[i]);
	}

	FuncUnit.Selector = Selector;
	return FuncUnit;
});
