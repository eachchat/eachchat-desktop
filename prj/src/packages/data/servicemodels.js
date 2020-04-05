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
    }
}

export {servicemodels}