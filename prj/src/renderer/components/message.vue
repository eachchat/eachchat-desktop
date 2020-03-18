<template>
    <div class="message">
        <div class="chat-msg-body">
            <div class="msg-info-mine" v-if="MsgIsMine()">
                <div class="msgState" v-if="MsgIsSending()">
                    <i class="el-icon-loading"></i>
                </div>
                <div class="msgState" v-else-if="MsgIsFailed()">
                    <i class="el-icon-warning"></i>
                </div>
                <div class="msgState" v-else>
                </div>
                <div class="about-msg">
                    <div class="each-msg-info-time" v-show=false>{{MsgTime()}}</div>
                    <div class="msg-info-username-mine" v-show=false>{{MsgBelongUserName()}}</div>
                    <pre class="chat-msg-content-mine" v-text="MsgContent()" v-on:click="openImageProxy()"></pre>
                </div>
                <img class="msg-info-img" :src="MsgBelongUserImg()" alt="头像">
            </div>
            <div class="msg-info-others" v-else>
                <img class="msg-info-img" :src="MsgBelongUserImg()" alt="头像">
                <div class="about-msg">
                    <div class="msg-info-username-others" v-show=false>{{MsgBelongUserName()}}</div>
                    <div class="each-msg-info-time" v-show=false>{{MsgTime()}}</div>
                    <pre class="chat-msg-content-others" v-text="MsgContent()" v-on:click="openImageProxy()"></pre>
                </div>
                <div class="msgState" v-if="MsgIsSending()">
                    <i class="el-icon-loading"></i>
                </div>
                <div class="msgState" v-else-if="MsgIsFailed()">
                    <i class="el-icon-warning"></i>
                </div>
                <div class="msgState" v-else>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ServerApi } from '../server/serverapi'
import {generalGuid, Appendzero} from '../server/Utils.js'

export default {
    props: ['msg'],
    methods: {
        MsgIsFailed: function() {
        },
        MsgIsSending: function() {
        },
        openImageProxy: function() {
        },
        MsgContent: function() {
            if(this.msg === null) {
                return '';
            }
            let chatGroupMsgType = this.msg.msgContentType;
            let chatGroupMsgContent = this.msg.content;
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
        MsgTime: function() {
            if(this.msg === null){
                return "";
            }
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let cutTime = curDateSecond - this.msg.timestamp;
            let curYeat = curDate.getFullYear();
            let curMonth = curDate.getMonth();
            let curDay = curDate.getDay();

            let distdate = new Date(this.msg.timestamp);
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
        MsgBelongUserName: function() {
            var UserName = '';
            if(this.msg === null) {
                return '';
            }
            else {
                var res = this.$store.getters.getChatUserName(this.msg.fromId);
                return res;
            }
        },
        MsgIsMine:function() {
            if(this.msg.fromId === this.$store.state.userInfo.id) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgBelongUserImg: function () {
            if(this.msg === null) {
                return '/static/Img/User/user.jpeg';
            }
            else {
                var res = this.$store.getters.getChatUserIcon(this.msg.fromId, false);
                return res;
            }
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
            messageContent: '',
        }
    },
    mounted: function() {
    },
    created: function() {
        this.serverapi = new ServerApi('http', '139.198.15.253');
        this.serverapi.m_accesstoken = this.$store.state.accesstoken;
    }
}
</script>

<style lang="scss">
    .message {
        font-size: 15px;
    }

    .chat-msg-body {
        font-size: 15px;
        max-width: 100%;
        margin-right: 0;
    }

    .msg-info-mine {
        width: 60%;
        float: right;
        display: block;
    }

    .msg-info-others {
        width: 60%;
        float: left;
        display: block;
        margin-left: 8px;
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
        padding: 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-mine {
        background-color: rgb(220,244,233);
        max-width: calc(100%-20px);
        border-radius: 5px;
        padding: 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }  

</style>