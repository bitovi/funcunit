/*funcunit@3.5.0#browser/adapters/jasmine2*/
define(function (require, exports, module) {
    var FuncUnit = require('../core');
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
});