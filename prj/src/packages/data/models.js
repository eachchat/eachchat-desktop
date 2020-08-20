/**
 * Models for Yiqiliao
 * @author Jakit
 * 2020/03/17
 */

import fs from 'fs';
import {model, storage, types} from '../core/index.js';
import {environment} from './environment.js';
import {Config} from './sqliteutil.js'

var globalModels = {
  storage: {
    sqlite: undefined
  },

  async init(){
    if(this.storage.sqlite == undefined)
      this.storage.sqlite = this._initSqliteStorage();
    if(this.storage.sqlite == undefined)
      return;
    await this.storage.sqlite.connect(); 
    
    this.login = await (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'login',
        fields: {
          user_id: types.string,
        },
        primaryKey: 'user_id'
      });
    })();
  },

  _initSqliteStorage() {
    if (typeof environment.path.sqlite == "undefined") {
      return undefined;
    }
    let dbPath = environment.path.sqlite;
    var sqlite = new storage.SQLiteStorage({
      filename: dbPath
    });
  
    if (typeof sqlite == "undefined") {
      return undefined;
    }
  
    return sqlite;
  },
  
  get Login() {
    return this.login;
  }
}

var models = {
  storage: {
    sqlite: undefined
  },

  async init() {
    if(this.storage.sqlite == undefined)
      this.storage.sqlite = await this._initSqliteStorage();
    if(this.storage.sqlite == undefined)
      return;
    await this.storage.sqlite.connect(); 

    this.user = await (async () => {
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
          bio: types.string,
          msg_max_sequenceid: types.string,
          user_max_updatetime: types.integer,
          group_max_updatetime:types.integer,
          department_max_updatetime: types.integer,
          entry_host:        types.string,
          entry_port:        types.string,
          entry_tls:         types.integer,
          mqtt_host:         types.string,
          mqtt_port:         types.string,
          mqtt_tls:          types.integer,
          message_sound:     types.integer,
          message_notice:    types.integer,
          auto_update:       types.integer
        },
        primaryKey: 'id'
      });
    })();
    this.login = await (async () => {
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

    this.department = await (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: 'department',
        fields: {
          department_id: types.string,
          parent_id:     types.string,
          display_name:  types.string,
          description:   types.string,
          director_id:   types.string,
          admin_id:      types.string,
          del:           types.integer,
          show_order:    types.integer,
          updatetime:    types.integer
        },
        primaryKey: "department_id"
      });
    })();

    this.userInfo = await (async () => {
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
          status_description:       types.string,
          manager:                  types.bool,
          manager_id:               types.string,
          updatetime:               types.integer
        },
        primaryKey: "user_id"
      });
    })();

    this.userEmail = await (async () => {
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

    this.userAddress = await (async () => {
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

    this.userPhone = await (async () => {
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

    this.userIM = await (async () => {
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

    this.group = await (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: "group",
        fields: {
          group_id:              types.string,
          sequence_id:           types.string,
          contain_user_ids:      types.string,
          group_name:            types.string,
          group_avarar:          types.string,
          group_type:            types.integer,
          status:                types.string,
          user_id:               types.string,
          last_message_time:     types.integer,
          message_from_id:       types.string,
          message_content_type:  types.integer,
          message_content:       types.string,
          owner:                 types.string,
          group_notice:          types.string,
          notice_time:           types.integer,
          notice_userId:         types.string,
          un_read_count:         types.integer,
          draft:                 types.string,
          message_id:            types.string,
          updatetime:            types.integer
        },
        primaryKey: "group_id"
      });
    })();

    this.message = await (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: "message",
        fields: {
          message_id:         types.string,
          time_line_id:       types.string,
          group_id:           types.string,
          message_type:       types.integer,
          message_direction:  types.integer,
          message_status:     types.integer,
          message_from_id:    types.string,
          sequence_id:        types.string,
          message_timestamp:  types.integer,
          message_content:    types.string,
          file_local_path:    types.string
        },
        primaryKey: "message_id"
      });
    })();

    this.collection = await (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: "collection",
        fields: {
          collection_id:         types.string,
          collection_type:       types.integer,
          collection_content:    types.string,
          favourite_id:          types.string,
          sequence_id:           types.string,
          timeline_id:           types.string,
          timestamp:             types.integer
        },
        primaryKey: "favourite_id"
      });
    })();

    this.config = await (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: "config",
        fields: {          
          auto_start:        types.integer
        }
      });
    })();

    this.secret = await (async () => {
      return await model.Model.create({
        storage: this.storage.sqlite,
        index: "secret",
        fields: {  
          //id:          types.integer,
          arithmetic:  types.string,
          key_id:      types.string,
          key:         types.string,
          model:       types.string,
          padding:     types.string,
          vector:      types.string,   
        },
        primaryKey: "key_id"
      });
    })();
    return true;
  },

  async _initSqliteStorage() {
    if (typeof environment.path.sqlite == "undefined") {
      return undefined;
    }
    await globalModels.init();
    let userID = await Config.GetCurrentUserID();
    if(userID == undefined)
      return;
    let dbPath;
    let dbFolder;
    if(environment.os.isWindows){
      dbFolder = environment.path.base + "\\" + userID; 
      dbPath = dbFolder + "\\eachchat.db";
    }
    else{
      dbFolder = environment.path.base + "/" + userID; 
      dbPath = dbFolder + "/achchat.db"
    }
    if (!fs.existsSync(dbFolder)) {
      fs.mkdirSync(dbFolder);
    }
    var sqlite = new storage.SQLiteStorage({
      filename: dbPath
    });

    if (typeof sqlite == "undefined") {
      return undefined;
    }

    return sqlite;
  },

  get User() {
    return this.user;
  },

  get Login() {
    return this.login;
  },

  get Department() {
    return this.department;
  },

  get UserInfo() {
    return this.userInfo;
  },

  get UserEmail() {
    return this.userEmail;
  },

  get UserAddress() {
    return this.userAddress;
  },

  get UserPhone() {
    return this.userPhone;
  },

  get UserIm() {
    return this.userIM;
  },

  get Groups() {
    return this.group;
  },

  get Message(){
    return this.message;
  },

  get Collection(){
    return this.collection;
  },

  get Config(){
    return this.config;
  },

  get Secret(){
    return this.secret;
  }
}

export {
  models,
  globalModels
}
