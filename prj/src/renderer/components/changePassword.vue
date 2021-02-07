<template>
    <div class="changePasswordBG">
        <div class="changePasswordDlg">
            <div class="changePasswordHead">
                <p class="changePasswordTitle">{{$t("ChangePassword")}}</p>
                <i class="el-icon-close" @click="Close()"></i>
            </div>
            <div class="originalPassword">
                <p class="originalPasswordLabel">{{originalPasswordLabel}}</p>
                <div class="originalPassword-input">
                    <input prefix="ios-lock-outline" type="password" id="originalPasswordInputId" v-model="originalPassword" :placeholder="originalPasswordPlaceHolder" class="original-item-input"/>
                    <img class="el-icon-view" @click="toShowOriginalPwd" v-show="!showOriginalPwd" src="../../../static/Img/Login/hide-pwd@2x.png">
                    <img class="el-icon-moon" @click="toShowOriginalPwd" v-show="showOriginalPwd" src="../../../static/Img/Login/view-pwd@2x.png">
                </div>
            </div>
            <div class="newPassword">
                <p class="newPasswordLabel">{{newPasswordLabel}}</p>
                <div class="newPassword-input">
                    <input prefix="ios-lock-outline" type="password" id="newPasswordInputId" v-model="newPassword" :placeholder="newPasswordPlaceHolder" class="new-item-input"/>
                    <img class="el-icon-view" @click="toShowNewPwd" v-show="!showNewPwd" src="../../../static/Img/Login/hide-pwd@2x.png">
                    <img class="el-icon-moon" @click="toShowNewPwd" v-show="showNewPwd" src="../../../static/Img/Login/view-pwd@2x.png">
                </div>
            </div>
            <div class="confirmNewPassword">
                <p class="confirmPasswordLabel">{{confirmPasswordLabel}}</p>
                <div class="confirmPassword-input">
                    <input prefix="ios-lock-outline" type="password" id="confirmPasswordInputId" v-model="confirmPassword" :placeholder="confirmPasswordPlaceHolder" class="confirm-item-input"/>
                    <img class="el-icon-view" @click="toShowConfirmPwd" v-show="!showConfirmPwd" src="../../../static/Img/Login/hide-pwd@2x.png">
                    <img class="el-icon-moon" @click="toShowConfirmPwd" v-show="showConfirmPwd" src="../../../static/Img/Login/view-pwd@2x.png">
                </div>
            </div>
            <button class="ChangePasswordCancleButton" @click="Close()">{{$t("cancel")}}</button>
            <button class="ChangePasswordConfirmButton" :disabled="disableChangePassword" @click="Confirm()">{{$t("confirm")}}</button>
        </div>
        <changePasswordAlert v-show="showChangePasswordAlert" @ContinueToChangePassword="ContinueToChangePassword" @cancleToChangePassword="cancleToChangePassword"/>
    </div>
</template>

