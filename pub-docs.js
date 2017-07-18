var shell = require('shelljs');

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

// git checkout -b gh-pages
checkResultCode(shell.exec('git checkout -b gh-pages'));
// rm -rf node_modules
checkResultCode(shell.rm('-rf', 'node_modules'));
// rm -rf site/node_modules
checkResultCode(shell.rm('-rf', 'site/node_modules'));
// rm -rf docs
checkResultCode(shell.rm('-rf', 'docs'));
// rm -rf guides
checkResultCode(shell.rm('-rf', 'guides'));
// TODO figure out if this is needed
// $(MAKE) -C site build
// npm install
checkResultCode(shell.exec('npm install'));
// ./node_modules/.bin/documentjs --f
checkResultCode(shell.exec('./node_modules/.bin/documentjs --f'));
// git add -f docs/
checkResultCode(shell.exec('git add -f docs/'));
// git add -f guides/
checkResultCode(shell.exec('git add -f guides/'));
// git add -f site/static/
checkResultCode(shell.exec('git add -f site/static/'));
// git add -f examples/
checkResultCode(shell.exec('git add -f examples/'));
// git add -f index.html
checkResultCode(shell.exec('git add -f index.html'));
// git add -f CNAME
checkResultCode(shell.exec('git add -f CNAME'));
// git commit -m "Publish docs"
checkResultCode(shell.exec('git commit -m "Publish docs"'));
// git push -f origin gh-pages
checkResultCode(shell.exec('git push -f origin gh-pages'));
// git checkout -
checkResultCode(shell.exec('git checkout -'));
// git branch -D gh-pages
checkResultCode(shell.exec('git branch -D gh-pages'));

function checkResultCode(code) {
    if(code){
        shell.echo('Build failed at');
        shell.exit(code);
    }
}