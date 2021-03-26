<template>
    <div class="UpgradeLayers" id="Step3UpgradeLayersId">
        <div class="UpgradeDlg" id="Step3UpgradeDlgId">
            <div class="UpgradeContent">
                <div class="UpgradeContentAbstract">
                    <img class="UpgradeContentAbstraceIco" src="../../../static/Img/Setup/Alert@2x.png">
                    <label class="UpgradeContentAbstraceContent">提示</label>
                </div>
                <div class="UpgradeContentDetails">
                    <p class="UpgradeContentDetailsContent">亿恰正在运行，请问是否关闭亿洽立即升级</p>
                </div>
            </div>
            <div class="UpgradeFotter">
                <button class="UpgradeCancleButton" @click="Cancel()" >下次再说</button>
                <button class="UpgradeConfirmButton" @click="install()">立即升级</button>
            </div>
        </div>
    </div>
</template>

<script>

import {ipcRenderer} from 'electron'
export default {
    name: 'UpgradeDlgStep3',
    props: {
        upgradeFilePath: {
            type: String,
            default: ''
        },

        step3:{
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            curPercent: 1,
            totleSize: 200 * 1024 * 1024,//default size is max 200M
            isDownloading: false,
            Abstrace: '',
            Details: '',
            dlgWidth: 440,
            dlgHeight: 179,
            downloadingInterval: undefined,
            checkingTmpPath: '',
            ipcInited: false,

        }
    },
    methods: {
        Cancel: function() {
           this.$emit("continueUpgradeDlg", false);
        },
        install(){
            ipcRenderer.send("intallUpgradePackage", this.upgradeFilePath);
            this.Cancel();
        },
        
        calcImgPosition: function() {
            if(this.UpgradeDlgElement == null) {
                this.UpgradeDlgElement = document.getElementById("Step3UpgradeDlgId");
            }
            if(this.UpgradeLayersElement == null) {
                this.UpgradeLayersElement = document.getElementById("Step3UpgradeLayersId");
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
        }

        
    },
    components: {
    },
    created: function () {
        
    },
    mounted: function() {
        
    },
    watch: {
        step3: function(){
            if(this.step3) this.calcImgPosition();
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
        vertical-align: top;
        margin-left: 16px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
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
        width: 200px;
        margin-left: 110px;
        margin-right: 110px;
        height: 72px;
        display: inline-block;
        text-align: center;
    }
    
    .downloadingProgress {
        display: block;
        width: 200px;
        float: right;
    }

 
</style>
