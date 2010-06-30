steal(function(){

var inArray = function(item, array){
	for(var i =0; i < array.length; i++){
		if(array[i] == item){
			return i;
		}
	}
	return -1;
},
getWindow = function(element){
	return element.ownerDocument.defaultView || element.ownerDocument.parentWindow
},
selectionStart = function(el){
	if (el.createTextRange) {
		//check if we aren't focused
		if(document.activeElement && document.activeElement != el){
			return el.value.length;
		}
		
		var r = getWindow(el).document.selection.createRange().duplicate()
		r.moveEnd('character', el.value.length)
		if (r.text == '') return el.value.length
		return el.value.lastIndexOf(r.text)
	} else {
		return el.selectionStart 
	}
},
selectionEnd = function(el){
	if (el.createTextRange) {
		if(document.activeElement && document.activeElement != el){
			return el.value.length;
		}
		var r = getWindow(el).document.selection.createRange().duplicate()
		r.moveStart('character', -el.value.length)
		return r.text.length 
	} else return el.selectionEnd 
},
support = Synthetic.support,
createEvent = Synthetic.createEvent,
createEventObject = Synthetic.helpers.createEventObject,
createBasicStandardEvent = Synthetic.helpers.createBasicStandardEvent,
extend = Synthetic.extend,
browser = Synthetic.browser;


Synthetic.extend(Synthetic,{
	keycodes: {
		//backspace
		'\b':'8',
		
		//tab
		'\t':'9',
		
		//enter
		'\r':'13',
		
		//special
		'shift':'16','ctrl':'17','alt':'18',
		
		//weird
		'pause-break':'19',
		'caps':'20',
		'escape':'27',
		'num-lock':'144',
		'scroll-lock':'145',
		'print' : '44',
		
		//navigation
		'page-up':'33','page-down':'34','end':'35','home':'36',
		'left':'37','up':'38','right':'39','down':'40','insert':'45','delete':'46',
		
		//normal characters
		' ':'32',
		'0':'48','1':'49','2':'50','3':'51','4':'52','5':'53','6':'54','7':'55','8':'56','9':'57',
		'a':'65','b':'66','c':'67','d':'68','e':'69','f':'70','g':'71','h':'72','i':'73','j':'74','k':'75','l':'76','m':'77',
		'n':'78','o':'79','p':'80','q':'81','r':'82','s':'83','t':'84','u':'85','v':'86','w':'87','x':'88','y':'89','z':'90',
		//normal-characters, numpad
		'0':'96','1':'97','2':'98','3':'99','4':'100','5':'101','6':'102','7':'103','8':'104','9':'105',
		'*':'106','+':'107','-':'109','.':'110',
		//normal-characters, others
		'/':'111',
		';':'186',
		'=':'187',
		',':'188',
		'-':'189',
		'.':'190',
		'/':'191',
		'`':'192',
		'[':'219',
		'\\':'220',
		']':'221',
		"'":'222',
		
		//ignore these, you shouldn't use them
		'left window key':'91','right window key':'92','select key':'93',
		
		
		'f1':'112','f2':'113','f3':'114','f4':'115','f5':'116','f6':'117',
		'f7':'118','f8':'119','f9':'120','f10':'121','f11':'122','f12':'123'
	},
	// what we can type in
	typeable : /input|textarea/i
});
Synthetic.extend(Synthetic.key,{
	// retrieves a description of what events for this character should look like
	data : function(key){
		//check if it is described directly
		if(Synthetic.key.browser[key]){
			return Synthetic.key.browser[key];
		}
		for(var kind in Synthetic.key.kinds){
			if(inArray(key, Synthetic.key.kinds[kind] ) > -1){
				return Synthetic.key.browser[kind]
			}
		}
		return Synthetic.key.browser.character
	},
	//gets the options for a particular key and key event
	options : function(key, event){

		var keyData = Synthetic.key.data(key);
		
		if(!keyData[event]){
			//we shouldn't be creating this event
			return null;
		}
			
		
		var	charCode = keyData[event][0],
			keyCode = keyData[event][1],
			result = {};
		if(keyCode == 'key'){
			result.keyCode = Synthetic.keycodes[key]
		}else{
			result.keyCode = keyCode;
		}
		
		if(charCode == 'char'){
			result.charCode = key.charCodeAt(0)
		}else if(charCode !== null){
			result.charCode = charCode;
		}
		return result
	},
	
	kinds : {
		special : ["shift",'ctrl','alt','caps'],
		specialChars : ["\b"],
		navigation: ["page-up",'page-down','end','home','left','up','right','down','insert','delete'],
		'function' : ['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12']
	},
	getDefault : function(key){
		//check if it is described directly
		if(Synthetic.key.defaults[key]){
			return Synthetic.key.defaults[key];
		}
		for(var kind in Synthetic.key.kinds){
			if(inArray(key, Synthetic.key.kinds[kind])> -1 && Synthetic.key.defaults[kind]  ){
				return Synthetic.key.defaults[kind];
			}
		}
		return Synthetic.key.defaults.character
	},
	defaults : 	{
		'character' : function(options, scope, key){
			if(!support.keyCharacters && Synthetic.typeable.test(this.nodeName)){
				var current = this.value,
					start = selectionStart(this),
					end = selectionEnd(this),
					before = current.substr(0,start),
					after = current.substr(end),
					character = key;
				if(start == end && start < this.value.length - 1){
					//remove a character
					this.value = before+character;
				}else{
					this.value = before+character+after;
				}
			}		
		},
		'home' : function(){
			Synthetic.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					el.scrollTop = 0;
					return false;
				}
			})
		},
		'end' : function(){
			Synthetic.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					el.scrollTop = el.scrollHeight;
					return false;
				}
			})
		},
		'page-down' : function(){
			//find the first parent we can scroll
			Synthetic.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					var ch = el.clientHeight
					el.scrollTop += ch;
					return false;
				}
			})
		},
		'page-up' : function(){
			Synthetic.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					var ch = el.clientHeight
					el.scrollTop -= ch;
					return false;
				}
			})
		},
		'\b' : function(){
			//this assumes we are deleting from the end
			if(!support.backspaceWorks && Synthetic.typeable.test(this.nodeName)){
				var current = this.value,
					start = selectionStart(this),
					end = selectionEnd(this),
					before = current.substr(0,start),
					after = current.substr(end);
				
				if(start == end && start > 0){
					//remove a character
					this.value = before.substring(0, before.length - 1)+after
				}else{
					this.value = before+after;
				}
			}	
		},
		'delete' : function(){
			if(support.keyCharacters && Synthetic.typeable.test(this.nodeName)){
				var current = this.value,
					start = selectionStart(this),
					end = selectionEnd(this),
					before = current.substr(0,start),
					after = current.substr(end);
				
				if(start == end && start < this.value.length - 1){
					//remove a character
					this.value = before+after.substring(1)
				}else{
					this.value = before+after;
				}
			}		
		},
		'\r' : function(){
			
			var nodeName = this.nodeName.toLowerCase()
			// submit a form
			if(!support.keypressSubmits && nodeName == 'input'){
				var form = Synthetic.closest(this, "form");
				if(form){
					Synthetic.createEvent("submit", {}, form);
				}
					
			}
			//newline in textarea
			if(!support.keyCharacters && nodeName == 'textarea'){
				Synthetic.key.defaults.character.call(this, options, scope, "\n")
			}
			// 'click' hyperlinks
			if(!support.keypressSubmits && nodeName == 'a'){
				Synthetic.createEvent("click", {}, this);
			}
		},
		'\t' : function(options, scope){
			//we need jQuery for this
			if(!support.keypressSubmits){
				var focusable = "a,area,frame,iframe,label,input,select,textarea,button,html,object"
				
				var focusEls = jQuery("[tabindex],"+focusable, getWindow(this).document.documentElement );
				
				var tabIndex = Synthetic.tabIndex(this),
					current = null,
					currentIndex = 1000000000,
					found = false;
				for(var i=0; i< focusEls.length; i++){
					var el = focusEls[i],
						elIndex = Synthetic.tabIndex(el)
					if(tabIndex 
						&& (found ? elIndex >= tabIndex : elIndex > tabIndex )  
						&& elIndex < currentIndex){
							currentIndex = elIndex;
							current = el;
					}
					if(!tabIndex && found){
						current = el;
						break;
					}
					if(this === el){
						found= true;
					}
				}
				current && current.focus();
			}
		}
	}
});


