steal("funcunit", 'srchr/search', function(S, Search){

	module("srchr/search",{
		setup : function(){
			this.currentSearch = can.compute(false);
			$("<div id='content'/>").appendTo("#qunit-test-area");					
		 	new Search('#content', {currentSearch: this.currentSearch});
		},
		teardown: function () {
			$("#content").remove();
		}
	});
	
	
	test("Empty the search field and blur it", function(){
		S("input[name=query]").click(function(){
			ok(!$('input[name=query]').val().length, 'Text field is empty!')
		})
		
		S('input[type=checkbox]').click( function(){		
			ok($('input[name=query]').val(), 'Text field is filled!')
			ok($('input[name=query]').hasClass('placeholder'), 'Clicked query box is grayed out')
		})
	});
	
	
	test("Selected search box is not blurred and is empty", function(){		
		S('input[name=query]').click({}, function(){
			ok(!$('input[name=query]').hasClass('placeholder'), 'Clicked query box is not grayed out')
		})
	});
	
	test("Submit form with no query and no type", function(){	
		var self = this;
		S('input[type=submit]').click(function(){
			ok (!self.currentSearch(), "Search was not submitted");
		});
	});
	
	test("Submit form with a query but no type", function(){
		var self = this;
		S('input[name=query]').type('hello world')
		S('input[type=submit]').click({}, function(){
			var srch = self.currentSearch();

			equal(srch, false, "no search submitted");
		}, 'A search was not submitted')
	});
	
	test("Submit form with a valid query and type", function(){
		var self = this;
		S('input[name=query]').click()
		S('input[name=query]').type('testing...')
		S('input#cb_Google[type=checkbox]').click();
				
		S('input[type=submit]').click(function(){
			var srch = self.currentSearch();
		
			equal(srch.query, 'testing...', 'Current search contains valid query');
			equal(srch.types[0], 'Google', 'Current search contains a valid type');
		}, 'A search was submitted');	
	});
	
	test("Changing the current search types and the form updates its checkboxes",function(){
		this.currentSearch({
			query: "Cat",
			types: ["Google"]
		});
		
		ok( $('input#cb_Google[type=checkbox]').is(":checked") , "Google is checked" );
		
		
	})
	
	
});