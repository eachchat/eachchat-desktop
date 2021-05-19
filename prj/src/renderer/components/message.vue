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
                        <img class="msg-image" :id="msg.event.event_id" :src="getMsgImgIcon()" alt="图片" :style="getImageStyle()">
                    </div>
                    <div class="chat-msg-content-mine-file"
                        v-on:click="ShowFile()" v-else-if="MsgIsFile()">
                        <img class="file-image" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle" :src="getMsgFileIcon()">
                        <div class="file-info">
                            <p class="file-name">{{this.fileName}}</p>
                            <p class="file-size">{{this.fileSize}}</p>
                            <progress class="my-file-progress" :value="curPercent" max="100" color="#11b067" v-show="showProgress" :show-text="false" :width="70"></progress>
                        </div>
                    </div>
                    <div class="chat-msg-content-mine-voice"
                        v-on:click="ShowFile()" v-else-if="MsgIsVoice()">
                        <img class="voice-mine-image" :id="msg.event.event_id" src="../../../static/Img/Chat/msg-mine-voice@2x.png" :alt="fileName" style="vertical-align:middle">
                        <div class="voice-info">
                            <p class="file-size" v-show="false">{{this.voiceLenth}} ”</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-mine-transmit" :id="transmitMsgId()"
                        v-on:click="ShowFile()" v-else-if="MsgIsTransmit()">
                        <div class="transmit-title" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgTitle}}</div>
                        <div class="transmit-content" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgContent}}</div>
                    </div>
                    <VoIP :callId="callId" :isMine="MsgIsMine()" :voipInfo="VoipInfo" v-else-if="MsgIsVoipCall()"></VoIP>
                    <div class="chat-msg-content-mine-txt-div"
                        v-on:click="ShowFile()" v-else>
                        <p v-if="needHightLight(messageContent)" class="chat-msg-content-mine-txt" :id="getTextElementId()">
                            <linkify class="chat-msg-content-mine-linkify" :text="messageContent" color="rgba(255, 255, 255, 1)" textDecoration="underline"></linkify>
                        </p>
                        <p v-else class="chat-msg-content-mine-txt" :id="getTextElementId()" >
                            <emoji :text="messageContent"></emoji>
                        </p>
                    </div>
                    <div class="chat-msg-content-mine-file-div-angle" v-if="(MsgIsFile() || MsgIsTransmit()) && !MsgIsImage()"></div>
                    <div class="chat-msg-content-mine-txt-div-angle" v-else-if="!MsgIsImage()"></div>
                    <div class="msgStageDiv" :key="updateStatus">
                        <div :class="getMsgStateClass()" v-if="MsgIsSending()">
                            <i class="el-icon-loading"></i>
                        </div>
                        <div :class="getMsgStateClass()" v-else-if="MsgIsFailed()">
                            <img class="sendWarning" src="../../../static/Img/Chat/sendFaile@2x.png" @click="sendAgain()">
                        </div>
                        <div :class="getMsgStateClass()" v-else>
                        </div>
                    </div>
                </div>
                <img class="msg-info-user-img-no-name" :id="getUserIconId()" :src="getUserIconSrc()" @click="showUserInfoTip" onerror = "this.src = './static/Img/User/user-40px@2x.png'">
                <div class="quote-content" v-if="hasQuote()">
                    <span>{{quoteName}} : </span>
                    <div v-on:click="ShowQuoteImg()" class="quote-content-img" :style="`background-image:url(${quoteUrl})`">
                    </div>
                </div>
            </div>
            <div class="msg-info-others" v-else>
                <img class="msg-info-user-img-with-name" :id="getUserIconId()" :src="getUserIconSrc()" @click="showUserInfoTip" v-if="isGroup" onerror = "this.src = './static/Img/User/user-40px@2x.png'">
                <img class="msg-info-user-img-no-name" :id="getUserIconId()" :src="getUserIconSrc()" @click="showUserInfoTip" onerror = "this.src = './static/Img/User/user-40px@2x.png'" v-else>
                <div class="about-msg">
                    <div class="msg-info-username-others" :id="msgNameId()" v-show="isGroup">{{getUserShowName()}}</div>
                    <div class="chat-msg-content-others-img"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <img class="msg-image" :id="msg.event.event_id" :src="getMsgImgIcon()" alt="图片" :style="getImageStyle()">
                    </div>
                    <div class="chat-msg-content-others-file"
                        v-on:click="ShowFile()" v-else-if="MsgIsFile()">
                        <img class="file-image" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle" :src="getMsgFileIcon()">
                        <div class="file-info">
                            <p class="file-name">{{this.fileName}}</p>
                            <p class="file-size">{{this.fileSize}}</p>
                            <progress class="others-file-progress" :value="curPercent" max="100" color="#11b067" v-show="showProgress" :show-text="false" :width="70"></progress>
                        </div>
                    </div>
                    <div class="chat-msg-content-others-voice"
                        v-on:click="ShowFile()" v-else-if="MsgIsVoice()">
                        <img class="voice-image" :id="msg.event.event_id" :alt="fileName" src="../../../static/Img/Chat/msg-voice@2x.png" style="vertical-align:middle">
                        <div class="voice-info" v-show="false">
                            <p class="file-size">{{this.voiceLenth}} ”</p>
                        </div>
                    </div>
                    <div class="chat-msg-content-other-transmit" :id="transmitMsgId()"
                        v-on:click="ShowFile()" v-else-if="MsgIsTransmit()">
                        <div class="transmit-title" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgTitle}}</div>
                        <div class="transmit-content" :id="msg.event.event_id" :alt="fileName" style="vertical-align:middle">{{transmitMsgContent}}</div>
                    </div>
                    <VoIP :callId="callId" :isMine="MsgIsMine()" :voipInfo="VoipInfo" v-else-if="MsgIsVoipCall()"></VoIP>
                    <div class="chat-msg-content-others-txt-div"
                        v-on:click="ShowFile()" v-else>
                        <p v-if = "needHightLight(messageContent)" class="chat-msg-content-others-txt" :id="msg.event.event_id">
                            <linkify class="chat-msg-content-others-linkify" :text="messageContent" color="#5B6A91" textDecoration="underline"></linkify>
                        </p>
                        <p v-else class="chat-msg-content-others-txt" :id="msg.event.event_id">
                            <emoji :text="messageContent"></emoji>
                        </p>
                    </div>
                    <div class="chat-msg-content-others-txt-div-angle" v-if="!MsgIsImage()"></div>
                </div>
                <div class="quote-content" v-if="hasQuote()">
                    <span>{{quoteName}} : </span>
                    <div v-on:click="ShowQuoteImg()" class="quote-content-img" :style="`background-image:url(${quoteUrl})`"></div>
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
import axios from "axios";

import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import confservice from '../../packages/data/conf_service.js'
import {downloadGroupAvatar, generalGuid, Appendzero, fileMIMEFromType, FileUtil, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft, pathDeal, getFileSizeByNumber, decryptFile, getFileBlob} from '../../packages/core/Utils.js'
import { UserInfo, Message } from '../../packages/data/sqliteutil.js'
import {ComponentUtil} from '../script/component-util.js'
import { models } from '../../packages/data/models.js';
import linkify from './linkify'
import emoji from './emoji'
import { getImgUrlByEvent } from '../../utils/commonFuncs'
import {faceUtils} from '../../packages/core/Utils.js'
import VoIP from './VoIP'

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

