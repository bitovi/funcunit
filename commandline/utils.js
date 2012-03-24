steal(function(){	
	if (typeof FuncUnit == 'undefined') {
		FuncUnit = {};
	}
	if(!FuncUnit.loader){
		FuncUnit.loader = {};
	}
}, 
	'funcunit/commandline/events.js', function(){
	
	/**
	 * 2 ways to include settings.js:
	 * 1. Manually before funcunit.js 
	 * 2. FuncUnit.load will try to load settings.js if there hasn't been one loaded
	 */
	FuncUnit._loadSettingsFile = function(page, settings){
		var backupFunc = FuncUnit,
			path = 'funcunit/settings.js';
		if(settings){
			path = settings;
		}
		load(path);
		print('loading settings.js from '+path)
		steal.extend(FuncUnit, backupFunc)
		load('funcunit/commandline/output/output.js')
	}
	
	// if coverage is true, use this to change the URL
	FuncUnit._getPageUrl = function(page, coverage){
		if(FuncUnit.jmvcRoot){
			page = FuncUnit.jmvcRoot + "/" + page;
		}
		if(!/https?:|file:/.test(page)){ // if theres no protocol, turn it into a filesystem urls
			var cwd = (new java.io.File (".")).getCanonicalPath()+"";
			cwd = cwd.replace(/\\/, '/');
			page = "file:///"+cwd+"/"+page;
		}
		
		//convert spaces to %20.
		var newPage = /https?:/.test(page) ? page: page.replace(/ /g,"%20");
		
		if(coverage){
			newPage = newPage+"?coverage=true";
		}
		return newPage;
	}
})