<template>
    <div class="ExportE2EPage">
        <div class="E2EKeyCertification" v-show="E2EKeyKeyCertification">
            <div class="E2EKeyCertificationTitleDiv">
                <label class="E2EKeyKeyConficationLabel">导出密钥</label>
                <img class="E2EKeyKeyConficationClose" src="../../../static/Img/Main/WinClose-20px@2x.png" @click="Close"/>
            </div>
            <p class="E2EKeyKeyTipLabel">
                1.请输入用于加密密钥备份的密码，导入密钥时需要此密码
            </p>
            <p class="E2EKeyKeyTipLabel2">
                2.您将会导出加密密钥，在新设备上查看加对话内容时，需要将密钥导入，请妥善保管。
            </p>
            <div class="E2EKeyKeyContentDiv">
                <p class="makeSurlPwd">密码</p>
                <input prefix="ios-contact-outline" type="password" v-model="E2EOPassword" placeholder="请输入密码" class="E2EKeyPwdInput"/>
            </div>
            <div class="E2EPwd">
                <p class="makeSurlPwd">确认密码</p>
                <input prefix="ios-contact-outline" type="password" v-model="E2ECPassword" placeholder="请确认密码" class="E2EKeyConfirmPwdInput"/>
            </div>
            <label class="E2EState">{{E2EState}}</label>
            <div class="E2EKeyCertificationFooter">
                <button class="E2EKeyCertificationCancleButton" @click="Close()" v-show="canCancel">{{$t("cancel")}}</button>
                <button class="E2EKeyCertificationConfirmButton" @click="Continue()" :disabled="!(E2EOPassword.trim().length != 0 && E2ECPassword.trim().length != 0)">{{ContinueTxt}}</button>
            </div>
        </div>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'
import * as fs from 'fs-extra'
import * as path from 'path'
import { getFileSizeNum } from '../../packages/core/Utils.js'
import {FileUtil, Appendzero} from '../../packages/core/Utils.js'
import * as MegolmExportEncryption from '../../packages/core/MegolmExportEncryption.js'

export default {
    name: 'ExportE2EKeyPage',
    props: {
        toUpdateExport: {
            type: Boolean,
            default: true,
        },
        needLogout: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        toUpdateExport: function() {
            this.ContinueTxt = "下一步";
            this.elementRecoveryPath = '未选择文件';
            this.canCancel = true;
            this.canSelecteFile = true;
            this.E2EState =  '';
            this.E2ECPassword =  '';
            this.E2EOPassword = '';
        }
    },
    data() {
        return  {
            E2EState: '',
            E2ECPassword: '',
            E2EOPassword: '',
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
            ContinueTxt: '下一步',
        }
    },
    methods: {
        Close (){
            this.$emit("closeE2EExportPage")
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
            if(this.ContinueTxt == "下一步") {
                var oPwd = this.E2EOPassword.trim();
                if(oPwd.length == 0) {
                    this.E2EState = "请输入密码";
                    return;
                }
                var cPwd = this.E2ECPassword.trim();
                if(cPwd.length == 0) {
                    this.E2EState = "请确认密码";
                    return;
                }
                if(oPwd !== cPwd) {
                    this.E2EState = "密码不一致，请重新输入";
                    return;
                }

                this.SelectLocal();
            }
            else {
                this.$emit("CanLogout", this.needLogout);
            }
        },
        SelectLocal() {
            // File
            if(this.canSelecteFile) {
                this.canSelecteFile = false;
                ipcRenderer.send('open-export-dialog');
            }
            if(!this.ipcInited){
                this.ipcInited = true;
                ipcRenderer.on('exportPath', this.toExport);
            }
        },
        generalFileName: function() {
            var curUser = global.mxMatrixClientPeg.matrixClient.getUser(global.mxMatrixClientPeg.matrixClient.getUserId());
            console.log("=======curuser ", curUser);
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let curYeat = curDate.getFullYear();
            let curMonth = curDate.getMonth() + 1;
            let curDay = curDate.getDate();
            let h = curDate.getHours();
            let m = curDate.getMinutes();
            let s = curDate.getSeconds();
            let fileName = "eachchat_key" + "-" + Appendzero(curYeat) + Appendzero(curMonth) + Appendzero(curDay) + "-" + Appendzero(h) + Appendzero(m) + Appendzero(s) + "-" + curUser.displayName + ".txt";
            return fileName;
        },
        toExport: async function(e, paths) {
            console.log("========= toexport ", paths.filePaths);
            this.canSelecteFile = true;
            if(paths.filePaths.length == 0) return;
            var finalFileName = this.generalFileName();
            var distPath = path.join(paths.filePaths[0], finalFileName);
            Promise.resolve().then(() => {
                return global.mxMatrixClientPeg.matrixClient.exportRoomKeys()
                }).then((k) => {
                    return MegolmExportEncryption.encryptMegolmKeyFile(
                        JSON.stringify(k), this.E2ECPassword,
                    );
                }).then((f) => {
                    const blob = new Blob([f], {
                        type: 'text/plain;charset=us-ascii',
                    });
                    let reader = new FileReader();
                    reader.onload = function() {
                        var buffer = new Buffer(reader.result);
                        ipcRenderer.send("export_key", [buffer, distPath]);
                    }
                    reader.readAsArrayBuffer(blob);
                }).catch((e) => {
                    console.error("Error exporting e2e keys:", e);
                    const msg = e.friendlyText;
                    return;
                })

            this.$toastMessage({message:"导出 export_key 成功", time: 3000, type:'success'});
            this.ContinueTxt = "退出";
        },
    }
}
</script>

<style lang="scss" scoped>
    .ExportE2EPage {
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
        margin-left: 10px;
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
        height: 22px;
        line-height: 23px;
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
        margin-bottom: 10px;
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

    .E2EKeyConfirmPwdInput {
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
    
    .E2EKey-state-title {
        display: inline-block;
        width: 70%;
        height: 30px;
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

    .E2EKeyPwdInput::placeholder {
        color: rgba(153, 153, 153, 1);
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
    }

    .E2EKeyPwdInput {
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
    .state-title{
        text-align: left;
        margin-left: 20px;
        margin-top: 3px;
        margin-bottom: 5px;
        height:17px;
        font-size:12px;
        font-weight:400;
        color:rgba(228,49,43,1);
        line-height:17px;
        letter-spacing:1px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-family: PingFangSC-Regular;
        display: inline-block;
        vertical-align: middle;
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