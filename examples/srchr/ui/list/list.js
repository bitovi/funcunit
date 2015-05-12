steal('can',
	'./results.ejs',
	'can/util/object',
	'./list.less',
	function(can, resultsEJS, object){
	
/**
 * @constructor ui/list
 * @parent srchr
 * @test ui/list/test.html
 * @inherits can.Control
 * 
 * `new List(element, options)` lists search results
 * for a given model, but only when the current 
 * element is visible.
 * 
 *     var params = can.compute({
 *       query: "Cats"
 *     })
 *     
 *     $("#google-results").hide()
 *     
 *     new List("#google-results",{
 *       modelType: Google,
 *       resultTemplate: can.view.ejs("<h2><%= title %></h2>"),
 *       params: params
 *     });
 * 
 *     $("#google-results").trigger("show").show()
 * 
 * @demo ui/list/list.html
 * 
 * 
 * @param {HTMLElement} element the element to show results within.
 * @param {Object} options An object of the following options:
 * 
 * #### modelType `can.Model`
 * 
 * A [can.Model] with a `.findAll` method that can be used to retrieve 
 * the search results.
 * 
 * #### resultTemplate `can.view`
 * 
 * A template that is passed an individual instance of the search 
 * results.  The template should provide the html for that single instance.
 * 
 * ### params `can.compute`
 * 
 * The params that should be passed to `Model.findAll`.
 * 
 */
return can.Control(
/* @static */
{
	defaults: {
		resultTemplate : "//ui/list/result.ejs"
	},
	pluginName: 'ui-list'
},
/* @prototype */
{	
	init: function(){
		this.options.id = this.element.prop('id')
		this.options.list = new this.options.modelType.List();
		this.options.searching = can.compute(false);
		this.element.html( resultsEJS(this.options) );
		this.on();
	},
	/**
	 * If the results panel is visible, then get the results.
	 * @param {Object} el The element that the event was called on.
	 * @param {Object} ev The event that was called.
	 * @param {Object} searchInst The search instance to get results for.
	 */
	"{params} change": function(curSearch, ev, newValue){
		if (this.element.is(':visible')){
			this.getResults();
		}
	},
	
	/**
	 * Show the search results. 
	 */
	" show": "getResults",
	/**
	 * Get the appropriate search results that this Search Results container is supposed to show.
	 */
	getResults: function(){
		// If we have a search...
		var params = this.options.params()
		if (params){
			
			// and our search is new ...
			if( !object.same(this.oldParams, params) ){
				// and set a callback to render the results.
				var searching = this.options.searching;
				searching(true)
				
				var deferredItems = this.options.modelType.findAll(
						params, 
						function(){
							searching(false)
						})
						
				this.options.list.replace( deferredItems );
				
				this.oldParams = params;
			}
			
		}
		
	}
});
	
});
	 