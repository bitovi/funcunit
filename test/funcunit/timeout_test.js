module("Funcunit Timeouts", {
	setup: function () {
		S.open("//funcunit/test/timeouts.html", null, 10000);
	}
});

test("Ensure timeout fires for simple methods (simple wait methods are defined in FuncUnit.funcs). - attr", function () {

	var attrNode = S("#attr");

	equals(attrNode.attr('title'), "off", "test precondition was met");

	attrNode.click();

	attrNode.attr("title", "on", function () {
		ok(false, 'timeout should have cought this');
	}, 100, true);

});

test("Ensure simple methods works with custom timeout. - attr", function () {

	var attrNode = S("#attr");

	equals(attrNode.attr('title'), "off", "test precondition was met");

	attrNode.click();

	attrNode.attr("title", "on", function () {
		equals(attrNode.attr('title'), "on", "attr actually waits")
	}, 1000);

});


test("Ensure simple methods works with default timeout. - attr", function () {

	var attrNode = S("#attr");

	equals(attrNode.attr('title'), "off", "test precondition was met");

	attrNode.click();

	attrNode.attr("title", "on", function () {
		equals(attrNode.attr('title'), "on", "attr actually waits")
	});

});

test("custom timeout works for the visible wait function", function () {

	var makeVisible = S("#makeVisible"),
		visibleNode = S('#visible');

	makeVisible.click();

	visibleNode.visible(function () {
		ok(false, 'timeout should have cought this');
	}, 100, true);

});

test("visible wait function works with defauls", function () {

	var makeVisible = S("#makeVisible"),
		visibleNode = S('#visible');

	makeVisible.click();

	visibleNode.visible(function () {
		equals(S('#visible:visible').size(), 1, "visible waits as expected");
	});

});

test("custom timeout works for the exists wait function", function () {

	var create = S("#create");

	create.click();

	S('#exist').exists(function () {
		ok(false, 'timeout should have cought this');
	}, 100, true);

});

test("exists wait function works with defaults", function () {

	var create = S("#create");

	create.click();

	S('#exist').exists(function () {
		equals(S('#exist').size(), 1, 'exists waits as expected');
	});

});

test("custom timeout works for the missing wait function", function () {

	var kill = S("#kill");
	soonToBeMissing = S('#soonToBeMissing');

	kill.click();

	soonToBeMissing.missing(function () {
		ok(false, 'timeout should have cought this');
	}, 100, true);

});

test("missing wait function works with defaults", function () {

	var kill = S("#kill");
	soonToBeMissing = S('#soonToBeMissing');

	kill.click();

	soonToBeMissing.missing(function () {
		equals(soonToBeMissing.size(), 0, 'missing waits as expected');
	});

});

test("custom timeout work for the invisible wait function", function () {

	var hide = S("#hide");
	invisible = S('#invisible');

	hide.click();

	invisible.invisible(function () {
		ok(false, 'timeout should have cought this');
	}, 100, true);

});

test("invisible wait function works with defaults", function () {

	var hide = S("#hide");
	invisible = S('#invisible');

	hide.click();

	invisible.invisible(function () {
		equals(S('#invisible:visible').size(), 0, 'missing waits as expected');
	});

});