<template>
    <div class="FileListDlg" id="FileListDlgId" @click="hideSth($event)">
        <winHeaderBar :showMax="false" @Close="Close" @Min="Min"></winHeaderBar>
        <div class="FileListDlgHeader">
            <img class="FileListDlgHeaderImg" id="FileListDlgHeaderImgId" @click="Close()">
            <div class="FileListDlgHeaderTitle">{{GroupName}}</div>
        </div>
        <div class="FileListDlgContent">
            <div class="search">
                <input class="FileListDlgSearchInput" placeholder="文件..." v-model="searchKey" @input="search" @keyup.enter="search">
                <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" @click="search">
            </div>
            <ul class="file-list">
                <li v-for="(item, index) in fileListShow" class="fileItem">
                    <img class="fileImage" :id="getFileIconId(item)" :src="getIcon(item)" @click="openFile(item)">
                    <div class="fileInfoDiv" @click="openFile(item)">
                        <label class="fileInfoNameLabel" v-html="fileNameHeightLight(item)"></label>
                        <label class="fileInfoDetailLabel">{{getFileInfo(item)}}</label>
                    </div>
                    <img class="fileOperate" src="../../../static/Img/Chat/more@2x.png" @click="showOperate($event, item)">
                </li>
            </ul>
        </div>
        <div class="fileList-operate-dropdown-content" id="fileList-operate-dropdown-content-id" v-show="showFileListOperateMenu">
            <div class="fileList-operate-transmit" @click="transmit()">
                转发
            </div>
            <div class="fileList-operate-download" @click="download()" v-show="needDownload">
                下载
            </div>
            <div class="fileList-operate-openLocal" @click="showFile()" v-show="!needDownload">
                打开文件夹
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil, getIconPath, Appendzero, JsonMsgContentToString} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import * as fs from 'fs-extra'
import * as path from 'path'
import {ipcRenderer, remote} from 'electron'
import winHeaderBar from './win-header.vue'
import confservice from '../../packages/data/conf_service.js'
import {shell} from 'electron'
import { Group } from '../../packages/data/sqliteutil.js'
export default {
    name: 'FileListDlg',
    data () {
        return {
            GroupName: '',
            fileListShow: [],
            searchKey: '',
            GroupInfo: null,
            fileListInfo: null,
            groupId: '',
            operatedItem: null,
            operateMenuElement: null,
            showFileListOperateMenu: false,
            needDownload: false,
            originalFileList: [],
            lastSequenceId: 0,
            pageName: '',
        }
    }, 
    methods: {
        transmit: function() {
            var transmitInfo = {
                "message_content": JsonMsgContentToString(this.operatedItem.content),
                "group_id": this.operatedItem.group_id,
                "message_from_id": this.operatedItem.fromId,
                "message_id": this.operatedItem.msgId,
                "message_timestame": this.operatedItem.timestamp,
                "message_type": this.operatedItem.msgContentType,
                "sequence_id": this.operatedItem.sequenceId,
                "time_line_id": this.operatedItem.timelineId,
            }
            var transmitInfoStr = JsonMsgContentToString(transmitInfo);
            var exchangeObj = {
                "name": this.pageName,
                "transmitInfo": transmitInfoStr
            }
            console.log("this.operatedItem.sequenceId ", transmitInfoStr);
            ipcRenderer.send("transmitFromSoloDlg", exchangeObj);
        },
        showFile: function() {
            console.log("this.operateItem is ", this.operatedItem);
            var targetDir = confservice.getFilePath(this.operatedItem.timestamp);
            shell.openItem(targetDir);
        },
        updateMsgFile(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var needOpen = args[4];

            var distName = '';
            for(let i=0;i<this.fileListShow.length;i++) {
                var curItem = this.fileListShow[i];
                if(curItem.timelineId == id) {
                    distName = curItem.content.fileName;
                }
                this.$message(distName, '下载完成');
            }
        },
        download: async function(curItem) {
            // console.log(curItem);
            // console.log("this.fileListShow ", this.fileListShow);
            if(curItem == undefined) {
                curItem = this.operatedItem;
            }
            var targetFileName = curItem.content.fileName;
            var ext = path.extname(targetFileName);
            await services.common.downloadFile(curItem.timelineId, curItem.timestamp, curItem.msgId + ext, false)
        },
        openFile: async function(curItem) {
            // console.log(curItem);
            if(curItem == undefined) {
                curItem = this.operatedItem;
            }
            var targetPath = "";
            var targetFileName = curItem.content.fileName;
            var ext = path.extname(targetFileName);
            if(fs.existsSync(targetPath = await services.common.downloadFile(curItem.timelineId, curItem.timestamp, curItem.msgId + ext, true))) {
                shell.openItem(targetPath);
            }
        },
        hideSth: function(event) {
            console.log("event is ", event)
            if(event.target.className != "fileOperate") {
                this.showFileListOperateMenu = false;
            }
        },
        Close: function() {
            this.clearToEmpyt();
            ipcRenderer.send("AnotherClose", this.pageName);
            // this.$emit("Close");
        },
        clearToEmpyt: async function() {
            var groupIcoElement = document.getElementById("FileListDlgHeaderImgId");
            this.GroupName = '';
            groupIcoElement.setAttribute("src", "../../../static/Img/User/user-40px@2x.png");

            this.fileListShow = [];
        },
        Min: function() {
            // this.$emit("Min");
            ipcRenderer.send("AnotherMin", this.pageName);
        },
        showOperate: function(event, operatedItem) {
            console.log("operate item is ", operatedItem);
            var dropDownWidth = 80;
            if(this.operateMenuElement == null) {
                this.operateMenuElement = document.getElementById("fileList-operate-dropdown-content-id");
            }
            var targetPath = "";
            if(targetPath.length == 0) {
                var chatGroupMsgContent = operatedItem.content;
                console.log("chatGroupMsgContent ", chatGroupMsgContent)
                var targetFileName = chatGroupMsgContent.fileName;
                var msgId = operatedItem.msgId;
                var ext = path.extname(targetFileName);
                var targetDir = confservice.getFilePath(operatedItem.timestamp);
                targetPath = path.join(targetDir, msgId + ext);
                console.log("target path is ", targetPath);
            }
            if(fs.existsSync(targetPath)) {
                this.needDownload = false
                dropDownWidth = 80;
            }
            else {
                this.needDownload = true;
                dropDownWidth = 80;
            }
            console.log("showoperate this.operateMenuElement.ClientWidth is ", this.operateMenuElement.offsetWidth);
            var targetElement = event.target;
            var left = targetElement.offsetLeft + targetElement.clientWidth - dropDownWidth;
            var top = targetElement.offsetTop + targetElement.clientHeight/2;
            this.operatedItem = operatedItem;
            this.operateMenuElement.style.top = top + "px";
            this.operateMenuElement.style.left = left + "px";
            this.showFileListOperateMenu = true;
        },
        getAppBaseData:async function() {
            // Init services
            await services.common.init();
            this.selfUserInfo = await services.common.GetSelfUserModel();
            // Set accessToken in services
            this.loginInfo = await services.common.GetLoginModel();
            this.curUserInfo = await services.common.GetSelfUserModel();
            this.GroupInfo = await Group.FindItemFromGroupByGroupID(this.groupId);
            this.fileListInfo = await services.common.ListGroupFiles(this.groupId, this.lastSequenceId);
            console.log("the fileListInfo is ,", this.fileListInfo)
            confservice.init(this.curUserInfo.id);
            // this.$store.commit("setUserId", this.curUserInfo.id)
            console.log("lognInfo is ", this.loginInfo);
            
            this.updatePage();
        },
        MsgBelongUserName: function(curItem) {
            if(curItem === null) {
                return '';
            }
            else {
                var res = this.$store.getters.getChatUserName(curItem.fromId);
                return res;
            }
        },
        // Get formate message time
        MsgTime(curItem) {
            if(curItem === null) {
                return "";
            }
            var secondsTime = curItem.timestamp;
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
        showGroupInfo: async function(chatGroupItem) {
            console.log("showGroupInfo groupinfo is ", this.GroupInfo)
            if(this.GroupInfo.group_id == null || this.GroupInfo.group_id == undefined){
                return "";
            }
            var groupIcoElement = document.getElementById("FileListDlgHeaderImgId");
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
            this.$nextTick(() => {
                setTimeout(() => {
                    for(var i=0;i<this.fileListShow.length;i++) {
                        var elementIdTmp = this.getFileIconId(this.fileListShow[i]);
                        var elementTmp = document.getElementById(elementIdTmp);
                        console.log("elementtmp is ", elementTmp)
                        if(elementTmp != undefined) {
                            elementTmp.setAttribute("src", this.getIcon(this.fileListShow[i]));
                        }
                    }
                }, 0)
            })

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
        search: function() {
            if(this.searchKey.length == 0) {
                this.fileListShow = this.originalFileList;
                this.showGroupInfo();
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
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.showGroupInfo();
                    }, 0)
                })
            }
        },
        getFileName: function(curItem) {
            var MsgContent = curItem.content;
            return MsgContent.fileName;
        },
        getFileInfo: function(curItem) {
            var MsgContent = curItem.content;
            var fileSize = (MsgContent.fileSize/1024).toFixed(2);
            var fileDate = this.MsgTime(curItem);
            var fileFromUserName = this.MsgBelongUserName(curItem);
            return fileSize + " " + fileFromUserName + " " + fileDate;
        },
        getIcon: function(curItem) {
            var MsgContent = curItem.content;
            var iconPath = this.getFileIconThroughExt(MsgContent.ext);
            return iconPath;
        },
        getFileIconId: function(curItem) {
            return "fileListItem-" + curItem.msgId;
        },
        getFileList: function() {
            this.fileListShow = [];
            this.originalFileList = [];
            for(var i=0;i<this.fileListInfo.length;i++){
                this.fileListShow.unshift(this.fileListInfo[i]);
                console.log("this filelist infor is ", this.fileListInfo[i]);
                this.originalFileList.unshift(this.fileListInfo[i]);
            }
        },
        updatePage: function() {
            console.log("filelist group info is ", this.fileListInfo);
            this.getFileList();
            this.showGroupInfo(this.GroupInfo);
        }
    },
    components: {
        winHeaderBar,
    },
    created: async function () {
    },
    mounted: function() {
        ipcRenderer.on('updateMsgFile', this.updateMsgFile);
        ipcRenderer.on("distGroupInfo", (event, groupId, pageName) => {
            console.log("======distgroupinfo is ", groupId, " pagename is ", pageName);
            this.groupId = groupId;
            this.pageName = pageName;
            this.lastSequenceId = 0;
            this.$nextTick(() => {
                setTimeout(async () => {
                    await this.getAppBaseData();
                }, 0)
            })
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
    
    .FileListDlg {
        width: 600px;
        height: 468px;
        background: rgba(255, 255, 255, 1);
        box-shadow:0px 0px 30px 0px rgba(103,103,103,0.24);
        border-radius:4px
    }

    .FileListDlgHeader {
        width: calc(100% - 64px);
        height: 52px;
        padding-top: 20px;
        padding-left: 12px;
        background: rgba(255, 255, 255, 1);
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
    }

    .FileListDlgHeaderImg {
        width: 32px;
        height: 32px;
        margin: 10px 12px 20px 10px;
        border-radius:4px;
        vertical-align: center;
        display: inline-block;
        -webkit-app-region: drag;
    }

    .FileListDlgHeaderTitle {
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

    .FileListDlgContent {
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
    
    .FileListDlgSearchInput {
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

    .file-list {
        list-style: none;
        max-height: 320px;
        margin: 0;
        padding: 0;
        display: block;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .fileItem {
        width: 100%;
        height: 64px;
        padding: 0;    
    }

    .fileItem:hover {
        width: 100%;
        height: 64px;
        padding: 0;
        background-color: rgba(221, 221, 221, 1);
    }
    
    .fileOperate {
        width: 24px;
        height: 24px;
        padding: 20px 8px 20px 8px;
    }

    .fileOperate:hover {
        width: 24px;
        height: 24px;
        padding: 20px 8px 20px 8px;
        background-color: rgba(221, 221, 221, 1);
    }

    .fileImage {
        display: inline-block;
        margin: 0 0 0 4px;
        padding: 12px 0px 12px 0px;
        width: 40px;
        height: 40px;
    }

    .fileInfoDiv {
        display: inline-block;
        padding: 12px 0px 12px 4px;
        width: calc(100% - 100px);
        height: 40px;
        vertical-align: top;
    }

    .fileInfoNameLabel {
        display: block;
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-family:Microsoft Yahei;
        font-weight: 590;
    }

    .fileInfoDetailLabel {
        display: block;
        width: 100%;
        height: 18px;
        line-height: 18px;
        font-size: 12px;
        font-family:Microsoft Yahei;
        color: rgba(153, 153, 153, 1);
    }

    .fileList-operate-dropdown-content {
        position: absolute;
        background-color: rgba(255, 255, 255, 1);
        min-width: 80px;
        max-width: 100px;
        height: 64px;
        border-radius: 4px;
        box-shadow:0px 0px 12px 0px rgba(103,103,103,0.14);
        border:1px solid rgba(221,221,221,1);
    }

    .fileList-operate-dropdown-content div:hover {
        background-color: rgba(221, 221, 221, 1);
        cursor: pointer;
    }

    .fileList-operate-transmit {
        display: block;
        min-width: 80px;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        color: rgba(51, 51, 51, 1);
        font-family: 'Microsoft YaHei';
        background-color: rgba(0, 0, 0, 0);
        text-align:center;
    }

    .fileList-operate-download {
        display: block;
        min-width: 80px;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        color: rgba(51, 51, 51, 1);
        font-family: 'Microsoft YaHei';
        background-color: rgba(0, 0, 0, 0);
        text-align:center;
    }

    .fileList-operate-openLocal {
        display: block;
        min-width: 80px;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        color: rgba(51, 51, 51, 1);
        font-family: 'Microsoft YaHei';
        background-color: rgba(0, 0, 0, 0);
        text-align:center;
    }

</style>
