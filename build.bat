:: scripts folder
COPY funcunit\qunit\qunit.css funcunit\dist\scripts\qunit.css
COPY funcunit\functional\jquery.js funcunit\dist\scripts\jquery.js
del funcunit\dist\scripts\funcunit.js
START /WAIT /B steal\js steal\compress\plugin.js funcunit/functional funcunit/dist/scripts/funcunit.js
:wait
sleep 1
IF NOT EXIST funcunit\dist\scripts\funcunit.js GOTO wait
:: synthetic can't use steal because its used in selenium
TYPE funcunit\synthetic\synthetic.js >> funcunit\dist\scripts\funcunit.js
TYPE funcunit\functional\drivers\json.js >> funcunit\dist\scripts\funcunit.js

:: email folder
COPY steal\rhino\mail.jar funcunit\dist\selenium\email\mail.jar
COPY steal\email\email.js funcunit\dist\selenium\email\email.js

:: rhino_env folder
COPY steal\rhino\js.jar funcunit\dist\selenium\rhino_env\js.jar
COPY steal\rhino\env.js funcunit\dist\selenium\rhino_env\env.js

:: avoid building selenium b/c we have to manually change the version numbers in install.rdf b/c of lee's push
:: START /WAIT /B steal\js selenium\build-selenium

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