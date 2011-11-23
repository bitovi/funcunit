steal('jquery').then('./jslint.js', function(){
var me = new Date();

window._$coverage = {};
if(typeof FuncUnit === "undefined"){
	FuncUnit = {};
}
steal.type("js", function(options, original, success, error){
	$.ajax({
		url: options.src,
		type: 'GET', 
		dataType: 'text', 
		success: function(text){
			var parsed = new FuncUnit.Parse(text),
				instrumented = parsed.stated(options.rootSrc);
			console.log(instrumented);
			eval(instrumented);
			success();
		}
	})
})
window.__s = function(fileName, lineNbr){
	_$coverage[fileName][lineNbr]++;
}
// total statements per file
// fileName, lines
window.__l = function(data){
	if(!_$coverage[data.fileName]){
		_$coverage[data.fileName] = {};
		for(var i=0; i<data.lines.length; i++){
			_$coverage[data.fileName][data.lines[i]] = 0;
		}
	}
}
// an array of nodes ...
FuncUnit.Parse = function(str, context){
	if(!this._parse){
		return new arguments.callee(str);
	}
	if(typeof str == 'string'){
		this._context = str;
		try{
			var a = JSLINT(str,{
				devel: true, 
				forin: true, 
				browser: true, 
				windows: true, 
				rhino: true, 
				predefined : true, 
				indent:  1, 
				maxerr:  10000000000000,
				undef: true,
				vars: true,
				bitwise: true,
				confusion: true,
				'continue': true,
				css: true,
				eqeq: true,
				es5: true,
				evil: true,
				fragment: true,
				maxlen: 1000000000000,
				newcap: true,
				nomen: true,
				on: true,
				passfail: false,
				plusplus: true,
				regexp: true,
				unparam: true,
				sloppy: true,
				sub: true,
				white: true
			})
		}catch(e){
			console.log(e)
			throw e;
		}
		str =  JSLINT.tree;
		
	}else{
		this._context = context;
	}
	if(context && typeof context != 'string'){
		steal.dev.log(context)
	}
	if(!str) return;
	if(str._parse === me){
		var copy = [];
		for(var i=0; i<str.length; i++){
			copy.push(str[i]);
		}
		str = copy;
		//$.makeArray(str)
	}
	
	if(!str.length){
		str = [str]
	}
	this.push.apply(this, str);
};
var p = function(tree, context){
	return new FuncUnit.Parse(tree, context);
}
count = 100000;
bisect = function(tree, func, parent, fnc){
	count--;
	if(count <= 0){
		steal.dev.log('outa here')
		return false;
	}
	var res;
	if(!tree || typeof tree == 'string'){
		return;
	}else if(tree.length && tree[0]){
		for(var i=0; i< tree.length;i++){
			if(parent){
				tree[i].parent = parent;
			}
			if(fnc){
				tree[i].func = fnc;
			}
			res = bisect(tree[i], func, parent && tree)
			if(res === false){
				return res;
			}
		}
	}else if(tree.length === 0){
	  //almost certainly an empty array	
	}else{
		if(parent){
			tree.parent = parent;
		}
		
		if(tree.arity == 'statement'){
			
			res = func(tree);
			if(res === false){
				return res;
			}
			res = bisect(tree.first, func, tree);
			if(res === false){
				return res;
			}
		}else{
			res = bisect(tree.first, func, tree);
			if(res === false){
				return res;
			}
			res = func(tree);
			if(res === false){
				return res;
			}
		}
		
		
		if(tree.block){
			tree.block.definedIn = parent;
			res = bisect(tree.block, func, undefined, tree)
			if(res === false){
				return res;
			}
		}
		if(tree.second){
			if(typeof tree.second == "string"){
				//func(tree)
			}else{
				if(parent){
					tree.second.parent = parent
				}
				res = bisect(tree.second, func, tree);
				if(res === false){
					return res;
				}
			}
			
			
		}
	}	
}

var extend = function(obj, methods){
	for(var key in methods){
		obj[key] = methods[key];
	}
}

window.p = function(tree, context){
	return new Funcit.Parse(tree, context);
}
extend( FuncUnit.Parse.prototype, {
	_parse : me,
	each : function(func){
		return $.each(this, func)
	},
	get : function(line, from, thru, func){
		matches = [];
		if(!func){
			func = thru;
			thru = from;
		}
		var self = this;
		bisect(this.tree || this, function(tree){
			//steal.dev.log(tree, tree.line , tree.from)
//			if (tree.end) {
//				var last = tree.end;
//				if (tree.line <= line && line <= last.line &&
//				((tree.line !== line && last.line !== line) ||
//				(tree.line == line && from >= tree.from) ||
//				(last.line == line && from <= last.from))) {
//					matches.push(tree);
//					return func && func(tree);
//				}
//			}
//			else {
				if (tree.line == line && tree.from <= from && from < tree.thru) {
					matches.push(tree);
					return func && func(tree);
				}
//			}
				
			
		});
		return p(matches, this._context);
	},
	func : function(line, from, thru, func){
		matches = [];

		bisect(this, function(tree){
			if (tree.arity === 'function') {
				var last = tree.end;
				if (tree.line <= line && line <= last.line &&
				    (
					 (tree.line !== line && last.line !== line) ||
				     ( tree.line == line && from >= tree.from) ||
				     ( last.line == line && from <= last.from))
					) {
					matches.push(tree);
					return func && func(tree);
				}
			}
		});
		return p(matches, this._context);
	},
	last : function(){
		var last = null;
		bisect(this, function(tree){
			if(!tree || tree.thru){
				last = tree
			}
		});
	},
	statement : function(){
		var matches = [];
		// bisect(this, function(tree){
			// if(tree.arity === "statement")
				// matches.push(tree)
		// })
		this.each(function(i, tree){
			while(tree.parent && (tree = tree.parent)){};
			matches.push(tree)
		})
		return p(matches, this._context);
	},
	find : function(obj, func){
		var matches = [] 
		bisect(this, function(tree){
			var equal = true;
			for(var name in obj){
				if(obj[name] != tree[name]){
					equal  = false;
					break;
				}
			}
			if(equal){
				matches.push(tree);
				return func && func(tree) ;
			}
			
		})
		return p(matches, this._context);
	},
	S : function(){
		return this.find({type: "(identifier)", value : 'S'})
	},
	args : function(obj, func){
		return this.up().second();
	},
	push: [].push,
	//gets the last part of a function
	second : function(){
		return p(this[0].second, this._context)
	},
	// gets all the second parts in a chain
	chains: function(){
		var matches = [];
		bisect(this, function(tree){
			if(typeof tree.second == "string")
				matches.push(tree);
			
		})
		return p(matches, this._context);
	},
	first : function(){
		return p(this[0].first, this._context)
	},
	up : function(){
		var first = this[0];
		if(typeof first != 'undefined'){
			return p(first.parent || first.definedIn || first.func, this._context)
		}
	},
	block : function(){
		return p(this[0].block, this._context)
	},
	eq : function(num){
		return p(this[num], this._context)
	},
	start : function(){
		return charLoc(this._context, this.firstPos())
	},
	end : function(){
		return charLoc(this._context, this[0].end)
	},
	ender : function(){
		var end = this.end(),
			space = /[\t ;]/;
		while(end > 0){
			if(!space.test( this._context[end] )){
				break;
			}
			end --
		}
		//go backwards from endpoint
		return end
	},
	last : function(){
		return p(this[this.length-1], this._context)
	},
	startLine : function(){
		
	},
	endLine : function(){
		
	},
	toString : function(){
		var str = "";
		bisect(this, function(tree){
			if(typeof tree.second == "string")
				// steal.dev.log(tree, tree.value, tree.second)
			str += tree.value + (typeof tree.second == 'string' ? tree.second : "" )
			
		})
		return str;
	},
	posSort : function(a, b){
		 if(a.line > b.line){
			return 1;
		}else if(a.line == b.line){
			return a.from - b.from;
		}else{
			return -1;
		}
	},
	firstPos : function(){
		var pos = {line : 10000000,
				   from : 10000000},
			   sort = this.posSort;
		bisect(this, function(tree){
			if(sort(tree, pos) < 0){
				pos = tree;
			}
		});
		return pos;
	},
	ordered : function(){
		var stmnts = this.find({parent: null}),
			locs = [],
			chr,
			str = [],
			last = 0,
			stmt;
		for(var i =0; i < stmnts.length; i++){
			stmt = stmnts.eq(i).firstPos();
			if(stmt.arity === "function") continue;
			locs.push(stmt);
		}
		return locs.sort(this.posSort);
	},
	// __s(fileName, statementNbr, lineNbr)
	stated : function(fileName){
		//must go through statements in reverse order
		//this will prevent incorrect spacing
		var locs = this.ordered(),
			chr,
			str = [],
			statements = [],
			last = 0;

		for(var i=0; i < locs.length; i++){
			statements.push(locs[i].line);
			chr = charLoc(this._context,locs[i]);
			str.push(this._context.substring(last,chr));
			str.push(";__s('"+fileName+"', "+locs[i].line+");");
			last = chr;
		}
		str.push(this._context.substring(last, this._context.length))
		return  "__l({'fileName': '"+fileName+"', 'lines': ["+statements.join(", ")+"]});\n"+str.join("");
	}
})
// this should cache line lengths eventually
var charLoc = function(str, pos){
	var newLine = new RegExp("\n","g"),
		previous = 0,
		total = 0,
		lines = pos.line - 1;
	while(lines && newLine.exec(str) ){
		lines --;
	}
	return newLine.lastIndex+( (pos.from || pos.thru || 1) - 1 )
}
});