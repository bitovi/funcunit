var path = new java.io.File(".").getCanonicalPath();
var browserURL = "file:///"+path.replace("\\", "/")+"/";

SeleniumDefaults = {
    serverHost: "localhost",
    serverPort: 4444,
    browserURL: browserURL
    //browserURL: "file:///C:/development/framework/funcunit/dist/funcunit/"
}
SeleniumBrowsers = ["*firefox"]

EmailerDefaults = {
    host: "smtp.myserver.com",
    port: 25,
    from: "myemail@gmail.com",
    to: "myemail@archer-tech.com",
    subject: "Test Logs"
}