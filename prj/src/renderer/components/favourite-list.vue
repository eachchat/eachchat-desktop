<template>
    <el-container>
        <el-header height="55px" class="favourite-header">
            <div class="header-title">
                {{ headerTitle }}
            </div>
        </el-header>
        <el-main>
            <el-container>
                <div class="favourite-list" v-if="!showSearchView">
                    <div class="message-view" v-if="showMessageList">
                        <ul class="message-list">
                            <li class="message"
                                v-for="(message, index) in favourites" 
                                :key="index">
                                <p class="message-text" @click="messageListClicked(message)">{{ message.collection_content.body }}</p>
                                <p class="message-sender">{{ message.user_name }}</p>
                                <p class="message-time" align="right">{{ formatTimeFilter(message.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitMessageCollectionClicked(message)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <!-- <img class="transmit-img" @click="testChatCreaterDialog()" src="../../../static/Img/Favorite/Detail/transmit@2x.png"> -->
                                    <!-- <img class="delete-img" @click="testChatCreaterDialog()" src="../../../static/Img/Favorite/Detail/delete@2x.png"> -->
                                    <img ondragstart="return false" class="delete-img" @click="deleteMessageCollectionClicked(message)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                                </div>    
                               
                                <div>
                                    <hr align=center width=100% color=#DDDDDD SIZE=1>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="image-view" v-if="showImageList">
                        <ul class="image-list">
                            <li class="image"
                                v-for="(image, index) in favourites" :key="index">
                                <img ondragstart="return false" class="image-content" :id="image.collection_id" @click="imageListClicked(image)" src="../../../static/Img/Login/loading.gif" alt= "图片">
                                <p class="image-sender">{{ image.user_name }}</p>
                                <p class="image-time" align="right">{{ formatTimeFilter(image.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitImageCollectionClicked(image)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <img ondragstart="return false" class="delete-img" @click="deleteImageCollectionClicked(image)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                                </div>
                                <div>
                                    <hr align=center width=100% color=#DDDDDD SIZE=1>
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
                                    <img ondragstart="return false" class="file-icon" :src="getFileIconThroughExt(file.collection_content.body)" @click="fileListClicked(file)">
                                    <div class="file-info" @click="fileListClicked(file)">
                                        <p class="file-name">{{ file.collection_content.body }}</p>
                                        <p class="file-size">{{ FileSizeByNumber(file.collection_content.info.size) }}</p>
                                    </div>
                                    <img ondragstart="return false" class="file-action" :src="getFileStateSourceImage(file)" @click="fileActionClicked(file)">
                                </div>
                                <p class="file-sender">{{ file.user_name }}</p>
                                <p class="file-time" align="right">{{ formatTimeFilter(file.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitFileCollectionClicked(file)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <img ondragstart="return false" class="delete-img" @click="deleteFileCollectionClicked(file)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                                </div>
                                <div>
                                    <hr align=center width=100% color=#DDDDDD SIZE=1>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="search-view" v-if="showSearchView">
                    <div class="message-view" v-if="showMessageList">
                        <ul class="message-list">
                            <li class="message"
                                v-for="(message, index) in searchResults.message" 
                                :key="index">
                                <p class="message-text" v-html="msgContentHightLight(message.collection_content.body)" @click="messageListClicked(message)">{{ message.collection_content.body }}</p>
                                <p class="message-sender" v-html="msgContentHightLight(message.user_name)">{{ message.user_name }}</p>
                                <p class="message-time" align="right">{{ formatTimeFilter(message.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitMessageCollectionClicked(message)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <!-- <img class="transmit-img" @click="testChatCreaterDialog()" src="../../../static/Img/Favorite/Detail/transmit@2x.png"> -->
                                    <!-- <img class="delete-img" @click="testChatCreaterDialog()" src="../../../static/Img/Favorite/Detail/delete@2x.png"> -->
                                    <img ondragstart="return false" class="delete-img" @click="deleteMessageCollectionClicked(message)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                                </div>
                                <div>
                                    <hr align=center width=100% color=#DDDDDD SIZE=1>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="image-view" v-if="showImageList">
                        <ul class="image-list">
                            <li class="image"
                                v-for="(image, index) in searchResults.image" :key="index">
                                <img ondragstart="return false" class="image-content" :id="image.collection_id" @click="imageListClicked(image)" src="../../../static/Img/Login/loading.gif" alt= "图片">
                                <p class="image-sender" v-html="msgContentHightLight(image.user_name)">{{ image.user_name }}</p>
                                <p class="image-time" align="right">{{ formatTimeFilter(image.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitImageCollectionClicked(image)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <img ondragstart="return false" class="delete-img" @click="deleteImageCollectionClicked(image)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                                </div>
                                <div>
                                    <hr align=center width=100% color=#DDDDDD SIZE=1>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="file-view" v-if="showFileList">
                        <ul class="file-list">
                            <li class="file"
                                v-for="(file, index) in searchResults.file"
                                :key="index">
                                <div class="file-content" >
                                    <img ondragstart="return false" class="file-icon" :src="getFileIconThroughExt(file.collection_content.body)" @click="fileListClicked(file)">
                                    <div class="file-info" @click="fileListClicked(file)">
                                        <p class="file-name" v-html="msgContentHightLight(file.collection_content.body)">{{ file.collection_content.body }}</p>
                                        <p class="file-size">{{ FileSizeByNumber(file.collection_content.info.size) }}</p>
                                    </div>
                                    <img ondragstart="return false" class="file-action" :src="getFileStateSourceImage(file)" @click="fileActionClicked(file)">
                                </div>
                                <p class="file-sender" v-html="msgContentHightLight(file.user_name)">{{ file.user_name }}</p>
                                <p class="file-time" align="right">{{ formatTimeFilter(file.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitFileCollectionClicked(file)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <img ondragstart="return false" class="delete-img" @click="deleteFileCollectionClicked(file)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                                </div>
                                <div>
                                    <hr align=center width=100% color=#DDDDDD SIZE=1>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </el-container>
            <AlertDlg :AlertContnts="alertContents" v-show="showAlertDlg" @closeAlertDlg="CloseAlertDlg" @clearCache="DeleteFavourite"/>
        </el-main>
        <el-container >
            <!-- <chatCreaterDlg v-show="showChatCreaterDlg" @closeChatCreaterDlg="closeChatCreaterDlg" :rootDepartments="chatCreaterDialogRootDepartments" :disableUsers="chatCreaterDisableUsers" :dialogTitle="chatCreaterDialogTitle" :key="chatCreaterKey">

            </chatCreaterDlg> -->
            <transmitDlg  v-show="showTransmitDlg" @updateChatList="updateChatList" @closeTransmitDlg="closeTransmitDlg" :collectionInfo="transmitCollectionInfo" :transmitCollection="true" :key="transmitKey">
            </transmitDlg>
        </el-container>
    </el-container>

</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {shell, ipcRenderer} from 'electron'
import {downloadGroupAvatar, generalGuid, Appendzero, FileUtil, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft, pathDeal, getFileSizeByNumber, getFileBlob} from '../../packages/core/Utils.js'
import { bool } from '../../packages/core/types';
import confservice from '../../packages/data/conf_service.js';
import transmitDlg from './transmitDlg.vue';
import chatCreaterDlg from './chatCreaterDlg.vue';
import {Group, Department, UserInfo, Message} from '../../packages/data/sqliteutil.js';
import favouriteDetail from './favourite-detail.vue'
import { ComponentUtil } from '../script/component-util.js';
import AlertDlg from './alert-dlg.vue'

export default {
    name: 'favourite-list',
    data() {
        return{
            headerTitle: '',
            favourites: [],
            showFavouriteList: true,
            showTransmitDlg: false,
            showChatCreaterDlg: false,
            transmitCollectionInfo: {},
            transmitKey:1,
            chatCreaterKey:1,
            recentGroups:[],
            curUserInfo:{},

            chatCreaterDisableUsers:[],
            chatCreaterDialogTitle:'',
            chatCreaterDialogRootDepartments:[],

            //showFavouriteSearchView: false,
            searchResults:{},
            showAlertDlg: false,
            deleteFavourite: {},
            alertContents : {
                "Details": "",
                "Abstrace": ""
            } 
        }
    },
    components: {
        transmitDlg,
        chatCreaterDlg,
        favouriteDetail,
        AlertDlg
    },
    computed: {
        showMessageList: function() {
            if (this.showSearchView){
                if(this.searchResults.message){
                    return true;
                }
                return false;
            }
            if (this.favouriteType == 'message'){
                return true;
            }else {
                return false;
            }
        },
        showImageList: function() {
            if (this.showSearchView){
                if(this.searchResults.image){
                    return true;
                }
                return false;
            }
            if (this.favouriteType == 'image'){
                return true;
            }else {
                return false;
            }
        },
        showFileList: function() {
            if (this.showSearchView){
                if(this.searchResults.file){
                    return true;
                }
                return false;
            }
            if (this.favouriteType == 'file'){
                return true;
            }else {
                return false;
            }
        },
        showGroupList: function() {
            if (this.showSearchView){
                if(this.searchResults.group){
                    return true;
                }
                return false;
            }
            if (this.favouriteType == 'group'){
                return true;
            }else {
                return false;
            }
        },

        },
    props: {
        favouriteType: {
            type: String,
            default: 'message'
        },
        showSearchView:{
            type:Boolean,
            default: false
        },
        searchKey:{
            type: String,
            default: ''
        },
    },
    methods: {
        CloseAlertDlg(){
            this.showAlertDlg = false;
        },

        async DeleteFavourite(){
            this.showAlertDlg = false;
            await global.services.common.DeleteCollectionMessage(this.deleteFavourite.item.collection_id);
            if(this.deleteFavourite.type == 'message'){
                var messageCollectionModel = await global.services.common.ListMessageCollections();
                this.favourites = await this.getObjectFromCollectionModel(messageCollectionModel);
            }
            else if(this.deleteFavourite.type == 'image'){
                var imageCollectionModel = await global.services.common.ListPictureCollections();
                this.favourites = await this.getObjectFromCollectionModel(imageCollectionModel);
                this.$nextTick(function(){
                    for(var i = 0; i < this.favourites.length; i ++){
                        this.getImageCollectionContent(this.favourites[i]);
                    }
                });
            }
            else if(this.deleteFavourite.type == 'file'){
                var fileCollectionModel = await global.services.common.ListFileCollections();
                this.favourites = await this.getObjectFromCollectionModel(fileCollectionModel);
            }
            if(this.showSearchView){
                await this.updateSearchCollectionResult(this.searchKey);
                return;
            }    
        },


        FileSizeByNumber(size)
        {
            return getFileSizeByNumber(size);
        },

        updateChatList: function(ret) {
            ipcRenderer.send("favourite-update-chatlist", ret);
        },
        testChatCreaterDialog:async function() {
            this.chatCreaterKey ++;
            var self = await services.common.GetSelfUserModel();
            this.chatCreaterDisableUsers.push(await UserInfo.GetUserInfo(self.id));
            var root = await Department.GetRoot();
            var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
            var temp = [];
            for(var i = 0; i < rootDepartmentModels.length; i ++) {
                var department = rootDepartmentModels[i];
                temp[department.show_order] = department;
            }
            this.chatCreaterDialogRootDepartments =  temp;
            
            this.showChatCreaterDlg = true;
            this.transmitKey ++;
            this.chatCreaterDialogTitle = "创建";

        },
        closeTransmitDlg(content) {
            this.showTransmitDlg = false;
                
        },
        closeChatCreaterDlg(content) {
            this.showChatCreaterDlg = false;
        },

        OpenFavouriteDetail(message){
            let fromMatrixId = message.collection_content.fromMatrixId;
            global.mxMatrixClientPeg.matrixClient.getProfileInfo(fromMatrixId).then(profileInfo=>{
                var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
                message.avaterUrl = avaterUrl;
                const ipcRender = require('electron').ipcRenderer;
                ipcRender.send('showFavouriteDetailWindow', message)
            });
        },

        messageListClicked(message) {
            message.title = "消息详情"
            this.OpenFavouriteDetail(message);
        },
        async imageListClicked(image) {
            // image.title = "图片详情"
            // image.collection_content.url = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(image.collection_content.url);
            // this.OpenFavouriteDetail(image);
            var imageCollectionModel = await global.services.common.ListPictureCollections();
            var imgFavourites = await this.getObjectFromCollectionModel(imageCollectionModel);
            console.log("*** imgFavourites is ", imgFavourites);
            var showImageInfoList = [];
            var distImageInfo = {};
            imgFavourites.forEach(imgFavouriteItem => {
                let chatGroupMsgContent = imgFavouriteItem.collection_content;
                
                let maxSize = 366;
                var curUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url);
    
                let info = {
                    w: maxSize,
                    h: maxSize
                };
                console.log("*** image info is ", chatGroupMsgContent.info);
                if(chatGroupMsgContent.info)
                    info = chatGroupMsgContent.info
                if(!info.h)
                    info.h = maxSize;
                if(!info.w)
                    info.w = maxSize;
                let max = Math.max(info.w, info.h);
                if(max > maxSize ){
                    if(info.w > info.h){
                        info.h = info.h/(info.w/maxSize);
                        info.w = maxSize;
                    }
                    else{
                        info.w = info.w/(info.h/maxSize)
                        info.h = maxSize;
                    }
                }

                var curImageInfo = {
                    imageUrl: curUrl,
                    url: chatGroupMsgContent.url,
                    imageEventId: imgFavouriteItem.collection_id,
                    info: info,
                    body: imgFavouriteItem.body,
                    sender: undefined,
                    origin_server_ts: imgFavouriteItem.timestamp
                }
                if(image.collection_id == imgFavouriteItem.collection_id) {
                    distImageInfo = {
                        imageUrl: curUrl,
                        url: chatGroupMsgContent.url,
                        imageEventId: imgFavouriteItem.collection_id,
                        info: info,
                        body: imgFavouriteItem.body,
                        sender: undefined,
                        origin_server_ts: imgFavouriteItem.timestamp
                    }
                }
                showImageInfoList.unshift(curImageInfo);
            })
            ipcRenderer.send('showImageViewWindow', showImageInfoList, distImageInfo);
        },

        DownloadFile: function(file){
            let filepath = file.localPath;
            if(filepath.length == 0){
                var chatGroupMsgContent = file.collection_content;
                let msgKey = Base64.encode(chatGroupMsgContent.url, true)
                var distPath = confservice.getFilePath(chatGroupMsgContent.fromTimestamp);
                getFileBlob(chatGroupMsgContent.info, global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url))
                .then((blob) => {
                    let reader = new FileReader();
                    reader.onload = function() {
                        if(reader.readyState == 2) {
                            var buffer = new Buffer(reader.result);
                            var finalPath = path.join(distPath, chatGroupMsgContent.body);
                            // ipcRenderer.send("save_file", path.join(distPath, content.body), buffer);
                            ipcRenderer.send("save_file", finalPath, buffer, msgKey, false);
                        }
                    }
                    reader.readAsArrayBuffer(blob);
                })
                return;
            }
            shell.showItemInFolder(filepath);
        },

        fileListClicked:async function(file) {
            this.DownloadFile(file);
        },
        fileActionClicked:async function(file) {
            this.DownloadFile(file);
        },
        updateFileCollectionList() {
            var tempFiles = [];
            for(var i = 0; i < this.favourites.length; i ++){
                    var file = this.favourites[i];
                    file.local_exist = file.localPath;
                    //file.collection_content.fileSize = getFileSizeByNumber(file.collection_content.fileSize)
                    tempFiles[i] = file;
            }
            this.favourites = tempFiles;
        },
        getFileStateSourceImage(file) {
            if(file.localPath.length != 0){
                return require("../../../static/Img/Favorite/File/directory@2x.png");
            }else{
                return require("../../../static/Img/Favorite/File/download@2x.png");
            }
        },
        deleteMessageCollectionClicked:async function(message) {
            this.alertContents = {
                "Details": "是否确定删除该收藏内容",
                "Abstrace": "删除收藏"
            } 
            this.deleteFavourite.item = message;
            this.deleteFavourite.type = "message";
            this.showAlertDlg = true;
        },
        deleteImageCollectionClicked: async function(image) {
            this.alertContents = {
                "Details": "是否确定删除该收藏内容",
                "Abstrace": "删除收藏"
            } 
            this.deleteFavourite.item = image;
            this.deleteFavourite.type = "image";
            this.showAlertDlg = true;
        },  
        deleteFileCollectionClicked: async function(file) {
            this.alertContents = {
                "Details": "是否确定删除该收藏内容",
                "Abstrace": "删除收藏"
            } 
            this.deleteFavourite.item = file;
            this.deleteFavourite.type = "file";
            this.showAlertDlg = true;
        },

        transmitMessageCollectionClicked:async function(message) {
            this.showTransmitDlg = true;
            this.transmitKey ++;
            this.transmitCollectionInfo = message;
        },
        transmitImageCollectionClicked:async function(image) {
            this.showTransmitDlg = true;
            this.transmitKey ++;
            this.transmitCollectionInfo = image;
        },
        transmitFileCollectionClicked:async function(file) {
            this.showTransmitDlg = true;
            this.transmitKey ++;
            this.transmitCollectionInfo = file;
        },
        groupCollectionChatClicked:async function(group) {
            console.log("groupCollectionChatClicked group is ", group);
            this.$router.push(
                {
                    name: 'ChatContent', 
                    params: {
                        group_id: group.collection_id
                    }
                })
        },
        getFileIconThroughExt(ext) {
            var iconPath = getIconPath(ext);
            return iconPath
        },

        async getFileExist(file) {
            let fileOriginUrl = file.collection_content.url;
            let key = Base64.encode(fileOriginUrl, true);
            let msgs = await Message.FindMessageByMesssageID(key);
            console.log(msgs)
            if(msgs.length != 0 && msgs[0].file_local_path != "")
                return msgs[0].file_local_path;
            return '';
        },

        getImageCollectionContent:async function(image){
            var imageCollectionElement = document.getElementById(image.collection_id);
            if(imageCollectionElement)
            {
                var realUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(image.collection_content.url);
                imageCollectionElement.setAttribute("src", realUrl);
            }
        },
        getGroupAvatarContent:async function(group) {
            var targetDir = confservice.getUserThumbHeadPath();
            var targetPath = path.join(targetDir, group.collection_id + '.png');
            var groupAvatarElement = document.getElementById(group.collection_id);
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
                await services.common.downloadGroupAvatar(group.collection_content.fromUserAvatar, group.collection_id);
                //await this.getGroupAvatarContent(group);
            }

        },

        async getObjectFromCollectionModel(collectionModels) {
            var favourites = [];
            for(var i = 0; i < collectionModels.length; i ++){
                var model = collectionModels[i];
                if(model.collection_type == 104) {
                    if(model.collection_id.length == 0) {
                        continue;
                    }
                }
                var tempFavourite = {};
                tempFavourite.collection_id = model.collection_id;
                tempFavourite.collection_type = model.collection_type;
                tempFavourite.favourite_id = model.favourite_id;
                tempFavourite.collection_content = strMsgContentToJson(model.collection_content);
                if(103 == tempFavourite.collection_type){
                    tempFavourite.localPath = await this.getFileExist(tempFavourite);
                }
                tempFavourite.user_name = await ComponentUtil.GetDisplayNameByMatrixID(tempFavourite.collection_content.fromMatrixId);
                tempFavourite.sequence_id 
                = model.sequence_id;
                tempFavourite.timeline_id = model.timeline_id;
                tempFavourite.timestamp = model.timestamp;
                
                favourites.push(tempFavourite);
            }
            return favourites;
        },
        formatTimeFilter(secondsTime) {
            return ComponentUtil.formatTimeFilter(secondsTime);
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
        async getObjectFromServerCollectionModel(collectionModels) {
            var favourites = [];
            for(var i = 0; i < collectionModels.length; i ++){
                var model = collectionModels[i];
                var tempFavourite = {};
                tempFavourite.collection_id = model.collectionId;
                tempFavourite.collection_type = model.collectionType;
                tempFavourite.favourite_id = model.favoriteId;
                tempFavourite.collection_content = model.content;
                tempFavourite.sequence_id = model.sequenceId;
                tempFavourite.timeline_id = model.timelineId;
                tempFavourite.timestamp = model.timestamp;
                if(103 == tempFavourite.collection_type){
                    tempFavourite.localPath = await this.getFileExist(tempFavourite);
                }
                tempFavourite.user_name = await ComponentUtil.GetDisplayNameByMatrixID(tempFavourite.collection_content.fromMatrixId);
                favourites.push(tempFavourite);
            }
            return favourites;
        },
        getSearchCollectionResult:async function (key) {
            var temp = {};

            var messageSearch = await global.services.common.SearchMessageCollection(key);
            var imageSearch = await global.services.common.SearchPictureCollecion(key);
            var fileSearch = await global.services.common.SearchFileCollecion(key);
            //var groupSearch = await global.services.common.SearchGroupCollecion(key);
            temp.searchKey = this.searchKey;
            temp.message = messageSearch;
            temp.image = imageSearch;
            temp.file = fileSearch;
            //temp.group = groupSearch;
            return temp;
            console.log(temp);

        },
        
        updateSearchCollectionResult:async function(key){
            var tempResult = await this.getSearchCollectionResult(key);
            this.headerTitle = '收藏';
            var temp = {};
            
            if(tempResult.message){
                temp.message = await this.getObjectFromServerCollectionModel(tempResult.message);

            }
            if(tempResult.image){
                temp.image = await this.getObjectFromServerCollectionModel(tempResult.image);
            }
            if(tempResult.file){
                temp.file = await this.getObjectFromServerCollectionModel(tempResult.file);
                var tempFiles = [];
                for(var i = 0; i < temp.file.length; i ++){
                    var file = temp.file[i];
                    file.local_exist = this.getFileExist(file);
                    file.fileSize = getFileSizeByNumber(file.collection_content.fileSize);
                    tempFiles[i] = file;
                }
                temp.file = tempFiles;
            }
            /*
            if(tempResult.group) {
                temp.group = this.getObjectFromServerCollectionModel(tempResult.group);
            }
            */
            this.searchResults = temp;
            this.$nextTick(function(){
                for(var i = 0; i < this.searchResults.image.length; i ++){
                    this.getImageCollectionContent(this.searchResults.image[i]);
                }
                /*
                for(var i = 0; i < this.searchResults.group.length; i ++){
                    this.getGroupAvatarContent(this.searchResults.group[i]);
                }
                */
            });
            return;
        },
        updateCollectionShowImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var needOpen = args[4];
            if(this.showSearchView){
                this.updateSearchCollectionResult(this.searchKey);
            }else{
                for (var i = 0;i < this.favourites.length; i ++){
                    var image = this.favourites[i];
                    var targetDir = confservice.getThumbImagePath(image.timestamp);
                    var targetPath = path.join(targetDir, image.collection_content.fileName);
                    if(targetPath == localPath){
                        this.getImageCollectionContent(image);
                    }
                }
            }

        },
        updateCollectionShowFile: function(e, msgId, filepath) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var needOpen = args[4];
            if(this.showSearchView){
                this.updateSearchCollectionResult(this.searchKey);
            }else{
                for (var i = 0;i < this.favourites.length; i ++){
                    var file = this.favourites[i];
                    var targetDir = confservice.getFilePath(file.timestamp);
                    var targetPath = path.join(targetDir, file.collection_content.fileName);
                    if(targetPath == localPath){
                        this.updateFileCollectionList();
                    }
                }
            }

        },

        UpdateFileLocalPath: async function(e, finalName, eventId){
            if(this.favouriteType !== 'file')
                return;
            this.favourites.map(file => {
                let fileOriginUrl = file.collection_content.url;
                let key = Base64.encode(fileOriginUrl, true);
                if(key === eventId)
                    file.localPath = finalName;
                return file;
            })
        },
    },

    created:async function() {
        ipcRenderer.on("SAVED_FILE", this.UpdateFileLocalPath);
        this.recentGroups = await Group.GetGroupByTime();
        //console.log(this.recentGroups);
        if(this.showSearchView){
            await this.updateSearchCollectionResult(this.searchKey);
            return;
        }
        if (this.favouriteType == 'message'){
            this.headerTitle = '收藏';
            var messageCollectionModel = await global.services.common.ListMessageCollections();
            this.favourites = await this.getObjectFromCollectionModel(messageCollectionModel);
            
            console.log(this.favourites);
        }else if(this.favouriteType == 'image') {
            this.headerTitle = '收藏';
            var imageCollectionModel = await global.services.common.ListPictureCollections();
            this.favourites = await this.getObjectFromCollectionModel(imageCollectionModel);
            console.log(this.favourites);
            this.$nextTick(function(){
                for(var i = 0; i < this.favourites.length; i ++){
                    this.getImageCollectionContent(this.favourites[i]);
                }
            });
  
        }else if(this.favouriteType == 'file') {
            this.headerTitle = '收藏';
            var fileCollectionModel = await global.services.common.ListFileCollections();

            this.favourites = await this.getObjectFromCollectionModel(fileCollectionModel);
            console.log( this.favourites)
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
    border-bottom: 1px solid rgb(238, 238, 238);
    .header-title {
        display: inline-block;
        padding-left: 0px;;
        margin-left: 16px;
        padding-top: 18px;
        font-size: 14px;
        line-height: 20px;
        padding-left: 0px;
        width: calc(100% - 100px);
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
    }
    -webkit-app-region: drag;
}
.search-view{
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
}
.file-action{
        display: none;
    }

    .favourite-action {
        display: none;
        font-size: 0px;
        vertical-align: top;
        padding-top: 18px;
        padding-right: 0px;
        padding-bottom: 7px;
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
        height: 120px;
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
            font-size: 14px;
            padding-top: 20px;
            margin-top: 0px;
            margin-bottom: 0px;
            height: 44px;
            font-family: PingFangSC-Regular;
        }
        .message-sender{
            display: inline-block;
            color: rgb(102, 102, 102);
            font-size: 12px;
            line-height: 18px;
            width: calc(100% - 83px);
            margin-top: 15px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
        }
        .message-time{
            display: inline-block;
            font-size: 11px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            //text-align: right;
            width: 78px;
            margin-top: 15px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
            
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
        height: 150px;
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
            width: calc(100% - 83px);
            margin-top: 15px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
        }
        .image-time{
            display: inline-block;
            font-size: 11px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            //text-align: right;
            width: 78px;
            margin-top: 15px;
            font-family: PingFangSC-Regular;
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
        height: 120px;
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
                    width: calc(100% - 13px);
                    height:20px;
                    font-size:14px;
                    margin-top: 0px;
                    margin-bottom: 0px;
                    overflow: hidden;
                    text-overflow:ellipsis;
                    white-space: nowrap;
                    font-weight:500;
                    color:rgba(0,0,0,1);
                    line-height:20px;
                    font-family: PingFangSC-Medium;
                    
                }
                .file-size {
                    height:18px;
                    font-size:12px;
                    margin-top: 2px;
                    font-weight:400;
                    color:rgba(153,153,153,1);
                    line-height:18px;
                    font-family: PingFangSC-Regular;
                }
            }
        }
        .file-sender{
            display: inline-block;
            color: rgb(102, 102, 102);
            font-size: 12px;
            line-height: 18px;
            width: calc(100% - 83px);
            margin-top: 15px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
        }
        .file-time{
            display: inline-block;
            font-size: 11px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            //text-align: right;
            width: 78px;
            margin-top: 15px;
            font-family: PingFangSC-Regular;
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
            padding-left: 12px;
            padding-top: 22px;
            padding-bottom: 22px;
            margin-top: 0px;
            margin-bottom: 0px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
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
