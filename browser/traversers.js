steal('jquery').then(function($){

(function($){
	var getWindow = function( element ) {
		return element.ownerDocument.defaultView || element.ownerDocument.parentWindow
	}

/**
 * Returns a unique selector for the matched element.
 * @param {Object} target
 */
$.fn.prettySelector= function() {
	var target = this[0];
	if(!target){
		return null
	}
	var selector = target.nodeName.toLowerCase();
	//always try to get an id
	if(target.id){
		return "#"+target.id;
	}else{
		var parent = target.parentNode;
		while(parent){
			if(parent.id){
				selector = "#"+parent.id+" "+selector;
				break;
			}else{
				parent = parent.parentNode
			}
		}
	}
	if(target.className){
		selector += "."+target.className.split(" ")[0]
	}
	var others = $(selector, getWindow(target).document); //jquery should take care of the #foo if there
	
	if(others.length > 1){
		return selector+":eq("+others.index(target)+")";
	}else{
		return selector;
	}
};
$.each(["closest","find","next","prev","siblings","last","first"], function(i, name){
	$.fn[name+"Selector"] = function(selector){
		return this[name](selector).prettySelector();
	}
});

//do traversers
var traversers = ["closest","next","prev","siblings","last","first"],
	makeTraverser = function(name){
		FuncUnit.init.prototype[name] = function(selector){
			return FuncUnit( FuncUnit.$(this.selector, this.context, name+"Selector", selector), this.context )
		}
	};
for(var i  =0; i < traversers.length; i++){
	makeTraverser(traversers[i]);
}


}(window.jQuery  || window.FuncUnit.jQuery));


})