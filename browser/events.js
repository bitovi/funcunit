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
})();
