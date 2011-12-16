(function(){
	var testMatch = location.search.match(/test=([^\&]*)/);
	if(testMatch){
		steal("funcunit").then(function(){
			if(top.Dashboard && top.Dashboard.currentTests){
				QUnit.config.filter = top.Dashboard.currentTests.join(",");
			}
		}, testMatch[1], function(){
			if(steal.instrument){
				QUnit.done(function(){
					var stats = steal.instrument.compileStats()
					top.Dashboard && top.Dashboard.coverage(stats);
				})
			}
			
			var evts = ['begin', 'testStart', 'testDone', 'moduleStart', 'moduleDone', 'done', 'log'];
			for(var i=0; i<evts.length; i++){
				(function(evt){
					QUnit[evt](function(d){
						top.Dashboard && top.Dashboard[evt] && top.Dashboard[evt](d);
					})
				})(evts[i]);
			}
			
		})
	}

})();