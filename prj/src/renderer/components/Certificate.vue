<template>
    <div class="CertificationPage">
        <div class="CrocessSignCertification" v-show="crocessSignCertification">
        </div>
        <div class="SecretKeyCertification" v-show="secretKeyCertification">
            <div class="SecretKeyCertificationTitleDiv">
                <img class="secretKeyConficationImg" src="">
                <label class="secretKeyConficationLabel">{{$t("secretKeyConfication")}}</label>
            </div>
            <div class="secretKeyTipLabel">{{$t("secretKeyTip")}}</div>
            <div class="secretKeyContentDiv">
                <input prefix="ios-contact-outline" v-model="recoveryKey" :placeholder="$t('secretKeyTip')" class="secretKeyInput"/>
                <div class="secretKeyOrLabel">{{$t("or")}}</div>
                <button class="selectLocal" id="ContinueButton" @click="SelectLocal()">{{$t("upload")}}</Button>
            </div>
            <div>
                <p class="state-title" id="certificationStateLabel">{{certificationState}}</p>
            </div>
        </div>
        <div class="certificationFooter">
            <button class="CertificationCancleButton" @click="Close()" v-show="canCancel">{{$t("cancel")}}</button>
            <button class="CertificationConfirmButton" @click="Continue()">{{$t("next")}}</button>
        </div>
        <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="clearCache" :width="alertWidth"/>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'
import * as fs from 'fs-extra'
import * as path from 'path'
import { getFileSizeNum } from '../../packages/core/Utils.js'
import AlertDlg from './alert-dlg.vue'
import {FileUtil} from '../../packages/core/Utils.js'
// import * as MegolmExportEncryption from '../../packages/core/MegolmExportEncryption.js'

const KEY_FILE_MAX_SIZE = 128;

export default {
    name: 'certification',
    props: {
        backupInfo: {
            type: Object,
            default: {},
        },
        isLogin: {
            type: Boolean,
            default: true
        }
    },
    components: {
        AlertDlg,
        // listItem
    },
    data() {
        return  {
            alertContnets: {},
            certificationState: '',
            crocessSignCertification: false,
            secretKeyCertification: true,
            canCancel: true,
            canSelecteFile: true,
            ipcInited: false,
            showAlertDlg: false,
            recoveryKey: '',
            alertWidth: 0,
            elementRecoveryPath: '',
        }
    },
    methods: {
        showAlert: function() {
            this.alertContnets = {
                "Details": "跳过认证将无法解析历史加密消息",
                "Abstrace": "确定跳过认证？"
            };
            this.alertWidth = 300;
            this.showAlertDlg = true;
        },
        closeAlertDlg: function() {
            this.showAlertDlg = false;
        },
        clearCache: function() {
            ipcRenderer.send("showMainPageWindow")
            this.$router.push("/main")
            this.showAlertDlg = false;
        },
        Close (){
            if(this.isLogin) {
                this.showAlert();
            }
            else {
                this.$emit("cancelRecovery")
            }
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
            if(this.isLogin) {
                if(this.recoveryKey == "") return;
                var correct = global.mxMatrixClientPeg.checkPrivateKey(this.recoveryKey);
                if(correct) {
                    await global.mxMatrixClientPeg.matrixClient.checkOwnCrossSigningTrust();
                    await global.mxMatrixClientPeg.matrixClient.restoreKeyBackupWithSecretStorage(this.backupInfo);
                    if(this.isLogin) {
                        this.$toastMessage({message:"登录成功", time: 3000, type:'success'});
                        setTimeout(async () => {
                            // ipcRenderer.send('showMainPageWindow', true); 
                            ipcRenderer.send("showMainPageWindow")
                            this.$router.push("/main")
                        }, 1000);
                    }
                    else {
                        this.$toastMessage({message:"导入成功", time: 3000, type:'success'});
                    }
                }
            }
            else {
                // var showfu = new FileUtil(this.elementRecoveryPath);
                // let showfileObj = showfu.GetUploadfileobj();
                // this.readFileAsArrayBuffer(showfileObj).then((arrayBuffer) => {
                //     return MegolmExportEncryption.decryptMegolmKeyFile(
                //         arrayBuffer, 'Wx@6156911128',
                //     );
                // }).then((keys) => {
                //     return global.mxMatrixClientPeg.matrixClient.importRoomKeys(JSON.parse(keys));
                // }).then(() => {
                //     this.Close();
                //     // TODO: it would probably be nice to give some feedback about what we've imported here.
                //     // this.props.onFinished(true);
                // }).catch((e) => {
                //     console.error("Error importing e2e keys:", e);
                //     const msg = e.friendlyText;
                // });
            }
        },
        SelectLocal() {
            let scriptPath = path.join(__dirname, '/olmlib-worker.js');
            let scriptPath1 =  document.body.dataset.vectorOlmWorkerScript;
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
            if(this.isLogin) {
                console.log("e is ", e);
                this.canSelecteFile = true;
                var fileList = paths.filePaths;

                if(fileList === null || fileList.length === 0) {
                    // this.$toastMessage({message:'请选择最少一个文件', time: 2000, type:'success'});
                    return;
                }
                else {
                    var keyFile = fileList[0];
                    if(!fs.existsSync(keyFile)) {
                        return;
                    }
                    let fileSize = await getFileSizeNum(keyFile);
                    console.log("fileSize is ", fileSize);
                    if(fileSize > KEY_FILE_MAX_SIZE) {

                    }
                    else {
                        fs.readFile(keyFile, 'utf-8', async (err, data) => {
                            if(err) {

                            }
                            else {
                                this.recoveryKey = data;
                                console.log("data is ", this.recoveryKey);
                                if(this.recoveryKey.length == 0) {
                                    return;
                                }
                                
                                if (/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz\s]+$/.test(this.recoveryKey)) {
                                    var state = await global.mxMatrixClientPeg.validateRecoveryKey(this.recoveryKey);
                                    if(await state == true){
                                        var stateElement = document.getElementById("certificationStateLabel");
                                        if(stateElement != undefined) {
                                            stateElement.style.color = "rgba(36, 179, 107, 1)"
                                        }
                                        this.certificationState = this.$t('recoveryKeyLooksGood');
                                    }
                                    else {
                                        var stateElement = document.getElementById("certificationStateLabel");
                                        if(stateElement != undefined) {
                                            stateElement.style.color = "rgba(228,49,43,1);"
                                        }
                                        this.certificationState = this.$t('invalidRecoveryKey');
                                    }
                                } 
                            }
                        })
                    }
                }
            }
            else {
                this.canSelecteFile = true;
                var fileList = paths.filePaths;

                if(fileList === null || fileList.length === 0) {
                    // this.$toastMessage({message:'请选择最少一个文件', time: 2000, type:'success'});
                    return;
                }
                this.elementRecoveryPath = fileList[0];
            }
        },
    }
}
</script>

