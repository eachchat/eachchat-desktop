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

  var result = initSqlJs().then(SQL => {
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
};

Sqlite.prototype.exec = function(sql) {
  if (typeof this.db === 'undefined') {
    return undefined;
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

export {
  Sqlite
}
