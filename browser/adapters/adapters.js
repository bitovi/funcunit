if(window.QUnit){
	steal('funcunit/browser/adapters/qunit.js', function() {
		return window.QUnit;
	})
} else if (window.jasmine){
	steal('funcunit/browser/adapters/jasmine.js', function() {
		return window.jasmine;
	})
}