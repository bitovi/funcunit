var QUnit = require("steal-qunit2");
var F = require("funcunit");

F.attach(QUnit);

require("test/qunit2_tests/actions_test");
require("test/qunit2_tests/funcunit_test");
require("test/qunit2_tests/iframe_test");
require("test/qunit2_tests/find_closest_test");
require("test/qunit2_tests/open_test");
require("test/qunit2_tests/syn_test");
require("test/qunit2_tests/confirm_test");
require("test/jquery/conflict_test"); // <-- this prevents other tests from running for some reason
