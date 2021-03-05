<template>
    <div class="SearchSenderSelectLayers" id="SearchSenderSelectLayersId" >
        <div :style="dlgPosition" class="SearchSenderSelectDlg" id="SearchSenderSelectDlgId">
            <div class="SearchSenderSelectHeader">
                <div class="SearchSenderSelectHeaderTitle">{{ dialogTitle }}</div>
                <img class="SearchSenderSelectClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            <el-container class="SearchSenderSelectContent">
                <el-aside class="ListView" width="280px">
                    <div class="search">
                    <input class="search-input" v-model="searchKey" @input="search" placeholder="搜索" >
                </div><div class="search-action">
                        
                        <div class="search-delete">
                            <img class="icon-delete" v-show="searchKey" @click="searchDeleteClicked()" src="../../../static/Img/Navigate/searchDelete-20px@2x.png">
                            
                        </div><div class="search-search">
                    
                            <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" >
                        </div>
                    </div>
                    <div class="searchView" v-if="showSearchView">
                        <ul class="subUsersList">
                            <li class="subUser" v-for="(user, index) in searchUser" :key="index">
                                <input type="checkBox" class="multiSelectCheckbox" :checked="userCheckState(user)"
                                    @click="userCheckBoxClicked(user)">
                                <img class="subUserIcon" :id="'search' + user.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                <div class="subUserInfo">
                                    <p class="subUserName" v-html="msgContentHightLight(user.user_display_name)">{{ user.user_display_name }}</p>
                                    <p class="subUserTitle" v-html="msgContentHightLight(user.user_title)">{{ user.user_title }}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="OrganizationView" v-if="showOrganizationView">
                    <div class="OrganizationRootView" v-if="showRootDepartmentView">
                        <ul class="OrganizationRootDepartmentList">
                            <li class="OrganizationRootDepartment" v-for="(department, index) in rootDepartments" @click="rootDepartmentClicked(department)" :key="index">
                                <img class="organizationRootDepartment-icon" src="../../../static/Img/Organization/Navigate/organization_list@2x.png">
                                <div class="organizationRootDepartment-info">
                                    <p class="organizationRootDepartment-title"> {{ department.display_name }} </p>
                                </div>
                                <div align="center" class="item-arrow">
                                    <img class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="OrganizationSubView" v-if="!showRootDepartmentView">
                        <div class="OrganizationSubViewHeader">
                            <div class="organizationBreadCrumbsHeader">
                            <el-breadcrumb separator="/">
                                <el-breadcrumb-item v-for="(item, index) in breadCrumbs" :key="index">
                                    <a href="javascript:void(0)" 
                                    @click="departmentBreadCrumbsClicked(item, index)">
                                    {{ item.display_name }}</a>
                                </el-breadcrumb-item>
                            </el-breadcrumb>
                            </div>
                            <div class="organizationSelectAllHeader">
                                <input type="checkBox" class="multiSelectCheckbox"  :checked="selectAllCheckState"
                                    @click="currentDepartmentSelectAllClicked()">
                                <p class="checkBox-title">全选</p>
                                <p class="checkBox-label">已选{{ curDepartmentSelectUserNumber }}人</p>
                            </div>
                        </div>
                        <div class="OrganizationSubViewContent">
                            <div class="subDepartmentView">
                                <ul class="subDepartmentList">
                                    <li class="subDepartment" v-for="(department, index) in curDepartments"  :key="index" >
                                        <input type="checkBox" class="multiSelectCheckbox" :checked="departmentCheckState(department)"
                                            @click="departmentCheckBoxClicked(department)">
                                        <div class="subDepartmentInfo" @click="subDepartmentClicked(department)">
                                            <p class="subDepartmentTitle">{{ department.display_name }}</p>
                                        </div>
                                        <div align="center" class="item-arrow">
                                            <img class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div class="subUsersView">
                                <ul class="subUsersList">
                                    <li class="subUser" v-for="(user, index) in curUsers" :key="index">
                                        <input type="checkBox" class="multiSelectCheckbox" :checked="userCheckState(user)"
                                            @click="userCheckBoxClicked(user)">
                                        <img class="subUserIcon" :id="searchSenderUserImg(user.user_id)" src="../../../static/Img/User/user-40px@2x.png">
                                        <div class="subUserInfo">
                                            <p class="subUserName">{{ user.user_display_name }}</p>
                                            <p class="subUserTitle">{{ user.user_title }}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    </div>
                </el-aside>
                <el-main class="selectedView">
                    <div class="selectedHeader">
                        已选:{{ selectedUsers.length }}
                    </div>
                    <div class="selectedContentView">
                        <ul class="selectedUserList">
                            <li class="selectedUser" v-for="(user,index) in selectedUsers" :key="index">
                                <img class="user-icon" :id="'selected' + user.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                <div class="user-info">
                                    <p class="user-name">{{ user.user_display_name }}</p>
                                </div>
                                <img class="user-delete-icon" src="../../../static/Img/Chat/delete-20px@2x.png" @click="deleteUserFromSelectedUsers(user)">
                            </li>
                        </ul>
                    </div>
                </el-main>
            </el-container>
            <div class="TransmitFotter">
                <button class="TransmitCancleButton" @click="closeDialog()">取消</button>
                <button class="TransmitConfirmButton" @click="confirm()">创建</button>
            </div>
        </div>
    </div>
