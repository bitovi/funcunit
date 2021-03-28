const syn = require("syn");

// For contains selector.
const Sizzle = require("sizzle");

const funcUnitPrototypeMethods = {
    // Actions
    click(){
        return simpleAsyncAction(this, syn.click);
    },

    // Traversers
    closest(selector){
        const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
            tester: function(targetElement){
                console.log("closest", targetElement, selector);
                return targetElement.closest(selector);
            },
            rejectReason: () => new Error("Unable to find closest "+selector)
        });
        return new this.constructor(executor);
    },
    find(selector){
        const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
            tester: function(targetElement){
                return  Sizzle(selector, targetElement)[0];
            },
            rejectReason: () => new Error("Unable to find "+selector)
        });
        return new this.constructor(executor);
    },

    // Getters
    hasClass(classToken, compareHasClass = true){
        const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
            tester: function(targetElement){
                return (targetElement.classList.contains(classToken) === compareHasClass) && targetElement;
            },
            rejectReason: () => new Error("Element never had "+classToken+" in classList")
        });
        return new this.constructor(executor);
    },

    visible(){
        const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
            tester: function(targetElement){
                return (!!(  elem.offsetHeight || elem.offsetWidth || elem.getClientRects().length )) && targetElement;
            },
            rejectReason: () => new Error("Element never visible")
        });
        return new this.constructor(executor);
    },

    text(){
        return simpleAsyncGetter(this, (el)=> el.textContent );
    }
};

const funcUnitStaticMethods = {
    async useWindow(url){
        var width = window.innerWidth;
        this.defaultWindow = window.open(url, "funcunit",  "height=1000,toolbar=yes,status=yes,left="+width/2);

        if(this.defaultWindow && this.defaultWindow.___FUNCUNIT_OPENED) {
            this.defaultWindow.close();
            this.defaultWindow = window.open(url, "funcunit",  "height=1000,toolbar=yes,status=yes,left="+width/2);
        }
        let stealDone = false;
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
                return stealDone ;
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

    Object.assign(FuncUnit.prototype,funcUnitPrototypeMethods);

    Object.assign(FuncUnit, funcUnitStaticMethods);
    return FuncUnit;
}





function getWindowFromElement(element){
    const doc = element.ownerDocument;
    return doc.defaultView || doc.parentWindow;
}

function getWindow(element, context) {

    if(element.nodeName) {
        return getWindowFromElement(element);
        const doc = element.ownerDocument;
        return doc.defaultView || doc.parentWindow;
    } else {
        if(!context) {
            return window;
        } else if(context.nodeName === "#document") {
            return getWindowFromElement(element);
        } else if(context.self === context) {
            return context;
        } else {
            throw new Error("can't find window")
        }
    }
}

function resolveWhenTrue(options) {
    return new Promise(makeExecutorToResolveWhenTrue(options))
}
function makeExecutorToResolveWhenTrue(options){
    return function(resolve, reject){
        checkTester(resolve, reject, options);
    }
}

function checkTester(resolve, reject, {
    interval = 10,
    timeout=10000,
    tester,
    resolveValue = (x) => x,
    rejectReason = () => new Error("Poller timeout"),
    testerArgument
}) {
    const start = new Date();
    function check(){
        let testerResult = tester(testerArgument)
        if(testerResult) {
            resolve(resolveValue(testerResult));
            return true
        } else if( (new Date() - start) > timeout ) {
            reject( rejectReason() )
        } else {
            setTimeout(check, interval);
        }
    }
    check();
}

function makeExecutorToResolveWhenTrueAfterPromiseResolves(promise, options) {
    return function(resolve, reject){
        promise.then(function(value){
            checkTester(resolve, reject, {...options, testerArgument: value});
        }, reject)
    }
}
function makeExecutorThatPerformsActionAfterPromise(promise, action) {
    return function(resolve, reject){
        promise.then(action, reject)
    }
}

function simpleAsyncAction(elementPromise, action) {

    return new elementPromise.constructor(function simpleAction(resolve, reject){
        elementPromise.then(function(element){
            action(element).then( ()=> {
                resolve(element);
            }, reject);
        }, reject);
    });
}

function simpleAsyncGetter(elementPromise, getter) {

    return new elementPromise.constructor(function simpleAction(resolve, reject){
        elementPromise.then(function(element){
            resolve( getter(element) );
        }, reject);
    });
}

module.exports = makeFuncUnit();

/*
class FuncUnit extends Promise {

    constructor(selector, context) {
        super((resolve, reject) => {
            el = document.querySelectorAll(selector);
            if (el) {
                resolve(el);
            } else {
                reject('Element not found');
            }
        })
    }

    async click() {
        const element = await this;
        await syn.click(element);
    }
}*/





// var oldFuncUnit = require("funcunit/browser/init");
// var origFuncUnit = oldFuncUnit.jQuery.sub();
// var FuncUnit = oldFuncUnit.jQuery.sub();

// FuncUnit = function ( selector, context ) {

//     this.selector = selector;
//     this.frame = context && context.frame ? context.frame : context;
//     this.forceSync = context && context.forceSync ? context.forceSync : undefined
//     this.isSyncOnly = typeof forceSync === 'boolean' ? forceSync : false;

//     if (typeof selector === 'function') {
//         return FuncUnit.wait(0, selector);
//     }

//     if (this.isSyncOnly) {
//         return performSyncQuery(this.selector, this.frame);
//     } else {
//         performAsyncQuery(this.selector, this.frame, this);
//         return performSyncQuery(this.selector, this.frame);
//     }
// }



// // https://stackoverflow.com/questions/4754560/help-understanding-jquerys-jquery-fn-init-why-is-init-in-fn


// const performAsyncQuery = function ( selector, frame, self ) {
//     FuncUnit.add({
//         method: function ( success, error ) {
//             this.frame = frame;
//             this.selector = selector;

//             if (FuncUnit.win) {
//                 frame = getContext(frame);
//             }

//             // this.bind = new origFuncUnit( selector, frame, true );
//             this.bind = new origFuncUnit.fn.init( selector, frame, true );
//             success();
//             return this;
//         },
//         error: `Selector failed: ${selector}`,
//         type: 'query'
//     });
// }



// const performSyncQuery = function ( selector, frame ) {
//     const origFrame = frame;

//     if (FuncUnit.win) {
//         frame = getContext(frame);
//     }

//     // const result = new origFuncUnit( selector, frame, true );
//     const result = new origFuncUnit.fn.init( selector, frame, true );

//     result.frame = origFrame;

//     return result;
// }




// const getContext = function ( context ) {
//     let frame, frames, selector;

//     if (typeof context === 'number' || typeof context === 'string') {
//         selector = typeof context === 'number' ? `iframe:eq(${context})` : `iframe[name='${context}']`;
//         frames = new origFuncUnit.fn.init(sel, FuncUnit.win.document.documentElement, true);
//         frame = (frames.length ? frames.get(0).contentWindow : FuncUnit.win).document.documentElement;
//     } else {
//         frame = FuncUnit.win.document.documentElement;
//     }

//     return frame;
// }




// oldFuncUnit.jQuery.extend(FuncUnit, oldFuncUnit, origFuncUnit);

// FuncUnit.prototype = origFuncUnit.prototype;

// module.exports = FuncUnit;
