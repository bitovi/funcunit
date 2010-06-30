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
support = Synthetic.support;


Synthetic.extend(Synthetic,{
	keycodes: {
		'\b':'8',
		
		'\t':'9',
		
		
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
		
		//enter
		'\r':'13',
		
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

	typeable : /input|textarea/i,
	getKeyData : function(key){
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
	getKeyOptions : function(key, keyData, event){
		var charCode = keyData[event][0];
		var keyCode = keyData[event][1],
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
	key : {
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
				if(!Synthetic.focusable.test(this.nodeName)){
					getWindow(this).document.documentElement.scrollTop = 0;
				}
			},
			'end' : function(){
				if(!Synthetic.focusable.test(this.nodeName)){
					getWindow(this).document.documentElement.scrollTop = document.documentElement.scrollHeight;
				}
			},
			'page-down' : function(){
				if(!Synthetic.focusable.test(this.nodeName)){
					var ch = getWindow(this).document.documentElement.clientHeight
					getWindow(this).document.documentElement.scrollTop += ch;
				}
			},
			'page-up' : function(){
				if(!Synthetic.focusable.test(this.nodeName)){
					var ch = getWindow(this).document.documentElement.clientHeight
					getWindow(this).document.documentElement.scrollTop -= ch;
				}
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
	}
});




var convert = {
	"enter" : "\r",
	"backspace" : "\b",
	"tab" : "\t",
	"space" : " "
}




Synthetic.prototype.key = function(element){
	var key = convert[this.options] || this.options,
		data = Synthetic.getKeyData(key),
		options = Synthetic.getKeyOptions(key, data, 'keydown'),
		result = Synthetic.createEvent('keydown',options, element ),
		getDefault = Synthetic.key.getDefault,
		prevent = Synthetic.key.browser.prevent;
	
	if(result){
		//is there is not a keypress, run default
		if(!data.keypress){
			getDefault(key).call(element, options, this.scope, key)
		}else{
			//do keypress
			result = Synthetic.createEvent(
				'keypress',
				Synthetic.getKeyOptions(key, data, 'keypress'), 
				element )
			if(result){
				getDefault(key).call(element, options, this.scope, key)
			}
			
		}
	}else{
		//canceled ... possibly don't run keypress
		if(!data.keypress && inArray('keypress',prevent.keydown) == -1 ){
			Synthetic.createEvent(
				'keypress',
				Synthetic.getKeyOptions(key, data, 'keypress'), 
				element )
		}
	}
	Synthetic.createEvent('keyup',Synthetic.getKeyOptions(key, data, 'keyup'), element )
	//do mouseup
	
	return result
	// is there a keypress? .. if not , run default
	// yes -> did we prevent it?, if not run ...
	
}	








	
})





