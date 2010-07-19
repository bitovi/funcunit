steal.then(function() {
	var readystate = document.readyState;
	FuncUnit.jquery(window).load(function(){
		if(document.readyState != readystate)
			FuncUnit.support.readystate = true;
	})
	//don't do any of this if in rhino (IE selenium)
	if (navigator.userAgent.match(/Rhino/)) {
		return;	
	}
	
	
	FuncUnit._window = null;
	var newPage = true, changing;
	var makeArray = function(arr){
		var narr = [];
		for (var i = 0; i < arr.length; i++) {
			narr[i] = arr[i]
		}
		return narr;
	}
	FuncUnit._open = function(url){
		changing = url;
		if (newPage) {
			FuncUnit._window = window.open(url, "funcunit");
		}
		else {
			FuncUnit._window.location = url;
			
		}
		
	}
	var unloadLoader, 
		loadSuccess, 
		firstLoad = true,
		currentDocument,
		onload = function(){
			FuncUnit._window.document.documentElement.tabIndex = 0;
			setTimeout(function(){
				FuncUnit._window.focus();
				var ls = loadSuccess
				loadSuccess = null;
				if (ls) {
					ls();
				}
			}, 0);
			Syn.unbind(FuncUnit._window, "load", onload);
		},
		onunload = function(){
			removeListeners();
			setTimeout(unloadLoader, 0)
			
		},
		removeListeners = function(){
			Syn.unbind(FuncUnit._window, "unload", onunload);
			Syn.unbind(FuncUnit._window, "load", onload);
		}
	unloadLoader = function(){
		if(!firstLoad) // dont remove the first run, fixes issue in FF 3.6
			removeListeners();
		
		Syn.bind(FuncUnit._window, "load", onload);
		
		//listen for unload to re-attach
		Syn.bind(FuncUnit._window, "unload", onunload)
	}
	
	//check for window location change, documentChange, then readyState complete -> fire load if you have one
	var newDocument = false, poller = function(){
		if(FuncUnit._window.document  == null){
			return
		}
		
		if (FuncUnit._window.document !== currentDocument || newDocument) { //we have a new document
			currentDocument = FuncUnit._window.document;
            newDocument = true;
			if (FuncUnit._window.document.readyState == "complete" && FuncUnit._window.location.href!="about:blank") {
				var ls = loadSuccess;
					loadSuccess = null;
				if (ls) {
					FuncUnit._window.focus();
					FuncUnit._window.document.documentElement.tabIndex = 0;
					
					ls();
				}
				
			}
		}
		
		setTimeout(arguments.callee, 1000)
	}
	
	FuncUnit._onload = function(success, error){
		loadSuccess = success;
		if (!newPage) 
			return;
		newPage = false;
		if (FuncUnit.support.readystate)
		{
			poller();
		}
		else {
			unloadLoader();
		}
		
	}
	var confirms = [], prompts = [];
	FuncUnit.confirm = function(answer){
		confirms.push(!!confirms)
	}
	FuncUnit.prompt = function(answer){
		prompts.push(answer)
	}
	FuncUnit._opened = function(){
		FuncUnit._window.alert = function(){}
		FuncUnit._window.confirm = function(){
			return confirms.shift();
		}
		FuncUnit._window.prompt = function(){
			return prompts.shift();
		}
	}
	FuncUnit.$ = function(selector, context, method){
	
		var args = makeArray(arguments);
		for (var i = 0; i < args.length; i++) {
			args[i] = args[i] === FuncUnit.window ? FuncUnit._window : args[i]
		}
		
		var selector = args.shift(), 
			context = args.shift(), 
			method = args.shift(), 
			q;
		
		//convert context	
		if (context == FuncUnit.window.document) {
			context = FuncUnit._window.document
		}else if(context === FuncUnit.window){
			context = FuncUnit._window;
		}else if (typeof context == "number" || typeof context == "string") {
			context = FuncUnit._window.frames[context].document;
		}
		if (selector == FuncUnit.window.document) {
			selector = FuncUnit._window.document
		}else if(selector === FuncUnit.window){
			selector = FuncUnit._window;
		}
	
		//the following 	
		//if the page has jQuery, use its jQuery b/c it is faster.
		//if (FuncUnit._window.jQuery && parseFloat(FuncUnit._window.jQuery().jquery) >= 1.3) {
		//	q = jQuery(FuncUnit._window.jQuery(selector, context).get());
		//} else {
		q = FuncUnit.jquery(selector, context);
		//}
		
		return q[method].apply(q, args);
	}
	
	FuncUnit.jquery(window).unload(function(){
		if (FuncUnit._window) 
			FuncUnit._window.close();
	})
		


});


