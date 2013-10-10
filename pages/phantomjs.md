@page funcunit.phantomjs PhantomJS
@parent funcunit.integrations 2

@body
[http://www.phantomjs.org/ PhantomJS] is a headless WebKit. FuncUnit integrates with Phantom to run 
tests from the commandline.  This has large performance benefits, enough that it makes it much more 
feasible to integrate FuncUnit tests into your build process without significantly slowing it down.

FuncUnit supports running in phantom two ways: via Rhino (like the rest of JMVC) and via NodeJS (the future of JMVC).

## Rhino Mode

The advantage to Rhino mode is there is little additional setup.  If you're already using JMVC, you have Java installed, so all you must do is install PhantomJS.

The disadvantage to Rhino mode is, due to a compatibility issue, it is required to use an old version of Phantom - 1.3.0.

### Install

Before you can use PhantomJS, you have to install it. The other automation tools come prepackaged in 
JMVC, but Phantom is too large of a download.

Note: There is a known issue with Phantom 1.4.0+ in Rhino Mode.  Please be sure to use Phantom 1.3.0 to avoid Broken Pipe errors.  

__On Mac__

1. Download [http://code.google.com/p/phantomjs/downloads/detail?name=phantomjs-1.3.0-macosx-static-x86.zip&can=2&q= PhantomJS]
1. Unzip it somewhere like: _/Applications/_
1. Add it to your path:

@codestart
sudo ln -s /Applications/phantomjs-1.3.0/bin/phantomjs /usr/local/bin/
@codeend

_Note: Not all systems will have /usr/local/bin/.  Some systems will have: /usr/bin/, /bin/, or usr/X11/bin instead._

__On Windows__

1. Download [http://code.google.com/p/phantomjs/downloads/detail?name=phantomjs-1.3.0-win32-dynamic.zip&can=2&q= PhantomJS]
1. Install it
1. Add it to your path.  For information on setting path variable in Windows, [http://www.java.com/en/download/help/path.xml click here].

### Use

To run any test via PhantomJS:

@codestart
./js funcunit/open/phantomjs http://localhost/path/to/funcunit.html
@codeend

## NodeJS Mode

The advantage to NodeJS mode is Node is faster than Rhino and can integrate with [funcunit.grunt GruntJS.

The disadvantage to NodeJS mode is you have to install and setup Node and NPM.

### Install

1. Install [http://nodejs.org/download/ NodeJS].  It should come with [https://npmjs.org/ NPM] - Node's package manager.
1. Install the latest [http://phantomjs.org/download.html PhantomJS].  Make sure the binary is in your PATH - Instructions on this are listed above in Rhino Mode Install.
1. <code>cd funcunit</code> and <code>npm install</code> to install FuncUnit's node module dependencies.

### Use

To run any test via PhantomJS in NodeJS:

@codestart
node node funcunit/node/run.js http://localhost/path/to/funcunit.html
@codeend

## Differences between Phantom and other browsers

### Drag events

Note that Phantom emulates mobile Webkit, so it provides support for touch events.  Because of this, FuncUnit drag actions don't work in Phantom.

### Iframe vs window.open

In Rhino mode, calling S.open will open an iframe in the funcunit.html page, rather than a separate window via window.open. Phantom 1.3.0 doesn't support window.open, so a frame is used instead. This can occassionally cause problems if your application assumes it is running within window.top.

In NodeJS mode we're running off latest Phantom 1.8.0 that does support window.open, so this isn't an issue.

## Debugging

If you notice a broken test, debugging it in Phantom is not the place to start. Open the test in browser, and 
verify the same test breaks there.  If so, debug the test in browser.

If you notice the more rare event that a test breaks in Phantom but works in browser, you can use console.log 
to debug it. In <code>steal/browser/phantomjs/launcher.js</code>, uncomment the page.onConsoleMessage function. Add console.logs to your code and debug.



