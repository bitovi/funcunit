steal(function() {
	var traversers = [
		/**
		 * @function FuncUnit.prototype.closest .closest()
		 * @parent traversal
		 * @signature `closest()`
		 * Asynchronous version of jQuery's closest.  Performs the exact same functionality as the jQuery method
		 * but adds itself to the queue.
		 *
		 * @codestart
		 * // after the click, filter the collection, then wait for result to be visible
		 *F(".foo").click().closest(".bar").visible();
		 * @codeend
	     * @param {string} selector
		 */
		"closest",
		/**
		 * @function FuncUnit.prototype.next .next()
		 * @parent traversal
		 * @signature `next()`
		 * Asynchronous version of next. Performs the exact same functionality as the jQuery method
		 * but adds itself to the queue.
		 *
		 * @codestart
		 * // after the click, filter the collection, then wait for result to be visible
		 *F(".foo").click().next().visible();
		 * @codeend
		 */
		"next",
		/**
		 * @function FuncUnit.prototype.prev .prev()
		 * @parent traversal
		 * @signature `prev()`
		 * Asynchronous version of prev. Performs the exact same functionality as the jQuery method
		 * but adds itself to the queue.
		 *
		 * @codestart
		 * // after the click, filter the collection, then wait for result to be visible
		 *F(".foo").click().prev().visible();
		 * @codeend
		 */
		"prev",
		/**
		 * @function FuncUnit.prototype.siblings .siblings()
		 * @parent traversal
		 * @signature `siblings()`
		 * Asynchronous version of siblings. Performs the exact same functionality as the jQuery method
		 * but adds itself to the queue.
		 *
		 * @codestart
		 * // after the click, filter the collection, then wait for result to be visible
		 *F(".foo").click().siblings().visible();
		 * @codeend
		 */
		"siblings",
		/**
		 * @function FuncUnit.prototype.last .last()
		 * @parent traversal
		 * @signature `last()`
		 * Asynchronous version of last. Performs the exact same functionality as the jQuery method
		 * but adds itself to the queue.
		 *
		 * @codestart
		 * // after the click, filter the collection, then wait for result to be visible
		 *F(".foo").click().last().visible();
		 * @codeend
		 */
		"last",
		/**
		 * @function FuncUnit.prototype.first .first()
		 * @parent traversal
		 * @signature `first()`
		 * Asynchronous version of first. Performs the exact same functionality as the jQuery method
		 * but adds itself to the queue.
		 *
		 * @codestart
		 * // after the click, filter the collection, then wait for result to be visible
		 *F(".foo").click().first().visible();
		 * @codeend
		 */
		"first",
		/**
		 * @function FuncUnit.prototype.find .find()
		 * @parent traversal
		 * @signature `find()`
		 * Asynchronous version of find. Performs the exact same functionality as the jQuery method
		 * but adds itself to the queue.
		 *
		 * @codestart
		 * // after the click, filter the collection, then wait for result to be visible
		 *F(".foo").click().find(".bar").visible();
		 * @codeend
	     * @param {string} selector
		 */
		"find"
	];

	return traversers;
});
