const TypeEnforcement = require('..');

class MyClass {}



const te = new TypeEnforcement({
  primitive: {
    string: String,
    number: Number,
    boolean: Boolean,
    symbol: Symbol
  },
  inline: {
    object: Object,
    invoke: Function,
    regexp: RegExp,
    array: Array,
    date: Date,
    error: Error,
    promise: Promise
  },
  custom: {
    class: MyClass
  }
});



example('primitive', {
  string: '',
  number: 1,
  boolean: true,
  symbol: Symbol()
});

example('inline', {
  object: {},
  invoke: () => {},
  regexp: /\d/,
  array: [],
  date: new Date(),
  error: new Error('error description'),
  promise: new Promise(() => {})
});

example('custom', {
  class: new MyClass()
});



function example(rule, docs) {
  let err = te.validate(rule, docs);

  if (err === null) {
    console.log(`${rule} values correspond to declared types`);
  }
  else {
    throw err;
  }
}
