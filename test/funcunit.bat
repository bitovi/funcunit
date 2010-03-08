@echo off

netstat -an | FINDSTR ":4444" | FINDSTR LISTENING && GOTO SELENIUM_STARTED
start steal\js -selenium

:SELENIUM_STARTED
steal\js funcunit\test\funcunit\run.js