//needs to open up the test page in another window, and run each test

if(steal.browser.rhino){
	
	steal('jquery').plugins('funcunit/qunit').then('drivers/json','drivers/base','drivers/selenium')
}else{
	steal('jquery').plugins('funcunit/qunit','funcunit/synthetic').then('drivers/json','drivers/base','drivers/standard')
	
}

