/**
 * Storage
 * @author Jakit
 * @date 2020/03/04
 */

import initSqlJs from 'sql.js';
const fs = require('fs')

function Sqlite(filename) {
  this.db = undefined;
  this.filename = filename;
}

Sqlite.prototype.init = function(filename) {
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
};

Sqlite.prototype.exec = function(sql) {
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
};

Sqlite.prototype.close = function() {
  if (typeof this.db === 'undefined') {
    return undefined;
  }

  try {
    return this.db.close();

  } catch (e) {
    console.log(e);
  }
};

Sqlite.prototype.dump = function() {
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
};

function Sql() {
  this._sql = "";
  this._hasWhere = false;
}

Sql.prototype.select = function(table, fields) {
  this._sql = "select ";
  var sqlFields = "*";

  if (fields instanceof Array) {
    sqlFields = fields.join(", ");
  }

  this._sql += sqlFields + " ";
  this._sql += "from " + table + " ";

  return this;
};

Sql.prototype.where = function(wheres) {
  if (!wheres instanceof Array) {
    return this;
  }

  if (wheres.length < 0) {
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
};

Sql.prototype.whereOr = function(wheres) {
  if (!wheres instanceof Array) {
    return this;
  }

  if (wheres.length < 0) {
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
};

Object.defineProperty(Sql.prototype, 'sql', {
  get() {
    return this._sql;
  }
});

Sql.prototype.insert = function(table, values) {
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
};

Sql.prototype.update = function(table, values) {
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
};

Sql.prototype.delete = function(table) {
  this._sql = "delete from " + table + " ";
};

export {
  Sqlite,
  Sql
}
