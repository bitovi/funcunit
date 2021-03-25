var $ = require("funcunit/browser/jquery");
var FuncUnit = require("funcunit/browser/core");

FuncUnit.funcs = {
    size: 0,
    attr: 1,
    hasClass: 1,
    html: 0,
    text: 0,
    val: 0,
    css: 1,
    prop: 1,
    offset: 0,
    position: 0,
    scrollTop: 0,
    scrollLeft: 0,
    height: 0,
    width: 0,
    innerHeight: 0,
    innerWidth: 0,
    outerHeight: 0,
    outerWidth: 0
};

function makeFunction ( name, expectedNumberOfArgs ) {

    FuncUnit.prototype[name] = function () {
        const timeToWait = 1000;
        const argsToReadWith = arguments.slice(0, expectedNumberOfArgs);
        const argsToCheckAgainst = arguments[expectedNumberOfArgs + 1];
        const startTime = new Date();

        pollForValue( function() {
            if (this.elements[name](...arguments.slice(0,1)) === arguments[1]) {
            
            }
        })
    
        return new Promise((resolve, reject) => {
    
            const check = () => {
                return $(this.selector, this.frame)[name](...argsToReadWith) === argToCheckAgainst;
            };
    
            const checker = () => {
                if (new Date() > startTime + timeToWait) {
                    clearTimeout();
                    reject(new Error());
                }
    
                if (check()) {
                    clearTimeout();
                    resolve();
                } else {
                    setTimeout(checker, 10);
                }
            };
    
            setTimeout(checker);
        });
    };

}

for (const prop in FuncUnit.funcs) {
    makeFunction(prop, FuncUnit.funcs[prop]);
}

module.exports = FuncUnit;
