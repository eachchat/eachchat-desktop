<template>
    <el-container>
        <el-header height="55px" class="favourite-header">
            <div class="header-title">
                {{ headerTitle }}
            </div>
        </el-header>
        <el-main>
            <el-container>
            <div class="favourite-list" v-if="showFavouriteList">
            <div class="message-view" v-if="showMessageList">
                <ul class="message-list">
                    <li class="message"
                        v-for="(message, index) in favourites" 
                        :key=index>
                        <p class="message-text" @click="messageListClicked(message)">{{ message.collection_content.text }}</p>
                        <p class="message-sender">{{ message.collection_content.fromUserName }}</p>
                        <p class="message-time" align="right">{{ formatTimeFilter(message.timestamp) }}</p>
                        <div class="favourite-action">
                            <img class="transmit-img" @click="transmitMessageCollectionClicked(message)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                            <img class="delete-img" @click="deleteMessageCollectionClicked(message)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                        </div>
                    </li>
                </ul>
            </div>
            <div class="image-view" v-if="showImageList">
                <ul class="image-list">
                    <li class="image"
                        v-for="(image, index) in favourites" 
                        
                        :key=index>
                        <img class="image-content" :id="image.collection_id" @click="imageListClicked(image)" src="../../../static/Img/Chat/loading.gif" alt= "图片">
                        <p class="image-sender">{{ image.collection_content.fromUserName }}</p>
                        <p class="image-time" align="right">{{ formatTimeFilter(image.timestamp) }}</p>
                        <div class="favourite-action">
                            <img class="transmit-img" @click="transmitImageCollectionClicked(image)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                            <img class="delete-img" @click="deleteImageCollectionClicked(image)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                        </div>
                    </li>
                </ul>
            </div>
            <div class="file-view" v-if="showFileList">
                <ul class="file-list">
                    <li class="file"
                        v-for="(file, index) in favourites"
                        :key="index">
                        <div class="file-content" >
                            <img class="file-icon" :src="getFileIconThroughExt(file.collection_content.ext)" @click="fileListClicked(file)">
                            <div class="file-info" @click="fileListClicked(file)">
                                <p class="file-name">{{ file.collection_content.fileName }}</p>
                                <p class="file-size">{{ file.collection_content.fileSize }}</p>
                            </div>
                            <img class="file-action" :src="getFileStateSourceImage(file)" @click="fileActionClicked(file)">
                        </div>
                        <p class="file-sender">{{ file.collection_content.fromUserName }}</p>
                        <p class="file-time" align="right">{{ formatTimeFilter(file.timestamp) }}</p>
                        <div class="favourite-action">
                            <img class="transmit-img" @click="transmitFileCollectionClicked(file)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                            <img class="delete-img" @click="deleteFileCollectionClicked(file)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                        </div>

                    </li>
                </ul>
            </div>
            <div class="group-view" v-if="showGroupList">
                <ul class="group-list">
                    <li class="group"
                        v-for="(group, index) in favourites"
                        :key="index">
                        <img class="group-icon" :id="group.collection_content.groupId" src="../../../static/Img/Chat/loading.gif" alt= "头像">
                        <div class="group-name">{{ group.collection_content.groupName }}
                        </div>
                        <div class="favourite-group-action">
                            <img class="message-img" @click="groupCollectionChatClicked(group)" src="../../../static/Img/Favorite/Group/message@2x.png">
                            <img class="delete-img" @click="deleteGroupCollectionClicked(group)" src="../../../static/Img/Favorite/Group/delete@2x.png">
                        </div>
                    </li>
                </ul>
            </div>
            </div>
            </el-container>
        </el-main>
        <el-container >
            <transmitDlg  v-show="showTransmitDlg" @closeTransmitDlg="closeTransmitDlg" :recentGroups="recentGroups" :collectionInfo="transmitCollectionInfo" :key="transmitKey"></transmitDlg>
        </el-container>
    </el-container>

