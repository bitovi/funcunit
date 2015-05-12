steal('can','can/util/object', function( can, Object ) {
	
	/**
	 * @constructor srchr/models/history
	 * @inherits can.Model
	 * @test srchr/models/test.html
	 * @parent srchr
	 * 
	 * Provides a History model that allows data to be saved and retrieved from
	 * localStorage.  Example:
	 * 
	 *     // Create a new item
	 *     var history = new History({query: "cats", types: ["big"]});
	 *     // save it
	 *     history.save();
	 * 
	 *     // change a property and save it back
	 *     history.attr("types").push("lolz")
	 *     history.save()
	 * 
	 *     // destroy it
	 *     history.destroy()
	 *    
	 *     
	 *     // get all items from localStorage
	 *     History.findAll({}, function(items){
	 *         
	 *     })
	 * 
	 * 
	 * 
	 */
	return  can.Model({
		/**
		 * The name of the localStorage property used to store instances of this model.
		 */
		localStoreName: "search-history-store",
		id: "query",
		localStore: function( cb ) {
			var name = this.localStoreName,
				data = JSON.parse(window.localStorage[name] || (window.localStorage[name] = '[]')),
				res = cb.call(this, data);
			if ( res !== false ) {
				window.localStorage[name] = JSON.stringify(data);
			}
		},
		findAll: function( params ) {
			var def = $.Deferred();
			this.localStore(function( todos ) {
				def.resolve(todos);
			});
			
			return def;
		},
		destroy: function( id ) {
			var def = $.Deferred();
			this.localStore(function( todos ) {
				for ( var i = 0; i < todos.length; i++ ) {
					if ( todos[i][this.id] === id ) {
						todos.splice(i, 1);
						break;
					}
				}
				def.resolve({});
			});
			return def;
		},
		// handles create and update
		update: function( id, attrs ) {
			var def = new can.Deferred();
			this.localStore(function( items ) {
				for ( var i = 0; i < items.length; i++ ) {
					if ( items[i][this.id] === id ) {
						var item = items[i];
						// update item
						can.extend(item, attrs);
						// move it to the start
						items.splice(i,1);
						items.unshift(item)
						break;
					}
				}
				if(!item){
					attrs[this.id] = id;
					items.unshift(attrs)
				}
				
			});
			def.resolve({});
			return def;
		}
	}, {
	});
});