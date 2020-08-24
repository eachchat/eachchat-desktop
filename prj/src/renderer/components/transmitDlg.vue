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
                                <img ondragstart="return false" class="group-icon" :id="'search' + group.group_id" src="../../../static/Img/User/user-40px@2x.png">
                                <div class="group-info">
                                    <p class="group-name">{{ group.group_name }}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="NewChatView" v-show="!showSearchView">
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
                                <li class="recentChat" v-for="(group, index) in recentGroups" :key="index">
                                    <input type="checkBox" class="multiSelectCheckbox" :checked="groupChecked(group)" @click="groupCheckBoxClicked(group)">
                                    <img ondragstart="return false" class="group-icon" :id="group.group_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="group-info">
                                        <p class="group-name">{{ group.group_name }}</p>
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
                                <img ondragstart="return false" class="group-icon" :id="'selected' + group.group_id" src="../../../static/Img/User/user-40px@2x.png">
                                <div class="group-info">
                                    <p class="group-name">{{ group.group_name }}</p>
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
        recentGroups: {
            type: Array,
            default: function () { 
                return [];
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
        search:async function () {
            if(this.searchKey == ''){
                this.showSearchView = false;
                return;
            }
            this.showSearchView = true;
            this.searchGroup = await Group.SearchByNameKey(this.searchKey);

            this.$nextTick(function(){
                for(var i = 0; i < this.searchGroup.length; i ++){
                    this.getGroupAvatarContent(this.searchGroup[i], 'search');
                }
            });
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
            var temp = [];
            for(var i = 0; i < rootDepartmentModels.length; i ++) {
                var department = rootDepartmentModels[i];
                temp[department.show_order] = department;
            }
            this.rootDepartments =  temp;
            this.showCreateNewChat = true;
            
        },
        indexOfGroupInSelected(group){
            var index = -1;
            for(var i = 0; i < this.selectedGroups.length; i ++){
                var id = group.group_id;
                if(id == this.selectedGroups[i].group_id){
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
            var targetDir = confservice.getUserThumbHeadPath();
            var targetPath = path.join(targetDir, group.group_id + '.png');
            var groupAvatarElement = document.getElementById(key + group.group_id);
            if(groupAvatarElement == null) {
                return;
            }
            if(fs.existsSync(targetPath)) {
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    groupAvatarElement.setAttribute("src", reader.result);
                }
            }
            else{
                console.log("download group avatar", group);
                services.common.downloadGroupAvatar(group.group_avarar, group.group_id);
                //await this.getGroupAvatarContent(group);
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
            this.curUserInfo = await services.common.GetSelfUserModel();
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
                var groupCheck = await services.common.GetGroupByName(chatName);
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
            if(this.curUserInfo == undefined) {
                this.curUserInfo = await services.common.GetSelfUserModel();
            }
            for(var i=0;i<distGroups.length;i++){

                    var curMsg = collection;
                    console.log("curMsg is ", curMsg);
                    if(curMsg.collection_type == 105) {
                        continue;
                    }
                    var isOk = true;
                    var curMsgContent = {};
                    let curTimeSeconds = new Date().getTime();
                    if(curMsg.collection_type == 101) {
                        if(curMsg.collection_content["text"] == undefined){
                            isOk = false;
                        }
                        else{
                            curMsgContent["text"] = curMsg.collection_content["text"];
                        }
                    }
                    else if(curMsg.collection_type == 102) {
                        curMsgContent["ext"] = curMsg.collection_content["ext"];
                        curMsgContent["fileName"] = curMsg.collection_content["fileName"];
                        curMsgContent["url"] = curMsg.collection_content["url"];
                        curMsgContent["middleImage"] = curMsg.collection_content["middleImage"];
                        curMsgContent["thumbnailImage"] = curMsg.collection_content["thumbnailImage"];
                        curMsgContent["imgWidth"] = curMsg.collection_content["imgWidth"];
                        curMsgContent["imgHeight"] = curMsg.collection_content["imgHeight"];
                        curMsgContent["fileSize"] = curMsg.collection_content["fileSize"];
                    }
                    else if(curMsg.collection_type == 103) {
                        curMsgContent["ext"] = curMsg.collection_content["ext"];
                        curMsgContent["fileName"] = curMsg.collection_content["fileName"];
                        curMsgContent["url"] = curMsg.collection_content["url"];
                        curMsgContent["fileSize"] = curMsg.collection_content["fileSize"];
                    }
                    for(var key in curMsgContent) {
                        if(curMsgContent[key] == undefined) {
                            isOk = false;
                        }
                    }
                    if(!isOk) {
                        return false;
                    }
                    console.log("curMsgCintent is ", curMsgContent);

                    var uid = await this.getDistUidThroughUids(distGroups[i].contain_user_ids);
                    var groupId = distGroups[i].group_id == null ? '' : distGroups[i].group_id;
                    
                    let sendingMsgContentType = curMsg.collection_type;
                    let willSendMsgContent = curMsgContent;
                    let guid = generalGuid();
                    
                    services.common.sendNewMessage(
                            guid, 
                            sendingMsgContentType, 
                            this.curUserInfo.id, 
                            groupId, 
                            uid, 
                            curTimeSeconds, 
                            willSendMsgContent)
                        .then(async (ret) => {
                            console.log("send sendNewMessage message ret ", ret)
                            if(ret == undefined) {
                                return false;
                            }
                            else {
                                if(curMsg.collection_type == 103) {
                                    var fileDir = confservice.getFilePath(curMsg.timestamp);
                                    var filePath = path.join(fileDir, curMsg.collection_content.fileName);
                                    if(fs.existsSync(filePath)) {
                                        var nameTmp = strMsgContentToJson(ret.message_content)["fileName"];
                                        var dirTmp = confservice.getFilePath(ret.message_timestamp);
                                        var pathTmp = path.join(dirTmp, nameTmp);
                                        var finalPath = await makeFlieNameForConflict(pathTmp);
                                        try{
                                            console.log("copy file from ", filePath, " to ", finalPath);
                                            fs.copyFileSync(filePath, finalPath);
                                            services.common.SetFilePath(ret.message_id, finalPath);
                                        }
                                        catch(error) {
                                            console.log("copyFile except ", error);
                                        }

                                    }
                                }
                                else if(curMsg.collection_type == 102) {
                                    var fileDir = confservice.getThumbImagePath(curMsg.timestamp);
                                    var filePath = path.join(fileDir, curMsg.collection_content.fileName);
                                    console.log("the img path is ", filePath);
                                    if(fs.existsSync(filePath)) {
                                        var nameTmp = strMsgContentToJson(ret.message_content)["fileName"];
                                        var dirTmp = confservice.getThumbImagePath(ret.message_timestamp);
                                        var pathTmp = path.join(dirTmp, nameTmp);
                                        var finalPath = await makeFlieNameForConflict(pathTmp);
                                        try{
                                            console.log("copy file from ", filePath, " to ", finalPath);
                                            fs.copyFileSync(filePath, finalPath);
                                            services.common.SetFilePath(ret.message_id, finalPath);
                                        }
                                        catch(error) {
                                            console.log("copyFile except ", error);
                                        }

                                    }
                                }
                                this.$emit('updateChatList', ret);
                            }
                        })
                }
        },
        sendSingleMsg: async function(distGroups, msgs) {
            if(this.curUserInfo == undefined) {
                this.curUserInfo = await services.common.GetSelfUserModel();
            }
            for(var i=0;i<distGroups.length;i++){
                for(var j=0;j<msgs.length;j++) {
                    var curMsg = msgs[j];
                    console.log("curMsg is ", curMsg);
                    if(curMsg.message_type == 105) {
                        continue;
                    }
                    var curMsgContent = strMsgContentToJson(curMsg.message_content);
                    console.log("curMsgCintent is ", curMsgContent);

                    var uid = await this.getDistUidThroughUids(distGroups[i].contain_user_ids);
                    var groupId = distGroups[i].group_id == null ? '' : distGroups[i].group_id;
                    let curTimeSeconds = new Date().getTime();
                    
                    let sendingMsgContentType = curMsg.message_type;
                    let willSendMsgContent = curMsgContent;
                    let guid = generalGuid();

                    services.common.sendNewMessage(
                            guid, 
                            sendingMsgContentType, 
                            this.curUserInfo.id, 
                            groupId, 
                            uid, 
                            curTimeSeconds, 
                            willSendMsgContent)
                        .then(async (ret) => {
                            console.log("sendNewMessage ret is ", strMsgContentToJson(ret.message_content));
                            if(ret == undefined) {
                                return false;
                            }
                            else {
                                if(curMsg.message_type == 103) {
                                    var filePath = await services.common.GetFilePath(curMsg.message_id);
                                    if(!fs.existsSync(filePath)) {
                                        var fileDir = confservice.getFilePath(curMsg.message_timestamp);
                                        var filePath = path.join(fileDir, strMsgContentToJson(curMsg.message_content)['fileName']);
                                    }
                                    if(fs.existsSync(filePath)) {
                                        var nameTmp = strMsgContentToJson(ret.message_content)["fileName"];
                                        var dirTmp = confservice.getFilePath(ret.message_timestamp);
                                        var pathTmp = path.join(dirTmp, nameTmp);
                                        var finalPath = await makeFlieNameForConflict(pathTmp);
                                        try{
                                            console.log("copy file from ", filePath, " to ", filePath);
                                            fs.copyFileSync(filePath, finalPath);
                                        }
                                        catch(error) {
                                            console.log("copyFile except ", error);
                                        }
                                    }
                                }
                                else if(curMsg.message_type == 102) {
                                    var fileName = strMsgContentToJson(curMsg.message_content)['fileName'];
                                    var ext = path.extname(fileName);
                                    var fileDir = confservice.getThumbImagePath(curMsg.message_timestamp);
                                    var filePath = path.join(fileDir, curMsg.message_id + ext);
                                    if(fs.existsSync(filePath)) {
                                        var dirTmp = confservice.getThumbImagePath(ret.message_timestamp);
                                        var pathTmp = path.join(dirTmp, ret.message_id + ext);
                                        var finalPath = await makeFlieNameForConflict(pathTmp);
                                        try{
                                            console.log("copy file from ", filePath, " to ", finalPath);
                                            fs.copyFileSync(filePath, finalPath);
                                        }
                                        catch(error) {
                                            console.log("copyFile except ", error);
                                        }
                                    }
                                }
                                this.$emit('updateChatList', ret);
                            }
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

            var nameTemp = this.curChat.group_name;
            // var userInfos = await services.common.GetDistUserinfo(msg.message_from_id);
            // var userInfos = await UserInfo.GetUserInfo(this.curChat.uid);
            // var distUserInfo = userInfos[0];
            // if(distUserInfo != undefined){
            //     nameTemp = distUserInfo.user_display_name;
            // }

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
            var showPosition = this.calcImgPosition();
            console.log(showPosition);
            this.dlgPosition.left = showPosition.left.toString() + "px";
            this.dlgPosition.top = showPosition.top.toString() + "px";
            console.log(this.recentGroups);
    },
    mounted: function() {
        ipcRenderer.on('updateGroupImg', this.updateGroupImg);
        setTimeout(() => {
            this.$nextTick(function(){
                console.log(this.recentGroups.length)
                for(var i = 0; i < this.recentGroups.length; i ++){
                    this.getGroupAvatarContent(this.recentGroups[i]);
                }
            });
        }, 0)
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
        z-index: 3;
    }

    .TransmitDlg {
        position: absolute;
        width: 624px;
        height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .TransmitHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .TransmitHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 2px;
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
                height: 214px;
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
                            border-radius: 4px;

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
                            border-radius: 4px;

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
                            border-radius: 4px;
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
    //     font-family:Microsoft Yahei;
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
    //     font-family:Microsoft Yahei;
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
