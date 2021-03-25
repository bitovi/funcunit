var FuncUnit = require("funcunit/browser/core");

const traversers = [
    'closest',
    'next',
    'prev',
    'siblings',
    'last',
    'first',
    'find'
];




function makeTraverser ( name ) {

    const orig = FuncUnit.prototype[name];

    FuncUnit.prototype[name] = function ( selector ) {

        const args = arguments;

        // nodeType 9 is document node
        if (FuncUnit.win && this[0] && this[0].parentNode && this[0].parentNode.nodeType !== 9) {

            FuncUnit.add({
                method: function ( success, error ) {
                    const newBindFunc = orig.apply(this.bind, args);
                    newBindFunc.prevTraverser = name;
                    newBindFunc.prevTraverserSelector = selector;
                    success(newBindFunc);
                },
                error: `Could not traverse: ${name} ${selector}`,
                bind: this
            });
        }

        // returns jquery function with this context & arguments
        // return orig.apply(this, args);

        return new Promise((resolve, reject) => {

            resolve(orig.apply(this, args));

        });
    }

}



traversers.forEach( traverser => makeTraverser(traverser) );


module.exports = FuncUnit;
