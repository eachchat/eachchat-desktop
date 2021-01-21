<template>
    <div class="ChatCreaterLayers" id="ChatCreaterLayersId" >
        <div class="ChatCreaterDlg" id="ChatCreaterDlgId">
            <div class="ChatCreaterHeader">
                <div class="ChatCreaterHeaderTitle">{{ $t('addContactDlgName') }}</div>
                <img ondragstart="return false" class="ChatCreaterClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            <el-container class="ChatCreaterContent">
                <!-- <div class = 'backgroundDiv'  v-show = 'searchUsers.length == 0'></div> -->
                <div class = 'backgroundDiv'  v-show = 'false'></div>
                <el-main class="selectedView">
                    <div class="search">
                        <el-input class="search-input" v-model="searchKey" @input="search" placeholder="搜索" size='mini' clearable>
                            <i slot="prefix" style="display: flex;align-items: center;">
                                <img
                                    style="width:20px;height:20px;margin-top: 4px;"
                                    src="../../../static/Img/Main/search@2x.png"
                                    alt
                                />
                            </i>
                        </el-input>
                    </div>
                    <ul class = 'contact-list'>
                        <li class="contact-list-item"
                            v-for="(contact, index) in searchUsers"
                            :key="index">
                            <img ondragstart="return false" class="contact-list-icon" :id="SetUserImgID(contact.matrix_id)" src="../../../static/Img/User/user-40px@2x.png">
                            <div class="contact-list-info">
                                <p class="contact-list-name">{{ contact.user_display_name }}</p>
                                <p class="contact-list-titile">{{ contact.matrix_id }}</p>
                            </div>
                            <button v-if = 'DisableSave(contact)' class="contact-list-disable-button" @click="HandleSave(index, contact)" :disabled='true'>已添加</button>
                            <button v-else class="contact-list-button" @click="HandleSave(index, contact)" >添加</button>
                        </li>
                    </ul>
                </el-main>
            </el-container>
        </div>
 
    </div>
</template>

<script>
import {services, environment} from '../../packages/data/index.js'
import * as fs from 'fs-extra'
import {ipcRenderer} from 'electron'
import { object } from '../../packages/core/types'
import confservice from '../../packages/data/conf_service';
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil } from '../../packages/core/Utils.js'
import * as path from 'path'
import { model } from '../../packages/core'
import { models } from '../../packages/data/models.js';
import { UserInfo, Contact, Department } from '../../packages/data/sqliteutil'
import { ComponentUtil } from '../script/component-util.js'


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
            contacts: [],
            disable: false,
            services: null
        }
    },
    watch:{
        searchKey: async function(){
            if(this.searchKey === ''){
                this.bShowSearchRes = false;
                this.searchUsers = [];
            }
            this.contacts = await Contact.GetAllContact();
        }
    },
    methods: {
        DisableSave(row){
            for(let item of this.contacts){
                if(row.matrix_id == item.matrix_id)
                    return true;
            }
            return false;
        },

        HandleSave: async function(index, row){
            let info = await ComponentUtil.ShowOrgInfoByMatrixID(row.matrix_id)
            if(info){
                info = await ComponentUtil.OrgUserInfoToContact(info);
            }
            else{
                info = await ComponentUtil.OrgUserInfoToContact(row);
            }
            await this.services.AddContact(info);
            await this.services.GetAllContact();
            this.contacts = await Contact.GetAllContact();
        },

        AddByMatrixID: function(){
            this.$emit("showInputContact", "");
        },

        GetSearchUsers(searchUsers, searchContacts, matrixUsers){
            let searchs = searchUsers;
            searchContacts.forEach(item => {

            })
        },

        GetUsersFromOrgAndMatrixHS(orgUsers, hsUsers){
            if(hsUsers.length == 0)
                return orgUsers;
            let tmpUsers = []; 
            hsUsers.forEach(hsItem => {
                if(orgUsers.every(orgItem => {
                    return hsItem.user_id != orgItem.matrix_id
                }))
                {
                    let user = {};
                    user.user_display_name = hsItem.display_name;
                    user.matrix_id = hsItem.user_id;
                    user.avatar_url = hsItem.avatar_url;
                    tmpUsers.push(user);
                }                    
            });
            return orgUsers.concat(tmpUsers);
        },

        search:async function () {
            if(this.searchKey == ''){
                return;
            }
            this.showSearchView = true;
            this.showOrganizationView = false;

            this.searchUsers = await UserInfo.SearchByNameKey(this.searchKey);
            
            //let searchContacts = await Contact.SearchByNameKey(this.searchKey);

            let ops = {};
            ops.term = this.searchKey;
            ops.number = 10;
            this.matrixClient.searchUserDirectory(ops).then((res)=>{
                let searchUsers = res.results;
                if(searchUsers.length == 0)
                    return;
                this.searchUsers = this.GetUsersFromOrgAndMatrixHS(this.searchUsers, searchUsers);
                this.bShowSearchRes = true;
                this.$nextTick(function(){
                    for(var i = 0; i < this.searchUsers.length; i ++){
                        this.getUserImg(this.searchUsers[i], 'addContact');
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
            return isCheck;
        },

        indexOfUserInSelected(user){
            var index = -1;
            for(var i = 0; i < this.selectedUsers.length; i ++){
                var id = user.matrix_id;
                if(id == this.selectedUsers[i].matrix_id){
                    index = i;
                    break;
                }
            }
            return index;
        },

        SetUserImgID(userID, type){
            return userID + 'addContact';
        },

        getUserImg: function (userInfo, key='type'){
            if(!userInfo || !userInfo.matrix_id)
                return;
            
            this.matrixClient.getProfileInfo(userInfo.matrix_id).then((info) => {
                info.matrix_id = userInfo.matrix_id;
                return info;
            }).then((info) => {
                let userIconElement = document.getElementById(userInfo.matrix_id + 'addContact');
                if(!userIconElement){
                    return;
                }
                let validUrl = "./static/Img/User/user-40px@2x.png"
                if(info.avatar_url)
                  validUrl = this.matrixClient.mxcUrlToHttp(info.avatar_url);
                userIconElement.setAttribute("src", validUrl);
            });
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
        }
    },
    components: {
    },
    created() {
  
    },
    mounted:async function() {
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
        this.services = global.services.common;
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
        margin: auto;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 440px;
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
        font-size: 16px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
    }

    .ChatCreaterClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }

    .ChatCreaterContent {
        width: 376px;
        height: 340x;
        margin: 0;
        margin-left: 32px;
        border-radius: 4px;
        border: 1px solid rgba(221,221,221,1);
        background:rgba(255,255,255,1);
        }

        .backgroundDiv{
            width: 374px;
            height: 370px;
            padding: 0px;
            overflow: hidden;
            background-image: url("../../../static/Img/Organization/Image/addContactBackground.png");
            background-position:center;
            background-repeat:no-repeat;
            position: absolute; 
        }

        .selectedView {
            z-index:1;
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
        
    .search {
        margin: 12px 0px -1px 16px;
        text-align: left;
        width: 80%;
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
        width: 78%;
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
    }

    .search-label{
        color:rgba(153,153,153,1);
        font-size: 12px;
        margin-left: 16px;
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
