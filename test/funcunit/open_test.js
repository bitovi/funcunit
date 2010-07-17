module("funcunit-open")

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



test("Back to back opens", function(){
	S.open("test/myotherapp.html", null, 10000);
	
	S.open("test/myapp.html", null, 10000);

	S("#changelink").click(function(){
		equals(S("#changelink").text(), "Changed","href javascript run")
	})
})