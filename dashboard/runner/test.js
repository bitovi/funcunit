steal("jquery/model/list", function(){
	var iframe = $("<iframe name='frame' src='dashboard/frame/blank.html'></iframe>").prependTo(document.body),
		testFile = top.location.search.substring(1);
		
	// prevent page from jumping to iframe during reload
	$(window).scroll(function(){
		iframe.css('top', window.scrollY);
	})
	
	$.Model("Test", {
		file: top.location.search.substring(1),
		trigger: function(evt, d){
			$([Test]).trigger(evt, d);
		},
		hashCode: function(text){
			var hash = 0, 
				mychar;
			if (text.length == 0) return hash;
			for (i = 0; i < text.length; i++) {
				mychar = text.charCodeAt(i);
				hash = ((hash<<5)-hash)+mychar;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		}
	},
	{
		init: function(){
			this.id = Test.hashCode(this.module+this.test);
			this.assertions = [];
		},
		filterString: function(){
			return this.module+": "+this.test;
		},
		run: function(){
			var filter = this.filterString(),
				win = iframe[0].contentWindow;
			win.location = "dashboard/frame/frame.html?filter="+filter+"&test="+testFile;
			// win.location.reload();
		},
		done: function(d){
			this.attrs({
				failed: d.failed,
				passed: d.passed
			})
			Test.trigger("testDone", this)
		},
		start: function(d){
			Test.trigger("testStart", this)
		},
		log: function(d){
			this.assertions.push(d);
		}
	})
	$.Model.List("Test.List", {
		run: function(withCoverage){
			var filterArr = [];
			this.each(function(i, test){
				filterArr.push(test.filterString());
			});
			
			var win = iframe[0].contentWindow,
				loc = "dashboard/frame/frame.html?";
			if(withCoverage){
				loc+="steal[instrument]=true&";
			}
			loc+="filter="+filterArr.join(",")+"&test="+testFile;
			win.location = loc;
		}
	})
});