QUnitPrint = {
	testStart: function(data){
		print("--" + data.name + "--")
	},
	log: function(data){
		if (!data.message) 
			data.message = ""
		print((data.result ? "  PASS " : "  FAIL ") + data.message)
	},
	testDone: function(data){
		print("  done - fail " + data.failed + ", pass " + data.passed + "\n")
	},
	moduleStart: function(data){
		print("MODULE " + data.name + "\n")
	},
	moduleDone: function(data){
	
	},
	browserStart : function(name){
		print("BROWSER " + name + " ===== \n")
	},
	browserDone : function(name, passed, failed, formattedTime){
		print("\n"+name+" DONE " + failed + ", " + passed + (FuncUnit.showTimestamps? (' - ' 
					+ formattedtime + ' seconds'): ""))
	},
	done: function(passed, failed){
		print("\nALL DONE - fail " + failed + ", pass " + passed)
	}
};