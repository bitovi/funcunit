var selector;
var traversers = [
  "closest",
  "next",
  "prev",
  "siblings",
  "last",
  "first",
  "find"
];

module('funcunit - Selector', {
  setup: function() {
    selector = new F.Selector({
      action: '$',
      selector: '#foo'
    });
  }
});

test('Traverse functions are Selector\'s methods', function() {
  for (var i=0, l=traversers.length; i<l; i++) {
    ok(
      traversers[i] in selector,
      'Selector\'s instance has `' + traversers[i] + '` method'
    );
  }
});

test('Traverse methods create proper Selector instances', function() {
  var childSelector;
  for (var i=0, l=traversers.length; i<l; i++) {
    childSelector = selector[traversers[i]]('.bar');
    ok(
      childSelector.action === traversers[i],
      'Selector\'s instance created with `' +
        traversers[i] + '` method has proper `action` field'
    );

    ok(
      childSelector.parent === selector,
      'Selector\'s instance created with `' +
        traversers[i] + '` method has proper parent reference'
    )
  }
});

test('Return proper elements when retraversing the DOM', function() {

  $('#qunit-fixture').append(
    $(
      '<span id="foo">' +
        '<span class="container">' +
          '<div class="bar"></div>' +
          '<div class="bar"></div>' +
          '<div class="bar"></div>' +
        '</span>' +
      '</span>'
    )
  );

  selector = new F.Selector({
    action: '$',
    selector: '#qunit-fixture'
  });

  var container = selector.find('.container');
  var foo = container.closest('#foo');
  var bar = foo.find('.bar');
  ok(
    bar.reselect().size() === 3,
    'proper number of elements returned'
  );

  // remove elements from the DOM and try again
  $('.bar').remove();
  ok(
    bar.reselect().size() === 0,
    'proper number of elements returned after the DOM have changed'
  );
});
