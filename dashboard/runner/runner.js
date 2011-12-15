steal("jquery/controller", "./test.js", function(){

	$.Controller("Dashboard.Runner", {
		init: function(){
			this.find("table").append("//funcunit/dashboard/runner/tests.ejs", {
				tests: this.options.tests
			})
		},
		".check-all change":function(el,ev)
		{
			if(!el.is(':checked')){
				this.find('.check-one').removeAttr("checked");
			} else {
				this.find('.check-one').attr("checked", "checked");
			}
		},
		'{opts} .play click': function(el, ev)
		{
			var tests = new Test.List([]);
			this.find('.check-one:checked').each(function(i,t){
				var el = $(t).closest(".test"),
					test = el.model();
				
				tests.push(test);
			});
			
			tests.run($('#runCoverage').is(':checked'));
			
			ev.preventDefault();
		},
		"{Test} testDone": function(el, ev, test){
			var el = test.elements();
			el.removeClass('test-running')
			
			if(!test.failed){
				el.addClass('test-pass')
			} else {
				el.addClass('test-fail')
			}
			
			el.find('.assertions').html('//funcunit/dashboard/runner/assertions.ejs', {
				assertions: test.assertions 
			})
		},
		"{Test} testStart": function(el, ev, test){
			var el = test.elements(),
				scrollY = el.offset().top;
			// scroll to test
			$('html, body').animate({
				scrollTop: scrollY-100
			}, 200);
			el.addClass('test-running')
		}
	})
})