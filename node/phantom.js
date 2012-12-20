require('../reporters/console.js');

var phantom = require('node-phantom'),
promise = require('promised-io/promise');

exports.run = function(url) {
	url += '?steal[browser]=phantomjs&steal[startFiles]=funcunit/node/client.js';

	var deferred = new promise.Deferred();

	phantom.create(function(err, ph) {
		ph.createPage(function(err, page) {
			page.onConsoleMessage = function(msg, line, file) {
				if(msg && msg.indexOf('__EVT') === 0) {
					try {
						var evt = JSON.parse(msg.substring(5));

						if(evt.trigger) {
							FuncUnit[evt.trigger](evt.data);

							if(evt.trigger === 'done') {
								ph.exit();
								deferred.resolve();
							}
						}
					} catch(e) {}
				}
			};

			page.open(url, function() {});
		});
	});

	return deferred.promise;
}