jQuery.wrapped = function(){
	var args = jQuery.makeArray(arguments),
	    selector = args.shift(),
	    context =  args.shift(),
		method = args.shift(), 
		q, a;
		
	for(var i=0; i < arguments.length; i++){
		if (typeof arguments[i] == 'function' && arguments[i] == Selenium.resume) {
			Selenium.pause();
		}
	}
	
    q = jQuery(selector, context);
	
	var res = q[method].apply(q, args);
    
	//need to convert to json
    return jQuery.toJSON(res.jquery ? true : res)
}
_doc = function(){
	return selenium.browserbot.getCurrentWindow().document
}
_win = function(){
	return selenium.browserbot.getCurrentWindow()
}