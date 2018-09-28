const TypeEnforcement = require('..');

const te = new TypeEnforcement({
  example: {
    foo: Number,
    bar: String
  }
});

const obj = te.normalise('example', {
  foo: undefined,
  bar: undefined
});

console.log(obj);
