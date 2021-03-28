// const syn = window.syn = require("syn");
var QUnit = require("steal-qunit");
var F = require("funcunit/new-src/core");

QUnit.module("funcunit - jQuery conflict")

QUnit.test("basics", async function(assert){
	var button = document.createElement("button");
	button.innerHTML = "click";
	button.onclick = () => button.innerHTML = "clicked";

	document.querySelector("#qunit-fixture").append(button);


	await F("#qunit-fixture button").click();

	assert.equal(button.innerHTML, "clicked");
});

require("./find_closest_test");

/*
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
*/
