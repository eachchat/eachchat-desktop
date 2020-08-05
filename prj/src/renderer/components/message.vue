<template>
    <div class="message" :id="getMessageTemplateId()">
        <div class="chat-msg-body" :key="updateStatus">
            <div class="msg-info-mine" v-if="MsgIsMine()">
                <div class="msgState" v-if="MsgIsSending()">
                    <i class="el-icon-loading"></i>
                </div>
                <div class="msgState" v-else-if="MsgIsFailed()" @click="sendAgain()">
                    <i class="el-icon-warning"></i>
                </div>
                <div class="msgState" v-else>
                </div>
                <div class="about-msg">
                    <div class="msg-info-username-mine" v-show=false>{{MsgBelongUserName()}}</div>
                    <div class="chat-msg-content-mine-img"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <img class="msg-image" :id="msg.message_id" src="../../../static/Img/Chat/loading.gif" alt="图片" :height="imageHeight">
                    </div>
                    <div class="chat-msg-content-mine-file"
                        v-on:click="ShowFile()" v-else-if="MsgIsFile()">
                        <img class="file-image" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">
                        <div class="file-info">
                            <p class="file-name">{{this.fileName}}</p>
                            <p class="file-size">{{this.fileSize}}</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-mine-voice"
                        v-on:click="ShowFile()" v-else-if="MsgIsVoice()">
                        <img class="voice-image" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">
                        <div class="voice-info">
                            <p class="file-size">{{this.voiceLenth}} s</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-mine-transmit"
                        v-on:click="ShowFile()" v-else-if="MsgIsTransmit()">
                        <div class="transmit-title" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgTitle}}</div>
                        <div class="transmit-content" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgContent}}</div>
                    </div>
                    <div class="chat-msg-content-mine-txt-div" 
                        v-on:click="ShowFile()" v-else>
                        <p class="chat-msg-content-mine-txt" :id="msg.message_id">{{messageContent}}</p>
                    </div>
                </div>
                <img class="msg-info-user-img" :id="getUserIconId()" src='../../../static/Img/User/user-40px@2x.png' alt="头像" @click="showUserInfoTip">
            </div>
            <div class="msg-info-others" v-else>
                <img class="msg-info-user-img" :id="getUserIconId()" src='../../../static/Img/User/user-40px@2x.png' alt="头像" @click="showUserInfoTip">
                <div class="about-msg">
                    <div class="msg-info-username-others" v-show=false>{{MsgBelongUserName()}}</div>
                    <div class="chat-msg-content-others-img"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <img class="msg-image" :id="msg.message_id" src="../../../static/Img/Chat/loading.gif" alt="图片" :height="imageHeight">
                    </div>
                    <div class="chat-msg-content-others-file"
                        v-on:click="ShowFile()" v-else-if="MsgIsFile()">
                        <img class="file-image" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">
                        <div class="file-info">
                            <p class="file-name">{{this.fileName}}</p>
                            <p class="file-size">{{this.fileSize}}</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-others-voice"
                        v-on:click="ShowFile()" v-else-if="MsgIsVoice()">
                        <img class="voice-image" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">
                        <div class="voice-info">
                            <p class="file-size">{{this.voiceLenth}} s</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-other-transmit"
                        v-on:click="ShowFile()" v-else-if="MsgIsTransmit()">
                        <div class="transmit-title" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgTitle}}</div>
                        <div class="transmit-content" :id="msg.message_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgContent}}</div>
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
import {ipcRenderer} from 'electron'
import BenzAMRRecorder from 'benz-amr-recorder'

import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import confservice from '../../packages/data/conf_service.js'
import {downloadGroupAvatar, generalGuid, Appendzero, FileUtil, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft, pathDeal, getFileSizeByNumber} from '../../packages/core/Utils.js'

