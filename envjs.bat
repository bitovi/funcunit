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
java -Xss1024k -cp steal/rhino/mail.jar;funcunit/dist/selenium/selenium/selenium-java-client-driver.jar;steal\rhino\js.jar org.mozilla.javascript.tools.shell.Main -opt -1 -e _args=%ARGS% -e load('funcunit/scripts/run.js')
