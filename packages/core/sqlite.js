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

  init(filename) {
    if (typeof filename == "string") {
      this.filename = filename;
    }

    var fileBuffer = undefined;

    if (fs.exists(filename)) {
      fileBuffer = fs.readFileSync(filename);
    }

    var result = initSqlJs().then((SQL) => {
      try {
        if (typeof fileBuffer == 'undefined') {
          this.db = new SQL.database();

        } else {
          this.db = new SQL.database(fileBuffer);
        }

      } catch (e) {
        console.log(e);
      }

      var sql = "create table person (name text, age int);";
      var res = db.exec(sql);
      sql = "insert into person (name, age) values ('wangcai', 30);"
      var res = db.exec(sql);
      var data = db.export();
      var buffer = Buffer.from(data, 'binary');
      fs.writeFileSync(filename, buffer);
    });

    return result;
  }

  exec(sql) {
    if (typeof this.db === 'undefined') {
      return undefined;
    }

    if (sql instanceof Sql) {
      sql = sql.sql;
    }

    if (!sql instanceof "string") {
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
}

class Sql {
  constructor() {
    this._sql = "";
    this._hasWhere = false;
  }

  select() {
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
}

export {
  Sqlite,
  Sql
}
