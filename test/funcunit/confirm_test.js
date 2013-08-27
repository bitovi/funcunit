module("funcunit - jQuery API",{
	setup: function() {
		F.open("//funcunit/test/confirm.html")
	}
})

test("confirm overridden", function(){
	F('#confirm').click()
	F('#confirm').text("I was confirmed");
});

test("alert overridden", function(){
	F('#alert').click()
	F('#alert').text("I was alert");
});