/*
 * FuncUnit - 2.1.0-pre
 * http://funcunit.com
 * Copyright (c) 2014 Bitovi
 * Tue, 18 Feb 2014 21:52:30 GMT
 * Licensed MIT */

!function(window) {

// ## lib/syn/src/synthetic.js
var __m3 = (function(){
	//allow for configuration of Syn
	var opts = window.Syn ? window.Syn : {};

	var extend = function( d, s ) {
		var p;
		for (p in s) {
			d[p] = s[p];
		}
		return d;
	},
		// only uses browser detection for key events
		browser = {
			msie: !! (window.attachEvent && !window.opera),
			opera: !! window.opera,
			webkit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
			safari: navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Chrome/') === -1,
			gecko: navigator.userAgent.indexOf('Gecko') > -1,
			mobilesafari: !! navigator.userAgent.match(/Apple.*Mobile.*Safari/),
			rhino: navigator.userAgent.match(/Rhino/) && true
		},
		createEventObject = function( type, options, element ) {
			var event = element.ownerDocument.createEventObject();
			return extend(event, options);
		},
		data = {},
		id = 1,
		expando = "_synthetic" + new Date().getTime(),
		bind, unbind, key = /keypress|keyup|keydown/,
		page = /load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll/,
		//this is maintained so we can click on html and blur the active element
		activeElement,

		/**
		 * @class Syn
		 * @download funcunit/dist/syn.js
		 * @test funcunit/synthetic/qunit.html
		 * Syn is used to simulate user actions.  It creates synthetic events and
		 * performs their default behaviors.
		 * 
		 * <h2>Basic Use</h2>
		 * The following clicks an input element with <code>id='description'</code>
		 * and then types <code>'Hello World'</code>.
		 * 
		 @codestart
		 Syn.click({},'description')
		 .type("Hello World")
		 @codeend
		 * <h2>User Actions and Events</h2>
		 * <p>Syn is typically used to simulate user actions as opposed to triggering events. Typing characters
		 * is an example of a user action.  The keypress that represents an <code>'a'</code>
		 * character being typed is an example of an event. 
		 * </p>
		 * <p>
		 *   While triggering events is supported, it's much more useful to simulate actual user behavior.  The 
		 *   following actions are supported by Syn:
		 * </p>
		 * <ul>
		 *   <li><code>[Syn.prototype.click click]</code> - a mousedown, focus, mouseup, and click.</li>
		 *   <li><code>[Syn.prototype.dblclick dblclick]</code> - two <code>click!</code> events followed by a <code>dblclick</code>.</li>
		 *   <li><code>[Syn.prototype.key key]</code> - types a single character (keydown, keypress, keyup).</li>
		 *   <li><code>[Syn.prototype.type type]</code> - types multiple characters into an element.</li>
		 *   <li><code>[Syn.prototype.move move]</code> - moves the mouse from one position to another (triggering mouseover / mouseouts).</li>
		 *   <li><code>[Syn.prototype.drag drag]</code> - a mousedown, followed by mousemoves, and a mouseup.</li>
		 * </ul>
		 * All actions run asynchronously.  
		 * Click on the links above for more 
		 * information on how to use the specific action.
		 * <h2>Asynchronous Callbacks</h2>
		 * Actions don't complete immediately. This is almost 
		 * entirely because <code>focus()</code> 
		 * doesn't run immediately in IE.
		 * If you provide a callback function to Syn, it will 
		 * be called after the action is completed.
		 * <br/>The following checks that "Hello World" was entered correctly: 
		 @codestart
		 Syn.click({},'description')
		 .type("Hello World", function(){
		 
		 ok("Hello World" == document.getElementById('description').value)  
		 })
		 @codeend
		 <h2>Asynchronous Chaining</h2>
		 <p>You might have noticed the [Syn.prototype.then then] method.  It provides chaining
		 so you can do a sequence of events with a single (final) callback.
		 </p><p>
		 If an element isn't provided to then, it uses the previous Syn's element.
		 </p>
		 The following does a lot of stuff before checking the result:
		 @codestart
		 Syn.type('ice water','title')
		 .type('ice and water','description')
		 .click({},'create')
		 .drag({to: 'favorites'},'newRecipe',
		 function(){
		 ok($('#newRecipe').parents('#favorites').length);
		 })
		 @codeend
		 
		 <h2>jQuery Helper</h2>
		 If jQuery is present, Syn adds a triggerSyn helper you can use like:
		 @codestart
		 $("#description").triggerSyn("type","Hello World");
		 @codeend
		 * <h2>Key Event Recording</h2>
		 * <p>Every browser has very different rules for dispatching key events.  
		 * As there is no way to feature detect how a browser handles key events,
		 * synthetic uses a description of how the browser behaves generated
		 * by a recording application.  </p>
		 * <p>
		 * If you want to support a browser not currently supported, you can
		 * record that browser's key event description and add it to
		 * <code>Syn.key.browsers</code> by it's navigator agent.
		 * </p>
		 @codestart
		 Syn.key.browsers["Envjs\ Resig/20070309 PilotFish/1.2.0.10\1.6"] = {
		 'prevent':
		 {"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
		 'character':
		 { ... }
		 }
		 @codeend
		 * <h2>Limitations</h2>
		 * Syn fully supports IE 6+, FF 3+, Chrome, Safari, Opera 10+.
		 * With FF 1+, drag / move events are only partially supported. They will
		 * not trigger mouseover / mouseout events.<br/>
		 * Safari crashes when a mousedown is triggered on a select.  Syn will not 
		 * create this event.
		 * <h2>Contributing to Syn</h2>
		 * Have we missed something? We happily accept patches.  The following are 
		 * important objects and properties of Syn:
		 * <ul>
		 * 	<li><code>Syn.create</code> - contains methods to setup, convert options, and create an event of a specific type.</li>
		 *  <li><code>Syn.defaults</code> - default behavior by event type (except for keys).</li>
		 *  <li><code>Syn.key.defaults</code> - default behavior by key.</li>
		 *  <li><code>Syn.keycodes</code> - supported keys you can type.</li>
		 * </ul>
		 * <h2>Roll Your Own Functional Test Framework</h2>
		 * <p>Syn is really the foundation of JavaScriptMVC's functional testing framework - [FuncUnit].
		 *   But, we've purposely made Syn work without any dependencies in the hopes that other frameworks or 
		 *   testing solutions can use it as well.
		 * </p>
		 * @constructor 
		 * Creates a synthetic event on the element.
		 * @param {Object} type
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 * @return Syn
		 */
		Syn = function( type, options, element, callback ) {
			return (new Syn.init(type, options, element, callback));
		};

		Syn.config = opts;

	bind = function( el, ev, f ) {
		return el.addEventListener ? el.addEventListener(ev, f, false) : el.attachEvent("on" + ev, f);
	};
	unbind = function( el, ev, f ) {
		return el.addEventListener ? el.removeEventListener(ev, f, false) : el.detachEvent("on" + ev, f);
	};

	/**
	 * @Static
	 */
	extend(Syn, {
		/**
		 * Creates a new synthetic event instance
		 * @hide
		 * @param {Object} type
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 */
		init: function( type, options, element, callback ) {
			var args = Syn.args(options, element, callback),
				self = this;
			this.queue = [];
			this.element = args.element;

			//run event
			if ( typeof this[type] === "function" ) {
				this[type](args.options, args.element, function( defaults, el ) {
					args.callback && args.callback.apply(self, arguments);
					self.done.apply(self, arguments);
				});
			} else {
				this.result = Syn.trigger(type, args.options, args.element);
				args.callback && args.callback.call(this, args.element, this.result);
			}
		},
		jquery: function( el, fast ) {
			if ( window.FuncUnit && window.FuncUnit.jQuery ) {
				return window.FuncUnit.jQuery;
			}
			if ( el ) {
				return Syn.helpers.getWindow(el).jQuery || window.jQuery;
			}
			else {
				return window.jQuery;
			}
		},
		/**
		 * Returns an object with the args for a Syn.
		 * @hide
		 * @return {Object}
		 */
		args: function() {
			var res = {},
				i = 0;
			for ( ; i < arguments.length; i++ ) {
				if ( typeof arguments[i] === 'function' ) {
					res.callback = arguments[i];
				} else if ( arguments[i] && arguments[i].jquery ) {
					res.element = arguments[i][0];
				} else if ( arguments[i] && arguments[i].nodeName ) {
					res.element = arguments[i];
				} else if ( res.options && typeof arguments[i] === 'string' ) { //we can get by id
					res.element = document.getElementById(arguments[i]);
				}
				else if ( arguments[i] ) {
					res.options = arguments[i];
				}
			}
			return res;
		},
		click: function( options, element, callback ) {
			Syn('click!', options, element, callback);
		},
		/**
		 * @attribute defaults
		 * Default actions for events.  Each default function is called with this as its 
		 * element.  It should return true if a timeout 
		 * should happen after it.  If it returns an element, a timeout will happen
		 * and the next event will happen on that element.
		 */
		defaults: {
			focus: function() {
				if (!Syn.support.focusChanges ) {
					var element = this,
						nodeName = element.nodeName.toLowerCase();
					Syn.data(element, "syntheticvalue", element.value);

					//TODO, this should be textarea too
					//and this might be for only text style inputs ... hmmmmm ....
					if ( nodeName === "input" || nodeName === "textarea" ) {
						bind(element, "blur", function() {
							if ( Syn.data(element, "syntheticvalue") != element.value ) {

								Syn.trigger("change", {}, element);
							}
							unbind(element, "blur", arguments.callee);
						});

					}
				}
			},
			submit: function() {
				Syn.onParents(this, function( el ) {
					if ( el.nodeName.toLowerCase() === 'form' ) {
						el.submit();
						return false;
					}
				});
			}
		},
		changeOnBlur: function( element, prop, value ) {

			bind(element, "blur", function() {
				if ( value !== element[prop] ) {
					Syn.trigger("change", {}, element);
				}
				unbind(element, "blur", arguments.callee);
			});

		},
		/**
		 * Returns the closest element of a particular type.
		 * @hide
		 * @param {Object} el
		 * @param {Object} type
		 */
		closest: function( el, type ) {
			while ( el && el.nodeName.toLowerCase() !== type.toLowerCase() ) {
				el = el.parentNode;
			}
			return el;
		},
		/**
		 * adds jQuery like data (adds an expando) and data exists FOREVER :)
		 * @hide
		 * @param {Object} el
		 * @param {Object} key
		 * @param {Object} value
		 */
		data: function( el, key, value ) {
			var d;
			if (!el[expando] ) {
				el[expando] = id++;
			}
			if (!data[el[expando]] ) {
				data[el[expando]] = {};
			}
			d = data[el[expando]];
			if ( value ) {
				data[el[expando]][key] = value;
			} else {
				return data[el[expando]][key];
			}
		},
		/**
		 * Calls a function on the element and all parents of the element until the function returns
		 * false.
		 * @hide
		 * @param {Object} el
		 * @param {Object} func
		 */
		onParents: function( el, func ) {
			var res;
			while ( el && res !== false ) {
				res = func(el);
				el = el.parentNode;
			}
			return el;
		},
		//regex to match focusable elements
		focusable: /^(a|area|frame|iframe|label|input|select|textarea|button|html|object)$/i,
		/**
		 * Returns if an element is focusable
		 * @hide
		 * @param {Object} elem
		 */
		isFocusable: function( elem ) {
			var attributeNode;

			// IE8 Standards doesn't like this on some elements
			if(elem.getAttributeNode){
				attributeNode = elem.getAttributeNode("tabIndex")
			}

			return this.focusable.test(elem.nodeName) || 
				   (attributeNode && attributeNode.specified) && 
				    Syn.isVisible(elem);
		},
		/**
		 * Returns if an element is visible or not
		 * @hide
		 * @param {Object} elem
		 */
		isVisible: function( elem ) {
			return (elem.offsetWidth && elem.offsetHeight) || (elem.clientWidth && elem.clientHeight);
		},
		/**
		 * Gets the tabIndex as a number or null
		 * @hide
		 * @param {Object} elem
		 */
		tabIndex: function( elem ) {
			var attributeNode = elem.getAttributeNode("tabIndex");
			return attributeNode && attributeNode.specified && (parseInt(elem.getAttribute('tabIndex')) || 0);
		},
		bind: bind,
		unbind: unbind,
		browser: browser,
		//some generic helpers
		helpers: {
			createEventObject: createEventObject,
			createBasicStandardEvent: function( type, defaults, doc ) {
				var event;
				try {
					event = doc.createEvent("Events");
				} catch (e2) {
					event = doc.createEvent("UIEvents");
				} finally {
					event.initEvent(type, true, true);
					extend(event, defaults);
				}
				return event;
			},
			inArray: function( item, array ) {
				var i =0;
				for ( ; i < array.length; i++ ) {
					if ( array[i] === item ) {
						return i;
					}
				}
				return -1;
			},
			getWindow: function( element ) {
				if(element.ownerDocument){
					return element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
				}
			},
			extend: extend,
			scrollOffset: function( win , set) {
				var doc = win.document.documentElement,
					body = win.document.body;
				if(set){
					window.scrollTo(set.left, set.top);
					
				} else { 
					return {
						left: (doc && doc.scrollLeft || body && body.scrollLeft || 0) + (doc.clientLeft || 0),
						top: (doc && doc.scrollTop || body && body.scrollTop || 0) + (doc.clientTop || 0)
					};
				}
				
			},
			scrollDimensions: function(win){
				var doc = win.document.documentElement,
					body = win.document.body,
					docWidth = doc.clientWidth,
					docHeight = doc.clientHeight,
					compat = win.document.compatMode === "CSS1Compat";
				
				return {
					height: compat && docHeight ||
						body.clientHeight || docHeight,
					width: compat && docWidth ||
						body.clientWidth || docWidth
				};
			},
			addOffset: function( options, el ) {
				var jq = Syn.jquery(el),
					off;
				if ( typeof options === 'object' && options.clientX === undefined && options.clientY === undefined && options.pageX === undefined && options.pageY === undefined && jq ) {
					el = jq(el);
					off = el.offset();
					options.pageX = off.left + el.width() / 2;
					options.pageY = off.top + el.height() / 2;
				}
			}
		},
		// place for key data
		key: {
			ctrlKey: null,
			altKey: null,
			shiftKey: null,
			metaKey: null
		},
		//triggers an event on an element, returns true if default events should be run
		/**
		 * Dispatches an event and returns true if default events should be run.
		 * @hide
		 * @param {Object} event
		 * @param {Object} element
		 * @param {Object} type
		 * @param {Object} autoPrevent
		 */
		dispatch: function( event, element, type, autoPrevent ) {

			// dispatchEvent doesn't always work in IE (mostly in a popup)
			if ( element.dispatchEvent && event ) {
				var preventDefault = event.preventDefault,
					prevents = autoPrevent ? -1 : 0;

				//automatically prevents the default behavior for this event
				//this is to protect agianst nasty browser freezing bug in safari
				if ( autoPrevent ) {
					bind(element, type, function( ev ) {
						ev.preventDefault();
						unbind(this, type, arguments.callee);
					});
				}


				event.preventDefault = function() {
					prevents++;
					if (++prevents > 0 ) {
						preventDefault.apply(this, []);
					}
				};
				element.dispatchEvent(event);
				return prevents <= 0;
			} else {
				try {
					window.event = event;
				} catch (e) {}
				//source element makes sure element is still in the document
				return element.sourceIndex <= 0 || (element.fireEvent && element.fireEvent('on' + type, event));
			}
		},
		/**
		 * @attribute
		 * @hide
		 * An object of eventType -> function that create that event.
		 */
		create: {
			//-------- PAGE EVENTS ---------------------
			page: {
				event: function( type, options, element ) {
					var doc = Syn.helpers.getWindow(element).document || document,
						event;
					if ( doc.createEvent ) {
						event = doc.createEvent("Events");

						event.initEvent(type, true, true);
						return event;
					}
					else {
						try {
							event = createEventObject(type, options, element);
						}
						catch (e) {}
						return event;
					}
				}
			},
			// unique events
			focus: {
				event: function( type, options, element ) {
					Syn.onParents(element, function( el ) {
						if ( Syn.isFocusable(el) ) {
							if ( el.nodeName.toLowerCase() !== 'html' ) {
								el.focus();
								activeElement = el;
							}
							else if ( activeElement ) {
								// TODO: The HTML element isn't focasable in IE, but it is
								// in FF.  We should detect this and do a true focus instead
								// of just a blur
								var doc = Syn.helpers.getWindow(element).document;
								if ( doc !== window.document ) {
									return false;
								} else if ( doc.activeElement ) {
									doc.activeElement.blur();
									activeElement = null;
								} else {
									activeElement.blur();
									activeElement = null;
								}


							}
							return false;
						}
					});
					return true;
				}
			}
		},
		/**
		 * @attribute support
		 * 
		 * Feature detected properties of a browser's event system.
		 * Support has the following properties:
		 * 
		 *   - `backspaceWorks` - typing a backspace removes a character
		 *   - `clickChanges` - clicking on an option element creates a change event.
		 *   - `clickSubmits` - clicking on a form button submits the form.
		 *   - `focusChanges` - focus/blur creates a change event.
		 *   - `keypressOnAnchorClicks` - Keying enter on an anchor triggers a click.
		 *   - `keypressSubmits` - enter key submits
		 *   - `keyCharacters` - typing a character shows up
		 *   - `keysOnNotFocused` - enters keys when not focused.
		 *   - `linkHrefJS` - An achor's href JavaScript is run.
		 *   - `mouseDownUpClicks` - A mousedown followed by mouseup creates a click event.
		 *   - `mouseupSubmits` - a mouseup on a form button submits the form.
		 *   - `radioClickChanges` - clicking a radio button changes the radio.
		 *   - `tabKeyTabs` - A tab key changes tabs.
		 *   - `textareaCarriage` - a new line in a textarea creates a carriage return.
		 *   
		 * 
		 */
		support: {
			clickChanges: false,
			clickSubmits: false,
			keypressSubmits: false,
			mouseupSubmits: false,
			radioClickChanges: false,
			focusChanges: false,
			linkHrefJS: false,
			keyCharacters: false,
			backspaceWorks: false,
			mouseDownUpClicks: false,
			tabKeyTabs: false,
			keypressOnAnchorClicks: false,
			optionClickBubbles: false,
			ready: 0
		},
		/**
		 * Creates a synthetic event and dispatches it on the element.  
		 * This will run any default actions for the element.
		 * Typically you want to use Syn, but if you want the return value, use this.
		 * @param {String} type
		 * @param {Object} options
		 * @param {HTMLElement} element
		 * @return {Boolean} true if default events were run, false if otherwise.
		 */
		trigger: function( type, options, element ) {
			options || (options = {});

			var create = Syn.create,
				setup = create[type] && create[type].setup,
				kind = key.test(type) ? 'key' : (page.test(type) ? "page" : "mouse"),
				createType = create[type] || {},
				createKind = create[kind],
				event, ret, autoPrevent, dispatchEl = element;

			//any setup code?
			Syn.support.ready === 2 && setup && setup(type, options, element);

			autoPrevent = options._autoPrevent;
			//get kind
			delete options._autoPrevent;

			if ( createType.event ) {
				ret = createType.event(type, options, element);
			} else {
				//convert options
				options = createKind.options ? createKind.options(type, options, element) : options;

				if (!Syn.support.changeBubbles && /option/i.test(element.nodeName) ) {
					dispatchEl = element.parentNode; //jQuery expects clicks on select
				}

				//create the event
				event = createKind.event(type, options, dispatchEl);

				//send the event
				ret = Syn.dispatch(event, dispatchEl, type, autoPrevent);
			}
			
			ret && Syn.support.ready === 2 && Syn.defaults[type] && Syn.defaults[type].call(element, options, autoPrevent);
			return ret;
		},
		eventSupported: function( eventName ) {
			var el = document.createElement("div");
			eventName = "on" + eventName;

			var isSupported = (eventName in el);
			if (!isSupported ) {
				el.setAttribute(eventName, "return;");
				isSupported = typeof el[eventName] === "function";
			}
			el = null;

			return isSupported;
		}

	});
	/**
	 * @Prototype
	 */
	extend(Syn.init.prototype, {
		/**
		 * @function then
		 * <p>
		 * Then is used to chain a sequence of actions to be run one after the other.
		 * This is useful when many asynchronous actions need to be performed before some
		 * final check needs to be made.
		 * </p>
		 * <p>The following clicks and types into the <code>id='age'</code> element and then checks that only numeric characters can be entered.</p>
		 * <h3>Example</h3>
		 * @codestart
		 * Syn('click',{},'age')
		 *   .then('type','I am 12',function(){
		 *   equals($('#age').val(),"12")  
		 * })
		 * @codeend
		 * If the element argument is undefined, then the last element is used.
		 * 
		 * @param {String} type The type of event or action to create: "_click", "_dblclick", "_drag", "_type".
		 * @param {Object} options Optiosn to pass to the event.
		 * @param {String|HTMLElement} [element] A element's id or an element.  If undefined, defaults to the previous element.
		 * @param {Function} [callback] A function to callback after the action has run, but before any future chained actions are run.
		 */
		then: function( type, options, element, callback ) {
			if ( Syn.autoDelay ) {
				this.delay();
			}
			var args = Syn.args(options, element, callback),
				self = this;


			//if stack is empty run right away
			//otherwise ... unshift it
			this.queue.unshift(function( el, prevented ) {

				if ( typeof this[type] === "function" ) {
					this.element = args.element || el;
					this[type](args.options, this.element, function( defaults, el ) {
						args.callback && args.callback.apply(self, arguments);
						self.done.apply(self, arguments);
					});
				} else {
					this.result = Syn.trigger(type, args.options, args.element);
					args.callback && args.callback.call(this, args.element, this.result);
					return this;
				}
			})
			return this;
		},
		/**
		 * Delays the next command a set timeout.
		 * @param {Number} [timeout]
		 * @param {Function} [callback]
		 */
		delay: function( timeout, callback ) {
			if ( typeof timeout === 'function' ) {
				callback = timeout;
				timeout = null;
			}
			timeout = timeout || 600;
			var self = this;
			this.queue.unshift(function() {
				setTimeout(function() {
					callback && callback.apply(self, [])
					self.done.apply(self, arguments);
				}, timeout);
			});
			return this;
		},
		done: function( defaults, el ) {
			el && (this.element = el);
			if ( this.queue.length ) {
				this.queue.pop().call(this, this.element, defaults);
			}

		},
		/**
		 * @function click
		 * Clicks an element by triggering a mousedown, 
		 * mouseup, 
		 * and a click event.
		 * <h3>Example</h3>
		 * @codestart
		 * Syn.click({},'create',function(){
		 *   //check something
		 * })
		 * @codeend
		 * You can also provide the coordinates of the click.  
		 * If jQuery is present, it will set clientX and clientY
		 * for you.  Here's how to set it yourself:
		 * @codestart
		 * Syn.click(
		 *     {clientX: 20, clientY: 100},
		 *     'create',
		 *     function(){
		 *       //check something
		 *     })
		 * @codeend
		 * You can also provide pageX and pageY and Syn will convert it for you.
		 * @param {Object} options
		 * @param {HTMLElement} element
		 * @param {Function} callback
		 */
		"_click": function( options, element, callback, force ) {
			Syn.helpers.addOffset(options, element);
			Syn.trigger("mousedown", options, element);

			//timeout is b/c IE is stupid and won't call focus handlers
			setTimeout(function() {
				Syn.trigger("mouseup", options, element);
				if (!Syn.support.mouseDownUpClicks || force ) {
					Syn.trigger("click", options, element);
					callback(true);
				} else {
					//we still have to run the default (presumably)
					Syn.create.click.setup('click', options, element);
					Syn.defaults.click.call(element);
					//must give time for callback
					setTimeout(function() {
						callback(true);
					}, 1);
				}

			}, 1);
		},
		/**
		 * Right clicks in browsers that support it (everyone but opera).
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 */
		"_rightClick": function( options, element, callback ) {
			Syn.helpers.addOffset(options, element);
			var mouseopts = extend(extend({}, Syn.mouse.browser.right.mouseup), options);

			Syn.trigger("mousedown", mouseopts, element);

			//timeout is b/c IE is stupid and won't call focus handlers
			setTimeout(function() {
				Syn.trigger("mouseup", mouseopts, element);
				if ( Syn.mouse.browser.right.contextmenu ) {
					Syn.trigger("contextmenu", extend(extend({}, Syn.mouse.browser.right.contextmenu), options), element);
				}
				callback(true);
			}, 1);
		},
		/**
		 * @function dblclick
		 * Dblclicks an element.  This runs two [Syn.prototype.click click] events followed by
		 * a dblclick on the element.
		 * <h3>Example</h3>
		 * @codestart
		 * Syn.dblclick({},'open')
		 * @codeend
		 * @param {Object} options
		 * @param {HTMLElement} element
		 * @param {Function} callback
		 */
		"_dblclick": function( options, element, callback ) {
			Syn.helpers.addOffset(options, element);
			var self = this;
			this._click(options, element, function() {
				setTimeout(function() {
					self._click(options, element, function() {
						Syn.trigger("dblclick", options, element);
						callback(true);
					}, true);
				}, 2);

			});
		}
	});

	var actions = ["click", "dblclick", "move", "drag", "key", "type", 'rightClick'],
		makeAction = function( name ) {
			Syn[name] = function( options, element, callback ) {
				return Syn("_" + name, options, element, callback);
			};
			Syn.init.prototype[name] = function( options, element, callback ) {
				return this.then("_" + name, options, element, callback);
			};
		},
		i = 0;

	for ( ; i < actions.length; i++ ) {
		makeAction(actions[i]);
	}

	

	return Syn;
})();

// ## lib/syn/src/mouse.js
var __m4 = (function(Syn) {
//handles mosue events

	var h = Syn.helpers,
		getWin = h.getWindow;

	Syn.mouse = {};
	h.extend(Syn.defaults, {
		mousedown: function( options ) {
			Syn.trigger("focus", {}, this)
		},
		click: function() {
			// prevents the access denied issue in IE if the click causes the element to be destroyed
			var element = this, href, type, radioChanged, nodeName, scope;
			try {
				href = element.href;
				type = element.type;
				createChange = Syn.data(element, "createChange");
				radioChanged = Syn.data(element, "radioChanged");
				scope = getWin(element);
				nodeName = element.nodeName.toLowerCase();
			} catch (e) {
				return;
			}
			//get old values
			
			//this code was for restoring the href attribute to prevent popup opening
			//if ((href = Syn.data(element, "href"))) {
			//	element.setAttribute('href', href)
			//}

			//run href javascript
			if (!Syn.support.linkHrefJS && /^\s*javascript:/.test(href) ) {
				//eval js
				var code = href.replace(/^\s*javascript:/, "")

				//try{
				if ( code != "//" && code.indexOf("void(0)") == -1 ) {
					if ( window.selenium ) {
						eval("with(selenium.browserbot.getCurrentWindow()){" + code + "}")
					} else {
						eval("with(scope){" + code + "}")
					}
				}
			}

			//submit a form
			if (!(Syn.support.clickSubmits) && (nodeName == "input" && type == "submit") || nodeName == 'button' ) {

				var form = Syn.closest(element, "form");
				if ( form ) {
					Syn.trigger("submit", {}, form)
				}

			}
			//follow a link, probably needs to check if in an a.
			if ( nodeName == "a" && element.href && !/^\s*javascript:/.test(href) ) {
				scope.location.href = href;

			}

			//change a checkbox
			if ( nodeName == "input" && type == "checkbox" ) {

				//if(!Syn.support.clickChecks && !Syn.support.changeChecks){
				//	element.checked = !element.checked;
				//}
				if (!Syn.support.clickChanges ) {
					Syn.trigger("change", {}, element);
				}
			}

			//change a radio button
			if ( nodeName == "input" && type == "radio" ) { // need to uncheck others if not checked
				if ( radioChanged && !Syn.support.radioClickChanges ) {
					Syn.trigger("change", {}, element);
				}
			}
			// change options
			if ( nodeName == "option" && createChange ) {
				Syn.trigger("change", {}, element.parentNode); //does not bubble
				Syn.data(element, "createChange", false)
			}
		}
	})

	//add create and setup behavior for mosue events
	h.extend(Syn.create, {
		mouse: {
			options: function( type, options, element ) {
				var doc = document.documentElement,
					body = document.body,
					center = [options.pageX || 0, options.pageY || 0],
					//browser might not be loaded yet (doing support code)
					left = Syn.mouse.browser && Syn.mouse.browser.left[type],
					right = Syn.mouse.browser && Syn.mouse.browser.right[type];
				return h.extend({
					bubbles: true,
					cancelable: true,
					view: window,
					detail: 1,
					screenX: 1,
					screenY: 1,
					clientX: options.clientX || center[0] - (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0),
					clientY: options.clientY || center[1] - (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0),
					ctrlKey: !! Syn.key.ctrlKey,
					altKey: !! Syn.key.altKey,
					shiftKey: !! Syn.key.shiftKey,
					metaKey: !! Syn.key.metaKey,
					button: left && left.button != null ? left.button : right && right.button || (type == 'contextmenu' ? 2 : 0),
					relatedTarget: document.documentElement
				}, options);
			},
			event: function( type, defaults, element ) { //Everyone Else
				var doc = getWin(element).document || document
				if ( doc.createEvent ) {
					var event;

					try {
						event = doc.createEvent('MouseEvents');
						event.initMouseEvent(type, defaults.bubbles, defaults.cancelable, defaults.view, defaults.detail, defaults.screenX, defaults.screenY, defaults.clientX, defaults.clientY, defaults.ctrlKey, defaults.altKey, defaults.shiftKey, defaults.metaKey, defaults.button, defaults.relatedTarget);
					} catch (e) {
						event = h.createBasicStandardEvent(type, defaults, doc)
					}
					event.synthetic = true;
					return event;
				} else {
					var event;
					try {
						event = h.createEventObject(type, defaults, element)
					}
					catch (e) {}

					return event;
				}

			}
		},
		click: {
			setup: function( type, options, element ) {
				var nodeName = element.nodeName.toLowerCase(),
					type;

				//we need to manually 'check' in browser that can't check
				//so checked has the right value
				if (!Syn.support.clickChecks && !Syn.support.changeChecks && nodeName === "input" ) {
					type = element.type.toLowerCase(); //pretty sure lowercase isn't needed
					if ( type === 'checkbox' ) {
						element.checked = !element.checked;
					}
					if ( type === "radio" ) {
						//do the checks manually 
						if (!element.checked ) { //do nothing, no change
							try {
								Syn.data(element, "radioChanged", true);
							} catch (e) {}
							element.checked = true;
						}
					}
				}

				if ( nodeName == "a" && element.href && !/^\s*javascript:/.test(element.href) ) {

					//save href
					Syn.data(element, "href", element.href)

					//remove b/c safari/opera will open a new tab instead of changing the page
					// this has been removed because newer versions don't have this problem
					//element.setAttribute('href', 'javascript://')
					//however this breaks scripts using the href
					//we need to listen to this and prevent the default behavior
					//and run the default behavior ourselves. Boo!
				}
				//if select or option, save old value and mark to change
				if (/option/i.test(element.nodeName) ) {
					var child = element.parentNode.firstChild,
						i = -1;
					while ( child ) {
						if ( child.nodeType == 1 ) {
							i++;
							if ( child == element ) break;
						}
						child = child.nextSibling;
					}
					if ( i !== element.parentNode.selectedIndex ) {
						//shouldn't this wait on triggering
						//change?
						element.parentNode.selectedIndex = i;
						Syn.data(element, "createChange", true)
					}
				}

			}
		},
		mousedown: {
			setup: function( type, options, element ) {
				var nn = element.nodeName.toLowerCase();
				//we have to auto prevent default to prevent freezing error in safari
				if ( Syn.browser.safari && (nn == "select" || nn == "option") ) {
					options._autoPrevent = true;
				}
			}
		}
	});
	//do support code
	(function() {
		if (!document.body ) {
			setTimeout(arguments.callee, 1)
			return;
		}
		var oldSynth = window.__synthTest;
		window.__synthTest = function() {
			Syn.support.linkHrefJS = true;
		}

		var div = document.createElement("div"),
			checkbox, submit, form, input, select;

		div.innerHTML = "<form id='outer'>" + "<input name='checkbox' type='checkbox'/>" + "<input name='radio' type='radio' />" + "<input type='submit' name='submitter'/>" + "<input type='input' name='inputter'/>" + "<input name='one'>" + "<input name='two'/>" + "<a href='javascript:__synthTest()' id='synlink'></a>" + "<select><option></option></select>" + "</form>";
		document.documentElement.appendChild(div);
		form = div.firstChild
		checkbox = form.childNodes[0];
		submit = form.childNodes[2];
		select = form.getElementsByTagName('select')[0]

		//trigger click for linkHrefJS support, childNodes[6] === anchor
		Syn.trigger('click', {}, form.childNodes[6]);

		checkbox.checked = false;
		checkbox.onchange = function() {
			Syn.support.clickChanges = true;
		}

		Syn.trigger("click", {}, checkbox)
		Syn.support.clickChecks = checkbox.checked;

		checkbox.checked = false;

		Syn.trigger("change", {}, checkbox);

		Syn.support.changeChecks = checkbox.checked;

		form.onsubmit = function( ev ) {
			if ( ev.preventDefault ) ev.preventDefault();
			Syn.support.clickSubmits = true;
			return false;
		}
		Syn.trigger("click", {}, submit)



		form.childNodes[1].onchange = function() {
			Syn.support.radioClickChanges = true;
		}
		Syn.trigger("click", {}, form.childNodes[1])


		Syn.bind(div, 'click', function() {
			Syn.support.optionClickBubbles = true;
			Syn.unbind(div, 'click', arguments.callee)
		})
		Syn.trigger("click", {}, select.firstChild)


		Syn.support.changeBubbles = Syn.eventSupported('change');

		//test if mousedown followed by mouseup causes click (opera), make sure there are no clicks after this
		var clicksCount = 0
		div.onclick = function() {
			Syn.support.mouseDownUpClicks = true;
			//we should use this to check for opera potentially, but would
			//be difficult to remove element correctly
			//Syn.support.mouseDownUpRepeatClicks = (2 == (++clicksCount))
		}
		Syn.trigger("mousedown", {}, div)
		Syn.trigger("mouseup", {}, div)

		//setTimeout(function(){
		//	Syn.trigger("mousedown",{},div)
		//	Syn.trigger("mouseup",{},div)
		//},1)

		document.documentElement.removeChild(div);

		//check stuff
		window.__synthTest = oldSynth;
		Syn.support.ready++;
	})();
	return Syn;
})(__m3);

// ## lib/syn/src/browsers.js
var __m5 = (function(Syn) {
	Syn.key.browsers = {
		webkit : {
			'prevent':
			 {"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
			'character':
			 {"keydown":[0,"key"],"keypress":["char","char"],"keyup":[0,"key"]},
			'specialChars':
			 {"keydown":[0,"char"],"keyup":[0,"char"]},
			'navigation':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'special':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'tab':
			 {"keydown":[0,"char"],"keyup":[0,"char"]},
			'pause-break':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'caps':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'escape':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'num-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'scroll-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'print':
			 {"keyup":[0,"key"]},
			'function':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\r':
			 {"keydown":[0,"key"],"keypress":["char","key"],"keyup":[0,"key"]}
		},
		gecko : {
			'prevent':
			 {"keyup":[],"keydown":["char"],"keypress":["char"]},
			'character':
			 {"keydown":[0,"key"],"keypress":["char",0],"keyup":[0,"key"]},
			'specialChars':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'navigation':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'special':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\t':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'pause-break':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'caps':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'escape':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'num-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'scroll-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'print':
			 {"keyup":[0,"key"]},
			'function':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\r':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]}
		},
		msie : {
			'prevent':{"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
			'character':{"keydown":[null,"key"],"keypress":[null,"char"],"keyup":[null,"key"]},
			'specialChars':{"keydown":[null,"char"],"keyup":[null,"char"]},
			'navigation':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'special':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'tab':{"keydown":[null,"char"],"keyup":[null,"char"]},
			'pause-break':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'caps':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'escape':{"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'num-lock':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'scroll-lock':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'print':{"keyup":[null,"key"]},
			'function':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'\r':{"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]}	
		},
		opera : {
			'prevent':
			 {"keyup":[],"keydown":[],"keypress":["char"]},
			'character':
			 {"keydown":[null,"key"],"keypress":[null,"char"],"keyup":[null,"key"]},
			'specialChars':
			 {"keydown":[null,"char"],"keypress":[null,"char"],"keyup":[null,"char"]},
			'navigation':
			 {"keydown":[null,"key"],"keypress":[null,"key"]},
			'special':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'tab':
			 {"keydown":[null,"char"],"keypress":[null,"char"],"keyup":[null,"char"]},
			'pause-break':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'caps':
			 {"keydown":[null,"key"],"keyup":[null,"key"]},
			'escape':
			 {"keydown":[null,"key"],"keypress":[null,"key"]},
			'num-lock':
			 {"keyup":[null,"key"],"keydown":[null,"key"],"keypress":[null,"key"]},
			'scroll-lock':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'print':
			 {},
			'function':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'\r':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]}	
		}
	};
	
	Syn.mouse.browsers = {
		webkit : {"right":{"mousedown":{"button":2,"which":3},"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}},
		          "left":{"mousedown":{"button":0,"which":1},"mouseup":{"button":0,"which":1},"click":{"button":0,"which":1}}},
		opera: {"right":{"mousedown":{"button":2,"which":3},"mouseup":{"button":2,"which":3}},
		        "left":{"mousedown":{"button":0,"which":1},"mouseup":{"button":0,"which":1},"click":{"button":0,"which":1}}},
		msie: {	"right":{"mousedown":{"button":2},"mouseup":{"button":2},"contextmenu":{"button":0}},
				"left":{"mousedown":{"button":1},"mouseup":{"button":1},"click":{"button":0}}},
		chrome : {"right":{"mousedown":{"button":2,"which":3},"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}},
				  "left":{"mousedown":{"button":0,"which":1},"mouseup":{"button":0,"which":1},"click":{"button":0,"which":1}}},
		gecko: {"left":{"mousedown":{"button":0,"which":1},"mouseup":{"button":0,"which":1},"click":{"button":0,"which":1}},
		        "right":{"mousedown":{"button":2,"which":3},"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}}}
	}
	
	//set browser
	Syn.key.browser = 
	(function(){
		if(Syn.key.browsers[window.navigator.userAgent]){
			return Syn.key.browsers[window.navigator.userAgent];
		}
		for(var browser in Syn.browser){
			if(Syn.browser[browser] && Syn.key.browsers[browser]){
				return Syn.key.browsers[browser]
			}
		}
		return Syn.key.browsers.gecko;
	})();
	
	Syn.mouse.browser = 
	(function(){
		if(Syn.mouse.browsers[window.navigator.userAgent]){
			return Syn.mouse.browsers[window.navigator.userAgent];
		}
		for(var browser in Syn.browser){
			if(Syn.browser[browser] && Syn.mouse.browsers[browser]){
				return Syn.mouse.browsers[browser]
			}
		}
		return Syn.mouse.browsers.gecko;
	})();
	return Syn;
})(__m3, __m4);

// ## lib/syn/src/typeable.js
var __m7 = (function(Syn){
	// Holds functions that test for typeability
	var typeables = [];

	/*
	 * @function typeable
	 * Registers a function that is used to determine if an
	 * element can be typed into. The user can define as many
	 * test functions as needed. By default there are 2 typeable
	 * functions, one for inputs and textareas, and another
	 * for contenteditable elements.
	 *
	 * @param {Function} fn Function to register.
	 */
	Syn.typeable = function(fn){
		if(typeables.indexOf(fn) == -1) {
			typeables.push(fn);
		}
	};

	/*
	 * @function test
	 * Tests whether an element can be typed into using the test
	 * functions registered by [Syn.typeable typeable]. If any of the
	 * test functions returns true, `test` will return true and allow
	 * the element to be typed into.
	 *
	 * @param {HTMLElement} el the element to test.
	 * @return {Boolean} true if the element can be typed into.
	 */
	Syn.typeable.test = function(el){
		for(var i = 0, len = typeables.length; i < len; i++) {
			if(typeables[i](el)) {
				return true;
			}
		}
		return false;
	};

	var type = Syn.typeable;

	// Inputs and textareas
	var typeableExp = /input|textarea/i;
	type(function(el){
		return typeableExp.test(el.nodeName);
	});

	// Content editable
	type(function(el){
		return ["", "true"].indexOf(el.getAttribute("contenteditable")) != -1;
	});

	return Syn;
})(__m3);

// ## lib/syn/src/key.js
var __m6 = (function(Syn) {
	var h = Syn.helpers,

		// gets the selection of an input or textarea
		getSelection = function( el ) {
			// use selectionStart if we can
			if ( el.selectionStart !== undefined ) {
				// this is for opera, so we don't have to focus to type how we think we would
				if ( document.activeElement && document.activeElement != el && el.selectionStart == el.selectionEnd && el.selectionStart == 0 ) {
					return {
						start: el.value.length,
						end: el.value.length
					};
				}
				return {
					start: el.selectionStart,
					end: el.selectionEnd
				}
			} else {
				//check if we aren't focused
				try {
					//try 2 different methods that work differently (IE breaks depending on type)
					if ( el.nodeName.toLowerCase() == 'input' ) {
						var real = h.getWindow(el).document.selection.createRange(),
							r = el.createTextRange();
						r.setEndPoint("EndToStart", real);

						var start = r.text.length
						return {
							start: start,
							end: start + real.text.length
						}
					}
					else {
						var real = h.getWindow(el).document.selection.createRange(),
							r = real.duplicate(),
							r2 = real.duplicate(),
							r3 = real.duplicate();
						r2.collapse();
						r3.collapse(false);
						r2.moveStart('character', -1)
						r3.moveStart('character', -1)
						//select all of our element
						r.moveToElementText(el)
						//now move our endpoint to the end of our real range
						r.setEndPoint('EndToEnd', real);
						var start = r.text.length - real.text.length,
							end = r.text.length;
						if ( start != 0 && r2.text == "" ) {
							start += 2;
						}
						if ( end != 0 && r3.text == "" ) {
							end += 2;
						}
						//if we aren't at the start, but previous is empty, we are at start of newline
						return {
							start: start,
							end: end
						}
					}
				} catch (e) {
					var prop = formElExp.test(el.nodeName) ? "value" : "textContent";

					return {
						start: el[prop].length,
						end: el[prop].length
					};
				}
			}
		},
		// gets all focusable elements
		getFocusable = function( el ) {
			var document = h.getWindow(el).document,
				res = [];

			var els = document.getElementsByTagName('*'),
				len = els.length;

			for ( var i = 0; i < len; i++ ) {
				Syn.isFocusable(els[i]) && els[i] != document.documentElement && res.push(els[i])
			}
			return res;
		},
		formElExp = /input|textarea/i,
		// Get the text from an element.
		getText = function(el){
			if(formElExp.test(el.nodeName)) {
				return el.value;
			}
			return el.textContent || el.innerText;
		},
		// Set the text of an element.
		setText = function(el, value){
			if(formElExp.test(el.nodeName)){
				el.value = value;
			} else if(el.textContent) {
				el.textContent = value;
			} else {
				el.innerText = value;
			}
		};
    
	/**
	 * @add Syn static
	 */
	h.extend(Syn, {
		/**
		 * @attribute
		 * A list of the keys and their keycodes codes you can type.
		 * You can add type keys with
		 * @codestart
		 * Syn('key','delete','title');
		 * 
		 * //or 
		 * 
		 * Syn('type','One Two Three[left][left][delete]','title')
		 * @codeend
		 * 
		 * The following are a list of keys you can type:
		 * @codestart text
		 * \b        - backspace
		 * \t        - tab
		 * \r        - enter
		 * ' '       - space
		 * a-Z 0-9   - normal characters
		 * /!@#$*,.? - All other typeable characters
		 * page-up   - scrolls up
		 * page-down - scrolls down
		 * end       - scrolls to bottom
		 * home      - scrolls to top
		 * insert    - changes how keys are entered
		 * delete    - deletes the next character
		 * left      - moves cursor left
		 * right     - moves cursor right
		 * up        - moves the cursor up
		 * down      - moves the cursor down
		 * f1-12     - function buttons
		 * shift, ctrl, alt - special keys
		 * pause-break      - the pause button
		 * scroll-lock      - locks scrolling
		 * caps      - makes caps
		 * escape    - escape button
		 * num-lock  - allows numbers on keypad
		 * print     - screen capture
		 * subtract  - subtract (keypad) -
		 * dash      - dash -
		 * divide    - divide (keypad) /
		 * forward-slash - forward slash /
		 * decimal   - decimal (keypad) .
		 * period    - period .
		 * @codeend
		 */
		keycodes: {
			//backspace
			'\b': 8,

			//tab
			'\t': 9,

			//enter
			'\r': 13,

			//special
			'shift': 16,
			'ctrl': 17,
			'alt': 18,

			//weird
			'pause-break': 19,
			'caps': 20,
			'escape': 27,
			'num-lock': 144,
			'scroll-lock': 145,
			'print': 44,

			//navigation
			'page-up': 33,
			'page-down': 34,
			'end': 35,
			'home': 36,
			'left': 37,
			'up': 38,
			'right': 39,
			'down': 40,
			'insert': 45,
			'delete': 46,

			//normal characters
			' ': 32,
			'0': 48,
			'1': 49,
			'2': 50,
			'3': 51,
			'4': 52,
			'5': 53,
			'6': 54,
			'7': 55,
			'8': 56,
			'9': 57,
			'a': 65,
			'b': 66,
			'c': 67,
			'd': 68,
			'e': 69,
			'f': 70,
			'g': 71,
			'h': 72,
			'i': 73,
			'j': 74,
			'k': 75,
			'l': 76,
			'm': 77,
			'n': 78,
			'o': 79,
			'p': 80,
			'q': 81,
			'r': 82,
			's': 83,
			't': 84,
			'u': 85,
			'v': 86,
			'w': 87,
			'x': 88,
			'y': 89,
			'z': 90,
			//normal-characters, numpad
			'num0': 96,
			'num1': 97,
			'num2': 98,
			'num3': 99,
			'num4': 100,
			'num5': 101,
			'num6': 102,
			'num7': 103,
			'num8': 104,
			'num9': 105,
			'*': 106,
			'+': 107,
			'subtract': 109,
			'decimal': 110,
			//normal-characters, others
			'divide': 111,
			';': 186,
			'=': 187,
			',': 188,
			'dash': 189,
			'-': 189,
			'period': 190,
			'.': 190,
			'forward-slash': 191,
			'/': 191,
			'`': 192,
			'[': 219,
			'\\': 220,
			']': 221,
			"'": 222,

			//ignore these, you shouldn't use them
			'left window key': 91,
			'right window key': 92,
			'select key': 93,


			'f1': 112,
			'f2': 113,
			'f3': 114,
			'f4': 115,
			'f5': 116,
			'f6': 117,
			'f7': 118,
			'f8': 119,
			'f9': 120,
			'f10': 121,
			'f11': 122,
			'f12': 123
		},

		// selects text on an element
		selectText: function( el, start, end ) {
			if ( el.setSelectionRange ) {
				if (!end ) {
					el.focus();
					el.setSelectionRange(start, start);
				} else {
					el.selectionStart = start;
					el.selectionEnd = end;
				}
			} else if ( el.createTextRange ) {
				//el.focus();
				var r = el.createTextRange();
				r.moveStart('character', start);
				end = end || start;
				r.moveEnd('character', end - el.value.length);

				r.select();
			}
		},
		getText: function( el ) {
			//first check if the el has anything selected ..
			if ( Syn.typeable.test(el) ) {
				var sel = getSelection(el);
				return el.value.substring(sel.start, sel.end)
			}
			//otherwise get from page
			var win = Syn.helpers.getWindow(el);
			if ( win.getSelection ) {
				return win.getSelection().toString();
			}
			else if ( win.document.getSelection ) {
				return win.document.getSelection().toString()
			}
			else {
				return win.document.selection.createRange().text;
			}
		},
		getSelection: getSelection
	});

	h.extend(Syn.key, {
		// retrieves a description of what events for this character should look like
		data: function( key ) {
			//check if it is described directly
			if ( Syn.key.browser[key] ) {
				return Syn.key.browser[key];
			}
			for ( var kind in Syn.key.kinds ) {
				if ( h.inArray(key, Syn.key.kinds[kind]) > -1 ) {
					return Syn.key.browser[kind]
				}
			}
			return Syn.key.browser.character
		},

		//returns the special key if special
		isSpecial: function( keyCode ) {
			var specials = Syn.key.kinds.special;
			for ( var i = 0; i < specials.length; i++ ) {
				if ( Syn.keycodes[specials[i]] == keyCode ) {
					return specials[i];
				}
			}
		},
		/**
		 * @hide
		 * gets the options for a key and event type ...
		 * @param {Object} key
		 * @param {Object} event
		 */
		options: function( key, event ) {
			var keyData = Syn.key.data(key);

			if (!keyData[event] ) {
				//we shouldn't be creating this event
				return null;
			}

			var charCode = keyData[event][0],
				keyCode = keyData[event][1],
				result = {};

			if ( keyCode == 'key' ) {
				result.keyCode = Syn.keycodes[key]
			} else if ( keyCode == 'char' ) {
				result.keyCode = key.charCodeAt(0)
			} else {
				result.keyCode = keyCode;
			}

			if ( charCode == 'char' ) {
				result.charCode = key.charCodeAt(0)
			} else if ( charCode !== null ) {
				result.charCode = charCode;
			}

			// all current browsers have which property to normalize keyCode/charCode
			if(result.keyCode){
				result.which = result.keyCode;
			} else {
				result.which = result.charCode;
			}


			return result
		},
		//types of event keys
		kinds: {
			special: ["shift", 'ctrl', 'alt', 'caps'],
			specialChars: ["\b"],
			navigation: ["page-up", 'page-down', 'end', 'home', 'left', 'up', 'right', 'down', 'insert', 'delete'],
			'function': ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12']
		},
		//returns the default function
		// some keys have default functions
		// some 'kinds' of keys have default functions
		getDefault: function( key ) {
			//check if it is described directly
			if ( Syn.key.defaults[key] ) {
				return Syn.key.defaults[key];
			}
			for ( var kind in Syn.key.kinds ) {
				if ( h.inArray(key, Syn.key.kinds[kind]) > -1 && Syn.key.defaults[kind] ) {
					return Syn.key.defaults[kind];
				}
			}
			return Syn.key.defaults.character
		},
		// default behavior when typing
		defaults: {
			'character': function( options, scope, key, force, sel ) {
				if (/num\d+/.test(key) ) {
					key = key.match(/\d+/)[0]
				}

				if ( force || (!Syn.support.keyCharacters && Syn.typeable.test(this)) ) {
					var current = getText(this),
						before = current.substr(0, sel.start),
						after = current.substr(sel.end),
						character = key;

					setText(this, before + character + after);
					//handle IE inserting \r\n
					var charLength = character == "\n" && Syn.support.textareaCarriage ? 2 : character.length;
					Syn.selectText(this, before.length + charLength)
				}
			},
			'c': function( options, scope, key, force, sel ) {
				if ( Syn.key.ctrlKey ) {
					Syn.key.clipboard = Syn.getText(this)
				} else {
					Syn.key.defaults.character.apply(this, arguments);
				}
			},
			'v': function( options, scope, key, force, sel ) {
				if ( Syn.key.ctrlKey ) {
					Syn.key.defaults.character.call(this, options, scope, Syn.key.clipboard, true, sel);
				} else {
					Syn.key.defaults.character.apply(this, arguments);
				}
			},
			'a': function( options, scope, key, force, sel ) {
				if ( Syn.key.ctrlKey ) {
					Syn.selectText(this, 0, getText(this).length)
				} else {
					Syn.key.defaults.character.apply(this, arguments);
				}
			},
			'home': function() {
				Syn.onParents(this, function( el ) {
					if ( el.scrollHeight != el.clientHeight ) {
						el.scrollTop = 0;
						return false;
					}
				})
			},
			'end': function() {
				Syn.onParents(this, function( el ) {
					if ( el.scrollHeight != el.clientHeight ) {
						el.scrollTop = el.scrollHeight;
						return false;
					}
				})
			},
			'page-down': function() {
				//find the first parent we can scroll
				Syn.onParents(this, function( el ) {
					if ( el.scrollHeight != el.clientHeight ) {
						var ch = el.clientHeight
						el.scrollTop += ch;
						return false;
					}
				})
			},
			'page-up': function() {
				Syn.onParents(this, function( el ) {
					if ( el.scrollHeight != el.clientHeight ) {
						var ch = el.clientHeight
						el.scrollTop -= ch;
						return false;
					}
				})
			},
			'\b': function( options, scope, key, force, sel ) {
				//this assumes we are deleting from the end
				if (!Syn.support.backspaceWorks && Syn.typeable.test(this) ) {
					var current = getText(this),
						before = current.substr(0, sel.start),
						after = current.substr(sel.end);

					if ( sel.start == sel.end && sel.start > 0 ) {
						//remove a character
						setText(this, before.substring(0, before.length - 1) + after);
						Syn.selectText(this, sel.start - 1);
					} else {
						setText(this, before + after);
						Syn.selectText(this, sel.start);
					}

					//set back the selection
				}
			},
			'delete': function( options, scope, key, force, sel ) {
				if (!Syn.support.backspaceWorks && Syn.typeable.test(this) ) {
					var current = getText(this),
						before = current.substr(0, sel.start),
						after = current.substr(sel.end);
					if ( sel.start == sel.end && sel.start <= getText(this).length - 1 ) {
						setText(this, before + after.substring(1));
					} else {
						setText(this, before + after);
					}
					Syn.selectText(this, sel.start);
				}
			},
			'\r': function( options, scope, key, force, sel ) {

				var nodeName = this.nodeName.toLowerCase()
				// submit a form
				if (nodeName == 'input' ) {
					Syn.trigger("change", {}, this);
				}
				
				if (!Syn.support.keypressSubmits && nodeName == 'input' ) {
					var form = Syn.closest(this, "form");
					if ( form ) {
						Syn.trigger("submit", {}, form);
					}

				}
				//newline in textarea
				if (!Syn.support.keyCharacters && nodeName == 'textarea' ) {
					Syn.key.defaults.character.call(this, options, scope, "\n", undefined, sel)
				}
				// 'click' hyperlinks
				if (!Syn.support.keypressOnAnchorClicks && nodeName == 'a' ) {
					Syn.trigger("click", {}, this);
				}
			},
			// 
			// Gets all focusable elements.  If the element (this)
			// doesn't have a tabindex, finds the next element after.
			// If the element (this) has a tabindex finds the element 
			// with the next higher tabindex OR the element with the same
			// tabindex after it in the document.
			// @return the next element
			// 
			'\t': function( options, scope ) {
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
					elIndex, firstNotIndexed, prev;
				orders = [];
				for (; i < focusEls.length; i++ ) {
					orders.push([focusEls[i], i]);
				}
				var sort = function( order1, order2 ) {
					var el1 = order1[0],
						el2 = order2[0],
						tab1 = Syn.tabIndex(el1) || 0,
						tab2 = Syn.tabIndex(el2) || 0;
					if ( tab1 == tab2 ) {
						return order1[1] - order2[1]
					} else {
						if ( tab1 == 0 ) {
							return 1;
						} else if ( tab2 == 0 ) {
							return -1;
						} else {
							return tab1 - tab2;
						}
					}
				}
				orders.sort(sort);
				//now find current
				for ( i = 0; i < orders.length; i++ ) {
					el = orders[i][0];
					if ( this == el ) {
						if (!Syn.key.shiftKey ) {
							current = orders[i + 1][0];
							if (!current ) {
								current = orders[0][0]
							}
						} else {
							current = orders[i - 1][0];
							if (!current ) {
								current = orders[focusEls.length - 1][0]
							}
						}

					}
				}

				//restart if we didn't find anything
				if (!current ) {
					current = firstNotIndexed;
				}
				current && current.focus();
				return current;
			},
			'left': function( options, scope, key, force, sel ) {
				if ( Syn.typeable.test(this) ) {
					if ( Syn.key.shiftKey ) {
						Syn.selectText(this, sel.start == 0 ? 0 : sel.start - 1, sel.end)
					} else {
						Syn.selectText(this, sel.start == 0 ? 0 : sel.start - 1)
					}
				}
			},
			'right': function( options, scope, key, force, sel ) {
				if ( Syn.typeable.test(this) ) {
					if ( Syn.key.shiftKey ) {
						Syn.selectText(this, sel.start, sel.end + 1 > getText(this).length ? getText(this).length : sel.end + 1)
					} else {
						Syn.selectText(this, sel.end + 1 > getText(this).length ? getText(this).length : sel.end + 1)
					}
				}
			},
			'up': function() {
				if (/select/i.test(this.nodeName) ) {

					this.selectedIndex = this.selectedIndex ? this.selectedIndex - 1 : 0;
					//set this to change on blur?
				}
			},
			'down': function() {
				if (/select/i.test(this.nodeName) ) {
					Syn.changeOnBlur(this, "selectedIndex", this.selectedIndex)
					this.selectedIndex = this.selectedIndex + 1;
					//set this to change on blur?
				}
			},
			'shift': function() {
				return null;
			},
			'ctrl': function() {
				return null;
			}
		}
	});

	h.extend(Syn.create, {
		keydown: {
			setup: function( type, options, element ) {
				if ( h.inArray(options, Syn.key.kinds.special) != -1 ) {
					Syn.key[options + "Key"] = element;
				}
			}
		},
		keypress: {
			setup: function( type, options, element ) {
				// if this browsers supports writing keys on events
				// but doesn't write them if the element isn't focused
				// focus on the element (ignored if already focused)
				if ( Syn.support.keyCharacters && !Syn.support.keysOnNotFocused ) {
					element.focus()
				}
			}
		},
		keyup: {
			setup: function( type, options, element ) {
				if ( h.inArray(options, Syn.key.kinds.special) != -1 ) {
					Syn.key[options + "Key"] = null;
				}
			}
		},
		key: {
			// return the options for a key event
			options: function( type, options, element ) {
				//check if options is character or has character
				options = typeof options != "object" ? {
					character: options
				} : options;

				//don't change the orignial
				options = h.extend({}, options)
				if ( options.character ) {
					h.extend(options, Syn.key.options(options.character, type));
					delete options.character;
				}

				options = h.extend({
					ctrlKey: !! Syn.key.ctrlKey,
					altKey: !! Syn.key.altKey,
					shiftKey: !! Syn.key.shiftKey,
					metaKey: !! Syn.key.metaKey
				}, options)

				return options;
			},
			// creates a key event
			event: function( type, options, element ) { //Everyone Else
				var doc = h.getWindow(element).document || document;
				if ( doc.createEvent ) {
					var event;

					try {

						event = doc.createEvent("KeyEvents");
						event.initKeyEvent(type, true, true, window, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.keyCode, options.charCode);
					}
					catch (e) {
						event = h.createBasicStandardEvent(type, options, doc);
					}
					event.synthetic = true;
					return event;
				}
				else {
					var event;
					try {
						event = h.createEventObject.apply(this, arguments);
						h.extend(event, options)
					}
					catch (e) {}

					return event;
				}
			}
		}
	});

	var convert = {
		"enter": "\r",
		"backspace": "\b",
		"tab": "\t",
		"space": " "
	}

	/**
	 * @add Syn prototype
	 */
	h.extend(Syn.init.prototype, {
		/**
		 * @function key
		 * Types a single key.  The key should be
		 * a string that matches a 
		 * [Syn.static.keycodes].
		 * 
		 * The following sends a carridge return
		 * to the 'name' element.
		 * @codestart
		 * Syn.key('\r','name')
		 * @codeend
		 * For each character, a keydown, keypress, and keyup is triggered if
		 * appropriate.
		 * @param {String|Number} options
		 * @param {HTMLElement} [element]
		 * @param {Function} [callback]
		 * @return {HTMLElement} the element currently focused.
		 */
		_key: function( options, element, callback ) {
			//first check if it is a special up
			if (/-up$/.test(options) && h.inArray(options.replace("-up", ""), Syn.key.kinds.special) != -1 ) {
				Syn.trigger('keyup', options.replace("-up", ""), element)
				callback(true, element);
				return;
			}

			// keep reference to current activeElement
			var activeElement = h.getWindow(element).document.activeElement,			
				caret = Syn.typeable.test(element) && getSelection(element),
				key = convert[options] || options,
				// should we run default events
				runDefaults = Syn.trigger('keydown', key, element),

				// a function that gets the default behavior for a key
				getDefault = Syn.key.getDefault,

				// how this browser handles preventing default events
				prevent = Syn.key.browser.prevent,

				// the result of the default event
				defaultResult,
				
				keypressOptions = Syn.key.options(key, 'keypress');


				if ( runDefaults ) {
					//if the browser doesn't create keypresses for this key, run default
					if (!keypressOptions ) {
						defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key, undefined, caret)
					} else {
						//do keypress
						// check if activeElement changed b/c someone called focus in keydown
						if( activeElement !== h.getWindow(element).document.activeElement ) {
							element = h.getWindow(element).document.activeElement;
						}
						
						runDefaults = Syn.trigger('keypress', keypressOptions, element)
						if ( runDefaults ) {
							defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key, undefined, caret)
						}
					}
				} else {
					//canceled ... possibly don't run keypress
					if ( keypressOptions && h.inArray('keypress', prevent.keydown) == -1 ) {
						// check if activeElement changed b/c someone called focus in keydown
						if( activeElement !== h.getWindow(element).document.activeElement ) {
							element = h.getWindow(element).document.activeElement;
						}
						
						Syn.trigger('keypress', keypressOptions, element)
					}
				}
				if ( defaultResult && defaultResult.nodeName ) {
					element = defaultResult
				}

				if ( defaultResult !== null ) {
					setTimeout(function() {
						if(Syn.support.oninput) {
							Syn.trigger('input', Syn.key.options(key, 'input'), element);
						}
						Syn.trigger('keyup', Syn.key.options(key, 'keyup'), element)
						callback(runDefaults, element)
					}, 1)
				} else {
					callback(runDefaults, element)
				}


				//do mouseup
				return element;
			// is there a keypress? .. if not , run default
			// yes -> did we prevent it?, if not run ...
		},
		/**
		 * @function type
		 * Types sequence of [Syn.key key actions].  Each
		 * character is typed, one at a type.
		 * Multi-character keys like 'left' should be
		 * enclosed in square brackents.
		 * 
		 * The following types 'JavaScript MVC' then deletes the space.
		 * @codestart
		 * Syn.type('JavaScript MVC[left][left][left]\b','name')
		 * @codeend
		 * 
		 * Type is able to handle (and move with) tabs (\t).  
		 * The following simulates tabing and entering values in a form and 
		 * eventually submitting the form.
		 * @codestart
		 * Syn.type("Justin\tMeyer\t27\tjustinbmeyer@gmail.com\r")
		 * @codeend
		 * @param {String} options the text to type
		 * @param {HTMLElement} [element] an element or an id of an element
		 * @param {Function} [callback] a function to callback
		 */
		_type: function( options, element, callback ) {
			//break it up into parts ...
			//go through each type and run
			var parts = (options+"").match(/(\[[^\]]+\])|([^\[])/g),
				self = this,
				runNextPart = function( runDefaults, el ) {
					var part = parts.shift();
					if (!part ) {
						callback(runDefaults, el);
						return;
					}
					el = el || element;
					if ( part.length > 1 ) {
						part = part.substr(1, part.length - 2)
					}
					self._key(part, el, runNextPart)
				}

				runNextPart();

		}
	});

	if(!Syn.config.support) {
		//do support code
		!function() {
			if (!document.body ) {
				setTimeout(arguments.callee, 1)
				return;
			}

			var div = document.createElement("div"),
				checkbox, submit, form, input, submitted = false,
				anchor, textarea, inputter, one;

			div.innerHTML = "<form id='outer'>" + 
							"<input name='checkbox' type='checkbox'/>" + 
							"<input name='radio' type='radio' />" + 
							"<input type='submit' name='submitter'/>" + 
							"<input type='input' name='inputter'/>" + 
							"<input name='one'>" + 
							"<input name='two'/>" + 
							"<a href='#abc'></a>" + 
							"<textarea>1\n2</textarea>" +
							"</form>";

			document.documentElement.appendChild(div);
			form = div.firstChild;
			checkbox = form.childNodes[0];
			submit = form.childNodes[2];
			anchor = form.getElementsByTagName("a")[0];
			textarea = form.getElementsByTagName("textarea")[0];
			inputter = form.childNodes[3];
			one = form.childNodes[4];

			form.onsubmit = function( ev ) {
				if ( ev.preventDefault ) ev.preventDefault();
				Syn.support.keypressSubmits = true;
				ev.returnValue = false;
				return false;
			};
			// Firefox 4 won't write key events if the element isn't focused
			inputter.focus();
			Syn.trigger("keypress", "\r", inputter);


			Syn.trigger("keypress", "a", inputter);
			Syn.support.keyCharacters = inputter.value == "a";


			inputter.value = "a";
			Syn.trigger("keypress", "\b", inputter);
			Syn.support.backspaceWorks = inputter.value == "";



			inputter.onchange = function() {
				Syn.support.focusChanges = true;
			}
			inputter.focus();
			Syn.trigger("keypress", "a", inputter);
			form.childNodes[5].focus(); // this will throw a change event
			Syn.trigger("keypress", "b", inputter);
			Syn.support.keysOnNotFocused = inputter.value == "ab";

			//test keypress \r on anchor submits
			Syn.bind(anchor, "click", function( ev ) {
				if ( ev.preventDefault ) ev.preventDefault();
				Syn.support.keypressOnAnchorClicks = true;
				ev.returnValue = false;
				return false;
			})
			Syn.trigger("keypress", "\r", anchor);

			Syn.support.textareaCarriage = textarea.value.length == 4;

			// IE only, oninput event.
			Syn.support.oninput = 'oninput' in one;
			
			document.documentElement.removeChild(div);

			Syn.support.ready++;
		}();
	}
	else {
		Syn.helpers.extend(Syn.support, Syn.config.support);
	}

	return Syn;
})(__m3, __m7, __m5);

// ## lib/syn/src/drag/drag.js
var __m8 = (function(Syn) {
	
	// check if elementFromPageExists
	(function() {

		// document body has to exists for this test
		if (!document.body ) {
			setTimeout(arguments.callee, 1)
			return;
		}
		var div = document.createElement('div')
		document.body.appendChild(div);
		Syn.helpers.extend(div.style, {
			width: "100px",
			height: "10000px",
			backgroundColor: "blue",
			position: "absolute",
			top: "10px",
			left: "0px",
			zIndex: 19999
		});
		document.body.scrollTop = 11;
		if (!document.elementFromPoint ) {
			return;
		}
		var el = document.elementFromPoint(3, 1)
		if ( el == div ) {
			Syn.support.elementFromClient = true;
		}
		else {
			Syn.support.elementFromPage = true;
		}
		document.body.removeChild(div);
		document.body.scrollTop = 0;
	})();


	//gets an element from a point
	var elementFromPoint = function( point, element ) {
		var clientX = point.clientX,
			clientY = point.clientY,
			win = Syn.helpers.getWindow(element),
			el;



		if ( Syn.support.elementFromPage ) {
			var off = Syn.helpers.scrollOffset(win);
			clientX = clientX + off.left; //convert to pageX
			clientY = clientY + off.top; //convert to pageY
		}
		el = win.document.elementFromPoint ? win.document.elementFromPoint(clientX, clientY) : element;
		if ( el === win.document.documentElement && (point.clientY < 0 || point.clientX < 0) ) {
			return element;
		} else {
			return el;
		}
	},
		//creates an event at a certain point
		createEventAtPoint = function( event, point, element ) {
			var el = elementFromPoint(point, element)
			Syn.trigger(event, point, el || element)
			return el;
		},
		// creates a mousemove event, but first triggering mouseout / mouseover if appropriate
		mouseMove = function( point, element, last ) {
			var el = elementFromPoint(point, element)
			if ( last != el && el && last ) {
				var options = Syn.helpers.extend({}, point);
				options.relatedTarget = el;
				Syn.trigger("mouseout", options, last);
				options.relatedTarget = last;
				Syn.trigger("mouseover", options, el);
			}

			Syn.trigger("mousemove", point, el || element)
			return el;
		},
		// start and end are in clientX, clientY
		startMove = function( start, end, duration, element, callback ) {
			var startTime = new Date(),
				distX = end.clientX - start.clientX,
				distY = end.clientY - start.clientY,
				win = Syn.helpers.getWindow(element),
				current = elementFromPoint(start, element),
				cursor = win.document.createElement('div'),
				calls = 0;
			move = function() {
				//get what fraction we are at
				var now = new Date(),
					scrollOffset = Syn.helpers.scrollOffset(win),
					fraction = (calls == 0 ? 0 : now - startTime) / duration,
					options = {
						clientX: distX * fraction + start.clientX,
						clientY: distY * fraction + start.clientY
					};
				calls++;
				if ( fraction < 1 ) {
					Syn.helpers.extend(cursor.style, {
						left: (options.clientX + scrollOffset.left + 2) + "px",
						top: (options.clientY + scrollOffset.top + 2) + "px"
					})
					current = mouseMove(options, element, current)
					setTimeout(arguments.callee, 15)
				}
				else {
					current = mouseMove(end, element, current);
					win.document.body.removeChild(cursor)
					callback();
				}
			}
			Syn.helpers.extend(cursor.style, {
				height: "5px",
				width: "5px",
				backgroundColor: "red",
				position: "absolute",
				zIndex: 19999,
				fontSize: "1px"
			})
			win.document.body.appendChild(cursor)
			move();
		},
		startDrag = function( start, end, duration, element, callback ) {
			createEventAtPoint("mousedown", start, element);
			startMove(start, end, duration, element, function() {
				createEventAtPoint("mouseup", end, element);
				callback();
			})
		},
		center = function( el ) {
			var j = Syn.jquery()(el),
				o = j.offset();
			return {
				pageX: o.left + (j.outerWidth() / 2),
				pageY: o.top + (j.outerHeight() / 2)
			}
		},
		convertOption = function( option, win, from ) {
			var page = /(\d+)[x ](\d+)/,
				client = /(\d+)X(\d+)/,
				relative = /([+-]\d+)[xX ]([+-]\d+)/
				//check relative "+22x-44"
				if ( typeof option == 'string' && relative.test(option) && from ) {
					var cent = center(from),
						parts = option.match(relative);
					option = {
						pageX: cent.pageX + parseInt(parts[1]),
						pageY: cent.pageY + parseInt(parts[2])
					}
				}
				if ( typeof option == 'string' && page.test(option) ) {
					var parts = option.match(page)
					option = {
						pageX: parseInt(parts[1]),
						pageY: parseInt(parts[2])
					}
				}
				if ( typeof option == 'string' && client.test(option) ) {
					var parts = option.match(client)
					option = {
						clientX: parseInt(parts[1]),
						clientY: parseInt(parts[2])
					}
				}
				if ( typeof option == 'string' ) {
					option = Syn.jquery()(option, win.document)[0];
				}
				if ( option.nodeName ) {
					option = center(option)
				}
				if ( option.pageX ) {
					var off = Syn.helpers.scrollOffset(win);
					option = {
						clientX: option.pageX - off.left,
						clientY: option.pageY - off.top
					}
				}
				return option;
		},
		// if the client chords are not going to be visible ... scroll the page so they will be ...
		adjust = function(from, to, win){
			if(from.clientY < 0){
				var off = Syn.helpers.scrollOffset(win);
				var dimensions = Syn.helpers.scrollDimensions(win),
					top = off.top + (from.clientY) - 100,
					diff = top - off.top
				
				// first, lets see if we can scroll 100 px
				if( top > 0){
					
				} else {
					top =0;
					diff = -off.top;
				}
				from.clientY = from.clientY - diff;
				to.clientY = to.clientY - diff;
				Syn.helpers.scrollOffset(win,{top: top, left: off.left});
				
				//throw "out of bounds!"
			}
		}
		/**
		 * @add Syn prototype
		 */
		Syn.helpers.extend(Syn.init.prototype, {
			/**
			 * @function move
			 * Moves the cursor from one point to another.  
			 * 
			 * ### Quick Example
			 * 
			 * The following moves the cursor from (0,0) in
			 * the window to (100,100) in 1 second.
			 * 
			 *     Syn.move(
			 *          {
			 *            from: {clientX: 0, clientY: 0},
			 *            to: {clientX: 100, clientY: 100},
			 *            duration: 1000
			 *          },
			 *          document.document)
			 * 
			 * ## Options
			 * 
			 * There are many ways to configure the endpoints of the move.
			 * 
			 * ### PageX and PageY
			 * 
			 * If you pass pageX or pageY, these will get converted
			 * to client coordinates.
			 * 
			 *     Syn.move(
			 *          {
			 *            from: {pageX: 0, pageY: 0},
			 *            to: {pageX: 100, pageY: 100}
			 *          },
			 *          document.document)
			 * 
			 * ### String Coordinates
			 * 
			 * You can set the pageX and pageY as strings like:
			 * 
			 *     Syn.move(
			 *          {
			 *            from: "0x0",
			 *            to: "100x100"
			 *          },
			 *          document.document)
			 * 
			 * ### Element Coordinates
			 * 
			 * If jQuery is present, you can pass an element as the from or to option
			 * and the coordinate will be set as the center of the element.
			 
			 *     Syn.move(
			 *          {
			 *            from: $(".recipe")[0],
			 *            to: $("#trash")[0]
			 *          },
			 *          document.document)
			 * 
			 * ### Query Strings
			 * 
			 * If jQuery is present, you can pass a query string as the from or to option.
			 * 
			 * Syn.move(
			 *      {
			 *        from: ".recipe",
			 *        to: "#trash"
			 *      },
			 *      document.document)
			 *    
			 * ### No From
			 * 
			 * If you don't provide a from, the element argument passed to Syn is used.
			 * 
			 *     Syn.move(
			 *          { to: "#trash" },
			 *          'myrecipe')
			 * 
			 * ### Relative
			 * 
			 * You can move the drag relative to the center of the from element.
			 * 
			 *     Syn.move("+20 +30", "myrecipe");
			 * 
			 * @param {Object} options options to configure the drag
			 * @param {HTMLElement} from the element to move
			 * @param {Function} callback a callback that happens after the drag motion has completed
			 */
			_move: function( options, from, callback ) {
				//need to convert if elements
				var win = Syn.helpers.getWindow(from),
					fro = convertOption(options.from || from, win, from),
					to = convertOption(options.to || options, win, from);
				
				options.adjust !== false && adjust(fro, to, win);
				startMove(fro, to, options.duration || 500, from, callback);

			},
			/**
			 * @function drag
			 * Creates a mousedown and drags from one point to another.  
			 * Check out [Syn.prototype.move move] for API details.
			 * 
			 * @param {Object} options
			 * @param {Object} from
			 * @param {Object} callback
			 */
			_drag: function( options, from, callback ) {
				//need to convert if elements
				var win = Syn.helpers.getWindow(from),
					fro = convertOption(options.from || from, win, from),
					to = convertOption(options.to || options, win, from);

				options.adjust !== false && adjust(fro, to, win);
				startDrag(fro, to, options.duration || 500, from, callback);

			}
		})
	return Syn;
})(__m3);

// ## lib/syn/src/syn.js
var __m2 = (function(Syn) {
	window.Syn = Syn;

	return Syn;
})(__m3, __m4, __m5, __m6, __m8);

// ## lib/jquery/jquery.js
var __m11 = (function() {
/*!
 * jQuery JavaScript Library v1.11.0
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-01-23T21:02Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper window is present,
		// execute the factory and get jQuery
		// For environments that do not inherently posses a window with a document
		// (such as Node.js), expose a jQuery-making factory as module.exports
		// This accentuates the need for the creation of a real window
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//

var deletedIds = [];

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var trim = "".trim;

var support = {};



var
	version = "1.11.0",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return a 'clean' array
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return just the object
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		return obj - parseFloat( obj ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( support.ownLast ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: trim && !trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v1.10.16
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-01-13
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	compile,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== strundefined && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare,
		doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", function() {
				setDocument();
			}, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", function() {
				setDocument();
			});
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName ) && assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select t=''><option selected=''></option></select>";

			// Support: IE8, Opera 10-12
			// Nothing should be selected when empty strings follow ^= or $= or *=
			if ( div.querySelectorAll("[t^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] && match[4] !== undefined ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
				}
				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
}

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.unique( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !(--remaining) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	}
});

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed, false );
		window.removeEventListener( "load", completed, false );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};


var strundefined = typeof undefined;



// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownLast = i !== "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

jQuery(function() {
	// We need to execute this one support test ASAP because we need to know
	// if body.style.zoom needs to be set.

	var container, div,
		body = document.getElementsByTagName("body")[0];

	if ( !body ) {
		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

	div = document.createElement( "div" );
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== strundefined ) {
		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "border:0;margin:0;width:1px;padding:1px;display:inline;zoom:1";

		if ( (support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 )) ) {
			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );

	// Null elements to avoid leaks in IE
	container = div = null;
});




(function() {
	var div = document.createElement( "div" );

	// Execute the test only if not already executed in another module.
	if (support.deleteExpando == null) {
		// Support: IE<9
		support.deleteExpando = true;
		try {
			delete div.test;
		} catch( e ) {
			support.deleteExpando = false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
})();


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( elem ) {
	var noData = jQuery.noData[ (elem.nodeName + " ").toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute("classid") === noData;
};


var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,
		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[0],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {
						name = attrs[i].name;

						if ( name.indexOf("data-") === 0 ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each(function() {
				jQuery.data( this, key, value );
			}) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};



// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[0], key ) : emptyGet;
};
var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = document.createElement("div"),
		input = document.createElement("input");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );
	div.innerHTML = "<input type='radio' checked='checked' name='t'/>";

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	support.noCloneEvent = true;
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Execute the test only if not already executed in another module.
	if (support.deleteExpando == null) {
		// Support: IE<9
		support.deleteExpando = true;
		try {
			delete div.test;
		} catch( e ) {
			support.deleteExpando = false;
		}
	}

	// Null elements to avoid leaks in IE.
	fragment = div = input = null;
})();


(function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox 23+ (lack focusin event)
	for ( i in { submit: true, change: true, focusin: true }) {
		eventName = "on" + i;

		if ( !(support[ i + "Bubbles" ] = eventName in window) ) {
			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i + "Bubbles" ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
})();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined && (
				// Support: IE < 9
				src.returnValue === false ||
				// Support: Android < 4.0
				src.getPreventDefault && src.getPreventDefault() ) ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (jQuery.find.attr( elem, "type" ) !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!support.noCloneEvent || !support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = (rtagName.exec( elem ) || [ "", "" ])[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ (rtagName.exec( value ) || [ "", "" ])[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[i], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle ?

			// Use of this method is a temporary fix (more like optmization) until something better comes along,
			// since it was removed from specification and supported only in FF
			window.getDefaultComputedStyle( elem[ 0 ] ).display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}


(function() {
	var a, shrinkWrapBlocksVal,
		div = document.createElement( "div" ),
		divReset =
			"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;" +
			"display:block;padding:0;margin:0;border:0";

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	a.style.cssText = "float:left;opacity:.5";

	// Make sure that element opacity exists
	// (IE uses filter instead)
	// Use a regex to work around a WebKit issue. See #5145
	support.opacity = /^0.5/.test( a.style.opacity );

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!a.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Null elements to avoid leaks in IE.
	a = div = null;

	support.shrinkWrapBlocks = function() {
		var body, container, div, containerStyles;

		if ( shrinkWrapBlocksVal == null ) {
			body = document.getElementsByTagName( "body" )[ 0 ];
			if ( !body ) {
				// Test fired too early or in an unsupported environment, exit.
				return;
			}

			containerStyles = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px";
			container = document.createElement( "div" );
			div = document.createElement( "div" );

			body.appendChild( container ).appendChild( div );

			// Will be changed later if needed.
			shrinkWrapBlocksVal = false;

			if ( typeof div.style.zoom !== strundefined ) {
				// Support: IE6
				// Check if elements with layout shrink-wrap their children
				div.style.cssText = divReset + ";width:1px;padding:1px;zoom:1";
				div.innerHTML = "<div></div>";
				div.firstChild.style.width = "5px";
				shrinkWrapBlocksVal = div.offsetWidth !== 3;
			}

			body.removeChild( container );

			// Null elements to avoid leaks in IE.
			body = container = div = null;
		}

		return shrinkWrapBlocksVal;
	};

})();
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );



var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			var condition = conditionFn();

			if ( condition == null ) {
				// The test was not ready at this point; screw the hook this time
				// but check again when needed next time.
				return;
			}

			if ( condition ) {
				// Hook not needed (or it's not possible to use it due to missing dependency),
				// remove it.
				// Since there are no other hooks for marginRight, remove the whole object.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.

			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var a, reliableHiddenOffsetsVal, boxSizingVal, boxSizingReliableVal,
		pixelPositionVal, reliableMarginRightVal,
		div = document.createElement( "div" ),
		containerStyles = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px",
		divReset =
			"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;" +
			"display:block;padding:0;margin:0;border:0";

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	a.style.cssText = "float:left;opacity:.5";

	// Make sure that element opacity exists
	// (IE uses filter instead)
	// Use a regex to work around a WebKit issue. See #5145
	support.opacity = /^0.5/.test( a.style.opacity );

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!a.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Null elements to avoid leaks in IE.
	a = div = null;

	jQuery.extend(support, {
		reliableHiddenOffsets: function() {
			if ( reliableHiddenOffsetsVal != null ) {
				return reliableHiddenOffsetsVal;
			}

			var container, tds, isSupported,
				div = document.createElement( "div" ),
				body = document.getElementsByTagName( "body" )[ 0 ];

			if ( !body ) {
				// Return for frameset docs that don't have a body
				return;
			}

			// Setup
			div.setAttribute( "className", "t" );
			div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

			container = document.createElement( "div" );
			container.style.cssText = containerStyles;

			body.appendChild( container ).appendChild( div );

			// Support: IE8
			// Check if table cells still have offsetWidth/Height when they are set
			// to display:none and there are still other visible table cells in a
			// table row; if so, offsetWidth/Height are not reliable for use when
			// determining if an element has been hidden directly using
			// display:none (it is still safe to use offsets if a parent element is
			// hidden; don safety goggles and see bug #4512 for more information).
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			tds = div.getElementsByTagName( "td" );
			tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
			isSupported = ( tds[ 0 ].offsetHeight === 0 );

			tds[ 0 ].style.display = "";
			tds[ 1 ].style.display = "none";

			// Support: IE8
			// Check if empty table cells still have offsetWidth/Height
			reliableHiddenOffsetsVal = isSupported && ( tds[ 0 ].offsetHeight === 0 );

			body.removeChild( container );

			// Null elements to avoid leaks in IE.
			div = body = null;

			return reliableHiddenOffsetsVal;
		},

		boxSizing: function() {
			if ( boxSizingVal == null ) {
				computeStyleTests();
			}
			return boxSizingVal;
		},

		boxSizingReliable: function() {
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {
			var body, container, div, marginDiv;

			// Use window.getComputedStyle because jsdom on node.js will break without it.
			if ( reliableMarginRightVal == null && window.getComputedStyle ) {
				body = document.getElementsByTagName( "body" )[ 0 ];
				if ( !body ) {
					// Test fired too early or in an unsupported environment, exit.
					return;
				}

				container = document.createElement( "div" );
				div = document.createElement( "div" );
				container.style.cssText = containerStyles;

				body.appendChild( container ).appendChild( div );

				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// Fails in WebKit before Feb 2011 nightlies
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				marginDiv = div.appendChild( document.createElement( "div" ) );
				marginDiv.style.cssText = div.style.cssText = divReset;
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";

				reliableMarginRightVal =
					!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );

				body.removeChild( container );
			}

			return reliableMarginRightVal;
		}
	});

	function computeStyleTests() {
		var container, div,
			body = document.getElementsByTagName( "body" )[ 0 ];

		if ( !body ) {
			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		container = document.createElement( "div" );
		div = document.createElement( "div" );
		container.style.cssText = containerStyles;

		body.appendChild( container ).appendChild( div );

		div.style.cssText =
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
				"position:absolute;display:block;padding:1px;border:1px;width:4px;" +
				"margin-top:1%;top:1%";

		// Workaround failing boxSizing test due to offsetWidth returning wrong value
		// with some non-1 values of body zoom, ticket #13543
		jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
			boxSizingVal = div.offsetWidth === 4;
		});

		// Will be changed later if needed.
		boxSizingReliableVal = true;
		pixelPositionVal = false;
		reliableMarginRightVal = true;

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			pixelPositionVal = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			boxSizingReliableVal =
				( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE.
		div = body = null;
	}

})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,

	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing() && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					// Support: Chrome, Safari
					// Setting style to blank string required to delete "style: x !important;"
					style[ name ] = "";
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing() && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// Work around by temporarily setting element display to inline-block
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*
					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur()
				// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, dDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );
		dDisplay = defaultDisplay( elem.nodeName );
		if ( display === "none" ) {
			display = dDisplay;
		}
		if ( display === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || dDisplay === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {
	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var a, input, select, opt,
		div = document.createElement("div" );

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName("a")[ 0 ];

	// First batch of tests.
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute("style") );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute("href") === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement("form").enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// Null elements to avoid leaks in IE.
	a = input = select = opt = div = null;
})();


var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					jQuery.text( elem );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) >= 0 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;
					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// Retrieve booleans specially
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {

	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = getSetInput && getSetAttribute || !ruseDefault.test( name ) ?
		function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {
				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		} :
		function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
});

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return (ret = elem.getAttributeNode( name )) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	});
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						-1;
			}
		}
	}
});

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {
	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

// Support: Safari, IE9+
// mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {
	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {
		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	}) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
		(!support.reliableHiddenOffsets() &&
			((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?
	// Support: IE6+
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		return !this.isLocal &&

			// Support: IE7-8
			// oldIE XHR does not support non-RFC2616 methods (#13240)
			// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
			// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
			// Although this check for six methods instead of eight
			// since IE also does not support "trace" and "connect"
			/^(get|post|head|put|delete|options)$/i.test( this.type ) &&

			createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
if ( window.ActiveXObject ) {
	jQuery( window ).on( "unload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	});
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( options ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open( options.type, options.url, options.async, options.username, options.password );

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {
							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch( e ) {
									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;
								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					if ( !options.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};





var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray("auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

return jQuery;
})();


// ## browser/jquery.js
var __m10 = (function($) {
  return $.noConflict(true);
})(__m11);

// ## browser/init.js
var __m12 = (function(jQuery) {
	var FuncUnit = window.FuncUnit || {};

	jQuery.sub = function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	};

	FuncUnit.jQuery = jQuery;
	return FuncUnit;
})(__m10);

// ## browser/core.js
var __m9 = (function(jQuery, oldFuncUnit) {
	var FuncUnit = oldFuncUnit.jQuery.sub();
	var origFuncUnit = FuncUnit;
	// override the subbed init method
	// context can be an object with frame and forceSync:
	// - a number or string: this is a frame name/number, and means only do a sync query
	// - true: means force the query to be sync only
	FuncUnit = function( selector, frame ) {
		// if you pass true as context, this will avoid doing a synchronous query
		var frame,
			forceSync, 
			isSyncOnly = false;
		
		if(frame && frame.forceSync){
			forceSync = frame.forceSync;
		}
		
		if(frame && typeof frame.frame !== "undefined"){ // its passed as an object
			frame = frame.frame;
		}
		
		isSyncOnly = typeof forceSync === "boolean"? forceSync: isSyncOnly;
		// if its a function, just run it in the queue
		if(typeof selector == "function"){
			return FuncUnit.wait(0, selector);
		}
		// if the app window already exists, adjust the params (for the sync return value)
		this.selector = selector;
		// run this method in the queue also
		if(isSyncOnly === true){
			var collection = performSyncQuery(selector, frame);
			return collection;
		} else { // do both
			performAsyncQuery(selector, frame, this);
			var collection = performSyncQuery(selector, frame);
			return collection;
		}
	}


	
	var getContext = function(context){
			if (typeof context === "number" || typeof context === "string") {
				// try to get the context from an iframe in the funcunit document
				var sel = (typeof context === "number" ? "iframe:eq(" + context + ")" : "iframe[name='" + context + "']"),
					frames = new origFuncUnit.fn.init(sel, FuncUnit.win.document.documentElement, true);
				var frame = (frames.length ? frames.get(0).contentWindow : FuncUnit.win).document.documentElement;
				
			} else {
				frame = FuncUnit.win.document.documentElement;
			}
			return frame;
		},
		performAsyncQuery = function(selector, frame, self){
			FuncUnit.add({
				method: function(success, error){
					this.frame = frame;
					if (FuncUnit.win) {
						frame = getContext(frame);
					}
					this.selector = selector;
					this.bind = new origFuncUnit.fn.init( selector, frame, true );
					success();
					return this;
				},
				error: "selector failed: " + selector,
				type: "query"
			});
		},
		performSyncQuery = function(selector, frame){
			var origFrame = frame;
			if (FuncUnit.win) {
				frame = getContext(frame);
			}
			var obj = new origFuncUnit.fn.init( selector, frame, true );
			obj.frame = origFrame;
			return obj;
		}
	
	oldFuncUnit.jQuery.extend(FuncUnit, oldFuncUnit, origFuncUnit)
	FuncUnit.prototype = origFuncUnit.prototype;
	return FuncUnit;
})(__m10, __m12);

// ## browser/adapters/jasmine.js
var __m14 = (function(FuncUnit) {
	if(window.jasmine) {
		var paused = false;
		FuncUnit.unit = {
			pauseTest:function(){
				paused = true;
				waitsFor(function(){
					return paused === false;
				}, 60000)
			},
			resumeTest: function(){
				paused = false;
			},
			assertOK: function(assertion, message){
				expect(assertion).toBeTruthy();
			},
			equiv: function(expected, actual){
				return jasmine.getEnv().equals_(expected, actual)
			}
		}
		return FuncUnit;
	}
})(__m9);

// ## browser/adapters/qunit.js
var __m15 = (function(FuncUnit) {
	if(window.QUnit) {
		FuncUnit.unit = {
		pauseTest:function(){
			stop();
		},
		resumeTest: function(){
			start();
		},
		assertOK: function(assertion, message){
			ok(assertion, message)
		},
		equiv: function(expected, actual){
			return QUnit.equiv(expected, actual);
		}
	}
	}
})(__m9);

// ## browser/adapters/mocha.js
var __m16 = (function(FuncUnit) {
	var ok = function(expr, msg) {
		if(!expr) throw new Error(msg);
	};

	if(window.mocha) {
		FuncUnit.timeout = 1900;

		FuncUnit.unit = {
			pauseTest: function() {},
			resumeTest: function() {},

			assertOK: function(assertion, message) {
				ok(assertion, message)
			},

			equiv: function(expected, actual) {
				//should this be === for tighter asserts?
				return expected == actual;
			}
		};
	}
})(__m9);

// ## browser/adapters/adapters.js
var __m13 = (function() {})(__m14, __m15, __m16);

// ## browser/open.js
var __m17 = (function($, FuncUnit) {
	if(FuncUnit.frameMode){
		var ifrm = document.createElement("iframe");
		ifrm.id = 'funcunit_app';
		document.body.insertBefore(ifrm, document.body.firstChild);
	}

var confirms = [], 
	prompts = [], 
	currentDocument,
	currentHref,
	// pointer to the popup window
	appWin, 
	lookingForNewDocument = false,
	urlWithoutHash = function(url){
		return url.replace(/\#.*$/, "");
	},
	// returns true if url matches current window's url
	isCurrentPage = function(url){
		var pathname = urlWithoutHash(FuncUnit.win.location.pathname),
			href = urlWithoutHash(FuncUnit.win.location.href),
			url = urlWithoutHash(url);
		// must strip off hash from URLs
		if( pathname === url || href === url ){
			return true;
		}
		return false;
	};
/**
 * @add FuncUnit
 */
//
$.extend(FuncUnit,{
	// open is a method

	/**
     * @parent utilities
     * @function FuncUnit.open F.open()
     * @signature `open(path, success, timeout)`
     *
	 * Opens a page.  It will error if the page can't be opened before timeout. If a URL begins with "//", pages are opened 
	 * from the FuncUnit root (the root folder where funcunit is located)
	 * ### Example
     *
     * @codestart
     * F.open("//app/app.html")
     * @codeend
	 * 
	 * @param {String} path a full or partial url to open.
	 * @param {Function} success
	 * @param {Number} timeout
     * @return {undefined}
	 */
	open: function( path, success, timeout ) {
		if(typeof success != 'function'){
			timeout = success;
			success = undefined;
		}
		FuncUnit.add({
			method: function(success, error){ //function that actually does stuff, if this doesn't call success by timeout, error will be called, or can call error itself
				if(typeof path === "string"){
					var fullPath = FuncUnit.getAbsolutePath(path);
					FuncUnit._open(fullPath, error);
					FuncUnit._onload(function(){
						success()
					}, error);
				} else {
					FuncUnit.win = path;
					success();
				}
			},
			success: success,
			error: "Page " + path + " not loaded in time!",
			timeout: timeout || 30000
		});
	},
	_open: function(url){
		FuncUnit.win = appWin;
		hasSteal = false;
		// this will determine if this is supposed to open within a frame
		FuncUnit.frame =  $('#funcunit_app').length? $('#funcunit_app')[0]: null;
	
		// if the first time ..
		if (newPage) {
			if(FuncUnit.frame){
				FuncUnit.win = FuncUnit.frame.contentWindow;
				FuncUnit.win.location = url;
			}
			else{
				// giving a large height forces it to not open in a new tab and just opens to the window's height
				var width = $(window).width();
				FuncUnit.win = window.open(url, "funcunit",  "height=1000,toolbar=yes,status=yes,width="+width/2+",left="+width/2);
				// This is mainly for opera. Other browsers will hit the unload event and close the popup.
				// This block breaks in IE (which never reaches it) because after closing a window, it throws access 
				// denied any time you try to access it, even after reopening.
				if(FuncUnit.win.___FUNCUNIT_OPENED) {
					FuncUnit.win.close();
					FuncUnit.win = window.open(url, "funcunit",  "height=1000,toolbar=yes,status=yes,left="+width/2);
				}
				
				
				if(!FuncUnit.win){
					throw "Could not open a popup window.  Your popup blocker is probably on.  Please turn it off and try again";
				}
			}
			appWin = FuncUnit.win;
		}
		// otherwise, change the frame's url
		else {
			lookingForNewDocument = true;
			if(isCurrentPage(url)){
				/*Sometimes readyState does not correctly reset itself, so we remove the
				body from the document we are navigating away from, which will get set again
				when the page has reloaded*/
				FuncUnit.win.document.body.parentNode.removeChild(FuncUnit.win.document.body);
				// set the hash and reload
				FuncUnit.win.location.hash = url.split('#')[1] || '';
				FuncUnit.win.location.reload(true);
			} else {
				// setting the location forces a reload; IE freaks out if you try to do both
				FuncUnit.win.location = url;
			}
			// setting to null b/c opera uses the same document
			currentDocument = null;
		}
		lookingForNewDocument = true;
	},
	/**
	 * @parent utilities
     * @function FuncUnit.confirm F.confirm()
     * @signature `confirm(answer)`
     *
	 * When a browser's native confirm dialog is used, this method is used to repress the dialog and simulate
	 * clicking OK or Cancel.  Alerts are repressed by default in FuncUnit application windows.
     *
	 * @codestart
	 * F.confirm(true);
	 * @codeend
     *
	 * @param {Boolean} answer true if you want to click OK, false otherwise
     * @return {undefined}
	 */
	confirm: function(answer){
		confirms.push(!!answer)
	},
	/**
	 * @parent utilities
     * @function FuncUnit.prompt F.prompt()
     * @signature `prompt(answer)`
     *
	 * When a browser's native prompt dialog is used, this method is used to repress the dialog and simulate 
	 * clicking typing something into the dialog.
	 * @codestart
	 * F.prompt("Harry Potter");
	 * @codeend
	 * @param {String} answer Whatever you want to simulate a user typing in the prompt box
     * @return {undefined}
	 */
	prompt: function(answer){
		prompts.push(answer)
	},
	_opened: function(){
		if (!this._isOverridden("alert")) {
			FuncUnit.win.alert = function(){}
		}
		
		if (!this._isOverridden("confirm")) {
			FuncUnit.win.confirm = function(){
				var res = confirms.shift();
				return res;
			}
		}
		
		if (!this._isOverridden("prompt")) {
			FuncUnit.win.prompt = function(){
				return prompts.shift();
			}
		}
	},
	_isOverridden:function(type) {
		return !(/(native code)|(source code not available)/.test(FuncUnit.win[type]));
	},
	_onload: function(success, error){
		// saver reference to success
		loadSuccess = function(){
			if(FuncUnit.win.steal){
				hasSteal = true;
			}
			// called when load happens ... here we check for steal
			// console.log("success", (FuncUnit.win.steal && FuncUnit.win.steal.isReady) || !hasSteal, 
				// "isReady", (FuncUnit.win.steal && FuncUnit.win.steal.isReady));
			if((FuncUnit.win.steal && FuncUnit.win.steal.isReady) || !hasSteal){
				success();
			}else{
				setTimeout(arguments.callee, 200)
			}
				
		}
		
		// we only need to do this setup stuff once ...
		if (!newPage) {
			return;
		}
		newPage = false;
		
		if (FuncUnit.support.readystate)
		{
			poller();
		}
		else {
			unloadLoader();
		}
		
	},
	/**
	 * @hide
	 * @parent utilities
	 * Gets a path
	 * @param {String} path
	 */
	getAbsolutePath: function( path ) {
		if ( /^\/\//.test(path) ){
			path = path.substr(2);
		}
		return path;
	},
	/**
	 * @parent utilities
	 * @property {window} FuncUnit.win F.win()
	 * Use this to refer to the window of the application page.
	 * @codestart
	 *F(F.window).innerWidth(function(w){
	 *   ok(w > 1000, "window is more than 1000 px wide")
	 * })
	 * @codeend
	 */
	win: window,
	// for feature detection
	support: {
		readystate: "readyState" in document
	},
	/**
	 * @parent utilities
     * @function FuncUnit.eval F.eval()
     * @signature `eval(str)`
     *
	 * Used to evaluate code in the application page.
	 * @param {String} str the code to evaluate
	 * @return {Object} the result of the evaluated code
	 */
	eval: function(str){
		return FuncUnit.win.eval(str)
	},
	// return true if document is currently loaded, false if its loading
	// actions check this
	documentLoaded: function(){
		var loaded = FuncUnit.win.document.readyState === "complete" && 
				     FuncUnit.win.location.href != "about:blank" &&
				     FuncUnit.win.document.body;
		return loaded;
	},
	// return true if new document found
	checkForNewDocument: function(){
		var documentFound = false;

		// right after setting a new hash and reloading, IE barfs on this occassionally (only the first time)
		try {
			documentFound = ((FuncUnit.win.document !== currentDocument && // new document 
							!FuncUnit.win.___FUNCUNIT_OPENED) // hasn't already been marked loaded
							// covers opera case after you click a link, since document doesn't change in opera
							|| (currentHref != FuncUnit.win.location.href)) && // url is different 
							FuncUnit.documentLoaded(); // fully loaded
		} catch(e){}
		if(documentFound){
			// reset flags
			lookingForNewDocument = false;
			currentDocument = FuncUnit.win.document;
			currentHref = FuncUnit.win.location.href;
			
			// mark it as opened
			FuncUnit.win.___FUNCUNIT_OPENED = true;
			// reset confirm, prompt, alert
			FuncUnit._opened();
		}
		
		return documentFound;
	}
});

	//don't do any of this if in rhino
	if (navigator.userAgent.match(/Rhino/)) {
		return;	
	}
	
	
	var newPage = true, 
		hasSteal = false,
		unloadLoader, 
		loadSuccess, 
		firstLoad = true,
		onload = function(){
			FuncUnit.win.document.documentElement.tabIndex = 0;
			setTimeout(function(){
				FuncUnit.win.focus();
				var ls = loadSuccess
				loadSuccess = null;
				if (ls) {
					ls();
				}
			}, 0);
			Syn.unbind(FuncUnit.win, "load", onload);
		},
		onunload = function(){
			FuncUnit.stop = true;
			removeListeners();
			setTimeout(unloadLoader, 0)
			
		},
		removeListeners = function(){
			Syn.unbind(FuncUnit.win, "unload", onunload);
			Syn.unbind(FuncUnit.win, "load", onload);
		}
	unloadLoader = function(){
		if(!firstLoad) // dont remove the first run, fixes issue in FF 3.6
			removeListeners();
		
		Syn.bind(FuncUnit.win, "load", onload);
		
		//listen for unload to re-attach
		Syn.bind(FuncUnit.win, "unload", onunload)
	}
	
	//check for window location change, documentChange, then readyState complete -> fire load if you have one
	var newDocument = false, 
		poller = function(){
			var ls;
			
			if (lookingForNewDocument && FuncUnit.checkForNewDocument() ) {
				
				ls = loadSuccess;
				
				loadSuccess = null;
				if (ls) {
					FuncUnit.win.focus();
					FuncUnit.win.document.documentElement.tabIndex = 0;
					
					ls();
				}
			}
			
		setTimeout(arguments.callee, 500)
	}

	// All browsers except Opera close the app window on a reload.  This is to fix the case the URL to be opened 
	// has a hash.  In this case, window.open doesn't cause a reload if you reuse an existing popup, so we need to close.
	$(window).unload(function(){
		if(FuncUnit.win && FuncUnit.win !== window.top) {
			FuncUnit.win.close();
		}
	});

	return FuncUnit;
})(__m10, __m9);

// ## browser/actions.js
var __m18 = (function($, FuncUnit, Syn) {
	window.Syn = Syn;
	/**
	 * @add FuncUnit
	 */
	var clicks = [
	// methods
	/**
     *
	 * @function FuncUnit.prototype.click .click()
     * @parent actions
     * @signature `click(options [,success])`
     *
	 * Clicks an element.  This uses [Syn.prototype.click] to issue a:
	 * <ul>
	 * 	<li><code>mousedown</code></li>
	 *  <li><code>focus</code> - if the element is focusable</li>
	 *  <li><code>mouseup</code></li>
	 *  <li><code>click</code></li>
	 * </ul>
	 * If no clientX/Y or pageX/Y is provided as options, the click happens at the 
	 * center of the element.
	 * <p>For a right click or double click use [FuncUnit.prototype.rightClick] or
	 *   [FuncUnit.prototype.dblclick].</p>
	 * <h3>Example</h3>
	 * @codestart
	 * //clicks the bar element
	 *F("#bar").click()
	 * @codeend
	 * @param {Object} [options] options to pass to the click event.  Typically, this is clientX/Y or pageX/Y:
	 * @codestart
	 * $('#foo').click({pageX: 200, pageY: 100});
	 * @codeend
	 * You can pass it any of the serializable parameters you'd send to 
	 * [http://developer.mozilla.org/en/DOM/event.initMouseEvent initMouseEvent], but command keys are 
	 * controlled by [FuncUnit.prototype.type].
     *
	 * @param {Function} [success] a callback that runs after the click, but before the next action.
	 * @return {funcUnit} returns the funcunit object for chaining.
	 */
	'click',
	/**
     * @function FuncUnit.prototype.dblclick .dblclick()
     * @parent actions
     * @signature `dblclick(options [,success])`
     *
	 * Double clicks an element by [FuncUnit.prototype.click clicking] it twice and triggering a dblclick event.
	 * @param {Object} options options to add to the mouse events.  This works
	 * the same as [FuncUnit.prototype.click]'s options.
	 * @param {Function} [success] a callback that runs after the double click, but before the next action.
	 * @return {funcUnit} returns the funcunit object for chaining.
	 */
	'dblclick',
	/**
     * @function FuncUnit.prototype.rightClick .rightClick()
     * @parent actions
     * @signature `rightClick(options [,success])`
	 * Right clicks an element.  This typically results in a contextmenu event for browsers that
	 * support it.
	 * @param {Object} options options to add to the mouse events.  This works
	 * the same as [FuncUnit.prototype.click]'s options.
	 * @param {Function} [success] a callback that runs after the click, but before the next action.
	 * @return {funcUnit} returns the funcunit object for chaining.
	 */
	'rightClick'],
		makeClick = function(name){
			FuncUnit.prototype[name] = function(options, success){
				this._addExists();
				if(typeof options == 'function'){
					success = options;
					options = {};
				}
				var selector = this.selector;
				FuncUnit.add({
					method: function(success, error){
						options = options || {};
						Syn("_" + name, options, this.bind[0],success);
					},
					success: success,
					error: "Could not " + name + " '" + this.selector+"'",
					bind: this,
					type: "action"
				});
				return this;
			}
		}
	
	for(var i=0; i < clicks.length; i++){
		makeClick(clicks[i])
	}
	
	$.extend(FuncUnit.prototype, {
		// perform check even if last queued item is a wait beacuse certain waits don't guarantee the element is visible (like text)
		_addExists: function(){
			this.exists(false);
		},
		/**
         * @function FuncUnit.prototype.type .type()
         * @parent actions
         * @signature `type(text [,success])`
         *
		 * Types text into an element.  This makes use of [Syn.type] and works in 
		 * a very similar way.
		 * <h3>Quick Examples</h3>
		 * @codestart
		 * //types hello world
		 *F('#bar').type('hello world')
		 * 
		 * //submits a form by typing \r
		 *F("input[name=age]").type("27\r")
		 * 
		 * //types FuncUnit, then deletes the Unit
		 *F('#foo').type("FuncUnit\b\b\b\b")
		 * 
		 * //types JavaScriptMVC, then removes the MVC
		 *F('#zar').type("JavaScriptMVC[left][left][left]"+
		 *                      "[delete][delete][delete]")
		 *          
		 * //types JavaScriptMVC, then selects the MVC and
		 * //deletes it
		 *F('#zar').type("JavaScriptMVC[shift]"+
		 *                "[left][left][left]"+
		 *                "[shift-up][delete]")
		 * @codeend
		 *
		 * <h2>Characters</h2>
		 * 
		 * For a list of the characters you can type, check [Syn.keycodes].
		 * 
		 * @param {String} text the text you want to type
		 * @param {Function} [success] a callback that is run after typing, but before the next action.
		 * @return {FuncUnit} returns the funcUnit object for chaining.
		 */
		type: function( text, success ) {
			this._addExists();
			// when you type in something you have to click on it first
			this.click();
			var selector = this.selector;
			// type("") is a shortcut for clearing out a text input
			if(text === ""){
				text = "[ctrl]a[ctrl-up]\b"
			}
			FuncUnit.add({
				method : function(success, error){
					Syn("_type", text, this.bind[0], success);
					
				},
				success : success,
				error : "Could not type " + text + " into " + this.selector,
				bind : this,
				type: "action"
			});
			return this;
		},
    // TODO (DL) this needs to be deprecated this advertises .trigger() functionality
    // but expects that the target page will have jQuery which could not be the case.
		trigger: function(evName, success){
			this._addExists();
			FuncUnit.add({
				method : function(success, error){
					// need to use the page's jquery to trigger events
          if(!FuncUnit.win.jQuery) {
            throw 'Can not trigger custom event, no jQuery found on target page.';
          }
					FuncUnit.win.jQuery(this.bind.selector).trigger(evName)
					success()
				},
				success : success,
				error : "Could not trigger " + evName,
				bind : this,
				type: "action"
			});
			return this;
		},
		/**
         * @function FuncUnit.prototype.drag .drag()
         * @parent actions
         * @signature `drag(options [,success])`
		 * Drags an element into another element or coordinates.  
		 * This takes the same paramameters as [Syn.prototype.move move].
		 * @param {String|Object} options A selector or coordinates describing the motion of the drag.
		 * <h5>Options as a Selector</h5>
		 * Passing a string selector to drag the mouse.  The drag runs to the center of the element
		 * matched by the selector.  The following drags from the center of #foo to the center of #bar.
		 * @codestart
		 *F('#foo').drag('#bar') 
		 * @codeend
		 * <h5>Options as Coordinates</h5>
		 * You can pass in coordinates as clientX and clientY:
		 * @codestart
		 *F('#foo').drag('100x200') 
		 * @codeend
		 * Or as pageX and pageY
		 * @codestart
		 *F('#foo').drag('100X200') 
		 * @codeend
		 * Or relative to the start position
		 *F('#foo').drag('+10 +20')
		 * <h5>Options as an Object</h5>
		 * You can configure the duration, start, and end point of a drag by passing in a json object.
		 * @codestart
		 * //drags from 0x0 to 100x100 in 2 seconds
		 *F('#foo').drag({
		 *   from: "0x0",
		 *   to: "100x100",
		 *   duration: 2000
		 * }) 
		 * @codeend
		 * @param {Function} [success] a callback that runs after the drag, but before the next action.
		 * @return {funcUnit} returns the funcunit object for chaining.
		 */
		drag: function( options, success ) {
			this._addExists();
			if(typeof options == 'string'){
				options = {to: options}
			}
			options.from = this.selector;
	
			var selector = this.selector;
			FuncUnit.add({
				method: function(success, error){
					Syn("_drag", options, this.bind[0],success);
				},
				success: success,
				error: "Could not drag " + this.selector,
				bind: this,
				type: "action"
			})
			return this;
		},
		/**
         * @function FuncUnit.prototype.move .move()
         * @parent actions
         * @signature `move(options [,success])`
		 * Moves an element into another element or coordinates.  This will trigger mouseover
		 * mouseouts accordingly.
		 * This takes the same paramameters as [Syn.prototype.move move].
		 * @param {String|Object} options A selector or coordinates describing the motion of the move.
		 * <h5>Options as a Selector</h5>
		 * Passing a string selector to move the mouse.  The move runs to the center of the element
		 * matched by the selector.  The following moves from the center of #foo to the center of #bar.
		 * @codestart
		 *F('#foo').move('#bar') 
		 * @codeend
		 * <h5>Options as Coordinates</h5>
		 * You can pass in coordinates as clientX and clientY:
		 * @codestart
		 *F('#foo').move('100x200') 
		 * @codeend
		 * Or as pageX and pageY
		 * @codestart
		 *F('#foo').move('100X200') 
		 * @codeend
		 * Or relative to the start position
		 *F('#foo').move('+10 +20')
		 * <h5>Options as an Object</h5>
		 * You can configure the duration, start, and end point of a move by passing in a json object.
		 * @codestart
		 * //drags from 0x0 to 100x100 in 2 seconds
		 *F('#foo').move({
		 *   from: "0x0",
		 *   to: "100x100",
		 *   duration: 2000
		 * }) 
		 * @codeend
		 * @param {Function} [success] a callback that runs after the drag, but before the next action.
		 * @return {funcUnit} returns the funcunit object for chaining.
		 */
		move: function( options, success ) {
			this._addExists();
			if(typeof options == 'string'){
				options = {to: options}
			}
			options.from = this.selector;
	
			var selector = this.selector;
			FuncUnit.add({
				method: function(success, error){
					Syn("_move", options, this.bind[0], success);
				},
				success: success,
				error: "Could not move " + this.selector,
				bind: this,
				type: "action"
			});
			return this;
		},
		/**
         * @function FuncUnit.prototype.scroll .scroll()
         * @parent actions
         * @signature `scroll(direction, amount, success)`
		 * Scrolls an element in a particular direction by setting the scrollTop or srollLeft.
		 * @param {String} direction "left" or "top"
		 * @param {Number} amount number of pixels to scroll
		 * @param {Function} success
		 */
		scroll: function( direction, amount, success ) {
			this._addExists();
			var selector = this.selector,
				direction;
			if (direction == "left" || direction == "right") {
				direction = "Left";
			} else if (direction == "top" || direction == "bottom") {
				direction = "Top";
			}
			FuncUnit.add({
				method: function(success, error){
					this.bind.each(function(i, el){
						this["scroll" + direction] = amount;
					})
					success();
				},
				success: success,
				error: "Could not scroll " + this.selector,
				bind: this,
				type: "action"
			});
			return this;
		}
	})
	return FuncUnit;
})(__m10, __m9, __m2);

// ## browser/getters.js
var __m19 = (function($, FuncUnit) {
	
	/**
	 * @add FuncUnit
	 */
	//list of jQuery functions we want, number is argument index
	//for wait instead of getting value
	FuncUnit.funcs = {
	// methods
	/**
     * @function FuncUnit.prototype.size .size()
     * @parent dimensions
     * @signature `size([size] [,timeout] [,success] [,message])`
	 * Gets the number of elements matched by the selector or
	 * waits until the the selector is size.  You can also 
	 * provide a function that continues to the next action when
	 * it returns true.
	 * @codestart
	 *F(".recipe").size() //gets the number of recipes
	 * 
	 *F(".recipe").size(2) //waits until there are 2 recipes
	 * 
	 * //waits until size is count
	 *F(".recipe").size(function(size){
	 *   return size == count;
	 * })
	 * @codeend
	 * @param {Number|Function} [size] number or a checking function.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {Number} if the size parameter is not provided, size returns the number
	 * of elements matched.
	 */
	'size' : 0,
	/**
     * @function FuncUnit.prototype.attr .attr()
     * @parent manipulation
     * @signature `attr(data, value [,timeout] [,success] [,message])`
	 * Gets the value of an attribute from an element or waits until the attribute
	 * equals the attr param.
	 * @codestart
	 * //waits until the abc attribute == some
	 *F("#something").attr("abc","some") 
	 * @codeend
	 * @param {String} data The attribute to get, or wait for.
	 * @param {String|Function} value If provided uses this as a check before continuing to the next action
     *
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {Object} if the attr parameter is not provided, returns
	 * the attribute.
	 */
	'attr' : 1, 
	/**
     * @function FuncUnit.prototype.hasClass .hasClass()
     * @parent css
     * @signature `hasClass(className [,value] [,timeout] [,success] [,message])`
	 * @codestart
	 * //returns if the element has the class in its className
	 *F("#something").hasClass("selected");
	 *
	 * //waits until #something has selected in its className
	 *F("#something").hasClass("selected",true);
	 * 
	 * //waits until #something does not have selected in its className
	 *F("#something").hasClass("selected",false);
	 * @codeend
	 * @param {String} className The part of the className to search for.
	 * @param {Boolean|Function} [value] If provided uses this as a check before continuing to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {Boolean|funcUnit} if the value parameter is not provided, returns
	 * if the className is found in the element's className.  If a value paramters is provided, returns funcUnit for chaining.
	 */
	'hasClass' : 1, //makes wait
	/**
     * @function FuncUnit.prototype.html .html()
     * @parent manipulation
     * @signature `html([html] [,timeout] [,success] [,message])`
	 * Gets the [http://api.jquery.com/html/ html] from an element or waits until the html is a certain value.
	 * @codestart
	 * //checks foo's html has "JupiterJS"
	 * ok( /JupiterJS/.test(F('#foo').html() ) )
	 * 
	 * //waits until foo's html has JupiterJS
	 *F('#foo').html(/JupiterJS/)
	 * 
	 * //waits until foo's html is JupiterJS
	 *F('#foo').html("JupiterJS")
	 * @codeend
	 * 
	 * @param {String|Function} [html] If provided uses this as a check before continuing to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if the html parameter is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
	 */
	'html' : 0, 
	/**
     * @function FuncUnit.prototype.text .text()
     * @parent manipulation
     * @signature `text([text] [,timeout] [,success] [,message])`
	 * Gets the [http://api.jquery.com/text/ text] from an element or waits until the text is a certain value.
	 * @codestart
	 * //checks foo's text has "JupiterJS"
	 * ok( /JupiterJS/.test(F('#foo').text() ) )
	 * 
	 * //waits until bar's text has JupiterJS
	 *F('#foo').text(/JupiterJS/)
	 * 
	 * //waits until bar's text is JupiterJS
	 *F('#foo').text("JupiterJS")
	 * @codeend
	 * 
	 * @param {String|Function} [text] If provided uses this as a check before continuing to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if the text parameter is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
	 */
	'text' : 0, 
	/**
     * @function FuncUnit.prototype.val .val()
     * @parent manipulation
     * @signature `val([val] [,timeout] [,success] [,message])`
	 * Gets the [http://api.jquery.com/val/ val] from an element or waits until the val is a certain value.
	 * @codestart
	 * //checks foo's val has "JupiterJS"
	 * ok( /JupiterJS/.test(F('input#foo').val() ) )
	 * 
	 * //waits until bar's val has JupiterJS
	 *F('input#foo').val(/JupiterJS/)
	 * 
	 * //waits until bar's val is JupiterJS
	 *F('input#foo').val("JupiterJS")
	 * @codeend
	 * 
	 * @param {String|Function} [val] If provided uses this as a check before continuing to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if the val parameter is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
	 */
	'val' : 0, 
	/**
     * @function FuncUnit.prototype.css .css()
     * @parent css
     * @signature `css(prop [,val] [,timeout] [,success] [,message])`
	 * Gets a [http://api.jquery.com/css/ css] property from an element or waits until the property is 
	 * a specified value.
	 * @codestart
	 * // gets the color
	 *F("#foo").css("color")
	 * 
	 * // waits until the color is red
	 *F("#foo").css("color","red") 
	 * @codeend
	 * 
	 * @param {String} prop A css property to get or wait until it is a specified value.
	 * @param {String|Function} [val] If provided uses this as a check before continuing to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if the val parameter is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the css of the selector.
	 */
	'css': 1, 
	'prop': 1, 
	/**
     * @function FuncUnit.prototype.offset .offset()
     * @parent dimensions
     * @signature `offset([offset] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/offset/ offset] or waits until 
	 * the offset is a specified value.
	 * @codestart
	 * // gets the offset
	 *F("#foo").offset();
	 * 
	 * // waits until the offset is 100, 200
	 *F("#foo").offset({top: 100, left: 200}) 
	 * @codeend
	 * 
	 * @param {Object|Function} [offset] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if the offset parameter is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the css of the selector.
	 */
	'offset' : 0,
	/**
     * @function FuncUnit.prototype.position .position()
     * @parent dimensions
     * @signature `position([position] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/position/ position] or waits until 
	 * the position is a specified value.
	 * @codestart
	 * // gets the position
	 *F("#foo").position();
	 * 
	 * // waits until the position is 100, 200
	 *F("#foo").position({top: 100, left: 200}) 
	 * @codeend
	 * 
	 * @param {Object|Function} [position] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if the position parameter is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the offset of the selector.
	 */
	'position' : 0,
	/**
     * @function FuncUnit.prototype.scrollTop .scrollTop()
     * @parent dimensions
     * @signature `scrollTop([scrollTop] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/scrollTop/ scrollTop] or waits until 
	 * it equals a specified value.
	 * @codestart
	 * // gets the scrollTop
	 *F("#foo").scrollTop();
	 * 
	 * // waits until the scrollTop is 100
	 *F("#foo").scrollTop(100) 
	 * @codeend
	 * 
	 * @param {Number|Function} [scrollTop] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if scrollTop is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the scrollTop of the selector.
	 */ 
	'scrollTop' : 0, 
	/**
     * @function FuncUnit.prototype.scrollLeft .scrollLeft()
     * @parent dimensions
     * @signature `scrollLeft([scrollLeft] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/scrollLeft/ scrollLeft] or waits until 
	 * it equals a specified value.
	 * @codestart
	 * // gets the scrollLeft
	 *F("#foo").scrollLeft();
	 * 
	 * // waits until the scrollLeft is 100
	 *F("#foo").scrollLeft(100) 
	 * @codeend
	 * 
	 * @param {Number|Function} [scrollLeft] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if scrollLeft is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the scrollLeft of the selector.
	 */ 
	'scrollLeft' : 0, 
	/**
     * @function FuncUnit.prototype.height .height()
     * @parent dimensions
     * @signature `height([height] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/height/ height] or waits until 
	 * it equals a specified value.
	 * @codestart
	 * // gets the height
	 *F("#foo").height();
	 * 
	 * // waits until the height is 100
	 *F("#foo").height(100) 
	 * @codeend
	 * 
	 * @param {Number|Function} [height] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if height is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the height of the selector.
	 */
	'height' : 0, 
	/**
     * @function FuncUnit.prototype.width .width()
     * @parent dimensions
     * @signature `width([width] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/width/ width] or waits until 
	 * it equals a specified value.
	 * @codestart
	 * // gets the width
	 *F("#foo").width();
	 * 
	 * // waits until the width is 100
	 *F("#foo").width(100) 
	 * @codeend
	 * 
	 * @param {Number|Function} [width] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if width is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the width of the selector.
	 */
	'width' : 0, 
	/**
     * @function FuncUnit.prototype.innerHeight .innerHeight()
     * @parent dimensions
     * @signature `innerHeight([innerHeight] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/innerHeight/ innerHeight] or waits until 
	 * it equals a specified value.
	 * @codestart
	 * // gets the innerHeight
	 *F("#foo").innerHeight();
	 * 
	 * // waits until the innerHeight is 100
	 *F("#foo").innerHeight(100) 
	 * @codeend
	 * 
	 * @param {Number|Function} [innerHeight] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if innerHeight is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the innerHeight of the selector.
	 */
	'innerHeight' : 0, 
	/**
     * @function FuncUnit.prototype.innerWidth .innerWidth()
     * @parent dimensions
     * @signature `innerWidth([innerWidth] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/innerWidth/ innerWidth] or waits until 
	 * it equals a specified value.
	 * @codestart
	 * // gets the innerWidth
	 *F("#foo").innerWidth();
	 * 
	 * // waits until the innerWidth is 100
	 *F("#foo").innerWidth(100) 
	 * @codeend
	 * 
	 * @param {Number|Function} [innerWidth] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if innerWidth is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the innerWidth of the selector.
	 */
	'innerWidth' : 0, 
	/**
     * @function FuncUnit.prototype.outerHeight .outerHeight()
     * @parent dimensions
     * @signature `outerHeight([outerHeight] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/outerHeight/ outerHeight] or waits until 
	 * it equals a specified value.
	 * @codestart
	 * // gets the outerHeight
	 *F("#foo").outerHeight();
	 * 
	 * // waits until the outerHeight is 100
	 *F("#foo").outerHeight(100) 
	 * @codeend
	 * 
	 * @param {Number|Function} [outerHeight] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if outerHeight is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the outerHeight of the selector.
	 */
	'outerHeight' : 0, 
	/**
     * @function FuncUnit.prototype.outerWidth .outerWidth()
     * @parent dimensions
     * @signature `outerWidth([outerWidth] [,timeout] [,success] [,message])`
	 * Gets an element's [http://api.jquery.com/outerWidth/ outerWidth] or waits until 
	 * it equals a specified value.
	 * @codestart
	 * // gets the outerWidth
	 *F("#foo").outerWidth();
	 * 
	 * // waits until the outerWidth is 100
	 *F("#foo").outerWidth(100) 
	 * @codeend
	 * 
	 * @param {Number|Function} [outerWidth] If provided uses this as a check before continuing to the next action.  Or you can 
	 * provide a function that returns true to continue to the next action.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {String|funcUnit} if outerWidth is provided, 
	 * returns the funcUnit selector for chaining, otherwise returns the outerWidth of the selector.
	 */
	'outerWidth' : 0}
	
	
	//makes a jQuery like command.
	FuncUnit.makeFunc = function(fname, argIndex){
		var orig = FuncUnit.fn[fname];
		//makes a read / wait function
		FuncUnit.prototype[fname] = function(){
			//assume last arg is success
			var args = FuncUnit.makeArray(arguments), 
				isWait = args.length > argIndex,
				success,
				self = this;
			
			args.unshift(this.selector,this.frame,fname)
			if(isWait){
				//get the args greater and equal to argIndex
				var tester = args[argIndex+3],
					timeout = args[argIndex+4],
					success = args[argIndex+5],
					message = args[argIndex+6],
					testVal = tester,
					errorMessage = "waiting for "+fname +" on " + this.selector,
					frame = this.frame,
					logMessage = "Checking "+fname+" on '"+this.selector+"'",
					ret;
				
				// can pass in an object or list of arguments
				if(typeof tester == 'object' && !(tester instanceof RegExp)){
					timeout = tester.timeout;
					success = tester.success;
					message = tester.message;
					if(tester.errorMessage){
						errorMessage = tester.errorMessage
					}
					if(typeof tester.logMessage !== "undefined"){
						logMessage = tester.logMessage
					}
					tester = tester.condition;
				}
				if(typeof timeout == 'function'){
					message = success;
					success = timeout;
					timeout = undefined;
				}
				if(typeof timeout == 'string'){
					message = timeout;
					timeout = undefined;
					success = undefined;
				}
				if(typeof message !== 'string'){
					message = undefined;
				}
				args.splice(argIndex+3, args.length- argIndex - 3);
				
				if(typeof tester != 'function'){
					errorMessage += " !== "+testVal
					tester = function(val){
						return FuncUnit.unit.equiv(val, testVal) || 
							(testVal instanceof RegExp && testVal.test(val) );
					}
				}
				if(message){
					errorMessage = message;
				}
				FuncUnit.repeat({
					method : function(print){
						// keep getting new collection because the page might be updating, we need to keep re-checking
						if(this.bind.prevObject && this.bind.prevTraverser){
							var prev = this.bind;
							this.bind = this.bind.prevObject[this.bind.prevTraverser](this.bind.prevTraverserSelector)
							this.bind.prevTraverser = prev.prevTraverser;
							this.bind.prevTraverserSelector = prev.prevTraverserSelector;
						} else {
							// pass false so it will only do one synchronous request
							this.bind =F(this.selector, {
								frame: frame, 
								forceSync: true
							})
						}
						if(logMessage){
							print(logMessage)
						}
						var methodArgs = [];
						// might need an argument
						if(argIndex > 0){
							methodArgs.push(args[3]);
						}
						// lazy flag to ignore the getter error below
						FuncUnit._ignoreGetterError = true;
						ret = this.bind[fname].apply(this.bind, methodArgs)
						FuncUnit._ignoreGetterError = false;
						
						var passed = tester.call(this.bind, ret);
						
						// unless this is a "size" command, require size to be non-zero (don't pass through if there's no elements)
						if(this.bind.length === 0 && fname !== "size"){
							passed = false;
						}
						
						if(passed){
							// if document is still loading
							if(!FuncUnit.documentLoaded()){
								passed = false;
							} else {
								// after every successful wait, check for a new document (if someone clicked a link), 
								// and overwrite alert/confirm/prompt
								// TODO this creates a potential race if a new document is loaded but its steal isn't ready...should poll
								FuncUnit.checkForNewDocument();
							}
						}
						return passed;
					},
					success : function(){
						if(message){
							FuncUnit.unit.assertOK(true, message)
						}
						success && success.apply(this, arguments);
					},
					error : function(){
						var msg = errorMessage;
						if(ret){
							msg += ", actual value: "+ret;
						}
						FuncUnit.unit.assertOK(false, msg);
					},
					timeout : timeout,
					bind: this,
					type: "wait"
				})
				return this;
			}else{
				// throw a warning if user tries to use a getter after the start of the test (if there are other async methods)
				if(!FuncUnit._ignoreGetterError && !FuncUnit._incallback && FuncUnit._haveAsyncQueries()){
					console && console.error("You can't run getters after actions and waits. Please put your getters in a callback or at the beginning of the test.")
				}
				// just call the original jQ method
				var methodArgs = [];
				if(argIndex > 0){
					methodArgs.push(args[3]);
				}
				return orig.apply(this, methodArgs);
			}
		}
	}
	
	for (var prop in FuncUnit.funcs) {
		FuncUnit.makeFunc(prop, FuncUnit.funcs[prop]);
	}

	return FuncUnit;
})(__m10, __m9);

// ## browser/traversers.js
var __m20 = (function($, FuncUnit){

/**
 * @add FuncUnit
 */
// prototype
//do traversers
var traversers = [
	/**
     * @function FuncUnit.prototype.closest .closest()
     * @parent traversal
     * @signature `closest()`
	 * Asynchronous version of jQuery's closest.  Performs the exact same functionality as the jQuery method 
	 * but adds itself to the queue.
	 * 
	 * @codestart
	 * // after the click, filter the collection, then wait for result to be visible
	 *F(".foo").click().closest(".bar").visible();
	 * @codeend
     * @param {string} selector
	 */
	"closest",
	/**
	 * @function FuncUnit.prototype.next .next()
     * @parent traversal
     * @signature `next()`
	 * Asynchronous version of next. Performs the exact same functionality as the jQuery method 
	 * but adds itself to the queue.
	 * 
	 * @codestart
	 * // after the click, filter the collection, then wait for result to be visible
	 *F(".foo").click().next().visible();
	 * @codeend
	 */
	"next",
	/**
     * @function FuncUnit.prototype.prev .prev()
     * @parent traversal
     * @signature `prev()`
	 * Asynchronous version of prev. Performs the exact same functionality as the jQuery method 
	 * but adds itself to the queue.
	 * 
	 * @codestart
	 * // after the click, filter the collection, then wait for result to be visible
	 *F(".foo").click().prev().visible();
	 * @codeend
	 */
	"prev",
	/**
     * @function FuncUnit.prototype.siblings .siblings()
     * @parent traversal
     * @signature `siblings()`
	 * Asynchronous version of siblings. Performs the exact same functionality as the jQuery method 
	 * but adds itself to the queue.
	 * 
	 * @codestart
	 * // after the click, filter the collection, then wait for result to be visible
	 *F(".foo").click().siblings().visible();
	 * @codeend
	 */
	"siblings",
	/**
     * @function FuncUnit.prototype.last .last()
     * @parent traversal
     * @signature `last()`
	 * Asynchronous version of last. Performs the exact same functionality as the jQuery method 
	 * but adds itself to the queue.
	 * 
	 * @codestart
	 * // after the click, filter the collection, then wait for result to be visible
	 *F(".foo").click().last().visible();
	 * @codeend
	 */
	"last",
	/**
     * @function FuncUnit.prototype.first .first()
     * @parent traversal
     * @signature `first()`
	 * Asynchronous version of first. Performs the exact same functionality as the jQuery method 
	 * but adds itself to the queue.
	 * 
	 * @codestart
	 * // after the click, filter the collection, then wait for result to be visible
	 *F(".foo").click().first().visible();
	 * @codeend
	 */
	"first", 
	/**
     * @function FuncUnit.prototype.find .find()
     * @parent traversal
     * @signature `find()`
	 * Asynchronous version of find. Performs the exact same functionality as the jQuery method 
	 * but adds itself to the queue.
	 * 
	 * @codestart
	 * // after the click, filter the collection, then wait for result to be visible
	 *F(".foo").click().find(".bar").visible();
	 * @codeend
     * @param {string} selector
	 */
	"find"
],
	makeTraverser = function(name){
		var orig = FuncUnit.prototype[name];
		FuncUnit.prototype[name] = function(selector){
			var args = arguments;
			// find is called (with "this" as document) from FuncUnit.fn.init, so in this case don't queue it up, just run the regular find
			if (FuncUnit.win && this[0] && this[0].parentNode && this[0].parentNode.nodeType !== 9) { // document nodes are 9
				FuncUnit.add({
					method: function(success, error){
						// adjust the collection by using the real traverser method
						var newBind = orig.apply(this.bind, args);
						newBind.prevTraverser = name;
						newBind.prevTraverserSelector = selector;
						success(newBind)
					},
					error: "Could not traverse: " + name + " " + selector,
					bind: this
				});
			}
			return orig.apply(this, arguments);
		}
	};
for(var i  =0; i < traversers.length; i++){
	makeTraverser(traversers[i]);
}

return FuncUnit;
})(__m10, __m9);

// ## browser/queue.js
var __m21 = (function(FuncUnit) {
	/**
	 * @add FuncUnit
	 */
	/**
	 * True when we are in a callback function (something we pass to a FuncUnit plugin).
	 */
	FuncUnit._incallback = false;
	//where we should add things in a callback
	var currentPosition = 0,
		startedQueue = false;

	/**
     * @property FuncUnit.speed F.speed()
     * @parent utilities
	 * A global speed setting for actions. Defaults to 0 milliseconds.
	 */
	FuncUnit.speed = 0;
	/**
     * @property FuncUnit.timeout F.timeout()
     * @parent utilities
	 * A global timeout value for wait commands.  Defaults to 10 seconds.
	 */
	FuncUnit.timeout = 10000;
	/**
	 * @hide
	 * @property FuncUnit._queue _queue
   * @parent utilities
	 * A queue of methods.  Each method in the queue are run in order.  After the method is complete, it 
	 * calls FuncUnit._done, which pops the next method off the queue and runs it.
	 */
	FuncUnit._queue = [];
	/**
	 * @hide
	 * Logic that determines if this next query needs to be sync, or if we can optimize it.
	 * Returns false if there are actual actions in the queue, returns true if the only queued methods are 
	 * S methods. If the only method is an S query, remove it from the queue.
	 */
	FuncUnit._needSyncQuery = function(){
		// if only method is query, need sync
		if(FuncUnit._queue.length === 1){
			if(FuncUnit._queue[0].type === "query"){
				FuncUnit._queue = [];
				return true;
			}
		}
		// if empty queue, need sync
		if(FuncUnit._queue.length === 0){
			return true;
		}
		return false
	}
	/**
	 * @hide
	 * Return last item in the queue.
	 */
	FuncUnit._lastQueuedItem = function(){
		if(!FuncUnit._queue.length){
			return null;
		}
		return FuncUnit._queue[FuncUnit._queue.length-1];
	}
	/**
	 * @hide
	 * Return true if there are already async methods queued.  If true, getters need throw errors.
	 */
	FuncUnit._haveAsyncQueries = function(){
		for(var i=0; i < FuncUnit._queue.length; i++){
			if(FuncUnit._queue[i].type === "action" || FuncUnit._queue[i].type === "wait")
				return true;
		}
		return false;
	}
	FuncUnit.
	/**
     * @parent utilities
     * @function FuncUnit.add F.add()
     * @signature `add(handler[, error][, context])`
	 * Adds a function to the queue.
	 * @param {Object|Function} handler An object or function to define a step in the queue
	 * <h5>Handler as an Object</h5>
	 * An object that contains the method to run along with other properties:

 - method : the method to be called.  It will be provided a success and error function to call
 - success : an optional callback to be called after the function is done
 - error : an error message if the command fails
 - timeout : the time until success should be called
 - bind : an object that will be 'this' of the success
 - type: the type of method (optional)

	 * <h5>Handler as a Function</h5>
	 * Similar to an Object, however the handler passed acts as the success function
	 * @param {String} error An optional error message if handler is passed as a function
	 * @param {Object} context An optional object to specify "this" inside handler. Enabled if handler is passed as a function

	 */
	add = function(handler, error, context) {
		if(handler instanceof Function) {
			if(typeof error === 'object') {
				context = error;
				delete error;
			}

			error = (error && error.toString()) || 'Custom method has failed.';
			var cb = handler;

			handler = {
				method: function(success, error) {
					success();
				},
				success: cb,
				error: error,
				bind: context
			};
		}

		//if we are in a callback, add to the current position
		if (FuncUnit._incallback) {
			FuncUnit._queue.splice(currentPosition, 0, handler);
			currentPosition++;
		}
		else {
			//add to the end
			FuncUnit._queue.push(handler);
		}
		//if our queue has just started, stop qunit
		//call done to call the next command
		if (FuncUnit._queue.length == 1 && ! FuncUnit._incallback) {
			FuncUnit.unit.pauseTest();
			setTimeout(FuncUnit._done, 13)
		}
	}
	var currentEl;
	/**
     * @hide
     * @parent utilities
     * @function FuncUnit._done _done
     * @signature `_done(handler)`
     *
	 * Every queued method calls this when its complete.  It gets the next function from the queue and calls it.
	 * @param {Object} el the current jQuery collection
	 * @param {Object} selector
	 */
	FuncUnit._done = function(el, selector){
		var next, 
			timer,
			speed = FuncUnit.speed || 0;

		// TODO: we need to clarify the easing api
		if(FuncUnit.speed === 'slow'){
			speed = 500;
		}
		if (FuncUnit._queue.length > 0) {
			next = FuncUnit._queue.shift();
			currentPosition = 0;
			// set a timer that will error
			
			//call next method
			setTimeout(function(){
				timer = setTimeout(function(){
						next.stop && next.stop();
						if(typeof next.error === "function"){
							next.error();
						} else {
							FuncUnit.unit.assertOK(false, next.error);
						}
						FuncUnit._done();
					}, 
					(next.timeout || FuncUnit.timeout) + speed)
				// if the last successful method had a collection, save it
				if(el && el.jquery){
					currentEl = el;
				}
				// make the new collection the last successful collection
				if(currentEl){
					next.bind = currentEl;
				}
				next.selector = selector;
				next.method(	//success
					function(el){
						if(el && el.jquery){
							next.bind = el;
						}
						//make sure we don't create an error
						clearTimeout(timer);
						
						//mark in callback so the next set of add get added to the front
						
						FuncUnit._incallback = true;
						if (next.success) {
							// callback's "this" is the collection
							next.success.apply(next.bind, arguments);
						}
						FuncUnit._incallback = false;
						
						
						FuncUnit._done(next.bind, next.selector);
					}, //error
					function(message){
						clearTimeout(timer);
						FuncUnit.unit.assertOK(false, message);
						FuncUnit._done();
					})
				
				
			}, speed);
			
		}
		else {
			FuncUnit.unit.resumeTest();
		}
	}

	return FuncUnit;
})(__m9);

// ## browser/waits.js
var __m22 = (function($, FuncUnit) {
/**
 * @add FuncUnit
 */
FuncUnit.
/**
 *
 * @function FuncUnit.wait F.wait()
 * @parent waits
 * @signature `wait(time, success)`
 * Waits a timeout before running the next command.  Wait is an action and gets 
 * added to the queue.
 * @codestart
 * F.wait(100, function(){
 *   equals(F('#foo').innerWidth(), 100, "innerWidth is 100");
 * })
 * @codeend
 * @param {Number} [time] The timeout in milliseconds.  Defaults to 5000.
 * @param {Function} [success] A callback that will run 
 * 		after the wait has completed, 
 * 		but before any more queued actions.
 */
wait = function(time, success){
	if(typeof time == 'function'){
		success = time;
		time = undefined;
	}
	time = time != null ? time : 5000
	FuncUnit.add({
		method : function(success, error){
			setTimeout(success, time)
		},
		success : success,
		error : "Couldn't wait!",
		timeout : time + 1000
	});
	return this;
}

FuncUnit.
/**
 * @function FuncUnit.branch F.branch()
 * @parent waits
 * @signature `branch(check1, success1, check2, success2)`
 * Uses 2 checker methods to see which success function to call.  This is a way to conditionally
 * run one method if you're unsure about the conditions of your page, without causing a test
 * failure.  For example, this is useful for login steps, if you're not sure whether the app
 * is logged in.
 *
 * @codestart
 *   F.branch(function(){
 *    	return (F("#exists").size() > 0);
 *    }, function(){
 *    	ok(true, "found exists")
 *    }, function(){
 *    	return (F("#notexists").size() > 0);
 *    }, function(){
 *    	ok(false, "found notexists")
 *    });
 * @codeend
 *
 * @param {Function} check1 a checker function that, if it returns true, causes success1 to be called
 * @param {Function} success1 a function that runs when check1 returns true
 * @param {Function} check2 a checker function that, if it returns true, causes success2 to be called
 * @param {Function} success2 a function that runs when check2 returns true
 * @param {Number} timeout if neither checker returns true before this timeout, the test fails
 */
branch = function(check1, success1, check2, success2, timeout){
	FuncUnit.repeat({
		method : function(print){
			print("Running a branch statement")
			if(check1()){
				success1();
				return true;
			}
			if(check2()){
				success2();
				return true;
			}
		},
		error : "no branch condition was ever true",
		timeout : timeout,
		type: "branch"
	})
}

/**
 *
 * @function FuncUnit.repeat F.repeat()
 * @parent waits
 * @signature `repeat()`
 * Takes a function that will be called over and over until it is successful.
 * method : function(){},
	success : success,
	error : errorMessage,
	timeout : timeout,
	bind: this
 */
FuncUnit.repeat = function(options){
	
	var interval,
		stopped = false	,
		stop = function(){
			clearTimeout(interval)
			stopped = true;
		};
	FuncUnit.add({
		method : function(success, error){
			options.bind = this.bind;
			options.selector = this.selector;
			var printed = false,
				print = function(msg){
					if(!printed){
						printed = true;
					}
				}
			interval = setTimeout(function(){
				var result = null;
				try {
					result = options.method(print)
				} 
				catch (e) {
					//should we throw this too error?
				}
				
				if (result) {
					success(options.bind);
				}else if(!stopped){
					interval = setTimeout(arguments.callee, 10)
				}
				
			}, 10);
			
			
		},
		success : options.success,
		error : options.error,
		timeout : options.timeout,
		stop : stop,
		bind : options.bind,
		type: options.type
	});
	
}


/**
 *
 * @function FuncUnit.animationEnd F.animationEnd()
 * @parent waits
 * @signature `animationEnd()`
 * Waits until all animations in the page have completed.  Only works
 * if the tested page has jQuery present.
 */
FuncUnit.animationEnd = function(){
F("body").wait(200).size(function(){
		return F.win.$(':animated').length === 0;
	});
};

FuncUnit.animationsDone = FuncUnit.animationEnd;

$.extend(FuncUnit.prototype, {
	/**
     * @function FuncUnit.prototype.exists .exists()
     * @parent waits
     * @signature `exists([timeout] [,success] [,message])`
	 * Waits until an element exists before running the next action.
	 * @codestart
	 * //waits until #foo exists before clicking it.
	 *F("#foo").exists().click()
	 * @codeend
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a success that is run after the selector exists, but before the next action.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	exists: function( timeout, success, message ) {
		var logMessage = "Waiting for '"+this.selector+"' to exist";
		if(timeout === false){ // pass false to suppress this wait (make it not print any logMessage)
			logMessage = false
		}
		return this.size({
			condition: function(size){
				return size > 0;
			},
			timeout: timeout,
			success: success,
			message: message,
			errorMessage: "Exist failed: element with selector '"+this.selector+"' not found",
			logMessage: logMessage
		})
	},
	/**
     * @function FuncUnit.prototype.missing .missing()
     * @parent waits
     * @signature `missing([timeout] [,success] [,message])`
	 * Waits until no elements are matched by the selector.  Missing is equivalent to calling
	 * <code>.size(0, success);</code>
	 * @codestart
	 * //waits until #foo leaves before continuing to the next action.
	 *F("#foo").missing()
	 * @codeend
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that is run after the selector exists, but before the next action
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	missing: function( timeout,success, message ) {
		return this.size(0, timeout, success, message)
	},
	/**
     * @function FuncUnit.prototype.visible .visible()
     * @parent waits
     * @signature `visible([timeout] [,success] [,message])`
	 * Waits until the funcUnit selector is visible.  
	 * @codestart
	 * //waits until #foo is visible.
	 *F("#foo").visible()
	 * @codeend
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that runs after the funcUnit is visible, but before the next action.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return [funcUnit] returns the funcUnit for chaining.
	 */
	visible: function( timeout, success, message ) {
		var self = this,
			sel = this.selector,
			ret;
		return this.size(function(size){
			return this.is(":visible") === true;
		}, timeout, success, message)
	},
	/**
     * @function FuncUnit.prototype.invisible .invisible()
     * @parent waits
     * @signature `invisible([timeout] [,success] [,message])`
	 * Waits until the selector is invisible.  
	 * @codestart
	 * //waits until #foo is invisible.
	 *F("#foo").invisible()
	 * @codeend
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that runs after the selector is invisible, but before the next action.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 * @return [funcUnit] returns the funcUnit selector for chaining.
	 */
	invisible: function( timeout, success, message ) {
		var self = this,
			sel = this.selector,
			ret;
		return this.size(function(size){
			return this.is(":visible") === false;
		}, timeout, success, message)
	},
	/**
     * @function FuncUnit.prototype.wait .wait()
     * @parent waits
     * @signature `wait([checker] [,timeout] [,success] [,message])`
     *
	 * Waits until some condition is true before calling the next action.  Or if no checker function is provided, waits a 
	 * timeout before calling the next queued method.  This can be used as a flexible wait condition to check various things in the tested page:
	 * @codestart
	 *F('#testData').wait(function(){
	 * 	 return F.win.$(this).data('idval') === 1000;
	 * }, "Data value matched");
	 * @codeend
	 * @param {Number|Function} [checker] a checking function.  It runs repeatedly until the condition becomes true or the timeout period passes.  
	 * If a number is provided, a time in milliseconds to wait before running the next queued method.
	 * @param {Number} [timeout] overrides FuncUnit.timeout.  If provided, the wait will fail if not completed before this timeout.
	 * @param {Function} [success] a callback that will run after this action completes.
	 * @param {String} [message] if provided, an assertion will be passed when this wait condition completes successfully
	 */
	wait: function( checker, timeout, success, message ) {
		if(typeof checker === "number"){
			timeout = checker;
			FuncUnit.wait(timeout, success)
			return this;	
		} else {
			return this.size(checker, timeout, success, message)
		}
	},
	/**
     * @function FuncUnit.prototype.then .then()
     * @parent waits
     * @signature `then(success)`
	 * Calls the success function after all previous asynchronous actions have completed.  Then
	 * is called with the funcunit object.
	 * @param {Function} success
	 */
	then : function(success){
		var self = this;
		FuncUnit.wait(0, function(){
			success.call(this, this);
		});
		return this;
	}
})
return FuncUnit;
})(__m10, __m9);

// ## funcunit.js
var __m1 = (function(Syn, FuncUnit) {
	window.FuncUnit = window.S = window.F = FuncUnit;
	
	return FuncUnit;
})(__m2, __m9, __m13, __m17, __m18, __m19, __m20, __m21, __m22);

}(window);