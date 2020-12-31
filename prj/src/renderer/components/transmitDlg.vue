<template>
    <div class="TransmitLayers" id="TransmitLayersId" >
        <div :style="dlgPosition" class="TransmitDlg" id="TransmitDlgId">
            <div class="TransmitHeader">
                <div class="TransmitHeaderTitle">{{ dialogTitle }}</div>
                <img ondragstart="return false" class="TransmitClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            
            <el-container class="TransmitContent" v-show="!showCreateNewChat">
                <el-aside class="ListView" width="280px">
                    <div class="search">
                    <input class="search-input" v-model="searchKey" @input="search" placeholder="搜索..." >
                </div><div class="search-action">
                        
                        <div class="search-delete">
                            <img ondragstart="return false" class="icon-delete" v-show="searchKey" @click="searchDeleteClicked()" src="../../../static/Img/Navigate/searchDelete-20px@2x.png">
                            
                        </div><div class="search-search">
                    
                            <img ondragstart="return false" class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" >
                        </div>
                    </div>
                    <div class="searchView" v-if="showSearchView">
                        <ul class="searchGroupList">
                            <li class="searchGroup" v-for="(group, index) in searchGroup" :key="index">
                                <input type="checkBox" class="multiSelectCheckbox" :checked="groupChecked(group)" @click="groupCheckBoxClicked(group)">
                                <img ondragstart="return false" class="group-icon" :id="'search' + group.roomId" src="../../../static/Img/User/user-40px@2x.png">
                                <div class="group-info">
                                    <p class="group-name">{{ group.name }}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="NewChatView" v-show="!showSearchView && false">
                        <img ondragstart="return false" class="icon-chat-more" src="../../../static/Img/Favorite/Util/createNewChat-24px@2x.png" @click="createNewChatButtonClicked()">
                        <div class="createNewChatInfo" @click="createNewChatButtonClicked()">
                        <p class="createNewChatTitle">创建新聊天</p>
                        </div>
                    </div>
                    <div class="RecentChatHeader" v-show="!showSearchView">
                        最近聊天
                    </div>
                    <div class="RecentChatView" v-show="!showSearchView">
                            <ul class="recentChatList">
                                <li class="recentChat" v-for="(group, index) in showRecentChat" :key="index">
                                    <input type="checkBox" class="multiSelectCheckbox" :checked="groupChecked(group)" @click="groupCheckBoxClicked(group)">
                                    <img ondragstart="return false" class="group-icon" :id="'transmit' + group.roomId" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="group-info">
                                        <p class="group-name">{{ group.name }}</p>
                                    </div>
                                </li>
                            </ul>
                    </div>
                </el-aside>
                <el-main class="selectedView">
                    <div class="selectedHeader">
                        已选:{{ selectedGroups.length }}
                    </div>
                    <div class="selectedContentView">
                        <ul class="selectedGroupList">
                            <li class="selectedGroup" v-for="(group,index) in selectedGroups" :key="index">
                                <img ondragstart="return false" class="group-icon" :id="'selected' + group.roomId" src="../../../static/Img/User/user-40px@2x.png">
                                <div class="group-info">
                                    <p class="group-name">{{ group.name }}</p>
                                </div>
                                <img ondragstart="return false" class="group-delete-icon" src="../../../static/Img/Chat/delete-20px@2x.png" @click="deleteGroupFromSelectedGroups(group)">
                            </li>
                        </ul>
                    </div>
                </el-main>
            </el-container>
            <chatCreaterContent ref="chatCreaterContent" v-if="showCreateNewChat" :rootDepartments="rootDepartments" :disableUsers="chatCreaterDisableUsers"></chatCreaterContent>
            <div class="TransmitFotter" v-show="!showCreateNewChat">
                <button class="TransmitCancleButton" @click="closeDialog()">取消</button>
                <button class="TransmitConfirmButton" @click="Transmit()" :disabled="selectedGroups.length==0">确认</button>
            </div>
            <div class="TransmitFotter" v-show="showCreateNewChat">
                <button class="TransmitCancleButton" @click="closeDialog()">取消</button>
                <button class="TransmitConfirmButton" @click="createGroupAndTransmit()">确认</button>
            </div>
        </div>
    </div>
</template>

