var phantom = require('node-phantom');

exports.run = function(url) {
	phantom.create(function(err, ph) {
		ph.createPage(function(err, page) {
			page.onConsoleMessage = function(msg, line, file) {
				if(msg && msg.indexOf('__EVT' === 0)) {
					try {
						var evt = JSON.parse(msg.substring(5));
						if(evt.trigger) {
							FuncUnit[evt.trigger](evt.data);
							if(evt.trigger === 'done'){
								ph.exit();
							}
						}
					} catch(e){}
				}
			};

			page.open(url, function() {});
		});
	});
}