(function(){
	
	//if there is an old FuncUnit, use that for settings
	var oldFunc = window.FuncUnit;

/**
 * @class FuncUnit
 * @parent index 2
 * @test test.html
 * @download http://github.com/downloads/jupiterjs/funcunit/funcunit-beta-5.zip

FuncUnit is functional testing for JavaScript applications. Tests are written in jQuery and run in a browser. 
Via integration with [selenium Selenium] and [phantomjs PhantomJS], you can run the same tests automated.

<b>FuncUnit is designed to make writing JavaScript functional tests super easy and approachable. 
FuncUnit will transform your development lifecycle, give your developers confidence, and improve quality.</b>

[getstartedfuncunit Get started], then read about the [apifuncunit API] and [integrations integrations].

## Example:
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

<a href='funcunit/test/autosuggest/funcunit.html'>Run this test</a> (turn off your popup blocker!)
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
