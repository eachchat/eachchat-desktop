<template>
    <div class="chat-panel">
      <div class="chat-list">
        <div class="list-head">
          <p class="chat-label">聊天</p>
          <el-dropdown class="new-chat-dropdown" trigger="click">
            <span class="new-chat">
              <i class="el-icon-plus el-icon--right"></i>
            </span>
            <el-dropdown-menu class="new-chat-content" slot="dropdown">
                <el-dropdown-item class="create-new-group" icon="el-icon-connection">
                  创建群聊
                </el-dropdown-item>
                <el-dropdown-item class="create-new-secret" icon="el-icon-lock">
                  创建密聊
                </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="list-content">
          <ul class="group-list">
            <li class="group"
                v-for="(chatGroup, index) in chatGroupList"
                @click="showChat(chatGroup.name)"
                >
              <img class="group-ico" :src="chatGroup.group.groupAvatar">
              <div class="group-info">
                <p class="group-name">{{chatGroup.group.groupName}}</p>
                <p class="group-content">{{getMsgContent(chatGroup.message.content, chatGroup.message.msgContentType)}}</p>
              </div>
              <div class="group-notice">
                <p class="group-time">{{getMsgLastMsgTime(chatGroup.message)}}</p>
                <p :class="getUnreadClass(chatGroup.noReaderCount)">{{getUnReadCount(chatGroup.noReaderCount, index)}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="chat">
      </div>
    </div>
</template>

<script>
import {ServerApi} from '../server/serverapi.js'
export default {
  components: {
  },
  computed: {
    chatGroupList: {
      get: function() {
        return this.$store.state.chatGroup;
      },
      set: function(new_list) {
        this.$store.commit("setChatGroup", new_list)
      }
    }
  },
  data() {
    return {
      //需要展示的用户群组
    };
  },
  methods: {
    Appendzero(o_num) {
      if(o_num < 10) return "0" + "" + o_num;
      else return o_num;
    },
    getUnreadClass(unReadCount) {
      if(unReadCount === 0) return "group-readall";
      else return "group-unread"
    },
    getUnReadCount(unReadCount) {
      if(unReadCount === 0) return "";
      else return unReadCount
    },
    formatTimeFilter(secondsTime) {
      let curDate = new Date()
      let curDateSecond = curDate.getTime()
      let cutTime = curDateSecond - secondsTime
      let curYeat = curDate.getFullYear()
      let curMonth = curDate.getMonth()
      let curDay = curDate.getDay()

      let distdate = new Date(secondsTime);
      let y = distdate.getFullYear()
      let mon = distdate.getUTCMonth() + 1
      let d = distdate.getDate()
      let h = distdate.getHours();
      let m = distdate.getMinutes();
      let s = distdate.getSeconds();

      // console.log(cutTime)
      // console.log(y + "-" + this.Appendzero(mon) + "-" + this.Appendzero(d) + " " + this.Appendzero(h) + ":" + this.Appendzero(m) + ":" + this.Appendzero(s))

      if(cutTime > 0 && cutTime < 24 * 3600 * 1000)
      {
        return h + ":" + m
      }
      else if(cutTime >= 24 * 3600 * 1000 && cutTime < 48 * 3600 * 1000)
      {
        return "昨天"
      }
      else
      {
        return y + "-" + this.Appendzero(mon) + "-" + this.Appendzero(d)
      }
    },
    getMsgLastMsgTime(chatGroupMsg) {
      var timesecond = chatGroupMsg.timestamp
      var formatTime = this.formatTimeFilter(timesecond)
      return formatTime
    },
    getMsgContent(chatGroupMsgContent, chatGroupMsgType) {
      //console.log(chatGroupMsgContent)
      if(chatGroupMsgType === 101)
      {
        return chatGroupMsgContent.text
      }
      else if(chatGroupMsgType === 102)
      {
        return "[图片]"
      }
      else if(chatGroupMsgType === 103)
      {
        return "[文件]"
      }
      else if(chatGroupMsgType === 104)
      {
        if(chatGroupMsgContent.type === "invitation")
        {
          var invitee = chatGroupMsgContent.userInfos.userName
          var inviter = chatGroupMsgContent.userName
          return inviter + " 邀请 " + invitee + " 加入群聊"
        }
        else if(chatGroupMsgContent.type === "notice")
        {
          var owner = chatGroupMsgContent.userName
          return owner + " 发布群公告"
        }
        else if(chatGroupMsgContent.type === "updateGroupName")
        {
          var owner = chatGroupMsgContent.userName
          var distName = chatGroupMsgContent.text
          return owner + " 修改群名称为 " + distName
        }
        else if(chatGroupMsgContent.type === "deleteGroupUser")
        {
          var owner = chatGroupMsgContent.userName
          var bybyer = chatGroupMsgContent.userInfos.userName
          return owner + " 将 " + bybyer + " 移出了群聊"
        }
        else
        {
          return "您收到一条短消息"
        }
      }
      else if(chatGroupMsgType === 105)
      {
        return "[语音]"
      }
      else if(chatGroupMsgType === 106)
      {
        return "[聊天记录]"
      }
      return "123"
    }
  },
  created: function() {
    console.log("Created")
    InitServerAPI('http', '139.198.15.253')
    ListAllGroup()
        .then((response) => {
            //console.log(response)
            var ret_data = response.data
            var ret_list = ret_data.results
            this.$store.commit("setChatGroup", ret_list)
        })
  }
};
</script>

<style lang="scss" scoped>
  .chat-panel {
    width: 890px;
    height: 100%;
    display: flex;
    flex-direction: row;
  }
  .chat {
    width:610px;
    flex: 1;
    background-color: white;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .new-chat-dropdown {
    float: right;
    height: 60px;
    width: 60px;
    border: 0px;
  }

  .new-chat {
    line-height: 60px;
    border: 0px;
    background-color: rgb(242, 242, 246);
  }

  .chat-label {
    float: left;
    overflow: hidden;
    height: 60px;
    width:68px;
    margin:0;
    line-height: 60px;
    text-align: center;
  }

  .chat-list {
    height: 100%;
    width: 280px;
    display: flex;
    flex-direction: column;
    border: 1px solid rgb(242, 242, 246);
  }

  .list-head {
    display: block;
    width: 100%;
    height: 60px;
    background-color: rgb(242, 242, 246);
  }

  .list-content {
    height: 100%;
    overflow-y: scroll;
    
  }

  .group-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  .group {
    height: 50px;
  }

  .group-ico {
    width: 30px;
    height: 30px;
    display: inline-block;
    margin-left: 10px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
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
    color: rgb(57, 57, 57);
    overflow: hidden;
    margin-left: 10px;
    margin-top: 5px;
    margin-right: 0px;
    margin-bottom: 5px;
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
    color: rgb(170, 179, 178);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 5px;
    margin-right: 0px;
    margin-bottom: 5px;
    height: 40%;
    text-align: right;
  }

  .group-unread {
    font-size: 12px;
    float: right;
    color: rgb(255, 255, 255);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 5px;
    text-align: center;
    height: 15px;
    width: 15px;
    line-height: 15px;
    border-radius: 20px;
    background-color: rgb(255, 59, 48);
  }

  .group-readall {
    font-size: 12px;
    float: right;
    color: rgb(255, 255, 255);
    overflow: hidden;
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
