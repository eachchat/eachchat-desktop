<template>
    <div class="ChangePasswordAlertLayers" id="ChangePasswordAlertLayersId">
        <div class="ChangePasswordAlertDlg" id="ChangePasswordAlertDlgId">
            <div class="ChangePasswordAlertContent">
                <div class="ChangePasswordAlertContentAbstract">
                    <img class="ChangePasswordAlertContentAbstraceIco" src="../../../static/Img/Setup/Alert@2x.png">
                    <label class="ChangePasswordAlertContentAbstraceContent">{{$t('theAlert')}}</label>
                </div>
                <div class="ChangePasswordAlertContentDetails">
                    <label class="ChangePasswordAlertContentDetailsContent">{{$t('changePasswordAlert')}}</label>
                </div>
            </div>
            <div class="ChangePasswordAlertFotter">
                <button class="ChangePasswordAlertCancleButton" @click="Close()">{{$t('cancel')}}</button>
                <button class="ChangePasswordAlertExportKeyButton" @click="ExportSessions()">{{$t('ExportE2ERoomKeys')}}</button>
                <button class="ChangePasswordAlertConfirmButton" @click="Continue()">{{$t('confirm')}}</button>
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil} from '../../packages/core/Utils.js'
import * as fs from 'fs-extra'
export default {
    name: 'ChangePasswordAlertDlg',
    props: {
    },//['AlertContnts'],
    data () {
        return {
            Abstrace: '',
            Details: '',
        }
    },
    methods: {
        Close: function() {
            this.$emit("cancleToChangePassword", "");
        },
        Continue: function() {
            this.$emit("ContinueToChangePassword");
        },
    },
    components: {
    },
    created: async function () {
    },
    mounted: function() {
    },
}
</script>

<style lang="scss" scoped>
    .ChangePasswordAlertLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 3;
    }

    .ChangePasswordAlertDlg {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 0px 20px 20px 20px;
        width: 440px;
        height: 209px;
        background: #FFFFFF;
        text-align: center;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
    }

    .ChangePasswordAlertContent {
        width: calc(100% - 64px);
        height: calc(100% - 104px);
        margin: 32px 32px 0 32px;
        border: 0px solid rgba(221, 221, 221, 1);
    }
    
    .ChangePasswordAlertContentAbstract {
        display: block;
        width: 100%;
        height: 30px;
        margin: 0;
        text-align: left;
    }

    .ChangePasswordAlertContentAbstraceIco {
        display: inline-block;
        width: 24px;
        height: 24px;
    }

    .ChangePasswordAlertContentAbstraceContent {
        width: calc(100% - 40px);
        font-size: 16px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 0px;
        vertical-align: top;
        margin-left: 16px;
    }

    .ChangePasswordAlertContentDetails {
        display: block;
        width: calc(100% - 32px);
        height: 60px;
        margin: 12px 32px 0px 0px;
    }

    .ChangePasswordAlertContentDetailsContent {
        width: 336px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
        vertical-align: top;
    }

    .ChangePasswordAlertFotter {
        width: 90%;
        height: 72px;
        display: inline-block;
        text-align: center;
        margin-left: 20px;
        margin-right: 20px;
    }

    .ChangePasswordAlertExportKeyButton {
        width: 200px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        // margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }

    .ChangePasswordAlertConfirmButton {
        width: 80px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        // margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }
 
    .ChangePasswordAlertConfirmButton:hover {
        width: 80px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        // margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }
 
    .ChangePasswordAlertCancleButton {
        width: 80px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        // margin-left: 110px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }
 
</style>
