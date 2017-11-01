/*funcunit@3.4.4#browser/init*/
var jQuery = require('./jquery.js');
var FuncUnit = window.FuncUnit || {};
jQuery.sub = function () {
    function jQuerySub(selector, context) {
        return new jQuerySub.fn.init(selector, context);
    }
    jQuery.extend(true, jQuerySub, this);
    jQuerySub.superclass = this;
    jQuerySub.fn = jQuerySub.prototype = this();
    jQuerySub.fn.constructor = jQuerySub;
    jQuerySub.sub = this.sub;
    jQuerySub.fn.init = function init(selector, context) {
        if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
            context = jQuerySub(context);
        }
        return jQuery.fn.init.call(this, selector, context, rootjQuerySub);
    };
    jQuerySub.fn.init.prototype = jQuerySub.fn;
    var rootjQuerySub = jQuerySub(document);
    return jQuerySub;
};
FuncUnit.jQuery = jQuery;
module.exports = FuncUnit;