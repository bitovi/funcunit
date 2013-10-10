@page funcunit.selenium Selenium
@parent funcunit.integrations 0

@body
[http://seleniumhq.org/ Selenium] is a browser automation tool. FuncUnit integrates with Selenium, 
using it to open several browsers and report results.

## Use

There is no installation step with Selenium. The jar files come prepackaged with FuncUnit.

1. Write a functional test
1. Run with Selenium

@codestart
./js funcunit/open/selenium path/to/funcunit.html
@codeend

## Other browsers

By default, selenium will try to open firefox if your system has it installed.

To run your tests in another browser, supply a commandline parameter like:

    ./js funcunit/open/selenium http://localhost/funcunit.html 
      -browser *safari

Other browsers include: *firefox, *iexploreproxy, *safari, *googlechrome.

To define a custom path to a browser, put this in the string following the browser name.

    ./js funcunit/open/selenium http://localhost/funcunit.html 
      -browser "*custom /path/to/my/browser"

See the [http://release.seleniumhq.org/selenium-remote-control/0.9.0/doc/java/com/thoughtworks/selenium/DefaultSelenium.html#DefaultSelenium Selenium docs] 
for more information on customizing browsers.

## Troubleshooting

### 64-bit Java

Some users will find Selenium has trouble opening while using 64 bit java (on Windows).  You will see an error like  

Could not start Selenium session: Failed to start new browser session.  

This is because Selenium looks in the 64-bit Program Files directory, and there is no Firefox there.  To fix this, change browsers to include the path like this:

    ./js funcunit/open/selenium http://localhost/funcunit.html 
      -browser "*firefox C:\\PROGRA~2\\MOZILL~1\\firefox.exe"

### Running From Safari and Chrome

Certain browsers, like Safari and Chrome, don't run Selenium tests from filesystem because 
of security resrictions.  You must run pages from a server.

To run Safari 5 in Windows, you should use the safariproxy browser string.

    -browser *safariproxy

Mac Safari is just "*safari".

### Slow Mode
You can slow down the amount of time between tests by setting FuncUnit.speed.  By default, FuncUnit commands 
in Selenium will run as soon as the previous command is complete.  If you set FuncUnit.speed to "slow" this 
becomes 500ms between commands.  You may also provide a number of milliseconds.  Slow mode can be useful while debugging.


### IE Troubleshooting

If IE isn't running test pages from filesystem, disable security settings for pages that run from the filesystem. 

1. Open the Internet Options in IE and select the "Advanced" tab
1. Enable the option to "Allow active content to run in files on My Computer."

@image ../site/images/iesecurity.png


If you're getting an IE popup blocker error, you may need to disable "Protected Mode"

@image ../site/images/iepopups.png