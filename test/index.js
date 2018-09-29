const assert = require('assert').strict;
const TypeEnforcement = require('..');




describe(`new TypeEnforcement()`, function() {
  it(`A required argument for the constructor is an object type`, function() {
    assert.throws(() => {
      new TypeEnforcement();
    });
  });


  it(`The object passed to the constructor must be frozen`, function() {
    let rules = {};
    let te = new TypeEnforcement(rules);
    let equal = Object.is(rules, te.rules);
    let frozen = Object.isFrozen(te.rules);

    assert(equal && frozen);
  });


  it(`An object is a required value to the rule`, function() {
    assert.throws(() => {
      new TypeEnforcement({
        test: undefined
      });
    });
  });
});
