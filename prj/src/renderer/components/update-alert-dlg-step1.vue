<template>
    <div class="UpgradeLayers" id="UpgradeLayersId">
        <div class="UpgradeDlg" id="UpgradeDlgId">
            <div class="UpgradeContent">
                <div class="UpgradeContentAbstract">
                    <label class="UpgradeContentAbstraceContent">{{Abstrace}}</label>
                </div>
                <div class = 'companyInfo'>
                    <img class = 'companyImg' src="../../../static/Img/Main/logo@x.png">
                    <p class = 'companyProduct'>
                        {{verName}}
                    </p>
                </div>
                <div class="UpgradeContentDetails">
                    <p class="UpgradeContentDetailsContent" v-html = 'Details'></p>
                </div>
            </div>
            <div class="UpgradeFotter">
                <button class="UpgradeCancleButton" @click="Cancle()">暂不更新</button>
                <button class="UpgradeConfirmButton" @click="upGrade()">更新版本</button>
            </div>
        </div>
        
    </div>
</template>

<script>
export default {
    name: 'UpgradeDlgStep1',
    props: {
        upgradeInfo: {
            type: Object,
            default: {
            }
        },

        step1:{
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
            productName: '',
            dlgWidth: 440,
            dlgHeight: 396,
            downloadingInterval: undefined,
            checkingTmpPath: '',
            ipcInited: false,
            verName: '',
            Details: ''
        }
    },
    methods: {
        upGrade: function() {
            this.$emit("continueUpgradeDlg", true);
        },

        Cancle: function() {
            this.$emit("continueUpgradeDlg", false);
        },
        calcImgPosition: function() {
            if(this.UpgradeDlgElement == null) {
                this.UpgradeDlgElement = document.getElementById("UpgradeDlgId");
            }
            if(this.UpgradeLayersElement == null) {
                this.UpgradeLayersElement = document.getElementById("UpgradeLayersId");
            }
            var showScreenHeight = this.UpgradeLayersElement.offsetHeight;
            var showScreenWidth = this.UpgradeLayersElement.offsetWidth;
            console.log("showScreenHeight ", showScreenHeight)
            console.log("showScreenWidth ", showScreenWidth)
            var left = (showScreenWidth - this.dlgWidth) / 2;
            var top = (showScreenHeight - this.dlgHeight) / 2;

            console.log("left ", left)
            console.log("top ", top)
            this.UpgradeDlgElement.style.left = left.toString() + "px";
            this.UpgradeDlgElement.style.top = top.toString() + "px"; 
        },
    },
    components: {

    },
    mounted: function() {
    },
    watch: {
        step1: function() {
            if(!this.step1) return;
            if(this.upgradeInfo.downloadUrl == undefined) {
                return;
            }
            this.productName = this.upgradeInfo.productName;
            this.Details = this.upgradeInfo.description;
            this.verName = this.upgradeInfo.verName;

            this.Abstrace = "版本更新";
            this.calcImgPosition();
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
        width: 8px;
        height: 8px;
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
        height: 396px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .UpgradeContent {
        width: calc(100% - 64px);
        height: calc(100% - 104px);
        margin: 17px 32px 0 32px;
        border: 0px solid rgba(221, 221, 221, 1);
    }

    .companyInfo{
        margin-top:20px;
    }

    .companyImg{
        margin-left: 164px;
    }

    .companyProduct{
        text-align: center;
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
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
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
    }

    .UpgradeContentDetails {
        display: block;
        margin: 10px 32px 0px 42px;
    }

    .UpgradeContentDetailsContent {
        overflow-y: auto;
        height: 144px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
    }

    .UpgradeferFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }

    .UpgradeFotter{
        margin-top: 40px;
    }

    .UpgradeConfirmButton {
        width: 100px;
        height: 32px;
        margin-left: 5px;
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        border:none;
    }
 
    .UpgradeCancleButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-left: 120px;
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
