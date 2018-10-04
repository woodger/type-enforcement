## Examples

### [te.validate(order, doc, [options])](https://github.com/woodger/type-enforcement#tevalidateorder-doc-options)

This example shows the work of a larger list of values that are grouped into groups: [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), [standard built-in objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) and custom class.

```js
const TypeEnforcement = require('type-enforcement');

class MyClass {}

const te = new TypeEnforcement({
  '#primitive': {
    string: String,
    number: Number,
    boolean: Boolean,
    symbol: Symbol
  },
  '#inline': {
    object: Object,
    invoke: Function,
    regexp: RegExp,
    array: Array,
    date: Date,
    error: Error,
    promise: Promise
  },
  '#custom': {
    class: MyClass
  }
});



example('#primitive', {
  string: '',
  number: 1,
  boolean: true,
  symbol: Symbol()
});

example('#inline', {
  object: {},
  invoke: () => {},
  regexp: /\d/,
  array: [],
  date: new Date(),
  error: new Error('error description'),
  promise: new Promise(() => {})
});

example('#custom', {
  class: new MyClass()
});



function example(order, doc) {
  let err = te.validate(order, doc);

  if (err === null) {
    console.log(`'${order}' values correspond to declared types`);
  }
  else {
    throw err;
  }
}
```
