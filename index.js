const trc = require('./trc');



const error = (errno, ...yarn) => {
  let i = 0;
  let msg = trc.errorMessage[errno].replace(/%&/g, () => {
    return yarn[i++];
  });

  return new TypeError(msg);
};

const objectsPrimitive = [
  String,
  Number,
  Boolean,
  Symbol
];

const is = {
  object(a) {
    return a !== void 0 && a !== null && typeof a === 'object';
  },

  string(a) {
    return a !== void 0 && a !== null && typeof a === 'string';
  }
};

const enforcement = {
  validate(Obj, value) {
    if (value === void 0 || value === null) {
      return false;
    }

    return Object.getPrototypeOf(value) === Obj.prototype;
  },

  normalise(Obj, value) {
    if (objectsPrimitive.includes(Obj)) {
      if (value === void 0) {
        return Obj();
      }

      return Obj(value);
    }

    if (value === void 0) {
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
      let sample = rules[i];

      if (is.object(sample) === false) {
        throw error(1, i);
      }

      let names = Object.keys(sample);

      for (let i of names) {
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

    let fields = Object.keys(doc);
    let rule = this.rules[order];
    let map = this.map[order];

    if (skip === false) {
      let missing = map.filter((i) => {
        return fields.indexOf(i) === -1;
      });

      if (missing.length > 0) {
        return error(4, missing, order);
      }
    }

    let redundant = fields.filter((i) => {
      return map.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      return error(5, redundant, order);
    }

    for (let i of fields) {
      let Obj = rule[i];
      let value = doc[i];

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

    let fields = Object.keys(doc);
    let rule = this.rules[order];
    let map = this.map[order];

    let redundant = fields.filter((i) => {
      return map.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      throw error(5, redundant, order);
    }

    for (let i of fields) {
      let Obj = rule[i];
      let value = doc[i];

      doc[i] = enforcement.normalise(Obj, value);
    }

    return doc;
  }
}

module.exports = TypeEnforcement;
