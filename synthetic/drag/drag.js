steal(function(){
	// document body has to exists for this test
	setTimeout(function(){
		var div = document.createElement('div')
		document.body.appendChild(div);
		Syn.helpers.extend(div.style,{
			width: "100px",
			height: "10000px",
			backgroundColor : "blue",
			position: "absolute",
			top: "10px",
			left: "0px",
			zIndex: 9999
		});
		document.body.scrollTop = 11;
		var el = document.elementFromPoint(3, 1)
		if(el == div){
			Syn.support.elementFromClient = true;
		}else{
			Syn.support.elementFromPage = true;
		}
		document.body.removeChild(div);
		document.body.scrollTop = 0;
	},1);
	
	
	//gets an element from a point
	var elementFromPoint = function(point, element){
		var clientX = point.clientX,
			clientY = point.clientY,
			win = Syn.helpers.getWindow(element)
		
		if(Syn.support.elementFromPage){
			var off = Syn.helpers.scrollOffset(win);
			clientX = clientX + off.left; //convert to pageX
			clientY = clientY + off.top;  //convert to pageY
		}
		
		return win.document.elementFromPoint ? 
						win.document.elementFromPoint(clientX, clientY) : 
						element;
	},
	//creates an event at a certain point
	createEventAtPoint = function(event, point, element){
		var el = elementFromPoint(point, element)
		Syn.trigger(event,point,el)
		return el;
	},
	// creates a mousemove event, but first triggering mouseout / mouseover if appropriate
	mouseMove  = function(point, element, last){
		var el = elementFromPoint(point, element)
		if(last != el){
			Syn.trigger("mouseout",point,last);
			Syn.trigger("mouseover",point,el);
			//need to create mouseenter / mouseleave for IE
		}
		
		Syn.trigger("mousemove",point,el)
		return el;
	},
	// start and end are in clientX, clientY
	startMove = function(start, end, duration, element, callback){
		var startTime = new Date(),
			distX =  end.clientX -start.clientX,
			distY = end.clientY -start.clientY,
			win = Syn.helpers.getWindow(element),
			current = elementFromPoint(start, element),
			cursor = win.document.createElement('div')
			move = function(){
			//get what fraction we are at
				var now = new Date(),
					scrollOffset = Syn.helpers.scrollOffset(win),
					fraction =  (now - startTime) / duration,
					options = {
						clientX : distX * fraction+start.clientX,
						clientY : distY * fraction+start.clientY
					};
				
				if(fraction < 1){
					Syn.helpers.extend(cursor.style,{
						left: (options.clientX+scrollOffset.left+2)+"px",
						top: (options.clientY+scrollOffset.top+2)+"px"
					})
					current = mouseMove(options, element, current)					
					setTimeout(arguments.callee, 15)
				}else{
					current = mouseMove(end, element, current);
					win.document.body.removeChild(cursor)
					callback();
				}
			}
		Syn.helpers.extend(cursor.style,{
			height: "5px",
			width: "5px",
			backgroundColor: "red",
			position: "absolute"
		})
		win.document.body.appendChild(cursor)
		move();
	},
	
	startDrag = function(start, end, duration, element, callback){
		createEventAtPoint("mousedown",start, element);
		startMove(start, end, duration, element, function(){
			createEventAtPoint("mouseup",end, element);
			callback();
		})
	},
	convertOption = function(option, win){
		var reg = /(\d+)x(\d+)/
		if(typeof option == 'string' && reg.test(option)){
			option = {
				pageX : parseInt(  option.match(reg)[0] ),
				pageY : parseInt(  option.match(reg)[1] )
			}
		}
		if(typeof option == 'string'){
			option = jQuery(option, win.document)[0];	
		}
		if(option.nodeName){
			var j = jQuery(option)
				o = j.offset();
			options = {
				pageX: o.left+ (j.width() / 2 ),
				pageY: o.top + (j.height() / 2 )
			}
		}
		if(options.pageX){
			var off = Syn.helpers.scrollOffset(win);
			options = {
				clientX : options.pageX - off.left,
				clientY : options.pageY - off.top
			}
		}
				
		return options;
	}
	
	Syn.init.prototype.move = function(options,from, callback){
		//need to convert if elements
		var win =  Syn.helpers.getWindow(from),
			fro = convertOption(options.from, win),
			to = convertOption(options.to, win);
		
		startMove(fro, to, options.duration, from, callback);
	};
	
	Syn.init.prototype.drag = function(options,from, callback){
		//need to convert if elements
		var win =  Syn.helpers.getWindow(from),
			fro = convertOption(options.from, win),
			to = convertOption(options.to, win);
		
		startDrag(fro, to, options.duration, from, callback);
	}
})