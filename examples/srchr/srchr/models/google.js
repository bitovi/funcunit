steal('can', 'can/construct/super',function(can){
	
	/**
	 * @constructor srchr/models/google
	 * @inherits can.Model
	 * @test srchr/models/test.html
	 * @parent srchr
	 * 
	 * Provides `Google.findAll(params, success(results))` to retrieve
	 * Google images like:
	 * 
	 *     Google.findAll({query: "Cats"}, function(results){
	 *       
	 *     })
	 * 
	 * Make sure you update [srchr/models/google.apiKey Google.apiKey]
	 * with your API key and [srchr/models/google.cx Google.cx] with
	 * your custom search context code.
	 */
	return can.Model({
		/**
		 * @attribute
		 * 
		 * Specifies the Google custom search API key. Get yours 
		 * [here](http://www.google.com/cse/).
		 */
		apiKey: "AIzaSyBIPgG7836PciaBUGSQaQMUISW6tq1Gr-M",
		/**
		 * Specifies the Google custom search context key. Get yours 
		 * [here](http://www.google.com/cse/).
		 */
		cx: "002155797297639617961:na138y-d1g0",
		findAll : function(params, success, error){
			return $.ajax({
				url : "https://www.googleapis.com/customsearch/v1",
				dataType : "jsonp",
				data: {
					key: this.apiKey,
					cx: this.cx,
					q: params.query
				}
			})
		},
		models : function(data){
			return this._super(data.items)
		}
	},{});
	
})
