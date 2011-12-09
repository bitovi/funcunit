steal('funcunit/coverage/report', function(){
	$.ajax({
		url: 'coverage.json',
		dataType: 'json',
		success: function(d){
			$('#coverage').coverage({stats: d});
		}
	})
	
})