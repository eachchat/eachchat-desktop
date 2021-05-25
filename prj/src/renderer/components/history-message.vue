<template>
    <div class="HistoryMsgDlg" id="HistoryMsgDlgId">
        <!-- <winHeaderBar :showMax="false" @Close="Close" @Min="Min"></winHeaderBar> -->
        <div class="HistoryMsgDlgHeader">
            <img class="HistoryMsgDlgHeaderImg" src="../../../static/Img/User/user-40px@2x.png" id="HistoryMsgDlgHeaderImgId">
            <div class="HistoryMsgDlgHeaderTitle">{{GroupName}}</div>
        </div>
        <div class="HistoryMsgDlgContent">
            <div class="search">
                <input class="HistoryMsgDlgSearchInput" placeholder="搜索" v-model="searchKey" @input="search" @keyup.enter="search">
                <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" @click="search">
            </div>
            <ul class="HistoryMsg-list">
                <li v-for="(item, index) in messageListShow" class="messageItem">
                    <img class="messageOwnerImage" src="../../../static/Img/User/user-40px@2x.png" :id="getUserHeadImageId(item)" @click="openFile(item)">
                    <div class="messageInfoDiv">
                        <div class="messageOwnerTimeDiv">
                            <label class="messageInfoOwnerNameLabel" :id="getUserNameId(item)"></label>
                            <label class="messageInfoTimeLabel">{{getMsgTime(item)}}</label>
                        </div>
                        <div class="messageInfoDetailLabel" v-html="msgContentHeightLight(item)"></div>
                    </div>
                </li>
            </ul>
            <div class="HistoryMsgEmpty" v-show="showEmpty">
                <img class="HistoryMsgEmptyBg" src="../../../static/Img/MessageHistory/search-empty@2x.png">
                <div class="HistoryMsgEmptyText">搜索会话中的消息</div>
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil, getIconPath, Appendzero, sliceReturnsOfString} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import * as fs from 'fs-extra'
import * as path from 'path'
import {ipcRenderer} from 'electron'
import winHeaderBar from './win-header.vue'
import confservice from '../../packages/data/conf_service.js'
import { Group } from '../../packages/data/sqliteutil'
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
            showEmpty: true,
        }
    },  
    methods: {
        getUserNameId: function(curMsg) {
            return "HistoryMsgListName-" + curMsg.sequenceId;
        },
        getUserHeadImageId: function(curMsg) {
            return "HistoryMsgListImg-" + curMsg.sequenceId;
        },
        checkGetUserHedImageId: function(id) {
            return "HistoryMsgListImg-" + id;
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
        showGroupInfo: async function(chatGroupItem) {
            console.log("showGroupInfo groupinfo is ", this.GroupInfo)
            if(this.GroupInfo.group_id == null || this.GroupInfo.group_id == undefined){
                return "";
            }
            var groupIcoElement = document.getElementById("HistoryMsgDlgHeaderImgId");
            var groupContentNum = "";
            var aboutUids = this.GroupInfo.contain_user_ids.split(",");
            this.GroupName = this.GroupInfo.group_name;
            if(this.GroupName.length == 0) {
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
            if(this.GroupInfo.group_type == 101) {
                this.GroupName = this.GroupName + ' (' + aboutUids.length + ')';
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

            for(let i=0;i<this.messageListShow.length;i++) {
                var curItem = this.messageListShow[i];
                var userId = curItem.fromId;
                var distUserImgElement = document.getElementById(this.getUserHeadImageId(curItem));
                var distUserNameElement = document.getElementById(this.getUserNameId(curItem));
                
                var userInfos = await services.common.GetDistUserinfo(userId)
                var distUser = userInfos[0];
                var distUserName = distUser.user_display_name;
                distUserNameElement.innerHTML = distUserName;
                var distTAvatar = distUser.avatar_t_url;
                var targetPath = '';
                console.log("cur item is ", curItem.sequenceId)
                if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(distTAvatar, userId, '', curItem.sequence_id))){
                    console.log("cur it is ", curItem.sequenceId)
                    distUserImgElement.setAttribute("src", targetPath);
                }
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
                let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
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
            services.common.historyMessage(this.GroupInfo.group_id, this.GroupInfo.sequence_id, 50)
                .then((ret) => {
                    var messageListTmp = ret;
                    this.messageListShow = [];
                    this.originalMessageList = [];
                    console.log("this. is ", ret)
                    for(var i=0;i<messageListTmp.length;i++){
                        if(messageListTmp[i].message_type == 101) {
                            this.messageListShow.unshift(messageListTmp[i]);
                            this.originalMessageList.unshift(messageListTmp[i]);
                        }
                    }
                    // console.log("this.filelistshow is ", this.messageListShow);
                })
        },
        updatePage: function() {
            console.log("filelist group info is ", this.GroupInfo);
            if(this.GroupInfo == undefined) {
                return;
            };
            
            // this.getHistoryMessage(this.GroupInfo);
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
    components: {
        winHeaderBar,
    },
    created: async function () {
        await this.getAppBaseData();
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
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
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
        width: calc(100%-2px);
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
        letter-spacing: 0px;
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
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(153,153,153,1);
        line-height:18px;
        letter-spacing: 0px;
    }

    .HistoryMsg-list {
        list-style: none;
        max-height: 320px;
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
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
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
        letter-spacing: 0px;
        float: right;
    }

    .messageInfoDetailLabel {
        display: block;
        width: 100%;
        min-height: 18px;
        line-height: 18px;
        font-size: 13px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
    }

</style>
