<template>
    <el-container>
        <el-aside width="280px">
            <div class="list-header">
                <div class="search">
                    <el-input size='mini' clearable prefix-icon="el-icon-search" class="search-input" v-model="searchKey" @input="search" placeholder="搜索..." ></el-input>
                </div>
            </div>
            <div class="search-view" v-show="showSearchView">
                <ul class="managers-list">
                    <div class='grid-content'>组织</div>
                    <li class="manager"
                        v-for="department in searchDeparements"
                        @click="searchDeparmentItemClicked(department.department_id)" 
                        :key="department.department_id">
                        <img ondragstart="return false" class="manager-icon" :id="getSearchUserIconId(department.department_id)" src="../../../static/Img/Organization/Image/organization-40px@2x.png">
                        <div class="manager-info">
                        <p v-html="msgContentHightLight(department.display_name)" class="contact-list-name">{{ department.display_name }}</p>
                        <p v-html="msgContentHightLight(department.description)" class="contact-list-titile">{{ department.description }}</p>
                        </div>
                    </li>
                    <div class='grid-content'>成员</div>
                    <li class="manager"
                        v-for="manager in searchUsers"
                        @click="searchUserMenuItemClicked(manager.user_id)" 
                        :key="manager.user_id">
                        <img ondragstart="return false" class="manager-icon" :id="getSearchUserIconId(manager.user_id)" src="../../../static/Img/User/user-40px@2x.png">
                        <div class="contact-list-info">
                        <p v-html="msgContentHightLight(manager.user_display_name)" class="contact-list-name">{{ manager.user_display_name }}</p>
                        <p v-html="msgContentHightLight(manager.user_title)" class="contact-list-titile">{{ manager.user_title }}</p>
                        </div>
                    </li>
                    <div class='grid-content'>联系人</div>
                    <li class="manager"
                        v-for="contact in searchContacts"
                        @click="SearchContactItemClicked(contact.matrix_id)" 
                        :key="contact.matrix_id">
                        <img ondragstart="return false" class="manager-icon" :id="getSearchUserIconId(contact.matrix_id)" src="../../../static/Img/User/user-40px@2x.png">
                        <div class="contact-list-info">
                        <p v-html="msgContentHightLight(contact.display_name)" class="contact-list-name">{{ contact.display_name }}</p>
                        <p v-html="msgContentHightLight(contact.title)" class="contact-list-titile">{{ contact.title }}</p>
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
                        <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Image/organization-40px@2x.png"><div class="department-info">
                            <p class="department-name">{{ department.display_name }}</p>
                        </div>
                        <div align="center" class="item-arrow">
                            <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </li>
                </ul>
            </div>
        </el-aside>
        <el-container class="right-container">
            <organizationList  v-show='bOrganizeShow' :parentInfo="rootDepartment" :currentDepartment="currentDepartment" ></organizationList>
            <contactList  v-if='bContactShow' :parentInfo="currentDepartment" ></contactList>
        </el-container>
        <userInfoContent :userInfo="searchUserInfo" :isOwn="isOwn" :originPosition="searchUserInfoPosition" v-show="showSearchUserInfoTips" :key="searchUserInfoKey" :userType="contactType"></userInfoContent> 
        <div class="win-header">
            <winHeaderBar @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
        </div>
    </el-container>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {services, environment} from '../../packages/data/index.js';
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {Contact, Department, UserInfo} from '../../packages/data/sqliteutil.js';
import organizationList from './organization-list';
import contactList from './contact-list'
import listHeader from './listheader';
import userInfoContent from './user-info';
import winHeaderBar from './win-header-login.vue';
import {ipcRenderer} from 'electron'
import {ComponentUtil} from '../script/component-util.js'
import '../style/organise.css'

