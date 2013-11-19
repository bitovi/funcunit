/*
 * FuncUnit - 2.0.4
 * http://funcunit.com
 * Copyright (c) 2013 Bitovi
 * Tue, 19 Nov 2013 20:50:27 GMT
 * Licensed MIT */

!function(window) {

// ## browser/init.js
var __m5 = (function(jQuery) {
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
})(jQuery);

// ## browser/core.js
var __m3 = (function(jQuery, oldFuncUnit) {
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
})(jQuery, __m5);

// ## browser/adapters/jasmine.js
var __m7 = (function(FuncUnit) {
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
})(__m3);

// ## browser/adapters/qunit.js
var __m8 = (function(FuncUnit) {
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
})(__m3);

// ## browser/adapters/adapters.js
var __m6 = (function() {})(__m7, __m8);

// ## browser/open.js
var __m9 = (function($, FuncUnit) {
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
})(jQuery, __m3);

// ## browser/actions.js
var __m10 = (function($, FuncUnit, Syn) {
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
		trigger: function(evName, success){
			this._addExists();
			FuncUnit.add({
				method : function(success, error){
					// need to use the page's jquery to trigger events
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
})(jQuery, __m3, Syn);

// ## browser/getters.js
var __m11 = (function($, FuncUnit) {
	
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
					success = timeout;
					message = success;
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
})(jQuery, __m3);

// ## browser/traversers.js
var __m12 = (function($, FuncUnit){

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
})(jQuery, __m3);

// ## browser/queue.js
var __m13 = (function(FuncUnit) {
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
     * @signature `add(handler)`
	 * Adds a function to the queue.
	 * @param {Object} handler An object that contains the method to run along with other properties:

 - method : the method to be called.  It will be provided a success and error function to call
 - success : an optional callback to be called after the function is done
 - error : an error message if the command fails
 - timeout : the time until success should be called
 - bind : an object that will be 'this' of the success
 - type: the type of method (optional)

	 */
	add = function(handler){
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
})(__m3);

// ## browser/waits.js
var __m14 = (function($, FuncUnit) {
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
})(jQuery, __m3);

// ## funcunit.js
var __m1 = (function(Syn, FuncUnit) {
	window.FuncUnit = window.S = window.F = FuncUnit;
	
	return FuncUnit;
})(Syn, __m3, __m6, __m9, __m10, __m11, __m12, __m13, __m14);

}(window);