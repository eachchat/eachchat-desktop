<template>
    <div class="HistoryMsgDlg" id="HistoryMsgDlgId">
        <!-- <winHeaderBar :showMax="false" @Close="Close" @Min="Min"></winHeaderBar> -->
        <div class="HistoryMsgDlgHeader">
            <img class="HistoryMsgDlgHeaderImg" id="HistoryMsgDlgHeaderImgId" v-show="showFilter">
            <div class="HistoryMsgDlgHeaderTitle" v-show="!showFilter"></div>
            <img class="HistoryMsgDlgHeaderGoback" src="../../../static/Img/Login/back-20px@2x.png" @click="CloseDetail()" v-show="showFilter">
        </div>
        <div class="HistoryMsgDlgContent">
            <div class="search">
                <input class="HistoryMsgDlgSearchInput" placeholder="搜索..." v-model="searchKey" @input="search" @keyup.enter="search">
                <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" @click="search">
            </div>
            <div class="filter-header">
                <img class="filter-img" src="../../../static/Img/SearchDlg/filter-nor-20px@2x.png">
                <label class="fileter-header-label">筛选条件</label>
                <i class="el-icon-arrow-up" v-show="showFilter" @click="hideFilter"></i>
                <i class="el-icon-arrow-down" v-show="!showFilter" @click="openFilter"></i>
            </div>
            <div class="filter-group" v-show="showFilter">
                <label class="filter-group-label">指定会话</label>
                <ul class="filter-group-list">
                    <li class="filterGroupItem" @click="addGroup">
                        <img class="filterGroupImage" src="../../../static/Img/SearchDlg/add-20px@2x.png">
                    </li>
                    <li class="filterGroupItem" v-show="groupNeedMore">
                        <img class="filterGroupImage" src="../../../static/Img/SearchDlg/more-20px@2x.png">
                    </li>
                    <li v-for="(item, index) in selectedGroups" class="filterGroupItem">
                        <img class="filterGroupImage" :id="getFilterGroupImageId(item)">
                    </li>
                </ul>
            </div>
            <div class="filter-sender" v-show="showFilter">
                <label class="filter-sender-label">指定发送人</label>
                <ul class="filter-sender-list">
                    <li class="filterSenderItem">
                        <img class="filterSenderImage" @click="addDisgUser" src="../../../static/Img/SearchDlg/add-20px@2x.png">
                    </li>
                    <li class="filterSenderItem" v-show="SenderNeedMore">
                        <img class="filterSenderImage" src="../../../static/Img/SearchDlg/more-20px@2x.png">
                    </li>
                    <li v-for="(item, index) in selectedSenders" class="filterSenderItem">
                        <img class="filterSenderImage" :id="getFilterSenderImageId(item)">
                    </li>
                </ul>
            </div>
            <div class="filter-time" v-show="showFilter">
                <label class="filter-time-label">起始时间</label>
                <div class="filter-time-picker-div">
                    <el-date-picker
                        v-model="startTime"
                        type="date"
                        size="small"
                        style='width: 130px;border:0px'
                        format="yyyy/MM/dd"
                        value-format="timestamp"
                        @blur="startTimeChanged"
                        >
                    </el-date-picker>
                </div>
                <img class="filterTimeImage" src="../../../static/Img/SearchDlg/time-20px@2x.png" v-show="false">
            </div>
            <ul class="SearchFileList" id="search-file-list-id">
                <li v-for="(item, index) in messageListShow" class="messageItem" @click="openFile(item)">
                    <img class="messageOwnerImage" :src="getIcon(item)">
                    <div class="messageInfoDiv">
                        <div class="messageOwnerTimeDiv">
                            <label class="fileInfoNameLabel" v-html="fileNameHeightLight(item)"></label>
                            <label class="fileInfoDetailLabel">{{getFileInfo(item)}}</label>
                        </div>
                    </div>
                </li>
            </ul>
            <div class="HistoryMsgEmpty" v-show="showEmpty" id="FileListEmptyId">
                <img class="HistoryMsgEmptyBg" src="../../../static/Img/MessageHistory/search-empty@2x.png">
                <div class="HistoryMsgEmptyText">搜索会话中的文件</div>
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
import { Group, UserInfo } from '../../packages/data/sqliteutil'
export default {
    name: 'HistoryMsgDlg',
    data () {
        return {
            selectedSenders: [],
            startTime: '',
            groupNeedMore: false,
            SenderNeedMore: false,
            showFilter: false,
            GroupName: '',
            messageListShow: [],
            searchKey: '',
            GroupInfo: null,
            originalMessageList: [],
            showEmpty: true,
            selectedGroups: [],
            numIndex: 0,
        }
    },  
    methods: {
        addGroup: function() {
            var selectedGroupsIds = [];
            for(let i=0;i<this.selectedGroups.length;i++) {
                selectedGroupsIds.push(this.selectedGroups[i].group_id);
            }
            ipcRenderer.send("SearchAddGroup", selectedGroupsIds);
        },
        addDisgUser: function() {
            var selectedSenderIds = [];
            console.log("this.selectedSenders ", this.selectedSenders);
            for(let i=0;i<this.selectedSenders.length;i++) {
                selectedSenderIds.push(this.selectedSenders[i].user_id);
            }
            ipcRenderer.send("SearchAddSender", selectedSenderIds);
        },
        openFilter: function() {
            this.showFilter = true;
            let distElement = document.getElementById("search-file-list-id");
            let bgElement = document.getElementById("FileListEmptyId");
            if(this.showEmpty) {
                distElement.style.display = "none";
                bgElement.style.height = "150px"
            }
            else {
                distElement.style.height = "150px";
                bgElement.style.display = "none"
            }
        },
        hideFilter: function() {
            this.showFilter = false;
            let distElement = document.getElementById("search-file-list-id");
            let bgElement = document.getElementById("FileListEmptyId");
            if(this.showEmpty) {
                distElement.style.display = "none";
                bgElement.style.height = "270px"
            }
            else {
                distElement.style.height = "270px";
                bgElement.style.display = "none"
            }
        },
        openFile: function(fileInfo) {
            console.log("fileInfo ======= ", fileInfo);
            var chatGroupMsgContent = fileInfo.content;
            targetDir = confservice.getFilePath();
            var targetFileName = chatGroupMsgContent.fileName;
            var theExt = path.extname(targetFileName);
            
            var targetDir = confservice.getFilePath(fileInfo.timestamp);
            var targetPath = path.join(targetDir, fileInfo.msgId + theExt);
            
            var needOpen = false;
            console.log("targetPath is ", targetPath)
            if(!fs.existsSync(targetPath)){
                // console.log("this.msg.timelineid is ", fileInfo.timelineId)
                // console.log("targetfilename is ", targetFileName);
                services.common.downloadFile(fileInfo.timelineId, fileInfo.timestamp, fileInfo.msgId + theExt, true, chatGroupMsgContent.fileSize);
            }
            else {
                shell.openItem(targetPath);
            }
        },
        getUserNameId: function(curMsg) {
            return "HistoryMsgListName-" + curMsg.user_id;
        },
        getFilterGroupImageId: function(groupItem) {
            return "FilterGroupListImg-" + groupItem.group_id;
        },
        getFilterSenderImageId: function(senderItem) {
            return "FilterGroupListImg-" + senderItem.user_id;
        },
        Close: function() {
            console.log("=======")
            ipcRenderer.send("AnotherClose");
        },
        Min: function() {
            ipcRenderer.send("AnotherMin");
        },
        getAppBaseData:async function() {
            // Init services
            this.selfUserInfo = await services.common.GetSelfUserModel();
            // Set accessToken in services
            this.loginInfo = await services.common.GetLoginModel();
            this.curUserInfo = await services.common.GetSelfUserModel();
            console.log("the init user id is ,", this.GroupInfo)
            confservice.init(this.curUserInfo.id);
            this.$store.commit("setUserId", this.curUserInfo.id)
            console.log("lognInfo is ", this.loginInfo);
            if(this.searchKey.length != 0) {
                this.search();
            }
            // this.updatePage();
        },
        MsgBelongUserName: function(curMsg) {
            console.log(curMsg)
            var userId = curMsg.fromId;
            var distId = this.getUserNameId(curMsg);
            console.log("distId is ", distId)
            var distUserNameElement = document.getElementById(distId);
            console.log("distusernameelememt ", distUserNameElement)
            
            services.common.GetDistUserinfo(userId)
                .then((userInfos) => {
                    var distUser = userInfos[0];
                    var distUserName = distUser.user_display_name;
                    distUserNameElement.innerHTML = distUserName;
                })
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
        getIcon: function(curItem) {
            var MsgContent = curItem.content;
            var iconPath = this.getFileIconThroughExt(MsgContent.ext);
            return iconPath;
        },
        getFileIconThroughExt: function(ext) {
            var iconPath = getIconPath(ext);
            return iconPath;
        },
        MsgBelongUserImg: async function (curMsg) {
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
        getFileInfo: function(curItem) {
            var MsgContent = curItem.content;
            var fileSize = (MsgContent.fileSize/1024).toFixed(2);
            var fileDate = this.MsgTime(curItem);
            var fileFromUserInfo = UserInfo.GetUserInfo(curItem.fromId);
            var fileFromUserName = '';
            if(fileFromUserInfo.length != 0) {
                fileFromUserName = fileFromUserInfo.user_display_name;
            }

            return fileSize + "K " + fileDate;
        },
        fileNameHeightLight: function(curItem) {
            var showContent = curItem.content.fileName;
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
        startTimeChanged: function() {
            console.log("========== ", this.startTime)
            this.search();
        },
        search: async function() {
            if(this.searchKey.length == 0) {
                return;
            }

            // console.log("this.searchKeylneth ", this.searchKey.length);
            var curSearchId = new Date().getTime();
            console.log("searchkey is ", this.searchKey);
            var searchResult = {
                "id": curSearchId,
                "searchList": []
            };
            this.searchId = searchResult.id;
            console.log("startTime ", this.startTime);
            var selectedSenderIds = [];
            for(let i=0;i<this.selectedSenders.length;i++) {
                selectedSenderIds.push(this.selectedSenders[i].user_id);
            }
            var selectedGroupIds = [];
            for(let i=0;i<this.selectedGroups.length;i++) {
                selectedGroupIds.push(this.selectedGroups[i].group_id);
            }
            var ret = await services.common.SearchFiles(this.searchKey, this.numIndex, 50, selectedSenderIds, selectedGroupIds, this.startTime);
            console.log(ret);
            if(ret.length != 0) {
                this.showEmpty = false;
            }
            else {
                this.showEmpty = true;
            }
            this.numIndex = ret.length;
            this.messageListShow = [];
            console.log(searchResult.id)
            console.log(this.searchId)
            if(searchResult.id == this.searchId) {
                this.messageListShow = ret;
                console.log(this.messageListShow)
                setTimeout(() => {
                    this.$nextTick(() => {
                        this.updatePage();
                    })
                }, 500)
            }
            // this.searchId = curSearchId;
            // var ret = await services.common.SearchFiles(this.searchKey)
            // var messageListTmp = ret;
            // this.messageListShow = [];
            // this.originalMessageList = [];
            // console.log("this. is ", ret)
            // for(var i=0;i<messageListTmp.length;i++){
            //     this.messageListShow.unshift(messageListTmp[i]);
            //     this.originalMessageList.unshift(messageListTmp[i]);
            // }
            
            // console.log("this.filelistshow is ", this.messageListShow);
        },
        msgContentHeightLight: function(curMsg) {
            var showContent = curMsg.user_display_name;
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
        MsgContent: function(curMsg) {
            var tmpContent = curMsg.content;
            return tmpContent.text;
        },
        getMsgTime: function(curMsg) {
            var fileDate = this.MsgTime(curMsg);
            return fileDate;
        },
        showSeletcteGroupInfo: async function() {
            for(let i=0;i<this.selectedGroups.length;i++) {
                var curItem = this.selectedGroups[i];
                var distGroupImgElement = document.getElementById(this.getFilterGroupImageId(curItem));
                
                var distTAvatar = curItem.group_avarar;
                var targetPath = '';
                if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(distTAvatar, curItem.group_id))){
                    console.log("targetPath is ", targetPath);
                    distGroupImgElement.setAttribute("src", targetPath);
                }
            }
        },
        showSeletcteSenderInfo: async function() {
            for(let i=0;i<this.selectedSenders.length;i++) {
                var curItem = this.selectedSenders[i];
                var distSenderImgElement = document.getElementById(this.getFilterSenderImageId(curItem));
                
                var targetPath = "";
                if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(curItem.avatar_t_url, curItem.user_id))){
                    distSenderImgElement.setAttribute("src", targetPath);
                }
            }
        },
        updatePage: function() {
            this.showSeletcteGroupInfo();
            this.showSeletcteSenderInfo();
        },
        updateSelectedGroups: async function(event, selectedGroupIds) {
            console.log("searchfilelist updateselected groups ", selectedGroupIds)
            this.selectedGroups = [];
            for(let i=0;i<selectedGroupIds.length;i++) {
                let groupItems = await Group.FindGroupByID(selectedGroupIds[i]);
                console.log("groupitem is ", groupItems);
                if(groupItems.length != 0) {
                    this.selectedGroups.push(groupItems[0]);
                }
            }
            this.$nextTick(() => {
                setTimeout(() => {
                    this.updatePage()
                    this.numIndex = 0;
                    this.search();
                }, 0)
            })
            
        },
        updateSelectedSenders: async function(event, selectedSenderIds) {
            console.log("selectedSenderIds ", selectedSenderIds);
            this.selectedSenders = [];
            for(let i=0;i<selectedSenderIds.length;i++) {
                let senderItems = await UserInfo.GetUserInfo(selectedSenderIds[i]);
                console.log("groupitem is ", senderItems);
                if(senderItems != undefined) {
                    this.selectedSenders.push(senderItems);
                }
            }
            this.$nextTick(() => {
                setTimeout(() => {
                    this.updatePage()
                    this.numIndex = 0;
                    this.search();
                }, 0)
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
        ipcRenderer.on("distGroupInfo", (event, receivedSearchKey) => {
            this.receivedSearchKey = receivedSearchKey;
            this.searchKey = receivedSearchKey;
            this.$nextTick(() => {
                setTimeout(() => {
                    this.search();
                }, 0)
            })
        })
        ipcRenderer.on("searchAddedMembers", this.updateSelectedGroups);
        ipcRenderer.on("searchAddedSenders", this.updateSelectedSenders);
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
        width: calc(100% - 94px);
        height: 20px;
        background: rgba(255, 255, 255, 1);
        padding-top: 0px;
        // padding-left: 12px;
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
        height: 40px;
        line-height: 40px;
        display: inline-block;
        margin-left: 20px;
        vertical-align: top;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
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
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        font-size: 12px;
        color: rgba(153, 153, 153, 1);
        background-color: rgba(1, 1, 1, 0);
    }

    .HistoryMsgEmpty {
        width:100%;
        height: 300px;
        background-color: white;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;  
    }

    .fileInfoNameLabel {
        display: block;
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 1px;
    }

    .fileInfoDetailLabel {
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

    .HistoryMsgEmptyBg {
        width: 84px;
        height: 84px;
        background-color: white;
    }

    .HistoryMsgEmptyText {
        width:104px;
        height:18px;
        font-size:12px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(153,153,153,1);
        line-height:18px;
        letter-spacing:1px;
    }

    .filter-header {
        width: 560px;
        height: 40px;
    }

    .fileter-header-label {
        width: 80px;
        height: 40px;
        line-height: 40px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        color:rgba(102, 102, 102, 1);
    }

    .filter-img {
        width: 16px;
        height: 16px;
        display: inline-block;
        margin: 0px 6px 2px 6px;
        vertical-align: middle;
    }

    .el-icon-arrow-down {
        float: right;
        width: 14px;
        height: 14px;
        display: inline-block;
        margin: 13px 6px 13px 6px;
    }

    .el-icon-arrow-up {
        float: right;
        width: 14px;
        height: 14px;
        display: inline-block;
        margin: 13px 6px 13px 6px;
    }

    .filter-group {
        width: 560px;
        height: 40px;
    }

    .filter-group-label {
        display: inline-block;
        width: 52px;
        height: 40px;
        line-height: 40px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        color:rgba(102, 102, 102, 1);
        margin-left: 6px;
        vertical-align: top;
    }

    .filter-group-list {
        display: inline-block;
        width: calc(100% - 150px);
        height: 40px;
        margin: 0;
        float: right;
    }

    .filterGroupItem {
        display: inline-block;
        width: 20px;
        height: 40px;
        float: right;
        margin: 0 3px 0 3px;
    }

    .filterGroupImage {
        width: 20px;
        height: 20px;
        margin: 10px 0 10px 0px;
        border-radius:4px;
    }
    
    .filter-sender {
        width: 560px;
        height: 40px;
    }

    .filter-sender-label {
        display: inline-block;
        width: 62px;
        height: 40px;
        line-height: 40px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        color:rgba(102, 102, 102, 1);
        margin-left: 6px;
        vertical-align: top;
    }

    .filter-sender-list {
        display: inline-block;
        width: calc(100% - 150px);
        height: 40px;
        margin: 0;
        float: right;
    }

    .filterSenderItem {
        display: inline-block;
        width: 20px;
        height: 40px;
        float: right;
        margin: 0 3px 0 3px;
    }

    .filterSenderImage {
        width: 20px;
        height: 20px;
        margin: 10px 0 10px 0px;
        border-radius:4px;
    }
    
    .filter-time {
        width: 560px;
        height: 40px;
    }

    .filter-time-label {
        display: inline-block;
        width: 62px;
        height: 40px;
        line-height: 40px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        color:rgba(102, 102, 102, 1);
        margin-left: 6px;
        vertical-align: top;
    }

    .filter-time-time-label {
        display: inline-block;
        width: 100px;
        height: 40px;
        line-height: 40px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        color:rgba(102, 102, 102, 1);
        margin: 0 3px 0 3px;
        float: right;
    }

    .filterTimeImage {
        width: 20px;
        height: 20px;
        margin: 10px 0 10px 0px;
        float: right;
    }

    .filter-time-picker-div {
        display: inline-block;
        width: 130px;
        height: 32px;
        margin: 4px 0 4px 0;
        float: right;
    }
    
    .SearchFileList {
        list-style: none;
        max-height: 320px;
        width: 100%;
        margin-top: 20px;
        padding: 0;
        display: block;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .messageItem {
        width: 100%;
        min-height: 64px;
        padding: 0;    
    }

    .messageItem:hover {
        width: 100%;
        min-height: 64px;
        padding: 0;
        background-color: rgba(221, 221, 221, 1);
    }
    
    .messageOwnerImage {
        display: inline-block;
        margin: 0 0 0 4px;
        padding: 16px 0px 16px 0px;
        width: 32px;
        height: 32px;
        border-radius:4px;
    }

    .messageInfoDiv {
        display: inline-block;
        padding: 12px 0px 12px 4px;
        width: calc(100% - 62px);
        min-height: 40px;
        vertical-align: top;
    }

    .messageOwnerTimeDiv {
        display: block;
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-family:PingFangSC-Regular;
        font-weight: 590;
    }

    .messageInfoOwnerNameLabel {
        display: inline-block;
        color: rgba(153, 153, 153, 1);
        width: 70%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        float: left;
    }

    .messageInfoTimeLabel {
        display: inline-block;
        color: rgba(153, 153, 153, 1);
        width: 30%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        float: right;
    }

    .messageInfoDetailLabel {
        display: block;
        width: 100%;
        min-height: 18px;
        line-height: 18px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
    }

</style>
