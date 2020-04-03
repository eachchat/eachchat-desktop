/**
 * Models for Yiqiliao
 * @author Jakit
 * 2020/03/17
 */

import {model, storage, types} from '../core/index.js'

const sqliteConnection = new storage.SQLiteStorage({
  filename: '/tmp/test.db'});

var models = {
  get User() {
    return model.Model.create(
      sqliteConnection,
      'users',
      {
        id: types.integer,
        userid: types.string,
        account: types.string,
        name: types.string,
        nick_name: types.string,
        avatar: types.string,
        avatar_minimal: types.string,
        role_id: types.integer,
        language: types.integer,
        locale: types.integer,
        timezone: types.string,
        is_active: types.integer,
        pinyin: types.string,
        remark: types.string,
        remark_pinyin: types.string,
        job: types.string,
        bio: types.string
      }
    );
  },

  get Login() {
    return model.Model.create(
      sqliteConnection,
      'login',
      {
        id: types.integer,
        access_token: types.string,
        refresh_token: types.string,
        account: types.string,
        password: types.string
      }
    );
  }
}

export {
  models
}
