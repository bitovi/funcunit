steal('jquery', "funcunit/browser/lib/jquery-migrate-1.1.0.js", function(jQuery) {
	var FuncUnit = window.FuncUnit || {};
	// TODO: if FuncUnit needs its own jQuery, add a steal.config here to make that happen.
	FuncUnit.jQuery = jQuery//.noConflict(true);
	return FuncUnit;
});