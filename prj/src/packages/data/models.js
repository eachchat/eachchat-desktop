/**
 * Models for Yiqiliao
 * @author Jakit
 * 2020/03/17
 */

import fs from 'fs';
import {model, storage, types} from '../core/index.js';
import {environment} from './environment.js';

var models = {
  storage: {
    sqlite: undefined
  },

  init(config) {
    if (typeof config != "object") {
      config = {};
    }

    this.storage.sqlite = this._initSqliteStorage();
  },

  _initSqliteStorage() {
    if (typeof environment.path.sqlite == "undefined") {
      return undefined;
    }

    var sqlite = new storage.SQLiteStorage({
      filename: environment.path.sqlite
    });

    if (typeof sqlite == "undefined") {
      return undefined;
    }

    return sqlite;
  },

  get User() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'users',
        fields: {
          id: types.string,
          account: types.string,
          name: types.string,
          pinyin: types.string,
          nick_name: types.string,
          avatar: types.string,
          avatar_minimal: types.string,
          role_id: types.integer,
          role_name: types.string,
          language: types.integer,
          locale: types.integer,
          timezone: types.string,
          is_active: types.integer,
          job: types.string,
          bio: types.string
        },
        primaryKey: 'id'
      });
    })();
  },

  get Login() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'login',
        fields: {
          access_token: types.string,
          refresh_token: types.string,
          user_id: types.string,
          password: types.string
        },
        primaryKey: 'user_id'
      });
    })();
  },

  get Department() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'department',
        fields: {
          departmentId: types.string,
          parentId:     types.string,
          displayName:  types.string,
          description:  types.string,
          directorId:   types.string,
          adminId:      types.string,
          del:          types.integer,
          showOrder:    types.integer
        },
        primaryKey: "departmentId"
      });
    })();
  },

  get UserInfo() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'userinfo',
        fields: {
          user_id:                  types.string,
          belong_to_department_id:  types.string,
          user_name:                types.string,
          user_display_name:        types.string,
          user_nickname:            types.string,
          user_profile_url:         types.string,
          user_avatar_url:          types.string,
          user_type:                types.string,
          user_title:               types.string,
          user_preferred_language:  types.string,
          user_locale:              types.string,
          user_timezone:            types.string,
          user_active:              types.integer,
          display_name_py:          types.string,
          remark_name:              types.string,
          remark_name_py:           types.string,
          avatar_o_url:             types.string,
          avatar_t_url:             types.string,
          work_description:         types.string,
          status_description:       types.string
        },
        primaryKey: "user_id"
      });
    })();
  },

  get UserEmail() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'useremail',
        fields: {
          id:      types.integer,
          owner_user_id: types.string,
          email_value:    types.string,
          email_type:    types.string,
          email_primary: types.integer
        },
        primaryKey: "id"
      });
    })();
  },

  get UserAddress() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'useraddress',
        fields: {
          id:         types.integer,
          owner_user_id:      types.string,
          address_value:            types.string,
          address_locality:           types.string,
          address_region:             types.string
        },
        primaryKey: "id"
      });
    })();
  },

  get UserPhone() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'userphone',
        fields: {
          id:       types.integer,
          owner_user_id:  types.string,
          phone_value:    types.string,
          phone_type:     types.string        
        },
        primaryKey: "id"
      });
    })();
  },

  get UserIm() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: "userim",
        fields: {
          id:          types.integer,
          owner_user_id:  types.string,
          im_value:       types.string
        },
        primaryKey: "id"
      });
    })();
  },

  get Groups() {
    return (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: "group",
        fields: {
          group_id:              types.string,
          contain_user_ids:      types.string,
          group_name:            types.string,
          group_avarar:          types.string,
          group_type:            types.integer,
          status:                types.string,
          user_id:               types.string,
          last_message_time:     types.string,
          owner:                 types.string,
          group_notice:          types.string,
          notice_time:           types.string,
          notice_userId:         types.string,
          un_read_count:         types.integer,
          draft:                 types.string
        },
        primaryKey: "group_id"
      });
    })();
  },

  get Message(){
    return model.Model.create(
      sqliteConnection,
      "message",
      {
        message_id:         types.string,
        time_line_id:       types.string,
        group_id:           types.string,
        message_type:       types.integer,
        message_direction:  types.integer,
        message_status:     types.integer,
        message_from_id:    types.string,
        sequence_id:        types.integer,
        message_timestamp:  types.string,
        message_content:    types.string,
        message_to_id:      types.string,
        file_local_path:    types.string
      }
    )
  },
}

export {
  models
}
