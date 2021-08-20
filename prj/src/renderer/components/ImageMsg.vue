<template>
    <div class="chat-msg-image" v-on:click="ShowImage()">
        <img class="msg-image" :id="imageMsgId()" :src="imgIcon" alt="图片" :style="imgStyle" v-show="loadFinished">
        <div class="image-loading" id="loadingID" v-show="!loadFinished">
            <i class="el-icon-loading"></i>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { Message } from '../../packages/data/sqliteutil.js';
import convert from 'heic-convert';
import { getFileBlob } from '../../packages/core/Utils.js'
export default {
    name: 'ImageMsg',
    props: {
        Timeline: {
            type: Object,
            default: null
        },
    },
    data () {
        return {
            imgIcon: '',
            imgStyle: '',
            loadFinished: false,
        }
    },
    methods: {
        async getFileExist(id) {
            let msgs = await Message.FindMessageByMesssageID(id);
            console.log(msgs)
            if(msgs.length != 0 && msgs[0].file_local_path != "")
                return msgs[0].file_local_path;
            return '';
        },
        ShowImage: async function() {
            let distRoom = this.matrixClient.getRoom(this.Timeline.event.room_id);
            console.log("showImage the dist room is ", distRoom);
            var showImageInfoList = [];
            var distImageInfo = {};
            var imgMsgList = distRoom.timeline;
            imgMsgList.forEach(async curEvent => {
                let event = curEvent.event;
                let localPath = await this.getFileExist(event.event_id);
                let chatGroupMsgContent = curEvent.getContent();
            
                let maxSize = 480;
                var curUrl = this.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url);
    
                let info = {
                    w: maxSize,
                    h: maxSize
                };
                console.log("*** image info is ", chatGroupMsgContent.info);
                if(chatGroupMsgContent.info)
                    info = chatGroupMsgContent.info
                if(!info.h)
                    info.h = maxSize;
                if(!info.w)
                    info.w = maxSize;

                if(info.h < 320 || info.w < 334) {
                    info.h = parseInt(info.h * 1.5);
                    info.w = parseInt(info.w * 1.5);
                }

                var curImageInfo = {
                    imageUrl: curUrl,
                    localPath: localPath,
                    url: chatGroupMsgContent.url,
                    imageEventId: event.event_id,
                    info: info,
                    body: chatGroupMsgContent.body,
                    sender: curEvent.sender ? curEvent.sender.userId : curEvent.event.sender,
                    origin_server_ts: curEvent.event.origin_server_ts
                }

                if(this.Timeline.event.event_id == event.event_id) {
                    distImageInfo = {
                        imageUrl: curUrl,
                        localPath: localPath,
                        url: chatGroupMsgContent.url,
                        imageEventId: event.event_id,
                        info: info,
                        body: chatGroupMsgContent.body,
                        sender: curEvent.sender ? curEvent.sender.userId : curEvent.event.sender,
                        origin_server_ts: curEvent.event.origin_server_ts
                    }
                }
                showImageInfoList.unshift(curImageInfo);
            });

            if(!distImageInfo.imageUrl) {
                let event = this.Timeline.event;
                let localPath = await this.getFileExist(event.event_id);
                let chatGroupMsgContent = event.content;
                
                let maxSize = 390;
                var curUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url);
    
                let info = {
                    w: maxSize,
                    h: maxSize
                };
                console.log("*** image info is ", chatGroupMsgContent.info);
                if(chatGroupMsgContent.info)
                    info = chatGroupMsgContent.info
                if(!info.h)
                    info.h = maxSize;
                if(!info.w)
                    info.w = maxSize;
                
                if(info.h < 320 || info.w < 334) {
                    info.h = parseInt(info.h * 1.5);
                    info.w = parseInt(info.w * 1.5);
                }

                distImageInfo = {
                    imageUrl: curUrl,
                    localPath: localPath,
                    url: chatGroupMsgContent.url,
                    imageEventId: event.event_id,
                    info: info,
                    body: chatGroupMsgContent.body,
                    sender: (this.Timeline.sender && this.Timeline.sender.userId) ? this.Timeline.sender.userId : this.Timeline.event.sender,
                    origin_server_ts: this.Timeline.event.origin_server_ts
                }
            }
            ipcRenderer.send('showImageViewWindow', showImageInfoList, distImageInfo);
        },
        imageMsgId: function() {
            if(!this.Timeline) return "";
            return "message-image-" + this.Timeline.event.event_id;
        },
        getMsgImgIcon: function() {
            if(!this.Timeline) return "";
            let distUrl = "";
            if(this.isShowThumbnail()) {
                console.log("=========this.Timeline.event.content.info ", this.Timeline.event.content.info);
                let content = this.Timeline.event.content;
                if(content.info.mimetype && content.info.mimetype == "image/heic") {
                    console.log("is heic");
                    getFileBlob(content.info, this.matrixClient.mxcUrlToHttp(content.url))
                        .then((blob) => {
                            let reader = new FileReader();
                            reader.onload = async () => {
                                if(reader.readyState == 2) {
                                    try{
                                        console.log("+++++start convert ")
                                        var buffer = new Buffer(reader.result);
                                        const outputBuffer = await convert({
                                            buffer: buffer,
                                            format: 'PNG'
                                        });
                                        let imageDom = document.getElementById(this.imageMsgId());
                                        console.log("+++++convert finished", imageDom);
                                        if(imageDom) {
                                            let bytes = new Uint8Array(outputBuffer);
                                            let storeData = "";
                                            let len = bytes.byteLength;
                                            for (let i = 0; i < len; i++) {
                                                storeData += String.fromCharCode(bytes[i]);
                                            }
                                            imageDom.src = "data:image/png;base64," + window.btoa(storeData);
                                            this.loadFinished = true;
                                        }
                                    }
                                    catch(error) {
                                        console.log("convert error ", error);
                                    }
                                }
                            }
                            reader.readAsArrayBuffer(blob);
                        })
                }
                else {
                    distUrl = this.Timeline.event.content.info.thumbnail_url;
                }
            }
            else {
                let content = this.Timeline.event.content;
                if(content.body.indexOf('.heic') >= 0) {
                    console.log("is heic");
                    getFileBlob(content.info, this.matrixClient.mxcUrlToHttp(content.url))
                        .then((blob) => {
                            let reader = new FileReader();
                            reader.onload = async () => {
                                if(reader.readyState == 2) {
                                    try{
                                        console.log("+++++start convert ")
                                        var buffer = new Buffer(reader.result);
                                        const outputBuffer = await convert({
                                            buffer: buffer,
                                            format: 'JPEG',
                                            quality: 1
                                        });
                                        let imageDom = document.getElementById(this.imageMsgId());
                                        console.log("+++++convert finished", imageDom);
                                        if(imageDom) {
                                            let bytes = new Uint8Array(outputBuffer);
                                            let storeData = "";
                                            let len = bytes.byteLength;
                                            for (let i = 0; i < len; i++) {
                                                storeData += String.fromCharCode(bytes[i]);
                                            }
                                            imageDom.src = "data:image/png;base64," + window.btoa(storeData);
                                            this.loadFinished = true;
                                        }
                                    }
                                    catch(error) {
                                        console.log("convert error ", error);
                                    }
                                }
                            }
                            reader.readAsArrayBuffer(blob);
                        })
                }
                else {
                    distUrl = this.Timeline.event.content.url;
                }
            }
            if(!distUrl.startsWith('blob:') && distUrl != "") {
                let iconPath = this.matrixClient.mxcUrlToHttp(this.Timeline.event.content.url);
                distUrl = iconPath;
            }
            console.log("event_id path",this.Timeline.event.event_id, distUrl)
            return distUrl;
        },
        getImageStyle: function() {
            if(!this.Timeline) return "";
            var chatGroupMsgContent = this.Timeline.event.content ? this.Timeline.event.content : this.Timeline.getContent();
            let maxSize = 400;
            let distUrl = "";
            if(this.isShowThumbnail()) {
                distUrl = chatGroupMsgContent.info.thumbnail_url;
            }
            else {
                distUrl = chatGroupMsgContent.info.url;
            }
            
            let showWidth = maxSize;
            let showHeight = maxSize;

            if((!chatGroupMsgContent.info.h || !chatGroupMsgContent.info.w) && this.Timeline.event.content.url) {
                var img = new Image();
                img.onload = () => {
                    this.imgWidth = img.width;
                    this.imgHeight = img.height;

                    showWidth = img.width;
                    showHeight = img.height;

                    let style = "";
                    let max = Math.max(img.width, img.height);
                    if(max > maxSize ){
                        if(img.width > img.height){
                            showHeight = img.height/(img.width/maxSize);
                            showWidth = maxSize;
                        }
                        else{
                            showWidth = img.width/(img.height/maxSize)
                            showHeight = maxSize;
                        }
                    }
                    style += "width:" + showWidth + "px";
                    style += ";"
                    style += "height:" + showHeight + "px";
                    let loadingElement = document.getElementById("loadingID");
                    if(loadingElement) {
                        loadingElement.style.margin = parseInt(showHeight/2) + "px " + parseInt(showWidth/2) + "px " + parseInt(showHeight/2) + "px " + parseInt(showWidth/2) + "px ";
                    }
                    console.log("*** from image is ", style);
                    return style;
                }
                img.onerror = () => {
                    showWidth = this.imgWidth;
                    showHeight = this.imgHeight;

                    let style = "";
                    let max = Math.max(img.width, img.height);
                    if(max > maxSize ){
                        if(img.width > img.height){
                            showHeight = img.height/(img.width/maxSize);
                            showWidth = maxSize;
                        }
                        else{
                            showWidth = img.width/(img.height/maxSize)
                            showHeight = maxSize;
                        }
                    }
                    style += "width:" + showWidth + "px";
                    style += ";"
                    style += "height:" + showHeight + "px";
                    console.log("*** from image is ", style);
                    return style;
                }
                img.src = distUrl;
            }
            else {
                if(chatGroupMsgContent.info) {
                    if(!chatGroupMsgContent.info.h)
                        chatGroupMsgContent.info.h = this.imgHeight;
                    if(!chatGroupMsgContent.info.w)
                        chatGroupMsgContent.info.w = this.imgWidth;
                    showWidth = chatGroupMsgContent.info.w;
                    showHeight = chatGroupMsgContent.info.h;
                }

                let style = "";
                let max = Math.max(chatGroupMsgContent.info.w, chatGroupMsgContent.info.h);
                if(max > maxSize ){
                    if(chatGroupMsgContent.info.w > chatGroupMsgContent.info.h){
                        showHeight = chatGroupMsgContent.info.h/(chatGroupMsgContent.info.w/maxSize);
                        showWidth = maxSize;
                    }
                    else{
                        showWidth = chatGroupMsgContent.info.w/(chatGroupMsgContent.info.h/maxSize)
                        showHeight = maxSize;
                    }
                }
                style += "width:" + showWidth + "px";
                style += ";"
                style += "height:" + showHeight + "px";
                console.log("*** from info is ", style);
                return style;
            }
        },
        isShowThumbnail: function(){
            if(!this.Timeline) return false;
            var chatGroupMsgContent = this.Timeline.event.content ? this.Timeline.event.content : this.Timeline.getContent();
            if(chatGroupMsgContent.info && Math.min(chatGroupMsgContent.info.w, chatGroupMsgContent.info.h) > 400 && chatGroupMsgContent.info.thumbnail_info && chatGroupMsgContent.info.thumbnail_url && chatGroupMsgContent.info.thumbnail_info.w && chatGroupMsgContent.info.thumbnail_info.h) {
                return true;
            }
            else {
                return false;
            }
        },
    },
    watch: {
        Timeline: async function() {
            if(!this.Timeline) return;
            setTimeout(() => {
                this.$nextTick(() => {
                    this.imgIcon = this.getMsgImgIcon();
                    this.imgStyle = this.getImageStyle();
                    if(this.imgIcon != "") {
                        this.loadFinished = true;
                    }
                })
            }, 0);
        }
    },
    created: function() {
        this.matrixClient = window.mxMatrixClientPeg.matrixClient;
    },
}
</script>

<style lang="scss" scoped>
    .chat-msg-image {
        float:right;
        background-color: rgba(1,1,1,0);
        border-radius: 5px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
        -webkit-user-select:none;
    }
    
    .msg-image {
        height: 400px;
        border: 1px solid #dddddd;
    }

    .image-loading {
        margin: 200px 200px 200px 200px;
        text-align: center;
    }
</style>