load('settings.js');
load('selenium/email/email.js');

var log = readFile('test.log');
steal.Emailer.setup(EmailerDefaults);
steal.Emailer.send(log)