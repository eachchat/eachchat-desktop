<template>
    <el-container>
        <el-header>
            <div class="win-header">
                <winHeaderBar v-show="isWindows" @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
            </div>
        </el-header>
        <el-container>
            <el-aside width="280px">
                <div class="list-header">
                    <div class="search">
                        <input class="search-input" v-model="searchKey" @input="search" placeholder="搜索..." >
                    </div><div class="search-action">
                            
                            <div class="search-delete">
                                <img class="icon-delete" v-show="searchKey" @click="searchDeleteClicked()" src="../../../static/Img/Navigate/searchDelete-20px@2x.png">
                                
                            </div><div class="search-search">
                        
                                <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" >
                            </div>
                        </div>
                </div>
                <div class="search-view" v-show="showSearchView">
                    <ul class="managers-list">
                        <li class="manager"
                            v-for="(manager, index) in searchUsers"
                            @click="searchUserMenuItemClicked(manager.user_id)" 
                            :key="index">
                            <img class="manager-icon" :id="getSearchUserIconId(manager.user_id)" src="../../../static/Img/User/user.jpeg">
                            <div class="manager-info">
                            <p v-html="msgContentHightLight(manager.user_display_name)" class="manager-name">{{ manager.user_display_name }}</p>
                            <p v-html="msgContentHightLight(manager.user_title)" class="manager-title">{{ manager.user_title }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="organization-view" v-show="!showSearchView">
                    <ul class="departments-list">
                        <li class="department"
                            v-for="(department, index) in departments"
                            @click="departmentMenuItemClicked(department)" 
                            :key="index">
                            <img class="department-icon" src="../../../static/Img/Organization/Navigate/organization_list@2x.png">
                            <div class="department-info">
                                <p class="department-name">{{ department.display_name }}</p>
                            </div>
                            <div align="center" class="item-arrow">
                                <img class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                            </div>
                        </li>
                    </ul>
                </div>
            </el-aside>
            <el-container class="right-container">
                
                <organizationList :parentInfo="currentDepartment" :key="organizationListTimer"></organizationList>

            </el-container>
        </el-container>
        <userInfoContent :userInfo="searchUserInfo" :originPosition="searchUserInfoPosition" v-show="showSearchUserInfoTips" :key="searchUserInfoKey"></userInfoContent> 
    </el-container>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {services, environment} from '../../packages/data/index.js';
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {Department, UserInfo} from '../../packages/data/sqliteutil.js';
import organizationList from './organization-list';
import chatGroupCreater from './chatgroup-creater';
import listHeader from './listheader';
import userInfoContent from './user-info';
import winHeaderBar from './win-header.vue';
import {ipcRenderer} from 'electron'
export default {
    name: 'organization',
    data() {
        return {
            departments: [],

            dialogVisible: false,
            usersSelected: [],
            currentDepartment: {},
            organizationListTimer: '',

            searchKey:'',
            searchUsers: [],
            showSearchView: false,
            showSearchUserInfoTips: false,
            searchUserInfo:{},
            searchUserInfoKey: 0,
            searchUserInfoPosition:{},
            //arrowImageSrc: "../../../static/Image/right_arrow@2x.png"
        }
    },
    methods: {
        Close: function() {
            ipcRenderer.send("win-close");
        },
        Min: function() {
            ipcRenderer.send("win-min");
        },
        Max: function() {
            ipcRenderer.send("win-max");
        },
        isWindows() {
            return environment.os.isWindows;
        },
        searchDeleteClicked(){
            this.searchKey = '';
            this.showSearchView = false;
        },
        search:async function () {
            if (this.searchKey == ''){
                this.showSearchView = false;
                return;
            }
            var departmentResults = await Department.SearchByNameKey(this.searchKey);
            console.log(departmentResults);
            var userResults = await UserInfo.SearchByNameKey(this.searchKey);
            console.log("yonghujieguo");
            console.log(this.searchKey);
            console.log(userResults);
            this.searchUsers = userResults;
            this.showSearchView = true;
            this.$nextTick(function(){
                var users = this.searchUsers;
                for(var i = 0; i < this.searchUsers.length; i ++){
                    this.getUserImg(this.searchUsers[i]);
                }
            });
        },
        getSearchUserIconId(id){
            
            return 'search' + id;
        },
        getUserImg: async function (userInfo){
            //console.log("userinfo-tip getuserimg this.userInfo ", this.userInfo);
            if(userInfo.user_id == undefined || userInfo == null) {
                return "";
            }
            var userId = userInfo.user_id;
            var userAvatarUrl = userInfo.acatar_t_url;
            var localPath = confservice.getUserThumbHeadLocalPath(userId);
            let userIconElement = document.getElementById(this.getSearchUserIconId(userInfo.user_id));
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
        searchUserMenuItemClicked:async function(id) {
            
            if (this.showSearchUserInfoTips&&(this.searchUserInfo.id == id)){
                this.showSearchUserInfoTips = false;
                return;
            }
            var iconElement = document.getElementById(this.getSearchUserIconId(id));
            this.searchUserInfoPosition.left = iconElement.getBoundingClientRect().left;
            this.searchUserInfoPosition.top = iconElement.getBoundingClientRect().top;
            console.log(iconElement.getBoundingClientRect());
            var tempUserInfo = {};
            //get userinfo
            var user = await UserInfo.GetUserInfo(id);
            tempUserInfo.id = user.user_id;
            tempUserInfo.avatarTUrl = user.avatar_t_url;
            tempUserInfo.displayName = user.user_display_name;
            tempUserInfo.title = user.user_title;
            tempUserInfo.statusDescription = user.status_description;
            tempUserInfo.workDescription = user.work_description;
            tempUserInfo.managerId = user.manager_id;
            tempUserInfo.departmentId = user.belong_to_department_id;
            
            //get department
            var department = await Department.GetDepartmentInfoByUserID(id);
            tempUserInfo.department = department;
            //get email
            var email = await UserInfo.GetUserEmailByUserID(id);
            tempUserInfo.email = email;
            //get phone
            var phone = await UserInfo.GetUserPhoneByUserID(id);
            var tempPhone = {};
            for (var i = 0; i < phone.length; i ++){
                var temp = phone[i];
                if(temp.phone_type == 'mobile'){
                    tempPhone.mobile = temp.phone_value;
                }else{
                    tempPhone.work = temp.phone_value;
                }
            }
            tempUserInfo.phone = tempPhone;


            var leaders = await UserInfo.GetLeaders(id);
            tempUserInfo.leaders = leaders;

            this.searchUserInfo = tempUserInfo;
            this.searchUserInfoKey ++;
            this.showSearchUserInfoTips = true;
        },
        getOrganizationBaseData:async function() {
            var rootDepartment = await Department.GetRoot();
            console.log(rootDepartment);
            var departments = await Department.GetSubDepartment(rootDepartment.department_id);
            console.log(departments);
            var tempDepartments = [];
            for(var i = 0; i < departments.length; i ++){
                tempDepartments[departments[i].show_order] = departments[i];
            }
            this.departments = tempDepartments;
            this.currentDepartment = this.departments[0];
            this.organizationListTimer = new Date().getTime();
        },
        departmentMenuItemClicked(department) {
            this.currentDepartment = department;
            this.organizationListTimer = new Date().getTime();
        },

        recentUsersMenuItemClicked:async function() {
            this.dialogVisible = true;
            /*
            if (this.showRecentUsersMenuItem) {
                this.arrowImageSrc = "../../../static/Image/right_arrow@2x.png";
            }else {
                this.recentUsers = await services.common.GetRecentUsers();
                this.arrowImageSrc = "../../../static/Image/down_arrow@2x.png";
            }
            this.showRecentUsersMenuItem = !this.showRecentUsersMenuItem;
            */
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
        organizationList,
        chatGroupCreater,
        listHeader,
        userInfoContent,
        winHeaderBar,
    },
    created:async function() {
        await this.getOrganizationBaseData();
        var that = this;
        document.addEventListener('click',function(e){
            if(e.target.className.indexOf('userInfo') == -1){
                that.showSearchUserInfoTips = false;
            }
            
        });
    }
}
</script>

<style lang="scss" scoped>
// ::-webkit-scrollbar-track-piece {
//     background-color: #F1F1F1;
//     border-radius: 10px;
// }

// ::-webkit-scrollbar {
//     width: 8px;
//     height: 12px;
// }

// ::-webkit-scrollbar-thumb {
//     height: 50px;
//     background-color: #C1C1C1;
//     border-radius: 10px;
//     outline: none;
// }

// ::-webkit-scrollbar-thumb:hover {
//     height: 50px;
//     background-color: #A8A8A8;
//     border-radius: 10px;
// }
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
.list-header {
    width: 100%;
    //height: 56px;
    line-height: 56px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    margin: 0px 0px 0px 0px;
    display: block;
}

.departments-list {
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0;
    list-style: none;
}
.department {
    height: 60px;
    //border-bottom: 1px solid rgba(221, 221, 221, 1);
    
}
.department:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}
.department-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
}
.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 92px);
}
.department-name {
    text-align: left;
    height: 40%;
    width: 70%;
    margin-top: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 1px;
}
.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 6.5px;
    margin-top: 25.5px;
    margin-right: 0px;
    margin-bottom: 0px;
    width: 7px;
    height: 13px;
}
.search-view{
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: scroll;
    .managers-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    //border-top: 1px solid rgb(221, 221, 221);
    .manager {
    height: 60px;
    //border-bottom: 1px solid rgb(221, 221, 221);
    .manager-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
    border-radius: 4px;
}
.manager-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 120px);
}
.manager-name {
    height: 20px;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 2px;;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    font-weight:400;
    letter-spacing:1px;
    color:rgba(0,0,0,1);
}
.manager-title {
    height: 18px;
    width: 100%;
    margin-top: 0px;
    margin-bottom: 10px;
    margin-left: 12px;
    font-size: 12px;
    line-height: 18px;
    font-weight:400;
    color:rgba(153,153,153,1);
    letter-spacing:1px;
}
}
.manager:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}
}
}

.el-header {
    height: 24px !important;
    padding: 0px;
    line-height: 24px;
}
.el-container {
    width: auto;
    height: 100%; 
    border:1px solid #eee;   
    background-color: white; 
    .el-aside {
        width: 150px;
        overflow: hidden;
        border-right: 1px solid rgb(221, 221, 221);
        display: block;
    }
    .right-container {
        width: 100%;
        height: 100%;  
        background-color: white; 
        border: hidden;
    }
}

    .search {
        margin: 12px 0px 0px 16px;
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
        font-family: 'Microsoft YaHei';
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
        letter-spacing:1px;
    }
</style>