//TODO: Abstract this out to be a more extendable interface.
//Currently this is only used in node & rhino
var terminal = console || {
	log: print
};

var results = {},
	currentModule,
	currentTest;

//TODO: This should be exposed via exports. Currently, we're polluting
//the global scope as this file is also used by rhino.
FuncUnit = typeof FuncUnit !== 'undefined' ? FuncUnit : {};

FuncUnit.begin = function() {};

FuncUnit.log = function(data) {
	results[currentModule].tests[currentTest].logs.push(data);

	var output = data.result ? '    [x] ' : '    [ ] ';
	output += data.message || '';

	terminal.log(output);
};

FuncUnit.testDone = function(data) {
	var test = results[currentModule].tests[data.name];
	test.failed = data.failed;
	test.total = data.total;
};

FuncUnit.testStart = function(data) {
	currentTest = data.name;
	results[currentModule].tests[currentTest] = {
		logs: []
	};
	terminal.log('  ' + data.name);
};

FuncUnit.moduleStart = function(data) {
	currentModule = data.name;
	results[currentModule] = {
		tests: {}
	};

	terminal.log('\n', data.name);
};

FuncUnit.moduleDone = function(data) {
	var module = results[currentModule];
	module.failed = data.failed;
	module.total = data.total;
};

FuncUnit.done = function(data) {
	var nbrFailed = 0, 
		failed = [],
		nbrPassed = 0,
		moduleName,
		module,
		testName,
		failed, 
		test;
	
	for(moduleName in results) {
		module = results[moduleName];

		for(testName in module.tests) {
			test = module.tests[testName];

			if(test.failed > 0) {
				nbrFailed ++;

				failed.push({
					module: moduleName,
					test: testName
				});
			}
			else {
				nbrPassed ++;	
			}
		}
	}

	if(nbrFailed > 0){
		terminal.log('\nFAILURES');

		for(var i = 0; i < failed.length; i++) {
			failed = failed[i];
			terminal.log('  ' + (i+1) + ') module: ' + failed.module + ', test: ' + failed.test);
		}
	}
	else {
		terminal.log('PASSED');
	}

	terminal.log(nbrPassed + ' passed, ' + nbrFailed + ' failed');

	//we return false if there were failures so that the node process
	//can provide any status, eg: exit code
	return failed.length === 0;
}