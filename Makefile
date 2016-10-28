publish-docs:
	git checkout -b gh-pages
	git config --global user.email "travis@bitovi.com"
	git config --global user.name "Travis CI"
	rm -rf node_modules
	rm -rf site/node_modules
	rm -rf docs
	rm -rf guides
	$(MAKE) -C site build
	npm install
	./node_modules/.bin/documentjs --f
	git add -f docs/
	git add -f guides/
	git add -f site/
	git add -f examples/
	git add -f index.html
	git add -f CNAME
	git commit -m "Publish docs"
	git push -f origin gh-pages
	git checkout -
	git branch -D gh-pages