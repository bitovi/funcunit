//console.log('running qunit');
steal("funcunit/qunit")
	.then("steal/less/less_test.js")
	.then('./one.css','../two.css')
	.then("./steal_test.js","./loadtwice.js").then(function(){
		ORDERNUM.push('func')
	})
	.then('./loadtwice')
	.then("steal/test/package")
	.then("steal/test/package/uses.js")