<style lang="scss" scoped>
    .CertificationPage {
        width: 100%;
        margin: 0px;
        height: calc(100% - 36px);
        background:rgba(255,255,255,1);
        cursor: default;  
        -webkit-user-select:none;
    }

    .SecretKeyCertification {
        width: 100%;
        height: 260px;
        border: 0px;

        .SecretKeyCertificationTitleDiv {
            width: 100%;
            height: 30px;
            line-height: 30px;
            padding-top: 44px;

            .secretKeyConficationImg {
                display: inline-block;
                width: 20px;
            }

            .secretKeyConficationLabel {
                display: inline-block;
                width: calc(100%-20px);
                height:36px;
                font-size:24px;
                font-weight:600;
                color:rgba(39,45,52,1);
                line-height:36px;
            }
        }

        .secretKeyTipLabel{
            margin-top: 28px;
            margin-left: 20px;
            width: calc(100% - 30px);
            height: 18px;
            line-height: 23px;
            font-size:12px;
            font-weight:400;
            color:rgba(102,102,102,1);
            line-height:18px;
            letter-spacing:1px;
            font-family: PingFangSC-Regular;
        }

        .secretKeyContentDiv {
            width: 100%;

            .secretKeyInput {
                display: inline-block;
                width: 60%;
                margin-top: 4px;
                margin-left: 20px;
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

            .secretKeyOrLabel {
                width: 30px;
                display: inline-block;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                border:0px;
                padding-left: 2px;
                font-size:14px;
                outline: none;
                font-family: PingFangSC-Regular;
            }

            .selectLocal {
                display: inline-block;
                width: 15%;
                height: 30px;
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
            }
        }
    }

    .state-title{
        text-align: left;
        margin-left: 20px;
        margin-top: 0px;
        height:17px;
        font-size:12px;
        font-weight:400;
        color:rgba(228,49,43,1);
        line-height:17px;
        letter-spacing:1px;
        font-family: PingFangSC-Regular;
    }
    .certificationFooter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
        
        .CertificationConfirmButton {
            width: 100px;
            height: 32px;
            margin-left: 5px;
            margin-top: 20px;
            margin-bottom: 20px;
            margin-right: 15px;
            background: rgba(36, 179, 107, 1);
            border:1px solid rgba(221,221,221,1);
            color: white;
            border-radius:4px;
            font-family: PingFangSC-Regular;
        }
    
        .CertificationConfirmButton:hover {
            width: 100px;
            height: 32px;
            margin-left: 5px;
            margin-top: 20px;
            margin-bottom: 20px;
            margin-right: 15px;
            background: rgba(36, 179, 107, 1);
            border:1px solid rgba(221,221,221,1);
            color: white;
            border-radius:4px;
            font-family: PingFangSC-Regular;
        }
    
        .CertificationCancleButton {
            width: 100px;
            height: 32px;
            margin-right: 5px;
            margin-top: 20px;
            margin-bottom: 20px;
            margin-left: 15px;
            background: white;
            border-radius:4px;
            border:1px solid rgba(221,221,221,1);
            font-family: PingFangSC-Regular;
        }
    }

</style>