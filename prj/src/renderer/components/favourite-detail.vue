<template>
    <div class="detailPage" v-if="showView">
        <div class="detailHeader">
            <img ondragstart="return false" class="userIcon" :id="collectionInfo.collection_content.fromMatrixId" src="../../../static/Img/User/user-40px@2x.png">
            <div class="userInfo">
                <p class="userName">{{ userName }}</p>
                <p class="userTime">{{ formatTimeFilter(collectionInfo.timestamp) }}</p>
            </div>
        </div>
        <div class="detailContent">
            <div class="messageContent" v-if="showMessageContent">
                <p class="messageText">{{ collectionInfo.collection_content.body }}</p>
            </div>
            <div class="imageContent" v-if="!showMessageContent">
                <img ondragstart="return false" class="image" :id="collectionInfo.collection_id" src="../../../static/Img/Chat/loading.gif">
            </div>
        </div>
    </div>
</template>>
<script>
import confservice from '../../packages/data/conf_service.js';
import * as path from 'path';
import * as fs from 'fs-extra'
import {services} from '../../packages/data/index.js';
import {downloadGroupAvatar, generalGuid, Appendzero, FileUtil, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft, pathDeal, getFileSizeByNumber} from '../../packages/core/Utils.js'
import { object } from '../../packages/core/types.js';
import { ComponentUtil } from '../script/component-util'

export default {
    name:'favouriteDetail',
    props: {
        collectionInfo:{
            type: Object,
            default: {}
        }
    },

    data() {
        return{
            showMessageContent: true,
            loginInfo:{},
            showView: false,
            userInfo: {},
            userName:''
        }
    },

    methods:{
        getImageCollectionContent:async function(image){
            let url = image.collection_content.url;
            var imageCollectionElement = document.getElementById(image.collection_id);
            imageCollectionElement.setAttribute("src", url);
        },

        getUserImg: async function (user_id, avaterUrl){
            if(user_id == undefined || avaterUrl == '') {
                return;
            }
            let userIconElement = document.getElementById(user_id);
            if(userIconElement){
                userIconElement.setAttribute("src", avaterUrl);
            }
        },
        formatTimeFilter(secondsTime) {
            return ComponentUtil.formatTimeFilter(secondsTime);
        },
    },
    mounted:function() {
        const ipcRenderer = require('electron').ipcRenderer;
        ipcRenderer.on("clickedCollectionInfo", (event, collectionInfo) => {
            this.showView = true;
            this.collectionInfo = collectionInfo;
            this.userName = collectionInfo.user_name;
            var favouriteType = this.collectionInfo.collection_type;
            this.$nextTick(function(){
                    this.getUserImg(this.collectionInfo.collection_content.fromMatrixId, collectionInfo.avaterUrl);
            });
            if (favouriteType == 101){
                this.showMessageContent = true;
                
            }else if(favouriteType == 102) {
                this.showMessageContent = false;
                this.$nextTick(function(){
                    this.getImageCollectionContent(this.collectionInfo);
                });
            }
        });
        console.log(this.collectionInfo);
    },
    created(){
    }
}
</script>
<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
.detailPage{
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0px;
    overflow: hidden;
}
.detailHeader{
    height: 56px;
    width: calc(100% - 40px);
    margin: 0px;
    padding: 0px;
    padding-left: 20px;
    font-size: 0px;
    .userIcon{
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        margin: 0px;
        margin-top: 12px;
        margin-bottom: 12px;
        border-radius: 50%;
    }
    .userInfo{
        display: inline-block;
        vertical-align: top;
        width: calc(100% - 32px);
        .userName{
            display: inline-block;
            width: calc(100% - 110px); 
            margin-top: 18px;
            margin-bottom: 18px;
            padding-left: 12px;
            height:20px;
            font-size:14px;
            font-weight:400;
            color:rgba(0,0,0,1);
            line-height:20px;
            letter-spacing:1px;
            font-family: PingFangSC-Regular;
        }
        .userTime{
            text-align: right;
            display: inline-block;
            width: 98px;
            height:20px;
            font-size:12px;
            font-weight:400;
            color:rgba(153,153,153,1);
            line-height:20px;
            letter-spacing:1px;
            font-family: PingFangSC-Regular;
        }
    }
}
.detailContent{
    height: 100%;
    width: 100%;
    .messageContent{
        width: calc(100% - 40px);
        height: 100%;
        padding-left: 20px;
        overflow: scroll;
        .messageText{
            margin: 0px;
            padding: 0px;
            
            width:560px;
            font-size:14px;

            font-weight:400;
            color:rgba(0,0,0,1);
            line-height:20px;
            letter-spacing:1px;
            font-family: PingFangSC-Regular;
        }
    }
    .imageContent{
        width: calc(100% - 40px);
        height: 100%;
        padding-left: 20px;
        overflow: scroll;
        .image{
            width: 100%;
            height: 100%;
            object-fit: scale-down;
        }
    }
}
</style>