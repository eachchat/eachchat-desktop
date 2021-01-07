<template>
    <div class="MxFileListDlg" id="MxFileListDlgId">
        <div class="MxFileListDlgContent" id="MxFileListDlgContentId">
            <div class="MxTitle">
                <img class="MxTitleGoBackImg" src="../../../static/Img/Main/WinClose-20px@2x.png" @click="Close()" />
                <div class="MxTitleGoBackLabel">返回聊天</div>
            </div>
            <div class="MxGroupInfo">
                <img class="MxGroupInfoImg" id="MxMsgListGroupInfoImgId" src="../../../static/Img/User/group-40px@2x.png">
                <label class="MxGroupInfoName" id="MxMsgListGroupInfoNameId">{{GroupInfo ? GroupInfo.name : ''}}</label>
                <label class="MxGroupInfoMemberNum" id="MxMsgListGroupInfoMemberNumId"></label>
            </div>
            <div class="Mxsearch">
                <input class="MxFileListDlgSearchInput" id="MxFileListDlgSearchInputId" placeholder="搜索..." v-model="searchKey" @input="search" @keyup.enter="search">
                <img class="Mxicon-search" src="../../../static/Img/Chat/search-20px@2x.png" @click="search">
            </div>
            <ul class="Mxfile-list" id="Mxfile-list-id" v-viewer="options">
                <li v-for="(item, index) in fileListShow" class="MxfileItem" @click="openFile(item)">
                    <img :class="MxgetClassName(item)" :id="getFileIconId(item)" :src="getIcon(item)">
                    <div class="MxfileInfoDiv">
                        <label class="MxfileInfoNameLabel" v-html="fileNameHeightLight(item)"></label>
                        <label class="MxfileInfoDetailLabel" :id="getFileLabelId(item)"></label>
                    </div>
                </li>
            </ul>
            <div class="MxFileListEmpty" v-show="searchEmpty">
                <div class="MxFileListEmptyText">暂无结果</div>
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil, getIconPath, Appendzero, JsonMsgContentToString, getFileSizeByNumber, getFileBlob} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import * as fs from 'fs-extra'
import * as path from 'path'
import {ipcRenderer} from 'electron'
import confservice from '../../packages/data/conf_service.js'
import {shell} from 'electron'
import { Group } from '../../packages/data/sqliteutil.js'
import {Filter} from 'matrix-js-sdk';
import * as Matrix from 'matrix-js-sdk';
import { Message } from '../../packages/data/sqliteutil.js'
import BenzAMRRecorder from 'benz-amr-recorder'
import {ComponentUtil} from '../script/component-util'
export default {
    name: 'MxFileListDlg',
    data () {
        return {
            amr: null,
            options: {
                filter (image) {
                    console.log("==========image className is ", image.className)
                    if(image.className == "MxfileImageImage") {
                        return image;
                    }
                }
            },
            isRefreshing: false,
            GroupName: '',
            fileListShow: [],
            searchKey: '',
            GroupInfo: null,
            fileListInfo: [],
            existingMsgId: [],
            groupId: '',
            operatedItem: null,
            operateMenuElement: null,
            showFileListOperateMenu: false,
            needDownload: false,
            originalFileList: [],
            lastSequenceId: 0,
            searchEmpty: false,
        }
    }, 
    methods: {
        MxgetClassName: function(curItem) {
            var content = curItem.getContent();
            if(content.body != undefined) {
                if(content.msgtype == 'm.file'){
                    return "MxfileImageFile"
                }
                else if(content.msgtype == "m.image") {
                    return "MxfileImageImage"
                }
            }
            return "MxfileImage"
        },
        async getFileExist(curItem) {
            let msgs = await Message.FindMessageByMesssageID(curItem.event.event_id);
            console.log(msgs)
            if(msgs.length != 0 && msgs[0].file_local_path != "")
                return msgs[0].file_local_path;
            return '';
        },
        openFile: async function(curItem) {
            console.log("*** ")
            var chatGroupMsgContent = curItem.getContent();
            if(chatGroupMsgContent.msgtype == 'm.file'){
                var distPath = confservice.getFilePath(curItem.event.origin_server_ts);
                var finalPath = path.join(distPath, chatGroupMsgContent.body);
                var existLocalFile = await this.getFileExist(curItem);
                
                if(!fs.existsSync(existLocalFile)) {
                    getFileBlob(chatGroupMsgContent.info, global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url))
                        .then((blob) => {
                            let reader = new FileReader();
                            reader.onload = function() {
                                if(reader.readyState == 2) {
                                    var buffer = new Buffer(reader.result);
                                    var finalPath = path.join(distPath, chatGroupMsgContent.body);
                                    // ipcRenderer.send("save_file", path.join(distPath, content.body), buffer);
                                    ipcRenderer.send("save_file", finalPath, buffer, event.event_id, true);
                                }
                            }
                            reader.readAsArrayBuffer(blob);
                        })
                }
                else {
                    shell.openPath(existLocalFile);
                }
            }
            else if(chatGroupMsgContent.msgtype == "m.audio") {
                console.log("audio ================= ")
                this.playingAudioId = curItem.event.event_id;
                var distPath = confservice.getFilePath(curItem.event.origin_server_ts);
                var finalPath = path.join(distPath, chatGroupMsgContent.body);
                var existLocalFile = await this.getFileExist(curItem);
                this.checkingTmpPath = finalPath + "_tmp";
                if(!fs.existsSync(existLocalFile)) {
                    getFileBlob(chatGroupMsgContent.info, global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url), this.ProCallback)
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
                            }
                            else {
                                this.amr.initWithUrl(URL.createObjectURL(blob)).then(() => {
                                    this.amr.play();
                                })
                            }
                        })
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
                    }
                    else {
                        var showfu = new FileUtil(existLocalFile);
                        let showfileObj = showfu.GetUploadfileobj();
                        this.amr.initWithUrl(URL.createObjectURL(showfileObj)).then(() => {
                            this.amr.play();
                        })
                    }
                }
            }
            // if(chatGroupMsgContent.msgtype == 'm.image'){
            //     var distUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url);
            //     var imageInfo = {
            //         url: distUrl,
            //         info: chatGroupMsgContent.info
            //     }
            //     this.$emit('showImageOfMessage', imageInfo);
            // }
        },
        Close: function() {
            this.fileListInfo = [];
            this.updatePage();
            this.$emit("fileListClose");
        },
        MsgBelongUserName: async function(curItem) {
            if(curItem === null) {
                return '';
            }
            else {
                var sender = this.GroupInfo.getMember(curItem.getSender());
                if(sender == null) {
                    return '';
                }
                var distUserName = await ComponentUtil.GetDisplayNameByMatrixID(sender.userId);;
                return distUserName;
            }
        },
        // Get formate message time
        MsgTime(curItem) {
            if(curItem === null) {
                return "";
            }
            var secondsTime = curItem.event.origin_server_ts;
            let distdate = new Date(secondsTime);
            let y = distdate.getFullYear();
            let mon = distdate.getMonth() + 1;
            let d = distdate.getDate();
            let h = distdate.getHours();
            let m = distdate.getMinutes();
            let s = distdate.getSeconds();

            return y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m);
        },
        isWindows() {
            return environment.os.isWindows;
        },
        getFileIconThroughExt: function(ext) {
            var iconPath = getIconPath(ext);
            return iconPath;
        },
        showResultInfo: async function() {
            this.$nextTick(() => {
                setTimeout(async () => {
                    for(var i=0;i<this.fileListShow.length;i++) {
                        var elementLabelId = this.getFileLabelId(this.fileListShow[i]);
                        var elementLabel = document.getElementById(elementLabelId);
                        if(elementLabel != undefined) {
                            var showInfo = await this.getFileInfo(this.fileListShow[i]);
                            elementLabel.innerHTML = showInfo;
                        }
                    }
                }, 0)
            })
        },
        mxGetMembers: function() {
            var userId = global.mxMatrixClientPeg.matrixClient.getUserId();
            const roomId = this.groupId;
            const cli = window.mxMatrixClientPeg.matrixClient;
            const xie1 = cli.getRoom(roomId);
            const xie2 = cli.getRoomPushRule("global", roomId);
            const mxMembers = [];
            for(let key in xie1.currentState.members) {
                // let isAdmin = xie1.currentState.members[key].powerLevel == 100; 
                let obj = {...xie1.currentState.members[key], choosen:false}
                if (obj.membership != 'leave') mxMembers.push(obj);
            }
            // console.log('mxMembers', mxMembers);
            // console.log('----mxMembers[userId]----', userId)
            
            return mxMembers.length;
        },
        showGroupInfo: async function() {
            // console.log("showGroupInfo groupinfo is ", this.GroupInfo)
            if(this.GroupInfo.roomId == undefined){
                return "";
            }
            var groupContentNumElement = document.getElementById("MxMsgListGroupInfoMemberNumId");
            if(groupContentNumElement) {
                var totalMemberCount = this.mxGetMembers();
                if(totalMemberCount > 2) {
                    groupContentNumElement.innerHTML = "(" + totalMemberCount + ")";
                }
                else {
                    groupContentNumElement.innerHTML = "";
                }
            }
            var groupImgElement = document.getElementById("MxMsgListGroupInfoImgId");
            if(groupImgElement) {
                var distUrl = global.mxMatrixClientPeg.getRoomAvatar(this.GroupInfo);
                if(!distUrl || distUrl == '') {
                    if(global.mxMatrixClientPeg.DMCheck(this.GroupInfo))
                        distUrl = "./static/Img/User/user-40px@2x.png";
                    else
                        distUrl = "./static/Img/User/group-40px@2x.png";
                    groupImgElement.setAttribute("src", distUrl); 
                }
                if(distUrl) {
                    groupImgElement.setAttribute("src", distUrl);
                }
            }
            var groupNameElement = document.getElementById("MxMsgListGroupInfoNameId");
            if(global.mxMatrixClientPeg.DMCheck(this.GroupInfo)) {
                var distUserId = global.mxMatrixClientPeg.getDMMemberId(this.GroupInfo);
                if(!distUserId) {
                    groupNameElement.innerHTML = this.GroupInfo.name;
                    return;
                }
                var displayName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
                groupNameElement.innerHTML = displayName;
            }
            else {
                groupNameElement.innerHTML = this.GroupInfo.name;
            }
        },
        fileNameHeightLight: function(curItem) {
            var showContent = curItem.getContent();
            var fileName = showContent.body;
            // showContent = showContent + ' ';
            if(this.searchKey.length == 0) {
                return fileName
            }
            if(fileName.indexOf(this.searchKey) != -1) {
                let splitValue = fileName.split(this.searchKey);
                let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
                return newInnerHtml;
            }
        },
        search: function() {
            if(this.searchKey.length == 0) {
                this.fileListShow = this.originalFileList;
                this.showResultInfo();
            }
            var curSearchId = new Date().getTime();
            console.log("searchkey is ", this.searchKey);
            var searchResult = {
                "id": curSearchId,
                "searchList": []
            };
            this.searchId = curSearchId;
            for(let i=0;i<this.originalFileList.length;i++) {
                var curFileName = this.getFileName(this.originalFileList[i]);
                if(curFileName.indexOf(this.searchKey) != -1) {
                    searchResult.searchList.push(this.originalFileList[i]);
                }
            }

            if(searchResult.id == this.searchId) {
                this.fileListShow = searchResult.searchList;
                this.showResultInfo();
            }
        },
        getFileName: function(curItem) {
            var showContent = curItem.getContent();
            var fileName = showContent.body;
            return fileName;
        },
        getFileInfo: async function(curItem) {
            var MsgContent = curItem.getContent().info;
            var fileSize = getFileSizeByNumber(MsgContent.size);
            var fileDate = this.MsgTime(curItem);
            var fileFromUserName = await this.MsgBelongUserName(curItem);
            return fileSize + " " + fileFromUserName + " " + fileDate;
        },
        getIcon: function(curItem) {
            var content = curItem.getContent();
            if(content.body != undefined) {
                if(content.msgtype == 'm.file'){
                    let ext = path.extname(content.body);
                    // console.log("getmsgfileicon ext is ", ext);
                    return this.getFileIconThroughExt(ext);
                }
                else if(content.msgtype == "m.image") {
                    let iconPath = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(content.url);
                    return iconPath;
                }
                else if(content.msgtype == "m.audio") {
                    let iconPath = "../../../static/Img/Chat/msg-voice@2x.png";
                    return iconPath;
                }
            }
        },
        getFileIconId: function(curItem) {
            return "MxfileListItem-" + curItem.event.event_id;
        },
        getFileLabelId: function(curItem) {
            return "MxfileLabel-" + curItem.event.event_id;
        },
        getFileList: function() {
            this.fileListShow = [];
            this.originalFileList = [];
            for(var i=0;i<this.fileListInfo.length;i++){
                this.fileListShow.unshift(this.fileListInfo[i]);
                this.originalFileList.unshift(this.fileListInfo[i]);
            }
        },
        updatePage: function() {
            console.log("filelist group info is ", this.fileListInfo);
            this.getFileList();
            this.showResultInfo(this.GroupInfo);
        },
        getAppBaseData:async function() {
            // Set accessToken in services
            console.log("global is ", global.mxMatrixClientPeg)
            this.GroupInfo = global.mxMatrixClientPeg.matrixClient.getRoom(this.groupId);
            console.log("the init user id is ,", this.GroupInfo)
            confservice.init(global.mxMatrixClientPeg.matrixClient.getUserId());
            this.showGroupInfo();
            // this.$store.commit("setUserId", this.curUserInfo.id)
            global.mxMatrixClientPeg.matrixClient.on("Room.timeline", this.onRoomTimeline);
            this.timeLineSet = await this.updateTimelineSet(this.groupId);
            this._loadTimeline(undefined, undefined, undefined)
                .then((ret) => {
                    this.fileListInfo = this._timelineWindow.getEvents();
                    if(this.fileListInfo.length == 0) {
                        this.searchEmpty = true;
                    }
                    else {
                        this.searchEmpty = false;
                    }
                    this.updatePage();
                    setTimeout(() => {
                        this.$nextTick(() => {
                            var div = document.getElementById("Mxfile-list-id");
                            div.addEventListener('scroll', this.handleScroll);
                            this.handleScroll(true);
                        })
                    }, 0)
                })
        },
        handleScroll: function(force=false) {
            let uldiv = document.getElementById("Mxfile-list-id");
            let client = document.getElementById("MxFileListDlgContentId");
            // console.log("=====client.clientHeight is ", client.clientHeight);
            // console.log("=====uldiv.scrollHeight - uldiv.scrollTop is ", uldiv.scrollHeight - uldiv.scrollTop);
            // console.log("=====uldiv.scrollHeight is ", uldiv.scrollHeight);
            // console.log("=====uldiv.scrollTop is ", uldiv.scrollTop);
            // console.log("=====isRefreshing is ", this.isRefreshing);
            if(uldiv) {
                if((uldiv.scrollHeight - uldiv.scrollTop < client.clientHeight && !this.isRefreshing) || force==true) {
                    console.log("=======wo bottom");
                    this.isRefreshing = true;
                    var canForwardPaginate = this._timelineWindow.canPaginate("f");
                    if(!canForwardPaginate && !(force==true)) {
                        this.isRefreshing = false;
                        return;
                    }
                    this.lastScrollHeight = uldiv.scrollHeight;
                    this.lastRefreshTime = new Date().getTime();
                    // let latestSequenceIdAndCount = this.getLatestMessageSequenceIdAndCount();
                    this._timelineWindow.paginate("b", 20)
                        .then((ret) => {
                            if(ret == false) {
                                return;
                            }
                            console.log("f scroll ret is ", ret);
                            this.isRefreshing = false;
                            this.fileListInfo = this._timelineWindow.getEvents();
                            this.$nextTick(() => {
                                console.log("---------update croll top is ", uldiv.scrollHeight);
                                // uldiv.scrollTop = uldiv.scrollHeight - this.lastScrollHeight - 30;
                            })
                            if(this.fileListInfo.length == 0) {
                                this.handleScroll(true);
                            }
                        })
                }
            }
        },
        _loadTimeline: function(eventId, pixelOffset, offsetBase) {
            this._timelineWindow = new Matrix.TimelineWindow(
                global.mxMatrixClientPeg.matrixClient, 
                this.timeLineSet,
                {windowLimit:Number.MAX_VALUE},
            )
            return this._timelineWindow.load(eventId, 20);
        },
        onRoomTimeline(ev, room, toStartOfTimeline, removed, data) {
            if (data.timeline.getTimelineSet() !== this.timeLineSet) return;

            this._timelineWindow.paginate("f", 1, false)
            this.getHistoryMessage(ev);
        },
        getHistoryMessage: function(ev) {
            console.log("========== get history ev is ", ev);
            if(this.existingMsgId.indexOf(ev.event.event_id) < 0) {
                this.existingMsgId.push(ev.event.event_id);
            }
            else {
                return;
            }
            this.fileListInfo.unshift(ev);
            this.updatePage();
        },
        async updateTimelineSet(roomId) {
            const client = global.mxMatrixClientPeg.matrixClient;
            const room = client.getRoom(roomId);

            this.noRoom = !room;

            if (room) {
                let timelineSet;

                try {
                    timelineSet = await this.fetchFileEventsServer(room);
                } catch (error) {
                    console.error("Failed to get or create file panel filter", error);
                }
                return timelineSet;
            } else {
                console.error("Failed to add filtered timelineSet for FilePanel as no room!");
            }
        },
        async fetchFileEventsServer(room) {
            const client = global.mxMatrixClientPeg.matrixClient;

            const filter = new Filter(client.credentials.userId);
            filter.setDefinition(
                {
                    "room": {
                        "timeline": {
                            "contains_url": true,
                            "types": [
                                "m.room.message",
                            ],
                        },
                    },
                },
            );

            const filterId = await client.getOrCreateFilter("FILTER_FILES_" + client.credentials.userId, filter);
            filter.filterId = filterId;
            const timelineSet = room.getOrCreateFilteredTimelineSet(filter);

            return timelineSet;
        },
    },
    props: {
        distRoomId: {
            type: String,
            default: ''
        }
    },
    watch: {
        distRoomId: async function() {
            this.existingMsgId = [];
            this.fileListInfo = [];
            if(this.distRoomId == "") {
                this.searchKey = "";
                this.fileListShow = [];
                this.originalFileList = [];
                return;
            }
            this.groupId = this.distRoomId;
            await this.getAppBaseData();
            this.$nextTick(() => {
                var searchInput = document.getElementById("MxFileListDlgSearchInputId");
                searchInput.focus();
            })
        }
    },
    mounted: function() {
        // ipcRenderer.on('updateMsgFile', this.updateMsgFile);
        ipcRenderer.on("distGroupInfo", (event, groupId) => {
            this.groupId = groupId;
            this.lastSequenceId = 0;
        })
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
    
    .MxFileListDlg {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 1);
    }

    .MxFileListDlgContent {
        width: calc(100% - 40px);
        height: 100%;
        margin: 0 20px 0 20px;
    }

    .MxTitle {
        margin: 0;
        height: 36px;
        width: 100%;
    }

    .MxTitleGoBackImg {
        display: inline-block;
        margin: 0px 6px 16px 0px;
        width: 20px;
        height: 20px;
    }

    .MxTitleGoBackLabel {
        display: inline-block;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-weight: 500;
        font-family: PingFangSC-Medium;
        vertical-align: top;
        color: rgba(0, 0, 0, 1);
    }

    .MxGroupInfo {
        height: 60px;
        width: 100%;
        margin: 0;
    }

    .MxGroupInfoImg {
        margin:12px 12px 12px 2px;
        height: 32px;
        width: 32px;
        float: left;
        border: 0px solid rgba(0, 0, 0, 0);
        border-radius: 50%;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .MxGroupInfoName {
        height: 56px;
        max-width: 150px;
        line-height: 56px;
        margin:0px 0px 0px 0px;
        float: left;
        font-size: 14px;
        font-family: PingFangSC-Regular;;
        font-weight: 400;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        letter-spacing:1px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .MxGroupInfoMemberNum {
        height: 56px;
        max-width: 150px;
        line-height: 56px;
        margin:0px 0px 0px 0px;
        float: left;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        font-weight: 500;
        overflow: hidden;
        letter-spacing:1px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .Mxsearch {
        margin: 0, 0, 3px 0;
        text-align: left;
        width: 100%;
        height: 32px;
        border: 1px solid rgb(221, 221, 221);
        border-radius: 2px;
        display: inline-block;
    }

    .Mxicon-search {
        display: inline-block;
        float: left;
        height: 20px;
        line-height: 20px;
        margin: 6px 10px 6px 10px;
        color: rgb(51, 51, 51);
    }
    
    .Mxicon-search:hover {
        display: inline-block;
        float: left;
        height: 20px;
        line-height: 20px;
        margin: 6px 10px 6px 10px;
        color: rgb(255,204,102);
    }
    
    .MxFileListDlgSearchInput {
        display: inline-block;
        position: absolute;
        text-indent: 10px;
        width: 86%;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        text-indent:38px;
        border: 0px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        font-size: 12px;
        color:rgba(153, 153, 153, 1);
        background-color: rgba(1, 1, 1, 0);
    }

    .MxFileListEmpty {
        width:100%;
        height: 390px;
        background-color: white;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;  
    }

    .MxFileListEmptyText {
        width:104px;
        height:18px;
        font-size:12px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(153,153,153,1);
        line-height:18px;
        text-align: center;
        letter-spacing:1px;
    }

    .Mxfile-list {
        width: 100%;
        max-height: calc(100% - 135px);
        margin: 0;
        padding: 0;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .Mxfile-list:hover {
        width: 100%;
        max-height: calc(100% - 135px);
        margin: 0;
        padding: 0;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
        cursor: pointer;
    }

    .MxfileItem {
        width: 100%;
        height: 64px;
        padding: 0;    
    }

    .MxfileItem:hover {
        width: 100%;
        height: 64px;
        padding: 0;
        background-color: rgba(221, 221, 221, 1);
    }
    
    .MxfileOperate {
        width: 24px;
        height: 24px;
        padding: 20px 8px 20px 8px;
    }

    .MxfileOperate:hover {
        width: 24px;
        height: 24px;
        padding: 20px 8px 20px 8px;
        background-color: rgba(221, 221, 221, 1);
    }

    .MxfileImage {
        display: inline-block;
        margin: 0 0 0 4px;
        padding: 12px 0px 12px 0px;
        width: 40px;
        height: 40px;
    }

    .MxfileImageFile {
        display: inline-block;
        margin: 0 0 0 4px;
        padding: 12px 0px 12px 0px;
        width: 40px;
        height: 40px;
    }

    .MxfileImageImage {
        display: inline-block;
        margin: 0 0 0 4px;
        padding: 12px 0px 12px 0px;
        width: 40px;
        height: 40px;
    }

    .MxfileInfoDiv {
        display: inline-block;
        padding: 12px 0px 12px 4px;
        width: calc(100% - 100px);
        height: 40px;
        vertical-align: top;
    }

    .MxfileInfoNameLabel {
        display: block;
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 1px;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .MxfileInfoDetailLabel {
        display: block;
        width: 100%;
        height: 18px;
        line-height: 18px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        color: rgba(153, 153, 153, 1);
    }

</style>
