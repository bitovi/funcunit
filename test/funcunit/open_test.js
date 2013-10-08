module("funcunit-open")

test('F.open accepts a window', function() {
	F.open(window);
	F('#tester').click();
	F("#tester").text("Changed", "Changed link")
	
	F.open(frames["myapp"]);
	F("#typehere").type("").type("javascriptmvc")
	F("#seewhatyoutyped").text("typed javascriptmvc","typing");
})



test("Back to back opens", function(){
	F.open("//test/myotherapp.html");
	F.open("//test/myapp.html");

	F("#changelink").click()
	F("#changelink").text("Changed","href javascript run")
})


test("Back to back opens with hash", function(){
	F.open("test/myapp.html?bar#foo");
	F("#changelink").click();
	F("#changelink").text("Changed", "href javascript run");
	
	F.open("test/myapp.html?bar#foo2");
	F("#changelink").text("Change", "reload with hash works");
})

test('Testing win.confirm in multiple pages', function() {
	F.open('//test/open/first.html');
	F('.next').click();

	F('.show-confirm').click();
	F.confirm(true);
	F('.results').text('confirmed!', "Confirm worked!");
})