var FuncUnit = require("funcunit/browser/core");

module.exports = function(QUnit){
	var done;

	/*
		QUnit2 does not expose a generic `assert`.
		It is only accessible within each test.
		Thus we need to intercept the assert
		from each test in order to start/stop/ok.
	*/
	var currentTestAssert;
	var originalTest = QUnit.test;
	QUnit.test = function funcunitTest (title, test) {
		return originalTest(title, function (assert) {
			currentTestAssert = assert;
			return test.apply(this, arugments);
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
			return QUnit.equiv(expected, actual);
		}
	};
};
