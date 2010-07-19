// funcunit/qunit/qunit.js

(function($){

(function(window) {

/*
 * QUnit - A JavaScript Unit Testing Framework
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2009 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 */

(function(window) {

var QUnit = {

	// Initialize the configuration options
	init: function() {
		extend(config, {
			stats: { all: 0, bad: 0 },
			moduleStats: { all: 0, bad: 0 },
			started: +new Date,
			updateRate: 1000,
			blocking: false,
			autostart: true,
			autorun: false,
			assertions: [],
			filters: [],
			queue: []
		});

		var tests = id("qunit-tests"),
			banner = id("qunit-banner"),
			result = id("qunit-testresult");

		if ( tests ) {
			tests.innerHTML = "";
		}

		if ( banner ) {
			banner.className = "";
		}

		if ( result ) {
			result.parentNode.removeChild( result );
		}
	},
	
	// call on start of module test to prepend name to all tests
	module: function(name, testEnvironment) {
		config.currentModule = name;

		synchronize(function() {
			if ( config.currentModule ) {
				QUnit.moduleDone( config.currentModule, config.moduleStats.bad, config.moduleStats.all );
			}

			config.currentModule = name;
			config.moduleTestEnvironment = testEnvironment;
			config.moduleStats = { all: 0, bad: 0 };

			QUnit.moduleStart( name, testEnvironment );
		}, true);
	},

	asyncTest: function(testName, expected, callback) {
		if ( arguments.length === 2 ) {
			callback = expected;
			expected = 0;
		}

		QUnit.test(testName, expected, callback, true);
	},
	
	test: function(testName, expected, callback, async) {
		var name = testName, testEnvironment, testEnvironmentArg;

		if ( arguments.length === 2 ) {
			callback = expected;
			expected = null;
		}
		// is 2nd argument a testEnvironment?
		if ( expected && typeof expected === 'object') {
			testEnvironmentArg =  expected;
			expected = null;
		}

		if ( config.currentModule ) {
			name = config.currentModule + " module: " + name;
		}

		if ( !validTest(name) ) {
			return;
		}

		synchronize(function() {

			testEnvironment = extend({
				setup: function() {},
				teardown: function() {}
			}, config.moduleTestEnvironment);
			if (testEnvironmentArg) {
				extend(testEnvironment,testEnvironmentArg);
			}

			QUnit.testStart( testName, testEnvironment );

			// allow utility functions to access the current test environment
			QUnit.current_testEnvironment = testEnvironment;
			
			config.assertions = [];
			config.expected = expected;
			
			var tests = id("qunit-tests");
			if (tests) {
				var b = document.createElement("strong");
					b.innerHTML = "Running " + name;
				var li = document.createElement("li");
					li.appendChild( b );
					li.id = "current-test-output";
				tests.appendChild( li )
			}

			try {
				if ( !config.pollution ) {
					saveGlobal();
				}

				testEnvironment.setup.call(testEnvironment);
			} catch(e) {
				QUnit.ok( false, "Setup failed on " + name + ": " + e.message );
			}
    	}, true);

    	synchronize(function() {
			if ( async ) {
				QUnit.stop();
			}

			try {
				callback.call(testEnvironment);
			} catch(e) {
				fail("Test " + name + " died, exception and test follows", e, callback);
				QUnit.ok( false, "Died on test #" + (config.assertions.length + 1) + ": " + e.message );
				// else next test will carry the responsibility
				saveGlobal();

				// Restart the tests if they're blocking
				if ( config.blocking ) {
					start();
				}
			}
		}, true);

		synchronize(function() {
			try {
				checkPollution();
				testEnvironment.teardown.call(testEnvironment);
			} catch(e) {
				QUnit.ok( false, "Teardown failed on " + name + ": " + e.message );
			}
    	}, true);

    	synchronize(function() {
			try {
				QUnit.reset();
			} catch(e) {
				fail("reset() failed, following Test " + name + ", exception and reset fn follows", e, reset);
			}

			if ( config.expected && config.expected != config.assertions.length ) {
				QUnit.ok( false, "Expected " + config.expected + " assertions, but " + config.assertions.length + " were run" );
			}

			var good = 0, bad = 0,
				tests = id("qunit-tests");

			config.stats.all += config.assertions.length;
			config.moduleStats.all += config.assertions.length;

			if ( tests ) {
				var ol  = document.createElement("ol");
				ol.style.display = "none";

				for ( var i = 0; i < config.assertions.length; i++ ) {
					var assertion = config.assertions[i];

					var li = document.createElement("li");
					li.className = assertion.result ? "pass" : "fail";
					li.appendChild(document.createTextNode(assertion.message || "(no message)"));
					ol.appendChild( li );

					if ( assertion.result ) {
						good++;
					} else {
						bad++;
						config.stats.bad++;
						config.moduleStats.bad++;
					}
				}

				var b = document.createElement("strong");
				b.innerHTML = name + " <b style='color:black;'>(<b class='fail'>" + bad + "</b>, <b class='pass'>" + good + "</b>, " + config.assertions.length + ")</b>";
				
				addEvent(b, "click", function() {
					var next = b.nextSibling, display = next.style.display;
					next.style.display = display === "none" ? "block" : "none";
				});
				
				addEvent(b, "dblclick", function(e) {
					var target = e && e.target ? e.target : window.event.srcElement;
					if ( target.nodeName.toLowerCase() === "strong" ) {
						var text = "", node = target.firstChild;

						while ( node.nodeType === 3 ) {
							text += node.nodeValue;
							node = node.nextSibling;
						}

						text = text.replace(/(^\s*|\s*$)/g, "");

						if ( window.location ) {
							window.location.href = window.location.href.match(/^(.+?)(\?.*)?$/)[1] + "?" + encodeURIComponent(text);
						}
					}
				});

				var li = id("current-test-output");
				li.id = "";
				li.className = bad ? "fail" : "pass";
				li.removeChild( li.firstChild );
				li.appendChild( b );
				li.appendChild( ol );

				if ( bad ) {
					var toolbar = id("qunit-testrunner-toolbar");
					if ( toolbar ) {
						toolbar.style.display = "block";
						id("qunit-filter-pass").disabled = null;
						id("qunit-filter-missing").disabled = null;
					}
				}

			} else {
				for ( var i = 0; i < config.assertions.length; i++ ) {
					if ( !config.assertions[i].result ) {
						bad++;
						config.stats.bad++;
						config.moduleStats.bad++;
					}
				}
			}

			QUnit.testDone( testName, bad, config.assertions.length );

			if ( !window.setTimeout && !config.queue.length ) {
				done();
			}
		}, true);

		if ( window.setTimeout && !config.doneTimer ) {
			config.doneTimer = window.setTimeout(function(){
				if ( !config.queue.length ) {
					done();
				} else {
					synchronize( done );
				}
			}, 13);
		}
	},
	
	/**
	 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
	 */
	expect: function(asserts) {
		config.expected = asserts;
	},

	/**
	 * Asserts true.
	 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
	 */
	ok: function(a, msg) {
		QUnit.log(a, msg);

		config.assertions.push({
			result: !!a,
			message: msg
		});
	},

	/**
	 * Checks that the first two arguments are equal, with an optional message.
	 * Prints out both actual and expected values.
	 *
	 * Prefered to ok( actual == expected, message )
	 *
	 * @example equal( format("Received {0} bytes.", 2), "Received 2 bytes." );
	 *
	 * @param Object actual
	 * @param Object expected
	 * @param String message (optional)
	 */
	equal: function(actual, expected, message) {
		push(expected == actual, actual, expected, message);
	},

	notEqual: function(actual, expected, message) {
		push(expected != actual, actual, expected, message);
	},
	
	deepEqual: function(actual, expected, message) {
		push(QUnit.equiv(actual, expected), actual, expected, message);
	},

	notDeepEqual: function(actual, expected, message) {
		push(!QUnit.equiv(actual, expected), actual, expected, message);
	},

	strictEqual: function(actual, expected, message) {
		push(expected === actual, actual, expected, message);
	},

	notStrictEqual: function(actual, expected, message) {
		push(expected !== actual, actual, expected, message);
	},
	
	start: function() {
		// A slight delay, to avoid any current callbacks
		if ( window.setTimeout ) {
			window.setTimeout(function() {
				if ( config.timeout ) {
					clearTimeout(config.timeout);
				}

				config.blocking = false;
				process();
			}, 13);
		} else {
			config.blocking = false;
			process();
		}
	},
	
	stop: function(timeout) {
		config.blocking = true;

		if ( timeout && window.setTimeout ) {
			config.timeout = window.setTimeout(function() {
				QUnit.ok( false, "Test timed out" );
				QUnit.start();
			}, timeout);
		}
	},
	
	/**
	 * Resets the test setup. Useful for tests that modify the DOM.
	 */
	reset: function() {
		if ( window.jQuery ) {
			jQuery("#main").html( config.fixture );
			jQuery.event.global = {};
			jQuery.ajaxSettings = extend({}, config.ajaxSettings);
		}
	},
	restart : function(){
        this.init();
        for(var i =0; i < config.cachelist.length; i++){
            synchronize(config.cachelist[i]);
        }
		if (window.setTimeout && !config.doneTimer) {
			config.doneTimer = window.setTimeout(function(){
				if (!config.queue.length) {
					done();
				}
				else {
					synchronize(done);
				}
			}, 13);
		}
    },
	/**
	 * Trigger an event on an element.
	 *
	 * @example triggerEvent( document.body, "click" );
	 *
	 * @param DOMElement elem
	 * @param String type
	 */
	triggerEvent: function( elem, type, event ) {
		if ( document.createEvent ) {
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent( event );

		} else if ( elem.fireEvent ) {
			elem.fireEvent("on"+type);
		}
	},
	
	// Safe object type checking
	is: function( type, obj ) {
		return Object.prototype.toString.call( obj ) === "[object "+ type +"]";
	},
	
	// Logging callbacks
	done: function(failures, total) {},
	log: function(result, message) {},
	testStart: function(name, testEnvironment) {},
	testDone: function(name, failures, total) {},
	moduleStart: function(name, testEnvironment) {},
	moduleDone: function(name, failures, total) {}
};

// Backwards compatibility, deprecated
QUnit.equals = QUnit.equal;
QUnit.same = QUnit.deepEqual;

// Maintain internal state
var config = {
	// The queue of tests to run
	queue: [],

	// block until document ready
	blocking: true,
	//a list of everything to run
	cachelist : []
};

// Load paramaters
(function() {
	var location = window.location || { search: "", protocol: "file:" },
		GETParams = location.search.slice(1).split('&');

	for ( var i = 0; i < GETParams.length; i++ ) {
		GETParams[i] = decodeURIComponent( GETParams[i] );
		if ( GETParams[i] === "noglobals" ) {
			GETParams.splice( i, 1 );
			i--;
			config.noglobals = true;
		} else if ( GETParams[i].search('=') > -1 ) {
			GETParams.splice( i, 1 );
			i--;
		}
	}
	
	// restrict modules/tests by get parameters
	config.filters = GETParams;
	
	// Figure out if we're running the tests from a server or not
	QUnit.isLocal = !!(location.protocol === 'file:');
})();

// Expose the API as global variables, unless an 'exports'
// object exists, in that case we assume we're in CommonJS
if ( typeof exports === "undefined" || typeof require === "undefined" ) {
	extend(window, QUnit);
	window.QUnit = QUnit;
} else {
	extend(exports, QUnit);
	exports.QUnit = QUnit;
}

QUnit.config = config;

if ( typeof document === "undefined" || document.readyState === "complete" ) {
	config.autorun = true;
}

addEvent(window, "load", function() {
	// Initialize the config, saving the execution queue
	var oldconfig = extend({}, config);
	QUnit.init();
	extend(config, oldconfig);

	config.blocking = false;

	var userAgent = id("qunit-userAgent");
	if ( userAgent ) {
		userAgent.innerHTML = navigator.userAgent;
	}
	
	var toolbar = id("qunit-testrunner-toolbar");
	if ( toolbar ) {
		toolbar.style.display = "none";
		
		var filter = document.createElement("input");
		filter.type = "checkbox";
		filter.id = "qunit-filter-pass";
		filter.disabled = true;
		addEvent( filter, "click", function() {
			var li = document.getElementsByTagName("li");
			for ( var i = 0; i < li.length; i++ ) {
				if ( li[i].className.indexOf("pass") > -1 ) {
					li[i].style.display = filter.checked ? "none" : "";
				}
			}
		});
		toolbar.appendChild( filter );

		var label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-pass");
		label.innerHTML = "Hide passed tests";
		toolbar.appendChild( label );

		var missing = document.createElement("input");
		missing.type = "checkbox";
		missing.id = "qunit-filter-missing";
		missing.disabled = true;
		addEvent( missing, "click", function() {
			var li = document.getElementsByTagName("li");
			for ( var i = 0; i < li.length; i++ ) {
				if ( li[i].className.indexOf("fail") > -1 && li[i].innerHTML.indexOf('missing test - untested code is broken code') > - 1 ) {
					li[i].parentNode.parentNode.style.display = missing.checked ? "none" : "block";
				}
			}
		});
		toolbar.appendChild( missing );

		label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-missing");
		label.innerHTML = "Hide missing tests (untested code is broken code)";
		toolbar.appendChild( label );
	}

	var main = id('main');
	if ( main ) {
		config.fixture = main.innerHTML;
	}

	if ( window.jQuery ) {
		config.ajaxSettings = window.jQuery.ajaxSettings;
	}

	if (config.autostart) {
		QUnit.start();
	}
});

function done() {
	if ( config.doneTimer && window.clearTimeout ) {
		window.clearTimeout( config.doneTimer );
		config.doneTimer = null;
	}

	if ( config.queue.length ) {
		config.doneTimer = window.setTimeout(function(){
			if ( !config.queue.length ) {
				done();
			} else {
				synchronize( done );
			}
		}, 13);

		return;
	}

	config.autorun = true;

	// Log the last module results
	if ( config.currentModule ) {
		QUnit.moduleDone( config.currentModule, config.moduleStats.bad, config.moduleStats.all );
	}

	var banner = id("qunit-banner"),
		tests = id("qunit-tests"),
		html = ['Tests completed in ',
		+new Date - config.started, ' milliseconds.<br/>',
		'<span class="passed">', config.stats.all - config.stats.bad, '</span> tests of <span class="total">', config.stats.all, '</span> passed, <span class="failed">', config.stats.bad,'</span> failed.'].join('');

	if ( banner ) {
		banner.className = (config.stats.bad ? "qunit-fail" : "qunit-pass");
	}

	if ( tests ) {	
		var result = id("qunit-testresult");

		if ( !result ) {
			result = document.createElement("p");
			result.id = "qunit-testresult";
			result.className = "result";
			tests.parentNode.insertBefore( result, tests.nextSibling );
		}

		result.innerHTML = html;
	}

	QUnit.done( config.stats.bad, config.stats.all );
}

function validTest( name ) {
	var i = config.filters.length,
		run = false;

	if ( !i ) {
		return true;
	}
	
	while ( i-- ) {
		var filter = config.filters[i],
			not = filter.charAt(0) == '!';

		if ( not ) {
			filter = filter.slice(1);
		}

		if ( name.indexOf(filter) !== -1 ) {
			return !not;
		}

		if ( not ) {
			run = true;
		}
	}

	return run;
}

function push(result, actual, expected, message) {
	message = message || (result ? "okay" : "failed");
	QUnit.ok( result, message + ", expected: " + QUnit.jsDump.parse(expected) + " result: " + QUnit.jsDump.parse(actual) );
}

function synchronize( callback , save) {
	config.queue.push( callback );
    if(save){
		config.cachelist.push( callback )
	}
	if ( config.autorun && !config.blocking ) {
		process();
	}
}
function process() {
	var start = (new Date()).getTime();

	while ( config.queue.length && !config.blocking ) {
		if ( config.updateRate <= 0 || (((new Date()).getTime() - start) < config.updateRate) ) {
			config.queue.shift()();

		} else {
			setTimeout( process, 13 );
			break;
		}
	}
}

function saveGlobal() {
	config.pollution = [];
	
	if ( config.noglobals ) {
		for ( var key in window ) {
			config.pollution.push( key );
		}
	}
}

function checkPollution( name ) {
	var old = config.pollution;
	saveGlobal();
	
	var newGlobals = diff( old, config.pollution );
	if ( newGlobals.length > 0 ) {
		ok( false, "Introduced global variable(s): " + newGlobals.join(", ") );
		config.expected++;
	}

	var deletedGlobals = diff( config.pollution, old );
	if ( deletedGlobals.length > 0 ) {
		ok( false, "Deleted global variable(s): " + deletedGlobals.join(", ") );
		config.expected++;
	}
}

// returns a new Array with the elements that are in a but not in b
function diff( a, b ) {
	var result = a.slice();
	for ( var i = 0; i < result.length; i++ ) {
		for ( var j = 0; j < b.length; j++ ) {
			if ( result[i] === b[j] ) {
				result.splice(i, 1);
				i--;
				break;
			}
		}
	}
	return result;
}

function fail(message, exception, callback) {
	if ( typeof console !== "undefined" && console.error && console.warn ) {
		console.error(message);
		console.error(exception);
		console.warn(callback.toString());

	} else if ( window.opera && opera.postError ) {
		opera.postError(message, exception, callback.toString);
	}
}

function extend(a, b) {
	for ( var prop in b ) {
		a[prop] = b[prop];
	}

	return a;
}

function addEvent(elem, type, fn) {
	if ( elem.addEventListener ) {
		elem.addEventListener( type, fn, false );
	} else if ( elem.attachEvent ) {
		elem.attachEvent( "on" + type, fn );
	} else {
		fn();
	}
}

function id(name) {
	return !!(typeof document !== "undefined" && document && document.getElementById) &&
		document.getElementById( name );
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rathé <prathe@gmail.com>
QUnit.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions
    var parents = []; // stack to avoiding loops from circular referencing


    // Determine what is o.
    function hoozit(o) {
        if (QUnit.is("String", o)) {
            return "string";
            
        } else if (QUnit.is("Boolean", o)) {
            return "boolean";

        } else if (QUnit.is("Number", o)) {

            if (isNaN(o)) {
                return "nan";
            } else {
                return "number";
            }

        } else if (typeof o === "undefined") {
            return "undefined";

        // consider: typeof null === object
        } else if (o === null) {
            return "null";

        // consider: typeof [] === object
        } else if (QUnit.is( "Array", o)) {
            return "array";
        
        // consider: typeof new Date() === object
        } else if (QUnit.is( "Date", o)) {
            return "date";

        // consider: /./ instanceof Object;
        //           /./ instanceof RegExp;
        //          typeof /./ === "function"; // => false in IE and Opera,
        //                                          true in FF and Safari
        } else if (QUnit.is( "RegExp", o)) {
            return "regexp";

        } else if (typeof o === "object") {
            return "object";

        } else if (QUnit.is( "Function", o)) {
            return "function";
        } else {
            return undefined;
        }
    }

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = hoozit(o);
        if (prop) {
            if (hoozit(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }
    
    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                //      var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return hoozit(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return hoozit(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i, j, loop;
                var len;

                // b could be an object literal here
                if ( ! (hoozit(b) === "array")) {
                    return false;
                }   
                
                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                
                //track reference to avoid circular references
                parents.push(a);
                for (i = 0; i < len; i++) {
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i]){
                            loop = true;//dont rewalk array
                        }
                    }
                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        parents.pop();
                        return false;
                    }
                }
                parents.pop();
                return true;
            },

            "object": function (b, a) {
                var i, j, loop;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);
                //track reference to avoid circular references
                parents.push(a);
                
                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i])
                            loop = true; //don't go down the same path twice
                    }
                    aProperties.push(i); // collect a's properties

                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        eq = false;
                        break;
                    }
                }

                callers.pop(); // unstack, we are done
                parents.pop();

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || hoozit(a) !== hoozit(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();

/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
QUnit.jsDump = (function() {
	function quote( str ) {
		return '"' + str.toString().replace(/"/g, '\\"') + '"';
	};
	function literal( o ) {
		return o + '';	
	};
	function join( pre, arr, post ) {
		var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
		if ( arr.join )
			arr = arr.join( ',' + s + inner );
		if ( !arr )
			return pre + post;
		return [ pre, inner + arr, base + post ].join(s);
	};
	function array( arr ) {
		var i = arr.length,	ret = Array(i);					
		this.up();
		while ( i-- )
			ret[i] = this.parse( arr[i] );				
		this.down();
		return join( '[', ret, ']' );
	};
	
	var reName = /^function (\w+)/;
	
	var jsDump = {
		parse:function( obj, type ) { //type is used mostly internally, you can fix a (custom)type in advance
			var	parser = this.parsers[ type || this.typeOf(obj) ];
			type = typeof parser;			
			
			return type == 'function' ? parser.call( this, obj ) :
				   type == 'string' ? parser :
				   this.parsers.error;
		},
		typeOf:function( obj ) {
			var type;
			if ( obj === null ) {
				type = "null";
			} else if (typeof obj === "undefined") {
				type = "undefined";
			} else if (QUnit.is("RegExp", obj)) {
				type = "regexp";
			} else if (QUnit.is("Date", obj)) {
				type = "date";
			} else if (QUnit.is("Function", obj)) {
				type = "function";
			} else if (obj.setInterval && obj.document && !obj.nodeType) {
				type = "window";
			} else if (obj.nodeType === 9) {
				type = "document";
			} else if (obj.nodeType) {
				type = "node";
			} else if (typeof obj === "object" && typeof obj.length === "number" && obj.length >= 0) {
				type = "array";
			} else {
				type = typeof obj;
			}
			return type;
		},
		separator:function() {
			return this.multiline ?	this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
		},
		indent:function( extra ) {// extra can be a number, shortcut for increasing-calling-decreasing
			if ( !this.multiline )
				return '';
			var chr = this.indentChar;
			if ( this.HTML )
				chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
			return Array( this._depth_ + (extra||0) ).join(chr);
		},
		up:function( a ) {
			this._depth_ += a || 1;
		},
		down:function( a ) {
			this._depth_ -= a || 1;
		},
		setParser:function( name, parser ) {
			this.parsers[name] = parser;
		},
		// The next 3 are exposed so you can use them
		quote:quote, 
		literal:literal,
		join:join,
		//
		_depth_: 1,
		// This is the list of parsers, to modify them, use jsDump.setParser
		parsers:{
			window: '[Window]',
			document: '[Document]',
			error:'[ERROR]', //when no parser is found, shouldn't happen
			unknown: '[Unknown]',
			'null':'null',
			undefined:'undefined',
			'function':function( fn ) {
				var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
				if ( name )
					ret += ' ' + name;
				ret += '(';
				
				ret = [ ret, this.parse( fn, 'functionArgs' ), '){'].join('');
				return join( ret, this.parse(fn,'functionCode'), '}' );
			},
			array: array,
			nodelist: array,
			arguments: array,
			object:function( map ) {
				var ret = [ ];
				this.up();
				for ( var key in map )
					ret.push( this.parse(key,'key') + ': ' + this.parse(map[key]) );
				this.down();
				return join( '{', ret, '}' );
			},
			node:function( node ) {
				var open = this.HTML ? '&lt;' : '<',
					close = this.HTML ? '&gt;' : '>';
					
				var tag = node.nodeName.toLowerCase(),
					ret = open + tag;
					
				for ( var a in this.DOMAttrs ) {
					var val = node[this.DOMAttrs[a]];
					if ( val )
						ret += ' ' + a + '=' + this.parse( val, 'attribute' );
				}
				return ret + close + open + '/' + tag + close;
			},
			functionArgs:function( fn ) {//function calls it internally, it's the arguments part of the function
				var l = fn.length;
				if ( !l ) return '';				
				
				var args = Array(l);
				while ( l-- )
					args[l] = String.fromCharCode(97+l);//97 is 'a'
				return ' ' + args.join(', ') + ' ';
			},
			key:quote, //object calls it internally, the key part of an item in a map
			functionCode:'[code]', //function calls it internally, it's the content of the function
			attribute:quote, //node calls it internally, it's an html attribute value
			string:quote,
			date:quote,
			regexp:literal, //regex
			number:literal,
			'boolean':literal
		},
		DOMAttrs:{//attributes to dump from nodes, name=>realName
			id:'id',
			name:'name',
			'class':'className'
		},
		HTML:false,//if true, entities are escaped ( <, >, \t, space and \n )
		indentChar:'   ',//indentation unit
		multiline:false //if true, items in a collection, are separated by a \n, else just a space.
	};

	return jsDump;
})();

})(this);


})(this);

})(jQuery);

