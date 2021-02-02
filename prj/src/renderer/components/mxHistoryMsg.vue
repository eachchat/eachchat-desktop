<template>
    <div class="MxHistoryMsgDlg" id="MxHistoryMsgDlgId">
        <div class="MxHistoryMsgDlgContent" id="MxHistoryMsgDlgContentId">
            <div class="MxTitle">
                <img class="MxTitleGoBackImg" src="../../../static/Img/MessageHistory/goback@2x.png" @click="Close()" />
                <div class="MxTitleGoBackLabel">{{curChatName}}</div>
            </div>
            <div class="MxGroupInfo">
                <img class="MxGroupInfoImg" id="MxHistoryMsgGroupInfoImgId" src="../../../static/Img/User/group-40px@2x.png" v-show="false">
                <label class="MxGroupInfoName" id="MxHistoryMsgGroupInfoNameId" v-show="false">{{GroupInfo ? GroupInfo.name : ''}}</label>
                <label class="MxGroupInfoMemberNum" id="MxHistoryMsgGroupInfoMemberNumId" v-show="false"></label>
            </div>
            <div class="Mxsearch">
                <input class="MxHistoryMsgDlgSearchInput" id="MxHistoryMsgDlgSearchInputId" placeholder="搜索" v-model="searchKey" @input="search" @keyup.enter="search">
                <img class="Mxicon-search" src="../../../static/Img/Chat/search-20px@2x.png" @click="search">
            </div>
            <ul class="MxHistoryMsg-list" id="MxHistoryMsg-list-Id">
                <li v-for="(item, index) in messageListShow" class="MxmessageItem" v-on:click="ShowFile(item)" v-show="!isDeleted(item)">
                    <img class="MxmessageOwnerImage" src="../../../static/Img/User/user-40px@2x.png" :id="getUserHeadImageId(item)" onerror = "this.src = './static/Img/User/user-40px@2x.png'">
                    <div class="MxmessageInfoDiv">
                        <div class="MxmessageOwnerTimeDiv">
                            <label class="MxmessageInfoOwnerNameLabel" :id="getUserNameId(item)"></label>
                            <label class="MxmessageInfoTimeLabel">{{getMsgTime(item)}}</label>
                        </div>
                        <div class="MxmessageInfoDetailLabel" v-html="msgContentHeightLight(item)" v-show="showContent(item)"></div>
                        <div class="MxmessageImg" v-if="MsgIsImage(item)">
                            <img class="Mx-msg-image" :id="getMxImgId(item)" :src="getMsgImgIcon(item)" alt="图片">
                        </div>
                        <div class="MxmessageFile" v-else-if="MsgIsFile(item)">
                            <img class="mx-file-image" :id="getMxImgId(item)" style="vertical-align:middle" :src="getMsgFileIcon(item)">
                            <div class="mx-file-info">
                                <p class="mx-file-name" v-html="msgContentHeightLight(item)"></p>
                                <p class="mx-file-size">{{getFileNumber(item.event.content ? item.event.content.info.size : item.getContent().info.size)}}</p>
                            </div>
                        </div>
                        <div class="MxmessageVoice" v-else-if="MsgIsVoice(item)">
                            <img class="mx-voice-image" :id="getMxImgId(item)" src="../../../static/Img/Chat/msg-voice@2x.png" style="vertical-align:middle">
                        </div>
                    </div>
                </li>
            </ul>
            <div class="MxHistoryMsgEmpty" v-show="showEmpty">
                <img class="MxHistoryMsgEmptyBg" src="../../../static/Img/MessageHistory/search-empty@2x.png">
                <div class="MxHistoryMsgEmptyText">搜索聊天中的消息</div>
            </div>
            <div class="MxHistorySearchEmpty" v-show="searchEmpty">
                <div class="MxHistorySearchEmptyText">暂无结果</div>
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil, getIconPath, Appendzero, sliceReturnsOfString, getFileSizeByNumber} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import * as fs from 'fs-extra'
import * as path from 'path'
import {ipcRenderer} from 'electron'
import confservice from '../../packages/data/conf_service.js'
import { Group } from '../../packages/data/sqliteutil'
import eventSearch, {searchPagination} from '../../packages/data/Searching.js';
import {ComponentUtil} from '../script/component-util'
import {Filter} from 'matrix-js-sdk';
import * as Matrix from 'matrix-js-sdk';
export default {
    name: 'HistoryMsgDlg',
    data () {
        return {
            searchKey: '',
            GroupInfo: null,
            groupId: '',
            showEmpty: true,
            searchEmpty: false,
            ret: [],
            total: 0,
            sequenceId: 0,
            isMatrixSearch: false,
            canBackPaginate: true,
            isRefreshing: false,
            lastRefreshTime: 0,
            curChatName: "",
        }
    },  
    computed: {
        messageListShow: {
            get: function() {
                var searchResult = [];
                if(this.ret == undefined) {
                    console.log("*** return []");
                    return searchResult;
                }
                if(this.searchKey.length == 0) {
                    for(let i=0;i<this.ret.length;i++) {
                        searchResult.push(this.ret[i]);
                    }
                }
                else {
                    console.log("*** this.ret.length ", this.ret.length);
                    for(let i=0;i<this.ret.length;i++) {
                        var timeLine = this.ret[i];

                        searchResult.push(timeLine);
                    }
                }
                return searchResult;
            }
        }
    },
    methods: {
        showContent: function(msgItem) {
            if(!this.MsgIsFile(msgItem) && !this.MsgIsImage(msgItem) && !this.MsgIsVoice(msgItem)) {
                return true;
            }
            else {
                return false;
            }
        },
        ShowFile: function(item) {
            this.$emit('jumpToEvent', item.event_id ? item.event_id : item.event.event_id, this.GroupInfo);
        },
        getFileNumber: function(nSize) {
            return getFileSizeByNumber(nSize);
        },
        getMsgFileIcon: function(item) {
            var content = item.event.content ? item.event.content : item.getContent();
            if(content.body != undefined) {
                let ext = path.extname(content.body);
                // console.log("getmsgfileicon ext is ", ext);
                return this.getFileIconThroughExt(ext);
            }
        },
        getFileIconThroughExt: function(ext) {
            var iconPath = getIconPath(ext);
            return iconPath;
        },
        getMsgImgIcon: function(item) {
            let iconPath = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(item.event.content ? item.event.content.url : item.getContent());
            return iconPath;
        },
        MsgIsImage: function(curItem) {
            // let chatGroupMsgType = curItem.event.content.msgtype == undefined ? curItem.getContent().msgtype : curItem.event.content.msgtype;
            let chatGroupMsgType = curItem.event.content ? curItem.event.content.msgtype : curItem.getContent().msgtype;
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
        MsgIsFile: function(curItem) {
            // let chatGroupMsgType = curItem.event.content.msgtype == undefined ? curItem.getContent().msgtype : curItem.event.content.msgtype;
            let chatGroupMsgType = curItem.event.content ? curItem.event.content.msgtype : curItem.getContent().msgtype;
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
        MsgIsVoice: function(curItem) {
            // let chatGroupMsgType = curItem.event.content.msgtype == undefined ? curItem.getContent().msgtype : curItem.event.content.msgtype;
            let chatGroupMsgType = curItem.event.content ? curItem.event.content.msgtype : curItem.getContent().msgtype;
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
        getMxImgId: function(curTimeline) {
            var distId = curTimeline.event ? curTimeline.event.event_id : curTimeline.event_id;
            return "MxHistoryImg-" + distId;
        },
        getUserNameId: function(curTimeline) {
            var distId = curTimeline.event ? curTimeline.event.event_id : curTimeline.event_id;
            return "MxHistoryMsgListName-" + distId;
        },
        getUserHeadImageId: function(curTimeline) {
            var distId = curTimeline.event ? curTimeline.event.event_id : curTimeline.event_id;
            return "MxHistoryMsgListImg-" + distId;
        },
        checkGetUserHedImageId: function(id) {
            return "MxHistoryMsgListImg-" + id;
        },
        Close: function() {
            console.log("=======")
            this.$emit("searchClose");
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
        getAppBaseData:async function() {
            // Init services
            // Set accessToken in services
            // console.log("global is ", global.mxMatrixClientPeg)
            this.GroupInfo = global.mxMatrixClientPeg.matrixClient.getRoom(this.groupId);
            console.log("*** this.$store.getters.getCurChatId() ", this.$store.getters.getCurChatId());
            if(this.$store.getters.getCurChatId() == undefined) {
                this.curChatName = "返回聊天";
            }
            else {
                var showGroupInfo = global.mxMatrixClientPeg.matrixClient.getRoom(this.$store.getters.getCurChatId());
                
                if(global.mxMatrixClientPeg.DMCheck(showGroupInfo)) {
                    var distUserId = global.mxMatrixClientPeg.getDMMemberId(showGroupInfo);
                    if(!distUserId) {
                        this.curChatName = showGroupInfo.name;
                    }
                    var displayName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
                    this.curChatName = displayName;
                }
                else {
                    this.curChatName = showGroupInfo.name;
                }
            }

            // console.log("the init user id is ,", this.GroupInfo)
            confservice.init(global.mxMatrixClientPeg.matrixClient.getUserId());

            // this.$store.commit("setUserId", this.curUserInfo.id)
            this.showGroupInfo();
            if(this.initSearchKey.length != 0) {
                this.searchKey = this.initSearchKey;
                this.search();
            }
            else {
                this.updatePage();
            }
        },
        // Get formate message time
        MsgTime(curMsg) {
            if(curMsg === null) {
                return "";
            }
            var secondsTime = Number(curMsg.event ? curMsg.event.origin_server_ts : curMsg.origin_server_ts);
            return ComponentUtil.formatTimeFilter(secondsTime);
        },
        isWindows() {
            return environment.os.isWindows;
        },
        isDeleted: function(msgItem) {
            if(!msgItem.event.event_id) {
                return false;
            }
            return msgItem.isRedacted() || msgItem.getType() == "m.room.redaction";
        },
        showResultInfo: async function() {
            console.log("*** showresultinfo is ", this.messageListShow.length);
            for(let i=0;i<this.messageListShow.length;i++) {
                var curItem = this.messageListShow[i];
                var distUserImgElement = document.getElementById(this.getUserHeadImageId(curItem));
                var distUserNameElement = document.getElementById(this.getUserNameId(curItem));

                var sender = global.mxMatrixClientPeg.matrixClient.getUser(curItem.sender ? curItem.sender.userId : curItem.event.sender);
                
                var userUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(sender.avatarUrl, null, null);
                var distUserName = await ComponentUtil.GetDisplayNameByMatrixID(sender.userId);
                distUserNameElement.innerHTML = distUserName;
                if(userUrl != null && userUrl != undefined && userUrl != '') {
                    distUserImgElement.setAttribute("src", userUrl);
                }
                if((curItem.event.content ? curItem.event.content.msgtype : curItem.getContent().msgtype) == "m.image") {
                    var chatGroupMsgContent = curItem.content ? curItem.content : curItem.getContent();
                    let maxSize = 260;
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
                    var imgMsgImgElement = document.getElementById(this.getMxImgId(curItem));
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
                }
            }
        },
        showGroupInfo: async function() {
            // console.log("showGroupInfo groupinfo is ", this.GroupInfo)
            if(this.GroupInfo.roomId == undefined){
                return "";
            }
            var groupNameElement = document.getElementById("MxHistoryMsgGroupInfoNameId");
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
        matrixSearch: async function() {
            return eventSearch(this.searchKey, this.GroupInfo.roomId);
        },
        appSearch: function() {
            return global.services.common.searchChatMsg(this.searchKey, this.distRoomId, 15, 1, this.sequenceId)
        },
        search: function() {
            // console.log("this.searchKeylneth ", this.searchKey.length);
            if(this.searchKey.length == 0) {
                console.log("this.messagelsitshow is ", this.messageListShow)
                this.toInit();
                this.getHistoryMsgList();
                setTimeout(() => {
                    this.$nextTick(() => {
                        this.showResultInfo();
                    })
                })
                return
            }
            var curSearchId = new Date().getTime();
            console.log("searchkey is ", this.searchKey);
            var searchResult = {
                "id": curSearchId,
                "searchList": []
            };
            this.searchId = curSearchId;
            
            // eventSearch(this.searchKey, this.GroupInfo.roomId)
            // this.matrixSearch()
            this.appSearch()
                .then((ret) => {
                    if(ret.results == undefined) {
                        this.toInit();
                        // console.log("this.messagelsitshow is ", this.messageListShow)
                        this.showResultInfo();
                    }
                    else {
                        this.showEmpty = false;
                        if(searchResult.id == this.searchId) {
                            this.ret = ret.results;
                            console.log("***ret is ", ret.results);
                            if(this.ret.length == 0) {
                                this.searchEmpty = true;
                            }
                            else {
                                this.searchEmpty = false;
                            }
                            this.total = ret.total;
                            console.log("*** ret.length ", this.ret.length);
                            this.sequenceId = this.ret.length;
                            console.log("*** this.sequenceId ", this.sequenceId);
                            setTimeout(() => {
                                this.$nextTick(() => {
                                    this.showResultInfo();
                                    let div = document.getElementById("MxHistoryMsg-list-Id");
                                    div.addEventListener('scroll', this.handleScroll);
                                })
                            }, 0)
                        }
                    }
                    
                })
        },
        async getShowMessage(num, type)
        {
            let msgList = [];
            while(this._timelineWindow.canPaginate(type)){
                //获取历史消息
                await this._timelineWindow.paginate(type, 20);
                let tmpList = this._getEvents().reverse();
                let index = 0;
                msgList.length = 0;
                tmpList.forEach(item => {
                    if(item.event.content){
                        msgList.push(item);
                        index++;
                    } 
                })
                if(index > num) break;
            }
            return msgList;
        },
        handleScroll: function() {
            let uldiv = document.getElementById("MxHistoryMsg-list-Id");
            let client = document.getElementById("MxHistoryMsgDlgContentId");
            if(uldiv) {
                var curTime = new Date().getTime();
                if(!this.canBackPaginate) {
                    this.isRefreshing = false;
                    return;
                }
                this.lastScrollTop = uldiv.scrollTop;
                if(curTime - this.lastRefreshTime > 0.5 * 1000 && !this.isRefreshing) {
                    if(uldiv.scrollHeight - uldiv.scrollTop < client.clientHeight) {
                        console.log("=======wo bottom");
                        this.isRefreshing = true;
                        this.lastRefreshTime = new Date().getTime();
                        if(this.searchKey.length == 0) {
                            this.getShowMessage(10, 'b')
                                .then((ret) => {
                                    this.isRefreshing = false;
                                    this.ret = this._getEvents().reverse();
                                    setTimeout(() => {
                                        this.$nextTick(() => {
                                            this.showResultInfo();
                                            console.log("---------update croll top is ", uldiv.scrollHeight);
                                            uldiv.scrollTop = this.lastScrollTop;
                                            this.isScroll = false;
                                        })
                                    }, 0);
                                })
                        }
                        else {
                            this.isRefreshing = true;
                            this.appSearch()
                                .then((ret) => {
                                    this.isRefreshing = false;
                                    this.lastRefreshTime = new Date().getTime();
                                    console.log("*** ret.length ", ret.results);
                                    console.log("*** this.messageListShow.length ", this.messageListShow.length);
                                    this.sequenceId = ret.results.length + this.messageListShow.length;
                                    console.log("*** this.sequenceId ", this.sequenceId);
                                    if(this.sequenceId >= ret.total) {
                                        this.canBackPaginate = false;
                                    }
                                    this.ret = this.ret.concat(ret.results);
                                    setTimeout(() => {
                                        this.$nextTick(() => {
                                            this.showResultInfo();
                                        })
                                        this.isRefreshing = false;
                                    }, 0)
                                })
                        }
                    }
                }
            }
        },
        toInit() {
            this.searchKey = "";
            this.ret = [];
            this.isRefreshing = false;
            this.canBackPaginate = true;
            this.sequenceId = 0;
            this.showEmpty = true;
            this.total = 0;
            this.searchEmpty = false;
        },
        msgContentHeightLight: function(curMsg) {
            // var showContent = curMsg.getContent();
            var showContent = curMsg.event.content ? curMsg.event.content : curMsg.getContent();
            // showContent = showContent + ' ';
            if(this.searchKey.length == 0) {
                return showContent.body;
            }
            if(showContent.msgtype == "m.text") {
                var textContent = showContent.body;
                if(textContent.indexOf(this.searchKey) != -1) {
                    let splitValue = textContent.split(this.searchKey);
                    let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
                    return newInnerHtml;
                }
            }
            else if(showContent.msgtype == "m.file") {
                var fileName = showContent.body;
                if(fileName.indexOf(this.searchKey) != -1) {
                    let splitValue = fileName.split(this.searchKey);
                    let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
                    return newInnerHtml;
                }
            }
            else if(showContent.msgtype == "m.image") {
                var fileName = showContent.body;
                if(fileName.indexOf(this.searchKey) != -1) {
                    let splitValue = fileName.split(this.searchKey);
                    let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
                    return newInnerHtml;
                }
            }
            else if(showContent.msgtype == "m.audio") {
                var fileName = showContent.body;
                if(fileName.indexOf(this.searchKey) != -1) {
                    let splitValue = fileName.split(this.searchKey);
                    let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
                    return newInnerHtml;
                }
            }
            else if(showContent.name != undefined) {
                var textContent = showContent.name;
                if(textContent.indexOf(this.searchKey) != -1) {
                    let splitValue = textContent.split(this.searchKey);
                    let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
                    return newInnerHtml;
                }
            }
        },
        MsgContent: function(curMsg) {
            var tmpContent = curMsg.content ? curMsg.content : curMsg.getContent();
            return tmpContent.text;
        },
        getMsgTime: function(curMsg) {
            var fileDate = this.MsgTime(curMsg);
            return fileDate;
        },
        async updateTimelineSet(room) {
            const client = global.mxMatrixClientPeg.matrixClient;
            
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
                            "types": [
                                "m.room.message"
                            ],
                        },
                    },
                },
            );

            const filterId = await client.getOrCreateFilter("FILTER_LAST_MSG_" + client.credentials.userId, filter);
            filter.filterId = filterId;
            const timelineSet = room.getOrCreateFilteredTimelineSet(filter);

            return timelineSet;
        },
        async toGetShowMessage() {
            this.timeLineSet = await this.updateTimelineSet(this.GroupInfo);
            this._timelineWindow = new Matrix.TimelineWindow(
                global.mxMatrixClientPeg.matrixClient, 
                this.timeLineSet,
                {windowLimit:Number.MAX_VALUE},
            )
            await this._timelineWindow.load(undefined, 20);
            var fileListInfo = this._timelineWindow.getEvents();
            while(fileListInfo.length < 10 && this._timelineWindow.canPaginate('b')) {
                await this._timelineWindow.paginate("b", 20);
                fileListInfo = await this._timelineWindow.getEvents();
            }
            return fileListInfo;
        },
        _getEvents() {
            var events = this._timelineWindow.getEvents();
            // console.log("========== getEvent ", events);
            return events;
        },
        getHistoryMsgList: function() {
            this.toGetShowMessage()
                .then((ret) => {

                    this.ret = this._getEvents().reverse();
                    console.log("*** this.ret.results is ", this.ret);
                    setTimeout(() => {
                        this.$nextTick(() => {
                            this.needToBottom = true;
                            this.showResultInfo();

                            // let div = document.getElementById("message-show-list");
                            // if(div) {
                            //     div.scrollTop = this.lastScrollTop;
                            //     div.addEventListener('scroll', this.handleScroll);
                            //     this.showScrollBar();
                            // }

                            // let uldiv = document.getElementById("message-show-list");
                            // if(uldiv.clientHeight < uldiv.offsetHeight) {
                            //     this.handleScroll(true);
                            // }
                            let div = document.getElementById("MxHistoryMsg-list-Id");
                            div.addEventListener('scroll', this.handleScroll);
                        })
                    }, 100)
                })
        },
        updatePage: function() {
            console.log("filelist group info is ", this.GroupInfo);
            this.getHistoryMsgList();
            if(this.GroupInfo == undefined) {
                return;
            };
            
            if(this.searchKey.length == 0) {
                this.showEmpty = true;
                this.searchEmpty = false;
            }
            else{
                this.showEmpty = false;
            }
            this.showResultInfo();
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
                var distElement = document.getElementById(this.checkGetUserHedImageId(sequenceId));
            }
            if(distElement == undefined) {
                var distElement = document.getElementById(this.checkGetUserHedImageId(id));
            }
            if(distElement != undefined) {
                distElement.setAttribute("src", localPath);
            }
        },
    },
    props: {
        distRoomId: {
            type: String,
            default: ''
        },
        initSearchKey: {
            type: String,
            default: ''
        }
    },
    watch: {
        distRoomId: async function() {
            if(this.distRoomId == "") {
                this.toInit();
                return;
            }
            this.toInit();
            this.groupId = this.distRoomId;
            await this.getAppBaseData();
            this.$nextTick(() => {
                var searchInput = document.getElementById("MxHistoryMsgDlgSearchInputId");
                searchInput.focus();
            })
        }
    },
    mounted: function() {
        ipcRenderer.on("distGroupInfo", (event, groupId) => {
            this.groupId = groupId;
        })
        ipcRenderer.on('updateUserImage', this.updateUserImage);
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
    
    .MxHistoryMsgDlg {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 1);
    }

    .MxHistoryMsgDlgContent {
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

    .MxTitleGoBackImg:hover {
        display: inline-block;
        margin: 0px 6px 16px 0px;
        width: 20px;
        height: 20px;
        cursor: pointer;
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
        height: 20px;
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
        letter-spacing: 0px;
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
        letter-spacing: 0px;
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
    
    .MxHistoryMsgDlgSearchInput {
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
        letter-spacing: 0px;
        font-size: 12px;
        color:rgba(153, 153, 153, 1);
        background-color: rgba(1, 1, 1, 0);
    }

    .MxHistoryMsgEmpty {
        width:100%;
        height: 390px;
        background-color: white;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;  
    }

    .MxHistoryMsgEmptyBg {
        width: 176px;
        height: 114px;
        background-color: white;
    }

    .MxHistoryMsgEmptyText {
        width:104px;
        height:18px;
        font-size:12px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(153,153,153,1);
        line-height:18px;
        letter-spacing: 0px;
    }

    .MxHistorySearchEmpty {
        width:100%;
        height: 390px;
        background-color: white;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;  
    }

    .MxHistorySearchEmptyText {
        width:104px;
        height:18px;
        font-size:12px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(153,153,153,1);
        line-height:18px;
        text-align: center;
        letter-spacing: 0px;
    }

    .MxHistoryMsg-list {
        width: 100%;
        max-height: calc(100% - 95px);
        margin: 0;
        padding: 0;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .MxmessageItem {
        width: 100%;
        min-height: 64px;
        padding: 0;    
        border-bottom:1px solid rgba(238,238,238,1);
    }

    .MxmessageItem:hover {
        width: 100%;
        min-height: 64px;
        padding: 0;
        background-color: rgba(221, 221, 221, 1);
    }
    
    .MxmessageOwnerImage {
        display: inline-block;
        margin: 17px 0px 15px 0px;
        width: 32px;
        height: 32px;
        border-radius:50px;
    }
    
    .MxmessageInfoDiv {
        display: inline-block;
        padding: 14px 0px 10px 4px;
        width: calc(100% - 42px);
        min-height: 40px;
        vertical-align: top;
    }

    .MxmessageOwnerTimeDiv {
        display: block;
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-family:PingFangSC-Regular;
        font-weight: 590;
        text-align: right;
    }

    .MxmessageInfoOwnerNameLabel {
        display: inline-block;
        color: rgba(153, 153, 153, 1);
        width: 70%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
        float: left;
        text-align: left;
    }

    .MxmessageInfoTimeLabel {
        display: inline-block;
        color: rgba(153, 153, 153, 1);
        width: 28%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
        float: right;
    }

    .MxmessageInfoDetailLabel {
        display: block;
        width: 100%;
        min-height: 18px;
        line-height: 18px;
        font-size: 13px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
    }

    .MxmessageImg {
        background-color: rgba(1,1,1,0);
        min-width: 104px;
        min-height: 100px;
        border-radius: 5px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .MxmessageFile {
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
    
    .MxmessageFile:hover {
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
    
    .MxmessageVoice {
        background-color: rgb(233,234,235);;
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

    .mx-file-image {
        height: 46px;
        display: inline-block;
    }
    
    .mx-voice-image {
        height: 16px;
        display: inline-block;
    }
    
    .mx-file-info {
        min-height: 46px;
        display: inline-block;
        vertical-align: top;
    }

    .mx-file-name {
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
        font-family: 'PingFangSC-Regular';
    }

    .mx-file-size {
        font-size: 12px;
        color: rgb(153, 153, 153);
        overflow: hidden;
        margin-left: 10px;
        margin-top: 3px;
        margin-right: 0px;
        margin-bottom: 4px;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family: 'PingFangSC-Regular';
    }

</style>
