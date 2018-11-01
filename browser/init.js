var jQuery = require("funcunit/browser/jquery");

var FuncUnit = window.FuncUnit || {};
var slice = Array.prototype.slice;

FuncUnit.init = function(sel, frame) {
	var root = frame || document;
	var elems = slice.call(root.querySelectorAll(sel));v
	var len = elems.length;
	for(var i = 0; i < len; i++) {
		this[i] = elems[i];
	}

	Object.defineProperty(this, "length", {
		value: len
	});
};

FuncUnit.init.prototype.each = function(fn) {
	var el;
	for(var i = 0, len = this.length; i < len; i++) {
		el = this[i];
		fn.call(el, i, el);
	}
};

FuncUnit.fn = FuncUnit.init.prototype;

FuncUnit.makeArray = function(items) {
	return slice.call(items);
};

/*
jQuery.sub = function() {
  function jQuerySub( selector, context ) {
    return new jQuerySub.fn.init( selector, context );
  }
  jQuery.extend( true, jQuerySub, this );
  jQuerySub.superclass = this;
  jQuerySub.fn = jQuerySub.prototype = this();
  jQuerySub.fn.constructor = jQuerySub;
  jQuerySub.sub = this.sub;
  jQuerySub.fn.init = function init( selector, context ) {
    if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
      context = jQuerySub( context );
    }

    return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
  };
  jQuerySub.fn.init.prototype = jQuerySub.fn;
  var rootjQuerySub = jQuerySub(document);
  return jQuerySub;
};

FuncUnit.jQuery = jQuery;*/
module.exports = FuncUnit;
