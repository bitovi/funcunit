/*funcunit@3.4.4#browser/adapters/qunit2*/
var FuncUnit = require('../core.js');
module.exports = function (QUnit) {
    var done;
    var currentTestAssert;
    var originalTest = QUnit.test;
    QUnit.test = function funcunitTest(title, test) {
        return originalTest(title, function (assert) {
            currentTestAssert = assert;
            return test.apply(this, arugments);
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
            return QUnit.equiv(expected, actual);
        }
    };
};