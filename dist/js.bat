:: This script checks for arguments, if they don't exist it opens the Rhino dialog
:: if arguments do exist, it loads the script in the first argument and passes the other arguments to the script
:: ie: js jmvc\script\controller Todo
@echo off
SETLOCAL ENABLEDELAYEDEXPANSION
if "%1"=="" (
	java -cp rhino\js.jar org.mozilla.javascript.tools.shell.Main
	GOTO END
)
if "%1"=="-selenium" (
	java -jar rhino\selenium-server.jar
	GOTO END
)
SET CP=rhino\js.jar
SET ARGS=[
SET FILENAME=%1
SET FILENAME=%FILENAME:\=/%
::haven't seen any way to loop through all args yet, so for now this goes through arg 2-7
for /f "tokens=2,3,4,5,6,7 delims= " %%a in ("%*") do SET ARGS=!ARGS!'%%a','%%b','%%c','%%d','%%e','%%f'
::remove the commas
for %%a in (",''=") do ( call set ARGS=%%ARGS:%%~a%% )
::remove the spaces
for /f "tokens=1*" %%A in ("%ARGS%") do SET ARGS=%%A
SET ARGS=%ARGS%]
java -cp rhino\selenium-java-client-driver.jar;rhino\js.jar org.mozilla.javascript.tools.shell.Main -opt -1 -e _args=%ARGS% -e load('%FILENAME%')