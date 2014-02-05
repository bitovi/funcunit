steal.config({
    map: {
        "*": {
            "jquery/jquery.js": "jquery",
            "basejquery/basejquery.js": "basejquery",
            "funcunit/": "",
            "jasmine/jasmine.js": "jasmine",
            "src/": "syn/"
        }
    },
    paths: {
        "basejquery": "lib/jquery/jquery.js",
        "jquery": "browser/jquery.js",
        "jasmine": "lib/jasmine/lib/jasmine-core/jasmine.js",
        "syn/": "lib/syn/src/"
    },
    shim: {
        basejquery: {
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
