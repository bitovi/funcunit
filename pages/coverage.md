@page funcunit.coverage Code Coverage
@parent FuncUnit.pages 6

@body
This guide will show you how to determine the code coverage of your FuncUnit tests.  Code 
coverage is tracked and calculated by [steal.instrument].

## Basic reporting

To turn on code coverage for any funcunit or qunit test, add the following snippet to the end of your stealconfig.js file:

	steal('steal/instrument', function(instrument){
		instrument({
			ignores: ["jquery","can","funcunit","steal",
			  "*/test","*_test.js","*funcunit.js"]
		})
	})

After the test completes, a coverage report will be shown:

@image ../site/images/coverage_report.png


To see which blocks of a file are covered and which are not, click a file's name:

@image ../site/images/coverage_file.png


The numbers on the left are how many times each line has been run.

## Ignoring files

When you're determining code coverage, you won't want to include non application code in your coverage statistics.  JMVC and other third party code will skew coverage statistics.

To ignore files when running from commandline, modify the ignores property shown in the snippet above.  Any string in this array will be matched against files.  Matches will be ignored.  * is used as an asterisk.  *__test.js will ignore any file ending in 
__test.js.