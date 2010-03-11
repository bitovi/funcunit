var path = new java.io.File(".").getCanonicalPath();
var browserURL = "file:///"+path+"/";

SeleniumDefaults = {
    serverHost: "localhost",
    serverPort: 4444,
    browserURL: browserURL
    //browserURL: "file:///C:/development/framework/funcunit/dist/funcunit/"
}
SeleniumBrowsers = ["*firefox"]