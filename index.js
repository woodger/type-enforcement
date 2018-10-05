const trc = require('./trc');



const globalObjectsPrimitiveType = [
  String,
  Number,
  Boolean,
  Symbol
];

const regExpSharp = /#&/g;

const error = (errno, ...yarn) => {
  let i = 0;
  let msg = trc.errtmpl[errno].replace(regExpSharp, () =>
    yarn[i++]
  );

  return new Error(msg);
};

const is = {
  object (a) {
    return a !== undefined && a !== null && typeof a === 'object';
  },

  string (a) {
    return a !== undefined && a !== null && typeof a === 'string';
  }
};

const enforcement = {
  validate (Class, value) {
    if (value === undefined || value === null) {
      return false;
    }

    if (globalObjectsPrimitiveType.includes(Class)) {
      return typeof value === Class.name.toLowerCase();
    }

    return value.__proto__ === Class.prototype;
  },

  normalise (Class, value) {
    if (globalObjectsPrimitiveType.includes(Class)) {
      if (value === undefined) {
        return Class();
      }

      return Class(value);
    }

    if (value === undefined) {
      return new Class();
    }

    return new Class(value);
  }
};



class TypeEnforcement {
  constructor (rules) {
    if (is.object(rules) === false) {
      throw error(0);
    }

    const map = {};

    Object.freeze(rules);

    Object.keys(rules).forEach(i => {
      const sample = rules[i];

      if (is.object(sample) === false) {
        throw error(1, i);
      }

      const names = Object.keys(sample);

      names.forEach(i => {
        const Class = sample[i];

        if (
          Class === undefined ||
          Class === null ||
          trc.typeProto.indexOf(typeof Class.__proto__) === -1
        ) {
          throw error(2, i);
        }
      });

      map[i] = names;
    });

    this.rules = rules;
    this.map = map;
  }



  validate (order, doc, {skip = false} = {}) {
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
      let missing = map.filter(i => {
        return fields.indexOf(i) === -1;
      });

      if (missing.length > 0) {
        return error(4, missing, order);
      }
    }

    let redundant = fields.filter(i => {
      return map.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      return error(5, redundant, order);
    }

    for (let i of fields) {
      let Class = rule[i];
      let value = doc[i];

      if (enforcement.validate(Class, value) === false) {
        return error(6, i, order, Class.name);
      }
    }

    return null;
  }



  normalise (order, doc) {
    if (is.string(order) === false || is.object(doc) === false) {
      throw error(0);
    }

    if (this.map.hasOwnProperty(order) === false) {
      throw error(3, order);
    }

    let fields = Object.keys(doc);
    let rule = this.rules[order];
    let map = this.map[order];

    let redundant = fields.filter(i => {
      return map.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      throw error(5, redundant, order);
    }

    for (let i of fields) {
      let Class = rule[i];
      let value = doc[i];

      doc[i] = enforcement.normalise(Class, value);
    }

    return doc;
  }
}

module.exports = TypeEnforcement;
