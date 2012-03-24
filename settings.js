FuncUnit = {
	// the root where funcunit folder lives, used when running from commandline
	// jmvcRoot: "http://localhost:3000/javascriptmvc",
	
	// used for debugging
	// the number of milliseconds between commands, "slow" is 500 ms
	// speed: "slow",
	
	// turn on if you want to exit hard with the -e flag
	// failOnError: true,
	
	// any files or directories that coverage calculations should ignore
	coverageIgnore: ['*/test', "*_test.js", "*jquery.js", "*qunit.js"],
	
	// uncomment this to record test output in an xml format that jenkins can read
	// outputFile: "testresults.xml" 
	
}