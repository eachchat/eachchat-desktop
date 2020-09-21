/**
 * Core modules
 * @author Jakit
 * @date 2020/03/04
 */

import * as loader from './loader.js';
import * as model from './model.js';
import * as sqlite from './sqlite.js';
import * as http from './http.js';
import * as types from './types.js';
import {Storage} from './storage.js';
import * as sqlite_storage from './sqlite_storage.js';
import {FileStorage} from './file_storage.js'

const storage = Object.assign(
  {Storage: Storage},
  sqlite_storage);

const net = Object.assign(
  {}, http);

const database = {
  sqlite: sqlite
};

export {
  loader,
  model,
  types,
  database,
  storage,
  net,
  FileStorage
}
