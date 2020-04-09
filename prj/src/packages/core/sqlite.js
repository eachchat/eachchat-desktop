/**
 * Storage
 * @author Jakit
 * @date 2020/03/04
 */

import initSqlJs from 'sql.js';
import fs from 'fs';

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

    this.dump();

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

  static async connect(filename) {
    var connection = new Sqlite(filename);
    var connection_promise = await connection.init();
    return connection_promise;
  }
}

class Sql {
  constructor() {
    this._sql = "";
    this._hasWhere = false;
  }

  create(table, fields, primaryKeys) {
    this._sql = "create table " + table + " ";
    var sqlFields = [];

    if (typeof fields != "object") {
      return this;
    }

    if (typeof primaryKeys == "string") {
      primaryKeys = [primaryKeys];

    } else if (typeof primaryKeys === "undefined") {
      primaryKeys = [];
    }

    if (!(primaryKeys instanceof Array)) {
      console.log(2);
      return this;
    }

    for (var field in fields) {
      if (typeof fields[field] != "object") {
        console.log(3);
        continue;
      }

      if (!("type" in fields[field])) {
        console.log(4);
        continue;
      }

      var type = fields[field].type;
      var sqlField = field + " " + type;

      sqlFields.push(sqlField);
    }

    if (sqlFields.length == 0) {
      console.log(5);
      return this;
    }

    if (primaryKeys.length > 0) {
      var primarySql = "primary key(";
      primarySql += primaryKeys.join(", ");
      primarySql += ")";

      sqlFields.push(primarySql);
    }

    this._sql += "(";
    this._sql += sqlFields.join(", ");
    this._sql += ")";
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

      if (item[2] instanceof Array) {
        item[2] = "(" + item[2].join(", ") + ")";

      } else if (typeof item[2] == "string") {
        item[2] = "'" + item[2] + "'";
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

      if (item[2] instanceof Array) {
        item[2] = "(" + item[2].join(", ") + ")";

      } else if (typeof item[2] == "string") {
        item[2] = "'" + item[2] + "'";
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
    return this;
  }

  asc() {
    this._sql += " asc ";
    return this;
  }

  desc() {
    this._sql += " desc ";
    return this;
  }

  schema(table) {
    this._sql = "PRAGMA table_info([";
    this._sql += table;
    this._sql += "])";
    return this;
  }

  lastInsert() {
    this._sql = "select last_insert_rowid();";
    return this;
  }
}

export {
  Sqlite,
  Sql
}
