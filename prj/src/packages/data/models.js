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
  },

  get Department(){
    return model.Model.create(
      sqliteConnection,
      'department',
      {
        departmentId: types.string,
        parentId:     types.string,
        displayName:  types.string,
        description:  types.string,
        directorId:   types.string,
        adminId:      types.string,
        del:          types.integer,
        showOrder:    types.integer
      }
    )
  },

  get UserInfo(){
    return model.Model.create(
      sqliteConnection,
      'userinfo',
      {
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
        user_active:              types.integer,
        work_description:         types.string,
        status_description:       types.string
      }
    )
  },

  get UserEmail(){
    return model.Model.create(
      sqliteConnection,
      'useremail',
      {
        email_id:      types.integer,
        owner_user_id: types.string,
        email_value:    types.string,
        email_type:    types.string,
        email_primary: types.integer
      }
    )
  },

  get UserAddress(){
    return model.Model.create(
      sqliteConnection,
      'useraddress',
      {
        address_id:         types.integer,
        owner_user_id:      types.string,
        address_value:            types.string,
        address_locality:           types.string,
        address_region:             types.string
      }
    )
  },

  get UserPhone(){
    return model.Model.create(
      sqliteConnection,
      'userphone',
      {
        phone_id:       types.integer,
        owner_user_id:  types.string,
        phone_value:    types.string,
        phone_type:     types.string        
      }
    )
  },

  get UserIm(){
    return model.Model.create(
      sqliteConnection,
      "userim",
      {
        im_id:          types.integer,
        owner_user_id:  types.string,
        im_value:       types.string
      }
    )
  },

  get Groups(){
    return model.Model.create(
      sqliteConnection,
      "group",
      {
        group_id :              types.string,
        contain_user_ids :      types.string,
        group_name :            types.string,
        group_avarar :          types.string,
        group_type :            types.integer,
        status :                types.string,
        user_id :               types.string,
        last_message_time :     types.string,
        owner :                 types.string,
        group_notice :          types.string,
        notice_time :           types.string,
        notice_userId :         types.string,
        un_read_count :         types.integer,
        draft :                 types.string
      }
    )
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
