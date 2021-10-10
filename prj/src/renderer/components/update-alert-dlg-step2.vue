<template>
    <div class="UpgradeLayers" id="Step2UpgradeLayersId">
        <div class="UpgradeDlg" id="Step2UpgradeDlgId">
            <div class="UpgradeContent">
                <div class="UpgradeContentAbstract">
                    <label class="UpgradeContentAbstraceContent">版本更新</label>
                    <img class = "closeImg" src="../../../static/Img/Chat/delete-20px.png" @click="closeStep">
                </div>
                <div class="UpgradeContentDetails">
                    <p class="UpgradeContentDetailsContent">正在下载最新版本安装包</p>
                </div>
            </div>
            <div class="upgradeProcess">
                <el-progress class="downloadingProgress" :percentage="curPercent" color="#11b067" :show-text="false" :stroke-width="10"></el-progress>
            </div>
        </div>
    </div>
</template>

<script>
import * as fs from 'fs-extra'
import * as path from 'path'
import confservice from '../../packages/data/conf_service.js'
import {ipcRenderer, shell} from 'electron'
export default {
    name: 'UpgradeDlgStep2',
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

        step2:{
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            curPercent: 1,
            totleSize: 200 * 1024 * 1024,//default size is max 200M
            dlgWidth: 440,
            dlgHeight: 179,
            downloadingInterval: undefined,
            checkingTmpPath: '',
            ipcInited: false,
        }
    },
    methods: {
        closeStep(){
            ipcRenderer.send("cancelUpdatePackage");
            this.$emit("continueUpgradeDlg", false);
        },

        upGrade: function() {
            global.services.common.downloadUpgradeFile(this.upgradeInfo.downloadUrl, this.upgradeInfo.productName, this.upgradeInfo.verId);   
        },

        Cancle: function() {
            this.$emit("continueUpgradeDlg", false);
        },

        finishUpdateDownload(e, path){
            if(this.downloadingInterval) {
                clearInterval(this.downloadingInterval);
            }
            this.$emit("toStep3", path);
        },
        
        calcImgPosition: function() {
            if(this.UpgradeDlgElement == null) {
                this.UpgradeDlgElement = document.getElementById("Step2UpgradeDlgId");
            }
            if(this.UpgradeLayersElement == null) {
                this.UpgradeLayersElement = document.getElementById("Step2UpgradeLayersId");
            }
            // console.log("remote.b")
            var showScreenHeight = this.UpgradeLayersElement.offsetHeight;
            var showScreenWidth = this.UpgradeLayersElement.offsetWidth;
            console.log("showScreenHeight ", showScreenHeight)
            console.log("showScreenWidth ", showScreenWidth)
            var left = (showScreenWidth - this.dlgWidth) / 2;
            var top = (showScreenHeight - this.dlgHeight) / 2;
            this.UpgradeDlgElement.style.left = left.toString() + "px";
            this.UpgradeDlgElement.style.top = top.toString() + "px"; 
        },

        getTotleSize(e, receive, total){
            console.log("receive", receive, total)
            this.curPercent = parseInt(receive * 100 / total)
        },
    },
    components: {
    },
    created: function () {
        ipcRenderer.on("getTotleSize", this.getTotleSize);
        ipcRenderer.on("finishUpdateDownload", this.finishUpdateDownload);
    },
    mounted: function() {
        
        
    },
    watch: {
        step2: function(){
            if(this.step2){
                this.calcImgPosition();
                this.upGrade();
            }
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
        z-index: 3;
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
        margin: 17px 32px 0 32px;
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
        font-size: 16px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
    }
    
    .closeImg{
        vertical-align: middle;
        float:right
    }

    .UpgradeContentDetails {
        margin: 30px 32px 0px 12px;
    }

    .UpgradeContentDetailsContent {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        line-height: 20px;
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
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        border:none;
    }
 
    .UpgradeCancleButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 170px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
    }

    .upgradeProcess {
        width: 300px;
        margin-left: 45px;
        margin-top: 20px;
        margin-right: 45px;
        height: 12px;
        display: inline-block;
        text-align: center;
    }
    
    .downloadingProgress {
        width: 350px;
    }

 
</style>