</template>
<script>
import {services} from '../../packages/data/index.js';
import * as path from 'path'
import * as fs from 'fs-extra'
import {shell, ipcRenderer} from 'electron'
import {downloadGroupAvatar, generalGuid, Appendzero, FileUtil, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft, pathDeal, getFileSizeByNumber} from '../../packages/core/Utils.js'
import { bool } from '../../packages/core/types';
import confservice from '../../packages/data/conf_service.js';
import transmitDlg from './transmitDlg.vue';
export default {
    name: 'favourite-list',
    data() {
        return{
            headerTitle: '',
            favourites: [],
            favouriteDetail: {},
            showFavouriteList: true,
            showTransmitDlg: false,
            transmitCollectionInfo: {},
            transmitKey:1,
            recentGroups:[],
        }
    },
    components: {
        transmitDlg,
    },
    computed: {

        showMessageList: function() {
            if (this.favouriteType == 'message'){
                return true;
            }else {
                return false;
            }
        },
        showImageList: function() {
            if (this.favouriteType == 'image'){
                return true;
            }else {
                return false;
            }
        },
        showFileList: function() {
            if (this.favouriteType == 'file'){
                return true;
            }else {
                return false;
            }
        },
        showGroupList: function() {
            if (this.favouriteType == 'group'){
                return true;
            }else {
                return false;
            }
        },

        },
    props: {
        "favouriteType": {
            type: String,
            default: 'message'
        }
    },
    methods: {
        closeTransmitDlg(content) {
                this.showTransmitDlg = false;
                
        },
        messageListClicked(message) {
            // open new window and load
            const ipcRender = require('electron').ipcRenderer;
            ipcRenderer.send('showFavouriteDetailPageWindow',[message]);
            ipcRenderer.send('loadFavouriteDetailData', [message]);
        },
        imageListClicked(image) {
            
        },
        fileListClicked:async function(file) {
            if(!this.getFileExist(file)){
                console.log("download start");
                await services.common.downloadFile(file.timeline_id, file.timestamp, file.collection_content.fileName, false);
                shell.openItem(targetPath);
            }
            var targetDir = confservice.getFilePath(file.timestamp);
            var targetPath = path.join(targetDir, file.collection_content.fileName);
            shell.openItem(targetPath);
        },
        fileActionClicked:async function(file) {
            if(this.getFileExist(file)){
                var targetDir = confservice.getFilePath(file.timestamp);
                var targetPath = path.join(targetDir, file.collection_content.fileName);
                shell.showItemInFolder(targetPath);
                
            }else{
                console.log("download start");
                await services.common.downloadFile(file.timeline_id, file.timestamp, file.collection_content.fileName, false);
                this.updateFileCollectionList();
            }
        },
        updateFileCollectionList() {
            var tempFiles = [];
            for(var i = 0; i < this.favourites.length; i ++){
                    var file = this.favourites[i];
                    file.local_exist = this.getFileExist(file);
                    //file.collection_content.fileSize = getFileSizeByNumber(file.collection_content.fileSize)
                    tempFiles[i] = file;
            }
            this.favourites = tempFiles;
        },
        getFileStateSourceImage(file) {
            if(this.getFileExist(file)){
                return "../../../static/Img/Favorite/File/directory@2x.png";
            }else{
                return "../../../static/Img/Favorite/File/download@2x.png";
            }

        },
        deleteMessageCollectionClicked:async function(message) {
            await services.common.DeleteCollectionMessage(message.favourite_id);
            var messageCollectionModel = await services.common.ListMessageCollections();
            this.favourites = this.getObjectFromCollectionModel(messageCollectionModel);
            console.log(this.favourites);
        },
        deleteImageCollectionClicked: async function(image) {
            await services.common.DeleteCollectionMessage(image.favourite_id);
            var imageCollectionModel = await services.common.ListPictureCollections();
            this.favourites = this.getObjectFromCollectionModel(imageCollectionModel);
            console.log(this.favourites);
            this.$nextTick(function(){
                for(var i = 0; i < this.favourites.length; i ++){
                    this.getImageCollectionContent(this.favourites[i]);
                }
            });
        },  
        deleteFileCollectionClicked: async function(file) {
            await services.common.DeleteCollectionMessage(file.favourite_id);
            var fileCollectionModel = await services.common.ListFileCollections();
            this.favourites = this.getObjectFromCollectionModel(fileCollectionModel);
            var tempFiles = [];
            for(var i = 0; i < this.favourites.length; i ++){
                    var file = this.favourites[i];
                    file.local_exist = this.getFileExist(file);
                    file.collection_content.fileSize = getFileSizeByNumber(file.collection_content.fileSize)
                    tempFiles[i] = file;
            }
            this.favourites = tempFiles;
        },
        deleteGroupCollectionClicked:async function(group) {
            await services.common.DeleteCollectionGroup(group.collection_content.groupId);
            var groupCollectionModel = await services.common.ListGroupCollections();
            this.favourites = this.getObjectFromCollectionModel(groupCollectionModel);
            console.log(this.favourites);
            this.$nextTick(function(){
                for(var i = 0; i < this.favourites.length; i ++){
                    this.getGroupAvatarContent(this.favourites[i]);
                }
            });
        },
        transmitMessageCollectionClicked:async function(message) {
            this.showTransmitDlg = true;
            this.transmitKey ++;
        },
        transmitImageCollectionClicked:async function(image) {

        },
        transmitFileCollectionClicked:async function(file) {

        },
        groupCollectionChatClicked:async function(group) {

        },
        getFileIconThroughExt(ext) {
            var iconPath = getIconPath(ext);
            return iconPath;
        },
        getFileExist(file) {
            var targetDir = confservice.getFilePath(file.timestamp);
            var targetPath = path.join(targetDir, file.collection_content.fileName);
            console.log("file collection targetPath is ", targetPath);
            if(fs.existsSync(targetPath)) {
                return true;
            }
            return false;
        },

        getImageCollectionContent:async function(image){

            var targetDir = confservice.getThumbImagePath(image.timestamp);
            var targetPath = path.join(targetDir, image.collection_content.fileName);
            var needOpen = false;
            var imageCollectionElement = document.getElementById(image.collection_id);
            if(fs.existsSync(targetPath)){

                    var showfu = new FileUtil(targetPath);
                    let showfileObj = showfu.GetUploadfileobj();
                    let reader = new FileReader();
                    reader.readAsDataURL(showfileObj);
                    reader.onloadend = () => {
                        imageCollectionElement.setAttribute("src", reader.result);
                    }

            }
            else{

                console.log("download collection image ", image)
                await services.common.downloadMsgTTumbnail(image.timeline_id, image.timestamp, image.collection_content.fileName, false);
                //await this.getImageCollectionContent(image);
                // this.checkAndLoadImg(targetPath);
            }
        },
        getGroupAvatarContent:async function(group) {
            var targetDir = confservice.getUserThumbHeadPath();
            var targetPath = path.join(targetDir, group.collection_content.groupId + '.png');
            var groupAvatarElement = document.getElementById(group.collection_content.groupId);
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
                await services.common.downloadGroupAvatar(group.collection_content.groupAvatar, group.collection_content.groupId);
                //await this.getGroupAvatarContent(group);
            }

        },

        getObjectFromCollectionModel(collectionModels) {
            var favourites = [];
            for(var i = 0; i < collectionModels.length; i ++){
                var model = collectionModels[i];
                var tempFavourite = {};
                tempFavourite.collection_id = model.collection_id;
                tempFavourite.collection_type = model.collection_type;
                tempFavourite.favourite_id = model.favourite_id;
                tempFavourite.collection_content = strMsgContentToJson(model.collection_content);
                tempFavourite.sequence_id = model.sequence_id;
                tempFavourite.timeline_id = model.timeline_id;
                tempFavourite.timestamp = model.timestamp;
                favourites.push(tempFavourite);
            }
            return favourites;
        },
        formatTimeFilter(secondsTime) {
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let cutTime = curDateSecond - secondsTime;
            let curYeat = curDate.getUTCFullYear();
            let curMonth = curDate.getUTCMonth() + 1;
            let curDay = curDate.getDate();

            let distdate = new Date(secondsTime);
            let y = distdate.getUTCFullYear();
            let mon = distdate.getMonth() + 1;
            let d = distdate.getDate();
            let h = distdate.getHours();
            let m = distdate.getMinutes();
            let s = distdate.getSeconds();

            // console.log(distdate)
            // console.log(cutTime)
            // console.log(y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m) + ":" + Appendzero(s))

            if(cutTime < 24 * 3600 * 1000)
            {
                if(curDay - d === 0){
                return Appendzero(h) + ":" + Appendzero(m);
                }
                else{
                    return "昨天 " + Appendzero(h) + ":" + Appendzero(m);
                }
            }
            else if((cutTime >= 24 * 3600 * 1000 && cutTime < 48 * 3600 * 1000))
            {
                if(curDay - d === 1){
                    return "昨天 " + Appendzero(h) + ":" + Appendzero(m);
                }   
                else{
                    return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
                }
            }
            else
            {
                return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
            }
        },

    },
    created:async function() {
        this.showFavouriteList = true;
        this.recentGroups = await services.common.GetAllGroups();
        if (this.favouriteType == 'message'){

            this.headerTitle = '消息';
            var messageCollectionModel = await services.common.ListMessageCollections();
            this.favourites = this.getObjectFromCollectionModel(messageCollectionModel);
            console.log(this.favourites);
        }else if(this.favouriteType == 'image') {
            this.headerTitle = '图片';
            var imageCollectionModel = await services.common.ListPictureCollections();
            this.favourites = this.getObjectFromCollectionModel(imageCollectionModel);
            console.log(this.favourites);
            this.$nextTick(function(){
                for(var i = 0; i < this.favourites.length; i ++){
                    this.getImageCollectionContent(this.favourites[i]);
                }
            });
        }else if(this.favouriteType == 'file') {
            this.headerTitle = '文件';
            var fileCollectionModel = await services.common.ListFileCollections();
            this.favourites = this.getObjectFromCollectionModel(fileCollectionModel);
            var tempFiles = [];
            for(var i = 0; i < this.favourites.length; i ++){
                    var file = this.favourites[i];
                    file.local_exist = this.getFileExist(file);
                    file.collection_content.fileSize = getFileSizeByNumber(file.collection_content.fileSize)
                    tempFiles[i] = file;
            }
            this.favourites = tempFiles;

            console.log(this.favourites);
        }else if(this.favouriteType == 'group'){
            this.headerTitle = '群组';
            var groupCollectionModel = await services.common.ListGroupCollections();
            this.favourites = this.getObjectFromCollectionModel(groupCollectionModel);
            this.$nextTick(function(){
                for(var i = 0; i < this.favourites.length; i ++){
                    this.getGroupAvatarContent(this.favourites[i]);
                }
            });
        
            console.log(this.recentGroups);
        }
        
    }
}
</script>
<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}

