// loaded into the commandline environment (shared by envjs, selenium)

(function(){
		var totalFailed = 0,
			total = 0,
			browserFailed, browserTotal;
		
		steal.extend(steal.browser.prototype, {
			// bind all events
			bindEvents: function(){
				this.bind("browserStart", function(data){
					FuncUnit.starttime = new Date().getTime();
					browserFailed = browserTotal = 0;
					FuncUnit.browserStart(data.browser);
				})
				.bind("browserDone", function(data){
					FuncUnit.endtime = new Date().getTime();
					var duration = (FuncUnit.endtime - FuncUnit.starttime) / 1000;
					FuncUnit.browserDone(data.browser, browserFailed, browserTotal, duration)
				})
				.bind('testDone', function(data){
					browserFailed += data.failed;
					browserTotal += data.total;
					totalFailed += data.failed;
					total += data.total;
					FuncUnit.testDone(data.name, data.failed, data.total)
				})
				.bind('log', function(data){
					FuncUnit.log(data.message, data.result)
				})
				.bind('testStart', function(data){
					FuncUnit.testStart(data.name)
				})
				.bind('moduleStart', function(data){
					FuncUnit.moduleStart(data.name)
				})
				.bind('moduleDone', function(data){
					FuncUnit.moduleDone(data.name, data.failed, data.total)
				})
				.bind('done', function(data){
					FuncUnit.done(totalFailed, total);
				})
				return this;
			}
		})
	var evts = ['browserStart', 'browserDone', 'testStart', 'testDone', 
				'moduleStart', 'moduleDone', 'done', 'log'];
	
	for (var i = 0; i < evts.length; i++) {
		type = evts[i];
		(function(type){
			// default method
			FuncUnit[type] = function(){
				QUnitPrint[type].apply(null, arguments)
			}
		})(type)
	}
	
	/**
	Users can override these methods with their own.  By default they just call QUnitPrint:
	
	FuncUnit.browserStart = function(browser)
	FuncUnit.browserDone = function(browser, failures, total, duration)
	FuncUnit.log = function(result, message)
	FuncUnit.testStart = function(name)
	FuncUnit.testDone = function(name, failures, total)
	FuncUnit.moduleStart = function(name)
	FuncUnit.moduleDone = function(name, failures, total)
	FuncUnit.done = function(failures, total)
	*/
})()
