steal('funcunit/qunit/print.js').then(function(){
	if (typeof navigator !== "undefined" && navigator.userAgent.match(/Rhino/)) {
		//map QUnit messages to FuncUnit
		['log',
			'testStart',
			'testDone',
			'moduleStart',
			'moduleDone',
			'done'].forEach(function(item){
				QUnit[item] = function(){
					QUnitPrint[item].apply(FuncUnit, arguments);
				};
				
			})
	}
})