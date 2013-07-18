steal("funcunit/qunit/qunit-1.10.js", function(){
	// on ready because that is when the window is loaded AND when 
	// steal has finished
	QUnit.config.autostart = false;
	steal.bind("ready", function(){
		QUnit.config.autostart = true;
		QUnit.config.autorun = false;
		QUnit.config.reorder = false;
		QUnit.load();
	})
	if(steal.instrument){
		var reportBuilt = false;
		QUnit.done(function(){
			if(!reportBuilt){
				reportBuilt = true;
				var data = steal.instrument.compileStats()
				steal.instrument.report(data);
			}
		})
	}
	
	var appendToBody = function(type, id, html){
			var el = document.createElement(type);
			el.setAttribute("id", id);
			if(html){
				el.innerHTML = html;
			}
			document.body.appendChild( el );
		}, 
		id = function(id){
			return document.getElementById(id);
		}
	
		
	// TODO remove this once jquery patches http://bugs.jquery.com/ticket/10373
	var gCS = window.getComputedStyle;
	window.getComputedStyle = function(elem){
		if(elem.ownerDocument.defaultView && window.getComputedStyle !== elem.ownerDocument.defaultView.getComputedStyle) {
			return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
		}
		try {
			return gCS(elem, null);
		} catch (ex) {
			// Here's to IE 8 and under:
			return elem.currentStyle;
		}
	}
	var startFile = steal.config("startId"),
		title = document.title || (startFile ? startFile.replace(/\/.*/,"") +" tests": "")
	// set up page if it hasn't been
	steal("funcunit/qunit/qunit.css")
	if(!id("qunit-header")){
		appendToBody("h1", "qunit-header", title);
	}
	if(!id("qunit-banner")){
		appendToBody("h2", "qunit-banner");
	}
	if(!id("qunit-testrunner-toolbar")){
		appendToBody("div", "qunit-testrunner-toolbar");
	}
	if(!id("qunit-userAgent")){
		appendToBody("h2", "qunit-userAgent");
	}
	if(!id("test-content")){
		appendToBody("div", "test-content");
	}
	if(!id("qunit-tests")){
		appendToBody("ol", "qunit-tests");
	}
	if(!id("qunit-test-area")){
		appendToBody("div", "qunit-test-area");
	}
	if(!document.title){
		document.title = title
	}
	
	// backwards compatibility
	window.equals = window.equal;
	QUnit.equals = QUnit.equal;
	window.same = window.deepEqual;
	QUnit.same = QUnit.deepEqual;
	
}, 'funcunit/browser/events.js')