<template>
    <div class="message" :id="getMessageTemplateId()" v-cloak>
        <div class="chat-msg-body">
            <div class="msg-info-mine" v-if="MsgIsMine()">
                <div class="msgStageDivEmpty" :key="updateStatus">
                    <div class="msgState">
                    </div>
                </div>
                <div class="about-msg">
                    <div class="msg-info-username-mine" v-show=false></div>
                    <div class="chat-msg-content-mine-img"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <img class="msg-image" :id="msg.event.event_id" :src="getMsgFileIcon()" alt="图片">
                    </div>
                    <div class="chat-msg-content-mine-file"
                        v-on:click="ShowFile()" v-else-if="MsgIsFile()">
                        <img class="file-image" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle" :src="getMsgFileIcon()">
                        <div class="file-info">
                            <p class="file-size">{{this.fileSize}}</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-mine-voice"
                        v-on:click="ShowFile()" v-else-if="MsgIsVoice()">
                        <img class="voice-image" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">
                        <div class="voice-info">
                            <p class="file-size">{{this.voiceLenth}} s</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-mine-transmit"
                        v-on:click="ShowFile()" v-else-if="MsgIsTransmit()">
                        <div class="transmit-title" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgTitle}}</div>
                        <div class="transmit-content" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgContent}}</div>
                    </div>
                    <div class="chat-msg-content-mine-txt-div" 
                        v-on:click="ShowFile()" v-else>
                        <p class="chat-msg-content-mine-txt" :id="msg.event.event_id">{{messageContent}}</p>
                    </div>
                    <div class="msgStageDiv" :key="updateStatus">
                        <div class="msgState" v-if="MsgIsSending()">
                            <i class="el-icon-loading"></i>
                        </div>
                        <div class="msgState" v-else-if="MsgIsFailed()" @click="sendAgain()">
                            <i class="el-icon-warning"></i>
                        </div>
                        <div class="msgState" v-else>
                        </div>
                    </div>
                </div>
                <img class="msg-info-user-img-no-name" :id="getUserIconId()" src="../../../static/Img/User/user-40px@2x.png" @click="showUserInfoTip">
                <el-progress class="my-file-progress" :percentage="curPercent" color="#11b067" v-show="showProgress" :show-text="false" :width="70"></el-progress>
            </div>
            <div class="msg-info-others" v-else>
                <img class="msg-info-user-img-with-name" :id="getUserIconId()" src="../../../static/Img/User/user-40px@2x.png" @click="showUserInfoTip" v-if="isGroup">
                <img class="msg-info-user-img-no-name" :id="getUserIconId()"  src="../../../static/Img/User/user-40px@2x.png" @click="showUserInfoTip" v-else>
                <div class="about-msg">
                    <div class="msg-info-username-others" :id="msgNameId()" v-show="isGroup"></div>
                    <div class="chat-msg-content-others-img"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <img class="msg-image" :id="msg.event.event_id" :src="getMsgFileIcon()" alt="图片">
                    </div>
                    <div class="chat-msg-content-others-file"
                        v-on:click="ShowFile()" v-else-if="MsgIsFile()">
                        <img class="file-image" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle" :src="getMsgFileIcon()">
                        <div class="file-info">
                            <p class="file-size">{{this.fileSize}}</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-others-voice"
                        v-on:click="ShowFile()" v-else-if="MsgIsVoice()">
                        <img class="voice-image" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">
                        <div class="voice-info">
                            <p class="file-size">{{this.voiceLenth}} s</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-other-transmit"
                        v-on:click="ShowFile()" v-else-if="MsgIsTransmit()">
                        <div class="transmit-title" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgTitle}}</div>
                        <div class="transmit-content" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgContent}}</div>
                    </div>
                    <div class="chat-msg-content-others-txt-div" 
                        v-on:click="ShowFile()" v-else>
                        <p class="chat-msg-content-others-txt" :id="msg.event.event_id">{{messageContent}}</p>
                    </div>
                </div>
                <el-progress class="others-file-progress" :percentage="curPercent" color="#11b067" v-show="showProgress" :show-text="false" :width="70"></el-progress>
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
import {downloadGroupAvatar, generalGuid, Appendzero, FileUtil, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft, pathDeal, getFileSizeByNumber, decryptFile} from '../../packages/core/Utils.js'
import { UserInfo } from '../../packages/data/sqliteutil.js'

