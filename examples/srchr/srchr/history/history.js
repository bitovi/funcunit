steal('can',
	'./init.ejs', 
	'srchr/models/history.js', 
	'./history.less', 
	function( can, initEJS, History ) {



	/**
	 * @constructor srchr/history
	 * @parent srchr
	 * @inherits can.Control
	 * @test srchr/history/test.html
	 * 
	 * Saves a list of [srchr/models/search] instances 
	 * in local storage and allows you to remove these
	 * instances and set them as the new `currentSearch`.
	 * 
	 * Create a `History` control with a compute representing
	 * the current search like:
	 * 
	 *     var currentSearch = can.compute(
	 *           new Search({
	 *             query: "ice cream",
	 *             types: ["Flickr","Google"]})
	 *     );
	 *     new History("#list", {
	 *       currentSearch: currentSearch
	 *     });
	 * 
	 * @demo srchr/history/history.html
	 */
	return can.Control({
		pluginName: "srchr-history"
	},
	/* @prototype */
	{
		/**
		 * Waits for the page to be loaded
		 */
		init: function() {
			var currentSearch = this.options.currentSearch
			// create a list of items retrieved from the model
			this.options.histories = 
				new History.List( History.findAll({}) );
			
			// render the list
			this.element.html(initEJS(this.options,{
				// helper to display the types
				prettyTypes: function(history){
					return  can.map(history.types,function(type){ 
						return type.substr(0,1).toLowerCase()
					}).join();
				},
				// helper to let us know if selected
				isSelected: function(history){
					var current = currentSearch()
					if(current && current.query == history.query){
						return true;
					}
				}
			}));
			
			// make sure we are listening to changes 
			// in the model
			this.on()
		},
		"{currentSearch} change": function( current, ev, search ) {
			// check if the store has a history object that shares the search's query
			var history = History.store[search.query]
			if( history ){
				// update that history with the search's attributes
				history.attr(search,true).save()
				// move that history to the start of the list
				this.options.histories.splice(
						this.options.histories.indexOf(history),
						1);
				this.options.histories.unshift(history);	
			} else {
				// create a new history and move it to the start of the list
				var history = new History(search)
				this.options.histories.unshift(history)
				history.save()
			}
		},
		/**
		 * Binds the "remove" class on click.  Removes a history entry.
		 * @param {Object} el The history event to remove.
		 * @param {Object} ev The event that was fired.
		 */
		".remove click": function( el, ev ) {
			// get the history instance from $.data
			var li = el.closest('li'),
				toBeRemoved = li.data('history');

			// fade it out and destroy
			li.fadeOut(function() {
				toBeRemoved.destroy();
			});
			ev.stopImmediatePropagation();
		},

		/**
		 * Fires "selected" and passes el.model().
		 * @param {Object} el The history entry that was clicked
		 * @param {Object} ev The event that was fired.
		 */
		"li click": function( el, ev ) {
			// update the current selected
			this.options.currentSearch(
				el.data('history').attr()
			);
		}
	});
});