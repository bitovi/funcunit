steal("funcunit").then(function(){
module("autosuggest",{
  setup: function() {
    S.open('autosuggest.html')
  }
});

test("JavaScript results",function(){
  S('input').click().type("JavaScript")

  // wait until we have some results
  S('.autocomplete_item').wait(1000).then(function(){
  		console.log(this)
	}).visible(function(){
    equal( S('.autocomplete_item').size(), 5, "there are 5 results")
  })
});


//module("autosuggest",{
//  setup: function() {
//    $.open('autosuggest.html')
//  }
//});

//test("JavaScript results",function(){
//  $('input').click().type("JavaScript")
//
//  // wait until we have some results
//  $('.autocomplete_item').waitVisible(function(){
//    equal( $('.autocomplete_item').size(), 5, "there are 5 results")
//  })
//});
//
//- get rid of getters completely
//- change waits to waitWidth, etc
})