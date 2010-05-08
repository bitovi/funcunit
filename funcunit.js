//what we need from jQuery
steal.plugins('funcunit/qunit',
	'funcunit/qunit/rhino',
	'jquery',
	'jquery/lang/json',		
	'funcunit/synthetic'
	)
//Now describe FuncUnit
.then(function(){
		var window = (function(){return this }).call(null),
			oldFunc = window.FuncUnit;
		
		/**
		 * @constructor FuncUnit
		 * @tag core
		 * FuncUnit provides powerful functional testing.  It can be used with or without 
		 * JavaScriptMVC.
		 * <h2>FuncUnit with JavaScriptMVC</h2>
		 * Steps:
		 * <ol>
		 * 	<li>Create a page that loads the funcunit plugin</li>
		 *  <li>Steal all your scripts</li>
		 *  <li>Configure settings to point to your jmvc root folder on your server</li>
		 * </ol>
		 * <b>We might want to have people point to the domain ... and to the root folder ... not sure</b>
		 * 
		 * <h2>Use standalone</h2>
		 * To setup FuncUnit standalone, follow these steps:
		 * <ol>
		 * 	<li>Download and unzip FuncUnit into your project's directory.  You will see the following folder
		 *      files:
		 * @codestart text
		 * funcunit      - linux shell
		 * funcunit.bat  - windows shell
		 * funcunit.html - test page
		 * funcunit.js   - funcunit script
		 * test.js       - test file
		 * settings.js   - settings
		 * resources/
		 *   demo/       - a basic demo app
		 *   java/
		 *     selenium-java-client-driver.jar
		 *     selenium-server.jar
		 *     js.jar
		 *     mail.jar
		 *   env.js
		 *   email.js
		 *   send_email.jar
		 *   run.js
		 * @codeend
		 *  </li>
		 *  <li>test.js is already setup to test a demo app in resources.  To make sure everything is 
		 *      running ok, simply run:
		 *  @codestart
		 *  funcunit
		 *  @codeend
		 *  Typically, you will tell the funcunit script which html file to run, but it defaults to 
		 *  funcunit.html.  You can also open up funcunit.html in a browser and see it test the demo app.
		 *  </li>
		 *  <li>
		 *    Now before you change test.js to test your application, you might have noticed that
		 *    the funcunit command openned your browser up to the filesystem.  To change this to your server,
		 *    open settings.js and change browser url to point to where the funcunit folder sits on your
		 *    server.  Now run funcunit again.  It should run the demo.
		 *  </li>
		 * </ol>
		 * <h3>Making other tests.</h3>
		 * To break up tests into multiple files, just add script tags in the html file.  You can
		 * also create more html files (for other test suites).  To run these simply do:
		 * @codestart text
		 * funcunit path/to/html.html
		 * @codeend
		 * 
		 * 
		 * <h2>Configuring</h2>
		 * 
		 * @init
		 * selects something in the other page
		 * @param {Object} s
		 * @param {Object} c
		 */
		FuncUnit = function(s, c){
			return new FuncUnit.init(s, c)
		}
		/**
		 * @Static
		 */
		$.extend(FuncUnit,oldFunc)
		FuncUnit.
		/**
		 * Opens a page
		 * @param {Object} url
		 * @param {Object} callback
		 * @param {Object} timeout
		 */
		open = function(url, callback, timeout){
			FuncUnit.add(function(success, error){ //function that actually does stuff, if this doesn't call success by timeout, error will be called, or can call error itself
				//page = window.open(url);
				FuncUnit._open(url, error);
				FuncUnit._onload(function(){
					FuncUnit._opened();
					success()
				}, error);
			}, callback, "Page " + url + " not loaded in time!", timeout);
		};
		FuncUnit.window = {
			document: {}
		};
		FuncUnit._opened = function(){};
		var path = new java.io.File(".").getCanonicalPath();
		if(!FuncUnit.href)
			FuncUnit.href = "file:///"+path.replace("\\", "/")+"/"+fileName;
		FuncUnit.serverHost = FuncUnit.serverHost || "localhost";
		FuncUnit.serverPort = FuncUnit.serverPort || 4444;
		(function(){
			var queue = [], incallback = false;
			FuncUnit.add = function(f, callback, error, timeout){
				if (incallback) {
					queue.unshift({
						method: f,
						callback: callback,
						error: error,
						timeout: timeout
					});
				}
				else {
					queue.push({
						method: f,
						callback: callback,
						error: error,
						timeout: timeout
					});
				}
				
				
				if (queue.length == 1) {
					stop();
					setTimeout(FuncUnit._done, 13)
				//();
				}
			}
			FuncUnit._done = function(){
				if (queue.length > 0) {
					var next = queue.shift();
					var timer = setTimeout(function(){
						ok(false, next.error);
						FuncUnit._done();
					}, next.timeout || 10000)
					
					next.method(function(){
						//mark in callback so the next set of add get added to the front
						clearTimeout(timer);
						incallback = true;
						if (next.callback) 
							next.callback.apply(null, arguments);
						incallback = false;
						FuncUnit._done();
					}, function(message){
						clearTimeout(timer);
						ok(false, message);
						FuncUnit._done();
					});
				}
				else {
					start();
				}
			}
			FuncUnit.
			/**
			 * waits a timeout
			 * @param {Object} time
			 * @param {Object} cb
			 */
			wait = function(time, cb){
				time = time || 10000
				FuncUnit.add(function(success, error){
					setTimeout(success, time)
				}, cb, "Couldn't wait!", time * 2)
			}
			FuncUnit.repeat = function(script, callback){
				var f = script;
				if (typeof script == "string") {
					script = script.replace(/\n/g, "\\n")
					f = function(){
						with (opener) {
							var result = eval("(" + script + ")")
						}
						return result;
					}
				}
				if (callback) {
					var interval = null;
					var time = new Date();
					interval = setInterval(function(){
						if (callback.failed) {
							clearInterval(interval);
						}
						else {
							var result = null;
							try {
								result = f()
							} 
							catch (e) {
							}
							
							if (result) {
								clearInterval(interval);
								callback();
							}
						}
					}, 1);
					
				}
				else {
					var result = f();
					return result;//this.convert( result);
				}
			}
			
			FuncUnit.makeArray = function(arr){
				var narr = [];
				for (var i = 0; i < arr.length; i++) {
					narr[i] = arr[i]
				}
				return narr;
			}
			FuncUnit.
			/**
			 * Converts a string into a Native JS type.
			 * @param {Object} str
			 */
			convert = function(str){
				//if it is an object and not null, eval it
				if (str !== null && typeof str == "object") {
					return object;
				}
				str = String(str);
				switch (str) {
					case "false":
						return false;
					case "null":
						return null;
					case "true":
						return true;
					case "undefined":
						return undefined;
					default:
						if (/^\d+\.\d+$/.test(str) || /^\d+$/.test(str)) {
							return 1 * str;
						}
						
						return str;
				}
			}
			/**
			 * @prototype
			 */
			//list of jQuery functions we want
			FuncUnit.funcs = [
			
			'synthetic', 
			/**
			 * @function size
			 * Calls back with the size
			 */
			'size', 
			'data', 
			/**
			 * @function attr
			 */
			'attr', 
			'removeAttr', 
			'addClass', 
			/**
			 * @function hasClass
			 */
			'hasClass', 
			'removeClass', 
			'toggleClass', 
			/**
			 * @function html
			 */
			'html', 
			/**
			 * @function text
			 */
			'text', 
			/**
			 * @function val
			 */
			'val', 
			/**
			 * @function empty
			 */
			'empty', 
			'css', 
			'offset', 
			'offsetParent', 
			'position', 
			'scrollTop', 
			'scrollLeft', 
			'height', 
			'width', 
			'innerHeight', 
			'innerWidth', 
			'outerHeight', 
			'outerWidth']
			FuncUnit.makeFunc = function(fname){
				FuncUnit.init.prototype[fname] = function(){
					//assume last arg is callback
					var args = FuncUnit.makeArray(arguments), callback;
					if (typeof args[args.length - 1] == "function") {
						callback = args.pop();
					}
					
					args.unshift(fname)
					args.unshift(this.context)
					args.unshift(this.selector)
					
					FuncUnit.add(function(success, error){
						var ret = FuncUnit.$.apply(FuncUnit.$, args);//  (selector,fname)
						success(ret)
					}, callback, "Can't get text of " + this.selector)
					return this;
				}
			}
		})();
		
		
		
		
		
		FuncUnit.init = function(s, c){
			this.selector = s;
			this.context = c == null ? FuncUnit.window.document : c;
		}
		FuncUnit.init.prototype = {
			/**
			 * Waits until an element exists
			 * @param {Object} cb
			 * @param {Object} timeout
			 */
			exists: function(cb, timeout){
				var selector = this.selector, context = this.context;
				FuncUnit.add(function(success, error){
					FuncUnit.repeat(function(){
						//return jQuery(selector, page.document).length
						return FuncUnit.$(selector, context, "size");
					}, success)
				}, cb, "Could not find " + this.selector, timeout)
			},
			/**
			 * Waits until an object is missing
			 * @param {Object} cb
			 * @param {Object} timeout
			 */
			missing: function(cb, timeout){
				var selector = this.selector, context = this.context;
				FuncUnit.add(function(success, error){
					FuncUnit.repeat(function(){
						//return jQuery(selector, page.document).length
						return !FuncUnit.$(selector, context, "size");
					}, success)
				}, cb, "Could not find " + this.selector, timeout)
			},
			/**
			 * Types text into the object
			 * @param {Object} text
			 * @param {Object} callback
			 */
			type: function(text, callback){
				var selector = this.selector, context = this.context;
				FuncUnit.add(function(success, error){
					for (var c = 0; c < text.length; c++) {
						FuncUnit.$(selector, context, "synthetic", "key", text.substr(c, 1))
					}
					
					setTimeout(success, 13)
				}, callback, "Could not type " + text + " into " + this.selector)
			},
			/**
			 * Clicks an object
			 * @param {Object} options
			 * @param {Object} callback
			 */
			click: function(options, callback){
				var selector = this.selector, context = this.context;
				FuncUnit.add(function(success, error){
					FuncUnit.$(selector, context, "synthetic", "click", options, FuncUnit.window)
					setTimeout(success, 13)
				}, callback, "Could not click " + this.selector)
				return this;
			}
		};
		
		
		(function(){
			for (var i = 0; i < FuncUnit.funcs.length; i++) {
				FuncUnit.makeFunc(FuncUnit.funcs[i])
			}
		})();
		S = FuncUnit;
})
//now add drivers
.then('resources/selenium_start',
'drivers/selenium',
'drivers/standard')