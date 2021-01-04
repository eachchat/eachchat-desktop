<template>
    <el-container>
        <el-header height="56px" class="contact-header">
            <p class="contact-header-title">{{$t('contactMenuName')}}</p>
            <div class='chat-tool-invite-div'>
            <el-popover
             placement="bottom"
            width="100px"
            trigger="click">
            <el-dropdown-item class="dropdown-item" @click.native="AddContact()"> 
                <img class="dropdown-item-img" src="../../../static/Img/Chat/search-20px@2x.png">
                <span class="dropdown-item-label">添加联系人</span>
            </el-dropdown-item>
            <!-- <el-dropdown-item class="dropdown-item" @click.native="InputContact()"> 
                <img class="dropdown-item-img" src="../../../static/Img/Main/create-new-chat-button-nor-24px@2x.png">
                <span class="dropdown-item-label">创建联系人</span>
            </el-dropdown-item> -->
            <el-image slot="reference"  src="./static/Img/Organization/Image/addContact-24px.png"></el-image>
            </el-popover>
            
            </div>
        </el-header>
        <el-main  style="overflow: hidden">
            <el-container class="bottom-container" id="contact-main-container">
                <div class="contact-view">
                    <ul class="managers-list">
                        <li class="manager"
                            v-for="(user, index) in contactList"
                            @click="userMenuItemClicked(user.matrix_id)"
                            @mouseover="OnMouseOver(index)"
                            @mouseleave="OnMouseLeave(index)"
                            :key="index">
                            <img ondragstart="return false" class="manager-icon" :id="SetUserImgID(user.matrix_id)" src="../../../static/Img/User/user-40px@2x.png">
                            <div class="show-contact-list-info">
                                <p class="contact-list-name">{{ GetDisplayName(user.display_name, user.matrix_id) }}</p>
                                <p class="contact-list-titile">{{ user.matrix_id }}</p>
                            </div>
                            <el-button icon="el-icon-delete" circle class="delete-button" v-show="nMouseIndex == index" @click="DeleteContact(user)" size="small"></el-button>
                        </li>
                    </ul>
                </div>
                <userInfoContent :userInfo="userInfo" :originPosition="userInfoPosition" v-if="showUserInfoTips" :key="userInfoTipKey"  :userType="contactType"></userInfoContent>
            </el-container>
        </el-main>
        <addContact v-if="showChatContactDlg" @closeAddContactDlg='closeAddContactDlg' @showInputContact="HandleInputContact">
        </addContact>
        <InputContactInfo v-if='showInputContactDlg' @closeInputContact="CloseInputContactDlg">
        </InputContactInfo>
        <AlertDlg :AlertContnts="alertContents" v-show="showAlertDlg" @closeAlertDlg="CloseAlertDlg" @clearCache="ClearCache"/>
    </el-container>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
//import { services } from '../../packages/data'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {services} from '../../packages/data/index.js';
import {UserInfo, Contact, Department} from '../../packages/data/sqliteutil.js'; 
import yidrawer from './yi-drawer';
import userInfoContent from './user-info';
import userInfoTip from './userinfo-tip';
import addContact from './add-contact';
import InputContactInfo from './input-contact-info';
import AlertDlg from './alert-dlg.vue'
import "../style/contact-list.css"
import {ComponentUtil} from '../script/component-util.js'
import {ipcRenderer} from 'electron';


