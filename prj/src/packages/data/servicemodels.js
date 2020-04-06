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

      let userinfoarray = []
      
      for(var item in users)
      {
        for(var key in userinfomap){
          userinfovalue[userinfomap[key]] = users[item][key]
        }
        userinfoarray.push(new models.UserInfo(userinfovalue))
      }
      return userinfoarray;
    }
}

export {servicemodels}