
import { models } from './models.js';
import { APITransaction } from './transaction.js';

const commonConfig = {
  hostname: undefined,
  apiPort: undefined,
  username: undefined,
  password: undefined
}; // config info

const commonModels = {
  login: models.Login
}; // model in here

const common = {
  config: commonConfig,

  data: commonModels,

  api: undefined,

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
    return (async (api, config, model) => {
      let result = await super.login(username, password);

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
    })(this.api, this.config, this.data.login);
  },

  get logout() {}
};

export default {
  common
}
