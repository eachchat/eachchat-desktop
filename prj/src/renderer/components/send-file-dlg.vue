<template>
    <div class="SendFileLayers" id="SendFileLayersId" >
        <div :style="dlgPosition" class="SendFileDlg" id="SendFileDlgId">
            <div class="SendFileHeader">
                <div class="SendFileHeaderTitle">发送给：</div>
                <img ondragstart="return false" class="SendFileClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            <div class="ReceiverInfoDiv">
                <img class="ReceiverImage" id="ReceiverImageId" src="../../../static/Img/User/user-40px@2x.png">
                <p class="ReceiverName" id="ReceiverNameId">{{getDistName()}}</p>
            </div>
            <div class="SendFileImageDiv">
                <ul class="SendFileList" id="SendFileListId">
                    <li v-for="item in sendInfos.paths"
                        class="SendFileItem"> <!-- <listItem @groupInfo="chatGroupItem"/> -->
                        <div class="SendFileImgDiv">
                            <img class="SendFileImg" :src="getFilePath(item)"/>
                        </div>
                        <div class="SendFileInfo" @keydown="keyHandle($event)">
                            <p class="SendFileName" >{{getSendFileName(item)}}</p>
                            <p class="SendFileSize">{{getSendFileSize(item)}}</p>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="SendFileFotter"  @keydown="tmpkeyHandle($event)">
                <button class="SendFileCancleButton" @click="closeDialog()">取消</button>
                <button class="SendFileConfirmButton" autofocus='autofocus' @click="SendFile()">发送</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { FilenameToContentType, getIconPath, getFileSizeByNumber } from '../../packages/core/Utils.js'
