<template>
    <div class="AlertLayers" id="AlertLayersId">
        <div class="AlertDlg" id="AlertDlgId">
            <div class="AlertContent">
                <div class="AlertContentAbstract">
                    <img class="AlertContentAbstraceIco" src="../../../static/Img/Setup/Alert.png">
                    <label class="AlertContentAbstraceContent">{{Abstrace}}</label>
                </div>
                <div class="AlertContentDetails">
                    <label class="AlertContentDetailsContent">{{Details}}</label>
                </div>
            </div>
            <div class="AlertFotter">
                <button class="AlertCancleButton" @click="Close()">取消</button>
                <button class="AlertConfirmButton" @click="ClearCache()">确认</button>
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
    name: 'AlertDlg',
    props: ['AlertContnts'],
    data () {
        return {
            Abstrace: '',
            Details: '',
            dlgWidth: 440,
            dlgHeight: 179,
        }
    },
    methods: {
        Close: function() {
            this.$emit("closeAlertDlg", "");
        },
        ClearCache: function() {
            this.$emit("clearCache", '');
        },
        calcImgPosition: function() {
            if(this.AlertDlgElement == null) {
                this.AlertDlgElement = document.getElementById("AlertDlgId");
            }
            if(this.AlertLayersElement == null) {
                this.AlertLayersElement = document.getElementById("AlertLayersId");
            }
            // console.log("remote.b")
            var showScreenHeight = this.AlertLayersElement.offsetHeight;
            var showScreenWidth = this.AlertLayersElement.offsetWidth;
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
        AlertContnts: async function() {
            if(this.AlertDlgElement == null) {
                this.AlertDlgElement = document.getElementById("AlertDlgId");
            }

            if(this.AlertLayersElement == null) {
                this.AlertLayersElement = document.getElementById("AlertLayersId");
            }

            this.Details = this.AlertContnts.Details;
            this.Abstrace = this.AlertContnts.Abstrace;

            console.log("Alertcontent is ", this.AlertContnts);
            console.log("Details is ", this.Details);
            console.log("Abstrace is ", this.Abstrace);
            
            var showPosition = this.calcImgPosition();
            console.log("showPositon is ", showPosition)
            this.AlertDlgElement.style.left = showPosition.left.toString() + "px";
            this.AlertDlgElement.style.top = showPosition.top.toString() + "px";
        }
    }
}
</script>

<style lang="scss" scoped>
    .AlertLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
    }

    .AlertDlg {
        position: absolute;
        width: 440px;
        height: 179px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .AlertContent {
        width: calc(100% - 64px);
        height: calc(100% - 104px);
        margin: 32px 32px 0 32px;
        border: 0px solid rgba(221, 221, 221, 1);
    }
    
    .AlertContentAbstract {
        display: block;
        width: 100%;
        height: 30px;
        margin: 0;
    }

    .AlertContentAbstraceIco {
        display: inline-block;
        width: 24px;
        height: 24px;
    }

    .AlertContentAbstraceContent {
        width: calc(100% - 40px);
        font-size: 16px;
        font-family: "Microsoft Yahei";
        vertical-align: top;
        margin-left: 16px;
    }

    .AlertContentDetails {
        display: block;
        width: 100%;
        height: 60px;
        margin: 12px 32px 0px 42px;
    }

    .AlertContentDetailsContent {
        width: 336px;
        font-size: 14px;
        font-family: "Microsoft Yahei";
        vertical-align: top;
    }

    .AlertferFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }

    .AlertConfirmButton {
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
 
    .AlertConfirmButton:hover {
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
    }
 
    .AlertCancleButton {
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
