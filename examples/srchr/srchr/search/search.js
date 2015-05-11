steal(
	"can",
	"./init.ejs",
	'ui/placeholder',
	'srchr/models',
	'jquery/dom/form_params',
	'./search.less',
	function(can, initEJS, Placeholder, models){

/**
 * @constructor srchr/search
 * @parent srchr
 * @inherits can.Control
 * @test srchr/search/test.html
 *  
 * `new SearchControl(element, options)` 
 * listens to a search form being submitted and 
 * updates `currentSearch` with a new
 * [srchr/models/search Search] instance.
 *  
 * If another module (ex: [srchr/history]) changes
 * `currentSearch`, `SearchControl` will update
 * the search form accordingly.
 * 
 * Other features of `SearchControl` include:
 * 
 *  - basic placeholder functionality
 *  - search validation
 * 
 * Example:
 * 
 *     var currentSearch = can.compute();
 * 
 *     new SearchControl("#search",{
 *       currentSearch: currentSearch,
 *       defaultText: "Enter search text"
 *     })
 * 
 * @demo srchr/search/search.html
 * 
 * 
 * @param {HTMLElement} element the element to show results within.
 * @param {Object} options An object of the following options:
 * 
 * #### defaultText `{String}`
 * 
 * The placeholder text.
 * 
 * #### currentSearch `{can.compute}`
 * 
 * The current search that should be performed.
 */
return can.Control(
/* @static */
{
	defaults : {
		defaultText : "Search for things here"
	},
	pluginName: 'srchr-search'
	
},
/* @prototype */
{
	/**
	 * Initialize a new instance of the Search controller.
	 */
	init : function(){
		var modelNames = [];
		for(var modelName in models){
			modelNames.push(modelName)
		}
		var self = this;
		this.element.html(initEJS({modelNames: modelNames},{
			checked: function(modelName){
				var current =  self.options.currentSearch();
				var types = (current && current.types || []);
				if( $.inArray(modelName, types) >=0 ){
					return "checked"
				} else {
					return ""
				};
			}
		}));
		new Placeholder("#query",{
			placeholder: this.options.defaultText
		})
	},
	
	/**
	 * Highlights 'el' for 'time' milliseconds.
	 * 
	 * @param {Object} el The element to highlight.
	 * @param {Object|null} time The amount of time to highlight for.  Default is 1000 milliseconds
	 */
	flash  : function(el, time){
		el.addClass('highlight');
		
		setTimeout(function(){
			el.removeClass('highlight');
		}, +time || 1000, 10);
	},
	
	/**
	 * Binds to the search form submission.  Prevents the default action and fires the "search.created" event. 
	 * @param {Object} el The event target element.
	 * @param {Object} ev The event being fired.
	 */
	"form submit" : function(el, ev){
		ev.preventDefault();
		

		var search = el.formParams(),
			ok = true;
		
		// If no search type was selected, flash the .options UL and don't trigger search.created
		if(!search.types || !search.types.length){
			this.flash(this.element.find('.options'));
			ok = false;
		}
		
		// If the default wasn't changed, flash the text field and don't trigger search.created
		if(search.query == this.options.defaultText){
			this.flash(this.element.find('input[type=text]'));
			ok = false;
		}
		
		// If everything is valid, trigger search.created
		if(ok){
			this.options.currentSearch(search);
		}	
	},
	/**
	 * Focuses on the search query box on page load.
	 */
	"{document} load" : function(){
		//if we are attached when the page loads, focus on our element
		this.element.find("input[name=query]")[0].focus();
	},
	
	/**
	 * Updates the checkboxes to reflect the user's desired search engine preferences.  Also fires search. 
	 */
	"{currentSearch} change" : function(currentSearch, ev, newVal, oldVal){
		if(newVal){
			this.element.find("input[name=query]").val(newVal.query)[0].focus();

			var checks = this.element.find("input[type=checkbox]").attr("checked",false);
			for(var i =0; i < newVal.types.length; i++){
				checks.filter("[value="+newVal.types[i].replace(/\./g,"\\.")+"]").attr("checked",true);
			}
		} else {
			this.element.find("input[name=query]").val("").focus()
		}
		
	}
});

});
	 