/**
 * Storage
 * @author Jakit
 * @date 2020/03/04
 */

import initSqlJs from 'sql.js';
const fs = require('fs')

class Sqlite {
  constructor(filename) {
    this.db = undefined;
    this.filename = filename;
  }

  async init() {
    var filename = this.filename;
    var fileBuffer = undefined;

    if (typeof this.db != "undefined") {
      return this;
    }

    var SQL = await initSqlJs();

    if (typeof filename == "undefined") {
      try {
        this.db = new SQL.Database();
        // console.log('new db');

      } catch (e) {
        console.log(e);
      }

    } else {
      if (fs.existsSync(filename)) {
        try {
          fileBuffer = fs.readFileSync(filename);
          console.log('read buffer ok');

        } catch(e) {
          console.log(e);
          fileBuffer = undefined;
        }
      }

      if (typeof fileBuffer == "undefined") {
        this.db = new SQL.Database();
        // console.log('new db');

      } else {
        console.log('load ' + filename);
        this.db = new SQL.Database(fileBuffer);
        console.log('ok');
      }
    }

    return this;
  }

  exec(sql) {
    if (typeof this.db === 'undefined') {
      return undefined;
    }

    if (sql instanceof Sql) {
      sql = sql.sql;
    }

    if (typeof sql != "string") {
      return undefined;
    }

    if (sql.length < 1) {
      return undefined;
    }

    if (sql[sql.length - 1] != ";") {
      sql += ";"
    }

    try {
      return this.db.exec(sql);

    } catch (e) {
      console.log(e);
    }

    return undefined;
  }

  close() {
    if (typeof this.db === 'undefined') {
      return undefined;
    }

    try {
      return this.db.close();

    } catch (e) {
      console.log(e);
    }
  }

  dump() {
    if (typeof this.db === 'undefined') {
      return;
    }

    try {
      var data = this.db.export();
      var buffer = Buffer.from(data, 'binary');
      fs.writeFileSync(this.filename, buffer);

    } catch (e) {
      console.log(e);
    }
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
}

class Sql {
  constructor() {
    this._sql = "";
    this._hasWhere = false;
  }

  select(table, fields) {
    this._sql = "select ";
    var sqlFields = "*";

    if (fields instanceof Array) {
      sqlFields = fields.join(", ");
    }

    this._sql += sqlFields + " ";
    this._sql += "from " + table + " ";

    return this;
  }

  where(wheres) {
    if (!wheres instanceof Array) {
      return this;
    }

    if (wheres.length == 0) {
      return this;
    }

    var sqlWheres = [];

    if (typeof wheres[0] == "string") {
      wheres = [wheres];
    }

    wheres.forEach((item) => {
      if (item.length == 2) {
        item.push(item[1]);
        item[1] = "=";
      }

      if (item.length != 3) {
        return;
      }

      sqlWheres.push(item.join(" "));
    });

    if (this._hasWhere) {
      this._sql += "and ";

    } else {
      this._sql += "where ";
    }

    this._sql += sqlWheres.join(" and ") + " ";
    this._hasWhere = true;

    return this;
  }

  whereOr(wheres) {
    if (!wheres instanceof Array) {
      return this;
    }

    if (wheres.length == 0) {
      return this;
    }

    var sqlWheres = [];

    if (typeof wheres[0] == "string") {
      wheres = [wheres];
    }

    wheres.forEach((item) => {
      if (item.length == 2) {
        item.push(item[1]);
        item[1] = "=";
      }

      if (item.length != 3) {
        return;
      }

      sqlWheres.push(item.join(" "));
    });

    if (this._hasWhere) {
      this._sql += "or ";

    } else {
      this._sql += "where ";
    }

    this._sql += sqlWheres.join(" or ") + " ";
    this._hasWhere = true;

    return this;
  }

  get sql() {
    return this._sql;
  }

  insert(table, values) {
    var sqlFields = [];
    var sqlValues = [];

    if (!typeof values == "object") {
      return this;
    }

    for (var field in values) {
      sqlFields.push(field);
      sqlValues.push(values[field]);
    }

    if (sqlFields.length < 1) {
      return this;
    }

    this._sql = "insert into " + table + " ";
    this._sql += "(" + sqlFields.join(", ") + ") ";
    this._sql += "values ";
    this._sql += "('" + sqlValues.join("', '") + "')";

    return this;
  }

  update(table, values) {
    var sqlPairs = [];

    if (!typeof values == "object") {
      return this;
    }

    for (var field in values) {
      sqlPairs.push(field + "='" + values[field] + "'");
    }

    if (sqlPairs.length < 1) {
      return this;
    }

    this._sql = "update " + table + " set ";
    this._sql += sqlPairs.join(", ") + " ";

    return this;
  }

  delete(table) {
    this._sql = "delete from " + table + " ";

    return this;
  }

  limit(offset, size) {
    this._sql += " limit " + String(offset) + ", " + String(size);
  }

  asc() {
    this._sql += " asc ";
  }

  desc() {
    this._sql += " desc ";
  }
}

export {
  Sqlite,
  Sql
}
