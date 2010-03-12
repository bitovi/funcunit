:: scripts folder
COPY funcunit\qunit\qunit.css funcunit\dist\scripts\qunit.css
COPY funcunit\functional\jquery.js funcunit\scripts\jquery.js
del funcunit\dist\scripts\funcunit.js
START /WAIT /B steal\js steal\compress\plugin.js funcunit/functional funcunit/dist/scripts/funcunit.js
:wait
sleep 1
IF NOT EXIST funcunit\dist\scripts\funcunit.js GOTO wait
:: synthetic can't use steal because its used in selenium
TYPE funcunit\synthetic\synthetic.js >> funcunit\dist\scripts\funcunit.js
TYPE funcunit\functional\drivers\json.js >> funcunit\dist\scripts\funcunit.js

:: email folder
COPY steal\rhino\mail.jar funcunit\dist\selenium\mail\mail.jar
COPY steal\mail\email.js funcunit\dist\selenium\mail\email.js

:: rhino_env folder
COPY steal\rhino\js.jar funcunit\dist\selenium\rhino_env\js.jar
COPY steal\rhino\env.js funcunit\dist\selenium\rhino_env\env.js

:: selenium folder
COPY steal\rhino\selenium-java-client-driver.jar funcunit\dist\selenium\selenim\selenium-java-client-driver.jar
COPY steal\rhino\selenium-server.jar funcunit\dist\selenium\selenium\selenium-server.jar

:: avoid building selenium b/c we have to manually change the version numbers in install.rdf b/c of lee's push
:: START /WAIT /B steal\js selenium\build-selenium