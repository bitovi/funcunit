#!/bin/bash
echo "$TRAVIS_BRANCH"
if [ [["$TRAVIS_BRANCH"] == ["master"]] -o [["$TRAVIS_BRANCH"] == ["gh-pages-deployment-test"]] ]; then
	make
fi