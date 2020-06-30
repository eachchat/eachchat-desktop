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
            collectionInfo: {},
            showMessageContent: true,
            loginInfo:{},
        }
    },
    methods:{
        getAppBaseData:async function() {
            // Init services
            // let config = {
            //     hostname: "139.198.15.253",
            //     apiPort: 8888,
            // };
            // services.common.init(config);
            // Set accessToken in services
            // this.loginInfo = await services.common.GetLoginModel();
            // var curUserInfo = await services.common.GetSelfUserModel();
            // this.GroupInfo = await Group.FindItemFromGroupByGroupID(this.groupId);
            // console.log("the init user id is ,", this.GroupInfo)
            confservice.init(curUserInfo.id);
            // this.$store.commit("setUserId", this.curUserInfo.id)
            console.log("lognInfo is ", this.loginInfo);
            
            // this.updatePage();
        },
        getImageCollectionContent:async function(image){
            //Init services
            let config = {
                hostname: "139.198.15.253",
                apiPort: 8888,
            };
            services.common.init(config);
            confservice.init(this.collectionInfo.curUserInfo._attr.id);
            this.loginInfo = await services.common.GetLoginModel();
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
    mounted:function() {
        const ipcRenderer = require('electron').ipcRenderer;
        
        ipcRenderer.on("clickedCollectionInfo", (event, collectionInfo) => {
            this.collectionInfo = collectionInfo;
            var favouriteType = collectionInfo.collection_type;
            
            if (favouriteType == 101){
                this.showMessageContent = true;
            }else if(favouriteType == 102) {
                this.showMessageContent = false;
                
                this.$nextTick(function(){
                    this.getImageCollectionContent(collectionInfo);
            });
        }
            console.log(this.collectionInfo);
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

    .userIcon{
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        margin: 0px;
        margin-top: 12px;
        margin-bottom: 12px;
    }
    .userInfo{
        display: inline-block;
        vertical-align: top;
        .userName{
            display: inline-block;
            width: 432px;
            margin-top: 18px;
            margin-bottom: 18px;
            padding-left: 12px;
            height:20px;
            font-size:14px;
            font-weight:400;
            color:rgba(0,0,0,1);
            line-height:20px;
            letter-spacing:1px;
        }
        .userTime{
            display: inline-block;
            height:20px;
            font-size:14px;
            font-weight:400;
            color:rgba(153,153,153,1);
            line-height:20px;
            letter-spacing:1px;
        }
    }
}
.detailContent{
    height: calc(100% - 56px);
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