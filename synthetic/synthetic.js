

steal(function(){

	var Synthetic = function(type, options, scope){
			this.type = type;
			this.options = options || {};
			this.scope = scope || window
		},
		
		extend = function(d, s) { for (var p in s) d[p] = s[p]; return d;},
		// only uses browser detection for key events
		browser = {
			msie:     !!(window.attachEvent && !window.opera),
			opera:  !!window.opera,
			webkit : navigator.userAgent.indexOf('AppleWebKit/') > -1,
			safari: navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Chrome/') == -1,
			gecko:  navigator.userAgent.indexOf('Gecko') > -1,
			mobilesafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),
			rhino : navigator.userAgent.match(/Rhino/) && true
		},
		data = {}, 
		id = 0, 
		expando = "_synthetic"+(new Date() - 0),
		bind,
		unbind;
		
		
	if(window.addEventListener){ // Mozilla, Netscape, Firefox
		bind = function(el, ev, f){
			el.addEventListener(ev, f, false)
		}
		unbind = function(el, ev, f){
			el.removeEventListener(ev, f, false)
		}
	}else{
		bind = function(el, ev, f){
			el.attachEvent("on"+ev, f)
		}
		unbind = function(el, ev, f){
			el.detachEvent("on"+ev, f)
		}
	}
		
		
	extend(Synthetic,{
		//default actions by event type
		extend:  extend,
		defaults : {
			mousedown : function(options){
				createEvent("focus", {}, this)
			},
			focus : function(){
				if(!support.focusChanges){
					var element = this;
					Synthetic.data(element,"syntheticvalue", element.value)
					
					if(element.nodeName.toLowerCase() == "input"){
						
						bind(element, "blur", function(){
							
							
							if( Synthetic.data(element,"syntheticvalue") !=  element.value){
								
								createEvent("change", {}, element);
							}
							unbind(element,"blur", arguments.callee)
						})
						
					}
				}
			},
			click : function(){
				// prevents the access denied issue in IE if the click causes the element to be destroyed
				var element = this;
				try {
					element.nodeType;
				} catch(e){
					return;
				}
				//get old values
				var href,
					checked = Synthetic.data(element,"checked"),
					scope = element.ownerDocument.defaultView || element.ownerDocument.parentWindow,
					nodeName = element.nodeName.toLowerCase();
				
				if( (href = Synthetic.data(element,"href") ) ){
					element.setAttribute('href',href)
				}

				
				
				//run href javascript
				if(!support.linkHrefJS 
					&& /^\s*javascript:/.test(element.href)){
					//eval js
					var code = element.href.replace(/^\s*javascript:/,"")
						
					//try{
					if (code != "//" && code.indexOf("void(0)") == -1) {
						if(window.selenium){
							eval("with(selenium.browserbot.getCurrentWindow()){"+code+"}")
						}else{
							eval("with(scope){"+code+"}")
						}
					}
				}
				
				//submit a form
				if(nodeName == "input" 
					&& element.type == "submit" 
					&& !(support.clickSubmits)){
						
					var form =  Synthetic.closest(element, "form");
					if(form)
						new Synthetic("submit").send( form );
					
				}
				//follow a link, probably needs to check if in an a.
				if(nodeName == "a" 
					&& element.href 
					&& !/^\s*javascript:/.test(element.href)){
						
					scope.location.href = element.href;
					
				}
				
				//change a checkbox
				if(nodeName == "input" 
					&& element.type == "checkbox"){
					
					if(!support.clickChecks && !support.changeChecks){
						element.checked = !element.checked;
					}
					if(!support.clickChanges)
						new Synthetic("change").send(  element );
					
				}
				
				//change a radio button
				if(nodeName == "input" && element.type == "radio"){  // need to uncheck others if not checked
					
					if(!support.clickChecks && !support.changeChecks){
						//do the checks manually 
						if(!element.checked){ //do nothing, no change
							element.checked = true;
						}
					}
					if(checked != element.checked && !support.radioClickChanges){
						new Synthetic("change").send(  element );
					}
				}
				
				// change options
				if(nodeName == "option"){
					//check if we should change
					//find which selectedIndex this is
					var children = element.parentNode.childNodes;
					for(var i =0; i< children.length; i++){
						if(children[i] == element) break;
					}
					if(i !== element.parentNode.selectedIndex){
						element.parentNode.selectedIndex = i;
						new Synthetic("change").send(  element.parentNode );
					}
				}
					
				
			}
		},
		
		closest : function(el, type){
			while(el && el.nodeName.toLowerCase() != type.toLowerCase()){
				el = el.parentNode
			}
			return el;
		},
		data : function(el, key, value){
			var d;
			if(!el[expando]){
				el[expando] = id++;
			}
			if(!data[el[expando]]){
				data[el[expando]] = {};
			}
			d = data[el[expando]]
			if(value){
				data[el[expando]][key] = value;
			}else{
				return data[el[expando]][key];
			}
		},
		onParents : function(el, func){
			var res;
			while(el && res !== false){
				res = func(el)
				el = el.parentNode
			}
			return el;
		},
		focusable : /^(a|area|frame|iframe|label|input|select|textarea|button|html|object)$/i,
		isFocusable : function(elem){
			var attributeNode = elem.getAttributeNode( "tabIndex" );

			return this.focusable.test(elem.nodeName) || attributeNode && attributeNode.specified
		},
		tabIndex : function(elem){
			var attributeNode = elem.getAttributeNode( "tabIndex" );
			return attributeNode && attributeNode.specified && elem.getAttribute('tabIndex')
		},
		bind : bind,
		unbind : unbind,
		browser: browser
	});
	

	var key = /keypress|keyup|keydown/,
		
	page = /load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll/,

	//dispatches an event
	dispatch = document.documentElement.dispatchEvent ? 
			function(event, element, type, autoPrevent){
				var preventDefault = event.preventDefault, 
					prevents = autoPrevent ? -1 : 0;
				
				//automatically prevents the default behavior for this event
				//this is to protect agianst nasty browser freezing bug in safari
				if(autoPrevent){
					bind(element, type, function(ev){
						ev.preventDefault()
						unbind(this, type, arguments.callee)
					})
				}
				
				
				event.preventDefault = function(){
					prevents++;
					if(++prevents > 0){
						preventDefault.apply(this,[]);
					}
				}
				element.dispatchEvent(event)
				return prevents <= 0;
			} : 
			function(event, element, type){
				try {window.event = event;}catch(e) {}
				return element.fireEvent('on'+type, event);
			},
	createEventObject = function(type, options, element){
		var event = element.ownerDocument.createEventObject();
		return extend(event, options);
	},
	createBasicStandardEvent = function(type, defaults){
		var event;
		try {
			event = document.createEvent("Events");
		} catch(e2) {
			event = document.createEvent("UIEvents");
		} finally {
			event.initEvent(type, true, true);
			extend(event, defaults);
		}
		return event;
	},
	
	//object lets you create certain types of events		
	create = {
		//-------- MOUSE EVENTS ---------------------
		mouse : {
			options : function(type, options, element){
				var doc = document.documentElement, body = document.body,
					center = [options.pageX || 0, options.pageY || 0] 
				return extend({
					bubbles : true,cancelable : true,
					view : window,detail : 1,
					screenX : 1, screenY : 1,
					clientX : center[0] -(doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0), 
					clientY : center[1] -(doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0),
					ctrlKey : false, altKey : false, shiftKey : false, metaKey : false,
					button : (type == 'contextmenu' ? 2 : 0), 
					relatedTarget : document.documentElement
				}, options);
			},
			event : document.createEvent ? 
				function(type, defaults, element){  //Everyone Else
					var event;
					
					try {
						event = element.ownerDocument.createEvent('MouseEvents');
						event.initMouseEvent(type, 
							defaults.bubbles, defaults.cancelable, 
							defaults.view, 
							defaults.detail, 
							defaults.screenX, defaults.screenY,defaults.clientX,defaults.clientY,
							defaults.ctrlKey,defaults.altKey,defaults.shiftKey,defaults.metaKey,
							defaults.button,defaults.relatedTarget);
					} catch(e) {
						event = createBasicStandardEvent(type,defaults)
					}
					event.synthetic = true;
					return event;
				} : 
				createEventObject
		},
		// -----------------  Key Events --------------------
		key : {
			rules : {
				firefox : {
					character : {
								
					},
					modifier :{
						
					}
				}
			},
			
			options : function(type, options, element){
		
				//if keyCode and charCode should be reversed
				var reverse = browser.opera || browser.msie,
					
					// if keyCode and charCode are in both places
					both = browser.safari || type != 'keypress', 
					character = "", v, defaults;
					
				if(options.keyCode == 8 || options.charCode == 8) options = "\b";
				defaults  = typeof options != "object" ? {character : options} : options;
					
				//add basics
				defaults = extend({
					ctrlKey: false,
					altKey: false,
					shiftKey: false,
					metaKey: false,
					charCode: 0, keyCode: 0
				}, defaults);
		
				if(typeof defaults.character == "number"){
					character = String.fromCharCode(defaults.character);
					v = defaults.character
					defaults = extend(defaults,{keyCode :  v,charCode:  both ? v : 0})
				}else if(typeof defaults.character == "string"){
					character = defaults.character;
					v = (type == "keypress" ? character.charCodeAt(0) : character.toUpperCase().charCodeAt(0) );
					defaults = extend(defaults,{
						keyCode : both ? v : (reverse ? v : 0),
						charCode: both ? v : (reverse ? 0: v)
					})
				}
				
				if(character && character == "\b") {
					defaults.keyCode = 8;
					character = 0;
				}
				if (character && character == "\n") {
					defaults.keyCode = 13;
				}
				defaults.character = character;
				options.keyCode = defaults.keyCode;
				return defaults
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
	
					event.charCode = options.charCode;
					event.keyCode = options.keyCode;
					event.shiftKey = options.shiftKey;
	
					return event;
				}
		},
		//-------- PAGE EVENTS ---------------------
		page : {
			event : document.createEvent ? function(type, options, element){
					var event = element.ownerDocument.createEvent("Events");
					event.initEvent(type, true, true ); 
					return event;
				} : createEventObject
		},
		// unique events
		focus : {
			event : function(type, options, element){
				Synthetic.onParents(element, function(el){
					if( Synthetic.isFocusable(el) ){
						el.focus();
						return false
					}
				})
				return true;
			}
		},
		click : {
			setup : function(type, options, element){
				try{
					Synthetic.data(element,"checked", element.checked);
				}catch(e){}
				if( 
					element.nodeName.toLowerCase() == "a" 
					&& element.href  
					&& !/^\s*javascript:/.test(element.href)){
					
					//save href
					Synthetic.data(element,"href", element.href)
					
					//remove b/c safari/opera will open a new tab instead of changing the page
					element.setAttribute('href','javascript://')
				}
			}
		},
		mousedown : {
			setup : function(type,options, element){
				var nn = element.nodeName.toLowerCase();
				//we have to auto prevent default to prevent freezing error in safari
				if(browser.safari && (nn == "select" || nn == "option" )){
					options._autoPrevent = true;
				}
				
				
			}
		}
	},
	createEvent = function(type, options, element){
		options || (options = {});
		//any setup code?
		create[type] && create[type].setup 
			&& create[type].setup(type, options, element)
		
		
		//get kind
		var kind = key.test(type) ? 
				'key' : 
				( page.test(type) ?
					"page" : "mouse" ),
				event,
				ret,
			autoPrevent = options._autoPrevent;
		
		delete options._autoPrevent;
			
		if(create[type] && create[type].event){
			ret = create[type].event(type, options, element)
		}else{
			//convert options
			options = create[kind].options ? create[kind].options(type,options,element) : options;
			
			event = create[kind].event(type,options,element)
			
			//send the event
			ret = dispatch(event, element, type, autoPrevent)
		}
		
		//run default behavior
		ret && support.ready 
			&& Synthetic.defaults[type] 
			&& Synthetic.defaults[type].call(element, options, autoPrevent);
		return ret;
	},
	
	support = {
		clickChanges : false,
		clickSubmits : false,
		keypressSubmits : false,
		mouseupSubmits: false,
		radioClickChanges : false,
		focusChanges : false,
		linkHrefJS : false,
		keyCharacters : false,
		backspaceWorks : false,
		mouseDownUpClicks : false
	};
	
	Synthetic.support = support;
	//support code
	(function(){
		var oldSynth = window.__synthTest;
		window.__synthTest = function(){
			support.linkHrefJS = true;
		}
		var div = document.createElement("div"), checkbox, submit, form, input, submitted = false;
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
		form = div.firstChild
		checkbox = form.childNodes[0];
		submit = form.childNodes[2];
		
		
		checkbox.checked = false;
		checkbox.onchange = function(){
			support.clickChanges = true;
		}
		//document.body.appendChild(div);
		createEvent("click", {}, checkbox)
		support.clickChecks = checkbox.checked;
		checkbox.checked = false;
		
		
		createEvent("change", {}, checkbox);
		
		support.changeChecks = checkbox.checked;
		
		form.onsubmit = function(ev){
			if (ev.preventDefault) 
				ev.preventDefault();
			submitted = true;
			return false;
		}
		createEvent("click", {}, submit)
		if (submitted) {
			support.clickSubmits = true;
		}
			
		submitted = false;
		createEvent("keypress", {
			character: "\n"
		}, form.childNodes[3]);
		if (submitted) {
			support.keypressSubmits = true;
		}
			
			
		createEvent("keypress", {character: "a"}, form.childNodes[3]);
		if (form.childNodes[3].value == "a") {
			support.keyCharacters = true;
		}
		form.childNodes[3].value = "a"
		createEvent("keypress", {character: "\b"}, form.childNodes[3]);
		if (form.childNodes[3].value == "") {
			support.backspaceWorks = true;
		}
			
		
		form.childNodes[1].onchange = function(){
			support.radioClickChanges = true;
		}
		createEvent("click", {}, form.childNodes[1])
		
		
		form.childNodes[3].onchange = function(){
			support.focusChanges = true;
		}
		form.childNodes[3].focus();
		
		createEvent("keypress", {
			character: "a"
		}, form.childNodes[3]);
		
		form.childNodes[5].focus();
		
		createEvent("click", {}, div.getElementsByTagName('a')[0])
		
		//test if mousedown followed by mouseup causes click (opera)
		div.onclick = function(){
			support.mouseDownUpClicks = true;
		}
		createEvent("mousedown",{},div)
		createEvent("mouseup",{},div)
		
		document.documentElement.removeChild(div);
		
		//check stuff
		window.__synthTest = oldSynth;
		support.ready = true;
	})();
	
	
	Synthetic.createEvent = createEvent;
	
	Synthetic.prototype = 
	{
		/**
		 * Dispatches the event on the given element
		 * @param {HTMLElement} element the element that will be the target of the event.
		 */
		send : function(element){
			//turn auto complete off
			if(element.nodeName.toLowerCase() == 'input' 
				&& element.getAttribute('autocomplete') != 'off'){
				element.setAttribute('autocomplete','off');
			}
				
			if(typeof this[this.type] == "function") {
				return this[this.type].apply(this, arguments)
			}
				
			return this.create_event(element)
		},
		key : function(element){
			createEvent("keydown", this.options, element);
			createEvent("keypress", this.options, element);
			createEvent("keyup", this.options, element);
		},
		/**
		 * Mouses down, focuses, up, and clicks an element
		 * @param {Object} element
		 */
		clicker : function(element){
			var options = this.options,
				nodeName = element.nodeName.toLowerCase();
			
			//safari freezes JS mousedown on select or options
			// no way to feature detect :(
			// and this keeps mousedowns from happening.
			
			createEvent("mousedown", options, element);
			
			setTimeout(function(){
				createEvent("mouseup", options, element)
				if(!support.mouseDownUpClicks){
					createEvent("click", options, element)
				}
				
			},1)
			
			//jQuery(element).bind("click",set );
			return;
		},
		/**
		 * Picks how to create the event
		 * @param {Object} element
		 */
		create_event: function(element){
			return createEvent(this.type, this.options, element)
			
		},
		// drag requires jquery
		drag: function(from){
			var doc = this.scope.document;
			var jq = this.scope.jQuery
			if( !jQuery ) {
				throw "You need jQuery to perform drags in synthetic.js"
			}
				
			//get from and to
			var addxy = function(part, options, center){
				if(!options[part].x || !options[part].y ){
					var j = jq(options[part], doc)
					var o = j.offset();
					options[part] = {
						x: o.left+ (center ? j.width() / 2 : 0 ),
						y: o.top + (center ? j.height() / 2 : 0 )
					};
				}
				// relative coordinates
				if(typeof options[part].x == "string" || typeof options[part].y == "string") {
					var orig = jq(from, doc).offset()
					var x = parseInt(options[part].x, 10);
					var y = parseInt(options[part].y, 10);
					options[part] = {
						x: orig.left + x,
						y: orig.left + y
					}
				}
			}
			this.options.from = from;
			this.options.to = jq(this.options.to, doc)[0];
			addxy('from', this.options);
			addxy('to', this.options, true);
			if(this.options.duration){
				return new Drag(from, this.options)
			}
			
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
			var x = this.options.from.x - scrollLeft;
			var y = this.options.from.y - scrollTop;
			var steps = this.options.steps || 100;
			this.type = 'mousedown';
			this.options.clientX = x;
			this.options.clientY = y;
			this.create_event(from);
			this.type = 'mousemove';
			for(var i = 0; i < steps; i++){
				x = this.options.from.x -  scrollLeft + (i * (this.options.to.x - this.options.from.x )) / steps;
				y = this.options.from.y - scrollTop + (i * (this.options.to.y - this.options.from.y )) / steps;
				this.options.clientX = x;
				this.options.clientY = y;
				this.create_event(from);
			}
			this.type = 'mouseup';
			this.options.clientX = this.options.to.x - scrollLeft;
			this.options.clientY = this.options.to.y - scrollTop;
			this.create_event(from);
		}
		
	}
	
	var Drag = function(target, options){
		this.callback = options.callback;
		this.start_x = options.from.x;
		this.end_x = options.to.x;
		this.delta_x = this.end_x - this.start_x;
		this.start_y = options.from.y;
		this.end_y = options.to.y;
		this.delta_y = this.end_y - this.start_y;
		this.target = target;
		this.duration = options.duration ? options.duration*1000 : 1000;
		this.start = new Date();

		new Synthetic('mousedown', {clientX: this.start_x, clientY: this.start_y}).send(target);

		// create a mouse cursor
		this.pointer = document.createElement('div');
		this.pointer.style.width = '10px';
		this.pointer.style.height = '10px';
		this.pointer.style.backgroundColor = 'RED';
		this.pointer.style.position = 'absolute';
		this.pointer.style.left = ''+this.start_x+'px';
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
		var pointerY = this.start_y+scrollTop;
		this.pointer.style.top = ''+pointerY+'px';
		this.pointer.style.lineHeight = '1px';
		document.body.appendChild(this.pointer);
		
		setTimeout(this.next_callback(), 20);
	};
	Drag.prototype = {
		next: function(){
			var now = new Date();
			var difference = now - this.start;
			if( difference > this.duration ){
				new Synthetic('mousemove', {clientX: this.end_x, clientY: this.end_y}).send(this.target);
				var event = new Synthetic('mouseup', {clientX: this.end_x, clientY: this.end_y}).send(this.target);
				this.pointer.parentNode.removeChild(this.pointer);
				if(this.callback) this.callback({event: event, element: this.target});
			}else{
				var percent = difference / this.duration;
				var x =  this.start_x + percent * this.delta_x;
				var y = this.start_y + percent * this.delta_y;

				this.pointer.style.left = ''+x+'px';
				var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
				var pointerY = y+scrollTop;
				this.pointer.style.top = ''+pointerY+'px';
				new Synthetic('mousemove', {clientX: x, clientY: y}).send(this.target);
				setTimeout(this.next_callback(), 20);
			}
		},
		next_callback : function(){
			var t = this;
			return function(){
				t.next();
			};
		}
	};


	/**
	 * Used for creating and dispatching synthetic events.
	 * @codestart
	 * new MVC.Synthetic('click').send(MVC.$E('id'))
	 * @codeend
	 * @init Sets up a synthetic event.
	 * @param {String} type type of event, ex: 'click'
	 * @param {optional:Object} options
	 */
	
	if (window.jQuery) {
		jQuery.fn.synthetic = function(type, options, context){
			new Synthetic(type, options, context).send(this[0]);
			return this;
		};
	}

	window.Synthetic = Synthetic;
	
}).then('keys','browser_keys');

