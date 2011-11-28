steal('funcunit/browser/resources/jquery.js', function(){

	if(steal.options.browser === "phantomjs"){
		var ifrm = $("<iframe id='funcunit_app' height='800' width='960'></iframe")
		$(document.body).prepend(ifrm);
	}

	var evts = ['begin', 'testStart', 'testDone', 'moduleStart', 'moduleDone', 'done', 'log'], type;
	
	for (var i = 0; i < evts.length; i++) {
		type = evts[i];
		(function(type){
			QUnit[type] = function(data){
				if(type === "done"){
					if (steal.instrument) {
						steal.client.trigger("coverage", steal.instrument.compileStats());
					}
				}
				steal.client.trigger(type, data);
			};
		})(type);
	}
})