.el-container {
    
    .el-header {
        padding: 0px;
    }
    .el-main {
        padding: 0px;
        .el-container{
            border: none;
        }
    }
}
.favourite-header {
    display: inline-block;
    vertical-align: top;
    width: 100%;
    height: 55px;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(221, 221, 221);
    .header-title {
        display: inline-block;
        padding-left: 0px;;
        margin-left: 16px;
        padding-top: 18px;
        font-size: 14px;
        line-height: 20px;
        padding-left: 0px;
        width: calc(100% - 100px);
    }
    
    
}

.favourite-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    //border-right: 1px solid rgb(221, 221, 221);
    overflow-y: scroll;
    overflow-x: hidden;
    // ::-webkit-scrollbar-track {
    //     border-radius: 10px;
    // }
    margin: 0px;
    cursor: pointer;
    margin-left: 16px;
    margin-right: 16px;
    margin-top: 0px;
    .file-action{
        display: none;
    }

    .favourite-action {
        display: none;
        font-size: 0px;
        vertical-align: top;
        padding-top: 10px;
        padding-right: 0px;
        width: 78px;
        height: 20px;
        .transmit-img {
            display: inline-block;
            width: 20px;
            height: 20px;
            padding-left: 26px;
            padding-right: 12px;
            margin: 0px;
        }
        .delete-img {
            display: inline-block;
            width: 20px;
            height: 20px;
            padding: 0px;
            margin: 0px;
        }
    }

}
.message-view {
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0px;
}
.message-list {
    list-style: none;
    margin: 0px;
    padding: 0px;
    .message:hover{
        .message-time {
            display: none;
            
        }
        .favourite-action{
            display: inline-block;
        }
    }
    .message {
        height: 106px;
        margin: 0px;
        padding: 0px;
        cursor: pointer;
        background-color: white;
        .message-text{
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            font-weight:400;
            color:rgba(0,0,0,1);
            line-height:22px;
            letter-spacing:1px;
            font-size: 14px;
            padding-top: 20px;
            margin-top: 0px;
            margin-bottom: 0px;
            height: 44px;
        }
        .message-sender{
            display: inline-block;
            color: rgb(102, 102, 102);
            font-size: 12px;
            line-height: 18px;
            width: calc(100% - 82px);
            margin-top: 8px;
            margin-bottom: 0px;
        }
        .message-time{
            width: 78px;
            display: inline-block;
            font-size: 12px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            letter-spacing:1px;
            //text-align: right;
            margin-top: 8px;
            
        }
    }
}
.image-list {
    list-style: none;
    margin: 0px;
    padding: 0px;
    .image:hover{
        .image-time {
            display: none;
        }
        .favourite-action{
            display: inline-block;
        }
    }
    .image {
        height: 134px;
        margin: 0px;
        padding: 0px;
        cursor: pointer;
        background-color: white;
        .image-content {
            width: 72px;
            height: 72px;
            padding-top: 20px;
            padding-bottom: 0px;
            display: block;
            object-fit: scale-down;
        }
        .image-sender{
            display: inline-block;
            color: rgb(102, 102, 102);
            font-size: 12px;
            line-height: 18px;
            width: calc(100% - 82px);
            margin-top: 12px;
            margin-bottom: 0px;
        }
        .image-time{
            width: 78px;
            display: inline-block;
            font-size: 12px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            letter-spacing:1px;
            //text-align: right;
            margin-top: 8px;
        }
    }
}
.file-list {
    list-style: none;
    margin: 0px;
    padding: 0px;
    
    .file:hover{
        .file-time {
            display: none;
        }
        .favourite-action{
            display: inline-block;
        }

        .file-action{
            display: inline-block;
        }
    }

    .file {
        height: 102px;
        margin: 0px;
        padding: 0px;
        cursor: pointer;
        background-color: white;
        .file-content {
            width: 100%;
            height: 60px;
            margin-top: 16px;
            padding-bottom: 0px;
            background:rgba(247,248,250,1);
            border-radius:4px;
            display: block;
            .file-icon {
                width: 40px;
                height: 40px;
                margin: 0px;
                object-fit: scale-down;
                padding-left: 13px;
                padding-top: 10px;
                padding-bottom: 10px;
                display: inline-block;
            }
            .file-action {
                
                height: 32px;
                width: 32px;
                margin: 0px;
                padding-top: 14px;
                padding-bottom: 14px;
                
            }
            .file-info {
                display: inline-block;
                padding-left: 8px;
                padding-top: 10px;
                padding-bottom: 10px;
                vertical-align: top;
                width: calc(100% - 110px);
                .file-name {
                    height:20px;
                    font-size:14px;
                    margin-top: 0px;
                    margin-bottom: 0px;
                    font-weight:500;
                    color:rgba(0,0,0,1);
                    line-height:20px;
                    letter-spacing:1px;
                }
                .file-size {
                    height:18px;
                    font-size:12px;
                    margin-top: 2px;
                    font-weight:400;
                    color:rgba(153,153,153,1);
                    line-height:18px;
                    letter-spacing:1px;
                }
            }
        }
        .file-sender{
            display: inline-block;
            color: rgb(102, 102, 102);
            font-size: 12px;
            line-height: 18px;
            width: calc(100% - 82px);
            margin-top: 12px;
            margin-bottom: 0px;
        }
        .file-time{
            width: 78px;
            display: inline-block;
            font-size: 12px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            letter-spacing:1px;
            //text-align: right;
            margin-top: 8px;
        }
    }
}
.group-list {
    list-style: none;
    margin: 0px;
    padding: 0px;
    .group:hover{
        .favourite-group-action{
            display: inline-block;
        }
        background:rgba(247,248,250,1);
    }
    .group {
        height: 64px;
        margin: 0px;
        padding: 0px;
        cursor: pointer;
        background-color: white;
        .group-icon {
            display: inline-block;
            width: 40px;
            height: 40px;
            padding-top: 12px;
            padding-bottom:12px;
            display: inline-block;
            object-fit: scale-down;
        }
        .group-name{
            vertical-align: top;
            display: inline-block;
            height:20px;
            width: calc(100% - 144px);
            font-size:14px;
            font-weight:400;
            color:rgba(0,0,0,1);
            line-height:20px;
            letter-spacing:1px;
            padding-left: 12px;
            padding-top: 22px;
            padding-bottom: 22px;
            margin-top: 0px;
            margin-bottom: 0px;
        }
        .favourite-group-action {
        font-size: 0px;
        display: none;
        vertical-align: top;
        padding-top: 16px;
        padding-right: 0px;
        width: 76px;
        height: 20px;
        .message-img {
            display: inline-block;
            width: 32px;
            height: 32px;
            padding-left: 0px;
            padding-right: 12px;
            margin: 0px;
        }
        .delete-img {
            display: inline-block;
            width: 32px;
            height: 32px;
            padding: 0px;
            margin: 0px;
        }
    }
    }
}

</style>
