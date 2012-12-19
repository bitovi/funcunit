require('../reporters/console.js');

var phantom = require('./phantom.js');

var url = process.argv[2];
url += '?steal[browser]=phantomjs&steal[startFiles]=funcunit/node/client.js';

phantom.run(url);