steal('jquery', function(jQuery) {
	var FuncUnit = window.FuncUnit || {};
	FuncUnit.jQuery = jQuery.noConflict(true);
	return FuncUnit;
});
