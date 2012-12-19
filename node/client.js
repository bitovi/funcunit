steal(function(){
	steal.client = {
		trigger: function(type, data){
			console.log('__EVT', JSON.stringify({
				trigger: type,
				data: data
			}));
		},
		evaluate: function(script, arg){
			eval("var fn = "+script);
			var res = fn(arg);
			return res;
		}
	};
});