<script>
//import {strMsgContentToJson, FileUtil} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import {APITransaction} from '../../packages/data/transaction.js'
import * as fs from 'fs-extra'
import {ipcRenderer, remote} from 'electron'
import { object } from '../../packages/core/types'
import confservice from '../../packages/data/conf_service';
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil, makeFlieNameForConflict } from '../../packages/core/Utils.js'
import * as path from 'path'
import chatCreaterContent from './chatCreaterContent.vue';
import {UserInfo, Department, Group, Collection} from '../../packages/data/sqliteutil.js';
import conf_service from '../../packages/data/conf_service'
export default {
    name: 'TransmitDlg',
    components:{
        chatCreaterContent,
    },
    props: {
        collectionInfo: {
            type: Object,
            default: function(){
                return {};
            }
        },
        transmitCollection:{
            type: Boolean,
            default: false
        },
        transmitTogether: {
            type: Boolean,
            default: false
        },
        curChat:{
            type: Object,
            default: function () {
                return {};
            }
        },
        transmitMessages: {
            type: Array,
            default: function () {
                return [];
            }
        },

    },
    computed: {
        groupChecked() {
            return function(group) {
                if (this.indexOfGroupInSelected(group) != -1){
                    return true;
                }
                else{
                    return false;
                }
            }
        },
        dialogTitle() {
            if(this.showCreateNewChat) {
                return "创建新聊天";
            }
            else {
                return "转发";
            }
        }
    },
    data () {
        return {
            recentGroups: [],
            showRecentChat: [],
            showCreateNewChat: false,
            TransmitDlgElement: null,
            TransmitLayersElement: null,
            imgHeight: 468,
            imgWidth: 624,
            ipcInited: false,
            TransmitContent: "",
            groupId: "",
            dlgPosition:{},
            selectedGroups: [],

            curUserInfo: undefined,
            rootDepartments:[],
            chatCreaterDisableUsers:[],

            searchKey:'',
            showSearchView: false,
            searchGroup: [],
        }
    },
    methods: {
        GetLastShowMessage(chatGroupItem){
            for(var i=chatGroupItem.timeline.length-1;i>=0;i--) {
                var timeLineTmp = chatGroupItem.timeline[i];
                if(['m.room.message', 'm.room.encrypted', 'm.room.name', 'm.room.create'].indexOf(timeLineTmp.getType()) >= 0) {
                return timeLineTmp;
                }
            }
        },
        SortGroupByTimeLine(item1, item2){
            let timeline1 = 0;
            let timeline2 = 0;
            if(item1.timeline.length != 0){
                let msg1 = this.GetLastShowMessage(item1);
                if(msg1 && msg1.event){
                timeline1 = msg1.event.origin_server_ts;
                }
                else{
                timeline1 = 0;
                }
            }
            if(item2.timeline.length != 0){
                let msg2 = this.GetLastShowMessage(item2);
                if(msg2 && msg2.event){
                timeline2 = msg2.event.origin_server_ts;
                }
                else{
                timeline2 = 0;
                }
            }
            return timeline2 - timeline1;
        },
        updateGroupImg(e, arg) {
            var state = arg[0];
            var stateInfo = arg[1];
            var id = arg[2];
            var localPath = arg[3];

            let elementImg = document.getElementById(id);
            console.log("element img is ", elementImg)
            if(elementImg == undefined) {
                return;
            }

            var showfu = new FileUtil(localPath);
            let showfileObj = showfu.GetUploadfileobj();
            var reader = new FileReader();
            reader.readAsDataURL(showfileObj);
            reader.onloadend = () => {
                elementImg.setAttribute("src", reader.result);
            }
        },
        closeDialog() {
            this.display = false;
            this.$emit("closeTransmitDlg", "");
            
        },
        searchRoom(searchKey) {
            var searchResult = [];
            // console.log("search key is ", searchKey);
            for(var i=0;i<this.recentGroups.length;i++) {
                // console.log("the room name is ", this.showGroupList[i].name.indexOf(searchKey));
                if(this.recentGroups[i].name.indexOf(searchKey) >= 0) {
                // console.log("inininin put ");
                    searchResult.push(this.recentGroups[i]);
                }
            }
            return searchResult;
        },
        search:async function () {
            if(this.searchKey == ''){
                this.showSearchView = false;
                return;
            }
            this.showSearchView = true;
            this.searchGroup = this.searchRoom(this.searchKey);

            setTimeout(() => {
                this.$nextTick(function(){
                    for(var i = 0; i < this.searchGroup.length; i ++){
                        this.getGroupAvatarContent(this.searchGroup[i], 'search');
                    }
                });
            }, 0)
        },
        searchDeleteClicked(){
            this.searchKey = '';
            this.showSearchView = false;
        },
        deleteGroupFromSelectedGroups(group){
            var index = this.selectedGroups.indexOf(group);
            this.selectedGroups.splice(index, 1);
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedGroups.length; i ++){
                    this.getGroupAvatarContent(this.selectedGroups[i], 'selected');
                }
            });
        },
        groupCheckBoxClicked(group){
            if(this.selectedGroups.indexOf(group) != -1){
                var index = this.selectedGroups.indexOf(group);
                this.selectedGroups.splice(index, 1);
            }
            else{
                this.selectedGroups.push(group);
            }
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedGroups.length; i ++){
                    this.getGroupAvatarContent(this.selectedGroups[i], 'selected');
                }
            });
        },
        createNewChatButtonClicked:async function() {
            
            var self = await services.common.GetSelfUserModel();
            this.chatCreaterDisableUsers.push(self.id);
            var root = await Department.GetRoot();
            var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
            var temp = rootDepartmentModels;
            this.rootDepartments =  temp.sort(this.compare("show_order"));
            this.showCreateNewChat = true;
        },
        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        },
        indexOfGroupInSelected(group){
            var index = -1;
            for(var i = 0; i < this.selectedGroups.length; i ++){
                var id = group.roomId;
                if(id == this.selectedGroups[i].roomId){
                    index = i;
                    break;
                }
            }
            return index;
        },
        // selectedGroupImageId(id) {
        //     return "selected" + id;
        // },
        // UpdateTransmit: function() {
        //     if(this.TransmitContent.length == 0){
        //         alert("公告内容不能为空");
        //         return;
        //     }
        //     services.common.UpdateGroupTransmit(this.groupId, this.TransmitContent)
        //         .then((ret) => {
        //             console.log("ret ", ret)
        //             this.$emit("closeTransmitDlg", this.TransmitContent);
        //         })
        // },
        getGroupAvatarContent:async function(group, key='') {
            var groupAvatarElement = document.getElementById(key + group.roomId);
            // console.log("gtoup name is ", group.name);
            var distUrl = global.mxMatrixClientPeg.getRoomAvatar(group);
            // console.log("disturl is ", distUrl);
            if(!distUrl || distUrl == '') {
                let defaultGroupIcon;
                if(global.mxMatrixClientPeg.DMCheck(group))
                    defaultGroupIcon = "./static/Img/User/user-40px@2x.png";
                else
                    defaultGroupIcon = "./static/Img/User/group-40px@2x.png";
                groupAvatarElement.setAttribute("src", defaultGroupIcon); 
            }
            if(groupAvatarElement != undefined && distUrl) {
                console.log("to set src", groupAvatarElement);
                groupAvatarElement.setAttribute("src", distUrl);
            }
            else {
                console.log("groupAvatarElement is kng");
            }
        },
        calcImgPosition: function() {

            // console.log("remote.b")
            //console.log(document.documentElement.clientHeight);
            var showScreenHeight = document.documentElement.clientHeight;
            var showScreenWidth = document.documentElement.clientWidth;
            //console.log("showScreenHeight ", showScreenHeight)
            //console.log("showScreenWidth ", showScreenWidth)
            var left = (showScreenWidth - this.imgWidth) / 2;
            var top = (showScreenHeight - this.imgHeight) / 2;
            var ret = {
                "left": left,
                "top": top
            }

            return ret;
        },


        //transmit relation methods
        Transmit:async function() {
            // get createNewChat Users
            if(this.showCreateNewChat){
                console.log(this.$refs.chatCreaterContent.getSelectedUsers());
                this.$emit("closeTransmitDlg", "");
                this.$toastMessage({message:'转发成功', time:1500, type:'success'});
                return;
            }
            //
            if(this.transmitCollection){
                var suc = await this.sendSingleCollectionMsg(this.selectedGroups, this.collectionInfo);
                this.$emit("closeTransmitDlg", "");
                if(suc == false) {
                    this.$toastMessage({message:'转发失败', time:1500, type:'success'});
                }
                else {
                    this.$toastMessage({message:'转发成功', time:1500, type:'success'});
                }
                return;
            }
            await this.sendMsg(this.selectedGroups, this.transmitMessages);
            // for(var i=0;i<this.groupList.length;i++) {
            //     this.groupList[i].checkState = false;
            // }
            // this.selectedChat = [];
            this.$emit("closeTransmitDlg", "");
            this.$toastMessage({message:'转发成功', time:1500, type:'success'});
        },
        createGroupAndTransmit: async function() {
            console.log(this.$refs.chatCreaterContent.getSelectedUsers());
            var selectedUsers = this.$refs.chatCreaterContent.getSelectedUsers();
            var selfUser = await services.common.GetSelfUserModel();
            var groupUserIds = [];
            var groupUserName = []
            for(var i=0;i<selectedUsers.length;i++) {
                groupUserIds.push(selectedUsers[i].user_id)
                if(i < 4) {
                    groupUserName.push(selectedUsers[i].user_display_name)
                }
            }
            // console.log("group groupUserName ids is ", groupUserName)
            var groupName = '';
            if(groupUserName.length > 1) {
                groupName = groupUserName.join(",");
            }
            else if(groupUserName.length == 4) {
                groupName = groupUserName.join(",");
                groupName = groupName + "...";
            }
            else {
                groupName = groupUserName[0];
            }
            // console.log("group user ids is ", groupUserIds)
            // console.log("group groupName ids is ", groupName)
            if(selectedUsers.length == 0) {
                alert("未选择用户")
            }
            else if(selectedUsers.length == 1) {
                var groupItem = {};
                var selectedId = selectedUsers[0];
                var chatUserInfo = await UserInfo.GetUserInfo(selectedId.id);
                console.log("userInfos is ", chatUserInfo);
                var chatAvater = chatUserInfo.avatar_t_url;
                var chatName = chatUserInfo.user_display_name;
                var groupCheck = await Group.SearchChatByNameKey(chatName);
                console.log("groupCheck is ", groupCheck)
                groupUserIds.push(selfUser.id);
                var contain_user_ids = groupUserIds.join(",");
                if(groupCheck.contain_user_ids == undefined) {
                    groupItem["contain_user_ids"] = contain_user_ids;
                    groupItem["group_avarar"] = chatAvater;
                    groupItem["group_name"] = chatName;
                    groupItem["group_type"] = 102;
                    groupItem["last_message_time"] = 0;
                    groupItem["message_content"] = null;
                    groupItem["message_content_type"] = 101;
                    groupItem["message_from_id"] = selfUser.id;
                    groupItem["message_id"] = '';
                    groupItem["owner"] = null;
                    groupItem["sequence_id"] = 0;
                    groupItem["status"] = "00000000";
                    groupItem["un_read_count"] = 0;
                    groupItem["updatetime"] = new Date().getTime();
                    groupItem["user_id"] = selectedUsers[0].user_id;
                }
                else {
                    groupItem = groupCheck;
                }

                this.$emit('getCreateGroupInfo', groupItem);

                this.selectedGroups = [groupItem];
                if(this.transmitCollection){
                    var suc = await this.sendSingleCollectionMsg(this.selectedGroups, this.collectionInfo);
                    this.$emit("closeTransmitDlg", "");
                    if(suc == false) {
                        this.$message('转发失败');
                    }
                    else {
                        this.$message('转发成功');
                    }
                    return;
                }
                var newmsgret = await this.sendMsg(this.selectedGroups, this.transmitMessages);
                console.log('newmsgret ', newmsgret);
                this.$emit("closeTransmitDlg", "");
                this.$message('转发成功');
            }
            else {
                groupUserIds.push(selfUser.id);
                services.common.CreateGroup(groupName, groupUserIds)
                    .then((ret) => {
                        if(ret == undefined) {
                            console.log("!!!!!!!!!!!1 ")
                            // ToDo exception notice.
                            return;
                        }
                        ret.message_content = null;
                        
                        var groupItem = {};
                        groupItem["contain_user_ids"] = ret.contain_user_ids;
                        groupItem["group_id"] = ret.group_id;
                        groupItem["group_avarar"] = ret.group_avarar;
                        groupItem["group_name"] = ret.group_name;
                        groupItem["group_type"] = ret.group_type;
                        groupItem["last_message_time"] = ret.last_message_time;
                        groupItem["message_content"] = null;
                        groupItem["message_content_type"] = ret.message_content_type;
                        groupItem["message_from_id"] = ret.message_from_id;
                        groupItem["message_id"] = ret.message_id;
                        groupItem["owner"] = ret.owner;
                        groupItem["sequence_id"] = ret.sequence_id;
                        groupItem["status"] = ret.status;
                        groupItem["un_read_count"] = ret.un_read_count;
                        groupItem["updatetime"] = ret.updatetime;
                        groupItem["user_id"] = '';
                
                        // console.log("services.CreateGroup ret is ", groupItem);
                        this.$emit('getCreateGroupInfo', groupItem);
                        setTimeout(async () => {
                            this.selectedGroups = [groupItem];
                            if(this.transmitCollection){
                                var suc = await this.sendSingleCollectionMsg(this.selectedGroups, this.collectionInfo);
                                this.$emit("closeTransmitDlg", "");
                                if(suc == false) {
                                    this.$message('转发失败');
                                }
                                else {
                                    this.$message('转发成功');
                                }
                                return;
                            }
                            await this.sendMsg(this.selectedGroups, this.transmitMessages);
                            // for(var i=0;i<this.groupList.length;i++) {
                            //     this.groupList[i].checkState = false;
                            // }
                            // this.selectedChat = [];
                            this.$emit("closeTransmitDlg", "");
                            this.$message('转发成功');
                        }, 500)
                    })
            }
        },
        sendMsg: async function(distGroups, msgs) {
            if(this.transmitTogether) {
                await this.sendTogetherMsg(distGroups, msgs);
            }
            else {
                await this.sendSingleMsg(distGroups, msgs);
            }
        },
        sendTogetherMsg: async function(distGroups, msgs) {
            if(this.curUserInfo == undefined) {
                this.curUserInfo = await services.common.GetSelfUserModel();
            }
            var msgContent = await this.getTogetherMsgContent(msgs);
            console.log("varcontent is ", msgContent);
            for(var i=0;i<distGroups.length;i++){
                var uid = await this.getDistUidThroughUids(distGroups[i].contain_user_ids);
                var groupId = distGroups[i].group_id == null ? '' : distGroups[i].group_id;
                let curTimeSeconds = new Date().getTime();
                
                let sendingMsgContentType = 106;
                let willSendMsgContent = msgContent;
                let guid = generalGuid();
                services.common.sendNewMessage(
                        guid, 
                        sendingMsgContentType, 
                        this.curUserInfo.id, 
                        groupId, 
                        uid, 
                        curTimeSeconds, 
                        willSendMsgContent)
                    .then((ret) => {
                        console.log("sendNewMessage ret is ", strMsgContentToJson(ret.message_content));
                            if(ret == undefined) {
                                return false;
                            }
                            else {
                                this.$emit('updateChatList', ret);
                            }
                    })
            }
        },
        sendSingleCollectionMsg: async function(distGroups, collection) {
            console.log("sendSingleCollectionMsg ", collection);
            if(collection.collection_content == undefined) {
                alert("转发失败。")
                return;
            }
            let varcontent = collection.collection_content;
            for(var i=0;i<distGroups.length;i++){
                if(varcontent == null || varcontent.length == 0) {
                    // toDo To Deal The \n
                    alert("不能发送空白信息。")
                    return;
                }
                if(varcontent.msgtype == "m.text") {
                    let sendText = varcontent.body;
                    
                    let sendBody = {
                        msgtype: "m.text",
                        body: sendText
                    }
                    if(sendText.length != 0)
                    {
                        sendBody.body = sendText;
                        global.mxMatrixClientPeg.matrixClient.sendMessage(distGroups[i].roomId, sendBody);
                    }
                }
                else if(varcontent.msgtype == "m.image") {
                    var content = {
                                msgtype: 'm.image',
                                body: varcontent.body,
                                url: varcontent.url,
                                info:varcontent.info,
                            };
                    global.mxMatrixClientPeg.matrixClient.sendMessage(distGroups[i].roomId, content);
                }
                else if(varcontent.msgtype == "m.file") {
                    var content = {
                        msgtype: 'm.file',
                        body: varcontent.body,
                        url: varcontent.url,
                        info: varcontent.info,
                    };
                    global.mxMatrixClientPeg.matrixClient.sendMessage(distGroups[i].roomId, content);
                }
                // console.log("varcontent is ", varcontent);
            }
        },
        sendSingleMsg: async function(distGroups, msgs) {
            for(var i=0;i<distGroups.length;i++){
                for(var j=0;j<msgs.length;j++) {
                    var curMsg = msgs[j];
                    console.log("curMsg is ", curMsg);
                    var content = curMsg.getContent();
                    if(content.msgtype == "m.audio") {
                        continue;
                    }
                    if(curMsg.event.content.info != undefined) {
                        if(curMsg.event.content.info.h != undefined)
                        try{
                            curMsg.event.content.info.h = parseInt(curMsg.event.content.info.h);
                        }
                        catch(err) {
                            console.log("parse float to int failed");
                        }
                        if(curMsg.event.content.info.w != undefined)
                        try{
                            curMsg.event.content.info.w = parseInt(curMsg.event.content.info.w);
                        }
                        catch(err) {
                            console.log("parse float to int failed");
                        }
                    }
                    global.mxMatrixClientPeg.SendEvent(distGroups[i].roomId, curMsg)
                        .then((ret) => {
                            console.log("sendSingleMsg is ", ret);
                            // if(ret) {
                            //     this.$emit('updateChatList', ret);
                            // }
                            // else {
                            //     console.log("========= transmit msg failed ", curMsg.getContent());
                            // }
                        })
                }
            }
        },
        getTogetherMsgContent: async function(msgs) {
            if(this.curUserInfo == undefined) {
                this.curUserInfo = await services.common.GetSelfUserModel();
            }
            var contentTitle = "";
            var contentText = "";
            var groupId = this.curChat.group_id;
            var msgIds = [];
            var fromId = this.curUserInfo.id;
            console.log("this.curchat is ", this.curChat.group_type);
            if(this.curChat.group_type == 102) {

                var nameTemp = this.curChat.group_name;
                // var userInfos = await services.common.GetDistUserinfo(this.curChat.uid);
                // var userInfos = await UserInfo.GetUserInfo(this.curChat.uid);
                // var distUserInfo = userInfos[0];
                // if(distUserInfo != undefined){
                //     nameTemp = distUserInfo.user_display_name;
                // }

                contentTitle = this.curUserInfo.name + "与" + nameTemp + "的聊天记录";
            }
            else {
                contentTitle = "[群聊]";
            }
            for(let i=0;i<msgs.length;i++) {
                if(msgs[i].message_type == 105) {
                    continue;
                }
                if(i < 4) {
                    if(i == 3) {
                        contentText = contentText + await this.getMsgContent(msgs[i]);
                    }
                    else {
                        contentText = contentText + await this.getMsgContent(msgs[i]) + "\n";
                    }
                }
                msgIds.push(msgs[i].time_line_id);
            }
            console.log("contentText is ", contentText);

            var togetherMsgContent = {
                "title": contentTitle,
                "text": contentText,
                "groupId": groupId,
                "msgIds": msgIds,
                "fromId": fromId,
            };

            return togetherMsgContent;
        },
        getMsgContent: async function(msg) {
            if(this.msg === null) {
                return '';
            }
            var messageContent = '';
            let chatGroupMsgType = msg.message_type;
            var chatGroupMsgContent = strMsgContentToJson(msg.message_content);

            var nameTemp = "";
            var userInfos = await services.common.GetDistUserinfo(msg.message_from_id);
            // var userInfos = await UserInfo.GetUserInfo(this.curChat.uid);
            if(userInfos.length == 1) {
                var distUserInfo = userInfos[0];
                if(distUserInfo != undefined){
                    nameTemp = distUserInfo.user_display_name;
                }
            }

            console.log("chatGroupMsgContent is ", nameTemp)
            // console.log("this. msg is ", this.msg)
            // 数据库缺省type = 0 
            if(chatGroupMsgType === 101 || chatGroupMsgType ==0)
            {
                messageContent = nameTemp + ":" + chatGroupMsgContent.text;
                console.log("aboutUserName ",nameTemp);
                console.log("getMsgContent ",messageContent);
                return messageContent;
            }
            else if(chatGroupMsgType === 102)
            {
                messageContent = nameTemp + ":" + "[图片]:" + chatGroupMsgContent.fileName;
                return messageContent;
            }
            else if(chatGroupMsgType === 103)
            {
                messageContent = nameTemp + ":" + "[文件}:" + chatGroupMsgContent.fileName;   
                return messageContent;
            }
            else if(chatGroupMsgType === 106)
            {
                return messageContent = chatGroupMsgContent.title + ":" + "的聊天记录";
            }
            else {
                return messageContent = "不支持的消息类型，请升级客户端。"
            }
        },
        getDistUidThroughUids: async function(uids) {
            if(this.curUserInfo == undefined) {
                this.curUserInfo = await services.common.GetSelfUserModel();
            }
            if(uids.length > 2) {
                return "";
            }
            else if(uids.length == 1) {
                return uids[0];
            }
            else {
                if(uids[0] == this.curUserInfo.id) {
                    return uids[1];
                }
                else {
                    return uids[0];
                }
            }
        },
    },
    created() {
            //this.curUserInfo = await services.common.GetSelfUserModel();
            //console.log("this.curuser info is ", this.curUserInfo);
            // var showPosition = this.calcImgPosition();
            // console.log(showPosition);
            // this.dlgPosition.left = showPosition.left.toString() + "px";
            // this.dlgPosition.top = showPosition.top.toString() + "px";
    },
    mounted: function() {
        ipcRenderer.on('updateGroupImg', this.updateGroupImg);
        var favGroups = [];
        var norGroups = [];
        if(global.mxMatrixClientPeg.matrixClient) {
            global.mxMatrixClientPeg.matrixClient.getRooms().forEach((r) => {
                if(r.getMyMembership() != "leave" && r.getMyMembership() != "invite") {
                    let tags = r.tags;
                    if(tags && tags['m.favourite']){
                        favGroups.push(r);
                    }
                    else{
                        norGroups.push(r);
                    }
                }
            });
            favGroups.sort(this.SortGroupByTimeLine);
            norGroups.sort(this.SortGroupByTimeLine);
            this.recentGroups = favGroups.concat(norGroups);
            this.showRecentChat = this.recentGroups;
            setTimeout(() => {
                this.$nextTick(function(){
                    for(var i = 0; i < this.showRecentChat.length; i ++){
                        this.getGroupAvatarContent(this.showRecentChat[i], 'transmit');
                    }
                });
            }, 0)
        }
    },
    
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
    .TransmitLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .TransmitDlg {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 0px;
        width: 624px;
        height: 468px;
        text-align: center;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
        background: rgba(255, 255, 255, 1);
    }

    .TransmitHeader {
        height: 56px;
        background: rgba(255, 255, 255, 1);
        margin-left: 10px;
        border-radius: 4px;
    }

    .TransmitHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        vertical-align: top;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 2px;
        text-align: left;
    }

    .TransmitClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }
    .TransmitBody {
        width: 560px;
        height: 340x;
    }
    .TransmitContent {
        width: 560px;
        height: 340x;
        margin: 0;
        margin-left: 32px;
        border-radius: 4px;
        border: 1px solid rgba(221,221,221,1);
        background:rgba(255,255,255,1);
        .ListView {
            overflow: hidden;
            height: 100%;
            width: 280px;
            border-right: 1px solid rgba(221,221,221,1);
            .NewChatView {
                height: 48px;
                width: calc(100% - 32px);
                padding-left: 16px;
                vertical-align: top;
                .icon-chat-more {
                    width: 24px;
                    height: 24px;
                    display: inline-block;
                    margin-top: 12px;
                }
                .createNewChatInfo{
                    height: 48px;
                    width: 100px;
                    display: inline-block;
                    vertical-align: top;
                }
                .createNewChatTitle{
                    
                    width:100px;
                    height:20px;
                    margin: 0px;
                    margin-top: 14px;
                    margin-bottom: 14px;
                    font-size:14px;
                    font-weight:400;
                    color:rgba(0,0,0,1);
                    line-height:20px;
                    letter-spacing:1px;
                    font-family: PingFangSC-Regular;
                }
            }
            .RecentChatHeader {
                padding-left: 16px;
                width:52px;
                height:18px;
                font-size:12px;
                font-weight:400;
                color:rgba(153,153,153,1);
                line-height:18px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .RecentChatView {
                height: 264px;
                overflow: scroll;
                .recentChatList{
                    list-style: none;
                    margin: 0px;
                    padding-left: 16px;
                    .recentChat{
                        width: 248px;
                        height: 48px;
                        vertical-align: top;
                        .group-checkBox{
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            margin-top: 14px;
                            margin-bottom: 14px;
                        }
                        .group-icon{
                            margin-top: 8px;
                            margin-left: 6px;
                            margin-bottom: 8px;
                            width: 32px;
                            height: 32px;
                            display: inline-block;
                            border-radius: 50px;
                        }
                        .group-info{
                            display: inline-block;
                            height: 48px;
                        }
                        .group-name{
                            width:160px;
                            height:20px;
                            font-size:14px;
                            margin-top: 14px;
                            margin-bottom: 14px;
                            font-weight:400;
                            color:rgba(0,0,0,1);
                            line-height:20px;
                            letter-spacing:1px;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            padding-left: 12px;
                            text-align: left;
                            font-family: PingFangSC-Regular;
                        }

                    }
                }
                
            }
            .searchView {
                height: 282px;
                overflow: scroll;
                .searchGroupList{
                    list-style: none;
                    margin: 0px;
                    padding-left: 16px;
                    .searchGroup{
                        width: 248px;
                        height: 48px;
                        vertical-align: top;
                        .group-checkBox{
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            margin-top: 14px;
                            margin-bottom: 14px;
                        }
                        .group-icon{
                            margin-top: 8px;
                            margin-left: 6px;
                            margin-bottom: 8px;
                            width: 32px;
                            height: 32px;
                            display: inline-block;
                            border-radius: 50px;
                        }
                        .group-info{
                            display: inline-block;
                            height: 48px;
                        }
                        .group-name{
                            width:160px;
                            height:20px;
                            font-size:14px;
                            margin-top: 14px;
                            margin-bottom: 14px;
                            font-weight:400;
                            color:rgba(0,0,0,1);
                            line-height:20px;
                            letter-spacing:1px;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            padding-left: 12px;
                            text-align: left;
                            font-family: PingFangSC-Regular;
                        }

                    }
                }
                
            }
        }
        .selectedView {
            
            height: 340px;
            width: 50%;
            padding: 0px;
            overflow: hidden;
            .selectedHeader{
                width: 100%;
                height: 48px;
                padding-left: 16px;
                padding-top: 14px;
                font-size:14px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
                text-align: left;
            }
            .selectedContentView {
                height: 292px;
                width: 100%;
            }
            .selectedGroupList{
                height: 100%;
                padding: 0px;
                padding-left: 16px;
                margin: 0px;
                list-style: none;
                overflow: scroll;
                .selectedGroup {
                    height: 48px;
                    vertical-align: top;
                    .group-icon{
                            width: 32px;
                            height: 32px;
                            display: inline-block;
                            border-radius: 50px;
                            margin-top: 8px;
                            margin-bottom: 8px;
                        }
                        .group-info{
                            display: inline-block;
                            height: 48px;
                        }
                        .group-name{
                            width:156px;
                            height:20px;
                            font-size:14px;
                            margin-top: 14px;
                            margin-bottom: 14px;
                            font-weight:400;
                            color:rgba(0,0,0,1);
                            line-height:20px;
                            letter-spacing:1px;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            padding-left: 12px;
                            text-align: left;
                            font-family: PingFangSC-Regular;
                        }
                        .group-delete-icon {
                            width: 20px;
                            height: 20px;
                            display: inline-block;
                            margin-top: 14px;
                            
                            margin-bottom: 14px;
                        }
                }
            }
        }
        
    }
    .search {
        margin: 12px 0px -1px 16px;
        text-align: left;
        width: calc(100% - 86px);
        height: 32px;
        border: 1px solid rgb(221, 221, 221);
        border-right: none;
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        display: inline-block;
    }
    .search-action{
        border: 1px solid rgb(221, 221, 221);
        border-left: none;
        margin: 12px 16px 12px 0px;
        text-align: left;
        width: 52px;
        height: 32px;
        display: inline-block;
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
    }
    .search-delete{
        display: inline-block;
        height: 20px;
        width: 20px;
        font-size: 0px;
        margin: 6px 0px 6px 0px;
    }
    .search-search{
        display: inline-block;
        height: 20px;
        width: 30px;
        font-size: 0px;
        margin: 6px 0px 6px 0px;
    }
    .icon-delete{
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin-right: 2px;
    }
    .icon-search {
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin-right: 8px;
        color: rgb(51, 51, 51);
    }
    
    .icon-search:hover {
        display: inline-block;
        color: rgb(255,204,102);
    }
    
    .search-input {
        display: inline-block;
        position: absolute;
        text-indent: 10px;
        width: 194px;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: 'PingFangSC-Regular'
        font-weight 400;
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
        letter-spacing:1px;
    }
    

    // .TransmitTextArea {
    //     width: calc(100% - 96px);
    //     height: calc(100% - 32px);
    //     background:rgba(255,255,255,1);
    //     border-radius:4px 0px 0px 4px;
    //     border:1px solid rgba(221,221,221,1);
    //     margin-left: 32px;
    //     margin-right: 32px;
    //     padding: 0px;
    //     font-size: 14px;
    //     text-indent: 4px;
    //     color: rgba(153, 153, 153, 1);
    //     letter-spacing:1px;
    //     font-weight:400;
    //     line-height:20px;
    //     padding: 16px;
    // }

    // .TransmitTextArea:focus {
    //     width: calc(100% - 96px);
    //     height: calc(100% - 32px);
    //     background:rgba(255,255,255,1);
    //     border-radius:4px 0px 0px 4px;
    //     border:1px solid rgba(221,221,221,1);
    //     margin-left: 32px;
    //     margin-right: 32px;
    //     padding: 0px;
    //     font-size: 14px;
    //     text-indent: 4px;
    //     color: rgba(153, 153, 153, 1);
    //     letter-spacing:1px;
    //     font-weight:400;
    //     line-height:20px;
    //     padding: 16px;
    //     outline: none;
    // }

    .TransmitFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }
    .TransmitConfirmButton{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
    }
 
    .TransmitConfirmButton:disabled{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(167, 224, 196, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
    }
 
    .TransmitCancleButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 110px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
        font-weight: 400;
    }
 .multiSelectCheckbox {
        display: inline-block;
        position:relative;
        width: 20px;
        height: 20px;
        background-color: rgba(255, 255, 255, 1);
        border: 1px solid rgb(221,221,221);
        border-radius: 4px;
        font-size: 10px;
        margin-top: 14px;
        margin-bottom: 14px;
        vertical-align:top;
        cursor: pointer;
        -webkit-appearance:none;
        -webkit-user-select:none;
        user-select:none;
        -webkit-transition:background-color ease 0.1s;
        transition:background-color ease 0.1s;
        float: left;
        outline: none;
    }

    .multiSelectCheckbox:checked {
        background-color: rgb(36, 179, 107);
        cursor: pointer;
        outline: none;
    }
    .multiSelectCheckbox:indeterminate {
        background-color: rgb(36, 179, 107);
        cursor: pointer;
        outline: none;
    }
    .multiSelectCheckbox:indeterminate::after{
        content:'';
        top:7px;
        left:4px;
        font-size: 10px;
        position: absolute;
        background:transparent;
        border:#fff solid 2px;
        border-top:none;
        border-right:none;
        border-left: none;
        height:1px;
        width:10px;
        // -moz-transform:rotate(-45deg);
        // -ms-transform:rotate(-45deg);
        // -webkit-transform:rotate(-45deg);
        // transform:rotate(-45deg);
        outline: none;
    }
    .multiSelectCheckbox:checked::after {
        content:'';
        top:3px;
        left:3px;
        font-size: 10px;
        position: absolute;
        background:transparent;
        border:#fff solid 2px;
        border-top:none;
        border-right:none;
        height:6px;
        width:10px;
        -moz-transform:rotate(-45deg);
        -ms-transform:rotate(-45deg);
        -webkit-transform:rotate(-45deg);
        transform:rotate(-45deg);
        outline: none;
    }
</style>
