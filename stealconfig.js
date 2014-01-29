steal.config({
	map: {
		"*": {
			"jquery/jquery.js" : "jquery",
			"jquery/": "jquerypp/",
			"funcunit/": "",
			"jasmine/jasmine.js": "jasmine",
			"src/": "syn/"
		}
	},
	paths: {
		"jquery/": "jquerypp/",
		"jquery": "lib/jquery/jquery.js",
		"jasmine": "lib/jasmine/lib/jasmine-core/jasmine.js",
		"syn/": "lib/syn/src/"
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
