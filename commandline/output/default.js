(function(){
	QUnitPrint = {
		testStart: function(name){
			print("--" + name + "--")
		},
		log: function(result, message){
			if (!message) 
				message = ""
			print((result ? "  PASS " : "  FAIL ") + message)
		},
		testDone: function(name, failures, total){
			print("  done - fail " + failures + ", pass " + (total-failures) + "\n")
		},
		moduleStart: function(name){
			print("MODULE " + name + "\n")
		},
		moduleDone: function(name, failures, total){
		
		},
		browserStart : function(name){
			print("BROWSER " + name + " ===== \n")
		},
		browserDone : function(name, failed, total, formattedtime){
			print("\n"+name+" DONE " + failed + ", " + (total - failed) 
				+ ' - ' + formattedtime + ' seconds')
		},
		done: function(failed, total){
			print("\nALL DONE - fail " + failed + ", pass " + (total - failed))
		}
	};
	
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