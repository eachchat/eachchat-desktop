<template>
    <div class="chat-wind">
      <div class="win-header">
        <winHeaderBar v-show="isWindows"></winHeaderBar>
      </div>
      <div class="chat-panel" id="chat-panel-id">
        <div class="chat-list">
          <div class="list-header">
            <listHeader @getCreateGroupInfo="getCreateGroupInfo"/>
          </div>
          <p class="chat-label">普通</p>
          <div class="list-content" :key="needUpdate">
            <ul class="group-list">
              <li class="group"
                  v-for="(chatGroupItem, index) in dealShowGroupList"
                  @click="showChat(chatGroupItem, index)"
                  :class="{active: index===curindex}"
                  >
                  <!-- <listItem @groupInfo="chatGroupItem"/> -->
                <div class="group-img">
                  <img class="group-ico" :id="getChatElementId(chatGroupItem)" src="../../../static/Img/User/user.jpeg"/>
                  <p :class="getUnreadClass(chatGroupItem.un_read_count, index===curindex)">{{getUnReadCount(chatGroupItem.un_read_count, index)}}</p>
                </div>
                <div class="group-info">
                  <p class="group-name">{{getShowGroupName(chatGroupItem)}}</p>
                  <p class="group-content">{{getShowMsgContent(chatGroupItem)}}</p>
                </div>
                <div class="group-notice">
                  <p class="group-time">{{getMsgLastMsgTime(chatGroupItem)}}</p>
                  <p class="group-slience" v-show="groupIsSlience(chatGroupItem)"></p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="chat">
          <ChatPage :chat="curChat" @updateChatList="updateChatList" @showImageOfMessage="showImageOfMessage" @getCreateGroupInfo="getCreateGroupInfo" @updateChatGroupStatus="updateChatGroupStatus"></ChatPage>
        </div>
      </div>
      <imageLayer :imgSrcInfo="imageLayersSrcInfo" v-show="showImageLayers" @closeImageOfMessage="closeImageOfMessage"/>
    </div>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {APITransaction} from '../../packages/data/transaction.js'
import {services, environment} from '../../packages/data/index.js'
import ChatPage from './chat.vue'
import winHeaderBar from './win-header.vue'
import imageLayer from './image-layers.vue'
import listHeader from './listheader'
import {ipcRenderer} from 'electron'
// import listItem from './list-item.vue'
import {downloadGroupAvatar, Appendzero, strMsgContentToJson, JsonMsgContentToString, FileUtil} from '../../packages/core/Utils.js'

