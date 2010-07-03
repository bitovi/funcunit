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
	data = {}, 
	id = 0, 
	expando = "_synthetic"+(new Date() - 0),
	bind,
	unbind,
	key = /keypress|keyup|keydown/,
	page = /load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll/,

//creates a new syn and returns its
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
			this.result = createEvent(type, args.options, args.element);
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
							
							createEvent("change", {}, element);
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
	isVisible : function(elem){
		return (elem.offsetWidth && elem.offsetHeight) || (elem.clientWidth && elem.clientHeight)
	},
	tabIndex : function(elem){
		var attributeNode = elem.getAttributeNode( "tabIndex" );
		return attributeNode && attributeNode.specified && ( parseInt( elem.getAttribute('tabIndex') ) || null )
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
					//source element makes sure element is still in the document
					return element.sourceIndex <= 0 || element.fireEvent('on'+type, event)
				}
			),
	create :  {
		//-------- PAGE EVENTS ---------------------
		page : {
			event : document.createEvent ? function(type, options, element){
					var event = element.ownerDocument.createEvent("Events");
					event.initEvent(type, true, true ); 
					return event;
				} : h.createEventObject
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
	createEvent : function(type, options, element){
		var create = Syn.create;
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
	//object lets you create certain types of eventss
	createEvent = Syn.createEvent;
	//support code
	
	
	extend(Syn.init.prototype,{
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
					this.result = createEvent(type, args.options, args.element);
					args.callback && args.callback.call(this, args.element, this.result);
					return this;
				}
			})
			return this;
		},
		done : function( defaults, el){
			if(el){
				this.element = el
			}
			if(this.queue.length){
				this.queue.pop().call(this, this.element, defaults)
			}
			
		},
		"click!" : function(options, element, callback){

			
			createEvent("mousedown", options, element);
			
			//timeout is b/c IE is stupid and won't call focus handlers
			setTimeout(function(){
				createEvent("mouseup", options, element)
				if(!Syn.support.mouseDownUpClicks){
					createEvent("click", options, element)
				}else{
					//we still have to run the default (presumably)
					Syn.defaults.click.call(element)
				}
				callback(true)
			},1)
		},
		key : function(options, element, callback){
			var convert = {
				"enter" : "\r",
				"backspace" : "\b",
				"tab" : "\t",
				"space" : " "
			}
			
			var key = convert[options] || options,
				runDefaults = Syn.createEvent('keydown',key, element ),
				getDefault = Syn.key.getDefault,
				prevent = Syn.key.browser.prevent,
				defaultResult;
			
			
			
			//options for keypress
			var keypressOptions = Syn.key.options(key, 'keypress');
			
			
			
			if(runDefaults){
				//is there is not a keypress, run default
				if(!keypressOptions){
					defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key)
				}else{
					//do keypress
					result = Syn.createEvent('keypress',keypressOptions, element )
					if(result){
						defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key)
					}
				}
			}else{
				//canceled ... possibly don't run keypress
				if(keypressOptions && h.inArray('keypress',prevent.keydown) == -1 ){
					Syn.createEvent('keypress',keypressOptions, element )
				}
			}
			if(defaultResult && defaultResult.nodeName){
				element = defaultResult
			}
			setTimeout(function(){
				Syn.createEvent('keyup',Syn.key.options(key, 'keyup'), element )
				callback(result, element)
			},1)
			
			//do mouseup
			
			return element;
			// is there a keypress? .. if not , run default
			// yes -> did we prevent it?, if not run ...
			
		},
		type : function(options, element, callback){
			var parts = options.match(/(\[[^\]]+\])|([^\[])/g);
			//break it up into parts ...
			//go through each type and run
			var self  = this;
			
			function runNextPart(runDefaults, el){
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
		jQuery.fn.syn = function(type, options, callback){
			Syn(type, options, this[0], callback)
			return this;
		};
	}

	window.Syn = Syn;
	
}).then('mouse','browsers','key','drag/drag');