export default {
    components: {
    },
    props: ['msg', 'playingMsgId', 'updateMsg', 'updateUser', 'updateMsgStatus'],
    methods: {
        sendAgain: function() {
            this.$emit("sendAgain", this.msg);
        },
        getMessageTemplateId: function() {
            return "message-template-" + this.msg.message_id;
        },
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
        ShowFile: async function() {
            console.log("open image proxy ", this.msg)
            let msgType = this.msg.message_type;
            let msgContent = strMsgContentToJson(this.msg.message_content);
            // var targetDir = confservice.getFilePath();
            // var targetFileName = this.msg.message_id.toString() + "." + msgContent.ext;
            // var targetPath = path.join(targetDir, targetFileName);
            if(msgType === 102)
            {
                this.$emit('showImageOfMessage', this.msg);
            }
            else if(msgType === 103)
            {
                // var ext = msgContent.ext;
                // var targetDir = confservice.getFilePath();
                var targetFileName = msgContent.fileName;
                var ext = path.extname(targetFileName);
                // var targetPath = path.join(targetDir, targetFileName);
                var targetPath = await services.common.GetFilePath(this.msg.message_id);
                console.log("targetPath is =========== ", targetPath);
                // if(msgContent.fileLocalPath != undefined && fs.existsSync(msgContent.fileLocalPath)){
                //     targetPath = msgContent.fileLocalPath;
                // }
                if(targetPath.length == 0) {
                    targetPath = this.msg.file_local_path;
                }
                if(targetPath.length == 0) {
                    var targetDir = confservice.getFilePath(this.msg.message_timestamp);
                    var targetPath = path.join(targetDir, this.msg.message_id + ext);
                }
                var needOpen = true;
                if(fs.existsSync(targetPath)){
                    shell.openItem(targetPath);
                }
                else{
                    services.common.downloadFile(this.msg.time_line_id, this.msg.message_timestamp, this.msg.message_id + ext, needOpen);
                }
            }
            else if(msgType == 105) {
                var targetFileName = msgContent.fileName;
                var targetPath = await services.common.GetFilePath(this.msg.message_id);
                if(fs.existsSync(targetPath)){
                    if(this.amr == null){
                        this.amr = new BenzAMRRecorder();
                    }
                    if(this.amr.isPlaying()) {
                        console.log("stop")
                        this.amr.stop();
                    }
                    if(this.amr.isInit()) {
                        console.log("play")
                        this.amr.play();
                    }
                    else {
                        this.amr.initWithUrl(targetPath).then(() => {
                            this.amr.play();
                        })
                    }
                }
                else{
                    services.common.downloadVoiceFile(this.msg.time_line_id, this.msg.message_timestamp, targetFileName, needOpen);
                }
                this.$emit('playAudioOfMessage', this.msg.message_id);
            }
            else if(msgType == 106) {
                ipcRenderer.send("showAnotherWindow", [this.msg.time_line_id, this.msg.group_id], "TransmitMsgList");
            }
        },
        MsgIsFailed: function() {
            if(this.msg.message_status == 2) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgIsSending: function() {
            if(this.msg.message_status == 1) {
                return true;
            }
            else {
                return false;
            }
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
        MsgIsVoice: function() {
            let chatGroupMsgType = this.msg.message_type;
            // console.log("chatGroupMsgType is ", chatGroupMsgType)
            if(chatGroupMsgType == 105){
                return true;
            }
            else{
                return false;
            }
        },
        MsgIsTransmit: function() {
            let chatGroupMsgType = this.msg.message_type;
            // console.log("chatGroupMsgType is ", chatGroupMsgType)
            if(chatGroupMsgType == 106){
                return true;
            }
            else{
                return false;
            }
        },
        checkAndLoadImg: function(distPath) {
            var checkingPath = distPath;
            var chatGroupMsgContent = strMsgContentToJson(this.msg.message_content);
            var msg_id = this.msg.message_id;
            var imgMsgImgElement = document.getElementById(msg_id);
            var checking = function () {
                setTimeout(function () {
                    if(fs.existsSync(checkingPath)){
                        var showfu = new FileUtil(checkingPath);
                        let showfileObj = showfu.GetUploadfileobj();
                        let reader = new FileReader();
                        reader.readAsDataURL(showfileObj);
                        reader.onloadend = () => {
                            let imageHeight = 100;
                            if(chatGroupMsgContent.imgHeight < 100){
                                imageHeight = chatGroupMsgContent.imgHeight;
                            }
                            this.imageHeight = imageHeight;
                            imgMsgImgElement.setAttribute("src", reader.result);
                            imgMsgImgElement.setAttribute("height", imageHeight);
                            imgMsgImgElement.setAttribute("style", "");
                        }
                        return;
                    }
                    checking();
                }, 200)
            }
            checking();
        },
        checkAndLoadUserImage: function(distPath) {
            var checkingPath = distPath;
            
            var userIconElementId = this.getUserIconId();
            var userIconElement = document.getElementById(userIconElementId);
                
            var checking = function () {
                setTimeout(function () {
                    if(fs.existsSync(checkingPath)){
                        var showfu = new FileUtil(checkingPath);
                        let showfileObj = showfu.GetUploadfileobj();
                        let reader = new FileReader();
                        reader.readAsDataURL(showfileObj);
                        reader.onloadend = () => {
                            userIconElement.setAttribute("src", reader.result);
                        }
                        return;
                    }
                    checking();
                }, 200)
            }
            checking();
        },
        MsgContent: async function(is_mine=false) {
            if(this.msg === null) {
                return '';
            }
            this.messageContent = '';
            this.transmitMsgTitle = '';
            this.transmitMsgContent = '';
            let chatGroupMsgType = this.msg.message_type;
            var chatGroupMsgContent = strMsgContentToJson(this.msg.message_content);
            // console.log("chatGroupMsgContent is ", chatGroupMsgContent)
            // console.log("this. msg is ", this.msg)
            // 数据库缺省type = 0 
            if(chatGroupMsgType === 101 || chatGroupMsgType ==0)
            {
                this.messageContent = sliceReturnsOfString(chatGroupMsgContent.text);
                if(this.messageContent.length == 0) {
                    this.messageContent = "\n";
                }
                // console.log("this.messageContent is ", this.messageContent)
                // textMsgImgElement.innerHTML = this.messageContent;
            }
            else if(chatGroupMsgType === 102)
            {
                // var targetDir = confservice.getFilePath();
                var targetFileName = chatGroupMsgContent.fileName;
                var theExt = path.extname(targetFileName);
                // var targetPath = path.join(targetDir, targetFileName);
                var targetPath = this.msg.file_local_path;
                // var targetDir = confservice.getFilePath();
                // var targetFileName = this.msg.message_id.toString() + "." + chatGroupMsgContent.ext;
                // var targetPath = this.msg.file_local_path;
                // if(chatGroupMsgContent.thumbnailImage != undefined && fs.existsSync(chatGroupMsgContent.thumbnailImage)){
                //     targetPath = chatGroupMsgContent.thumbnailImage;
                // }
                var needOpen = false;
                var imgMsgImgElement = document.getElementById(this.msg.message_id);
                imgMsgImgElement.setAttribute("style", "padding:40px 40px 40px 40px;width:20px;height:20px;");
                if(targetPath.length == 0) {
                    if(fs.existsSync(targetPath = await services.common.downloadMsgTTumbnail(this.msg.time_line_id, this.msg.message_timestamp, this.msg.message_id + theExt, false))) {
                        //thumbnailImage为本地路径，该消息为自己发送的消息，读取本地图片显示
                        let imageHeight = 100;
                        if(chatGroupMsgContent.imgHeight < 100){
                            imageHeight = chatGroupMsgContent.imgHeight;
                        }
                        this.imageHeight = imageHeight;
                        imgMsgImgElement.setAttribute("src", targetPath);
                        imgMsgImgElement.setAttribute("height", imageHeight);
                        imgMsgImgElement.setAttribute("style", "");
                    }
                }
                else if(fs.existsSync(targetPath)){
                    //thumbnailImage为本地路径，该消息为自己发送的消息，读取本地图片显示
                    let imageHeight = 100;
                    if(chatGroupMsgContent.imgHeight < 100){
                        imageHeight = chatGroupMsgContent.imgHeight;
                    }
                    this.imageHeight = imageHeight;
                    imgMsgImgElement.setAttribute("src", targetPath);
                    imgMsgImgElement.setAttribute("height", imageHeight);
                    imgMsgImgElement.setAttribute("style", "");
                }
                else{
                    console.log("download msg t thumnail args is ", this.msg)
                    services.common.downloadMsgTTumbnail(this.msg.time_line_id, this.msg.message_timestamp, this.msg.message_id + theExt, false);
                    // this.checkAndLoadImg(targetPath);
                }
            }
            else if(chatGroupMsgType === 103)
            {
                // var targetDir = confservice.getFilePath();
                var targetFileName = chatGroupMsgContent.fileName;
                var theExt = path.extname(targetFileName);
                // var targetPath = path.join(targetDir, targetFileName);
                var targetPath = this.msg.file_local_path;
                // if(chatGroupMsgContent.fileLocalPath != undefined && fs.existsSync(chatGroupMsgContent.fileLocalPath)){
                //     targetPath = chatGroupMsgContent.fileLocalPath;
                // }
                
                if(targetPath.length == 0) {
                    var targetDir = confservice.getFilePath(this.msg.message_timestamp);
                    var targetPath = path.join(targetDir, targetFileName);
                }
                var needOpen = false;
                console.log("targetPath is ", targetPath)
                if(!fs.existsSync(targetPath)){
                    console.log("this.msg.timelineid is ", this.msg.time_line_id)
                    console.log("targetfilename is ", targetFileName);
                    services.common.downloadFile(this.msg.time_line_id, this.msg.message_timestamp, this.msg.message_id + theExt, false);
                }
                var fileMsgImgElement = document.getElementById(this.msg.message_id);
                var iconPath = this.getFileIconThroughExt(chatGroupMsgContent.ext);
                console.log("icon path is ", iconPath);
                console.log("filesize is ", chatGroupMsgContent.fileSize);
                    this.fileName = chatGroupMsgContent.fileName;
                    this.fileSize = getFileSizeByNumber(chatGroupMsgContent.fileSize);
                    fileMsgImgElement.setAttribute("src", iconPath);
                    fileMsgImgElement.setAttribute("height", 40);
            }
            else if(chatGroupMsgType === 104)
            {
                if(chatGroupMsgContent.type === "invitation")
                {
                    var invitees = chatGroupMsgContent.userInfos;
                    var inviteeNames = "";
                    if(invitees.length == 1){
                        inviteeNames = invitees[0].userName
                    }
                    else{
                        for(var i=0;i<invitees.length;i++) {
                            inviteeNames = inviteeNames + "," + invitees[i].userName
                        }
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
                            deletedNames = deletedNames + "," + deletedUsers[i].userName
                        }
                    }
                    return owner + " 将 " + deletedNames + " 移出了群聊";
                }
                else if(chatGroupMsgContent.type == "groupTransfer") {
                    var originalOwner = chatGroupMsgContent.fromUserName;
                    var newOwner = chatGroupMsgContent.toUserName;
                    console.log("get return is ", originalOwner + " 将群主转让给 " + newOwner)
                    return originalOwner + " 将群主转让给 " + newOwner;
                }
                else
                {
                    return "您收到一条短消息";
                }
            }
            else if(chatGroupMsgType === 105)
            {
                // var targetDir = confservice.getFilePath();
                var targetFileName = chatGroupMsgContent.fileName;
                // var targetPath = path.join(targetDir, targetFileName);
                var targetPath = this.msg.file_local_path;
                // if(chatGroupMsgContent.fileLocalPath != undefined && fs.existsSync(chatGroupMsgContent.fileLocalPath)){
                //     targetPath = chatGroupMsgContent.fileLocalPath;
                // }
                var needOpen = false;
                if(!fs.existsSync(targetPath)){
                    // ipcRenderer.send('download-file', [this.msg.time_line_id, this.loginInfo.access_token, services.common.config.hostname, services.common.config.apiPort, targetPath, false]);
                    services.common.downloadVoiceFile(this.msg.time_line_id, this.msg.message_timestamp, targetFileName, needOpen);
                }
                var fileMsgImgElement = document.getElementById(this.msg.message_id);
                // console.log("fileMsgImgElement ia ", fileMsgImgElement);
                this.voiceLenth = chatGroupMsgContent.length;
                this.fileSize = getFileSizeByNumber(chatGroupMsgContent.fileSize);
                fileMsgImgElement.setAttribute("src", "../../../static/Img/Chat/voiceAudio@2x.png");
                fileMsgImgElement.setAttribute("height", 12);
            }
            else if(chatGroupMsgType === 106)
            {
                this.transmitMsgTitle = chatGroupMsgContent.title;
                this.transmitMsgContent = chatGroupMsgContent.text;
                this.messageContent = "[聊天记录]";
                
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
            // console.log("MsgBelongUserImg this.userInfo is ", this.userInfo)
            if(this.userInfo == undefined || this.userInfo == null) {
                return;
            }
            var userIconElementId = this.getUserIconId();
            this.userIconElement = document.getElementById(userIconElementId);
            if(this.userIconElement == undefined) {
                return;
            }
            // console.log("msgconent is ", strMsgContentToJson(this.msg.message_content), "this.userInfo is ", this.userInfo);
            var distTAvarar = this.userInfo.avatar_t_url;
            var targetDir = confservice.getFilePath();
            var targetFileName = this.userInfo.user_id + ".png";
            var targetPath = confservice.getUserThumbHeadLocalPath(this.userInfo.user_id);
            // console.log("msg target path is ", targetPath);

            if(fs.existsSync(targetPath)){
                //thumbnailImage为本地路径，该消息为自己发送的消息，读取本地图片显示
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    this.userIconElement.setAttribute("src", reader.result);
                }
            }
            else{
                // ipcRenderer.send('download-image', [this.msg.time_line_id, this.loginInfo.access_token, services.common.config.hostname, services.common.config.apiPort, targetPath, "T", false]);
                // console.log("message downloag group avatar target path is ", targetPath);
                services.common.downloadUserTAvatar(distTAvarar, this.userInfo.user_id);
                // this.checkAndLoadUserImage(targetPath);
            }

            // downloadGroupAvatar(distTAvarar, this.loginInfo.access_token)
            // .then((ret) => {
            //     console.log("group avatar is ", ret.data)
            //     this.userIconElement.setAttribute("src", URL.createObjectURL(ret.data));
            //     this.userIconElement.onload = () => {
            //         URL.revokeObjectURL(this.userIconElement.getAttribute("src"))
            //     }
            // })
        },
        msgUserInfo: async function() {
            // console.log("this.msg.message_from_id is ", this.msg.message_from_id);
            // console.log("this.msg.messagecontent is ", strMsgContentToJson(this.msg.message_content));
            var userInfos = await services.common.GetDistUserinfo(this.msg.message_from_id);
            // console.log("userInfo is ", userInfos)
            if(userInfos == undefined || userInfos.length == 0) {
                console.log("err");
                this.userInfo = {};
                return;
            }

            this.userInfo = userInfos[0];
            this.userInfo.phone = await services.common.GetDistUserPhone(this.msg.message_from_id);
            this.userInfo.email = await services.common.GetDistUserEmail(this.msg.message_from_id);
            // console.log("this.userInfo is ", this.userInfo)
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
            updateStatus: false,
            messageContent: '',
            transmitMsgContent: '',
            transmitMsgTitle: '',
            fileName: '',
            fileIcon: '',
            fileSize: 0,
            voiceLenth: 0,
            imageHeight: 100,
            editorOption : {
                placeholder: "",
                theme:'bubble',
            },
            userIconElement: null,
            userInfo: null,
            ipcInited: false,
            amr: null,
        }
    },
    mounted: async function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        await this.msgUserInfo();
        var userIconElementId = this.getUserIconId();
        if(this.userIconElement == undefined) {
            this.userIconElement = document.getElementById(userIconElementId);
        }
        this.MsgBelongUserImg();
        setTimeout(() => {
            this.$nextTick(() => {
                if(this.MsgIsMine()) {
                    this.MsgContent(true);
                }
                else {
                    this.MsgContent(false);
                }
            })
        }, 0)
    },
    created: async function() {
        await services.common.init();
        this.loginInfo = await services.common.GetLoginModel();
        this.curUserInfo = await services.common.GetSelfUserModel();
    },
    watch: {
        msg: async function() {
            await this.msgUserInfo();
            var userIconElementId = this.getUserIconId();
            if(this.userIconElement == undefined) {
                this.userIconElement = document.getElementById(userIconElementId);
            }
            this.MsgBelongUserImg();
            this.$nextTick(() => {
                setTimeout(() => {
                    this.$nextTick(() => {
                        if(this.MsgIsMine()) {
                            this.MsgContent(true);
                        }
                        else {
                            this.MsgContent(false);
                        }
                    })
                }, 0)
            })
        },
        playingMsgId: function() {
            if(this.amr != null && this.playingMsgId != this.msg.message_id) {
                console.log("this.playingMsgId is ", this.playingMsgId);
                console.log("this.msg.id is ", this.msg.message_id);
                this.amr.stop();
            }
        },
        updateMsg: function() {
            // console.log("in message update message is ", this.updateMsg);
            if(this.updateMsg.length == 0) {
                return;
            }

            var state = this.updateMsg[0];
            var stateInfo = this.updateMsg[1];
            var id = this.updateMsg[2];
            var localPath = this.updateMsg[3];
            var needOpen = this.updateMsg[4];

            if(id != this.msg.time_line_id) {
                return;
            }

            if(fs.existsSync(localPath)){
                services.common.SetFilePath(this.msg.message_id, localPath);
                // Update message localpath throuth messageId
                console.log("update msg file path to ", localPath);
                if(this.msg.message_type == 102) {
                    var chatGroupMsgContent = strMsgContentToJson(this.msg.message_content);
                    console.log("message chatGroupMsgContent ", chatGroupMsgContent);
                    var msg_id = this.msg.message_id;
                    var imgMsgImgElement = document.getElementById(msg_id);
                    services.common.SetFilePath(this.msg.message_id, localPath);
                    var showfu = new FileUtil(localPath);
                    let showfileObj = showfu.GetUploadfileobj();
                    let reader = new FileReader();
                    reader.readAsDataURL(showfileObj);
                    reader.onloadend = () => {
                        let imageHeight = 100;
                        if(chatGroupMsgContent.imgHeight < 100){
                            imageHeight = chatGroupMsgContent.imgHeight;
                        }
                        this.imageHeight = imageHeight;
                        imgMsgImgElement.setAttribute("src", reader.result);
                        imgMsgImgElement.setAttribute("height", imageHeight);
                        imgMsgImgElement.setAttribute("style", "");
                    }
                }
                else if(this.msg.message_type == 105 && needOpen) {
                    if(this.amr == null){
                        this.amr = new BenzAMRRecorder();
                    }
                    if(this.amr.isPlaying()) {
                        console.log("stop")
                        this.amr.stop();
                    }
                    if(this.amr.isInit()) {
                        console.log("play")
                        this.amr.play();
                    }
                    else {
                        this.amr.initWithUrl(localPath).then(() => {
                            this.amr.play();
                        })
                    }
                }
            }
        },
        updateUser: function() {
            var state = this.updateUser[0];
            var stateInfo = this.updateUser[1];
            var id = this.updateUser[2];
            var localPath = this.updateUser[3];

            if(this.userInfo != undefined && id == this.userInfo.user_id) {
                var userIconElementId = this.getUserIconId();
                var userIconElement = document.getElementById(userIconElementId);
                if(fs.existsSync(localPath)){
                    var showfu = new FileUtil(localPath);
                    let showfileObj = showfu.GetUploadfileobj();
                    let reader = new FileReader();
                    reader.readAsDataURL(showfileObj);
                    reader.onloadend = () => {
                        userIconElement.setAttribute("src", reader.result);
                    }
                    return;
                }
            }
        },
        updateMsgStatus: function() {
            // console.log("updateMsgstatus ", this.updateMsgStatus);
            if(this.updateMsgStatus.id == this.msg.message_id) {
                this.updateStatus = !this.updateStatus;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
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
        width: 32px;
        height: 32px;
        border-radius:4px;
    }

    .msg-info-user-img:hover {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius:4px;
        cursor: pointer;
    }

    .about-msg {
        display: inline-block;
        margin: 0px 10px 5px 10px;
        width: calc(100% - 95px);
        vertical-align: top;
    }

    .msgState {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-top: 10px;
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
        background-color: rgba(247,248,250,1);
        max-width: 260px;
        min-width: 20px;
        min-height: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
    }

    .chat-msg-content-others-txt-div:hover {
        float: left;
        background-color: rgb(233,234,235);
        max-width: 260px;
        min-width: 20px;
        min-height: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
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
        line-height: 20px;
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
        line-height: 20px;
    }

    .chat-msg-content-others-img {
        float: left;
        background-color: rgba(1,1,1,0);
        min-width: 104px;
        min-height: 100px;
        border-radius: 5px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-others-file {
        float: left;
        background-color: rgba(247,248,250,1);
        max-width: 260px;
        min-width: 20px;
        min-height: 40px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-others-voice {
        float: left;
        background-color: rgba(247,248,250,1);
        max-width: 260px;
        min-width: 20px;
        min-height: 12px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
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
        min-height: 40px;
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
    
    .voice-image {
        height: 16px;
        display: inline-block;
    }
    
    .file-info {
        min-height: 46px;
        display: inline-block;
        vertical-align: top;
    }

    .voice-info {
        min-height: 16px;
        max-height: 23px;
        display: inline-block;
        vertical-align: top;
    }

    .file-name {
        max-width: 150px;
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
        overflow: hidden;
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
        background-color: rgba(233, 247, 240, 1);
        max-width: 260px;
        min-width: 20px;
        min-height: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
    }

    .chat-msg-content-mine-txt-div:hover{
        float:right;
        background-color: rgb(209,232,221);
        max-width: 260px;
        min-width: 20px;
        min-height: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
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
        line-height: 20px;
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
        line-height: 20px;
    }

    .chat-msg-content-mine-img {
        float: right;
        background-color: rgba(1,1,1,0);
        min-width: 104px;
        min-height: 100px;
        border-radius: 5px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-mine-file {
        float:right;
        background-color: rgba(233, 247, 240, 1);
        max-width: 260px;
        min-width: 20px;
        min-height: 40px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }
    
    .chat-msg-content-mine-file:hover {
        float:right;
        background-color: rgb(220,244,233);
        max-width: 260px;
        min-width: 20px;
        min-height: 40px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }
    
    .chat-msg-content-mine-voice {
        float:right;
        background-color: rgba(233, 247, 240, 1);
        max-width: 260px;
        min-width: 20px;
        min-height: 12px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-other-transmit {
        float:left;
        background-color: rgba(247, 248, 250, 1);
        max-width: 260px;
        min-width: 200px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-mine-transmit {
        float:right;
        background-color: rgba(247, 248, 250, 1);
        max-width: 260px;
        min-width: 200px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .transmit-title {
        display: block;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border: 0px solid rgba(221, 221, 221, 1);
        padding-bottom: 10px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        font-weight: 590;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .transmit-content {
        display: block;
        left:right;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding-top: 10px;
        font-size: 12px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        letter-spacing:1px;
        line-height: 18px;
        color:rgba(102,102,102,1);
    }
    
    .imageTip {
        text-align: center;
    }
</style>