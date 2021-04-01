var QUnit = require("steal-qunit2");
var F = require("funcunit");

QUnit.module("scroll", {
	beforeEach : function() {
		F.open("//test/scroll.html", null, 10000) ;
	}
})

QUnit.test("scroll on click", function(){
	F('#innerdiv').click()
	F("#scrolldiv").scrollTop(100, "Scrolled down 100")
	F("#scrolldiv").scrollLeft(100, "Scrolled left 100")
})

QUnit.test("auto scrollleft", function(){  
	F("#scrolldiv").scroll('left', 100)
	F('#scrolldiv').scrollLeft(100, 'scroll left worked')
})

QUnit.test("auto scrolldown", function(){  
	F("#scrolldiv").scroll('top', 100)
	F('#scrolldiv').scrollTop(100, 'scroll top worked')
})
