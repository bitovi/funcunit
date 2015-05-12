steal('./flickr.js','./google.js',
	'./twitter.js','./wikipedia.js',
	'./reddit.js',
	function(Flickr, Google, Twitter, Wikipedia, Reddit){
	
	/**
	 * @constructor srchr/models
	 * @parent srchr
	 * 
	 * Returns an object map of `ModelName : Model` pairs.
	 * 
	 * 
	 *     steal('srchr/models',function(models){
	 *       models.Flickr.findAll({})
	 *     })
	 */
	return {
		/* @static */
		Flickr: Flickr,
		Google: Google,
		// Twitter no longer supported with 1.1
		// Twitter: Twitter,
		Wikipedia: Wikipedia,
		Reddit: Reddit
	};
			
})
