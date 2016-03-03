/*funcunit@3.1.0-pre.1#browser/adapters/jasmine2*/
define(function (require, exports, module) {
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
                expect(actual).toEqual(expected);
                return expected === actual;
            }
        };
    };
});