// funcunit/qunit/rhino/rhino.js

(function($){

	if (navigator.userAgent.match(/Rhino/) && !window.build_in_progress) {
		QUnit.testStart = function(name){
			print("--" + name + "--")
		}
		QUnit.log = function(result, message){
			if(!message) message = ""
			print((result ? "  PASS " : "  FAIL ") + message)
		}
		QUnit.testDone = function(name, failures, total){
			print("  done - fail " + failures + ", pass " + total + "\n")
		}
		QUnit.moduleStart = function(name){
			print("MODULE " + name + "\n")
		}
		QUnit.moduleDone = function(name, failures, total){

		}
		QUnit.done = function(failures, total){
			print("\nALL DONE - fail " + failures + ", pass " + total)
		}

	}

})(jQuery);

// funcunit/resources/json.js

(function($){

(function($) {
    /** jQuery.toJSON( json-serializble )
        Converts the given argument into a JSON respresentation.

        If an object has a "toJSON" function, that will be used to get the representation.
        Non-integer/string keys are skipped in the object, as are keys that point to a function.

        json-serializble:
            The *thing* to be converted.
     **/
    $.toJSON = function(o, replacer, space, recurse)
    {
        if (typeof(JSON) == 'object' && JSON.stringify)
            return JSON.stringify(o, replacer, space);

        if (!recurse && $.isFunction(replacer))
            o = replacer("", o);

        if (typeof space == "number")
            space = "          ".substring(0, space);
        space = (typeof space == "string") ? space.substring(0, 10) : "";
        
        var type = typeof(o);
    
        if (o === null)
            return "null";
    
        if (type == "undefined" || type == "function")
            return undefined;
        
        if (type == "number" || type == "boolean")
            return o + "";
    
        if (type == "string")
            return $.quoteString(o);
    
        if (type == 'object')
        {
            if (typeof o.toJSON == "function") 
                return $.toJSON( o.toJSON(), replacer, space, true );
            
            if (o.constructor === Date)
            {
                var month = o.getUTCMonth() + 1;
                if (month < 10) month = '0' + month;

                var day = o.getUTCDate();
                if (day < 10) day = '0' + day;

                var year = o.getUTCFullYear();
                
                var hours = o.getUTCHours();
                if (hours < 10) hours = '0' + hours;
                
                var minutes = o.getUTCMinutes();
                if (minutes < 10) minutes = '0' + minutes;
                
                var seconds = o.getUTCSeconds();
                if (seconds < 10) seconds = '0' + seconds;
                
                var milli = o.getUTCMilliseconds();
                if (milli < 100) milli = '0' + milli;
                if (milli < 10) milli = '0' + milli;

                return '"' + year + '-' + month + '-' + day + 'T' +
                             hours + ':' + minutes + ':' + seconds + 
                             '.' + milli + 'Z"'; 
            }

            var process = ($.isFunction(replacer)) ?
                function (k, v) { return replacer(k, v); } :
                function (k, v) { return v; },
                nl = (space) ? "\n" : "",
                sp = (space) ? " " : "";

            if (o.constructor === Array) 
            {
                var ret = [];
                for (var i = 0; i < o.length; i++)
                    ret.push(( $.toJSON( process(i, o[i]), replacer, space, true ) || "null" ).replace(/^/gm, space));

                return "[" + nl + ret.join("," + nl) + nl + "]";
            }
        
            var pairs = [], proplist;
            if ($.isArray(replacer)) {
                proplist = $.map(replacer, function (v) {
                    return (typeof v == "string" || typeof v == "number") ?
                        v + "" :
                        null;
                });
            }
            for (var k in o) {
                var name, val, type = typeof k;

                if (proplist && $.inArray(k + "", proplist) == -1)
                    continue;

                if (type == "number")
                    name = '"' + k + '"';
                else if (type == "string")
                    name = $.quoteString(k);
                else
                    continue;  //skip non-string or number keys
            
                val = $.toJSON( process(k, o[k]), replacer, space, true );
            
                if (typeof val == "undefined")
                    continue;  //skip pairs where the value is a function.
            
                pairs.push((name + ":" + sp + val).replace(/^/gm, space));
            }

            return "{" + nl + pairs.join("," + nl) + nl + "}";
        }
    };

    /** jQuery.evalJSON(src)
        Evaluates a given piece of json source.
     **/
    $.evalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        return eval("(" + src + ")");
    };
    
    /** jQuery.secureEvalJSON(src)
        Evals JSON in a way that is *more* secure.
    **/
    $.secureEvalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        
        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        
        if (/^[\],:{}\s]*$/.test(filtered))
            return eval("(" + src + ")");
        else
            throw new SyntaxError("Error parsing JSON, source is not valid.");
    };

    /** jQuery.quoteString(string)
        Returns a string-repr of a string, escaping quotes intelligently.  
        Mostly a support function for toJSON.
    
        Examples:
            >>> jQuery.quoteString("apple")
            "apple"
        
            >>> jQuery.quoteString('"Where are we going?", she asked.')
            "\"Where are we going?\", she asked."
     **/
    $.quoteString = function(string)
    {
        if (string.match(_escapeable))
        {
            return '"' + string.replace(_escapeable, function (a) 
            {
                var c = _meta[a];
                if (typeof c === 'string') return c;
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    };
    
    var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
    
    var _meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
})(jQuery);

})(jQuery);

// funcunit/synthetic/synthetic.js

