//document.write('<script src="db.js" type="text/javascript" charset="utf-8"></script>');

import { HTTP } from '../core/index.js'
import { FileUtil } from "../core/Utils.js"
//const {FileUtil} = require("./Utils.js")

class APITransaction {
  constructor(hostname) {
    // 聊天、收藏、组织、认证、文件、安全、邮件
    // 公共服务
    this.commonApi = new HTTP(hostname, 8888);

    // 本地服务
    this.localApi = new HTTP("localhost", 9080);
  }

  parseStatus(response) {
    if (typeof response != "object") {
      return response;
    }

    Object.defineProperty(response, 'success', {
      get() {
        if (!("data" in this)) {
          return false;
        }

        if (!("code" in this.data)) {
          return false;
        }

        return this.data.code >= 200 && this.data.code < 300;
      }
    });

    return response;
  }

  async getAllDepartmentInfo() {
    console.debug("getAllDepartment");
    var response = await this.localApi.get("/static/department.json");
    return parseStatus(response);
  }

  async getAllUserInfo() {
    console.debug("getAllUser");
    var response = await this.localApi.get("/static/user.json");
    return parseStatus(response);
  }

  async login(username, password) {
    console.debug("login");
    var response = await this.commonApi.post(
      "/api/v1/client/login", {
        account: username,
        password: password,
        yqlVerCode: 6,
        osType: "windows"
      });
    return parseStatus(response);
  }

  async logout(accessToken) {
    console.debug("logout");
    var response = await this.commonApi.post(
      "/api/v1/client/logout",
      {},
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async getUserinfo(accessToken,
                    filters,
                    perPage,
                    sortOrder,
                    sequenceId) {
    console.debug("getUserInfo");
    var response = await this.commonApi.post(
      "/api/v1/client/users",
      {
        filters: filters,
        perPage: perPage,
        sortOrder: sortOrder,
        sequenceId: sequenceId
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async refreshToken(originRefreshToken) {
    console.debug("refreshToken");
    var response = await this.commonApi.post(
      "/api/v1/token/refresh",
      {},
      {
        Authorization: "Bearer " + originRefreshToken
      });
    return parseStatus(response);
  }

  async getDepartmentInfo(accessToken,
                          filters,
                          perPage,
                          sortOrder,
                          sequenceId) {
    console.debug("GetDepartmentInfo");
    var response = await this.commonApi.post(
      "/api/v1/client/departments",
      {
        filters: filters,
        perPage: perPage,
        sortOrder: sortOrder,
        sequenceId: sequenceId
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async getEnterpriseInfo(accessToken) {
    console.debug("GetEnterpriseInfo");
    var response = await this.commonApi.get(
      "/api/v1/client/setting/enterprise",
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async listGroup(accessToken, updateTime, perPage) {
    console.debug("ListGroup");
    var response = await this.commonApi.get(
      "/api/v1/group/" + updateTime + "/perPage/" + perPage,
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async listAllGroup(accessToken) {
    console.debug("ListAllGroup");
    var response = await this.commonApi.get(
      "/api/v1/group",
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async updateUserWorkDescription(accessToken, workDescription) {
    console.debug("UpdateUser");
    var response = await this.commonApi.patch(
      "/api/v1/client/user/profile",
      {
        path: "/workDescription",
        value: workDescription
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async updateUserStatusDescription(accessToken, statusDescription) {
    console.debug("UpdateUserStatusDescription");
    var response = await this.commonApi.patch(
      "/api/v1/client/user/profile",
      {
        path: "/statusDescription",
        value: statusDescription
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async updateUserPassword(accessToken, password) {
    console.debug("UpdateUserPassword");
    var response = await this.commonApi.patch(
      "/api/v1/client/user/profile",
      {
        path: "/password",
        value: password
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async getNewVersion(accessToken) {
    console.debug("GetNewVersion");
    var response = await this.commonApi.post(
      "/api/v1/client/version/new",
      {
        client: "windows"
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async tokenValid(accessToken) {
    console.debug("TokenValid");
    var response = await this.commonApi.get(
      "/api/v1/internal/token",
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async clientIncrement(accessToken,
                        name,
                        updateTime,
                        sequenceId,
                        countperpageValue) {
    console.debug("ClientIncrement");
    var response = await this.commonApi.post(
      "api/v1/client/increment",
      {
        name: name,
        updatetime: updateTime,
        sequenceId: sequenceId,
        countperpage_value: countperpageValue
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async historyMessage(accessToken, groupId, sequenceId) {
    console.debug("HistoryMessageAsync");
    var response = await this.commonApi.get(
      "/api/v1/message/group/" + groupId + "/sequence/" + sequenceId,
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async sendNewMessage(accessToken,
                       messageID, 
                       messageContentType,
                       formID,
                       groupID,
                       userID,
                       timestamp,
                       text,
                       url) {
    console.debug("SendNewMessage");
    var response = await this.commonApi.post(
      "api/v1/message",
      {
        msgId: messageID,
        msgContentType: messageContentType,
        fromId: formID,
        groupId: groupID,
        userId: userID,
        timestamp: timestamp,
        content: {
          text: text,
          url: url
        }
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return parseStatus(response);
  }

  async uploadFile(accessToken, filepath) {
    var fu = new FileUtil(filepath);
    let file = fu.GetUploadfileobj();
    var formData = new FormData();
    formData.append('file', file);

    var response = await this.commonApi.post(
      "/api/service/file/v1/dfs/upload",
      formData,
      {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "multipart/form-data"
      },
      {
        timeout: 15000
      });
    return parseStatus(response);
  }

  async downloadFile(accessToken, sequenceId) {
    var response = await this.commonApi.get(
      "/api/service/file/v1/dfs/download/" + String(sequenceId),
      {
        Authorization: "Bearer " + accessToken
      },
      {
        timeout: 15000,
        responseType: "blob"
      });
    return parseStatus(response);
  }

  async downloadTumbnail(accessToken, type, sequenceId) {
    var path = "api/service/file/v1/dfs/thumbnail/"
      + String(type)
      + "/"
      + String(sequenceId);

    var response = await this.commonApi.get(
      path,
      {
        Authorization: "Bearer " + accessToken
      },
      {
        timeout: 15000,
        responseType: "blob"
      });
    return parseStatus(response);
  }
}

class MQTTTransaction {}

export {
  APITransaction,
  MQTTTransaction
}

//exports.ServerApi = ServerApi
