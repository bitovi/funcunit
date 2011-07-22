(function(){
	SeleniumQueue = []
	// in jstestdriver, this should stringify and use window.postMessage
	var sendMessage = function(data){
		SeleniumQueue.push(data);
	}
	
	var evts = ['testStart',
		'testDone',
		'moduleStart',
		'moduleDone',
		'done', 
		'log'], 
		type;
		
	for(var i=0; i<evts.length; i++){
		type = evts[i];
		(function(type){
			QUnit[type] = function(data, d2, d3){
				sendMessage({
					type: type,
					data: data,
					d2: d2, 
					d3: d3
				})
			};
		})(type)
	}
})()