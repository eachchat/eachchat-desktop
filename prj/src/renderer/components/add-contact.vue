<template>
    <div class="ChatCreaterLayers" id="ChatCreaterLayersId" >
        <div :style="dlgPosition" class="ChatCreaterDlg" id="ChatCreaterDlgId">
            <div class="ChatCreaterHeader">
                <div class="ChatCreaterHeaderTitle">{{ $t('addContactDlgName') }}</div>
                <img ondragstart="return false" class="ChatCreaterClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            <el-container class="ChatCreaterContent">
                <el-main class="selectedView">
                    <div class="search">
                    <input class="search-input" v-model="searchKey" @input="search" placeholder="搜索..." >
                </div><div class="search-action">
                        <div class="search-delete">
                            <img ondragstart="return false" class="icon-delete" v-show="searchKey" @click="searchDeleteClicked()" src="../../../static/Img/Navigate/searchDelete-20px@2x.png">
                        </div><div class="search-search">
                            <img ondragstart="return false" class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" >
                        </div>
                    </div>
                    <div class = "search-label">{{$t('contactLabel')}}</div>
                    <div v-show="!bShowSearchRes">
                        <div style="margin-left: 20px;margin-top: 10px;" @click="AddByOtherWay()">其他方式添加</div>
                        <div style="margin-left: 20px;margin-top: 10px;" @click="AddByMatrixID()">通过matrix ID手动添加</div>
                    </div>
                    <el-table
                        v-show="bShowSearchRes"
                        :show-header= "false"
                        :data="searchUsers"
                        style="margin-left: 20px; width:95%"
                        height='300'>
                        <el-table-column width="50">
                            <template slot-scope="scope">
                                <img src="../../../static/Img/Chat/search-20px@2x.png" alt="">
                            </template>
                        </el-table-column>
                        <el-table-column width="350" float='left'>
                            <template slot-scope="scope">
                                <p style='font-size: 12px;'>{{ scope.row.display_name }}</p>
                                <p style='font-size: 8px;'>{{ scope.row.user_id }}</p>
                            </template>
                        </el-table-column>
                        <el-table-column float='right'>
                            <template slot-scope="scope">
                                <el-button
                                size="mini"
                                @click="handleEdit(scope.$index, scope.row)">保存</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-main>
            </el-container>
        </div>
 
    </div>
</template>

