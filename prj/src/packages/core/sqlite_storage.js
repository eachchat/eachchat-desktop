/**
 * SQLite Storage
 * @author Jakit
 * @date 2020/03/27
 */

import {serial,
        bool,
        integer,
        string,
        float,
        date} from './types.js';
import { Storage } from './storage.js';
import { Sqlite, Sql } from './sqlite.js';

var fieldTypes = {
  [serial]: {
    type: "integer"
  },

  [integer]: {
    type: "integer"
  },

  [bool]: {
    type: "integer"
  },

  [float]: {
    type: "real"
  },

  [string]: {
    type: "text"
  },

  [date]: {
    type: "integer"
  }
};

class SQLiteStorage extends Storage {
  constructor(config) {
    super(config);

    var filename = "";

    if ("filename" in config) {
      filename = config.filename;
    }

    this.database = new Sqlite(filename);
    this.sql = "";
  }

  async getDatabase() {
    await this.connect();
    return this.database;
  }

  async connect() {
    await this.database.init();
  }

  async disconnect() {
    await this.database.close();
  }

  _parseSearchStatement(sql, statement) {
    var expressions = [];

    if (!statement.includes('&') &&
      !statement.includes('|')) {
      expressions.push(statement);

      return expressions;
    }

    var begin = 0;

    for (var i = 0; i < statement.length; i++) {
      if (statement[i] == '&') {

      }
    }
  }

  async appendSearch(sql, search) {
    if (typeof search != "object") {
      search = {};
    }

    for (var field in search) {
      var value = search[field];
      var isOr = false;

      if (typeof field != "string" ||
        field.length == 0) {
        continue;
      }

      if (field[0] == "$") {
        continue;
      }

      if (field[0] == "_") {
        isOr = true;
        field = field.substring(1);
      }

      if (typeof value == "number") {
        value = String(value);
      }

      if (typeof value == "string" &&
        value.length > 0) {
        var operator = '=';

        if (['>', '<', '=', '%'].includes(value[0])) {
          if (value.length < 2) {
            continue;
          }

          operator = value[0];
          value = value.substr(1);
        }

        if (operator == '%') {
          operator = 'like';

          if (value.slice(-1) != '%') {
            value += '%';
          }

          value = '%' + value;
        }

        if (isOr) {
          sql.whereOr([field, operator, value]);
          continue;
        }

        sql.where([field, operator, value]);

      } else if (value instanceof Array) {
        if (isOr) {
          sql.whereOr([field, 'in', value]);
          continue;
        }

        sql.where([field, 'in', value]);

      } else if (typeof value === "object") {
        var comparations = [];

        if ("lt" in value) {
          comparations.push([field, '<', value.lt]);

        } else if ("lte" in value) {
          comparations.push([field, '<=', value.lte]);
        }

        if ("gt" in value) {
          comparations.push([field, '>', value.gt]);

        } else if ("gte" in value) {
          comparations.push([field, '>=', value.gte]);
        }

        if("ne" in value){
          comparations.push([field, '!=', value.ne]);
        }

        if (isOr) {
          if (comparations.length == 0) {
            continue;
          }

          sql.whereOr(comparations[0]);

          if (comparations.length < 2) {
            continue;
          }

          sql.where(comparations[1]);
          continue;
        }

        if (comparations.length == 0) {
          continue;
        }

        sql.where(comparations[0]);

        if (comparations.length < 2) {
          continue;
        }

        sql.where(comparations[1]);
      }
    }

    if ("$order" in search &&
      typeof search.$order === "object") {
      if ("by" in search.$order &&
        typeof search.$order.by === "string") {
        var reverse = false;

        if ("reverse" in search.$order &&
          typeof search.$order.reverse === "boolean") {
          if (search.$order.reverse) {
            reverse = true;
          }
        }

        sql.orderBy(search.$order.by, reverse);
      }
    }

    if ("$size" in search) {
      var offset = 0;
      var size = 20;

      if ("$offset" in search) {
        var tempOffset = Number.parseInt(search.$offset);
        offset = Number.isNaN(tempOffset) ? offset : tempOffset;
      }

      var tempSize = Number.parseInt(search.$size);
      size = Number.isNaN(tempSize) ? size : tempSize;

      sql.limit(offset, size);
    }

    return sql;
  }

