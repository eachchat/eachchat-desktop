/**
 * Model
 * @author Jakit
 * @date 2020/03/03
 */

import {serial,
        bool,
        integer,
        string,
        float,
        date} from './types.js';
import {Storage} from './storage.js';

const fieldTypes = {
  [serial]: {
    default: 0,

    parse(value) {
      value = Number.parseInt(value);

      if (!Number.isNaN(value)) {
        return value;
      }

      return 0;
    }
  },

  [bool]: {
    default: 1,

    parse(value) {
      if (typeof value == "boolean") {
        return value ? 1 : 0;
      }

      value = Number.parseInt(value);

      if (Number.isNaN(value)) {
        return 0;
      }

      if (value > 0) {
        return 1;
      }

      return 0;
    },

    generate(value) {
      if (typeof value != "number") {
        return false;
      }

      return value > 0 ? true : false;
    }
  },

  [integer]: {
    default: 0,

    parse(value) {
      value = Number.parseInt(value);

      if (!Number.isNaN(value)) {
        return value;
      }

      return 0;
    }
  },

  [float]: {
    default: 0.0,

    parse(value) {
      value = Number.parseFloat(value);

      if (!Number.isNaN(value)) {
        return value;
      }

      return 0.0;
    }
  },

  [string]: {
    default: "",

    parse(value) {
      value = String(value);
      return value;
    }
  },

  [date]: {
    default() {
      return (new Date()).getTime() / 1000;
    },

    parse (value) {
      if (typeof value == "number") {
        return value;

      } else if (value instanceof Date) {
        return value.getTime() / 1000;
      }
    },

    generate(value) {
      if (typeof value === "number" && !Number.isNaN(value)) {
        return new Date(Number(value) * 1000);

      } else if (value instanceof Date) {
        return value;
      }

      return new Date();
    }
  }
};

class Model {
  constructor(values) {
    this._attr = {};
    this._originAttr = {};
    this._commited = false;

    if (typeof values != "object") {
      values = {};
    }

    this.initialize(values);
  }

  initialize(values) {
    if (typeof this.constructor.fields != "object") {
      return;
    }

    var fields = this.constructor.fields;
    var empties = {};

    for (var fieldKey in fields) {
      var fieldType = fields[fieldKey];

      // Check illegal type
      if (!(fieldType in fieldTypes)) {
        continue;
      }

      fieldType = fieldTypes[fieldType];

      this.initField(fieldKey, fieldType);
      this.initFieldValue(fieldKey, fieldType, values);
      this.initFieldEmpties(empties, fieldKey);
    }

    this.empty = Object.freeze(empties);
  }

  initField(fieldKey, fieldType) {
    const name = fieldKey;
    const type = fieldType;

    Object.defineProperty(this, name, {
      set: function (value) {
        this._attr[name] = type.parse(value);
      },

      get: function() {
        if (!(name in this._attr)) {
          if (typeof type.default == "function") {
            return type.default();
          }

          return type.default;
        }

        if ("generate" in type) {
          return type.generate(this._attr[name]);
        }

        return this._attr[name];
      }
    });
  }

  initFieldValue(fieldKey, fieldType, values) {
    const name = fieldKey;
    const type = fieldType;

    if (!(name in values)) {
      return;
    }

    // Initialize attributes
    var parsedValue = type.parse(values[name]);

    this._attr[name] = parsedValue;
  }

  initFieldEmpties(empties, fieldKey) {
    const name = fieldKey;
    var _this = this;

    Object.defineProperty(empties, name, {
      get: function() {
        return !_this._attr.hasOwnProperty(name);
      }
    });
  }

  async save() {
    var storage = this.constructor.storage;
    var index = this.constructor.index;
    var fields = this.constructor.fields;
    var primaryKeys = this.constructor.primaryKeys;
    var attr = Object.assign({}, this._attr);
    var originAttr = this._originAttr;

    for (var fieldKey in fields) {
      if (!fields.hasOwnProperty(fieldKey)) {
        continue;
      }
    }

    if (!this._commited) {
      var result = await storage.post(index, attr);

      for (var i = 0; i < primaryKeys.length; i++) {
        var primaryKey = primaryKeys[i];

        if (primaryKey in result) {
          this[primaryKey] = result[primaryKey];
        }
      }

      this._commited = true;

    } else {
      await storage.put(index, attr, originAttr);
    }

    // Update origin attributes
    this._originAttr = Object.freeze(Object.assign({}, attr));

    return this;
  }

  async destroy() {
    var storage = this.constructor.storage;
    var index = this.constructor.index;
    var originAttr = this._originAttr;

    if (this._commited) {
      await storage.delete(index, originAttr);
    }

    this._attr = {};
    this._originAttr = {};
    this._commited = false;

    return this;
  }

  static async create(storage, index, fields, primaryKeys) {
    if (!(storage instanceof Storage)) {
      return undefined;
    }

    if (typeof index != "string") {
      return undefined;
    }

    if (typeof fields != "object") {
      return undefined;
    }

    if (typeof primaryKeys == "string") {
      primaryKeys = [primaryKeys];
    }

    if (!(primaryKeys instanceof Array)) {
      return undefined;
    }

    var newModel = (function () {
      return class extends Model {
        constructor(values) {
          super(values);
        }
      };
    })();

    newModel.storage = storage;
    newModel.index = index;
    newModel.fields = fields;
    newModel.primaryKeys = primaryKeys;

    await storage.registerFields(index, fields, primaryKeys);

    return newModel;
  }

  static spawn(values, isCommited) {
    var newInstance = new this(values);
    newInstance._commited = isCommited;
    return newInstance;
  }

  static async find(search) {
    var storage = this.storage;
    var index = this.index;

    if (typeof search != "object") {
      search = {};
    }

    var result = await this.storage.get(index, search);

    if (!(result instanceof Array)) {
      result = [];
    }

    var instances = [];

    for (var i = 0; i < result.length; i++) {
      var newInstance = this.spawn(result[i], true);
      // Update origin attributes
      newInstance._originAttr = Object.freeze(Object.assign({}, newInstance._attr));
      instances.push(newInstance);
    }

    return instances;
  }
}

export {
  Model
}
