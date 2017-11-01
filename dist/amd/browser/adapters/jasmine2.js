/*funcunit@3.4.4#browser/adapters/jasmine2*/
define(function (require, exports, module) {
    var FuncUnit = require('../core');
    module.exports = function (jasmine) {
        FuncUnit.timeout = 4900;
        return {
            pauseTest: function () {
            },
            resumeTest: function () {
            },
            assertOK: function (assertion, message) {
                expect(assertion).toBeTruthy();
            },
            equiv: function (expected, actual) {
                return expected == actual;
            }
        };
    };
});