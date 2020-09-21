/**
 * FileModel
 * @author Jakit
 * @date 2020/04/22
 */

import {serial,
        bool,
        integer,
        string,
        float,
        date} from './types.js';
import {Model} from './model';
import {FileStorage} from './file_storage.js';

class FileModel extends Model {
  static async create(config) {
    if (typeof config != "object") {
      return null;
    }

    config.fields = {
      path: string
    };

    if ("storage" in config &&
      config.storage instanceof FileStorage) {
      storage = config.storage;
    }

    return await Model.create(config);
  }
}
