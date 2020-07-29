/**
 * Storage
 * @author Jakit
 * @date 2020/03/04
 */

import {environment} from '../data/environment.js';
var sqlite3 = require('sqlite3');
import {SqliteEncrypt} from "./encrypt.js"
const fs = require('fs');


class Sqlite {
  constructor(filename) {
    this.db = undefined;
    this.filename = filename;
    this.basePath = environment.path.base;
    this.encryption = new SqliteEncrypt(this.basePath);
  }

  async init() {
    var filename = this.filename;
    if (typeof this.db != "undefined") {
      return this;
    }

    //let sourcePassword = fs.readFileSync(this.basePath + "/password.txt", "utf-8");;
    let sourcePassword = "C3TQzhQBGIRySzrRGOYGHONKVHXnbMPRei2YgOWqaaU/U2Dw8YZadPhOEepbPT/kIc87LLeViRda1HGnR7sn9OY2+XzvyGAHrxXlNg16d+wz4qoMHxojAS8Hzh/VbRGWxzTA4EAW0ByHAMkeO3CNl+YbMFLyI/znYIW5nRY3NkLy6aMUS+xhzzXi+mSgvBjab+OqjwRHNyPr7u/oiehftAwBCnvUTVm4SygDa9s+MCZQMpaOGCd7TthkfsoPgJcKnyu9CdyUU6NG8V8doPPsIqNr1YvYFC5zRF/f4XI9mZt+Xfk38//Ij91xwOrItiZNd+hT7Qp7Zg97O+toDveBPw==";
    let password = this.encryption.decrypt(sourcePassword);

    console.log('load ' + filename);
    this.db = new sqlite3.Database(this.filename);
    this.db.serialize(() => {
      this.db.run("PRAGMA KEY = " + password);
      this.db.run("PRAGMA CIPHER = 'aes-128-cbc'");
    })
    
    let version = await this.SyncAll("PRAGMA user_version");
    if(version.length == 0)
      return false;
    let oldVersion = version[0].user_version;
    let newVersion = 1;
    if(oldVersion == newVersion)
      console.log("version is same as before");
    else
    {
      let tables = await this.SyncAll("SELECT name FROM sqlite_master WHERE type='table'");
      let tableName;
      let sql;
      for(let index in tables){
        tableName = tables[index].name; 
        sql = "drop table \'" + tableName + "\'";
        await this.SyncAll(sql);
      }
      this.SyncAll("PRAGMA user_version =" + newVersion);
      console.log("user version is " + newVersion);
    }
    console.log('ok');
    return this;
  }

  async exec(sql) {
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
      sql += ";";
    }


    let res;
    res = await this.SyncAll(sql)
    return res;
  }

  SyncAll(sql){
    return new Promise((resolve, reject)=>
    {
      this.db.all(sql, function(err, data){
        if(err != undefined)
        {
          console.log(err);
          console.log("sql is:"+sql)
        }
        resolve(data);
      })
    })
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
    this._sql = "create table `" + table + "` ";
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
      var sqlField = "`" + field + "` " + type;

      sqlFields.push(sqlField);
    }

    if (sqlFields.length == 0) {
      console.log(5);
      return this;
    }

    if (primaryKeys.length > 0) {
      var primarySql = "primary key(`";
      primarySql += primaryKeys.join("`, `");
      primarySql += "`)";

      sqlFields.push(primarySql);
    }

    this._sql += "(";
    this._sql += sqlFields.join(", ");
    this._sql += ")";
  }

  select(table, fields) {
    this._sql = "select ";
    var sqlFields = "*";

    if (fields instanceof Array &&
      fields.length > 0) {
      sqlFields = "`";
      sqlFields += fields.join("`, `");
      sqlFields += "`";
    }

    this._sql += sqlFields + " ";
    this._sql += "from `" + table + "` ";

    return this;
  }

  where(wheres) {
    if (!(wheres instanceof Array)) {
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

      item[0] = "`" + item[0] + "`";
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
    if (!(wheres instanceof Array)) {
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

      item[0] = "`" + item[0] + "`";
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

    if (typeof values != "object") {
      return this;
    }

    for (var field in values) {
      sqlFields.push(field);
      sqlValues.push(values[field]);
    }

    if (sqlFields.length < 1) {
      return this;
    }

    this._sql = "insert into `" + table + "` ";
    this._sql += "(`" + sqlFields.join("`, `") + "`) ";
    this._sql += "values ";
    this._sql += "('" + sqlValues.join("', '") + "')";

    return this;
  }

  update(table, values) {
    var sqlPairs = [];

    if (typeof values != "object") {
      return this;
    }

    for (var field in values) {
      sqlPairs.push(
        "`" + field + "`='" + values[field] + "'");
    }

    if (sqlPairs.length < 1) {
      return this;
    }

    this._sql = "update `" + table + "` set ";
    this._sql += sqlPairs.join(", ") + " ";

    return this;
  }

  delete(table) {
    this._sql = "delete from `" + table + "` ";

    return this;
  }

  limit(offset, size) {
    this._sql += " limit " + String(offset) + ", " + String(size);
    return this;
  }

  orderBy(field, reverse) {
    this._sql += " order by `";
    this._sql += field;
    this._sql += "` ";

    if (reverse) {
      this._sql += " desc ";

    } else {
      this._sql += " asc ";
    }

    return this;
  }

  schema(table) {
    this._sql = "PRAGMA table_info(`";
    this._sql += table;
    this._sql += "`)";

    return this;
  }

  lastInsert() {
    this._sql = "select last_insert_rowid();";
    return this;
  }

  truncate(table) {
    this._sql = "delete from `" + table + "`;";
    return this;
  }
}

export {
  Sqlite,
  Sql
};