</template>

<script>
//import {strMsgContentToJson, FileUtil} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import {Department, UserInfo} from '../../packages/data/sqliteutil.js'
//import {APITransaction} from '../../packages/data/transaction.js'
import * as fs from 'fs-extra'
import {ipcRenderer} from 'electron'
import { object } from '../../packages/core/types'
import confservice from '../../packages/data/conf_service';
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil } from '../../packages/core/Utils.js'
import * as path from 'path'
export default {
    name: 'chatCreaterDlg',
    props: {
        dialogTitle:{
            type: String,
            default: ""
        },
        selectedUsers: {
            type: Array,
            default: []
        },
        rootDepartments: {
            type: Array,
            default: function () {
                return [];
            }
        },
        isSearchAdd: {
            type:Boolean,
            default: false
        }
    },
    computed: {
        curDepartmentSelectUserNumber:function(){
            var count = 0;
            for(var i = 0.; i < this.curSubAllUsers.length; i++){
                if(this.indexOfUserInSelected(this.curSubAllUsers[i]) != -1){
                    count ++;
                }
            }
            return count;
        },
        selectAllCheckState:function(){
            // user state
            // var allUsers = this.curUsers;
            // for (var i = 0; i < this.curDepartments.length; i ++){
            //     allUsers = allUsers.concat(this.curDepartments[i].subAllUsers);
            // }
            var check = true;
            for(var i = 0; i < this.curSubAllUsers.length; i ++){
                if(this.indexOfUserInSelected(this.curSubAllUsers[i]) == -1){
                    check = false;
                    break;
                }
            }
            return check;
        },
        departmentCheckState(){
            return function(department) {
                if(department.subAllUsers == undefined || this.selectedUsers == undefined){
                    return false;
                }
                if(department.subAllUsers.length == 0 || this.selectedUsers.length == 0 || department.subAllUsers.length > this.selectedUsers.length){
                    return false;
                }
                var checked = true;
                for(var i = 0; i < department.subAllUsers.length; i ++){
                    var user = department.subAllUsers[i];
                    if(!this.userCheckState(user)){
                        checked = false;
                        break;
                    }
                }
                return checked;
            }
            
        },
        userCheckState() {
            return function (user) {
                var check = false;
                for(var i = 0; i < this.selectedUsers.length; i ++){
                    var id = user.user_id;
                    if(id == this.selectedUsers[i].user_id){
                        check = true;
                        break;
                    }
                }
                return check;
            }
        }
    },
    data () {
        return {
            imgHeight: 468,
            imgWidth: 624,
            dlgPosition:{},

            showRootDepartmentView:true,
            showOrganizationView:true,
            breadCrumbs:[],
            curDepartments: [],
            curUsers: [],
            curSubAllUsers: [],

            showSearchView: false,
            searchKey:'',
            searchUser: [],
        }
    },
    methods: {
        searchSenderUserImg: function(userId) {
            return "search-sender-user-img-" + userId;
        },
        search:async function () {
            if(this.searchKey == ''){
                this.showSearchView = false;
                this.showOrganizationView = true;
                return;
            }
            this.showSearchView = true;
            this.showOrganizationView = false;
            this.searchUser = await UserInfo.SearchByNameKey(this.searchKey);

            this.$nextTick(function(){
                for(var i = 0; i < this.searchUser.length; i ++){
                    this.getUserImg(this.searchUser[i], 'search');
                }
            });
        },
        searchDeleteClicked(){
            this.searchKey = '';
            this.showSearchView = false;
            this.showOrganizationView = true;
        },
        closeDialog() {
            //this.display = false;
            this.$emit("closeSearchSenderSelectDlg", "");
        },
        async confirm(){
            var selectedUserIds = [];
            console.log("this.selectedusers is ", this.selectedUsers);
            for(let i=0;i<this.selectedUsers.length;i++) {
                let selectedUserId = this.selectedUsers[i].user_id;
                selectedUserIds.push(selectedUserId);
            }
            ipcRenderer.send("searchAddedSenders", selectedUserIds);
            this.$emit("closeSearchSenderSelectDlg", "");
            return;
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
            this.showRootDepartmentView = false;
            var subDepartmentModels = await Department.GetSubDepartment(department.department_id);
            var subUserModels = await UserInfo.GetSubUserinfo(department.department_id);
            var tempDepartments = [];
            for (var i = 0; i < subDepartmentModels.length; i ++) {
                var temp = {};
                temp.department_id = subDepartmentModels[i].department_id;
                temp.display_name = subDepartmentModels[i].display_name;
                temp.subAllUsers = await this.getDepartmentSubAllUsers(subDepartmentModels[i]);
                
                tempDepartments.push(temp);
            }
            this.curDepartments = tempDepartments;
            this.curUsers = this.filterDisabledUsers(subUserModels);
            this.curSubAllUsers = await this.getDepartmentSubAllUsers(department);
            this.$nextTick(function(){
                for(var i = 0; i < this.curUsers.length; i ++){
                    this.getUserImg(this.curUsers[i]);
                }
            });

        },
        currentDepartmentSelectAllClicked(){
            var allUsers = this.curUsers;
            for (var i = 0; i < this.curDepartments.length; i ++){
                allUsers = allUsers.concat(this.curDepartments[i].subAllUsers);
            }
            // check state
            if (this.selectAllCheckState){
                for(var i = 0; i < allUsers.length; i ++){
                    var index = this.indexOfUserInSelected(allUsers[i]);
                    if(index != -1){
                        this.selectedUsers.splice(index, 1);
                    }
                }
                return;
            }
            else {
                for(var i = 0; i < allUsers.length; i ++){
                    var index = this.indexOfUserInSelected(allUsers[i]);
                    if(index == -1){
                        this.selectedUsers.push(allUsers[i]);
                    }
                }
            }
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedUsers.length; i ++){
                    this.getUserImg(this.selectedUsers[i], 'selected');
                }
            });
        },
        userCheckBoxClicked(user){
            console.log("this.selectedusers is ", this.selectedUsers);
            if(this.indexOfUserInSelected(user) != -1){
                var index = this.indexOfUserInSelected(user);
                this.selectedUsers.splice(index, 1);
            }
            else{
                this.selectedUsers.push(user);
            }
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedUsers.length; i ++){
                    this.getUserImg(this.selectedUsers[i], 'selected');
                }
            });
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
            if(this.departmentCheckState(department)){
                for(var i = 0; i < users.length; i ++){
                    var user = users[i];
                    var index = this.indexOfUserInSelected(user);
                    this.selectedUsers.splice(index, 1);
                }
                return;
            }else{
                for(var i = 0; i < users.length; i ++){
                    var user = users[i];
                    if(this.indexOfUserInSelected(user) == -1){
                        this.selectedUsers.push(user);
                //var index = this.selectedUsers.indexOf(user);
                //this.selectedUsers.splice(index, 1);
                    }
                }
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
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedUsers.length; i ++){
                    this.getUserImg(this.selectedUsers[i], 'selected');
                }
            });
        },
        rootDepartmentClicked:async function (department) {
            this.showRootDepartmentView = false;
            var subDepartmentModels = await Department.GetSubDepartment(department.department_id);
            var subUserModels = await UserInfo.GetSubUserinfo(department.department_id);
            var tempDepartments = [];
            for (var i = 0; i < subDepartmentModels.length; i ++) {
                var temp = {};
                temp.department_id = subDepartmentModels[i].department_id;
                temp.display_name = subDepartmentModels[i].display_name;
                temp.subAllUsers = await this.getDepartmentSubAllUsers(subDepartmentModels[i]);
                
                tempDepartments.push(temp);
            }
            this.curDepartments = tempDepartments;
            this.curUsers = this.filterDisabledUsers(subUserModels);
            this.curSubAllUsers = await this.getDepartmentSubAllUsers(department);
            var breadInfo = {};
            breadInfo.department_id = department.department_id;
            breadInfo.display_name = department.display_name;
            this.breadCrumbs.push(breadInfo);
            this.$nextTick(function(){
                for(var i = 0; i < this.curUsers.length; i ++){
                    this.getUserImg(this.curUsers[i]);
                }
            });
        },
        subDepartmentClicked:async function (department) {
            this.showRootDepartmentView = false;
            var subDepartmentModels = await Department.GetSubDepartment(department.department_id);
            var subUserModels = await UserInfo.GetSubUserinfo(department.department_id);
            var tempDepartments = [];
            for (var i = 0; i < subDepartmentModels.length; i ++) {
                var temp = {};
                temp.department_id = subDepartmentModels[i].department_id;
                temp.display_name = subDepartmentModels[i].display_name;
                temp.subAllUsers = await this.getDepartmentSubAllUsers(subDepartmentModels[i]);
                
                tempDepartments.push(temp);
            }
            this.curDepartments = tempDepartments;
            this.curUsers = this.filterDisabledUsers(subUserModels);
            this.curSubAllUsers = await this.getDepartmentSubAllUsers(department);
            var breadInfo = {};
            breadInfo.department_id = department.department_id;
            breadInfo.display_name = department.display_name;
            this.breadCrumbs.push(breadInfo);
            this.$nextTick(function(){
                for(var i = 0; i < this.curUsers.length; i ++){
                    this.getUserImg(this.curUsers[i]);
                }
            });
        },
        getDepartmentSubAllUsers:async function (department) {
            var tempAllUsers = [];

            var subDepartmentModels = await Department.GetSubDepartment(department.department_id);
            var subUserModels = await UserInfo.GetSubUserinfo(department.department_id);
            tempAllUsers = tempAllUsers.concat(this.filterDisabledUsers(subUserModels));
            for(var i = 0; subDepartmentModels.length > 0; i ++){
                var temp = [];
                for(var j = 0; j < subDepartmentModels.length; j++){
                    var tempDepartment = subDepartmentModels[j];
                    var subUsers = await UserInfo.GetSubUserinfo(tempDepartment.department_id);
                    temp = temp.concat(await Department.GetSubDepartment(tempDepartment.department_id));
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
                // for(var j = 0; j < this.disableUsers.length; j ++){
                //     var disabledUser = this.disableUsers[j];
                //     if (user.user_id == disabledUser.user_id) {
                //         disable = true;
                //         break;
                //     }
                // }
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
            let userIconSelectedElement = document.getElementById(key + userInfo.user_id);
            let userIconElement = document.getElementById(this.searchSenderUserImg(userInfo.user_id));
            if(fs.existsSync(localPath)){
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    if(userIconSelectedElement != undefined) {
                        userIconSelectedElement.setAttribute("src", reader.result);
                    }
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
    },
    components: {
    },
    created() {

            var showPosition = this.calcImgPosition();
            
            this.dlgPosition.left = showPosition.left.toString() + "px";
            this.dlgPosition.top = showPosition.top.toString() + "px";
            
            // this.$nextTick(function(){
            //     for(var i = 0; i < this.recentGroups.length; i ++){
            //         this.getGroupAvatarContent(this.recentGroups[i]);
            //     }
            // });
    },
    mounted: function() {
        // breadCrumbs
            var root = {};
            if(this.rootDepartments[0] == undefined) {
                return;
            }
            root.department_id = this.rootDepartments[0].parent_id;
            root.display_name = '组织';
            this.breadCrumbs.push(root);

            // console.log(this.selectedUsers);
            // console.log(this.rootDepartments);
    },
    
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
    .SearchSenderSelectLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .SearchSenderSelectDlg {
        position: absolute;
        width: 624px;
        height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .SearchSenderSelectHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .SearchSenderSelectHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
    }

    .SearchSenderSelectClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }
    .SearchSenderSelectBody {
        width: 560px;
        height: 340x;
    }
            .OrganizationView{
            height: 284px;
            width: 100%;
            padding: 0px;
            margin: 0px;
        }
    .SearchSenderSelectContent {
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
                        margin: 0px;
                        width: 100%;
                        height: 100%;
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
                                letter-spacing: 0px;
                                }
                                .subUserTitle{
                                    margin: 0px;
                                    padding: 0px;
                                    font-weight:400;
                                    color:rgba(153,153,153,1);
                                    line-height:18px;
                                    letter-spacing: 0px;
                                    height:18px;
                                    font-size:12px;
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
                height: 80px;
                padding: 0px;
                margin: 0px;
                .organizationBreadCrumbsHeader{
                    width: 100%;
                    height: 40px;
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
                        letter-spacing: 0px;
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
                        letter-spacing: 0px;
                        font-family: PingFangSC-Regular;
                    }
                    .checkBox-label{
                        display: inline-block;
                        width: 179px;
                        color: rgb(153, 153, 153);
                        font-size: 14px;
                        text-align: right;
                        line-height: 20px;
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
                                    width:189px;
                                    height:20px;
                                    font-size:14px;
                                    font-weight:400;
                                    color:rgba(0,0,0,1);
                                    line-height:20px;
                                    letter-spacing: 0px;
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
                                letter-spacing: 0px;
                                font-family: PingFangSC-Regular;
                                }
                                .subUserTitle{
                                    margin: 0px;
                                    padding: 0px;
                                    font-weight:400;
                                    color:rgba(153,153,153,1);
                                    line-height:18px;
                                    letter-spacing: 0px;
                                    height:18px;
                                    font-size:12px;
                                    font-family: PingFangSC-Regular;
                                }
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
                    letter-spacing: 0px;
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
            
            height: 340px;
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
                letter-spacing: 0px;
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
                            letter-spacing: 0px;
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
        font-family: 'PingFangSC-Regular';
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
        letter-spacing: 0px;
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
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        border:none;
    }
 
    .TransmitConfirmButton:disabled{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(167, 224, 196, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        border: none;
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
</style>
