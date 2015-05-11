steal.config({
	map: {
		"*": {
			"jquery/jquery.js": "jquery",
			"can/util/util.js": "can/util/jquery/jquery.js",
			"jquery/": "jquerypp/",
			"funcunit": "../resources"
		}
	},
	paths: {
		"jquery": "can/lib/jquery.1.9.1.js"
	},
	shim: {
		jquery: {
			exports: "jQuery"
		},

		funcunit: {
			exports: "F",
			deps: ["jquery"]
		}
	},
	ext: {
		js: "js",
		css: "css",
		less: "steal/less/less.js",
		ejs: "can/view/ejs/ejs.js",
	}
})