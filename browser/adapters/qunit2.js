module.exports = function(runner) {
	var done;

	/*
		QUnit2 does not expose a generic `assert`.
		It is only accessible within each test.
		Thus we need to intercept the assert
		from each test in order to start/stop/ok.
	*/
	var currentTestAssert;
	var originalTest = runner.test;
	runner.test = function funcunitTest (title, test) {
		return originalTest(title, function (assert) {
			currentTestAssert = assert;
			return test.apply(this, arguments);
		});
	}

	return {
		pauseTest:function(){
			done = currentTestAssert.async();
		},
		resumeTest: function(){
			done();
		},
		assertOK: function(assertion, message){
			currentTestAssert.ok(assertion, message)
		},
		equiv: function(expected, actual){
			return runner.equiv(expected, actual);
		}
	};
};
