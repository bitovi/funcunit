QUnitPrint = {
	testStart: function(name){
		print("--" + name + "--")
	},
	log: function(message, result){
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