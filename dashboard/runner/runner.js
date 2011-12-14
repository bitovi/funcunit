steal("jquery/controller", "./test.js", function(){

	$.Controller("Dashboard.Runner", {
		init: function(){
			this.find("table").append("//funcunit/dashboard/runner/tests.ejs", {
				tests: this.options.tests
			})
		},
		".test .play click": function(el, ev){
			var el = el.closest(".test"),
				test = el.model();
			test.run();
			ev.stopImmediatePropagation();
			ev.preventDefault();
			el.addClass('test-running')
		},
		'{opts} .play click': function(el, ev){
			var coverage = false;
			if($('#runCoverage').prop("checked")){
				coverage = true;
			}
			this.options.tests.run(coverage);
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