Synthetic.extend(Synthetic.create,{
	key : {
			options : function(type, options, element){
				//check if options is character or has character
				options = typeof options != "object" ? {character : options} : options;
				
				//don't change the orignial
				options = extend({}, options)
				if(options.character){
					extend(options, Synthetic.key.options(options.character, type));
					delete options.character;
				}
				options = extend({
					ctrlKey: false,
					altKey: false,
					shiftKey: false,
					metaKey: false
				}, options)
				
				return options;
			},
			event : document.createEvent ? 
				function(type, options, element){  //Everyone Else
					var event;
					
					try {
			
						event = element.ownerDocument.createEvent("KeyEvents");
						event.initKeyEvent(type, true, true, window, 
							options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
							options.keyCode, options.charCode );
					} catch(e) {
						event = createBasicStandardEvent(type,options)
					}
					event.synthetic = true;
					return event;
	
				} : 
				function(type, options, element){
					var event = createEventObject.apply(this,arguments);
					extend(event, options)
	
					return event;
				}
		}
})





var convert = {
	"enter" : "\r",
	"backspace" : "\b",
	"tab" : "\t",
	"space" : " "
}




Synthetic.prototype.key = function(element){
	var key = convert[this.options] || this.options,
		result = Synthetic.createEvent('keydown',key, element ),
		getDefault = Synthetic.key.getDefault,
		prevent = Synthetic.key.browser.prevent;
	
	//options for keypress
	options = Synthetic.key.options(key, 'keypress');
	
	if(result){
		//is there is not a keypress, run default
		if(!options){
			getDefault(key).call(element, options, this.scope, key)
		}else{
			//do keypress
			result = createEvent('keypress',options, element )
			if(result){
				getDefault(key).call(element, options, this.scope, key)
			}
		}
	}else{
		//canceled ... possibly don't run keypress
		if(options && inArray('keypress',prevent.keydown) == -1 ){
			createEvent('keypress',options, element )
		}
	}
	Synthetic.createEvent('keyup',Synthetic.key.options(key, 'keyup'), element )
	//do mouseup
	
	return result
	// is there a keypress? .. if not , run default
	// yes -> did we prevent it?, if not run ...
	
};






