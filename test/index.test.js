const assert = require('assert')
const { describe, it } = require('mocha')
const TypeEnforcement = require('..')

describe(`class TypeEnforcement`, function () {
  describe(`constructor: new TypeEnforcement(shema)`, function () {
    it(`A required argument for the constructor is an object type`, function () {
      assert.throws(() => {
        new TypeEnforcement()
      })
    })

    it(`The object passed to the constructor must be frozen`, function () {
      let rules = {}
      let te = new TypeEnforcement(rules)
      let equal = Object.is(rules, te.rules)
      let frozen = Object.isFrozen(te.rules)

      assert(equal && frozen)
    })

    it(`An object is a required value to the rule`, function () {
      assert.throws(() => {
        new TypeEnforcement({
          test: undefined
        })
      })
    })

    it(`Class is a required value to the declaration`, function () {
      assert.throws(() => {
        new TypeEnforcement({
          test: {
            field: undefined
          }
        })
      })
    })
  })

  describe(`te.validate(order, doc, [options])`, function () {
    describe(`One rule without fields`, function () {
      const te = new TypeEnforcement({
        test: {}
      })

      it(`A validation call without arguments returns an error`, function () {
        assert(te.validate())
      })

      it(`The first argument is a string type`, function () {
        assert(te.validate(null))
      })

      it(`The second argument is a document the object type`, function () {
        assert(te.validate('test', null))
      })

      it(`The rule should contain`, function () {
        assert(te.validate('unknown', {}))
      })

      it(`An empty document will pass validation`, function () {
        assert.ifError(te.validate('test', {}))
      })
    })

    describe(`Use primitives, standard built-in objects and custom class`, function () {
      const te = new TypeEnforcement({
        test: {
          s: String,
          a: Array,
          m: Map
        }
      })

      it(`A document with missing fields will not pass the test`, function () {
        assert(te.validate('test', {
          s: '',
          a: []
        }))
      })

      it(`'undefined' type does not pass validation`, function () {
        assert(te.validate('test', {
          s: undefined,
          a: [],
          m: new Map()
        }))
      })

      it(`'null' type does not pass validation`, function () {
        assert(te.validate('test', {
          s: null,
          a: [],
          m: new Map()
        }))
      })

      it(`Document with missing fields and options 'skip' pass validation`, function () {
        assert.ifError(te.validate('test', {
          s: '',
          a: []
        }, {
          skip: true
        }))
      })

      it(`Document with unexpected fields fails the test`, function () {
        assert(te.validate('test', {
          s: '',
          a: [],
          m: new Map(),
          u: 'is unexpected field'
        }))
      })

      it(`A document with an incorrect field type does not pass the test`, function () {
        assert(te.validate('test', {
          s: 1,
          a: [],
          m: new Map()
        }))
      })
    })
  })

  describe(`te.normalise(order, doc)`, function () {
    describe(`One rule without fields`, function () {
      const te = new TypeEnforcement({
        test: {}
      })

      it(`A validation call without arguments should throw an exception`, function () {
        assert.throws(() => {
          te.normalise()
        })
      })

      it(`Get throw, if the first argument is not a string type`, function () {
        assert.throws(() => {
          te.normalise(null)
        })
      })

      it(`The second argument is a document the object type`, function () {
        assert.throws(() => {
          te.normalise('test', null)
        })
      })

      it(`The rule should contain, else should throw an exception`, function () {
        assert.throws(() => {
          te.normalise('unknown', {})
        })
      })

      it(`An empty document is mapped to a schema without fields`, function () {
        let doc = {}

        assert.strictEqual(te.normalise('test', doc), doc)
      })
    })

    describe(`Use primitives, standard built-in objects and custom class`, function () {
      class Foo {}

      const te = new TypeEnforcement({
        test: {
          s: String,
          n: Number,
          a: Array,
          f: Function,
          c: Foo
        }
      })

      it(`Document with unexpected fields should throw an exception`, function () {
        assert.throws(() => {
          te.normalise('test', {
            s: '',
            n: 1,
            a: [],
            f: () => {},
            c: new Foo(),
            u: '... some data'
          })
        })
      })

      it(`A document with incorrect value types must be mapped to a schema`, function () {
        let doc = te.normalise('test', {
          s: undefined,
          n: '1',
          a: 4,
          f: undefined,
          c: []
        })

        assert.strictEqual(doc.s, '')
        assert.strictEqual(doc.n, 1)
        assert.strictEqual(doc.a.length, 4)
        assert.strictEqual(typeof doc.f, 'function')
        assert.strictEqual(doc.c instanceof Foo, true)
      })
    })
  })
})
