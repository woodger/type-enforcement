const assert = require('assert');
const {describe, it} = require('mocha');
const TypeEnforcement = require('..');



describe(`class TypeEnforcement`, () => {
  describe(`constructor: new TypeEnforcement(shema)`, () => {
    it(`A required argument for the constructor is an object type`, () => {
      assert.throws(() => {
        return new TypeEnforcement();
      });
    });

    it(`The object passed to the constructor must be frozen`, () => {
      let rules = {};
      let te = new TypeEnforcement(rules);
      let equal = Object.is(rules, te.rules);
      let frozen = Object.isFrozen(te.rules);

      assert(equal && frozen);
    });

    it(`An object is a required value to the rule`, () => {
      assert.throws(() => {
        return new TypeEnforcement({
          test: undefined
        });
      });
    });

    it(`Class is a required value to the declaration`, () => {
      assert.throws(() => {
        return new TypeEnforcement({
          test: {
            field: undefined
          }
        });
      });
    });
  });


  describe(`te.validate(order, doc, [options])`, () => {
    describe(`One rule without fields`, () => {
      const te = new TypeEnforcement({
        test: {}
      });

      it(`A validation call without arguments returns an error`, () => {
        let err = te.validate();
        assert(err instanceof Error);
      });

      it(`The first argument is a string type`, () => {
        let err = te.validate(null);

        assert(err instanceof Error);
        assert(err.message === `Unexpected argument or 'undefined' or 'null'`);
      });

      it(`The second argument is a document the object type`, () => {
        let err = te.validate('test', null);
        assert(err instanceof Error);
      });

      it(`An empty document will pass validation`, () => {
        let err = te.validate('test', {});
        assert.ifError(err);
      });

      it(`The rule should contain`, () => {
        let err = te.validate('unknown', {});
        
        assert(err instanceof Error);
        assert(err.message === `Order 'unknown' not found`);
      });
    });


    describe(`Use primitives, standard built-in objects and custom class`, () => {
      const te = new TypeEnforcement({
        test: {
          s: String,
          a: Array,
          m: Map
        }
      });

      it(`A document with missing fields will not pass the test`, () => {
        let err = te.validate('test', {
          s: '',
          a: []
        });

        assert(err instanceof Error);
      });

      it(`'undefined' type does not pass validation`, () => {
        let err = te.validate('test', {
          s: undefined,
          a: [],
          m: new Map()
        });

        assert(err instanceof Error);
      });

      it(`'null' type does not pass validation`, () => {
        let err = te.validate('test', {
          s: null,
          a: [],
          m: new Map()
        });

        assert(err instanceof Error);
      });

      it(`Document with missing fields and options 'skip' pass validation`, () => {
        let err = te.validate('test', {
          s: '',
          a: []
        }, {
          skip: true
        });

        assert.ifError(err);
      });

      it(`Document with unexpected fields fails the test`, () => {
        let err = te.validate('test', {
          s: '',
          a: [],
          m: new Map(),
          u: 'is unexpected field'
        });

        assert(err instanceof Error);
      });

      it(`A document with an incorrect field type does not pass the test`, () => {
        let err = te.validate('test', {
          s: 1,
          a: [],
          m: new Map()
        });

        assert(err instanceof Error);
      });
    });
  });


  describe(`te.normalise(order, doc)`, function () {
    describe(`One rule without fields`, function () {
      const te = new TypeEnforcement({
        test: {}
      });

      it(`A validation call without arguments should throw an exception`, () => {
        assert.throws(() => {
          te.normalise();
        });
      });

      it(`Get throw, if the first argument is not a string type`, () => {
        assert.throws(() => {
          te.normalise(null);
        });
      });

      it(`The second argument is a document the object type`, () => {
        assert.throws(() => {
          te.normalise('test', null);
        });
      });

      it(`The rule should contain, else should throw an exception`, () => {
        assert.throws(() => {
          te.normalise('unknown', {});
        });
      });

      it(`An empty document is mapped to a schema without fields`, () => {
        let doc = {};
        let obj = te.normalise('test', doc);

        assert.strictEqual(obj, doc);
      });
    });


    describe(`Use primitives, standard built-in objects and custom class`, () => {
      class Foo {}

      const te = new TypeEnforcement({
        test: {
          s: String,
          n: Number,
          a: Array,
          f: Function,
          c: Foo
        }
      });

      it(`Document with unexpected fields should throw an exception`, () => {
        assert.throws(() => {
          te.normalise('test', {
            s: '',
            n: 1,
            a: [],
            f: () => {},
            c: new Foo(),
            u: '... some data'
          });
        });
      });

      it(`A document with incorrect value types must be mapped to a schema`, () => {
        let doc = te.normalise('test', {
          s: undefined,
          n: '1',
          a: 4,
          f: undefined,
          c: []
        });

        assert.strictEqual(doc.s, '');
        assert.strictEqual(doc.n, 1);
        assert.strictEqual(doc.a.length, 4);
        assert.strictEqual(typeof doc.f, 'function');
        assert.strictEqual(doc.c instanceof Foo, true);
      });
    });
  });
});
