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
                                <p class="message-text" v-html="msgContentHightLight(message.collection_content.text)" @click="messageListClicked(message)">{{ message.collection_content.text }}</p>
                                <p class="message-sender" v-html="msgContentHightLight(message.collection_content.fromUserName)">{{ message.collection_content.fromUserName }}</p>
                                <p class="message-time" align="right">{{ formatTimeFilter(message.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitMessageCollectionClicked(message)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <!-- <img class="transmit-img" @click="testChatCreaterDialog()" src="../../../static/Img/Favorite/Detail/transmit@2x.png"> -->
                                    <!-- <img class="delete-img" @click="testChatCreaterDialog()" src="../../../static/Img/Favorite/Detail/delete@2x.png"> -->
                                    <img ondragstart="return false" class="delete-img" @click="deleteMessageCollectionClicked(message)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="image-view" v-if="showImageList">
                        <ul class="image-list">
                            <li class="image"
                                v-for="(image, index) in searchResults.image" :key="index">
                                <img ondragstart="return false" class="image-content" :id="image.collection_id" @click="imageListClicked(image)" src="../../../static/Img/Login/loading.gif" alt= "图片">
                                <p class="image-sender" v-html="msgContentHightLight(image.collection_content.fromUserName)">{{ image.collection_content.fromUserName }}</p>
                                <p class="image-time" align="right">{{ formatTimeFilter(image.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitImageCollectionClicked(image)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <img ondragstart="return false" class="delete-img" @click="deleteImageCollectionClicked(image)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
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
                                    <img ondragstart="return false" class="file-icon" :src="getFileIconThroughExt(file.collection_content.ext)" @click="fileListClicked(file)">
                                    <div class="file-info" @click="fileListClicked(file)">
                                        <p class="file-name" v-html="msgContentHightLight(file.collection_content.fileName)">{{ file.collection_content.fileName }}</p>
                                        <p class="file-size">{{ file.fileSize }}</p>
                                    </div>
                                    <img ondragstart="return false" class="file-action" :src="getFileStateSourceImage(file)" @click="fileActionClicked(file)">
                                </div>
                                <p class="file-sender" v-html="msgContentHightLight(file.collection_content.fromUserName)">{{ file.collection_content.fromUserName }}</p>
                                <p class="file-time" align="right">{{ formatTimeFilter(file.timestamp) }}</p>
                                <div class="favourite-action">
                                    <img ondragstart="return false" class="transmit-img" @click="transmitFileCollectionClicked(file)" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                                    <img ondragstart="return false" class="delete-img" @click="deleteFileCollectionClicked(file)" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                                </div>

                            </li>
                        </ul>
                    </div>
                </div>
            </el-container>
        </el-main>
        <el-container >
            <!-- <chatCreaterDlg v-show="showChatCreaterDlg" @closeChatCreaterDlg="closeChatCreaterDlg" :rootDepartments="chatCreaterDialogRootDepartments" :disableUsers="chatCreaterDisableUsers" :dialogTitle="chatCreaterDialogTitle" :key="chatCreaterKey">

            </chatCreaterDlg> -->
            <transmitDlg  v-show="showTransmitDlg" @updateChatList="updateChatList" @closeTransmitDlg="closeTransmitDlg" :recentGroups="recentGroups" :collectionInfo="transmitCollectionInfo" :transmitCollection="true" :key="transmitKey">

            </transmitDlg>
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
import chatCreaterDlg from './chatCreaterDlg.vue';
import {Group, Department, UserInfo} from '../../packages/data/sqliteutil.js';
import favouriteDetail from './favourite-detail.vue'
import { ComponentUtil } from '../script/component-util.js';

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
            searchResults:{}
        }
    },
    components: {
        transmitDlg,
        chatCreaterDlg,
        favouriteDetail
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
            this.OpenFavouriteDetail(message);
        },
        imageListClicked(image) {
            image.collection_content.url = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(image.collection_content.url);
            this.OpenFavouriteDetail(image);
        },
        fileListClicked:async function(file) {
            return;
            if(!this.getFileExist(file)){
                console.log("download start");
                await services.common.downloadFile(file.collection_content.timelineId, file.timestamp, file.collection_content.fileName, false, file.collection_content.fileSize);
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
                await services.common.downloadFile(file.collection_content.timelineId, file.timestamp, file.collection_content.fileName, false, file.collection_content.fileSize);
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
                return require("../../../static/Img/Favorite/File/directory@2x.png");
            }else{
                return require("../../../static/Img/Favorite/File/download@2x.png");
            }

        },
        deleteMessageCollectionClicked:async function(message) {
            await global.services.common.DeleteCollectionMessage(message.collection_id);
            var messageCollectionModel = await global.services.common.ListMessageCollections();
            this.favourites = this.getObjectFromCollectionModel(messageCollectionModel);
            /*
            if(this.showSearchView){
                await this.updateSearchCollectionResult(this.searchKey);
                return;
            }
            console.log(this.favourites);
            */
        },
        deleteImageCollectionClicked: async function(image) {
            await global.services.common.DeleteCollectionMessage(image.collection_id);
            var imageCollectionModel = await global.services.common.ListPictureCollections();
            this.favourites = this.getObjectFromCollectionModel(imageCollectionModel);
            this.$nextTick(function(){
                for(var i = 0; i < this.favourites.length; i ++){
                    this.getImageCollectionContent(this.favourites[i]);
                }
            });
            /*
            if(this.showSearchView){
                await this.updateSearchCollectionResult(this.searchKey);
                return;
            }
            */
        },  
        deleteFileCollectionClicked: async function(file) {
            await global.services.common.DeleteCollectionMessage(file.collection_id);
            var fileCollectionModel = await global.services.common.ListFileCollections();
            this.favourites = this.getObjectFromCollectionModel(fileCollectionModel);
            /*
            if(this.showSearchView){
                await this.updateSearchCollectionResult(this.searchKey);
                return;
            }
            */
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
        getFileExist(file) {
            return false;
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
        getObjectFromServerCollectionModel(collectionModels) {
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
                
                favourites.push(tempFavourite);
            }
            return favourites;
        },
        getSearchCollectionResult:async function (key) {
            var temp = {};

            var messageSearch = await services.common.SearchMessageCollection(key);
            var imageSearch = await services.common.SearchPictureCollecion(key);
            var fileSearch = await services.common.SearchFileCollecion(key);
            var groupSearch = await services.common.SearchGroupCollecion(key);
            temp.searchKey = this.searchKey;
            temp.message = messageSearch;
            temp.image = imageSearch;
            temp.file = fileSearch;
            temp.group = groupSearch;
            return temp;
            console.log(temp);

        },
        updateSearchCollectionResult:async function(key){
            var tempResult = await this.getSearchCollectionResult(key);
            this.headerTitle = '收藏';
            var temp = {};
            
            if(tempResult.message){
                temp.message = this.getObjectFromServerCollectionModel(tempResult.message);

            }
            if(tempResult.image){
                temp.image = this.getObjectFromServerCollectionModel(tempResult.image);
            }
            if(tempResult.file){
                temp.file = this.getObjectFromServerCollectionModel(tempResult.file);
                var tempFiles = [];
                for(var i = 0; i < temp.file.length; i ++){
                    var file = temp.file[i];
                    file.local_exist = this.getFileExist(file);
                    file.fileSize = getFileSizeByNumber(file.collection_content.fileSize);
                    tempFiles[i] = file;
                }
                temp.file = tempFiles;
            }
            if(tempResult.group) {
                temp.group = this.getObjectFromServerCollectionModel(tempResult.group);
            }
            this.searchResults = temp;
            this.$nextTick(function(){
                for(var i = 0; i < this.searchResults.image.length; i ++){
                    this.getImageCollectionContent(this.searchResults.image[i]);
                }
                for(var i = 0; i < this.searchResults.group.length; i ++){
                    this.getGroupAvatarContent(this.searchResults.group[i]);
                }
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
        updateCollectionShowFile: function(e, args) {
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
    },
    created:async function() {
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
        letter-spacing: 1px;
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
            letter-spacing:1px;
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
            width: calc(100% - 82px);
            margin-top: 8px;
            margin-bottom: 0px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
        }
        .message-time{
            display: inline-block;
            font-size: 11px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            letter-spacing:1px;
            //text-align: right;
            margin-top: 8px;
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
            width: calc(100% - 82px);
            margin-top: 12px;
            margin-bottom: 0px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
        }
        .image-time{
            display: inline-block;
            font-size: 11px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            letter-spacing:1px;
            //text-align: right;
            margin-top: 8px;
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
                    letter-spacing:1px;
                    font-family: PingFangSC-Medium;
                    
                }
                .file-size {
                    height:18px;
                    font-size:12px;
                    margin-top: 2px;
                    font-weight:400;
                    color:rgba(153,153,153,1);
                    line-height:18px;
                    letter-spacing:1px;
                    font-family: PingFangSC-Regular;
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
            font-family: PingFangSC-Regular;
            font-weight: 400;
        }
        .file-time{
            display: inline-block;
            font-size: 11px;
            line-height: 18px;
            font-weight:400;
            color:rgba(153,153,153,1);
            letter-spacing:1px;
            //text-align: right;
            margin-top: 8px;
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
            letter-spacing:1px;
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
