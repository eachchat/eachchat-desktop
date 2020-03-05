/**
 * Model
 * @author Jakit
 * @date 2020/03/03
 */

import {Sqlite} from './sqlite.js'

const integer = {
	default: 0,

	parse(value) {
		value = Number.parseInt(value);

		if (!Number.isNaN(value)) {
			return value;
		}

		return 0;
	}
}

const string = {
	default: "",

	parse(value) {
		value = String(value);
		return value;
	}
}

const float = {
	default: 0.0,

	parse(value) {
		value = Number.parseFloat(value);

		if (!Number.isNaN(value)) {
			return value;
		}

		return 0.0;
	}
}

const date = {
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

function Model() {}

Model.create = function (table, fields) {
	// var newModel = function (values) {
	// 	this._table = table;
	// 	this._fields = fields;
	// 	this._attr = {};

	// 	for (var fieldKey in this._fields) {
	// 		if (!this._fields.hasOwnProperty(fieldKey)) {
	// 			continue;
	// 		}

	// 		var field = this._fields[fieldKey];

	// 		if (!values.hasOwnProperty(fieldKey)) {
	// 			if (typeof field.default == "function") {
	// 				this._attr[fieldKey] = field.default();
	// 				continue;
	// 			}

	// 			this._attr[fieldKey] = field.default;
	// 			continue;
	// 		}

	// 		this._attr[fieldKey] = field.parse(values[fieldKey]);
	// 	}
	// }

	var newModel = (function (t, f) {
		return function (values) {
			this._table = t;
			this._attr = {};

			for (var fKey in f) {
				if (!f.hasOwnProperty(fKey)) {
					continue;
				}

				var field = f[fKey];

				if (!values.hasOwnProperty(fKey)) {
					if (typeof field.default == "function") {
						this._attr[fKey] = field.default();
						continue;
					}

					this._attr[fKey] = field.default;
					continue;
				}

				this._attr[fKey] = field.parse(values[fKey]);
			}
		};
	})(table, fields);

	newModel.prototype = Object.create(Model.prototype);
	newModel.prototype.constructor = newModel;
	newModel.prototype.fields = Object.create(fields);

	for (var field in fields) {
		if (!fields.hasOwnProperty(field)) {
			continue;
		}

		(function (fName) {
			Object.defineProperty(newModel.prototype, fName, {
				set: function (value) {
					this._attr[fName] = this.fields[fName].parse(value);
				},

				get: function() {
					console.log(fName);
					return this._attr[fName];
				}
			});
		})(field);
	}

	return newModel;
};

export {
	integer,
	string,
	float,
	date,
	Model
}
