//what we need from javascriptmvc or other places
steal('funcunit/qunit')
	.then('jquery')
	.then('jquery/lang/json')
	.then('funcunit/syn')
	.then('funcunit/browser/core.js')
	.then('funcunit/browser/open.js')
	.then('funcunit/browser/actions.js')
	.then('funcunit/browser/getters.js')
	.then('funcunit/browser/traversers.js')
	.then('funcunit/browser/queue.js')
	.then('funcunit/browser/waits.js')
	// only used in selenium/jstestdriver/envjs mode, but including here so standalone funcunit can have all the code in one file
	.then('funcunit/browser/events.js')