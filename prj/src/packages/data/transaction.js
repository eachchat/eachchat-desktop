//document.write('<script src="db.js" type="text/javascript" charset="utf-8"></script>');

import { net } from '../core/index.js'
import { FileUtil } from "../core/Utils.js"
import { environment } from "./environment.js"
import {ipcRenderer} from 'electron';

//const {FileUtil} = require("./Utils.js")

class APITransaction {
  constructor(hostname, port, tls) {
    // 聊天、收藏、组织、认证、文件、安全、邮件
    // 公共服务
    this.mqtt = undefined;
    this.commonApi = new net.HTTP(hostname, port, tls);
  }

  SetMqtt(mqtt){
    this.mqtt = mqtt;
  }

  SetService(service){
    this.service = service;
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

        if(this.data.code == 401)
        {
          ipcRenderer.send('token-expired');
          if(this.mqtt != undefined)
          {
            this.mqtt.close();
            this.service.logout();
          }
        }

        return this.data.code >= 200 && this.data.code < 300;
      }
    });

    return response;
  }

  async login(username, password, identityType, identityValue, model, deviceID, desktopType) {
    let osType;
    
    if(environment.os.isWindows){
      osType = "windows";
    }
    else if(environment.os.isOSX){
      osType = "macos";
    }
    else if(environment.os.isLinux){
      osType = "linux";
    }
    
    var response = await this.commonApi.post(
      "/api/services/auth/v1/login", {
        account: username,
        password: password,
        yqlVerCode: 6,
        identity:
        {
          type: identityType,
          value: identityValue,
        },
        osType: osType,
        model:  model,
        deviceId: deviceID,
        desktopType: desktopType
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

  async UpdateUserAvatar(accessToken, filePath){
    var fu = new FileUtil(filePath);
    let file = fu.GetUploadfileobj();
    var formData = new FormData();
    formData.append('file', file);

    var response = await this.commonApi.post(
      "/api/apps/org/v1/user/avatar",
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

  
  async UpdateUserAvatarByData(accessToken, fileData, fileName, fileMime){
    let file = new File([fileData], fileName, {type : fileMime});
    var formData = new FormData();
    formData.append('file', file);

    var response = await this.commonApi.post(
      "/api/apps/org/v1/user/avatar",
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

  async downloadGroupAvatar(url, accessToken) {
    var headers={Authorization:"Bearer " + accessToken};

    return this.commonApi.get(url,
      {
        Authorization: "Bearer " + accessToken
      },
      {
        timeout: 35000,
        responseType: "blob"
      })
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

  async DeleteHistoryMessage(accessToken, groupID, sequenceID){
    var response = await this.commonApi.post(
      "/api/apps/im/v1/message/history",
      {
        groupId: groupID,
	      sequenceId: sequenceID
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async DeleteGroup(accessToken, groupID){
    var response = await this.commonApi.delete(
      "/api/apps/im/v1/group/" + groupID,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async UpdateGroupNotice(accessToken, groupID, notice){
    var response = await this.commonApi.put(
      "/api/apps/im/v1/group/notice",
      {
        groupId: groupID,
	      notice: notice
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async UpdateGroupAvatar(accessToken, groupID, filePath){
    var fu = new FileUtil(filePath);
    let file = fu.GetUploadfileobj();
    var formData = new FormData();
    formData.append('file', file);
    formData.append('groupId', groupID);

    var response = await this.commonApi.post(
      "/api/apps/im/v1/group/avatar",
      formData,
      {
        Authorization: "Bearer " + accessToken,
        "Content-Type": fu.GetMimename()
      },
      {
        timeout: 15000
      });
    return this.parseStatus(response);
  }

  async UpdateGroupAvatarByData(accessToken, groupID, fileData, fileName, fileMime){
    let file = new File([fileData], fileName, {type : fileMime});
    var formData = new FormData();
    formData.append('file', file);
    formData.append('groupId', groupID);

    var response = await this.commonApi.post(
      "/api/apps/im/v1/group/avatar",
      formData,
      {
        Authorization: "Bearer " + accessToken,
        "Content-Type": fileMime
      },
      {
        timeout: 15000
      });
    return this.parseStatus(response);
  }

  async GroupStatus(accessToken, groupID, userID, stickFlag, disturbFlag){
    var response = await this.commonApi.put(
      "/api/apps/im/v1/group/status",
      {
        groupId:      groupID,
        userId:       userID,
        stickFlag:    stickFlag,
        disturbFlag:  disturbFlag
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async QuitGroup(accessToken, groupID){
    var response = await this.commonApi.delete(
      "/api/apps/im/v1/group/quit/" + groupID,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async TransferGroup(accessToken, groupID, toUserID){
    var response = await this.commonApi.post(
      "/api/apps/im/v1/group/transfer",
      {
        "groupId" : groupID,
        "toUserId" : toUserID
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async ListGroupFiles(accessToken, groupID, sequenceID){
    var response = await this.commonApi.post(
      "/api/apps/im/v1/group/files",
      {
        "sequenceId"  : sequenceID,
        "perPage"     : 50,
        "sortOrder"   : 1,
        "groupId"     : groupID
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchGroupFiles(accessToken, groupID, sequenceID, keyword){
    var response = await this.commonApi.post(
      "/api/apps/im/v1/group/search/files",
      {
        "sequenceId"  : sequenceID,
        "perPage"     : 50,
        "sortOrder"   : 1,
        "groupId"     : groupID,
        "keyword"     : keyword
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async BeforeAndAfterMessage(accessToken, groupID, sequenceID, beforeCount, afterCount){
    var response = await this.commonApi.get(
      "/api/apps/im/v1//message/group/" 
      + groupID
      + "/sequence/"
      + sequenceID
      + "/preNumber/"
      + beforeCount
      + "/backNumber/"
      + afterCount,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchGroupMessage(accessToken, groupID, keyword, perPageNum){
    var response = await this.commonApi.get(
      "/api/apps/im/v1/message/search/"
      + groupID
      + "/keyword/" 
      + keyword
      + "/pagenumber/"
      + perPageNum,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchMessage(accessToken, keyword, perPageNum){
    var response = await this.commonApi.get(
      "/api/apps/im/v1/message/search/" 
      + keyword
      + "/pagenumber/"
      + perPageNum,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchCollection(accessToken, type, sequenceID, perPageNum, sortOrder, keyword){
    var response = await this.commonApi.post(
      "/api/apps/fav/v1/collection/search",
      {
        "collectionType":type,
        "sequenceId":sequenceID,
        "perPage":perPageNum,
        "sortOrder":sortOrder,
        "keyword":keyword
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async GetRecentDevice(accessToken){
    var response = await this.commonApi.get(
      "/api/apps/org/v1/log/login",
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchAll(accessToken, keyword){
    var response = await this.commonApi.get(
      "/api/services/search/v1/all/" + keyword,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchUser(accessToken, index, perPageNum, keyword)
  {
    var response = await this.commonApi.post(
      "/api/services/search/v1/users",
      {
        "sequenceId":index,
        "perPage":perPageNum,
        "keyword":keyword
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchFiles(accessToken, keyword, sequenceId, perPage, userIds, groupIds, startTime){
    var response = await this.commonApi.post(
      "/api/services/search/v1/files",
      {
        "sequenceId":   sequenceId,
        "perPage":      perPage,
        "keyword":      keyword,
        "userIds":      userIds,
        "groupIds":     groupIds,
        "startTime":    startTime
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchGroups(accessToken, keyword, sequenceId, perPage, userIds, groupIds, startTime){
    var response = await this.commonApi.post(
      "/api/services/search/v1/groups",
      {
        "sequenceId":   sequenceId,
        "perPage":      perPage,
        "keyword":      keyword,
        "userIds":      userIds,
        "groupIds":     groupIds,
        "startTime":    startTime
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async SearchMessages(accessToken, keyword, sequenceId, perPage, userIds, groupIds, startTime){
    var response = await this.commonApi.post(
      "/api/services/search/v1/messages",
      {
        "sequenceId":   sequenceId,
        "perPage":      perPage,
        "keyword":      keyword,
        "userIds":      userIds,
        "groupIds":     groupIds,
        "startTime":    startTime
      },
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async ReceiveTransmitMessage(accessToken, timelineId, userId)
  {
    var response = await this.commonApi.get(
      "/api/apps/im/v1/message/forward/" + timelineId + "/userId/" + userId,
      {
        Authorization: "Bearer " + accessToken
      });
    return this.parseStatus(response);
  }

  async GetAesSecret(accessToken, plainText, signature, osType){
    var response = await this.commonApi.post(
      "/api/services/security/v1/aes",
      {
        signature : signature,
        plaintext : plainText,
        os : osType
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
