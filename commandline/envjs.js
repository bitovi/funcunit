steal('steal/browser/envjs', function(){
}, './utils.js', function(){
	FuncUnit.loader.envjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = page;
		FuncUnit.browser = new steal.browser.envjs({
			fireLoad: true
		});
		
		FuncUnit.browser
			.bind('clientloaded', function(){
				this.injectJS('funcunit/browser/events.js')
				this.evaluate(function(){
					$.holdReady(false);
				})
			})
			.bindEvents()
			.open(FuncUnit.funcunitPage);
	}
})