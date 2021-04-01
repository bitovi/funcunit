const Sizzle = require("sizzle");

const {
    resolveWhenTrue,
    makeExecutorToResolveWhenTrue
} = require('./helpers');

const funcUnitActions = require('./actions');
const funcUnitGetters = require('./getters');
const funcUnitTraversers = require('./traversers');

const funcUnitPrototypeMethods = {
    ...funcUnitActions,
    ...funcUnitGetters,
    ...funcUnitTraversers
};

function makeFuncUnit(defaultWindow) {

    function FuncUnit(selector, context) {
        let executor;
        if(typeof selector === "string") {
            let win = getWindow(selector, context || FuncUnit.defaultWindow);

            executor = makeExecutorToResolveWhenTrue({
                tester: function(){
                    var documentElement = win.document.documentElement;

                    if(!documentElement) {
                        return undefined;
                    }
                    var results = Sizzle(selector, documentElement);
                    // contains will return multiple elements nested inside each other, this helps take the right
                    // one.

                    return takeFirstDeepestChild(results);
                },
                rejectReason: () => new Error("Unable to find "+selector)
            })
        } else if(typeof selector === "function") {
            executor = selector;
        } else {
            throw "arguments not understood";
        }
        return Reflect.construct(Promise, [executor], FuncUnit);
    };

    FuncUnit.defaultWindow = defaultWindow;

    Object.assign(
        FuncUnit,
        Object.fromEntries(
            Reflect.ownKeys(Promise)
                .filter(key => key !== "length" && key !== "name")
                .map(key => [key, Promise[key]])
        )
    );
    // Create the prototype, add methods to it
    FuncUnit.prototype = Object.create(Promise.prototype);
    FuncUnit.prototype.constructor = FuncUnit;

    Object.assign(FuncUnit.prototype, funcUnitPrototypeMethods);

    Object.assign(FuncUnit, funcUnitStaticMethods);
    return FuncUnit;
}

const funcUnitStaticMethods = {
    async useWindow(url){
        var width = window.innerWidth;
        this.defaultWindow = window.open(url, "funcunit",  "height=1000,toolbar=yes,status=yes,left="+width/4);

        if(this.defaultWindow && this.defaultWindow.___FUNCUNIT_OPENED) {
            this.defaultWindow.close();
            this.defaultWindow = window.open(url, "funcunit",  "height=1000,toolbar=yes,status=yes,left="+width/4);
        }
        let stealDone = false, ready = false;

        setTimeout(() => ready = true, 333);

        await resolveWhenTrue({
            tester: () => {


                // make sure there is a document
                if(!this.defaultWindow.document.documentElement) {
                    return;
                }
                if( this.defaultWindow.document.readyState !== "complete" ||
                         this.defaultWindow.location.href === "about:blank" ||
                         !this.defaultWindow.document.body ) {
                     return;
                }
                this.defaultWindow.___FUNCUNIT_OPENED = true;

                // wait for steal to fully load
                if( this.defaultWindow.steal ) {
                    this.defaultWindow.steal.done().then(() => {
                        stealDone = true;
                    });
                } else {
                    stealDone = true;
                }
                return stealDone && ready;
            }
        })
        return this;
    }
}

function takeFirstDeepestChild(elements){
    var cur = elements[0];
    var index = 1;
    var next;
    while(next = elements[index]) {
        if(!next) {
            return cur;
        }
        if(! cur.contains(next) ) {
            return cur;
        } else {
            cur = next;
            index++;
        }
    }
    return cur;
}

function getWindowFromElement(element){
    const doc = element.ownerDocument;
    return doc.defaultView || doc.parentWindow;
}

function getWindow(element, context) {

    if (element.nodeName) {
        return getWindowFromElement(element);
    } else {
        if (!context) {
            return window;
        } else if (context.nodeName === "#document") {
            return getWindowFromElement(element);
        } else if (context.self === context) {
            return context;
        } else {
            throw new Error("can't find window")
        }
    }
}

module.exports = makeFuncUnit();