<script>
import {services, environment} from '../../packages/data/index.js'
import {Department, Group, UserInfo} from '../../packages/data/sqliteutil.js'
import * as fs from 'fs-extra'
import {ipcRenderer} from 'electron'
import { object } from '../../packages/core/types'
import confservice from '../../packages/data/conf_service';
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil } from '../../packages/core/Utils.js'
import * as path from 'path'
import { model } from '../../packages/core'
export default {
    name: 'addContact',
    props: {
    },
    data () {
        return {
            matrixClient: undefined,
            bShowSearchRes: false,
            searchKey: '',
            searchUsers: [],
            imgHeight: 468,
            imgWidth: 624,
            dlgPosition:{},
            viewContentHeight:202,
        }
    },
    watch:{
        searchKey: function(){
            if(this.searchKey === ''){
                this.bShowSearchRes = false;
                this.searchUsers = [];
            }
        }
    },
    methods: {
        handleEdit: function(index, row){
            console.log(index, row)
        },

        AddByOtherWay: function(){
            console.log('AddByOtherWay')
        },

        AddByMatrixID: function(){
            console.log('AddByMatrixID')
        },

        search:async function () {
            if(this.searchKey == ''){
                return;
            }
            this.showSearchView = true;
            this.showOrganizationView = false;
            let ops = {};
            ops.term = this.searchKey;
            ops.number = 10;
            this.matrixClient.searchUserDirectory(ops).then((res)=>{
                this.searchUsers = res.results;
                if(this.searchUsers.length == 0)
                    return;
                this.bShowSearchRes = true;
                this.$nextTick(function(){
                    for(var i = 0; i < this.searchUsers.length; i ++){
                        this.getUserImg(this.searchUsers[i], 'search');
                    }
                });
            });
            
           
        },
        searchDeleteClicked(){
            this.searchKey = '';
        },
        closeDialog() {
            //this.display = false;
            this.$emit("closeAddContactDlg", "");
        },
        async confirm(){
            // create or add people judge by bool createNewChat
            if(this.isSearchAdd) {
                var selectedUserIds = [];
                for(let i=0;i<this.selectedUsers.length;i++) {
                    let selectedUserId = this.selectedUsers[i].user_id;
                    selectedUserIds.push(selectedUserId);
                }
                console.log("disableUsers ", this.disableUsers);
                for(let i=0;i<this.disableUsers[0].length;i++) {
                    let selectedUserId = this.disableUsers[i];
                    selectedUserIds.push(selectedUserId);
                }
                ipcRenderer.send("searchAddedSenders", selectedUserIds);
                this.$emit("closeChatCreaterDlg", "");
                return;
            }
            if(this.createNewChat) {
                if(this.curUserInfo == undefined) {
                    this.curUserInfo = await services.common.GetSelfUserModel();
                }
                var groupUserIds = [];
                console.log("this.selectedUsers = ", this.selectedUsers);
                console.log("this disableUsers is ", this.disableUsers)
                for(var j=0;j<this.disableUsers.length;j++) {
                    groupUserIds.push(this.disableUsers[j]);
                }
                var groupUserName = []
                for(var i=0;i<this.selectedUsers.length;i++) {
                    groupUserIds.push(this.selectedUsers[i].user_id)
                    if(i < 4) {
                        groupUserName.push(this.selectedUsers[i].user_display_name)
                    }
                }
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
                console.log("group user ids is ", groupUserIds)
                console.log("group groupName ids is ", groupName)
                var contain_user_ids = groupUserIds.join(",");
                if(this.selectedUsers.length == 0) {
                    alert("选一个呗")
                }
                else if(this.selectedUsers.length == 1) {
                    var groupItem = {};
                    var selectedId = this.selectedUsers[0];
                    var userInfos = await services.common.GetDistUserinfo(selectedId.user_id);
                    console.log("userInfos is ", userInfos);
                    var chatUserInfo = userInfos[0];
                    var chatAvater = chatUserInfo.avatar_t_url;
                    var chatName = chatUserInfo.user_display_name;
                    var groupCheck = '';
                    console.log("chat name is ", chatName)
                    try {
                        if(this.isSecret) {
                            groupCheck = await Group.SearchSecretByNameKey(chatName);
                        }
                        else {
                            groupCheck = await Group.SearchChatByNameKey(chatName);
                        }
                    }
                    catch(error) {
                        console.log("get grou name exception and err is ", error);
                    }
                    console.log("groupCheck is ", groupCheck)
                    if(groupCheck.length == 0) {
                        groupItem["contain_user_ids"] = contain_user_ids;
                        groupItem["group_avarar"] = chatAvater;
                        groupItem["group_name"] = chatName;
                        groupItem["group_type"] = 102;
                        groupItem["last_message_time"] = 0;
                        groupItem["message_content"] = '';
                        groupItem["message_content_type"] = 101;
                        groupItem["message_from_id"] = this.curUserInfo.id;
                        groupItem["message_id"] = '';
                        groupItem["owner"] = null;
                        groupItem["sequence_id"] = 0;
                        groupItem["status"] = "00000000";
                        groupItem["un_read_count"] = 0;
                        groupItem["updatetime"] = new Date().getTime();
                        groupItem["user_id"] = selectedId.user_id;
                        groupItem["key_id"] = this.isSecret == true ? "xxxxxx" : "";
                    }
                    else {
                        for(let k=0;k<groupCheck.length;k++) {
                            if(this.isSecret && groupCheck[k].key_id.length != 0) {
                                groupItem = groupCheck[k];
                                break;
                            }
                            else if(!this.isSecret && groupCheck[k].key_id.length == 0) {
                                groupItem = groupCheck[k];
                                break;
                            }
                        }
                    }

                    this.$emit('getCreateGroupInfo', groupItem);
                    this.$emit("closeChatCreaterDlg", "");
                }
                else {
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
                            groupItem["message_content"] = '';
                            groupItem["message_content_type"] = ret.message_content_type;
                            groupItem["message_from_id"] = ret.message_from_id;
                            groupItem["message_id"] = ret.message_id;
                            groupItem["owner"] = ret.owner;
                            groupItem["sequence_id"] = ret.sequence_id;
                            groupItem["status"] = ret.status;
                            groupItem["un_read_count"] = ret.un_read_count;
                            groupItem["updatetime"] = ret.updatetime;
                            groupItem["user_id"] = '';
                    
                            console.log("services.CreateGroup ret is ", groupItem);
                            this.$emit('getCreateGroupInfo', groupItem);
                            this.$emit("closeChatCreaterDlg", "");
                        })
                }
            }
            else if(!this.createNewChat && this.addMemberGroupType == 102) {
                
                if(this.curUserInfo == undefined) {
                    this.curUserInfo = await services.common.GetSelfUserModel();
                }
                var groupUserIds = [];
                groupUserIds.push(this.curUserInfo.id);
                console.log("this.selectedUsers = ", this.selectedUsers);
                console.log("this disableUsers is ", this.disableUsers)
                var groupUserName = []
                for(var j=0;j<this.disableUsers.length;j++) {
                    if(groupUserIds.indexOf(this.disableUsers[j]) == -1) {
                        groupUserIds.push(this.disableUsers[j]);
                        if(j < 4) {
                            var disabledUserInfo = await UserInfo.GetUserInfo(this.disableUsers[j])
                            if(disabledUserInfo != undefined) {
                                groupUserName.push(disabledUserInfo.user_display_name)
                            }
                        }
                    }
                }
                for(var i=0;i<this.selectedUsers.length;i++) {
                    if(groupUserIds.indexOf(this.selectedUsers[i].user_id) == -1) {
                        groupUserIds.push(this.selectedUsers[i].user_id)
                        if(i < 2) {
                            groupUserName.push(this.selectedUsers[i].user_display_name)
                        }
                    }
                }
                var groupName = '';
                if(groupUserName.length > 1) {
                    groupName = groupUserName.join(",");
                }
                else {
                    groupName = groupUserName[0];
                }
                console.log("group user ids is ", groupUserIds)
                console.log("group groupName ids is ", groupName)
                if(this.selectedUsers.length == 0) {
                    alert("选一个呗")
                }
                else {
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
                            groupItem["message_content"] = '';
                            groupItem["message_content_type"] = ret.message_content_type;
                            groupItem["message_from_id"] = ret.message_from_id;
                            groupItem["message_id"] = ret.message_id;
                            groupItem["owner"] = ret.owner;
                            groupItem["sequence_id"] = ret.sequence_id;
                            groupItem["status"] = ret.status;
                            groupItem["un_read_count"] = ret.un_read_count;
                            groupItem["updatetime"] = ret.updatetime;
                            groupItem["user_id"] = '';
                    
                            console.log("services.CreateGroup ret is ", groupItem);
                            this.$emit('getCreateGroupInfo', groupItem);
                            this.$emit("closeChatCreaterDlg", "");
                        })
                }
            }
            else {
                console.log("add member s ", this.selectedUsers);
                var addUids = [];
                for(var i=0;i<this.selectedUsers.length;i++) {
                    addUids.push(this.selectedUsers[i].user_id)
                }
                var ret = await services.common.AddGroupUsers(this.addMemberGroupId, addUids);
                this.$emit("closeChatCreaterDlg", "");
                console.log("AddGroupUsers ret is ", ret);
            }
        },
        departmentBreadCrumbsClicked:async function(department, index) {
            // modify breadCrumb info
            this.breadCrumbs.splice(index + 1, this.breadCrumbs.length - index + 1);
            // show root view
            if(index == 0){
                this.showRootDepartmentView = true;
                return;
            }
            // other
            this.curDepartment = this.getDepartment(department.department_id);
            this.showRootDepartmentView = false;
            var subDepartmentModels = this.getSubDepartment(department.department_id);
            var subUserModels = this.getSubUsers(department.department_id);
            // var tempDepartments = [];
            // for (var i = 0; i < subDepartmentModels.length; i ++) {
            //     var temp = {};
            //     temp.department_id = subDepartmentModels[i].department_id;
            //     temp.display_name = subDepartmentModels[i].display_name;
            //     temp.subAllUsers = this.getDepartmentSubAllUsers(subDepartmentModels[i]);
                
            //     tempDepartments.push(temp);
            // }
            this.curSubDepartments = subDepartmentModels;
            this.curUsers = this.filterDisabledUsers(subUserModels);
            this.curSubAllUsers = this.getDepartmentSubAllUsers(department);
            this.$nextTick(function(){
                for(var i = 0; i < this.curUsers.length; i ++){
                    this.getUserImg(this.curUsers[i]);
                }
            });

        },
        currentDepartmentSelectAllClicked(){
            this.departmentCheckBoxClicked(this.curDepartment);
            // var allUsers = this.curUsers;
            // for (var i = 0; i < this.curDepartments.length; i ++){
            //     allUsers = allUsers.concat(this.curDepartments[i].subAllUsers);
            // }
            // // check state
            // if (this.selectAllCheckState){
            //     for(var i = 0; i < allUsers.length; i ++){
            //         var index = this.indexOfUserInSelected(allUsers[i]);
            //         if(index != -1){
            //             this.selectedUsers.splice(index, 1);
            //         }
            //     }
            //     return;
            // }
            // else {
            //     for(var i = 0; i < allUsers.length; i ++){
            //         var index = this.indexOfUserInSelected(allUsers[i]);
            //         if(index == -1){
            //             this.selectedUsers.push(allUsers[i]);
            //         }
            //     }
            // }
            // this.$nextTick(function(){
            //     for(var i = 0; i < this.selectedUsers.length; i ++){
            //         this.getUserImg(this.selectedUsers[i], 'selected');
            //     }
            // });
        },
        userCheckBoxClicked(user){
            console.log('haha');
            if(this.indexOfUserInSelected(user) != -1){
                var index = this.indexOfUserInSelected(user);
                this.selectedUsers.splice(index, 1);
                user.isCheck = false;
                // var tempAllUsers = this.allUsers;
                // for(var i = 0; i < tempAllUsers.length; i ++){
                //     if(tempAllUsers[i].user_id == user.user_id){
                //         this.allUsers[i].isCheck = false;
                //         break;
                //     }
                // }
                this.curDepartment.isCheck = this.checkDepartmentState(user.belong_to_department_id);
            }
            else{
                this.selectedUsers.push(user);
                user.isCheck = true;
                // var tempAllUsers = this.allUsers;
                // for(var i = 0; i < tempAllUsers.length; i ++){
                //     if(tempAllUsers[i].user_id == user.user_id){
                //         this.allUsers[i].isCheck = true;
                //         break;
                //     }
                // }
                this.curDepartment.isCheck = this.checkDepartmentState(user.belong_to_department_id);
            }
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedUsers.length; i ++){
                    this.getUserImg(this.selectedUsers[i], 'selected');
                }
            });
        },
        checkDepartmentState(department_id){
            var department = this.getDepartment(department_id);
            var isCheck = true;
            if(department.subAllUsers.length <= this.selectedUsers.length){
                for(var i = 0; i < department.subAllUsers.length; i ++){
                    if(this.indexOfUserInSelected(department.subAllUsers[i]) == -1){
                        isCheck = false;
                        break;
                    }
                }
            }else{
                isCheck = false;
            }
            department.isCheck = isCheck;
            if(department.parent_id){
                this.checkDepartmentState(department.parent_id);
            }
            // var tempDepartments = this.allDepartments;
            // for(var i = 0; i< tempDepartments.length; i ++){
            //     if(tempDepartments[i].department_id == department_id){
            //         this.allDepartments[i].isCheck = isCheck;
            //         if(tempDepartments[i].parent_id){
            //             this.checkDepartmentState(tempDepartments[i].parent_id);
            //         }
            //         break;
            //     }
            // }
            return isCheck;
        },
        indexOfUserInSelected(user){
            var index = -1;
            for(var i = 0; i < this.selectedUsers.length; i ++){
                var id = user.user_id;
                if(id == this.selectedUsers[i].user_id){
                    index = i;
                    break;
                }
            }
            return index;
        },
        departmentCheckBoxClicked(department){
            var users = department.subAllUsers;
            if(department.isCheck){
                for(var i = 0; i < users.length; i ++){
                    var user = users[i];
                    user.isCheck = false;
                    var index = this.indexOfUserInSelected(user);
                    this.selectedUsers.splice(index, 1);
                }
                
            }else{
                for(var i = 0; i < users.length; i ++){
                    var user = users[i];
                    user.isCheck = true;
                    if(this.indexOfUserInSelected(user) == -1){
                        this.selectedUsers.push(user);

                        // var tempAllUsers = this.allUsers;

                        // for(var j = 0; j < tempAllUsers.length; j ++){
                        //     if(tempAllUsers[j].user_id == user.user_id){
                        //         this.allUsers[j].isCheck = true;
                        //         break;
                        //     }
                        // }
                    }
                }
            }
            this.checkDepartmentState(department.department_id);
            var subDepartmentModels = this.getSubDepartment(department.department_id);
            for(var i = 0; subDepartmentModels.length > 0; i ++){
                var temp = [];
                for(var j = 0; j < subDepartmentModels.length; j++){
                    var tempDepartment = subDepartmentModels[j];
                    tempDepartment.isCheck = department.isCheck;
                }
                subDepartmentModels = temp;
            }
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedUsers.length; i ++){
                    this.getUserImg(this.selectedUsers[i], 'selected');
                }
            });
        },
        deleteUserFromSelectedUsers(user){
            var index = this.indexOfUserInSelected(user);
            this.selectedUsers.splice(index, 1);
            var tempAllUsers = this.allUsers;
            for(var i = 0; i < tempAllUsers.length; i ++){
                if(tempAllUsers[i].user_id == user.user_id){
                    this.allUsers[i].isCheck = false;
                    break;
                }
            }
            this.curDepartment.isCheck = this.checkDepartmentState(user.belong_to_department_id);
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedUsers.length; i ++){
                    this.getUserImg(this.selectedUsers[i], 'selected');
                }
            });
        },
        rootDepartmentClicked:async function (department) {
            this.curDepartment = this.getDepartment(department.department_id);
            this.showRootDepartmentView = false;
            var subDepartmentModels = this.getSubDepartment(department.department_id);
            var subUserModels = this.getSubUsers(department.department_id);
            // var tempDepartments = [];
            // for (var i = 0; i < subDepartmentModels.length; i ++) {
            //     var temp = {};
            //     temp.department_id = subDepartmentModels[i].department_id;
            //     temp.display_name = subDepartmentModels[i].display_name;
            //     temp.subAllUsers = this.getDepartmentSubAllUsers(subDepartmentModels[i]);
                
            //     tempDepartments.push(temp);
            // }
            this.curSubDepartments = subDepartmentModels;
            this.curUsers = this.filterDisabledUsers(subUserModels);
            this.curSubAllUsers = this.getDepartmentSubAllUsers(department);
            var breadInfo = {};
            breadInfo.department_id = department.department_id;
            breadInfo.display_name = department.display_name;
            this.breadCrumbs.push(breadInfo);
            this.$nextTick(function(){
                setTimeout(() => {
                    for(var i = 0; i < this.curUsers.length; i ++){
                        this.getUserImg(this.curUsers[i]);
                    }
                }, 0)
            });
        },
        subDepartmentClicked:async function (department) {
            this.showRootDepartmentView = false;
            this.curDepartment = this.getDepartment(department.department_id);
            var subDepartmentModels = this.getSubDepartment(department.department_id);
            var subUserModels = this.getSubUsers(department.department_id);
            // var tempDepartments = [];
            // for (var i = 0; i < subDepartmentModels.length; i ++) {
            //     var temp = {};
            //     temp.department_id = subDepartmentModels[i].department_id;
            //     temp.display_name = subDepartmentModels[i].display_name;
            //     temp.subAllUsers = this.getDepartmentSubAllUsers(subDepartmentModels[i]);
                
            //     tempDepartments.push(temp);
            // }
            this.curSubDepartments = subDepartmentModels;
            this.curUsers = this.filterDisabledUsers(subUserModels);
            this.curSubAllUsers = this.getDepartmentSubAllUsers(department);
            var breadInfo = {};
            breadInfo.department_id = department.department_id;
            breadInfo.display_name = department.display_name;
            this.breadCrumbs.push(breadInfo);
            this.$nextTick(function(){
                this.updateViewHeight();
                for(var i = 0; i < this.curUsers.length; i ++){
                    this.getUserImg(this.curUsers[i]);
                }
            });
            
        },
        updateViewHeight:function(){
            var elementArray = document.getElementsByClassName("OrganizationSubViewHeader");
            var headerElement;
            for(var i = 0; i < elementArray.length; i ++){
                var temp = elementArray[i];
                if (temp.clientHeight != 0){
                    headerElement = temp;
                    break;
                }
            }
            //var contentElement = document.getElementsByClassName("OrganizationSubViewContent")[0];
            this.viewContentHeight = 282 - headerElement.clientHeight + "px";
        },
        getDepartmentSubAllUsers:function (department) {
            var tempAllUsers = [];

            var subDepartmentModels = this.getSubDepartment(department.department_id);
            var subUserModels = this.getSubUsers(department.department_id);
            tempAllUsers = tempAllUsers.concat(this.filterDisabledUsers(subUserModels));
            for(var i = 0; subDepartmentModels.length > 0; i ++){
                var temp = [];
                for(var j = 0; j < subDepartmentModels.length; j++){
                    var tempDepartment = subDepartmentModels[j];
                    var subUsers = this.getSubUsers(tempDepartment.department_id);
                    temp = temp.concat(this.getSubDepartment(tempDepartment.department_id));
                    tempAllUsers = tempAllUsers.concat(this.filterDisabledUsers(subUsers));
                }
                subDepartmentModels = temp;
            }
            return tempAllUsers;
        },
        filterDisabledUsers(users) {
            var tempUsers = [];
            for(var i = 0; i < users.length; i ++){
                var user = users[i];
                var disable = false;
                for(var j = 0; j < this.disableUsers.length; j ++){
                    var disabledUser = this.disableUsers[j];
                    if (user.user_id == disabledUser) {
                        disable = true;
                        break;
                    }
                }
                if (!disable){
                    tempUsers.push(user);
                }
            }
            return tempUsers;
        },

        getUserImg: async function (userInfo, key=''){
            //console.log("userinfo-tip getuserimg this.userInfo ", this.userInfo);
            if(userInfo.user_id == undefined || userInfo == null) {
                return "";
            }
            var userId = userInfo.user_id;
            var userAvatarUrl = userInfo.avatar_t_url;
            var localPath = confservice.getUserThumbHeadLocalPath(userId);
            let userIconElement = document.getElementById(key + userInfo.user_id);
            if(!userIconElement){
                return;
            }
            if(fs.existsSync(localPath)){
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    userIconElement.setAttribute("src", reader.result);
                }
            }else{
                services.common.downloadUserTAvatar(userInfo.avatar_t_url, userInfo.user_id);
            }
        },
        // getUserAvatarContent:async function(group) {
        //     var targetDir = confservice.getUserThumbHeadPath();
        //     var targetPath = path.join(targetDir, group.group_id + '.png');
        //     var groupAvatarElement = document.getElementById(group.group_id);
        //     if(groupAvatarElement == null) {
        //         return;
        //     }
        //     if(fs.existsSync(targetPath)) {
        //         var showfu = new FileUtil(targetPath);
        //         let showfileObj = showfu.GetUploadfileobj();
        //         let reader = new FileReader();
        //         reader.readAsDataURL(showfileObj);
        //         reader.onloadend = () => {
        //             groupAvatarElement.setAttribute("src", reader.result);
        //         }
        //     }
        //     else{
        //         console.log("download group avatar", group);
        //         await services.common.downloadGroupAvatar(group.group_avarar, group.group_id);
        //         //await this.getGroupAvatarContent(group);
        //     }

        // },
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
        msgContentHightLight: function(curMsg) {
            var showContent = curMsg;
            // showContent = showContent + ' ';
            if(this.searchKey.length == 0) {
                return showContent
            }
            if(showContent.indexOf(this.searchKey) != -1) {
                let splitValue = showContent.split(this.searchKey);
                let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
                return newInnerHtml;
            }else{
                let splitValue = showContent.split('');
                let newInnerHtml = splitValue.join('<span style="color:red;">' + '' + "</span>");
                return newInnerHtml;
            }
        },
        getDepartmentModelFromSqlModel(models){
            var tempArray = [];
            for(var i = 0; i < models.length; i ++){
                var temp = {};
                var tempModel = models[i];
                temp.department_id = tempModel.department_id;
                temp.display_name = tempModel.display_name;
                temp.parent_id = tempModel.parent_id;
                temp.isCheck = false;
                tempArray.push(temp);
            }

            return tempArray;
        },
        getUserModelFromSqlModel(models){
            var tempArray = [];
            for(var i = 0; i < models.length; i ++){
                var temp = {};
                var tempModel = models[i];
                temp.user_id = tempModel.user_id;
                temp.user_display_name = tempModel.user_display_name;
                temp.user_title = tempModel.user_title;
                temp.belong_to_department_id = tempModel.belong_to_department_id;
                temp.avatar_t_url = tempModel.avatar_t_url;
                temp.isCheck = tempModel.isCheck;
                tempArray.push(temp);
            }
            return tempArray;
        },
        getSubDepartment(department_id){
            var subDepartments = [];
            for(var i = 0; i < this.allDepartments.length; i ++){
                var tempModel = this.allDepartments[i];
                if(tempModel.parent_id == department_id){
                    var temp = tempModel;
                    subDepartments.push(temp);
                }
            }
            return subDepartments;
        },
        getSubUsers(department_id){
            var subUsers = [];
            for(var i = 0; i < this.allUsers.length; i ++){
                var tempModel = this.allUsers[i];
                if(tempModel.belong_to_department_id == department_id){
                    var temp = tempModel;
                    subUsers.push(temp);
                }
            }
            return subUsers;
        },
        getDepartment(department_id){
            var tempDepartment = {};
            for(var i = 0; i < this.allDepartments.length; i ++){
                var tempModel = this.allDepartments[i];
                if(tempModel.department_id == department_id){
                    tempDepartment = tempModel;
                }
            }
            return tempDepartment;
        },
        getUserInfo(user_id){
            var tempUser = {};
            for(var i = 0; i < this.allUsers.length; i ++){
                var tempModel = this.allUsers[i];
                if(tempModel.user_id == user_id){
                    tempUser= tempModel;
                }
            }
            return tempUser;
        },
        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        }
    },
    components: {
    },
    created() {
        var showPosition = this.calcImgPosition();
        this.dlgPosition.left = showPosition.left.toString() + "px";
        this.dlgPosition.top = showPosition.top.toString() + "px";
    },
    mounted:async function() {
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
    },
    
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
    .ChatCreaterLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .ChatCreaterDlg {
        position: absolute;
        width: 624px;
        height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .ChatCreaterHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .ChatCreaterHeaderTitle {
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

    .ChatCreaterClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }
    .ChatCreaterBody {
        width: 560px;
        height: 340x;
    }
            .OrganizationView{
            height: 284px;
            width: 100%;
            padding: 0px;
            margin: 0px;
        }
    .ChatCreaterContent {
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
        }
        .searchView {
            height: 284px;
            width: calc(100% - 32px);
            padding: 0px;
            padding-left: 16px;
            margin: 0px;
            overflow: scroll;
                    .subUsersList{
                        list-style: none;
                        padding: 0px;
                        margin-top: 0px;
                        width: 100%;
                        
                        .subUser{
                            height: 48px;
                            width: 100%;

                            .userCheckBox{
                                display: inline-block;
                            }
                            .subUserIcon {
                                width: 32px;
                                height: 32px;
                                margin-top: 8px;
                                margin-left: 6px;
                                border-radius: 4px;

                            }
                            .subUserInfo{
                                display: inline-block;
                                width: 160px;
                                margin: 0px;
                                padding: 0px;
                                padding-left: 12px;
                                .subUserName{
                                    margin: 0px;
                                    padding: 0px;
                                
                                height:20px;
                                font-size:14px;
                                font-weight:400;
                                color:rgba(0,0,0,1);
                                line-height:20px;
                                letter-spacing:1px;
                                font-family: PingFangSC-Regular;
                                }
                                .subUserTitle{
                                    overflow: hidden;
                                    text-overflow:ellipsis;
                                    white-space: nowrap;
                                    margin: 0px;
                                    padding: 0px;
                                    font-weight:400;
                                    color:rgba(153,153,153,1);
                                    line-height:18px;
                                    letter-spacing:1px;
                                    height:18px;
                                    font-size:12px;
                                    font-family: PingFangSC-Regular;
                                }
                            }
                        }
                    }
        }
        .OrganizationSubView {
            height: 284px;
            width: calc(100% - 32px);
            padding: 0px;
            padding-left: 16px;
            margin: 0px;
            overflow: hidden;
            .OrganizationSubViewHeader {
                width: 100%;
                //height: 80px;
                padding: 0px;
                margin: 0px;
                .organizationBreadCrumbsHeader{
                    width: 100%;
                    //height: 40px;
                    margin: 0px;
                    padding: 0px;
                    .el-breadcrumb{
                        display: block;
                        padding-top: 10px;
                        font-size: 14px;
                        line-height: 20px;
                        padding-left: 0px;
                        font-family: PingFangSC-Regular;
                        font-weight: 400;
                        letter-spacing: 1px;
                    }
                }
                .organizationSelectAllHeader{
                    width: 100%;
                    height: 40px;
                    margin: 0px;
                    padding: 0px;
                    vertical-align: top;
                    .organizationCheckBox-all{
                        display: inline-block;
                        
                    }
                    .checkBox-title{
                        display: inline-block;
                        margin: 0px;
                        padding: 0px;
                        margin-left: 8px; 
                        margin-top: 10px;
                        margin-bottom: 10px;
                        height:20px;
                        font-size:14px;
                        font-weight:400;
                        color:rgba(0,0,0,1);
                        line-height:20px;
                        letter-spacing:1px;
                        font-family: PingFangSC-Regular;
                    }
                    .checkBox-label{
                        display: inline-block;
                        width: 178px;
                        color: rgb(153, 153, 153);
                        font-size: 14px;
                        text-align: right;
                        line-height: 20px;
                        font-family: PingFangSC-Regular;
                    }
                }
            }
            .OrganizationSubViewContent{
                height: 202px;
                width: 100%;
                margin: 0px;
                padding: 0px;
                overflow: scroll;
                .subDepartmentView{

                    width: 100%;
                    margin: 0px;
                    padding: 0px;
                    .subDepartmentList{
                        list-style: none;
                        padding: 0px;
                        margin: 0px;
                        width: 100%;
                        height: 100%;
                        .subDepartment{
                            height: 48px;
                            width: 100%;
                            vertical-align: top;
                            .departmentCheckBox-all{
                                display: inline-block;
                            }
                            .subDepartmentInfo{
                                display: inline-block;

                                .subDepartmentTitle{
                                    margin: 0px;
                                    margin-top: 14px;
                                    padding: 0px;
                                    padding-left: 8px;
                                    width:188px;
                                    height:20px;
                                    font-size:14px;
                                    font-weight:400;
                                    color:rgba(0,0,0,1);
                                    line-height:20px;
                                    letter-spacing:1px;
                                    font-family: PingFangSC-Regular;
                                }
                            }
                            .item-arrow {
                                display: inline-block;
                                vertical-align: top;
                                height: 100%;
                                width: 20px;
                            }
                            .right-arrow {
                                margin-left: 6.5px;
                                margin-top: 17.5px;
                                margin-right: 0px;
                                margin-bottom: 0px;
                                width: 7px;
                                height: 13px;
                            }
                        }
                    }
                }
                .subUsersView{
                    width: 100%;
                    margin: 0px;
                    padding: 0px;
                    .subUsersList{
                        list-style: none;
                        padding: 0px;
                        margin: 0px;
                        width: 100%;
                        height: 100%;
                        .subUser{
                            height: 48px;
                            width: 100%;
                        }
                            .userCheckBox{
                                display: inline-block;
                            }
                            .subUserIcon {
                                width: 32px;
                                height: 32px;
                                margin-top: 8px;
                                margin-left: 6px;
                                border-radius: 4px;

                            }
                            .subUserInfo{
                                display: inline-block;
                                width: 160px;
                                margin: 0px;
                                padding: 0px;
                                padding-left: 12px;
                                .subUserName{
                                    margin: 0px;
                                    padding: 0px;
                                
                                height:20px;
                                font-size:14px;
                                font-weight:400;
                                color:rgba(0,0,0,1);
                                line-height:20px;
                                letter-spacing:1px;
                                font-family: PingFangSC-Regular;
                                }
                                .subUserTitle{
                                    overflow: hidden;
                                    text-overflow:ellipsis;
                                    white-space: nowrap;
                                    margin: 0px;
                                    padding: 0px;
                                    font-weight:400;
                                    color:rgba(153,153,153,1);
                                    line-height:18px;
                                    letter-spacing:1px;
                                    height:18px;
                                    font-size:12px;
                                    font-family: PingFangSC-Regular;
                                }
                            }
                        }
                    

                }
            }
        }
        .OrganizationRootView{
            height: 284px;
            width: 100%;
            padding: 0px;
            margin: 0px;
        }
        .OrganizationRootDepartmentList {
            list-style: none;
            margin: 0px;
            width: calc(100% - 32px);
            height: 100%;
            padding: 0px;
            padding-left: 16px;
            overflow: scroll;
        }
        .OrganizationRootDepartment{
            height: 48px;
            cursor: pointer;
            .organizationRootDepartment-icon{
                display: inline-block;
                margin-top: 8px;
                margin-bottom: 8px;
                width: 32px;
                height: 32px;
            }
            .organizationRootDepartment-info{
                display: inline-block;
                height: 48px;
                .organizationRootDepartment-title{
                    width:175px;
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
            .item-arrow {
                display: inline-block;
                vertical-align: top;
                height: 100%;
                width: 20px;
            }
            .right-arrow {
                margin-left: 6.5px;
                margin-top: 17.5px;
                margin-right: 0px;
                margin-bottom: 0px;
                width: 7px;
                height: 13px;
            }
        }

        .selectedView {
            height: 370px;
            width: 50%;
            padding: 0px;
            overflow: hidden;
            .selectedHeader{
                width: 100%;
                height: 34px;
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
                height: 294px;
                width: 100%;
            }
            .selectedUserList{
                height: 100%;
                padding: 0px;
                padding-left: 16px;
                margin: 0px;
                list-style: none;
                overflow: scroll;
                .selectedUser {
                    height: 48px;
                    vertical-align: top;
                
                    .user-icon{
                            width: 32px;
                            height: 32px;
                            display: inline-block;
                            border-radius: 4px;
                            margin-top: 8px;
                            margin-bottom: 8px;
                        }
                        .user-info{
                            display: inline-block;
                            height: 48px;
                        }
                        .user-name{
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
                        .user-delete-icon {
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
        width: 80%;
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
        width: 40px;
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
        width: 20px;
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
        width: 70%;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
        letter-spacing:1px;
    }

    .search-label{
        color:rgba(153,153,153,1);
        font-size: 12px;
        margin-left: 16px;
    }

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
    .el-table__body tr,
        .el-table__body td {
            padding: 0;
            height: 40px;
        }
</style>
