<template>
    <div class="UpgradeLayers" id="UpgradeLayersId">
        <div class="UpgradeDlg" id="UpgradeDlgId">
            <div class="UpgradeContent">
                <div class="UpgradeContentAbstract">
                    <img class="UpgradeContentAbstraceIco" src="../../../static/Img/Setup/Alert@2x.png">
                    <label class="UpgradeContentAbstraceContent">{{Abstrace}}</label>
                </div>
                <div class="UpgradeContentDetails">
                    <label class="UpgradeContentDetailsContent">{{Details}}</label>
                </div>
            </div>
            <div class="UpgradeFotter">
                <button class="UpgradeCancleButton" @click="Close()" v-show="canCancel">取消</button>
                <button class="UpgradeConfirmButton" @click="Cancle()">升级</button>
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
    name: 'UpgradeDlg',
    props: {
        upgradeInfo: {
            type: Object,
            default: {
            }
        },
        canCancel: {
            type: Boolean,
            default: true
        },
    },
    data () {
        return {
            Abstrace: '',
            Details: '',
            dlgWidth: 440,
            dlgHeight: 179,
            canCancel: true,
        }
    },
    methods: {
        Close: function() {
            services.common.downloadUpgradeFile(this.upgradeInfo.downloadUrl, this.upgradeInfo.verName);
            // this.$emit("closeUpgradeDlg", "");
        },
        Cancle: function() {
            this.$emit("closeUpgradeDlg", '');
        },
        calcImgPosition: function() {
            if(this.UpgradeDlgElement == null) {
                this.UpgradeDlgElement = document.getElementById("UpgradeDlgId");
            }
            if(this.UpgradeLayersElement == null) {
                this.UpgradeLayersElement = document.getElementById("UpgradeLayersId");
            }
            // console.log("remote.b")
            var showScreenHeight = this.UpgradeLayersElement.offsetHeight;
            var showScreenWidth = this.UpgradeLayersElement.offsetWidth;
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
        upgradeInfo: async function() {
            if(this.upgradeInfo.downloadUrl == undefined) {
                return;
            }
            if(this.UpgradeDlgElement == null) {
                this.UpgradeDlgElement = document.getElementById("UpgradeDlgId");
            }

            if(this.UpgradeLayersElement == null) {
                this.UpgradeLayersElement = document.getElementById("UpgradeLayersId");
            }

            this.Details = this.upgradeInfo.description;
            this.Abstrace = "提示";

            var showPosition = this.calcImgPosition();
            console.log("showPositon is ", showPosition)
            this.UpgradeDlgElement.style.left = showPosition.left.toString() + "px";
            this.UpgradeDlgElement.style.top = showPosition.top.toString() + "px";
        }
    }
}
</script>

<style lang="scss" scoped>
    .UpgradeLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
    }

    .UpgradeDlg {
        position: absolute;
        width: 440px;
        height: 179px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .UpgradeContent {
        width: calc(100% - 64px);
        height: calc(100% - 104px);
        margin: 32px 32px 0 32px;
        border: 0px solid rgba(221, 221, 221, 1);
    }
    
    .UpgradeContentAbstract {
        display: block;
        width: 100%;
        height: 30px;
        margin: 0;
    }

    .UpgradeContentAbstraceIco {
        display: inline-block;
        width: 24px;
        height: 24px;
    }

    .UpgradeContentAbstraceContent {
        width: calc(100% - 40px);
        font-size: 16px;
        font-family: "Microsoft Yahei";
        vertical-align: top;
        margin-left: 16px;
    }

    .UpgradeContentDetails {
        display: block;
        width: 100%;
        height: 60px;
        margin: 12px 32px 0px 42px;
    }

    .UpgradeContentDetailsContent {
        width: 336px;
        font-size: 14px;
        font-family: "Microsoft Yahei";
        vertical-align: top;
    }

    .UpgradeferFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }

    .UpgradeConfirmButton {
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
 
    .UpgradeConfirmButton:hover {
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
 
    .UpgradeCancleButton {
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
