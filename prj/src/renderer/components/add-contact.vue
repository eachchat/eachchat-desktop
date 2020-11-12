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
                        <el-input class="search-input" v-model="searchKey" @input="search" placeholder="搜索..." size='mini' clearable></el-input>
                    </div>
                    <ul class = 'contact-list'>
                        <li class="contact-list-item"
                            v-for="(contact, index) in searchUsers"
                            :key="index">
                            <img ondragstart="return false" class="contact-list-icon" :id="contact.user_id" src="../../../static/Img/User/user-40px@2x.png">
                            <div class="contact-list-info">
                                <p class="contact-list-name">{{ contact.display_name }}</p>
                                <p class="contact-list-titile">{{ contact.user_id }}</p>
                            </div>
                            <button class="contact-list-button" @click="HandleSave(index, contact)" :disabled='DisableSave(contact)'>保存</button>
                        </li>
                    </ul>
                </el-main>
            </el-container>
        </div>
 
    </div>
</template>

<script>
import {services, environment} from '../../packages/data/index.js'
import {Contact} from '../../packages/data/sqliteutil.js'
import * as fs from 'fs-extra'
import {ipcRenderer} from 'electron'
import { object } from '../../packages/core/types'
import confservice from '../../packages/data/conf_service';
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil } from '../../packages/core/Utils.js'
import * as path from 'path'
import { model } from '../../packages/core'
import { models } from '../../packages/data/models.js';


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
                if(row.user_id == item.user_id)
                    return true;
            }
            return false;
        },

        HandleSave: async function(index, row){
            let info = {
                user_id : row.user_id,
                display_name: row.display_name,
                avatar_url: row.avatar_url,
            }
            await this.services.AddContact(info);
            await this.services.GetAllContact();
            this.contacts = await Contact.GetAllContact();
        },

        AddByMatrixID: function(){
            this.$emit("showInputContact", "");
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
                var id = user.user_id;
                if(id == this.selectedUsers[i].user_id){
                    index = i;
                    break;
                }
            }
            return index;
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
                this.services.downloadUserTAvatar(userInfo.avatar_t_url, userInfo.user_id);
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
        var showPosition = this.calcImgPosition();
        this.dlgPosition.left = showPosition.left.toString() + "px";
        this.dlgPosition.top = showPosition.top.toString() + "px";
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

    .ChatCreaterContent {
        width: 560px;
        height: 340x;
        margin: 0;
        margin-left: 32px;
        border-radius: 4px;
        border: 1px solid rgba(221,221,221,1);
        background:rgba(255,255,255,1);
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
