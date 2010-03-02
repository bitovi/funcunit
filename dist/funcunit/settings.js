var path = new java.io.File(".").getCanonicalPath();
var browserURL = "file:///"+path+"/funcunit/test.html";
print(browserURL)
SeleniumDefaults = {
    serverHost: "localhost",
    serverPort: 4444,
    browserURL: browserURL
    //browserURL: "file:///C:/development/framework/funcunit/dist/funcunit/test.html"
}
SeleniumBrowsers = ["*firefox"]