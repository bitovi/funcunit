@echo off

:: used to build a downloadable zip file jmvc
:: ie: build_download

:: remove previous download directory
rmdir ..\download /s /Q
rm download.zip

:: create a new directory called download
mkdir ..\download

:: copy demo into it
mkdir ..\download\demo
xcopy funcunit\dist\demo\*.* ..\download\demo\ /e

:: copy scripts into it
mkdir ..\download\scripts
xcopy funcunit\dist\scripts\*.* ..\download\scripts\ /e

:: copy selenium into it
mkdir ..\download\selenium
xcopy funcunit\dist\selenium\*.* ..\download\selenium\ /e

:: copy files
copy funcunit\dist\funcunit ..\download\
copy funcunit\dist\funcunit.bat ..\download\
copy funcunit\dist\funcunit.html ..\download\
copy funcunit\dist\funcunit.js ..\download\
copy funcunit\dist\settings.js ..\download\
copy funcunit\dist\README ..\download\

:: zip that directory
cd ..\download && zip -r funcunit-0.1.0.zip * -i demo\* -i scripts\* -i selenium\* -i funcunit -i funcunit.bat -i funcunit.html -i funcunit.js -i README -i settings.js