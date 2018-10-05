# TypeEnforcement

<!-- [START badges] -->
[![License](https://img.shields.io/npm/l/express.svg)](https://github.com/woodger/type-enforcement/blob/master/LICENSE)
[![Build Status](https://travis-ci.com/woodger/type-enforcement.svg?branch=master)](https://travis-ci.com/woodger/type-enforcement)
[![Coverage Status](https://coveralls.io/repos/github/woodger/type-enforcement/badge.svg)](https://coveralls.io/github/woodger/type-enforcement)
[![Known Vulnerabilities](https://snyk.io/test/github/woodger/type-enforcement/badge.svg?targetFile=package.json)](https://snyk.io/test/github/woodger/type-enforcement?targetFile=package.json)
<!-- [END badges] -->

##### [API docs](#api-docs) | [Examples](https://github.com/woodger/type-enforcement/blob/master/docs/examples.md)

<!-- [START usecases] -->
JavaScript dynamically typed and allows you to declare functions, objects, and variables without declaring a type. Although this feature simplifies the use of the language, it often requires the verification of input data. TypeEnforcement helps verify the types of transmitted values on the runtime.
<!-- [END usecases] -->

<img src="http://yuml.me/diagram/scruffy;dir:LR/class/,[values{bg:cornsilk}]->[rules],[TypeEnforcement]->declaration[rules],[rules]<>->order[validate()],[rules]<>->order[normalise()],[normalise()]->1[values],[normalise()]->0[throw],[validate()]->0[Error{bg:tomato}],[validate()]->1[null{bg:yellowgreen}]">

TypeEnforcement is a js library for class-based typing.

## Getting Started

### Installation

To use TypeEnforcement in your project, run:

```bash
npm i type-enforcement
```

## API docs

### Table of Contents

[class TypeEnforcement](#class-typeenforcement)
  * [constructor: new TypeEnforcement(shema)](#constructor-new-typeenforcementshema)
  * [te.validate(order, doc, [options])](#tevalidateorder-doc-options)
  * [te.normalise(order, doc)](#tenormaliseorder-doc)

#### class: TypeEnforcement

Browser-compatible `TypeEnforcement` class, implemented by following the [ECMAScript® 2018 Language Specification
](https://www.ecma-international.org/ecma-262/9.0/index.html) Standard.

#### constructor: new TypeEnforcement(shema)

- `shema` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> An object is an enumeration of rules of the form `order : rules`  <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>.

In the code there can be more than one validation of the input data, so the rules are grouped into an `order`.

Except for `null` and `undefined`, all [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) values have object equivalents that wrap around the primitive values:
* [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) for string primitive.
* [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) for the number of the primitive.
* [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) for the Boolean primitive.
* [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) for Symbol primitive.

Therefore, primitives can be declared via an object:

```js
const TypeEnforcement = require('type-enforcement');

const te = new TypeEnforcement({
  primitive: {
    string: String,
    number: Number,
    boolean: Boolean,
    symbol: Symbol
  }
});
```

> **NOTE** When using a `undefined` or `null`, an exception will be thrown.

In addition to primitives, you can use [standard built-in objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) and custom class, for example:

```js
const TypeEnforcement = require('type-enforcement');

class MyClass {}

const te = new TypeEnforcement({
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
```

#### te.validate(order, doc, [options])

- `order` <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
- `doc` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> An object is an enumeration of the rules of the form `field: value`, where` field` is the name of the value being validate, described in `shema`.
- `options` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>
  - `skip` <[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)> The `skip` option allows you to check only part of the document. **Default:** `false`.
- returns: <[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)>

Unlike the [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) operator, this method validate if the value of the `constructor.prototype` rule matches only on the current `prototype` If all the values of the fields correspond to the scheme, then returns `null` otherwise returns an `error`.

```js
const TypeEnforcement = require('type-enforcement');

const te = new TypeEnforcement({
  '#example()': {
    foo: Number,
    bar: Array
  }
});

function example(foo, bar) {
  let err = te.validate('#example()', { foo, bar });

  if (err) {
    throw err;
  }

  return bar.push(foo);
}

try {
  example('1', []);
}
catch(e) {
  console.log(e.message); // Invalid value 'foo' in order 'example'. Expected Number
}
```

The `skip` option allows you to check only part of the document, for example:

```js
const TypeEnforcement = require('type-enforcement');

const te = new TypeEnforcement({
  '#example()': {
    foo: Number,
    bar: Array
  }
});

function example(foo, bar) {
  let err = te.validate('#example()', { foo }, { skip: true });

  if (err) {
    throw err;
  }

  return bar.push(foo);
}

example(1, []); // 1
```

In the example above, the `bar` field is omitted.

#### te.normalise(order, doc)

- `order` <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
- `doc` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> An object is an enumeration of the rules of the form `field: value`, where` field` is the name of the value being validate, described in `shema`.
- returns: <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>

To normalize [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) types, properties of object analogs `Primitive(value)` are used and a [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive). For other objects, an instance is created with the given value transferred to the `constructor.prototype`, namely: `new Class(value)`. The following example demonstrates the usefulness of `te.normalise(order, doc)` when using internetwork interoperability of applications.

```js
// Create document
let obj = {
  boo: true,
  now: new Date()
};

let pack = JSON.stringify(obj);
// '{"boo":true,"now":"2018-09-26T10:38:08.033Z"}'
//                    ^^^
//                    this is a string type

// ================ interworking ================

const TypeEnforcement = require('type-enforcement');

// Declaring rules
const te = new TypeEnforcement({
  example: {
    boo: Boolean,
    now: Date
  }
});

let json = JSON.parse(pack);
// {boo: true, now: "2018-09-26T10:38:08.033Z"}
//                    ^^^
//                    it's still a string type

let doc = te.normalise('example', json);
// { boo: true, now: 2018-09-26T10:35:41.345Z }
//                    ^^^
//                    this date type

console.log(doc);
```

The `undefined` is a property of the global object; i.e., it is a variable in global scope. The initial value of `undefined` is the [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) value `undefined`. Note the following example:

```js
Number(undefined); // NaN
Number(); // 0
```

In the author's opinion, such behavior is useful. The following example will demonstrate this behavior.

```js
const TypeEnforcement = require('type-enforcement');

const te = new TypeEnforcement({
  example: {
    foo: Number,
    bar: String
  }
});

let doc = te.normalise(example, {
  foo: undefined,
  bar: undefined
});

console.log(doc); // { foo: 0, bar: '' }
```

##### [More examples](examples.md)
