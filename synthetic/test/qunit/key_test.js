module("funcunit/synthetic/key")

test("BasicKey", function(){
	__g("qunit-test-area").innerHTML = "<form id='outer'><div id='inner'><input type='input' id='key' value=''/></div></form>";
	var submit = 0, submitf = function(ev){
		submit++;
		if ( ev.preventDefault ) {
			ev.preventDefault();
		}
		ev.returnValue = false;
		return false;
	};
	var keyEl = __g("key")
	__addEventListener(__g("outer"),"submit",submitf );
	var keypress = 0, keypressf = function(ev){
		keypress++;
	};
	__addEventListener(__g("outer"),"keypress",keypressf );
	keyEl.value = "";
	
	new Synthetic("key","a").send(keyEl);
	equals(keyEl.value, "a", "A written");
	
	equals(keypress, 1, "Keypress called once");
	
	new Synthetic("key","5").send(keyEl);
	equals(keyEl.value, "a5", "5 written");
	
	new Synthetic("key","\b").send(keyEl);
	equals(keyEl.value, "a", "Backspace works");
	
	new Synthetic("key","\r").send(keyEl);
	equals(submit, 1, "submit on keypress");
	
	new Synthetic("key","1").send(keyEl);
	new Synthetic("key","2").send(keyEl);
	new Synthetic("key","3").send(keyEl);
	keyEl.select();
	new Synthetic("key","delete").send(keyEl);
	equals(keyEl.value, "", "Delete works");
	
	__removeEventListener(__g("outer"),"submit",submitf );
	__removeEventListener(__g("outer"),"keypress",keypressf );
    __g("qunit-test-area").innerHTML = "";
	
})


test("Key Something", function(){
	__g("qunit-test-area").innerHTML = "<input id='one'/>";
	var upVal,
		pressVal,
		downVal
	__addEventListener(__g("one"),"keyup",function(){
		upVal = __g("one").value
	} );
	__addEventListener(__g("one"),"keypress",function(){
		pressVal = __g("one").value
		
	} );
	__addEventListener(__g("one"),"keydown",function(){
		downVal = __g("one").value
	} );

	new Synthetic("key","J").send( __g("one") );
	new Synthetic("key","M").send( __g("one") );
	new Synthetic("key","V").send( __g("one") );
	new Synthetic("key","C").send( __g("one") );
	equals(upVal, "JMVC" , "Up Typing works")
	equals(pressVal, "JMV" , "Press Typing works")
	equals(downVal, "JMV" , "Down Typing works")
	//__g("qunit-test-area").innerHTML = "";
})

test("enter (\\r) submits form", function(){
	__g("qunit-test-area").innerHTML = "<form id='myform' onsubmit='return false'>"+
			"<input id='myinput' type='text' />"+
			"</form>"+
			"<div id='here'></div>";
			
	var submitted= false;
	__addEventListener(__g("myform"),"submit",function(ev){
		if ( ev.preventDefault ) {
			ev.preventDefault();
		}else{
			ev.returnValue = false;
		}
		submitted = true;
	} );
	//new Synthetic("submit").send( __g("myform")  );

	new Synthetic("key","\r").send( __g("myinput") );
	ok(submitted , "submitted");
	__g("qunit-test-area").innerHTML = "";
})

asyncTest("page down, page up, home, end", function(){
	__g("qunit-test-area").innerHTML = "<div id='scrolldiv' style='width:100px;height:200px;overflow-y:scroll;'>"+
		"<div id='innerdiv' style='height:1000px;'></div></div>";
			
	__addEventListener(__g("scrolldiv"),"scroll",function(ev){
		ok(true,"scrolling created by pressing page down");
		//__g("qunit-test-area").innerHTML ="";
		start();
	} );
	stop(400);
	setTimeout(function(){
		 __g("scrolldiv").focus();
		new Synthetic("key","page-down").send(window);
	},13)
})
test("Delete range test", function(){
	var selectText = function(el, start, end){
		if (el.createTextRange) {
			el.focus();
			var r = document.selection.createRange();
			r.moveStart('character', start);
			r.moveEnd('character', end-1);
			r.select();
		} else {
			el.selectionStart = start;
			el.selectionEnd = end;
		}
	}
	
	__g("qunit-test-area").innerHTML = "<form id='outer'><div id='inner'><input type='input' id='key' value=''/></div></form>";
	var keyEl = __g("key")
	
	// test delete range
	keyEl.value = "123456";
	selectText(keyEl, 1, 3)
	new Synthetic("key","delete").send(keyEl);
	equals(keyEl.value, "156", "delete range works");
	
	// test character range
	keyEl.value = "123456";
	selectText(keyEl, 1, 3)
	new Synthetic("key","a").send(keyEl);
	equals(keyEl.value, "1a456", "character range works");
	
	// test character range
	keyEl.value = "123456";
	selectText(keyEl, 1, 3)
	new Synthetic("key","\b").send(keyEl);
	equals(keyEl.value, "1456", "backspace range works");
	
    __g("qunit-test-area").innerHTML = "";
	
})