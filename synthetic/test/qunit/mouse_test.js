module("funcunit/synthetic/mouse")

test("Synthetic basics", function(){

        ok(Synthetic,"Synthetic exists")
		
		__g("qunit-test-area").innerHTML = "<div id='outer'><div id='inner'></div></div>"
		var mouseover = 0, mouseoverf = function(){
			mouseover++;
		};
		__addEventListener(__g("outer"),"mouseover",mouseoverf );
		new Synthetic("mouseover").send( __g("inner") );
		
		__removeEventListener(__g("outer"),"mouseover",mouseoverf );
		equals(mouseover, 1, "Mouseover");
		new Synthetic("mouseover").send( __g("inner") );
		equals(mouseover, 1, "Mouseover on no event handlers");
		__g("qunit-test-area").innerHTML = "";
		
})

test("Basic Click", function(){

	__g("qunit-test-area").innerHTML = "<form id='outer' onsubmit='return false'><div id='inner'>"+
			"<input type='checkbox' id='checkbox'/>"+
			"<input type='radio' name='radio' value='radio1' id='radio1'/>"+
			"<input type='radio' name='radio' value='radio2' id='radio2'/>"+
			"<input type='submit' id='submit'/></div></form>";
			
	var submit = 0, submitf = function(ev){
		submit++;
		if ( ev.preventDefault ) {
			ev.preventDefault();
		}
		return false;
	};
	__addEventListener(__g("outer"),"submit",submitf );
	new Synthetic("click").send( __g("submit") );
	new Synthetic("submit").send( __g("outer")  );
	
	equals(submit, 2, "Click on submit");
	
	var click =0, clickf = function(ev){
		click++;
		if ( ev.preventDefault ) {
			ev.preventDefault();
		}
		return false;	
	}
	__addEventListener(__g("inner"),"click",clickf );
	
	new Synthetic("click").send( __g("submit") );
	
	equals(submit, 2, "Submit prevented");
	equals(click, 1, "Clicked");
	
	__removeEventListener(__g("outer"),"submit",submitf );
	__removeEventListener(__g("inner"),"click",clickf );
	
	var checkbox =0, checkboxf = function(ev){
		checkbox++;	
	}
	__addEventListener(__g("checkbox"),"change",checkboxf );

	__g("checkbox").checked = false;
	new Synthetic("click").send( __g("checkbox") );
	
	ok(__g("checkbox").checked, "click checks");
	
	//test radio
	
	var radio1=0; radio1f = function(ev){
		radio1++;
	}
	var radio2=0; radio2f = function(ev){
		radio2++;
	}
	__g("radio1").checked = false;
	__addEventListener(__g("radio1"),"change",radio1f );
	__addEventListener(__g("radio2"),"change",radio2f );
	
	new Synthetic("click").send( __g("radio1") );
	
	equals(radio1, 1, "radio event");
	ok( __g("radio1").checked, "radio checked" );
	
	new Synthetic("click").send( __g("radio2") );
	
	equals(radio2, 1, "radio event");
	ok( __g("radio2").checked, "radio checked" );
	
	
	ok( !__g("radio1").checked, "radio unchecked" );
	
	
	//__g("qunit-test-area").innerHTML = "";
});

test("click event order", 4, function(){
	var order = 0;
	__g("qunit-test-area").innerHTML = "<input id='focusme'/>";
	
	
	__addEventListener(__g("focusme"),"mousedown",function(){
		equals(++order,1,"mousedown")
	});
	
	__addEventListener(__g("focusme"),"focus",function(){
		equals(++order, 2,"focus")
	});
	
	__addEventListener(__g("focusme"),"mouseup",function(){
		equals(++order,3,"mouseup")
	});
	__addEventListener(__g("focusme"),"click",function(ev){
		equals(++order,4,"click")
		if(ev.preventDefault)
			ev.preventDefault();
		ev.returnValue = false;
	});
	stop();
	new Synthetic("clicker").send( __g("focusme") );
	setTimeout(function(){
		start();
	}, 100)
})

test("Clicker link", function(){
	var didSomething = false;
	window.doSomething = function(){
		didSomething = true;
	}
	__g("qunit-test-area").innerHTML = "<a href='javascript:doSomething()' id='holler'>click me</a>";
	
	new Synthetic("click").send( __g("holler") );
	
	ok( didSomething, "link href does something" );
})

test("Change by typing then clicking elsewhere", function(){
	__g("qunit-test-area").innerHTML = "<input id='one'/><input id='two'/>";
	var change = 0, changef = function(){
		change++;
	}
	__addEventListener(__g("one"),"change",changef );
	stop();
	new Synthetic("clicker").send( __g("one") );
	setTimeout(function(){
		new Synthetic("keypress","a").send( __g("one") );
		new Synthetic("clicker").send( __g("two") );
		
		setTimeout(function(){
			start()
			
			equals(change, 1 , "Change called once");
			__g("qunit-test-area").innerHTML = "";
		},100)
		
	},10)
})

test("click focuses on a link", function(){
	__g("qunit-test-area").innerHTML = "<a href='#abc' id='focusme'/>";
	
	__addEventListener(__g("focusme"),"focus",function(ev){
		ok(true,"focused");
	} );
	__addEventListener(__g("focusme"),"click",function(ev){
		ok(true,"clicked");
		__g("qunit-test-area").innerHTML ="";
		start();
		if(ev.preventDefault)
			ev.preventDefault();
		ev.returnValue = false;
		return false;
	} );
	stop();
	setTimeout(function(){
		new Synthetic('click').send( __g("focusme") );
	},10)
})