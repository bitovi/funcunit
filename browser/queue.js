(function(){
	/**
	 * @add FuncUnit
	 */
	//are we in a callback function (something we pass to a FuncUnit plugin)
	FuncUnit._incallback = false;
	//the queue of commands waiting to be run
	var queue = [], 
		//where we should add things in a callback
		currentPosition = 0;
		
	/**
	 * A queue of methods.  Each method in the queue are run in order.  After the method is complete, it 
	 * calls FuncUnit._done, which pops the next method off the queue and runs it.
	 */
	FuncUnit._queue = queue;
	FuncUnit.
	/**
	 * Adds a function to the queue.  The function is passed within an object that
	 * can have several other properties:
	 * method : the method to be called.  It will be provided a success and error function to call
	 * callback : an optional callback to be called after the function is done
	 * error : an error message if the command fails
	 * timeout : the time until success should be called
	 * bind : an object that will be 'this' of the success
	 * stop : 
	 */
	add = function(handler){
		//if we are in a callback, add to the current position
		if (FuncUnit._incallback) {
			// Removing this so we can safely perform every query immediately and not queue it in the cbs
			// This means doing asynchronous stuff in callbacks isn't supported anymore.  I don't know any places this is a problem, 
			// but if it is, we can add this back
//			queue.splice(currentPosition,0,handler)
//			currentPosition++;
		}
		else {
			//add to the end
			queue.push(handler);
		}
		//if our queue has just started, stop qunit
		//call done to call the next command
        if (queue.length == 1 && ! FuncUnit._incallback) {
			stop();
            setTimeout(FuncUnit._done, 13)
        }
	}
	//this is called after every command
	// it gets the next function from the queue
	var currentEl;
	FuncUnit._done = function(el, selector){
		var next, 
			timer,
			speed = 0;
			
		if(FuncUnit.speed == "slow"){
			speed = 500;
		}
		if (queue.length > 0) {
			next = queue.shift();
			currentPosition = 0;
			// set a timer that will error
			
			//call next method
			setTimeout(function(){
				timer = setTimeout(function(){
						next.stop && next.stop();
						ok(false, next.error);
						FuncUnit._done();
					}, 
					(next.timeout || 10000) + speed)
				// if the last successful method had a collection, save it
				if(el && el.jquery){
					currentEl = el;
				}
				// make the new collection the last successful collection
				if(currentEl){
					next.bind = currentEl;
				}
				next.selector = selector;
				next.method(	//success
					function(el){
						if(el && el.jquery){
							next.bind = el;
						}
						//make sure we don't create an error
						clearTimeout(timer);
						
						//mark in callback so the next set of add get added to the front
						
						FuncUnit._incallback = true;
						if (next.callback) 
							// callback's "this" is the collection
							next.callback.apply(next.bind, arguments);
						FuncUnit._incallback = false;
						
						
						FuncUnit._done(next.bind, next.selector);
					}, //error
					function(message){
						clearTimeout(timer);
						ok(false, message);
						FuncUnit._done();
					})
				
				
			}, speed);
			
		}
		else {
			start();
		}
	}
})()