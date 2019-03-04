/**
 * This module for Node.js® implemented by following the ECMAScript® 2018
 * Language Specification Standard.
 *
 * https://www.ecma-international.org/ecma-262/9.0/index.html
 */

const basic = require('./basic');

const error = (errno, ...yarn) => {
  let i = 0;
  const message = basic.errorMessage[errno].replace(/%&/g, () => {
    return yarn[i++];
  });

  return new TypeError(message);
};

const objectsPrimitive = [
  String,
  Number,
  Boolean,
  Symbol
];

const is = {
  object(value) {
    return value !== undefined && value !== null && typeof value === 'object';
  },

  string(value) {
    return value !== undefined && value !== null && typeof value === 'string';
  }
};

const enforcement = {
  validate(Obj, value) {
    if (value === undefined || value === null) {
      return false;
    }

    return Object.getPrototypeOf(value) === Obj.prototype;
  },

  normalise(Obj, value) {
    if (objectsPrimitive.includes(Obj)) {
      if (value === undefined) {
        return Obj();
      }

      return Obj(value);
    }

    if (value === undefined) {
      return new Obj();
    }

    return new Obj(value);
  }
};

class TypeEnforcement {
  constructor(rules) {
    if (is.object(rules) === false) {
      throw error(0);
    }

    Object.freeze(rules);

    const map = {};

    Object.keys(rules).forEach((i) => {
      const sample = rules[i];

      if (is.object(sample) === false) {
        throw error(1, i);
      }

      const names = Object.keys(sample);

      for (const i of names) {
        if (sample[i] === undefined || sample[i] === null) {
          throw error(2, i);
        }

        if (typeof sample[i].prototype.constructor !== 'function') {
          throw error(3, i);
        }
      }

      map[i] = names;
    });

    this.rules = rules;
    this.map = map;
  }

  validate(order, doc, {skip = false} = {}) {
    if (is.string(order) === false || is.object(doc) === false) {
      return error(0);
    }

    if (this.map.hasOwnProperty(order) === false) {
      return error(3, order);
    }

    const fields = Object.keys(doc);
    const rule = this.rules[order];
    const map = this.map[order];

    if (skip === false) {
      const missing = map.filter((i) => {
        return fields.indexOf(i) === -1;
      });

      if (missing.length > 0) {
        return error(4, missing, order);
      }
    }

    const redundant = fields.filter((i) => {
      return map.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      return error(5, redundant, order);
    }

    for (const i of fields) {
      const Obj = rule[i];
      const value = doc[i];

      if (enforcement.validate(Obj, value) === false) {
        return error(6, i, order, Obj.name);
      }
    }

    return null;
  }

  normalise(order, doc) {
    if (is.string(order) === false || is.object(doc) === false) {
      throw error(0);
    }

    if (this.map.hasOwnProperty(order) === false) {
      throw error(3, order);
    }

    const fields = Object.keys(doc);
    const rule = this.rules[order];
    const map = this.map[order];

    const redundant = fields.filter((i) => {
      return map.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      throw error(5, redundant, order);
    }

    for (const i of fields) {
      const Obj = rule[i];
      const value = doc[i];

      doc[i] = enforcement.normalise(Obj, value);
    }

    return doc;
  }
}

module.exports = TypeEnforcement;
