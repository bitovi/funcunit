

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
		unbind,
		key = /keypress|keyup|keydown/,
		page = /load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll/;
		
		
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
		
		//default behavior for events
		defaults : {
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
			}
		},
		//returns the closest element of type
		closest : function(el, type){
			while(el && el.nodeName.toLowerCase() != type.toLowerCase()){
				el = el.parentNode
			}
			return el;
		},
		//adds jQuery like data (adds an expando) and data exists FOREVER :)
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
		browser: browser,
		helpers : {
			createEventObject : function(type, options, element){
				var event = element.ownerDocument.createEventObject();
				return extend(event, options);
			},
			createBasicStandardEvent : function(type, defaults){
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
			}
		},
		//place for key
		key : {},
		//triggers an event on an element, returns true if default events should be run
		dispatch : (document.documentElement.dispatchEvent ? 
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
					}
				)
		
	});
	

	

	//dispatches an event
	var createEventObject = Synthetic.helpers.createEventObject,
		createBasicStandardEvent = Synthetic.helpers.createBasicStandardEvent,
	
	//object lets you create certain types of events		
	create = (Synthetic.create =  {
		//-------- MOUSE EVENTS ---------------------
		
		// -----------------  Key Events --------------------
		key : {
			options : function(type, options, element){
		
				//if keyCode and charCode should be reversed
				var reverse = browser.opera || browser.msie,
					
					// if keyCode and charCode are in both places
					both = browser.safari || type != 'keypress', 
					character = "", v, defaults;
					
				if(options.keyCode == 8 || options.charCode == 8) {
					options = "\b";
				}
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
		}
	}),
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
			ret = Synthetic.dispatch(event, element, type, autoPrevent)
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
				
			return createEvent(this.type, this.options, element)
		}
	}
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
	
}).then('mouse','browser_keys','keys','drag');

