const {
    makeExecutorToResolveWhenTrueAfterPromiseResolves
} = require('./helpers');

const funcUnitGetters = {
    hasClass(classToken, compareHasClass = true) {
        const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
            tester: targetElement => (targetElement.classList.contains(classToken) === compareHasClass) && targetElement,
            rejectReason: () => new Error(`Element never had ${classToken} in classList`)
        });
        return new this.constructor(executor);
    },

    visible() {
        const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
            tester: targetElement => !!( targetElement.offsetHeight || targetElement.offsetWidth || targetElement.getClientRects().length ),
            rejectReason: () => new Error('Element was never visible')
        });
        return new this.constructor(executor);
    },

    val(newVal) {
        if (arguments.length) {
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => targetElement.value === newVal,
                rejectReason: () => new Error(`Element never had value: ${newVal}`)
            });
            return new this.constructor(executor);
        } else {
            return simpleAsyncGetter(this, el => el.value);
        }
    },

    text(waitForText) {
        if (arguments.length) {
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => targetElement.textContent === waitForText,
                rejectReason: () => new Error(`Element never had text: ${waitForText}`)
            });
            return new this.constructor(executor);
        } else {
            return simpleAsyncGetter(this, el => el.textContent);
        }
    },

    height(expectedHeight) {
        if (arguments.length) {
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => calculateHeight(targetElement) === expectedHeight,
                rejectReason: () => new Error(`Element never had a height of ${expectedHeight}`)
            });
            return new this.constructor(executor);
        } else {
            return simpleAsyncGetter(this, calculateHeight);
        }
    },

    width(expectedWidth) {
        if (arguments.length) {
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => calculateWidth(targetElement) === expectedWidth,
                rejectReason: () => new Error(`Element never had a width of ${expectedWidth}`)
            });
            return new this.constructor(executor);
        } else {
            return simpleAsyncGetter(this, calculateWidth);
        }
    },

    innerHeight(expectedHeight) {
        if (arguments.length) {
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => calculateInnerHeight(targetElement) === expectedHeight,
                rejectReason: () => new Error(`Element never had an innerHeight of ${expectedHeight}`)
            });
            return new this.constructor(executor);
        } else {
            return simpleAsyncGetter(this, calculateInnerHeight);
        }
    },

    innerWidth(expectedWidth) {
        if (arguments.length) {
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => calculateInnerWidth(targetElement) === expectedWidth,
                rejectReason: () => new Error(`Element never had an innerWidth of ${expectedWidth}`)
            });
            return new this.constructor(executor);
        } else {
            return simpleAsyncGetter(this, calculateInnerWidth);
        }
    },

    outerHeight() {
        if (!arguments.length) {
            // return outerHeight with no margin
            return simpleAsyncGetter(this, calculateOuterHeight);

        } else if (arguments.length === 1 && typeof arguments[0] === 'boolean') {
            // return outerHeight with margin
            return simpleAsyncGetter(this, el => calculateOuterHeight(el, true));

        } else if (arguments.length === 1 && typeof arguments[0] === 'number') {
            // return outerHeight comparison with no margin
            const expectedHeight = arguments[0];
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => calculateOuterHeight(targetElement) === expectedHeight,
                rejectReason: () => new Error(`Element never had an outerHeight of ${expectedHeight}`)
            });
            return new this.constructor(executor);

        } else {
            // return outerHeight comparison with margin (2 arguments)
            const expectedHeight = arguments[0];
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => calculateOuterHeight(targetElement, true) === expectedHeight,
                rejectReason: () => new Error(`Element never had an outerHeight (margin=true) of ${expectedHeight}`)
            });
            return new this.constructor(executor);
        }
    },

    outerWidth() {
        if (!arguments.length) {
            // return outerWidth with no margin
            return simpleAsyncGetter(this, calculateOuterWidth);

        } else if (arguments.length === 1 && typeof arguments[0] === 'boolean') {
            // return outerWidth with margin
            return simpleAsyncGetter(this, el => calculateOuterWidth(el, true));

        } else if (arguments.length === 1 && typeof arguments[0] === 'number') {
            // return outerWidth comparison with no margin
            const expectedWidth = arguments[0];
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => calculateOuterWidth(targetElement) === expectedWidth,
                rejectReason: () => new Error(`Element never had an outerWidth of ${expectedWidth}`)
            });
            return new this.constructor(executor);

        } else {
            // return outerWidth comparison with margin (2 arguments)
            const expectedWidth = arguments[0];
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: targetElement => calculateOuterWidth(targetElement, true) === expectedWidth,
                rejectReason: () => new Error(`Element never had an outerWidth (margin=true) of ${expectedWidth}`)
            });
            return new this.constructor(executor);
        }
    },

    scrollTop(distance) {
        if (arguments.length) {
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: function(targetElement) {
                    return targetElement && targetElement.scrollTop === distance;
                },
                rejectReason: () => new Error(`Element never reached scrollTop of ${distance}`)
            });
            return new this.constructor(executor);

        } else {
            return simpleAsyncGetter(this, el => el.scrollTop);
        }
    },

    scrollLeft(distance) {
        if (arguments.length) {
            const executor = makeExecutorToResolveWhenTrueAfterPromiseResolves(this, {
                tester: function(targetElement) {
                    return targetElement && targetElement.scrollLeft === distance;
                },
                rejectReason: () => new Error(`Element never reached scrollLeft of ${distance}`)
            });
            return new this.constructor(executor);

        } else {
            return simpleAsyncGetter(this, el => el.scrollLeft);
        }
    }
};


// Helper functions

function simpleAsyncGetter(elementPromise, getter) {
    return new elementPromise.constructor(function simpleAction(resolve, reject){
        elementPromise.then(function(element){
            resolve( getter(element) );
        }, reject);
    });
}

function getDimension(element, add, subtract = []) {
    const styles = getComputedStyle(element);
    
    const sum = add.reduce((total, property) => {
        return total + parseFloat(styles[property], 10)
    }, 0);

    return subtract.reduce((total, property) => {
        return total - parseFloat(styles[property]);
    }, sum);
}

function calculateHeight(element) {
    return getDimension(element, ['height'], ['padding-top', 'padding-bottom']);
}

function calculateInnerHeight(element) {
    return getDimension(element, ['height']);
}

function calculateOuterHeight (element, includeMargin = false) {
    const addProperties = ['height', 'border-top', 'border-bottom'];
    if (includeMargin) {
        addProperties.push('margin-top');
        addProperties.push('margin-bottom');
    }
    return getDimension(element, addProperties);
}

function calculateWidth(element) {
    return getDimension(element, ['width'], ['padding-left', 'padding-right']);
}

function calculateInnerWidth(element) {
    return getDimension(element, ['width']);
}

function calculateOuterWidth(element, includeMargin = false) {
    const addProperties = ['width', 'border-left', 'border-right'];
    if (includeMargin) {
        addProperties.push('margin-left');
        addProperties.push('margin-right');
    }
    return getDimension(element, addProperties);
}


module.exports = funcUnitGetters;
