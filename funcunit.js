//what we need from javascriptmvc or other places
steal.plugins('funcunit/qunit',
	'funcunit/qunit/rhino')
	.then('resources/jquery','resources/json','resources/selector')
	.plugins('funcunit/synthetic')
//Now describe FuncUnit
.then(function(){



//this gets the global object, even in rhino
var window = (function(){return this }).call(null),

//if there is an old FuncUnit, use that for settings
	oldFunc = window.FuncUnit;

/**
 * @constructor FuncUnit
 * @tag core
 * @test test.html
 * @download http://github.com/downloads/jupiterjs/funcunit/funcunit-beta-4.zip
 * FuncUnit provides powerful functional testing as an add on to [http://docs.jquery.com/QUnit QUnit].  
 * The same tests can be run 
 * in the browser, or with Selenium.  It also lets you automate basic 
 * QUnit tests in [http://www.envjs.com/ EnvJS] (a command line browser).
 * 
 * <h2>Example:</h2>
 * The following tests that an AutoSuggest returns 5 results.  
 * <a href='funcunit/autosuggest/funcunit.html'>See it in action!</a> (Make sure
 * you turn off your popup blocker!).
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
 * 
 * <h2>Basic Setup</h2>
 * <h3>Setup with JavaScriptMVC</h3>
 * If you're setting up FuncUnit with JavaScriptMVC, 
 * use [steal.static.plugins] to get the funcunit plugin.  If you used
 * JavaScriptMVC's generators, it will setup a testing skeleton for you.
 * <h3>Setup with Stand-alone funcunit.js</h3>
 * Lets say you want to test <code>pages/mypage.html</code> and 
 * you've installed funcunit in test/funcunit.</br>
 * Steps:
 * <ol>
 *  <li>Create a HTML file (pages/mypage_test.html) that loads
 *  <code><b>qunit.css</b></code>, <code><b>funcunit.js</b></code>, 
 *  and <code><b>mypage_test.js</b></code>.  We'll create mypage_test.js in step #2.
@codestart html
&lt;html>
  &lt;head>
    &lt;link   href='../funcunit/<b>qunit.css</b>'
            type='text/css'
            rel='stylesheet' />
    &lt;script src='../funcunit/<b>funcunit.js</b>'
            type='text/javascript' ></script>
    &lt;script src='<b>mypage_test.js</b>'
            type='text/javascript'></script>
    &lt;title>MyPage Test Suite&lt;/title>
  &lt;/head>
  &lt;body>
    &lt;h1 id="qunit-header">MyPage Test Suite&lt;/h1>
    &lt;h2 id="qunit-banner">&lt;/h2>
    &lt;div id="qunit-testrunner-toolbar">&lt;/div>
    &lt;h2 id="qunit-userAgent">&lt;/h2>
    &lt;ol id="qunit-tests">&lt;/ol>
  &lt;/body>
&lt;/html>
@codeend
 * </li>
 * 	<li>Create a JS file (<code>pages/mypage_test.js</code>) for your tests.  The skeleton should like:
@codestart
module("APPNAME", {
  setup: function() {
    // opens the page you want to test
    $.open("myPage.html");
  }
})
  
test("page has content", function(){
  ok( S("body *").size(), "There be elements in that there body")
})
@codeend
 *  </li>
 *  <li>Open your html page (<code>mytest.html</code>) in a browser.  Did it pass?  
 *  If not check the paths.  
 *  <div class='whisper'>P.S. Your page and test files don't have to be in the same folder; however,
 *  on the filesystem, Firefox and Chrome don't let you access parent folders.  We wanted the
 *  demo to work without having to host these files.
 *  </div>
 *  
 *  </li>
 *  <li>Now run your test in Selenium.  In windows:
@codestart text
> envjs ../../pages/mypage_test.html
@codeend
In Linux / Mac:
@codestart text
> ./envjs ../../pages/mypage_test.html
@codeend
<div class='whisper'>This will run mytest.html on the filesystem.  To run it served, just
pass in the url of your test page: <pre>envjs http://localhost/pages/mypage_test.html</pre>.
</div>
</li>
 * </ol>
 * <h2>Writing Tests</h2>
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

//waits a second
S.wait(1000);
@codeend
  </li>
  <li>Check your page in a callback:
@codestart
S('#myMenu').visible(function(){
  //check that offset is right
  equals(S('#myMenu').offset().left,
         500,
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
<ul>
	<li><code>[FuncUnit.static.open open]</code> - Opens a page.</li>
	
	<li><code>[FuncUnit.prototype.click click]</code> - clicks an element (mousedown, mouseup, click).</li>
	<li><code>[FuncUnit.prototype.dblclick dblclick]</code> - two clicks followed by a dblclick.</li>
	<li><code>[FuncUnit.prototype.rightClick rightClick]</code> - a right mousedown, mouseup, and contextmenu.</li>
	
	<li><code>[FuncUnit.prototype.type type]</code> - Types characters into an element.</li>
	
	<li><code>[FuncUnit.prototype.move move]</code> - mousemove, mouseover, and mouseouts from one element to another.</li>
	<li><code>[FuncUnit.prototype.drag drag]</code> - a drag motion from one element to another.</li>
	
	<li><code>[FuncUnit.prototype.scroll scroll]</code> - scrolls an element.</li>
</ul>

<p>Actions run asynchronously, meaning they do not complete all their events immediately.  
However, each action is queued so that you can write actions (and waits) linearly.</p>
<p>The following might simulate typing and resizing a "resizable" textarea plugin:</p>
@codestart
S.open('resizableTextarea.html');

S('textarea').click().type("Hello World");
  
S('.resizer').drag("+20 +20");
@codeend
<h3>Getters</h3>
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
<p>
As getters return synchronously, it's important that they happen after the action or wait command completes.
This is why getters are typically found in an action or wait command's callback:
</p>
The following checks that the textarea is 20 pixels taller after the drag.
@codestart
    //save textarea reference
var txtarea = S('textarea'),
	
    // save references to width and height
    startingWidth = txtarea.width(), 
    startingHeight = txtarea.height();

S.open('resizableTextarea.html');

S('textarea').click().type("Hello World");

S('.resizer').drag("+20 +20", function(){
  equals(txtarea.width(), 
         startingWidth, 
         "width stays the same");
         
  equals(txtarea.height(), 
         startingHeight+20, 
         "height got bigger");
});
@codeend
<h3>Waits</h3>
<p>Waits are used to wait for a specific condition to be met before continuing to the next wait or
action command.  Every getter commands can become a wait command when given a check value or function.  
For
example, the following waits until the width of an element is 200 pixels and tests its offset.
</p>
@codestart
var sm = S("#sliderMenu");
sm.width( 200, function(){

  var offset = sm.offset();
  equals( offset.left, 200)
  equals( offset.top, 200)
})
@codeend
<p>You can also provide a test function that when true, continues to the next action or wait command.
The following is equivalent to the previous example:
</p>
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
<p>In addition to all the getter functions, FuncUnit provides:
</p>
<ul>
  <li>[FuncUnit.static.wait S.wait] - waits a timeout before continuing.</li>
  <li>[FuncUnit.prototype.wait S().wait] - waits a timeout before continuing.</li>
  <li>[FuncUnit S(function(){})] - code runs between actions (like a wait with timeout = 0).</li>
</ul>
<h2>Automated Testing with Selenium</h2>
<p>FuncUnit has a command line mode, which allows you to run your tests as part of a checkin script or nightly build.  
The Selenium server is used to automate opening browsers, and FuncUnit commands are sent to the test window via Selenium RC.</p>

<p>The envjs script (written for both Windows and OS X/Linux), is used to load your test page (the 
same one that runs tests in the browser) in Env.js, a simulated browser running on Rhino.  The 
test page recognizes its running in the Rhino context and issues commands to Selenium accordingly.</p>

<p>Running these command line tests is simple:</p>
@codestart
my\path\to\envjs my\path\to\funcunit.html 
@codeend
<p>Configuring settings for the command line mode will be covered next.</p>
<h3>Configuration</h3>
<p>FuncUnit loads a settings.js file every time it is runs in Selenium mode.  This file defines 
configuration that tells Selenium how to run.  You can change which browsers run, their location, 
the domain to serve from, and the speed of test execution.</p>
<p>FuncUnit looks first in the same directory as the funcunit page you're running tests from for 
settings.js.  For example if you're running FuncUnit like this:</p>
@codestart
funcunit\envjs phui\combobox\funcunit.html 
@codeend
<p>It will look first for phui/combobox/settings.js.</p>
<p>Then it looks in its own root directory, where a default settings.js exists.  
This is to allow you to create different settings for different projects.</p>
<h3>Setting Browsers</h3>
<p>FuncUnit.browsers is an array that defines which browsers Selenium opens and runs your tests in.  
This is defined in settings.js.  If this null it will default to a standard set of browsers for your OS 
(FF and IE on Windows, FF on everything else).  You populate it with strings like the following:</p>
@codestart
browsers: ["*firefox", "*iexplore", "*safari", "*googlechrome"]
@codeend
<p>To define a custom path to a browser, put this in the string following the browser name like this:</p>
@codestart
browsers: ["*custom /path/to/my/browser"]
@codeend
<p>See the 
[http://release.seleniumhq.org/selenium-remote-control/0.9.0/doc/java/com/thoughtworks/selenium/DefaultSelenium.html#DefaultSelenium Selenium docs] 
for more information on customizing browsers and other settings.</p>
<h3>Filesystem for Faster Tests</h3>
<p>You might want to use envjs to open local funcunit pages, but test pages on your server.  This is possible, you 
just have to change FuncUnit.href or FuncUnit.jmvcRoot.  This file can load locally while everything else is 
using a server because it is a static file and loads static script files.</p>

<p>Set jmvcRoot to point to the location you want your pages to load from, like this:</p>
@codestart
jmvcRoot: "localhost:8000"
@codeend

<p>Then make sure your test paths contain // in them to signify something relative to the jmvcRoot.  
For example, S.open("//funcunit/test/myapp.html") would open a page at 
http://localhost:8000/funcunit/test/myapp.html.</p>

<p>To load the command page from filesystem, start your test like you normally do:</p>
@codestart
funcunit\envjs path\to\funcunit.html
@codeend

<h3>Running Served Pages</h3>
<p>Certain browsers, like Safari and Chrome, don't run Selenium tests from filesystem because 
of security resrictions.  To get around this you have to run pages served from a server.  The 
downside of this is the test takes longer to start up, compared to loading from filesystem.</p>  
<p>To do this, provide an absolute path in your envjs path, like this:</p>
@codestart
funcunit\envjs http://localhost:8000/path/to/funcunit.html
@codeend
<p>and set jmvcRoot and your paths as directed in the previous section.  This will cause the command page 
and the test pages to load from your server.</p>

<h3>Slow Mode</h3>
<p>You can slow down the amount of time between tests by setting FuncUnit.speed.  By default, FuncUnit commands 
in Selenium will run as soon as the previous command is complete.  If you set FuncUnit.speed to "slow" this 
becomes 500ms between commands.  You may also provide a number of milliseconds.  
Slow mode is useful while debugging.</p>

<h2>Limitations</h2>
<ul>
	<li>Selenium doesn't run Chrome/Opera/Safari on the filesystem.</li>
</ul>
 * 
 * @init
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
 * document.frames array to use as the context of the selector.
 */
FuncUnit = function(selector, context){
	// if someone wraps a funcunit selector
	if(selector && selector.funcunit === true){
		return selector;
	}
	if(typeof selector == "function"){
		return FuncUnit.wait(0, selector)
	}
	
	return new FuncUnit.init(selector, context)
}
/**
 * @Static
 */
window.jQuery.extend(FuncUnit,oldFunc)
window.jQuery.extend(FuncUnit,{
	//move jquery and clear it out
	jquery : jQuery.noConflict(true),
/**
 * @attribute href
 * The location of the page running the tests on the server and where relative paths passed in to [FuncUnit.static.open] will be 
 * referenced from.
 * <p>This is typically where the test page runs on the server.  It can be set before calls to [FuncUnit.static.open]:</p>
@codestart
test("opening something", function(){
  S.href = "http://localhost/tests/mytest.html"
  S.open("../myapp")
  ...
})
@codeend
 */
// href comes from settings
/**
 * @attribute jmvcRoot
 * jmvcRoot should be set to url of JMVC's root folder.  
 * <p>This is used to calculate JMVC style paths (paths that begin with  //).
 * This is the prefered method of referencing pages if
 * you want to test on the filesystem and test on the server.</p>
 * <p>This is usually set in the global config file in <code>funcunit/settings.js</code> like:</p>
@codestart
FuncUnit = {jmvcRoot: "http://localhost/script/" }
@codeend
 */
// jmvcRoot comes from settings

/**
 * Opens a page.  It will error if the page can't be opened before timeout. 
 * <h3>Example</h3>
@codestart
//a full url
S.open("http://localhost/app/app.html")

//from jmvc root (FuncUnit.jmvcRoot must be set)
S.open("//app/app.html")
@codeend

 * <h3>Paths in Selenium</h3>
 * Selenium runs the testing page from the filesystem and by default will look for pages on the filesystem unless provided a full
 * url or information that can translate a partial path into a full url. FuncUnit uses [FuncUnit.static.jmvcRoot] 
 * and [FuncUnit.static.href] to 
 * translate partial paths.
<table>
  <tr>
  	<th>path</th>
  	<th>jmvcRoot</th>
  	<th>href</th>
  	<th>resulting url</th>
  </tr>
  <tr>
    <td>//myapp/mypage.html</td>
    <td>null</td>
    <td>null</td>
    <td>file:///C:/development/cookbook/public/myapp/mypage.html</td>
  </tr>
  <tr>
    <td>//myapp/mypage.html</td>
    <td>http://localhost/</td>
    <td></td>
    <td>http://localhost/myapp/mypage.html</td>
  </tr>
  <tr>
    <td>http://foo.com</td>
    <td></td>
    <td></td>
    <td>http://foo.com</td>
  </tr>
  <tr>
  	<td>../mypage.html</td>
    <td></td>
    <td>http://localhost/myapp/funcunit.html</td>
    <td>http://localhost/mypage.html</td>
  </tr>
</table>
 * 
 * @param {String} path a full or partial url to open.  If a partial is given, 
 * @param {Function} callback
 * @param {Number} timeout
 */
open: function( path, callback, timeout ) {
	var fullPath = FuncUnit.getAbsolutePath(path), 
	temp;
	if(typeof callback != 'function'){
		timeout = callback;
		callback = undefined;
	}
	FuncUnit.add({
		method: function(success, error){ //function that actually does stuff, if this doesn't call success by timeout, error will be called, or can call error itself
			steal.dev.log("Opening " + path)
			FuncUnit._open(fullPath, error);
			FuncUnit._onload(function(){
				FuncUnit._opened();
				success()
			}, error);
		},
		callback: callback,
		error: "Page " + path + " not loaded in time!",
		timeout: timeout || 30000
	});
},
/**
 * @hide
 * Gets a path, will use steal if present
 * @param {String} path
 */
getAbsolutePath: function( path ) {
	if(typeof(steal) == "undefined"){
		return path;
	}
	var fullPath, 
		root = FuncUnit.jmvcRoot || steal.root.path;
	
	if (/^\/\//.test(path)) {
		fullPath = new steal.File(path.substr(2)).joinFrom(root);
	}
	else {
		fullPath = path;
	}
	
	if(/^http/.test(path))
		fullPath = path;
	return fullPath;
},
/**
 * @attribute browsers
 * Used to configure the browsers selenium uses to run FuncUnit tests.
 * If you need to learn how to configure selenium, and we haven't filled in this page,
 * post a note on the forum and we will fill this out right away.
 */
// for feature detection
support : {},
/**
 * @attribute window
 * Use this to refer to the window of the application page.  You can also 
 * reference window.document.
 * @codestart
 * S(S.window).innerWidth(function(w){
 *   ok(w > 1000, "window is more than 1000 px wide")
 * })
 * @codeend
 */
window : {
	document: {}
},
_opened: function() {}
});


(function(){
	//the queue of commands waiting to be run
	var queue = [], 
		//are we in a callback function (something we pass to a FuncUnit plugin)
		incallback = false,
		//where we should add things in a callback
		currentPosition = 0;
		
	
	FuncUnit.
	/**
	 * @hide
	 * Adds a function to the queue.  The function is passed within an object that
	 * can have several other properties:
	 * method : the method to be called.  It will be provided a success and error function to call
	 * callback : an optional callback to be called after the function is done
	 * error : an error message if the command fails
	 * timeout : the time until success should be called
	 * bind : an object that will be 'this' of the success
	 * stop : 
	 */
	add = function(handler){
		
		//if we are in a callback, add to the current position
		if (incallback) {
			queue.splice(currentPosition,0,handler)
			currentPosition++;
		}
		else {
			//add to the end
			queue.push(handler);
		}
		//if our queue has just started, stop qunit
		//call done to call the next command
        if (queue.length == 1 && ! incallback) {
			stop();
            setTimeout(FuncUnit._done, 13)
        }
	}
	//this is called after every command
	// it gets the next function from the queue
	FuncUnit._done = function(){
		var next, 
			timer,
			speed = 0;
			
		if(FuncUnit.speed == "slow"){
			speed = 500;
		}
		else if (FuncUnit.speed){
			speed = FuncUnit.speed;
		}
		if (queue.length > 0) {
			next = queue.shift();
			currentPosition = 0;
			// set a timer that will error
			
			
			//call next method
			setTimeout(function(){
				timer = setTimeout(function(){
						next.stop && next.stop();
						ok(false, next.error);
						FuncUnit._done();
					}, 
					(next.timeout || 10000) + speed)
				
				next.method(	//success
					function(){
						//make sure we don't create an error
						clearTimeout(timer);
						
						//mark in callback so the next set of add get added to the front
						
						incallback = true;
						if (next.callback) 
							next.callback.apply(next.bind || null, arguments);
						incallback = false;
						
						
						FuncUnit._done();
					}, //error
					function(message){
						clearTimeout(timer);
						ok(false, message);
						FuncUnit._done();
					})
				
				
			}, speed);
			
		}
		else {
			start();
		}
	}
	FuncUnit.
	/**
	 * Waits a timeout before running the next command.  Wait is an action and gets 
	 * added to the queue.
	 * @codestart
	 * S.wait(100, function(){
	 *   equals( S('#foo').innerWidth(), 100, "innerWidth is 100");
	 * })
	 * @codeend
	 * @param {Number} [time] The timeout in milliseconds.  Defaults to 5000.
	 * @param {Function} [callback] A callback that will run 
	 * 		after the wait has completed, 
	 * 		but before any more queued actions.
	 */
	wait = function(time, callback){
		if(typeof time == 'function'){
			callback = time;
			time = undefined;
		}
		time = time != null ? time : 5000
		FuncUnit.add({
			method : function(success, error){
				steal.dev.log("Waiting "+time)
				setTimeout(success, time)
			},
			callback : callback,
			error : "Couldn't wait!",
			timeout : time + 1000
		});
		return this;
	}
	/**
	 * @hide
	 * @function repeat
	 * Takes a function that will be called over and over until it is successful.
	 */
	FuncUnit.repeat = function(checker, callback, error, timeout){
		var interval,
			stopped = false	,
			stop = function(){
				clearTimeout(interval)
				stopped = true;
			};

		FuncUnit.add({
			method : function(success, error){
				interval = setTimeout(function(){
					
					var result = null;
					try {
						result = checker()
					} 
					catch (e) {
						//should we throw this too error?
					}
					
					if (result) {
						success();
					}else if(!stopped){
						interval = setTimeout(arguments.callee, 10)
					}
					
				}, 10);
				
				
			},
			callback : callback,
			error : error,
			timeout : timeout,
			stop : stop
		});
		
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
	 * @hide
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

})();


/**
 * @prototype
 */
FuncUnit.init = function(s, c){
	this.selector = s;
	this.context = c == null ? FuncUnit.window.document : c;
}
FuncUnit.init.prototype = {
	funcunit : true,
	/**
	 * Types text into an element.  This makes use of [Syn.prototype.type] and works in 
	 * a very similar way.
	 * <h3>Quick Examples</h3>
	 * @codestart
	 * //types hello world
	 * S('#bar').type('hello world')
	 * 
	 * //submits a form by typing \r
	 * S("input[name=age]").type("27\r")
	 * 
	 * //types FuncUnit, then deletes the Unit
	 * S('#foo').type("FuncUnit\b\b\b\b")
	 * 
	 * //types JavaScriptMVC, then removes the MVC
	 * S('#zar').type("JavaScriptMVC[left][left][left]"+
	 *                      "[delete][delete][delete]")
	 *          
	 * //types JavaScriptMVC, then selects the MVC and
	 * //deletes it
	 * S('#zar').type("JavaScriptMVC[shift]"+
	 *                "[left][left][left]"+
	 *                "[shift-up][delete]")
	 * @codeend
	 * <h2>Characters</h2>
	 * You can type the characters found in [Syn.static.keycodes].
	 * 
	 * @param {String} text the text you want to type
	 * @param {Function} [callback] a callback that is run after typing, but before the next action.
	 * @return {FuncUnit} returns the funcUnit for chaining.
	 */
	type: function( text, callback ) {
		var selector = this.selector, 
			context = this.context;
		FuncUnit.add({
			method : function(success, error){
				steal.dev.log("Typing "+text+" on "+selector)
				FuncUnit.$(selector, context, "triggerSyn", "_type", text, success)
			},
			callback : callback,
			error : "Could not type " + text + " into " + this.selector,
			bind : this
		});
		return this;
	},
	/**
	 * Waits until an element exists before running the next action.
	 * @codestart
	 * //waits until #foo exists before clicking it.
	 * S("#foo").exists().click()
	 * @codeend
	 * @param {Function} [callback] a callback that is run after the selector exists, but before the next action.
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	exists: function( callback ) {
		if(true){
			return this.size(function(size){
				return size > 0;
			}, callback)
		}
		return this.size() == 0;
	},
	/**
	 * Waits until no elements are matched by the selector.  Missing is equivalent to calling
	 * <code>.size(0, callback);</code>
	 * @codestart
	 * //waits until #foo leaves before continuing to the next action.
	 * S("#foo").missing()
	 * @codeend
	 * @param {Function} [callback] a callback that is run after the selector exists, but before the next action
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	missing: function( callback ) {
		return this.size(0, callback)
	},
	/**
	 * Waits until the funcUnit selector is visible.  
	 * @codestart
	 * //waits until #foo is visible.
	 * S("#foo").visible()
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the funcUnit is visible, but before the next action.
	 * @return [funcUnit] returns the funcUnit for chaining.
	 */
	visible: function( callback ) {
		var self = this,
			sel = this.selector,
			ret;
		this.selector += ":visible"
		if(true){
			return this.size(function(size){
				return size > 0;
			}, function(){
				self.selector = sel;
				callback && callback();
			})
		}else{
			ret = this.size() > 0;
			this.selector = sel;
			return ret;
		}
		
	},
	/**
	 * Waits until the selector is invisible.  
	 * @codestart
	 * //waits until #foo is invisible.
	 * S("#foo").invisible()
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the selector is invisible, but before the next action.
	 * @return [funcUnit] returns the funcUnit selector for chaining.
	 */
	invisible: function( callback ) {
		var self = this,
			sel = this.selector,
			ret;
		if(true){
			this.selector += ":visible"
			return this.size(0, function(){
				self.selector = sel;
				callback && callback();
			})
		}else{
			ret = this.size() == 0;
			this.selector = sel;
			return ret;
		}
		
	},
	/**
	 * Drags an element into another element or coordinates.  
	 * This takes the same paramameters as [Syn.prototype.move move].
	 * @param {String|Object} options A selector or coordinates describing the motion of the drag.
	 * <h5>Options as a Selector</h5>
	 * Passing a string selector to drag the mouse.  The drag runs to the center of the element
	 * matched by the selector.  The following drags from the center of #foo to the center of #bar.
	 * @codestart
	 * S('#foo').drag('#bar') 
	 * @codeend
	 * <h5>Options as Coordinates</h5>
	 * You can pass in coordinates as clientX and clientY:
	 * @codestart
	 * S('#foo').drag('100x200') 
	 * @codeend
	 * Or as pageX and pageY
	 * @codestart
	 * S('#foo').drag('100X200') 
	 * @codeend
	 * Or relative to the start position
	 * S('#foo').drag('+10 +20')
	 * <h5>Options as an Object</h5>
	 * You can configure the duration, start, and end point of a drag by passing in a json object.
	 * @codestart
	 * //drags from 0x0 to 100x100 in 2 seconds
	 * S('#foo').drag({
	 *   from: "0x0",
	 *   to: "100x100",
	 *   duration: 2000
	 * }) 
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the drag, but before the next action.
	 * @return {funcUnit} returns the funcunit selector for chaining.
	 */
	drag: function( options, callback ) {
		if(typeof options == 'string'){
			options = {to: options}
		}
		options.from = this.selector;

		var selector = this.selector, 
			context = this.context;
		FuncUnit.add({
			method: function(success, error){
				steal.dev.log("dragging " + selector)
				FuncUnit.$(selector, context, "triggerSyn", "_drag", options, success)
			},
			callback: callback,
			error: "Could not drag " + this.selector,
			bind: this
		})
		return this;
	},
		/**
	 * Moves an element into another element or coordinates.  This will trigger mouseover
	 * mouseouts accordingly.
	 * This takes the same paramameters as [Syn.prototype.move move].
	 * @param {String|Object} options A selector or coordinates describing the motion of the move.
	 * <h5>Options as a Selector</h5>
	 * Passing a string selector to move the mouse.  The move runs to the center of the element
	 * matched by the selector.  The following moves from the center of #foo to the center of #bar.
	 * @codestart
	 * S('#foo').move('#bar') 
	 * @codeend
	 * <h5>Options as Coordinates</h5>
	 * You can pass in coordinates as clientX and clientY:
	 * @codestart
	 * S('#foo').move('100x200') 
	 * @codeend
	 * Or as pageX and pageY
	 * @codestart
	 * S('#foo').move('100X200') 
	 * @codeend
	 * Or relative to the start position
	 * S('#foo').move('+10 +20')
	 * <h5>Options as an Object</h5>
	 * You can configure the duration, start, and end point of a move by passing in a json object.
	 * @codestart
	 * //drags from 0x0 to 100x100 in 2 seconds
	 * S('#foo').move({
	 *   from: "0x0",
	 *   to: "100x100",
	 *   duration: 2000
	 * }) 
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the drag, but before the next action.
	 * @return {funcUnit} returns the funcunit selector for chaining.
	 */
	move: function( options, callback ) {
		if(typeof options == 'string'){
			options = {to: options}
		}
		options.from = this.selector;

		var selector = this.selector, 
			context = this.context;
		FuncUnit.add({
			method: function(success, error){
				steal.dev.log("moving " + selector)
				FuncUnit.$(selector, context, "triggerSyn", "_move", options, success)
			},
			callback: callback,
			error: "Could not move " + this.selector,
			bind: this
		});
		return this;
	},
	/**
	 * Scrolls an element in a particular direction by setting the scrollTop or srollLeft.
	 * @param {String} direction "left" or "top"
	 * @param {Number} amount number of pixels to scroll
	 * @param {Function} callback
	 */
	scroll: function( direction, amount, callback ) {
		var selector = this.selector, 
			context = this.context,
			direction = /left|right|x/i.test(direction)? "Left" : "Right";
		FuncUnit.add({
			method: function(success, error){
				steal.dev.log("setting " + selector + " scroll" + direction + " " + amount + " pixels")
				FuncUnit.$(selector, context, "scroll" + direction, amount)
				success();
			},
			callback: callback,
			error: "Could not scroll " + this.selector,
			bind: this
		});
		return this;
	},
	/**
	 * Waits a timeout before calling the next action.  This is the same as
	 * [FuncUnit.prototype.wait].
	 * @param {Number} [timeout]
	 * @param {Object} callback
	 */
	wait: function( timeout, callback ) {
		FuncUnit.wait(timeout, callback)
	},
	/**
	 * Returns a FuncUnit wrapped selector with 
	 * selector appended to the current selector.
	 * @codestart
	 * S('#foo').find(".bar") //-> S("#foo .bar")
	 * @codeend
	 * @param {String} selector
	 * @return {FuncUnit} the funcunit wrapped selector.
	 */

	find : function(selector){
		return FuncUnit(this.selector+" "+selector, this.context);
	}
};
//do traversers
var traversers = ["closest",


"next","prev","siblings","last","first"],
	makeTraverser = function(name){
		FuncUnit.init.prototype[name] = function(selector){
			return FuncUnit( FuncUnit.$(this.selector, this.context, name+"Selector", selector) )
		}
	};
for(var i  =0; i < traversers.length; i++){
	makeTraverser(traversers[i]);
}

// do clicks
var clicks = [
/**
 * @function click
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
 * S("#bar").click()
 * @codeend
 * @param {Object} [options] options to pass to the click event.  Typically, this is clientX/Y or pageX/Y like:
 * @codestart
 * $('#foo').click({pageX: 200, pageY: 100});
 * @codeend
 * You can pass it any of the serializable parameters you'd send to : 
 * [http://developer.mozilla.org/en/DOM/event.initMouseEvent initMouseEvent], but command keys are 
 * controlled by [FuncUnit.prototype.type].
 * @param {Function} [callback] a callback that runs after the click, but before the next action.
 * @return {funcUnit} returns the funcunit selector for chaining.
 */
'click',
/**
 * @function dblclick
 * Double clicks an element by [FuncUnit.prototype.click clicking] it twice and triggering a dblclick event.
 * @param {Object} options options to add to the mouse events.  This works
 * the same as [FuncUnit.prototype.click]'s options.
 * @param {Function} [callback] a callback that runs after the double click, but before the next action.
 * @return {funcUnit} returns the funcunit selector for chaining.
 */
'dblclick',
/**
 * @function rightClick
 * Right clicks an element.  This typically results in a contextmenu event for browsers that
 * support it.
 * @param {Object} options options to add to the mouse events.  This works
 * the same as [FuncUnit.prototype.click]'s options.
 * @param {Function} [callback] a callback that runs after the click, but before the next action.
 * @return {funcUnit} returns the funcunit selector for chaining.
 */
'rightClick'],
	makeClick = function(name){
		FuncUnit.init.prototype[name] = function(options, callback){
			if(typeof options == 'function'){
				callback = options;
				options = {};
			}
			var selector = this.selector, 
				context = this.context;
			FuncUnit.add({
				method: function(success, error){
					options = options || {}
					steal.dev.log("Clicking " + selector)
					FuncUnit.$(selector, context, "triggerSyn", "_" + name, options, success)
				},
				callback: callback,
				error: "Could not " + name + " " + this.selector,
				bind: this
			});
			return this;
		}
	}

for(var i=0; i < clicks.length; i++){
	makeClick(clicks[i])
}


//list of jQuery functions we want, number is argument index
//for wait instead of getting value
FuncUnit.funcs = {
/**
 * @function size
 * Gets the number of elements matched by the selector or
 * waits until the the selector is size.  You can also 
 * provide a function that continues to the next action when
 * it returns true.
 * @codestart
 * S(".recipe").size() //gets the number of recipes
 * 
 * S(".recipe").size(2) //waits until there are 2 recipes
 * 
 * //waits until size is count
 * S(".recipe").size(function(size){
 *   return size == count;
 * })
 * @codeend
 * @param {Number|Function} [size] number or a checking function.
 * @param {Function} a callback that will run after this action completes.
 * @return {Number} if the size parameter is not provided, size returns the number
 * of elements matched.
 */
'size' : 0,
/**
 * @attr data
 * Gets data from jQuery.data or waits until data
 * equals some value.  
 * @codestart
 * S("#something").data("abc") //gets the abc data
 * 
 * S("#something").data("abc","some") //waits until the data == some
 * @codeend
 * @param {String} data The data to get, or wait for.
 * @param {Object|Function} [value] If provided uses this as a check before continuing to the next action.
 * @param {Function} a callback that will run after this action completes.
 * @return {Object} if the size parameter is not provided, returns
 * the object.
 */
'data': 1, 
/**
 * @function attr
 * Gets the value of an attribute from an element or waits until the attribute
 * equals the attr param.
 * @codestart
 *  //gets the abc attribute
 * S("#something").attr("abc")
 * 
 * //waits until the abc attribute == some
 * S("#something").attr("abc","some") 
 * @codeend
 * @param {String} data The attribute to get, or wait for.
 * @param {String|Function} [value] If provided uses this as a check before continuing to the next action.
 * @param {Function} a callback that will run after this action completes.
 * @return {Object} if the attr parameter is not provided, returns
 * the attribute.
 */
'attr' : 1, 
/**
 * @function hasClass
 * @codestart
 * //returns if the element has the class in its className
 * S("#something").hasClass("selected");
 * 
 * //waits until #something has selected in its className
 * S("#something").hasClass("selected",true);
 * 
 * //waits until #something does not have selected in its className
 * S("#something").hasClass("selected",false);
 * @codeend
 * @param {String} className The part of the className to search for.
 * @param {Boolean|Function} [value] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {Boolean|funcUnit} if the value parameter is not provided, returns
 * if the className is found in the element's className.  If a value paramters is provided, returns funcUnit for chaining.
 */
'hasClass' : 1, //makes wait
/**
 * @function html
 * Gets the [http://api.jquery.com/html/ html] from an element or waits until the html is a certain value.
 * @codestart
 * //checks foo's html has "JupiterJS"
 * ok( /JupiterJS/.test( S('#foo').html() ) )
 * 
 * //waits until bar's html has JupiterJS
 * S('#foo').html(/JupiterJS/)
 * 
 * //waits until bar's html is JupiterJS
 * S('#foo').html("JupiterJS")
 * @codeend
 * 
 * @param {String|Function} [html] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the html parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
 */
'html' : 0, 
/**
 * @function text
 * Gets the [http://api.jquery.com/text/ text] from an element or waits until the text is a certain value.
 * @codestart
 * //checks foo's text has "JupiterJS"
 * ok( /JupiterJS/.test( S('#foo').text() ) )
 * 
 * //waits until bar's text has JupiterJS
 * S('#foo').text(/JupiterJS/)
 * 
 * //waits until bar's text is JupiterJS
 * S('#foo').text("JupiterJS")
 * @codeend
 * 
 * @param {String|Function} [text] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the text parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
 */
'text' : 0, 
/**
 * @function val
 * Gets the [http://api.jquery.com/val/ val] from an element or waits until the val is a certain value.
 * @codestart
 * //checks foo's val has "JupiterJS"
 * ok( /JupiterJS/.test( S('input#foo').val() ) )
 * 
 * //waits until bar's val has JupiterJS
 * S('input#foo').val(/JupiterJS/)
 * 
 * //waits until bar's val is JupiterJS
 * S('input#foo').val("JupiterJS")
 * @codeend
 * 
 * @param {String|Function} [val] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the val parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
 */
'val' : 0, 
/**
 * @function css
 * Gets a [http://api.jquery.com/css/ css] property from an element or waits until the property is 
 * a specified value.
 * @codestart
 * // gets the color
 * S("#foo").css("color")
 * 
 * // waits until the color is red
 * S("#foo").css("color","red") 
 * @codeend
 * 
 * @param {String} prop A css property to get or wait until it is a specified value.
 * @param {String|Function} [val] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the val parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the css of the selector.
 */
'css': 1, 
/**
 * @function offset
 * Gets an element's [http://api.jquery.com/offset/ offset] or waits until 
 * the offset is a specified value.
 * @codestart
 * // gets the offset
 * S("#foo").offset();
 * 
 * // waits until the offset is 100, 200
 * S("#foo").offset({top: 100, left: 200}) 
 * @codeend
 * 
 * @param {Object|Function} [offset] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the offset parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the css of the selector.
 */
'offset' : 0,
/**
 * @function position
 * Gets an element's [http://api.jquery.com/position/ position] or waits until 
 * the position is a specified value.
 * @codestart
 * // gets the position
 * S("#foo").position();
 * 
 * // waits until the position is 100, 200
 * S("#foo").position({top: 100, left: 200}) 
 * @codeend
 * 
 * @param {Object|Function} [position] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the position parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the offset of the selector.
 */
'position' : 0,
/**
 * @function scrollTop
 * Gets an element's [http://api.jquery.com/scrollTop/ scrollTop] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the scrollTop
 * S("#foo").scrollTop();
 * 
 * // waits until the scrollTop is 100
 * S("#foo").scrollTop(100) 
 * @codeend
 * 
 * @param {Number|Function} [scrollTop] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if scrollTop is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the scrollTop of the selector.
 */ 
'scrollTop' : 0, 
/**
 * @function scrollLeft
 * Gets an element's [http://api.jquery.com/scrollLeft/ scrollLeft] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the scrollLeft
 * S("#foo").scrollLeft();
 * 
 * // waits until the scrollLeft is 100
 * S("#foo").scrollLeft(100) 
 * @codeend
 * 
 * @param {Number|Function} [scrollLeft] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if scrollLeft is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the scrollLeft of the selector.
 */ 
'scrollLeft' : 0, 
/**
 * @function height
 * Gets an element's [http://api.jquery.com/height/ height] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the height
 * S("#foo").height();
 * 
 * // waits until the height is 100
 * S("#foo").height(100) 
 * @codeend
 * 
 * @param {Number|Function} [height] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if height is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the height of the selector.
 */
'height' : 0, 
/**
 * @function width
 * Gets an element's [http://api.jquery.com/width/ width] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the width
 * S("#foo").width();
 * 
 * // waits until the width is 100
 * S("#foo").width(100) 
 * @codeend
 * 
 * @param {Number|Function} [width] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if width is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the width of the selector.
 */
'width' : 0, 
/**
 * @function innerHeight
 * Gets an element's [http://api.jquery.com/innerHeight/ innerHeight] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the innerHeight
 * S("#foo").innerHeight();
 * 
 * // waits until the innerHeight is 100
 * S("#foo").innerHeight(100) 
 * @codeend
 * 
 * @param {Number|Function} [innerHeight] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if innerHeight is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the innerHeight of the selector.
 */
'innerHeight' : 0, 
/**
 * @function innerWidth
 * Gets an element's [http://api.jquery.com/innerWidth/ innerWidth] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the innerWidth
 * S("#foo").innerWidth();
 * 
 * // waits until the innerWidth is 100
 * S("#foo").innerWidth(100) 
 * @codeend
 * 
 * @param {Number|Function} [innerWidth] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if innerWidth is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the innerWidth of the selector.
 */
'innerWidth' : 0, 
/**
 * @function outerHeight
 * Gets an element's [http://api.jquery.com/outerHeight/ outerHeight] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the outerHeight
 * S("#foo").outerHeight();
 * 
 * // waits until the outerHeight is 100
 * S("#foo").outerHeight(100) 
 * @codeend
 * 
 * @param {Number|Function} [outerHeight] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if outerHeight is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the outerHeight of the selector.
 */
'outerHeight' : 0, 
/**
 * @function outerWidth
 * Gets an element's [http://api.jquery.com/outerWidth/ outerWidth] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the outerWidth
 * S("#foo").outerWidth();
 * 
 * // waits until the outerWidth is 100
 * S("#foo").outerWidth(100) 
 * @codeend
 * 
 * @param {Number|Function} [outerWidth] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if outerWidth is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the outerWidth of the selector.
 */
'outerWidth' : 0}


//makes a jQuery like command.
FuncUnit.makeFunc = function(fname, argIndex){
	
	//makes a read / wait function
	FuncUnit.init.prototype[fname] = function(){
		//assume last arg is callback
		var args = FuncUnit.makeArray(arguments), 
			callback,
			isWait = args.length > argIndex,
			callback;
		
		args.unshift(this.selector,this.context,fname)

		if(isWait){
			//get the args greater and equal to argIndex
			var tester = args[argIndex+3],
				timeout = args[argIndex+4],
				callback = args[argIndex+5],
				testVal = tester,
				errorMessage = "waiting for "+fname +" on " + this.selector;
			
			if(typeof timeout == 'function'){
				callback = timeout;
				timeout = undefined;
			}
			
			args.splice(argIndex+3, args.length- argIndex - 3);
			
			if(typeof tester != 'function'){
				errorMessage += " !== "+testVal
				tester = function(val){
					
					return QUnit.equiv(val, testVal) || 
						(testVal instanceof RegExp && testVal.test(val) );
				}
			}
			FuncUnit.repeat(function(){
					var ret = FuncUnit.$.apply(FuncUnit.$, args);
					return tester(ret);
				}, callback, errorMessage, timeout)

			return this;
		}else{
			//get the value
			steal.dev.log("Getting "+fname+" on "+this.selector)
			return FuncUnit.$.apply(FuncUnit.$, args);
		}
	}
}
	


for (var prop in FuncUnit.funcs) {
	FuncUnit.makeFunc(prop, FuncUnit.funcs[prop]);
}


S = FuncUnit;


})
//now add drivers
.then('resources/selenium_start',
'drivers/selenium',
'drivers/standard')
