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
                    <div class="msg-info-username-mine" v-show=false>{{MsgBelongUserName()}}</div>
                    <div class="chat-msg-content-mine-img"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <img class="msg-image" :id="msg.message_id" alt="图片" :height="imageHeight">
                    </div>
                    <div class="chat-msg-content-mine-file"
                        v-on:click="ShowFile()" v-else-if="MsgIsFile()">
                        <img class="file-image" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">
                        <div class="file-info">
                            <p class="file-name">{{this.fileName}}</p>
                            <p class="file-size">{{this.fileSize}} K</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-mine-txt-div" 
                        v-on:click="ShowFile()" v-else>
                        <p class="chat-msg-content-mine-txt" :id="msg.message_id">{{messageContent}}</p>
                    </div>
                </div>
                <img class="msg-info-user-img" :id="getUserIconId()" src='/static/Img/User/user.jpeg' alt="头像" @click="showUserInfoTip">
            </div>
            <div class="msg-info-others" v-else>
                <img class="msg-info-user-img" :id="getUserIconId()" src='/static/Img/User/user.jpeg' alt="头像" @click="showUserInfoTip">
                <div class="about-msg">
                    <div class="msg-info-username-others" v-show=false>{{MsgBelongUserName()}}</div>
                    <div class="chat-msg-content-others-img"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <img class="msg-image" :id="msg.message_id" alt="图片" :height="imageHeight">
                    </div>
                    <div class="chat-msg-content-others-file"
                        v-on:click="ShowFile()" v-else-if="MsgIsFile()">
                        <img class="file-image" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">
                        <div class="file-info">
                            <p class="file-name">{{this.fileName}}</p>
                            <p class="file-size">{{this.fileSize}}</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-others-txt-div" 
                        v-on:click="ShowFile()" v-else>
                        <p class="chat-msg-content-others-txt" :id="msg.message_id">{{messageContent}}</p>
                    </div>
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
import * as path from 'path'
import * as fs from 'fs-extra'
import {shell} from 'electron'

import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import {downloadGroupAvatar, generalGuid, Appendzero, FileUtil, confservice, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft} from '../../packages/core/Utils.js'

