steal(function(){
	
	
var extend = function(d, s) { for (var p in s) d[p] = s[p]; return d;},
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
	createEventObject = function(type, options, element){
		var event = element.ownerDocument.createEventObject();
		return extend(event, options);
	},
	data = {}, 
	id = 0, 
	expando = "_synthetic"+(new Date() - 0),
	bind,
	unbind,
	key = /keypress|keyup|keydown/,
	page = /load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll/,

/**
 * @constructor Syn
 * Creates a synthetic event on the element.
 * 
 * @init 
 * Creates a synthetic event on the element.
 * @param {Object} type
 * @param {Object} options
 * @param {Object} element
 * @param {Object} callback
 * @return Syn
 */
Syn = function(type, options, element, callback){		
	return ( new Syn.init(type, options, element, callback) )
}
	
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
		
extend(Syn,{
	/**
	 * Creates a new synthetic event instance
	 * @param {Object} type
	 * @param {Object} options
	 * @param {Object} element
	 * @param {Object} callback
	 */
	init : function(type, options, element, callback){
		var args = Syn.args(options,element, callback),
			self = this;
		this.queue = [];
		this.element = args.element;
		
		//run event
		if(typeof this[type] == "function") {
			this[type](args.options, args.element, function(defaults,el ){
				args.callback && args.callback.apply(self, arguments);
				self.done.apply(self, arguments)		
			})
		}else{
			this.result = Syn.trigger(type, args.options, args.element);
			args.callback && args.callback.call(this, args.element, this.result);
		}
	},
	/**
	 * Returns an object with the args for a Syn.
	 * @return {objec}
	 */
	args : function(){
		var res = {}
		for(var i=0; i < arguments.length; i++){
			if(typeof arguments[i] == 'function'){
				res.callback = arguments[i]
			}else if(arguments[i] && arguments[i].nodeName){
				res.element = arguments[i];
			}else if(res.options && typeof arguments[i] == 'string'){ //we can get by id
				res.element = document.getElementById(arguments[i])
			}
			else if(arguments[i]){
				res.options = arguments[i];
			}
		}
		return res;
	},
	/**
	 * @attribute defaults
	 * Default actions for events.  Each default function is called with this as its 
	 * element.  It should return true if a timeout 
	 * should happen after it.  If it returns an element, a timeout will happen
	 * and the next event will happen on that element.s
	 */
	defaults : {
		focus : function(){
			if(!Syn.support.focusChanges){
				var element = this;
				Syn.data(element,"syntheticvalue", element.value)
				
				if(element.nodeName.toLowerCase() == "input"){
					
					bind(element, "blur", function(){
						
						if( Syn.data(element,"syntheticvalue") !=  element.value){
							
							Syn.trigger("change", {}, element);
						}
						unbind(element,"blur", arguments.callee)
					})
					
				}
			}
		}
	},
	/**
	 * Returns the closest element of a particular type.
	 * @param {Object} el
	 * @param {Object} type
	 */
	closest : function(el, type){
		while(el && el.nodeName.toLowerCase() != type.toLowerCase()){
			el = el.parentNode
		}
		return el;
	},
	/**
	 * adds jQuery like data (adds an expando) and data exists FOREVER :)
	 * @param {Object} el
	 * @param {Object} key
	 * @param {Object} value
	 */
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
	/**
	 * Calls a function on the element and all parents of the element until the function returns
	 * false.
	 * @param {Object} el
	 * @param {Object} func
	 */
	onParents : function(el, func){
		var res;
		while(el && res !== false){
			res = func(el)
			el = el.parentNode
		}
		return el;
	},
	//regex to match focusable elements
	focusable : /^(a|area|frame|iframe|label|input|select|textarea|button|html|object)$/i,
	/**
	 * Returns if an element is focusable
	 * @param {Object} elem
	 */
	isFocusable : function(elem){
		var attributeNode;
		return ( this.focusable.test(elem.nodeName) || (
			(attributeNode = elem.getAttributeNode( "tabIndex" )) && attributeNode.specified ) )
			&& Syn.isVisible(elem)
	},
	/**
	 * Returns if an element is visible or not
	 * @param {Object} elem
	 */
	isVisible : function(elem){
		return (elem.offsetWidth && elem.offsetHeight) || (elem.clientWidth && elem.clientHeight)
	},
	/**
	 * Gets the tabIndex as a number or null
	 * @param {Object} elem
	 */
	tabIndex : function(elem){
		var attributeNode = elem.getAttributeNode( "tabIndex" );
		return attributeNode && attributeNode.specified && ( parseInt( elem.getAttribute('tabIndex') ) || 0 )
	},
	bind : bind,
	unbind : unbind,
	browser: browser,
	//some generic helpers
	helpers : {
		createEventObject : createEventObject,
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
		},
		inArray : function(item, array){
			for(var i =0; i < array.length; i++){
				if(array[i] == item){
					return i;
				}
			}
			return -1;
		},
		getWindow : function(element){
			return element.ownerDocument.defaultView || element.ownerDocument.parentWindow
		},
		extend:  extend
	},
	// place for key data
	key : {},
	//triggers an event on an element, returns true if default events should be run
	/**
	 * Dispatches an event and returns true if default events should be run.
	 * @param {Object} event
	 * @param {Object} element
	 * @param {Object} type
	 * @param {Object} autoPrevent
	 */
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
					//source element makes sure element is still in the document
					return element.sourceIndex <= 0 || element.fireEvent('on'+type, event)
				}
			),
	/**
	 * @attribute
	 * creates an event of a particular type.
	 */
	create :  {
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
				Syn.onParents(element, function(el){
					if( Syn.isFocusable(el) ){
						el.focus();
						return false
					}
				})
				return true;
			}
		}
	},
	/**
	 * @attribute support
	 * Feature detected properties of a browser's event system.
	 */
	support : {
		clickChanges : false,
		clickSubmits : false,
		keypressSubmits : false,
		mouseupSubmits: false,
		radioClickChanges : false,
		focusChanges : false,
		linkHrefJS : false,
		keyCharacters : false,
		backspaceWorks : false,
		mouseDownUpClicks : false,
		tabKeyTabs : false,
		keypressOnAnchorClicks : false
	},
	/**
	 * Creates a synthetic event and dispatches it on the element.  
	 * This will run any default actions for the element.
	 * @param {Object} type
	 * @param {Object} options
	 * @param {String} element
	 */
	trigger : function(type, options, element){
		options || (options = {});
		
		var create = Syn.create,
			setup = create[type] && create[type].setup,
			kind = key.test(type) ? 
				'key' : 
				( page.test(type) ?
					"page" : "mouse" ),
				createType = create[type] || {},
				createKind = create[kind],
				event,
				ret,
				autoPrevent = options._autoPrevent;
		
		//any setup code?
		setup && setup(type, options, element)
		
		
		//get kind

			
		
		delete options._autoPrevent;
			
		if(createType.event){
			ret = createType.event(type, options, element)
		}else{
			//convert options
			options = createKind.options ? createKind.options(type,options,element) : options;
			
			//create the event
			event = createKind.event(type,options,element)
			
			//send the event
			ret = Syn.dispatch(event, element, type, autoPrevent)
		}
		
		//run default behavior
		ret && Syn.support.ready 
			&& Syn.defaults[type] 
			&& Syn.defaults[type].call(element, options, autoPrevent);
		return ret;
	}
	
});
	var h = Syn.helpers,
		convert = {
			"enter" : "\r",
			"backspace" : "\b",
			"tab" : "\t",
			"space" : " "
		};
	//support code
	
	
	extend(Syn.init.prototype,{
		/**
		 * Calls another synthetic event after the current ones are done running.
		 * @param {Object} type
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 */
		then : function(type, options, element, callback){
			var args = Syn.args(options,element, callback),
				self = this;

			
			//if stack is empty run right away
			
			//otherwise ... unshift it
			this.queue.unshift(function(el, prevented){
				
				if(typeof this[type] == "function") {
					this.element = args.element || el;
					this[type](args.options, this.element, function(defaults, el){
						args.callback && args.callback.apply(self, arguments);
						self.done.apply(self, arguments)		
					})
				}else{
					this.result = Syn.trigger(type, args.options, args.element);
					args.callback && args.callback.call(this, args.element, this.result);
					return this;
				}
			})
			return this;
		},
		done : function( defaults, el){
			el && (this.element = el);;
			if(this.queue.length){
				this.queue.pop().call(this, this.element, defaults);
			}
			
		},
		/**
		 * Clicks an element, triggering a mousedown, mouseup, and a click event.
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 */
		"click!" : function(options, element, callback){

			Syn.trigger("mousedown", options, element);
			
			//timeout is b/c IE is stupid and won't call focus handlers
			setTimeout(function(){
				Syn.trigger("mouseup", options, element)
				if(!Syn.support.mouseDownUpClicks){
					Syn.trigger("click", options, element)
				}else{
					//we still have to run the default (presumably)
					Syn.defaults.click.call(element)
				}
				callback(true)
			},1)
		},
		/**
		 * Types a single key
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 */
		key : function(options, element, callback){
			
			
			var key = convert[options] || options,
				// should we run default events
				runDefaults = Syn.trigger('keydown',key, element ),
				
				// a function that gets the default behavior for a key
				getDefault = Syn.key.getDefault,
				
				// how this browser handles preventing default events
				prevent = Syn.key.browser.prevent,
				
				// the result of the default event
				defaultResult,
				
				// options for keypress
				keypressOptions = Syn.key.options(key, 'keypress')
			
			
			if(runDefaults){
				//if the browser doesn't create keypresses for this key, run default
				if(!keypressOptions){
					defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key)
				}else{
					//do keypress
					result = Syn.trigger('keypress',keypressOptions, element )
					if(result){
						defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key)
					}
				}
			}else{
				//canceled ... possibly don't run keypress
				if(keypressOptions && h.inArray('keypress',prevent.keydown) == -1 ){
					Syn.trigger('keypress',keypressOptions, element )
				}
			}
			if(defaultResult && defaultResult.nodeName){
				element = defaultResult
			}
			setTimeout(function(){
				Syn.trigger('keyup',Syn.key.options(key, 'keyup'), element )
				callback(result, element)
			},1)
			
			//do mouseup
			
			return element;
			// is there a keypress? .. if not , run default
			// yes -> did we prevent it?, if not run ...
			
		},
		/**
		 * Types multiple characters
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 */
		type : function(options, element, callback){
			//break it up into parts ...
			//go through each type and run
			var parts = options.match(/(\[[^\]]+\])|([^\[])/g),
				self  = this,
				runNextPart = function(runDefaults, el){
					var part = parts.shift();
					if(!part){
						callback(runDefaults, el);
						return;
					}
					el = el || element;
					if(part.length > 1){
						part = part.substr(1,part.length - 2)
					}
					self.key(part, el, runNextPart)
				}
			
			runNextPart();
			
		}
	})
	
	/**
	 * Used for creating and dispatching synthetic events.
	 * @codestart
	 * new MVC.Syn('click').send(MVC.$E('id'))
	 * @codeend
	 * @init Sets up a synthetic event.
	 * @param {String} type type of event, ex: 'click'
	 * @param {optional:Object} options
	 */
	
	if (window.jQuery) {
		jQuery.fn.triggerSyn = function(type, options, callback){
			Syn(type, options, this[0], callback)
			return this;
		};
	}

	window.Syn = Syn;
	
}).then('mouse','browsers','key','drag/drag');