(function($){

	
	
var extend = function(d, s) { for (var p in s) d[p] = s[p]; return d;},
	// only uses browser detection for key events
	browser = {
		msie:     !!(window.attachEvent && !window.opera),
		opera:  !!window.opera,
		webkit : navigator.userAgent.indexOf('AppleWebKit/') > -1,
		safari: navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Chrome/') == -1,
		gecko:  navigator.userAgent.indexOf('Gecko') > -1,
		mobilesafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),
		rhino : navigator.userAgent.match(/Rhino/) && true
	},
	createEventObject = function(type, options, element){
		var event = element.ownerDocument.createEventObject();
		return extend(event, options);
	},
	data = {}, 
	id = 0, 
	expando = "_synthetic"+(new Date() - 0),
	bind,
	unbind,
	key = /keypress|keyup|keydown/,
	page = /load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll/,

/**
 * @constructor Syn
 * @download funcunit/dist/syn.js
 * @test funcunit/synthetic/qunit.html
 * Syn is used to simulate user actions.  It creates synthetic events and
 * performs their default behaviors.
 * 
 * <h2>Basic Use</h2>
 * The following clicks an input element with <code>id='description'</code>
 * and then types <code>'Hello World'</code>.
 * 
@codestart
Syn.click({},'description')
  .type("Hello World")
@codeend
 * <h2>User Actions and Events</h2>
 * <p>Syn is typically used to simulate user actions as opposed to triggering events. Typing characters
 * is an example of a user action.  The keypress that represents an <code>'a'</code>
 * character being typed is an example of an event. 
 * </p>
 * <p>
 *   While triggering events is supported, it's much more useful to simulate actual user behavior.  The 
 *   following actions are supported by Syn:
 * </p>
 * <ul>
 *   <li><code>[Syn.prototype.click click]</code> - a mousedown, focus, mouseup, and click.</li>
 *   <li><code>[Syn.prototype.dblclick dblclick]</code> - two <code>click!</code> events followed by a <code>dblclick</code>.</li>
 *   <li><code>[Syn.prototype.key key]</code> - types a single character (keydown, keypress, keyup).</li>
 *   <li><code>[Syn.prototype.type type]</code> - types multiple characters into an element.</li>
 *   <li><code>[Syn.prototype.move move]</code> - moves the mouse from one position to another (triggering mouseover / mouseouts).</li>
 *   <li><code>[Syn.prototype.drag drag]</code> - a mousedown, followed by mousemoves, and a mouseup.</li>
 * </ul>
 * All actions run asynchronously.  
 * Click on the links above for more 
 * information on how to use the specific action.
 * <h2>Asynchronous Callbacks</h2>
 * Actions don't complete immediately. This is almost 
 * entirely because <code>focus()</code> 
 * doesn't run immediately in IE.
 * If you provide a callback function to Syn, it will 
 * be called after the action is completed.
 * <br/>The following checks that "Hello World" was entered correctly: 
@codestart
Syn.click({},'description')
  .type("Hello World", function(){
  
  ok("Hello World" == document.getElementById('description').value)  
})
@codeend
<h2>Asynchronous Chaining</h2>
<p>You might have noticed the [Syn.prototype.then then] method.  It provides chaining 
so you can do a sequence of events with a single (final) callback.  
</p><p>
If an element isn't provided to then, it uses the previous Syn's element.
</p>
The following does a lot of stuff before checking the result:
@codestart
Syn.type('ice water','title')
  .type('ice and water','description')
  .click({},'create')
  .drag({to: 'favorites'},'newRecipe',
    function(){
      ok($('#newRecipe').parents('#favorites').length);
    })
@codeend

<h2>jQuery Helper</h2>
If jQuery is present, Syn adds a triggerSyn helper you can use like:
@codestart
$("#description").triggerSyn("type","Hello World");
@codeend
 * <h2>Key Event Recording</h2>
 * <p>Every browser has very different rules for dispatching key events.  
 * As there is no way to feature detect how a browser handles key events,
 * synthetic uses a description of how the browser behaves generated
 * by a recording application.  </p>
 * <p>
 * If you want to support a browser not currently supported, you can
 * record that browser's key event description and add it to
 * <code>Syn.key.browsers</code> by it's navigator agent.
 * </p>
@codestart
Syn.key.browsers["Envjs\ Resig/20070309 PilotFish/1.2.0.10\1.6"] = {
  'prevent':
    {"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
  'character':
    { ... }
}
@codeend
 * <h2>Limitations</h2>
 * Syn fully supports IE 6+, FF 3+, Chrome, Safari, Opera 10+.
 * With FF 1+, drag / move events are only partially supported. They will
 * not trigger mouseover / mouseout events.<br/>
 * Safari crashes when a mousedown is triggered on a select.  Syn will not 
 * create this event.
 * <h2>Contributing to Syn</h2>
 * Have we missed something? We happily accept patches.  The following are 
 * important objects and properties of Syn:
 * <ul>
 * 	<li><code>Syn.create</code> - contains methods to setup, convert options, and create an event of a specific type.</li>
 *  <li><code>Syn.defaults</code> - default behavior by event type (except for keys).</li>
 *  <li><code>Syn.key.defaults</code> - default behavior by key.</li>
 *  <li><code>Syn.keycodes</code> - supported keys you can type.</li>
 * </ul>
 * <h2>Roll Your Own Functional Test Framework</h2>
 * <p>Syn is really the foundation of JavaScriptMVC's functional testing framework - [FuncUnit].
 *   But, we've purposely made Syn work without any dependencies in the hopes that other frameworks or 
 *   testing solutions can use it as well.
 * </p>
 * @init 
 * Creates a synthetic event on the element.
 * @param {Object} type
 * @param {Object} options
 * @param {Object} element
 * @param {Object} callback
 * @return Syn
 */
Syn = function(type, options, element, callback){		
	return ( new Syn.init(type, options, element, callback) )
}
	
if(window.addEventListener){ // Mozilla, Netscape, Firefox
	bind = function(el, ev, f){
		el.addEventListener(ev, f, false)
	}
	unbind = function(el, ev, f){
		el.removeEventListener(ev, f, false)
	}
}else{
	bind = function(el, ev, f){
		el.attachEvent("on"+ev, f)
	}
	unbind = function(el, ev, f){
		el.detachEvent("on"+ev, f)
	}
}	
/**
 * @Static
 */	
extend(Syn,{
	/**
	 * Creates a new synthetic event instance
	 * @hide
	 * @param {Object} type
	 * @param {Object} options
	 * @param {Object} element
	 * @param {Object} callback
	 */
	init : function(type, options, element, callback){
		var args = Syn.args(options,element, callback),
			self = this;
		this.queue = [];
		this.element = args.element;
		
		//run event
		if(typeof this[type] == "function") {
			this[type](args.options, args.element, function(defaults,el ){
				args.callback && args.callback.apply(self, arguments);
				self.done.apply(self, arguments)		
			})
		}else{
			this.result = Syn.trigger(type, args.options, args.element);
			args.callback && args.callback.call(this, args.element, this.result);
		}
	},
	jquery : function(el, fast){
		if(window.FuncUnit && window.FuncUnit.jquery){
			return window.FuncUnit.jquery
		} if (el){
			return Syn.helpers.getWindow(el).jQuery || window.jQuery	
		}
		else{
			return window.jQuery
		}
	},
	/**
	 * Returns an object with the args for a Syn.
	 * @hide
	 * @return {Object}
	 */
	args : function(){
		var res = {}
		for(var i=0; i < arguments.length; i++){
			if(typeof arguments[i] == 'function'){
				res.callback = arguments[i]
			}else if(arguments[i] && arguments[i].jquery){
				res.element = arguments[i][0];
			}else if(arguments[i] && arguments[i].nodeName){
				res.element = arguments[i];
			}else if(res.options && typeof arguments[i] == 'string'){ //we can get by id
				res.element = document.getElementById(arguments[i])
			}
			else if(arguments[i]){
				res.options = arguments[i];
			}
		}
		return res;
	},
	click : function( options, element, callback){
		Syn('click!',options,element, callback);
	},
	/**
	 * @attribute defaults
	 * Default actions for events.  Each default function is called with this as its 
	 * element.  It should return true if a timeout 
	 * should happen after it.  If it returns an element, a timeout will happen
	 * and the next event will happen on that element.
	 */
	defaults : {
		focus : function(){
			if(!Syn.support.focusChanges){
				var element = this,
					nodeName = element.nodeName.toLowerCase();
				Syn.data(element,"syntheticvalue", element.value)
				
				if(nodeName == "input"){
					
					bind(element, "blur", function(){
						
						if( Syn.data(element,"syntheticvalue") !=  element.value){
							
							Syn.trigger("change", {}, element);
						}
						unbind(element,"blur", arguments.callee)
					})
					
				}
			}
		}
	},
	changeOnBlur : function(element, prop, value){
		
		bind(element, "blur", function(){		
			if( value !=  element[prop]){
				Syn.trigger("change", {}, element);
			}
			unbind(element,"blur", arguments.callee)
		})
		
	},
	/**
	 * Returns the closest element of a particular type.
	 * @hide
	 * @param {Object} el
	 * @param {Object} type
	 */
	closest : function(el, type){
		while(el && el.nodeName.toLowerCase() != type.toLowerCase()){
			el = el.parentNode
		}
		return el;
	},
	/**
	 * adds jQuery like data (adds an expando) and data exists FOREVER :)
	 * @hide
	 * @param {Object} el
	 * @param {Object} key
	 * @param {Object} value
	 */
	data : function(el, key, value){
		var d;
		if(!el[expando]){
			el[expando] = id++;
		}
		if(!data[el[expando]]){
			data[el[expando]] = {};
		}
		d = data[el[expando]]
		if(value){
			data[el[expando]][key] = value;
		}else{
			return data[el[expando]][key];
		}
	},
	/**
	 * Calls a function on the element and all parents of the element until the function returns
	 * false.
	 * @hide
	 * @param {Object} el
	 * @param {Object} func
	 */
	onParents : function(el, func){
		var res;
		while(el && res !== false){
			res = func(el)
			el = el.parentNode
		}
		return el;
	},
	//regex to match focusable elements
	focusable : /^(a|area|frame|iframe|label|input|select|textarea|button|html|object)$/i,
	/**
	 * Returns if an element is focusable
	 * @hide
	 * @param {Object} elem
	 */
	isFocusable : function(elem){
		var attributeNode;
		return ( this.focusable.test(elem.nodeName) || (
			(attributeNode = elem.getAttributeNode( "tabIndex" )) && attributeNode.specified ) )
			&& Syn.isVisible(elem)
	},
	/**
	 * Returns if an element is visible or not
	 * @hide
	 * @param {Object} elem
	 */
	isVisible : function(elem){
		return (elem.offsetWidth && elem.offsetHeight) || (elem.clientWidth && elem.clientHeight)
	},
	/**
	 * Gets the tabIndex as a number or null
	 * @hide
	 * @param {Object} elem
	 */
	tabIndex : function(elem){
		var attributeNode = elem.getAttributeNode( "tabIndex" );
		return attributeNode && attributeNode.specified && ( parseInt( elem.getAttribute('tabIndex') ) || 0 )
	},
	bind : bind,
	unbind : unbind,
	browser: browser,
	//some generic helpers
	helpers : {
		createEventObject : createEventObject,
		createBasicStandardEvent : function(type, defaults){
			var event;
			try {
				event = document.createEvent("Events");
			} catch(e2) {
				event = document.createEvent("UIEvents");
			} finally {
				event.initEvent(type, true, true);
				extend(event, defaults);
			}
			return event;
		},
		inArray : function(item, array){
			for(var i =0; i < array.length; i++){
				if(array[i] == item){
					return i;
				}
			}
			return -1;
		},
		getWindow : function(element){
			return element.ownerDocument.defaultView || element.ownerDocument.parentWindow
		},
		extend:  extend,
		scrollOffset : function(win){
			var doc = win.document.documentElement,
				body = win.document.body;
			return {
				left :  (doc && doc.scrollLeft || body && body.scrollLeft || 0) + (doc.clientLeft || 0),
				top : (doc && doc.scrollTop || body && body.scrollTop || 0) + (doc.clientTop || 0)
			}
				
		},
		addOffset : function(options, el){
			var jq = Syn.jquery(el)
			if(typeof options == 'object' &&
			   options.clientX === undefined &&
			   options.clientY === undefined &&
			   options.pageX   === undefined &&
			   options.pageY   === undefined && jq){
				var el = jq(el)
					off = el.offset();
				options.pageX = off.left + el.width() /2 ;
				options.pageY = off.top + el.height() /2 ;
			}
		}
	},
	// place for key data
	key : {
		ctrlKey : null,
		altKey : null,
		shiftKey : null,
		metaKey : null
	},
	//triggers an event on an element, returns true if default events should be run
	/**
	 * Dispatches an event and returns true if default events should be run.
	 * @hide
	 * @param {Object} event
	 * @param {Object} element
	 * @param {Object} type
	 * @param {Object} autoPrevent
	 */
	dispatch : (document.documentElement.dispatchEvent ? 
				function(event, element, type, autoPrevent){
					var preventDefault = event.preventDefault, 
						prevents = autoPrevent ? -1 : 0;
					
					//automatically prevents the default behavior for this event
					//this is to protect agianst nasty browser freezing bug in safari
					if(autoPrevent){
						bind(element, type, function(ev){
							ev.preventDefault()
							unbind(this, type, arguments.callee)
						})
					}
					
					
					event.preventDefault = function(){
						prevents++;
						if(++prevents > 0){
							preventDefault.apply(this,[]);
						}
					}
					element.dispatchEvent(event)
					return prevents <= 0;
				} : 
				function(event, element, type){
					try {window.event = event;}catch(e) {}
					//source element makes sure element is still in the document
					return element.sourceIndex <= 0 || element.fireEvent('on'+type, event)
				}
			),
	/**
	 * @attribute
	 * @hide
	 * An object of eventType -> function that create that event.
	 */
	create :  {
		//-------- PAGE EVENTS ---------------------
		page : {
			event : document.createEvent ? function(type, options, element){
					var event = element.ownerDocument.createEvent("Events");
					event.initEvent(type, true, true ); 
					return event;
				} : createEventObject
		},
		// unique events
		focus : {
			event : function(type, options, element){
				Syn.onParents(element, function(el){
					if( Syn.isFocusable(el)){
						if(el.nodeName.toLowerCase() != 'html'){
							el.focus();
						}
						return false
					}
				});
				return true;
			}
		}
	},
	/**
	 * @attribute support
	 * Feature detected properties of a browser's event system.
	 * Support has the following properties:
	 * <ul>
	 * 	<li><code>clickChanges</code> - clicking on an option element creates a change event.</li>
	 *  <li><code>clickSubmits</code> - clicking on a form button submits the form.</li>
	 *  <li><code>mouseupSubmits</code> - a mouseup on a form button submits the form.</li>
	 *  <li><code>radioClickChanges</code> - clicking a radio button changes the radio.</li>
	 *  <li><code>focusChanges</code> - focus/blur creates a change event.</li>
	 *  <li><code>linkHrefJS</code> - An achor's href JavaScript is run.</li>
	 *  <li><code>mouseDownUpClicks</code> - A mousedown followed by mouseup creates a click event.</li>
	 *  <li><code>tabKeyTabs</code> - A tab key changes tabs.</li>
	 *  <li><code>keypressOnAnchorClicks</code> - Keying enter on an anchor triggers a click.</li>
	 * </ul>
	 */
	support : {
		clickChanges : false,
		clickSubmits : false,
		keypressSubmits : false,
		mouseupSubmits: false,
		radioClickChanges : false,
		focusChanges : false,
		linkHrefJS : false,
		keyCharacters : false,
		backspaceWorks : false,
		mouseDownUpClicks : false,
		tabKeyTabs : false,
		keypressOnAnchorClicks : false,
		optionClickBubbles : false
	},
	/**
	 * Creates a synthetic event and dispatches it on the element.  
	 * This will run any default actions for the element.
	 * Typically you want to use Syn, but if you want the return value, use this.
	 * @param {String} type
	 * @param {Object} options
	 * @param {HTMLElement} element
	 * @return {Boolean} true if default events were run, false if otherwise.
	 */
	trigger : function(type, options, element){
		options || (options = {});
		
		var create = Syn.create,
			setup = create[type] && create[type].setup,
			kind = key.test(type) ? 
				'key' : 
				( page.test(type) ?
					"page" : "mouse" ),
				createType = create[type] || {},
				createKind = create[kind],
				event,
				ret,
				autoPrevent = options._autoPrevent,
				dispatchEl = element;
		
		//any setup code?
		Syn.support.ready && setup && setup(type, options, element);
		
		
		//get kind
		
		delete options._autoPrevent;
			
		if(createType.event){
			ret = createType.event(type, options, element)
		}else{
			//convert options
			options = createKind.options ? createKind.options(type,options,element) : options;
			
			if(!Syn.support.changeBubbles && /option/i.test(element.nodeName)){
				dispatchEl = element.parentNode; //jQuery expects clicks on select
			}
			
			//create the event
			event = createKind.event(type,options,dispatchEl)
			
			//send the event
			ret = Syn.dispatch(event, dispatchEl, type, autoPrevent)
		}
		
		//run default behavior
		ret && Syn.support.ready 
			&& Syn.defaults[type] 
			&& Syn.defaults[type].call(element, options, autoPrevent);
		return ret;
	},
	eventSupported: function( eventName ) { 
		var el = document.createElement("div"); 
		eventName = "on" + eventName; 

		var isSupported = (eventName in el); 
		if ( !isSupported ) { 
			el.setAttribute(eventName, "return;"); 
			isSupported = typeof el[eventName] === "function"; 
		} 
		el = null; 

		return isSupported; 
	}
	
});
	var h = Syn.helpers;
/**
 * @Prototype
 */
extend(Syn.init.prototype,{
	/**
	 * @function then
	 * <p>
	 * Then is used to chain a sequence of actions to be run one after the other.
	 * This is useful when many asynchronous actions need to be performed before some
	 * final check needs to be made.
	 * </p>
	 * <p>The following clicks and types into the <code>id='age'</code> element and then checks that only numeric characters can be entered.</p>
	 * <h3>Example</h3>
	 * @codestart
	 * Syn('click',{},'age')
	 *   .then('type','I am 12',function(){
	 *   equals($('#age').val(),"12")  
	 * })
	 * @codeend
	 * If the element argument is undefined, then the last element is used.
	 * 
	 * @param {String} type The type of event or action to create: "_click", "_dblclick", "_drag", "_type".
	 * @param {Object} options Optiosn to pass to the event.
	 * @param {String|HTMLElement} [element] A element's id or an element.  If undefined, defaults to the previous element.
	 * @param {Function} [callback] A function to callback after the action has run, but before any future chained actions are run.
	 */
	then : function(type, options, element, callback){
		if(Syn.autoDelay){
			this.delay();
		}
		var args = Syn.args(options,element, callback),
			self = this;

		
		//if stack is empty run right away
		
		//otherwise ... unshift it
		this.queue.unshift(function(el, prevented){
			
			if(typeof this[type] == "function") {
				this.element = args.element || el;
				this[type](args.options, this.element, function(defaults, el){
					args.callback && args.callback.apply(self, arguments);
					self.done.apply(self, arguments)		
				})
			}else{
				this.result = Syn.trigger(type, args.options, args.element);
				args.callback && args.callback.call(this, args.element, this.result);
				return this;
			}
		})
		return this;
	},
	/**
	 * Delays the next command a set timeout.
	 * @param {Number} [timeout]
	 * @param {Function} [callback]
	 */
	delay : function(timeout, callback){
		if(typeof timeout == 'function'){
			callback = timeout;
			timeout = null;
		}
		timeout = timeout || 600
		var self = this;
		this.queue.unshift(function(){
			setTimeout(function(){
				callback && callback.apply(self,[])
				self.done.apply(self, arguments)
			},timeout)
		})
		return this;
	},
	done : function( defaults, el){
		el && (this.element = el);;
		if(this.queue.length){
			this.queue.pop().call(this, this.element, defaults);
		}
		
	},
	/**
	 * @function click
	 * Clicks an element by triggering a mousedown, 
	 * mouseup, 
	 * and a click event.
	 * <h3>Example</h3>
	 * @codestart
	 * Syn.click({},'create',function(){
	 *   //check something
	 * })
	 * @codeend
	 * You can also provide the coordinates of the click.  
	 * If jQuery is present, it will set clientX and clientY
	 * for you.  Here's how to set it yourself:
	 * @codestart
	 * Syn.click(
	 *     {clientX: 20, clientY: 100},
	 *     'create',
	 *     function(){
	 *       //check something
	 *     })
	 * @codeend
	 * You can also provide pageX and pageY and Syn will convert it for you.
	 * @param {Object} options
	 * @param {HTMLElement} element
	 * @param {Function} callback
	 */
	"_click" : function(options, element, callback){
		Syn.helpers.addOffset(options, element);
		Syn.trigger("mousedown", options, element);
		
		//timeout is b/c IE is stupid and won't call focus handlers
		setTimeout(function(){
			Syn.trigger("mouseup", options, element)
			if(!Syn.support.mouseDownUpClicks){
				Syn.trigger("click", options, element)
			}else{
				//we still have to run the default (presumably)
				Syn.defaults.click.call(element)
			}
			callback(true)
		},1)
	},
	/**
	 * Right clicks in browsers that support it (everyone but opera).
	 * @param {Object} options
	 * @param {Object} element
	 * @param {Object} callback
	 */
	"_rightClick" : function(options, element, callback){
		Syn.helpers.addOffset(options, element);
		var mouseopts =  extend( extend({},Syn.mouse.browser.mouseup ), options)
		
		Syn.trigger("mousedown", mouseopts, element);
		
		//timeout is b/c IE is stupid and won't call focus handlers
		setTimeout(function(){
			Syn.trigger("mouseup", mouseopts, element)
			if (Syn.mouse.browser.contextmenu) {
				Syn.trigger("contextmenu", 
					extend( extend({},Syn.mouse.browser.contextmenu ), options), 
					element)
			}
			callback(true)
		},1)
	},
	/**
	 * @function dblclick
	 * Dblclicks an element.  This runs two [Syn.prototype.click click] events followed by
	 * a dblclick on the element.
	 * <h3>Example</h3>
	 * @codestart
	 * Syn.dblclick({},'open')
	 * @codeend
	 * @param {Object} options
	 * @param {HTMLElement} element
	 * @param {Function} callback
	 */
	"_dblclick" : function(options, element, callback){
		Syn.helpers.addOffset(options, element);
		var self = this;
		this._click(options, element, function(){
			self._click(options, element, function(){
				Syn.trigger("dblclick", options, element)
				callback(true)
			})
		})
	}
})

var actions = ["click","dblclick","move","drag","key","type",'rightClick'],
	makeAction = function(name){
		Syn[name] = function(options, element, callback){
			return Syn("_"+name, options, element, callback)
		}
		Syn.init.prototype[name] = function(options, element, callback){
			return this.then("_"+name, options, element, callback)
		}
	}
for(var i=0; i < actions.length; i++){
	makeAction(actions[i]);
}
/**
 * Used for creating and dispatching synthetic events.
 * @codestart
 * new MVC.Syn('click').send(MVC.$E('id'))
 * @codeend
 * @init Sets up a synthetic event.
 * @param {String} type type of event, ex: 'click'
 * @param {optional:Object} options
 */

if (window.jQuery || (window.FuncUnit && window.FuncUnit.jquery)) {
	(window.jQuery || window.FuncUnit.jquery).fn.triggerSyn = function(type, options, callback){
		Syn(type, options, this[0], callback)
		return this;
	};
}

window.Syn = Syn;
	

})(jQuery);

