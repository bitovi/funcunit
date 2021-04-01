const QUnit = require("steal-qunit");
const F = require("funcunit/new-src/core");

QUnit.module("funcunit getters",{
	beforeEach: async function(assert) {
		const done = assert.async();
		await F.useWindow(__dirname+"/test-setup/qunit2_tests.html");
		done();
	}
});


// height, innerHeight, outerHeight/margin
QUnit.test('get and compare height', async assert => {
    const done = assert.async();

    const elementHeight = await F('#dimensions-div').height();
    assert.equal(8, elementHeight);

    const heightComparison = await F('#dimensions-div').height(elementHeight);
    assert.ok(heightComparison);

    done();
});

QUnit.test('get and compare innerHeight', async assert => {
    const done = assert.async();

    const elementInnerHeight = await F('#dimensions-div').innerHeight();
    assert.equal(10, elementInnerHeight);

    const heightComparison = await F('#dimensions-div').innerHeight(elementInnerHeight);
    assert.ok(heightComparison);

    done();
});

QUnit.test('get and compare outerHeight', async assert => {
    const done = assert.async();

    const elementOuterHeight = await F('#dimensions-div').outerHeight();
    assert.equal(12, elementOuterHeight);

    const heightComparison = await F('#dimensions-div').outerHeight(elementOuterHeight);
    assert.ok(heightComparison);

    const elementOuterHeightMargin = await F('#dimensions-div').outerHeight(true);
    assert.equal(14, elementOuterHeightMargin);

    const heightComparisonMargin = await F('#dimensions-div').outerHeight(elementOuterHeightMargin, true);
    assert.ok(heightComparisonMargin);

    done();
});


// width, innerWidth, outerWidth(margin)
QUnit.test('get and compare width', async assert => {
    const done = assert.async();

    const elementwidth = await F('#dimensions-div').width();
    assert.equal(18, elementwidth);

    const widthComparison = await F('#dimensions-div').width(elementwidth);
    assert.ok(widthComparison);

    done();
});

QUnit.test('get and compare innerWidth', async assert => {
    const done = assert.async();

    const elementInnerWidth = await F('#dimensions-div').innerWidth();
    assert.equal(20, elementInnerWidth);

    const widthComparison = await F('#dimensions-div').innerWidth(elementInnerWidth);
    assert.ok(widthComparison);

    done();
});

QUnit.test('get and compare outerWidth', async assert => {
    const done = assert.async();

    const elementOuterWidth = await F('#dimensions-div').outerWidth();
    assert.equal(22, elementOuterWidth);

    const widthComparison = await F('#dimensions-div').outerWidth(elementOuterWidth);
    assert.ok(widthComparison);

    const elementOuterWidthMargin = await F('#dimensions-div').outerWidth(true);
    assert.equal(24, elementOuterWidthMargin);

    const widthComparisonMargin = await F('#dimensions-div').outerWidth(elementOuterWidthMargin, true);
    assert.ok(widthComparisonMargin);

    done();
});


// Scroll
QUnit.test('get and compare scrollTop', async assert => {
    const done = assert.async();

    await F.useWindow(`${__dirname}/test-setup/scroll.html`);
    await F('#innerdiv').click(); // autoscrolls 100px

    const elementScrollTop = await F('#scrolldiv').scrollTop();
    assert.equal(100, elementScrollTop);

    const scrollComparison = await F('#scrolldiv').scrollTop(100);
    assert.ok(scrollComparison);

    done();
});

QUnit.test('get and compare scrollLeft', async assert => {
    const done = assert.async();

    await F.useWindow(`${__dirname}/test-setup/scroll.html`);
    await F('#innerdiv').click(); // autoscrolls 100px

    const elementScrollTop = await F('#scrolldiv').scrollLeft();
    assert.equal(100, elementScrollTop);

    const scrollComparison = await F('#scrolldiv').scrollLeft(100);
    assert.ok(scrollComparison);

    done();
});


// visible
QUnit.test('element is visible', async assert => {
    const done = assert.async();

    const isVisible = await F('.baz').visible();
    assert.ok(isVisible);

    done();
});

