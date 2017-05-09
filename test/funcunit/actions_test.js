var QUnit = require("steal-qunit");
var F = require("funcunit");
var $ = require('jquery');

QUnit.module("scroll", {
   setup:function() {
      F.open("//test/actions.html", null, 10000);
   }
});

test("scroll on click", function(){
	F('#innerdiv').click();
	F("#scrolldiv").scrollTop(100, "Scrolled down 100");
	F("#scrolldiv").scrollLeft(100, "Scrolled left 100");
});

test("auto scrollleft", function(){  
	F("#scrolldiv").scroll('left', 100);
	F('#scrolldiv').scrollLeft(100, 'scroll left worked');
});

test("auto scrolldown", function(){  
	F("#scrolldiv").scroll('top', 100);
	F('#scrolldiv').scrollTop(100, 'scroll top worked');
});

test("blur element", function(assert){
	var $input = F("#input2").click({}, function(){
		F("#input1").blur(function(){
			assert.equal($input.is(':focus'), false);
		});
	});
});