export default {
  components: {
    ChatPage,
    listHeader,
    winHeaderBar,
    imageLayer,
    // listItem
  },
  computed: {
    dealShowGroupList: function() {
      if(this.showGroupList.length == 0) {
        return;
      }
      var chatGroupVar = [];
      var topGroupVar = [];
      for(var i=0;i<this.showGroupList.length;i++) {
        if(this.groupIsTop(this.showGroupList[i])) {
          topGroupVar.push(this.showGroupList[i]);
        }
        else {
          chatGroupVar.push(this.showGroupList[i]);
        }
      }
      topGroupVar = topGroupVar.sort(this.compare());
      console.log("topgroupvar is ", topGroupVar)
      chatGroupVar = chatGroupVar.sort(this.compare());
      console.log("chatGroupVar is ", chatGroupVar)
      chatGroupVar = topGroupVar.concat(chatGroupVar);
      this.$store.commit("setShowGroupList", chatGroupVar);
      return chatGroupVar
    }
  },
  data() {
    return {
      //需要展示的用户群组
      curChat: {},
      needUpdate: 1,
      curindex: -1,
      searchKey: '',
      normalGroupList: [],
      encryptGroupList: [],
      showGroupList: [],
      showImageLayers: false,
      imageLayersSrcInfo: '',
      clickedGroupList: [],
    };
  },
  methods: {
    isWindows() {
      return environment.os.isWindows;
    },
    // Download thumb and show in dist id element
    updateGroupImg(e, arg) {
      var state = arg[0];
      var stateInfo = arg[1];
      var id = arg[2];
      var localPath = arg[3];

      let elementImg = document.getElementById(id);

      elementImg.setAttribute("src", "");
      var showfu = new FileUtil(localPath);
      let showfileObj = showfu.GetUploadfileobj();
      var reader = new FileReader();
      reader.readAsDataURL(showfileObj);
      reader.onloadend = () => {
          elementImg.setAttribute("src", reader.result);
      }
    },
    showGroupIcon: async function() {
      for(var i=0;i<this.showGroupList.length;i++) {
        let elementImg = document.getElementById(this.showGroupList[i].group_id);
        // console.log("groupavatar is ", this.showGroupList[i].group_avarar);
        var targetPath = "";
        if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.showGroupList[i].group_avarar, this.showGroupList[i].group_id))){
            elementImg.setAttribute("src", targetPath);
        }
      }
    },
    groupIsSlience(groupInfo) {
      if((Number(groupInfo.status) & Number("00000001")) != 0) {
        // console.log("groupIsSlience grou name is ", groupInfo.group_name)
        // console.log("group state is ", groupInfo.status)
        return true;
      }
    },
    groupIsTop(groupInfo) {
      if((Number(groupInfo.status) & Number("00000010")) != 0) {
        // console.log("top grou name is ", groupInfo.group_name)
        // console.log("group state is ", groupInfo.status)
        return true;
      }
    },
    getCreateGroupInfo(groupInfo) {
      console.log("Created Info is ", groupInfo)
      var groupIndex = -1;
      for(var i=0;i<this.showGroupList.length;i++) {
        if(this.showGroupList[i].group_id === groupInfo.group_id) {
          groupIndex = i;
          break;
        }
      }
      if(groupIndex == -1) {
        this.showGroupList.unshift(groupInfo);
        setTimeout(() => {
          this.$nextTick(() => {
            this.curindex = 0;
            this.curChat = groupInfo;
          })
        }, 500)
      }
      else {
        setTimeout(() => {
          this.$nextTick(() => {
            this.curindex = groupIndex;
            this.curChat = this.showGroupList[groupIndex];
          })
        }, 500)
      }
      // ++this.needUpdate;
    },
    showImageOfMessage(imgSrcInfo) {
      console.log("showImageOfMessage and imgSrcInfo is ", imgSrcInfo)
      this.imageLayersSrcInfo = imgSrcInfo;
      this.showImageLayers = true;
    },
    closeImageOfMessage() {
      this.imageLayersSrc = '';
      this.showImageLayers = false;
    },
    updateChatGroupStatus(groupId, groupStatus, updateType) {
      // ++this.needUpdate;
      var groupListTmp = this.showGroupList;
      for(var i=0;i<groupListTmp.length;i++) {
        if(groupListTmp[i].group_id === groupId) {
          groupListTmp[i].status = groupStatus;
          break;
        }
      }
      if(updateType == "top") {
        console.log("top")
        this.showGroupList = groupListTmp;
        this.$nextTick(() => {
          this.showGroupIcon()
        })
      }
      // ++this.needUpdate;
    },
    updateChatList(newMsg, updateList=true) {
      // ++this.needUpdate;
      console.log("newMsg is ", newMsg)
      for(var i=0;i<this.showGroupList.length;i++) {
        if(this.showGroupList[i].group_id === newMsg.group_id) {
          this.showGroupList[i].last_message_time = newMsg.message_timestamp;
          this.showGroupList[i].message_content = newMsg.message_content;
          console.log("the content is ", strMsgContentToJson(newMsg.message_content))
          this.showGroupList[i].message_content_type = newMsg.message_type;
          this.showGroupList[i].message_from_id = newMsg.message_from_id;
          this.showGroupList[i].message_id = newMsg.message_id;
          this.showGroupList[i].sequence_id = newMsg.sequence_id;
          if(newMsg.message_from_id != this.curUserInfo.id) {
            this.showGroupList[i].un_read_count += 1;
          }
          if(updateList) {
            this.curindex = i;
            // this.curChat = this.showGroupList[i];
          }
          break;
        }
      }
    },
    updateChatListThroughGroupId(groupId, newMsgList) {
      // ++this.needUpdate;
      for(var i=0;i<this.showGroupList.length.length;i++) {
        if(this.showGroupList[i].group_id === groupId) {
          // this.$store.commit("addMessageLists", newMsgList);
          this.curindex = i;
          break;
        }
      }
    },
    getUnreadClass(unReadCount, selected) {
      var endPoint = "-unselected";
      if(selected) {
        endPoint = "-selected";
      }
      if(unReadCount === 0) return "group-readall" + endPoint;
      else return "group-unread";
    },
    getUnReadCount(unReadCount) {
      if(unReadCount === 0) return "";
      else return unReadCount;
    },
    formatTimeFilter(secondsTime) {
      let curDate = new Date();
      let curDateSecond = curDate.getTime();
      let cutTime = curDateSecond - secondsTime;
      let curYeat = curDate.getUTCFullYear();
      let curMonth = curDate.getUTCMonth() + 1;
      let curDay = curDate.getDate();

      let distdate = new Date(secondsTime);
      let y = distdate.getUTCFullYear();
      let mon = distdate.getMonth() + 1;
      let d = distdate.getDate();
      let h = distdate.getHours();
      let m = distdate.getMinutes();
      let s = distdate.getSeconds();

      // console.log(distdate)
      // console.log(cutTime)
      // console.log(y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m) + ":" + Appendzero(s))

      if(cutTime < 24 * 3600 * 1000)
      {
        if(curDay - d === 0){
          return Appendzero(h) + ":" + Appendzero(m);
        }
        else{
          return "昨天 " + Appendzero(h) + ":" + Appendzero(m);
        }
      }
      else if((cutTime >= 24 * 3600 * 1000 && cutTime < 48 * 3600 * 1000))
      {
        if(curDay - d === 1){
          return "昨天 " + Appendzero(h) + ":" + Appendzero(m);
        }
        else{
          return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
        }
      }
      else
      {
        return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
      }
    },
    getMsgLastMsgTime(chatGroupItem) {
      var formatTime = ""
      var timesecond = Number(chatGroupItem.last_message_time) == 0 ? Number(chatGroupItem.updatetime) : Number(chatGroupItem.last_message_time);

      if(timesecond.length == 0) {
        return formatTime;
      }

      formatTime = this.formatTimeFilter(timesecond);
      return formatTime;
    },
    getIdThroughId(groupInfo) {
      return groupInfo.groupId;
    },
    // To get group_id uesed as current chat group's element id
    getChatElementId: function(curChat) {
      return curChat.group_id;
    },
    getShowGroupName(chatGroupItem) {

      async function getUserNameFromDb(distUid) {
        var nameTemp = '';
        var userInfos = await services.common.GetDistUserinfo(distUid);
        if(userInfos.length == 0) {
          return nameTemp;
        }
        var distUserInfo = userInfos[0];
        if(distUserInfo != undefined){
          nameTemp = distUserInfo.user_display_name;
        }
        return nameTemp;
      }

      if(chatGroupItem === null){
        return "";
      }
      var groupName = chatGroupItem.group_name;
      if(groupName.length == 0) {
        var aboutUids = chatGroupItem.contain_user_ids.split(",");
        var groupUidNameList = [];
        for(var i=0;i<aboutUids.length;i++) {
          var userName = getUserNameFromDb(aboutUids[i]);
          userName.then((ret) => {
            if(ret.length != 0){
              // let nameTmp = this.$store.getters.getChatUserName(aboutUids[i]);
              groupName = groupName + "," + ret;
              // groupUidNameList.unshift(ret);
            }
          })
          if(i > 3) {
            break;
          }
        }
        groupName = groupUidNameList.toString();
      }
      return groupName
    },
    getShowMsgContent(chatGroupItem) {
      // console.log("getShowMsgContent is ", chatGroupItem)
      if(chatGroupItem === null){
        return "";
      }
      var chatGroupMsgContent = strMsgContentToJson(chatGroupItem.message_content);

      var chatGroupMsgType = chatGroupItem.message_content_type;
      if(chatGroupMsgContent === null) {
        return "";
      }
      if(chatGroupMsgType === 101)
      {
        return chatGroupMsgContent.text;
      }
      else if(chatGroupMsgType === 102)
      {
        return "[图片]";
      }
      else if(chatGroupMsgType === 103)
      {
        return "[文件]";
      }
      else if(chatGroupMsgType === 104)
      {
        if(chatGroupMsgContent.type === "invitation")
        {
          var invitees = chatGroupMsgContent.userInfos;
          var inviteeNames = "";
          for(var i=0;i<invitees.length;i++) {
              inviteeNames = inviteeNames + "、" + invitees[i].userName
          }
          var inviter = chatGroupMsgContent.userName;
          return inviter + " 邀请 " + inviteeNames + " 加入群聊";
        }
        else if(chatGroupMsgContent.type === "notice")
        {
          var owner = chatGroupMsgContent.userName;
          return owner + " 发布群公告";
        }
        else if(chatGroupMsgContent.type === "updateGroupName")
        {
          var owner = chatGroupMsgContent.userName;
          var distName = chatGroupMsgContent.text;
          return owner + " 修改群名称为 " + distName;
        }
        else if(chatGroupMsgContent.type === "deleteGroupUser")
        {
            var owner = chatGroupMsgContent.userName;
            var deletedNames = "";
            var deletedUsers = chatGroupMsgContent.userInfos;
            if(deletedUsers.length == 1){
                deletedNames = deletedUsers[0].userName
            }
            else{
                for(var i=0;i<deletedUsers.length;i++) {
                    deletedNames = deletedNames + "、" + deletedUsers[i].userName
                }
            }
            return owner + " 将 " + deletedNames + " 移出了群聊";
        }
        else
        {
          return "您收到一条短消息";
        }
      }
      else if(chatGroupMsgType === 105)
      {
        return "[语音]";
      }
      else if(chatGroupMsgType === 106)
      {
        return "[聊天记录]";
      }
      return "收到一条短消息";
    },
    showChat: function(chatGroup, index) {
      services.common.MessageRead(this.curChat.group_id, this.curChat.sequence_id);
      this.curChat = chatGroup;
      this.curindex = index;
      services.common.MessageRead(this.curChat.group_id, this.curChat.sequence_id);
      this.curChat.un_read_count = 0;
    },
    getGroupList: async function(updateCurPage=false) {
        var ret = await services.common.GetAllGroups()
        console.log("sql getGroupList is ", ret)
        this.showGroupList = ret;
        console.log("length is ", ret)
        if(updateCurPage){
          let chatGroupVar = [];
          chatGroupVar = this.showGroupList.sort(this.compare());
          let curGroup = chatGroupVar[0];
          console.log("getgrouplist the cur group is ", curGroup)
          // this.showChat(curGroup, 0);
        }
    },
    compare: function() {
      return function(a, b)
      {
        var value1 = a.last_message_time == 0 ? a.updatetime : a.last_message_time;
        var value2 = b.last_message_time == 0 ? b.updatetime : b.last_message_time;;
        return value2 - value1;
      }
    },
    callback(msg) {
      console.log("chat content callback msg is ", msg);
    },
  },
  mounted: async function() {
      // When Mounting Can Not Get The Element. Here Need SetTimeout
      await this.getGroupList(false);
      setTimeout(() => {
          this.$nextTick(() => {
            ipcRenderer.on('updateGroupImg', this.updateGroupImg);
            this.showGroupIcon();
          })
      }, 0)
  },
  created: async function() {
    this.loginInfo = await services.common.GetLoginModel();
    this.curUserInfo = await services.common.GetSelfUserModel();

  }
};
</script>

