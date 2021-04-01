const Sizzle = require("sizzle");
const {
    makeExecutorToResolveWhenTrueAfterPromiseResolves
} = require('./helpers');

const funcUnitTraversers = {
    closest(selector){
        const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
            tester: targetElement => targetElement.closest(selector),
            rejectReason: () => new Error(`Unable to find closest ${selector}`)
        });
        return new this.constructor(executor);
    },

    find(selector){
        const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
            tester: targetElement => Sizzle(selector, targetElement)[0],
            rejectReason: () => new Error(`Unable to find ${selector}`)
        });
        return new this.constructor(executor);
    }
};

module.exports = funcUnitTraversers;
