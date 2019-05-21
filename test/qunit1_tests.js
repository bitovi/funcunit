var QUnit = require("steal-qunit");
var F = require("funcunit");

F.attach(QUnit);

require("test/qunit1_tests/actions_test");
require("test/qunit1_tests/funcunit_test");
require("test/qunit1_tests/iframe_test");
require("test/qunit1_tests/find_closest_test");
require("test/qunit1_tests/open_test");
require("test/qunit1_tests/syn_test");
require("test/qunit1_tests/confirm_test");
require("test/jquery/conflict_test");
