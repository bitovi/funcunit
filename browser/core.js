(function(){
	
	//if there is an old FuncUnit, use that for settings
	var oldFunc = window.FuncUnit;

	/**
	 * @class FuncUnit
	 * @parent index 2
	 * @test test.html
	 * @download http://github.com/downloads/jupiterjs/funcunit/funcunit-beta-5.zip
	
	FuncUnit is a powerful functional testing framework written in JavaScript with a jQuery-like syntax.  It provides an 
	approachable way to write maintainable cross browser tests.  It is the first functional testing framework written 
	for JavaScript developers by JavaScript developers.
	
	FuncUnit extends [http://docs.jquery.com/QUnit QUnit]'s API with commands like [FuncUnit.prototype.click click], [FuncUnit.prototype.type type], 
	and [FuncUnit.prototype.drag drag].  The same tests can be run in browser or automated via Selenium.
	
	## Example:
	The following tests that an AutoSuggest returns 5 results.  
	<a href='funcunit/autosuggest/funcunit.html'>See it in action!</a> (Make sure you turn off your popup blocker!)
	@codestart
	module("autosuggest",{
	  setup: function() {
	    S.open('autosuggest.html')
	  }
	});
	
	test("JavaScript results",function(){
	  S('input').click().type("JavaScript")
	
	  // wait until we have some results
	  S('.autocomplete_item').visible(function(){
	    equal( S('.autocomplete_item').size(), 5, "there are 5 results")
	  })
	});
	@codeend
	
	## Using FuncUnit
	
	FuncUnit works by loading QUnit, FuncUnit, and your tests into a web page.  Your application is opened in a 
	separate browser window.  The FuncUnit page then drives your application via clicks, types, and drags, reporting 
	pass/fail in the initial FuncUnit test page.
	
	### Loading a Test
	
	To get started with a basic test, run:
	
	@codestart
	./js jquery/generate/controller Company.Widget
	@codeend
	
	Open company/widget/funcunit.html in a browser.  You should see a passing test.
	
	The first thing any FuncUnit page does is load its dependencies and a test.  A FuncUnit page:
	
	1. Loads steal.js
	2. Loads funcunit and qunit via steal.plugins
	3. Loads one or more test files
	
	For more details on setting up a FuncUnit test, check out the [FuncUnit.setup Getting Set Up] guide.  
	For more details on using FuncUnit without Steal or JavaScriptMVC, check out the [FuncUnit.standalone Using Standalone FuncUnit] guide.
	
	### Writing a Test
	
	There are four types of commands in any FuncUnit tests:
	
	1. Actions - simulate a user interaction ([FuncUnit.prototype.click clicks], [FuncUnit.prototype.type types], [FuncUnit.prototype.drag drags], etc)
	2. Waits - wait for conditions in the page before continuing the test ([FuncUnit.prototype.width width], [FuncUnit.prototype.visible visible],  
	[FuncUnit.prototype.text text], etc)
	3. Getters - get page conditions to use in assertions ([FuncUnit.prototype.width width], [FuncUnit.prototype.hasClass hasClass], [FuncUnit.prototype.text text])
	4. QUnit commands - assertions and methods for setting up tests (module, test, ok, equals, etc)
	
	Tests follow a consistent pattern:
	
	0. Each test sets itself up in QUnit's [http://docs.jquery.com/QUnit/module setup] method by opening an application page with S.open.
	1. Tests simulate a user action, like clicking a link.
	2. Then they wait for some page condition to change, like a menu appearing.
	3*. Then you assert something about your page, like the right number of links are visible.
	
	* This step isn't always necessary.  You can write an entire test without assertions.  If the wait condition fails, the test will fail.
	
	For more information on writing tests, check out the [FuncUnit.writing Writing Tests] guide.
	
	## Running a Test
	
	To run this test in browser, open funcunit.html in any browser (and turn off your popup blocker!).
	
	To run the same test automated via Selenium, run:
	
	@codestart
	./funcunit/envjs path/to/funcunit.html
	@codeend
	
	For more information about using Selenium, checkout the [FuncUnit.selenium Automated FuncUnit] guide.
	
	* Use envjs.bat for Windows users.
	
	## What is FuncUnit
	
	Under the hood, FuncUnit is built on several projects:
	
	 - [http://seleniumhq.org/ Selenium] - used to open browsers and run automated tests
	 - [http://docs.jquery.com/Qunit QUnit] - Unit testing framework provides test running, assertions, and reporting
	 - [http://jquery.com/ jQuery] - used to look up elements, trigger events, and query for page conditions
	 - [http://www.envjs.com Env.js] - Rhino based headless browser used to load pages in the command line
	 - [http://www.mozilla.org/rhino/ Rhino] - command line JavaScript environment running in Java
	 - [https://github.com/jupiterjs/syn Syn] - event simulation library
	
	FuncUnit is designed to let JavaScript developers write tests in an easy to learn jQuery-like syntax. 
	The tests will run in browser, so developers can check for regressions as they work.  The same tests also run 
	via Selenium, so QA can automate nightly builds or continuous integration.
	
	## Why FuncUnit
	
	TESTING IS PAINFUL.  Everyone hates testing, and most front end developers simply don't test.  There 
	are a few reasons for this:
	
	1. **Barriers to entry** - Difficult setup, installation, high cost, or difficult APIs.  QTP costs $5K per license.
	2. **Completely foreign APIs** - Testing frameworks often use other languages (Ruby, C#, Java) and new APIs.
	3. **Debugging across platforms** - You can't use firebug to debug a test that's driven by PHP.
	4. **Low fidelity event simulation** - Tests are often brittle or low fidelity because frameworks aren't designed to test heavy JavaScript apps, so 
	browser event simualation accuracy isn't a top priority.
	5. **QA and developers can't communicate** - If only QA has the ability to run tests, sending bug reports is messy and time consuming.
	
	FuncUnit aims to fix these problems:
	
	1. FuncUnit is free and has no setup or installation (just requires Java and a browser). 
	2. FuncUnit devs know jQuery, and FuncUnit leverages that knowldge with a jQuery-like API.
	3. You can run tests in browser and set Firebug breakpoints.
	4. Syn.js is a low level event simuation library that goes to extra trouble to make sure each browser simulates events exactly as intended.
	5. Since tests are just JS and HTML, they can be checked into a project and any dev can run them easily.  QA just needs to send a URL to a broken 
	test case.
	
	There are many testing frameworks out there, but nothing comes close to being a complete solution for front end testing like FuncUnit does.
	
	 * @constructor
	 * selects something in the other page
	 * @param {String|Function|Object} selector FuncUnit behaves differently depending if
	 * the selector is a string, a function, or an object.
	 * <h5>String</h5>
	 * The selector is treated as a css selector.  
	 * jQuery/Sizzle is used as the selector so any selector it understands
	 * will work with funcUnit.  FuncUnit does not perform the selection until a
	 * command is called upon this selector.  This makes aliasing the selectors to
	 * JavaScript variables a great technique.
	 * <h5>Function</h5>
	 * If a function is provided, it will add that function to the action queue to be run
	 * after previous actions and waits.
	 * <h5>Object</h5>
	 * If you want to reference the window or document, pass <code>S.window</code> 
	 * or <code>S.window.document</code> to the selector.  
	 * 
	 * @param {Number} [context] If provided, the context is the frame number in the
	 * document.frames array to use as the context of the selector.  For example, if you
	 * want to select something in the first iframe of the page:
	 * 
	 *     S("a.mylink",0)
	 */
	FuncUnit = jQuery.sub();
	var init = FuncUnit.fn.init;
	
	var getContext = function(context){
		if (context == FuncUnit.window.document) {
			context = FuncUnit._window.document
		}
		else if (context === FuncUnit.window) {
			context = FuncUnit._window;
		}
		else if (typeof context == "number" || typeof context == "string") {
			context = FuncUnit._window.frames[context].document;
		} else {
			context = FuncUnit._window.document;
		}
		return context;
	}, 
	getSelector = function(selector){
		if (selector == FuncUnit.window.document) {
			selector = FuncUnit._window.document
		}
		else if (selector === FuncUnit.window) {
			selector = FuncUnit._window;
		}
		return selector;
	}
	// override the subbed init method
	FuncUnit.fn.init = function(selector, context){
//		console.log('init start', selector, typeof isAsync === "undefined", typeof isAsync);
//		console.log("init start")
		// if you pass true as context, this will avoid doing a synchronous query
		var isAsync = (context === true || context === false)? context: true;
		// if its a function, just run it in the queue
		if(typeof selector == "function"){
			return FuncUnit.wait(0, selector);
		}
		var self = this;
		// if its a string or targets the app window
		if (typeof selector === "string" || selector == FuncUnit.window.document || selector == FuncUnit.window) {
			// if the app window already exists, adjust the params (for the sync return value)
			if (FuncUnit._window) {
				context = getContext(context);
				selector = getSelector(selector);
			}
			this.selector = selector;
			// run this method in the queue also
			if (isAsync === true) {
//				console.log("INIT1", selector)
				FuncUnit.add({
					method: function(success, error){
//						console.log("INIT", selector)
						this.selector = selector;
						context = getContext(context);
						selector = getSelector(selector);
						this.bind = init.call(self, selector, context);
						success();
						return this;
					},
					error: "selector failed: " + selector
				});
				return init.call(this, selector, context);
			} else {
				// return a collection
//				console.log("INIT2", selector)
				return init.call(this, selector, context);
			}
		} else {
//			console.log("INIT3", selector, context)
			var res = init.call(this, selector, context);
//			console.log("AFTER INIT3", res)
			return res;
//			return init.call(this, selector, context);
		}
	}
	FuncUnit.fn.init.prototype = FuncUnit.fn;
	window.jQuery.extend(FuncUnit,oldFunc)
	
	
	S = FuncUnit;
	
	
	
	FuncUnit.eval = function(str){
		return FuncUnit._window.eval(str)
	}
})()
