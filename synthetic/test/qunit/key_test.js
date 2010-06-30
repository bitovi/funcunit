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
    //__g("qunit-test-area").innerHTML = "";
	
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
	__g("qunit-test-area").innerHTML = 
		"<div id='scrolldiv' style='width:100px;height:200px;overflow-y:scroll;' tabindex='0'>"+
		"<div id='innerdiv' style='height:1000px;'><a href='javascript://'>Scroll on me</a></div></div>";
	
	//reset the scroll top	
	__g("scrolldiv").scrollTop =0;
	
	//list of keys to press and what to test after the scroll event
	var keyTest = {
		"page-down": function(){
			ok( __g("scrolldiv").scrollTop > 10 , "Moved down")
		},
		"page-up": function(){
			ok( __g("scrolldiv").scrollTop == 0 , "Moved back up (page-up)")
		},
		"end" : function(){
			var sd = __g("scrolldiv")
			ok( sd.scrollTop == sd.scrollHeight - sd.clientHeight , "Moved to the end")
		},
		"home" : function(){
			ok( __g("scrolldiv").scrollTop == 0 , "Moved back up (home)")
		}
	},
	order = [],
	i = 0,
	runNext = function(){
		var name = order[i];
		if(!name){
			start();
			return;
		}
		new Synthetic("key",name).send(__g("scrolldiv"))
	};
	for(var name in keyTest){
		order.push(name)
	}
			
	__addEventListener(__g("scrolldiv"),"scroll",function(ev){
		keyTest[order[i]]()
		i++;
		setTimeout(runNext,1)

	} );
	stop(1000);

	 __g("scrolldiv").focus();
	runNext();

})
test("range tests", function(){
	var selectText = function(el, start, end){
		if(el.setSelectionRange){
			if(!end){
                el.focus();
                el.setSelectionRange(start, start);
			} else {
				el.selectionStart = start;
				el.selectionEnd = end;
			}
		}else if (el.createTextRange) {
			//el.focus();
			var r = el.createTextRange();
			r.moveStart('character', start);
			end = end || start;
			r.moveEnd('character', end - el.value.length);
			
			r.select();
		} 
	}
	__g("qunit-test-area").innerHTML = "<form id='outer'><div id='inner'><input type='input' id='key' value=''/></div></form>"+
		"<textarea id='mytextarea' />";
	
	var keyEl = __g("key")
	var textAreaEl = __g("mytextarea")
	
	// test delete range
	keyEl.value = "012345";
	selectText(keyEl, 1, 3);
	
	new Synthetic("key","delete").send(keyEl);
	
	equals(keyEl.value, "0345", "delete range works");
	
	// test delete key
	keyEl.value = "012345";
	selectText(keyEl, 2);

	new Synthetic("key","delete").send(keyEl);
	equals(keyEl.value, "01345", "delete works");


	// test character range
	keyEl.value = "123456";
	selectText(keyEl, 1, 3);

	
	new Synthetic("key","a").send(keyEl);
	equals(keyEl.value, "1a456", "character range works");

	// test character key
	keyEl.value = "123456";
	selectText(keyEl, 2);
	
	new Synthetic("key","a").send(keyEl);
	equals(keyEl.value, "12a3456", "character insertion works");

	// test backspace range
	keyEl.value = "123456";
	selectText(keyEl, 1, 3);
	new Synthetic("key","\b").send(keyEl);
	equals(keyEl.value, "1456", "backspace range works");
	
	// test backspace key
	keyEl.value = "123456";
	selectText(keyEl, 2);
	new Synthetic("key","\b").send(keyEl);
	equals(keyEl.value, "13456", "backspace works");
	
	// test textarea ranges
	textAreaEl.value = "123456";
	selectText(textAreaEl, 1, 3);
	
	new Synthetic("key","delete").send(textAreaEl);
	equals(textAreaEl.value, "1456", "delete range works in a textarea");

	// test textarea ranges
	textAreaEl.value = "123456";
	selectText(textAreaEl, 1, 3);
	new Synthetic("key","a").send(textAreaEl);
	equals(textAreaEl.value, "1a456", "character range works in a textarea");
	
	// test textarea ranges
	textAreaEl.value = "123456";
	selectText(textAreaEl, 1, 3);
	new Synthetic("key","\b").send(textAreaEl);
	equals(textAreaEl.value, "1456", "backspace range works in a textarea");
	
	// test textarea ranges
	textAreaEl.value = "123456";
	selectText(textAreaEl, 1, 3);
	new Synthetic("key","\r").send(textAreaEl);
	//for(var i =0; i < textAreaEl.value.length; i++){
	//	console.log("1\n456".substr(i,1)," ","1\n456".charCodeAt(i)," ",textAreaEl.value.substr(i,1)," ", textAreaEl.value.charCodeAt(i))
	//}
	
	
	equals(textAreaEl.value.replace("\r",""), "1\n456", "return range works in a textarea");
	
    //__g("qunit-test-area").innerHTML = "";
	
})