<template>
    <div class="generalSecureBackUpPage">
        <div class="generalSecureBackUp" v-show="showGeneralTypePage">
            <label class="generalSecureBackUpTitle">设置备份加密密钥</label>
            <label class="generalSecureBackUpTip">通过在您的服务器上备份加密密钥来防止丢失您对加密消息和数据的访问权。</label>
            <div class="generalSecureBackUpAuto">
                <input class="generalSecureBackUpCheckBox" type="checkbox" @change="selectChanged('auto')" v-show="false">
                <div class="generalSecureBackUpAutoContent">
                    <div class="generalSecureBackUpAutoInfo">
                        <img class="generalSecureBackUpAutoImg" src="../../../static/Img/personalCenter/left-24px@2x.png">
                        <label class="generalSecureBackUpAutoLabel">生成一个安全密钥</label>
                    </div>
                    <label class="generalSecureBackUpAutoTip">我们会生成一个安全密钥以便让您存储在安全的地方，比如密码管理器或保险箱里。</label>
                </div>
            </div>
            <div class="generalSecureBackUpByself" v-show="false">
                <input class="generalSecureBackUpCheckBox" type="checkbox" @change="selectChanged('auto')">
                <div class="generalSecureBackUpByselfContent">
                    <div class="generalSecureBackUpByselfInfo">
                        <img class="generalSecureBackUpByselfImg" src="../../../static/Img/Chat/apk@2x.png">
                        <label class="generalSecureBackUpByselfLabel">生成一个安全密钥</label>
                    </div>
                    <label class="generalSecureBackUpByselfTip">我们会生成一个安全密钥以便让您存储在安全的地方，比如密码管理器或保险箱里。</label>
                </div>
            </div>
        </div>
        <div class="showKey" v-show="showRecoveryKeyPage">
            <label class="showKeyStoreTip">将您的安全密钥存储在安全的地方，像是密码管理器或保险箱里，它将被用来保护您的加密数据。</label>
            <div class="showKeyContent">
                <div class="showKeyWindow">
                    {{recoveryKey.encodedPrivateKey}}
                </div>
                <button class="downloadRecoveryKeyBtn" @click="downloadRecoveryKey">下载</button>
                <span>或者</span>
                <button class="copyRecoveryKeyBtn" @click="copyRecoveryKey">复制</button>
            </div>
        </div>
        <div class="certificationFooter">
            <button class="CertificationCancleButton" @click="Close()" :disabled="(!hasDownloadOrCopy && showRecoveryKeyPage)" v-show="canCancel">{{$t("cancel")}}</button>
            <button class="CertificationConfirmButton" @click="Continue()" :disabled="(!hasDownloadOrCopy && showRecoveryKeyPage)" >{{$t("next")}}</button>
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
const { clipboard } = require('electron')

const KEY_FILE_MAX_SIZE = 128;

