// const syn = window.syn = require("syn");

class FuncUnitPromise extends Promise {
    constructor() {}

    async click() {
        await syn.click(this);
    }
}

function F (selector, context) {
    return new Promise((resolve, reject) => {
        const el = document.querySelectorAll(selector);
        if (el.length) {
            resolve(el);
        } else {
            reject(`Element not found: ${selector}`);
        }
    })
}

console.log('loaded');

F('.the-div').then(console.log);
