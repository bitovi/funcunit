steal.then(function(){
	if (typeof FuncUnit == 'undefined') {
		FuncUnit = {};
	}
	/**
	 * 2 ways to include settings.js:
	 * 1. Manually before funcunit.js 
	 * 2. FuncUnit.load will try to load settings.js if there hasn't been one loaded
	 */ 
	FuncUnit.load = function(page){
		load('steal/rhino/env.js');
		if (!navigator.userAgent.match(/Rhino/)) return;
		
		var dirArr = page.split("/"), 
			dir = dirArr.slice(0, dirArr.length - 1).join("/"), 
			settingsPath = dir + "/settings.js";
		
		// if settings.js was already loaded, don't try to load it again
		if (FuncUnit.browsers === undefined) {
			//this gets the global object, even in rhino
			var window = (function(){return this}).call(null), 
				//if there is an old FuncUnit, save that in case it gets overwritten
				backupFunc = window.FuncUnit;
				
			load('funcunit/settings.js')
			// try to load a local settings
			var foundSettings = true;
			try {
				readUrl(settingsPath)
			} 
			catch (e) {
				foundSettings = false;
			}
			if (foundSettings) {
				load(settingsPath)
			}
			
			steal.extend(FuncUnit, backupFunc)
		}
		
		Envjs(page, {
			scriptTypes: {
				"text/javascript": true,
				"text/envjs": true,
				"": true
			},
			fireLoad: true,
			logLevel: 2,
			dontPrintUserAgent: true
		});
	}
})