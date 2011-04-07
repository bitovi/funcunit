/**
@page FuncUnit.writing Writing FuncUnit Tests
@parent FuncUnit
 * <p>Writing tests is super easy and follows this pattern:</p>
<ol>
  <li>Open a page with [FuncUnit.static.open S.open].
@codestart
S.open("//myapp/myapp.html")
@codeend
  </li>
  <li>Do some things
@codestart
//click something
S('#myButton').click()

//type something
S('#myInput').type("hello")
@codeend
  </li>

  <li>Wait for the page to change:
@codestart
//Wait until it is visible
S('#myMenu').visible()

//wait until something exists
S('#myArea').exists()
@codeend
  </li>
  <li>Check your page in a callback:
@codestart
S('#myMenu').visible(function(){
  //check that offset is right
  equals(S('#myMenu').offset().left, 500, 
    "menu is in the right spot");
})
@codeend
  </li>
</ol>
<h2>Actions, Waits, and Getters</h2>
<p>FuncUnit supports three types of commands: asynchronous actions and waits, 
and synchronous getters.</p>
<p><b>Actions</b> are used to simulate user behavior such as clicking, typing, moving the mouse.</p>
<p><b>Waits</b> are used to pause the test script until a condition has been met.</p>
<p><b>Getters</b> are used to get information about elements in the page</p>
<p>Typically, a test looks like a series of action and wait commands followed by qUnit test of
the result of a getter command.  Getter commands are almost always in a action or wait callback.</p>
<h3>Actions</h3>
Actions simulate user behavior.  FuncUnit provides the following actions:

 - <code>[FuncUnit.static.open open]</code> - opens a page.
 - <code>[FuncUnit.prototype.click click]</code> - clicks an element (mousedown, mouseup, click).
 - <code>[FuncUnit.prototype.dblclick dblclick]</code> - two clicks followed by a dblclick.
 - <code>[FuncUnit.prototype.rightClick rightClick]</code> - a right mousedown, mouseup, and contextmenu.
 - <code>[FuncUnit.prototype.type type]</code> - types characters into an element.
 - <code>[FuncUnit.prototype.move move]</code> - mousemove, mouseover, and mouseouts from one element to another.
 - <code>[FuncUnit.prototype.drag drag]</code> - a drag motion from one element to another.
 - <code>[FuncUnit.prototype.scroll scroll]</code> - scrolls an element.

Actions run asynchronously, meaning they do not complete all their events immediately.  
However, each action is queued so that you can write actions (and waits) linearly.

The following might simulate typing and resizing a "resizable" textarea plugin:

@codestart
S.open('resizableTextarea.html');

S('textarea').click().type("Hello World");
  
S('.resizer').drag("+20 +20");
@codeend

### Getters

Getters are used to test the conditions of the page.  Most getter commands correspond to a jQuery
method of the same name.  The following getters are provided:

<table style='font-family: monospace'>
<tr>
	<th colspan='2'>Dimensions</th> <th>Attributes</th> <th>Position</th> <th>Selector</th> <th>Style</th>
</tr>
<tr>
	<td>[FuncUnit.prototype.width width]</td>
	<td>[FuncUnit.prototype.height height]</td> 
	<td>[FuncUnit.prototype.attr attr]</td> 
	<td>[FuncUnit.prototype.position position]</td> 
	<td>[FuncUnit.prototype.size size]</td> 
	<td>[FuncUnit.prototype.css css]</td>
</tr>
<tr>
	<td>[FuncUnit.prototype.innerWidth innerWidth]</td>
	<td>[FuncUnit.prototype.innerHeight innerHeight]</td>
	<td>[FuncUnit.prototype.hasClass hasClass]</td>
	<td>[FuncUnit.prototype.offset offset]</td>
	<td>[FuncUnit.prototype.exists exists]</td>
	<td>[FuncUnit.prototype.visible visible]</td>
</tr>
<tr>
	<td>[FuncUnit.prototype.outerWidth outerWidth]</td>
	<td>[FuncUnit.prototype.outerHeight outerHeight]</td>
	<td>[FuncUnit.prototype.val val]</td>
	<td>[FuncUnit.prototype.scrollLeft scrollLeft]</td>
	<td>[FuncUnit.prototype.missing missing]</td>
	<td>[FuncUnit.prototype.invisible invisible]</td>
</tr>
<tr>
	<td colspan='2'></td>
	<td>[FuncUnit.prototype.text text]</td> 
	<td>[FuncUnit.prototype.scrollTop scrollTop]</td>
</tr>
<tr>
	<td colspan='2'></td>
	<td>[FuncUnit.prototype.html html]</td>
</tr>
</table>

Since getters run synchronously, it's important that they happen after the action or wait command completes.
This is why getters are typically found in an action or wait command's callback:

The following performs a drag, then checks that the textarea is 20 pixels taller after the drag.

@codestart
S.open('resizableTextarea.html');

var txtarea = S('textarea'), //save textarea reference
    startingWidth = txtarea.width(), // save references to width and height
    startingHeight = txtarea.height();

S('.resizer').drag("+20 +20", function(){
  equals(txtarea.width(), 
         startingWidth, 
         "width stays the same");
         
  equals(txtarea.height(), 
         startingHeight+20, 
         "height got bigger");
});
@codeend

### Waits

Waits are used to wait for a specific condition to be met before continuing to the next wait or
action command.  Like actions, waits execute asynchronously.  They can be given a callback that runs after 
their wait condition is met.

#### Wait conditions

Every getter commands can become a wait command when given a check value or function.  
For example, the following waits until the width of an element is 200 pixels and tests its offset.

@codestart
var sm = S("#sliderMenu");
sm.width( 200, function(){

  var offset = sm.offset();
  equals( offset.left, 200)
  equals( offset.top, 200)
})
@codeend

#### Wait functions

You can also provide a test function that when true, continues to the next action or wait command.
The following is equivalent to the previous example:

@codestart
var sm = S("#sliderMenu");

sm.width(
  function( width ) {
    return width == 200;
  }, 
  function(){
    var offset = sm.offset();
    equals( offset.left, 200)
    equals( offset.top, 200)
  }
)
@codeend

<div class='whisper'>Notice that the test function is provided the width of the element to use to check.</div>

#### Timeouts

By default, wait commands will wait a 10s timeout period.  If the condition isn't true after that time, the test will fail.  You 
can provide your own timeout for each wait condition as the parameter after the wait condition.  For example, the following will check 
if "#trigger" contains "I was triggered" for 5 seconds before failing the test.

@codestart
("#trigger").text("I was triggered", 5000)
@codeend

#### Timer waits

In addition to all the jQuery-like wait functions, FuncUnit provides [FuncUnit.static.wait S.wait], which waits a timeout before continuing.  
This function should be used with CAUTION.  You should almost never need it, because its presence means brittle tests that depend on unreliable 
timing conditions.  Much better than a time based wait is a wait that depends on a page condition (like a menu element appearing).

## Mastering the FuncUnit API

Now that we've introduced the commands, this section will dive deeper into the challenges faced while writing FuncUnit tests and 
some best practices.

### 1. Asynchronous vs synchronous commands

Most FuncUnit commands (all actions and waits) run asynchronously.  This means when a .click() or .visible() method 
runs, it doesn't actually perform a click or check for visible, but rather adds its method to a queue.  After the first method 
in the queue completes, the next one runs.  For example:

@codestart
S(".foo").click();
S(".bar").visible();
S(".myinput").type("abc");
@codeend

In this example, a click and a wait are added to the queue.  The click runs (it is asynchronous).  When it completes, 
FuncUnit checks if ".bar" is visible (and keeps checking until it is).  When this condition becomes true, the next command 
in the queue runs, which types "abc".

The reason they are asynchronous is to let you write linear FuncUnit tests without needing nested callbacks 
for every command.  As a result, tou can't set breakpoints in these methods, but there are other debugging methods.  

Assertions and getters are synchronous commands.  Usually these commands are placed in callbacks for waits and actions.  You 
can set breakpoints in them and inspect the current state of your page.  

### 2. The S method

Its important to realize the S command is NOT the $ command.  It is named S because it acts similarly, but it does not 
return a jQuery collection, and you can't call any jQuery methods on the result.

However, the S method accepts any valid jQuery selector, allows chaining, and lets you call many jQuery like methods on it 
(see the Getters section above).

The reason S is not $ is because when in Selenium mode, the test runs in Rhino, sending commands across Selenium into 
the browser.  So S(".foo") sends JSON to the browser via Selenium that is later used as a parameter for $.  Using $ wouldn't work, since only 
text can be sent across the Selenium bridge, not objects.

### 3. Finding the right wait

After a user clicks or types in your page, something in your page changes.  Something might appear, disappear, get wider, slide left, or show text.  
A good text will take into account what changes after an action, and perform a wait on that condition.  A bad test simply uses S.wait(1000) to wait 
1 second before the next command.  This is error prone, because under certain conditions, the page might be slower than 1 second, causing your test to 
break.

Finding the right wait makes your test bullet proof.

### 4. Debugging tests

Since you can't set breakpoints and step through actions/waits, you might wonder how you can effectively debug.  Here are a few techniques.

#### 1. Simplify

If a test isn't working, comment out all other tests and even all commands after the one thats giving you trouble.  Run the test.  If it does what you expect, 
uncomment one more command and run again.  You can focus on the one part of your test thats giving you trouble.

#### 2. Breakpoints in callbacks

Waits and actions accept a callback that run after they complete.  Inside, you can set breakpoints and inspect your page.  You can also use console.logs 
in callbacks to check conditions that are hard to inspect.

#### 3. Use FuncUnit's logs

Check Firebug's console and you'll during every command, it spits out what its doing.  If a selector isn't working, go to your app window, and use jQuery in the 
console to debug the selector.

### 5. Reuse test code

Often while writing tests for an app, you'll notice steps that need to happen over and over.  For example, you need to click a tab in a tab widget and type in an input 
to get to the screen you want to test.  You can easily create test helper functions, which allow you to DRY your tests a bit.  For example:

@codestart
var openTab = function(tabName){
	S(".tab:contains('"+tabName+"')").click();
	S(".content").visible();
}
@codeend

### 6. Do you need assertions?

As you write tests you'll begin to notice that assertions, while they give you a warm fuzzy feeling, aren't really all that necessary.  You can perform waits for 
the same conditions you'd check in assertions, your code looks more linear and readable without callbacks, and your tests will still fail if the waits fail.

For example, the following are equivalent:

@codestart
// wait for 5 li elements to be present
S(".menu li").size(5);

// check if there are 5 li elements
S(".menu").exists(function(){
	equals(S(".menu li").size(), 5, "there are 5 li's");
})
@codeend

### 7. Working with frames

If your application makes use of iframes, providing a name attribute for your iframes will make testing easier.  The second parameter of S is either the number or 
name of your iframe:

@codestart
// click ".foo" in the frame with name="myframe"
S(".foo", "myframe").click();
@codeend

If you're testing the interaction that causes the iframe to load, don't forget to perform a wait on some condition in the frame that signifies it has completed loading.

### 8. Solving login

When testing an application that requires login, the pattern that seems to work is using a login test that only runs in Selenium mode.  When running in browser, 
developers will already be logged in, so the test can be skipped.  In Selenium however, a new browser instance is opened, so login is required.  Here's an 
example of a login test that does this:

@codestart
test("login test", function () {
	if (navigator.userAgent.match(/Rhino/)) {
		S.open("/login")
		S("#username").exists().click().type("superadmin")
		S("#password").exists().click().type("password")
		S(".submit input").exists().click()
		
		// wait for next page to load
		S(".content").visible(function () {
			ok(true, "logged in");
		})
	} else {
		ok(true, "assuming you are logged in");
	}
})
@codeend

### 9. Use non-brittle selectors

To make your tests as readable and future proof as possible, try to choose jQuery selectors that are both easy to understand and not likely to change.  For example:

#### Good selector

@codestart
S(".contact:contains('Brian')");
@codeend

#### Bad selector

@codestart
S(".contact:eq(4)");
@codeend

### 10. Use pseudocode

Despite FuncUnit's easy to learn API, when you start to write a test, you're thinking in terms of user interactions, not jQuery selectors.  So the easiest way to 
write a test is to start with a method full of pseudocode, then fill in the selectors and commands.

For example:

@codestart
// click the top link
// wait for the edit form to appear
// click the first input, type Chicago
// click submit
// wait for the list to appear
@codeend

 */