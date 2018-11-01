/*funcunit@3.5.0#browser/adapters/jasmine2*/
var FuncUnit = require('../core.js');
module.exports = function () {
    FuncUnit.timeout = 4900;
    return {
        pauseTest: function () {
        },
        resumeTest: function () {
        },
        assertOK: function (assertion) {
            expect(assertion).toBeTruthy();
        },
        equiv: function (expected, actual) {
            return expected == actual;
        }
    };
};