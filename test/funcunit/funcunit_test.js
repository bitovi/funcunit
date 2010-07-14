module("funcunit - jQuery API",{
	setup : function(){
		S.open("test/myapp.html", null, 10000)
	}
})





test("Iframe access", function(){
	
	S("h2",0).text(function(text){
		equals(text, "Goodbye World", "text of iframe")
	})
})

test("waitHtml with function", function(){
	S("#clickToChange").click()
	
		.waitHtml(function(html){
			return html == "changed"
		})
		.html(function(html){
			equals(html,"changed","wait actually waits")
		})
	
})
test("waitHtml with value", function(){
	S("#clickToChange").click()
	
		.waitHtml("changed")
		.html(function(html){
			equals(html,"changed","wait actually waits")
		})
	
})

test("Wait", function(){
	var before,
		after
	setTimeout(function(){
		before = true;
	},2)
	setTimeout(function(){
		after = true
	},1000)
	S.wait(20,function(){
		ok(before, 'after 2 ms')
		ok(!after, 'before 1000ms')
		
	})
})

test("Exists", function(){
	var fast
	
	S("#exists").click();
	setTimeout(function(){
		fast = true
	},50)
	S("#exists p").exists(function(){
		ok(fast,"waited until it exists")
	});
	
})



