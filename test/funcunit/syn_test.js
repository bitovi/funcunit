module("funcunit-syn integration")


test("Type and slow Click", function(){
	F.open("//test/myapp.html");
	F("#typehere").type("javascriptmvc")
	F("#seewhatyoutyped").text("typed javascriptmvc","typing");
	
	F("#copy").click();
	F("#seewhatyoutyped").text("copied javascriptmvc","copy");
	F("#seewhatyouchanged").text("changed javascriptmvc","change");
})

test("ctrl test", function(){
	F.open("//test/myapp.html");
	F("#typehere").type("abc[ctrl]ac[ctrl-up]", function(){
		equal(F("#typehere").val(), "abc");
	})
})

test("clipboard", function(){
	F.open("//test/myapp.html");
	F("#typehere").type("abc[ctrl]ac[ctrl-up][right][ctrl]v[ctrl-up]", function(){
		equal(F("#typehere").val(), "abcabc");
	})
})

test("Type and clear", function(){
	F.open("//test/myapp.html");
	F("#typehere").type("javascriptmvc").type("")
	F("#seewhatyoutyped").text("typed ","clear works");
})

test("Nested actions", function(){
	F.open("//test/myapp.html");
	
	F("#typehere").exists(function(){
		this.type("[ctrl]a\b[ctrl-up]javascriptmvc")
		F("#seewhatyoutyped").text("typed javascriptmvc","typing");
		F("#copy").click();
		F("#seewhatyoutyped").text("copied javascriptmvc","copy");
	})
})

test("Move To", function(){
	F.open("//test/drag/drag.html");
	F("#start").move("#end")
	F("#typer").type("javascriptmvc")
	F("#typer").val("javascriptmvc","move test worked correctly");

})

test("Drag To", function(){
	F.open("test/drag/drag.html");
	F("#drag").drag("#drop");
	F("#clicker").click();
	F(".status").text("dragged", 'drag worked correctly');
});

test("RightClick", function(){
	if(/Opera/.test(navigator.userAgent)){
		return;
	}
	F.open("//test/myapp.html", null, 10000);
	F("#rightclick").rightClick()
	F(".rightclickResult").text("Right Clicked", "rightclick worked")

})


test('Data',function(){
	F.open("//test/myapp.html");
	
	F('#testData').wait(function(){
		return F.win.jQuery(this).data('idval') === 1000;
	}, "Data value matched");
})