// funcunit/synthetic/mouse.js

(function($){


var h = Syn.helpers;

Syn.mouse = {};
h.extend(Syn.defaults,{
	mousedown : function(options){
		Syn.trigger("focus", {}, this)
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
		if(!Syn.support.linkHrefJS 
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
			&& !(Syn.support.clickSubmits)){
				
			var form =  Syn.closest(element, "form");
			if(form){
				Syn.trigger("submit",{},form)
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
			
			if(!Syn.support.clickChecks && !Syn.support.changeChecks){
				element.checked = !element.checked;
			}
			if(!Syn.support.clickChanges){
				Syn.trigger("change",{},  element );
			}
		}
		
		//change a radio button
		if(nodeName == "input" && element.type == "radio"){  // need to uncheck others if not checked
			
			if(!Syn.support.clickChecks && !Syn.support.changeChecks){
				//do the checks manually 
				if(!element.checked){ //do nothing, no change
					element.checked = true;
				}
			}
			if(checked != element.checked && !Syn.support.radioClickChanges){
				Syn.trigger("change",{},  element );
			}
		}
		// change options
		if(nodeName == "option" && Syn.data(element,"createChange")){
			Syn.trigger("change",{}, element.parentNode);//does not bubble
			Syn.data(element,"createChange",false)
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
				clientX : options.clientX || center[0] -(doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0), 
				clientY : options.clientY || center[1] -(doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0),
				ctrlKey : !!Syn.key.ctrlKey, 
				altKey : !!Syn.key.altKey, 
				shiftKey : !!Syn.key.shiftKey, 
				metaKey : !!Syn.key.metaKey,
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
			//if select or option, save old value and mark to change
			
			
			if(/option/i.test(element.nodeName)){
				var child = element.parentNode.firstChild,
				i = -1;
				while(child){
					if(child.nodeType ==1){
						i++;
						if(child == element) break;
					}
					child = child.nextSibling;
				}
				if(i !== element.parentNode.selectedIndex){
					//shouldn't this wait on triggering
					//change?
					element.parentNode.selectedIndex = i;
					Syn.data(element,"createChange",true)
				}
			}
		}
	},
	mousedown : {
		setup : function(type,options, element){
			var nn = element.nodeName.toLowerCase();
			//we have to auto prevent default to prevent freezing error in safari
			if(Syn.browser.safari && (nn == "select" || nn == "option" )){
				options._autoPrevent = true;
			}
		}
	}
});
//do support code
(function(){
	if(!document.body){
		setTimeout(arguments.callee,1)
		return;
	}
	var oldSynth = window.__synthTest;
	window.__synthTest = function(){
		Syn.support.linkHrefJS = true;
	}
	var div = document.createElement("div"), 
		checkbox, 
		submit, 
		form, 
		input, 
		select;
		
	div.innerHTML = "<form id='outer'>"+
		"<input name='checkbox' type='checkbox'/>"+
		"<input name='radio' type='radio' />"+
		"<input type='submit' name='submitter'/>"+
		"<input type='input' name='inputter'/>"+
		"<input name='one'>"+
		"<input name='two'/>"+
		"<a href='javascript:__synthTest()' id='synlink'></a>"+
		"<select><option></option></select>"+
		"</form>";
	document.documentElement.appendChild(div);
	form = div.firstChild
	checkbox = form.childNodes[0];
	submit = form.childNodes[2];
	select = form.getElementsByTagName('select')[0]
	
	checkbox.checked = false;
	checkbox.onchange = function(){
		Syn.support.clickChanges = true;
	}

	Syn.trigger("click", {}, checkbox)
	Syn.support.clickChecks = checkbox.checked;
	checkbox.checked = false;
	
	Syn.trigger("change", {}, checkbox);
	
	Syn.support.changeChecks = checkbox.checked;
	
	form.onsubmit = function(ev){
		if (ev.preventDefault) 
			ev.preventDefault();
		Syn.support.clickSubmits = true;
		return false;
	}
	Syn.trigger("click", {}, submit)

		
	
	form.childNodes[1].onchange = function(){
		Syn.support.radioClickChanges = true;
	}
	Syn.trigger("click", {}, form.childNodes[1])
	
	
	Syn.bind(div, 'click', function(){
		Syn.support.optionClickBubbles = true;
		Syn.unbind(div,'click', arguments.callee)
	})
	Syn.trigger("click",{},select.firstChild)
	
	
	Syn.support.changeBubbles = Syn.eventSupported('change');
	
	//test if mousedown followed by mouseup causes click (opera), make sure there are no clicks after this
	div.onclick = function(){
		Syn.support.mouseDownUpClicks = true;
	}
	Syn.trigger("mousedown",{},div)
	Syn.trigger("mouseup",{},div)
	
	document.documentElement.removeChild(div);
	
	//check stuff
	window.__synthTest = oldSynth;
	//support.ready = true;
})();



})(jQuery);

// funcunit/synthetic/browsers.js

(function($){

	Syn.key.browsers = {
		webkit : {
			'prevent':
			 {"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
			'character':
			 {"keydown":[0,"key"],"keypress":["char","char"],"keyup":[0,"key"]},
			'specialChars':
			 {"keydown":[0,"char"],"keyup":[0,"char"]},
			'navigation':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'special':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'tab':
			 {"keydown":[0,"char"],"keyup":[0,"char"]},
			'pause-break':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'caps':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'escape':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'num-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'scroll-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'print':
			 {"keyup":[0,"key"]},
			'function':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\r':
			 {"keydown":[0,"key"],"keypress":["char","key"],"keyup":[0,"key"]}
		},
		gecko : {
			'prevent':
			 {"keyup":[],"keydown":["char"],"keypress":["char"]},
			'character':
			 {"keydown":[0,"key"],"keypress":["char",0],"keyup":[0,"key"]},
			'specialChars':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'navigation':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'special':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\t':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'pause-break':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'caps':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'escape':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'num-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'scroll-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'print':
			 {"keyup":[0,"key"]},
			'function':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\r':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]}
		},
		msie : {
			'prevent':{"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
			'character':{"keydown":[null,"key"],"keypress":[null,"char"],"keyup":[null,"key"]},
			'specialChars':{"keydown":[null,"char"],"keyup":[null,"char"]},
			'navigation':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'special':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'tab':{"keydown":[null,"char"],"keyup":[null,"char"]},
			'pause-break':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'caps':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'escape':{"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'num-lock':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'scroll-lock':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'print':{"keyup":[null,"key"]},
			'function':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'\r':{"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]}	
		},
		opera : {
			'prevent':
			 {"keyup":[],"keydown":[],"keypress":["char"]},
			'character':
			 {"keydown":[null,"key"],"keypress":[null,"char"],"keyup":[null,"key"]},
			'specialChars':
			 {"keydown":[null,"char"],"keypress":[null,"char"],"keyup":[null,"char"]},
			'navigation':
			 {"keydown":[null,"key"],"keypress":[null,"key"]},
			'special':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'tab':
			 {"keydown":[null,"char"],"keypress":[null,"char"],"keyup":[null,"char"]},
			'pause-break':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'caps':
			 {"keydown":[null,"key"],"keyup":[null,"key"]},
			'escape':
			 {"keydown":[null,"key"],"keypress":[null,"key"]},
			'num-lock':
			 {"keyup":[null,"key"],"keydown":[null,"key"],"keypress":[null,"key"]},
			'scroll-lock':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'print':
			 {},
			'function':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'\r':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]}	
		}
	};
	
	Syn.mouse.browsers = {
		webkit : {"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}},
		opera: {},
		msie: {"mouseup":{"button":2},"contextmenu":{"button":0}},
		chrome : {"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}},
		gecko: {"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}}
	}
	
	//set browser
	Syn.key.browser = 
	(function(){
		if(Syn.key.browsers[window.navigator.userAgent]){
			return Syn.key.browsers[window.navigator.userAgent];
		}
		for(var browser in Syn.browser){
			if(Syn.browser[browser] && Syn.key.browsers[browser]){
				return Syn.key.browsers[browser]
			}
		}
		return Syn.key.browsers.gecko;
	})();
	
	Syn.mouse.browser = 
	(function(){
		if(Syn.mouse.browsers[window.navigator.userAgent]){
			return Syn.mouse.browsers[window.navigator.userAgent];
		}
		for(var browser in Syn.browser){
			if(Syn.browser[browser] && Syn.mouse.browsers[browser]){
				return Syn.mouse.browsers[browser]
			}
		}
		return Syn.mouse.browsers.gecko;
	})();
	

})(jQuery);

// funcunit/synthetic/key.js

(function($){


var h = Syn.helpers,
	S = Syn,

// gets the selection of an input or textarea
getSelection = function(el){
	// use selectionStart if we can
	if (el.selectionStart !== undefined) {
		// this is for opera, so we don't have to focus to type how we think we would
		if(document.activeElement 
		 	&& document.activeElement != el 
			&& el.selectionStart == el.selectionEnd 
			&& el.selectionStart == 0){
			return {start: el.value.length, end: el.value.length};
		}
		return  {start: el.selectionStart, end: el.selectionEnd}
	}else{
		//check if we aren't focused
		//if(document.activeElement && document.activeElement != el){
			
			
		//}
		try {
			//try 2 different methods that work differently (IE breaks depending on type)
			if (el.nodeName.toLowerCase() == 'input') {
				var real = h.getWindow(el).document.selection.createRange(), r = el.createTextRange();
				r.setEndPoint("EndToStart", real);
				
				var start = r.text.length
				return {
					start: start,
					end: start + real.text.length
				}
			}
			else {
				var real = h.getWindow(el).document.selection.createRange(), r = real.duplicate(), r2 = real.duplicate(), r3 = real.duplicate();
				r2.collapse();
				r3.collapse(false);
				r2.moveStart('character', -1)
				r3.moveStart('character', -1)
				//select all of our element
				r.moveToElementText(el)
				//now move our endpoint to the end of our real range
				r.setEndPoint('EndToEnd', real);
				var start = r.text.length - real.text.length, end = r.text.length;
				if (start != 0 && r2.text == "") {
					start += 2;
				}
				if (end != 0 && r3.text == "") {
					end += 2;
				}
				//if we aren't at the start, but previous is empty, we are at start of newline
				return {
					start: start,
					end: end
				}
			}
		}catch(e){
			return {start: el.value.length, end: el.value.length};
		}
	} 
},
// gets all focusable elements
getFocusable = function(el){
	var document = h.getWindow(el).document,
		res = [];

	var els = document.getElementsByTagName('*'),
		len = els.length;
		
	for(var i=0;  i< len; i++){
		Syn.isFocusable(els[i]) && els[i] != document.documentElement && res.push(els[i])
	}
	return res;
	
	
};

/**
 * @add Syn static
 */
h.extend(Syn,{
	/**
	 * @attribute
	 * A list of the keys and their keycodes codes you can type.
	 * You can add type keys with
	 * @codestart
	 * Syn('key','delete','title');
	 * 
	 * //or 
	 * 
	 * Syn('type','One Two Three[left][left][delete]','title')
	 * @codeend
	 * 
	 * The following are a list of keys you can type:
	 * @codestart text
	 * \b        - backspace
	 * \t        - tab
	 * \r        - enter
	 * ' '       - space
	 * a-Z 0-9   - normal characters
	 * /!@#$*,.? - All other typeable characters
	 * page-up   - scrolls up
	 * page-down - scrolls down
	 * end       - scrolls to bottom
	 * home      - scrolls to top
	 * insert    - changes how keys are entered
	 * delete    - deletes the next character
	 * left      - moves cursor left
	 * right     - moves cursor right
	 * up        - moves the cursor up
	 * down      - moves the cursor down
	 * f1-12     - function buttons
	 * shift, ctrl, alt - special keys
	 * pause-break      - the pause button
	 * scroll-lock      - locks scrolling
	 * caps      - makes caps
	 * escape    - escape button
	 * num-lock  - allows numbers on keypad
	 * print     - screen capture
	 * @codeend
	 */
	keycodes: {
		//backspace
		'\b':'8',
		
		//tab
		'\t':'9',
		
		//enter
		'\r':'13',
		
		//special
		'shift':'16','ctrl':'17','alt':'18',
		
		//weird
		'pause-break':'19',
		'caps':'20',
		'escape':'27',
		'num-lock':'144',
		'scroll-lock':'145',
		'print' : '44',
		
		//navigation
		'page-up':'33','page-down':'34','end':'35','home':'36',
		'left':'37','up':'38','right':'39','down':'40','insert':'45','delete':'46',
		
		//normal characters
		' ':'32',
		'0':'48','1':'49','2':'50','3':'51','4':'52','5':'53','6':'54','7':'55','8':'56','9':'57',
		'a':'65','b':'66','c':'67','d':'68','e':'69','f':'70','g':'71','h':'72','i':'73','j':'74','k':'75','l':'76','m':'77',
		'n':'78','o':'79','p':'80','q':'81','r':'82','s':'83','t':'84','u':'85','v':'86','w':'87','x':'88','y':'89','z':'90',
		//normal-characters, numpad
		'num0':'96','num1':'97','num2':'98','num3':'99','num4':'100','num5':'101','num6':'102','num7':'103','num8':'104','num9':'105',
		'*':'106','+':'107','-':'109','.':'110',
		//normal-characters, others
		'/':'111',
		';':'186',
		'=':'187',
		',':'188',
		'-':'189',
		'.':'190',
		'/':'191',
		'`':'192',
		'[':'219',
		'\\':'220',
		']':'221',
		"'":'222',
		
		//ignore these, you shouldn't use them
		'left window key':'91','right window key':'92','select key':'93',
		
		
		'f1':'112','f2':'113','f3':'114','f4':'115','f5':'116','f6':'117',
		'f7':'118','f8':'119','f9':'120','f10':'121','f11':'122','f12':'123'
	},
	
	// what we can type in
	typeable : /input|textarea/i,
	
	// selects text on an element
	selectText: function(el, start, end){
		if(el.setSelectionRange){
			if(!end){
                el.focus();
                el.setSelectionRange(start, start);
			} else {
				el.selectionStart = start;
				el.selectionEnd = end;
			}
		}else if (el.createTextRange) {
			//el.focus();
			var r = el.createTextRange();
			r.moveStart('character', start);
			end = end || start;
			r.moveEnd('character', end - el.value.length);
			
			r.select();
		} 
	},
	getText: function(el){
		//first check if the el has anything selected ..
		if(Syn.typeable.test(el.nodeName)){
			var sel = getSelection(el);
			return el.value.substring(sel.start, sel.end)
		}
		//otherwise get from page
		var win = Syn.helpers.getWindow(el);
		if (win.getSelection) {
			return win.getSelection().toString();
		}
		else  if (win.document.getSelection) {
			return win.document.getSelection().toString()
		}
		else {
			return win.document.selection.createRange().text;
		}
	},
	getSelection : getSelection
});

h.extend(Syn.key,{
	// retrieves a description of what events for this character should look like
	data : function(key){
		//check if it is described directly
		if(S.key.browser[key]){
			return S.key.browser[key];
		}
		for(var kind in S.key.kinds){
			if(h.inArray(key, S.key.kinds[kind] ) > -1){
				return S.key.browser[kind]
			}
		}
		return S.key.browser.character
	},
	
	//returns the special key if special
	isSpecial : function(keyCode){
		var specials = S.key.kinds.special;
		for(var i=0; i < specials.length; i++){
			if(Syn.keycodes[ specials[i] ] == keyCode){
				return specials[i];
			}
		}
	},
	/**
	 * @hide
	 * gets the options for a key and event type ...
	 * @param {Object} key
	 * @param {Object} event
	 */
	options : function(key, event){
		var keyData = Syn.key.data(key);
		
		if(!keyData[event]){
			//we shouldn't be creating this event
			return null;
		}
			
		var	charCode = keyData[event][0],
			keyCode = keyData[event][1],
			result = {};
			
		if(keyCode == 'key'){
			result.keyCode = Syn.keycodes[key]
		} else if (keyCode == 'char'){
			result.keyCode = key.charCodeAt(0)
		}else{
			result.keyCode = keyCode;
		}
		
		if(charCode == 'char'){
			result.charCode = key.charCodeAt(0)
		}else if(charCode !== null){
			result.charCode = charCode;
		}
		
		
		return result
	},
	//types of event keys
	kinds : {
		special : ["shift",'ctrl','alt','caps'],
		specialChars : ["\b"],
		navigation: ["page-up",'page-down','end','home','left','up','right','down','insert','delete'],
		'function' : ['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12']
	},
	//returns the default function
	getDefault : function(key){
		//check if it is described directly
		if(Syn.key.defaults[key]){
			return Syn.key.defaults[key];
		}
		for(var kind in Syn.key.kinds){
			if(h.inArray(key, Syn.key.kinds[kind])> -1 && Syn.key.defaults[kind]  ){
				return Syn.key.defaults[kind];
			}
		}
		return Syn.key.defaults.character
	},
	// default behavior when typing
	defaults : 	{
		'character' : function(options, scope, key, force){
			if(/num\d+/.test(key)){
				key = key.match(/\d+/)[0]
			}
			
			if(force || (!S.support.keyCharacters && Syn.typeable.test(this.nodeName))){
				var current = this.value,
					sel = getSelection(this),
					before = current.substr(0,sel.start),
					after = current.substr(sel.end),
					character = key;
				
				this.value = before+character+after;
				//handle IE inserting \r\n
				var charLength = character == "\n" && S.support.textareaCarriage ? 2 : character.length;
				Syn.selectText(this, before.length + charLength)
			}		
		},
		'c' : function(options, scope, key){
			if(Syn.key.ctrlKey){
				Syn.key.clipboard = Syn.getText(this)
			}else{
				Syn.key.defaults.character.call(this, options,scope, key);
			}
		},
		'v' : function(options, scope, key){
			if(Syn.key.ctrlKey){
				Syn.key.defaults.character.call(this, options,scope, Syn.key.clipboard, true);
			}else{
				Syn.key.defaults.character.call(this, options,scope, key);
			}
		},
		'a' : function(options, scope, key){
			if(Syn.key.ctrlKey){
				Syn.selectText(this, 0, this.value.length)
			}else{
				Syn.key.defaults.character.call(this, options,scope, key);
			}
		},
		'home' : function(){
			Syn.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					el.scrollTop = 0;
					return false;
				}
			})
		},
		'end' : function(){
			Syn.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					el.scrollTop = el.scrollHeight;
					return false;
				}
			})
		},
		'page-down' : function(){
			//find the first parent we can scroll
			Syn.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					var ch = el.clientHeight
					el.scrollTop += ch;
					return false;
				}
			})
		},
		'page-up' : function(){
			Syn.onParents(this, function(el){
				if(el.scrollHeight != el.clientHeight){
					var ch = el.clientHeight
					el.scrollTop -= ch;
					return false;
				}
			})
		},
		'\b' : function(){
			//this assumes we are deleting from the end
			if(!S.support.backspaceWorks && Syn.typeable.test(this.nodeName)){
				var current = this.value,
					sel = getSelection(this),
					before = current.substr(0,sel.start),
					after = current.substr(sel.end);
				if(sel.start == sel.end && sel.start > 0){
					//remove a character
					this.value = before.substring(0, before.length - 1)+after
					Syn.selectText(this, sel.start-1)
				}else{
					this.value = before+after;
					Syn.selectText(this, sel.start)
				}
				
				//set back the selection
			}	
		},
		'delete' : function(){
			if(!S.support.backspaceWorks && Syn.typeable.test(this.nodeName)){
				var current = this.value,
					sel = getSelection(this),
					before = current.substr(0,sel.start),
					after = current.substr(sel.end);
				
				if(sel.start == sel.end && sel.start < this.value.length - 1){
					//remove a character
					this.value = before+after.substring(1)
				}else{
					this.value = before+after;
				}
			}		
		},
		'\r' : function(options, scope){
			
			var nodeName = this.nodeName.toLowerCase()
			// submit a form
			if(!S.support.keypressSubmits && nodeName == 'input'){
				var form = Syn.closest(this, "form");
				if(form){
					Syn.trigger("submit", {}, form);
				}
					
			}
			//newline in textarea
			if(!S.support.keyCharacters && nodeName == 'textarea'){
				Syn.key.defaults.character.call(this, options, scope, "\n")
			}
			// 'click' hyperlinks
			if(!S.support.keypressOnAnchorClicks && nodeName == 'a'){
				Syn.trigger("click", {}, this);
			}
		},
		// 
		// Gets all focusable elements.  If the element (this)
		// doesn't have a tabindex, finds the next element after.
		// If the element (this) has a tabindex finds the element 
		// with the next higher tabindex OR the element with the same
		// tabindex after it in the document.
		// @return the next element
		// 
		'\t' : function(options, scope){
				// focusable elements
			var focusEls = getFocusable(this),
				// the current element's tabindex
				tabIndex = Syn.tabIndex(this),
				// will be set to our guess for the next element
				current = null,
				// the next index we care about
				currentIndex = 1000000000,
				// set to true once we found 'this' element
				found = false,
				i = 0,
				el, 
				//the tabindex of the tabable element we are looking at
				elIndex,
				firstNotIndexed,
				prev;
			
			var sort = function(el1, el2){
				var tab1 = Syn.tabIndex(el1) || 0,
					tab2 = Syn.tabIndex(el2) || 0;
				if(tab1 == tab2){
					return 0
				}else{
					if(tab1 == 0){
						return 1;
					}else if(tab2 == 0){
						return -1;
					}
					
					return tab1-tab2;
				}
			}
			focusEls.sort(sort);
			//now find current
			for(; i< focusEls.length; i++){
				el = focusEls[i];
				if(this== el ){
					if(!Syn.key.shiftKey){
						current = focusEls[i+1];
						if(!current){
							current = focusEls[0]
						}
					}else{
						current = focusEls[i-1];
						if(!current){
							current = focusEls[focusEls.length-1]
						}
					}
					
				}
			}
			
			//restart if we didn't find anything
			if(!current){
				current = firstNotIndexed;
			}
			current && current.focus();
			return current;
		},
		'left' : function(){
			if( Syn.typeable.test(this.nodeName) ){
				var sel = getSelection(this);
				
				if(Syn.key.shiftKey){
					Syn.selectText(this, sel.start == 0 ? 0 : sel.start - 1, sel.end)
				}else{
					Syn.selectText(this, sel.start == 0 ? 0 : sel.start - 1)
				}
			}
		},
		'right' : function(){
			if( Syn.typeable.test(this.nodeName) ){
				var sel = getSelection(this);
				
				if(Syn.key.shiftKey){
					Syn.selectText(this, sel.start, sel.end+1 > this.value.length ? this.value.length  : sel.end+1)
				}else{
					Syn.selectText(this, sel.end+1 > this.value.length ? this.value.length  : sel.end+1)
				}
			}	
		},
		'up' : function(){
			if(/select/i.test(this.nodeName)){
				
				this.selectedIndex = this.selectedIndex ? this.selectedIndex-1 : 0;
				//set this to change on blur?
			}
		},
		'down' : function(){
			if(/select/i.test(this.nodeName)){
				Syn.changeOnBlur(this, "selectedIndex", this.selectedIndex)
				this.selectedIndex = this.selectedIndex+1;
				//set this to change on blur?
			}
		},
		'shift' : function(){
			return null;
		}
	}
});


