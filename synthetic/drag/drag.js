steal.plugins('funcunit/synthetic').then(function(){
	
	
	var createEvent = Synthetic.createEvent,
	
	Drag = function(target, options){
		this.callback = options.callback;
		this.start_x = options.from.x;
		this.end_x = options.to.x;
		this.delta_x = this.end_x - this.start_x;
		this.start_y = options.from.y;
		this.end_y = options.to.y;
		this.delta_y = this.end_y - this.start_y;
		this.target = target;
		this.duration = options.duration ? options.duration : 1000;
		this.start = new Date();

		new Synthetic('mousedown', {clientX: this.start_x, clientY: this.start_y}).send(target);

		// create a mouse cursor
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
		var pointerY = this.start_y+scrollTop;
		this.pointer = $("<div />").css({
				width: 10,
				height: 10, 
				backgroundColor: "red",
				position: "absolute",
				left: this.start_x,
				top: pointerY,
				lineHeight: 1,
				zIndex: 99999
			}).appendTo($(document.body))
		
		setTimeout(this.next_callback(), 20);
	};
	Drag.prototype = {
		next: function(){
			var now = new Date();
			var difference = now - this.start;
			if( difference > this.duration ){
				new Synthetic('mousemove', {clientX: this.end_x, clientY: this.end_y}).send(this.target);
				var event = new Synthetic('mouseup', {clientX: this.end_x, clientY: this.end_y}).send(this.target);
				this.pointer.remove();
				if (this.callback) {
					this.callback({
						event: event,
						element: this.target
					});
				}
			}else{
				var percent = difference / this.duration;
				var x =  this.start_x + percent * this.delta_x;
				var y = this.start_y + percent * this.delta_y;

				var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
				var pointerY = y + scrollTop;
				this.pointer.offset({
					left: x,
					top: pointerY
				})
				new Synthetic('mousemove', {clientX: x, clientY: y}).send(this.target);
				setTimeout(this.next_callback(), 20);
			}
		},
		next_callback : function(){
			var t = this;
			return function(){
				t.next();
			};
		}
	};
	
	
	Synthetic.prototype.drag = function(from){
			var doc = this.scope.document;
			var jq = this.scope.jQuery
			if( !jQuery ) {
				throw "You need jQuery to perform drags in synthetic.js"
			}
			
			//get from and to
			var addxy = function(part, options, center){
				if(!options[part].x || !options[part].y ){
					var j = jq(options[part], doc)
					var o = j.offset();
					options[part] = {
						x: o.left+ (center ? j.width() / 2 : 0 ),
						y: o.top + (center ? j.height() / 2 : 0 )
					};
				}
				// relative coordinates
				if(typeof options[part].x == "string" || typeof options[part].y == "string") {
					var orig = jq(from, doc).offset()
					var x = parseInt(options[part].x, 10);
					var y = parseInt(options[part].y, 10);
					options[part] = {
						x: orig.left + x,
						y: orig.left + y
					}
				}
			}
			this.options.from = from;
			this.options.to = jq(this.options.to, doc)[0];
			addxy('from', this.options);
			addxy('to', this.options, true);
			if(this.options.duration){
				return new Drag(from, this.options)
			}
			
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
			var x = this.options.from.x - scrollLeft;
			var y = this.options.from.y - scrollTop;
			var steps = this.options.steps || 100;
			this.type = 'mousedown';
			this.options.clientX = x;
			this.options.clientY = y;
			createEvent(this.type, this.options, from);
			this.type = 'mousemove';
			for(var i = 0; i < steps; i++){
				x = this.options.from.x -  scrollLeft + (i * (this.options.to.x - this.options.from.x )) / steps;
				y = this.options.from.y - scrollTop + (i * (this.options.to.y - this.options.from.y )) / steps;
				this.options.clientX = x;
				this.options.clientY = y;
				createEvent(this.type, this.options, from);
			}
			this.type = 'mouseup';
			this.options.clientX = this.options.to.x - scrollLeft;
			this.options.clientY = this.options.to.y - scrollTop;
			createEvent(this.type, this.options, from);
		}
})