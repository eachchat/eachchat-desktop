/**
 * Test module
 * @author jakit
 * @date 2020/03/04
 */

import * as loader from './loader.js';
import * as model from './model.js';
import * as sqlite from './sqlite.js';
import * as http from './http.js';
import {Storage} from './storage.js'
import * as sqlite_storage from './sqlite_storage.js'

const storage = Object.assign(
  {Storage: Storage},
  sqlite_storage);

const core = {
  loader: loader,
  model: model,
  database: {
    sqlite: sqlite,
  },
  storage: storage,
  net: http
};

loader.loading("core", core);

export {
  core
}
