steal('can',function(can){

var placeholderSupported = false// "placeholder" in document.createElement("input");

// Adds a placeholder for browsers that don't support it
/**
 * @constructor ui/placeholder
 * @parent srchr
 * @test ui/placeholder/test.html
 * @inherits can.Control
 * 
 * `new Placeholder(element, options)` creates
 * a placeholder effect for browsers that do not
 * support it.
 * 
 *     new Placeholder('#search',{
 *      placeholder: "Enter search text"
 *     });
 * 
 * @demo ui/placeholder/placeholder.html
 * 
 * 
 * @param {HTMLInputElement} element 
 * the element to show results within.
 * 
 * @param {Object} options An object of the following options:
 * 
 * #### placeholder `can.Compute` or `String`
 * 
 * The placeholder text of the element.
 * 
 */
return can.Control({
	setup: function(element, options){
		if(typeof options.placeholder == "string" ){
			options.placeholder = can.compute(options.placeholder)
		}
		can.Control.prototype.setup.apply(this,arguments)
	},
    init: function(element, options) {
        if( placeholderSupported ) {
        		this.element.attr('placeholder', this.options.placeholder() );   
        } else {
            if( this.element.val() === '' ) {
                this.addPlaceholder(); 
            } else {
            		this.changed = true;
            }
            
        }
        
    },
    addPlaceholder: function(){
        this.element.val(this.options.placeholder()) 
        	.addClass('placeholder');
        this.changed = false;
    },
    removePlaceholder: function(){
    		this.element.val("").removeClass('placeholder');
    },
    'focus': function(el, ev) {
        if( ! placeholderSupported && !this.changed ) {
            if(  this.element.val() === this.options.placeholder() ) {
            		this.removePlaceholder();
            }
        }
    },
    'blur': function(){
        if( !placeholderSupported ) {
            if( this.element.val() === '' || this.element.val() === this.options.placeholder() ) {
            		this.addPlaceholder();
            }
        }
    },
    "{value} change": function(value, ev, newVal, oldVal){
    		if( !placeholderSupported && newVal) {
    			this.element.removeClass('placeholder');
    			this.element.val(newVal)
		} 
    },
    "{placeholder} change": function(placeholder, ev, newVal, oldVal){
        if( placeholderSupported ) {
            this.element.attr('placeholder', newVal)
        } else {
            if( !this.changed && !this.isFocused() ) {
                this.element.val(newVal);
            }
        }
    },
    "change" : function(){
    		this.changed = (this.element.val() !== "");
    		
    },
    isFocused: function(){
    		return document.activeElement === this.element[0];   
    }
});

})