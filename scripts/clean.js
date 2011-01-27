/*global load: false */
/*
clean script to (check sanity and) normalize
	syn
	syn/drag
 */
(function () {
	"use strict";
	var settings = {
		indent_size: 1,
		indent_char: '\t',
		space_after_anon_function: true,

		// for (i... / for ( i...
		space_statement_expression: false,
		//jslint: true,
		ignore: /steal\/*|jquery\/*|jquery\/jquery\.js|funcunit\/syn\/*|funcunit\/resources\/jquery.js\/*|funcunit\/syn\/resources\/jquery.js\/*|funcunit\/test\/jquery.js\/*/,
		predefined: {
			steal: true,
			Syn: true,
			jQuery: true,
			$: true,
			window: true
		}
	};
	load("steal/rhino/steal.js");
	steal.plugins('steal/clean', function () {
		steal.clean('funcunit/scripts/clean.js', settings);

		steal.clean('funcunit/funcunit.html', settings);

		steal.clean('funcunit/qunit/test/qunit.html', settings);
		steal.clean('funcunit/syn/drag/qunit.html', settings);
		steal.clean('funcunit/syn/qunit.html', settings);
		steal.clean('funcunit/qunit.html', settings);

		steal.clean('funcunit/autosuggest/auto_suggest.js', settings);
		steal.clean('funcunit/autosuggest/autosuggest.js', settings);
		steal.clean('funcunit/autosuggest/autosuggest_test.js', settings);
		steal.clean('funcunit/build.js', settings);
		steal.clean('funcunit/java/extensions/fakesteal.js', settings);
		steal.clean('funcunit/java/extensions/wrapped.js', settings);
		steal.clean('funcunit/java/user-extensions.js', settings);
		steal.clean('funcunit/loader.js', settings);
		steal.clean('funcunit/pages/follow.js', settings);
		steal.clean('funcunit/pages/init.js', settings);
		steal.clean('funcunit/scripts/run.js', settings);
		steal.clean('funcunit/test/funcunit/syn_test.js', settings);
		steal.clean('funcunit/test/jquery.event.drag.js', settings);
		steal.clean('funcunit/test/jquery.event.drop.js', settings);
		steal.clean('funcunit/test/jquery.js', settings);
		steal.clean('funcunit/test/protodrag/dragdrop.js', settings);
		steal.clean('funcunit/test/protodrag/effects.js', settings);
		steal.clean('funcunit/test/protodrag/funcunit_test.js', settings);
		steal.clean('funcunit/test/protodrag/prototype.js', settings);
		steal.clean('funcunit/test/protodrag/scriptaculous.js', settings);
		steal.clean('funcunit/test/run.js', settings);

	});

}());