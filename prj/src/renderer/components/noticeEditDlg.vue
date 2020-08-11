<template>
    <div class="NoticeLayers" id="NoticeLayersId">
        <div class="NoticeDlg" id="NoticeDlgId">
            <div class="NoticeHeader">
                <div class="NoticeHeaderTitle">群公告</div>
                <img class="NoticeClose" src="../../../static/Img/Chat/delete-20px@2x.png">
            </div>
            <div class="NoticeContent">
                <textarea class="NoticeTextArea" v-model="noticeContent" placeholder="输入群公告"></textarea>
            </div>
            <div class="NoticeFotter">
                <button class="NoticeCancleButton" @click="Close()">取消</button>
                <button class="NoticeConfirmButton" @click="UpdateNotice()">发布</button>
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import {APITransaction} from '../../packages/data/transaction.js'
import * as fs from 'fs-extra'
import {ipcRenderer, remote} from 'electron'
export default {
    name: 'NoticeLayers',
    props: ['noticeInfo'],
    data () {
        return {
            NoticeDlgElement: null,
            NoticeLayersElement: null,
            imgHeight: 408,
            imgWidth: 440,
            ipcInited: false,
            noticeContent: "",
            groupId: "",
        }
    },
    methods: {
        Close: function() {
            this.$emit("closeNoticeDlg", "");
        },
        UpdateNotice: function() {
            if(this.noticeContent.length == 0){
                alert("公告内容不能为空");
                return;
            }
            services.common.UpdateGroupNotice(this.groupId, this.noticeContent)
                .then((ret) => {
                    console.log("ret ", ret)
                    this.$emit("closeNoticeDlg", this.noticeContent);
                })
        },
        calcImgPosition: function() {
            if(this.NoticeDlgElement == null) {
                this.NoticeDlgElement = document.getElementById("NoticeDlgId");
            }
            if(this.NoticeLayersElement == null) {
                this.NoticeLayersElement = document.getElementById("NoticeLayersId");
            }
            // console.log("remote.b")
            var showScreenHeight = this.NoticeLayersElement.offsetHeight;
            var showScreenWidth = this.NoticeLayersElement.offsetWidth;
            console.log("showScreenHeight ", showScreenHeight)
            console.log("showScreenWidth ", showScreenWidth)
            var left = (showScreenWidth - this.imgWidth) / 2;
            var top = (showScreenHeight - this.imgHeight) / 2;

            console.log("left ", left)
            console.log("top ", top)
            var ret = {
                "left": left,
                "top": top
            }

            return ret;
        },
    },
    components: {
    },
    created: async function () {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
    },
    mounted: function() {
    },
    watch: {
        noticeInfo: async function() {
            if(this.NoticeDlgElement == null) {
                this.NoticeDlgElement = document.getElementById("NoticeDlgId");
            }
            if(this.NoticeLayersElement == null) {
                this.NoticeLayersElement = document.getElementById("NoticeLayersId");
            }
            if(this.noticeInfo == "") {
                return;
            }

            this.noticeContent = this.noticeInfo.originalNotice;
            this.groupId = this.noticeInfo.groupId; 

            var showPosition = this.calcImgPosition();
            this.NoticeDlgElement.style.left = showPosition.left.toString() + "px";
            this.NoticeDlgElement.style.top = showPosition.top.toString() + "px";
        }
    }
}
</script>

<style lang="scss" scoped>
    .NoticeLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
    }

    .NoticeDlg {
        position: absolute;
        width: 440px;
        height: 408px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .NoticeHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .NoticeHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
    }

    .NoticeClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }

    .NoticeContent {
        width: 100%;
        height: 280px;
        margin: 0;
    }

    .NoticeTextArea {
        width: calc(100% - 96px);
        height: calc(100% - 32px);
        background:rgba(255,255,255,1);
        border-radius:4px 0px 0px 4px;
        border:1px solid rgba(221,221,221,1);
        margin-left: 32px;
        margin-right: 32px;
        padding: 0px;
        font-size: 14px;
        text-indent: 4px;
        color: rgba(153, 153, 153, 1);
        letter-spacing:1px;
        font-weight:400;
        font-family:Microsoft Yahei;
        line-height:20px;
        padding: 16px;
    }

    .NoticeTextArea:focus {
        width: calc(100% - 96px);
        height: calc(100% - 32px);
        background:rgba(255,255,255,1);
        border-radius:4px 0px 0px 4px;
        border:1px solid rgba(221,221,221,1);
        margin-left: 32px;
        margin-right: 32px;
        padding: 0px;
        font-size: 14px;
        text-indent: 4px;
        color: rgba(153, 153, 153, 1);
        letter-spacing:1px;
        font-weight:400;
        font-family:Microsoft Yahei;
        line-height:20px;
        padding: 16px;
        outline: none;
    }

    .NoticeFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }

    .NoticeConfirmButton {
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
    }
 
    .NoticeCancleButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 110px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
    }
 
</style>
