import QUnit from 'steal-qunit';
import F from 'funcunit';

// F.attach(QUnit);
let beforeEachHasRun = false;

QUnit.module('[Functional] es6 import funcunit', {
	beforeEach(assert) {
		beforeEachHasRun = true;
	},
	afterEach() {
		beforeEachHasRun = false;
	}
});

QUnit.test('before each ran for this test', function (assert) {
	assert.ok(beforeEachHasRun);
});
QUnit.test('before each ran for this test, too', function (assert) {
	assert.ok(beforeEachHasRun);
});
