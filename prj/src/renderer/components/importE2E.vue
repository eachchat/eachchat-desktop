<template>
    <div class="ImportE2EPage">
        <div class="E2EKeyCertification" v-show="E2EKeyKeyCertification">
            <div class="E2EKeyCertificationTitleDiv">
                <label class="E2EKeyKeyConficationLabel">导入密钥</label>
                <img class="E2EKeyKeyConficationClose" src="../../../static/Img/Main/WinClose-20px@2x.png" @click="Close"/>
            </div>
            <p class="E2EKeyKeyTipLabel">
                1.导入本端或其他客户端导出的加密密钥。之后您可以解密该客户端的加密消息
            </p>
            <p class="E2EKeyKeyTipLabel2">
                2.导入的密钥文件使用密码保护，青输入导出密钥时设置的密码来解密文件
            </p>
            <div class="E2EKeyKeyContentDiv">
                <p class="makeSurlPwd">文件导入</p>
                <button class="selectLocal" id="E2EKeyContinueButton" @click="SelectLocal()">选择文件</Button>
                <p class="E2EKey-state-title" id="E2EKeyCertificationStateLabel">{{elementRecoveryPath}}</p>
            </div>
            <div class="E2EPwd">
                <p class="makeSurlPwd">确认密码</p>
                <input prefix="ios-contact-outline" v-model="E2EPassword" type="password" placeholder="输入密码" class="E2EKeyInput"/>
            </div>
            <label class="E2EState">{{E2EState}}</label>
            <div class="E2EKeyCertificationFooter">
                <button class="E2EKeyCertificationCancleButton" @click="Close()" v-show="canCancel">{{$t("cancel")}}</button>
                <button class="E2EKeyCertificationConfirmButton" @click="Continue()":disabled="!(E2EPassword.trim().length != 0 && this.elementRecoveryPath.length != 0)">{{$t("next")}}</button>
            </div>
        </div>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'
import * as fs from 'fs-extra'
import * as path from 'path'
import { getFileSizeNum } from '../../packages/core/Utils.js'
import {FileUtil} from '../../packages/core/Utils.js'
import * as MegolmExportEncryption from '../../packages/core/MegolmExportEncryption.js'

export default {
    name: 'ImportE2EKeypage',
    props: {
    },
    data() {
        return  {
            E2EState: '',
            E2EPassword: '',
            alertContnets: {},
            certificationState: '',
            E2EKeyKeyCertification: true,
            canCancel: true,
            canSelecteFile: true,
            ipcInited: false,
            showAlertDlg: false,
            recoveryKey: '',
            alertWidth: 0,
            elementRecoveryPath: '未选择文件',
            recoveryKeyValid: null,
            recoveryKeyCorrect: null,
        }
    },
    methods: {
        clearCache: function() {
            this.$toastMessage({message:"导入成功", time: 3000, type:'success'});
            this.Close();
        },
        Close (){
            this.$emit("closeE2EImportPage")
        },
        readFileAsArrayBuffer(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        },
        async Continue() {
            var myPasssword = this.E2EPassword.trim();
            if(myPasssword.length == 0) {
                this.$toastMessage({message:"请输入密码", time: 3000, type:'success'});
                return;
            }
            var showfu = new FileUtil(this.elementRecoveryPath);
            let showfileObj = showfu.GetUploadfileobj();
            this.readFileAsArrayBuffer(showfileObj).then((arrayBuffer) => {
                return MegolmExportEncryption.decryptMegolmKeyFile(
                    arrayBuffer, myPasssword,
                );
            }).then((keys) => {
                return global.mxMatrixClientPeg.matrixClient.importRoomKeys(JSON.parse(keys));
            }).then(() => {
                this.Close();
                // TODO: it would probably be nice to give some feedback about what we've imported here.
                // this.props.onFinished(true);
            }).catch((e) => {
                console.error("Error importing e2e keys:", e);
                this.E2EState = e.friendlyText;
            });
        },
        SelectLocal() {
            // File
            if(this.canSelecteFile) {
                this.canSelecteFile = false;
                ipcRenderer.send('open-directory-dialog', 'openFile');
            }
            if(!this.ipcInited){
                this.ipcInited = true;
                ipcRenderer.on('selectedItem', this.handleCertificationKey);
            }
        },
        async handleCertificationKey(e, paths) {
            this.canSelecteFile = true;
            var fileList = paths.filePaths;

            if(fileList === null || fileList.length === 0) {
                // this.$toastMessage({message:'请选择最少一个文件', time: 2000, type:'success'});
                return;
            }
            this.elementRecoveryPath = fileList[0];
        },
    }
}
</script>

