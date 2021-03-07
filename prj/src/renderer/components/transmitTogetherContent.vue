<template>
    <div class="HistoryMsgDlg" id="HistoryMsgDlgId">
        <!-- <winHeaderBar :showMax="false" @Close="Close" @Min="Min"></winHeaderBar> -->
        <div class="HistoryMsgDlgHeader" v-show="false">
            <img class="HistoryMsgDlgHeaderImg" id="HistoryMsgDlgHeaderImgId">
            <div class="HistoryMsgDlgHeaderTitle">{{GroupName}}</div>
        </div>
        <div class="HistoryMsgDlgContent">
            <ul class="HistoryMsg-list">
                <li v-for="(item, index) in messageListShow" class="messageItem">
                    <img class="msg-info-user-img-with-name" :id="getUserIconId(item)" :src="getUserIconSrc(item)" onerror = "this.src = './static/Img/User/user-40px@2x.png'">
                    <div class="about-msg">
                        <div class="msg-owner-info">
                            <div class="msg-info-username-others" :id="msgNameId(item)"></div>
                            <div class="msg-info-time">{{MsgTime(item)}}</div>
                        </div>
                        <div class="chat-msg-content-others-img"
                            v-on:click="ShowFile(item)" v-if="MsgIsImage(item)">
                            <img class="msg-image" :id="item.event_id" :src="getMsgImgIcon(item)" alt="图片" :style="getImageStyle(item)">
                        </div>
                        <div class="chat-msg-content-others-file"
                            v-on:click="ShowFile(item)" v-else-if="MsgIsFile(item)">
                            <img class="file-image" :id="item.event_id" style="vertical-align:middle" :src="getMsgFileIcon(item)">
                            <div class="file-info">
                                <p class="file-name" :id="fileNameId(item)"></p>
                                <p class="file-size" :id="fileSizeId(item)"></p>
                                <progress class="others-file-progress" :id="processId(item.event_id)" max="100" color="#11b067" v-show="false" :show-text="false" :width="70"></progress>
                            </div>
                        </div>
                        <div class="chat-msg-content-others-voice"
                            v-on:click="ShowFile(item)" v-else-if="MsgIsVoice(item)">
                            <img class="voice-image" :id="item.event_id" style="vertical-align:middle">
                            <div class="voice-info" v-show="false">
                                <p class="file-size">{{this.voiceLenth}} ”</p>
                            </div>
                        </div>
                        <div class="chat-msg-content-other-transmit"
                            v-on:click="ShowFile(item)" v-else-if="MsgIsTransmit(item)">
                            <div class="transmit-title" :id="transmitTitleId(item)" style="vertical-align:middle"></div>
                            <div class="transmit-content" :id="transmitContentId(item)" style="vertical-align:middle"></div>
                        </div>
                        <div class="chat-msg-content-others-txt-div" 
                            v-on:click="ShowFile(item)" v-else>
                            <p v-if = "needHightLight(item)" class="chat-msg-content-others-txt" :id="item.event_id" v-html="getMsgOtherLinkContent(item)"></p>
                            <p v-else class="chat-msg-content-others-txt" :id="item.event_id">{{getMsgOtherLinkContent(item)}}</p>
                        </div>
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
import {strMsgContentToJson, FileUtil, getIconPath, Appendzero, sliceReturnsOfString, getFileSizeByNumber, getFileBlob} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import * as fs from 'fs-extra'
import * as path from 'path'
import {ipcRenderer, remote} from 'electron'
import winHeaderBar from './win-header.vue'
import confservice from '../../packages/data/conf_service.js'
import {shell} from 'electron'
import {ComponentUtil} from '../script/component-util.js'
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
            showProgress: false,
            messageContent: '',
            isDownloading: false,
            downloadingInterval: undefined,
        }
    },  
    methods: {
        processId(msg) {
            return msg + "-process";
        },
        transmitTitleId(msg) {
            return msg.event_id + "-transmitTitle";
        },
        transmitContentId(msg) {
            return msg.event_id + "-transmitContent";
        },
        fileNameId(msg) {
            return msg.event_id + "-fileName";
        },
        fileSizeId(msg) {
            return msg.event_id + "-fineSize";
        },
        needHightLight(msg){
            if(!msg || msg.length == 0) return false;
            let content = this.MsgContent(msg);
            if(content.search(ComponentUtil.hightLightReg) == -1) return false;
            return true;
        },
        msgContentShowPhoneAndHightLight: function(curMsg, color){
            let linkHight = curMsg.replace(ComponentUtil.hightLightReg, function(link){
                // return '<span style="color:' + color + ';">' + link + "</span>"
                return '<span class="msg-link-url" style="text-decoration: underline;cursor:pointer;color:' + color + ';" onclick="openUrl(\'' + link + '\');">' + link + '</span>'
            })
            return linkHight;
        },
        getMsgOtherLinkContent: function(item) {
            var content  = this.MsgContent(item);
            var dealContent = this.msgContentShowPhoneAndHightLight(content, '#5B6A91');
            return dealContent;
        },
        getMsgFileIcon: function(msg) {
            var content = msg;
            if(content.body != undefined) {
                let ext = path.extname(content.body);
                console.log("getmsgfileicon ext is ", ext);
                return this.getFileIconThroughExt(ext);
            }
        },
        getImageStyle: function(msg) {
            var chatGroupMsgContent = msg;
            let maxSize = 400;
            
            let showWidth = maxSize;
            let showHeight = maxSize;

            if(chatGroupMsgContent.info) {
                if(!chatGroupMsgContent.info.h)
                    chatGroupMsgContent.info.h = maxSize;
                if(!chatGroupMsgContent.info.w)
                    chatGroupMsgContent.info.w = maxSize;
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
        },
        getMsgImgIcon: function(msg) {
            return msg.url;
        },
        msgNameId: function(msg) {
            return msg.event_id + "-username";
        },
        getUserIconId: function(msg) {
            return msg.event_id + "-usericon"
        },
        getUserIconSrc: function(msg) {
            var userId = msg.sender;
            var avater = this.$store.getters.getAvater(userId);
            if(avater.length == 0) {
                return "../../../static/Img/User/user-40px@2x.png";
            }
            else {
                return avater;
            }
        },
        getTransmitTogetherContentItemId: function(distId) {
            return "transmit-together-content-item-" + distId;
        },
        MsgContent: function(item) {
            console.log("item is ", item);
            var messageContent = '';
            if(item === null) {
                return '';
            }

            if(item.msgtype == 'm.file'){
                let fineNameElement = document.getElementById(this.fileNameId(item));
                let fineSizeElement = document.getElementById(this.fileSizeId(item));
                if(fineNameElement) {
                    fineNameElement.innerHTML = item.body;
                }
                if(item.info)
                    fineSizeElement.innerHTML = getFileSizeByNumber(item.info.size);
            }
            else if(item.msgtype == 'm.text'){
                messageContent = item.body;
                if(this.messageContent.length == 0) {
                    this.messageContent = "\n";
                }
            }
            else if(item.msgtype == 'm.image'){
                let info = {
                };

                if(item.info)
                    info = item.info;
                    
                if(info.size)
                    this.fileSizeNum = getFileSizeByNumber(info.size);
                messageContent = item.body;
            }
            else if(item.msgtype == "each.chat.merge") {
                let transmitTitleElement = document.getElementById(this.transmitTitleId(item));
                let transmitContentElement = document.getElementById(this.transmitContentId(item));
                console.log("item ", item);
                let events = item.events;
                if(transmitTitleElement) {
                    transmitTitleElement.innerHTML = item.from_room_display_name;
                }
                if(transmitContentElement) {
                    transmitContentElement.innerHTML = this.getTransmitContent(events);
                }
            }
            else {
                messageContent = "无法识别的消息类型";
            }

            return messageContent;
        },
        getTransmitContent: function(events) {
            let contents = "";
            for(let i=0;i<events.length;i++) {
                var chatGroupMsgContent = events[i];
                var fromUserName = events[i].senderName;
                if(chatGroupMsgContent.msgtype == 'm.file'){
                    let content = fromUserName + ":[文件]";
                    contents = contents + content + "\n";
                }
                else if(chatGroupMsgContent.msgtype == 'm.text'){
                    let content = fromUserName + ":" + chatGroupMsgContent.body;
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
                    let content = fromUserName + ":[合并转发]";
                    contents = contents + content + "\n";
                }
                else {
                    let content = fromUserName + ":[无法识别的消息类型]";
                    contents = contents + content + "\n";
                }
            }
            console.log("getTransmitContent final contents is ", contents);
            return contents;
        },
        ProCallback: function(receivedLength, contentLength, collectionId) {
            var distElement = document.getElementById(this.processId(collectionId));
            distElement.value = parseInt(receivedLength*100/Number(contentLength));
            console.log("**** valud ", distElement.value);
            if(distElement.value == 100) {
                distElement.style.display = "none";
            }
        },
        ShowFile: async function(msg) {
            console.log("open image proxy ", msg)
            let event = msg;
            console.log("tmd sha wanyierer ", event.msgtype);
            if(msg.msgtype == 'm.file'){
                if(fs.existsSync(msg.exitPath)) {
                    shell.openPath(msg.exitPath);
                    return;
                }
                var distPath = confservice.getTempPath();
                var finalPath = path.join(distPath, msg.body);
                this.checkingTmpPath = finalPath + "_tmp";

                if(this.isDownloading) {
                    return;
                }
                this.isDownloading = true;
                var distElement = document.getElementById(this.processId(msg.event_id));
                distElement.style.display = "block";
                getFileBlob(msg.info, msg.url, this.ProCallback, msg.event_id)
                    .then((blob) => {
                        let reader = new FileReader();
                        reader.onload = function() {
                            if(reader.readyState == 2) {
                                var buffer = new Buffer(reader.result);
                                // ipcRenderer.send("save_file", path.join(distPath, content.body), buffer);
                                ipcRenderer.send("save_file", finalPath, buffer, msg.event_id, true);
                            }
                        }
                        reader.readAsArrayBuffer(blob);
                    })
            }
            else if(msg.msgtype == 'm.image'){
                // var distUrl = this.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url);
                // var imageInfo = {
                //     url: distUrl,
                //     info: chatGroupMsgContent.info
                // }
                this.showImageOfMessage(msg);
            }
            else if(msg.msgtype == "each.chat.merge") {
                var MsgList = msg.events;
                let showMsgList = await this.mergeDetails(MsgList);
                let showMsgInfo = {
                    title: msg.from_room_display_name,
                    list: showMsgList
                }
                console.log("=====to show showMsgList ", showMsgInfo);
                ipcRenderer.send("showTransTmpWindow", showMsgInfo, "TransmitMsgList");
            }
        },
        mergeDetails: async function(Events) {
            let getDetails = [];
            console.log("========== Events is ", Events);
            for(let i = 0; i < Events.length; i++) {
                let curEvent = Events[i];
                let curInfo = {};
                
                var userUrl = curEvent.senderUrl;
                
                if(curEvent.msgtype == "m.image") {
                    let maxSize = 390;
                    let info = {
                        w: maxSize,
                        h: maxSize
                    };
                    if(curEvent.info)
                        info = curEvent.info
                    if(!info.h)
                        info.h = maxSize;
                    if(!info.w)
                        info.w = maxSize;

                    curInfo = {
                        msgtype: "m.image",
                        url: curEvent.url,
                        event_id: curEvent.event_id,
                        info: info,
                        body: curEvent.body,
                        sender: curEvent.sender,
                        senderName: curEvent.senderName,
                        senderUrl: userUrl,
                        origin_server_ts: curEvent.origin_server_ts
                    }
                }
                else if(curEvent.msgtype == "m.text") {
                    curInfo = {
                        msgtype: "m.text",
                        event_id: curEvent.event_id,
                        body: curEvent.body,
                        sender: curEvent.sender,
                        senderName: curEvent.senderName,
                        senderUrl: userUrl,
                        origin_server_ts: curEvent.origin_server_ts
                    }
                }
                else if(curEvent.msgtype == "m.file") {
                    curInfo = {
                        exitPath: curEvent.exitPath,
                        msgtype: "m.file",
                        url: curEvent.url,
                        event_id: curEvent.event_id,
                        info: curEvent.info,
                        body: curEvent.body,
                        sender: curEvent.sender,
                        senderName: curEvent.senderName,
                        senderUrl: userUrl,
                        origin_server_ts: curEvent.origin_server_ts
                    }
                }
                else if(curEvent.msgtype == "each.chat.merge") {
                    let mergeEvents = curEvent.events;
                    let showMergeEvents = await this.mergeDetails(mergeEvents);
                    curInfo = {
                        msgtype: "each.chat.merge",
                        event_id: curEvent.event_id,
                        events: showMergeEvents,
                        from_room_display_name: curEvent.from_room_display_name,
                        body: curEvent.body,
                        sender: curEvent.sender,
                        senderName: curEvent.senderName,
                        senderUrl: userUrl,
                        origin_server_ts: curEvent.origin_server_ts
                    }
                }
                
                getDetails.push(curInfo);
            }
            return getDetails;
        },
        async showImageOfMessage(curEvent) {
            var showImageInfoList = [];
            var distImageInfo = {};
            
            if(curEvent.msgtype == "m.image") {
                let maxSize = 390;
                var curUrl = curEvent.url;
    
                let info = {
                    w: maxSize,
                    h: maxSize
                };
                console.log("*** image info is ", curEvent.info);
                if(curEvent.info)
                    info = curEvent.info
                if(!info.h)
                    info.h = maxSize;
                if(!info.w)
                    info.w = maxSize;

                var curImageInfo = {
                    imageUrl: curUrl,
                    url: curEvent.url,
                    imageEventId: curEvent.event_id,
                    info: info,
                    body: curEvent.body,
                    sender: curEvent.sender,
                    origin_server_ts: curEvent.origin_server_ts
                }
                
                distImageInfo = {
                    imageUrl: curUrl,
                    url: curEvent.url,
                    imageEventId: curEvent.event_id,
                    info: info,
                    body: curEvent.body,
                    sender: curEvent.sender,
                    origin_server_ts: curEvent.origin_server_ts
                }
                
                showImageInfoList.unshift(curImageInfo);
            }
            
            ipcRenderer.send('showImageViewWindow', showImageInfoList, distImageInfo);
        },
        MsgIsImage: function(msg) {
            let msgContent = msg.content;
            let chatGroupMsgType = msg.msgtype;
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
        MsgIsFile: function(msg) {
            let msgContent = msg.content;
            let chatGroupMsgType = msg.msgtype;
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
        MsgIsVoice: function(item) {
            return false;
        },
        MsgIsTransmit: function(msg) {
            let msgContent = msg.content;
            let chatGroupMsgType = msg.msgtype;
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
        getAppBaseData:async function() {
            this.updatePage();
        },
        // Get formate message time
        MsgTime(curMsg) {
            if(curMsg === null) {
                return "";
            }
            var secondsTime = curMsg.origin_server_ts;
            return ComponentUtil.formatTimeFilter(secondsTime);
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
        showGroupInfo: async function() {
            console.log("this.messageListShowo is ", this.messageListShow)
            
            // curInfo = {
            //     msgtype: "m.image",
            //     url: chatGroupMsgContent.url,
            //     event_id: event.event_id,
            //     info: info,
            //     body: chatGroupMsgContent.body,
            //     sender: curEvent.sender ? curEvent.sender.userId : curEvent.event.sender,
            //     origin_server_ts: curEvent.event.origin_server_ts
            // }

            // curInfo = {
            //     msgtype: "m.text",
            //     event_id: event.event_id,
            //     body: chatGroupMsgContent.body,
            //     sender: curEvent.sender ? curEvent.sender.userId : curEvent.event.sender,
            //     origin_server_ts: curEvent.event.origin_server_ts
            // }
            
            // curInfo = {
            //     msgtype: "m.file",
            //     url: chatGroupMsgContent.url,
            //     event_id: event.event_id,
            //     info: chatGroupMsgContent.info,
            //     body: chatGroupMsgContent.body,
            //     sender: curEvent.sender ? curEvent.sender.userId : curEvent.event.sender,
            //     origin_server_ts: curEvent.event.origin_server_ts
            // }

            // curInfo = {
            //     msgtype: "each.chat.merge",
            //     event_id: event.event_id,
            //     events: showMergeEvents,
            //     body: chatGroupMsgContent.body,
            //     sender: curEvent.sender ? curEvent.sender.userId : curEvent.event.sender,
            //     origin_server_ts: curEvent.event.origin_server_ts
            // }
            
            for(let i=0;i<this.messageListShow.length;i++) {
                var curItem = this.messageListShow[i];
                var userIconElementId = this.getUserIconId(curItem);
                var userIconElement = document.getElementById(userIconElementId);

                var userNameElementId = this.msgNameId(curItem);
                var userNameElement = document.getElementById(userNameElementId);

                var fromUserName = curItem.senderName;

                if(userNameElement != undefined) {
                    userNameElement.innerHTML = fromUserName;
                }
                
                if(userIconElement == undefined) {
                    return;
                }
                userIconElement.setAttribute("src", curItem.senderUrl);

                this.MsgContent(this.messageListShow[i]);
            }

        },
        openUrl: function(url) {
            if(url.indexOf("https://") < 0 && url.indexOf("http://") < 0) {
                url = "https://" + url;
            }
            shell.openExternal(url);
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
        updatePage: async function() {
            this.$nextTick(() => {
                setTimeout(() => {
                    this.showGroupInfo();
                })
            })
        }
    },
    components: {
        winHeaderBar,
    },
    mounted: function() {
        ipcRenderer.on("msgListInfo", (event, msgListInfo) => {
            this.messageListShow = [];
            setTimeout(() => {
                this.$nextTick(() => {
                    console.log("groupid is ", msgListInfo)
                    this.messageListShow = msgListInfo;
                    this.getAppBaseData();
                })
            }, 0)
        })
        window.openUrl=this.openUrl;
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
    
    /* 表示总长度背景色 */
    progress::-webkit-progress-bar {
        background-color: rgba(210, 215, 222, 1);
    }

    /* 表示已完成进度背景色 */
    progress::-webkit-progress-value {
        background: rgba(36, 179, 107, 1)
    }

    .HistoryMsgDlg {
        width: 600px;
        height: 468px;
        background: rgba(255, 255, 255, 1);
        border-radius:4px;
        overflow:hidden;
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
        height: 450px;
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
        font-weight:400;
        color:rgba(153,153,153,1);
        line-height:18px;
        letter-spacing: 0px;
    }

    .HistoryMsg-list {
        list-style: none;
        max-height: 450px;
        width: 100%;
        margin: 5px 0 0 0;
        padding: 0;
        display: block;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .messageItem {
        width: 100%;
        padding: 15px 0 15px 0px;
        border-bottom: 1px solid #EEEEEE;
    }

    .messageItem:hover {
        width: 100%;
        padding: 15px 0 15px 0px;
        border-bottom: 1px solid #EEEEEE;
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
        float: left;
    }

    .messageInfoTimeLabel {
        display: inline-block;
        color: rgba(153, 153, 153, 1);
        width: 30%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        float: right;
    }

    .messageInfoDetailLabel {
        display: block;
        width: 100%;
        height: auto;
        font-size: 12px;
    }

    .chat-msg-content-others-txt-div {
        display: block;
        width: 100%;
        height: auto;
        margin: 0;
        padding: 0;
        font-size: 12px;
        vertical-align: top;
    }

    .chat-msg-content-others-txt{
        display: block;
        width: 100%;
        height: auto;
        font-size: 12px;
        margin: 0px;
    }

    .chat-msg-content-others-img {
        float: left;
        background-color: rgba(1,1,1,0);
        min-width: 104px;
        border-radius: 5px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
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
        text-align: left;
        margin: 0px;
        cursor: pointer;
        display: block;
    }

    .chat-msg-content-others-file {
        float: left;
        background-color: rgba(243, 244, 247, 1);
        max-width: 260px;
        min-width: 20px;
        height: 40px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        text-align: left;
        margin-bottom: 5px;
        cursor: pointer;
        display: block;
    }

    .chat-msg-content-others-file:hover {
        float: left;
        background-color: rgba(233, 234, 235, 1);
        max-width: 260px;
        min-width: 20px;
        height: 40px;
        border-radius: 5px;
        padding: 10px 12px 10px 12px;
        font-size: 14px;
        text-align: left;
        margin-bottom: 5px;
        cursor: pointer;
        display: block;
    }

    .file-image {
        height: 40px;
        display: inline-block;
    }
    
    .voice-image {
        height: 16px;
        display: inline-block;
    }
    
    .file-info {
        min-height: 40px;
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
        margin-top: 1px;
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

    .about-msg {
        display: inline-block;
        margin: 2px 10px 2px 10px;
        width: calc(100% - 60px);
        vertical-align: top;
    }

    .msg-owner-info {
        display: block;
        min-height: 17px;
        font-size: 12px;
        color: rgb(153, 153, 153);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        -webkit-user-select:none;
    }

    .msg-info-username-others {
        display: inline-block;
        min-height: 17px;
        font-size: 12px;
        color: rgb(153, 153, 153);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        -webkit-user-select:none;
    }

    .msg-info-time {
        display: inline-block;
        min-height: 17px;
        font-size: 12px;
        color: rgb(153, 153, 153);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        float: right;
        -webkit-user-select:none;
    }
    
    .msg-image {
        height: 400px;
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

    .chat-msg-content-other-transmit {
        float:left;
        background-color: rgba(243, 244, 247, 1);
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
        background-color: rgba(243, 244, 247, 1);
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
        background-color: rgba(243, 244, 247, 1);
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
</style>
