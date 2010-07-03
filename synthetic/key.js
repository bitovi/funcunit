steal(function(){

var h = Syn.helpers,
	S = Syn,

// gets the selection of an input or textarea
getSelection = function(el){
	// use selectionStart if we can
	if (el.selectionStart !== undefined) {
		// this is for opera, so we don't have to focus to type how we think we would
		if(document.activeElement 
		 	&& document.activeElement != el 
			&& el.selectionStart == el.selectionEnd 
			&& el.selectionStart == 0){
			return {start: el.value.length, end: el.value.length};
		}
		return  {start: el.selectionStart, end: el.selectionEnd}
	}else{
		//check if we aren't focused
		if(document.activeElement && document.activeElement != el){
			return {start: el.value.length, end: el.value.length};
		}
		//try 2 different methods that work differently (IE breaks depending on type)
		if(el.nodeName.toLowerCase() == 'input'){
			var real = h.getWindow(el).document.selection.createRange(),
				r = el.createTextRange();
			r.setEndPoint("EndToStart", real);
	
			var start = r.text.length
			return {start: start, end: start+real.text.length}
		}else{
			var real = h.getWindow(el).document.selection.createRange(),
			r = real.duplicate();
			//select all of our element
			r.moveToElementText(el)
			//now move our endpoint to the end of our real range
			r.setEndPoint('EndToEnd',real);
			var start = r.text.length - real.text.length
			return {start: start, end: r.text.length}
		}
	} 
},
// gets all focusable elements
getFocusable = function(el){
	var document = h.getWindow(el).document,
		res = [];

	var els = document.getElementsByTagName('*'),
		len = els.length;
		
	for(var i=0;  i< len; i++){
		Syn.isFocusable(els[i]) && els[i] != document.documentElement && res.push(els[i])
	}
	return res;
	
	
};


h.extend(Syn,{
	// key codes for a standard english keyboard
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
	typeable : /input|textarea/i,
	
	// selects text on an element
	selectText: function(el, start, end){
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
});

h.extend(Syn.key,{
	// retrieves a description of what events for this character should look like
	data : function(key){
		//check if it is described directly
		if(S.key.browser[key]){
			return S.key.browser[key];
		}
		for(var kind in S.key.kinds){
			if(h.inArray(key, S.key.kinds[kind] ) > -1){
				return S.key.browser[kind]
			}
		}
		return S.key.browser.character
	},
	// gets the options for a particular key and key event
	options : function(key, event){
		var keyData = Syn.key.data(key);
		
		if(!keyData[event]){
			//we shouldn't be creating this event
			return null;
		}
			
		var	charCode = keyData[event][0],
			keyCode = keyData[event][1],
			result = {};
			
		if(keyCode == 'key'){
			result.keyCode = Syn.keycodes[key]
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
	//types of event keys
	kinds : {
		special : ["shift",'ctrl','alt','caps'],
		specialChars : ["\b"],
		navigation: ["page-up",'page-down','end','home','left','up','right','down','insert','delete'],
		'function' : ['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12']
	},
	//returns the default function
	getDefault : function(key){
		//check if it is described directly
		if(Syn.key.defaults[key]){
			return Syn.key.defaults[key];
		}
		for(var kind in Syn.key.kinds){
			if(h.inArray(key, Syn.key.kinds[kind])> -1 && Syn.key.defaults[kind]  ){
				return Syn.key.defaults[kind];
			}
		}
		return Syn.key.defaults.character
	},
	// default behavior when typing
	defaults : 	{
		'character' : function(options, scope, key){
			if(!S.support.keyCharacters && Syn.typeable.test(this.nodeName)){
				var current = this.value,
					sel = getSelection(this),
					before = current.substr(0,sel.start),
					after = current.substr(sel.end),
					character = key;
					
				this.value = before+character+after;

			}		
		},
		'home' : function(){
			Syn.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					el.scrollTop = 0;
					return false;
				}
			})
		},
		'end' : function(){
			Syn.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					el.scrollTop = el.scrollHeight;
					return false;
				}
			})
		},
		'page-down' : function(){
			//find the first parent we can scroll
			Syn.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					var ch = el.clientHeight
					el.scrollTop += ch;
					return false;
				}
			})
		},
		'page-up' : function(){
			Syn.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					var ch = el.clientHeight
					el.scrollTop -= ch;
					return false;
				}
			})
		},
		'\b' : function(){
			//this assumes we are deleting from the end
			if(!S.support.backspaceWorks && Syn.typeable.test(this.nodeName)){
				var current = this.value,
					sel = getSelection(this),
					before = current.substr(0,sel.start),
					after = current.substr(sel.end);
				
				if(sel.start == sel.end && sel.start > 0){
					//remove a character
					this.value = before.substring(0, before.length - 1)+after
				}else{
					this.value = before+after;
				}
			}	
		},
		'delete' : function(){
			if(!S.support.backspaceWorks && Syn.typeable.test(this.nodeName)){
				var current = this.value,
					sel = getSelection(this),
					before = current.substr(0,sel.start),
					after = current.substr(sel.end);
				
				if(sel.start == sel.end && sel.start < this.value.length - 1){
					//remove a character
					this.value = before+after.substring(1)
				}else{
					this.value = before+after;
				}
			}		
		},
		'\r' : function(options, scope){
			
			var nodeName = this.nodeName.toLowerCase()
			// submit a form
			if(!S.support.keypressSubmits && nodeName == 'input'){
				var form = Syn.closest(this, "form");
				if(form){
					Syn.trigger("submit", {}, form);
				}
					
			}
			//newline in textarea
			if(!S.support.keyCharacters && nodeName == 'textarea'){
				Syn.key.defaults.character.call(this, options, scope, "\n")
			}
			// 'click' hyperlinks
			if(!S.support.keypressOnAnchorClicks && nodeName == 'a'){
				Syn.trigger("click", {}, this);
			}
		},
		/**
		 * Gets all focusable elements.  If the element (this)
		 * doesn't have a tabindex, finds the next element after.
		 * If the element (this) has a tabindex finds the element 
		 * with the next higher tabindex OR the element with the same
		 * tabindex after it in the document.
		 * @return the next element
		 */
		'\t' : function(options, scope){
				// focusable elements
			var focusEls = getFocusable(this),
				// the current element's tabindex
				tabIndex = Syn.tabIndex(this),
				// will be set to our guess for the next element
				current = null,
				// the next index we care about
				currentIndex = 1000000000,
				// set to true once we found 'this' element
				found = false,
				i = 0,
				el, 
				//the tabindex of the tabable element we are looking at
				elIndex,
				firstNotIndexed;
				
			for(; i< focusEls.length; i++){
				el = focusEls[i];
				elIndex = Syn.tabIndex(el) || 0;
				if(!firstNotIndexed && elIndex === 0){
					firstNotIndexed = el;
				}
				
				if(tabIndex 
					&& (found ? elIndex >= tabIndex : elIndex > tabIndex )  
					&& elIndex < currentIndex){
						currentIndex = elIndex;
						current = el;
				}
				
				if(!tabIndex && found && !elIndex){
					current = el;
					break;
				}
				
				if(this === el){
					found= true;
				}
			}
			
			//restart if we didn't find anything
			if(!current){
				current = firstNotIndexed;
			}
			current && current.focus();
			return current;
		},
		'left' : function(){
			if( Syn.typeable.test(this.nodeName) ){

				var sel = getSelection(this);
					
				Syn.selectText(this, sel.start == 0 ? 0 : sel.start - 1)

			}	
		},
		'right' : function(){
			if( Syn.typeable.test(this.nodeName) ){

				var sel = getSelection(this);
					
				Syn.selectText(this, sel.end+1 > this.value.length ? this.value.length  : sel.end+1)

			}	
		}
	}
});


