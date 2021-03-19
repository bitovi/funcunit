var QUnit = require("steal-qunit2");
var F = require("funcunit");

QUnit.module("scroll", {
	beforeEach : function() {
		F.open("//test/scroll.html", null, 10000) ;
	}
})

QUnit.test("scroll on click", async function(){
	await F('#innerdiv').click()
	await F("#scrolldiv").scrollTop(100, "Scrolled down 100")
	await F("#scrolldiv").scrollLeft(100, "Scrolled left 100")
})

QUnit.test("auto scrollleft", async function(){  
	await F("#scrolldiv").scroll('left', 100)
	await F('#scrolldiv').scrollLeft(100, 'scroll left worked')
})

QUnit.test("auto scrolldown", async function(){  
	await F("#scrolldiv").scroll('top', 100)
	await F('#scrolldiv').scrollTop(100, 'scroll top worked')
})