export default {
    name: 'generalSecureBackUpPage',
    components: {
        AlertDlg,
        // listItem
    },
    data() {
        return  {
            showRecoveryKeyPage: false,
            showGeneralTypePage: true,
            alertContnets: {},
            certificationState: '',
            crocessSignCertification: false,
            secretKeyCertification: true,
            canCancel: true,
            canSelecteFile: true,
            ipcInited: false,
            showAlertDlg: false,
            recoveryKey: {
                encodedPrivateKey: '',
            },
            alertWidth: 0,
            elementRecoveryPath: '',
            canSelecteFile: true,
            ipcPicInited: false,
            hasDownloadOrCopy: false,
        }
    },
    methods: {
        async _doBootstrapUIAuth(makeRequest) {
            let response = null;
            var checkType = global.mxMatrixClientPeg.checkType;
            var username = global.mxMatrixClientPeg.account;
            var password = global.mxMatrixClientPeg.password;
            if(checkType == "m.login.verCode.msisdn") {
                try{
                    await makeRequest({
                        type: checkType,
                        msisdn: username,
                        ver_code: password,
                        identifier: {
                            type: 'm.id.user',
                            user: global.mxMatrixClientPeg.matrixClient.getUserId(),
                        },
                    });
                }
                catch(e) {
                    console.log(e.message);
                }
            }
            else if(checkType == "m.login.verCode.email") {
                try{
                    await makeRequest({
                        type: checkType,
                        email: username,
                        ver_code: password,
                        identifier: {
                            type: 'm.id.user',
                            user: global.mxMatrixClientPeg.matrixClient.getUserId(),
                        },
                    });
                }
                catch(e) {
                    console.log(e.message);
                }
            }
            else if(checkType == "m.login.sso.ldap") {
                try{
                    await makeRequest({
                        type: checkType,
                        user: username,
                        password: password,
                        identifier: {
                            type: 'm.id.user',
                            user: global.mxMatrixClientPeg.matrixClient.getUserId(),
                        },
                    });
                }
                catch(e) {
                    console.log(e.message);
                }
            }
        },
        copyRecoveryKey() {
            global.mxMatrixClientPeg.setRecoveryKey(this.recoveryKey.encodedPrivateKey);
            this._bootstrapSecretStorage();
            this.hasDownloadOrCopy = true;
            clipboard.writeText(this.recoveryKey.encodedPrivateKey);
            this.$toastMessage({message:"复制成功", time: 3000, type:'success'});
        },
        downloadRecoveryKey() {
            global.mxMatrixClientPeg.setRecoveryKey(this.recoveryKey.encodedPrivateKey);
            this._bootstrapSecretStorage();
            if(this.canSelecteFile) {
                this.canSelecteFile = false;
                ipcRenderer.send('open-download-recoveryKey-dialog');
            }
            if(!this.ipcPicInited){
                this.ipcPicInited = true;
                console.log("=========init ")
                ipcRenderer.on('downloadRecoveryKeyPath', this.toDownload);
            }
        },
        toDownload(e, paths) {
            this.hasDownloadOrCopy = true;
            console.log("========= toexport ", paths.filePaths);
            this.canSelecteFile = true;
            if(paths.filePaths.length == 0) return;
            var distPath = path.join(paths.filePaths[0], "recovery_key.txt");
            const blob = new Blob([this.recoveryKey.encodedPrivateKey], {
                type: 'text/plain;charset=us-ascii',
            });
            let reader = new FileReader();
            reader.onload = function() {
              var buffer = new Buffer(reader.result);
              ipcRenderer.send("export_key", [buffer, distPath]);
            }
            reader.readAsArrayBuffer(blob);
        },
        async _fetchBackupInfo() {
            try {
                const backupInfo = await global.mxMatrixClientPeg.matrixClient.getKeyBackupVersion();
                const backupSigStatus = (
                    // we may not have started crypto yet, in which case we definitely don't trust the backup
                    MatrixClientPeg.get().isCryptoEnabled() && await MatrixClientPeg.get().isKeyBackupTrusted(backupInfo)
                );

                return {
                    backupInfo,
                    backupSigStatus,
                };
            } catch (e) {
                console.log("===========exception");
            }
        },
        async _loadBackupStatus() {
            console.log("==========yyy=========")
            try {
                this.backupInfo = await global.mxMatrixClientPeg.matrixClient.getKeyBackupVersion();
                this.backupSigStatus = await global.mxMatrixClientPeg.matrixClient.isKeyBackupTrusted(this.backupInfo);

                // if(this.backupInfo) {
                //     console.log("=========== bootstrapSecretStorage");
                //     await global.mxMatrixClientPeg.matrixClient.bootstrapSecretStorage({});
                //     this.certificationShow();
                // }
                // else {
                //     console.log("=========== showCreateRecoveryKey");
                //     this.generalRecoveryKeyPageShow();
                // }
            } catch (e) {
                console.log("Unable to fetch key backup status", e);
            }
        },
        showAlert: function() {
            this.alertContnets = {
                "Details": "是否确定丢弃您在此之前的历史加密消息？",
                "Abstrace": "确定跳过认证？"
            };
            this.alertWidth = 300;
            this.showAlertDlg = true;
        },
        closeAlertDlg: function() {
            this.showAlertDlg = false;
        },
        clearCache: function() {
            this.$emit("CanLogout", true);
        },
        Close (){
            this.showAlert();
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
            console.log("======= continue")
            if(this.showGeneralTypePage) {
                this.recoveryKey = await global.mxMatrixClientPeg.matrixClient.createRecoveryKeyFromPassphrase();
                // this.recoveryKey.encodedPrivateKey = "EsUA rtuE ERk9 7GUY Yk3i qs8A kgW7 fBbk C4ur gfzc 9SbM cnkE";
                this.showGeneralTypePage = false;
                this.showRecoveryKeyPage = true;
            }
            else if(this.showRecoveryKeyPage) {
                this.$emit("CanLogout", false);
            }
            else {
                this.$emit("CanLogout", true);
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
        getE2EEWellKnown: function() {
            const client = window.mxMatrixClientPeg.matrixClient;
            const clientWellKnown = client.getClientWellKnown();
            if (clientWellKnown && clientWellKnown[E2EE_WK_KEY]) {
                return clientWellKnown[E2EE_WK_KEY];
            }
            if (clientWellKnown && clientWellKnown[E2EE_WK_KEY_DEPRECATED]) {
                return clientWellKnown[E2EE_WK_KEY_DEPRECATED]
            }
            return null;
        },
        getSecureBackupSetupMethods() {
            const wellKnown = this.getE2EEWellKnown();
            if (
                !wellKnown ||
                !wellKnown["secure_backup_setup_methods"] ||
                !wellKnown["secure_backup_setup_methods"].length ||
                !(
                    wellKnown["secure_backup_setup_methods"].includes(SecureBackupSetupMethod.Key) ||
                    wellKnown["secure_backup_setup_methods"].includes(SecureBackupSetupMethod.Passphrase)
                )
            ) {
                return [
                    SecureBackupSetupMethod.Key,
                    SecureBackupSetupMethod.Passphrase,
                ];
            }
            return wellKnown["secure_backup_setup_methods"];
        },
        async _queryKeyUploadAuth() {
            try {
                await global.mxMatrixClientPeg.matrixClient.uploadDeviceSigningKeys(null, {});
                // We should never get here: the server should always require
                // UI auth to upload device signing keys. If we do, we upload
                // no keys which would be a no-op.
                console.log("uploadDeviceSigningKeys unexpectedly succeeded without UI auth!");
            } catch (error) {
                if (!error.data || !error.data.flows) {
                    console.log("uploadDeviceSigningKeys advertised no flows!");
                    return;
                }
                const canUploadKeysWithPasswordOnly = error.data.flows.some(f => {
                    return f.stages.length === 1 && f.stages[0] === 'm.login.password';
                });
            }
        },
        async _loadBackupStatus() {
            try {
                const cli = global.mxMatrixClientPeg.matrixClient;
                const backupInfo = await cli.getKeyBackupVersion();
                const has4S = await cli.hasSecretStorageKey();
                const backupKeyStored = has4S && await cli.isKeyBackupKeyStored();

                const gotCache = await this._restoreWithCachedKey(backupInfo);
                if (gotCache) {
                    console.log("RestoreKeyBackupDialog: found cached backup key");
                    this.setState({
                        loading: false,
                    });
                    return;
                }

                this.setState({
                    loadError: null,
                    loading: false,
                });
            } catch (e) {
                console.log("Error loading backup status", e);
                this.setState({
                    loadError: e,
                    loading: false,
                });
            }
        },
        promptForBackupPassphrase() {
            return Promise
        },
        async _createBackup() {
            let info;
            try {
                await accessSecretStorage(async () => {
                    info = await MatrixClientPeg.get().prepareKeyBackupVersion(
                        null /* random key */,
                        { secureSecretStorage: true },
                    );
                    info = await MatrixClientPeg.get().createKeyBackupVersion(info);
                });
                await MatrixClientPeg.get().scheduleAllGroupSessionsForBackup();
            } catch (e) {
                console.error("Error creating key backup", e);
                // TODO: If creating a version succeeds, but backup fails, should we
                // delete the version, disable backup, or do nothing?  If we just
                // disable without deleting, we'll enable on next app reload since
                // it is trusted.
                if (info) {
                    MatrixClientPeg.get().deleteKeyBackupVersion(info.version);
                }
            }
        },
        async _bootstrapSecretStorage(){
            const cli = global.mxMatrixClientPeg.matrixClient;

            try {
                /*
                    // For password authentication users after 2020-09, this cross-signing
                    // step will be a no-op since it is now setup during registration or login
                    // when needed. We should keep this here to cover other cases such as:
                    //   * Users with existing sessions prior to 2020-09 changes
                    //   * SSO authentication users which require interactive auth to upload
                    //     keys (and also happen to skip all post-authentication flows at the
                    //     moment via token login)
                */
                    await cli.bootstrapCrossSigning({
                        authUploadDeviceSigningKeys: this._doBootstrapUIAuth
                    });
                    console.log("this.backupInfo is ", this.backupInfo);
                    console.log("global backupinfo is ", this.backupInfo);
                    await cli.bootstrapSecretStorage({
                        createSecretStorageKey: async () => this.recoveryKey,
                        keyBackupInfo: this.backupInfo,
                        setupNewKeyBackup: !this.backupInfo,
                        undefined,
                    });
                    // this._fetchBackupInfo();
                    // await cli.bootstrapSecretStorage({
                    //     createSecretStorageKey: async () => this.recoveryKey,
                    //     keyBackupInfo: this.backupInfo,
                    //     setupNewKeyBackup: !this.backupInfo,
                    //     undefined,
                    // });
                    // await cli.bootstrapSecretStorage({
                    //     createSecretStorageKey: async () => this.recoveryKey,
                    //     keyBackupInfo: this.backupInfo,
                    //     setupNewKeyBackup: !this.backupInfo,
                    //     undefined,
                    // });
                    // var correct = global.mxMatrixClientPeg.checkPrivateKey(this.recoveryKey);
                    // try{
                    //     await global.mxMatrixClientPeg.matrixClient.checkOwnCrossSigningTrust();
                    //     await global.mxMatrixClientPeg.matrixClient.restoreKeyBackupWithSecretStorage(this.backupInfo);
                    // }
                    // catch(error) {
                    //     console.log("err ", error.message);
                    // }
                // this.props.onFinished(true);
            } catch (e) {
                if (e.httpStatus === 401 && e.data.flows) {
                    console.log("exception ", e.message)
                } else {
                    console.log("exception ", e.message)
                }
                console.error("Error bootstrapping secret storage", e);
            }
        }

    },
    mounted: async function() {
        // const setupMethods = getSecureBackupSetupMethods();
        // if (setupMethods.includes("key")) {
        //     this.state.passPhraseKeySelected = CREATE_STORAGE_OPTION_KEY;
        // } else {
        //     this.state.passPhraseKeySelected = CREATE_STORAGE_OPTION_PASSPHRASE;
        // }
        await this._queryKeyUploadAuth();
        // this._createBackup();
        this._fetchBackupInfo();
    }
}
</script>

<style lang="scss" scoped>
    .generalSecureBackUpPage {
        position: absolute;
        width: 360px;
        height: 384px;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 20px 20px 20px 20px;
        background:rgba(255,255,255,1);
        cursor: default;  
        -webkit-user-select:none;
    }
    
    .generalSecureBackUpCheckBox {
        display: inline-block;
	    position:relative;
        width: 20px;
        height: 20px;
        background-color: rgba(255, 255, 255, 1);
        border: 1px solid rgb(221,221,221);
        border-radius: 50%;
        font-size: 10px;
        margin-top: 40px;
        vertical-align:top;
        cursor: pointer;
        -webkit-appearance:none;
        -webkit-user-select:none;
        user-select:none;
        -webkit-transition:background-color ease 0.1s;
        transition:background-color ease 0.1s;
        float: left;
        outline: none;
    }

    .generalSecureBackUpCheckBox:checked {
        background-color: rgb(36, 179, 107);
        cursor: pointer;
        outline: none;
    }

    .generalSecureBackUpCheckBox:checked::after {
        content:'';
        top:3px;
        left:3px;
        font-size: 10px;
        position: absolute;
        background:transparent;
        border:#fff solid 2px;
        border-top:none;
        border-right:none;
        height:6px;
        width:10px;
        -moz-transform:rotate(-45deg);
        -ms-transform:rotate(-45deg);
        -webkit-transform:rotate(-45deg);
        transform:rotate(-45deg);
        outline: none;
    }

    .generalSecureBackUpTitle {
        display: block;
        width: 100%;
        height: 32px;
        text-align: center;
        font-size: 16px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        line-height: 32px;
        letter-spacing: 0px;
    }

    .generalSecureBackUpTip {
        display: block;
        width: 89%;
        margin-left: 20px;
        margin-right: 20px;
        height: 44px;
        font-size:14px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:22px;
        letter-spacing: 0px;
        font-family: PingFangSC-Regular;
    }

    .generalSecureBackUpAuto {
        width: 88%;
        height: 40%;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 3px;
        margin-top: 20px;
        border: 1px solid rgb(36, 179, 107);
        border-radius: 4px;
    }

    .generalSecureBackUpAutoContent {
        width: calc(100% - 50px);
        height: 25%;
        text-align: left;
        margin-left: 42px;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    
    .generalSecureBackUpAutoTip {
        width: 100%;
        height: 22px;
        font-size:14px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:22px;
        letter-spacing: 0px;
        font-family: PingFangSC-Regular;
    }

    .generalSecureBackUpAutoInfo {
        width: calc(100%-30px);
        height: 100%;
    }

    .generalSecureBackUpAutoImg {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-top: calc(50%-10px);
        margin-bottom: calc(50%-10px);
        vertical-align: middle;
    }

    .generalSecureBackUpAutoLabel {
        display: inline-block;
        width: calc(100%-30px);;
        height: 22px;
        font-size:14px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:22px;
        letter-spacing: 0px;
        font-family: PingFangSC-Regular;
    }

    .generalSecureBackUp {
        width: 100%;
        height: 260px;
        border: 0px;
    }

    .showKey {
        width: 100%;
        height: 260px;
        border: 0px;
    }

    .showKeyStoreTip {
        display: block;
        width: 89%;
        margin-left: 20px;
        margin-right: 20px;
        margin-top: 20px;
        height: 65px;
        font-size:14px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:22px;
        letter-spacing: 0px;
        font-family: PingFangSC-Regular;
    }

    .showKeyContent {
        width: calc(100% - 70px);
        height: 25%;
        text-align: left;
        margin-left: 42px;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    .showKeyWindow {
        width: 100%;
        height: 100%;
    }

    .downloadRecoveryKeyBtn {
        display: inline-block;
    }

    .copyRecoveryKeyBtn {
        display: inline-block;
    }

    .generalSecureBackUpByself {
        width: 88%;
        height: 40%;
        margin-left: 20px;
        margin-right: 20px;
        margin-top: 3px;
        border: 1px solid rgb(36, 179, 107);
        border-radius: 4px;
    }
    
    .generalSecureBackUpByselfInfo {
        width: calc(100%-30px);
        height: 100%;
    }

    .generalSecureBackUpByselfImg {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-top: calc(50%-10px);
        margin-bottom: calc(50%-10px);
        vertical-align: middle;
    }

    .generalSecureBackUpByselfLabel {
        display: inline-block;
        width: calc(100%-30px);;
        height: 22px;
        font-size:14px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:22px;
        letter-spacing: 0px;
        font-family: PingFangSC-Regular;
    }

    .generalSecureBackUpByselfContent {
        width: calc(100% - 50px);
        height: 25%;
        text-align: left;
        margin-left: 42px;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .generalSecureBackUpByselfTip {
        width: 100%;
        height: 22px;
        font-size:14px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:22px;
        letter-spacing: 0px;
        font-family: PingFangSC-Regular;
    }

    .certificationFooter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }

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

    .CertificationConfirmButton:disabled {
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 15px;
        background: rgba(221,221,221,1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }

    .CertificationConfirmButton:hover:disabled {
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 15px;
        background: rgba(221,221,221,1);
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

    .downloadRecoveryKeyBtn {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 0px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }

    .downloadRecoveryKeyBtn:hover {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 0px;
        background: rgba(36, 179, 107, 1);
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }

    .copyRecoveryKeyBtn {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 0px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }

    .copyRecoveryKeyBtn:hover {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 0px;
        background: rgba(36, 179, 107, 1);
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }
</style>