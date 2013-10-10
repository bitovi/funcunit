@page funcunit.integrations Integrations
@parent FuncUnit.pages 5

@body
FuncUnit integrates with third party browser automation and build tools.

## Browser automation

To integrate FuncUnit tests with QA automation, FuncUnit tests can be launched by several methods.

[funcunit.selenium Selenium] launches visual browsers. It runs selenium tests and reports results to the 
commandline.

    ./js funcunit/open/selenium path/to/funcunit.html

[funcunit.envjs Envjs] is a simulated browser environment that runs in Rhino. It does not support visual 
simulation, like clicking or dragging, but can be used for basic unit testing.

    ./js funcunit/open/envjs path/to/qunit.html

[funcunit.phantomjs PhantomJS] is a headless version of WebKit. It supports runnning full FuncUnit tests 
without actually launching a browser. It is faster than using Selenium to launch browsers.

    ./js funcunit/open/phantomjs path/to/funcunit.html

## Build tools

Using browser automation tools, FuncUnit can be integrated into the project build.

[funcunit.grunt Grunt] is a task-based command line build tool for JavaScript projects. FuncUnit tests can be run 
as a grunt build step. When tests fail, the build also fails.

[funcunit.maven Maven] is a build tool used with Java projects. FuncUnit tests can be run 
as a maven build step. When tests fail, the build also fails.

[funcunit.jenkins Jenkins] is a continuous integration tool, used to continuously run builds, tests, and 
report on the health of the codebase. FuncUnit can be tied into Jenkins and made to fail the Jenkins build 
if FuncUnit tests aren't passing, which would alert developers of problems immediately. 

[http://xunit.codeplex.com XUnit] is a unit testing framework for .NET, whose reporting format is now used in tools across different platforms.  XUnit defines a [http://xunit.codeplex.com/wikipage?title=XmlFormat standard XML test output file format]. 

To turn on the FuncUnit XUnit reporter, supply a -out parameter on the commandline like:

    ./js funcunit/open/phantomjs path/to/funcunit.html -out "output.xml"

Tools like Jenkins can read this format.  If you turn on the XUnit reporter, every time FuncUnit runs a test 
file called <code>testresults.xml</code> is written to the main directory of your project. 

Results are also printed to the console in an easy to read format.

    MABOSBMOSCHE-M1:jmvc31 bmoschel$ ./js 
      funcunit/run phantomjs cookbook/funcunit.html 
    Using Default Settings
    starting steal.browser.phantomjs

    recipe
      recipes present
        [x] There is at least one recipe
      create recipes
        [x] Typed Ice
      edit recipes
        [x] Typed Cold Tap Water
      destroy
        [x] Typed Ice Water
        [x] 

    Time: 11 seconds, Memory: 81.06 MB

    OK (4 tests, 5 assertions)