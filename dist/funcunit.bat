@echo off

netstat -an | FINDSTR ":4444" | FINDSTR LISTENING && GOTO SELENIUM_STARTED
start java -jar rhino\selenium-server.jar

:SELENIUM_STARTED

java -cp rhino\selenium-java-client-driver.jar;rhino\js.jar org.mozilla.javascript.tools.shell.Main -opt -1 -e load('funcunit/run.js')