const assert = require('assert');
const TypeEnforcement = require('..');

describe('class TypeEnforcement', () => {
  describe('constructor: new TypeEnforcement(shema)', () => {
    it('A required argument for the constructor is an object type', () => {
      try {
        new TypeEnforcement();
      }
      catch (err) {
        assert(err.message === "Unexpected argument or 'undefined' or 'null'");
      }
    });

    it('The object passed to the constructor must be frozen', () => {
      const rules = {};
      const te = new TypeEnforcement(rules);
      const equal = Object.is(rules, te.rules);
      const frozen = Object.isFrozen(te.rules);

      assert(equal === true);
      assert(frozen === true);
    });

    it('An object is a required value to the rule', () => {
      try {
        new TypeEnforcement({
          test: undefined
        });
      }
      catch (err) {
        assert(
          err.message === "Unexpected sample 'test' or 'undefined' or 'null'"
        );
      }
    });

    it('Object is a required value to the declaration', () => {
      try {
        new TypeEnforcement({
          test: {
            foo: undefined
          }
        });
      }
      catch (err) {
        assert(err.message ===
          "The prototype object 'foo' must have a constructor function"
        );
      }
    });

    it('The prototype object must have a constructor function', () => {
      try {
        class Foo {}

        Foo.prototype.constructor = null;

        new TypeEnforcement({
          test: {
            foo: Foo
          }
        });
      }
      catch (err) {
        assert(err.message === "Order 'foo' not found");
      }
    });
  });

  describe('te.validate(order, values, [options])', () => {
    describe('One rule without fields', () => {
      const te = new TypeEnforcement({
        test: {}
      });

      it('A validation call without arguments returns an error', () => {
        const err = te.validate();
        assert(err instanceof TypeError);
      });

      it('The first argument is a string type', () => {
        const err = te.validate(null);
        assert(err instanceof TypeError);
      });

      it('The second argument is a document the object type', () => {
        const err = te.validate('test', null);
        assert(err instanceof TypeError);
      });

      it('An empty document will pass validation', () => {
        const err = te.validate('test', {});
        assert(err === null);
      });

      it('The rule should contain', () => {
        const err = te.validate('unknown', {});
        assert(err instanceof TypeError);
      });
    });

    describe('Use primitives, standard built-in objects and custom class',
    () => {
      const te = new TypeEnforcement({
        test: {
          s: String,
          a: Array,
          m: Map,
          i: BigInt
        }
      });

      it('A document with missing fields will not pass the test', () => {
        const err = te.validate('test', {
          s: '',
          a: []
        });

        assert(err instanceof TypeError);
      });

      it("'undefined' type does not pass validation", () => {
        const err = te.validate('test', {
          s: undefined,
          a: [],
          m: new Map()
        });

        assert(err instanceof TypeError);
      });

      it("'null' type does not pass validation", () => {
        const err = te.validate('test', {
          s: null,
          a: [],
          m: new Map(),
          i: 9007199254740992n
        });

        assert(err instanceof TypeError);
        assert(
          err.message === "Invalid value 's' in order 'test'. Expected String"
        );
      });

      it("Document with missing fields and options 'skip' pass validation",
      () => {
        const err = te.validate('test', {
          s: '',
          a: []
        }, {
          skip: true
        });

        assert.ifError(err);
      });

      it('Document with unexpected fields fails the test', () => {
        const err = te.validate('test', {
          s: '',
          a: [],
          m: new Map(),
          u: 'is unexpected field'
        });

        assert(err instanceof TypeError);
      });

      it('A document with an incorrect field type does not pass the test',
      () => {
        const err = te.validate('test', {
          s: 1,
          a: [],
          m: new Map()
        });

        assert(err instanceof TypeError);
      });
    });
  });

  describe('te.normalise(order, values)', () => {
    describe('One rule without fields', () => {
      const te = new TypeEnforcement({
        test: {}
      });

      it('A validation call without arguments should throw an exception',
      () => {
        try {
          te.normalise();
        }
        catch (err) {
          assert(
            err.message === "Unexpected argument or 'undefined' or 'null'"
          );
        }
      });

      it('Get throw, if the first argument is not a string type', () => {
        try {
          te.normalise(null);
        }
        catch (err) {
          assert(
            err.message === "Unexpected argument or 'undefined' or 'null'"
          );
        }
      });

      it('The second argument is a document the object type', () => {
        try {
          te.normalise('test', null);
        }
        catch (err) {
          assert(
            err.message === "Unexpected argument or 'undefined' or 'null'"
          );
        }
      });

      it('The rule should contain, else should throw an exception', () => {
        try {
          te.normalise('unknown', {});
        }
        catch (err) {
          assert(err.message === "Order 'unknown' not found");
        }
      });

      it('An empty document is mapped to a schema without fields', () => {
        const values = {};
        const doc = te.normalise('test', values);

        assert.strictEqual(doc, values);
      });
    });

    describe('Use primitives, standard built-in objects and custom class',
    () => {
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

      it('Document with unexpected fields should throw an exception', () => {
        try {
          te.normalise('test', {
            s: '',
            n: 1,
            a: [],
            f: () => {},
            c: new Foo(),
            u: '... some data'
          });
        }
        catch (err) {
          assert(err.message === "Redundant fields 'u' in order 'test'");
        }
      });

      it('A document with incorrect value types must be mapped to a schema',
      () => {
        const doc = te.normalise('test', {
          s: undefined,
          n: '1',
          a: 4,
          f: undefined,
          c: []
        });

        assert(doc.s === '');
        assert(doc.n === 1);
        assert(doc.a.length === 4);
        assert(typeof doc.f === 'function');
        assert(doc.c instanceof Foo);
      });
    });
  });
});
