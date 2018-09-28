# TypeEnforcement

<!-- [START badges] -->
<!-- [END badges] -->

##### [API docs](https://github.com/woodger/type-enforcement/docs/api.md) | [examples](https://github.com/woodger/type-enforcement/docs/examples.md)

<!-- [START usecases] -->
TypeEnforcement is a js library for class-based typing.

JavaScript dynamically typed and allows you to declare functions, objects, and variables without declaring a type. Although this feature simplifies the use of the language, it often requires the verification of input data. TypeEnforcement helps verify the types of transmitted values on the runtime.
<!-- [END usecases] -->

## Getting Started

### Installation

To use TypeEnforcement in your project, run:

```bash
npm i type-enforcement

```

### Usage
```js
const TypeEnforcement = require('type-enforcement');

const te = new TypeEnforcement({
  example: {
    foo: Number,
    bar: Array
  }
});

function example(foo, bar) {
  let err = te.validate('example', { foo, bar });

  if (err) {
    throw err;
  }

  return bar.push(foo);
}

example(1, []); // 1
```

## Testing
