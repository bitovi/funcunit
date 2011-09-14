@page s 2.1 The S Method
@parent FuncUnit

selects something in the application window

{String|Function|Object} selector FuncUnit behaves differently depending if
the selector is a string, a function, or an object.
<h5>String</h5>
The selector is treated as a css selector.  
jQuery/Sizzle is used as the selector so any selector it understands
will work with funcUnit.  FuncUnit does not perform the selection until a
command is called upon this selector.  This makes aliasing the selectors to
JavaScript variables a great technique.
<h5>Function</h5>
If a function is provided, it will add that function to the action queue to be run
after previous actions and waits.
<h5>Object</h5>
If you want to reference the window or document, pass <code>S.window</code> 
or <code>S.window.document</code> to the selector.  

{Number} [context] If provided, the context is the frame number in the
document.frames array to use as the context of the selector.  For example, if you
want to select something in the first iframe of the page:

    S("a.mylink",0)