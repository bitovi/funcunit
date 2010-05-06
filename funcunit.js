//what we need from jQuery
steal('resources/jquery','resources/json').plugins('funcunit/synthetic')
//we need qunit
.plugins(	'funcunit/qunit')
//Now describe FuncUnit
.then(function(){
		/**
		 * @constructor FuncUnit
		 * @param {Object} s
		 * @param {Object} c
		 */
		FuncUnit = function(s, c){
			return new FuncUnit.init(s, c)
		}
		/**
		 * Opens a page
		 * @param {Object} url
		 * @param {Object} callback
		 * @param {Object} timeout
		 */
		FuncUnit.open = function(url, callback, timeout){
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
			FuncUnit.wait = function(time, cb){
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
			FuncUnit.convert = function(str){
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
			//list of jQuery functions we want
			FuncUnit.funcs = ['synthetic', 'size', 'data', 'attr', 'removeAttr', 'addClass', 'hasClass', 'removeClass', 'toggleClass', 'html', 'text', 'val', 'empty', 'css', 'offset', 'offsetParent', 'position', 'scrollTop', 'scrollLeft', 'height', 'width', 'innerHeight', 'innerWidth', 'outerHeight', 'outerWidth']
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
			exists: function(cb, timeout){
				var selector = this.selector, context = this.context;
				FuncUnit.add(function(success, error){
					FuncUnit.repeat(function(){
						//return jQuery(selector, page.document).length
						return FuncUnit.$(selector, context, "size");
					}, success)
				}, cb, "Could not find " + this.selector, timeout)
			},
			missing: function(cb, timeout){
				var selector = this.selector, context = this.context;
				FuncUnit.add(function(success, error){
					FuncUnit.repeat(function(){
						//return jQuery(selector, page.document).length
						return !FuncUnit.$(selector, context, "size");
					}, success)
				}, cb, "Could not find " + this.selector, timeout)
			},
			type: function(text, callback){
				var selector = this.selector, context = this.context;
				FuncUnit.add(function(success, error){
					for (var c = 0; c < text.length; c++) {
						FuncUnit.$(selector, context, "synthetic", "key", text.substr(c, 1))
					}
					
					setTimeout(success, 13)
				}, callback, "Could not type " + text + " into " + this.selector)
			},
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