export default {
    name: 'organization',
    props: {
        receiveSearchKey: {
            type: String,
            default: ''
        }
    },
    watch: {
        receiveSearchKey: function() {
            console.log("can search is ", this.canSearch);
            if(this.canSearch) {
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.searchKey = this.receiveSearchKey;
                        this.search();
                        console.log("searchKey ", this.searchKey)
                    }, 1000)
                })
            }
        },
        searchKey: function(){
            if(this.searchKey.length == 0);
                this.showSearchView = false;
        }
    },
    data() {
        return {
            organizeMenuName : '',
            contactMenuName: '',
            bOrganizeShow: false,
            bContactShow: true,
            canSearch: false,
            departments: [],
            isOwn: false,
            dialogVisible: false,
            usersSelected: [],
            rootDepartment:{},
            currentDepartment: {},
            organizationListTimer: '',

            searchKey:'',
            searchUsers: [],
            searchContacts:[],
            searchDeparements: [],
            showSearchView: false,
            showSearchUserInfoTips: false,
            searchUserInfo:{},
            searchUserInfoKey: 0,
            searchUserInfoPosition:{},
            contactType:"origanise"
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

        search:async function () {
            console.log("this.searchKey ", this.searchKey)
            if (this.searchKey == ''){
                this.showSearchView = false;
                return;
            }
            this.searchDeparements = await Department.SearchByNameKey(this.searchKey);
            this.searchUsers = await UserInfo.SearchByNameKey(this.searchKey);
            this.searchContacts = await Contact.SearchByNameKey(this.searchKey);
            if(this.searchDeparements.length!=0 || this.searchUsers.length != 0 || this.searchContacts.length != 0)
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
                global.services.common.downloadUserTAvatar(userInfo.avatar_t_url, userInfo.user_id);
            }
        },

        searchDeparmentItemClicked: async function(id){
            let department = await Department.GetDepartmentInfoByDepartmentID(id);
            if(!department)
                return;
            this.showSearchView = false;
            this.showSearchUserInfoTips = false;
            this.bOrganizeShow = true;
            this.bContactShow = false;
            this.rootDepartment = this.departments[0];
            this.currentDepartment = department;
        },

        GetUserinfo: async function(id, userType){
            if (this.showSearchUserInfoTips && (this.searchUserInfo.matrix_id == id)){
                    this.showSearchUserInfoTips = false;
                    return;
            }
            
            var iconElement = document.getElementById(this.getSearchUserIconId(id));
            this.searchUserInfoPosition.left = iconElement.getBoundingClientRect().left;
            this.searchUserInfoPosition.top = iconElement.getBoundingClientRect().top;
            console.log(iconElement.getBoundingClientRect());
            var tempUserInfo = {};
            //get userinfo
            var selfUser = await global.services.common.GetSelfUserModel();
            console.log("is owner is ", this.isOwn);
            if(id == selfUser.id) {
                this.isOwn = true;
            }
            var user;
            if(userType == 'contact')
            {
                user = await Contact.GetContactInfo(id);
                let userInfo = await UserInfo.GetUserInfoByMatrixID(id)
                let department = {display_name:""};
                if(userInfo)
                    department = await Department.GetDepartmentInfoByUserID(userInfo.user_id);
                tempUserInfo.department = department;
                tempUserInfo.matrix_id = id;
                tempUserInfo.displayName = ComponentUtil.GetDisplayName(user.display_name, id);
                tempUserInfo.title = ComponentUtil.ShowInfoContent(user.title);
                tempUserInfo.statusDescription = ComponentUtil.ShowInfoContent(user.status_description);
                tempUserInfo.workDescription = ComponentUtil.ShowInfoContent(user.work_description);
                tempUserInfo.email = [];
                tempUserInfo.email.push({
                    email_value: ComponentUtil.ShowInfoContent(user.email)
                })
                tempUserInfo.phone = {
                    mobile: ComponentUtil.ShowInfoContent(user.telephone),
                    work: ComponentUtil.ShowInfoContent(user.mobile)
                };
            }
            else
            {
                user = await UserInfo.GetUserInfo(id);
                tempUserInfo.matrix_id = user.matrix_id;
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
            }
            this.searchUserInfo = tempUserInfo;
            this.searchUserInfoKey ++;
            this.showSearchUserInfoTips = true;
            this.contactType = userType;
        },

        SearchContactItemClicked: async function(id){
            await this.GetUserinfo(id, 'contact')
        },

        searchUserMenuItemClicked:async function(id) {
            await this.GetUserinfo(id, 'organise');
        },
        getOrganizationBaseData:async function() {
            var departments = [];
            departments.push({
                display_name: this.$t("organizeMenuName"),
            });
            departments.push({
                display_name: this.$t("contactMenuName")
            })
            this.departments = departments;
            this.currentDepartment = this.departments[0];
            this.organizationListTimer = new Date().getTime();
        },
        departmentMenuItemClicked(department) {
            if(department.display_name == this.organizeMenuName){
                //组织架构模板
                this.bOrganizeShow = true;
                this.bContactShow = false;
            }
            else if(department.display_name == this.contactMenuName){
                //联系人模板
                this.bOrganizeShow = false;
                this.bContactShow = true;
             }
            this.currentDepartment = department;
            this.organizationListTimer = new Date().getTime();
        },

        recentUsersMenuItemClicked:async function() {
            this.dialogVisible = true;
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
        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        }
    },
    components: {
        organizationList,
        listHeader,
        userInfoContent,
        winHeaderBar,
        contactList
    },
    created:async function() {
        this.organizeMenuName = this.$t("organizeMenuName"),
        this.contactMenuName = this.$t("contactMenuName"),
        console.log("to get organization");
        await this.getOrganizationBaseData();
        var that = this;
        document.addEventListener('click',function(e){
            if(e.target.className.indexOf('userInfo') == -1){
                that.showSearchUserInfoTips = false;
            }
            
        });
        console.log("can search now");
        this.canSearch = true;
        if(this.receiveSearchKey.length != 0 ) {
            this.$nextTick(() => {
                setTimeout(() => {
                    this.searchKey = this.receiveSearchKey;
                    this.search();
                    console.log("searchKey ", this.searchKey)
                }, 1000)
            })
        }
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
    -webkit-app-region: drag;
}
* {
    -webkit-app-region: no-drag;
}
.organization-view{
    margin-top: -13px;
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
    border-radius: 50%;
}
.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 99px);
}
.department-name {
    text-align: left;
    height: 20px;
    width: 180px;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 1px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    display: flex;
    place-items: center;
}
.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 6.5px;
    margin-top: 23.5px;
    margin-right: 0px;
    margin-bottom: 23.5px;
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
                border-radius: 50%;
            }
        }
        .manager:hover {
            height: 60px;
            background:rgba(243,244,247,1);
            box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
        }
    }
}
.manager-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 84px);
}

.el-header {
    height: 24px !important;
    padding: 0px;
    line-height: 24px;
}
.el-container {
    width: auto;
    height: 100%; 
       
    background-color: white; 
    .el-aside {
        width: 150px;
        overflow: hidden;
        border-right: 1px solid rgba(221, 221, 221, 1);
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
        margin: 12px 16px 12px 16px;
        text-align: left;
        width: calc(100% - 32px);
        height: 32px;
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
        width: 248px;
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
</style>