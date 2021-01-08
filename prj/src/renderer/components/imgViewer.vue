<template>
    <div class="imageViewerPage">
        <div class="windowHeader">
            <mac-window-header class="macWindowHeader" @Close="Close()" @Min="Min()" @Max="Max()" :showMax="false"></mac-window-header>
            <winHeaderBar @Close="Close()" @Min="Min()" @Max="Max()" :showMax="false"></winHeaderBar>
        </div>
        <i class="el-icon-loading" v-show="this.curImage.imageUrl == undefined"></i>
        <img class="imageViewerStage" id="imageViewerStageId" @contextmenu="rightClick($event)" @mousewheel="zoomimg($event)" v-show="this.curImage.imageUrl != undefined">
    </div>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import confservice from '../../packages/data/conf_service'
// import { ImageDrop } from 'quill-image-drop-module'
import { getFileBlob} from '../../packages/core/Utils.js'
import {ipcRenderer, remote} from 'electron'
import * as Matrix from 'matrix-js-sdk';
import {ComponentUtil} from '../script/component-util';
import macWindowHeader from './macWindowHeader.vue';
import winHeaderBar from './win-header-login.vue';
import { windowsStore } from 'process'

const {Menu, MenuItem, nativeImage} = remote;

export default {
    name: 'imageViewer',
    components:{
        macWindowHeader,
        winHeaderBar,
    },
    methods: {
        zoomimg: function(event) {
            var delta = 0;
            if (!event) event = window.event;
            if(event.wheelDelta) {
                delta = event.wheelDelta / 120;
            }
            if(delta > 0) {
                if(this.curMultiple < this.curMultiple * 2) {
                    this.curMultiple += 0.1;
                }
            }
            else {
                if(this.curMultiple > this.curMultiple / 2) {
                    this.curMultiple -= 0.1;
                }
            }
            let style = "";
            style += "width:" + this.curImage.info.w * this.curMultiple + "px";
            style += ";"
            style += "height:" + this.curImage.info.h * this.curMultiple + "px";
            this.stageElement.setAttribute("style", style);
        },
        Close: function() {
            this.curImage = {};
            ipcRenderer.send("image-win-close");
        },
        Min: function() {
            ipcRenderer.send("image-win-min");
        },
        Max: function() {
            ipcRenderer.send("image-win-max");
        },
        isDeleted: function(msgItem) {
            return msgItem.isRedacted() || msgItem.getType() == "m.room.redaction";
        },
        showRight() {
            this.curMultiple = 1;
            if(this.stageElement == undefined) {
                this.stageElement = document.getElementById("imageViewerStageId");
            }
            var curIndex = -1;
            for(var i=0;i<this.ImageInfos.length;i++) {
                if(this.ImageInfos[i].imageEventId == this.curImage.imageEventId) {
                    curIndex = i;
                    break;
                }
            }
            console.log("*** showRight curIndex is ", curIndex);
            if(curIndex > 0) {
                curIndex = curIndex - 1;
                this.curImage = this.ImageInfos[curIndex];
                let style = "";
                style += "width:" + this.curImage.info.w + "px";
                style += ";"
                style += "height:" + this.curImage.info.h + "px";
                this.updateWindowSize(this.curImage.info);
                this.stageElement.setAttribute("style", style);
                this.stageElement.setAttribute("src", this.curImage.imageUrl);
            }
        },
        showLeft() {
            this.curMultiple = 1;
            if(this.stageElement == undefined) {
                this.stageElement = document.getElementById("imageViewerStageId");
            }
            var curIndex = -1;
            for(var i=0;i<this.ImageInfos.length;i++) {
                if(this.ImageInfos[i].imageEventId == this.curImage.imageEventId) {
                    curIndex = i;
                    break;
                }
            }
            console.log("*** showLeft curIndex is ", curIndex);
            if(curIndex < this.ImageInfos.length - 1) {
                curIndex = curIndex + 1;
                this.curImage = this.ImageInfos[curIndex];
                let style = "";
                style += "width:" + this.curImage.info.w + "px";
                style += ";"
                style += "height:" + this.curImage.info.h + "px";
                this.updateWindowSize(this.curImage.info);
                this.stageElement.setAttribute("style", style);
                this.stageElement.setAttribute("src", this.curImage.imageUrl);
            }
        },
        updateWindowSize(sizeInfo) {
            console.log("*** send updageAssistWindowSize ", sizeInfo);
            ipcRenderer.send("updageAssistWindowSize", sizeInfo);
        },
        keyHandle(event) {
            console.log("*** keyHandle ", event);
            if(event.code == "Enter" && !event.ctrlKey) {

            }
            else if(event.code == "Escape") {

            }
            else if(event.code == "ArrowRight") {
                this.showRight();
            }
            else if(event.code == "ArrowLeft"){
                this.showLeft();
            }
        },
        rightClick(e) {
            this.menu = new Menu();
            this.menu.append(new MenuItem({
                label: "另存为",
                click: () => {
                    this.downloadFile()
                }
            }));
            this.menu.append(new MenuItem({ 
                type: 'separator' 
            }));
            this.menu.append(new MenuItem({
                label: "转发",
                click: () => {
                    this.transMit()
                }
            }));
            this.menu.append(new MenuItem({
                label: "收藏",
                click: () => {
                    this.menuFav()
                }
            }));

            this.menu.popup(remote.getCurrentWindow());
        },
        async transMit() {
            console.log("*** transmit image is ", this.curImage);
            ipcRenderer.send("imageViewerTransmit", this.curImage);
        },
        async menuFav() {
            console.log("*** menuFav image is ", this.curImage);
            ipcRenderer.send("imageViewerFav", this.curImage);
        },
        downloadFile(){
            var self = this;
            console.log("*** downloadFile image body is ", this.curImage.body);
            getFileBlob(this.curImage.info, this.curImage.imageUrl)
                .then((blob) => {
                    let reader = new FileReader();
                    reader.onload = function() {
                        if(reader.readyState == 2) {
                            let a = document.createElement('a');
                            a.href = window.URL.createObjectURL(blob);
                            a.download = self.curImage.body;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                    }
                    reader.readAsArrayBuffer(blob);
                })
        },
    },
    data() {
        return {
            ImageInfos: [],
            curImage: {},
            stageElement: undefined,
            curMultiple: 1,
        }
    },
    mounted: function() {
        const ipcRenderer = require('electron').ipcRenderer;
        ipcRenderer.on("timelines", (event, imageInfos, distImageInfo) => {
            this.curImage = {};
            this.curImage = distImageInfo;
            this.curMultiple = 1;
            console.log("mounted cur Image is ", this.curImage);
            this.ImageInfos = imageInfos;
            this.stageElement = document.getElementById("imageViewerStageId");
            let style = "";
            style += "width:" + this.curImage.info.w + "px";
            style += ";"
            style += "height:" + this.curImage.info.h + "px";
            this.updateWindowSize(this.curImage.info);
            this.stageElement.setAttribute("style", style);
            this.stageElement.setAttribute("src", this.curImage.imageUrl);
        });
        window.addEventListener('keydown', this.keyHandle);
    },
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar-track-piece {
        background-color: #F1F1F1;
        border-radius: 10px;
    }

    ::-webkit-scrollbar {
        width: 7px;
        height: 12px;
    }

    ::-webkit-scrollbar-thumb {
        height: 50px;
        background-color: #C1C1C1;
        border-radius: 10px;
        outline: none;
    }

    ::-webkit-scrollbar-thumb:hover {
        height: 50px;
        background-color: #A8A8A8;
        border-radius: 10px;
    }
    
    // .complex {
    //     display: inline-block;
    //     border-radius: 5px;
    //     border: 1px solid rgb(218,218,221);
    //     width: 200px;
    //     height: 46px;
    //     background-repeat: no-repeat;
    //     background-image: url("/static/Img/Chat/doc@2x.png");
    //     background-size: contain;
    //     line-height: 46px;
    // }
    
    .windowHeader{
        padding: 0px;
        margin: 0px;
        height: 24px;
        width: 100%; 
        background-color: rgba(255, 255, 255, 1);
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }
    .macWindowHeader {
        padding: 0px;
        margin: 0px;
        width: 64px;
    }

    .imageViewerPage {
        width: 100%;
        height: 100%;
        background: rgba(241, 241, 241, 1);
    }

    .imageViewerStage {
        margin: 8px 8px 8px 8px;
    }
</style>