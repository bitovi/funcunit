$(function(){
	Syn.autoDelay = true;
	REPLAY = false;
	ADD = true;
	Recorder ={
		cb: function(i){
			return function(){
				$("#code div:nth("+(i)+")").css("color","black").css("font-weight","")
				$("#code div:nth("+(i+1)+")").css("color","orange").css("font-weight","bold")
				if(i == commands.length - 1){
					Recorder.done();
				}
			}
			
		},
		done : function(){
			console.log('done')
			ADD = true;
			$("#code div").css("color","black")
		}
	}
	var commands =[],
		downKeys = [],
		keytarget = null,
		current = [],
		mousedown,
		mousemove,
		mouseup,
		h ={
			commandsText : function(func){
				var text = [],
					command;
				for(var i=0; i < commands.length; i++){
					command = commands[i];
					text.push(func ? "":"<div>",
					  i > 0 ? "   ." : "Syn.",
					  command.type,
					  "(",
					  command.options,
					  ",$('",
					  command.selector,
					  "')",
					  func ? ", Recorder.cb("+i+")" : "",
					  ")\n",
					  func ? "":"</div>"
					)
				}
				return text.join("")
			},
			addCode : function(type, options, target){
				if(!ADD){
					return;
				}
				var selector = h.selector(target),
					last = commands[commands.length - 1] || {};
				
				if(last.type == type && type == 'type' && last.selector == selector){
					//change options
					last.options = options
				}else if(last.type == 'type' 
					&& type == 'click' 
					&& last.options.lastIndexOf("\\r") == last.options.length -3
					&& last.selector == selector){
				}
				else{
					commands.push({
						type : type,
						options: options,
						selector: selector
					})
				}

				$("#code").html(h.commandsText())
			},
			getKey : function(code){
				for(var key in Syn.keycodes){
					if(Syn.keycodes[key] == code){
						return key
					}
				}
			},
			addTyping : function(chars, target){
				console.log("typed", chars, "into",target)
			},
			addKey : function(key){
				
			},
			showChar : function(character, target){
				var convert = {
					"\r" : "\\r",
					"\t" :"\\t",
					"\b" : "\\b"
				}
				if(convert[character]){
					character = convert[character]
				}else if(character == "[" || character.length > 1){
					character = "["+character+"]"
				}
				current.push(character);
				
				//console.log('adding',chars);
				h.addCode("type",'"'+current.join("")+'"', target)
			},
			keydown : function(ev){
				var key = h.getKey(ev.keyCode);
			
				if(keytarget != ev.target){
					current = [];
					keytarget = ev.target;
				}
				if($.inArray(key, downKeys) == -1){
					downKeys.push(key);
					h.showChar(key, ev.target);
				}
			},
			keyup : function(ev){
				var key = h.getKey(ev.keyCode);
				if(Syn.key.isSpecial(ev.keyCode)){
					h.showChar(key+"-up", ev.target);
				}
				
				var location = $.inArray(key, downKeys);
				downKeys.splice(location,1);
			},
			// returns a selector
			selector : function(target){
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
				var others = jQuery(selector, Syn.helpers.getWindow(target).document)
				if(others.length > 1){
					return selector+":eq("+others.index(target)+")";
				}else{
					return selector;
				}
				
				
			}
		};
	var code = {
			click : function(ev){
				h.addCode("click","{}",this)
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
					h.addCode("drag","'"+ev.clientX+"X"+ev.clientY+"'",mousedown)
				}
				
				mousedown = null;
				mousemove = false
			}
		}
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
					code[ev.type].call(ev.target||ev.srcElement, ev)
				}
			}
			oldHandle.apply(this,arguments);
		}
		keytarget = null;
		$(frameWindow.document).keydown(h.keydown).keyup(h.keyup)
		
		

		if(REPLAY){
			REPLAY = false;
			setTimeout(function(){
				var text = h.commandsText(true)
				ADD = false;
				$("#code div:first").css("color","red")
				eval("with(frameWindow){"+ text +"}" );
			},500)
			
		}
		
	}).appendTo($("#app"))
	
	$(function(){
		$("#code").val("")
	})
	$('#fill').phui_filler();

	$("#run").click(function(){
		REPLAY = true;
		$('iframe')[0].contentWindow.location.reload(true);
		$("#code div").css("color","gray")
		
	})
	
	
});

	

