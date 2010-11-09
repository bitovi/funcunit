/**
 * This file has the methods used to override Selenium's default behavior
 */

Selenium.makeArray = function(arr, win){
	if(!win){
		win = window;
	}
	var narr = win.Array();
	for (var i = 0; i < arr.length; i++) {
		narr.push(arr[i])
	}
	return narr;
}
jQuery.wrapped = function(){
	var args = Selenium.makeArray(arguments),
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
		q = _win().jQuery(selector, context)
		args = Selenium.makeArray(args, _win())
	} else {
    	q = jQuery(selector, context);
	}
	
	res = q[method].apply(q, args);
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