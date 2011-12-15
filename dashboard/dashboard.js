steal("steal/less", "jquery/view/ejs", "jquery/controller").then("funcunit/settings.js")
	.then("funcunit/dashboard/runner", "funcunit/qunit", "funcunit/dashboard/coverage")
	.then("./dashboard.less", "./aristo.css", function($){
	
	var currentModule,
		currentTest,
		tests = new Test.List([]);
		
	window.module = function(name){
		currentModule = name;
	}
	
	window.test = function(name, expects, fn){
		if(typeof expects === "function"){
			fn = expects;
		}
		
		tests.push(new Test({
			test: name,
			module: currentModule,
			testCode: fn.toString()
		}));
	}
	
	steal(Test.file, function(){
		$(".results-wrapper").dashboard_runner({
			tests: tests,
			opts: $(".run-options")
		});
		
		steal("steal/instrument");
	});
	
	$.Controller("Dashboard", {
		testDone: function(d){
			var id = Test.hashCode(d.module+d.name),
				test = tests.get(id)[0];
			test.done(d);
		},
		testStart: function(d){
			var id = Test.hashCode(d.module+d.name),
				test = tests.get(id)[0];
			currentTest = test;
			test.start(d);
		},
		log: function(d){
			currentTest.log(d);
		},
		coverage: function(stats){
			$(".coverage-wrapper").coverage({stats: stats})
			$(document.body).controller().showReportTab();
		}
	}, {
		"#test-tab click": function(el, ev){
			ev.preventDefault();
			this.showTestTab();
		},
		"#report-tab click": function(el, ev){
			ev.preventDefault();
			this.showReportTab();
		},
		"#file-tab click": function(el, ev){
			ev.preventDefault();
			this.showFileTab();
		},
		showTestTab: function(){
			this.find('#report-tab').show().removeClass('btn-pressed')
			this.find('#test-tab').addClass('btn-pressed')
			this.find('#file-tab').hide().removeClass('btn-pressed')
			
			this.find(".results-wrapper").show();
			this.find(".run-options").show();
			
			this.find('.file-options').hide();
			
			this.find('.files-wrapper').hide();
			this.find('.report-wrapper').hide();
		},
		showReportTab: function(){
			this.find('#report-tab').show().addClass('btn-pressed')
			this.find('#test-tab').removeClass('btn-pressed')
			this.find('#file-tab').hide().removeClass('btn-pressed')
			
			this.find(".results-wrapper").hide();
			this.find('.file-options').hide();
			this.find(".run-options").hide();
			
			this.find('.files-wrapper').hide();
			this.find('.report-wrapper').show();
		},
		showFileTab: function(){
			this.find('#report-tab').removeClass('btn-pressed')
			this.find('#test-tab').removeClass('btn-pressed')
			this.find('#file-tab').addClass('btn-pressed')
			
			this.find('.file-options').show();
			this.find('.files-wrapper').show();
			this.find('.report-wrapper').hide();
		}
	});
	
	$(document.body).dashboard();
})
