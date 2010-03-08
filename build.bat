:: funcunit folder
COPY funcunit\test\funcunit\app\jquery.js funcunit\dist\funcunit\app\
COPY funcunit\test\funcunit\app\myapp.html funcunit\dist\funcunit\app\
COPY funcunit\test\funcunit\test.js funcunit\dist\funcunit\
:: run.js, test.html, and settings.js have differences and are not copied

::qunit folder
COPY funcunit\qunit\qunit.css funcunit\dist\qunit\qunit.css
COPY funcunit\test\qunit\test.js funcunit\dist\qunit\
:: fun.js and test.html have differences and are not copied

:: top-level folder
COPY funcunit\functional\jquery.js funcunit\dist\jquery.js
del funcunit\dist\funcunit.js
START /WAIT /B steal\js steal\compress\plugin.js funcunit/functional funcunit/dist/funcunit.js
:wait
sleep 1
IF NOT EXIST funcunit\dist\funcunit.js GOTO wait
:: synthetic can't use steal because its used in selenium
TYPE funcunit\synthetic\synthetic.js >> funcunit\dist\funcunit.js
TYPE funcunit\functional\drivers\json.js >> funcunit\dist\funcunit.js

:: rhino folder
COPY steal\rhino\js.jar funcunit\dist\rhino\js.jar
COPY steal\rhino\selenium-java-client-driver.jar funcunit\dist\rhino\selenium-java-client-driver.jar
COPY steal\rhino\env.js funcunit\dist\rhino\env.js
START /WAIT /B steal\js selenium\build-selenium