var QUnit = require("steal-qunit2");
var F = require("funcunit");

QUnit.module("funcunit - jQuery API",{
	beforeEach:function() {
		F.open("test/confirm.html")
	}
})

QUnit.test("confirm overridden", function() {
	F('#confirm').click();
	F('#confirm').text("I was confirmed", "confirm overridden");
});

QUnit.test("alert overridden", function() {
	F('#alert').click()
	F('#alert').text("I was alert", "alert overridden");
});
