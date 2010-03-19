steal
  .plugins("funcunit/qunit")
  .apps("funcunit")
  .then("tests/basic")
  .then("../../synthetic//synthetic.js")
  .then("../../synthetic/test/qunit/synthetic_test.js")
