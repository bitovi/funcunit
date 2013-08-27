steal('funcunit')
.then('./app.js', function(){
	describe('Adapters', function(){
		it('should use the jasmine adapter', function(){
			S('.clickme').click();
			S('.clickresult').text('clicked', 'clicked the link')
		});
	});

	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;

	var htmlReporter = new jasmine.HtmlReporter();

	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};

	jasmineEnv.execute();
});