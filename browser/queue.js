(function(){
	//the queue of commands waiting to be run
	var queue = [], 
		//are we in a callback function (something we pass to a FuncUnit plugin)
		incallback = false,
		//where we should add things in a callback
		currentPosition = 0;
		
	
	FuncUnit.
	/**
	 * @hide
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
		if (incallback) {
			queue.splice(currentPosition,0,handler)
			currentPosition++;
		}
		else {
			//add to the end
			queue.push(handler);
		}
		//if our queue has just started, stop qunit
		//call done to call the next command
        if (queue.length == 1 && ! incallback) {
			stop();
            setTimeout(FuncUnit._done, 13)
        }
	}
	//this is called after every command
	// it gets the next function from the queue
	FuncUnit._done = function(){
		var next, 
			timer,
			speed = 0;
			
		if(FuncUnit.speed == "slow"){
			speed = 500;
		}
		else if (FuncUnit.speed){
			speed = FuncUnit.speed;
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
				
				next.method(	//success
					function(){
						//make sure we don't create an error
						clearTimeout(timer);
						
						//mark in callback so the next set of add get added to the front
						
						incallback = true;
						if (next.callback) 
							next.callback.apply(next.bind || null, arguments);
						incallback = false;
						
						
						FuncUnit._done();
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