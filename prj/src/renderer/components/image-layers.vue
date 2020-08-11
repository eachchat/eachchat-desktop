<template>
    <div class="ImageLayers" id="imageLayers">
        <div class="image-layers-buttons">
            <i class="el-icon-close" @click="Close()"></i>
        </div>
        <i class="el-icon-loading" v-show="isLoading"></i>
        <img class="image-layers-image" id="imageLayersImage" v-show="!isLoading">
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import {APITransaction} from '../../packages/data/transaction.js'
import * as fs from 'fs-extra'
import {ipcRenderer} from 'electron'
import confservice from '../../packages/data/conf_service.js'
import * as path from 'path'
export default {
    name: 'ImageLayers',
    props: ['imgSrcInfo', 'access_token'],
    data () {
        return {
            ImgElement: null,
            ImgLayersElement: null,
            LoadingElement: null,
            imgHeight: 400,
            imgWidth: 600,
            ipcInited: false,
            isLoading: true,
        }
    },
    methods: {
        Close: function() {
            this.$emit("closeImageOfMessage");
        },
        calcImgPosition: function() {
            if(this.ImgElement == null) {
                this.ImgElement = document.getElementById("imageLayersImage");
            }
            if(this.ImgLayersElement == null) {
                this.ImgLayersElement = document.getElementById("imageLayers");
            }
            var showScreenHeight = this.ImgLayersElement.offsetHeight;
            var showScreenWidth = this.ImgLayersElement.offsetWidth - 281;
            var left = 100;
            var top = 100;
            if(showScreenWidth > this.imgWidth) {
                left = (showScreenWidth - this.imgWidth) / 2;
            }
            else {
                left = showScreenWidth / 2;
            }
            if(showScreenHeight > this.imgHeight) {
                top = (showScreenHeight - this.imgHeight) / 2;
            }
            else {
                top = showScreenHeight / 2;
            }

            var ret = {
                "left": left,
                "top": top
            }

            return ret;
        },
        updateShowImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var needOpen = args[4];

            var msgContent = strMsgContentToJson(this.imgSrcInfo.message_content);
            var showfu = new FileUtil(localPath);
            let showfileObj = showfu.GetUploadfileobj();
            this.imgHeight = msgContent.imgHeight;
            this.imgWidth = msgContent.imgWidth;
            if(this.imgHeight > 400) {
                this.imgHeight = 400;
            }
            var showPosition = this.calcImgPosition();
            let reader = new FileReader();
            reader.readAsDataURL(showfileObj);
            reader.onloadend = () => {
                    this.isLoading = false;
                this.ImgElement.setAttribute("src", reader.result);
                this.ImgElement.setAttribute("height", this.imgHeight);
                // this.ImgElement.style.left = showPosition.left.toString() + "px";
                // this.ImgElement.style.top = showPosition.top.toString() + "px";
            }
        },
    },
    components: {
    },
    created: async function () {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
        await services.common.init();
        this.loginInfo = await services.common.GetLoginModel();
    },
    mounted: function() {
        setTimeout(() => {
            this.$nextTick(() => {
                this.ImgLayersElement = document.getElementById("imageLayers");
                this.ImgElement = document.getElementById("imageLayersImage");
            })
        }, 0)
    },
    watch: {
        imgSrcInfo: async function() {
            this.isLoading = true;
            if(this.ImgElement == null) {
                this.ImgElement = document.getElementById("imageLayersImage");
            }
            if(this.ImgLayersElement == null) {
                this.ImgLayersElement = document.getElementById("imageLayers");
            }
            if(this.imgSrcInfo == "") {
                return;
            }

            var msgContent = strMsgContentToJson(this.imgSrcInfo.message_content);
            var targetFileName = msgContent.fileName;
            var ext = path.extname(targetFileName);
            var localPath = "";
            
            // var targetPath = await services.common.GetFilePath(this.imgSrcInfo.message_id);
            // // console.log("target 1 = ", targetPath);
            // if(targetPath.length != 0) {
            //     targetPath = this.imgSrcInfo.file_local_path;
            // }
            // console.log("target 2 = ", targetPath);
            // if(targetPath.length == 0) {
            var targetDir = confservice.getThumbImagePath(this.imgSrcInfo.message_timestamp);
            var targetPath = path.join(targetDir, this.imgSrcInfo.message_id + ext);
            // }
            console.log("target 3 = ", targetPath);
            if(fs.existsSync(targetPath)) {
                // console.log("target exist = ", targetPath);
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                this.imgHeight = msgContent.imgHeight;
                this.imgWidth = msgContent.imgWidth;
                if(this.imgHeight > 400) {
                    this.imgHeight = 400;
                }
                var showPosition = this.calcImgPosition();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    this.isLoading = false;
                    this.ImgElement.setAttribute("src", reader.result);
                    this.ImgElement.setAttribute("height", this.imgHeight);
                    // this.ImgElement.style.left = showPosition.left.toString() + "px";
                    // this.ImgElement.style.top = showPosition.top.toString() + "px";
                }
            }
            if(fs.existsSync(localPath = await services.common.downloadMsgOTumbnail(this.imgSrcInfo.time_line_id, this.imgSrcInfo.message_timestamp, this.imgSrcInfo.message_id, false))) {
                // console.log("localPath is ", localPath);
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                this.imgHeight = msgContent.imgHeight;
                this.imgWidth = msgContent.imgWidth;
                if(this.imgHeight > 400) {
                    this.imgHeight = 400;
                }
                var showPosition = this.calcImgPosition();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    this.isLoading = false;
                    this.ImgElement.setAttribute("src", reader.result);
                    this.ImgElement.setAttribute("height", this.imgHeight);
                    // this.ImgElement.style.left = showPosition.left.toString() + "px";
                    // this.ImgElement.style.top = showPosition.top.toString() + "px";
                }
            }
            else {
                if(!this.ipcInited) {
                    ipcRenderer.on('updateShowImage', this.updateShowImage);
                    this.ipcInited = true;
                }
            }
            // if(fs.existsSync(this.imgSrcInfo.targetPath)){
            //     var msgContent = strMsgContentToJson(this.imgSrcInfo.message_content);
            //     var showfu = new FileUtil(this.imgSrcInfo.targetPath);
            //     let showfileObj = showfu.GetUploadfileobj();
            //     this.imgHeight = msgContent.imgHeight;
            //     this.imgWidth = msgContent.imgWidth;
            //     if(this.imgHeight > 400) {
            //         this.imgHeight = 400;
            //     }
            //     var showPosition = this.calcImgPosition();
            //     let reader = new FileReader();
            //     reader.readAsDataURL(showfileObj);
            //     reader.onloadend = () => {
            //         this.ImgElement.setAttribute("src", reader.result);
            //         this.ImgElement.setAttribute("height", this.imgHeight);
            //         this.ImgElement.style.left = showPosition.left.toString() + "px";
            //         this.ImgElement.style.top = showPosition.top.toString() + "px";
            //     }
            // }
            // else{
            //     var msgContent = strMsgContentToJson(this.imgSrcInfo.message_content);
            //     this.imgHeight = msgContent.imgHeight;
            //     this.imgWidth = msgContent.imgWidth;
            //     if(this.imgHeight > 400) {
            //         this.imgHeight = 400;
            //     }
            //     var showPosition = this.calcImgPosition();
            //     this.serverapi.downloadTumbnail(this.loginInfo.access_token, "T", this.imgSrcInfo.time_line_id)
            //         .then((ret) => {
            //             let reader = new FileReader();
            //             reader.readAsDataURL(ret.data);
            //             reader.onloadend = () => {
            //                 this.ImgElement.setAttribute("src", reader.result);
            //                 this.ImgElement.setAttribute("height", this.imgHeight);
            //                 this.ImgElement.style.left = showPosition.left.toString() + "px";
            //                 this.ImgElement.style.top = showPosition.top.toString() + "px";
            //             }
            //         })
            // }
        }
    }
}
</script>

<style lang="scss" scoped>
    .ImageLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 3;
        text-align: center;
        vertical-align: middle;
    }

    .el-icon-loading{
        position: absolute;
        // margin:0;
        // background: rgb(1, 1, 1);
        // border: none;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .image-layers-image {
        position: absolute;
        // margin:0;
        // background: rgb(1, 1, 1);
        // border: none;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .image-layers-buttons {
        position: absolute;
        top: 0px;
        left: 0px;
        margin:0;
        height: 56px;
        width: 100%;
        background: rgba(0, 0, 0, 0.6);
    }
    
    .el-icon-close {
        display: inline-block;
        float: right;
        height: 56px;
        width: 56px;
        line-height: 56px;
        color: white;
    }
    
    .el-icon-close:hover {
        display: inline-block;
        float: right;
        margin: 0;
        height: 56px;
        width: 56px;
        line-height: 56px;
        color: red;
    }
    
</style>
