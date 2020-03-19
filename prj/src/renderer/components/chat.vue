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
                    <li v-for="(item, index) in messageListShow"
                        :class="ChatLeftOrRightClassName(item)">
                        <div class="msg-info-time" v-show="showTimeOrNot(item, messageListShow[index-1])">{{MsgTime(item)}}</div>
                        <div class="chat-notice" v-show="showNoticeOrNot(item)">{{NoticeContent(item)}}</div>
                        <imessage :msg="item"></imessage>
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
import imessage from './message.vue'

export default {
    components: {
        imessage,
    },
    props: ['chat'],
    methods: {
        updateChatList: function() {
            this.$store.state.chatGroup[0].message = this.messageList[-1];
        },
        getUserId: function() {
            if(this.chat.group.groupType === 101)
            {
                return '';
            }
            else
            {
                return this.chat.group.userIds.pop(this.$store.state.userInfo.id)[0];
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
        showNoticeOrNot: function(curMsg) {
            if(curMsg === null) {
                return false;
            }
            let chatGroupMsgType = curMsg.msgContentType;
            let chatGroupMsgContent = curMsg.content;
            if(chatGroupMsgType === 104)
            {
                return true;
            }
            else {
                return false;
            }
        },
        NoticeContent: function(curMsg) {
            if(curMsg === null) {
                return '';
            }
            let chatGroupMsgType = curMsg.msgContentType;
            let chatGroupMsgContent = curMsg.content;
            if(chatGroupMsgType === 104)
            {
                if(chatGroupMsgContent.type === "invitation")
                {
                    console.log(chatGroupMsgContent)
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
                    var bybyer = chatGroupMsgContent.userInfos.userName;
                    return owner + " 将 " + bybyer + " 移出了群聊";
                }
                else
                {
                    return "";
                }
            }
            return "";
        },
        openImageProxy: function() {

        },
        showTimeOrNot(curMsg, lastMsg) {
            if(lastMsg === undefined) {
                return true
            }

            let cutTime = curMsg.timestamp - lastMsg.timestamp;

            if(cutTime > 1000 * 1 * 60) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgTime(curMsg) {
            if(curMsg === null) {
                return "";
            }
            var secondsTime = curMsg.timestamp;
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
                return value1 - value2;
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
    computed: {
        messageListShow: {
            get: function() {
                return this.messageList.reverse()
            },
            set: function() {
                this.$store.commit(setMessageLists, this.messageList)
            }
        }
    },
    watch: {
        chat: function() {
            if(this.curGroupId != this.chat.group.groupId) {
                console.log(this.chat.group.groupId)
                this.messageList = this.$store.getters.getChatMsgHistory(this.chat.group.groupId);
                this.messageList.unshift(this.chat.message);
                this.$nextTick(() => {
                    let div = document.getElementById("message-show");
                    if(div) {
                        div.scrollTop = div.scrollHeight;
                    }
                })
                this.curGroupId = this.chat.group.groupId;
                var curSequenceId = this.chat.message.sequenceId;
                this.serverapi.HistoryMessage(this.chat.group.groupId, curSequenceId)
                    .then((responer) => {
                        var theList = responer.data.results;
                        //console.log(theList)
                        for(var i=0;i<theList.length;i++) {
                            theList[i]["SendSuccess"] = true;
                        }
                        this.$store.commit("setMessageLists", theList, false);
                    })
            }
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
        padding: 0;
    }

    .msg-info {
        width: 100%;
        margin: 5px 0 5px 0;
    }

    .msg-info-time {
        width: 100%;
        text-align: center;
        font-size: 12px;
        font-family: 'Microsoft YaHei';
        color: rgb(153, 153, 153);
        margin: 5px 0 5px 0;
    }

    .chat-notice {
        width: 100%;
        text-align: center;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        color: rgb(153, 153, 153);
        margin: 10px 0 10px 0;
    }

    .message-right {
        width: 100%;
        float:right;
        margin-top: 8px;
        margin-bottom: 8px;
    }

    .message-left {
        width: 100%;
        float: left;
        margin-top: 8px;
        margin-bottom: 8px;
    }

    .chat-input {
        width: 100%;
        height: 170px;
        font-family: 'Microsoft YaHei';
        font-size: 14px;
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
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        height: 150px;
    }
    .text-input:focus {
        outline: none;
        width: 100%;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        height: 55px;
    }
</style>