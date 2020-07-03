<template>
    <div class="detailPage">
        <div class="detailHeader">
            <img class="userIcon" src="../../../static/Img/User/user.jpeg">
            <div class="userInfo">
                <p class="userName">{{ collectionInfo.collection_content.fromUserName }}</p>
                <p class="userTime">{{ formatTimeFilter(collectionInfo.timestamp) }}</p>
            </div>
        </div>
        <div class="detailContent">
            <div class="messageContent" v-if="showMessageContent">
                <p class="messageText">{{ collectionInfo.collection_content.text }}</p>
            </div>
            <div class="imageContent" v-if="!showMessageContent">
                <img class="image" :id="collectionInfo.collection_id" src="../../../static/Img/Chat/loading.gif">
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
export default {
    name:'favouriteDetail',
    data() {
        return{
            leaders:[],
        }
    },
    methods:{

    },
    mounted:function() {
        const ipcRenderer = require('electron').ipcRenderer;
        
        ipcRenderer.on("clickedReportRelationInfo", (event, leaders) => {
            this.leaders = leaders
            console.log(this.leaders);
            // this.collectionInfo = collectionInfo;
            // var favouriteType = collectionInfo.collection_type;
            
            // if (favouriteType == 101){
            //     this.showMessageContent = true;
            // }else if(favouriteType == 102) {
            //     this.showMessageContent = false;
                
            //     this.$nextTick(function(){
            //         this.getImageCollectionContent(collectionInfo);
            // });
        //}
            
        });

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
</style>