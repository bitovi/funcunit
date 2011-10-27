module("funcunit - jQuery API",{
	setup: function() {
		S.open("//funcunit/test/confirm.html")
	}
})

test("confirm overridden", function(){
	S('#confirm').exists().click()
	S('#confirm').text("I was confirmed");
});

test("alert overridden", function(){
	S('#alert').exists().click()
	S('#alert').text("I was alert");
});