import { models } from './models.js'
import { APITransaction } from './transaction.js'

class CommonService {
  constructor(protocal, ip) {
    this.apiTransaction = new APITransaction(protocal, ip);
  }

  async login(username, password) {
    let result = await this.apiTransaction.login(username, password);

    var loginValues = {
      id: undefined,
      access_token: undefined,
      refresh_token: undefined,
      account: username,
      password: password
    };

    var userValues = {
      id: undefined,#
      account: username,
      name: undefined,#
      pinyin: undefined,#
      nick_name: undefined,#
      avatar: undefined,#
      avatar_minimal: undefined,#
      role_id: undefined,#
      role_name: undefined,#
      language: undefined,
      locale: undefined,
      timezone: undefined,
      is_active: undefined,
      bio: undefined
    };

    if (!result.ok || !result.success) {
      return undefined;
    }

    if (!("obj" in result.data)) {
      return undefined;
    }

    var headersHave = ["access-token", "refresh-token"];
    var userObjectHave = [
      "aId",
      "id",
      "userName",
      "displayName",
      "displayNamePy",
      "nickName",
      "avatarOUrl",
      "avatarTUrl",
      "title",
      "preferredLanguage",
      "locale",
      "timezone",
      "active",
      "statusDescription"];

    for (var i = 0; i < headersHave.length; i++) {
      // if (headersHave[i]
    }
  }

  logout()
  {
      return this.apiTransaction.Logout().then(function(response){
          console.log(response)
      })
  }

  GetUserinfo(filters_value, perPage_value, sortOrder_value, sequenceId_value)
  {
      return this.apiTransaction.GetUserinfo(filters_value, perPage_value, sortOrder_value, sequenceId_value).then(function(response){
          console.log(response)
      })
  }
}

export {
  DbModels
}