export default {
    name: 'contactList',
    components: {
        yidrawer,
        userInfoContent,
        userInfoTip,
        addContact,
        InputContactInfo,
        AlertDlg
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
            showInputContactDlg: false,
            nMouseIndex: -1,
            showAlertDlg: false,
            alertContents : null,
            deleteContact: null,
            contactType: 'contact'
        }
    },
    props:{
        parentInfo: {
            type:Object
        }
    },
    computed: {                      

    },

    watch:{
        contactList: function(){
            this.$nextTick(function(){
                    this.contactList.forEach((index)=>{
                        this.getUserImg(index)
                    })
                });
        }
    },

    methods: {
        AddContact: function(){
            this.showChatContactDlg = true;
            this.showInputContactDlg = false;
        },

        InputContact: function(){
            this.showInputContactDlg = true;
            this.showChatContactDlg = false;
        },

        CloseAlertDlg: function(){
            this.showAlertDlg = false;
        },

        ClearCache: async function(){
            this.showAlertDlg = false;
            let ret = await this.services.DeleteContact(this.deleteContact.matrix_id)
            if(ret){
                for(let index in this.contactList){
                    if(this.contactList[index].matrix_id == this.deleteContact.matrix_id){
                        this.contactList.splice(index, 1);
                        return;
                    }

                }
            }
        },

        OnMouseLeave: function(){
            this.nMouseIndex = -1;
        },

        OnMouseOver: function(obj){
            this.nMouseIndex = obj;
        },

        DeleteContact: async function(contact){
            this.deleteContact = contact;
            this.showAlertDlg = true;
            this.alertContents = {
                "Details": this.$t("DeleteContactAlertTitle") + ' ' + contact.display_name + ' ?',
                "Abstrace": this.$t("DeleteContactAlertDetail")
            }
        },

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

        GetDisplayName: function(displayName, userid){
            return ComponentUtil.GetDisplayName(displayName, userid);
        },

        userMenuItemClicked:async function(id) {
            if (this.showUserInfoTips&&(this.userInfo.id == id) || this.showAlertDlg){
                this.showUserInfoTips = false;
                return;
            }
            var iconElement = document.getElementById(id + 'contactList');
            this.userInfoPosition.left = iconElement.getBoundingClientRect().left;
            this.userInfoPosition.top = iconElement.getBoundingClientRect().top;
            console.log(iconElement.getBoundingClientRect());
            let tempUserInfo = await ComponentUtil.ShowContactInfo(id);

            this.userInfo = tempUserInfo;
            this.userInfoTipKey ++;
            this.showUserInfoTips = true;
        },
        
        getAppBaseData:async function() {
            await this.services.GetAllContact();
            this.contactList = await Contact.GetAllContact();
        },

        SetUserImgID(userID){
            return userID + 'contactList';
        },

        getUserImg: async function(userinfo) {
            var elementImg = document.getElementById(userinfo.matrix_id + 'contactList');
            if(!elementImg){
                return;
            }
            if(userinfo.matrix_id[0] != "@"){
                elementImg.setAttribute("src", './static/Img/User/user-40px@2x.png');
                return;
            }
            var profileInfo = await this.matrixClient.getProfileInfo(userinfo.matrix_id);
            if(!profileInfo.avatar_url){
                elementImg.setAttribute("src", './static/Img/User/user-40px@2x.png');
                return;
            }
            let validUrl = this.matrixClient.mxcUrlToHttp(profileInfo.avatar_url); 
            if(validUrl)
                elementImg.setAttribute("src", validUrl);
            else
                elementImg.setAttribute("src", './static/Img/User/user-40px@2x.png');
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
        this.services = global.services.common;
        await this.getAppBaseData();
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;

        var that = this;
        document.addEventListener('click',function(e){
            console.log("e.target.classname ", e.target.className)
            if(['contact-list-name', 'manager-icon'].indexOf(e.target.className) == -1){
                that.showUserInfoTips = false;
            }
            if(e.target.className.indexOf('userInfo') != -1)
            {
                that.showUserInfoTips = true;
            }            
        });
        ipcRenderer.on('updateContact', async () => {
            this.contactList = await Contact.GetAllContact();
        });
        return;
    }
}
</script>
<style lang="scss" scoped>


.chat-tool-invite-div {
    display: inline-block;
    text-align:center;
    vertical-align:middle;
    margin-top: 25px;
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

.show-contact-list-info{
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 115px);
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

.contact-view {
    width: 100%;
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
}
.manager:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
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
    border-radius: 50%;
}

.delete-button{
    display: inline-block;
    margin-top: 10px;
    margin-bottom: 10px;
    vertical-align: top;
    background: white;
    border-radius:4px;
    border:1px solid rgba(221,221,221,1);
    font-family: PingFangSC-Regular;
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
    }
    .avatarTUrl {
        width:40px;
        height: 40px;
    }
}

</style>