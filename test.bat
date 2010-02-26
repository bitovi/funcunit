@echo off

netstat -an | FINDSTR ":4444" | FINDSTR LISTENING && GOTO SELENIUM_STARTED
start /D "steal\js.bat -selenium"

:SELENIUM_STARTED

steal\js funcunit\funcunit\test\funcunit\run.js