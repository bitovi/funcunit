const syn = require("syn");

const funcUnitActions = {
    click(){
        return simpleAsyncAction(this, syn.click);
    },

    rightClick() {
        return simpleAsyncAction(this, syn.rightClick);
    },

    dblClick() {
        return simpleAsyncAction(this, syn.dblclick);
    },

    scroll(direction, amount) {
        let func;

        if (direction === 'left' || direction === 'right') {
            func = function (el) {
                el.scrollLeft = amount;
                return el;
            }
        }

        if (direction === 'top' || direction === 'bottom') {
            func = function (el) {
                el.scrollTop = amount;
                return el;
            }
        }

        return simpleSyncAction(this, func);
    },

    drag() {
        return simpleAsyncActionWithArgs(this, syn.drag, arguments);
    },

    move() {
        return simpleAsyncActionWithArgs(this, syn.move, arguments);
    },

    type(text) {
        this.click();
        return simpleAsyncActionWithArgs(this, syn.type, arguments);
    },

    sendKeys(text) {
        return simpleAsyncActionWithArgs(this, syn.type, arguments);
    }
};


// Helper functions

function simpleAsyncActionWithArgs(elementPromise, action, args) {
    return new elementPromise.constructor(function simpleActionWithArgs(resolve, reject) {
        elementPromise.then(function (element) {
            action(element, ...args).then(() => resolve(element), reject);
        }, reject);
    });
}

function simpleAsyncAction(elementPromise, action) {
    return new elementPromise.constructor(function simpleAction(resolve, reject) {
        elementPromise.then(function (element){
            action(element).then(()=> resolve(element), reject);
        }, reject);
    });
}

function simpleSyncAction(elementPromise, action) {
    return new elementPromise.constructor(function simpleAction(resolve, reject) {
        elementPromise.then(function (element){
            resolve( action(element) );
        }, reject);
    });
}

module.exports = funcUnitActions;
