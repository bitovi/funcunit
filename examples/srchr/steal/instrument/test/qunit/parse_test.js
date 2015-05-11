steal.options = steal.options || {};

steal.options.instrument = ["funcunit"];
steal("funcunit/qunit")
.then("steal/instrument").then(function(){

module("parse");
test("parse testing works", function(){
	stop();
	steal("steal/instrument/test/code.js", function(){
		var path = steal.URI(steal.config().root.add("steal/instrument/test/code.js")).path,
			file = steal.instrument.files[path];
		equals(file.nbrBlocks, 3)
		equals(file.nbrLines, 4)
		equals(file.blocksCovered[0], 1)
		equals(file.blocksCovered[1], 1)
		equals(file.blocksCovered[2], 0)
		var stats = steal.instrument.compileStats();
		equals(stats.total.lineCoverage, 0.75)
		equals(stats.total.blockCoverage, 2/3)
		start();
	})
});

})