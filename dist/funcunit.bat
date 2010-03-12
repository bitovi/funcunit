@echo off

if "%1"=="-email" goto :email
goto :development

:email
java -cp selenium\selenium\selenium-java-client-driver.jar;selenium\rhino_env\js.jar org.mozilla.javascript.tools.shell.Main -opt -1 -e load('selenium/run.js') > test.log
java -cp selenium\email\mail.jar;selenium\rhino_env\js.jar org.mozilla.javascript.tools.shell.Main -opt -1 -e load('selenium/email/send_email.js')
goto :end

:development
java -cp selenium\selenium\selenium-java-client-driver.jar;selenium\rhino_env\js.jar org.mozilla.javascript.tools.shell.Main -opt -1 -e load('selenium/run.js')
goto :end

:end