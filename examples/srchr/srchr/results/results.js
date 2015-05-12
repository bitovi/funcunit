steal('can','./init.ejs',
	'srchr/models',
	'srchr/results/templates',
	'ui/list',
	'ui/tabs',
	function(can, initView, models, templates, List, Tabs){
    /**
     * @constructor srchr/results
     * @parent srchr
	 * @alias Results  
	 * @test srchr/results/test.html
	 * @inherits can.Control
	 *  
	 * `new Results(element, options)` shows the currentSearch's
	 * search results in a tabbed interface. It
	 * combines [ui/list] and [ui/tabs].
	 * 
	 * 
	 *     var currentSearch = can.compute({
	 *       query: "cats",
	 *       types: ["Google","Twitter"]
	 *     });
	 * 
	 *     new Results("#results",{
	 *       currentSearch: currentSearch
	 *     })
	 * 
	 * @demo srchr/results/results.html
	 * 
	 * @param {HTMLElement} element the elements to put the results in.
	 * 
	 * @param {Object} an options object with the following properties:
	 * 
	 * ### currentSearch `can.compute`
	 * 
	 * The current search.
     */
    return can.Control(
	/** @Static */
	{
		defaults : {},
		pluginName: 'srchr-results'
	},
	/** @Prototype */
	{
		init : function(){
			var currentSearch = this.options.currentSearch;
			
			var params = can.compute(function(){
				return {query: currentSearch() && currentSearch().query}
			})
			this.element.html(initView({
				models: models
			},{
				// a helper that creates a List for a given modelName
				listFor: function(modelName){
					return function(el){
						$(el).prop('id',modelName)
						new List(el,{
							modelType : models[modelName],
							params: params,
							resultTemplate: templates[modelName]
						})
					}
				}
			}));
			
			var enabled = can.compute(function(){
				var current = currentSearch()
				if(current){
					return current.types
				} else {
					return [];
				}
			})
			
			new Tabs( this.element.children('.resultsTab'),{
				enabled: enabled
			});
		}
	});
});