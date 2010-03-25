// Usage: steal/js -mail funcunit/test.js callcenter -all -email
// 		  steal/js funcunit/test.js callcenter -all
// 		  steal/js funcunit/test.js phui/datatable -funcunit

if (typeof javax.mail.Session.getDefaultInstance == "function") {
	_args.shift()
}

var appName = _args[0]

load('steal/rhino/env.js');
load(appName+'/settings.js')



if (!_args[1] || (_args[1]!="-all" && _args[1]!="-functional" && 
				  _args[1]!="-unit" && _args[2]!="-email" && _args[2]!="-mail" && _args[2]!="-all")) {
	print("Usage: steal/js funcunit/test.js [appname] [option]");
	print("");
	print("options");
	print("-functional 	Runs funcunit tests");
	print("-unit 		Runs unit tests");
	print("-email 		Runs all tests and emails you results");
	quit();
}

if (_args[1] == "-functional") {
	Envjs(appName+'/funcunit.html', {
		scriptTypes: {
			"text/javascript": true,
			"text/envjs": true
		},
		fireLoad: true,
		logLevel: 2
	});
}

if (_args[1] == "-unit") {
	Envjs(appName+'/qunit.html', {
		scriptTypes: {
			"text/javascript": true,
			"text/envjs": true
		},
		fireLoad: true,
		logLevel: 2
	});
}


var email = false;
if (_args[2] == "-email" || _args[2] == "-mail" ||
	_args[2] == "-email" || _args[2] == "-mail") {
	if (typeof javax.mail.Session.getDefaultInstance != "function") {
		print('usage: steal\\js -mail [arguments]')
		quit()
	}
	load('steal/email/email.js');
	email = true;
}

if (_args[1] == "-all" || _args[2] == "-all") {
	var func, unit;
	for(var i=0; i<SeleniumApps.length; i++){
		if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
			func = "start /b steal\\js "+SeleniumApps[i]+"/scripts/test.js -functional"
			if(email && i==0) func += " > "+appName+"/test.log"
			else if(email) func += " >> "+appName+"/test.log"
			unit = "start /b steal\\js "+SeleniumApps[i]+"/scripts/test.js -unit"
			if(email) unit += " >> "+appName+"/test.log"
			runCommand("cmd", "/C", func)
			runCommand("cmd", "/C", unit)
		}
		else {
			func = "nohup ./steal/js "+SeleniumApps[i]+"/scripts/test.js -functional"
			if(email && i==0) func += " > "+appName+"/test.log"
			else if(email) func += " >> "+appName+"/test.log"
			unit = "nohup ./steal/js "+SeleniumApps[i]+"/scripts/test.js -unit"
			if(email) unit += " >> "+appName+"/test.log"
			runCommand("sh", "-c", func)
			runCommand("sh", "-c", unit)
		}
	}
	
	if(email){
		var log = readFile(appName+'/test.log');
		steal.Emailer.setup(EmailerDefaults);
		steal.Emailer.send(log)
	}
}