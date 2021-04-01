const QUnit = require("steal-qunit");
const F = require("funcunit/new-src/core");

QUnit.module('funcunit actions', {
    beforeEach: async assert => {
        const done = assert.async();
        await F.useWindow(`${__dirname}/test-setup/qunit2_tests.html`);
        done();
    }
});


// Click Events --------------------

QUnit.test('click', async assert => {
    const done = assert.async();
    const element = await F('#foo').click();
    assert.ok(element.classList.contains('iWasClicked'), '#foo was clicked');
    done();
});

QUnit.test('right click', async assert => {
    const done = assert.async();
    const element = await F('#foo').rightClick();
    assert.ok(element.classList.contains('iWasRightClicked'), '#foo was right clicked');
    done();
});

QUnit.test('double click', async assert => {
    const done = assert.async();
    const element = await F('#foo').dblClick();
    assert.ok(element.classList.contains('iWasDoubleClicked'), '#foo was double clicked');
    done();
});


// Scroll --------------------

QUnit.test('scroll down', async assert => {
    const done = assert.async();
    await F.useWindow(`${__dirname}/test-setup/scroll.html`);
    const element = await F('#scrolldiv').scroll('top', 100);
    assert.equal(100, element.scrollTop, 'scroll vertical worked');
    const scrollTopValue = await F('#scrolldiv').scrollTop();
    assert.equal(100, scrollTopValue, 'scrollTop getter worked');
    done();
});

QUnit.test('scroll right', async assert => {
    const done = assert.async();
    await F.useWindow(`${__dirname}/test-setup/scroll.html`);
    const element = await F('#scrolldiv').scroll('right', 100);
    assert.equal(100, element.scrollLeft, 'scroll horizontal worked');
    const scrollLeftValue = await F('#scrolldiv').scrollLeft();
    assert.equal(100, scrollLeftValue, 'scrollLeft getter worked');
    done();
});


// Drag & Move Events --------------------

QUnit.test('drag', async assert => {
    const done = assert.async();

    await F.useWindow(`${__dirname}/test-setup/drag.html`);

    await F('#drag').drag('#drop');
    await F('#clicker').click();
    const dragged = await F('.status').text('dragged', 'drag worked correctly');
    assert.ok(dragged);

    done();
});

QUnit.test('move', async assert => {
    const done = assert.async();

    await F.useWindow(`${__dirname}/test-setup/drag.html`);

    await F('#start').move('#end');
    await F('#typer').type('javascriptmvc');
    const moved = await F('#typer').val('javascriptmvc', 'move worked correctly');
    assert.ok(moved);

    done();
});


// Keyboard Events --------------------

QUnit.test('type', async assert => {
    const done = assert.async();
    const textToType = 'hello type';
    const element = await F('#typehere').type(textToType);
    assert.equal(textToType, element.value, 'typed text matches');
    assert.ok(element.classList.contains('iWasClicked'), 'the element was clicked');
    done();
});

QUnit.test('send keys', async assert => {
    const done = assert.async();
    const keysToSend = 'hello sendKeys';
    const element = await F('#typehere').sendKeys(keysToSend);
    assert.equal(keysToSend, element.value, 'sent keys matches');
    assert.ok(!element.classList.contains('iWasClicked'), 'the element was not clicked');
    done();
});



