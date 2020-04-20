/*jshint esversion: 6 */
import { models } from './models.js';

const servicemodels = {
  async LoginModel(result)
    {
      var loginValues = {
        access_token: undefined,
        refresh_token: undefined,
        user_id: undefined,
        password: undefined
      };

      var userValues = {
        id: undefined,
        account: undefined,
        name: undefined,
        pinyin: undefined,
        nick_name: undefined,
        avatar: undefined,
        avatar_minimal: undefined,
        role_id: undefined,
        role_name: undefined,
        language: undefined,
        locale: undefined,
        timezone: undefined,
        is_active: undefined,
        bio: undefined,
        job: undefined
      };
      var headersHave = {
        "access-token": "access_token",
        "refresh-token": "refresh_token"
      };

      var userObjectHave = {
        "id": "id",
        "displayName": "name",
        "displayNamePy": "pinyin",
        "nickName": "nick_name",
        "avatarOUrl": "avatar",
        "avatarTUrl": "avatar_minimal",
        "title": "role_name",
        "roleId": "role_id",
        "preferredLanguage": "language",
        "locale": "locale",
        "timezone": "timezone",
        "active": "is_active",
        "statusDescription": "bio",
        "title":"job"
      };

      for (let key in headersHave) {
        if (key in result.headers) {
          loginValues[headersHave[key]] = result.headers[key];
        }
      }

      for (let key in userObjectHave) {
        if (key in result.data.obj) {
          userValues[userObjectHave[key]] = result.data.obj[key];
        }
      }
      const LoginModel = await models.Login;
      const UserModel = await models.User;
      
      let loginmodel = new LoginModel(loginValues);
      let selfusermodel = new UserModel(userValues);
      
      return [loginmodel, selfusermodel];
    },

    async DepartmentsModel(department)
    {
      var departmentvalue={
        departmentId: undefined,
        parentId:     undefined,
        displayName:  undefined,
        description:  undefined,
        directorId:   undefined,
        adminId:      undefined,
        del:          undefined,
        showOrder:    undefined
      }
  
      var responsemap = 
      {
        "id" : "departmentId",
        "parentId" : "parentId",
        "displayName" : "displayName",
        "description" : "description",
        "directorId" : "directorId",
        "adminId" : "adminId",
        "del" : "del",
        "showOrder" : "showOrder"
      }
      
      for(var key in responsemap){
        departmentvalue[responsemap[key]] = department[key]
      }
      const DepartModelClass = await models.Department;
      return new DepartModelClass(departmentvalue)
    },

    async UsersModel(useritem){
      var userinfovalue={
        user_id:                  undefined,
        belong_to_department_id:  undefined,
        user_name:                undefined,
        user_display_name:        undefined,
        user_nickname:            undefined,
        user_profile_url:         undefined,
        user_avatar_url:          undefined,
        user_type:                undefined,
        user_title:               undefined,
        user_preferred_language:  undefined,
        user_locale:              undefined,
        user_timezone:            undefined,
        user_active:              undefined,
        display_name_py:          undefined,
        remark_name:              undefined,
        remark_name_py:           undefined,
        avatar_o_url:             undefined,
        avatar_t_url:             undefined,
        work_description:         undefined,
        status_description:       undefined
      }
  
      var userinfomap = 
      {
        "id":                 "user_id",                
        "departmentId":       "belong_to_department_id", 
        "userName":           "user_name",               
        "displayName":        "user_display_name",       
        "nickName":           "user_nickname",      
        "profileUrl":         "user_profile_url",        
        "userType":           "user_type",               
        "title":              "user_title",              
        "preferredLanguage":  "user_preferred_language", 
        "locale":             "user_locale",             
        "timezone":           "user_timezone",           
        "active":             "user_active",             
        "displayNamePy":      "display_name_py",         
        "remarkName":         "remark_name",             
        "remarkNamePy":       "remark_name_py",          
        "avatarOUrl":         "avatar_o_url",            
        "avatarTUrl":         "avatar_t_url",            
        "active":             "user_active",             
        "workDescription":    "work_description",       
        "statusDescription":  "status_description"
      }

      var useremailvalue = {
        owner_user_id: undefined,
        email_value:    undefined,
        email_type:    undefined,
        email_primary: undefined
      };

      var useremailmap = {
        "id":       "owner_user_id",
        "value":    "email_value",
        "type":     "email_type",
        "primary":  "email_primary",
      };

      var useraddressvalue = {
        owner_user_id:      undefined,
        address_value:            undefined,
        address_locality:           undefined,
        address_region:             undefined
      };

      var useraddressmap = {
        "id":"owner_user_id",
        "address": "address_value",
        "locale":"address_locality",
        "registrationId": "address_region"
      };

      var userphonevalue = {
        owner_user_id: undefined,
        phone_value: undefined,
        phone_type: undefined        
      };

      var userphonemap = {
        "id":"owner_user_id",
        "value": "phone_value",
        "type": "phone_type",
      };

      var userimvalue = {
        owner_user_id:  undefined,
        im_value:       undefined
      };

      var userimmap = {
        "id":    "owner_user_id",
        "value": "im_value"
      };

      let userinfomodel;
      let useremailmodel;
      let useraddressmodel;
      let userphonemodel;
      let userimmodel;

      let useritem_email = useritem.emails;
      let useritem_phone = useritem.phoneNumbers;
      if(!this.ItemInvalid(useritem_email))
      {
        return undefined;
      }

      if(!this.ItemInvalid(useritem_phone))
      {
        return undefined;
      }
      
      for(var infokey in userinfomap){
        userinfovalue[userinfomap[infokey]] = useritem[infokey];
      }

      for(var emailitem in useritem_email)
      {
        for(var emailkey in useremailmap){
          useremailvalue[useremailmap[emailkey]] = useritem_email[emailitem][emailkey];
        }
        useremailvalue.owner_user_id = userinfovalue.user_id;
      }  

      for( var addresskey in useraddressmap){
        useraddressvalue[useraddressmap[addresskey]] = useritem[addresskey];
      }

      for(var phoneitem in useritem_phone)
      {
        for(var phonekey in userphonemap)
        {
          userphonevalue[userphonemap[phonekey]] = useritem_phone[phoneitem][phonekey];
        }
        userphonevalue.owner_user_id = userinfovalue.user_id;
      }

      for(var imkey in userimmap)
      {
        userimvalue[userimmap[imkey]] = useritem[imkey];
      }
      const infoModel = await models.UserInfo;
      userinfomodel = await new infoModel(userinfovalue);

      const emailModel = await models.UserEmail;
      useremailmodel = await new emailModel(useremailvalue);

      const addressModel = await models.UserAddress;
      useraddressmodel = await new addressModel(useraddressvalue);

      const phoneModel = await models.UserPhone;
      userphonemodel = await new phoneModel(userphonevalue);
    
      const imModel = await models.UserIm;
      userimmodel = await new imModel(userimvalue);
      
      return [userinfomodel, useremailmodel, useraddressmodel, userphonemodel, userimmodel];
    },

    async GroupsModel(groupitem)
    {
      var groupvalue = {
        group_id :              undefined,
        contain_user_ids :      undefined,
        group_name :            undefined,
        group_avarar :          undefined,
        group_type :            undefined,
        status :                undefined,
        user_id :               undefined,
        last_message_time :     undefined,
        owner :                 undefined,
        group_notice :          undefined,
        notice_time :           undefined,
        notice_userId :         undefined,
        un_read_count :         undefined,
        draft :                 undefined
      }

      var groupmap = 
      {
        "groupId":  "group_id",          
        "userIds" : "contain_user_ids",  
        "groupName": "group_name",        
        "groupAvatar": "group_avarar",     
        "groupType": "group_type",        
        "status": "status",
        "owner": "owner",             
        "groupNotice": "group_notice",     
        "noticeTime": "notice_time",       
        "noticeUserId": "notice_userId"
      }
      var messagemap = {                   
        "userId": "user_id",        
        "timestamp": "last_message_time"     
      }
      var objmap = {
        "noReaderCount": "un_read_count" 
      }
      let groupmodel;
      
      let group_message = groupitem["message"]
      let group_group = groupitem["group"]
      if(!this.ItemInvalid(group_message))
      {
        return undefined
      }
      if(!this.ItemInvalid(group_group))
      {
        return undefined
      }

      for(let key in groupmap)
      {
        groupvalue[groupmap[key]] = groupitem["group"][key]
      }

      for(let key in messagemap)
      {
          groupvalue[messagemap[key]] = groupitem["message"][key]
      }

      for(let key in objmap)
      {
        groupvalue[objmap[key]] = groupitem[key]
      }

      groupmodel = await new (await models.Groups)(groupvalue)
      return groupmodel
    },

    ItemInvalid(item)
    {
      if(item == "" || item == null || item == undefined)
      {
        return false
      }
      return true
    },

    async MessageModel(message)
    {
      var messgevalue = {
        message_id:         undefined,
        time_line_id:       undefined,
        group_id:           undefined,
        message_type:       undefined,
        message_direction:  1,
        message_status:     undefined,
        message_from_id:    undefined,
        sequence_id:        undefined,
        message_timestamp:  undefined,
        message_content:    undefined,
        message_to_id:      undefined,
        file_local_path:    undefined
      }

      var messagemap = {
        "mesId": "message_id",
        "timelineId": "time_line_id",
        "groupId": "group_id",
        "msgContentType": "message_type",
        "fromId": "message_from_id",
        "sequenceId": "sequence_id",
        "timestamp": "message_timestamp",
        "content": "message_content",
        "msgId": "message_to_id"
      }

      for(let key in messagemap)
      {
        if(key == "content")
        {
          messgevalue[messagemap[key]] = JSON.stringify(message[key])  
        }
        else
        {
          messgevalue[messagemap[key]] = message[key]
        }
      }
      return await new models.Message(messgevalue)
    }
}

export {servicemodels}