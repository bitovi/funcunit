steal('can', 'can/construct/super',function(can){
	/**
	 * @constructor srchr/models/flickr
	 * @inherits can.Model
	 * @test srchr/models/test.html
	 * @parent srchr
	 * 
	 * Provides `Flickr.findAll(params, success(results))` to retrieve
	 * Flickr images like:
	 * 
	 *     Flickr.findAll({query: "Cats"}, function(results){
	 *       
	 *     })
	 * 
	 * Make sure you update [srchr/models/flickr.apiKey Flikr.apiKey]
	 * with your API key.
	 */
	return can.Model({
		/**
		 * @attribute
		 * 
		 * Specifies the flickr API key
		 */
		apiKey: "245a802eca20febde31c0d3d6a373add",
		/**
		 * Gets flickr images
		 */
		findAll : function(params){
			return $.ajax({
				url : "http://query.yahooapis.com/v1/public/yql",
				dataType : "jsonp",
				data : {
					q: can.sub("SELECT * FROM flickr.photos.search "+
							   "WHERE has_geo='true' AND text='{query}' AND api_key='{key}'", 
						$.extend({key: this.apiKey},params)),
					format: "json",
					env: "store://datatables.org/alltableswithkeys",
					callback: "?"
				}
			})
			
		},
		models : function(data){
			return this._super(data.query.results.photo)
		}
	},{});

});

