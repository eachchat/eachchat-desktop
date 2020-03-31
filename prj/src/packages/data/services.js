
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
  selfUser: undefined
}; // model in here

const common = {
  config: commonConfig,

  data: commonData,

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

    this.api = new APITransaction(this.config.hostname, this.config.apiPort);
  },

  get login() {
    return (async (api, config, data, LoginModel, UserModel) => {
      let result = await api.login(config.username, config.password);

      var loginValues = {
        id: undefined,
        access_token: undefined,
        refresh_token: undefined,
        account: config.username,
        password: config.password
      };

      var userValues = {
        id: undefined,
        account: config.username,
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

      data.login = new LoginModel(loginValues);
      data.selfUser = new UserModel(userValues);

      return {
        login: data.login,
        selfUser: data.selfUser
      };

    })(this.api, this.config, this.data, models.Login, models.User);
  },

  async logout() {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }
    return await this.api.logout(this.data.login.access_token)
  },

  async getUserinfo(filters, perPage, sortOrder, sequenceId){
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    // You should better mock data to Model before return
    return await this.api.getUserinfo(this.data.login.access_token, filters, perPage, sortOrder, sequenceId);
  },

  async refreshToken() {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.refreshToken(this.data.login.refresh_token)
  },

  async getDepartmentInfo(filters,
                          perPage,
                          sortOrder,
                          sequenceId)
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.getDepartmentInfo(this.data.login.access_token,
                                      filters,
                                      perPage,
                                      sortOrder,
                                      sequenceId)
  },

  async getEnterpriseInfo()
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }
    return await this.api.getEnterpriseInfo(this.data.login.access_token)
  },

  async listGroup(updateTime, perPage) 
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }
    return await this.api.listGroup(this.data.login.access_token, updateTime, perPage)
  },

  async listAllGroup()
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.listAllGroup(this.data.login.access_token)
  },

  async updateUserWorkDescription(workDescription) 
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.updateUserWorkDescription(this.data.login.access_token, workDescription)
  },

  async updateUserStatusDescription(statusDescription) {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.updateUserStatusDescription(this.data.login.access_token, statusDescription)
  },


  async updateUserPassword(password) {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.updateUserPassword(this.data.login.access_token, password)
  },

  async getNewVersion() {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.getNewVersion(this.data.login.access_token)
  },

  async tokenValid(accessToken) {
    return await this.api.tokenValid(this.data.login.access_token)
  },

  async clientIncrement(name,
    updateTime,
    sequenceId,
    countperpageValue) 
  {
    return await this.api.tokenValid(this.data.login.access_token,
                                name,
                                updateTime,
                                sequenceId,
                                countperpageValue)
    
  },

  async historyMessage(groupId, sequenceId) {
    return await this.api.historyMessage(this.data.login.access_token, groupId, sequenceId)
  },

  async sendNewMessage(messageID, 
                        messageContentType,
                        formID,
                        groupID,
                        userID,
                        timestamp,
                        text,
                        url) {
    return await this.api.sendNewMessage(this.data.login.access_token,
                                  messageID, 
                                  messageContentType,
                                  formID,
                                  groupID,
                                  userID,
                                  timestamp,
                                  text,
                                  url)
  },

  async uploadFile(filepath) {
    return await this.api.uploadFile(this.data.login.access_token, filepath);
  },

  async downloadFile(sequenceId) {
    return await this.api.downloadFile(this.data.login.access_token, sequenceId)
  },

  async downloadTumbnail(type, sequenceId) {
    return await this.api.downloadTumbnail(this.data.login.access_token, type, sequenceId)
  }

};

export {
  common
}
