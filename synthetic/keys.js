steal(function(){

var h = Synthetic.helpers,
	S = Synthetic,
//gets the selection of an input or textarea
getSelection = function(el){
	if (el.selectionStart !== undefined) {
		//this is for opera, so we don't have to focus to type how we think we would
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
//gets all focusable elements
getFocusable = function(el){
	var document = h.getWindow(el).document,
		res = [];
	if(window.jQuery){
		return jQuery("[tabindex],a,area,frame,iframe,label,input,select,textarea,button,html,object", document.documentElement )
	}else{
		var els = document.getElementsByTagName('*'),
			len = els.length
		for(var i=0;  i< len; i++){
			Synthetic.isFocusable(els[i]) && res.push(els[i])
		}
		return res;
	}
	
};


h.extend(Synthetic,{
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

h.extend(Synthetic.key,{
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
		if(Synthetic.key.defaults[key]){
			return Synthetic.key.defaults[key];
		}
		for(var kind in Synthetic.key.kinds){
			if(h.inArray(key, Synthetic.key.kinds[kind])> -1 && Synthetic.key.defaults[kind]  ){
				return Synthetic.key.defaults[kind];
			}
		}
		return Synthetic.key.defaults.character
	},
	defaults : 	{
		'character' : function(options, scope, key){
			if(!S.support.keyCharacters && Synthetic.typeable.test(this.nodeName)){
				var current = this.value,
					sel = getSelection(this),
					before = current.substr(0,sel.start),
					after = current.substr(sel.end),
					character = key;
					
				this.value = before+character+after;

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
			if(!S.support.backspaceWorks && Synthetic.typeable.test(this.nodeName)){
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
			if(!S.support.backspaceWorks && Synthetic.typeable.test(this.nodeName)){
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
				var form = Synthetic.closest(this, "form");
				if(form){
					S.createEvent("submit", {}, form);
				}
					
			}
			//newline in textarea
			if(!S.support.keyCharacters && nodeName == 'textarea'){
				Synthetic.key.defaults.character.call(this, options, scope, "\n")
			}
			// 'click' hyperlinks
			if(!S.support.keypressSubmits && nodeName == 'a'){
				S.createEvent("click", {}, this);
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
				tabIndex = Synthetic.tabIndex(this),
				// will be set to our guess for the next element
				current = null,
				// the next index we care about
				currentIndex = 1000000000,
				// set to true once we found 'this' element
				found = false,
				i = 0,
				el, 
				//the tabindex of the tabable element we are looking at
				elIndex;
				
			for(; i< focusEls.length; i++){
				el = focusEls[i];
				elIndex = Synthetic.tabIndex(el);
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
			return current;
		}
	}
});


h.extend(Synthetic.create,{
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
})





var convert = {
	"enter" : "\r",
	"backspace" : "\b",
	"tab" : "\t",
	"space" : " "
}


h.extend(Synthetic.prototype,{
	key : function(element){
		var key = convert[this.options] || this.options,
			result = S.createEvent('keydown',key, element ),
			getDefault = S.key.getDefault,
			prevent = S.key.browser.prevent,
			defaultResult;
		
		//options for keypress
		options = Synthetic.key.options(key, 'keypress');
		
		if(result){
			//is there is not a keypress, run default
			if(!options){
				defaultResult = getDefault(key).call(element, options, this.scope, key)
			}else{
				//do keypress
				result = S.createEvent('keypress',options, element )
				if(result){
					defaultResult = getDefault(key).call(element, options, this.scope, key)
				}
			}
		}else{
			//canceled ... possibly don't run keypress
			if(options && h.inArray('keypress',prevent.keydown) == -1 ){
				S.createEvent('keypress',options, element )
			}
		}
		if(defaultResult && defaultResult.nodeName){
			element = defaultResult
		}
		S.createEvent('keyup',Synthetic.key.options(key, 'keyup'), element )
		//do mouseup
		
		return element;
		// is there a keypress? .. if not , run default
		// yes -> did we prevent it?, if not run ...
		
	},
	type : function(element){
		var parts = this.options.match(/(\[[^\]]+\])|([^\[])/g);
		//break it up into parts ...
		//go through each type and run
		for(var i=0; i < parts.length; i++){
			var part = parts[i];
			if(part.length > 1){
				part = part.substr(1,part.length - 2)
			}
			
			this.options = part;
			var element = this.key(element);
			
			
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
		S.support.keypressSubmits = true;
		ev.returnValue = false;
		return false;
	}
	S.createEvent("keypress", "\r", form.childNodes[3]);
	
	
	S.createEvent("keypress", "a", form.childNodes[3]);
	S.support.keyCharacters = form.childNodes[3].value == "a";
	
	
	form.childNodes[3].value = "a"
	S.createEvent("keypress", "\b", form.childNodes[3]);
	S.support.backspaceWorks = form.childNodes[3].value == "";
	
		
	
	form.childNodes[3].onchange = function(){
		S.support.focusChanges = true;
	}
	form.childNodes[3].focus();
	S.createEvent("keypress", "a", form.childNodes[3]);
	form.childNodes[5].focus();
	
	
	

	document.documentElement.removeChild(div);
	
	S.support.ready = true;
})();



	
})





