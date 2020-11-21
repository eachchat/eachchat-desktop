<template>
    <div class="changePasswordBG">
        <div class="changePasswordDlg">
            <div class="changePasswordHead">
                <p class="changePasswordTitle">{{$t("ChangePassword")}}</p>
                <i class="el-icon-close" @click="Close()"></i>
            </div>
            <div class="originalPassword">
                <p class="originalPasswordLabel">{{originalPasswordLabel}}</p>
                <input type="password" v-model="originalPassword" :placeholder="originalPasswordPlaceHolder" class="originalPassword-input"/>
            </div>
            <div class="newPassword">
                <p class="newPasswordLabel">{{newPasswordLabel}}</p>
                <input type="password" v-model="newPassword" :placeholder="newPasswordPlaceHolder" class="newPassword-input"/>
            </div>
            <div class="confirmNewPassword">
                <p class="confirmPasswordLabel">{{confirmPasswordLabel}}</p>
                <input type="password" v-model="confirmPassword" :placeholder="confirmPasswordPlaceHolder" class="confirmPassword-input"/>
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
            var err = this.onCheckPassword(this.originalPassword, this.newPassword, this.confirmPassword);
            if(err) {
                this.$toastMessage({message:err, time:2000, type:'success'});
            }
            else {
                this.showChangePasswordAlert = true;
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
                this.Close();
            }, (err) => {
                this.$toastMessage({message:err, time:2000, type:'success'});
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
        width: 100%;
        height: 56px;
    }

    .changePasswordTitle {
        display: inline-block;
        width: 72px;
        height: 22px;
        font-size: 16px;
        font-family: SCPingFang-Medium;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
        letter-spacing: 2px;
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
        width: calc(100% - 28px);
        height: 20px;
        font-size: 14px;
        font-family: SCPingFangSC-Regular;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 1px;
        text-align: left;
        margin: 14px 14px 5px 14px;
    }

    .originalPassword-input {
        width: calc(100% - 28px);
        height: 32px;
        background: #FFFFFF;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 0px 13px 0px 13px;
    }

    .newPassword {
        width: 100%;
    }

    .newPasswordLabel {
        width: calc(100% - 28px);
        height: 20px;
        font-size: 14px;
        font-family: SCPingFangSC-Regular;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 1px;
        text-align: left;
        margin: 14px 14px 5px 14px;
    }

    .newPassword-input {
        width: calc(100% - 28px);
        height: 32px;
        background: #FFFFFF;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 0px 13px 0px 13px;
    }

    .confirmNewPassword {
        width: 100%;
        margin-bottom: 30px;
    }

    .confirmPasswordLabel {
        width: calc(100% - 28px);
        height: 20px;
        font-size: 14px;
        font-family: SCPingFangSC-Regular;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 1px;
        text-align: left;
        margin: 14px 14px 0px 14px;
    }

    .confirmPassword-input {
        width: calc(100% - 28px);
        height: 32px;
        background: #FFFFFF;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 0px 13px 0px 13px;
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
</style>