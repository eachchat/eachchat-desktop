<template>
    <div class="SearchChatFilterLayers" id="SearchChatFilterLayersId" >
        <div :style="dlgPosition" class="SearchChatFilterDlg" id="SearchChatFilterDlgId">
            <div class="SearchChatFilterHeader">
                <div class="SearchChatFilterHeaderTitle">{{ dialogTitle }}</div>
                <img class="SearchChatFilterClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            
            <el-container class="SearchChatFilterContent">
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
                        <ul class="searchGroupList">
                            <li class="searchGroup" v-for="(group, index) in searchGroup" :key="index">
                                <input type="checkBox" class="multiSelectCheckbox" :checked="groupChecked(group)" @click="groupCheckBoxClicked(group)">
                                <img class="group-icon" :id="'search' + group.group_id" src="../../../static/Img/User/user-40px@2x.png">
                                <div class="group-info">
                                    <p class="group-name">{{ group.group_name }}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="RecentChatHeader" v-show="!showSearchView">
                        最近聊天
                    </div>
                    <div class="RecentChatView" v-show="!showSearchView">
                            <ul class="recentChatList">
                                <li class="recentChat" v-for="(group, index) in recentGroups" :key="index">
                                    <input type="checkBox" class="multiSelectCheckbox" :checked="groupChecked(group)" @click="groupCheckBoxClicked(group)">
                                    <img class="group-icon" :id="searchChatGroupImgId(group.group_id)" src="../../../static/Img/User/user-40px@2x.png">
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
                                <img class="group-icon" :id="'selected' + group.group_id" src="../../../static/Img/User/user-40px@2x.png">
                                <div class="group-info">
                                    <p class="group-name">{{ group.group_name }}</p>
                                </div>
                                <img class="group-delete-icon" src="../../../static/Img/Chat/delete-20px@2x.png" @click="deleteGroupFromSelectedGroups(group)">
                            </li>
                        </ul>
                    </div>
                </el-main>
            </el-container>
            <div class="SearchChatFilterFotter">
                <button class="SearchChatFilterCancleButton" @click="closeDialog()">取消</button>
                <button class="SearchChatFilterConfirmButton" @click="SearchChatFilter()">确认</button>
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
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil } from '../../packages/core/Utils.js'
import * as path from 'path'
import chatCreaterContent from './chatCreaterContent.vue';
import {UserInfo, Department, Group} from '../../packages/data/sqliteutil.js';
export default {
    name: 'SearchChatFilterDlg',
    components:{
        chatCreaterContent,
    },
    props: {
        recentGroups: {
            type: Array,
            default: function () { 
                return [];
            }
        },
        searchSelectedGroupIds: {
            type: Array,
            default: []
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
            SearchChatFilterDlgElement: null,
            SearchChatFilterLayersElement: null,
            imgHeight: 468,
            imgWidth: 624,
            SearchChatFilterContent: "",
            dlgPosition:{},
            selectedGroups:[],
            rootDepartments:[],
            chatCreaterDisableUsers:[],

            searchKey:'',
            showSearchView: false,
            searchGroup: [],
        }
    },
    methods: {
        searchChatGroupImgId(groupId) {
            return "search-chat-chat-group-" + groupId;
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
            this.$emit("closeSearchChatFilterDlg", "");
            
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
            console.log("delete group from selected groups")
            var index = this.selectedGroups.indexOf(group);
            this.selectedGroups.splice(index, 1);
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedGroups.length; i ++){
                    this.getGroupAvatarContent(this.selectedGroups[i], 'selected');
                }
            });
        },
        groupCheckBoxClicked(group){
            console.log("selected = ", this.selectedGroups)
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
        getGroupAvatarContent:async function(group, key='') {
            var targetDir = confservice.getUserThumbHeadPath();
            var targetPath = path.join(targetDir, group.group_id + '.png');
            var distGrouId = this.searchChatGroupImgId(group.group_id);
            var selectedgroupAvatarElement = document.getElementById(key + group.group_id);
            var groupAvatarElement = document.getElementById(distGrouId);
            if(groupAvatarElement == null) {
                return;
            }
            if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(group.group_avarar, group.group_id))){
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    groupAvatarElement.setAttribute("src", reader.result);
                    if(selectedgroupAvatarElement != undefined) {
                        selectedgroupAvatarElement.setAttribute("src", reader.result);
                    }
                }
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
        SearchChatFilter:async function() {
            // get createNewChat Users
            var selectedGroupIds = [];
            for(let i=0;i<this.selectedGroups.length;i++) {
                var selectedGroupId = this.selectedGroups[i].group_id;
                selectedGroupIds.push(selectedGroupId);
            }
            ipcRenderer.send("searchAddedMembers", selectedGroupIds);
            
            this.$emit("closeSearchChatFilterDlg", "");
        },
    },
    created() {
        console.log("created =======");
        console.log("mounted ======= ", this.searchSelectedGroupIds)
            var showPosition = this.calcImgPosition();
            console.log(showPosition);
            this.dlgPosition.left = showPosition.left.toString() + "px";
            this.dlgPosition.top = showPosition.top.toString() + "px";
            console.log(this.recentGroups);
    },
    mounted: async function() {
        console.log("mounted =======")
        ipcRenderer.on('updateGroupImg', this.updateGroupImg);
        for(let i=0;i<this.searchSelectedGroupIds.length;i++) {
            var selectedGroupItem = await Group.FindGroupByID(this.searchSelectedGroupIds[i]);
            if(selectedGroupItem.length != 0) {
                if(this.indexOfGroupInSelected(selectedGroupItem[0]) == -1){
                    this.selectedGroups.push(selectedGroupItem[0]);
                }
            }
        }
        setTimeout(() => {
            this.$nextTick(function(){
                console.log(this.recentGroups.length)
                for(var i = 0; i < this.recentGroups.length; i ++){
                    this.getGroupAvatarContent(this.recentGroups[i]);
                }
            });
            this.$nextTick(function(){
                for(var i = 0; i < this.selectedGroups.length; i ++){
                    this.getGroupAvatarContent(this.selectedGroups[i], 'selected');
                }
            });
        }, 0)
    },
    
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {

display: none;
}
    .SearchChatFilterLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 3;
    }

    .SearchChatFilterDlg {
        position: absolute;
        width: 624px;
        height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .SearchChatFilterHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .SearchChatFilterHeaderTitle {
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

    .SearchChatFilterClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }
    .SearchChatFilterBody {
        width: 560px;
        height: 340x;
    }
    .SearchChatFilterContent {
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
                    letter-spacing: 0px;
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
                letter-spacing: 0px;
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
                            letter-spacing: 0px;
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
                            letter-spacing: 0px;
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
                letter-spacing: 0px;
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
                            letter-spacing: 0px;
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
        letter-spacing: 0px;
    }
    

    // .SearchChatFilterTextArea {
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
    //     letter-spacing: 0px;
    //     font-weight:400;
    //     line-height:20px;
    //     padding: 16px;
    // }

    // .SearchChatFilterTextArea:focus {
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
    //     letter-spacing: 0px;
    //     font-weight:400;
    //     line-height:20px;
    //     padding: 16px;
    //     outline: none;
    // }

    .SearchChatFilterFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }
    .SearchChatFilterConfirmButton{
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
        font-weight: 400;
        border: none;
    }
 
    .SearchChatFilterConfirmButton:disabled{
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
        font-weight: 400;
        border: none;

    }
 
    .SearchChatFilterCancleButton {
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