function extend(target, base) {
    console.log("base is ", base);
  for (var prop in base) {
    target[prop] = base[prop];
  }
}
export default {
    components: {
        linkify,
        emoji,
        VoIP
    },
    props: ['msg', 'playingMsgId', 'updateMsg', 'updateUser', 'updateMsgStatus', 'isGroup', 'updateMsgContent'],
    computed: {
        quoteUrl (){
            return getImgUrlByEvent(this.msg.event.content.quote_event)
        }
    },
    methods: {
        hasQuote: function() {
            return  !!this.msg.event.content.quote_event
        },
        getMsgStateClass: function() {
            if(this.msg.event.content.msgtype != "m.text") {
                return "fileMsgState";
            }
            else {
                return "msgState";
            }
        },
        getTextElementId: function() {
            return this.msg._txnId ? this.msg._txnId : this.msg.event.event_id;
        },
        sendAgain: function() {
            function checkPendingEvent(room, txnId) {
                return Promise.all(room.getPendingEvents().filter(function(ev) {
                    console.log("getPendingEvents is ", ev);
                    return (ev._txnId && ev._txnId == txnId) && ev.status == "not_sent";
                }))
            }

            console.log("===sendAgain event is ", this.msg.event)
            var roomID = this.msg.event.room_id;
            let theRoom = global.mxMatrixClientPeg.matrixClient.getRoom(roomID);
            this.msg.message_status = 1;
            checkPendingEvent(theRoom, this.msg._txnId).then((pendingEvents) => {
                console.log("get pending event is ", pendingEvents);
                if(pendingEvents && pendingEvents.length > 0) {
                    pendingEvents.map((pendingEvent) => {
                        global.mxMatrixClientPeg.matrixClient.resendEvent(pendingEvent, theRoom).then((res) => {
                            this.msg.message_status = 0;
                        }, (err) => {
                            this.msg.message_status = 2;
                        })
                    })
                }
                else {
                    if(this.msg.event.content.msgtype != "m.text") {
                        this.sendFile();
                    }
                    else {
                        this.sendText();
                    }
                }
            })
        },
        transmitMsgId: function() {
            return "message-transmit-" + this.msg.event.event_id;
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
            this.$emit("openUserInfoTip", tipInfos);
        },
        msgNameId: function() {
            return (this.msg._txnId ? this.msg._txnId : this.msg.event.event_id).toString() + "-username";
        },
        getUserIconId: function() {
            return (this.msg._txnId ? this.msg._txnId : this.msg.event.event_id).toString() + "-usericon"
        },
        getUserShowName: function() {
            var userId = this.msg.sender ? this.msg.sender.userId : this.msg.event.sender;
            var showName = this.$store.getters.getShowName(userId);
            if(showName.length == 0) {
                return this.msg.sender && this.msg.sender.name ? this.msg.sender.name : "";
            }
            else {
                return showName;
            }
        },
        getUserIconSrc: function() {
            var userId = this.msg.sender ? this.msg.sender.userId : this.msg.event.sender;
            var avater = this.$store.getters.getAvater(userId);
            if(avater.length == 0) {
                return "../../../static/Img/User/user-40px@2x.png";
            }
            else {
                return avater;
            }
        },
        async getFileExist() {
            let msgs = await Message.FindMessageByMesssageID(this.msg.event.event_id);
            console.log(msgs)
            if(msgs.length != 0 && msgs[0].file_local_path != "")
                return msgs[0].file_local_path;
            return '';
        },
        ProCallback: function(receivedLength, contentLength) {
            this.receivedLength = receivedLength
            this.contentLength = contentLength;
        },
        decryptAndPlayingFile: async function() {
            const content = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            if(this.decrypting) return;
            if(this.decryptedBlob == null) {
                this.decrypting = true;
                decryptFile(content.file, this.matrixClient.mxcUrlToHttp(content.file.url))
                    .then((blob) => {
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
                            this.voicePlayingImg();
                            this.amr.onEnded(() => {
                                clearInterval(this.flashingInterval);
                                this.flashingIndex = 0;
                                var fileMsgImgElement = document.getElementById(this.msg.event.event_id);
                                if(this.MsgIsMine()) {
                                    fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-mine-voice@2x.png");
                                }
                                else {
                                    fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice@2x.png");
                                }
                            })
                        }
                        else {
                            this.amr.initWithUrl(URL.createObjectURL(blob)).then(() => {
                                this.amr.play();
                                this.voicePlayingImg();
                                this.amr.onEnded(() => {
                                    clearInterval(this.flashingInterval);
                                    this.flashingIndex = 0;
                                    var fileMsgImgElement = document.getElementById(this.msg.event.event_id);
                                    if(this.MsgIsMine()) {
                                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-mine-voice@2x.png");
                                    }
                                    else {
                                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice@2x.png");
                                    }
                                })
                            })
                        }
                    })
            }
        },
        ShowQuoteImg: async function() {
            this.$emit('showImageOfMessage', {
                event:this.msg.event.content.quote_event
            });
        },
        ShowFile: async function() {
            console.log("open image proxy ", this.msg)
            let msgType = this.msg.msgtype;
            // let msgContent = strMsgContentToJson(this.msg.message_content);
            // var targetDir = confservice.getFilePath();
            // var targetFileName = this.msg.message_id.toString() + "." + msgContent.ext;
            // var targetPath = path.join(targetDir, targetFileName);
            let event = this.msg.event;
            let chatGroupMsgType = event.type;
            var chatGroupMsgContent = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            if(chatGroupMsgType === "m.room.encrypted") {
                console.log("========= encrypted file ");
                if(chatGroupMsgContent.msgtype == 'm.file'){
                    this.decryptAndDownloadFile();
                }
                // if(chatGroupMsgContent.msgtype == 'm.image'){
                //     console.log("1 ", this.decryptedUrl);
                //     var imageInfo = {
                //         url: this.decryptedUrl,
                //         info: chatGroupMsgContent.info
                //     }
                //     this.$emit('showImageOfMessage', imageInfo);
                // }
                else if(chatGroupMsgContent.msgtype == "m.audio") {
                    this.decryptAndPlayingFile();
                }
                else if(chatGroupMsgContent.msgtype == "m.bad.encrypted") {
                    this.$emit('showImportE2EKey');
                }
            }
            else if(chatGroupMsgType === "m.room.message") {
                console.log("tmd sha wanyierer ", chatGroupMsgContent.msgtype);
                if(chatGroupMsgContent.msgtype == 'm.file'){
                    if(fs.existsSync(this.msg.path)) {
                        shell.openPath(this.msg.path);
                        return;
                    }
                    console.log("========= file ");
                    var distPath = confservice.getFilePath(this.msg.event.origin_server_ts);
                    var finalPath = path.join(distPath, chatGroupMsgContent.body);
                    var existLocalFile = await this.getFileExist();
                    this.checkingTmpPath = finalPath + "_tmp";
                    if(!fs.existsSync(existLocalFile)) {
                        if(this.isDownloading) {
                            return;
                        }
                        this.isDownloading = true;
                        getFileBlob(chatGroupMsgContent.info, this.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url), this.ProCallback)
                            .then((blob) => {
                                let reader = new FileReader();
                                reader.onload = function() {
                                    if(reader.readyState == 2) {
                                        var buffer = new Buffer(reader.result);
                                        // ipcRenderer.send("save_file", path.join(distPath, content.body), buffer);
                                        ipcRenderer.send("save_file", finalPath, buffer, event.event_id, true);
                                    }
                                }
                                reader.readAsArrayBuffer(blob);
                            })

                        this.downloadingInterval = setInterval(() => {
                            this.showProgress = true;
                            this.curPercent = parseInt(this.receivedLength*100/Number(this.contentLength))
                                // console.log("cur path " + this.checkingTmpPath +" is ", this.curPercent)
                        }, 200);
                    }
                    else {
                        shell.openPath(existLocalFile);
                    }
                }
                else if(chatGroupMsgContent.msgtype == "m.audio") {
                    console.log("audio ================= ")
                    this.playingAudioId = this.msg.event.event_id;
                    var distPath = confservice.getFilePath(this.msg.event.origin_server_ts);
                    var finalPath = path.join(distPath, chatGroupMsgContent.body);
                    var existLocalFile = await this.getFileExist();
                    this.checkingTmpPath = finalPath + "_tmp";
                    if(!fs.existsSync(existLocalFile)) {
                        getFileBlob(chatGroupMsgContent.info, this.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url), this.ProCallback)
                            .then((blob) => {
                                let reader = new FileReader();
                                reader.onload = function() {
                                    if(reader.readyState == 2) {
                                        var buffer = new Buffer(reader.result);
                                        // ipcRenderer.send("save_file", path.join(distPath, content.body), buffer);
                                        ipcRenderer.send("save_file", finalPath, buffer, event.event_id, false);
                                    }
                                }
                                reader.readAsArrayBuffer(blob);
                            })

                        this.downloadingInterval = setInterval(() => {
                            this.showProgress = true;
                            this.curPercent = parseInt(this.receivedLength*100/Number(this.contentLength))
                                // console.log("cur path " + this.checkingTmpPath +" is ", this.curPercent)
                        }, 200);
                    }
                    else {
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
                            setTimeout(() => {
                                this.voicePlayingImg();
                                this.amr.onEnded(() => {
                                    clearInterval(this.flashingInterval);
                                    this.flashingIndex = 0;
                                    var fileMsgImgElement = document.getElementById(this.msg.event.event_id);
                                    if(this.MsgIsMine()) {
                                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-mine-voice@2x.png");
                                    }
                                    else {
                                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice@2x.png");
                                    }
                                })
                            }, 50)
                        }
                        else {
                            var showfu = new FileUtil(existLocalFile);
                            let showfileObj = showfu.GetUploadfileobj();
                            this.amr.initWithUrl(URL.createObjectURL(showfileObj)).then(() => {
                                this.amr.play();
                                this.voicePlayingImg();
                                this.amr.onEnded(() => {
                                    clearInterval(this.flashingInterval);
                                    this.flashingIndex = 0;
                                    var fileMsgImgElement = document.getElementById(this.msg.event.event_id);
                                    if(this.MsgIsMine()) {
                                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-mine-voice@2x.png");
                                    }
                                    else {
                                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice@2x.png");
                                    }
                                })
                            })
                        }
                    }
                    this.$emit('playAudioOfMessage', this.msg.event.event_id);
                }
                else if(chatGroupMsgContent.msgtype == 'm.image'){
                    // var distUrl = this.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url);
                    // var imageInfo = {
                    //     url: distUrl,
                    //     info: chatGroupMsgContent.info
                    // }
                    this.$emit('showImageOfMessage', this.msg);
                }
                else if(chatGroupMsgContent.msgtype == "each.chat.merge") {
                    var MsgList = chatGroupMsgContent.events;
                    let showMsgList = await this.mergeDetails(MsgList);
                    console.log("=====to show showMsgList ", showMsgList);
                    let showMsgInfo = {
                        title: this.transmitMsgTitle,
                        list: showMsgList
                    };
                    ipcRenderer.send("showAnotherWindow", showMsgInfo, "TransmitMsgList");
                }
            }
        },
        mergeDetails: async function(Events) {
            let getDetails = [];
            for(let i = 0; i < Events.length; i++) {
                let curEvent = Events[i];
                let chatGroupMsgType = curEvent.type;
                let chatGroupMsgContent = curEvent.content;
                let curInfo = {};

                var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender);
                var userUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);

                if(chatGroupMsgType == "m.room.message") {
                    if(chatGroupMsgContent.msgtype == "m.image") {
                        let maxSize = 390;
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

                        curInfo = {
                            msgtype: "m.image",
                            url: global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url),
                            event_id: curEvent.event_id,
                            info: info,
                            body: chatGroupMsgContent.body,
                            sender: (curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender,
                            senderName: await ComponentUtil.GetDisplayNameByMatrixID((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender),
                            senderUrl: userUrl,
                            origin_server_ts: curEvent.origin_server_ts
                        }
                    }
                    else if(chatGroupMsgContent.msgtype == "m.text") {
                        curInfo = {
                            msgtype: "m.text",
                            event_id: curEvent.event_id,
                            body: chatGroupMsgContent.body,
                            sender: (curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender,
                            senderName: await ComponentUtil.GetDisplayNameByMatrixID((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender),
                            senderUrl: userUrl,
                            origin_server_ts: curEvent.origin_server_ts
                        }
                    }
                    else if(chatGroupMsgContent.msgtype == "m.file") {
                        let msgs = await Message.FindMessageByMesssageID(curEvent.event_id);
                        let exitPath = "";
                        console.log(msgs)
                        if(msgs.length != 0 && msgs[0].file_local_path != "")
                            exitPath = msgs[0].file_local_path;
                        curInfo = {
                            exitPath: exitPath,
                            msgtype: "m.file",
                            url: global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url),
                            event_id: curEvent.event_id,
                            info: chatGroupMsgContent.info,
                            body: chatGroupMsgContent.body,
                            sender: (curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender,
                            senderName: await ComponentUtil.GetDisplayNameByMatrixID((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender),
                            senderUrl: userUrl,
                            origin_server_ts: curEvent.origin_server_ts
                        }
                    }
                    else if(chatGroupMsgContent.msgtype == "each.chat.merge") {
                        let mergeEvents = chatGroupMsgContent.events;
                        let showMergeEvents = await this.mergeDetails(mergeEvents);
                        curInfo = {
                            msgtype: "each.chat.merge",
                            event_id: curEvent.event_id,
                            events: showMergeEvents,
                            from_room_display_name: chatGroupMsgContent.from_room_display_name,
                            body: chatGroupMsgContent.body,
                            sender: (curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender,
                            senderName: await ComponentUtil.GetDisplayNameByMatrixID((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender),
                            senderUrl: userUrl,
                            origin_server_ts: curEvent.origin_server_ts
                        }
                    }
                }
                getDetails.push(curInfo);
            }
            return getDetails;
        },
        voicePlayingImg:function() {
            if (this.flashingInterval) {
                clearInterval(this.flashingInterval)
            }
            this.flashingInterval = setInterval(() => {
                console.log("this.indexi ", this.flashingIndex);
                var fileMsgImgElement = document.getElementById(this.msg.event.event_id);
                // console.log("fileMsgImgElement ia ", fileMsgImgElement);
                if(this.flashingIndex == 0) {
                    if(this.MsgIsMine()) {
                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-mine-voice-playin0-20px@2x.png");
                    }
                    else {
                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice-playin0-20px@2x.png");
                    }
                    this.flashingIndex = 1;
                }
                else if(this.flashingIndex == 1){
                    if(this.MsgIsMine()) {
                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-mine-voice-playin1-20px@2x.png");
                    }
                    else {
                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice-playin1-20px@2x.png");
                    }
                    this.flashingIndex = 2;
                }
                else if(this.flashingIndex == 2){
                    if(this.MsgIsMine()) {
                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-mine-voice-playin2-20px@2x.png");
                    }
                    else {
                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice-playin2-20px@2x.png");
                    }
                    this.flashingIndex = 0;
                }
                else {
                    if(this.MsgIsMine()) {
                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-mine-voice-playin2-20px@2x.png");
                    }
                    else {
                        fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice-playin2-20px@2x.png");
                    }
                    this.flashingIndex = 0;
                }
            }, 330);
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
            var content = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            if(content.body != undefined) {
                let ext = path.extname(content.body);
                // console.log("getmsgfileicon ext is ", ext);
                return this.getFileIconThroughExt(ext);
            }
        },
        getMsgImgIcon: function() {
            var distUrl = (this.msg.event.content.info && this.msg.event.content.info.thumbnail_url && this.msg.event.content.info.thumbnail_url.length != 0) ? this.msg.event.content.info.thumbnail_url : this.msg.event.content.url;
            if(!distUrl.startsWith('blob:')) {
                let iconPath = this.matrixClient.mxcUrlToHttp(distUrl);
                return iconPath;
            }
            else {
                return distUrl;
            }
        },
        MsgIsImage: function() {
            let msgContent = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            let chatGroupMsgType = this.msg.event.content.msgtype == undefined ? msgContent.msgtype : this.msg.event.content.msgtype;
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
            let msgContent = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            let chatGroupMsgType = this.msg.event.content.msgtype == undefined ? msgContent.msgtype : this.msg.event.content.msgtype;
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
            let msgContent = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            let chatGroupMsgType = this.msg.event.content.msgtype == undefined ? msgContent.msgtype : this.msg.event.content.msgtype;
            if(chatGroupMsgType == 'm.audio'){
                return true;
            }
            else if(chatGroupMsgType == "m.bad.encrypted") {
                return false;
            }
            else{
                return false;
            }
        },
        getVoipType: function() {
            return "voice";
        },
        generalVoipInfo: async function() {
            // :isMine="MsgIsMine()" :voipType="getVoipType()" :roomId="this.msg.event.room_id"
            const voipInfo = {};
            voipInfo["voipType"] = "voice";
            voipInfo["roomId"] = this.msg.event.room_id;
            const voipShowUserInfo = {};

            let checkRoom = global.mxMatrixClientPeg.matrixClient.getRoom(this.msg.event.room_id);
            const distUserId = global.mxMatrixClientPeg.getDMMemberId(checkRoom);
            
            let distUrl = this.$store.getters.getAvater(distUserId);

            if(distUrl || distUrl == '') {
                distUrl = "./static/Img/User/user-40px@2x.png";
            }
            
            let showName = this.$store.getters.getShowName(distUserId);
            if(showName.length == 0) {
                showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
            }

            voipShowUserInfo["userImg"] = distUrl;
            voipShowUserInfo["userName"] = showName;

            voipInfo["userInfo"] = voipShowUserInfo;
            this.VoipInfo = voipInfo;
        },
        getMsgOtherLinkContent: function(content) {
            var dealContent = this.msgContentShowPhoneAndHightLight(content, '#5B6A91');
            return dealContent;
        },
        getPhoneHeightLight: function(content, color) {
            let phoneHight = content.replace(/\d{11}/g, function(num){
                return '<span style="color:' + color + ';display:inline-block;">' + num + "</span>"
            })
            return phoneHight;
        },
        getMsgMineLinkContent: function(content) {
            var dealContent = this.msgContentShowPhoneAndHightLight(content, 'rgba(255, 255, 255, 1)');
            let distElement = document.getElementById(this.getTextElementId());
            distElement.innerHTML = dealContent;
            // return dealContent;
        },

        needHightLight(msg){
            if(!msg || msg.length == 0) return false;
            if(msg.search(ComponentUtil.hightLightReg) == -1) return false;
            return true;
        },

        msgContentShowPhoneAndHightLight: function(curMsg, color){
            let linkHight = curMsg.replace(ComponentUtil.hightLightReg, function(link){
                // return '<span style="color:' + color + ';">' + link + "</span>"
                return '<span class="msg-link-url" style="text-decoration: underline;cursor:pointer;color:' + color + ';" onclick="openUrl(\'' + link + '\');">' + link + '</span>'
            })
            return linkHight;
        },
        openUrl: function(url) {
            if(url.indexOf("https://") < 0 && url.indexOf("http://") < 0) {
                url = "https://" + url;
            }
            shell.openExternal(url);
        },
        MsgIsTransmit: function() {
            let msgContent = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            let chatGroupMsgType = this.msg.event.content.msgtype == undefined ? msgContent.msgtype : this.msg.event.content.msgtype;
            if(chatGroupMsgType == 'each.chat.merge'){
                return true;
            }
            else if(chatGroupMsgType == "m.bad.encrypted") {
                return false;
            }
            else{
                return false;
            }
        },
        MsgIsVoipCall: function() {
            if(this.msg.event.type.indexOf("m.call") >= 0) return true;
            else return false;
        },
        decryptAndDownloadFile: async function() {
            const content = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            if(this.decrypting) return;
            if(this.decryptedBlob == null) {
                this.decrypting = true;
                decryptFile(content.file, this.matrixClient.mxcUrlToHttp(content.file.url))
                    .then((blob) => {
                        let reader = new FileReader();
                        reader.onload = function() {
                            if(reader.readyState == 2) {
                                let a = document.createElement('a');
                                a.href = window.URL.createObjectURL(blob);
                                a.download = content.body;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                this.decrypting = false;
                            }
                        }
                        reader.readAsArrayBuffer(blob);
                    })
            }
        },
        decryptImg: async function() {
            const content = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
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
                                let maxSize = 400;
                                if(content.body)
                                    this.fileName = content.body;
                                let info = {
                                    w: maxSize,
                                    h: maxSize
                                };
                                if(content.info)
                                    info = content.info
                                if(!info.h)
                                    info.h = maxSize;
                                if(!info.w)
                                    info.w = maxSize;
                                if(info.size)
                                    this.fileSizeNum = getFileSizeByNumber(info.size);
                                this.messageContent = content.body;
                                var imgMsgImgElement = document.getElementById(this.msg.event.event_id);
                                let style = "";
                                let max = Math.max(info.w, info.h);
                                if(max > maxSize ){
                                    if(info.w > info.h){
                                        info.h = info.h/(info.w/maxSize);
                                        info.w = maxSize;
                                    }
                                    else{
                                        info.w = info.w/(info.h/maxSize)
                                        info.h = maxSize;
                                    }

                                }
                                style += "width:" + info.w + "px";
                                style += ";"
                                style += "height:" + info.h + "px";
                                imgMsgImgElement.setAttribute("style", style);
                                imgElement.setAttribute("src", thumbnailUrl);
                            }
                        })
                })
            }
        },
        getImageStyle: function() {
            var chatGroupMsgContent = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            let maxSize = 400;

            let showWidth = maxSize;
            let showHeight = maxSize;

            if((!chatGroupMsgContent.info.h || !chatGroupMsgContent.info.w) && this.msg.event.content.url) {
                var img = new Image();
                img.onload = () => {
                    this.imgWidth = img.width;
                    this.imgHeight = img.height;

                    showWidth = img.width;
                    showHeight = img.height;

                    let style = "";
                    let max = Math.max(img.width, img.height);
                    if(max > maxSize ){
                        if(img.width > img.height){
                            showHeight = img.height/(img.width/maxSize);
                            showWidth = maxSize;
                        }
                        else{
                            showWidth = img.width/(img.height/maxSize)
                            showHeight = maxSize;
                        }
                    }
                    style += "width:" + showWidth + "px";
                    style += ";"
                    style += "height:" + showHeight + "px";
                    console.log("*** from image is ", style);
                    return style;
                }
                img.onerror = () => {
                    showWidth = this.imgWidth;
                    showHeight = this.imgHeight;

                    let style = "";
                    let max = Math.max(img.width, img.height);
                    if(max > maxSize ){
                        if(img.width > img.height){
                            showHeight = img.height/(img.width/maxSize);
                            showWidth = maxSize;
                        }
                        else{
                            showWidth = img.width/(img.height/maxSize)
                            showHeight = maxSize;
                        }
                    }
                    style += "width:" + showWidth + "px";
                    style += ";"
                    style += "height:" + showHeight + "px";
                    console.log("*** from image is ", style);
                    return style;
                }
                img.src = this.msg.event.content.url;
            }
            else {
                if(chatGroupMsgContent.info) {
                    if(!chatGroupMsgContent.info.h)
                        chatGroupMsgContent.info.h = this.imgHeight;
                    if(!chatGroupMsgContent.info.w)
                        chatGroupMsgContent.info.w = this.imgWidth;
                    showWidth = chatGroupMsgContent.info.w;
                    showHeight = chatGroupMsgContent.info.h;
                }

                let style = "";
                let max = Math.max(chatGroupMsgContent.info.w, chatGroupMsgContent.info.h);
                if(max > maxSize ){
                    if(chatGroupMsgContent.info.w > chatGroupMsgContent.info.h){
                        showHeight = chatGroupMsgContent.info.h/(chatGroupMsgContent.info.w/maxSize);
                        showWidth = maxSize;
                    }
                    else{
                        showWidth = chatGroupMsgContent.info.w/(chatGroupMsgContent.info.h/maxSize)
                        showHeight = maxSize;
                    }
                }
                style += "width:" + showWidth + "px";
                style += ";"
                style += "height:" + showHeight + "px";
                console.log("*** from info is ", style);
                return style;
            }
        },
        getTransmitContent: async function(events) {
            let contents = "";
            for(let i=0;i<events.length;i++) {
                let chatGroupMsgType = events[i].type;
                var chatGroupMsgContent = events[i].content ? events[i].content : events[i].getContent();
                var fromUserName = await ComponentUtil.GetDisplayNameByMatrixID(((events[i].sender && events[i].sender.userId) ? events[i].sender.userId : events[i].sender));
                if(chatGroupMsgType === "m.room.message")
                {
                    if(chatGroupMsgContent.msgtype == 'm.file'){
                        let content = fromUserName + ":[文件]";
                        contents = contents + content + "\n";
                    }
                    else if(chatGroupMsgContent.msgtype == 'm.text'){
                        let noReturn = chatGroupMsgContent.body.replace(/\n/g, "").replace(/\r\n/g, "");
                        let content = noReturn.length >= 16 ? fromUserName + ":" + noReturn.substring(0, 16) + "..." : fromUserName + ":" + noReturn;
                        contents = contents + content + "\n";
                    }
                    else if(chatGroupMsgContent.msgtype == 'm.image'){
                        let content = fromUserName + ":[图片]";
                        contents = contents + content + "\n";
                    }
                    else if(chatGroupMsgContent.msgtype == 'm.audio'){
                        let content = fromUserName + ":[语音]";
                        contents = contents + content + "\n";
                    }
                    else if(chatGroupMsgContent.msgtype == "each.chat.merge") {
                        let content = fromUserName + ":[聊天记录]";
                        contents = contents + content + "\n";
                    }
                    else {
                        let content = fromUserName + ":[无法识别的消息类型]";
                        contents = contents + content + "\n";
                    }
                }
                if(i == 3) {
                    break;
                }
            }
            return contents;
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
            var chatGroupMsgContent = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            // console.log("chatGroupMsgContent is ", chatGroupMsgContent)
            // console.log("this.msg.getType() is ", this.msg.getType())
            // console.log("chatGroupMsgType.type is ", chatGroupMsgType)
            // console.log("chatGroupMsgContent.type is ", chatGroupMsgContent.msgtype)
            if(chatGroupMsgType === "m.room.message")
            {
                if(chatGroupMsgContent.msgtype == 'm.file'){
                    this.messageContent = chatGroupMsgContent.body;
                    if(chatGroupMsgContent.info)
                        this.fileSize = getFileSizeByNumber(chatGroupMsgContent.info.size);
                    this.fileName = this.messageContent;
                }
                else if(chatGroupMsgContent.msgtype == 'm.text'){
                    this.messageContent = chatGroupMsgContent.body;
                    if(this.messageContent.length == 0) {
                        this.messageContent = "\n";
                    }
                    // this.getMsgMineLinkContent(this.messageContent);
                }
                else if(chatGroupMsgContent.msgtype == 'm.image'){
                    if(chatGroupMsgContent.body)
                        this.fileName = chatGroupMsgContent.body;

                    let info = {
                    };

                    if(chatGroupMsgContent.info)
                        info = chatGroupMsgContent.info;

                    if(info.size)
                        this.fileSizeNum = getFileSizeByNumber(info.size);
                    this.messageContent = chatGroupMsgContent.body;
                }
                else if(chatGroupMsgContent.msgtype == 'm.audio'){
                    this.messageContent = chatGroupMsgContent.body;
                    this.fileName = this.messageContent;

                    var distPath = confservice.getFilePath(this.msg.event.origin_server_ts);
                    var finalPath = path.join(distPath, chatGroupMsgContent.body);
                    var existLocalFile = await this.getFileExist();
                    this.checkingTmpPath = finalPath + "_tmp";
                    if(!fs.existsSync(existLocalFile)) {
                        getFileBlob(chatGroupMsgContent.info, this.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url), this.ProCallback)
                            .then((blob) => {
                                let reader = new FileReader();
                                reader.onload = function() {
                                    if(reader.readyState == 2) {
                                        var buffer = new Buffer(reader.result);
                                        // ipcRenderer.send("save_file", path.join(distPath, content.body), buffer);
                                        ipcRenderer.send("save_file", finalPath, buffer, event.event_id, false);
                                    }
                                }
                                reader.readAsArrayBuffer(blob);
                            })
                    }
                    // var fileMsgImgElement = document.getElementById(this.msg.event.event_id);
                    // // console.log("fileMsgImgElement ia ", fileMsgImgElement);
                    // fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice@2x.png");
                    // fileMsgImgElement.setAttribute("height", 12);
                }
                else if(chatGroupMsgContent.msgtype == "each.chat.merge") {
                    let events = chatGroupMsgContent.events;
                    let distElement = document.getElementById(this.transmitMsgId());
                    if(events.length >= 4) {
                        distElement.style.height = "97px";
                    }
                    else if(events.length == 3) {
                        distElement.style.height = "85px";
                    }
                    else if(events.length == 2) {
                        distElement.style.height = "73px";
                    }
                    else if(events.length == 1) {
                        distElement.style.height = "61px";
                    }
                    let fromRoomid = chatGroupMsgContent.from_room_id;
                    let fromRoomDisplayName = chatGroupMsgContent.from_room_display_name;
                    let fromUserId1 = chatGroupMsgContent.from_matrix_ids ? chatGroupMsgContent.from_matrix_ids[0] : undefined;
                    let fromUserId2 = chatGroupMsgContent.from_matrix_ids ? chatGroupMsgContent.from_matrix_ids[1] : undefined;
                    let fromRoom = global.mxMatrixClientPeg.matrixClient.getRoom(fromRoomid);
                    if(fromRoom && global.mxMatrixClientPeg.DMCheck(fromRoom) && fromUserId1 && fromUserId2) {
                        let fromUserName1 = await ComponentUtil.GetDisplayNameByMatrixID(fromUserId1);
                        let fromUserName2 = await ComponentUtil.GetDisplayNameByMatrixID(fromUserId2);
                        this.transmitMsgTitle = fromUserName1 + "与" + fromUserName2 + "的聊天记录";
                    }
                    else {
                        this.transmitMsgTitle = "群聊的聊天记录";//fromRoomDisplayName;
                    }
                    this.transmitMsgContent = await this.getTransmitContent(events);
                }
                else {
                    this.messageContent = "无法识别的消息类型";
                }
            }
            else if(chatGroupMsgType === "m.call.invite") {
                this.callId = this.msg.event.content.call_id;
                this.generalVoipInfo();
            }
            else if(chatGroupMsgType === "m.call.candidates") {

            }
            else if(chatGroupMsgType === "m.call.hangup") {

            }
            else if(chatGroupMsgType === "m.call.answer") {

            }
            else if(chatGroupMsgType === "m.room.encrypted") {
                // chatGroupMsgContent = this.msg.getContent();
                if(chatGroupMsgContent.msgtype == 'm.file'){
                    this.messageContent = chatGroupMsgContent.body;
                    if(chatGroupMsgContent.info)
                        this.fileSize = getFileSizeByNumber(chatGroupMsgContent.info.size);
                    this.fileName = this.messageContent;
                }
                else if(chatGroupMsgContent.msgtype == 'm.text'){
                    console.log()
                    var textElement = document.getElementById(this.msg.event.event_id);
                    textElement.style.color = "RGB(0,9,0)";
                    this.messageContent = chatGroupMsgContent.body;
                    if(this.messageContent.length == 0) {
                        this.messageContent = "\n";
                    }
                }
                else if(chatGroupMsgContent.msgtype == 'm.image'){
                    var imgMsgImgElement = document.getElementById(this.msg.event.event_id);
                    let style = "";
                    style += "width:400px";
                    style += ";"
                    style += "height:400px";
                    imgMsgImgElement.setAttribute("style", style);
                    this.decryptImg();
                }
                else if(chatGroupMsgContent.msgtype == 'm.audio'){
                    var fileMsgImgElement = document.getElementById(this.msg.event.event_id);
                    // console.log("fileMsgImgElement ia ", fileMsgImgElement);
                    fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice@2x.png");
                    fileMsgImgElement.setAttribute("height", 12);
                }
                else if(chatGroupMsgContent.msgtype == "m.bad.encrypted") {
                    var textElement = document.getElementById(this.msg.event.event_id);
                    textElement.style.color = "RGB(59,137,207)";
                    textElement.style.cursor = "pointer";
                    this.messageContent = "**无法解密:发送方的设备没有给我们发送此消息的密钥。**";
                }
            }
        },
        MsgIsMine:function() {
            if((this.msg.sender ? this.msg.sender.userId : this.msg.event.sender) === this.$store.state.userId) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgBelongUserImg: async function () {
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

            var userId = this.msg.sender ? this.msg.sender.userId : this.msg.event.sender;
            var fromUserName = await ComponentUtil.GetDisplayNameByMatrixID(userId);
            if(this.$store.getters.getShowName(userId) != fromUserName) {
                this.$store.commit("setShowName", [userId, fromUserName]);
            }
            if(userNameElement != undefined) {
                userNameElement.innerHTML = fromUserName;
            }

            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo((userId));
            var userUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);

            if(this.userIconElement == undefined) {
                return;
            }
            if(userUrl == "") {
                return;
            }
            // console.log("userUrl is ", userUrl);
            if(this.$store.getters.getAvater(userId) != userUrl) {
                var userToAvaterInfo = [userId, userUrl];
                this.$store.commit("setAvater", userToAvaterInfo);
            }
            this.userIconElement.setAttribute("src", userUrl);
        },
        msgUserInfo: async function() {
            this.userInfo = {};
            if(this.msg.sender){
                this.userInfo.matrix_id = (this.msg.sender ? this.msg.sender.userId : this.msg.event.sender);
            }
        },
        compare: function(){
            return function(a, b)
            {
                var value1 = a.sequence_id;
                var value2 = b.sequence_id;
                return value2 - value1;
            }
        },
        readFileAsArrayBuffer(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        },
        /**
         * Load a file into a newly created image element.
         *
         * @param {File} imageFile The file to load in an image element.
         * @return {Promise} A promise that resolves with the html image element.
         */
        async loadImageElement(imageFile) {
            // Load the file into an html element
            const img = document.createElement("img");
            const objectUrl = this.msg.event.content.url ? this.msg.event.content.url : URL.createObjectURL(imageFile);
            const imgPromise = new Promise((resolve, reject) => {
                img.onload = function() {
                    this.imgWidth = img.width;
                    this.imgHeight = img.height;
                    URL.revokeObjectURL(objectUrl);
                    resolve(img);
                };
                img.onerror = function(e) {
                    reject(e);
                };
            });
            img.src = objectUrl;

            // // check for hi-dpi PNGs and fudge display resolution as needed.
            // // this is mainly needed for macOS screencaps
            // let parsePromise;
            // if (imageFile.type === "image/png") {
            //     // in practice macOS happens to order the chunks so they fall in
            //     // the first 0x1000 bytes (thanks to a massive ICC header).
            //     // Thus we could slice the file down to only sniff the first 0x1000
            //     // bytes (but this makes extractPngChunks choke on the corrupt file)
            //     const headers = imageFile; //.slice(0, 0x1000);
            //     parsePromise = readFileAsArrayBuffer(headers).then(arrayBuffer => {
            //         const buffer = new Uint8Array(arrayBuffer);
            //         const chunks = extractPngChunks(buffer);
            //         for (const chunk of chunks) {
            //             if (chunk.name === 'pHYs') {
            //                 if (chunk.data.byteLength !== PHYS_HIDPI.length) return;
            //                 return chunk.data.every((val, i) => val === PHYS_HIDPI[i]);
            //             }
            //         }
            //         return false;
            //     });
            // }

            // const [hidpi] = await Promise.all([parsePromise, imgPromise]);
            const [hidpi] = await Promise.all([imgPromise]);
            const width = hidpi ? (img.width >> 1) : img.width;
            const height = hidpi ? (img.height >> 1) : img.height;
            return {width, height, img};
        },
        /**
         * Read the metadata for an image file and create and upload a thumbnail of the image.
         *
         * @param {MatrixClient} matrixClient A matrixClient to upload the thumbnail with.
         * @param {String} roomId The ID of the room the image will be uploaded in.
         * @param {File} imageFile The image to read and thumbnail.
         * @return {Promise} A promise that resolves with the attachment info.
         */
        infoForImageFile(roomId, imageFile) {
            let thumbnailType = "image/png";
            if (imageFile.type === "image/jpeg") {
                thumbnailType = "image/jpeg";
            }

            let imageInfo;
            return this.loadImageElement(imageFile).then((r) => {
                console.log("*** loadImageElement return is ", r);
                return this.createThumbnail(r.img, r.width, r.height, thumbnailType);
            }).then((result) => {
                imageInfo = result.info;
                return this.uploadFile(roomId, result.thumbnail);
            }).then((result) => {
                imageInfo.thumbnail_url = result.url;
                imageInfo.thumbnail_file = result.file;
                return imageInfo;
            });
        },
        /**
         * Upload the file to the content repository.
         * If the room is encrypted then encrypt the file before uploading.
         *
         * @param {MatrixClient} matrixClient The matrix client to upload the file with.
         * @param {String} roomId The ID of the room being uploaded to.
         * @param {File} file The file to upload.
         * @param {Function?} progressHandler optional callback to be called when a chunk of
         *    data is uploaded.
         * @return {Promise} A promise that resolves with an object.
         *  If the file is unencrypted then the object will have a "url" key.
         *  If the file is encrypted then the object will have a "file" key.
         */
        uploadFile(roomId, file) {
            let canceled = false;
            if (global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(roomId)) {
                // If the room is encrypted then encrypt the file before uploading it.
                // First read the file into memory.
                let uploadPromise;
                let encryptInfo;
                const prom = readFileAsArrayBuffer(file).then((data) => {
                    return encrypt.encryptAttachment(data);
                }).then((encryptResult) => {
                    // Record the information needed to decrypt the attachment.
                    encryptInfo = encryptResult.info;
                    // Pass the encrypted data as a Blob to the uploader.
                    const blob = new Blob([encryptResult.data]);
                    uploadPromise = global.mxMatrixClientPeg.matrixClient.uploadContent(blob, {
                        progressHandler: this.onUploadProgress,
                        includeFilename: false,
                    });
                    return uploadPromise;
                }).then((url) => {
                    // If the attachment is encrypted then bundle the URL along
                    // with the information needed to decrypt the attachment and
                    // add it under a file key.
                    encryptInfo.url = url;
                    if (file.type) {
                        encryptInfo.mimetype = file.type;
                    }
                    return {"file": encryptInfo};
                });
            } else {
                const basePromise = global.mxMatrixClientPeg.matrixClient.uploadContent(file, {
                    progressHandler: this.onUploadProgress,
                });
                const promise1 = basePromise.then((url) => {
                    // If the attachment isn't encrypted then include the URL directly.
                    return {"url": url};
                });
                return promise1;
            }
        },
        createThumbnail(element, inputWidth, inputHeight, mimeType) {
            return new Promise((resolve) => {
                let targetWidth = inputWidth;
                let targetHeight = inputHeight;
                if (targetHeight > MAX_HEIGHT) {
                    targetWidth = Math.floor(targetWidth * (MAX_HEIGHT / targetHeight));
                    targetHeight = MAX_HEIGHT;
                }
                if (targetWidth > MAX_WIDTH) {
                    targetHeight = Math.floor(targetHeight * (MAX_WIDTH / targetWidth));
                    targetWidth = MAX_WIDTH;
                }

                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                canvas.getContext("2d").drawImage(element, 0, 0, targetWidth, targetHeight);
                canvas.toBlob((thumbnail) => {
                    resolve({
                        info: {
                            thumbnail_info: {
                                w: targetWidth,
                                h: targetHeight,
                                mimetype: thumbnail.type,
                                size: thumbnail.size,
                            },
                            w: inputWidth,
                            h: inputHeight,
                        },
                        thumbnail: thumbnail,
                    });
                }, mimeType);
            });
        },
        onUploadProgress(ev) {
            this.curPercent = parseInt(ev.loaded*100/Number(ev.total));
            if(ev.loaded >= ev.total) {
                this.showProgress = false;
                this.curPercent = 1;
            }
        },
        sendText: async function(txnId) {
            var roomID = this.msg.event.room_id;
            try{
                global.mxMatrixClientPeg.matrixClient.sendMessage(roomID, this.msg.event.content, txnId ? txnId : this.msg._txnId).then((ret) => {
                    this.$store.commit("removeSendingEvents", this.msg);
                    this.msg.message_status = 0;
                }).catch((error) => {
                    console.log("error is ", error);
                    this.msg.message_status = 2;
                })
            }
            catch(error) {
                this.msg.message_status = 1;
                console.log("error is ", error);
            }
        },
        sendFile: async function() {
            var showfileObj = this.msg.fileObj;

            var roomID = this.msg.event.room_id;
            if(this.msg.event.content.msgtype == 'm.image'){
                // this.SendImage(showfileObj, fileResult, stream)
                this.infoForImageFile(roomID, showfileObj).then((imageInfo) => {
                    extend(this.msg.event.content.info, imageInfo);
                    this.uploadFile(this.msg.event.room_id, showfileObj, this.onUploadProgress).then((ret) => {
                        this.showProgress = false;
                        this.curProcess = 1;
                        this.msg.event.content.file = ret.file;
                        this.msg.event.content.url = ret.url;
                        global.mxMatrixClientPeg.matrixClient.sendMessage(roomID, this.msg.event.content, this.msg._txnId).then((ret) => {
                            this.$store.commit("removeSendingEvents", this.msg);
                            this.msg.message_status = 0;
                            this.showState = false;
                        }).catch((error) => {
                            console.log("error is ", error.errcode);
                            this.msg.message_status = 2;
                        })
                    })
                }, (e) => {
                    this.msg.message_status = 2;
                    console.log("**** getInfoForImageFile Exception ", e);
                })
            }
            else{
                this.showProgress = true;
                this.uploadFile(roomID, showfileObj, this.onUploadProgress).then((ret) => {
                    console.log("*** ret id ", ret);
                    this.showProgress = false;
                    this.curProcess = 1;

                    this.msg.event.content.msgtype = 'm.file';
                    this.msg.event.content.file = ret.file;
                    this.msg.event.content.url = ret.url;
                    this.msg.event.content.info.mimetype = fileMIMEFromType(path.extname(showfileObj.name).split('.')[1]);
                    this.msg.event.content.info.size = this.msg.event.content.info.size;
                    global.mxMatrixClientPeg.matrixClient.sendMessage(roomID, this.msg.event.content, this.msg._txnId).then(async (ret) => {
                        this.$store.commit("removeSendingEvents", this.msg);
                        if(fs.existsSync(this.msg.path)) {
                            let msgs = await Message.FindMessageByMesssageID(ret.event_id);
                            if(msgs.length != 0){
                                msgs[0].file_local_path = this.msg.path;
                                msgs[0].save();
                            }
                            else{
                                let msgValue = {
                                    message_id: ret.event_id,
                                    file_local_path: this.msg.path
                                }
                                let model = await new(await models.Message)(msgValue);
                                model.save();
                            }
                        }
                        this.msg.message_status = 0;
                        this.showState = false;
                    })
                    .catch((error) => {
                            console.log("error is ", error.errcode);
                            this.msg.message_status = 2;
                            this.showState = true;
                        })
                })
                .catch((error) => {
                    this.$store.commit("removeSendingEvents", this.msg);
                    this.msg.message_status = 2;
                    this.showState = true;
                })

            }
        },
    },
    data() {
        return {
            callId: '',
            VoipInfo: {},
            isDownloading: false,
            playingAudioId: '',
            decrypting: false,
            decryptedUrl: null,
            decryptedThumbnailUrl: null,
            decryptedBlob: null,
            showProgress: false,
            curPercent: 0,
            downloadingInterval: undefined,
            flashingInterval: undefined,
            flashingIndex: 0,
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
            matrixClient: undefined,
            imgWidth: 400,
            imgHeight: 400,
            quoteName: '',
        }
    },
    mounted: async function() {
        if(this.msg.event.content.msgtype != "m.text" && !this.msg.event.event_id) {
        // if(this.msg.event.msgtype != "m.text") {
            console.log("====== message this.msg is ", this.msg);
            this.sendFile();
        }
        else if(this.msg.event.content.msgtype == "m.text" && !this.msg.event.event_id) {
            this.sendText();
        }
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
        if (this.hasQuote()){
            const sender = this.msg.event.content.quote_event.sender
            this.quoteName = await ComponentUtil.GetDisplayNameByMatrixID(
               typeof (sender) === 'string' ? sender : sender.userId
            )
        }
        window.openUrl=this.openUrl;
    },
    created: async function() {
        this.matrixClient = window.mxMatrixClientPeg.matrixClient;
        this.loginInfo = undefined;
        this.curUserInfo = undefined;
    },
    beforeDestroy: function() {
        if(this.amr != null) {
            this.amr.stop();
        }
    },
    watch: {
        msg: async function() {
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
            if(this.amr != null && this.playingMsgId != this.msg.event.event_id) {
                console.log("this.playingMsgId is ", this.playingMsgId);
                console.log("this.msg.id is ", this.msg.event.event_id);
                this.amr.stop();
            }
        },
        updateMsg: function() {
            if(this.updateMsg.length == 0) {
                return;
            }
            setTimeout(() => {
                this.showState = true;
                this.updateStatus = !this.updateStatus;
            }, 500)
            var id = this.updateMsg[1];
            var localPath = this.updateMsg[0];

            if(id != this.msg.event.event_id) {
                return;
            }

            var chatGroupMsgContent = this.msg.event.content ? this.msg.event.content : this.msg.getContent();
            if(chatGroupMsgContent && chatGroupMsgContent.msgtype == 'm.file')
            {
                shell.openPath(localPath);
            }
            this.showProgress = false;
            if(this.downloadingInterval) {
                this.isDownloading = false;
                clearInterval(this.downloadingInterval);
            }
            if(id == this.playingAudioId) {
                if(this.amr == null){
                    this.amr = new BenzAMRRecorder();
                }
                if(this.amr.isPlaying()) {
                    console.log("stop")
                    this.amr.stop();
                }
                else {
                    this.amr.initWithUrl(localPath).then(() => {
                        this.amr.play();
                        this.voicePlayingImg();
                        this.amr.onEnded(() => {
                            clearInterval(this.flashingInterval);
                            this.flashingIndex = 0;
                            var fileMsgImgElement = document.getElementById(this.msg.event.event_id);
                            fileMsgImgElement.setAttribute("src", "./static/Img/Chat/msg-voice@2x.png");
                        })
                        this.playingAudioId = '';
                    })
                }
            }
        },
        updateUser: function() {
            this.MsgBelongUserImg();
            return;
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
            if(this.updateMsgStatus.id == this.msg._txnId || this.updateMsgStatus.id == this.msg.event.event_id) {
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

    progress::-webkit-progress-bar {
        background-color: rgba(210, 215, 222, 1);
    }

    progress::-webkit-progress-value {
        background: rgba(36, 179, 107, 1)
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
        width: 70%;
        float: right;
        display: block;
    }

    .msg-info-others {
        width: 70%;
        float: left;
        display: block;
        margin-left: 8px;
    }

    .my-file-progress {
        display: block;
        width: 170px;
        float: right;
        height: 2px;
        background: #D2D7DE;
        border-radius: 1px;
        vertical-align: top;
        margin-top: -5px;
    }

    .others-file-progress {
        display: block;
        width: 100%;
        float: left;
        height: 2px;
        background: #D2D7DE;
        border-radius: 1px;
        vertical-align: top;
        margin-top: -5px;
    }

    .msg-info-user-img-no-name {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit:cover;
        -webkit-user-select:none;
    }

    .msg-info-user-img-no-name:hover {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        -webkit-user-select:none;
    }

    .msg-info-user-img-with-name {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-top: 4px;
        -webkit-user-select:none;
        object-fit:cover;
    }

    .msg-info-user-img-with-name:hover {
        display: inline-block;
        vertical-align: top;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        margin-top: 4px;
        -webkit-user-select:none;
        object-fit:cover;
    }

    .about-msg {
        display: inline-block;
        margin: 0px 10px 5px 10px;
        width: calc(100% - 90px);
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
    }

    .msgState {
        display: inline-block;
        width: 20px;
        height: 20px;
    }

    .fileMsgState {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-top: 10px;
    }

    .sendWarning {
        width: 20px;
        height: 20px;
    }

    .sendWarning:hover {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .msg-info-username-mine {
        display: block;
        font-size: 10px;
        color: rgb(153, 153, 153);
        text-align: right;
        -webkit-user-select:none;
    }

    .msg-info-username-others {
        display: block;
        min-height: 17px;
        font-size: 12px;
        color: rgb(153, 153, 153);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        -webkit-user-select:none;
    }

    .chat-msg-content-others-txt-div {
        float: left;
        background-color: rgba(255, 255, 255, 1);
        max-width: 100%;
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
        letter-spacing: 0px;
    }

    .chat-msg-content-others-txt-div-angle {
        top: 9px;
        left: -10px;
        border-width: 5px;
        border-style: solid;
        width: 0px;
        height: 0px;
        border-color: transparent;
        border-right-color: white;
        position: relative;
    }

    .chat-msg-content-others-link-div {
        float: left;
        background-color: rgba(255, 255, 255, 1);
        max-width: 100%;
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
        letter-spacing: 0px;
    }

    .chat-msg-content-others-txt-div:hover {
        float: left;
        background-color: rgba(255, 255, 255, 1);
        max-width: 100%;
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
        letter-spacing: 0px;
        cursor: text;
    }

    .chat-msg-content-others-txt{
        float: left;
        background-color: rgba(255, 255, 255, 0);
        max-width: 100%;
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
        letter-spacing: 0px;
    }

    .chat-msg-content-others-txt:hover{
        float: left;
        background-color: rgba(255, 255, 255, 0);
        max-width: 100%;
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
        letter-spacing: 0px;
        cursor: text;
    }

    .chat-msg-content-others-img {
        float: left;
        background-color: rgba(255, 255, 255, 1);
        border-radius: 5px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        -webkit-user-select:none;
    }

    .chat-msg-content-others-file {
        float: left;
        background-color: rgba(255, 255, 255, 1);
        width: 266px;
        height: 60px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        -webkit-user-select:none;
    }

    .chat-msg-content-others-voice {
        float: left;
        background-color: rgba(255, 255, 255, 1);
        width: 90px;
        min-height: 12px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        -webkit-user-select:none;
    }

    .chat-msg-content-others-file:hover {
        float: left;
        background-color: rgba(255, 255, 255, 1);
        width: 266px;
        height: 60px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        -webkit-user-select:none;
    }

    .file-image {
        height: 40px;
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 18px;
        margin-right: 5px;
        display: inline-block;
        -webkit-user-select:none;
    }

    .voice-image {
        height: 16px;
        display: inline-block;
        -webkit-user-select:none;
    }

    .voice-mine-image {
        height: 16px;
        display: inline-block;
        -webkit-user-select:none;
    }

    .file-info {
        height: 40px;
        margin-top: 10px;
        margin-left: 0px;
        margin-right: 5px;
        margin-bottom: 10px;
        display: inline-block;
        vertical-align: top;
    }

    .voice-info {
        min-height: 16px;
        max-height: 23px;
        display: inline-block;
        vertical-align: top;
        .file-size{
            font-weight: 400;
            color: #000000;
            font-size: 14px;
            margin: 0;
        }
    }

    .file-name {
        max-width: 170px;
        font-size: 14px;
        font-weight: 550;
        font-family: 'PingFangSC-Medium';
        color: rgb(51, 51, 51);
        overflow: hidden;
        margin-left: 0px;
        margin-top: 0px;
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
        margin-left: 0px;
        margin-top: 5px;
        margin-right: 0px;
        margin-bottom: 4px;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .chat-msg-content-mine-txt-div-angle {
        top: 9px;
        right: 0;
        border-width: 5px;
        border-style: solid;
        width: 0px;
        height: 0px;
        border-color: transparent;
        border-left-color: rgba(82, 172, 68, 1);
        position: relative;
        margin-left: 100%;
    }

    .chat-msg-content-mine-file-div-angle {
        top: 9px;
        right: 0;
        border-width: 5px;
        border-style: solid;
        width: 0px;
        height: 0px;
        border-color: transparent;
        border-left-color: rgba(255, 255, 255, 1);
        position: relative;
        margin-left: 100%;
    }

    .chat-msg-content-mine-txt-div {
        float:right;
        background-color: rgba(82, 172, 68, 1);
        max-width: calc(100% - 60px);
        min-height: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        letter-spacing: 0px;
    }

    .chat-msg-content-mine-txt-div:hover{
        float:right;
        background-color: rgba(82, 172, 68, 1);
        max-width: calc(100% - 60px);
        min-width: 20px;
        min-height: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        letter-spacing: 0px;
    }
    .chat-msg-content-mine-link {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 100%;
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
        letter-spacing: 0px;
        text-decoration: underline;
        color: white;
        cursor: text;
    }

    .chat-msg-content-mine-link:hover{
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 100%;
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
        letter-spacing: 0px;
        color: white;
        text-decoration: underline
    }

    .chat-msg-content-others-link {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 100%;
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
        letter-spacing: 0px;
        text-decoration: underline;
        color: #5B6A91;
    }

    .chat-msg-content-others-link:hover {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 100%;
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
        letter-spacing: 0px;
        text-decoration: underline;
        color: #5B6A91;
        cursor: pointer;
    }

    .chat-msg-content-mine-txt {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 100%;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'PingFangSC-Light';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing: 0px;
        color: rgba(255, 255, 255, 1);
    }

    .chat-msg-content-mine-txt:hover {
        float:right;
        background-color: rgba(1,1,1,0);
        max-width: 100%;
        min-width: 20px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        font-family: 'PingFangSC-Light';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        font-weight:400;
        letter-spacing: 0px;
        color: rgba(255, 255, 255, 1);
        cursor: text;
    }

    .chat-msg-content-mine-img {
        float: right;
        background-color: rgba(1,1,1,0);
        border-radius: 5px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        -webkit-user-select:none;
    }

    .msg-image {
        height: 400px;
    }

    .chat-msg-content-mine-file {
        float:right;
        background:rgba(255, 255, 255, 1);
        width: 266px;
        height: 60px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        -webkit-user-select:none;
    }

    .chat-msg-content-mine-file:hover {
        float:right;
        background-color: rgba(255, 255, 255, 1);
        width: 266px;
        height: 60px;
        border-radius: 5px;
        padding: 0;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        -webkit-user-select:none;
    }

    .chat-msg-content-mine-voice {
        float:right;
        background-color: rgba(82, 172, 68, 1);
        width: 90px;
        min-height: 12px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        -webkit-user-select:none;
    }

    .chat-msg-content-other-transmit {
        float:left;
        background-color: rgba(255, 255, 255, 1);
        // max-width: 260px;
        // min-width: 200px;
        width: 243px;
        height: 97px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-mine-transmit {
        float:right;
        background-color: rgba(255, 255, 255, 1);
        // max-width: 260px;
        // min-width: 200px;
        width: 243px;
        max-height: 97px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .transmit-title {
        display: block;
        background-color: rgba(255, 255, 255, 1);
        max-width: 260px;
        min-width: 20px;
        border: 0px solid rgba(221, 221, 221, 1);
        padding-bottom: 3px;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        font-weight: 400;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .transmit-content {
        display: block;
        left:right;
        background-color: rgba(255, 255, 255, 1);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding-top: 3px;
        font-size: 12px;
        font-weight: 400;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
        letter-spacing: 0px;
        line-height: 18px;
        color:rgba(153, 153, 153, 1);
    }

    .imageTip {
        text-align: center;
    }
    .quote-content{
        display: flex;
        height: 52px;
        background: #E2E2E5;
        margin-left: 45px;
        border-radius: 5px;
        width: fit-content;
        padding: 6px 12px;
        box-sizing: border-box;
        span{
            font-size: 13px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #666666;
            line-height: 20px;
            margin-right: 8px;
        }
        .quote-content-img{
            width: 40px;
            height: 40px;
            background-repeat: no-repeat;
            background-size: cover;
        }
    }
    .msg-info-mine{
        .quote-content{
           float: right;
           margin-right: 56px;
        }
    }
</style>