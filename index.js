const availableTypeProto = [
  'function',
  'object'
];


const globalObjectsPrimitiveType = [
  String,
  Number,
  Boolean,
  Symbol
];


const is = {
  object(a) {
    return a !== undefined && a !== null && typeof a === 'object';
  },

  string(a) {
    return a !== undefined && a !== null && typeof a === 'string';
  }
};


const error = {
  unxpectedArgument() {
    return new Error(`Unexpected argument or 'undefined' or 'null'`);
  },

  unxpectedSample(a) {
    return new Error(`Unexpected sample '${a}' or 'undefined' or 'null'`);
  },

  unxpectedClass(a) {
    return new Error(`Unexpected class '${a}' or 'undefined' or 'null'`);
  },

  orderNotFound(a) {
    return new Error(`Order '${a}' not found`);
  },

  missingFields(a, b) {
    return new Error(`Missing fields '${a}' in order '${b}'`);
  },

  redundantFields(a, b) {
    return new Error(`Redundant fields '${a}' in order '${b}'`);
  },

  invalidValue(a, b, c) {
    return new Error(`Invalid value '${a}' in order '${b}'. Expected ${c}`);
  }
};


const enforcement = {
  validate(Class, value) {
    if (value === undefined || value === null) {
      return false;
    }

    if (globalObjectsPrimitiveType.includes(Class)) {
      return typeof value === Class.name.toLowerCase();
    }

    return value.__proto__ === Class.prototype;
  },

  normalise(Class, value) {
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
  constructor(rules) {
    if (is.object(rules) === false) {
      throw error.unxpectedArgument();
    }

    const map = {};

    Object.freeze(rules);

    Object.keys(rules).forEach(i => {
      const sample = rules[i];

      if (is.object(sample) === false) {
        throw error.unxpectedSample(i);
      }

      const names = Object.keys(sample);

      names.forEach(i => {
        const Class = sample[i];

        if (
          Class === undefined ||
          Class === null ||
          availableTypeProto.indexOf(typeof Class.__proto__) === -1
        ) {
          console.log('Fack!!!');

          throw error.unxpectedClass(i);
        }
      });

      map[i] = names;
    });

    this.rules = rules;
    this.map = map;
  }



  validate(order, doc, {skip = false} = {}) {
    if (is.string(order) === false || is.object(doc) === false) {
      return error.unxpectedArgument();
    }

    if (this.map.hasOwnProperty(order) === false) {
      return error.orderNotFound(order);
    }

    let fields = Object.keys(doc);
    let rule = this.rules[order];
    let map = this.map[order];

    if (skip === false) {
      let missing = map.filter(i => {
        return fields.indexOf(i) === -1;
      });

      if (missing.length > 0) {
        return error.missingFields(missing, order);
      }
    }

    let redundant = fields.filter(i => {
      return map.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      return error.redundantFields(redundant, order);
    }

    for (let i of fields) {
      let Class = rule[i];
      let value = doc[i];

      if (enforcement.validate(Class, value) === false) {
        return error.invalidValue(i, order, Class.name);
      }
    }

    return null;
  }



  normalise(order, doc) {
    if (is.string(order) === false || is.object(doc) === false) {
      throw error.unxpectedArgument();
    }

    if (this.map.hasOwnProperty(order) === false) {
      throw error.orderNotFound(order);
    }

    let fields = Object.keys(doc);
    let rule = this.rules[order];
    let map = this.map[order];

    let redundant = fields.filter(i => {
      return map.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      throw error.redundantFields(redundant, order);
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
