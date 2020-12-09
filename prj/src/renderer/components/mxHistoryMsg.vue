<template>
    <div class="MxHistoryMsgDlg" id="MxHistoryMsgDlgId">
        <div class="MxHistoryMsgDlgContent" id="MxHistoryMsgDlgContentId">
            <div class="MxTitle">
                <img class="MxTitleGoBackImg" src="../../../static/Img/Main/WinClose-20px@2x.png" @click="Close()" />
                <div class="MxTitleGoBackLabel">返回聊天</div>
            </div>
            <div class="MxGroupInfo">
                <img class="MxGroupInfoImg" id="MxGroupInfoImgId" src="../../../static/Img/User/group-40px@2x.png">
                <label class="MxGroupInfoName">{{GroupInfo.name}}</label>
                <label class="MxGroupInfoMemberNum" id="MxGroupInfoMemberNumId"></label>
            </div>
            <div class="Mxsearch">
                <input class="MxHistoryMsgDlgSearchInput" placeholder="搜索..." v-model="searchKey" @input="search" @keyup.enter="search">
                <img class="Mxicon-search" src="../../../static/Img/Chat/search-20px@2x.png" @click="search">
            </div>
            <ul class="MxHistoryMsg-list" id="MxHistoryMsg-list-Id">
                <li v-for="(item, index) in messageListShow" class="MxmessageItem" v-on:click="ShowFile(item)">
                    <img class="MxmessageOwnerImage" src="../../../static/Img/User/user-40px@2x.png" :id="getUserHeadImageId(item)" @click="openFile(item)">
                    <div class="MxmessageInfoDiv">
                        <div class="MxmessageOwnerTimeDiv">
                            <label class="MxmessageInfoOwnerNameLabel" :id="getUserNameId(item)"></label>
                            <label class="MxmessageInfoTimeLabel">{{getMsgTime(item)}}</label>
                        </div>
                        <div class="MxmessageInfoDetailLabel" v-html="msgContentHeightLight(item)"></div>
                        <div class="MxmessageImg" v-if="MsgIsImage(item)">
                            <img class="Mx-msg-image" :id="getMxImgId(item)" :src="getMsgImgIcon(item)" alt="图片">
                        </div>
                        <div class="MxmessageFile" v-else-if="MsgIsFile(item)">
                            <img class="mx-file-image" :id="getMxImgId(item)" style="vertical-align:middle" :src="getMsgFileIcon(item)">
                            <div class="mx-file-info">
                                <p class="mx-file-name" v-html="msgContentHeightLight(item)"></p>
                                <p class="mx-file-size">{{getFileNumber(item.getContent().info.size)}}</p>
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
                <div class="MxHistoryMsgEmptyText">搜索会话中的消息</div>
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
export default {
    name: 'HistoryMsgDlg',
    data () {
        return {
            searchKey: '',
            GroupInfo: null,
            groupId: '',
            showEmpty: true,
            ret: {},
        }
    },  
    computed: {
        messageListShow: {
            get: function() {
                var searchResult = [];
                if(this.ret.results == undefined) {
                    return searchResult;
                }
                for(let i=0;i<this.ret.results.length;i++) {
                    var timeLine = this.ret.results[i].context.getTimeline()[this.ret.results[i].context.getOurEventIndex()];

                    searchResult.push(timeLine);
                }
                return searchResult;
            }
        }
    },
    methods: {
        ShowFile: function(item) {
            this.$emit('jumpToEvent', item.event.event_id);
        },
        getFileNumber: function(nSize) {
            return getFileSizeByNumber(nSize);
        },
        getMsgFileIcon: function(item) {
            var content = item.getContent();
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
            let iconPath = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(item.event.content.url);
            return iconPath;
        },
        MsgIsImage: function(curItem) {
            let chatGroupMsgType = curItem.event.content.msgtype == undefined ? curItem.getContent().msgtype : curItem.event.content.msgtype;
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
            let chatGroupMsgType = curItem.event.content.msgtype == undefined ? curItem.getContent().msgtype : curItem.event.content.msgtype;
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
            let chatGroupMsgType = curItem.event.content.msgtype == undefined ? curItem.getContent().msgtype : curItem.event.content.msgtype;
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
        getMxImgId: function(curItem) {
            return "MxHistoryImg-" + curItem.event.event_id;
        },
        getUserNameId: function(curTimeline) {
            return "MxHistoryMsgListName-" + curTimeline.event.event_id;
        },
        getUserHeadImageId: function(curTimeline) {
            return "MxHistoryMsgListImg-" + curTimeline.event.event_id;
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
            console.log('mxMembers', mxMembers);
            console.log('----mxMembers[userId]----', userId)
            
            return mxMembers.length;
        },
        getAppBaseData:async function() {
            // Init services
            // Set accessToken in services
            console.log("global is ", global.mxMatrixClientPeg)
            this.GroupInfo = global.mxMatrixClientPeg.matrixClient.getRoom(this.groupId);
            console.log("the init user id is ,", this.GroupInfo)
            confservice.init(global.mxMatrixClientPeg.matrixClient.getUserId());

            // this.$store.commit("setUserId", this.curUserInfo.id)
            
            this.updatePage();
        },
        // Get formate message time
        MsgTime(curMsg) {
            if(curMsg === null) {
                return "";
            }
            var secondsTime = Number(curMsg.event.origin_server_ts);
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
        showGroupInfo: async function(chatGroupItem) {
            console.log("showGroupInfo groupinfo is ", this.GroupInfo)
            if(this.GroupInfo.roomId == undefined){
                return "";
            }
            var groupContentNumElement = document.getElementById("MxGroupInfoMemberNumId");
            if(groupContentNumElement) {
                var totalMemberCount = this.mxGetMembers();
                if(totalMemberCount > 2) {
                    groupContentNumElement.innerHTML = "(" + totalMemberCount + ")";
                }
                else {
                    groupContentNumElement.innerHTML = "";
                }
            }
            for(let i=0;i<this.messageListShow.length;i++) {
                var curItem = this.messageListShow[i];
                var distUserImgElement = document.getElementById(this.getUserHeadImageId(curItem));
                var distUserNameElement = document.getElementById(this.getUserNameId(curItem));

                var sender = this.GroupInfo.getMember(curItem.getSender());
                
                var userUrl = sender.getAvatarUrl(global.mxMatrixClientPeg.matrixClient.getHomeserverUrl(), 40, 40, undefined, false, false);
                var distUserName = sender.name;
                distUserNameElement.innerHTML = distUserName;
                if(userUrl != null && userUrl != undefined && userUrl != '') {
                    distUserImgElement.setAttribute("src", userUrl);
                }
                if(curItem.getContent().msgtype == "m.image") {
                    var chatGroupMsgContent = curItem.getContent();
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
        search: function() {
            // console.log("this.searchKeylneth ", this.searchKey.length);
            if(this.searchKey.length == 0) {
                this.ret = []
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
            eventSearch(this.searchKey, this.GroupInfo.roomId)
                .then((ret) => {
                    console.log("search ret is ", ret);
                    if(ret.results == undefined) {
                        this.ret = []
                        // console.log("this.messagelsitshow is ", this.messageListShow)
                        this.showGroupInfo();
                        this.showEmpty = true;
                    }
                    else {
                        this.showEmpty = false;
                        if(searchResult.id == this.searchId) {
                            this.ret = ret;
                            setTimeout(() => {
                                this.$nextTick(() => {
                                    this.showGroupInfo();
                                    let div = document.getElementById("MxHistoryMsg-list-Id");
                                    div.addEventListener('scroll', this.handleScroll);
                                })
                            }, 0)
                        }
                    }
                })
        },
        handleScroll: function() {
            let uldiv = document.getElementById("MxHistoryMsg-list-Id");
            let client = document.getElementById("MxHistoryMsgDlgContentId");
            if(uldiv) {
                if(uldiv.scrollHeight - uldiv.scrollTop < client.clientHeight) {
                    console.log("=======wo bottom");
                    if(this.ret.next_batch) {
                        searchPagination(this.ret)
                            .then((ret) => {
                                this.ret = ret;
                                setTimeout(() => {
                                    this.$nextTick(() => {
                                        this.showGroupInfo();
                                    })
                                }, 0)
                            })
                    }
                }
            }
        },
        msgContentHeightLight: function(curMsg) {
            var showContent = curMsg.getContent();
            // showContent = showContent + ' ';
            if(this.searchKey.length == 0) {
                return showContent
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
        },
        MsgContent: function(curMsg) {
            var tmpContent = curMsg.content;
            return tmpContent.text;
        },
        getMsgTime: function(curMsg) {
            var fileDate = this.MsgTime(curMsg);
            return fileDate;
        },
        updatePage: function() {
            console.log("filelist group info is ", this.GroupInfo);
            if(this.GroupInfo == undefined) {
                return;
            };
            
            if(this.searchKey.length == 0) {
                this.showEmpty = true;
            }
            else{
                this.showEmpty = false;
            }
            this.showGroupInfo(this.GroupInfo);
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
        }
    },
    watch: {
        distRoomId: async function() {
            if(this.distRoomId == "") {
                this.searchKey = "";
                return;
            }
            this.groupId = this.distRoomId;
            await this.getAppBaseData();
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

    .MxTitleGoBackLabel {
        display: inline-block;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-weight: 500;
        font-family: SCPingFang-Medium;
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
        font-family: SCPingFang-Regular;;
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
        height: 32px;
        max-width: 150px;
        line-height: 32px;
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
        font-family: SCPingFang-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        font-size: 12px;
        color:rgba(153, 153, 153, 1);
        background-color: rgba(1, 1, 1, 0);
    }

    .MxHistoryMsgEmpty {
        width:100%;
        height: 100%;
        background-color: white;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;  
    }

    .MxHistoryMsgEmptyBg {
        width: 84px;
        height: 84px;
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
        letter-spacing:1px;
    }

    .MxHistoryMsg-list {
        width: 100%;
        height: calc(100% - 30px);
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
    }

    .MxmessageItem:hover {
        width: 100%;
        min-height: 64px;
        padding: 0;
        background-color: rgba(221, 221, 221, 1);
    }
    
    .MxmessageOwnerImage {
        display: inline-block;
        margin: 0 0 0 4px;
        padding: 16px 0px 16px 0px;
        width: 32px;
        height: 32px;
        border-radius:4px;
    }

    .MxmessageInfoDiv {
        display: inline-block;
        padding: 12px 0px 12px 4px;
        width: calc(100% - 52px);
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
        letter-spacing: 1px;
        float: left;
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
        letter-spacing: 1px;
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
        letter-spacing: 1px;
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
