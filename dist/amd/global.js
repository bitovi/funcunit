/*global*/
define(function (require, exports, module) {
    require('./funcunit');
    var FuncUnit = window.FuncUnit || {};
    window.jQuery = jQuery;
    module.exports = FuncUnit;
});