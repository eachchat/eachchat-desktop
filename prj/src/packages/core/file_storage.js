/**
 * FileStorage
 * @author Jakit
 * @date 2020/04/22
 */

import os from 'os';
import fs from 'fs';
import {Storage} from './storage.js';
import {environment} from '../data/environment.js';
import { Sqlite, Sql } from './sqlite.js';
import {serial,
        bool,
        integer,
        string,
        float,
        date} from './types.js';

class FileStorage extends Storage {
  constructor(config) {
    super(config);

    this.base = environment.path.base;
    this.database = null;
  }

  async connect() {
    if (this.database != null) {
      return;
    }

    var indexFilePath;

    if (!fs.existsSync(this.base)) {
      fs.mkdirSync(this.base);
    }

    if (environment.os.isWindows) {
      indexFilePath = this.base + "\\files.db";

    } else if (environment.os.isOSX) {
      indexFilePath = this.base + "/files.db";

    } else if (environment.os.isLinux) {
      indexFilePath = this.base + "/files.db";
    }

    this.indexFilePath = indexFilePath;
    this.database = new Sqlite(indexFilePath);
    await this.database.init();

    this._checkFileTable(this.database, 'files');
  }

  async disconnect() {
    await this.database.close();
    return;
  }

  _checkFileTable(database, index) {
    var sql = new Sql();
    sql.schema(index);
    var schema = database.exec(sql);

    if (schema.length > 0) {
      return;
    }

    sql = new Sql();

    sql.create('files', {
      name: "text",
      index: "text",
      suffix: "text",
      path: "text",
      description: "text",
      update_time: "integer"
    }, []);

    console.log(sql.sql);

    database.exec(sql);
    database.dump();
  }

  async getDatabase() {
    await this.connect();
    return this.database;
  }

  _getIndexPath(index) {
    var indexPath;

    if (environment.os.isWindows) {
      indexPath = this.base + "\\" + index;

    } else if (environment.os.isOSX) {
      indexPath = this.base + "/" + index;

    } else if (environment.os.isLinux) {
      indexPath = this.base + "/" + index;
    }

    if (!fs.existsSync(indexPath)) {
      fs.mkdirSync(indexPath);
    }

    return indexPath;
  }

  _getTargetPath(index, fileName) {
    var targetPath = this._getIndexPath(index);

    if (environment.os.isWindows) {
      targetPath += "\\" + fileName;

    } else if (environment.os.isOSX) {
      targetPath += "/" + fileName;

    } else if (environment.os.isLinux) {
      targetPath += "/" + fileName;
    }

    return targetPath;
  }

  async registerIndex(index, config) {
    var indexPath = this._getIndexPath(index);

    if (!fs.existsSync(indexPath)) {
      fs.mkdirSync(indexPath);
    }
  }

  _dataToFileData(data) {
    var fileData = {
      name: '',
      index: '',
      suffix: '',
      path: '',
      description: '',
      update_time: 0
    };

    if (typeof data === "undefined") {
      return fileData;
    }

    for (var item in fileData) {
      if (!data.hasOwnProperty(item)) {
        continue;
      }

      fileData[item] = data[item];
    }

    return fileData;
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

  async add(index, data) {
    var time = (new Date()).getTime();
    var sql = new Sql();
    var database = await this.getDatabase();
    var fileName = String(time);
    var targetPath = this._getTargetPath(index, fileName);
    var fileSuffix = '';

    if (data.hasOwnProperty("raw")) {
      fs.writeFileSync(targetPath, data.raw);
      data.path = targetPath;

    } else if (data.hasOwnProperty("path")) {
      fileSuffix = (/[.]/.exec(data.path)) ? /[^.]+$/.exec(data.path) : '';
      fs.copyFileSync(data.path, targetPath);

    } else {
      return;
    }

    var fileData = this._dataToFileData(data);

    fileData.name = fileName;
    fileData.index = index;
    fileData.suffix = fileSuffix;
    fileData.path = targetPath;
    fileData.description = fileData.description;
    fileData.update_time = time;

    sql.insert('files', fileData);

    var result = database.exec(sql);
    database.dump();

    return fileData;
  }

  async drop(index, data) {
    var sql = new Sql();
    var database = await this.getDatabase();

    data.index = index;

    var fileData = this._dataToFileData(data);

    sql.delete('files');

    for (var item in fileData) {
      if (!fileData[item]) {
        continue;
      }

      sql.where([item, '=', fileData[item]]);
    }

    var result = database.exec(sql);
    database.dump();
  }

  async fetch(index, data) {
    var sql = new Sql();
    var database = await this.getDatabase();
    var fileData = this._dataToFileData(data);

    sql.select(index);

    for (var item in fileData) {
      if (!fileData[item]) {
        continue;
      }

      sql.where([item, '=', fileData[item]]);
    }

    var result = database.exec(sql);

    return this.resultToList(result);
  }
}

export {
  FileStorage
};
