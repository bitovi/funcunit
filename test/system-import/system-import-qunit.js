import QUnit from 'steal-qunit';

System.import('funcunit').then(function (F) {
	// F.attach(QUnit);
	let beforeEachHasRun = false;

	QUnit.module('[Functional] System.import funcunit', {
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
});