import * as path from 'path'
export default {
    name: 'SendFileDlg',
    props: {
        sendInfos: {
            /**
             * {
             *  "type": "file/image",
             *  "path": '',
             *  "distGroupName": '',
             *  "distGroupImage": '', 
             * }
             */
            type: Object,
            default: {
                paths: [],
                distGroupInfo: {}
            }
        }
    },
    data () {
        return {
            SendFileDlgElement: null,
            SendFileLayersElement: null,
            imgHeight: 220,
            imgWidth: 436,
            ipcInited: false,
            SendFileContent: "",
            groupId: "",
            dlgPosition:{},
            selectedGroups: [],

            curUserInfo: undefined,
            rootDepartments:[],
            chatCreaterDisableUsers:[],

            searchKey:'',
            showSearchView: false,
            searchGroup: [],
        }
    },
    methods: {
        tmpkeyHandle(event){
            console.log("senfile ", event)
        },

        getDistName() {
            if(this.sendInfos.distGroupInfo != undefined && this.sendInfos.distGroupInfo.group_name != undefined){
                return this.sendInfos.distGroupInfo.name.substring(0, 20);
            }
            else {
                return "";
            }
        },
        getFilePath(item) {
            var imgPath = './static/Img/Chat/unknown@2x.png';
            var theType = FilenameToContentType(path.basename(item.name));

            if(theType == 'm.image') {
                imgPath = item.path;
            }
            else {
                imgPath = getIconPath(path.extname(item.name));
            }
            return imgPath;
        },
        getSendFileName(item) {
            return item.name;
        },
        getSendFileSize(item) {
            return getFileSizeByNumber(item.size);
        },
        closeDialog() {
            this.$emit("closeSendFileDlg");
        },
        SendFile() {
            var distFiles = this.sendInfos.paths;
            console.log("var dist files is ", distFiles)
            this.$emit("SendFiles", distFiles);
        },
        calcImgPosition: function() {
            var showScreenHeight = document.documentElement.clientHeight;
            var showScreenWidth = document.documentElement.clientWidth;
            var dlgElement = document.getElementById("SendFileDlgId");
            console.log("dlgElement.clientWidth ", dlgElement.clientWidth);
            console.log("dlgElement.clientHeight ", dlgElement.clientHeight);
            var left = (showScreenWidth - dlgElement.clientWidth) / 2;
            var top = (showScreenHeight - dlgElement.clientHeight) / 2;
            var ret = {
                "left": left,
                "top": top
            }

            return ret;
        },
    },
    created() {
    },
    mounted: function() {
    },
    watch: {
        /**
         * {
         *  "paths": [''],
         *  "distGroupInfo": {},
         * }
         */
        sendInfos: async function() {
            console.log("this.sendInfos is ", this.sendInfos)
            console.log("this.sendInfos distGroupInfo is ", this.sendInfos['distGroupInfo'])
            if(this.sendInfos['distGroupInfo'] == undefined) {
                console.log("aaa return ")
                return;
            }

            var distGroupImageElement = document.getElementById("ReceiverImageId");
            var distId = this.sendInfos.distGroupInfo.roomId;
            var targetPath = '';

            var distUrl = global.mxMatrixClientPeg.getRoomAvatar(this.sendInfos.distGroupInfo);
            
            if(!distUrl || distUrl == '') {
                if(global.mxMatrixClientPeg.DMCheck(this.sendInfos.distGroupInfo))
                    distUrl = "./static/Img/User/user-40px@2x.png";
                else
                    distUrl = "./static/Img/User/group-40px@2x.png";
                if(distGroupImageElement) {
                    distGroupImageElement.setAttribute("src", this.distUrl); 
                }
            }
            if(distGroupImageElement != undefined && distUrl) {
              distGroupImageElement.setAttribute("src", distUrl);
            }

            var distGroupNameElement = document.getElementById("ReceiverNameId");
            var distName = this.sendInfos.distGroupInfo.name;
            if(distGroupNameElement != undefined) {
                distGroupNameElement.innerHTML = distName;
            }

            this.$nextTick(() => {
                var showPosition = this.calcImgPosition();
                var dlgElement = document.getElementById("SendFileDlgId");
                dlgElement.style.left = showPosition.left.toString() + "px";
                dlgElement.style.top = showPosition.top.toString() + "px";
            })
            // this.dlgPosition.left = showPosition.left.toString() + "px";
            // this.dlgPosition.top = showPosition.top.toString() + "px";
            // console.log("showPositoin is ", this.dlgPosition)
            
            // var filePaths = this.sendInfos.paths;
            // var showfuTmp = new FileUtil(filePath);
            // var fileMime = showfuTmp.GetMimename();
            // var fileExt = showfu.GetExtname();
            // var sendFileImageElement = document.getElementById("SendFileImageId");

            // if(sendFileImageElement != undefined) {
            //     if(fileMime.split('/')[0] == 'image') {
            //         sendFileImageElement.setAttribute("src", filePath);
            //     }
            //     else {
            //         var iconPath = getIconPath(fileExt);
            //         sendFileImageElement.setAttribute("src", iconPath);
            //     }
            // }

        }
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar {
    
    display: none;
    }
    .SendFileLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 3;
    }

    .SendFileDlg {
        position: absolute;
        max-width: 436px;
        max-height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .SendFileHeader {
        width: 100%;
        height: 46px;
        background: rgba(255, 255, 255, 1);
    }

    .SendFileHeaderTitle {
        width: calc(100% - 68px);
        height: 46px;
        line-height: 46px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
    }

    .SendFileClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }

    .ReceiverInfoDiv {
        width: 400px;
        height: 40px;
        margin-left: 32px;
    }
    
    .ReceiverImage {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius:4px;
        border: 0px solid rgba(0, 0, 0, 0);
    }

    .ReceiverName {
        display: inline-block;
        height: 32px;
        line-height: 32px;
        margin:0px 0px 0px 8px;
        width: 300px;
        font-size: 12px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        color: rgba(153, 153, 153, 1);
        letter-spacing: 0px;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: top;
    }

    .SendFileImageDiv {
        width: 370px;
        border: 1px solid rgba(211, 211, 211, 1);
        margin: 0px 32px 0px 32px;
    }
    
    .SendFileList {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        max-height: 310px;
        overflow: scroll;
    }

    .SendFileItem {
        height: 60px;
        margin-left: 16px;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        font-size: 0px;
        box-sizing: border-box;
    }

    .SendFileImgDiv {
        position:relative;
        width: 40px;
        height: 40px;
        display: inline-block;
        margin-left: 0px;
        margin-top: 10px;
        margin-right: 0px;
        margin-bottom: 10px;
    }

    .SendFileImg {
        position: absolute;
        right: 0px;
        top: 0px;
        width: 40px;
        height: 40px;
        margin-left: 16px;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        border-radius:4px;
        // z-index:-1;
    }
  
    .SendFileInfo {
        display: inline-block;
        height: 100%;
        width: calc(100% - 130px);
        margin-left: 12px;
    }

    .SendFileName {
        width: 100%;
        height: 20px;
        font-size: 14px;
        font-weight: 500;
        font-family:PingFangSC-Medium;
        color: rgba(0, 0, 0, 1);
        overflow: hidden;
        margin-left: 0px;
        margin-top: 10px;
        margin-right: 0px;
        margin-bottom: 0px;
        white-space: nowrap;
        text-overflow: ellipsis;
        letter-spacing: 0px;
    }

    .SendFileSize {
        width: 100%;
        font-size: 13px;
        font-weight:400;
        color: rgba(153, 153, 153, 1);
        overflow: hidden;
        font-family:PingFangSC-Regular;
        margin-left: 0px;
        margin-top: 2px;
        margin-right: 0px;
        margin-bottom: 10px;
        white-space: nowrap;
        text-overflow: ellipsis;
        height: 18px;
        letter-spacing: 0px;
    }

    .SendFileImage {
        max-width: 560px;
        max-height: 440px;
    }
    
    .SendFileFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }
    .SendFileConfirmButton{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        border: none;
    }
 
    .SendFileConfirmButton:disabled{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(167, 224, 196, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        border: none;
    }
 
    .SendFileCancleButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 110px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
        font-weight: 400;
    }
</style>
