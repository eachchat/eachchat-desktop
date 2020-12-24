<template>
    <div class="reportPage" align="center">
        <div class="reportView">
        <ul class="reportList">
            <li class="report" v-for="(user, index) in userInfo.leaders" :key="index">
                <div class="reportInfo">
                    <img ondragstart="return false" class="reportIcon" src="../../../static/Img/User/user-40px@2x.png" :id="user._attr.user_id">
                    <p class="reportName">{{ user._attr.user_display_name }}</p>
                    <p class="reportTitle">{{ user._attr.user_title }}</p>
                </div>
                <img ondragstart="return false" class="reportArraw" src="../../../static/Img/Organization//UserInfo/reportRelation-24px@2x.png" v-show="index != (userInfo.leaders.length - 1)"> 
            </li>
        </ul>
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
    name:'reportRelationContent',

    data() {
        return{
            userInfo:{},
        }
    },
    methods:{
        getUserImg: async function (user_id){
            //console.log("userinfo-tip getuserimg this.userInfo ", this.userInfo);
            if(user_id == undefined) {
                return "";
            }
            var userId = user_id;
            
            confservice.init(this.userInfo.curUserInfo._attr.id);
            var localPath = confservice.getUserThumbHeadLocalPath(userId);
            let userIconElement = document.getElementById(userId);
            if(fs.existsSync(localPath)){
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    userIconElement.setAttribute("src", reader.result);
                }
            }
        },
    },
    mounted:function() {
        const ipcRenderer = require('electron').ipcRenderer;
        var _this = this;
        ipcRenderer.on("clickedReportRelationInfo", (event, userInfo) => {
            _this.userInfo = userInfo;
            console.log(_this.userInfo);
            this.$nextTick(function(){
                for(var i = 0;i < _this.userInfo.leaders.length; i ++){
                    this.getUserImg(_this.userInfo.leaders[i]._attr.user_id);
                }
                
            });            
        });

    },
    created(){
    }
}
</script>
<style lang="scss" scoped>
.reportPage{
    width: 520px;
    height: 318px;
    margin: 0px;
    padding: 0px;
    .reportView{
        padding-top: 98px;
    }
    .reportList{
        margin: 0px;
        padding: 0px;
        
        padding-top: 98px;
        width: 478px;
        height: 220px;
        overflow-x: scroll;
        list-style: none;
        display: inline;
        .report{
            display: inline;
            //float: left;
            height: 110px;
            width: 156px;
            .reportInfo{
                display: inline-block;
            }
            .reportIcon{
                width: 56px;
                height: 56px;
                border-radius: 4px;
                border-radius: 50%;
            }
            .reportName{
                text-align: center;
                margin: 0px;
                margin-top: 13px;
                width:132px;
                height:20px;
                font-size:14px;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                text-align: center;
                font-family: PingFangSC-Medium;
            }
            .reportTitle{
                text-align: center;
                margin: 0px;
                margin-top: 4px;
                width:132px;
                height:18px;
                font-size:12px;
                font-weight:400;
                color:rgba(153,153,153,1);
                line-height:18px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
            }
            .reportArraw{
                display: inline-block;
                //float: right;
                vertical-align: top;
                margin-top: 16px;
                width: 24px;
                height: 24px;
            }
        }
    }
}
</style>