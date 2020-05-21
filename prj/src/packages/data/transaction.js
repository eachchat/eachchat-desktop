//document.write('<script src="db.js" type="text/javascript" charset="utf-8"></script>');

import { net } from '../core/index.js'
import { FileUtil } from "../core/Utils.js"
//const {FileUtil} = require("./Utils.js")

class APITransaction {
  constructor(hostname, port) {
    // 聊天、收藏、组织、认证、文件、安全、邮件
    // 公共服务
    this.commonApi = new net.HTTP(hostname, port);
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

  async login(username, password) {
    console.debug("login");
    var response = await this.commonApi.post(
      "/api/services/auth/v1/login", {
        account: username,
        password: password,
        yqlVerCode: 6,
        osType: "windows"
      });
    return this.parseStatus(response);
  }

  async logout(accessToken) {
    console.debug("logout");
    var response = await this.commonApi.post(
      "/api/services/auth/v1/logout",
      {},
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async getUserinfo(accessToken,
                    filters,
                    perPage,
                    sortOrder,
                    sequenceId) {
    console.debug("getUserInfo");
    var response = await this.commonApi.post(
      "/api/apps/org/v1/users",
      {
        filters: filters,
        perPage: perPage,
        sortOrder: sortOrder,
        sequenceId: sequenceId
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async refreshToken(originRefreshToken) {
    console.debug("refreshToken");
    var response = await this.commonApi.post(
      "/api/services/auth/v1/token/refresh",
      {},
      {
        Authorization: "Bearer " + originRefreshToken
      });
    return this.parseStatus(response);
  }

  async getDepartmentInfo(accessToken,
                          filters,
                          perPage,
                          sortOrder,
                          sequenceId) {
    console.debug("GetDepartmentInfo");
    var response = await this.commonApi.post(
      "/api/apps/org/v1/departments",
      {
        filters: filters,
        perPage: perPage,
        sortOrder: sortOrder,
        sequenceId: sequenceId
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async getEnterpriseInfo(accessToken) {
    console.debug("GetEnterpriseInfo");
    var response = await this.commonApi.get(
      "/api/apps/org/v1/setting/enterprise",
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async listGroup(accessToken, updateTime, perPage) {
    console.debug("ListGroup");
    var response = await this.commonApi.get(
      "/api/apps/im/v1/group/" + updateTime + "/perPage/" + perPage,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async listAllGroup(accessToken) {
    console.debug("ListAllGroup");
    var response = await this.commonApi.get(
      "/api/apps/im/v1/group",
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async createGroup(accessToken, groupNameValue, groupUsersArray){
    console.debug("createGroup");
    var response = await this.commonApi.post(
      "/api/apps/im/v1/group",
      {
        groupName: groupNameValue,
        userIds: groupUsersArray
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async updateUserWorkDescription(accessToken, workDescription) {
    console.debug("UpdateUser");
    var response = await this.commonApi.patch(
      "/api/apps/org/v1/user/profile",
      {
        path: "/workDescription",
        value: workDescription
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async updateUserStatusDescription(accessToken, statusDescription) {
    console.debug("UpdateUserStatusDescription");
    var response = await this.commonApi.patch(
      "/api/apps/org/v1/user/profile",
      {
        path: "/statusDescription",
        value: statusDescription
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async updateUserPassword(accessToken, password) {
    console.debug("UpdateUserPassword");
    var response = await this.commonApi.patch(
      "/api/apps/org/v1/user/profile",
      {
        path: "/password",
        value: password
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async getNewVersion(accessToken) {
    console.debug("GetNewVersion");
    var response = await this.commonApi.post(
      "/api/apps/org/v1/version/new",
      {
        client: "windows"
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async tokenValid(accessToken) {
    console.debug("TokenValid");
    var response = await this.commonApi.get(
      "/api/services/auth/v1/token",
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async clientIncrement(accessToken,
                        name,
                        updateTime,
                        sequenceId,
                        countperpageValue) {
    console.debug("ClientIncrement");
    var response = await this.commonApi.post(
      "/api/apps/org/v1/increment",
      {
        name: name,
        updateTime: updateTime,
        sequenceId: sequenceId,
        countperpage_value: countperpageValue
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async groupIncrement(accessToken, updateTime, notification){
    var response = await this.commonApi.get(
      "/api/apps/im/v1/group/" + updateTime + "/notification/" + notification,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async historyMessage(accessToken, groupId, sequenceId) {
    console.debug("HistoryMessageAsync");
    var response = await this.commonApi.get(
      "/api/apps/im/v1/message/group/" + groupId + "/sequence/" + sequenceId,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async sendNewMessage(accessToken,
                       messageID, 
                       messageContentType,
                       formID,
                       groupID,
                       userID,
                       timestamp,
                       contentMsg) {
    console.debug("SendNewMessage");
    var response = await this.commonApi.post(
      "/api/apps/im/v1/message",
      {
        msgId: messageID,
        msgContentType: messageContentType,
        fromId: formID,
        groupId: groupID,
        userId: userID,
        timestamp: timestamp,
        content: contentMsg
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async ReceiveNewMessage(accessToken, sequenceId, notificationId)
  {
    var response = await this.commonApi.get(
      "/api/apps/im/v1/message/sequence/" + sequenceId + "/notification/" + notificationId,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async uploadFile(accessToken, filepath) {
    var fu = new FileUtil(filepath);
    let file = fu.GetUploadfileobj();
    var formData = new FormData();
    formData.append('file', file);

    var response = await this.commonApi.post(
      "/api/services/file/v1/dfs/upload",
      formData,
      {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "multipart/form-data"
      },
      {
        timeout: 15000
      });
    return this.parseStatus(response);
  }

  async downloadFile(accessToken, timelineId) {
    var response = await this.commonApi.get(
      "/api/services/file/v1/dfs/download/" + String(timelineId),
      {
        Authorization: "Bearer " + accessToken
      },
      {
        timeout: 35000,
        responseType: "blob"
      });
    return this.parseStatus(response);
  }

  async downloadTumbnail(accessToken, type, timelineId) {
    var path = "/api/services/file/v1/dfs/thumbnail/"
      + String(type)
      + "/"
      + String(timelineId);

    var response = await this.commonApi.get(
      path,
      {
        Authorization: "Bearer " + accessToken
      },
      {
        timeout: 35000,
        responseType: "blob"
      });
    return this.parseStatus(response);
  }

  async MessageRead(accessToken, groupid, sequenceid){
    var response = await this.commonApi.put(
      "/api/apps/im/v1/message/reader",
      {
        groupId: groupid,
	      sequenceId: sequenceid
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async ListAllCollections(accessToken, type, sequenceId, perpage, sortOrder){
    var response = await this.commonApi.post(
      "/api/apps/fav/v1/collection/favorites",
      {
        collectionType:type,
        sequenceId:sequenceId,
        perPage:perpage,
        sortOrder:sortOrder
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async CollectMessage(accessToken, timelineIDs){
    var response = await this.commonApi.post(
      "/api/apps/fav/v1/collection/message",
      {
        msgIds:   timelineIDs
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async CollectGroup(accessToken, grouID){
    var response = await this.commonApi.post(
      "/api/apps/fav/v1/collection/group",
      {
        groupId: grouID
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async DeleteCollectionMessage(accessToken, favoriteID){
    var response = await this.commonApi.delete(
      "/api/apps/fav/v1/collection/" + favoriteID,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async DeleteCollectionGroup(accessToken, collectionId){
    var response = await this.commonApi.delete(
      "/api/apps/fav/v1/collection/group/" + collectionId,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async DeleteCollectionMessages(accessToken, array){
    var response = await this.commonApi.post(
      "/api/apps/fav/v1/collection/del",
      {
        favoriteIds: array
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async UpdateGroupName(accessToken, groupID, groupName){
    var response = await this.commonApi.put(
      "/api/apps/im/v1/group",
      {
        groupId: groupID,
	      groupName: groupName
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async DeleteGroupUsers(accessToken, groupID, userIDs){
    var response = await this.commonApi.post(
      "/api/apps/im/v1/group/user/del",
      {
        groupId: groupID,
	      userIds: userIDs
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async AddGroupUsers(accessToken, groupID, userIDs){
    var response = await this.commonApi.post(
      "/api/apps/im/v1/group/user/add",
      {
        groupId: groupID,
	      userIds: userIDs
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

}

class MQTTTransaction {}

export {
  APITransaction,
  MQTTTransaction
}

//exports.ServerApi = ServerApi
