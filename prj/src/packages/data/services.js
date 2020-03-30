
import { models } from './models.js';
import { APITransaction } from './transaction.js';

const commonConfig = {
  hostname: undefined,
  apiPort: undefined,
  username: undefined,
  password: undefined
}; // config info

const commonData = {
  login: undefined,
  self: undefined
}; // model in here

const common = {
  config: commonConfig,

  data: commonData,

  api: undefined,

  accessToken: undefined,

  refreshToken: undefined,

  userId: undefined,

  init(config) {
    if ("hostname" in config) {
      this.config.hostname = config.hostname;
    }

    if ("apiPort" in config) {
      this.config.apiPort = config.apiPort;
    }

    if ("username" in config) {
      this.config.username = config.username;
    }

    if ("password" in config) {
      this.config.password = config.password;
    }

    this.api = new APITransaction(this.config.hostname, this.config.hostname);
  },

  get login() {
    return (async (api, config, data, LoginModel, UserModel) => {
      let result = await api.login(config.username, config.password);

      var loginValues = {
        id: undefined,
        access_token: undefined,
        refresh_token: undefined,
        account: username,
        password: password
      };

      var userValues = {
        id: undefined,
        account: username,
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

      if (!result.ok || !result.success) {
        return undefined;
      }

      if (!("obj" in result.data)) {
        return undefined;
      }

      var headersHave = {
        "access-token": "access_token",
        "refresh-token": "refresh_token"
      };

      var userObjectHave = {
        "aId": "id",
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

      this.accessToken = loginValues['access_token']
      this.refreshToken = loginValues['refresh_token']
      this.userId = userValues['id']

      data.login = new LoginModel(loginValues);
      data.self = new UserModel(userValues);

      return {
        login: data.login,
        self: data.self
      };

    })(this.api, this.config, this.data, models.Login, models.User);
  },

  get logout() {
    return this.api.logout(this.accessToken)
  },

  async getUserinfo(filters, perPage, sortOrder, sequenceId){
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    // You should better mock data to Model before return
    return await this.api.getUserinfo(this.data.login.access_token, filters, perPage, sortOrder, sequenceId);
  }
};

export default {
  common
}
