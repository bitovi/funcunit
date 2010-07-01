

steal(function(){
	
	
	var Synthetic = function(type, options, scope){
			this.eventType = type;
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
		
	Syn = function(type, options, element, callback){
		var temp;
		if(options.nodeName){ //in case they are reversed
			temp = element;
			element = options;
			options = element;
		}
		
		return ( new Syn.init(type, options, element, callback) )

	}
	Syn.init = function(type, options, element, callback){
		var self = this;
		this.queue = [];
		this.element = element;
		
		//run event
		if(typeof this[type] == "function") {
			console.log('running ', type)
			this[type](options, element, function(defaults,el ){
				callback && callback.apply(self, arguments);
				self.done.apply(self, arguments)		
			})
		}else{
			this.result = createEvent(type, options, element);
			callback && callback.call(this, element, this.result);
		}
	}
	var S = Synthetic;
	extend(Syn.init.prototype,{
		then : function(type, options, element, callback){
			options = options || {}
			if(options.nodeName){ //in case they are reversed
				temp = element;
				element = options;
				options = element;
			}
			if(typeof element == 'function'){
				callback = element;
				element = undefined;
			}
			var runNow = this.queue.length,
				self = this;

			
			//if stack is empty run right away
			
			//otherwise ... unshift it
			this.queue.unshift(function(el, prevented){
				
				if(typeof this[type] == "function") {
					this.element = element || el;
					this[type](options, this.element, function(defaults, el){
						callback && callback.apply(self, arguments);
						self.done.apply(self, arguments)		
					})
				}else{
					this.result = createEvent(type, options, element);
					callback && callback.call(this, element, this.result);
					return this.result;
				}
			})
			return this;
		},
		done : function( defaults, el){
			console.log('done is called', el)
			if(el){
				this.element = el
			}
			if(this.queue.length){
				this.queue.pop().call(this, this.element, defaults)
			}
			
		},
		clicker : function(options, element, callback){
			var nodeName = element.nodeName.toLowerCase();
			
			createEvent("mousedown", options, element);
			
			//timeout is b/c IE is stupid and won't call focus handlers
			//synchronously.  So everyone has to suffer :(
			setTimeout(function(){
				createEvent("mouseup", options, element)
				if(!support.mouseDownUpClicks){
					createEvent("click", options, element)
				}
				console.log('done clicking')
				callback(true)
			},1)
		},
		key : function(options, element, callback){
			var key = convert[options] || options,
				runDefaults = S.createEvent('keydown',key, element ),
				getDefault = S.key.getDefault,
				prevent = S.key.browser.prevent,
				defaultResult;
			
			
			
			//options for keypress
			var keypressOptions = Synthetic.key.options(key, 'keypress');
			
			
			
			if(runDefaults){
				//is there is not a keypress, run default
				if(!keypressOptions){
					defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key)
				}else{
					console.log('keypress', element)
					//do keypress
					result = S.createEvent('keypress',keypressOptions, element )
					if(result){
						defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key)
					}
				}
			}else{
				//canceled ... possibly don't run keypress
				if(keypressOptions && h.inArray('keypress',prevent.keydown) == -1 ){
					S.createEvent('keypress',keypressOptions, element )
				}
			}
			if(defaultResult && defaultResult.nodeName){
				element = defaultResult
			}
			setTimeout(function(){
				console.log('keyup', element)
				S.createEvent('keyup',Synthetic.key.options(key, 'keyup'), element )
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
			var attributeNode;
			return this.focusable.test(elem.nodeName) || (
				(attributeNode = elem.getAttributeNode( "tabIndex" )) && attributeNode.specified )
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
			extend:  extend,
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
	var h = S.helpers

	

	//dispatches an event
	var createEventObject = Synthetic.helpers.createEventObject,
		createBasicStandardEvent = Synthetic.helpers.createBasicStandardEvent,
	
	//object lets you create certain types of events		
	create = (Synthetic.create =  {
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
		mouseDownUpClicks : false,
		tabKeyTabs : false
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
			if(typeof this[this.eventType] == "function") {
				return this[this.eventType].apply(this, arguments)
			}
				
			return createEvent(this.eventType, this.options, element)
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
	
}).then('mouse','browser_keys','keys','drag/drag');

