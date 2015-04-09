/*funcunit@3.0.0#browser/adapters/adapters*/
var jasmineAdapter = require('./jasmine.js');
var qunitAdapter = require('./qunit.js');
var mochaAdapter = require('./mocha.js');
var FuncUnit = require('../core.js');
var noop = function () {
};
var defaultAdapter = {
        pauseTest: noop,
        resumeTest: noop,
        assertOK: noop,
        equiv: function (expected, actual) {
            return expected == actual;
        }
    };
FuncUnit.unit = defaultAdapter;
FuncUnit.attach = function (runner) {
    var unit;
    if (isQUnit(runner)) {
        unit = qunitAdapter(runner);
    } else if (isMocha(runner)) {
        unit = mochaAdapter(runner);
    } else if (isJasmine(runner)) {
        unit = jasmineAdapter(runner);
    } else {
        unit = defaultAdapter;
    }
    FuncUnit.unit = unit;
};
function isQUnit(runner) {
    return !!(runner.ok && runner.start && runner.stop);
}
function isMocha(runner) {
    return !!(runner.setup && runner.globals && runner.reporter);
}
function isJasmine(runner) {
    return !!(runner.getEnv && typeof window.waitsFor === 'function');
}
FuncUnit.detach = function () {
    FuncUnit.unit = defaultAdapter;
};