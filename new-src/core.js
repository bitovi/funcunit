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



// https://stackoverflow.com/questions/4754560/help-understanding-jquerys-jquery-fn-init-why-is-init-in-fn


const performAsyncQuery = function ( selector, frame, self ) {
    FuncUnit.add({
        method: function ( success, error ) {
            this.frame = frame;
            this.selector = selector;

            if (FuncUnit.win) {
                frame = getContext(frame);
            }

            // this.bind = new origFuncUnit( selector, frame, true );
            this.bind = new origFuncUnit.fn.init( selector, frame, true );
            success();
            return this;
        },
        error: `Selector failed: ${selector}`,
        type: 'query'
    });
}



const performSyncQuery = function ( selector, frame ) {
    const origFrame = frame;

    if (FuncUnit.win) {
        frame = getContext(frame);
    }

    // const result = new origFuncUnit( selector, frame, true );
    const result = new origFuncUnit.fn.init( selector, frame, true );

    result.frame = origFrame;

    return result;
}




const getContext = function ( context ) {
    let frame, frames, selector;

    if (typeof context === 'number' || typeof context === 'string') {
        selector = typeof context === 'number' ? `iframe:eq(${context})` : `iframe[name='${context}']`;
        frames = new origFuncUnit.fn.init(sel, FuncUnit.win.document.documentElement, true);
        frame = (frames.length ? frames.get(0).contentWindow : FuncUnit.win).document.documentElement;
    } else {
        frame = FuncUnit.win.document.documentElement;
    }

    return frame;
}




oldFuncUnit.jQuery.extend(FuncUnit, oldFuncUnit, origFuncUnit);

FuncUnit.prototype = origFuncUnit.prototype;

module.exports = FuncUnit;
