const errorMessages = require('./error-messages');

const error = (errno, ...ignitor) => {
  let i = 0;
  const message = errorMessages[errno].replace(/%&/g, () => {
    return ignitor[i++];
  });

  return new TypeError(message);
};

const is = {
  object(value) {
    return value !== null && typeof value === 'object';
  },

  string(value) {
    return typeof value === 'string';
  }
};

const enforcement = {
  validate(Class, value) {
    if (value === undefined || value === null) {
      return false;
    }

    return Object.getPrototypeOf(value) === Class.prototype;
  },

  normalise(Class, value) {
    if ([ String, Number, Boolean, Symbol ].includes(Class)) {
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
      throw error(0);
    }

    Object.freeze(rules);

    const schema = {};

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

      schema[i] = names;
    });

    this.rules = rules;
    this.schema = schema;
  }

  validate(order, values, {skip = false} = {}) {
    if (is.string(order) === false || is.object(values) === false) {
      return error(0);
    }

    if (this.schema.hasOwnProperty(order) === false) {
      return error(3, order);
    }

    const fields = Object.keys(values);
    const rule = this.rules[order];
    const schema = this.schema[order];

    if (skip === false) {
      const missing = schema.filter((i) => {
        return fields.indexOf(i) === -1;
      });

      if (missing.length > 0) {
        return error(4, missing, order);
      }
    }

    const redundant = fields.filter((i) => {
      return schema.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      return error(5, redundant, order);
    }

    for (const i of fields) {
      const Class = rule[i];
      const value = values[i];

      if (enforcement.validate(Class, value) === false) {
        return error(6, i, order, Class.name);
      }
    }

    return null;
  }

  normalise(order, values) {
    if (is.string(order) === false || is.object(values) === false) {
      throw error(0);
    }

    if (this.schema.hasOwnProperty(order) === false) {
      throw error(3, order);
    }

    const fields = Object.keys(values);
    const rule = this.rules[order];
    const schema = this.schema[order];

    const redundant = fields.filter((i) => {
      return schema.indexOf(i) === -1;
    });

    if (redundant.length > 0) {
      throw error(5, redundant, order);
    }

    for (const i of fields) {
      const Class = rule[i];
      const value = values[i];

      values[i] = enforcement.normalise(Class, value);
    }

    return values;
  }
}

module.exports = TypeEnforcement;
