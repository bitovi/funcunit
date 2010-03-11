@echo off
java -cp rhino\selenium-java-client-driver.jar;rhino\js.jar org.mozilla.javascript.tools.shell.Main -opt -1 -e load('funcunit/run.js')