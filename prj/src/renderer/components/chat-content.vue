<template>
    <div class="chat-panel">
      <div class="chat-list">
        <div class="list-header">
          <listHeader/>
        </div>
        <p class="chat-label">普通</p>
        <div class="list-content" :key="needUpdate">
          <ul class="group-list">
            <li class="group"
                v-for="(chatGroup, index) in chatGroupList"
                @click="showChat(chatGroup, index)"
                :class="{active: index===curindex}"
                >
              <img class="group-ico" :src="chatGroup.group.groupAvatar">
              <div class="group-info">
                <p class="group-name">{{chatGroup.group.groupName}}</p>
                <p class="group-content">{{getShowMsgContent(chatGroup.message)}}</p>
              </div>
              <div class="group-notice">
                <p class="group-time">{{getMsgLastMsgTime(chatGroup.message)}}</p>
                <p :class="getUnreadClass(chatGroup.noReaderCount, index===curindex)">{{getUnReadCount(chatGroup.noReaderCount, index)}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="chat">
        <div class="chat-header">
            <chatHeader/>
        </div>
        <ChatPage :chat="curChat" @updateChatList="updateChatList"></ChatPage>
      </div>
    </div>
</template>

<script>
import {ServerApi} from '../server/serverapi.js'
import ChatPage from './chat.vue'
import listHeader from './listheader'
import chatHeader from './chatheader'
import {Appendzero} from '../server/Utils.js'

export default {
  components: {
    ChatPage,
    listHeader,
    chatHeader
  },
  computed: {
    chatGroupList: {
      get: function() {
        return this.$store.getters.getChatGroup;
      },
      set: function(new_list) {
        this.$store.commit("setChatGroup", new_list);
      }
    }
  },
  data() {
    return {
      //需要展示的用户群组
      curChat: {},
      needUpdate: 1,
      curindex: 0,
      searchKey: '',
    };
  },
  methods: {
    updateChatList(newMsg) {
      ++this.needUpdate;
      for(var i=0;i<this.$store.state.chatGroup.length;i++) {
        if(this.$store.state.chatGroup[i].group.groupId === newMsg.groupId) {
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
      let curYeat = curDate.getFullYear();
      let curMonth = curDate.getMonth();
      let curDay = curDate.getDay();

      let distdate = new Date(secondsTime);
      let y = distdate.getFullYear();
      let mon = distdate.getUTCMonth() + 1;
      let d = distdate.getDay();
      let h = distdate.getHours();
      let m = distdate.getMinutes();
      let s = distdate.getSeconds();

      // console.log(distdate)
      // console.log(cutTime)
      // console.log(y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m) + ":" + Appendzero(s))

      if(cutTime < 24 * 3600 * 1000 && curDay - d === 0)
      {
        return Appendzero(h) + ":" + Appendzero(m);
      }
      else if((cutTime >= 24 * 3600 * 1000 && cutTime < 48 * 3600 * 1000) || curDay - d === 1)
      {
        return "昨天 " + Appendzero(h) + ":" + Appendzero(m);
      }
      else
      {
        return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
      }
    },
    getMsgLastMsgTime(chatGroupMsg) {
      if(chatGroupMsg === null){
        return "";
      }
      var timesecond = chatGroupMsg.timestamp;
      var formatTime = this.formatTimeFilter(timesecond);
      return formatTime;
    },
    getShowMsgContent(chatGroupMsg) {
      //console.log(chatGroupMsgContent)
      if(chatGroupMsg === null){
        return "";
      }
      var chatGroupMsgContent = chatGroupMsg.content;
      var chatGroupMsgType = chatGroupMsg.msgContentType;
      if(chatGroupMsgContent === null) {
        return null;
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
          var invitee = chatGroupMsgContent.userInfos.userName;
          var inviter = chatGroupMsgContent.userName;
          return inviter + " 邀请 " + invitee + " 加入群聊";
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
          var bybyer = chatGroupMsgContent.userInfos.userName;
          return owner + " 将 " + bybyer + " 移出了群聊";
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
      console.log("Chat-Content showChat");
      this.curChat = chatGroup;
      this.curindex = index;
    },
    getGroupList: function() {
      this.serverapi.ListAllGroup()
          .then((response) => {
              var ret_data = response.data;
              var ret_list = ret_data.results;
              //console.log(ret_list)
              
              this.$store.commit("setChatGroup", ret_list);
          })
    },
  },
  created: function() {
    console.log("chat content created");
    this.serverapi = new ServerApi('http', '139.198.15.253');
    this.serverapi.m_accesstoken = this.$store.state.accesstoken;
    this.getGroupList();
    this.$nextTick(() => {
      let curGroup = this.$store.state.chatGroup[0];
      this.showChat(curGroup, 0);
    })
  }
};
</script>

<style lang="scss" scoped>
  ::-webkit-scrollbar-track-piece {
    background-color: #F1F1F1;
    border-radius: 10px;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 12px;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: #C1C1C1;
    border-radius: 10px;
    outline: none;
  }

  ::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #A8A8A8;
    border-radius: 10px;
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
    height: 56px;
    line-height: 56px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    margin: 0px 0px 5px 0px;
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
    height: 64px;
  }

  .group.active {
    height: 64px;
    background-color: rgb(245, 246, 247);
  }

  .group-ico {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 10px;
    margin-top: 12px;
    margin-right: 0px;
    margin-bottom: 12px;
  }
  
  .group-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 120px);
  }

  .group-name {
    width: calc(100% - 20px);
    height: 40%;
    font-size: 14px;
    font-weight: 550;
    font-family:Microsoft Yahei;
    color: rgb(51, 51, 51);
    overflow: hidden;
    margin-left: 10px;
    margin-top: 13px;
    margin-right: 0px;
    margin-bottom: 2px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .group-content {
    font-size: 13px;
    color: rgb(170, 179, 178);
    overflow: hidden;
    margin-left: 10px;
    margin-top: 0px;
    margin-right: 10px;
    margin-bottom: 5px;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 40%;
  }

  .group-notice {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 60px;
  }

  .group-time {
    font-size: 12px;
    color: rgb(200, 202, 204);
    margin-left: 0px;
    margin-top: 13px;
    margin-right: 0px;
    margin-bottom: 2px;
    height: 40%;
    text-align: right;
  }

  .group-unread {
    font-size: 12px;
    float: right;
    color: rgb(255, 255, 255);
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 10px;
    text-align: center;
    height: 15px;
    width: 15px;
    line-height: 15px;
    border-radius: 20px;
    background-color: rgb(255, 59, 48);
  }

  .group-readall-selected {
    font-size: 12px;
    float: right;
    color: rgb(255, 255, 255);
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 5px;
    text-align: center;
    height: 15px;
    width: 15px;
    line-height: 15px;
    border-radius: 20px;
    background-color: rgb(245, 246, 255);
  }
  
  .group-readall-unselected {
    font-size: 12px;
    float: right;
    color: rgb(255, 255, 255);
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 5px;
    text-align: center;
    height: 15px;
    width: 15px;
    line-height: 15px;
    border-radius: 20px;
    background-color: rgb(255, 255, 255);
  }
</style>
