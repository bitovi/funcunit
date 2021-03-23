var oldFuncUnit = require("funcunit/browser/init");
var origFuncUnit = oldFuncUnit.jQuery.sub();
var FuncUnit = oldFuncUnit.jQuery.sub();

FuncUnit = function ( selector, context ) {

    this.selector = selector;
    this.frame = context && context.frame ? context.frame : context;
    this.forceSync = context && context.forceSync ? context.forceSync : undefined
    this.isSyncOnly = typeof forceSync === 'boolean' ? forceSync : false;

    if (typeof selector === 'function') {
        return FuncUnit.wait(0, selector);
    }

    if (this.isSyncOnly) {
        return performSyncQuery(this.selector, this.frame);
    } else {
        performAsyncQuery(this.selector, this.frame, this);
        return performSyncQuery(this.selector, this.frame);
    }
}




// Add async query to FuncUnit queue
var performAsyncQuery = function ( selector, frame, self ) {
    FuncUnit.add({
        method: function () {},
        error: `selector failed: ${selector}`,
        type: 'query'
    });
}




// Perform sync query
var performSyncQuery = function ( selector, frame ) {
    const origFrame = frame;

    if (FuncUnit.win) {
        frame = getContext(frame);
    }

    const result = new origFuncUnit.fn.init( selector, frame, true );
    result.frame = origFrame;

    return result;
}




// helper
var getContext = function ( context ) {
    let frame, frames, selector;

    if (typeof context === 'number' || typeof context === 'string') {
        selector = typeof context === "number" ? "iframe:eq(" + context + ")" : "iframe[name='" + context + "']";
        frames = new origFuncUnit.fn.init(sel, FuncUnit.win.document.documentElement, true);
    } else {
        frame = FuncUnit.win.document.documentElement;
    }

    return frame;
}




oldFuncUnit.jQuery.extend(FuncUnit, oldFuncUnit, origFuncUnit);

FuncUnit.prototype = origFuncUnit.prototype;

module.exports = FuncUnit;
