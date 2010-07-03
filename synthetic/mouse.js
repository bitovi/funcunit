//handles mosue events
steal(function(){

var h = Syn.helpers,
	createEvent = Syn.createEvent,
	browser = Syn.browser;


h.extend(Syn.defaults,{
	mousedown : function(options){
		createEvent("focus", {}, this)
	},
	click : function(){
		// prevents the access denied issue in IE if the click causes the element to be destroyed
		var element = this;
		try {
			element.nodeType;
		} catch(e){
			return;
		}
		//get old values
		var href,
			checked = Syn.data(element,"checked"),
			scope = Syn.helpers.getWindow(element),
			nodeName = element.nodeName.toLowerCase();
		
		if( (href = Syn.data(element,"href") ) ){
			element.setAttribute('href',href)
		}

		
		
		//run href javascript
		if(!support.linkHrefJS 
			&& /^\s*javascript:/.test(element.href)){
			//eval js
			var code = element.href.replace(/^\s*javascript:/,"")
				
			//try{
			if (code != "//" && code.indexOf("void(0)") == -1) {
				if(window.selenium){
					eval("with(selenium.browserbot.getCurrentWindow()){"+code+"}")
				}else{
					eval("with(scope){"+code+"}")
				}
			}
		}
		
		//submit a form
		if(nodeName == "input" 
			&& element.type == "submit" 
			&& !(support.clickSubmits)){
				
			var form =  Syn.closest(element, "form");
			if(form){
				createEvent("submit",{},form)
			}
			
		}
		//follow a link, probably needs to check if in an a.
		if(nodeName == "a" 
			&& element.href 
			&& !/^\s*javascript:/.test(element.href)){
				
			scope.location.href = element.href;
			
		}
		
		//change a checkbox
		if(nodeName == "input" 
			&& element.type == "checkbox"){
			
			if(!support.clickChecks && !support.changeChecks){
				element.checked = !element.checked;
			}
			if(!support.clickChanges)
				createEvent("change",{},  element );
			
		}
		
		//change a radio button
		if(nodeName == "input" && element.type == "radio"){  // need to uncheck others if not checked
			
			if(!support.clickChecks && !support.changeChecks){
				//do the checks manually 
				if(!element.checked){ //do nothing, no change
					element.checked = true;
				}
			}
			if(checked != element.checked && !support.radioClickChanges){
				createEvent("change",{},  element );
			}
		}
		// change options
		if(nodeName == "option"){
			//check if we should change
			//find which selectedIndex this is
			var children = element.parentNode.childNodes;
			for(var i =0; i< children.length; i++){
				if(children[i] == element) break;
			}
			if(i !== element.parentNode.selectedIndex){
				element.parentNode.selectedIndex = i;
				Syn.createEvent("change",{}, element.parentNode)
			}
		}
			
		
	}
})
	

//add create and setup behavior for mosue events
h.extend(Syn.create,{
	mouse : {
		options : function(type, options, element){
			var doc = document.documentElement, body = document.body,
				center = [options.pageX || 0, options.pageY || 0] 
			return h.extend({
				bubbles : true,cancelable : true,
				view : window,detail : 1,
				screenX : 1, screenY : 1,
				clientX : center[0] -(doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0), 
				clientY : center[1] -(doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0),
				ctrlKey : false, altKey : false, shiftKey : false, metaKey : false,
				button : (type == 'contextmenu' ? 2 : 0), 
				relatedTarget : document.documentElement
			}, options);
		},
		event : document.createEvent ? 
			function(type, defaults, element){  //Everyone Else
				var event;
				
				try {
					event = element.ownerDocument.createEvent('MouseEvents');
					event.initMouseEvent(type, 
						defaults.bubbles, defaults.cancelable, 
						defaults.view, 
						defaults.detail, 
						defaults.screenX, defaults.screenY,defaults.clientX,defaults.clientY,
						defaults.ctrlKey,defaults.altKey,defaults.shiftKey,defaults.metaKey,
						defaults.button,defaults.relatedTarget);
				} catch(e) {
					event = h.createBasicStandardEvent(type,defaults)
				}
				event.synthetic = true;
				return event;
			} : 
			h.createEventObject
	},
	click : {
		setup : function(type, options, element){
			try{
				Syn.data(element,"checked", element.checked);
			}catch(e){}
			if( 
				element.nodeName.toLowerCase() == "a" 
				&& element.href  
				&& !/^\s*javascript:/.test(element.href)){
				
				//save href
				Syn.data(element,"href", element.href)
				
				//remove b/c safari/opera will open a new tab instead of changing the page
				element.setAttribute('href','javascript://')
			}
		}
	},
	mousedown : {
		setup : function(type,options, element){
			var nn = element.nodeName.toLowerCase();
			//we have to auto prevent default to prevent freezing error in safari
			if(browser.safari && (nn == "select" || nn == "option" )){
				options._autoPrevent = true;
			}
			
			
		}
	}
});
var support = Syn.support;
//do support code
(function(){
		var oldSynth = window.__synthTest;
		window.__synthTest = function(){
			support.linkHrefJS = true;
		}
		var div = document.createElement("div"), checkbox, submit, form, input, submitted = false;
		div.innerHTML = "<form id='outer'>"+
			"<input name='checkbox' type='checkbox'/>"+
			"<input name='radio' type='radio' />"+
			"<input type='submit' name='submitter'/>"+
			"<input type='input' name='inputter'/>"+
			"<input name='one'>"+
			"<input name='two'/>"+
			"<a href='javascript:__synthTest()' id='synlink'></a>"+
			"</form>";
		document.documentElement.appendChild(div);
		form = div.firstChild
		checkbox = form.childNodes[0];
		submit = form.childNodes[2];
		
		
		checkbox.checked = false;
		checkbox.onchange = function(){
			support.clickChanges = true;
		}

		createEvent("click", {}, checkbox)
		support.clickChecks = checkbox.checked;
		checkbox.checked = false;
		
		createEvent("change", {}, checkbox);
		
		support.changeChecks = checkbox.checked;
		
		form.onsubmit = function(ev){
			if (ev.preventDefault) 
				ev.preventDefault();
			submitted = true;
			return false;
		}
		createEvent("click", {}, submit)
		if (submitted) {
			support.clickSubmits = true;
		}
			
		
		form.childNodes[1].onchange = function(){
			support.radioClickChanges = true;
		}
		createEvent("click", {}, form.childNodes[1])
		
		
		

		
		//test if mousedown followed by mouseup causes click (opera)
		div.onclick = function(){
			support.mouseDownUpClicks = true;
		}
		createEvent("mousedown",{},div)
		createEvent("mouseup",{},div)
		
		document.documentElement.removeChild(div);
		
		//check stuff
		window.__synthTest = oldSynth;
		//support.ready = true;
	})();


})