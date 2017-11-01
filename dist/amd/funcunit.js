/*funcunit*/
define(function (require, exports, module) {
    var syn = require('syn');
    var FuncUnit = require('./browser/core');
    require('./browser\\adapters/adapters');
    require('./browser/open');
    require('./browser/actions');
    require('./browser/getters');
    require('./browser/traversers');
    require('./browser/queue');
    require('./browser/waits');
    window.FuncUnit = window.S = window.F = FuncUnit;
    module.exports = FuncUnit;
});