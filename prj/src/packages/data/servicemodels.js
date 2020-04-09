import { models } from './models.js';

const servicemodels = {
    LoginModel(result)
    {
      var loginValues = {
        id: undefined,
        access_token: undefined,
        refresh_token: undefined,
        account: undefined,
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
        bio: undefined
      };
      var headersHave = {
        "access-token": "access_token",
        "refresh-token": "refresh_token"
      };

      var userObjectHave = {
        "aId": "id",
        "id": "userid",
        "displayName": "name",
        "displayNamePy": "pinyin",
        "nickName": "nick_name",
        "avatarOUrl": "avatar",
        "avatarTUrl": "avatar_minimal",
        "title": "role_name",
        "preferredLanguage": "language",
        "locale": "locale",
        "timezone": "timezone",
        "active": "is_active",
        "statusDescription": "bio"
      };

      for (var key in headersHave) {
        if (key in result.headers) {
          loginValues[headersHave[key]] = result.headers[key];
        }
      }

      for (var key in userObjectHave) {
        if (key in result.data.obj) {
          userValues[userObjectHave[key]] = result.data.obj[key];
        }
      }
      return [new models.Login(loginValues), new models.User(userValues)];
    },

    DepartmentsModel(departments)
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
      let tmparray = []

      for(var item in departments)
      {
        for(var key in responsemap){
          departmentvalue[responsemap[key]] = departments[item][key]
        }
        tmparray.push(new models.Department(departmentvalue))
      }
      return tmparray;
    },

    UsersModel(users){
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
        user_active:              undefined,
        work_description:         undefined,
        status_description:       undefined
      }
  
      var userinfomap = 
      {
        "id":                 "user_id",                
        "departmentId":       "belong_to_department_id", 
        "userName":           "user_name",               
        "userName":           "user_display_name",       
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
        email_id:      undefined,
        owner_user_id: undefined,
        email_value:    undefined,
        email_type:    undefined,
        email_primary: undefined
      }

      var useremailmap = {
        "id":       "owner_user_id",
        "value":    "email_value",
        "type":     "email_type",
        "primary":  "email_primary",
      }

      var useraddressvalue = {
        address_id:         undefined,
        owner_user_id:      undefined,
        address_value:            undefined,
        address_locality:           undefined,
        address_region:             undefined
      }

      var useraddressmap = {
        "id":"owner_user_id",
        "address": "address_value",
        "locale":"address_locality",
        "registrationId": "address_region"
      }

      var userphonevalue = {
        phone_id: undefined,
        owner_user_id: undefined,
        phone_value: undefined,
        phone_type: undefined        
      }

      var userphonemap = {
        "id":"owner_user_id",
        "value": "phone_value",
        "type": "phone_type",
      }

      var userimvalue = {
        im_id:          undefined,
        owner_user_id:  undefined,
        im_value:       undefined
      }

      var userimmap = {
        "id":    "owner_user_id",
        "value": "im_value"
      }
      
      let useritem
      let useritem_email
      let useritem_phone

      let userinfoarray = []
      let useremailarray = []
      let useraddressarray = []
      let userphonearray = []
      let userimarray = []

      for(var item in users)
      {
        useritem = users[item]
        useritem_email = useritem["emails"]
        useritem_phone = useritem["phoneNumbers"]
        if(!this.ItemInvalid(useritem_email))
        {
          continue;
        }

        if(!this.ItemInvalid(useritem_phone))
        {
          continue;
        }
        
        for(var infokey in userinfomap){
          userinfovalue[userinfomap[infokey]] = useritem[infokey]
        }

        for(var emailitem in useritem_email)
        {
          for(var emailkey in useremailmap){
            useremailvalue[useremailmap[emailkey]] = useritem_email[emailitem][emailkey]
          }
          useremailvalue.owner_user_id = userinfovalue.user_id
        }  

        for( var addresskey in useraddressmap){
          useraddressvalue[useraddressmap[addresskey]] = useritem[addresskey]
        }

        for(var phoneitem in useritem_phone)
        {
          for(var phonekey in userphonemap)
          {
            userphonevalue[userphonemap[phonekey]] = useritem_phone[phoneitem][phonekey]
          }
          userphonevalue.owner_user_id = userinfovalue.user_id
        }

        for(var imkey in userimmap)
        {
          userimvalue[userimmap[imkey]] = useritem[imkey]
        }

        userinfoarray.push(new models.UserInfo(userinfovalue))
        useremailarray.push(new models.UserEmail(useremailvalue))
        useraddressarray.push(new models.UserAddress(useraddressvalue))
        userphonearray.push(new models.UserPhone(userphonevalue))
        userimarray.push(new models.UserIm(userimvalue))
      }
      return [userinfoarray, useremailarray, useraddressarray, userphonearray, userimarray];
    },

    GroupsModel(result)
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
      let groupitem;
      let grouparray = [];
      let groupmodel;
      for(let item in result.data.results)
      {
        groupitem = result.data.results[item]
        let group_message = groupitem["message"]
        let group_group = groupitem["group"]
        if(!this.ItemInvalid(group_message))
        {
          continue
        }
        if(!this.ItemInvalid(group_group))
        {
          continue
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
        groupmodel = new models.Groups(groupvalue)
        grouparray.push(groupmodel)
      }
      return grouparray
    },

    ItemInvalid(item)
    {
      if(item == "" || item == null || item == undefined)
      {
        return false
      }
      return true
    },

    MessageModel(message)
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
      return new models.Message(messgevalue)
    }
}

export {servicemodels}