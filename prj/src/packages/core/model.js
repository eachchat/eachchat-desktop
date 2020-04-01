/**
 * Model
 * @author Jakit
 * @date 2020/03/03
 */

import {serial,
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
			return new Date(0);
		},

		parse (value) {
			if (typeof value === "number" && !Number.isNaN(value)) {
				return new Date(Number(value) * 1000);

			} else if (typeof value === "string") {
				var timeStamp = Number(value);

				if (Number.isNaN(timeStamp)) {
					timeStamp = 0;

					// console.log('Illegal date value: ', value);
				}

				return new Date(timeStamp * 1000);

			} else if (value instanceof Date) {
				return value;
			}

			return new Date(0);
		}
	}
}

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

		for (var fieldKey in fields) {
			if (!fields.hasOwnProperty(fieldKey)) {
				continue;
			}

			var fieldTypeName = fields[fieldKey];

			if (fieldTypeName in fieldTypes) {
				var fieldType = fieldTypes[fieldTypeName];

				this.initField(fieldKey, fieldType);
				this.initFieldValue(fieldKey, fieldType, values);
			}
		}
	}

	initField(fieldKey, field) {
		(function (_this, _fieldKey, _field) {
			Object.defineProperty(_this, _fieldKey, {
				set: function (value) {
					this._attr[_fieldKey] = _field.parse(value);
				},

				get: function() {
					return this._attr[_fieldKey];
				}
			});
		})(this, fieldKey, field);
	}

	initFieldValue(fieldKey, field, values) {
		// Initialize attributes
		if (!values.hasOwnProperty(fieldKey)) {
			if (typeof field.default == "function") {
				this._attr[fieldKey] = field.default();
				return;
			}

			this._attr[fieldKey] = field.default;
			return;
		}

		var parsedValue = field.parse(values[fieldKey]);

		this._attr[fieldKey] = parsedValue;
		this._originAttr = Object.freeze(Object.assign({}, this._attr));
	}

	async save() {
		var storage = this.constructor.storage;
		var index = this.constructor.index;
		var fields = this.constructor.fields;
		var attr = Object.assign({}, this._attr);
		var originAttr = this._originAttr;

		for (var fieldKey in fields) {
			if (!fields.hasOwnProperty(fieldKey)) {
				continue;
			}
		}

		if (this._commited) {
			await storage.post(index, attr);
			this._commited = true;

		} else {
			await storage.put(index, attr, originAttr);
			this._originAttr = Object.freeze(Object.assign({}, attr));
		}

		return this;
	}

	async destroy() {
		var storage = this.constructor.storage;
		var index = this.constructor.index;
		var originAttr = this._originAttr;

		if (this._commited) {
			await storage.delete(index, originAttr);
		}

		return this;
	}

	static create(storage, index, fields) {
		var newModel = (function () {
			return class extends Model {
				constructor(values) {
					super(values);
				}
			};
		})();

		newModel.storage = undefined;
		newModel.fields = fields;

		if (storage instanceof Storage) {
			newModel.storage = storage;
		}

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

		var result = await this.storage.get(index, search);

		if (!result instanceof Array) {
			result = [];
		}

		for (var i = 0; i < result.length; i++) {
			var newInstance = this.spawn(result[i], true);
			instances.push(newInstance);
		}

		return instances;
	}
}

export {
	Model
}
