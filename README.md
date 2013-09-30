<!--

@constructor FuncUnit
@group actions Actions
@group css CSS
@group dimensions Dimensions
@group manipulation Manipulation
@group traversal Traversal
@group waits Waits
@group utilities Utilities

-->

_Note: [FuncUnit Roadmap](http://forum.javascriptmvc.com/#Topic/32525000001436023)

The [FuncUnit Getting Started](../guides/started) guide is a quick walkthrough of creating and running a test.

<h2 id="setup">Set up a test</h2>

[http://docs.jquery.com/Qunit QUnit] provides the basic structure needed to write unit or functional tests.

__Module__

[http://docs.jquery.com/QUnit/module#namelifecycle Modules] are groups of tests with setup and teardown methods that run for each test.

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

__Test__

    test("findOne", function(){
      // define a test
    })

__Assertions__

    test("counter", function() {
      ok(Conctacts.first().name, "there is a name property");
      equal(Contacts.counter(), 5, "there are 5 contacts");
    });

<h2 id="open">Open a page</h2>

The following uses <code>F.open( URL )</code> to open autocomplete.html before every test.

    module("autosuggest",{
      setup: function() {
        F.open('autosuggest.html')
      }
    });

Calling open on window will cause FuncUnit commands to operate on the current window.  This is also the default if you don't open any page.


<h2 id="query">Query for elements</h2>

FuncUnit tests are written just like jQuery.  The [funcunit.finding S method] is a copy of jQuery, which queries for elements in
the application page.  Like $, FuncUnit methods are chainable on the results of F.

    // grab the #description element, wait for it to be visible, type in it
    F("#description").visible().type("Test Framework")

<h2 id="simulate">Simulate user actions</h2>

When you're testing a widget, you need to simulate the [funcunit.actions actions] that a user takes.  FuncUnit uses the
[syn] library to accurately simulate the correct low level events like mouseup and keypress for high
level actions like [FuncUnit.prototype.click] and [FuncUnit.prototype.type].  The following shows how to simulate common user actions.

__Click__

    // click a button
    F('#submit_button').click()

__Type__

    // type in an input
    F('#task_name').type("Learn FuncUnit")

__Drag__

    // drag a task item to the trash area
    F('.task').drag(".trash");

<h2 id="wait">Wait for page conditions</h2>

After a user action, your test page's event handlers run and the page is changed.
Wait commands are used to wait for some page condition before continuing.

Waits are overloaded jQuery getter methods.  <code>F.fn.text( textVal, callback )</code>
waits for an element's $.fn.text to match the textVal.

    // wait for result to show "task complete"
    F("#result").text("task complete")

__Visible__

    // wait for first result to be visible
    F('#autocomplete_results:first-child').visible()

__Width__

    // after clicking a menu item, wait for its width to be 200px
    F('#horizontal_menu_item').width(200)

__Val__

    // wait for the input value
    F('#language_input').val("JavaScript")

__Size__

    // wait for number of matched elements
    F('.contact').size(5)

There are many more [funcunit.waits waits] possible.


<h2 id="get">Get information and run assertions</h2>

After simulating an action and waiting for the page to change, you often want to get information
about an element and run assertions.  You can use jQuery getter methods in combination with QUnit assertions.

These methods (which return synchronous results) are used in callbacks that run after a wait method completes.

    // wait until we have some results, then call the calback
    F('.autocomplete_item').visible(function(){
      equal( F('.autocomplete_item').size(), 5, "there are 5 results")
    })

<h2 id="browser">Running in browser</h2>

These tests can be loaded in any browser.  The app page opens in a separate window and results show up in the QUnit page.

    test("JavaScript results",function(){
      F('input').click().type("JavaScript")

      // wait until we have some results
      F('.autocomplete_item').visible(function(){
        equal( F('.autocomplete_item').size(), 5, "there are 5 results")
      })
    });
