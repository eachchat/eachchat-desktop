/**
 * SQLite Storage
 * @author Jakit
 * @date 2020/03/27
 */

import { Storage } from './storage.js'
import { Sqlite, Sql } from './sqlite.js'

class SQLiteStorage extends Storage {
  constructor(config) {
    super(config);

    var filename = "";

    if ("filename" in config) {
      filename = config["filename"];
    }

    this.database = new Sqlite(filename);
    this.sql = "";
  }

  async getDatabase() {
    await this.database.init();
    return this.database;
  }

  async connect() {
    getDatabase();
  }

  async disconnect() {
    await this.database.close();
  }

  async appendSearch(sql, search) {
    if (!typeof search == "object") {
      search = {};
    }

    for (var field in search) {
      var value = search[field];
      var isOr = false;

      if (typeof field != "string"
        || field.length == 0) {
        continue;
      }

      if (field[0] == "$") {
        continue;
      }

      if (field[0] == "_") {
        isOr == true;
      }

      if (typeof value == "number") {
        value = String(value);
      }

      if (typeof value == "string"
        && value.length > 0) {
        var operator = '=';

        if (['>', '<', '='].includes(value[0])) {
          operator = value[0];
          value = value.substr(1);
        }

        if (isOr) {
          sql.whereOr([field, operator, value]);
          continue;
        }

        sql.where([field, operator, value]);

      } else if (value instanceof Array) {
        var whereIn = "('";
        whereIn += value.join("', '");
        whereIn += value.join("')");

        if (isOr) {
          sql.where([field, 'in', whereIn]);
        }

        sql.where([field, 'in', whereIn]);
      }
    }

    if ("$reverse" in search) {
      var reverse = false;

      if (search.$reverse) {
        reverse = true;
      }

      if (reverse) {
        sql.desc();

      } else {
        sql.asc();
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

    if (result instanceof Array
      && result.length > 0) {
      result = result[0];

      if (result.hasOwnProperty("columns")
        && result.hasOwnProperty("values")) {
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

  checkTable(database, index) {
    var schema = database.schema(index);

    if (schema.length > 0) {
      return true;
    }

    return false;
  }

  getPrimaryKeys(database, index) {
    var schema = database.schema(index);

    if (schema.length < 0) {
      return [];
    }

    if (!("values" in schema[0])) {
      return [];
    }

    var values = schema[0].values;
    var primaryKeys = [];

    for (var i = 0; i < values.length; i++) {
      var value = values[i];

      if (value.length < 6) {
        continue;
      }

      if (value[5] == 1) {
        primaryKeys.push(values[1]);
      }
    }

    return primaryKeys;
  }

  async fetch(index, search) {
    var sql = new Sql();
    var database = await this.getDatabase();

    sql.select(index);
    this.appendSearch(sql, search);

    var result = database.exec(sql);

    this.sql = sql;

    return this.resultToList(result);
  }

  async add(index, data) {
    var sql = new Sql();
    var database = await this.getDatabase();

    sql.insert(index, data);

    var result = database.exec(sql);
    database.dump();

    this.sql = sql;

    return result;
  }

  async update(index, data, search) {
    var sql = new Sql();
    var database = await this.getDatabase();
    var primaryKeys = this.getPrimaryKeys(database, index);
    var primaryValues = {};

    for (var i = 0; i < primaryKeys.length; i++) {
      var primaryKey = primaryKeys[i];

      if (primaryKey in search) {
        primaryValues[primaryKey] = search[primaryKey];
      }
    }

    sql.update(index, data);
    this.appendSearch(sql, search);

    var result = database.exec(sql);
    database.dump();

    this.sql = sql;

    return result;
  }

  async drop(index, search) {
    var sql = new Sql();
    var database = await this.getDatabase();
    var primaryKeys = this.getPrimaryKeys(database, index);
    var primaryValues = {};

    for (var i = 0; i < primaryKeys.length; i++) {
      var primaryKey = primaryKeys[i];

      if (primaryKey in search) {
        primaryValues[primaryKey] = search[primaryKey];
      }
    }

    sql.delete(index);
    this.appendSearch(sql, search);

    var result = database.exec(sql);
    database.dump();

    this.sql = sql;

    return result;
  }
}

export {
  SQLiteStorage
}
