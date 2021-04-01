const QUnit = require("steal-qunit");
const F = require("funcunit/new-src/core");

QUnit.module("funcunit - jQuery conflict")

QUnit.test("basics", async function(assert){
	const button = document.createElement("button");
	button.innerHTML = "click";
	button.onclick = () => button.innerHTML = "clicked";

	document.querySelector("#qunit-fixture").append(button);

	await F("#qunit-fixture button").click();

	assert.equal(button.innerHTML, "clicked");
});

require('./actions_test');
require('./getters_test');
require("./traversers_test");
require('./dialogs_test');
require('./open_test');
