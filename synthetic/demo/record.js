$(function(){
	$("<iframe src='demo.html'></iframe>").load(function(){
		//cant uses handled b/c it doesn't bubble
		var iframe = $('iframe');
		//iframe.phui_filler({parent: $("#fill")});
		var frameWindow = iframe[0].contentWindow;
	
		var oldHandle = frameWindow.jQuery.event.handle;
		
		frameWindow.jQuery.event.handle = function(ev){
			if(! ev[ frameWindow.jQuery.expando ]){
				//add
				if(code[ev.type]){
					code[ev.type].call(ev.target, ev)
				}
			}
			oldHandle.apply(this,arguments);
		}
		var mousedown,
			mousemove,
			mouseup
		
		var code = {
			click : function(ev){
				addCode("click","{}",this)
			},
			mousedown : function(ev){
				mousedown = this;
				mousemove = false
			},
			mousemove : function(ev){
				mousemove = true;
			},
			mouseup : function(ev){
				if(mousemove){
					addCode("drag","'"+ev.clientX+"X"+ev.clientY+"'",mousedown)
				}
				
				mousedown = null;
				mousemove = false
			}
		}
		
		var selector = function(target){
			var selector = target.nodeName.toLowerCase();
			if(target.id){
				selector+= "#"+target.id
			}else{
				var parent = target.parentNode;
				while(parent){
					if(parent.id){
						selector = "#"+parent.id+" "+selector;
						break;
					}else{
						parent = parent.parentNode
					}
				}
			}
			if(target.className){
				selector += "."+target.className.split(" ")[0]
			}
			var others = jQuery(selector, frameWindow.document)
			if(others.length > 1){
				return selector+":eq("+others.index(target)+")";
			}else{
				return selector;
			}
			
			
		},
		addCode  =function(type, options, target){
			if(!ADD){
				return;
			}
			var current = $("#code").text();
			var add = current ? " ." : "Syn.";
			add += type+"(\n    "+options+",\n    $('"+selector(target)+"'))\n"
			//if(type == 'click!'){
			//	add += " .delay()\n"
			//}
			$("#code").text(current+add)
		}
		if(REPLAY){
			REPLAY = false;
			setTimeout(function(){
				var text = $("#code").text()
				text = text.substr(0,text.length-2) + ", function(){ ADD = true })"
				ADD = false;
				eval("with(frameWindow){"+ text +"}" );
			},500)
			
		}
		
		
	}).appendTo($("#app"))
	

	
	
});
Syn.autoDelay = true;
REPLAY = false;
ADD = true;
	
	$(function(){
		$("#code").val("")
	})
	$('#fill').phui_filler();
	//$('#app').phui_filler({parent: $('#fill')})
	$("#run").click(function(){
		REPLAY = true;
		$('iframe')[0].contentWindow.location.reload(true);
		
	})