<script>
import changePasswordAlert from './changePasswordAlertDlg.vue';
export default {
    name: "ChangePassword",
    components: {
        changePasswordAlert,
    },
    data() {
        return {
            showConfirmPwd: false,
            showNewPwd: false,
            showOriginalPwd: false,
            originalPassword: '',
            originalPasswordPlaceHolder: '',
            newPassword: '',
            newPasswordPlaceHolder: '',
            confirmPassword: '',
            confirmPasswordPlaceHolder: '',
            originalPasswordLabel: '',
            newPasswordLabel: '',
            confirmPasswordLabel: '',
            showChangePasswordAlert: false,
            disableChangePassword: false,
        }
    },
    mounted: function() {
        this.originalPasswordLabel = this.$t("passwordCapitals");
        this.originalPasswordPlaceHolder = this.$t("oPwdPlaceHolder");
        this.newPasswordLabel = this.$t("nPwdLabel");
        this.newPasswordPlaceHolder = this.$t("nPwdPlaceHolder");
        this.confirmPasswordLabel = this.$t("cPwdLabel");
        this.confirmPasswordPlaceHolder = this.$t("confirmPwdPlaceHolder");
    },
    methods: {
        toShowOriginalPwd: function() {
            console.log("=============")
            this.showOriginalPwd = !this.showOriginalPwd;
            var pwdElement = document.getElementById("originalPasswordInputId");
            if(this.showOriginalPwd) {
                pwdElement.type = "text";
            }
            else {
                pwdElement.type = "password";
            }
        },
        toShowNewPwd: function() {
            console.log("=============")
            this.showNewPwd = !this.showNewPwd;
            var pwdElement = document.getElementById("newPasswordInputId");
            if(this.showNewPwd) {
                pwdElement.type = "text";
            }
            else {
                pwdElement.type = "password";
            }
        },
        toShowConfirmPwd: function() {
            console.log("=============")
            this.showConfirmPwd = !this.showConfirmPwd;
            var pwdElement = document.getElementById("confirmPasswordInputId");
            if(this.showConfirmPwd) {
                pwdElement.type = "text";
            }
            else {
                pwdElement.type = "password";
            }
        },
        cancleToChangePassword() {
            this.showChangePasswordAlert = false;
        },
        ContinueToChangePassword() {
            this.disableChangePassword = true;
            this.showChangePasswordAlert = false;
            this.changePassword(this.originalPassword, this.newPassword);
        },
        Close () {
            this.$emit("CloseChangePassword");
        },
        onCheckPassword (oldPass, newPass, confirmPass) {
            if (newPass !== confirmPass) {
                return {
                    error: this.$t("NewPasswordsDontMatch"),
                };
            } else if (!newPass || newPass.length === 0) {
                return {
                    error: this.$t("PasswordsCantBeEmpty"),
                };
            }
        },
        Confirm() {
            this.disableChangePassword = true;
            var err = this.onCheckPassword(this.originalPassword, this.newPassword, this.confirmPassword);
            if(err) {
                this.disableChangePassword = false;
                this.$toastMessage({message:err, time:2000, type:'error'});
                this.Close();
            }
            else {
                // this.showChangePasswordAlert = true;
                this.changePassword(this.originalPassword, this.newPassword);
                this.disableChangePassword = false;
            }
        },
        changePassword(oldPassword, newPassword) {
            const authDict = {
                type: 'm.login.password',
                identifier: {
                    type: 'm.id.user',
                    user: global.mxMatrixClientPeg.matrixClient.credentials.userId,
                },
                // TODO: Remove `user` once servers support proper UIA
                // See https://github.com/matrix-org/synapse/issues/5665
                user: global.mxMatrixClientPeg.matrixClient.credentials.userId,
                password: oldPassword,
            };
            
            global.mxMatrixClientPeg.matrixClient.setPassword(authDict, newPassword).then(() => {
                // Notify SessionStore that the user's password was changed
                this.disableChangePassword = false;
                // dis.dispatch({action: 'password_changed'});

                // if (this.props.shouldAskForEmail) {
                //     return this._optionallySetEmail().then((confirmed) => {
                //         this.props.onFinished({
                //             didSetEmail: confirmed,
                //         });
                //     });
                // } else {
                //     this.props.onFinished();
                // }
                this.$toastMessage({message:this.$t("changePasswordSuc"), time:2000, type:'success'});
                this.disableChangePassword = false;
                this.originalPassword = "";
                this.newPassword = "";
                this.confirmPassword = "";
                this.Close();
            }, (err) => {
                this.$toastMessage({message:err, time:2000, type:'success'});
                this.disableChangePassword = false;
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    .changePasswordBG {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .changePasswordDlg {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 0px 20px 20px 20px;
        width: 440px;
        height: 360px;
        background: #FFFFFF;
        text-align: center;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
    }

    .changePasswordHead {
        width: 94%;
        height: 56px;
        margin-left: 21px;
    }

    .changePasswordTitle {
        display: inline-block;
        width: 72px;
        height: 22px;
        font-size: 16px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
        letter-spacing: 0px;
        float: left;
        margin: 18px 0px 18px 0px;
    }

    .el-icon-close {
        display: inline-block;
        padding: 18px 0px 18px 18px;
        float: right;
    }

    .originalPassword {
        width: 100%;
    }

    .originalPasswordLabel {
        width: calc(100% - 40px);
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
        margin: 14px 14px 5px 20px;
    }

    .originalPassword-input {
        width: calc(100% - 40px);
        height: 32px;
        background: #FFFFFF;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 0px 13px 0px 20px;
        padding-left: 10px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
        text-align: left;
    }

    .original-item-input {
        display: inline-block;
        margin-top: 4px;
        width:209px;
        height:34px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:20px;
        letter-spacing: 0px;
        margin: 0 0 0 0;
        box-sizing: border-box;
        border:0px solid rgba(221,221,221,1);
        border-radius:4px;
        padding-left: 0px;
        font-size:14px;
        outline: none;
        font-family: PingFangSC-Regular;
        background-color: rgba(1, 1, 1, 0);
    }

    .newPassword {
        width: 100%;
    }

    .newPasswordLabel {
        width: calc(100% - 40px);
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
        margin: 14px 14px 5px 20px;
    }

    .newPassword-input {
        width: calc(100% - 40px);
        height: 32px;
        background: #FFFFFF;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 0px 13px 0px 20px;
        padding-left: 10px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
        text-align: left;
    }

    .new-item-input {
        display: inline-block;
        margin-top: 4px;
        width:209px;
        height:34px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:20px;
        letter-spacing: 0px;
        margin: 0 0 0 0;
        box-sizing: border-box;
        border:0px solid rgba(221,221,221,1);
        border-radius:4px;
        padding-left: 0px;
        font-size:14px;
        outline: none;
        font-family: PingFangSC-Regular;
        background-color: rgba(1, 1, 1, 0);
    }

    .confirmNewPassword {
        width: 100%;
        margin-bottom: 30px;
    }

    .confirmPasswordLabel {
        width: calc(100% - 40px);
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
        margin: 14px 14px 5px 20px;
    }

    .confirmPassword-input {
        width: calc(100% - 40px);
        height: 32px;
        background: #FFFFFF;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 0px 13px 0px 20px;
        padding-left: 10px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
        text-align: left;
    }
    
    .confirm-item-input {
        display: inline-block;
        margin-top: 4px;
        width:209px;
        height:34px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:20px;
        letter-spacing: 0px;
        margin: 0 0 0 0;
        box-sizing: border-box;
        border:0px solid rgba(221,221,221,1);
        border-radius:4px;
        padding-left: 0px;
        font-size:14px;
        outline: none;
        font-family: PingFangSC-Regular;
        background-color: rgba(1, 1, 1, 0);
    }

    .ChangePasswordConfirmButton {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: rgba(36, 179, 107, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }
 
    .ChangePasswordConfirmButton:hover {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: white;
        border-radius:4px;
        background: rgba(36, 179, 107, 1);
        font-family: PingFangSC-Regular;
    }

    .ChangePasswordConfirmButton:disabled {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: white;
        border-radius:4px;
        background: rgba(167, 224, 196, 1);
        font-family: PingFangSC-Regular;
    }

    .ChangePasswordCancleButton {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }

    .el-icon-view {
        display: inline-block;
        float: right;
        height: 16px;
        width: 16px;
        padding: 9px 10px 9px 10px;
        color: rgb(51, 51, 51);
        text-align: center;
    }

    .el-icon-view:hover {
        display: inline-block;
        float: right;
        height: 16px;
        width: 16px;
        padding: 9px 10px 9px 10px;
        color: rgb(51, 51, 51);
        cursor: pointer;
        text-align: center;
    }

    .el-icon-moon {
        display: inline-block;
        float: right;
        height: 16px;
        width: 16px;
        padding: 9px 10px 9px 10px;
        color: rgb(51, 51, 51);
        text-align: center;
    }

    .el-icon-moon:hover {
        display: inline-block;
        float: right;
        height: 16px;
        width: 16px;
        padding: 9px 10px 9px 10px;
        color: rgb(51, 51, 51);
        cursor: pointer;
        text-align: center;
    }
</style>