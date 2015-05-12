//js cookbook/scripts/doc.js

load('steal/rhino/rhino.js');
steal("documentjs", function(DocumentJS){
	DocumentJS('srchr/srchr.html', {
		markdown: ['srchr'],
		out: 'docs',
		parent: 'srchr'
	});
});