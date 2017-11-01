/*funcunit@3.4.4#browser/adapters/mocha*/
var FuncUnit = require('../core.js');
var ok = function (expr, msg) {
    if (!expr)
        throw new Error(msg);
};
module.exports = function (mocha) {
    FuncUnit.timeout = 1900;
    return {
        pauseTest: function () {
        },
        resumeTest: function () {
        },
        assertOK: function (assertion, message) {
            ok(assertion, message);
        },
        equiv: function (expected, actual) {
            return expected == actual;
        }
    };
};