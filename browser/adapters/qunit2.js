module.exports = function (runner) {
	var doneStack = [];
	//var _async = QUnit.assert.async; // disallow override; bug or feature? (currently: allowing override)
	var getCurrentAssert = function () {
		if (runner.config.current) {
			return runner.config.current.assert;
		}
		throw new Error("Outside of test context");
	}
	return {
		pauseTest: function () {
			//doneStack.push(QUnit.assert.async.call(getCurrentAssert()));
			doneStack.push(getCurrentAssert().async());
		},
		resumeTest: function () {
			doneStack.pop()();
		},
		assertOK: function (assertion, message) {
			getCurrentAssert().ok(assertion, message);
		},
		equiv: function (expected, actual) {
			return runner.equiv(expected, actual);
		}
	};
};