h.extend(Syn.create,{
	keydown : {
		setup : function(type, options, element){
			if(h.inArray(options,Syn.key.kinds.special ) != -1){
				Syn.key[options+"Key"] = element;
			}
		}
	},
	keyup : {
		setup : function(type, options, element){
			if(h.inArray(options,Syn.key.kinds.special )!= -1){
				Syn.key[options+"Key"] = null;
			}
		}
		},
	key : {
		// return the options for a key event
		options : function(type, options, element){
			//check if options is character or has character
			options = typeof options != "object" ? {character : options} : options;
			
			//don't change the orignial
			options = h.extend({}, options)
			if(options.character){
				h.extend(options, S.key.options(options.character, type));
				delete options.character;
			}
			
			options = h.extend({
				ctrlKey: !!Syn.key.ctrlKey,
				altKey: !!Syn.key.altKey,
				shiftKey: !!Syn.key.shiftKey,
				metaKey: !!Syn.key.metaKey
			}, options)
			
			return options;
		},
		// creates a key event
		event : document.createEvent ? 
			function(type, options, element){  //Everyone Else
				var event;
				
				try {
		
					event = element.ownerDocument.createEvent("KeyEvents");
					event.initKeyEvent(type, true, true, window, 
						options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
						options.keyCode, options.charCode );
				} catch(e) {
					event = h.createBasicStandardEvent(type,options)
				}
				event.synthetic = true;
				return event;

			} : 
			function(type, options, element){
				var event = h.createEventObject.apply(this,arguments);
				h.extend(event, options)

				return event;
			}
		}
});

var convert = {
			"enter" : "\r",
			"backspace" : "\b",
			"tab" : "\t",
			"space" : " "
		}

/**
 * @add Syn prototype
 */
h.extend(Syn.init.prototype,
{
	/**
	 * @function key
	 * Types a single key.  The key should be
	 * a string that matches a 
	 * [Syn.static.keycodes].
	 * 
	 * The following sends a carridge return
	 * to the 'name' element.
	 * @codestart
	 * Syn.key('\r','name')
	 * @codeend
	 * For each character, a keydown, keypress, and keyup is triggered if
	 * appropriate.
	 * @param {String} options
	 * @param {HTMLElement} [element]
	 * @param {Function} [callback]
	 * @return {HTMLElement} the element currently focused.
	 */
	_key : function(options, element, callback){
		//first check if it is a special up
		if(/-up$/.test(options) 
			&& h.inArray(options.replace("-up",""),Syn.key.kinds.special )!= -1){
			Syn.trigger('keyup',options.replace("-up",""), element )
			callback(true, element);
			return;
		}
		
		
		var key = convert[options] || options,
			// should we run default events
			runDefaults = Syn.trigger('keydown',key, element ),
			
			// a function that gets the default behavior for a key
			getDefault = Syn.key.getDefault,
			
			// how this browser handles preventing default events
			prevent = Syn.key.browser.prevent,
			
			// the result of the default event
			defaultResult,
			
			// options for keypress
			keypressOptions = Syn.key.options(key, 'keypress')
		
		
		if(runDefaults){
			//if the browser doesn't create keypresses for this key, run default
			if(!keypressOptions){
				defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key)
			}else{
				//do keypress
				runDefaults = Syn.trigger('keypress',keypressOptions, element )
				if(runDefaults){
					defaultResult = getDefault(key).call(element, keypressOptions, h.getWindow(element), key)
				}
			}
		}else{
			//canceled ... possibly don't run keypress
			if(keypressOptions && h.inArray('keypress',prevent.keydown) == -1 ){
				Syn.trigger('keypress',keypressOptions, element )
			}
		}
		if(defaultResult && defaultResult.nodeName){
			element = defaultResult
		}
		
		if(defaultResult !== null){
			setTimeout(function(){
				Syn.trigger('keyup',Syn.key.options(key, 'keyup'), element )
				callback(runDefaults, element)
			},1)
		}else{
			callback(runDefaults, element)
		}
		
		
		//do mouseup
		
		return element;
		// is there a keypress? .. if not , run default
		// yes -> did we prevent it?, if not run ...
		
	},
	/**
	 * @function type
	 * Types sequence of [Syn.prototype.key key actions].  Each
	 * character is typed, one at a type.
	 * Multi-character keys like 'left' should be
	 * enclosed in square brackents.
	 * 
	 * The following types 'JavaScript MVC' then deletes the space.
	 * @codestart
	 * Syn.type('JavaScript MVC[left][left][left]\b','name')
	 * @codeend
	 * 
	 * Type is able to handle (and move with) tabs (\t).  
	 * The following simulates tabing and entering values in a form and 
	 * eventually submitting the form.
	 * @codestart
	 * Syn.type("Justin\tMeyer\t27\tjustinbmeyer@gmail.com\r")
	 * @codeend
	 * @param {String} options the text to type
	 * @param {HTMLElement} [element] an element or an id of an element
	 * @param {Function} [callback] a function to callback
	 */
	_type : function(options, element, callback){
		//break it up into parts ...
		//go through each type and run
		var parts = options.match(/(\[[^\]]+\])|([^\[])/g),
			self  = this,
			runNextPart = function(runDefaults, el){
				var part = parts.shift();
				if(!part){
					callback(runDefaults, el);
					return;
				}
				el = el || element;
				if(part.length > 1){
					part = part.substr(1,part.length - 2)
				}
				self._key(part, el, runNextPart)
			}
		
		runNextPart();
		
	}
});


