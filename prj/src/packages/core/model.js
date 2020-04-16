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
      if (typeof value == "undefined") {
        return 0;

      } else if (value == null) {
        return 0;
      }

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

      } else if (value == null) {
        return 0;
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
      if (value == null) {
        return 0;
      }

      value = Number.parseInt(value);

      if (Number.isNaN(value)) {
        return 0;
      }

      return value;
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
      if (typeof value == "undefined") {
        return "";

      } else if (value == null) {
        return "";
      }

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

      } else if (value == null) {
        return this.default();
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

    this.initialize();

    this.values = values;
  }

  initialize() {
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
      empties = this.initFieldEmpties(empties, fieldKey);
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

  initFieldEmpties(empties, fieldKey) {
    const name = fieldKey;
    var _this = this;

    Object.defineProperty(empties, name, {
      get: function() {
        return !_this._attr.hasOwnProperty(name);
      }
    });

    return empties;
  }

  get values() {
    return Object.assign({}, this._attr);
  }

  set values(values) {
    if (typeof values != "object") {
      values = {};
    }

    const fields = this.constructor.fields;

    for (var name in values) {
      var check = false;

      if (name in fields) {
        check = true;

      } 

      if (!check) {
        continue;
      }

      var value = values[name];
      this[name] = value;
    }
  }

  get commited() {
    return this._commited;
  }

  set commited(status) {
    if (status) {
      this._commited = true;
      this._originAttr = Object.freeze(Object.assign({}, attr));
    }
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

      if (typeof result == "undefined") {
        console.log("save failed!!!");
        return this;
      }

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

  static async create(config) {
    if (typeof config != "object") {
      return undefined;
    }

    if (!("fields" in config)) {
      return undefined;
    }

    var storage = undefined;
    var index = "";
    var fields = {};
    var primaryKeys = [];

    if ("storage" in config
      && config.storage instanceof Storage) {
      storage = config.storage;
    }

    if ("index" in config
      && typeof config.index == "string") {
      index = config.index;
    }

    if (typeof config.fields == "object") {
      fields = config.fields;
    }

    if ("primaryKey" in config) {
      if (typeof config.primaryKey == "string") {
        primaryKeys.push(config.primaryKey);

      } else if (config.primaryKey instanceof Array) {
        for (var i = 0; i < config.primaryKey.length; i++) {
          if (!(typeof config.primaryKey[i] == "string")) {
            continue;
          }

          primaryKeys.push(config.primaryKey[i]);
        }
      }
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

  static async truncate() {
    var storage = this.storage;
    var index = this.index;

    await this.storage.truncate(index);
  }
}

export {
  Model
}
