@page funcunit.features Features
@parent FuncUnit 0

## Why FuncUnit

TESTING IS PAINFUL.  Everyone hates testing, and most front end developers simply don't test.  There 
are a few reasons for this:

1. **Barriers to entry** - Difficult setup, installation, high cost, or difficult APIs.  QTP costs $5K per license.
2. **Completely foreign APIs** - Testing frameworks often use other languages (Ruby, C#, Java) and new APIs.
3. **Debugging across platforms** - You can't use firebug to debug a test that's driven by PHP.
4. **Low fidelity event simulation** - Tests are often brittle or low fidelity because frameworks aren't designed to test heavy JavaScript apps, so 
browser event simualation accuracy isn't a top priority.
5. **QA and developers can't communicate** - If only QA has the ability to run tests, sending bug reports is messy and time consuming.

FuncUnit aims to fix these problems:

1. FuncUnit is free and has no setup or installation (just requires Java and a browser). 
2. FuncUnit devs know jQuery, and FuncUnit leverages that knowldge with a jQuery-like API.
3. You can run tests in browser and set Firebug breakpoints.
4. Syn.js is a low level event simuation library that goes to extra trouble to make sure each browser simulates events exactly as intended.
5. Since tests are just JS and HTML, they can be checked into a project and any dev can run them easily.  QA just needs to send a URL to a broken 
test case.

There are many testing frameworks out there, but nothing comes close to being a complete solution for front end testing like FuncUnit does.

## Comparison to other frameworks

### Functional vs unit

### Automated vs browser based

### Accurate event simulation

## Changes from 3.1

* collections instead of selectors
* easier to extend
* debuggability
* improved selenium architecture
* phantomjs
* jenkins/maven

## Roadmap

* test coverage
* jstestdriver integration
