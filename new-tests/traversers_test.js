const QUnit = require("steal-qunit");
const F = require("funcunit/new-src/core");

QUnit.module("funcunit find closest",{
	beforeEach: async function(assert) {
		const done = assert.async();
		await F.useWindow(`${__dirname}/test-setup/qunit2_tests.html`);
		done();
	}
});

QUnit.test("closest", async function(assert){
	const done = assert.async();

	let element = await F("a:contains('Holler')").closest("#foo").click();
	assert.ok(element.classList.contains("iWasClicked"),"we clicked #foo");

	element = await F("a:contains('Holler')").closest(".baz").click();
	assert.ok(element.classList.contains("iWasClicked"),"we clicked .baz");

	done();
});

QUnit.test("find with traversers", async function(assert){
	const done = assert.async();

	await F(":contains('Holler')")
		.closest("#foo")
		.find(".combo")
		.hasClass("combo", true)
		.click();

	await F(".combo:eq(0)").hasClass("iWasClicked", true);
	assert.ok(true, "first was clicked");

	await F(".combo:eq(1)").hasClass("iWasClicked", false);
	assert.ok(true, "first was not clicked");

	done();
});