//do support code
(function(){
	if(!document.body){
		setTimeout(arguments.callee,1)
		return;
	}

	var div = document.createElement("div"), 
		checkbox, 
		submit, 
		form, 
		input, 
		submitted = false,
		anchor,
		textarea;
		
	div.innerHTML = "<form id='outer'>"+
		"<input name='checkbox' type='checkbox'/>"+
		"<input name='radio' type='radio' />"+
		"<input type='submit' name='submitter'/>"+
		"<input type='input' name='inputter'/>"+
		"<input name='one'>"+
		"<input name='two'/>"+
		"<a href='#abc'></a>"+
		"<textarea>1\n2</textarea>"
		"</form>";
		
	document.documentElement.appendChild(div);
	form = div.firstChild;
	checkbox = form.childNodes[0];
	submit = form.childNodes[2];
	anchor = form.getElementsByTagName("a")[0];
	textarea = form.getElementsByTagName("textarea")[0]
	form.onsubmit = function(ev){
		if (ev.preventDefault) 
			ev.preventDefault();
		S.support.keypressSubmits = true;
		ev.returnValue = false;
		return false;
	}
	Syn.trigger("keypress", "\r", form.childNodes[3]);
	
	
	Syn.trigger("keypress", "a", form.childNodes[3]);
	S.support.keyCharacters = form.childNodes[3].value == "a";
	
	
	form.childNodes[3].value = "a"
	Syn.trigger("keypress", "\b", form.childNodes[3]);
	S.support.backspaceWorks = form.childNodes[3].value == "";
	
		
	
	form.childNodes[3].onchange = function(){
		S.support.focusChanges = true;
	}
	form.childNodes[3].focus();
	Syn.trigger("keypress", "a", form.childNodes[3]);
	form.childNodes[5].focus();
	
	//test keypress \r on anchor submits
	S.bind(anchor,"click",function(ev){
		if (ev.preventDefault) 
			ev.preventDefault();
		S.support.keypressOnAnchorClicks = true;
		ev.returnValue = false;
		return false;
	})
	Syn.trigger("keypress", "\r", anchor);
	
	S.support.textareaCarriage = textarea.value.length == 4
	document.documentElement.removeChild(div);
	
	S.support.ready = true;
})();



	

})(jQuery);

// funcunit/synthetic/drag/drag.js

(function($){

	// document body has to exists for this test

	(function(){
		if (!document.body) {
			setTimeout(arguments.callee, 1)
			return;
		}
		var div = document.createElement('div')
		document.body.appendChild(div);
		Syn.helpers.extend(div.style, {
			width: "100px",
			height: "10000px",
			backgroundColor: "blue",
			position: "absolute",
			top: "10px",
			left: "0px",
			zIndex: 19999
		});
		document.body.scrollTop = 11;
		if(!document.elementFromPoint){
			return;
		}
		var el = document.elementFromPoint(3, 1)
		if (el == div) {
			Syn.support.elementFromClient = true;
		}
		else {
			Syn.support.elementFromPage = true;
		}
		document.body.removeChild(div);
		document.body.scrollTop = 0;
	})();
	
	
	//gets an element from a point
	var elementFromPoint = function(point, element){
		var clientX = point.clientX, clientY = point.clientY, win = Syn.helpers.getWindow(element)
		
		if (Syn.support.elementFromPage) {
			var off = Syn.helpers.scrollOffset(win);
			clientX = clientX + off.left; //convert to pageX
			clientY = clientY + off.top; //convert to pageY
		}
		
		return win.document.elementFromPoint ? win.document.elementFromPoint(clientX, clientY) : element;
	}, //creates an event at a certain point
	createEventAtPoint = function(event, point, element){
		var el = elementFromPoint(point, element)
		Syn.trigger(event, point, el || element)
		return el;
	}, // creates a mousemove event, but first triggering mouseout / mouseover if appropriate
	mouseMove = function(point, element, last){
		var el = elementFromPoint(point, element)
		if (last != el && el) {
			var options = Syn.helpers.extend({},point);
			options.relatedTarget = el;
			Syn.trigger("mouseout", options, last);
			options.relatedTarget = last;
			Syn.trigger("mouseover", options, el);
		}
		
		Syn.trigger("mousemove", point, el || element)
		return el;
	}, // start and end are in clientX, clientY
	startMove = function(start, end, duration, element, callback){
		var startTime = new Date(), distX = end.clientX - start.clientX, distY = end.clientY - start.clientY, win = Syn.helpers.getWindow(element), current = elementFromPoint(start, element), cursor = win.document.createElement('div')
		move = function(){
			//get what fraction we are at
			var now = new Date(), 
				scrollOffset = Syn.helpers.scrollOffset(win), 
				fraction = (now - startTime) / duration, 
				options = {
					clientX: distX * fraction + start.clientX,
					clientY: distY * fraction + start.clientY
				};
			if (fraction < 1) {
				Syn.helpers.extend(cursor.style, {
					left: (options.clientX + scrollOffset.left + 2) + "px",
					top: (options.clientY + scrollOffset.top + 2) + "px"
				})
				current = mouseMove(options, element, current)
				setTimeout(arguments.callee, 15)
			}
			else {
				current = mouseMove(end, element, current);
				win.document.body.removeChild(cursor)
				callback();
			}
		}
		Syn.helpers.extend(cursor.style, {
			height: "5px",
			width: "5px",
			backgroundColor: "red",
			position: "absolute",
			zIndex: 19999,
			fontSize: "1px"
		})
		win.document.body.appendChild(cursor)
		move();
	}, 
	startDrag = function(start, end, duration, element, callback){
		createEventAtPoint("mousedown", start, element);
		startMove(start, end, duration, element, function(){
			createEventAtPoint("mouseup", end, element);
			callback();
		})
	},
	center = function(el){
		var j = Syn.jquery()(el),
		o = j.offset();
		return{
			pageX: o.left + (j.width() / 2),
			pageY: o.top + (j.height() / 2)
		}
	},
	convertOption = function(option, win, from){
		var page = /(\d+)[x ](\d+)/,
			client = /(\d+)X(\d+)/,
			relative = /([+-]\d+)[xX ]([+-]\d+)/
		//check relative "+22x-44"
		if (typeof option == 'string' && relative.test(option) && from) {
			var cent = center(from),
				parts = option.match(relative);
			option = {
				pageX: cent.pageX + parseInt(parts[1]),
				pageY: cent.pageY +parseInt(parts[2])
			}
		}
		if (typeof option == 'string' && page.test(option)) {
			var parts = option.match(page)
			option = {
				pageX: parseInt(parts[1]),
				pageY: parseInt(parts[2])
			}
		}
		if (typeof option == 'string' && client.test(option)) {
			var parts = option.match(client)
			option = {
				clientX: parseInt(parts[1]),
				clientY: parseInt(parts[2])
			}
		}
		if (typeof option == 'string') {
			option = Syn.jquery()(option, win.document)[0];
		}
		if (option.nodeName) {
			option = center(option)
		}
		if (option.pageX) {
			var off = Syn.helpers.scrollOffset(win);
			option = {
				clientX: option.pageX - off.left,
				clientY: option.pageY - off.top
			}
		}
		return option;
	}
/**
 * @add Syn prototype
 */	
Syn.helpers.extend(Syn.init.prototype,{
	/**
	 * @function move
	 * Moves the cursor from one point to another.  
	 * <h3>Quick Example</h3>
	 * The following moves the cursor from (0,0) in
	 * the window to (100,100) in 1 second.
	 * @codestart
	 * Syn.move(
	 *      {
	 *        from: {clientX: 0, clientY: 0},
	 *        to: {clientX: 100, clientY: 100},
	 *        duration: 1000
	 *      },
	 *      document.document)
	 * @codeend
	 * <h2>Options</h2>
	 * There are many ways to configure the endpoints of the move.
	 * 
	 * <h3>PageX and PageY</h3>
	 * If you pass pageX or pageY, these will get converted
	 * to client coordinates.
	 * @codestart
	 * Syn.move(
	 *      {
	 *        from: {pageX: 0, pageY: 0},
	 *        to: {pageX: 100, pageY: 100}
	 *      },
	 *      document.document)
	 * @codeend
	 * <h3>String Coordinates</h3>
	 * You can set the pageX and pageY as strings like:
	 * @codestart
	 * Syn.move(
	 *      {
	 *        from: "0x0",
	 *        to: "100x100"
	 *      },
	 *      document.document)
	 * @codeend
	 * <h3>Element Coordinates</h3>
	 * If jQuery is present, you can pass an element as the from or to option
	 * and the coordinate will be set as the center of the element.
	 * @codestart
	 * Syn.move(
	 *      {
	 *        from: $(".recipe")[0],
	 *        to: $("#trash")[0]
	 *      },
	 *      document.document)
	 * @codeend
	 * <h3>Query Strings</h3>
	 * If jQuery is present, you can pass a query string as the from or to option.
	 * @codestart
	 * Syn.move(
	 *      {
	 *        from: ".recipe",
	 *        to: "#trash"
	 *      },
	 *      document.document)
	 * @codeend   
	 * <h3>No From</h3>
	 * If you don't provide a from, the element argument passed to Syn is used.
	 * @codestart
	 * Syn.move(
	 *      { to: "#trash" },
	 *      'myrecipe')
	 * @codeend  
	 * @param {Object} options
	 * @param {HTMLElement} from
	 * @param {Function} callback
	 */
	_move : function(options, from, callback){
		//need to convert if elements
		var win = Syn.helpers.getWindow(from), 
			fro = convertOption(options.from || from, win), 
			to = convertOption(options.to || options, win);
		
		startMove(fro, to, options.duration || 500, from, callback);
	},
	/**
	 * @function drag
	 * Creates a mousedown and drags from one point to another.  
	 * Check out [Syn.prototype.move move] for API details.
	 * 
	 * @param {Object} options
	 * @param {Object} from
	 * @param {Object} callback
	 */
	_drag : function(options, from, callback){
		//need to convert if elements
		var win = Syn.helpers.getWindow(from), 
			fro = convertOption(options.from || from, win, from), 
			to = convertOption(options.to || options, win, from);
		
		startDrag(fro, to, options.duration || 500, from, callback);
	}
})


})(jQuery);

// funcunit/funcunit.js

