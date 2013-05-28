@page funcunit.grunt Grunt
@parent funcunit.integrations 2

@body
[http://gruntjs.com/ Grunt] is a task-based command line build tool for JavaScript projects. FuncUnit tests can be run 
as a grunt build step. When tests fail, the build also fails.

Grunt provides a plugin system to standardize and easily group common tasks like building, linting, and deployment.

The advantage of using FuncUnit with Grunt is once you configure your project, you can simply run <code>grunt test</code> to run all your project tests via phantom on the commandline.  You can even configure your build process to fail when a test is failing.

If you haven't yet, first read up on [funcunit.phantomjs Phantom in NodeJS Mode].  Setting that up is a prerequisite to setting up FuncUnit in Grunt (Grunt is a NodeJS project).

## Install

1. Follow the installation instructions to set up [funcunit.phantomjs Phantom in NodeJS Mode].
1. Install grunt: <code>npm install grunt -g</code>
1. Set up a package.json file for your project if you haven't already.  Add [https://npmjs.org/package/grunt-funcunit grunt-funcunit] as an npm dependency in this file.

@codestart
{
    "name": "onesearch",
    "version": "0.0.1",
    "dependencies": {
        "grunt-funcunit": "0.1.0"
    },
    "engines": {
        "node": ">=0.8"
    }
}
@codeend

1. Run npm install, which will install grunt-funcunit in the node_modules folder.
1. Create a grunt.js file if you haven't already and configure funcunit by pointing it to the URL of your main test file:

@codestart
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        funcunit: {
            urls: ['http://localhost/myapp/funcunit.html']
        }
    });

    grunt.loadNpmTasks('grunt-funcunit');

    // Default task.
    grunt.registerTask('default', 'test');
    grunt.registerTask('test', 'funcunit');

};
@codeend

### Use

Once you set this all up, running tests is as simple as <code>grunt test</code>.  You'll see commandline output like this:

@codestart
Brians-MacBook-Pro:myapp brianmoschel$ grunt test
Running "funcunit" task

 Autocomplete
  Select and remove item from DOM and searchParams
    [x] searchParams.Locations is ready and empty
    [x] Made selection
    [x] searchParams.Locations has one item added
....later....
PASSED
32 passed, 0 failed

Done, without errors.

@codeend