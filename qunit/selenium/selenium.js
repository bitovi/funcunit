(function(){
	SeleniumQueue = []
	// in jstestdriver, this should stringify and use window.postMessage
	var sendMessage = function(data){
		SeleniumQueue.push(data);
	}
	
	QUnit.testDone = function(name, failed, passed, total){
		sendMessage({
			type: "testDone",
			name: name, 
			failed: failed, 
			passed: passed, 
			total: total
		})
	}
	QUnit.testStart = function(name, failed, passed, total){
		sendMessage({
			type: "testStart",
			name: name
		})
	}
	QUnit.done = function(failed, passed, total, runtime){
		sendMessage({
			type: "done",
			runtime: runtime, 
			failed: failed, 
			passed: passed, 
			total: total
		})
	}
	QUnit.log = function(result, message){
		sendMessage({
			type: "log",
			result: result,
			message: message
		})
	}
	QUnit.moduleStart = function(name){
		sendMessage({
			type: "moduleStart",
			name: name
		})
	}
	QUnit.moduleDone = function(name, failed, passed, total){
		sendMessage({
			type: "moduleDone",
			failed: failed, 
			passed: passed, 
			total: total,
			name: name
		})
	}
})()