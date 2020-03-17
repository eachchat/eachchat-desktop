/**
 * Models for Yiqiliao
 * @author Jakit
 * 2020/03/17
 */

import {model, sqlite} from '../core/index.js'

const sqliteConnection = new Sqlite('/tmp/test.db');

const User = model.Model.create(
  sqliteConnection,
  'users',
  {
    id: model.integer,
    account: model.string,
    name: model.string
    nick_name: model.string
    avatar: model.string
    avatar_minimal: model.string
    role_id: model.integer
    language: model.integer
    locale: model.integer
    timezone: model.string
    is_active: model.integer
    pinyin: model.string
    remark: model.string
    remark_pinyin: model.string
    job: model.string
    bio: model.string
  },
  'id',
  'id'
)

const Login = model.Model.create(
  sqliteConnection,
  'login',
  {
    id: model.integer
    access_token: model.text
    refresh_token: model.text
    account: model.text
    password: model.text
  },
  'id',
  'id'
);

export {
  User,
  Login
}
