publish-docs:
	git checkout -b gh-pages
	$(MAKE) -C site build
	npm install
	./node_modules/.bin/documentjs -fd
	git add -f docs/
	git add -f guides/
	git add -f site/
	git add -f index.html
	git add -f CNAME
	git commit -m "Publish docs"
	git push -f origin gh-pages
	git checkout -
	git branch -D gh-pages