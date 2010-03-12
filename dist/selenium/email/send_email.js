load('settings.js');
load('selenium/email/email.js');

var log = readFile('test.log');
Emailer.setup(EmailerDefaults);
Emailer.send(log)