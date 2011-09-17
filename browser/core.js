(function(){
	
	//if there is an old FuncUnit, use that for settings
	var oldFunc = window.FuncUnit;

/**
 * @class FuncUnit
 * @parent index 2
 * @test test.html
 * @download http://github.com/downloads/jupiterjs/funcunit/funcunit-beta-5.zip

FuncUnit tests web applications with a simple jQuery-like syntax. Via integration with 
[funcunit.selenium Selenium] and [funcunit.phantomjs PhantomJS], you can run the same tests automated.

FuncUnit uses [http://docs.jquery.com/Qunit QUnit] for organizing tests and assertions.  But FuncUnit extends QUnit so you can:

 - [FuncUnit.open Opens] an application page
 - [funcunit.finding Queries] for elements
 - [funcunit.actions Simulates] a user action
 - [funcunit.waits Waits] for a condition to be true
 - [funcunit.getters Gets] information about your page and runs assertions
 
Then, you can:
 
 - Run tests in the browser
 - [funcunit.integrations Integrate] with browser automation and build tools

The [funcunit.getstarted FuncUnit Getting Started] guide is a quick walkthrough of creating and running a test.

## Set up a test

[http://docs.jquery.com/Qunit QUnit] provides the basic structure needed to write unit or functional tests.

__Module__

[http://docs.jquery.com/QUnit/module#namelifecycle Modules] are groups of tests with setup and teardown methods that run for each test.

@codestart
module("Contacts", {
  // runs before each test
  setup: function(){
    // setup code
  },
  // runs after each test
  teardown: function(){
    // cleanup code
  }
})
@codeend

__Test__

@codestart
test("findOne", function(){
  // define a test
})
@codeend

__Assertions__

@codestart
test("counter", function() {
  ok(Conctacts.first().name, "there is a name property");
  equal(Contacts.counter(), 5, "there are 5 contacts");
});
@codeend

## Open a page

The following uses <code>S.open( URL )</code> to open autocomplete.html before every test.

@codestart
module("autosuggest",{
  setup: function() {
    S.open('autosuggest.html')
  }
});
@codeend

## Query for elements

FuncUnit tests are written just like jQuery.  The [funcunit.finding S method] is a copy of jQuery, which queries for elements in 
the application page.  Like $, FuncUnit methods are chainable on the results of S.

@codestart
// grab the #description element, wait for it to be visible, type in it
S("#description").visible().type("Test Framework")
@codeend

## Simulate user actions

When you're testing a widget, you need to simulate the [funcunit.actions actions] that a user takes.  FuncUnit uses the 
[syn] library to accurately simulate the correct low level events like mouseup and keypress for high 
level actions like [click] and [type].  The following shows how to simulate common user actions.

__Click__

@codestart
// click a button
S('#submit_button').click()
@codeend

__Type__

@codestart
// type in an input
S('#task_name').type("Learn FuncUnit")
@codeend

__Drag__

@codestart
// drag a task item to the trash area
S('.task').drag(".trash");
@codeend

## Wait for page conditions

After a user action, your test page's event handlers run and the page is changed. 
Wait commands are used to wait for some page condition before continuing.

Waits are overloaded jQuery getter methods.  <code>S.fn.text( textVal, callback )</code> 
waits for an element's $.fn.text to match the textVal.

@codestart
// wait for result to show "task complete"
S("#result").text("task complete")
@codeend

__Visible__

@codestart
// wait for first result to be visible
S('#autocomplete_results:first-child').visible()
@codeend

__Width__

@codestart
// after clicking a menu item, wait for its width to be 200px
S('#horizontal_menu_item').width(200)
@codeend

__Val__

@codestart
// wait for the input value
S('#language_input').val("JavaScript")
@codeend

__Size__

@codestart
// wait for number of matched elements
S('.contact').size(5)
@codeend

There are many more [funcunit.waits waits] possible. 


## Get information and run assertions

After simulating an action and waiting for the page to change, you often want to get information 
about an element and run assertions.  You can use jQuery getter methods in combination with QUnit assertions.

These methods (which return synchronous results) are used in callbacks that run after a wait method completes.

@codestart
// wait until we have some results, then call the calback
S('.autocomplete_item').visible(function(){
  equal( S('.autocomplete_item').size(), 5, "there are 5 results")
})
@codeend

## Running in browser

These tests can be loaded in any browser.  The app page opens in a separate window and results show up in the QUnit page.

@codestart
test("JavaScript results",function(){
  S('input').click().type("JavaScript")

  // wait until we have some results
  S('.autocomplete_item').visible(function(){
    equal( S('.autocomplete_item').size(), 5, "there are 5 results")
  })
});
@codeend

<a href='funcunit/test/autosuggest/funcunit.html'>Run this test</a> (turn off your popup blocker!)

## Integrating with automation and build tools

The same tests can be run via browser automation tools: [funcunit.selenium Selenium], 
[funcunit.phantomjs PhantomJS], and [funcunit.envjs Envjs].

These tools are driven via commandline.

@codestart
js funcunit/run phantomjs path/to/funcunit.html
@codeend

Results are reported on the commandline.  Failed tests can be made to fail your build via [funcunit.maven Maven] 
or integrated with CI tools like [funcunit.jenkins Jenkins].

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
		},
		performAsyncQuery = function(selector, context, self){
			FuncUnit.add({
				method: function(success, error){
					this.selector = selector;
					context = getContext(context);
					selector = getSelector(selector);
					this.bind = init.call(self, selector, context);
					success();
					return this;
				},
				error: "selector failed: " + selector
			});
		},
		performSyncQuery = function(selector, context, self){
			return init.call(self, selector, context);
		}
	
	// override the subbed init method
	FuncUnit.fn.init = function(selector, context){
		// if you pass true as context, this will avoid doing a synchronous query
		var isSyncOnly = false,
			isAsyncOnly = false;
		if (FuncUnit._queue.length > 0) { // if there's something in the queue, only perform asynchronous query
			isAsyncOnly = true;
		}
		if (FuncUnit._incallback === true) { // if you're in a callback, only do the synchronous query
			isSyncOnly = true;
		}
		isSyncOnly = (context === true || context === false)? context: isSyncOnly;
		// if its a function, just run it in the queue
		if(typeof selector == "function"){
			return FuncUnit.wait(0, selector);
		}
		// if its a string or targets the app window
		if (typeof selector === "string" || selector == FuncUnit.window.document || selector == FuncUnit.window) {
			// if the app window already exists, adjust the params (for the sync return value)
			if (FuncUnit._window) {
				context = getContext(context);
				selector = getSelector(selector);
			}
			this.selector = selector;
			// run this method in the queue also
			if(isSyncOnly === true){
				return performSyncQuery(selector, context, this)
			} else if(isAsyncOnly === true){
				performAsyncQuery(selector, context, this)
				return this;
			} else { // do both
				performAsyncQuery(selector, context, this)
				return performSyncQuery(selector, context, this)
			}
		} else {
			return performSyncQuery(selector, context, this)
		}
	}
	FuncUnit.fn.init.prototype = FuncUnit.fn;
	window.jQuery.extend(FuncUnit,oldFunc)
	
	
	S = FuncUnit;
	
	
	
	FuncUnit.eval = function(str){
		return FuncUnit._window.eval(str)
	}
})()
