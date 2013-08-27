steal.config({
	map: {
		"*": {
			"jquery/jquery.js" : "jquery",
			"can/util/util.js": "can/util/jquery/jquery.js",
			"jquery/": "jquerypp/",
			"funcunit/": "",
			"jasmine/jasmine.js": "jasmine"
		}
	},
	paths: {
		"jquery/": "jquerypp/",
		"jquery": "lib/jquery/jquery.js",
		"jasmine": "lib/jasmine/lib/jasmine-core/jasmine.js"
	},
	shim : {
		jquery: {
			exports: "jQuery"
		}
	},
	ext: {
		js: "js",
		css: "css",
		less: "steal/less/less.js",
		ejs: "can/view/ejs/ejs.js",
		mustache: "can/view/mustache/mustache.js"
	}
})