<style lang="scss" scoped>
    .ImportE2EPage {
        width: 400px;
        height: 350px;
        border: 0px;
        position: absolute;
        margin: auto;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        background:rgba(255,255,255,1);
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
        padding: 20px;
        cursor: default;  
        -webkit-user-select:none;
    }

    .E2EKeyCertification {
        width: 100%;
        height: 100%;
        // border: 0px;
        // position: absolute;
        // margin: auto;
        // left: 0px;
        // right: 0px;
        // top: 0px;
        // bottom: 0px;
        // background:rgba(255,255,255,1);
        // box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        // border-radius: 4px;
        // padding: 20px;
    }

    .E2EKeyCertificationTitleDiv {
        width: 100%;
        height: 30px;
        line-height: 30px;
    }

    .E2EKeyKeyConficationLabel {
        display: inline-block;
        width: calc(100%-25px);
        height:36px;
        font-size:16px;
        font-weight:500;
        color:rgba(0,0,0,1);
        line-height:36px;
        font-family: PingFangSC-Medium;
        letter-spacing: 2px;
        vertical-align:top;
    }

    .E2EKeyKeyConficationClose {
        width: 20px;
        height: 20px;
        margin-top: 8px;
        margin-bottom: 8px;
        display: line-block;
        float: right;
    }

    .E2EState {
        margin-top: 28px;
        margin-left: 20px;
        width: 100%;
        height: 18px;
        line-height: 18px;
        font-size:12px;
        font-weight:400;
        color:rgba(102,102,102,1);
        line-height:18px;
        letter-spacing:1px;
        font-family: PingFangSC-Regular;
    }

    .E2EKeyKeyTipLabel{
        margin-top: 20px;
        margin-left: 10px;
        margin-bottom: 0px;
        width: calc(100% - 30px);
        height: 36px;
        line-height: 36px;
        font-size:14px;
        font-weight:400;
        color:rgba(102,102,102,1);
        line-height:18px;
        letter-spacing:0px;
        font-family: PingFangSC-Regular;
    }

    .E2EKeyKeyTipLabel2{
        margin-top: 0px;
        margin-left: 10px;
        margin-bottom: 20px;
        width: calc(100% - 30px);
        height: 36px;
        line-height: 23px;
        font-size:14px;
        font-weight:400;
        color:rgba(102,102,102,1);
        line-height:18px;
        letter-spacing:0px;
        font-family: PingFangSC-Regular;
    }

    .E2EKeyKeyContentDiv {
        width: 100%;

    }

    .selectLocal {
        display: inline-block;
        width: 25%;
        height: 30px;
        border: 1px solid #24B36B;
        font-family: PingFangSC-Regular;
        color: white;
        background:rgba(36,179,107,1);
        margin-left: 10px;
        margin-bottom: 10px;
    }

    .E2EPwd {
        width: 100%;
        margin-top: 10px;
    }

    .makeSurlPwd {
        width: 100%;
        height: 18px;
        margin: 0 0 10px 10px;
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(51, 51, 51, 1);
        padding: 0;
    }

    .E2EKeyInput::placeholder {
        color: rgba(153, 153, 153, 1);
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
    }

    .E2EKeyInput {
        width: 90%;
        margin-top: 0px;
        margin-left: 10px;
        height:36px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:20px;
        letter-spacing:1px;
        box-sizing: border-box;
        border:1px solid rgba(221,221,221,1);
        border-radius:4px;
        padding-left: 12px;
        font-size:14px;
        outline: none;
        font-family: PingFangSC-Regular;
    }

    .E2EKey-state-title{
        text-align: left;
        margin-left: 20px;
        margin-top: 3px;
        margin-bottom: 5px;
        height:17px;
        font-size:12px;
        font-weight:400;
        color: rgba(153, 153, 153, 1);
        line-height:17px;
        letter-spacing:1px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-family: PingFangSC-Regular;
        display: inline-block;
        vertical-align: middle;
        width: 60%;
    }

    .E2EKeyCertificationFooter {
        width: 90%;
        height: 72px;
        display: inline-block;
        text-align: center;
        margin-top: 10px;
        
        .E2EKeyCertificationConfirmButton {
            width: 100px;
            height: 32px;
            margin-left: 5px;
            margin-top: 20px;
            margin-bottom: 20px;
            margin-right: 15px;
            background-color: rgba(36, 179, 107, 1);
            border:1px solid rgba(221,221,221,1);
            color: white;
            border-radius:4px;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            font-weight: 500;
        }
    
        .E2EKeyCertificationConfirmButton:disabled {
            width: 100px;
            height: 32px;
            margin-left: 5px;
            margin-top: 20px;
            margin-bottom: 20px;
            margin-right: 15px;
            background-color: rgba(167, 224, 196, 1);
            border:1px solid rgba(221,221,221,1);
            color: white;
            border-radius:4px;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            font-weight: 500;
        }
    
        .E2EKeyCertificationConfirmButton:hover {
            width: 100px;
            height: 32px;
            margin-left: 5px;
            margin-top: 20px;
            margin-bottom: 20px;
            margin-right: 15px;
            background-color: rgba(36, 179, 107, 1);
            border:1px solid rgba(221,221,221,1);
            color: white;
            border-radius:4px;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            font-weight: 500;
        }
    
        .E2EKeyCertificationCancleButton {
            width: 100px;
            height: 32px;
            margin-right: 5px;
            margin-top: 20px;
            margin-bottom: 20px;
            margin-left: 15px;
            background-color: white;
            border-radius:4px;
            border:1px solid rgba(221,221,221,1);
            font-family: PingFangSC-Regular;
            font-size: 14px;
            font-weight: 500;
        }
    }

</style>