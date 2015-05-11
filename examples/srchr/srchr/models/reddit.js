steal('can', 'can/construct/super',function(can){
	
	/**
	 * @constructor srchr/models/reddit
	 * @inherits can.Model
	 * @test srchr/models/test.html
	 * @parent srchr
	 * 
	 * Provides `Reddit.findAll(params, success(results))` to retrieve
	 * Reddit images like:
	 * 
	 *     Reddit.findAll({query: "Cats"}, function(results){
	 *       
	 *     })
	 * 
	 */
	return can.Model({
		/* @static */
		findAll : function(params){
			return $.ajax({
				url : "http://www.reddit.com/search/.json",
				dataType : "jsonp",
				data : {
					q: params.query
				},
				jsonp: "jsonp"
			})
			
		},
		models : function(data){
			return this._super(data.data.children)
		},
		model: function(data){
			return this._super(data.data)
		}
	},{});

});

