// loaded into the browser (in the client) but only run if we're in commandline mode (not browser mode)

steal('steal/browser/client.js').then(function(){
	if (/mode=commandline/.test(window.location.search)) {
	
		var evts = ['testStart', 'testDone', 'moduleStart', 'moduleDone', 'done', 'log'], type;
		
		for (var i = 0; i < evts.length; i++) {
			type = evts[i];
			(function(type){
				QUnit[type] = function(data){
					steal.client.trigger(type, data)
				};
			})(type)
		}
	}
})