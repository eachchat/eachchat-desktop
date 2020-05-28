<template>
    <el-container>
        <el-header height="55px" class="favourite-header">
            <div class="header-title">
                {{ headerTitle }}
            </div>
            <div class="header-action" v-show="showHeaderAction">
                <img class="transmit-img" src="../../../static/Img/Favorite/Detail/transmit@2x.png">
                <img class="delete-img" src="../../../static/Img/Favorite/Detail/delete@2x.png">
            </div>
        </el-header>
        <el-main>
            <div class="favourite-list" v-if="showFavouriteList">
            <div class="message-view" v-if="showMessageList">
                <ul class="message-list">
                    <li class="message"
                        v-for="(message, index) in favourites" 
                        @click="messageListClicked(message)"
                        :key=index>
                        <p>{{ message.collection_content.text }}</p>
                        <p>{{ message.collection_content.fromUserName }}</p>
                        <!-- <img class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                        <div class="department-info">
                            <p class="department-name"></p>
                        </div>
                        <div align="center" class="item-arrow">
                            <img class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div> -->
                    </li>
                </ul>
            </div>
            <div class="image-view" v-if="showImageList">
            </div>
            <div class="file-view" v-if="showFileList">
            </div>
            <div class="group-view" v-if="showGroupList">
            </div>
            </div>
            <div class="favourite-detail" v-if="showFavouriteDetail">
                <div class="message-detail-view">
                </div>
                <div class="image-detail-view">
                </div>
                <div class="file-detail-view">
                </div>
                <div class="group-detail-view">
                </div>
            </div>
        </el-main>
    </el-container>
</template>
<script>
import {services} from '../../packages/data/index.js';
import { strMsgContentToJson } from '../../packages/core/Utils';

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
        showFavouriteDetail: function() {
            return !this.showFavouriteList;
        },
        showHeaderAction: function() {
            return this.showFavouriteDetail;
        },
        showMessageList: function() {
            if (!this.showFavouriteList){
                return false;
            }
            if (this.favouriteType == 'message'){
                return true;
            }else {
                return false;
            }
        },
        showImageList: function() {
            if (!this.showFavouriteList){
                return false;
            }
            if (this.favouriteType == 'image'){
                return true;
            }else {
                return false;
            }
        },
        showFileList: function() {
            if (!this.showFavouriteList){
                return false;
            }
            if (this.favouriteType == 'file'){
                return true;
            }else {
                return false;
            }
        },
        showGroupList: function() {
            if (!this.showFavouriteList){
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
        "favouriteType": {
            type: String,
            default: 'message'
        }
    },
    methods: {
        messageListClicked(message) {
            this.headerTitle = this.headerTitle + '详情';
            this.showFavouriteList = false;
            this.favouriteDetail = message;
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
        }
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

        }else if(this.favouriteType == 'file') {
            this.headerTitle = '文件';
        }else if(this.favouriteType == 'group'){
            this.headerTitle = '群组';
        }
        
    }
}
</script>
<style lang="scss">
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
    .header-action {
        display: inline-block;
        vertical-align: top;
        padding-right: 0px;
        padding-top: 18px;
        width: 80px;
        height: 20px;
        .transmit-img {
            display: inline-block;
            width: 20px;
            height: 20px;
            padding-right: 20px;
        }
        .delete-img {
            display: inline-block;
            width: 20px;
            height: 20px;
        }
    }
    
}
.message-list {
    list-style: none;
}
</style>
