/*funcunit@3.5.0#browser/adapters/qunit2*/
define(function (require, exports, module) {
    module.exports = function (runner) {
        var done;
        var currentTestAssert;
        var originalTest = runner.test;
        runner.test = function funcunitTest(title, test) {
            return originalTest(title, function (assert) {
                currentTestAssert = assert;
                return test.apply(this, arguments);
            });
        };
        return {
            pauseTest: function () {
                done = currentTestAssert.async();
            },
            resumeTest: function () {
                done();
            },
            assertOK: function (assertion, message) {
                currentTestAssert.ok(assertion, message);
            },
            equiv: function (expected, actual) {
                return runner.equiv(expected, actual);
            }
        };
    };
});