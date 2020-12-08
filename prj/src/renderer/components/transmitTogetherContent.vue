<template>
    <div class="HistoryMsgDlg" id="HistoryMsgDlgId">
        <!-- <winHeaderBar :showMax="false" @Close="Close" @Min="Min"></winHeaderBar> -->
        <div class="HistoryMsgDlgHeader">
            <img class="HistoryMsgDlgHeaderImg" id="HistoryMsgDlgHeaderImgId">
            <div class="HistoryMsgDlgHeaderTitle">{{GroupName}}</div>
        </div>
        <div class="HistoryMsgDlgContent">
            <!-- <div class="search">
                <input class="HistoryMsgDlgSearchInput" placeholder="搜索..." v-model="searchKey" @input="search" @keyup.enter="search">
                <img class="icon-search" src="../../../static/Img/Chat/search-20px.png" @click="search">
            </div> -->
            <ul class="HistoryMsg-list">
                <li v-for="(item, index) in messageListShow" class="messageItem">
                    <img class="messageOwnerImage" :id="getUserHeadImageId(item)">
                    <div class="messageInfoDiv">
                        <div class="messageOwnerTimeDiv">
                            <label class="messageInfoOwnerNameLabel" :id="getUserNameId(item)"></label>
                            <label class="messageInfoTimeLabel">{{getMsgTime(item)}}</label>
                            <div class="messageInfoDetailLabel">
                                <div class="msg-info-username-others" v-show=false>{{MsgBelongUserName()}}</div>
                                <div class="chat-msg-content-others-img"
                                    v-on:click="ShowFile(item)" v-if="MsgIsImage(item)">
                                    <img class="msg-image" :id="getTransmitTogetherContentItemId(item.msgId)" src="../../../static/Img/Chat/loading.gif" alt="图片" :height="100">
                                </div>
                                <div class="chat-msg-content-others-file"
                                    v-on:click="ShowFile(item)" v-else-if="MsgIsFile(item)">
                                    <img class="file-image" :id="getTransmitTogetherContentItemId(item.msgId)" style="vertical-align:middle">
                                    <div class="file-info">
                                        <p class="file-name">{{item.content.fileName}}</p>
                                        <p class="file-size">{{(item.content.fileSize/(1024 * 1024)).toFixed(2)}} K</p>
                                    </div>
                                </div>
                                <div class="chat-msg-content-others-voice"
                                    v-on:click="ShowFile(item)" v-else-if="MsgIsVoice(item)">
                                    <img class="voice-image" :id="getTransmitTogetherContentItemId(item.msgId)" style="vertical-align:middle">
                                    <div class="voice-info">
                                        <p class="file-size">{{item.content.voiceLenth}} s</p>
                                    </div>
                                </div>
                                <div class="chat-msg-content-other-transmit"
                                    v-on:click="ShowFile(item)" v-else-if="MsgIsTransmit(item)">
                                    <div class="transmit-title" :id="getTransmitTogetherContentItemId(item.msgId)" style="vertical-align:middle">合并转发</div>
                                </div>
                                <div class="chat-msg-content-others-txt-div" 
                                    v-else>
                                    <p class="chat-msg-content-others-txt" :id="item.msgId">{{item.content.text}}</p>
                                </div>
                            </div>
                        </div>
                        <!-- <div class="messageInfoDetailLabel" v-html="msgContentHeightLight(item)"></div> -->
                    </div>
                </li>
            </ul>
            <div class="HistoryMsgEmpty" v-show="showEmpty">
                <!-- <img class="HistoryMsgEmptyBg" src="../../../static/Img/MessageHistory/search-empty@2x.png">
                <div class="HistoryMsgEmptyText">搜索会话中的消息</div> -->
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil, getIconPath, Appendzero, sliceReturnsOfString} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import * as fs from 'fs-extra'
import * as path from 'path'
import {ipcRenderer, remote} from 'electron'
import winHeaderBar from './win-header.vue'
import confservice from '../../packages/data/conf_service.js'
import { Group } from '../../packages/data/sqliteutil'
import {shell} from 'electron'
export default {
    name: 'HistoryMsgDlg',
    data () {
        return {
            GroupName: '',
            messageListShow: [],
            searchKey: '',
            GroupInfo: null,
            groupId: '',
            originalMessageList: [],
            showEmpty: false,
        }
    },  
    methods: {
        getTransmitTogetherContentItemId: function(distId) {
            return "transmit-together-content-item-" + distId;
        },
        MsgContent: async function(item) {
            this.messageContent = '';
            this.transmitMsgTitle = '';
            this.transmitMsgContent = '';
            let chatGroupMsgType = item.msgContentType;
            var chatGroupMsgContent = item.content;
            var distId = this.getTransmitTogetherContentItemId(item.msgId);
            if(chatGroupMsgType === 101 || chatGroupMsgType ==0)
            {
                this.messageContent = sliceReturnsOfString(chatGroupMsgContent.text);
                if(this.messageContent.length == 0) {
                    this.messageContent = "\n";
                }
            }
            else if(chatGroupMsgType === 102)
            {
                var targetFileName = chatGroupMsgContent.fileName;
                var ext = path.extname(targetFileName);
                var targetPath = "";
                var needOpen = false;
                var imgMsgImgElement = document.getElementById(distId);
                imgMsgImgElement.setAttribute("style", "padding:40px 40px 40px 40px;width:20px;height:20px;");
                if(fs.existsSync(targetPath = await services.common.downloadMsgTTumbnail(item.timelineId, item.timestamp, item.msgId + ext, false))) {
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
            else if(chatGroupMsgType === 103)
            {
                var targetFileName = chatGroupMsgContent.fileName;
                var ext = path.extname(targetFileName);
                var targetPath = "";

                var targetDir = confservice.getFilePath(item.message_timestamp);
                var targetPath = path.join(targetDir, targetFileName);

                var needOpen = false;
                if(!fs.existsSync(targetPath)){
                    services.common.downloadTransmitMsgFile(item.timelineId, item.timestamp, item.msgId + ext, false, chatGroupMsgContent.fileSize, item.fromId);
                }
                var fileMsgImgElement = document.getElementById(distId);
                var iconPath = this.getFileIconThroughExt(chatGroupMsgContent.ext);
                this.fileName = chatGroupMsgContent.fileName;
                this.fileSize = (chatGroupMsgContent.fileSize/1024).toFixed(2);
                fileMsgImgElement.setAttribute("src", iconPath);
                fileMsgImgElement.setAttribute("height", 40);
            }
            else if(chatGroupMsgType === 105)
            {
                var targetFileName = chatGroupMsgContent.fileName;
                var targetPath = '';
                var needOpen = false;
                if(!fs.existsSync(targetPath)){
                    services.common.downloadVoiceFile(item.timelineId, item.timestamp, targetFileName, needOpen);
                }
                var fileMsgImgElement = document.getElementById(distId);
                this.voiceLenth = chatGroupMsgContent.length;
                this.fileSize = (chatGroupMsgContent.fileSize/1024).toFixed(2);
                fileMsgImgElement.setAttribute("src", "../../../static/Img/Chat/voiceAudio@3x.png");
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
        ShowFile: async function(item) {
            // console.log("open image proxy ", item)
            let msgType = item.msgContentType;
            let msgContent = item.content;
            // var targetDir = confservice.getFilePath();
            // var targetFileName = item.message_id.toString() + "." + msgContent.ext;
            // var targetPath = path.join(targetDir, targetFileName);
            if(msgType === 102)
            {
                // this.$emit('showImageOfMessage', item);
            }
            else if(msgType === 103)
            {
                // var ext = msgContent.ext;
                // var targetDir = confservice.getFilePath();
                var targetFileName = msgContent.fileName;
                var ext = path.extname(targetFileName);
                // var targetPath = path.join(targetDir, targetFileName);
                var targetPath = await services.common.GetFilePath(item.msgId);
                console.log("targetPath is =========== ", targetPath);
                // if(msgContent.fileLocalPath != undefined && fs.existsSync(msgContent.fileLocalPath)){
                //     targetPath = msgContent.fileLocalPath;
                // }
                // if(targetPath.length == 0) {
                //     targetPath = item.file_local_path;
                // }
                if(targetPath.length == 0) {
                    var targetDir = confservice.getFilePath(item.timestamp);
                    var targetPath = path.join(targetDir, item.msgId + ext);
                }
                var needOpen = true;
                if(fs.existsSync(targetPath)){
                    shell.openItem(targetPath);
                }
                else{
                    services.common.downloadTransmitMsgFile(item.timelineId, item.timestamp, item.msgId + ext, true, msgContent.fileSize, item.fromId);
                }
            }
            else if(msgType == 105) {
                var targetFileName = msgContent.fileName;
                var targetPath = await services.common.GetFilePath(item.msgId);
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
                    services.common.downloadVoiceFile(item.timelineId, item.timestamp, item.msgId + ext, true);
                }
                this.$emit('playAudioOfMessage', item.message_id);
            }
            else if(msgType == 106) {
                ipcRenderer.send("showAnotherWindow", [item.time_line_id, item.group_id], "TransmitMsgList");
            }
        },
        MsgIsImage: function(item) {
            let chatGroupMsgType = item.msgContentType;
            if(chatGroupMsgType == 102){``
                return true;
            }
            else{
                return false;
            }
        },
        MsgIsFile: function(item) {
            let chatGroupMsgType = item.msgContentType;
            if(chatGroupMsgType == 103){
                return true;
            }
            else{
                return false;
            }
        },
        MsgIsVoice: function(item) {
            let chatGroupMsgType = item.msgContentType;
            // console.log("chatGroupMsgType is ", chatGroupMsgType)
            if(chatGroupMsgType == 105){
                return true;
            }
            else{
                return false;
            }
        },
        MsgIsTransmit: function(item) {
            let chatGroupMsgType = item.msgContentType;
            // console.log("chatGroupMsgType is ", chatGroupMsgType)
            if(chatGroupMsgType == 106){
                return true;
            }
            else{
                return false;
            }
        },
        getUserNameId: function(curMsg) {
            return "TransmitTogetherMsgListName-" + curMsg.sequenceId;
        },
        getUserHeadImageId: function(curMsg) {
            return "TransmitTogetherMsgListImg-" + curMsg.sequenceId;
        },
        checkGetUserHedImageId: function(id) {
            return "TransmitTogetherMsgListImg-" + id;
        },
        Close: function() {
            console.log("=======")
            ipcRenderer.send("AnotherClose");
        },
        Min: function() {
            ipcRenderer.send("AnotherMin");
        },
        updateMsgFile: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var needOpen = args[4];
            
            for(var i=0;i<this.originalMessageList.length;i++) {
                if(this.originalMessageList[i].timelineId == id) {
                    var item = this.originalMessageList[i];
                    
                    let chatGroupMsgType = item.msgContentType;
                    var chatGroupMsgContent = item.content;
                    var distId = this.getTransmitTogetherContentItemId(item.msgId);
                    if(chatGroupMsgType === 102)
                    {
                        var imgMsgImgElement = document.getElementById(getTransmitTogetherContentItemId(distId));
                        var showfu = new FileUtil(localPath);
                        let showfileObj = showfu.GetUploadfileobj();
                        let reader = new FileReader();
                        reader.readAsDataURL(showfileObj);
                        reader.onloadend = () => {
                            imgMsgImgElement.setAttribute("src", reader.result);
                            imgMsgImgElement.setAttribute("height", 100);
                            imgMsgImgElement.setAttribute("style", "");
                        }
                    }
                }
            }
        },
        getAppBaseData:async function() {
            // Init services
            this.selfUserInfo = await services.common.GetSelfUserModel();
            // Set accessToken in services
            this.loginInfo = await services.common.GetLoginModel();
            this.curUserInfo = await services.common.GetSelfUserModel();
            this.GroupInfo = await Group.FindItemFromGroupByGroupID(this.groupId);
            console.log("the init user id is ,", this.GroupInfo)
            confservice.init(this.curUserInfo.id);
            // this.$store.commit("setUserId", this.curUserInfo.id)
            console.log("lognInfo is ", this.loginInfo);
            
            this.updatePage();
        },
        MsgBelongUserName: function(curMsg) {
            // console.log(curMsg)
            // var userId = curMsg.fromId;
            // var distId = this.getUserNameId(curMsg);
            // console.log("distId is ", distId)
            // var distUserNameElement = document.getElementById(distId);
            // console.log("distusernameelememt ", distUserNameElement)
            
            // services.common.GetDistUserinfo(userId)
            //     .then((userInfos) => {
            //         var distUser = userInfos[0];
            //         var distUserName = distUser.user_display_name;
            //         distUserNameElement.innerHTML = distUserName;
            //     })
        },
        // Get formate message time
        MsgTime(curMsg) {
            if(curMsg === null) {
                return "";
            }
            var secondsTime = Number(curMsg.timestamp);
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let cutTime = curDateSecond - secondsTime;
            let curYeat = curDate.getFullYear();
            let curMonth = curDate.getMonth() + 1;
            let curDay = curDate.getDate();

            let distdate = new Date(secondsTime);
            let y = distdate.getFullYear();
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
                    return y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m);
                }
            }
            else
            {
                return y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m);
            }
        },
        isWindows() {
            return environment.os.isWindows;
        },
        generalIDThroughMsgId: function(curMsg) {
            return "HistoryMsg-msg-id-" + curMsg.sequence_id;
        },
        getFileIconThroughExt: function(ext) {
            var iconPath = getIconPath(ext);
            return iconPath;
        },
        MsgBelongUserImg: async function (curMsg) {
            // var distUserInfo = await services.common.GetDistUserinfo(item.message_from_id);
            // console.log("MsgBelongUserImg this.userInfo is ", this.userInfo)
            if(this.userInfo == undefined || this.userInfo == null) {
                return;
            }
            var userIconElementId = this.getUserIconId();
            this.userIconElement = document.getElementById(userIconElementId);
            if(this.userIconElement == undefined) {
                return;
            }
            // console.log("msgconent is ", strMsgContentToJson(item.message_content), "this.userInfo is ", this.userInfo);
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
                // ipcRenderer.send('download-image', [item.time_line_id, this.loginInfo.access_token, services.common.config.hostname, services.common.config.apiPort, targetPath, "T", false]);
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
        showGroupInfo: async function(chatGroupItem) {
            console.log("showGroupInfo groupinfo is ", this.GroupInfo)
            console.log("this.messageListShowo is ", this.messageListShow)
            if(this.GroupInfo.group_id == null || this.GroupInfo.group_id == undefined){
                return "";
            }
            var groupIcoElement = document.getElementById("HistoryMsgDlgHeaderImgId");
            this.GroupName = this.GroupInfo.group_name;
            if(this.GroupName.length == 0) {
                var aboutUids = this.GroupInfo.contain_user_ids.split(",");
                var groupUidNameList = [];
                for(var i=0;i<aboutUids.length;i++) {
                    let nameTmp = this.$store.getters.getChatUserName(aboutUids[i]);
                    groupUidNameList.unshift(nameTmp);
                    if(i > 3) {
                            break;
                        }
                }
                this.GroupName = groupUidNameList.join(",");
            }
            
            var targetPath = "";
            if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.GroupInfo.group_avarar, this.GroupInfo.group_id))){
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    groupIcoElement.setAttribute("src", reader.result);
                }
            }
            console.log("this.messageListShow ", this.messageListShow)
            for(let i=0;i<this.messageListShow.length;i++) {
                var curItem = this.messageListShow[i];
                var userId = curItem.fromId;
                var distUserImgElement = document.getElementById(this.getUserHeadImageId(curItem));
                var distUserNameElement = document.getElementById(this.getUserNameId(curItem));
                
                var userInfos = await services.common.GetDistUserinfo(userId)
                var distUser = userInfos[0];
                var sequenceId = curItem.sequenceId;
                var distUserName = distUser.user_display_name;
                distUserNameElement.innerHTML = distUserName;
                var distTAvatar = distUser.avatar_t_url;
                var targetPath = '';
                if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(distTAvatar, userId, '', sequenceId))){
                    console.log("cur it is ", curItem.sequenceId, "path ", targetPath)
                    distUserImgElement.setAttribute("src", targetPath);
                }
                else{
                    console.log("cur not exist  it is ", curItem.sequenceId, "path ", targetPath)
                }
                this.MsgContent(this.messageListShow[i]);
            }

        },
        updateUserImage(e, args) {
            console.log("updateUserImage ", args);
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var sequenceId = args[4];
            console.log("group info updateuserimage args ", args)

            if(sequenceId.length != 0 ) {
                var distElement = document.getElementById(this.getTransmitTogetherContentItemId(sequenceId));
            }
            if(distElement == undefined) {
                var distElement = document.getElementById(this.getTransmitTogetherContentItemId(id));
            }
            if(distElement != undefined) {
                distElement.setAttribute("src", localPath);
            }
        },
        search: function() {
            // console.log("this.searchKeylneth ", this.searchKey.length);
            if(this.searchKey.length == 0) {
                this.messageListShow = []
                this.messageListShow = this.originalMessageList;
                // console.log("this.messagelsitshow is ", this.messageListShow)
                this.showGroupInfo();
                this.showEmpty = true;
                return
            }
            var curSearchId = new Date().getTime();
            console.log("searchkey is ", this.searchKey);
            var searchResult = {
                "id": curSearchId,
                "searchList": []
            };
            this.searchId = curSearchId;
            services.common.SearchGroupMessage(this.GroupInfo.group_id, this.searchKey, 0)
                .then((ret) => {
                    console.log("search ret is ", ret);
                    if(ret.data != undefined) {
                        this.messageListShow = []
                        // this.messageListShow = this.originalMessageList;
                        // console.log("this.messagelsitshow is ", this.messageListShow)
                        this.showGroupInfo();
                        this.showEmpty = true;
                    }
                    else {
                        this.showEmpty = false;
                        for(let i=0;i<ret.length;i++) {
                            var curMessageContent = ret[i].content;
                            // console.log("var curmsgcontnet is ", curMessageContent);
                            if(curMessageContent.text != null && curMessageContent.text.indexOf(this.searchKey) != -1) {
                                searchResult.searchList.push(ret[i]);
                            }
                        }

                        if(searchResult.id == this.searchId) {
                            this.messageListShow = searchResult.searchList;
                            setTimeout(() => {
                                this.$nextTick(() => {
                                    this.showGroupInfo();
                                })
                            }, 500)
                        }
                    }
                })
        },
        msgContentHeightLight: function(curMsg) {
            var showContent = curMsg.content.text;
            // showContent = showContent + ' ';
            if(this.searchKey.length == 0) {
                return showContent
            }
            if(showContent.indexOf(this.searchKey) != -1) {
                let splitValue = showContent.split(this.searchKey);
                let newInnerHtml = splitValue.join('<span style="color:red;">' + this.searchKey + "</span>");
                return newInnerHtml;
            }
        },
        getMsgTime: function(curMsg) {
            var fileDate = this.MsgTime(curMsg);
            return fileDate;
        },
        getUserHeadImg: function(curMsg) {
            // var userId = curMsg.fromId;
            // var distUserImgElement = document.getElementById(this.getUserHeadImageId(curMsg));
            // console.log("distusernameelememt ", distUserImgElement)
            
            // services.common.GetDistUserinfo(userId)
            //     .then((userInfos) => {
            //         var distUser = userInfos[0];
            //         var distTAvatar = distUser.avatar_t_url;
            //         services.common.downloadUserTAvatar(distTAvatar, userId)
            //             .then((ret) => {
            //                 if(fs.existsSync(ret)) {
            //                     distUserImgElement.setAttribute("src", ret);
            //                 }
            //             })
            //     })
        },
        getHistoryMessage: function(groupInfo) {
            // console.log("gethistorymessage groupInfo is ", this.GroupInfo)
            // console.log("gethistorymessage groupInfo.group_id is ", this.GroupInfo.group_id)
            // console.log("gethistorymessage groupInfo.sequence_id is ", this.GroupInfo.sequence_id)
            services.common.GetTransmitMsgContent(this.timelineId, this.curUserInfo.id)
                .then((ret) => {
                    var messageListTmp = ret;
                    this.messageListShow = [];
                    this.originalMessageList = [];
                    console.log("this. is ", ret)
                    for(var i=0;i<messageListTmp.length;i++){
                        this.messageListShow.unshift(messageListTmp[i]);
                        this.originalMessageList.unshift(messageListTmp[i]);
                    }
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.showGroupInfo(this.GroupInfo);
                        })
                    })
                    // console.log("this.filelistshow is ", this.messageListShow);
                })
        },
        updatePage: async function() {
            console.log("filelist group info is ", this.groupId);
            await this.getHistoryMessage(this.GroupInfo);
            // if(this.searchKey.length == 0) {
            //     this.showEmpty = true;
            // }
            // else{
            //     this.showEmpty = false;
            // }
            this.$nextTick(() => {
                setTimeout(() => {
                    this.showGroupInfo(this.GroupInfo);
                })
            })
        }
    },
    components: {
        winHeaderBar,
    },
    created: async function () {
        await this.getAppBaseData();
    },
    mounted: function() {
        ipcRenderer.on("distGroupInfo", (event, groupId) => {
            console.log("groupid is ", groupId)
            this.groupId = groupId[1];
            this.timelineId = groupId[0];
        })
        ipcRenderer.on('updateUserImage', this.updateUserImage);
        ipcRenderer.on('updateMsgFile', this.updateMsgFile);
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar-track-piece {
        background-color: #F1F1F1;
        border-radius: 10px;
    }

    ::-webkit-scrollbar {
        width: 7px;
        height: 12px;
        display: none;
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
    
    .HistoryMsgDlg {
        width: 600px;
        height: 468px;
        background: rgba(255, 255, 255, 1);
        box-shadow:0px 0px 30px 0px rgba(103,103,103,0.24);
        border-radius:4px
    }

    .HistoryMsgDlgHeader {
        width: calc(100% - 64px);
        height: 52px;
        background: rgba(255, 255, 255, 1);
        padding-top: 20px;
        padding-left: 12px;
        -webkit-app-region: drag;
    }

    .HistoryMsgDlgHeaderImg {
        width: 32px;
        height: 32px;
        padding: 10px 12px 20px 10px;
        vertical-align: center;
        display: inline-block;
        -webkit-app-region: drag;
    }

    .HistoryMsgDlgHeaderTitle {
        width: calc(100% - 80px);
        height: 52px;
        line-height: 52px;
        display: inline-block;
        margin-left: 0px;
        vertical-align: top;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        -webkit-app-region: drag;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    * {
        
        -webkit-app-region: no-drag;
    }

    .HistoryMsgDlgContent {
        width: calc(100% - 40px);
        margin: 0 20px 0 20px;
    }

    .search {
        margin: 0;
        text-align: left;
        width: 100%;
        height: 32px;
        border: 1px solid rgb(221, 221, 221);
        border-radius: 2px;
    }

    .icon-search {
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin: 6px 10px 6px 10px;
        color: rgb(51, 51, 51);
    }
    
    .icon-search:hover {
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin: 6px 10px 6px 10px;
        color: rgb(255,204,102);
    }
    
    .HistoryMsgDlgSearchInput {
        display: inline-block;
        position: absolute;
        text-indent: 10px;
        width: 90%;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: 'Microsoft YaHei';
        font-size: 12px;
        color: rgba(153, 153, 153, 1);
        background-color: rgba(1, 1, 1, 0);
    }

    .HistoryMsgEmpty {
        width:100%;
        height: 320px;
        background-color: white;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;  
    }

    .HistoryMsgEmptyBg {
        width: 84px;
        height: 84px;
        background-color: white;
    }

    .HistoryMsgEmptyText {
        width:104px;
        height:18px;
        font-size:12px;
        font-family:"Microsoft YaHei";
        font-weight:400;
        color:rgba(153,153,153,1);
        line-height:18px;
        letter-spacing:1px;
    }

    .HistoryMsg-list {
        list-style: none;
        max-height: 350px;
        width: 100%;
        margin: 0;
        padding: 0;
        display: block;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .messageItem {
        width: 100%;
        padding: 0;
        margin: 20px 0 0 4px;
    }

    .messageItem:hover {
        width: 100%;
        padding: 0;
        background-color: rgba(221, 221, 221, 1);
    }
    
    .messageOwnerImage {
        display: inline-block;
        margin: 3px 0 0 4px;
        padding: 0px 0px 0px 0px;
        width: 40px;
        height: 40px;
    }

    .messageInfoDiv {
        display: inline-block;
        padding: 0px 20px 0px 0px;
        width: calc(100% - 72px);
        vertical-align: top;
    }

    .messageOwnerTimeDiv {
        display: block;
        width: 100%;
        line-height: 20px;
        font-size: 14px;
        font-family:Microsoft Yahei;
        font-weight: 590;
        vertical-align: top;
    }

    .messageInfoOwnerNameLabel {
        display: inline-block;
        color: rgba(153, 153, 153, 1);
        width: 70%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        font-family:Microsoft Yahei;
        float: left;
    }

    .messageInfoTimeLabel {
        display: inline-block;
        color: rgba(153, 153, 153, 1);
        width: 30%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        font-family:Microsoft Yahei;
        float: right;
    }

    .messageInfoDetailLabel {
        display: block;
        width: 100%;
        height: auto;
        font-size: 12px;
        font-family:Microsoft Yahei;
    }

    .chat-msg-content-others-txt-div {
        display: block;
        width: 100%;
        height: auto;
        margin: 0;
        padding: 0;
        font-size: 12px;
        font-family:Microsoft Yahei;
        vertical-align: top;
    }

    .chat-msg-content-others-txt{
        display: block;
        width: 100%;
        height: auto;
        font-size: 12px;
        font-family:Microsoft Yahei;
        margin: 0px;
    }

    .chat-msg-content-others-img {
        float: left;
        background-color: rgba(1,1,1,0);
        min-width: 104px;
        border-radius: 5px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
        display: block;
    }

    .chat-msg-content-others-file {
        float: left;
        background-color: rgba(247,248,250,1);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin-bottom: 5px;
        cursor: pointer;
        display: block;
    }

    .chat-msg-content-others-voice {
        float: left;
        background-color: rgba(247,248,250,1);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
        display: block;
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
        display: block;
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
        color: rgb(153, 153, 153);
        overflow: hidden;
        margin-left: 10px;
        margin-top: 3px;
        margin-right: 0px;
        margin-bottom: 4px;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

</style>
