<template>
    <div class="SendFileLayers" id="SendFileLayersId" >
        <div :style="dlgPosition" class="SendFileDlg" id="SendFileDlgId">
            <div class="SendFileHeader">
                <div class="SendFileHeaderTitle">{{ dialogTitle }}</div>
                <img ondragstart="return false" class="SendFileClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            <div class="ReceiverInfoDiv">
                <image class="ReceiverImage" id="ReceiverImageId" src="../../../static/Img/User/user-40px@2x.png">
                <p class="ReceiverName" id="ReceiverNameId">
                </p>
            </div>
            <div class="SendFileImageDiv">
                <img class="SendFileImage" id="SendFileImageId">
            </div>
            <div class="SendFileFotter">
                <button class="SendFileCancleButton" @click="closeDialog()">取消</button>
                <button class="SendFileConfirmButton" @click="SendFile()">发送</button>
            </div>
        </div>
    </div>
</template>

<script>
import {services, environment} from '../../packages/data/index.js'
import * as fs from 'fs-extra'
import {ipcRenderer, remote} from 'electron'
import confservice from '../../packages/data/conf_service';
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil, makeFlieNameForConflict, GetMimename, getIconPath } from '../../packages/core/Utils.js'
import * as path from 'path'
import {UserInfo, Group} from '../../packages/data/sqliteutil.js';
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
            default: {}
        }
    },
    data () {
        return {
            SendFileDlgElement: null,
            SendFileLayersElement: null,
            imgHeight: 468,
            imgWidth: 624,
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
        closeDialog() {
            this.display = false;
            this.$emit("closeSendFileDlg", "");
            
        },
        calcImgPosition: function() {
            var showScreenHeight = document.documentElement.clientHeight;
            var showScreenWidth = document.documentElement.clientWidth;
            var left = (showScreenWidth - this.imgWidth) / 2;
            var top = (showScreenHeight - this.imgHeight) / 2;
            var ret = {
                "left": left,
                "top": top
            }

            return ret;
        },
    },
    created() {
            var showPosition = this.calcImgPosition();
            this.dlgPosition.left = showPosition.left.toString() + "px";
            this.dlgPosition.top = showPosition.top.toString() + "px";
    },
    mounted: function() {
    },
    watch: {
        /**
         * {
         *  "path": '',
         *  "distGroupInfo": {},
         * }
         */
        sendInfos: function() {
            if(this.distGroupInfo.type == undefined) {
                return;
            }
            var distGroupElement = document.getElementById("ReceiverNameId");
            if(distGroupElement != undefined ) {
                distGroupElement.innerHTML = this.sendInfos.distGroupInfo.group_name;
            }
            
            var distGroupImageElement = document.getElementById("ReceiverImageId");
            var distId = '';
            if(this.sendInfos.distGroupInfo.group_id != undefined && this.sendInfos.distGroupInfo.group_id.length != 0) {
                distId = this.sendInfos.distGroupInfo.group_id;
            }
            else {
                distId = this.sendInfos.distGroupInfo.user_id;
            }
            if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.sendInfos.distGroupInfo.group_avarar, distId))){
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    if(distGroupImageElement != undefined ) {
                        distGroupImageElement.setAttribute("src", reader.result);
                    }
                }
            }
            
            var filePath = this.sendInfos.path;
            var showfuTmp = new FileUtil(filePath);
            var fileMime = showfuTmp.GetMimename();
            var fileExt = showfu.GetExtname();
            var sendFileImageElement = document.getElementById("SendFileImageId");

            if(sendFileImageElement != undefined) {
                if(fileMime.split('/')[0] == 'image') {
                    sendFileImageElement.setAttribute("src", filePath);
                }
                else {
                    var iconPath = getIconPath(fileExt);
                    sendFileImageElement.setAttribute("src", iconPath);
                }
            }

        }
    }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
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
        max-width: 624px;
        max-height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .SendFileHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .SendFileHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 2px;
    }

    .SendFileClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }

    .ReceiverInfoDiv {
        width: 560px;
        max-height: 40x;
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
        max-width: 100px;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 12px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        color: rgba(153, 153, 153, 1);
        letter-spacing:1px;
    }

    .SendFileImageDiv {
        width: 560px;
        max-height: 440x;
        border: 1px solid rgba(211, 211, 211, 1);
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
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
    }
 
    .SendFileConfirmButton:disabled{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(167, 224, 196, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
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
