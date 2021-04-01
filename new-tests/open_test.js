const QUnit = require("steal-qunit");
const F = require("funcunit/new-src/core");

QUnit.module('funcunit open windows', {
    beforeEach: async assert => {
        const done = assert.async();
        // await F.useWindow(`${__dirname}/test-setup/qunit2_tests.html`);
        done();
    }
});

// QUnit.test('F.open accepts a window', async assert => {
//     const done = assert.async();
// 	await F.useWindow(window);
// 	F('#tester').click();
// 	F("#tester").text("Changed", "Changed link")
	
// 	// F.open(frames["myapp"]);
// 	// F("#typehere").type("").type("javascriptmvc")
// 	// F("#seewhatyoutyped").text("typed javascriptmvc","typing");

//     done();
// })

QUnit.test("Back to back opens", async assert => {
    const done = assert.async();

    await F.useWindow(`${__dirname}/test-setup/myotherapp.html`);
    await F.useWindow(`${__dirname}/test-setup/myapp.html`);

	await F("#changelink").click();
	const changed = await F("#changelink").text("Changed","href javascript run");

    assert.ok(changed);

    done();
});


// QUnit.test('Testing win.confirm in multiple pages', function() {
// 	F.open('//test/open/first.html');
// 	F('.next').click();

// 	F('.show-confirm').click();
// 	F.confirm(true);
// 	F('.results').text('confirmed!', "Confirm worked!");
// })