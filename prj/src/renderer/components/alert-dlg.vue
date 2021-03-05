<template>
    <div class="AlertLayers" id="AlertLayersId">
        <div class="AlertDlg" id="AlertDlgId">
            <div class="AlertContent">
                <div class="AlertContentAbstract">
                    <img class="AlertContentAbstraceIco" v-if="iconType=='alert'" src="../../../static/Img/Setup/Alert@2x.png">
                    <img class="AlertContentAbstraceIco" v-else src="../../../static/Img/Setup/Suc.png">
                    <label class="AlertContentAbstraceContent">{{Abstrace}}</label>
                </div>
                <div class="AlertContentDetails" id="AlertContentDetailsId">
                    <label class="AlertContentDetailsContent">{{Details}}</label>
                </div>
            </div>
            <div class="AlertFotter">
                <button class="AlertCancleButton" id="cancleButtonId" @click="Close()" v-show="canCancel">取消</button>
                <button class="AlertConfirmButton" @click="ClearCache()">确定</button>
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil} from '../../packages/core/Utils.js'
import * as fs from 'fs-extra'
export default {
    name: 'AlertDlg',
    props: {
        AlertContnts: {
            type: Object,
            default: {
                "Details": '',
                "Abstrace": ''
            }
        },
        width: {
            type: Number,
            default: 440,
        },
        height: {
            type: Number,
            default: 179,
        },
        canCancel: {
            type: Boolean,
            default: true
        },
        cancalButtonText: {
            type: String,
            default: "取消"
        },
        confirmButtonText: {
            type: String,
            default: "确定"
        },
        alertType: {
            type: String,
            default: ''
        },
        contentLeft: {
            type: Number,
            default: 42,
        },
        iconType: {
            type: String,
            default: "alert"
        },
        haveBG: {
            type: Boolean,
            default: false
        }
    },//['AlertContnts'],
    data () {
        return {
            Abstrace: '',
            Details: '',
        }
    },
    methods: {
        Close: function() {
            this.$emit("closeAlertDlg", "");
        },
        ClearCache: function() {
            this.$emit("clearCache", this.alertType);
        },
    },
    components: {
    },
    created: async function () {
        console.log(this.AlertContnts)
    },
    mounted: function() {
        console.log(this.AlertContnts)
    },
    watch: {
        AlertContnts: async function() {
            console.log("AlertContent")
            if(this.AlertContnts.Details == undefined || (this.AlertContnts.Details != undefined && this.AlertContnts.Details.length == 0)) {
                return;
            }
            if(this.AlertDlgElement == null) {
                this.AlertDlgElement = document.getElementById("AlertDlgId");
            }

            if(this.AlertLayersElement == null) {
                this.AlertLayersElement = document.getElementById("AlertLayersId");
            }
            if(this.haveBG) {
                console.log("=========hav bg is ", this.haveBG);
                this.AlertLayersElement.style.backgroundColor = "rgba(0, 0, 0, 0.6)"
            }
            else {
                this.AlertLayersElement.style.backgroundColor = "rgba(0, 0, 0, 0)"
            }

            this.Details = this.AlertContnts.Details;
            this.Abstrace = this.AlertContnts.Abstrace;

            console.log("Alertcontent is ", this.AlertContnts);
            console.log("Details is ", this.Details);
            console.log("Abstrace is ", this.Abstrace);
        },
        width: function() {
            if(this.width == 0) return;
            console.log("width is ok ", this.width);
            if(this.AlertDlgElement == null) {
                this.AlertDlgElement = document.getElementById("AlertDlgId");
            }
            this.AlertDlgElement.style.width = this.width.toString() + "px";
            if(this.width < 340) {
                var cancelElement = document.getElementById("cancleButtonId");
                cancelElement.style.marginLeft = "auto";
            }
            else {
                var cancelElement = document.getElementById("cancleButtonId");
                cancelElement.style.marginLeft = "180px";
            }
        },
        height:function() {
            if(this.height == 0) return;
            console.log("width is ok ", this.height);
            if(this.AlertDlgElement == null) {
                this.AlertDlgElement = document.getElementById("AlertDlgId");
            }
            this.AlertDlgElement.style.height = this.height.toString() + "px";
        },
        contentLeft: function() {
            if(this.contentLeft == 0) return;
            var detailContentElement = document.getElementById("AlertContentDetailsId");
            if(detailContentElement) {
                detailContentElement.style.marginLeft = this.contentLeft.toString() + "px";
            }
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
        z-index: 3;
    }

    .AlertDlg {
        position: absolute;
        width: 440px;
        height: 179px;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        display: block;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
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
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
        vertical-align: top;
        margin-left: 16px;
    }

    .AlertContentDetails {
        display: block;
        width: calc(100% - 32px);
        height: 60px;
        margin: 12px 32px 0px 42px;
    }

    .AlertContentDetailsContent {
        width: 336px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
        vertical-align: top;
    }

    .AlertFotter {
        width: 90%;
        height: 72px;
        display: inline-block;
        text-align: center;
        margin-left: 20px;
        margin-right: 20px;
    }

    .AlertConfirmButton {
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        // margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        border:none;
    }
 
    .AlertConfirmButton:hover {
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        // margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        border:none;
    }
 
    .AlertCancleButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 180px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }
 
</style>
