<template>
    <el-container>
        <el-header height="56px" class="contact-header">
            <p class="contact-header-title">{{$t('contactMenuName')}}</p>
            <div class='chat-tool-invite-div' @click="addContact()">
            <img style="margin-top: 18px; width:35x;height:35px" src='../../../static/Img/Chat/addMember.png'>
            <div style="vertical-align:top; margin-top: 25px; display:inline-block">{{$t('addContactButton')}}</div>
            </div>
        </el-header>
        <el-main>
            <el-container class="bottom-container" id="contact-main-container">
                <div class="contact-view">
                    <ul class="managers-list">
                        <li class="manager"
                            v-for="(user, index) in contactList"
                            @click="userMenuItemClicked(user.user_id)" 
                            :key="index">
                            <img ondragstart="return false" class="manager-icon" :id="user.user_id" src="../../../static/Img/User/user-40px@2x.png">
                            <div class="manager-info">
                                <p class="manager-name">{{ user.display_name }}</p>
                                <p class="manager-title">{{ user.user_id }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <userInfoContent :userInfo="userInfo" :originPosition="userInfoPosition" v-if="showUserInfoTips" :key="userInfoTipKey"></userInfoContent>
            </el-container>
        </el-main>
        <addContact v-show="showChatContactDlg" @closeAddContactDlg='closeAddContactDlg' @showInputContact="HandleInputContact">
        </addContact>
        <InputContactInfo v-show='showInputContactDlg' @closeInputContact="CloseInputContactDlg">
        </InputContactInfo>
    </el-container>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
//import { services } from '../../packages/data'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {services} from '../../packages/data/index.js';
import {UserInfo, Contact} from '../../packages/data/sqliteutil.js'; 
import yidrawer from './yi-drawer';
import userInfoContent from './user-info';
import userInfoTip from './userinfo-tip';
import addContact from './add-contact';
import InputContactInfo from './input-contact-info';

export default {
    name: 'contactList',
    components: {
        yidrawer,
        userInfoContent,
        userInfoTip,
        addContact,
        InputContactInfo
    },
    data () {
        return {
            breadCrumbs: [],
            headerTitle: '',
            departments: [],
            contactList: [],
            users: [],
            managers: [],
            userInfo: {},
            showUserInfoTips: false,
            userInfoTipKey: 1,
            userInfoPosition: {},
            showChatContactDlg: false,
            showInputContactDlg: false
        }
    },
    props:{
        parentInfo: {
            type:Object
        }
    },
    computed: {
        showcontactLevelTwo: function(){
            if (this.contactList.length >= 2) {
                return true;
            }
            else{
                return false;
            }
        },
        
        showcontactLevelThree: function(){
            if (this.contactList.length >= 3) {
                return true;
            }
            else{
                return false;
            }
        },
        showcontactLevelFour: function(){
            if (this.contactList.length >= 4) {
                return true;
            }
            else{
                return false;
            }
        },
                showcontactLevelFive: function(){
            if (this.contactList.length >= 5) {
                return true;
            }
            else{
                return false;
            }
        },
                showcontactLevelSix: function(){
            if (this.contactList.length >= 6) {
                return true;
            }
            else{
                return false;
            }
        },
                showcontactLevelSeven: function(){
            if (this.contactList.length >= 7) {
                return true;
            }
            else{
                return false;
            }
        },
                showcontactLevelEight: function(){
            if (this.contactList.length >= 8) {
                return true;
            }
            else{
                return false;
            }
        },
                showcontactLevelNine: function(){
            if (this.contactList.length >= 9) {
                return true;
            }
            else{
                return false;
            }
        },
    },
    methods: {
        HandleInputContact: function(){
            this.showInputContactDlg = true;
            this.showChatContactDlg = false;
        },

        closeAddContactDlg: async function(){
            this.showChatContactDlg = false;
            this.contactList = await Contact.GetAllContact();
        }, 

        CloseInputContactDlg: async function(){
            this.showInputContactDlg = false;
            this.contactList = await Contact.GetAllContact();
            console.log(this.contactList)
        },

        addContact: function(){
            this.showChatContactDlg = true;
            console.log("addContact")
        },
        departmentMenuItemClicked:async function(department, level) {



            var id = department.department_id;
            var name = department.display_name;

            var departmentModels = await Department.GetSubDepartment(id);
            var tempDepartments = [];
            // for(var i = 0; i < departmentModels.length; i ++){
            //     tempDepartments[departmentModels[i].show_order] = departmentModels[i];
            // }
            var contact = {};
            contact.departments = departmentModels.sort(this.compare("show_order")); //tempDepartments;
            contact.users = await UserInfo.GetSubUserinfo(id);
            if (level == this.contactList.length - 1) {
                this.contactList.push(contact);
            }else {
                this.contactList.splice(level + 1, this.contactList.length - level - 1);
                this.contactList.push(contact);
            }
            
            this.$nextTick(function(){
                var element = document.getElementById("contact-main-container");
                element.scroll(element.offsetWidth,0);
                for(var i = 0; i < contact.users.length; i ++){
                    this.getUserImg(contact.users[i]);
                }
            });
            

        },
        userMenuItemClicked:async function(id) {
            if (this.showUserInfoTips&&(this.userInfo.id == id)){
                this.showUserInfoTips = false;
                return;
            }
            var iconElement = document.getElementById(id);
            this.userInfoPosition.left = iconElement.getBoundingClientRect().left;
            this.userInfoPosition.top = iconElement.getBoundingClientRect().top;
            console.log(iconElement.getBoundingClientRect());
            var tempUserInfo = {};
            //get userinfo
            //var user = await UserInfo.GetUserInfo(id);
            tempUserInfo.id = id;
            tempUserInfo.displayName = 'user.user_display_name';
            tempUserInfo.title = 'user.user_title';
            tempUserInfo.statusDescription = 'user.status_description';
            tempUserInfo.workDescription = 'user.work_description';
            tempUserInfo.managerId = 'user.manager_id';
            tempUserInfo.departmentId = 'user.belong_to_department_id';
            tempUserInfo.department = 'department';
            tempUserInfo.email = 'email';
            tempUserInfo.phone = 'tempPhone';
            tempUserInfo.leaders = 'leaders';

            this.userInfo = tempUserInfo;
            this.userInfoTipKey ++;
            this.showUserInfoTips = true;
        },
        getUserImg: async function (userInfo){
            //console.log("userinfo-tip getuserimg this.userInfo ", this.userInfo);
            if(userInfo.user_id == undefined || userInfo == null) {
                return "";
            }
            var userId = userInfo.user_id;
            var userAvatarUrl = userInfo.avatar_t_url;
            var localPath = confservice.getUserThumbHeadLocalPath(userId);
            let userIconElement = document.getElementById(userInfo.user_id);
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
        
        getAppBaseData:async function() {
            this.contactList = await Contact.GetAllContact();
       },
        updateUserImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var elementImg = document.getElementById(id);
            if(elementImg != null){
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
                
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
    created: async function() {
        await this.getAppBaseData();
        /*
        setTimeout(() => {
        this.$nextTick(function(){
            var users = this.contactList[0].users;
            for(var i = 0; i < users.length; i ++){
                this.getUserImg(users[i]);
            }
        });
        }, 0);
        */
        var that = this;
        document.addEventListener('click',function(e){
            console.log("e.target.classname ", e.target.className)
            if(['manager-name', 'manager-icon'].indexOf(e.target.className) == -1){
                that.showUserInfoTips = false;
            }
            
        });
        return;

        const ipcRenderer = require('electron').ipcRenderer;
        ipcRenderer.on('updateUserImage', this.updateUserImage);
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

.chat-tool-invite-div {
    display: inline-block;
    text-align:center;
    vertical-align:middle;
    float: right;
    width: 100px;
    height: 30px;
}

.contact-header {
    display: float;
    width: 100%;
    height: 56px;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(238, 238, 238);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
    //-webkit-app-region: drag;
    // * {            
    //     -webkit-app-region: no-drag;
    // }
}
.contact-header-title{
    display: inline-block;
    float: left;
    width:50%;
    height:20px;
    font-size:14px;
    font-weight:500;
    color:rgba(0,0,0,1);
    line-height:20px;
    letter-spacing:1px;
    padding-left: 16px;
    margin-top: 18px;
    margin-bottom: 18px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing: 1px;
}
.contact-list {
    overflow: scroll;
    list-style: none;
    height: 100%;
    width: 100%;
    padding: 0px;
    margin: 0px;
    .contact {
        display: inline-block;
        width: 280px;
        padding: 0px;
    }
}
.contact-view-one {
    width: 100%;
    height: 100%;
    min-width: 280px;
    //display: flex;
    flex-direction: column;
    //border-right: 0.5px solid rgb(221, 221, 221);
    overflow-y: scroll;
    overflow-x: hidden;
    // ::-webkit-scrollbar-track {ß
    //     border-radius: 10px;
    // }
    margin: 0px;
    cursor: pointer;
}
.contact-view {
    width: 280px;
    height: 100%;
    //display: flex;
    flex-direction: column;
    border-left: 0.5px solid rgb(221, 221, 221);
    //border-right: 1px solid rgb(221, 221, 221);
    overflow-y: scroll;
    overflow-x: hidden;
    // ::-webkit-scrollbar-track {
    //     border-radius: 10px;
    // }
    margin: 0px;
    cursor: pointer;
}
.departments-view {
    width: 100%;
    
    margin: 0px;
    //background-color: orange;
}
.managers-view {
    width: 100%;
    
    margin: 0px;
    //background-color: red;
}
.users-view {
    width: 100%;
    
    margin: 0px;
    //background-color: blue;
}
.managers-header {
    width: 100%;
    height: 32px;
    padding-top: 10px;
    padding-left: 16px;
    background:rgba(247,248,250,1);
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 1px;
}
.users-header {
    width: 100%;
    height: 28px;
    padding-top: 10px;
    padding-left: 16px;
    background:rgba(247,248,250,1);
    color:rgba(102,102,102,1);
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 1px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
}
.managers-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
}
.departments-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    //border-top: 1px solid rgb(221, 221, 221);
}
.department {
    height: 60px;
    //border-bottom: 1px solid rgb(221, 221, 221);
    
}
.department:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}
.manager {
    height: 60px;
    border-bottom: 1px solid  #987cb9;
}
.manager:hover {
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
    font-family: PingFangSC-Regular;
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
    font-family: PingFangSC-Regular;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 92px);
}
.department-name {
    display: flex;
    place-items: center;
    text-align: left;
    height: 20px;
    width: 70%;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 1px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
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
    margin-bottom: 23.5px;
    margin-right: 0px;
    margin-bottom: 0px;
    width: 7px;
    height: 13px;
}

.el-container {
    width: 100%;
    height: 100%;
    border: hidden;
    .el-header {
        padding: 0px;
    }
    .el-breadcrumb {
        display: block;
        margin-left: 16px;
        padding-top: 16px;
        font-size: 14px;
        line-height: 20px;
        padding-left: 0px;
    } 
    .el-main {
        width: auto;
        height: 100%;
        overflow: scroll;
        padding: 0px;
    .bottom-container {
        overflow: scroll;
    }
    }
    .avatarTUrl {
        width:40px;
        height: 40px;
    }
}

</style>