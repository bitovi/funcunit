var phantom = require('./phantom.js'),
promise = require('promised-io/promise');

phantom.run(process.argv[2]).then(function() {
	process.exit();
}, function() {
	process.exit(1);
});