<style lang="scss" scoped>
  ::-webkit-scrollbar-track-piece {
    background-color: #F1F1F1;
    border-radius: 5px;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 12px;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: #C1C1C1;
    border-radius: 5px;
    outline: none;
  }

  ::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #A8A8A8;
    border-radius: 5px;
  }

  .chat-wind {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin: 0px;
  }

  .chat-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    margin: 0px;
  }

  .chat {
    width:100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 0px;
  }

  .chat-list {
    height: 100%;
    width: 280px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgb(242, 242, 246);
  }

  .list-header {
    width: 100%;
    height: 41px;
    line-height: 41px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    margin: 0px 0px 0px 0px;
    display: block;
  }

  .chat-label {
    float: left;
    font-size: 13px;
    height: 35px;
    line-height: 35px;
    padding: 0px 0px 0px 20px;
    margin: 0px;
    display: none;
    background-color: rgb(239,240,241);
  }

  .list-content {
    height: 100%;
    overflow-y: scroll;
    
    ::-webkit-scrollbar-track {
      border-radius: 10px;
    }
  }

  .group-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  .group {
    height: 60px;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group:hover {
    height: 60px;
    background-color: rgba(221, 221, 221, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group.active {
    height: 60px;
    background-color: rgba(221, 221, 221, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group-ico {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 40px;
    height: 40px;
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
  }

  .group-img {
    position:relative;
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
  }
  
  .group-info {
    display: inline-block;
    height: 100%;
    width: calc(100% - 140px);
    margin-left: 10px;;
  }

  .group-name {
    width: 100%;
    height: 20px;
    font-size: 14px;
    font-weight: medium;
    font-family:Microsoft Yahei;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .group-content {
    width: 100%;
    font-size: 13px;
    color: rgba(153, 153, 153, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 2px;
    margin-right: 0px;
    margin-bottom: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 18px;
  }

  .group-notice {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 64px;
  }

  .group-time {
    font-size: 12px;
    color: rgba(187, 187, 187, 1);
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 2px;
    height: 18px;
    text-align: right;
  }

  .group-unread {
    position: absolute;
    top: -7px;
    right: -7px;
    font-size: 10px;
    font-family:Microsoft Yahei;
    float: right;
    color: rgb(255, 255, 255);
    margin: 0px;
    text-align: center;
    height: 14px;
    width: 14px;
    line-height: 14px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 1);
  }

  .group-readall-selected {
    position: absolute;
    top: 7px;
    right: 7px;
    font-size: 10px;
    font-family:Microsoft Yahei;
    float: right;
    color: rgb(255, 255, 255);
    margin: 0px;
    text-align: center;
    height: 14px;
    width: 14px;
    line-height: 14px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 0);
  }
  
  .group-readall-unselected {
    position: absolute;
    top: 7px;
    right: 7px;
    font-size: 10px;
    font-family:Microsoft Yahei;
    float: right;
    color: rgb(255, 255, 255);
    margin: 0px;
    text-align: center;
    height: 14px;
    width: 14px;
    line-height: 14px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 0);
  }

  .group-slience {
    float: right;
    color: rgb(255, 255, 255);
    height: 20px;
    width: 20px;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 10px;
    background-color: rgba(228, 49, 43, 0);
    background-image: url("../../../static/Img/Chat/slience-20px.png");
  }
</style>
