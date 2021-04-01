const QUnit = require("steal-qunit");
const F = require("funcunit/new-src/core");

QUnit.module('funcunit dialogs', {
    beforeEach: async assert => {
        const done = assert.async();
        await F.useWindow(`${__dirname}/test-setup/confirm.html`);
        done();
    }
});

// funcunit sets text for the next dialog
// F.confirm('confirm text');

QUnit.test('window alert', async assert => {
    const done = assert.async();

    await F('#alert').click();
    const alerted = await F('#alert').text('I was alerted', 'window.alert overridden');
    assert.ok(alerted, 'window alert dialog was overridden');

    done();
});

QUnit.test('window confirm', async assert => {
    const done = assert.async();

    await F('#confirm').click();
    const confirmed = await F('#confirm').text('I was confirmed', 'window.confirm overridden');
    assert.ok(confirmed, 'window confirm dialog was overridden');

    done();
});

QUnit.test('window prompt', async assert => {
    const done = assert.async();

    await F('#prompt').click();
    const prompted = await F('#prompt').text('I was prompted', 'window.prompt overridden');
    assert.ok(prompted, 'window prompt dialog was overridden');

    done();
});
