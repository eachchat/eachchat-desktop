/**
 * Model
 * @author Jakit
 * @date 2020/03/03
 */

import {Sqlite, Sql} from './sqlite.js'
import {loading, use} from './loader.js'

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

	async save() {
		var sql = this.constructor._getSQL();
		var database = await this.constructor._getDatabase();
		var table = this.constructor.table;
		var attr = this._attr;
		var primaryKeys = this.constructor.primaryKeys;

		if (this._commited) {
			sql.update(table, attr);

			for (var i = 0; i < primaryKeys.length; i++) {
				sql.where([primaryKeys[i], attr[primaryKeys[i]]]);
			}

		} else {
			var attrCopy = Object.assign({}, attr);

			for (var i = 0; i < this.constructor.increments.length; i++) {
				console.log("deleting" + this.constructor.increments[i]);
				delete attrCopy[this.constructor.increments[i]];
			}

			console.log(attrCopy);
			sql.insert(table, attrCopy);
		}

		console.log(sql);

		database.exec(sql);
		database.dump();
	}

	async destroy() {
		var sql = this.constructor._getSQL();
		var database = await this.constructor._getDatabase();
		var table = this.constructor.table;
		var primaryKeys = this.constructor.primaryKeys;

		sql.delete(table, table);

		for (var i = 0; i < primaryKeys.length; i++) {
			sql.where([primaryKeys[i], attr[primaryKeys[i]]]);
		}

		database.exec(sql);
		database.dump();
	}

	static create(database, table, fields, primaryKeys, increments) {
		var newModel = (function () {
			return class extends Model {
				constructor(values) {
					super(values);
				}
			};
		})();

		newModel.database = undefined;
		newModel.table = table;
		newModel.fields = fields;
		newModel.primaryKeys = [];
		newModel.increments = [];

		if (database instanceof Sqlite) {
			newModel.database = database;
		}

		if (typeof primaryKeys === "string") {
			newModel.primaryKeys.push(primaryKeys);

		} else if (primaryKeys instanceof Array) {
			newModel.primaryKeys = newModel.primaryKeys.concat(primaryKeys);
		}

		if (typeof increments === "string") {
			newModel.increments.push(increments);

		} else if (increments instanceof Array) {
			newModel.increments = newModel.increments.concat(increments);
		}

		return newModel;
	}

	static _getWheres() {
		if (!this.hasOwnProperty('_wheres')) {
			this._wheres = [];
		}

		return this._wheres;
	}

	static where(where) {
		if (typeof where != "object") {
			return this;
		}

		this._getWheres().push({
			and: where
		})

		return this;
	}

	static orWhere(where) {
		if (typeof where != "object") {
			return this;
		}

		this._getWheres().push({
			or: where
		})

		return this;
	}

	static _applyWhere(sql, where, isOr) {
		for (var field in where) {
			var match = where[field];

			if (typeof match == "string"
				&& match.length > 0) {
				var operator = '=';

				if (['>', '<', '='].includes(match[0])) {
					operator = match[0];
					match = match.substr(1);
				}

				if (isOr) {
					sql.whereOr([field, operator, match]);
					continue;
				}

				sql.where([field, operator, match]);

			} else if (match instanceof Array) {
				whereIn = "('";
				whereIn += match.join("', '");
				whereIn += match.join("')");

				if (isOr) {
					sql.where([field, 'in', whereIn]);
				}

				sql.where([field, 'in', whereIn]);
			}
		}
	}

	static _sqlWhere() {
		var sql = this._getSQL();
		var wheres = this._getWheres();

		for (var whereKey in wheres) {
			var isOr = false;
			var where = undefined;

			if (wheres[whereKey].hasOwnProperty("and")) {
				where = wheres[whereKey].and

			} else if (wheres[whereKey].hasOwnProperty("or")) {
				where = wheres[whereKey].or
				isOr = true;

			} else {
				continue;
			}

			if (typeof where == "undefined") {
				continue;
			}

			this._applyWhere(sql, where, isOr);
		}
	}

	static _getSQL() {
		if (!this.hasOwnProperty('_currentsql')) {
			this._currentsql = new Sql();
		}

		return this._currentsql;
	}

	static async _getDatabase() {
		await this.database.init();
		return this.database;
	}

	static spawn(values, isCommited) {
		var newInstance = new this(values);
		newInstance._commited = isCommited;
		return newInstance;
	}

	static async first(size, offset) {
		var sql = this._getSQL();
		var database = await this._getDatabase();

		// console.log(database.db);

		if (typeof size == "undefined") {
			size = 1;
		}

		if (typeof offset == "undefined") {
			offset = 0;
		}

		sql.select(this.table);
		this._sqlWhere();

		sql.asc();
		sql.limit(0, size);

		var result = database.exec(sql);
		var resultList = database.resultToList(result);

		var instances = [];

		for (var i = 0; i < resultList.length; i++) {
			var newInstance = this.spawn(resultList[i], true);
			instances.push(newInstance);
		}

		return instances;
	}

	static async last(size, offset) {
		var sql = this._getSQL();
		var database = await this._getDatabase();

		if (typeof size == "undefined") {
			size = 1;
		}

		if (typeof offset == "undefined") {
			offset = 0;
		}

		if (typeof size == "undefined") {
			size = 1;
		}

		sql.select(this.table);
		this._sqlWhere();

		sql.desc();
		sql.limit(0, size);

		var result = database.exec(sql);
		var resultList = database.resultToList(result);

		var instances = [];

		for (var i = 0; i < resultList.length; i++) {
			var newInstance = this.spawn(resultList[i], true);
			instances.push(newInstance);
		}

		return instances;
	}
}

export {
	integer,
	string,
	float,
	date,
	Model
}
