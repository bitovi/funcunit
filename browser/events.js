// loaded into the browser only if we're in commandline mode (not browser mode)

(function(){
	var evts = ['testStart', 'testDone', 'moduleStart', 'moduleDone', 'done', 'log'], type;
	
	for (var i = 0; i < evts.length; i++) {
		type = evts[i];
		(function(type){
			QUnit[type] = function(data){
				steal.client.trigger(type, data);
			};
		})(type);
	}
})()
