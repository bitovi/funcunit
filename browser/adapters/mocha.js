steal('../core.js', function(FuncUnit) {
	var ok = function(expr, msg) {
		if(!expr) throw new Error(msg);
	};

	if(window.mocha) {
		FuncUnit.unit = {
			pauseTest: function() {},
			resumeTest: function() {},

			assertOK: function(assertion, message) {
				ok(assertion, message)
			},

			equiv: function(expected, actual) {
				//should this be === for tighter asserts?
				return expected == actual;
			}
		}
	}
});