export default {
    components: {
    },
    props: ['msg'],
    methods: {
        showUserInfoTip: function() {
            if(this.userIconElement == undefined) {
                this.userIconElement = document.getElementById(userIconElementId);
            }
            if(this.userIconElement == undefined) {
                // ToDo exception.
                return;
            }
            var curAbsoluteTop = getElementTop(this.userIconElement);
            var curAbsoluteLeft = getElementLeft(this.userIconElement);
            var tipInfos = {
                "userInfo": this.userInfo,
                "absoluteTop": curAbsoluteTop,
                "absoluteLeft": curAbsoluteLeft,
                "isMine": this.MsgIsMine(),
            }
            console.log("emit absoluteTop ", curAbsoluteTop);
            console.log("emit absoluteLeft ", curAbsoluteLeft);
            // console.log("emit openUserInfoTip ", tipInfos);
            this.$emit("openUserInfoTip", tipInfos);
        },
        getUserIconId: function() {
            return this.msg.message_id + "-usericon"
        },
        ShowFile: function() {
            console.log("open image proxy ", this.msg)
            let msgType = this.msg.message_type;
            let msgContent = strMsgContentToJson(this.msg.message_content);
            if(msgType === 102)
            {
                this.$emit('showImageOfMessage', this.msg);
                // shell.openExternal("C:\\Users\\wangx\\Pictures\\1-1Z919202U1519.jpg");
            }
            else if(msgType === 103)
            {
                shell.openExternal("C:\\Users\\wangx\\Downloads\\服务端API文档.docx");
            }
        },
        MsgIsFailed: function() {
        },
        MsgIsSending: function() {
        },
        getFileIconThroughExt: function(ext) {
            var iconPath = getIconPath(ext);
            return iconPath;
        },
        MsgIsImage: function() {
            let chatGroupMsgType = this.msg.message_type;
            if(chatGroupMsgType == 102){
                return true;
            }
            else{
                return false;
            }
        },
        MsgIsFile: function() {
            let chatGroupMsgType = this.msg.message_type;
            if(chatGroupMsgType == 103){
                return true;
            }
            else{
                return false;
            }
        },
        MsgContent: function(is_mine=false) {
            if(this.msg === null) {
                return '';
            }
            this.messageContent = '';
            let chatGroupMsgType = this.msg.message_type;
            var chatGroupMsgContent = strMsgContentToJson(this.msg.message_content);
            console.log("chatGroupMsgContent is ", chatGroupMsgContent)
            if(chatGroupMsgType === 101)
            {
                var textMsgImgElement = document.getElementById(this.msg.message_id);
                this.messageContent = sliceReturnsOfString(chatGroupMsgContent.text);
                if(this.messageContent.length == 0) {
                    this.messageContent = "\n";
                }
                // console.log("this.messageContent is ", this.messageContent)
                // textMsgImgElement.innerHTML = this.messageContent;
            }
            else if(chatGroupMsgType === 102)
            {
                var imgMsgImgElement = document.getElementById(this.msg.message_id);
                if(false && fs.existsSync(chatGroupMsgContent.thumbnailImage)){
                    //thumbnailImage为本地路径，该消息为自己发送的消息，读取本地图片显示
                    var thumb_local_path = chatGroupMsgContent.thumbnailImage;
                    var showfu = new FileUtil(thumb_local_path);
                    let showfileObj = showfu.GetUploadfileobj();
                    let reader = new FileReader();
                    reader.readAsDataURL(showfileObj);
                    reader.onloadend = () => {
                        let imageHeight = 100;
                        if(chatGroupMsgContent.imgHeight < 100){
                            imageHeight = chatGroupMsgContent.imgHeight;
                        }
                        this.imageHeight = imageHeight;
                        imgMsgImgElement.setAttribute("src", URL.createObjectURL(reader.result));
                        imgMsgImgElement.setAttribute("height", imageHeight);
                    }
                }
                else{
                    this.serverapi.downloadTumbnail(this.$store.state.accesstoken, "T", this.msg.time_line_id)
                        .then((ret) => {
                            let reader = new FileReader();
                            reader.readAsDataURL(ret.data);
                            reader.onloadend = () => {
                                let imageHeight = 100;
                                if(chatGroupMsgContent.imgHeight < 100){
                                    imageHeight = chatGroupMsgContent.imgHeight;
                                }
                                this.imageHeight = imageHeight;
                                imgMsgImgElement.setAttribute("src", reader.result);
                                imgMsgImgElement.setAttribute("height", imageHeight);
                            }
                        })
                }
            }
            else if(chatGroupMsgType === 103)
            {
                var fileMsgImgElement = document.getElementById(this.msg.message_id);
                var iconPath = this.getFileIconThroughExt(chatGroupMsgContent.ext);
                var showfu = new FileUtil(iconPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    this.fileName = chatGroupMsgContent.fileName;
                    this.fileSize = (chatGroupMsgContent.fileSize/1024).toFixed(2);
                    fileMsgImgElement.setAttribute("src", reader.result);
                    fileMsgImgElement.setAttribute("height", 46);
                }
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
            else {
                return this.messageContent = "不支持的消息类型，请升级客户端。"
            }
        },
        MsgBelongUserName: function() {
            var UserName = '';
            if(this.msg === null) {
                return '';
            }
            else {
                var res = this.$store.getters.getChatUserName(this.msg.message_from_id);
                return res;
            }
        },
        MsgIsMine:function() {
            if(this.msg.message_from_id === this.$store.state.userId) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgBelongUserImg: async function () {
            // var distUserInfo = await services.common.GetDistUserinfo(this.msg.message_from_id);
            if(this.userInfo == undefined || this.userInfo == null) {
                return;
            }
            var userIconElementId = this.getUserIconId();
            this.userIconElement = document.getElementById(userIconElementId);
            if(this.userIconElement == undefined) {
                return;
            }
            console.log("this.userInfo.user_id is ", this.userInfo.user_id);
            var distTAvarar = this.userInfo.avatar_t_url;

            downloadGroupAvatar(distTAvarar, this.loginInfo.access_token)
            .then((ret) => {
                this.userIconElement.setAttribute("src", URL.createObjectURL(ret.data));
                this.userIconElement.onload = () => {
                    URL.revokeObjectURL(this.userIconElement.getAttribute("src"))
                }
            })
        },
        msgUserInfo: async function() {
            console.log("this.msg.message_from_id is ", this.msg.message_from_id);
            console.log("this.msg.message_id is ", this.msg.message_id);
            var userInfos = await services.common.GetDistUserinfo(this.msg.message_from_id);
            console.log("userInfo is ", userInfos)
            if(userInfos == undefined || userInfos.length == 0) {
                console.log("err");
                this.userInfo = {};
                return;
            }

            this.userInfo = userInfos[0];
        },
        compare: function(){
            return function(a, b)
            {
                var value1 = a.sequence_id;
                var value2 = b.sequence_id;
                return value2 - value1;
            }
        }
    },
    data() {
        return {
            messageContent: '',
            fileName: '',
            fileIcon: '',
            fileSize: 0,
            imageHeight: 46,
            editorOption : {
                placeholder: "",
                theme:'bubble',
            },
            userIconElement: null,
            userInfo: null,
        }
    },
    mounted: async function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        setTimeout(() => {
            this.$nextTick(() => {
                if(this.MsgIsMine()) {
                    this.MsgContent(true);
                }
                else {
                    this.MsgContent(false);
                }
                
                var userIconElementId = this.getUserIconId();
                if(this.userIconElement == undefined) {
                    this.userIconElement = document.getElementById(userIconElementId);
                }
                this.MsgBelongUserImg();
            })
        }, 0)
        await this.msgUserInfo();
    },
    created: async function() {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
        this.loginInfo = await services.common.GetLoginModel();
        this.curUserInfo = await services.common.GetSelfUserModel();
    },
    watch: {
        msg: function() {
            this.$nextTick(() => {
                setTimeout(() => {
                    this.$nextTick(() => {
                        if(this.MsgIsMine()) {
                            this.MsgContent(true);
                        }
                        else {
                            this.MsgContent(false);
                        }
                        this.msgUserInfo();
                        this.MsgBelongUserImg();
                    })
                }, 0)
            })
        }
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

    .msg-info-user-img {
        display: inline-block;
        vertical-align: top;
        width: 40px;
        height: 40px;
    }

    .msg-info-user-img:hover {
        display: inline-block;
        vertical-align: top;
        width: 40px;
        height: 40px;
        cursor: pointer;
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
    
    .chat-msg-content-others-txt-div {
        float: left;
        background-color: rgb(245,246,247);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-others-txt-div:hover {
        float: left;
        background-color: rgb(233,234,235);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    
    .chat-msg-content-others-txt{
        float: left;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-others-txt:hover{
        float: left;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-others-img {
        float: left;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-others-file {
        float: left;
        background-color: rgb(245,246,247);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-others-file:hover {
        float: left;
        background-color: rgb(233,234,235);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .file-image {
        height: 46px;
        display: inline-block;
    }
    
    .file-info {
        height: 46px;
        display: inline-block;
        vertical-align: top;
    }

    .file-name {
        font-size: 14px;
        font-weight: 550;
        font-family:Microsoft Yahei;
        color: rgb(51, 51, 51);
        overflow: hidden;
        margin-left: 10px;
        margin-top: 4px;
        margin-right: 0px;
        margin-bottom: 3px;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .file-size {
        font-size: 12px;
        font-family:Microsoft Yahei;
        color: rgb(153, 153, 153);
        overflow: hidden;
        margin-left: 10px;
        margin-top: 3px;
        margin-right: 0px;
        margin-bottom: 4px;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .chat-msg-content-mine-txt-div {
        float:right;
        background-color: rgb(220,244,233);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-mine-txt-div:hover{
        float:right;
        background-color: rgb(209,232,221);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-mine-txt {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-mine-txt:hover {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-mine-img {
        float: right;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-mine-file {
        float:right;
        background-color: rgb(220,244,233);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }
    
    .imageTip {
        text-align: center;
    }
</style>