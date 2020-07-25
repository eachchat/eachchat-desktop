<template>
    <div class="AnnouncementLayers" id="AnnouncementLayersId">
        <div class="AnnouncementDlg" id="AnnouncementDlgId">
            <div class="AnnouncementHeader">
                <div class="AnnouncementHeaderTitle">{{ dialogTitle }}</div>
                <img class="AnnouncementClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            
            <div class="AnnouncementContent">
                <div class="AnnouncementContentDetails">
                    <label class="AnnouncementContentDetailsContent" v-html="AnnouncementContnts"></label>
                </div>
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
    name: 'AnnouncementDlg',
    props: ['AnnouncementContnts', 'dialogTitle'],
    data () {
        return {
            Abstrace: '',
            Details: '',
            dlgWidth: 624,
            dlgHeight: 468,
        }
    },
    methods: {
        closeDialog: function() {
            this.$emit("closeAnnouncementDlg", "");
        },
        ClearCache: function() {
            this.$emit("clearCache", '');
        },
        calcImgPosition: function() {
            if(this.AnnouncementDlgElement == null) {
                this.AnnouncementDlgElement = document.getElementById("AnnouncementDlgId");
            }
            if(this.AnnouncementLayersElement == null) {
                this.AnnouncementLayersElement = document.getElementById("AnnouncementLayersId");
            }
            // console.log("remote.b")
            var showScreenHeight = this.AnnouncementLayersElement.offsetHeight;
            var showScreenWidth = this.AnnouncementLayersElement.offsetWidth;
            console.log("showScreenHeight ", showScreenHeight)
            console.log("showScreenWidth ", showScreenWidth)
            var left = (showScreenWidth - this.dlgWidth) / 2;
            var top = (showScreenHeight - this.dlgHeight) / 2;

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
        AnnouncementContnts: async function() {
            if(this.AnnouncementDlgElement == null) {
                this.AnnouncementDlgElement = document.getElementById("AnnouncementDlgId");
            }

            if(this.AnnouncementLayersElement == null) {
                this.AnnouncementLayersElement = document.getElementById("AnnouncementLayersId");
            }
            console.log("Announcementcontent is ", this.AnnouncementContnts);
            
            var showPosition = this.calcImgPosition();
            this.AnnouncementDlgElement.style.left = showPosition.left.toString() + "px";
            this.AnnouncementDlgElement.style.top = showPosition.top.toString() + "px";
        }
    }
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
    
    .AnnouncementLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 60;
    }

    .AnnouncementDlg {
        position: absolute;
        width: 624px;
        height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .AnnouncementHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .AnnouncementHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
    }

    .AnnouncementClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }
    .AnnouncementContent {
        width: calc(100% - 64px);
        height: calc(100% - 104px);
        margin: 0px 32px 0 32px;
        border: 0px solid rgba(221, 221, 221, 1);
    }
    
    .AnnouncementContentDetails {
        display: block;
        width: 100%;
        height: 340px;
        margin: 0px;
        overflow-y: scroll;
    }

    .AnnouncementContentDetailsContent {
        width: 336px;
        height: 340px;
        font-size: 14px;
        font-family: "Microsoft Yahei";
        vertical-align: top;
    }

</style>
