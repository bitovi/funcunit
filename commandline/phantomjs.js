steal('steal/browser/phantomjs', './utils.js', function(){
	FuncUnit.loader.phantomjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = page;
		FuncUnit.browser = new steal.browser.phantomjs({
//			print: true
		});
		
		FuncUnit.browser
			.bind('clientloaded', function(){
				this.evaluate(function(){
					if(!$('iframe').length){
						$("<iframe></iframe>").appendTo(document.body);
					}
				})
				this.injectJS('funcunit/browser/events.js')
				this.evaluate(function(){
					$.holdReady(false);
				})
			})
			.bindEvents()
			.open(FuncUnit.funcunitPage)
	}
})