
(
function () {
    (function (window) {
        var QUnit = {init:function () {
            config = {stats:{all:0, bad:0}, moduleStats:{all:0, bad:0}, started:+new Date, blocking:false, autorun:false, assertions:[], filters:[], queue:[]};
            var tests = id("qunit-tests"), banner = id("qunit-banner"), result = id("qunit-testresult");
            if (tests) {
                tests.innerHTML = "";
            }
            if (banner) {
                banner.className = "";
            }
            if (result) {
                result.parentNode.removeChild(result);
            }
        }, module:function (name, testEnvironment) {
            config.currentModule = name;
            synchronize(function () {
                if (config.currentModule) {
                    QUnit.moduleDone(config.currentModule, config.moduleStats.bad, config.moduleStats.all);
                }
                config.currentModule = name;
                config.moduleTestEnvironment = testEnvironment;
                config.moduleStats = {all:0, bad:0};
                QUnit.moduleStart(name, testEnvironment);
            }, true);
        }, asyncTest:function (testName, expected, callback) {
            if (arguments.length === 2) {
                callback = expected;
                expected = 0;
            }
            QUnit.test(testName, expected, callback, true);
        }, test:function (testName, expected, callback, async) {
            var name = testName, testEnvironment, testEnvironmentArg;
            if (arguments.length === 2) {
                callback = expected;
                expected = null;
            }
            if (expected && typeof expected === "object") {
                testEnvironmentArg = expected;
                expected = null;
            }
            if (config.currentModule) {
                name = config.currentModule + " module: " + name;
            }
            if (!validTest(name)) {
                return;
            }
            synchronize(function () {
                QUnit.testStart(testName);
                testEnvironment = extend({setup:function () {
                }, teardown:function () {
                }}, config.moduleTestEnvironment);
                if (testEnvironmentArg) {
                    extend(testEnvironment, testEnvironmentArg);
                }
                QUnit.current_testEnvironment = testEnvironment;
                config.assertions = [];
                config.expected = expected;
                try {
                    if (!config.pollution) {
                        saveGlobal();
                    }
                    testEnvironment.setup.call(testEnvironment);
                }
                catch (e) {
                    QUnit.ok(false, "Setup failed on " + name + ": " + e.message);
                }
                if (async) {
                    QUnit.stop();
                }
                try {
                    callback.call(testEnvironment);
                }
                catch (e) {
                    fail("Test " + name + " died, exception and test follows", e, callback);
                    QUnit.ok(false, "Died on test #" + (config.assertions.length + 1) + ": " + e.message);
                    saveGlobal();
                    if (config.blocking) {
                        start();
                    }
                }
            }, true);
            synchronize(function () {
                try {
                    checkPollution();
                    testEnvironment.teardown.call(testEnvironment);
                }
                catch (e) {
                    QUnit.ok(false, "Teardown failed on " + name + ": " + e.message);
                }
                try {
                    QUnit.reset();
                }
                catch (e) {
                    fail("reset() failed, following Test " + name + ", exception and reset fn follows", e, reset);
                }
                if (config.expected && config.expected != config.assertions.length) {
                    QUnit.ok(false, "Expected " + config.expected + " assertions, but " + config.assertions.length + " were run");
                }
                var good = 0, bad = 0, tests = id("qunit-tests");
                config.stats.all += config.assertions.length;
                config.moduleStats.all += config.assertions.length;
                if (tests) {
                    var ol = document.createElement("ol");
                    ol.style.display = "none";
                    for (var i = 0; i < config.assertions.length; i++) {
                        var assertion = config.assertions[i];
                        var li = document.createElement("li");
                        li.className = assertion.result ? "pass" : "fail";
                        li.innerHTML = assertion.message || "(no message)";
                        ol.appendChild(li);
                        if (assertion.result) {
                            good++;
                        } else {
                            bad++;
                            config.stats.bad++;
                            config.moduleStats.bad++;
                        }
                    }
                    var b = document.createElement("strong");
                    b.innerHTML = name + " <b style='color:black;'>(<b class='fail'>" + bad + "</b>, <b class='pass'>" + good + "</b>, " + config.assertions.length + ")</b>";
                    addEvent(b, "click", function () {
                        var next = b.nextSibling, display = next.style.display;
                        next.style.display = display === "none" ? "block" : "none";
                    });
                    addEvent(b, "dblclick", function (e) {
                        var target = e && e.target ? e.target : window.event.srcElement;
                        if (target.nodeName.toLowerCase() === "strong") {
                            var text = "", node = target.firstChild;
                            while (node.nodeType === 3) {
                                text += node.nodeValue;
                                node = node.nextSibling;
                            }
                            text = text.replace(/(^\s*|\s*$)/g, "");
                            if (window.location) {
                                window.location.href = window.location.href.match(/^(.+?)(\?.*)?$/)[1] + "?" + encodeURIComponent(text);
                            }
                        }
                    });
                    var li = document.createElement("li");
                    li.className = bad ? "fail" : "pass";
                    li.appendChild(b);
                    li.appendChild(ol);
                    tests.appendChild(li);
                    if (bad) {
                        var toolbar = id("qunit-testrunner-toolbar");
                        if (toolbar) {
                            toolbar.style.display = "block";
                            id("qunit-filter-pass").disabled = null;
                            id("qunit-filter-missing").disabled = null;
                        }
                    }
                } else {
                    for (var i = 0; i < config.assertions.length; i++) {
                        if (!config.assertions[i].result) {
                            bad++;
                            config.stats.bad++;
                            config.moduleStats.bad++;
                        }
                    }
                }
                QUnit.testDone(testName, bad, config.assertions.length);
                if (!window.setTimeout && !config.queue.length) {
                    done();
                }
            }, true);
            if (window.setTimeout && !config.doneTimer) {
                config.doneTimer = window.setTimeout(function () {
                    if (!config.queue.length) {
                        done();
                    } else {
                        synchronize(done);
                    }
                }, 13);
            }
        }, expect:function (asserts) {
            config.expected = asserts;
        }, ok:function (a, msg) {
            QUnit.log(a, msg);
            config.assertions.push({result:!!a, message:msg});
        }, equals:function (actual, expected, message) {
            push(expected == actual, actual, expected, message);
        }, same:function (a, b, message) {
            push(QUnit.equiv(a, b), a, b, message);
        }, start:function () {
            if (window.setTimeout) {
                window.setTimeout(function () {
                    if (config.timeout) {
                        clearTimeout(config.timeout);
                    }
                    config.blocking = false;
                    process();
                }, 13);
            } else {
                config.blocking = false;
                process();
            }
        }, stop:function (timeout) {
            config.blocking = true;
            if (timeout && window.setTimeout) {
                config.timeout = window.setTimeout(function () {
                    QUnit.ok(false, "Test timed out");
                    QUnit.start();
                }, timeout);
            }
        }, reset:function () {
            if (window.jQuery) {
                jQuery("#main").html(config.fixture);
                jQuery.event.global = {};
                jQuery.ajaxSettings = extend({}, config.ajaxSettings);
            }
        }, restart:function () {
            this.init();
            for (var i = 0; i < cachelist.length; i++) {
                synchronize(cachelist[i]);
            }
            if (window.setTimeout && !config.doneTimer) {
                config.doneTimer = window.setTimeout(function () {
                    if (!config.queue.length) {
                        done();
                    } else {
                        synchronize(done);
                    }
                }, 13);
            }
        }, triggerEvent:function (elem, type, event) {
            if (document.createEvent) {
                event = document.createEvent("MouseEvents");
                event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                elem.dispatchEvent(event);
            } else {
                if (elem.fireEvent) {
                    elem.fireEvent("on" + type);
                }
            }
        }, is:function (type, obj) {
            return Object.prototype.toString.call(obj) === "[object " + type + "]";
        }, done:function (failures, total) {
        }, log:function (result, message) {
        }, testStart:function (name) {
        }, testDone:function (name, failures, total) {
        }, moduleStart:function (name, testEnvironment) {
        }, moduleDone:function (name, failures, total) {
        }};
        var config = {queue:[], blocking:true};
        var cachelist = [];
        (function () {
            var location = window.location || {search:"", protocol:"file:"}, GETParams = location.search.slice(1).split("&");
            for (var i = 0; i < GETParams.length; i++) {
                GETParams[i] = decodeURIComponent(GETParams[i]);
                if (GETParams[i] === "noglobals") {
                    GETParams.splice(i, 1);
                    i--;
                    config.noglobals = true;
                } else {
                    if (GETParams[i].search("=") > -1) {
                        GETParams.splice(i, 1);
                        i--;
                    }
                }
            }
            config.filters = GETParams;
            QUnit.isLocal = !!(location.protocol === "file:");
        })();
        if (typeof exports === "undefined" || typeof require === "undefined") {
            extend(window, QUnit);
            window.QUnit = QUnit;
        } else {
            extend(exports, QUnit);
            exports.QUnit = QUnit;
        }
        if (typeof document === "undefined" || document.readyState === "complete") {
            config.autorun = true;
        }
        addEvent(window, "load", function () {
            var oldconfig = extend({}, config);
            QUnit.init();
            extend(config, oldconfig);
            config.blocking = false;
            var userAgent = id("qunit-userAgent");
            if (userAgent) {
                userAgent.innerHTML = navigator.userAgent;
            }
            var toolbar = id("qunit-testrunner-toolbar");
            if (toolbar) {
                toolbar.style.display = "none";
                var filter = document.createElement("input");
                filter.type = "checkbox";
                filter.id = "qunit-filter-pass";
                filter.disabled = true;
                addEvent(filter, "click", function () {
                    var li = document.getElementsByTagName("li");
                    for (var i = 0; i < li.length; i++) {
                        if (li[i].className.indexOf("pass") > -1) {
                            li[i].style.display = filter.checked ? "none" : "block";
                        }
                    }
                });
                toolbar.appendChild(filter);
                var label = document.createElement("label");
                label.setAttribute("for", "qunit-filter-pass");
                label.innerHTML = "Hide passed tests";
                toolbar.appendChild(label);
                var missing = document.createElement("input");
                missing.type = "checkbox";
                missing.id = "qunit-filter-missing";
                missing.disabled = true;
                addEvent(missing, "click", function () {
                    var li = document.getElementsByTagName("li");
                    for (var i = 0; i < li.length; i++) {
                        if (li[i].className.indexOf("fail") > -1 && li[i].innerHTML.indexOf("missing test - untested code is broken code") > -1) {
                            li[i].parentNode.parentNode.style.display = missing.checked ? "none" : "block";
                        }
                    }
                });
                toolbar.appendChild(missing);
                label = document.createElement("label");
                label.setAttribute("for", "qunit-filter-missing");
                label.innerHTML = "Hide missing tests (untested code is broken code)";
                toolbar.appendChild(label);
            }
            var main = id("main");
            if (main) {
                config.fixture = main.innerHTML;
            }
            if (window.jQuery) {
                config.ajaxSettings = window.jQuery.ajaxSettings;
            }
            QUnit.start();
        });
        function done() {
            if (config.doneTimer && window.clearTimeout) {
                window.clearTimeout(config.doneTimer);
                config.doneTimer = null;
            }
            if (config.queue.length) {
                config.doneTimer = window.setTimeout(function () {
                    if (!config.queue.length) {
                        done();
                    } else {
                        synchronize(done);
                    }
                }, 13);
                return;
            }
            config.autorun = true;
            if (config.currentModule) {
                QUnit.moduleDone(config.currentModule, config.moduleStats.bad, config.moduleStats.all);
            }
            var banner = id("qunit-banner"), tests = id("qunit-tests"), html = ["Tests completed in ", +new Date - config.started, " milliseconds.<br/>", "<span class=\"passed\">", config.stats.all - config.stats.bad, "</span> tests of <span class=\"total\">", config.stats.all, "</span> passed, <span class=\"failed\">", config.stats.bad, "</span> failed."].join("");
            if (banner) {
                banner.className += " " + (config.stats.bad ? "fail" : "pass");
            }
            if (tests) {
                var result = id("qunit-testresult");
                if (!result) {
                    result = document.createElement("p");
                    result.id = "qunit-testresult";
                    result.className = "result";
                    tests.parentNode.insertBefore(result, tests.nextSibling);
                }
                result.innerHTML = html;
            }
            QUnit.done(config.stats.bad, config.stats.all);
        }
        function validTest(name) {
            var i = config.filters.length, run = false;
            if (!i) {
                return true;
            }
            while (i--) {
                var filter = config.filters[i], not = filter.charAt(0) == "!";
                if (not) {
                    filter = filter.slice(1);
                }
                if (name.indexOf(filter) !== -1) {
                    return !not;
                }
                if (not) {
                    run = true;
                }
            }
            return run;
        }
        function push(result, actual, expected, message) {
            message = message || (result ? "okay" : "failed");
            QUnit.ok(result, result ? message + ": " + expected : message + ", expected: " + QUnit.jsDump.parse(expected) + " result: " + QUnit.jsDump.parse(actual));
        }
        function synchronize(callback, save) {
            config.queue.push(callback);
            if (save) {
                cachelist.push(callback);
            }
            if (config.autorun && !config.blocking) {
                process();
            }
        }
        function process() {
            while (config.queue.length && !config.blocking) {
                config.queue.shift()();
            }
        }
        function saveGlobal() {
            config.pollution = [];
            if (config.noglobals) {
                for (var key in window) {
                    config.pollution.push(key);
                }
            }
        }
        function checkPollution(name) {
            var old = config.pollution;
            saveGlobal();
            var newGlobals = diff(old, config.pollution);
            if (newGlobals.length > 0) {
                ok(false, "Introduced global variable(s): " + newGlobals.join(", "));
                config.expected++;
            }
            var deletedGlobals = diff(config.pollution, old);
            if (deletedGlobals.length > 0) {
                ok(false, "Deleted global variable(s): " + deletedGlobals.join(", "));
                config.expected++;
            }
        }
        function diff(a, b) {
            var result = a.slice();
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < b.length; j++) {
                    if (result[i] === b[j]) {
                        result.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
            return result;
        }
        function fail(message, exception, callback) {
            if (typeof console !== "undefined" && console.error && console.warn) {
                console.error(message);
                console.error(exception);
                console.warn(callback.toString());
            } else {
                if (window.opera && opera.postError) {
                    opera.postError(message, exception, callback.toString);
                }
            }
        }
        function extend(a, b) {
            for (var prop in b) {
                a[prop] = b[prop];
            }
            return a;
        }
        function addEvent(elem, type, fn) {
            if (elem.addEventListener) {
                elem.addEventListener(type, fn, false);
            } else {
                if (elem.attachEvent) {
                    elem.attachEvent("on" + type, fn);
                } else {
                    fn();
                }
            }
        }
        function id(name) {
            return !!(typeof document !== "undefined" && document && document.getElementById) && document.getElementById(name);
        }
        QUnit.equiv = function () {
            var innerEquiv;
            var callers = [];
            function hoozit(o) {
                if (QUnit.is("String", o)) {
                    return "string";
                } else {
                    if (QUnit.is("Boolean", o)) {
                        return "boolean";
                    } else {
                        if (QUnit.is("Number", o)) {
                            if (isNaN(o)) {
                                return "nan";
                            } else {
                                return "number";
                            }
                        } else {
                            if (typeof o === "undefined") {
                                return "undefined";
                            } else {
                                if (o === null) {
                                    return "null";
                                } else {
                                    if (QUnit.is("Array", o)) {
                                        return "array";
                                    } else {
                                        if (QUnit.is("Date", o)) {
                                            return "date";
                                        } else {
                                            if (QUnit.is("RegExp", o)) {
                                                return "regexp";
                                            } else {
                                                if (typeof o === "object") {
                                                    return "object";
                                                } else {
                                                    if (QUnit.is("Function", o)) {
                                                        return "function";
                                                    } else {
                                                        return undefined;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            function bindCallbacks(o, callbacks, args) {
                var prop = hoozit(o);
                if (prop) {
                    if (hoozit(callbacks[prop]) === "function") {
                        return callbacks[prop].apply(callbacks, args);
                    } else {
                        return callbacks[prop];
                    }
                }
            }
            var callbacks = function () {
                function useStrictEquality(b, a) {
                    if (b instanceof a.constructor || a instanceof b.constructor) {
                        return a == b;
                    } else {
                        return a === b;
                    }
                }
                return {"string":useStrictEquality, "boolean":useStrictEquality, "number":useStrictEquality, "null":useStrictEquality, "undefined":useStrictEquality, "nan":function (b) {
                    return isNaN(b);
                }, "date":function (b, a) {
                    return hoozit(b) === "date" && a.valueOf() === b.valueOf();
                }, "regexp":function (b, a) {
                    return hoozit(b) === "regexp" && a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
                }, "function":function () {
                    var caller = callers[callers.length - 1];
                    return caller !== Object && typeof caller !== "undefined";
                }, "array":function (b, a) {
                    var i;
                    var len;
                    if (!(hoozit(b) === "array")) {
                        return false;
                    }
                    len = a.length;
                    if (len !== b.length) {
                        return false;
                    }
                    for (i = 0; i < len; i++) {
                        if (!innerEquiv(a[i], b[i])) {
                            return false;
                        }
                    }
                    return true;
                }, "object":function (b, a) {
                    var i;
                    var eq = true;
                    var aProperties = [], bProperties = [];
                    if (a.constructor !== b.constructor) {
                        return false;
                    }
                    callers.push(a.constructor);
                    for (i in a) {
                        aProperties.push(i);
                        if (!innerEquiv(a[i], b[i])) {
                            eq = false;
                        }
                    }
                    callers.pop();
                    for (i in b) {
                        bProperties.push(i);
                    }
                    return eq && innerEquiv(aProperties.sort(), bProperties.sort());
                }};
            }();
            innerEquiv = function () {
                var args = Array.prototype.slice.apply(arguments);
                if (args.length < 2) {
                    return true;
                }
                return (function (a, b) {
                    if (a === b) {
                        return true;
                    } else {
                        if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || hoozit(a) !== hoozit(b)) {
                            return false;
                        } else {
                            return bindCallbacks(a, callbacks, [b, a]);
                        }
                    }
                })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length - 1));
            };
            return innerEquiv;
        }();
        QUnit.jsDump = (function () {
            function quote(str) {
                return "\"" + str.toString().replace(/"/g, "\\\"") + "\"";
            }
            function literal(o) {
                return o + "";
            }
            function join(pre, arr, post) {
                var s = jsDump.separator(), base = jsDump.indent(), inner = jsDump.indent(1);
                if (arr.join) {
                    arr = arr.join("," + s + inner);
                }
                if (!arr) {
                    return pre + post;
                }
                return [pre, inner + arr, base + post].join(s);
            }
            function array(arr) {
                var i = arr.length, ret = Array(i);
                this.up();
                while (i--) {
                    ret[i] = this.parse(arr[i]);
                }
                this.down();
                return join("[", ret, "]");
            }
            var reName = /^function (\w+)/;
            var jsDump = {parse:function (obj, type) {
                var parser = this.parsers[type || this.typeOf(obj)];
                type = typeof parser;
                return type == "function" ? parser.call(this, obj) : type == "string" ? parser : this.parsers.error;
            }, typeOf:function (obj) {
                var type;
                if (obj === null) {
                    type = "null";
                } else {
                    if (typeof obj === "undefined") {
                        type = "undefined";
                    } else {
                        if (QUnit.is("RegExp", obj)) {
                            type = "regexp";
                        } else {
                            if (QUnit.is("Date", obj)) {
                                type = "date";
                            } else {
                                if (QUnit.is("Function", obj)) {
                                    type = "function";
                                } else {
                                    if (QUnit.is("Array", obj)) {
                                        type = "array";
                                    } else {
                                        if (QUnit.is("Window", obj) || QUnit.is("global", obj)) {
                                            type = "window";
                                        } else {
                                            if (QUnit.is("HTMLDocument", obj)) {
                                                type = "document";
                                            } else {
                                                if (QUnit.is("HTMLCollection", obj) || QUnit.is("NodeList", obj)) {
                                                    type = "nodelist";
                                                } else {
                                                    if (/^\[object HTML/.test(Object.prototype.toString.call(obj))) {
                                                        type = "node";
                                                    } else {
                                                        type = typeof obj;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return type;
            }, separator:function () {
                return this.multiline ? this.HTML ? "<br />" : "\n" : this.HTML ? "&nbsp;" : " ";
            }, indent:function (extra) {
                if (!this.multiline) {
                    return "";
                }
                var chr = this.indentChar;
                if (this.HTML) {
                    chr = chr.replace(/\t/g, "   ").replace(/ /g, "&nbsp;");
                }
                return Array(this._depth_ + (extra || 0)).join(chr);
            }, up:function (a) {
                this._depth_ += a || 1;
            }, down:function (a) {
                this._depth_ -= a || 1;
            }, setParser:function (name, parser) {
                this.parsers[name] = parser;
            }, quote:quote, literal:literal, join:join, _depth_:1, parsers:{window:"[Window]", document:"[Document]", error:"[ERROR]", unknown:"[Unknown]", "null":"null", undefined:"undefined", "function":function (fn) {
                var ret = "function", name = "name" in fn ? fn.name : (reName.exec(fn) || [])[1];
                if (name) {
                    ret += " " + name;
                }
                ret += "(";
                ret = [ret, this.parse(fn, "functionArgs"), "){"].join("");
                return join(ret, this.parse(fn, "functionCode"), "}");
            }, array:array, nodelist:array, arguments:array, object:function (map) {
                var ret = [];
                this.up();
                for (var key in map) {
                    ret.push(this.parse(key, "key") + ": " + this.parse(map[key]));
                }
                this.down();
                return join("{", ret, "}");
            }, node:function (node) {
                var open = this.HTML ? "&lt;" : "<", close = this.HTML ? "&gt;" : ">";
                var tag = node.nodeName.toLowerCase(), ret = open + tag;
                for (var a in this.DOMAttrs) {
                    var val = node[this.DOMAttrs[a]];
                    if (val) {
                        ret += " " + a + "=" + this.parse(val, "attribute");
                    }
                }
                return ret + close + open + "/" + tag + close;
            }, functionArgs:function (fn) {
                var l = fn.length;
                if (!l) {
                    return "";
                }
                var args = Array(l);
                while (l--) {
                    args[l] = String.fromCharCode(97 + l);
                }
                return " " + args.join(", ") + " ";
            }, key:quote, functionCode:"[code]", attribute:quote, string:quote, date:quote, regexp:literal, number:literal, "boolean":literal}, DOMAttrs:{id:"id", name:"name", "class":"className"}, HTML:true, indentChar:"   ", multiline:true};
            return jsDump;
        })();
    })(this);
}
)();

(
function () {
    if (navigator.userAgent.match(/Rhino/) && !window.build_in_progress) {
        QUnit.testStart = function (name) {
            print("--" + name + "--");
        };
        QUnit.log = function (result, message) {
            if (!message) {
                message = "";
            }
            print((result ? "  PASS " : "  FAIL ") + message);
        };
        QUnit.testDone = function (name, failures, total) {
            print("  done - fail " + failures + ", pass " + total + "\n");
        };
        QUnit.moduleStart = function (name) {
            print("MODULE " + name + "\n");
        };
        QUnit.moduleDone = function (name, failures, total) {
        };
    }
}
)();

(
function () {
    S = function (s, c) {
        return new S.init(s, c);
    };
    S.open = function (url, callback, timeout) {
        S.add(function (success, error) {
            S._open(url, error);
            S._onload(function () {
                S._opened();
                success();
            }, error);
        }, callback, "Page " + url + " not loaded in time!", timeout);
    };
    S.window = {document:{}};
    S._opened = function () {
    };
    (function () {
        var queue = [], incallback = false;
        S.add = function (f, callback, error, timeout) {
            if (incallback) {
                queue.unshift({method:f, callback:callback, error:error, timeout:timeout});
            } else {
                queue.push({method:f, callback:callback, error:error, timeout:timeout});
            }
            if (queue.length == 1) {
                stop();
                setTimeout(S._done, 13);
            }
        };
        S._done = function () {
            if (queue.length > 0) {
                var next = queue.shift();
                var timer = setTimeout(function () {
                    ok(false, next.error);
                    S._done();
                }, next.timeout || 10000);
                next.method(function () {
                    clearTimeout(timer);
                    incallback = true;
                    if (next.callback) {
                        next.callback.apply(null, arguments);
                    }
                    incallback = false;
                    S._done();
                }, function (message) {
                    clearTimeout(timer);
                    ok(false, message);
                    S._done();
                });
            } else {
                start();
            }
        };
        S.wait = function (time, cb) {
            time = time || 10000;
            S.add(function (success, error) {
                setTimeout(success, time);
            }, cb, "Couldn't wait!", time * 2);
        };
        S.repeat = function (script, callback) {
            var f = script;
            if (typeof script == "string") {
                script = script.replace(/\n/g, "\\n");
                f = function () {
                    with (opener) {
                        var result = eval("(" + script + ")");
                    }
                    return result;
                };
            }
            if (callback) {
                var interval = null;
                var time = new Date();
                interval = setInterval(function () {
                    if (callback.failed) {
                        clearInterval(interval);
                    } else {
                        var result = null;
                        try {
                            result = f();
                        }
                        catch (e) {
                        }
                        if (result) {
                            clearInterval(interval);
                            callback();
                        }
                    }
                }, 1);
            } else {
                var result = f();
                return result;
            }
        };
        S.makeArray = function (arr) {
            var narr = [];
            for (var i = 0; i < arr.length; i++) {
                narr[i] = arr[i];
            }
            return narr;
        };
        S.convert = function (str) {
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
        };
        S.funcs = ["synthetic", "size", "data", "attr", "removeAttr", "addClass", "hasClass", "removeClass", "toggleClass", "html", "text", "val", "empty", "css", "offset", "offsetParent", "position", "scrollTop", "scrollLeft", "height", "width", "innerHeight", "innerWidth", "outerHeight", "outerWidth"];
        S.makeFunc = function (fname) {
            S.init.prototype[fname] = function () {
                var args = S.makeArray(arguments), callback;
                if (typeof args[args.length - 1] == "function") {
                    callback = args.pop();
                }
                args.unshift(fname);
                args.unshift(this.context);
                args.unshift(this.selector);
                S.add(function (success, error) {
                    var ret = S.$.apply(S.$, args);
                    success(ret);
                }, callback, "Can't get text of " + this.selector);
                return this;
            };
        };
    })();
    S.init = function (s, c) {
        this.selector = s;
        this.context = c == null ? S.window.document : c;
    };
    S.init.prototype = {exists:function (cb, timeout) {
        var selector = this.selector, context = this.context;
        S.add(function (success, error) {
            S.repeat(function () {
                return S.$(selector, context, "size");
            }, success);
        }, cb, "Could not find " + this.selector, timeout);
    }, missing:function (cb, timeout) {
        var selector = this.selector, context = this.context;
        S.add(function (success, error) {
            S.repeat(function () {
                return !S.$(selector, context, "size");
            }, success);
        }, cb, "Could not find " + this.selector, timeout);
    }, type:function (text, callback) {
        var selector = this.selector, context = this.context;
        S.add(function (success, error) {
            for (var c = 0; c < text.length; c++) {
                S.$(selector, context, "synthetic", "key", text.substr(c, 1));
            }
            setTimeout(success, 13);
        }, callback, "Could not type " + text + " into " + this.selector);
    }, click:function (options, callback) {
        var selector = this.selector, context = this.context;
        S.add(function (success, error) {
            S.$(selector, context, "synthetic", "click", options, S.window);
            setTimeout(success, 13);
        }, callback, "Could not click " + this.selector);
        return this;
    }};
    (function () {
        for (var i = 0; i < S.funcs.length; i++) {
            S.makeFunc(S.funcs[i]);
        }
    })();
}
)();

(
function () {
    if (navigator.userAgent.match(/Rhino/) && window.SeleniumBrowsers && !window.build_in_progress) {
        importClass(Packages.com.thoughtworks.selenium.DefaultSelenium);
        var addr = java.net.InetAddress.getByName(SeleniumDefaults.serverHost);
        try {
            var s = new java.net.Socket(addr, SeleniumDefaults.serverPort);
        }
        catch (ex) {
            spawn(function () {
                if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
                    runCommand("cmd", "/C", "start steal\\js -selenium");
                } else {
                    runCommand("sh", "-c", "nohup ./steal/js -selenium > selenium.log  2> selenium.err &");
                }
            });
            java.lang.Thread.sleep(1000);
            try {
                var s = new java.net.Socket(addr, SeleniumDefaults.serverPort);
            }
            catch (ex) {
                print("Selenium is not running. Please use steal/js -selenium to start it.");
                quit();
            }
        }
        (function () {
            var browser = 0;
            QUnit.done = function (failures, total) {
                S.selenium.stop();
                S.endtime = new Date().getTime();
                var formattedtime = (S.endtime - S.starttime) / 1000;
                print("\nALL DONE " + failures + ", " + total + " - " + formattedtime + " seconds");
                browser++;
                if (browser < SeleniumBrowsers.length) {
                    print("\nSTARTING " + SeleniumBrowsers[browser]);
                    S.selenium = new DefaultSelenium(SeleniumDefaults.serverHost, SeleniumDefaults.serverPort, SeleniumBrowsers[browser], SeleniumDefaults.browserURL);
                    S.starttime = new Date().getTime();
                    S.selenium.start();
                    QUnit.restart();
                } else {
                    quit();
                }
            };
            print("\nSTARTING " + SeleniumBrowsers[0]);
            S.selenium = new DefaultSelenium(SeleniumDefaults.serverHost, SeleniumDefaults.serverPort, SeleniumBrowsers[0], SeleniumDefaults.browserURL);
            S.starttime = new Date().getTime();
            S.selenium.start();
            S._open = function (url) {
                this.selenium.open(url);
            };
            S._onload = function (success, error) {
                setTimeout(function () {
                    S.selenium.getEval("selenium.browserbot.getCurrentWindow().focus();selenium.browserbot.getCurrentWindow().document.documentElement.tabIndex = 0;");
                    success();
                }, 1000);
            };
            var convertToJson = function (arg) {
                return arg === S.window ? "selenium.browserbot.getCurrentWindow()" : jQuery.toJSON(arg);
            };
            S.prompt = function (answer) {
                this.selenium.answerOnNextPrompt(answer);
            };
            S.confirm = function (answer) {
                if (answer) {
                    this.selenium.chooseOkOnNextConfirmation();
                } else {
                    this.selenium.chooseCancelOnNextConfirmation();
                }
            };
            S.$ = function (selector, context, method) {
                var args = S.makeArray(arguments);
                for (var a = 0; a < args.length; a++) {
                    if (a == 1) {
                        if (args[a] == S.window.document) {
                            args[a] = "_doc()";
                        } else {
                            if (typeof args[a] == "number") {
                                args[a] = "_win()[" + args[a] + "].document";
                            } else {
                                if (typeof args[a] == "string") {
                                    args[a] = "_win()['" + args[a] + "'].document";
                                }
                            }
                        }
                    } else {
                        args[a] = convertToJson(args[a]);
                    }
                }
                var response = S.selenium.getEval("jQuery.wrapped(" + args.join(",") + ")");
                return eval("(" + response + ")");
            };
        })();
    }
}
)();

(
function () {
    if (!navigator.userAgent.match(/Rhino/)) {
        S._window = null;
        var newPage = true, changing;
        var makeArray = function (arr) {
            var narr = [];
            for (var i = 0; i < arr.length; i++) {
                narr[i] = arr[i];
            }
            return narr;
        };
        S._open = function (url) {
            changing = url;
            if (newPage) {
                S._window = window.open(url, "funcunit");
            } else {
                S._window.location = url;
            }
        };
        var unloadLoader, loadSuccess, currentDocument;
        unloadLoader = function () {
            Synthetic.addEventListener(S._window, "load", function () {
                S._window.document.documentElement.tabIndex = 0;
                setTimeout(function () {
                    S._window.focus();
                    if (loadSuccess) {
                        loadSuccess();
                    }
                    loadSuccess = null;
                }, 0);
                Synthetic.removeEventListener(S._window, "load", arguments.callee);
            });
            Synthetic.addEventListener(S._window, "unload", function () {
                Synthetic.removeEventListener(S._window, "unload", arguments.callee);
                setTimeout(unloadLoader, 0);
            });
        };
        var poller = function () {
            if (S._window.document !== currentDocument) {
                if (S._window.document.readyState == "complete") {
                    if (loadSuccess) {
                        S._window.focus();
                        S._window.document.documentElement.tabIndex = 0;
                        loadSuccess();
                    }
                    loadSuccess = null;
                    currentDocument = S._window.document;
                }
            }
            setTimeout(arguments.callee, 1000);
        };
        S._onload = function (success, error) {
            loadSuccess = success;
            if (!newPage) {
                return;
            }
            newPage = false;
            if (jQuery.browser.msie) {
                poller();
            } else {
                unloadLoader();
            }
        };
        var confirms = [], prompts = [];
        S.confirm = function (answer) {
            confirms.push(!!confirms);
        };
        S.prompt = function (answer) {
            prompts.push(answer);
        };
        S._opened = function () {
            S._window.alert = function () {
            };
            S._window.confirm = function () {
                return confirms.shift();
            };
            S._window.prompt = function () {
                return prompts.shift();
            };
        };
        S.$ = function (selector, context, method) {
            var args = makeArray(arguments);
            for (var i = 0; i < args.length; i++) {
                args[i] = args[i] === S.window ? S._window : args[i];
            }
            var selector = args.shift(), context = args.shift(), method = args.shift(), q;
            if (context == S.window.document) {
                context = S._window.document;
            } else {
                if (typeof context == "number" || typeof context == "string") {
                    context = S._window.frames[context].document;
                }
            }
            if (S._window.jQuery && parseFloat(S._window.jQuery().jquery) >= 1.3) {
                q = jQuery(S._window.jQuery(selector, context).get());
            } else {
                q = jQuery(selector, context);
            }
            return q[method].apply(q, args);
        };
        $(window).unload(function () {
            if (S._window) {
                S._window.close();
            }
        });
    }
}
)();