(function($){




//this gets the global object, even in rhino
var window = (function(){return this }).call(null),

//if there is an old FuncUnit, use that for settings
	oldFunc = window.FuncUnit;

/**
 * @constructor FuncUnit
 * @tag core
 * FuncUnit provides powerful functional testing as an add on to qUnit.  The same tests can be run 
 * in the browser, or with Selenium.  It also lets you run basic qUnit tests in EnvJS.
 * 
 * <h2>Example:</h2>
 * Here's how you might tests an Auto Suggest
@codestart
test("FuncUnit Results",function(){
	S('#auto_suggest').click().type("FuncUnit")
	
	S('.result').exists().size(function(size){
	equal(size, 5,"there are 5 results")
	})
});
@codeend
 * 
 * <h2>Setting up with JavaScriptMVC</h2>
 * <p>When you create a plugin or application with code generators, JavaScriptMVC makes a testing skeleton for you.
 * You just have to add to the test file it creates.
 * But, it's useful to know how to setup a testing page on your own.  Here's how:
 * </p>
 * 
 * <ol>
 * 	<li>Create a JS file (ex: mytest.js) for your tests inside JMVC's root directory.  The skeleton should like:
@codestart
steal.plugins('funcunit').then(function(){
  test("page opens", function(){
    $.open("//path/to/myPage.html"); //referenced from jmvc root folder
    ok(true,"page Loaded");
  })
})
@codeend
 *  </li>
 *  <li>Create an HTML file (mytest.html).  The skeleton should look like:
@codestart
&lt;html>
  &lt;head>
    &lt;link rel="stylesheet" 
             type="text/css" 
             href="..<b>/path/to/</b>funcunit/qunit/qunit.css" />
    &lt;title>FuncUnit Test&lt;/title>
  &lt;/head>
  &lt;body>
    &lt;h1 id="qunit-header">FuncUnit Test Suite&lt;/h1>
    &lt;h2 id="qunit-banner">&lt;/h2>
    &lt;div id="qunit-testrunner-toolbar">&lt;/div>
    &lt;h2 id="qunit-userAgent">&lt;/h2>
    &lt;ol id="qunit-tests">&lt;/ol>
    &lt;script type='text/javascript' 
        src='..<b>/path/to/</b>steal/steal.js?<b>path/to</b>/mytest.js'>
    &lt;/script>
  &lt;/body>
&lt;/html>
@codeend
Make sure you reference qunit and steal correctly.  The path to your test page (mytest.js)
should be given from the jmvc root folder.

 * </li>
 *  <li>Open your html page (mytest.html) in a browser.  Did it pass?  If not check the paths.</li>
 *  <li>If you aren't running from the filesystem, you need to change funcunit/settings.js to point to the JMVC
 *  root folder on your server:
@codestart
FuncUnit= {jmvcRoot: "http://localhost/scripts/" }
@codeend
 *  </li>
 *  <li>Now run your test.
@codestart text
envjs path/to/mytest.html
@codeend
</li>
 * </ol>
 * <h2>Writing Tests</h2>
 * <p>Writing tests is super easy and follows this pattern:</p>
<ol>
  <li>Open a page with [FuncUnit.static.open S.open].
@codestart
S.open("//myapp/myapp.html")
@codeend
  </li>
  <li>Do some things
@codestart
//click something
S('#myButton').click()

//type something
S('#myInput').type("hello")
@codeend
  </li>

  <li>Wait for those things to complete
@codestart
//Wait until it is visible
S('#myMenu').visible()

//wait until something exists
S('#myArea').exists()

//waits a second
S.wait(1000);



@codeend
  </li>
  <li>Check your results
@codestart
//Wait until it is visible
S('#myMenu').offset(function(offset){
  equals(500,offset.left,"menu is in the right spot");
})

//wait until something exists
S('#myArea').height(function(height){
   equals(500,height,"my area is the right height");
})
@codeend
  </li>
</ol>
 * 
 * @init
 * selects something in the other page
 * @param {Object} s
 * @param {Object} c
 */
FuncUnit = function(s, c){
	if(typeof s == "function"){
		return FuncUnit.wait(0, s)
	}
	
	return new FuncUnit.init(s, c)
}
/**
 * @Static
 */
$.extend(FuncUnit,oldFunc)
$.extend(FuncUnit,{
	//move jquery and clear it out
	jquery : jQuery.noConflict(true),
/**
 * @attribute href
 * The location of the page running the tests on the server and where relative paths passed in to [FuncUnit.static.open] will be 
 * referenced from.
 * <p>This is typically where the test page runs on the server.  It can be set before calls to [FuncUnit.static.open]:</p>
@codestart
test("opening something", function(){
  S.href = "http://localhost/tests/mytest.html"
  S.open("../myapp")
  ...
})
@codeend
 */
// href comes from settings
/**
 * @attribute jmvcRoot
 * jmvcRoot should be set to url of JMVC's root folder.  
 * <p>This is used to calculate JMVC style paths (paths that begin with  //).
 * This is the prefered method of referencing pages if
 * you want to test on the filesystem and test on the server.</p>
 * <p>This is usually set in the global config file in <code>funcunit/settings.js</code> like:</p>
@codestart
FuncUnit = {jmvcRoot: "http://localhost/script/" }
@codeend
 */
// jmvcRoot comes from settings

/**
 * Opens a page.  It will error if the page can't be opened before timeout. 
 * <h3>Example</h3>
@codestart
//a full url
S.open("http://localhost/app/app.html")

//from jmvc root (FuncUnit.jmvcRoot must be set)
S.open("//app/app.html")
@codeend

 * <h3>Paths in Selenium</h3>
 * Selenium runs the testing page from the filesystem and by default will look for pages on the filesystem unless provided a full
 * url or information that can translate a partial path into a full url. FuncUnit uses [FuncUnit.static.jmvcRoot] 
 * and [FuncUnit.static.href] to 
 * translate partial paths.
<table>
  <tr>
  	<th>path</th>
  	<th>jmvcRoot</th>
  	<th>href</th>
  	<th>resulting url</th>
  </tr>
  <tr>
    <td>//myapp/mypage.html</td>
    <td>null</td>
    <td>null</td>
    <td>file:///C:/development/cookbook/public/myapp/mypage.html</td>
  </tr>
  <tr>
    <td>//myapp/mypage.html</td>
    <td>http://localhost/</td>
    <td></td>
    <td>http://localhost/myapp/mypage.html</td>
  </tr>
  <tr>
    <td>http://foo.com</td>
    <td></td>
    <td></td>
    <td>http://foo.com</td>
  </tr>
  <tr>
  	<td>../mypage.html</td>
    <td></td>
    <td>http://localhost/myapp/funcunit.html</td>
    <td>http://localhost/mypage.html</td>
  </tr>
</table>
 * 
 * @param {String} path a full or partial url to open.  If a partial is given, 
 * @param {Function} callback
 * @param {Number} timeout
 */
open : function(path, callback, timeout){
	var fullPath = FuncUnit.getAbsolutePath(path), 
	temp;
	if(typeof callback != 'function'){
		timeout = callback;
		callback = undefined;
	}
	FuncUnit.add(function(success, error){ //function that actually does stuff, if this doesn't call success by timeout, error will be called, or can call error itself
		
		FuncUnit._open(fullPath, error);
		FuncUnit._onload(function(){
			FuncUnit._opened();
			success()
		}, error);
	}, callback, "Page " + path + " not loaded in time!", timeout || 30000);
},
/**
 * @hide
 * Gets a path, will use steal if present
 * @param {String} path
 */
getAbsolutePath : function(path){
	if(typeof(steal) == "undefined"){
		return path;
	}
	var fullPath, 
		root = FuncUnit.jmvcRoot || steal.root.path;
	
	if (/^\/\//.test(path)) {
		fullPath = new steal.File(path.substr(2)).joinFrom(root);
	}
	else {
		fullPath = path;
	}
	
	if(/^http/.test(path))
		fullPath = path;
	return fullPath;
},
/**
 * @attribute browsers
 * Used to configure the browsers selenium uses to run FuncUnit tests.
 * If you need to learn how to configure selenium, and we haven't filled in this page,
 * post a note on the forum and we will fill this out right away.
 */
// for feature detection
support : {},
/**
 * @attribute window
 * Use this to refer to the window of the application page.  You can also 
 * reference window.document.
 * @codestart
 * S(S.window).innerWidth(function(w){
 *   ok(w > 1000, "window is more than 1000 px wide")
 * })
 * @codeend
 */
window : {
	document: {}
},
_opened : function(){}
});


(function(){
	//the queue of commands waiting to be run
	var queue = [], 
		//are we in a callback function (something we pass to a FuncUnit plugin)
		incallback = false,
		//where we should add things in a callback
		currentPosition = 0;
		
	
	FuncUnit.
	/**
	 * @hide
	 * Adds a function to be called in the queue.
	 * @param {Function} f The function to be called.  It will be provided a success and error function.
	 * @param {Function} callback a callback to be called after the function is done
	 * @param {Object} error an error statement if the command fails
	 * @param {Object} timeout the length of time until success should be called.
	 */
	add = function(f, callback, error, timeout, stopper){
		
		//if we are in a callback, add to the current position
		if (incallback) {
			queue.splice(currentPosition,0,{
				method: f,
				callback: callback,
				error: error,
				timeout: timeout,
				stop : stopper
			})
			currentPosition++;
		}
		else {
			//add to the end
			queue.push({
				method: f,
				callback: callback,
				error: error,
				timeout: timeout
			});
		}
		//if our queue has just started, stop qunit
		//call done to call the next command
        if (queue.length == 1 && ! incallback) {
			stop();
            setTimeout(FuncUnit._done, 13)
        }
	}
	//this is called after every command
	// it gets the next function from the queue
	FuncUnit._done = function(){
		var next, 
			timer,
			speed = 0;
			
		if(FuncUnit.speed == "slow"){
			speed = 500;
		}
		else if (FuncUnit.speed){
			speed = FuncUnit.speed;
		}
		if (queue.length > 0) {
			next = queue.shift();
			currentPosition = 0;
			// set a timer that will error
			
			
			//call next method
			setTimeout(function(){
				timer = setTimeout(function(){
						next.stop && next.stop();
						ok(false, next.error);
						FuncUnit._done();
					}, 
					(next.timeout || 10000) + speed)
				
				next.method(	//success
					function(){
						//make sure we don't create an error
						clearTimeout(timer);
						
						//mark in callback so the next set of add get added to the front
						
						incallback = true;
						if (next.callback) 
							next.callback.apply(null, arguments);
						incallback = false;
						
						
						FuncUnit._done();
					}, //error
					function(message){
						clearTimeout(timer);
						ok(false, message);
						FuncUnit._done();
					})
				
				
			}, speed);
			
		}
		else {
			start();
		}
	}
	FuncUnit.
	/**
	 * Waits a timeout before running the next command.  Wait is an action and gets 
	 * added to the queue.
	 * @codestart
	 * S.wait(100, function(){
	 *   equals( S('#foo').innerWidth(), 100, "innerWidth is 100");
	 * })
	 * @codeend
	 * @param {Number} [time] The timeout in milliseconds.  Defaults to 5000.
	 * @param {Function} [callback] A callback that will run 
	 * 		after the wait has completed, 
	 * 		but before any more queued actions.
	 */
	wait = function(time, callback){
		if(typeof time == 'function'){
			callback = time;
			time = undefined;
		}
		time = time != null ? time : 5000
		FuncUnit.add(function(success, error){
			
			setTimeout(success, time)
		}, callback, "Couldn't wait!", time + 1000);
		return this;
	}
	/**
	 * @hide
	 * @function repeat
	 * Takes a function that will be called over and over until it is successful.
	 */
	FuncUnit.repeat = function(checker, callback, error, timeout){
		var interval,
			stopped = false	,
			stop = function(){
				clearTimeout(interval)
				stopped = true;
			};

		FuncUnit.add(function(success, error){
			interval = setTimeout(function(){
				
				var result = null;
				try {
					result = checker()
				} 
				catch (e) {
					//should we throw this too error?
				}
				
				if (result) {
					success();
				}else if(!stopped){
					interval = setTimeout(arguments.callee, 10)
				}
				
			}, 10);
			
			
		}, callback, error, timeout, stop)
	}
	
	
	
	FuncUnit.makeArray = function(arr){
		var narr = [];
		for (var i = 0; i < arr.length; i++) {
			narr[i] = arr[i]
		}
		return narr;
	}
	FuncUnit.
	/**
	 * @hide
	 * Converts a string into a Native JS type.
	 * @param {Object} str
	 */
	convert = function(str){
		//if it is an object and not null, eval it
		if (str !== null && typeof str == "object") {
			return object;
		}
		str = String(str);
		switch (str) {
			case "false":
				return false;
			case "null":
				return null;
			case "true":
				return true;
			case "undefined":
				return undefined;
			default:
				if (/^\d+\.\d+$/.test(str) || /^\d+$/.test(str)) {
					return 1 * str;
				}
				
				return str;
		}
	}

})();


/**
 * @prototype
 */
FuncUnit.init = function(s, c){
	this.selector = s;
	this.context = c == null ? FuncUnit.window.document : c;
}
FuncUnit.init.prototype = {
	/**
	 * Types text into an element.  This makes use of [Syn.prototype.type] and works in 
	 * a very similar way.
	 * <h3>Quick Examples</h3>
	 * @codestart
	 * //types hello world
	 * S('#bar').type('hello world')
	 * 
	 * //submits a form by typing \r
	 * S("input[name=age]").type("27\r")
	 * 
	 * //types FuncUnit, then deletes the Unit
	 * S('#foo').type("FuncUnit\b\b\b\b")
	 * 
	 * //types JavaScriptMVC, then removes the MVC
	 * S('#zar').type("JavaScriptMVC[left][left][left]"+
	 *                      "[delete][delete][delete]")
	 *          
	 * //types JavaScriptMVC, then selects the MVC and
	 * //deletes it
	 * S('#zar').type("JavaScriptMVC[shift]"+
	 *                "[left][left][left]"+
	 *                "[shift-up][delete]")
	 * @codeend
	 * <h2>Characters</h2>
	 * You can type the characters found in [Syn.static.keycodes].
	 * 
	 * @param {String} text the text you want to type
	 * @param {Function} [callback] a callback that is run after typing, but before the next action.
	 * @return {FuncUnit} returns the funcUnit for chaining.
	 */
	type: function(text, callback){
		var selector = this.selector, 
			context = this.context;
		FuncUnit.add(function(success, error){
			
			FuncUnit.$(selector, context, "triggerSyn", "_type", text, success)
		}, callback, "Could not type " + text + " into " + this.selector);
		return this;
	},
	/**
	 * Waits until an element exists before running the next action.
	 * @codestart
	 * //waits until #foo exists before clicking it.
	 * S("#foo").exists().click()
	 * @codeend
	 * @param {Function} [callback] a callback that is run after the selector exists, but before the next action.
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	exists : function(callback){
		return this.size(function(size){
			return size > 0;
		}, callback)
	},
	/**
	 * Waits until no elements are matched by the selector.  Missing is equivalent to calling
	 * <code>.size(0, callback);</code>
	 * @codestart
	 * //waits until #foo leaves before continuing to the next action.
	 * S("#foo").missing()
	 * @codeend
	 * @param {Function} [callback] a callback that is run after the selector exists, but before the next action
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	missing : function(callback){
		return this.size(0, callback)
	},
	/**
	 * Waits until the funcUnit selector is visible.  
	 * @codestart
	 * //waits until #foo is visible.
	 * S("#foo").visible()
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the funcUnit is visible, but before the next action.
	 * @return [funcUnit] returns the funcUnit for chaining.
	 */
	visible : function(callback){
		var self = this,
			sel = this.selector;
		this.selector += ":visible"
		return this.size(function(size){
			return size > 0;
		}, function(){
			self.selector = sel;
			callback && callback();
		})
	},
	/**
	 * Waits until the selector is invisible.  
	 * @codestart
	 * //waits until #foo is invisible.
	 * S("#foo").invisible()
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the selector is invisible, but before the next action.
	 * @return [funcUnit] returns the funcUnit selector for chaining.
	 */
	invisible : function(callback){
		var self = this,
			sel = this.selector;
		this.selector += ":visible"
		return this.size(0, function(){
			self.selector = sel;
			callback && callback();
		})
	},
	/**
	 * Drags an element into another element or coordinates.  
	 * This takes the same paramameters as [Syn.prototype.move move].
	 * @param {String|Object} options A selector or coordinates describing the motion of the drag.
	 * <h5>Options as a Selector</h5>
	 * Passing a string selector to drag the mouse.  The drag runs to the center of the element
	 * matched by the selector.  The following drags from the center of #foo to the center of #bar.
	 * @codestart
	 * S('#foo').drag('#bar') 
	 * @codeend
	 * <h5>Options as Coordinates</h5>
	 * You can pass in coordinates as clientX and clientY:
	 * @codestart
	 * S('#foo').drag('100x200') 
	 * @codeend
	 * Or as pageX and pageY
	 * @codestart
	 * S('#foo').drag('100X200') 
	 * @codeend
	 * Or relative to the start position
	 * S('#foo').drag('+10 +20')
	 * <h5>Options as an Object</h5>
	 * You can configure the duration, start, and end point of a drag by passing in a json object.
	 * @codestart
	 * //drags from 0x0 to 100x100 in 2 seconds
	 * S('#foo').drag({
	 *   from: "0x0",
	 *   to: "100x100",
	 *   duration: 2000
	 * }) 
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the drag, but before the next action.
	 * @return {funcUnit} returns the funcunit selector for chaining.
	 */
	drag: function( options, callback){
		if(typeof options == 'string'){
			options = {to: options}
		}
		options.from = this.selector;

		var selector = this.selector, 
			context = this.context;
		FuncUnit.add(function(success, error){
			
			FuncUnit.$(selector, context, "triggerSyn", "_drag", options, success)
		}, callback, "Could not drag " + this.selector)
		return this;
	},
		/**
	 * Moves an element into another element or coordinates.  This will trigger mouseover
	 * mouseouts accordingly.
	 * This takes the same paramameters as [Syn.prototype.move move].
	 * @param {String|Object} options A selector or coordinates describing the motion of the move.
	 * <h5>Options as a Selector</h5>
	 * Passing a string selector to move the mouse.  The move runs to the center of the element
	 * matched by the selector.  The following moves from the center of #foo to the center of #bar.
	 * @codestart
	 * S('#foo').move('#bar') 
	 * @codeend
	 * <h5>Options as Coordinates</h5>
	 * You can pass in coordinates as clientX and clientY:
	 * @codestart
	 * S('#foo').move('100x200') 
	 * @codeend
	 * Or as pageX and pageY
	 * @codestart
	 * S('#foo').move('100X200') 
	 * @codeend
	 * Or relative to the start position
	 * S('#foo').move('+10 +20')
	 * <h5>Options as an Object</h5>
	 * You can configure the duration, start, and end point of a move by passing in a json object.
	 * @codestart
	 * //drags from 0x0 to 100x100 in 2 seconds
	 * S('#foo').move({
	 *   from: "0x0",
	 *   to: "100x100",
	 *   duration: 2000
	 * }) 
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the drag, but before the next action.
	 * @return {funcUnit} returns the funcunit selector for chaining.
	 */
	move: function(options, callback){
		if(typeof options == 'string'){
			options = {to: options}
		}
		options.from = this.selector;

		var selector = this.selector, 
			context = this.context;
		FuncUnit.add(function(success, error){
			
			FuncUnit.$(selector, context, "triggerSyn", "_move", options, success)
		}, callback, "Could not move " + this.selector)
		return this;
	},
	leftScroll : function(amount, callback){
		var selector = this.selector, 
			context = this.context;
		FuncUnit.add(function(success, error){
			
			FuncUnit.$(selector, context, "scrollLeft", amount)
			success();
		}, callback, "Could not scroll " + this.selector)
		return this;
	},
	/**
	 * Waits a timeout before calling the next action.  This is the same as
	 * [FuncUnit.wait].
	 * @param {Number} [timeout]
	 * @param {Object} callback
	 */
	wait : function(timeout, callback){
		FuncUnit.wait(timeout, callback)
	}
};
var clicks = [
/**
 * @function click
 * Clicks an element.  This uses [Syn.prototype.click] to issue a:
 * <ul>
 * 	<li><code>mousedown</code></li>
 *  <li><code>focus</code> - if the element is focusable</li>
 *  <li><code>mouseup</code></li>
 *  <li><code>click</code></li>
 * </ul>
 * If no clientX/Y or pageX/Y is provided as options, the click happens at the 
 * center of the element.
 * <p>For a right click or double click use [FuncUnit.prototype.rightClick] or
 *   [FuncUnit.prototype.dblclick].</p>
 * <h3>Example</h3>
 * @codestart
 * //clicks the bar element
 * S("#bar").click()
 * @codeend
 * @param {Object} [options] options to pass to the click event.  Typically, this is clientX/Y or pageX/Y like:
 * @codestart
 * $('#foo').click({pageX: 200, pageY: 100});
 * @codeend
 * You can pass it any of the serializable parameters you'd send to : 
 * [http://developer.mozilla.org/en/DOM/event.initMouseEvent initMouseEvent], but command keys are 
 * controlled by [FuncUnit.prototype.type].
 * @param {Function} [callback] a callback that runs after the click, but before the next action.
 * @return {funcUnit} returns the funcunit selector for chaining.
 */
'click',
/**
 * @function dblclick
 * Double clicks an element by [FuncUnit.prototype.click clicking] it twice and triggering a dblclick event.
 * @param {Object} options options to add to the mouse events.  This works
 * the same as [FuncUnit.prototype.click]'s options.
 * @param {Function} [callback] a callback that runs after the double click, but before the next action.
 * @return {funcUnit} returns the funcunit selector for chaining.
 */
'dblclick',
/**
 * @function rightClick
 * Right clicks an element.  This typically results in a contextmenu event for browsers that
 * support it.
 * @param {Object} options options to add to the mouse events.  This works
 * the same as [FuncUnit.prototype.click]'s options.
 * @param {Function} [callback] a callback that runs after the click, but before the next action.
 * @return {funcUnit} returns the funcunit selector for chaining.
 */
'rightClick'],
	makeClick = function(name){
		FuncUnit.init.prototype[name] = function(options, callback){
			if(typeof options == 'function'){
				callback = options;
				options = {};
			}
			var selector = this.selector, 
				context = this.context;
			FuncUnit.add(function(success, error){
				
				FuncUnit.$(selector, context, "triggerSyn", "_"+name, options, success)
			}, callback, "Could not "+name+" " + this.selector)
			return this;
		}
	}

for(var i=0; i < clicks.length; i++){
	makeClick(clicks[i])
}


//list of jQuery functions we want, number is argument index
//for wait instead of getting value
FuncUnit.funcs = {
/**
 * @function size
 * Gets the number of elements matched by the selector or
 * waits until the the selector is size.  You can also 
 * provide a function that continues to the next action when
 * it returns true.
 * @codestart
 * S(".recipe").size() //gets the number of recipes
 * 
 * S(".recipe").size(2) //waits until there are 2 recipes
 * 
 * //waits until size is count
 * S(".recipe").size(function(size){
 *   return size == count;
 * })
 * @codeend
 * @param {Number|Function} [size] number or a checking function.
 * @param {Function} a callback that will run after this action completes.
 * @return {Number} if the size parameter is not provided, size returns the number
 * of elements matched.
 */
'size' : 0,
/**
 * @attr data
 * Gets data from jQuery.data or waits until data
 * equals some value.  
 * @codestart
 * S("#something").data("abc") //gets the abc data
 * 
 * S("#something").data("abc","some") //waits until the data == some
 * @codeend
 * @param {String} data The data to get, or wait for.
 * @param {Object|Function} [value] If provided uses this as a check before continuing to the next action.
 * @param {Function} a callback that will run after this action completes.
 * @return {Object} if the size parameter is not provided, returns
 * the object.
 */
'data': 1, 
/**
 * @function attr
 * Gets the value of an attribute from an element or waits until the attribute
 * equals the attr param.
 * @codestart
 *  //gets the abc attribute
 * S("#something").attr("abc")
 * 
 * //waits until the abc attribute == some
 * S("#something").attr("abc","some") 
 * @codeend
 * @param {String} data The attribute to get, or wait for.
 * @param {String|Function} [value] If provided uses this as a check before continuing to the next action.
 * @param {Function} a callback that will run after this action completes.
 * @return {Object} if the attr parameter is not provided, returns
 * the attribute.
 */
'attr' : 1, 
/**
 * @function hasClass
 * @codestart
 * //returns if the element has the class in its className
 * S("#something").hasClass("selected");
 * 
 * //waits until #something has selected in its className
 * S("#something").hasClass("selected",true);
 * 
 * //waits until #something does not have selected in its className
 * S("#something").hasClass("selected",false);
 * @codeend
 * @param {String} className The part of the className to search for.
 * @param {Boolean|Function} [value] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {Boolean|funcUnit} if the value parameter is not provided, returns
 * if the className is found in the element's className.  If a value paramters is provided, returns funcUnit for chaining.
 */
'hasClass' : 1, //makes wait
/**
 * @function html
 * Gets the [http://api.jquery.com/html/ html] from an element or waits until the html is a certain value.
 * @codestart
 * //checks foo's html has "JupiterJS"
 * ok( /JupiterJS/.test( S('#foo').html() ) )
 * 
 * //waits until bar's html has JupiterJS
 * S('#foo').html(/JupiterJS/)
 * 
 * //waits until bar's html is JupiterJS
 * S('#foo').html("JupiterJS")
 * @codeend
 * 
 * @param {String|Function} [html] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the html parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
 */
'html' : 0, 
/**
 * @function text
 * Gets the [http://api.jquery.com/text/ text] from an element or waits until the text is a certain value.
 * @codestart
 * //checks foo's text has "JupiterJS"
 * ok( /JupiterJS/.test( S('#foo').text() ) )
 * 
 * //waits until bar's text has JupiterJS
 * S('#foo').text(/JupiterJS/)
 * 
 * //waits until bar's text is JupiterJS
 * S('#foo').text("JupiterJS")
 * @codeend
 * 
 * @param {String|Function} [text] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the text parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
 */
'text' : 0, 
/**
 * @function val
 * Gets the [http://api.jquery.com/val/ val] from an element or waits until the val is a certain value.
 * @codestart
 * //checks foo's val has "JupiterJS"
 * ok( /JupiterJS/.test( S('input#foo').val() ) )
 * 
 * //waits until bar's val has JupiterJS
 * S('input#foo').val(/JupiterJS/)
 * 
 * //waits until bar's val is JupiterJS
 * S('input#foo').val("JupiterJS")
 * @codeend
 * 
 * @param {String|Function} [val] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the val parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the html of the selector.
 */
'val' : 0, 
/**
 * @function css
 * Gets a [http://api.jquery.com/css/ css] property from an element or waits until the property is 
 * a specified value.
 * @codestart
 * // gets the color
 * S("#foo").css("color")
 * 
 * // waits until the color is red
 * S("#foo").css("color","red") 
 * @codeend
 * 
 * @param {String} prop A css property to get or wait until it is a specified value.
 * @param {String|Function} [val] If provided uses this as a check before continuing to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the val parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the css of the selector.
 */
'css': 1, 
/**
 * @function offset
 * Gets an element's [http://api.jquery.com/offset/ offset] or waits until 
 * the offset is a specified value.
 * @codestart
 * // gets the offset
 * S("#foo").offset();
 * 
 * // waits until the offset is 100, 200
 * S("#foo").offset({top: 100, left: 200}) 
 * @codeend
 * 
 * @param {Object|Function} [offset] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the offset parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the css of the selector.
 */
'offset' : 0,
/**
 * @function position
 * Gets an element's [http://api.jquery.com/position/ position] or waits until 
 * the position is a specified value.
 * @codestart
 * // gets the position
 * S("#foo").position();
 * 
 * // waits until the position is 100, 200
 * S("#foo").position({top: 100, left: 200}) 
 * @codeend
 * 
 * @param {Object|Function} [position] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if the position parameter is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the offset of the selector.
 */
'position' : 0,
/**
 * @function scrollTop
 * Gets an element's [http://api.jquery.com/scrollTop/ scrollTop] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the scrollTop
 * S("#foo").scrollTop();
 * 
 * // waits until the scrollTop is 100
 * S("#foo").scrollTop(100) 
 * @codeend
 * 
 * @param {Number|Function} [scrollTop] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if scrollTop is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the scrollTop of the selector.
 */ 
'scrollTop' : 0, 
/**
 * @function scrollLeft
 * Gets an element's [http://api.jquery.com/scrollLeft/ scrollLeft] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the scrollLeft
 * S("#foo").scrollLeft();
 * 
 * // waits until the scrollLeft is 100
 * S("#foo").scrollLeft(100) 
 * @codeend
 * 
 * @param {Number|Function} [scrollLeft] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if scrollLeft is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the scrollLeft of the selector.
 */ 
'scrollLeft' : 0, 
/**
 * @function height
 * Gets an element's [http://api.jquery.com/height/ height] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the height
 * S("#foo").height();
 * 
 * // waits until the height is 100
 * S("#foo").height(100) 
 * @codeend
 * 
 * @param {Number|Function} [height] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if height is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the height of the selector.
 */
'height' : 0, 
/**
 * @function width
 * Gets an element's [http://api.jquery.com/width/ width] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the width
 * S("#foo").width();
 * 
 * // waits until the width is 100
 * S("#foo").width(100) 
 * @codeend
 * 
 * @param {Number|Function} [width] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if width is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the width of the selector.
 */
'width' : 0, 
/**
 * @function innerHeight
 * Gets an element's [http://api.jquery.com/innerHeight/ innerHeight] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the innerHeight
 * S("#foo").innerHeight();
 * 
 * // waits until the innerHeight is 100
 * S("#foo").innerHeight(100) 
 * @codeend
 * 
 * @param {Number|Function} [innerHeight] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if innerHeight is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the innerHeight of the selector.
 */
'innerHeight' : 0, 
/**
 * @function innerWidth
 * Gets an element's [http://api.jquery.com/innerWidth/ innerWidth] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the innerWidth
 * S("#foo").innerWidth();
 * 
 * // waits until the innerWidth is 100
 * S("#foo").innerWidth(100) 
 * @codeend
 * 
 * @param {Number|Function} [innerWidth] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if innerWidth is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the innerWidth of the selector.
 */
'innerWidth' : 0, 
/**
 * @function outerHeight
 * Gets an element's [http://api.jquery.com/outerHeight/ outerHeight] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the outerHeight
 * S("#foo").outerHeight();
 * 
 * // waits until the outerHeight is 100
 * S("#foo").outerHeight(100) 
 * @codeend
 * 
 * @param {Number|Function} [outerHeight] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if outerHeight is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the outerHeight of the selector.
 */
'outerHeight' : 0, 
/**
 * @function outerWidth
 * Gets an element's [http://api.jquery.com/outerWidth/ outerWidth] or waits until 
 * it equals a specified value.
 * @codestart
 * // gets the outerWidth
 * S("#foo").outerWidth();
 * 
 * // waits until the outerWidth is 100
 * S("#foo").outerWidth(100) 
 * @codeend
 * 
 * @param {Number|Function} [outerWidth] If provided uses this as a check before continuing to the next action.  Or you can 
 * provide a function that returns true to continue to the next action.
 * @param {Function} [callback] a callback that will run after this action completes.
 * @return {String|funcUnit} if outerWidth is provided, 
 * returns the funcUnit selector for chaining, otherwise returns the outerWidth of the selector.
 */
'outerWidth' : 0}


//makes a jQuery like command.
FuncUnit.makeFunc = function(fname, argIndex){
	
	//makes a read / wait function
	FuncUnit.init.prototype[fname] = function(){
		//assume last arg is callback
		var args = FuncUnit.makeArray(arguments), 
			callback,
			isWait = args.length > argIndex,
			callback;
		
		args.unshift(this.selector,this.context,fname)

		if(isWait){
			//get the args greater and equal to argIndex
			var tester = args[argIndex+3],
				timeout = args[argIndex+4],
				callback = args[argIndex+5],
				testVal = tester,
				errorMessage = "waiting for "+fname +" on " + this.selector;
			
			if(typeof timeout == 'function'){
				callback = timeout;
				timeout = undefined;
			}
			
			args.splice(argIndex+3, args.length- argIndex - 3);
			
			if(typeof tester != 'function'){
				errorMessage += " !== "+testVal
				tester = function(val){
					
					return QUnit.equiv(val, testVal) || 
						(testVal instanceof RegExp && testVal.test(val) );
				}
			}
			FuncUnit.repeat(function(){
					var ret = FuncUnit.$.apply(FuncUnit.$, args);
					return tester(ret);
				}, callback, errorMessage, timeout)

			return this;
		}else{
			//get the value
			
			return FuncUnit.$.apply(FuncUnit.$, args);
		}
	}
}
	


for (var prop in FuncUnit.funcs) {
	FuncUnit.makeFunc(prop, FuncUnit.funcs[prop]);
}


S = FuncUnit;



})(jQuery);

