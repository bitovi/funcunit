var drags = {}, drops ={};

module("funcunit/synthetic/drag", { 
	setup: function(){
	
	/*
	var drags = {}, drops ={};
	var div = $("<div>"+
			"<div id='drag'></div>"+
			"<div id='midpoint'></div>"+
			"<div id='drop'></div>"+
			"</div>");
	
	div.appendTo($("#qunit-test-area"));
	var basicCss = {
		width: "20px",
		height: "20px",
		position: "absolute",
		border: "solid 1px black"
	}
	$("#drag").css(basicCss).css({top: "0px", left: "0px", backgroundColor: "green"})
	$("#midpoint").css(basicCss).css({top: "0px", left: "30px", backgroundColor: "blue"})
	$("#drop").css(basicCss).css({top: "30px", left: "30px", backgroundColor: "yellow"});
	
	
	
	$('#drag')
		.live("dragdown", function(){
			drags.dragdown = true;
		})
		.live("draginit", function(){
			drags.draginit = true;
		})
		.live("dragmove", function(){
			drags.dragmove = true;
		})
		.live("dragend", function(){
			drags.dragend = true;
		})
		.live("dragover", function(){
			drags.dragover = true;
		})
		.live("dragout", function(){
			drags.dragout = true;
		})
	$('#drop')
		.live("dropinit", function(){ 
			drops.dropinit = true;
		})
		.live("dropover", function(){ 
			drops.dropover = true;
		})
		.live("dropout", function(){ 
			drops.dropout = true;
		})
		.live("dropmove", function(){ 
			drops.dropmove = true;
		})
		.live("dropon", function(){ 
			drops.dropon = true;
		})
		.live("dropend", function(){ 
			drops.dropend = true;
		})*/
	}
});


test("move", function(){
	var drags = {}, drops ={};
	var div = $("<div id='wrap'>"+
			"<div id='left'></div>"+
			"<div id='right'></div>"+
			"</div>");
	
	div.appendTo($("#qunit-test-area"));
	var basicCss = {
		width: "90px",
		height: "100px",
		position: "absolute",
		border: "solid 1px black"
	}
	$('#wrap').css({position: "absolute",top: "0px",left: "0px", width: "200px", height: "100px",backgroundColor: "yellow"})
	$("#left").css(basicCss).css({top: "0px", left: "10px", backgroundColor: "green"})
	$("#right").css(basicCss).css({top: "0px", left: "100px", backgroundColor: "blue"})

	var clientX=-1,
		clientY=-1,
		els = [$('#wrap')[0], $('#left')[0], $('#right')[0], $('#wrap')[0] ],
		targets = [];

	var move = function(ev){
		if(ev.clientX < clientX){
			ok(false, "mouse isn't moving right")
		}
		clientX = ev.clientX;
		if(ev.clientY < clientY){
			ok(false, "mouse isn't moving right")
		}
		clientY = ev.clientY;
		if(!targets.length || targets[targets.length - 1] !== ev.target){
			targets.push(ev.target)
		}
	}
	$(document.documentElement).bind('mousemove',move )
	
	stop();
	//setTimeout(function(){
	Syn("move",{
		start : {clientX: 2, clientY: 50},
		end :	{clientX: 199, clientY: 50},
		duration: 1000
	}, "green", function(){
		
		equals(clientX, 199)
		equals(clientY, 50)
		$(document.documentElement).unbind('mousemove',move )
		for(var i=0; i < els.length;i++){
			ok(els[i] == targets[i], "target is right")
		}
		

		start();
	})
		
	//},13)
	
})

test("dragging an element", function(){
	/*Syn("drag", {to: "#midpoint"}, $("#drag")[0]);
	ok(drags.draginit, "draginit fired correctly")
	ok(drags.dragmove, "dragmove fired correctly")
	ok(!drags.dragover,"dragover not fired yet")
	
	ok(!drops.dropover,"dropover fired correctly")
	ok(!drops.dropon,	"dropon not fired yet")
	ok(drops.dropend, 	"dropend fired")

	Syn("drag", {to: "#drop"},$("#drag")[0]);
	ok(drags.dragover,"dragover fired correctly")
	
	ok(drops.dropover, "dropmover fired correctly")
	ok(drops.dropmove, "dropmove fired correctly")
	ok(drops.dropon,	"dropon fired correctly")
	
	Syn("drag", {to: "#midpoint"}, $("#drag")[0] );
	ok(drags.dragout, 	"dragout fired correctly")
	
	ok(drops.dropout, 	"dropout fired correctly")
	$("#qunit-test-area").innerHTML = "";*/
})
/*
asyncTest("dragging an element with duration", function(){
	Syn("drag", {to: "#midpoint", duration: 2000}, $("#drag")[0]);
	setTimeout(function(){
		ok(drags.draginit, "draginit fired correctly")
		ok(drags.dragmove, "dragmove fired correctly")
		ok(!drags.dragover,"dragover not fired yet")
		
		ok(!drops.dropover,"dropover fired correctly")
		ok(!drops.dropon,	"dropon not fired yet")
		ok(drops.dropend, 	"dropend fired")
	
		Syn("drag", {to: "#drop", duration: 2000}, $("#drag")[0]);
		setTimeout(function(){
			ok(drags.dragover,"dragover fired correctly")
			
			ok(drops.dropover, "dropmover fired correctly")
			ok(drops.dropmove, "dropmove fired correctly")
			ok(drops.dropon,	"dropon fired correctly")
			
			Syn("drag", {to: "#midpoint", duration: 2000}, $("#drag")[0]);
			setTimeout(function(){
				ok(drags.dragout, 	"dragout fired correctly")
				ok(drops.dropout, 	"dropout fired correctly")
				$("#qunit-test-area").innerHTML = "";
				start();
			}, 3000)
		}, 3000)
	}, 3000)
	stop(20000)
})*/