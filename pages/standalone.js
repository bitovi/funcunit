/**
 * 
@page FuncUnit.standalone Standalone FuncUnit
@parent FuncUnit
While FuncUnit is most often used as a JavaScriptMVC component, it can also be used 
on its own.  This guide will get you started with the standalone package.

First [https://github.com/jupiterjs/funcunit/downloads download] the latest FuncUnit package.

## Setup
Lets say you want to test pages/mypage.html and you've installed funcunit in test/funcunit.</br>
Steps:
 - Create a HTML file (pages/mypage_test.html) that loads <code><b>qunit.css</b></code>, 
<code><b>funcunit.js</b></code>, and <code><b>mypage_test.js</b></code>.  We'll create mypage_test.js in step #2.
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
 - Create a JS file (pages/mypage_test.js) for your tests.  The skeleton should like:
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
 - Open your html page (mytest.html) in a browser.  Did it pass?  If not check the paths.  
<div class='whisper'>P.S. Your page and test files don't have to be in the same folder; however, 
on the filesystem, Firefox and Chrome don't let you access parent folders.  We wanted the demo to work 
without having to host these files.</div>
 - Now run your test in Selenium.  In windows:
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
 */