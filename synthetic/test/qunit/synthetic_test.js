module("funcunit/synthetic")

__g = function(id){
	return document.getElementById(id)
	
}
__mylog = function(c){
	if(__g("mlog"))
		__g("mlog").innerHTML = __g("mlog").innerHTML+c+"<br/>"
}

if(window.addEventListener){ // Mozilla, Netscape, Firefox
	__addEventListener = function(el, ev, f){
		el.addEventListener(ev, f, false)
	}
	__removeEventListener = function(el, ev, f){
		el.removeEventListener(ev, f, false)
	}
}else{
	__addEventListener = function(el, ev, f){
		el.attachEvent("on"+ev, f)
	}
	__removeEventListener = function(el, ev, f){
		el.detachEvent("on"+ev, f)
	}
}

(function(){
	for(var name in Synthetic.support){
		__mylog(name+": "+Synthetic.support[name])
	}
})();

test("Select", function(){
	__g("qunit-test-area").innerHTML = 
		"<form id='outer'><select name='select'><option value='1' id='one'>one</option><option value='2' id='two'>two</option></select></form>";
	
	var change = 0, changef = function(){
		change++;
	}

	__g("outer").select.selectedIndex = 0;

	__addEventListener(__g("outer").select,"change",changef );

	new Synthetic("click").send( __g("two") );

	equals(change, 1 , "change called once")
	equals(__g("outer").select.selectedIndex, 1, "Change Selected Index");
	__g("qunit-test-area").innerHTML = ""
})

asyncTest("scrolling", function(){
	__g("qunit-test-area").innerHTML = "<div id='scroller' style='height:100px;width: 100px;overflow:auto'>"+
			"<div style='height: 200px; width: 100%'>text"+
			"</div>"+
			"</div>";
			
	__addEventListener(__g("scroller"),"scroll",function(ev){
		ok(true,"scrolling created just by changing ScrollTop");
		__g("qunit-test-area").innerHTML ="";
		start();
	} );
	stop();
	setTimeout(function(){
		var sc = __g("scroller");
		sc && (sc.scrollTop = 10);
	
	},13)
	
})

test("focus", function(){
	__g("qunit-test-area").innerHTML = "<input type='text' id='focusme'/>";
	
	__addEventListener(__g("focusme"),"focus",function(ev){
		ok(true,"focus creates event");
		__g("qunit-test-area").innerHTML ="";
		start();
	} );
	stop();
	setTimeout(function(){
		__g("focusme").focus();
	
	},10)
	
})

// todo make sure you can do new Synthetic("key",{keyCode: 34}).send( __g("myinput") );
// make a test for this