steal.then(function(){
	if (navigator.userAgent.match(/Rhino/) && !window.build_in_progress) {
		QUnit.testStart = function(name){
			print("--" + name + "--")
		}
		QUnit.log = function(result, message){
			if(!message) message = ""
			print((result ? "  PASS " : "  FAIL ") + message)
		}
		QUnit.testDone = function(name, failures, total){
			print("  done - fail " + failures + ", pass " + total + "\n")
		}
		QUnit.moduleStart = function(name){
			print("MODULE " + name + "\n")
		}
		QUnit.moduleDone = function(name, failures, total){

		}
		QUnit.done = function(failures, total){
			print("\nALL DONE - fail " + failures + ", pass " + total)
		}

	}
})