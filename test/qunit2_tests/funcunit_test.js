var QUnit = require("steal-qunit2");
var F = require("funcunit");

QUnit.module("funcunit - jQuery API",{
	beforeEach: function() {
		var self = this;
		F.open("test/myapp.html", function(){
			self.pageIsLoaded = true;
		})
	}
})

QUnit.test("qUnit module setup works async", function(){
	QUnit.assert.ok(this.pageIsLoaded, "page is loaded set before")
})

QUnit.test("Iframe access", function(){
	var frame = 0;
	F("h2", frame).exists(function(){
		QUnit.assert.equal(F("h2", frame).text(), "Goodbye World", "text of iframe");
	});
})

QUnit.test("typing alt and shift characters", function(){
	F('#typehere').type("@", function(){
		QUnit.assert.equal(F('#typehere').val(), "@", "types weird chars" );
	})
})

// Note: Stopped working with QUnit 2. Investigate!
//QUnit.test("html with function", 1, function(){
//	F("#clickToChange").click()
//		.html(function(html){
//			return html == "changed"
//		})
//		F("#clickToChange").html("changed", "wait actually waits")
//})

// Note: Stopped working with QUnit 2. Investigate!
//QUnit.test("Html with value", 1, function(){
//	F("#clickToChange").click().html("changed","wait actually waits")
//})

QUnit.test("Wait", function(){
	var before,
		after
	setTimeout(function(){
		before = true;
	},2)
	setTimeout(function(){
		after = true
	},1000)
	F.wait(20,function(){
		QUnit.assert.ok(before, 'after 2 ms')
		QUnit.assert.ok(!after, 'before 1000ms')
		
	})
})

QUnit.test("hasClass", function(){
	var fast
	
	F("#hasClass").click();
	setTimeout(function(){
		fast = true
	},50)
	
	F("#hasClass").hasClass("someClass",true, function(){
		QUnit.assert.ok(fast,"waited until it has a class exists")
	});
	F("#hasClass").hasClass("someOtherClass",false, function(){
		QUnit.assert.ok(fast,"waited until it has a class exists")
	});
	// F("#doesnotexist").hasClass("someOtherClass", false, "element doesn't exist, this should fail");
})

QUnit.test("Exists", function(){
	var fast;
	
	F("#exists").click();
	setTimeout(function(){
		fast = true
	},50)
	F("#exists p").exists(function(){
		QUnit.assert.ok(fast,"waited until it exists")
	});
	
})

QUnit.test("Trigger", function(){
	F("#trigger").trigger('myCustomEvent');
	F("#trigger p").text("I was triggered");
	F("#trigger p").text(/^I\s\w+/, "regex works");
})

QUnit.test("Accessing the window", function(){
	QUnit.assert.ok(F(F.win).width()> 20, "I can get the window's width")
})

QUnit.test("Accessing the document", function(){
	QUnit.assert.ok(F(F.win.document).width()> 20, "I can get the document's width")
})


QUnit.test("two getters in a row", function(){
	QUnit.assert.equal(F("h1").text(), "Hello World")
	QUnit.assert.equal(F("h1").text(), "Hello World")
})


QUnit.test("then", function(){
	F("#exists").exists().then(function(){
		QUnit.assert.equal(this.length, 1, "this is correct")
	});
})


QUnit.test("branch", function(){
	F.branch(function(){
		return (F("#exists").size() > 0);
	}, function(){
		QUnit.assert.ok(true, "found exists")
	}, function(){
		return (F("#notexists").size() > 0);
	}, function(){
		QUnit.assert.ok(false, "found notexists")
	});
	
	
	F.branch(function(){
		return (F("#notexists").size() > 0);
	}, function(){
		QUnit.assert.ok(false, "found notexists")
	}, function(){
		return (F("#exists").size() > 0);
	}, function(){
		QUnit.assert.ok(true, "found exists")
	});
	
})

QUnit.test("invisible", function(){
	F(".hidden").invisible("Invisible works");
});

// NOTE: Broke during QUnit upgrade
//QUnit.test('F().size() API', function() {
//	QUnit.assert.expect(2);
//
//	F('#testData').size(1, function() {
//		QUnit.assert.ok(true, 'success cb');
//	}, 'test message')
//});
