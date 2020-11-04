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
        job: undefined,
        msg_max_sequenceid: 0,
        user_max_updatetime: 0,
        group_max_updatetime:0,
        department_max_updatetime: 0,
        entry_host:        undefined,
        entry_port:        undefined,
        entry_tls:         undefined,
        mqtt_host:         undefined,
        mqtt_port:         undefined,
        mqtt_tls:          undefined,
        message_sound:     undefined,
        message_notice:    undefined,
        auto_update:       undefined
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
        department_id: undefined,
        parent_id:     undefined,
        display_name:  undefined,
        description:  undefined,
        director_id:   undefined,
        admin_id:      undefined,
        del:          undefined,
        show_order:    undefined,
        updatetime:     undefined,
      }
  
      var responsemap = 
      {
        "id" : "department_id",
        "parentId" : "parent_id",
        "displayName" : "display_name",
        "description" : "description",
        "directorId" : "director_id",
        "adminId" : "admin_id",
        "del" : "del",
        "showOrder" : "show_order",
        "updateTimestamp": "updatetime"
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
        status_description:       undefined,
        manager:                  undefined,
        manager_id:               undefined,
        updatetime:               undefined
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
        "workDescription":    "work_description",       
        "statusDescription":  "status_description",
        "manager":            "manager",
        "managerId":          "manager_id",
        "updateTimestamp":    "updatetime"
      }      

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
      let useraddressmodel;
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

      let userEmailValues = [];
      for(var emailitem in useritem_email)
      {
        var useremailvalue = {
          owner_user_id: undefined,
          email_value:    undefined,
          email_type:    undefined,
          email_primary: undefined
        };
        for(var emailkey in useremailmap){
          useremailvalue[useremailmap[emailkey]] = useritem_email[emailitem][emailkey];
        }
        useremailvalue.owner_user_id = userinfovalue.user_id;
        userEmailValues.push(useremailvalue);
      }  

      for( var addresskey in useraddressmap){
        useraddressvalue[useraddressmap[addresskey]] = useritem[addresskey];
      }

      let userPhoneValues = [];
      for(var phoneitem in useritem_phone)
      {
        var userphonevalue = {
          owner_user_id: undefined,
          phone_value: undefined,
          phone_type: undefined        
        };
        for(var phonekey in userphonemap)
        {
          userphonevalue[userphonemap[phonekey]] = useritem_phone[phoneitem][phonekey];
        }
        userphonevalue.owner_user_id = userinfovalue.user_id;
        userPhoneValues.push(userphonevalue);
      }

      for(var imkey in userimmap)
      {
        userimvalue[userimmap[imkey]] = useritem[imkey];
      }
      const infoModel = await models.UserInfo;
      userinfomodel = await new infoModel(userinfovalue);

      let userEmailModels = [];
      const emailModel = await models.UserEmail;
      for(let index in userEmailValues){
        let useremailmodel = await new emailModel(userEmailValues[index]);
        userEmailModels.push(useremailmodel);
      }

      const addressModel = await models.UserAddress;
      useraddressmodel = await new addressModel(useraddressvalue);

      const phoneModel = await models.UserPhone;
      let userPhoneModels = [];
      for(let index in userPhoneValues){
        let userphonemodel = await new phoneModel(userPhoneValues[index]);
        userPhoneModels.push(userphonemodel);
      }
    
      const imModel = await models.UserIm;
      userimmodel = await new imModel(userimvalue);
      
      return [userinfomodel, userEmailModels, useraddressmodel, userPhoneModels, userimmodel];
    },

    async GroupsModel(groupitem)
    {
      var groupvalue = {
        group_id :              undefined,
        sequence_id:            undefined,
        contain_user_ids :      undefined,
        group_name :            undefined,
        group_avarar :          undefined,
        group_type :            undefined,
        status :                undefined,
        user_id :               undefined,
        last_message_time :     undefined,
        message_from_id:        undefined,
        message_content_type:   undefined,
        message_content:        undefined,
        owner :                 undefined,
        group_notice :          undefined,
        notice_time :           undefined,
        notice_userId :         undefined,
        un_read_count :         undefined,
        draft :                 undefined,
        message_id:             undefined,
        updatetime:             undefined,
        key_id:                 undefined
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
        "noticeUserId": "notice_userId",
        "updateTime":   "updatetime"
      }
      var messagemap = {                   
        "userId": "user_id",    
        "sequenceValue": "sequence_id", 
        "fromId":     "message_from_id",  
        "msgContentType":"message_content_type",
        "timestamp": "last_message_time",
        "msgId":      "message_id",
        "secretId":   "key_id"
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
        groupvalue[groupmap[key]] = groupitem["group"][key];
      }

      for(let key in messagemap)
      {
        groupvalue[messagemap[key]] = groupitem["message"][key];
      }
      groupvalue["message_content"] = JSON.stringify(groupitem["message"]["content"]);  

      for(let key in objmap)
      {
        groupvalue[objmap[key]] = groupitem[key]
      }
      
        
      groupmodel = await new (await models.Groups)(groupvalue)
      return groupmodel;
    },

    async MessageGroup(value){
      let groupvalue = {
        group_id:           undefined,
        contain_user_ids:   undefined,
        group_name:         undefined,
        group_avarar:       undefined,
        group_type :        102,
        status:             undefined,
        owner:              undefined,
        group_notice:       undefined,
        notice_time:        undefined,
        notice_userId:      undefined,
        last_message_time:  undefined,
        sequence_id:        undefined,
        message_id:         undefined,
        message_content_type: undefined,
        message_from_id:    undefined,
        message_content:    undefined,
        key_id:             undefined
      }

      var groupmap = 
      {
        "groupId":  "group_id",  
        "content":  "message_content",
        "fromId" : "message_from_id",  
        "msgContentType": "message_content_type",        
        "msgId": "message_id",     
        "sequenceValue": "sequence_id",             
        "timestamp": "last_message_time",
        "secretId":   "key_id" 
      }
      for(let key in groupmap)
      {
        groupvalue[groupmap[key]] = value[key];
      }
      groupvalue.message_content = JSON.stringify(value.content);

      let groupmodel = await new (await models.Groups)(groupvalue);
      return groupmodel;
    },

    async IncrementGroupModel(value){
      let groupvalue = {
        group_id:           undefined,
        contain_user_ids:   undefined,
        group_name:         undefined,
        group_avarar:       undefined,
        group_type :        undefined,
        status:             undefined,
        owner:              undefined,
        group_notice:       undefined,
        notice_time:        undefined,
        notice_userId:      undefined,
        updatetime:         undefined
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
        "noticeUserId": "notice_userId",
        "updateTime":   "updatetime"
      }
      for(let key in groupmap)
      {
        groupvalue[groupmap[key]] = value[key];
      }
      let groupmodel = await new (await models.Groups)(groupvalue);
      return groupmodel;
    },

    UpdateGroupGroup(groupmodel, groupvalue)
    {
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
        "noticeUserId": "notice_userId",
        "updateTime": "updatetime"
      }
      return this.UpdateGroup(groupmodel, groupvalue, groupmap);
    },

    UpdateGroupMessage(groupmodel, messagevalue){
      var messagemap = {                   
        "userId": "user_id",    
        "sequenceValue": "sequence_id", 
        "fromId":     "message_from_id",  
        "msgContentType":"message_content_type",
        "timestamp": "last_message_time",
        "msgId":      "message_id",
        "content":  "message_content",
        "secretId":   "key_id"
      }
      return this.UpdateGroup(groupmodel, messagevalue, messagemap);
    },

    UpdateGroup(model, value, map){
      for(let key in map)
      {
        if(key == 'content')
        {
          model[map[key]] = JSON.stringify(value[key]);
        }
        else
        {
          model[map[key]] = value[key];
        }
      }
      return model;
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
      let messagemodel;
      var messagevalue = {
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
        file_local_path:    undefined,
        key_id:             undefined
      }

      var messagemap = {
        "msgId": "message_id",
        "timelineId": "time_line_id",
        "groupId": "group_id",
        "msgContentType": "message_type",
        "fromId": "message_from_id",
        "sequenceValue": "sequence_id",
        "timestamp": "message_timestamp",
        "content": "message_content",
        "secretId":   "key_id"
      }

      for(let key in messagemap)
      {  
        messagevalue[messagemap[key]] = message[key];
      }
      messagevalue["message_content"] = JSON.stringify(message["content"]);  
      messagemodel = await new(await models.Message)(messagevalue);
      return messagemodel;
    },

    async CollectionModel(value){
      let collectionmodel;
      var collectionvalue = {
        collection_id:         undefined,
        collection_type:       undefined,
        collection_content:    undefined,
        favourite_id:          undefined,
        sequence_id:           undefined,
        timeline_id:           undefined,
        timestamp:             undefined
      }

      var collectionmap = {
        "collectionId": "collection_id",
        "collectionType": "collection_type",
        "content": "collection_content",
        "favoriteId": "favourite_id",
        "sequenceValue": "sequence_id",
        "timelineId": "timeline_id",
        "timestamp": "timestamp"
      }

      for(let key in collectionmap)
      {  
        collectionvalue[collectionmap[key]] = value[key];
      }
      collectionvalue["collection_content"] = JSON.stringify(value["content"]);  
      collectionmodel = await new(await models.Collection)(collectionvalue);
      return collectionmodel; 
    },

    async SecretModel(secret){
      let secretValue = {
        arithmetic: undefined,
        key_id: undefined,
        key:    undefined,
        model: undefined,
        padding: undefined,
        vector: undefined
      };

      var secretMap = {
        "arithmetic": "arithmetic",
        "id": "key_id",
        "key": "key",
        "model": "model",
        "padding": "padding",
        "sequenceValue": "sequence_id",
        "vector": "vector"
      };

      for(let key in secret)
      {  
        secretValue[secretMap[key]] = secret[key];
      }
      let secretModel = await new(await models.Secret)(secretValue);
      return secretModel; 
    },

    async ContactModel(contactInfo){
      let contactValue = {
        user_id:          null,
        eachchat_user_id: null,
        display_name:     null,
        avatar_url:       null,
        email:            null,
        mobile:           null,
        telephone:        null,
        company:          null,
        title:            null,
        updatetime:       null,
      };

      var contactMap = {
        "contactMatrixId": "user_id",
        "userId": "eachchat_user_id",
        "contactRemarkName": "display_name",
        "avatarUrl": "avatar_url",
        "contactMobile": "email",
        "contactTelephone": "mobile",
        "contactTelephone": "telephone",
        "contactCompany": "company",
        "contactTitle": "title",
        "updateTimestamp":"updatetime"
      };

      for(let key in contactInfo)
      {  
        contactValue[contactMap[key]] = contactInfo[key];
      }
      let contactModel = await new(await models.Contact)(contactValue);
      return contactModel;
    }
}

export {servicemodels}