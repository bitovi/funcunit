var page = _args[0], 
	basePath = _args[1] || "";

if (!page || page.indexOf(".html") == -1) {
	print("Usage: funcunit/envjs myapp/funcunit.html");
	quit();
}

load('steal/rhino/steal.js');
load('funcunit/loader.js');
FuncUnit.load(page)