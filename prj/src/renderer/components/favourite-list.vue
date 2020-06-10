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
                        @click="messageListClicked(message)"
                        :key=index>
                        <p class="message-text">{{ message.collection_content.text }}</p>
                        <p class="message-sender">{{ message.collection_content.fromUserName }}</p>
                        <p class="message-time" align="right">{{ formatTimeFilter(message.timestamp) }}</p>
                        <div class="favourite-action">
                            <img class="transmit-img" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                            <img class="delete-img" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                        </div>
                    </li>
                </ul>
            </div>
            <div class="image-view" v-if="showImageList">
                <ul class="image-list">
                    <li class="image"
                        v-for="(image, index) in favourites" 
                        @click="imageListClicked(image)"
                        :key=index>
                        <img class="image-content" :id="image.collection_id" src="../../../static/Img/Chat/loading.gif" alt= "图片">
                        
                        <p class="image-sender">{{ image.collection_content.fromUserName }}</p>
                        <p class="image-time" align="right">{{ formatTimeFilter(image.timestamp) }}</p>
                        <div class="favourite-action">
                            <img class="transmit-img" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                            <img class="delete-img" src="../../../static/Img/Favorite/Detail/delete@2x.png">
                        </div>
                    </li>
                </ul>
            </div>
            <div class="file-view" v-if="showFileList">
                <ul class="file-list">
                    <li class="file"
                        v-for="(file, index) in favourites"
                        @click="fileListClicked(file)"
                        :key="index">
                        <p class="file-name">{{ file.collection_content.fileName }}</p>
                        <p class="file-sender">{{ file.collection_content.fromUserName }}</p>
                        <p class="file-time">{{ formatTimeFilter(file.timestamp) }}</p>
                    </li>
                </ul>
            </div>
            <div class="group-view" v-if="showGroupList">
                <ul class="file-list">
                    <li class="file"
                        v-for="(group, index) in favourites"
                        @click="fileListClicked(file)"
                        :key="index">
                        <p class="group-name">{{ group.collection_content.groupName }}</p>
                        <p class="group-sender">{{ group.collection_content.fromUserName }}</p>
                        <p class="group-time">{{ formatTimeFilter(group.timestamp) }}</p>
                    </li>
                </ul>
            </div>
            </div>
            <!-- <div class="favourite-detail" v-if="showFavouriteDetail">
                <div class="message-detail-view">
                    <p class="message-detail-sender">{{ favouriteDetail.collection_content.fromUserName }}
                    <p class="message-time">{{ formatTimeFilter(favouriteDetail.timestamp) }}</p>
                    <p class="message-detail-text">{{ favouriteDetail.collection_content.text }}</p>
                    
                </div>
                <div class="image-detail-view">
                </div>
                <div class="file-detail-view">
                </div>
                <div class="group-detail-view">
                </div>
            </div> -->
            </el-container>
        </el-main>
    </el-container>
</template>
<script>
import {services} from '../../packages/data/index.js';
import * as path from 'path'
import * as fs from 'fs-extra'
import confservice from '../../packages/data/conf_service.js'
import {downloadGroupAvatar, generalGuid, Appendzero, FileUtil, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft, pathDeal} from '../../packages/core/Utils.js'

export default {
    name: 'favourite-list',
    data() {
        return{
            headerTitle: '',
            favourites: [],
            favouriteDetail: {},
            showFavouriteList: true,
            
        }
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
        messageListClicked(message) {
            // open new window and load
        },
        imageListClicked(image) {

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
                await this.getImageCollectionContent(image);
                // this.checkAndLoadImg(targetPath);
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
            console.log(this.favourites);
        }else if(this.favouriteType == 'group'){
            this.headerTitle = '群组';
            var groupCollectionModel = await services.common.ListGroupCollections();
            this.favourites = this.getObjectFromCollectionModel(groupCollectionModel);
            console.log(this.favourites);
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
    .favourite-action {
        display: none;
        vertical-align: top;
        padding-top: 10px;
        padding-right: 0px;
        width: 78px;
        height: 20px;
        .transmit-img {
            display: inline-block;
            width: 20px;
            height: 20px;
            padding-left: 25px;
            padding-right: 8px;
        }
        .delete-img {
            display: inline-block;
            width: 20px;
            height: 20px;
            padding: 0px;
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
</style>
