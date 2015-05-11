= srchr =

Srchr is a crowdsourced exercise in collecting JavaScript 
wisdom. For more information about the project, visit 
http://blog.rebeccamurphey.com/2010/03/15/srchr-crowdsourcing-javascript-wisdom/.

This is a JavaScriptMVC version created by [Bitovi](http://bitovi.com).  

## Installing

Clone srchr and install its submodules:

    git clone git://github.com/bitovi/srchr srchr
    cd srchr
    git submodule update --init --recursive

## Running

Open [http://bitovi.github.com/srchr/srchr/srchr.html](srchr/srchr.html).

## Testing

In your browser, open [http://bitovi.github.com/srchr/srchr/test.html]. To run it automated, open an console to 
the `srchr` folder and run:

    ./js funcunit/open/selenium http://localhost/srchr/srchr/test.html
    
_Note: Replace http://localhost/srchr with the path to srchr._

## Building

Open a console to the `srchr` folder and run:

    ./js srchr/scripts/build.js
    
Open `srchr/srchr.html` in a text editor and change:

    <script src='../steal/steal.js?srchr'>  
    
to

    <script src='../steal/steal.production.js?srchr'>  
    
Open [http://bitovi.github.com/srchr/srchr/srchr.html](srchr/srchr.html) in your browser.

## Documenting

Open a console to the `srchr` folder and run:

    ./js srchr/scripts/docs.js
    
Open `docs/index.html`.


## Deploying

Check out the gh-pages branch in a folder next to your local srchr  master repository like:

    > git clone -b gh-pages git@github.com:bitovi/srchr srchr-pages

In the master repo, run the build, and the documentation scripts.  Then copy everything to srchr-pages with:

    > node copy_to_srchr_pages.js
    
Then cd into srchr-pages, commit any changes, and push them back to the gh-pages branch.
