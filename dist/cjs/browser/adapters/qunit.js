/*funcunit@3.1.0-pre.1#browser/adapters/qunit*/
module.exports = function (QUnit) {
    return {
        pauseTest: function () {
            QUnit.stop();
        },
        resumeTest: function () {
            QUnit.start();
        },
        assertOK: function (assertion, message) {
            QUnit.ok(assertion, message);
        },
        equiv: function (expected, actual) {
            return QUnit.equiv(expected, actual);
        }
    };
};