h.extend(Syn.create,{
	key : {
			// return the options for a key event
			options : function(type, options, element){
				//check if options is character or has character
				options = typeof options != "object" ? {character : options} : options;
				
				//don't change the orignial
				options = h.extend({}, options)
				if(options.character){
					h.extend(options, S.key.options(options.character, type));
					delete options.character;
				}
				options = h.extend({
					ctrlKey: false,
					altKey: false,
					shiftKey: false,
					metaKey: false
				}, options)
				
				return options;
			},
			// creates a key event
			event : document.createEvent ? 
				function(type, options, element){  //Everyone Else
					var event;
					
					try {
			
						event = element.ownerDocument.createEvent("KeyEvents");
						event.initKeyEvent(type, true, true, window, 
							options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
							options.keyCode, options.charCode );
					} catch(e) {
						event = h.createBasicStandardEvent(type,options)
					}
					event.synthetic = true;
					return event;
	
				} : 
				function(type, options, element){
					var event = h.createEventObject.apply(this,arguments);
					h.extend(event, options)
	
					return event;
				}
		}
});

//do support code
(function(){


	var div = document.createElement("div"), 
		checkbox, 
		submit, 
		form, 
		input, 
		submitted = false,
		anchor;
		
	div.innerHTML = "<form id='outer'>"+
		"<input name='checkbox' type='checkbox'/>"+
		"<input name='radio' type='radio' />"+
		"<input type='submit' name='submitter'/>"+
		"<input type='input' name='inputter'/>"+
		"<input name='one'>"+
		"<input name='two'/>"+
		"<a href='#abc'></a>"+
		"</form>";
		
	document.documentElement.appendChild(div);
	form = div.firstChild;
	checkbox = form.childNodes[0];
	submit = form.childNodes[2];
	anchor = form.getElementsByTagName("a")[0]
	form.onsubmit = function(ev){
		if (ev.preventDefault) 
			ev.preventDefault();
		S.support.keypressSubmits = true;
		ev.returnValue = false;
		return false;
	}
	Syn.trigger("keypress", "\r", form.childNodes[3]);
	
	
	Syn.trigger("keypress", "a", form.childNodes[3]);
	S.support.keyCharacters = form.childNodes[3].value == "a";
	
	
	form.childNodes[3].value = "a"
	Syn.trigger("keypress", "\b", form.childNodes[3]);
	S.support.backspaceWorks = form.childNodes[3].value == "";
	
		
	
	form.childNodes[3].onchange = function(){
		S.support.focusChanges = true;
	}
	form.childNodes[3].focus();
	Syn.trigger("keypress", "a", form.childNodes[3]);
	form.childNodes[5].focus();
	
	//test keypress \r on anchor submits
	S.bind(anchor,"click",function(ev){
		if (ev.preventDefault) 
			ev.preventDefault();
		S.support.keypressOnAnchorClicks = true;
		ev.returnValue = false;
		return false;
	})
	Syn.trigger("keypress", "\r", anchor);
	
	document.documentElement.removeChild(div);
	
	S.support.ready = true;
})();



	
})





