//steal/js srchr/scripts/compress.js
load("steal/rhino/rhino.js");
steal('steal/build', function() {
	steal.build('srchr/srchr.html', {
		to: 'srchr'
	});
});