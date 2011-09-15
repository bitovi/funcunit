@page getstartedfuncunit 1. Get Started
@parent FuncUnit

In this guide, we'll go over:

* running a test in browser
* writing a test
* debugging a broken test
* running tests via Selenium
* running tests via PhantomJS

## Running Autocomplete Tests

Open _funcunit/test/autosuggest/autosuggest.html_ in a browser.  Type "J" in the input.  You'll see the following:

@image funcunit/pages/images/autosuggest.png


This page is a simple demo app.  It shows results when you start typing, then you can click a result (or use mouse navigation) to populate the input.

There is a test already written.  Open <i>funcunit/test/autosuggest/autosuggest_test.js</i> in your IDE:

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

As you can probably tell, the [s S method] is an alias for jQuery (*).  This test:

1. Opens autosuggest.html
1. Grabs the input element, clicks it, and types "JavaScript"
1. Grabs the element that is populated with results, waits for it to be visible
1. Asserts that there are 5 results shown

(*) Actually its a subbed version of jQuery that performs queries in the application window by default, and sometimes caches its selector to run asynchronously.

To run this test, open <i>funcunit/test/autosuggest/funcunit.html</i> in any browser (turn off your popup blocker).  The test will open and run.  The results are shown in the QUnit page:

@image funcunit/pages/images/qunit.png


## Writing an Autocomplete Test

Next we'll add a test for selecting a result.  FuncUnit's [apifuncunit API] consists of:

* [s The S Method] - Perform a (sometimes asynchronous) query in the application window
* [actions Actions] - Simulate user actions like click, type, drag
* [waits Waits] - Wait for a condition in your page to be met.  Fail the test if the condition isn't met before a timeout.
* [assertions Assertions & getters] - Synchronously check a condition in your page.

The setup and assertion methods are part of the [QUnit] API.

Our test should do the following:

1. Repeat the search performed in the first test
1. Wait for a result to be visible, click it
1. Wait for the text of the clicked row to appear in the input

Add the following under the first test:

@codestart
test("clicking result", function(){
  S('input').click().type("JavaScript");

  S('.autocomplete_item:first').visible().click();
  S('input').text("JavaScript");
})
@codeend

A few important notes about this test:

1. We have no assertions. This is ok. Most FuncUnit tests don't need them. If the wait conditions aren't met before a timeout, the test will fail.  If the test completes, this feature is working.
1. The click, visible, and text methods are actually doing asynchronous things. FuncUnit lets you write tests with this linear syntax by queueing the actual methods and running them one by one. This is to prevent your tests from being an unreadable mess of nested functions like:

@codestart
S('.autocomplete_item:first').visible(function(){
	S('.autocomplete_item:first').click(function(){
		S('input').text("JavaScript")
	})
})
@codeend

Reload the funcunit.html page and see your new test run and pass.

## Debugging tests

Now change .text("JavaScript") to .text("C#").  Reload the page and watch it timeout and fail.

@image broken.png

Your first debugging instinct might be "Let's add a breakpoint!".  But, as noted, this code actually is running asynchronously.  When .text() runs, its adding a method to FuncUnit.queue, not actually doing the check.  When its this wait condition's turn to run, $("input").text() === "JavaScript" is checked on repeat until its true or a timeout is reached.  

We can replace the string with a function and use console.log to see what's going on. When previous queued methods finish, this function will run on repeat. Change that line to:

@codestart
S('input').text(function(text){
	console.log(text, this)
	if(text === "C#") return true;
});
@codeend

"this" in your wait method is the element that .text is being run against. The console will show the following:

@image console.png

Using similar techniques, you can debug breaking tests and quickly find the core issue. Undo this breaking change before moving on to the next part.

## Running in Selenium

Next we'll run this same test via the browser automation tool Selenium. Open a command prompt to the JMVC directory and run the following:

@codestart
./js funcunit/run selenium funcunit/test/autosuggest/funcunit.html
@codeend

On windows, just use "js" instead of ./js. This will open the test page in Firefox (and IE on Windows), run the same test, and report the results on the command line:

@image selenium.png

You can configure this step to run in any browser via the [integrations settings.js file].

## Running in PhantomJS

Running in Selenium is great, but can be slow with many browsers and sluggish browser opening.  [PhantomJS] is a headless version of WebKit, which can run the same tests from the commandline much faster without opening any visual browser windows. To run this step, first you must [install PhantomJS]. Then run:

@codestart
./js funcunit/run phantomjs funcunit/test/autosuggest/funcunit.html
@codeend

Phantom opens your page, runs the same test, and reports results on the commandline:

@image phantomjs.png

This step can be easily integrated in your build process via [jenkins Jenkins] or [maven Maven].

FuncUnit provides the holy grail of testing: easy, familiar syntax, in browser running for easy debugging, and simple automation.

That's it! If you want to learn more, read about FuncUnit's [apifuncunit API] and [integrations] or check out some [demos].