(function(){
FuncUnit.
/**
 * Waits a timeout before running the next command.  Wait is an action and gets 
 * added to the queue.
 * @codestart
 * S.wait(100, function(){
 *   equals( S('#foo').innerWidth(), 100, "innerWidth is 100");
 * })
 * @codeend
 * @param {Number} [time] The timeout in milliseconds.  Defaults to 5000.
 * @param {Function} [callback] A callback that will run 
 * 		after the wait has completed, 
 * 		but before any more queued actions.
 */
wait = function(time, callback){
	if(typeof time == 'function'){
		callback = time;
		time = undefined;
	}
	time = time != null ? time : 5000
	FuncUnit.add({
		method : function(success, error){
			steal.dev.log("Waiting "+time)
			setTimeout(success, time)
		},
		callback : callback,
		error : "Couldn't wait!",
		timeout : time + 1000
	});
	return this;
}

/**
 * @hide
 * @function repeat
 * Takes a function that will be called over and over until it is successful.
 */
FuncUnit.repeat = function(checker, callback, error, timeout){
	
	if(typeof timeout == 'function'){
		error = callback;
		callback = timeout;
		
	}
	
	var interval,
		stopped = false	,
		stop = function(){
			clearTimeout(interval)
			stopped = true;
		};

	FuncUnit.add({
		method : function(success, error){
			interval = setTimeout(function(){
				
				var result = null;
				try {
					result = checker()
				} 
				catch (e) {
					//should we throw this too error?
				}
				
				if (result) {
					success();
				}else if(!stopped){
					interval = setTimeout(arguments.callee, 10)
				}
				
			}, 10);
			
			
		},
		callback : callback,
		error : error,
		timeout : timeout,
		stop : stop
	});
	
}

$.extend(FuncUnit.init.prototype, {
	/**
	 * Waits until an element exists before running the next action.
	 * @codestart
	 * //waits until #foo exists before clicking it.
	 * S("#foo").exists().click()
	 * @codeend
	 * @param {Function} [callback] a callback that is run after the selector exists, but before the next action.
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	exists: function( callback ) {
		if(true){
			return this.size(function(size){
				return size > 0;
			}, callback)
		}
		return this.size() == 0;
	},
	/**
	 * Waits until no elements are matched by the selector.  Missing is equivalent to calling
	 * <code>.size(0, callback);</code>
	 * @codestart
	 * //waits until #foo leaves before continuing to the next action.
	 * S("#foo").missing()
	 * @codeend
	 * @param {Function} [callback] a callback that is run after the selector exists, but before the next action
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	missing: function( callback ) {
		return this.size(0, callback)
	},
	/**
	 * Waits until the funcUnit selector is visible.  
	 * @codestart
	 * //waits until #foo is visible.
	 * S("#foo").visible()
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the funcUnit is visible, but before the next action.
	 * @return [funcUnit] returns the funcUnit for chaining.
	 */
	visible: function( callback ) {
		var self = this,
			sel = this.selector,
			ret;
		this.selector += ":visible"
		if(true){
			return this.size(function(size){
				return size > 0;
			}, function(){
				self.selector = sel;
				callback && callback();
			})
		}else{
			ret = this.size() > 0;
			this.selector = sel;
			return ret;
		}
		
	},
	/**
	 * Waits until the selector is invisible.  
	 * @codestart
	 * //waits until #foo is invisible.
	 * S("#foo").invisible()
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the selector is invisible, but before the next action.
	 * @return [funcUnit] returns the funcUnit selector for chaining.
	 */
	invisible: function( callback ) {
		var self = this,
			sel = this.selector,
			ret;
		this.selector += ":visible"
		return this.size(0, function(){
			self.selector = sel;
			callback && callback();
		})
	},
	/**
	 * Waits a timeout before calling the next action.  This is the same as
	 * [FuncUnit.prototype.wait].
	 * @param {Number} [timeout]
	 * @param {Object} callback
	 */
	wait: function( timeout, callback ) {
		FuncUnit.wait(timeout, callback)
	},
	/**
	 * Returns a FuncUnit wrapped selector with 
	 * selector appended to the current selector.
	 * @codestart
	 * S('#foo').find(".bar") //-> S("#foo .bar")
	 * @codeend
	 * @param {String} selector
	 * @return {FuncUnit} the funcunit wrapped selector.
	 */

	find : function(selector){
		return FuncUnit(this.selector+" "+selector, this.context);
	},
	/**
	 * Calls the callback function after all previous asynchronous actions have completed.  Then
	 * is called with the funcunit object.
	 * @param {Object} callback
	 */
	then : function(callback){
		var self = this;
		FuncUnit.wait(0, function(){
			callback.call(self, self);
		});
		return this;
	}
})

})()