/**
 * Model
 * @author Jakit
 * @date 2020/03/03
 */

import {Sqlite, Sql} from './sqlite.js'

// 数字整形 委托变量
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

// 字符串 委托变量
const string = {
	default: "",

	parse(value) {
		value = String(value);
		return value;
	}
}

// 浮点数 委托变量
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

// 日期 委托变量
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

class Model {
	constructor(values) {
		this._attr = {};

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

			this.initField(fieldKey, fields[fieldKey]);
			this.initFieldValue(fieldKey, fields[fieldKey], values);
		}
	}

	initField(fieldKey, field) {
		(function (_this, _fieldKey, _field) {
			Object.defineProperty(_this, _fieldKey, {
				set: function (value) {
					this._attr[_fieldKey] = _field.parse(value);
				},

				get: function() {
					console.log(_fieldKey);
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

		this._attr[fieldKey] = field.parse(values[fieldKey]);
	}

	save() {
		// code
	}

	destroy() {
		// code
	}

	static create(table, fields) {
		var newModel = (function () {
			return class extends Model {
				constructor(values) {
					super(values);
				}
			};
		})();

		newModel.table = table;
		newModel.fields = fields;

		return newModel;
	}

	static where(where) {
		if (typeof where != "object") {
			return this;
		}

		this._where = where;
	}

	static orWhere(where) {
		if (typeof where != "object") {
			return this;
		}

		this._orWhere = where;
	}

	static _queryWhere() {
		var query = this._getQuery();
		var where = {};
		var orWhere = {};

		if (typeof this._where == "object") {
			// code
		}
	}

	static _getQuery() {
		if (!this.hasOwnProperty('_currentQuery')) {
			this._currentQuery = new Sql();
		}

		return this._currentQuery;
	}

	static _getDatabase() {
		if (!this.hasOwnProperty('_database')) {
			this._database = new Sqlite();
		}

		return this._database;
	}

	static first() {
		var query = this._getQuery();
		var database = this._getDatabase();
	}

	static last() {
		// code
	}

	static list() {
		// code
	}
}

export {
	integer,
	string,
	float,
	date,
	Model
}
