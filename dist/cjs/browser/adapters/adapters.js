/*funcunit@3.4.4#browser/adapters/adapters*/
var jasmineAdapter = require('./jasmine.js');
var jasmine2Adapter = require('./jasmine2.js');
var qunitAdapter = require('./qunit.js');
var qunit2Adapter = require('./qunit2.js');
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
    } else if (isQUnit2(runner)) {
        unit = qunit2Adapter(runner);
    } else if (isMocha(runner)) {
        unit = mochaAdapter(runner);
    } else if (isJasmine(runner)) {
        unit = jasmineAdapter(runner);
    } else if (isJasmine2(runner)) {
        unit = jasmine2Adapter(runner);
    } else {
        unit = defaultAdapter;
    }
    FuncUnit.unit = unit;
};
function isQUnit(runner) {
    return !!(runner.ok && runner.start && runner.stop);
}
function isQUnit2(runner) {
    return !!(runner.assert && runner.assert.ok && runner.assert.async);
}
function isMocha(runner) {
    return !!(runner.setup && runner.globals && runner.reporter);
}
function isJasmine(runner) {
    return !!(runner.getEnv && typeof window.waitsFor === 'function');
}
function isJasmine2(runner) {
    return !!(runner.getEnv && typeof runner.clock === 'function' && !window.waitsFor);
}
FuncUnit.detach = function () {
    FuncUnit.unit = defaultAdapter;
};