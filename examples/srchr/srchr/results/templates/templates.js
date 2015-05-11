steal('./flickr.ejs','./google.ejs',
	'./twitter.ejs','./wikipedia.ejs',
	'./reddit.ejs',
	function(Flickr, Google, Twitter, Wikipedia, Reddit){
	
	return {
		Flickr: Flickr,
		Google: Google,
		Twitter: Twitter,
		Wikipedia: Wikipedia,
		Reddit: Reddit
	};
			
})