// funcunit/resources/selenium_start.js

(function($){

FuncUnit.startSelenium = function(){
	importClass(Packages.com.thoughtworks.selenium.DefaultSelenium);
	
	//first lets ping and make sure the server is up
	var addr = java.net.InetAddress.getByName(FuncUnit.serverHost)
	try {
		var s = new java.net.Socket(addr, FuncUnit.serverPort)
	} 
	catch (ex) {
		spawn(function(){
			if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
				runCommand("cmd", "/C", 'start "selenium" java -jar funcunit\\java\\selenium-server.jar')
			}
			else {
				runCommand("sh", "-c", "java -jar funcunit/java/selenium-server.jar > selenium.log 2> selenium.log &")
			}
		})
		var timeouts = 0, 
			started = false;
		var pollSeleniumServer = function(){
			try {
				var s = new java.net.Socket(addr, FuncUnit.serverPort)
				started = true;
			} 
			catch (ex) {
				if (timeouts > 3) {
					print("Selenium is not running. Please use steal/js -selenium to start it.")
					quit();
				} else {
					timeouts++;
				}
			}					
		}
		while(!started){
			java.lang.Thread.currentThread().sleep(1000);
			pollSeleniumServer();
		}
	}
}

})(jQuery);

// funcunit/drivers/selenium.js

(function($){

	if (navigator.userAgent.match(/Rhino/) && FuncUnit.browsers !== undefined) {

		// configuration defaults
		FuncUnit.serverHost = FuncUnit.serverHost || "localhost";
		FuncUnit.serverPort = FuncUnit.serverPort || 4444;
		if(!FuncUnit.browsers){
			if(FuncUnit.jmvcRoot)
				FuncUnit.browsers = ["*firefox", "*iexplore", "*safari", "*googlechrome"]
			else {
				FuncUnit.browsers = ["*firefox"]
				if(java.lang.System.getProperty("os.name").indexOf("Windows") != -1){
					FuncUnit.browsers.push("*iexplore")
				}
			}
		}
		
		FuncUnit.startSelenium();
		(function(){
			var browser = 0;
			//convert spaces to %20.
			var location = /file:/.test(window.location.protocol) ? window.location.href.replace(/ /g,"%20") : window.location.href;
			
			QUnit.done = function(failures, total){
				FuncUnit.selenium.close();
				FuncUnit.selenium.stop();
				FuncUnit.endtime = new Date().getTime();
				var formattedtime = (FuncUnit.endtime - FuncUnit.starttime) / 1000;
				print("\nALL DONE " + failures + ", " + total + (FuncUnit.showTimestamps? (' - ' 
						+ formattedtime + ' seconds'): ""))
				browser++;
				if (browser < FuncUnit.browsers.length) {
					print("\nSTARTING " + FuncUnit.browsers[browser])
					
					FuncUnit.selenium = new DefaultSelenium(FuncUnit.serverHost, 
						FuncUnit.serverPort, FuncUnit.browsers[browser], location);
					FuncUnit.starttime = new Date().getTime();
					FuncUnit.selenium.start();
					QUnit.restart();
				} else {
					if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
						runCommand("cmd", "/C", 'taskkill /fi "Windowtitle eq selenium" > NUL')
						quit()
					}
				}
			}
			
			
			print("\nSTARTING " + FuncUnit.browsers[0])
			FuncUnit.selenium = new DefaultSelenium(FuncUnit.serverHost, 
				FuncUnit.serverPort, FuncUnit.browsers[0], location);
			FuncUnit.starttime = new Date().getTime();
			FuncUnit.selenium.start();
			FuncUnit._open = function(url){
				this.selenium.open(url);
			};
			FuncUnit._onload = function(success, error){
				setTimeout(function(){
					FuncUnit.selenium.getEval("selenium.browserbot.getCurrentWindow().focus();selenium.browserbot.getCurrentWindow().document.documentElement.tabIndex = 0;");
					success();
				}, 1000)
			};
			var convertToJson = function(arg){
				return arg === FuncUnit.window ? "selenium.browserbot.getCurrentWindow()" : jQuery.toJSON(arg)
				
			}
			FuncUnit.prompt = function(answer){
				this.selenium.answerOnNextPrompt(answer);
			}
			FuncUnit.confirm = function(answer, callback){
				var self = this;
				FuncUnit.add(function(success, error){
					var confirm = FuncUnit.selenium.getConfirmation();
					if(answer)
						FuncUnit.selenium.chooseOkOnNextConfirmation();
					else
						FuncUnit.selenium.chooseCancelOnNextConfirmation();
					setTimeout(success, 13)
				}, callback, "Could not confirm")
			}
			FuncUnit.$ = function(selector, context, method){
				var args = FuncUnit.makeArray(arguments);
				var callbackPresent = false;
				for (var a = 0; a < args.length; a++) {
					if (a == 1) { //context
						if (args[a] == FuncUnit.window.document) {
							args[a] = "_doc()"
						}
						else {
							if (typeof args[a] == "number") {
								args[a] = "_win()[" + args[a] + "].document"
							}
							else 
								if (typeof args[a] == "string") {
									args[a] = "_win()['" + args[a] + "'].document"
								}
						}
					}
					else {
						if (typeof args[a] == "function") {
							callbackPresent = true;
							var callback = args[a];
							args[a] = "Selenium.resume";
						}
						else 
							args[a] = convertToJson(args[a]);
					}
				}
				var response = FuncUnit.selenium.getEval("jQuery.wrapped(" + args.join(',') + ")");
				if(callbackPresent){
					return callback( eval("(" + response + ")") )
				} else {
					return eval("(" + response + ")")//  q[method].apply(q, args);
				}
			}
			
			
			
		})();
	}

})(jQuery);

// funcunit/drivers/standard.js

(function($){

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
		



})(jQuery);

