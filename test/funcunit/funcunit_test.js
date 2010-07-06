module("funcunit test")

test("Back to back opens", function(){
	S.open("test/myotherapp.html", null, 10000);
	
	S.open("test/myapp.html", null, 10000);

	S("#changelink").click().text(function(t){
		equals(t, "Changed","href javascript run")
	})
})

test("asynchronous test", function(){
	S.open("test/drag.html", null, 10000);
	S("#start").moveTo("#end")
	S("#typer").type("javascriptmvc")
	S("#typer").val(function(val){
		equals(val, "javascriptmvc","move test worked correctly");
	})
})

test("Copy Test", function(){

	S.open("test/myapp.html", null, 10000);
	
	S("#typehere").type("javascriptmvc")
	
	S("#seewhatyoutyped").text(function(val){
		equals(val, "typed javascriptmvc","typing");
	})
	
	S.wait(1000)
	
	S("#copy").click();
	
	S("#seewhatyoutyped").text(function(val){
		equals(val, "copied javascriptmvc","copy");
	})
	S("#typehere").offset(function(offset){
		ok(offset.top,"has values")
	})
})

/*test("drag test", function(){
	S("#drag").dragTo("#drop")
	S("#drop").waitHasClass("dropover", true)
	
	S("#drag").dragTo({ x: 500, y: 500 })
	S("#drop").waitHasClass("dropout", true)
	
	S.wait(2000)
	S("#drag").dragTo({ x: "+100", y: "-100" })
})*/

test("iframe", function(){
	
	S("h2",0).text(function(text){
		equals(text, "Goodbye World", "text of iframe")
	})
})
test("waitHtml", function(){
	S("#clickToChange").click().waitHtml(function(html){
		return html == "changed"
	}).html(function(html){
		equals(html,"changed","wait actually waits")
	})
	
})

test("Next Test", function(){

	S.open("test/myotherapp.html", null, 10000);
	
	S.wait(1000,function(){
		ok('coolness')
	})
})

test("URL Test", function(){
	var path;
	
	path = FuncUnit.getAbsolutePath("http://foo.com")
	equals(path, "http://foo.com", "paths match");
	
	FuncUnit.jmvcRoot = "http://localhost/"
	path = FuncUnit.getAbsolutePath("//myapp/mypage.html")
	equals(path, "http://localhost/myapp/mypage.html", "paths match");
	
	FuncUnit.jmvcRoot = null
	path = FuncUnit.getAbsolutePath("//myapp/mypage.html")
	equals(path, "../myapp/mypage.html", "paths match");
	
})