  resultToList(result) {
    var list = [];

    if (result instanceof Array &&
      result.length > 0) {
      result = result[0];

      if (result.hasOwnProperty("columns") &&
        result.hasOwnProperty("values")) {
        var columns = result.columns;
        var values = result.values;

        for (var i = 0; i < values.length; i++) {
          var object = {};
          var value = values[i];

          if (columns.length != value.length) {
            continue;
          }

          for (var j = 0; j < columns.length; j++) {
            object[columns[j]] = value[j];
          }

          list.push(object);
        }
      }
    }

    return list;
  }

  async checkTable(database, index) {
    var sql = new Sql();
    sql.schema(index);
    var schema = await database.exec(sql);
    if (schema != undefined && schema.length > 0) {
      return true;
    }

    return false;
  }

  async getPrimaryKeys(database, index) {
    var sql = new Sql();
    sql.schema(index);
    var values = await database.exec(sql);

    if (values.length == 0) {
      return [];
    }

    var primaryKeys = [];
    for (var i = 0; i < values.length; i++) {
      var value = values[i];

      if (value.length < 6) {
        continue;
      }

      if (value.pk > 0) {
        primaryKeys.push(value.name);
      }
    }

    return primaryKeys;
  }

  async register(index, fields, primaryKeys) {
    var database = await this.getDatabase();

    if (await this.checkTable(database, index)) {
      return;
    }

    var sql = new Sql();
    var tableFields = {};

    for (var name in fields) {
      var field = fields[name];

      if (field in fieldTypes) {
        tableFields[name] = fieldTypes[field];
      }
    }

    sql.create(index, tableFields, primaryKeys);
    database.exec(sql);
    database.dump();
  }

  async fetch(index, search) {
    var sql = new Sql();
    var database = await this.getDatabase();

    sql.select(index);
    this.appendSearch(sql, search);

    var result = await database.exec(sql);

    return result;
  }

  async _getLastInsert(database, index) {
    var sql = new Sql();
    sql = sql.lastInsert();
    var result = await database.exec(sql);
    var lastInsert = {};

    if (!(result instanceof Array) ||
      result.length == 0) {
      return lastInsert;
    }

    result = result[0];

    if (!("values" in result)) {
      return lastInsert;
    }

    result = result.values;

    if (!(result instanceof Array) ||
      result.length == 0) {
      return lastInsert;
    }

    result = result[0];

    if (!(result instanceof Array) ||
      result.length == 0) {
      return lastInsert;
    }

    var rowId = result[0];

    sql = sql.select(index);

    this.appendSearch(sql, {
      $offset: rowId - 1,
      $size: 1
    });

    return await database.exec(sql);
  }

  async add(index, data) {
    var sql = new Sql();
    var database = await this.getDatabase();

    sql.insert(index, data);

    this.sql = sql;

    var result = await database.exec(sql);

    return result;
  }

  async update(index, data, search) {
    var sql = new Sql();
    var database = await this.getDatabase();
    var primaryKeys = await this.getPrimaryKeys(database, index);
    var primaryValues = {};

    for (var i = 0; i < primaryKeys.length; i++) {
      var primaryKey = primaryKeys[i];

      if (primaryKey in search) {
        primaryValues[primaryKey] = search[primaryKey];
      }
    }

    sql.update(index, data);
    this.appendSearch(sql, primaryValues);

    var result = await database.exec(sql);
    database.dump();

    this.sql = sql;

    return result;
  }

  async drop(index, search) {
    var sql = new Sql();
    var database = await this.getDatabase();
    var primaryKeys = await this.getPrimaryKeys(database, index);
    var primaryValues = {};

    for (var i = 0; i < primaryKeys.length; i++) {
      var primaryKey = primaryKeys[i];

      if (primaryKey in search) {
        primaryValues[primaryKey] = search[primaryKey];
      }
    }

    sql.delete(index);
    this.appendSearch(sql, primaryValues);

    var result = await database.exec(sql);
    database.dump();

    this.sql = sql;

    return result;
  }

  async exec(sql) {
    var database = await this.getDatabase();

    try {
      return await database.exec(sql);

    } catch (e) {
      return e;
    }
  }

  async truncate(index) {
    var sql = new Sql();
    var database = await this.getDatabase();

    sql.truncate(index);

    var result = await database.exec(sql);
    database.dump();

    this.sql = sql;

    return result;
  }
}

export {
  SQLiteStorage
};
