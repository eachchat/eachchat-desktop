<template>
    <div class="chat-page">
        <div class="chat-title">
            <p class="chat-label">{{chat.group.groupName}}</p>
            <div class="chat-tools">
                <div class="chat-tool-more" @click="More()">
                    <i class="el-icon-more"></i>
                </div>
                <div class="chat-tool-call" @click="Call()">
                    <i class="el-icon-phone"></i>
                </div>
            </div>
        </div>
        <div class="chat-main">
            <div class="chat-main-message" id="message-show">
                <ul class="msg-list">
                    <li v-for="item in messageList"
                        :class="ChatLeftOrRightClassName(item)">
                        <div class="msg-info-time" v-show="showTimeOrNot(item)">{{MsgTime(item)}}</div>
                        <div class="chat-msg-body">
                            <div class="msg-info-mine" v-if="MsgIsMine(item)">
                                <div class="msgState" v-if="MsgIsSending(item)">
                                    <i class="el-icon-loading"></i>
                                </div>
                                <div class="msgState" v-else-if="MsgIsFailed(item)">
                                    <i class="el-icon-warning"></i>
                                </div>
                                <div class="msgState" v-else>
                                </div>
                                <div class="about-msg">
                                    <div class="each-msg-info-time" v-show=false>{{MsgTime(item)}}</div>
                                    <div class="msg-info-username-mine">{{MsgBelongUserName(item)}}</div>
                                    <pre class="chat-msg-content-mine" v-html="MsgContent(item)" v-on:click="openImageProxy(item)"></pre>
                                </div>
                                <img class="msg-info-img" :src="MsgBelongUserImg(item)" alt="头像">
                            </div>
                            <div class="msg-info-others" v-else>
                                <img class="msg-info-img" :src="MsgBelongUserImg(item)" alt="头像">
                                <div class="about-msg">
                                    <div class="msg-info-username-others">{{MsgBelongUserName(item)}}</div>
                                    <div class="each-msg-info-time" v-show=false>{{MsgTime(item)}}</div>
                                    <pre class="chat-msg-content-others" v-html="MsgContent(item)" v-on:click="openImageProxy(item)"></pre>
                                </div>
                                <div class="msgState" v-if="MsgIsSending(item)">
                                    <i class="el-icon-loading"></i>
                                </div>
                                <div class="msgState" v-else-if="MsgIsFailed(item)">
                                    <i class="el-icon-warning"></i>
                                </div>
                                <div class="msgState" v-else>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="chat-input">
                <div class="chat-input-operate">
                    <div class="chat-input-tool">
                        <div class="chat-input-expression" @click="showExpression()">
                            <i class="el-icon-toilet-paper"></i>
                        </div>
                        <div class="chat-input-picture" @click="insertPic()">
                            <i class="el-icon-picture"></i>
                        </div>
                        <div class="chat-input-file" @click="insertFiles()">
                            <i class="el-icon-files"></i>
                        </div>
                    </div>
                    <div class="chat-send" @click="sendMsg()">
                        <i class="el-icon-s-promotion"></i>
                    </div>
                </div>
                <textarea class="text-input" v-model="messageContent" @keyup.enter="sendMsg()"></textarea>
            </div>
        </div>
    </div>
</template>

<script>
import { ServerApi } from '../server/serverapi'
import {generalGuid, Appendzero} from '../server/Utils.js'

