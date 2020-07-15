<template>
    <div class="reportPage">
        <ul class="reportList">
            <li class="report" v-for="(user, index) in leaders" :key="index">
                <img class="reportIcon">
                <p class="reportName">{{ user._attr.user_display_name }}</p>
                <p class="reportTitle"></p>
                <img class="reportArraw" v-show="index == (leaders.length - 1)"> 
            </li>
        </ul>
    </div>
</template>>
<script>
import confservice from '../../packages/data/conf_service.js';
import * as path from 'path';
import * as fs from 'fs-extra'
import {services} from '../../packages/data/index.js';
import {downloadGroupAvatar, generalGuid, Appendzero, FileUtil, getIconPath, sliceReturnsOfString, strMsgContentToJson, getElementTop, getElementLeft, pathDeal, getFileSizeByNumber} from '../../packages/core/Utils.js'
export default {
    name:'reportRelationContent',
    data() {
        return{
            leaders:[],
        }
    },
    methods:{

    },
    mounted:function() {
        const ipcRenderer = require('electron').ipcRenderer;
        var _this = this;
        ipcRenderer.on("clickedReportRelationInfo", (event, leaders) => {
            _this.leaders = leaders;
            console.log(_this.leaders);
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

</style>