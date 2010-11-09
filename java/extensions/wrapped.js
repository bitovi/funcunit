/**
 * This file has the methods used inside Selenium's JAR
 */

jQuery.wrapped = function(){
	var args = jQuery.makeArray(arguments),
	    selector = args.shift(),
	    context =  args.shift(),
		method = args.shift(), 
		q, a, res;
		
	for(var i=0; i < arguments.length; i++){
		if (typeof arguments[i] == 'function' && arguments[i] == Selenium.resume) {
			Selenium.pause();
		}
	}
	if (_win().jQuery && method == 'trigger') {
		res = _win().jQuery(selector, context).trigger(args[0], args[1]);
	} else {
    	q = jQuery(selector, context);
		res = q[method].apply(q, args);
	}
	
    //need to convert to json
    return jQuery.toJSON(res.jquery ? true : res)
};
_win = function(){
	var sel = selenium.browserbot
	return sel.getCurrentWindow()
};
_doc = function(){
	var sel = selenium.browserbot
	return sel.getCurrentWindow().document
};
Selenium.pause = function(){
	Selenium.paused = true;
};

Selenium.resume = function(){
	Selenium.paused = false;
	currentTest.continueTest();
};
(function(){
var RRTest = RemoteRunner.prototype.continueTest;
RemoteRunner.prototype.continueTest = function(){
	if(Selenium.paused){
		return;
	} 
	RRTest.call(this);
};
})()