export default {
    components: {
    },
    props: ['msg', 'playingMsgId', 'updateMsg', 'updateUser', 'updateMsgStatus', 'isGroup', 'updateMsgContent'],
    methods: {
        sendAgain: function() {
            this.$emit("sendAgain", this.msg);
        },
        getMessageTemplateId: function() {
            return "message-template-" + this.msg.event.event_id;
        },
        showUserInfoTip: async function() {
            if(this.userIconElement == undefined) {
                this.userIconElement = document.getElementById(userIconElementId);
            }
            if(this.userIconElement == undefined) {
                // ToDo exception.
                return;
            }
            var curAbsoluteTop = getElementTop(this.userIconElement);
            var curAbsoluteLeft = getElementLeft(this.userIconElement);
            if(this.userInfo == undefined) {
                await this.msgUserInfo()
            }
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
        msgNameId: function() {
            return this.msg.event.event_id + "-username";
        },
        getUserIconId: function() {
            return this.msg.event.event_id + "-usericon"
        },
        ShowFile: async function() {
            console.log("open image proxy ", this.msg)
            let msgType = this.msg.message_type;
            let msgContent = strMsgContentToJson(this.msg.message_content);
            // var targetDir = confservice.getFilePath();
            // var targetFileName = this.msg.message_id.toString() + "." + msgContent.ext;
            // var targetPath = path.join(targetDir, targetFileName);
            let event = this.msg.event;
            let chatGroupMsgType = event.type;
            var chatGroupMsgContent = this.msg.getContent();
            if(chatGroupMsgType === "m.room.encrypted") {
                if(chatGroupMsgContent.msgtype == 'm.file'){
                    this.decryptAndDownloadFile();
                }
            }
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
                var targetPath = decodeURIComponent(await services.common.GetFilePath(this.msg.message_id));
                var needOpen = true;
                if(fs.existsSync(targetPath)){
                    shell.openItem(targetPath);
                }
                else{
                    console.log("=======target path download ", targetPath);
                    if(this.msg.key_id != undefined && this.msg.key_id.length != 0) {
                        services.common.downloadFile(this.msg.time_line_id, this.msg.message_timestamp, targetFileName, true, msgContent.fileSize, msgContent.url);
                    }
                    else {
                        services.common.downloadFile(this.msg.time_line_id, this.msg.message_timestamp, targetFileName, true, msgContent.fileSize);
                    }
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
                    if(this.msg.key_id != undefined && this.msg.key_id.length != 0) {
                        services.common.downloadVoiceFile(this.msg.time_line_id, this.msg.message_timestamp, targetFileName, true, msgContent.fileSize, msgContent.url);
                    }
                    else {
                        services.common.downloadVoiceFile(this.msg.time_line_id, this.msg.message_timestamp, targetFileName, true, msgContent.fileSize);
                    }
                }
                this.$emit('playAudioOfMessage', this.msg.message_id);
            }
            else if(msgType == 106) {
                ipcRenderer.send("showAnotherWindow", [this.msg.time_line_id, this.msg.group_id], "TransmitMsgList");
            }
        },
        MsgIsFailed: function() {
            if(this.msg.message_status == 2 && this.showState) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgIsSending: function() {
            if(this.msg.message_status == 1 && this.showState) {
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
        getMsgFileIcon: function() {
            let iconPath = this.matrixClient.mxcUrlToHttp(this.msg.event.content.url);
            return iconPath;
        },
        MsgIsImage: function() {
            let chatGroupMsgType = this.msg.event.content.msgtype == undefined ? this.msg.getContent().msgtype : this.msg.event.content.msgtype;
            if(chatGroupMsgType == 'm.image'){
                return true;
            }
            else if(chatGroupMsgType == "m.bad.encrypted") {
                return false;
            }
            else{
                return false;
            }
        },
        MsgIsFile: function() {
            let chatGroupMsgType = this.msg.event.content.msgtype == undefined ? this.msg.getContent().msgtype : this.msg.event.content.msgtype;
            if(chatGroupMsgType == 'm.file'){
                return true;
            }
            else if(chatGroupMsgType == "m.bad.encrypted") {
                return false;
            }
            else{
                return false;
            }
        },
        MsgIsVoice: function() {
            let chatGroupMsgType = this.msg.event.content.msgtype;
            // console.log("chatGroupMsgType is ", chatGroupMsgType)
            if(chatGroupMsgType == 105){
                return true;
            }
            else if(chatGroupMsgType == "m.bad.encrypted") {
                return false;
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
            else if(chatGroupMsgType == "m.bad.encrypted") {
                return false;
            }
            else{
                return false;
            }
        },
        decryptAndDownloadFile: async function() {
            const content = this.msg.getContent();
            if(this.decrypting) return;
            if(this.decryptedBlob == null) {
                this.decrypting = true;
                var distPath = confservice.getFilePath(this.msg.event.origin_server_ts);
                decryptFile(content.file, this.matrixClient.mxcUrlToHttp(content.file.url))
                    .then((blob) => {
                        let reader = new FileReader();
                        reader.onload = function() {
                            if(reader.readyState == 2) {
                                var buffer = new Buffer(reader.result);
                                ipcRenderer.send("save_file", path.join(distPath, content.body), buffer);
                            }
                        }
                        reader.readAsArrayBuffer(blob);
                    })
            }
        },
        decryptImg: async function() {
            const content = this.msg.getContent();
            if(content.file !== undefined && this.decryptedUrl == null) {
                let thumbnailPromise = Promise.resolve(null);
                if(content.info && content.info.thumbnail_file) {
                    thumbnailPromise = decryptFile(content.info.thumbnail_file, this.matrixClient.mxcUrlToHttp(content.info.thumbnail_file.url))
                        .then((blob) => {
                            return URL.createObjectURL(blob);
                        })
                }
                let decryptedBlob;
                thumbnailPromise.then((thumbnailUrl) => {
                    return decryptFile(content.file, this.matrixClient.mxcUrlToHttp(content.file.url))
                        .then((blob) => {
                            decryptedBlob = blob;
                            return URL.createObjectURL(blob);
                        })
                        .then((contentUrl) => {
                            this.decryptedUrl = contentUrl;
                            this.decryptedThumbnailUrl = thumbnailUrl;
                            this.decryptedBlob = decryptedBlob;
                            let imgElement = document.getElementById(this.msg.event.event_id);
                            if(imgElement != undefined) {
                                imgElement.setAttribute("src", thumbnailUrl);
                            }
                        })
                })
            }
        },
        MsgContent: async function(is_mine=false) {
            if(this.msg === null) {
                return '';
            }
            this.messageContent = '';
            this.transmitMsgTitle = '';
            this.transmitMsgContent = '';
            let event = this.msg.event;
            let chatGroupMsgType = event.type;
            var chatGroupMsgContent = this.msg.getContent();
            console.log("chatGroupMsgContent is ", chatGroupMsgContent)
            // console.log("this. msg is ", this.msg)
            // 数据库缺省type = 0 
            if(chatGroupMsgType === "m.room.message")
            {
                if(chatGroupMsgContent.msgtype == 'm.file'){
                    this.messageContent = chatGroupMsgContent.body;
                    if(chatGroupMsgContent.info)
                        this.fileSize = chatGroupMsgContent.info.size;
                    this.fileName = this.messageContent;
                }
                else if(chatGroupMsgContent.msgtype == 'm.text'){
                    this.messageContent = chatGroupMsgContent.body;
                    if(this.messageContent.length == 0) {
                        this.messageContent = "\n";
                    }
                }
                else if(chatGroupMsgContent.msgtype == 'm.image'){
                    let maxSize = 400;
                    if(chatGroupMsgContent.body)
                        this.fileName = chatGroupMsgContent.body;
                    let info = {
                        w: maxSize,
                        h: maxSize
                    };
                    if(chatGroupMsgContent.info)
                        info = chatGroupMsgContent.info
                    if(!info.h)
                        info.h = maxSize;
                    if(!info.w)
                        info.w = maxSize;
                    if(info.size)
                        this.fileSizeNum = info.size;
                    this.messageContent = chatGroupMsgContent.body;
                    var imgMsgImgElement = document.getElementById(this.msg.event.event_id);
                    let style = "padding:40px 40px 40px 40px;";
                    let max = Math.max(info.w, info.h);
                    if(max > maxSize ){
                        if(info.w > info.h){
                            info.h = info.h/(info.w/maxSize);
                            info.w = maxSize;
                        }
                        else{
                            info.w = info.w/(info.h/maxSize)
                            info.w = maxSize;
                        }

                    }
                    style += "width:" + info.w + "px";
                    style += ";"
                    style += "height:" + info.h + "px";
                    imgMsgImgElement.setAttribute("style", style);
                } 
            }
            else if(chatGroupMsgType === "m.room.encrypted") {
                // chatGroupMsgContent = this.msg.getContent();
                if(chatGroupMsgContent.msgtype == 'm.file'){
                    this.messageContent = chatGroupMsgContent.body;
                    if(chatGroupMsgContent.info)
                        this.fileSize = chatGroupMsgContent.info.size;
                    this.fileName = this.messageContent;
                }
                else if(chatGroupMsgContent.msgtype == 'm.text'){
                    console.log()
                    this.messageContent = chatGroupMsgContent.body;
                    if(this.messageContent.length == 0) {
                        this.messageContent = "\n";
                    }
                } 
                else if(chatGroupMsgContent.msgtype == 'm.image'){
                    let maxSize = 400;
                    if(chatGroupMsgContent.body)
                        this.fileName = chatGroupMsgContent.body;
                    let info = {
                        w: maxSize,
                        h: maxSize
                    };
                    if(chatGroupMsgContent.info)
                        info = chatGroupMsgContent.info
                    if(!info.h)
                        info.h = maxSize;
                    if(!info.w)
                        info.w = maxSize;
                    if(info.size)
                        this.fileSizeNum = info.size;
                    this.messageContent = chatGroupMsgContent.body;
                    var imgMsgImgElement = document.getElementById(this.msg.event.event_id);
                    let style = "padding:40px 40px 40px 40px;";
                    let max = Math.max(info.w, info.h);
                    if(max > maxSize ){
                        if(info.w > info.h){
                            info.h = info.h/(info.w/maxSize);
                            info.w = maxSize;
                        }
                        else{
                            info.w = info.w/(info.h/maxSize)
                            info.w = maxSize;
                        }

                    }
                    style += "width:" + info.w + "px";
                    style += ";"
                    style += "height:" + info.h + "px";
                    imgMsgImgElement.setAttribute("style", style);
                    this.decryptImg();
                }
                else if(chatGroupMsgContent.msgtype == "m.bad.encrypted") {
                    this.messageContent = chatGroupMsgContent.body;
                }
            }
            else if(chatGroupMsgType === 105)//语音消息
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
                    if(this.msg.key_id != undefined && this.msg.key_id.length != 0) {
                        services.common.downloadVoiceFile(this.msg.time_line_id, this.msg.message_timestamp, targetFileName, needOpen, chatGroupMsgContent.fileSize, chatGroupMsgContent.url);
                    }
                    else {
                        services.common.downloadVoiceFile(this.msg.time_line_id, this.msg.message_timestamp, targetFileName, needOpen, chatGroupMsgContent.fileSize);
                    }
                }
                var fileMsgImgElement = document.getElementById(this.msg.message_id);
                // console.log("fileMsgImgElement ia ", fileMsgImgElement);
                this.voiceLenth = chatGroupMsgContent.length;
                this.fileSize = getFileSizeByNumber(chatGroupMsgContent.fileSize);
                fileMsgImgElement.setAttribute("src", "../../../static/Img/Chat/msg-voice@2x.png");
                fileMsgImgElement.setAttribute("height", 12);
            }
            else if(chatGroupMsgType === 106)//转发
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
            if(this.msg.sender.userId === this.$store.state.userId) {
                return true;
            }
            else {
                return false;
            }
        },
        getMsgBelongUserImg: function() {
            if(this.msg != undefined) {
                var targetPath = confservice.getUserThumbHeadLocalPath(this.msg.message_from_id);
                if(fs.existsSync(targetPath)) {
                    return targetPath;
                }
                else {
                    return "../../../static/Img/User/user-40px@2x.png";
                }
            }
            else {
                return "../../../static/Img/User/user-40px@2x.png";
            }
        },
        MsgBelongUserImg: async function () {
            return '';
            // var distUserInfo = await services.common.GetDistUserinfo(this.msg.message_from_id);
            // console.log("MsgBelongUserImg this.userInfo is ", this.userInfo)
            if(this.msg == undefined) {
                return;
            }
            if(this.userIconElement == undefined) {
                var userIconElementId = this.getUserIconId();
                this.userIconElement = document.getElementById(userIconElementId);
            }
            var userNameElementId = this.msgNameId();
            var userNameElement = document.getElementById(userNameElementId);

            // var fromUserInfo = await UserInfo.GetUserInfo(this.msg.message_from_id);
            var fromUserName = this.msg.sender.name;

            if(userNameElement != undefined) {
                userNameElement.innerHTML = fromUserName;
            }
                
            if(this.userIconElement == undefined) {
                return;
            }
            // console.log("msgconent is ", strMsgContentToJson(this.msg.message_content), "this.userInfo is ", this.userInfo);
            var targetDir = confservice.getFilePath();
            var targetFileName = this.msg.message_from_id + ".png";
            var targetPath = confservice.getUserThumbHeadLocalPath(this.msg.message_from_id);
            // console.log("msg target path is ", targetPath);

            if(fs.existsSync(targetPath)){
                //thumbnailImage为本地路径，该消息为自己发送的消息，读取本地图片显示
                // var showfu = new FileUtil(targetPath);
                // let showfileObj = showfu.GetUploadfileobj();
                // let reader = new FileReader();
                // reader.readAsDataURL(showfileObj);
                // reader.onloadend = () => {
                    this.userIconElement.setAttribute("src", targetPath);
                // }
            }
            else{
                var userInfos = await services.common.GetDistUserinfo(this.msg.message_from_id);
                // console.log("userInfo is ", userInfos)
                if(userInfos == undefined || userInfos.length == 0) {
                    console.log("err");
                    this.userInfo = {};
                    // this.userIconElement.setAttribute("src", "../../../static/Img/User/user-40px@2x.png")
                    return;
                }

                this.userInfo = userInfos[0];
                var distTAvarar = this.userInfo.avatar_t_url;
                // ipcRenderer.send('download-image', [this.msg.time_line_id, this.loginInfo.access_token, services.common.config.hostname, services.common.config.apiPort, targetPath, "T", false]);
                // console.log("message downloag group avatar target path is ", targetPath);
                if(fs.existsSync(targetPath == await services.common.downloadUserTAvatar(distTAvarar, this.msg.message_from_id))) {
                    console.log("targetpath is ", targetPath);
                    this.userIconElement.setAttribute("src", targetPath);
                }
                else {
                    console.log("attriub  is ");
                    // this.userIconElement.setAttribute("src", "../../../static/Img/User/user-40px@2x.png")
                }
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
            return '';
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
            // this.userInfo.phone = await services.common.GetDistUserPhone(this.msg.message_from_id);
            // this.userInfo.email = await services.common.GetDistUserEmail(this.msg.message_from_id);
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
            decrypting: false,
            decryptedUrl: null,
            decryptedThumbnailUrl: null,
            decryptedBlob: null,
            showProgress: false,
            curPercent: 0,
            downloadingInterval: undefined,
            checkingTmpPath: '',
            checkingPath: '',
            showState: false,
            updateStatus: false,
            messageContent: '',
            transmitMsgContent: '',
            transmitMsgTitle: '',
            fileName: '',
            fileIcon: '',
            fileSize: 0,
            fileSizeNum: 0,
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
            matrixClient: undefined
        }
    },
    mounted: async function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        // await this.msgUserInfo();
        // var userIconElementId = this.getUserIconId();
        // if(this.userIconElement == undefined) {
        //     this.userIconElement = document.getElementById(userIconElementId);
        // }
        setTimeout(() => {
            this.$nextTick(() => {
                this.MsgBelongUserImg();
                if(this.MsgIsMine()) {
                    this.MsgContent(true);
                }
                else {
                    this.MsgContent(false);
                }
                setTimeout(() => {
                    // console.log("show state");
                    this.showState = true;
                    this.updateStatus = !this.updateStatus;
                }, 500)
            })
        }, 0)
    },
    created: async function() {
        this.matrixClient = window.mxMatrixClientPeg.matrixClient;
        await services.common.init();
        this.loginInfo = undefined;//await services.common.GetLoginModel();
        this.curUserInfo = undefined;//await services.common.GetSelfUserModel();
    },
    watch: {
        msg: async function() {
            // await this.msgUserInfo();
            setTimeout(() => {
                // console.log("show state");
                this.showState = true;
                this.updateStatus = !this.updateStatus;
            }, 500)
            var userIconElementId = this.getUserIconId();
            if(this.userIconElement == undefined) {
                this.userIconElement = document.getElementById(userIconElementId);
            }
            this.MsgBelongUserImg();
            this.$nextTick(() => {
                setTimeout(() => {
                    if(this.MsgIsMine()) {
                        this.MsgContent(true);
                    }
                    else {
                        this.MsgContent(false);
                    }
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
            if(this.updateMsg.length == 0) {
                return;
            }
            setTimeout(() => {
                // console.log("updateMsg show state");
                this.showState = true;
                this.updateStatus = !this.updateStatus;
            }, 500)
            var state = this.updateMsg[0];
            var stateInfo = this.updateMsg[1];
            var id = this.updateMsg[2];
            var localPath = this.updateMsg[3];
            var needOpen = this.updateMsg[4];

            if(id != this.msg.time_line_id) {
                return;
            }

            this.showProgress = false;
            if(this.downloadingInterval) {
                clearInterval(this.downloadingInterval);
            }

            if(fs.existsSync(localPath)){
                // if(this.msg.file_local_path.length != 0 && !fs.existsSync(this.msg.file_local_path)) {
                //     return;
                // }
                console.log("Update db locak path ", localPath);
                services.common.SetFilePath(this.msg.message_id, localPath);
                // Update message localpath throuth messageId
                // console.log("update msg file path to ", localPath);
                if(this.msg.message_type == 102) {
                    var chatGroupMsgContent = strMsgContentToJson(this.msg.message_content);
                    // console.log("message chatGroupMsgContent ", chatGroupMsgContent);
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
                        imgMsgImgElement.setAttribute("style", "");
                        imgMsgImgElement.setAttribute("src", reader.result);
                        imgMsgImgElement.setAttribute("height", imageHeight);
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

            if(id == this.msg.message_from_id) {
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
        },
        updateMsgContent: function() {
            if(this.msg.event.event_id == this.updateMsgContent.id) {
                this.MsgContent(true);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    [v-cloak]{
        display: none;
    }
    
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

    .my-file-progress {
        display: block;
        margin-right: 61px;
        width: 100px;
        float: right;
    }

    .others-file-progress {
        display: block;
        margin-left: 47px;
        width: 100px;
        float: left;
    }

    .msg-info-user-img-no-name {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius:4px;
    }

    .msg-info-user-img-no-name:hover {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius:4px;
        cursor: pointer;
    }

    .msg-info-user-img-with-name {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius:4px;
        margin-top: 4px;
    }

    .msg-info-user-img-with-name:hover {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius:4px;
        cursor: pointer;
        margin-top: 4px;
    }

    .about-msg {
        display: inline-block;
        margin: 0px 10px 5px 10px;
        width: calc(100% - 95px);
        vertical-align: top;
    }

    .msgStageDivEmpty {
        display: inline-block;
        width: 20px;
        height: 30px;
    }

    .msgStageDiv {
        display: inline-block;
        width: 20px;
        height: 30px;
        float: right;
        margin-right: 10px;
        margin-top: 2px;
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
        min-height: 17px;
        font-size: 12px;
        color: rgb(153, 153, 153);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
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
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing:1px;
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
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing:1px;
    }
    
    .chat-msg-content-others-txt{
        float: left;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing:1px;
    }

    .chat-msg-content-others-txt:hover{
        float: left;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing:1px;
    }

    .chat-msg-content-others-img {
        float: left;
        background-color: rgba(1,1,1,0);
        min-width: 104px;
        min-height: 100px;
        border-radius: 5px;
        font-size: 14px;
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
        font-family: 'PingFangSC-Regular';
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
        font-family: 'PingFangSC-Regular';
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
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing:1px;
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
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing:1px;
    }

    .chat-msg-content-mine-txt {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing:1px;
    }

    .chat-msg-content-mine-txt:hover {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing:1px;
    }

    .chat-msg-content-mine-img {
        float: right;
        background-color: rgba(1,1,1,0);
        min-width: 104px;
        min-height: 100px;
        border-radius: 5px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-mine-file {
        float:right;
        background:rgba(247,248,250,1);
        max-width: 260px;
        min-width: 20px;
        min-height: 40px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }
    
    .chat-msg-content-mine-file:hover {
        float:right;
        background-color: rgb(233,234,235);
        max-width: 260px;
        min-width: 20px;
        min-height: 40px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
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
        font-family: 'PingFangSC-medium';
        text-align: left;
        font-weight: 500;
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
        font-weight: 400;
        font-family: 'PingFangSC-Regular';
        font-family: 'PingFangSC-Regular';
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