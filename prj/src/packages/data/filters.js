/**
 * Filters
 * @author Jakit
 * @date 2020/04/09
 */

const filters = {
  filter(input, rule, output) {
    if (typeof input != "object") {
      input = {};
    }

    if (typeof output != "object") {
      output = {};
    }

    for (var key in rule) {
      if (key in data) {
        output[rule[key]] = input[key];
      }
    }

    return output
  },

  login(result) {
    var data = {
      access_token: undefined,
      refresh_token: undefined,
      account: undefined,
      password: undefined
    };

    var rule = {
      "access-token": "access_token",
      "refresh-token": "refresh_token"
    };

    return this.filter(result.headers, rule, data);
  },

  user(result) {
    var data = {
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

    var rule = {
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

    return this.filter(result.data.obj, rule, data);
  },

  department(result) {
    var data = {
      departmentId: undefined,
      parentId:     undefined,
      displayName:  undefined,
      description:  undefined,
      directorId:   undefined,
      adminId:      undefined,
      del:          undefined,
      showOrder:    undefined
    };

    var rule = {
      "id": "departmentId",
      "parentId": "parentId",
      "displayName": "displayName",
      "description": "description",
      "directorId": "directorId",
      "adminId": "adminId",
      "del": "del",
      "showOrder": "showOrder"
    };

    var list = [];

    for (var i = 0; i < result.data.results.length; i++) {
      var resultItem = result.data.results[i];
      var item = this.filter(resultItem, rule, data);

      list.push(item);
    }

    return list;
  }
}

export {
  login
}