export default {
    props: ['chat'],
    methods: {
        updateChatList: function() {
            this.$store.state.chatGroup[0].message = this.messageList[-1];
        },
        getUserId: function() {
            if(chat.group.groupType === 101)
            {
                return '';
            }
            else
            {
                return chat.group.userIds.pop(this.$store.state.userInfo.id)[0];
            }
        },
        MsgIsSending: function(curMsg) {
            if(this.sendingMsgIdList.indexOf(curMsg.msgId) > -1){
                return true;
            }
            else{
                return false;
            }
        },
        MsgIsFailed: function(curMsg) {
            if(this.failedList.indexOf(curMsg.msgId) > -1) {
                return true;
            }
            else {
                return false;
            }
        },
        sendMsg: function() {
            let varcontent = this.messageContent;
            let curTimeSeconds = new Date().getTime();
            let willSendMsgContent = {"text": varcontent};
            let guid = generalGuid();
            let willSendMsg = {
                "content": willSendMsgContent,
                "fromId": this.$store.state.userInfo.id,
                "groupId": this.chat.group.groupId,
                "timestamp": curTimeSeconds,
                "msgContentType": 101,
                "msgId": guid,
                };
            this.messageList.push(willSendMsg);
            this.sendingMsgIdList.push(guid);
            this.messageContent = "";

            this.serverapi.SendNewMessage(guid, 101, this.$store.state.userInfo.id, this.chat.group.groupId, this.getUserId, curTimeSeconds, varcontent, "")
                .then((ret) => {
                    var ret_data = ret.data;
                    var code = ret_data.code;
                    var obj = ret_data.obj;
                    if(code != 200) {
                        this.sendingMsgIdList.pop(willSendMsg);
                        this.failedList.push(willSendMsg);
                    }
                    else {
                        this.sendingMsgIdList.pop(willSendMsg);
                        this.messageList.pop(willSendMsg);
                        this.messageList.push(obj.message);
                        this.$store.commit("updateChatGroup", obj.message);
                        this.$emit('updateChatList', obj.message);

                        let div = document.getElementById("message-show");
                        if(div) {
                            div.scrollTop = div.scrollHeight;
                        }

                    }
                })
        },
        openImageProxy: function() {

        },
        MsgContent: function(curMsg) {
            if(curMsg === null) {
                return '';
            }
            let chatGroupMsgType = curMsg.msgContentType;
            let chatGroupMsgContent = curMsg.content;
            if(chatGroupMsgType === 101)
            {
                return chatGroupMsgContent.text;
            }
            else if(chatGroupMsgType === 102)
            {
                return chatGroupMsgContent.thumbnailImage;
            }
            else if(chatGroupMsgType === 103)
            {
                return chatGroupMsgContent.fileName;
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
        },
        showTimeOrNot(curMsg) {
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let cutTime = curDateSecond - curMsg;

            if(cutTime > 1000 * 1 * 60) {
                return true;
            }
            else {
                return false;
            }
        },
        Appendzero(o_num) {
            if(o_num < 10) return "0" + "" + o_num;
            else return o_num;
        },
        MsgTime: function(curMsg) {
            if(curMsg === null){
                return "";
            }
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let cutTime = curDateSecond - curMsg;
            let curYeat = curDate.getFullYear();
            let curMonth = curDate.getMonth();
            let curDay = curDate.getDay();

            let distdate = new Date(curMsg.timestamp);
            let y = distdate.getFullYear();
            let mon = distdate.getUTCMonth() + 1;
            let d = distdate.getDate();
            let h = distdate.getHours();
            let m = distdate.getMinutes();
            let s = distdate.getSeconds();

            if(cutTime > 0 && cutTime < 24 * 3600 * 1000)
            {
                return h + ":" + m;
            }
            else if(cutTime >= 24 * 3600 * 1000 && cutTime < 48 * 3600 * 1000)
            {
                return "昨天";
            }
            else
            {
                return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
            }
        },
        MsgBelongUserName: function(curMsg) {
            var UserName = '';
            if(curMsg === null) {
                return '';
            }
            else {
                var res = this.$store.getters.getChatUserName(curMsg.fromId);
                return res;
            }
        },
        MsgIsMine:function(curMsg) {
            if(curMsg.fromId === this.$store.state.userInfo.id) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgBelongUserImg: function (curMsg) {
            if(curMsg === null) {
                return '/static/Img/User/user.jpeg';
            }
            else {
                var res = this.$store.getters.getChatUserIcon(curMsg.fromId, false);
                return res;
            }
        },
        ChatLeftOrRightClassName: function (curMsg) {
            if(curMsg.fromId === this.$store.state.userInfo.id) {
                return "message-right";
            }
            else {
                return "message-left";
            }
        },
        Call: function() {
            console.log("make a call");
        },
        More: function() {
            console.log("show more");
        },
        compare: function(){
            return function(a, b)
            {
                var value1 = a.sequenceId;
                var value2 = b.sequenceId;
                return value2 - value1;
            }
        }
    },
    data() {
        return {
            messageList: [],
            messageContent: '',
            sendingMsgIdList: [],
            failedList: [],
            curGroupId: '',
        }
    },
    mounted: function() {
    },
    created: function() {
        this.serverapi = new ServerApi('http', '139.198.15.253');
        this.serverapi.m_accesstoken = this.$store.state.accesstoken;
    },
    watch: {
        chat: function() {
            if(this.curGroupId === this.chat.group.groupId) {
                this.messageList.unshift(this.chat.message);
            }
            else {
                this.messageList = [];
                this.messageList.push(this.chat.message);
            }
            this.curGroupId = this.chat.group.groupId;
            var hasNext = true;
            var curSequenctId = this.chat.message.sequenceId;
            this.serverapi.HistoryMessage(this.chat.group.groupId, curSequenctId)
                .then((responer) => {
                    hasNext = responer.hasNext;
                    var newList = responer.data.results.sort(this.compare());
                    for(var i=0;i<newList.length;i++) {
                        if(this.messageList[0].sequenceId != newList[i].sequenceId)
                            this.messageList.unshift(newList[i]);
                    }
                    curSequenctId = newList[0].sequenceId;
                    this.$nextTick(() => {
                        let div = document.getElementById("message-show");
                        if(div) {
                            div.scrollTop = div.scrollHeight;
                        }
                    })
                })
            
        }
    }
}
</script>

<style lang="scss">
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

    .chat-page {
        width: 100%;
        height: 100%;
    }

  .chat-title {
    display: float;
    width: 100%;
    height: 42px;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(242, 242, 246);
    -webkit-app-region: drag;
    * {
        
        -webkit-app-region: no-drag;
    }
  }

  .chat-label {
    margin:10px 30px 20px 30px;
    float: left;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .chat-tools {
    margin:0;
    float: right;
    height: 100%;
    width: 200px;
  }

  .chat-tool-more {
    display: inline-block;
    float: right;
    width: 40px;
    line-height: 100%;
    padding: 12px 0px 22px 0px;
    margin: 0px;
  }

  .chat-tool-call {
    display: inline-block;
    float: right;
    width: 40px;
    line-height: 100%;
    padding: 12px 0px 22px 0px;
    margin: 0px;
  }

  .chat-main {
    display: block;
    width: 100%;
    height: calc(100% - 60px);
    font-size: 18px;
    margin-top: -2px;
  }

  .chat-main-message {
      width: 100%;
      height: calc(100% - 160px);
      border-bottom: 1px solid rgb(242, 242, 246);
      overflow-y: scroll;
  }

  .msg-list {
      list-style: none;
  }

  .message-right {
      width: 60%;
      float:right;
      margin-top: 5px;
      margin-bottom: 5px;
  }

  .message-left {
      width: 60%;
      float: left;
      margin-left: -25px;
      margin-top: 5px;
      margin-bottom: 5px;
  }

  .chat-msg-body {
      font-size: 15px;
      max-width: 100%;
  }

  .msg-info-mine {
      width: 100%;
      display: block;
  }

  .msg-info-others {
      width: 100%;
  }

  .msg-info-img {
      display: inline-block;
      vertical-align: top;
      width: 40px;
      height: 40px;
  }

  .about-msg {
      display: inline-block;
      margin: 0px 10px 5px 10px;
      width: calc(100% - 95px);
  }

  .msgState {
      display: inline-block;
      width: 20px;
      height: 20px;
  }

  .msg-info-time {
      width: 100%;
  }

  .each-msg-info-time {
      height: 15px;
      font-size: 10px;
  }

  .msg-info-username-mine {
      display: block;
      font-size: 10px;
      color: rgb(153, 153, 153);
      text-align: right;
      
  }

  .msg-info-username-others {
      display: block;
      font-size: 10px;
      color: rgb(153, 153, 153);
  }

  .chat-msg-content-others {
      background-color: rgb(245,246,247);
      width: calc(100%-20px);
      border-radius: 5px;
      padding: 10px;
      font-size: 14px;
      margin: 0px;
      white-space: pre-wrap;
      word-wrap: break-word;
  }

  .chat-msg-content-mine {
      background-color: rgb(220,244,233);
      max-width: calc(100%-20px);
      border-radius: 5px;
      padding: 10px;
      font-size: 14px;
      margin: 0px;
      white-space: pre-wrap;
      word-wrap: break-word;
  }  

  .chat-input {
      width: 100%;
      height: 100px;
  }

  .chat-input-operate {
      width: 100%;
      height: 40px;
  }

  .chat-input-tool {
      display: inline-block;
      width: calc(100%-50px);
      height: 40px;
  }

  .chat-input-expression {
      display: inline-block;
      margin: 0;
      padding: 11px 11px 11px 11px;
  }

  .chat-input-picture {
    display: inline-block;
      margin: 0;
      padding: 11px 11px 11px 11px;
  }

  .chat-input-file {
      display: inline-block;
      margin: 0;
      padding: 11px 11px 11px 11px;
  }

  .chat-send {
      display: inline-block;
      width: 40px;
      float:right;
      margin: 0;
      padding: 11px 11px 11px 11px;
  }
  .text-input {
      border: 0px;
      width: 100%;
      height: 55px;
  }
  .text-input:focus {
      outline: none;
      width: 100%;
      height: 55px;
  }
</style>