//do support code
(function(){


	var div = document.createElement("div"), 
		checkbox, 
		submit, 
		form, 
		input, 
		submitted = false;
		
	div.innerHTML = "<form id='outer'>"+
		"<input name='checkbox' type='checkbox'/>"+
		"<input name='radio' type='radio' />"+
		"<input type='submit' name='submitter'/>"+
		"<input type='input' name='inputter'/>"+
		"<input name='one'>"+
		"<input name='two'/>"+
		"<a href='javascript:__synthTest()' id='synlink'></a>"+
		"</form>";
		
	document.documentElement.appendChild(div);
	form = div.firstChild;
	checkbox = form.childNodes[0];
	submit = form.childNodes[2];
	
	form.onsubmit = function(ev){
		if (ev.preventDefault) 
			ev.preventDefault();
		support.keypressSubmits = true;
		ev.returnValue = false;
		return false;
	}
	createEvent("keypress", "\r", form.childNodes[3]);
	
	
	createEvent("keypress", "a", form.childNodes[3]);
	support.keyCharacters = form.childNodes[3].value == "a";
	
	
	form.childNodes[3].value = "a"
	createEvent("keypress", "\b", form.childNodes[3]);
	support.backspaceWorks = form.childNodes[3].value == "";
	
		
	
	form.childNodes[3].onchange = function(){
		support.focusChanges = true;
	}
	form.childNodes[3].focus();
	createEvent("keypress", "a", form.childNodes[3]);
	form.childNodes[5].focus();
	

	document.documentElement.removeChild(div);
	
	support.ready = true;
})();



	
})





