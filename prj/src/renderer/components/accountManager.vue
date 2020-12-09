<template>
    <div class="AccountManagerBG">
        <div class="accountManagerDlg">
            <div class="accountManagerHeader">
                <p class="accountManagerTitle">{{cutTitle}}</p>
                <i class="el-icon-close" v-show="isMainPage" @click="Close()"></i>
            </div>
            <div class="accountManagerContentPage" v-show="isMainPage">
                <div class="phoneBind">
                    <img class="phoneBindImg" src="../../../static/Img/Chat/pkg@2x.png">
                    <label class="phoneBindLabel">手机号</label>
                    <label class="phoneBindBtn" @click="toBindPhone">绑定</label>
                </div>
                <div class="emailBind">
                    <img class="emailBindImg" src="../../../static/Img/Chat/pkg@2x.png">
                    <label class="emailBindLabel">邮箱</label>
                    <label class="emailBindBtn" @click="toBindEmail">绑定</label>
                </div>
            </div>
            <div class="accountManagerContentPageBind" v-show="isBindPhoneSetNumPage">
                <label class="toSetAddressLabel">{{toSetAddressLabel}}</label>
                <input v-model="accountAddress" :placeholder="accountAddressPlaceHolder" class="toSetAddressInput"/>
            </div>
            <div class="accountManagerContentPageBind" v-show="isBindPhoneCheckPage">
                <label class="toSetAddressLabel">{{toSetAddressLabel}}</label>
                <input v-model="accountAddress" :placeholder="accountAddressPlaceHolder" class="toSetAddressInput"/>
                <button class="reSendBtn" :disabled="time>0">{{reSend}}</button>
            </div>
            <div class="accountManagerContentPageBind" v-show="isBindInputPasswordPage">
                <label class="toSetAddressLabel">{{toSetAddressLabel}}</label>
                <input type="password" v-model="accountAddress" :placeholder="accountAddressPlaceHolder" class="toSetAddressInput"/>
            </div>
            <div class="accountManagerContentPageBind" v-show="isBindEmailSetAddressPage">
                <label class="toSetAddressLabel">{{toSetAddressLabel}}</label>
                <input v-model="accountAddress" :placeholder="accountAddressPlaceHolder" class="toSetAddressInput"/>
                <label class="toSetAddressLabelState">{{toSetAddressLabelState}}</label>
            </div>
            <div class="accountManagerContentPageBind" v-show="isBindEmailCheckPage">
                <label class="toSetAddressLabel">{{toSetAddressLabel}}</label>
            </div>
            <div class="accountManagerFotter">
                <button class="accountManagerCancleButton" @click="Close()" v-show="!isMainPage">{{$t("cancel")}}</button>
                <button class="accountManagerConfirmButton" :disabled="disableConfirm" @click="Confirm()" v-show="!isMainPage">{{confirmText}}</button>
            </div>
        </div>
    </div>
</template>

<script>
const EMAIL_ADDRESS_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export default {
    name: 'AccountManager',
    props: {
    },
    data () {
        return {
            cutTitle: "账号管理",
            confirmText: "下一步",
            reSend: "",
            time: 61,
            phoneNum: "",
            emailAddress: "",
            toSetAddressLabelState: "",
            toSetAddressLabel: "",
            accountAddress: "",
            accountAddressPlaceHolder: "",
            sessionId: "",
            submitUrl: "",
            isMainPage: true,
            isBindInputPasswordPage: false,
            isBindPhoneSetNumPage: false,
            isBindPhoneCheckPage: false,
            isBindEmailSetAddressPage: false,
            isBindEmailCheckPage: false,
            disableConfirm: false,
            contentElement: undefined,
        }
    },
    methods: {
        Close: function() {
            this.isMainPage = true;
            this.isBindInputPasswordPage = false;
            this.isBindPhoneSetNumPage = false;
            this.isBindPhoneCheckPage = false;
            this.isBindEmailSetAddressPage = false;
            this.isBindEmailCheckPage = false;
            this.$emit("accountMgrDlgClose");
        },
        looksValid(email) {
            return EMAIL_ADDRESS_REGEX.test(email);
        },
        Confirm: async function() {
            if(this.isBindPhoneSetNumPage) {
                // toDo Check Empty and Send ver code to phone
                global.mxMatrixClientPeg.matrixClient.requestAdd3pidMsisdnToken(
                    "CN", this.accountAddress, global.mxMatrixClientPeg.matrixClient.generateClientSecret(), 1
                ).then((res) => {
                    this.sessionId = res.sid;
                    this.submitUrl = res.submit_url;
                    this.isBindPhoneSetNumPage = false;
                    this.isBindPhoneCheckPage = true;
                    this.phoneNum = this.accountAddress;
                    this.accountAddress = "";
                    this.cutTitle = "验证手机号";
                    this.accountAddressPlaceHolder = "请输入验证码";
                    this.toSetAddressLabel = "请输入发送至" + this.accountAddress + "的6位验证码，如未收到，请尝试重新获取验证码。";
                    if(this.time <= 0) {
                        this.time = 61;
                        this.timer();
                    }
                }).catch((err) => {
                    if (err.errcode === 'M_THREEPID_IN_USE') {
                        err.message = 'This phone number is already in use';
                    } else if (err.httpStatus) {
                        err.message = err.message + ` (Status ${err.httpStatus})`;
                    }
                })
            }
            else if(this.isBindPhoneCheckPage) {
                // toDo Check Empty and Check ver code
                this.isBindPhoneCheckPage = false;
                this.isBindInputPasswordPage = true;
                this.accountAddress = "";
                this.cutTitle = "身份认证";
                this.accountAddressPlaceHolder = "请输入验登录密码";
                this.toSetAddressLabel = "添加手机号操作需要额外的身份认证，请输入您的登录密码";
            }
            else if(this.isBindEmailSetAddressPage) {
                // toDo Send ver code to email
                if(!this.looksValid(this.accountAddress)) {
                    this.toSetAddressLabelState = "邮箱格式不正确"
                    return;
                }
                global.mxMatrixClientPeg.matrixClient.requestAdd3pidEmailToken(
                    this.accountAddress, global.mxMatrixClientPeg.matrixClient.generateClientSecret(), 1
                ).then((ret) => {
                    this.sessionId = res.sid;
                    this.isBindEmailSetAddressPage = false;
                    this.isBindEmailCheckPage = true;
                    this.emailAddress = this.accountAddress;
                    this.accountAddress = "";
                    this.cutTitle = "验证邮箱";
                    this.toSetAddressLabel = "已向您的邮箱" + this.accountAddress + "发送雁阵右键，请检查您的电子邮箱并点击里面包含的链接，完成时请点击下一步。";
                    if(this.time <= 0) {
                        this.time = 61;
                        this.timer();
                    }
                }).catch((err) => {
                    if (err.errcode === 'M_THREEPID_IN_USE') {
                        err.message = 'This email is already in use';
                        this.toSetAddressLabelState = "该邮箱已经被使用。";
                    } else if (err.httpStatus) {
                        err.message = err.message + ` (Status ${err.httpStatus})`;
                        this.toSetAddressLabelState = err.message;
                    }
                })
            }
            else if(this.isBindEmailCheckPage) {
                if(await global.mxMatrixClientPeg.matrixClient.doesServerSupportSeparateAddAndBind()) {

                }
                else {
                    await global.mxMatrixClientPeg.matrixClient.addThreePid({
                        sid: this.sessionId,
                        client_secret: global.mxMatrixClientPeg.matrixClient.generateClientSecret()
                    }, true)
                }
                this.isBindEmailCheckPage = false;
                this.isBindInputPasswordPage = true;
                this.accountAddress = "";
                this.cutTitle = "身份认证";
                this.accountAddressPlaceHolder = "请输入验登录密码";
                this.toSetAddressLabel = "添加手机号操作需要额外的身份认证，请输入您的登录密码";
            }
            else if(this.isBindInputPasswordPage) {
                // toDo Check login pwd
                this.isBindInputPasswordPage = false;
                this.isMainPage = true;
                this.cutTitle = "账号管理";
            }
        },
        toBindEmail: function() {
            if(this.contentElement == undefined) {
                this.contentElement = document.getElementById("")
            }
            this.cutTitle = "添加登录邮箱";
            this.toSetAddressLabel = "请添加用于登录的邮箱";
            this.accountAddress = "";
            this.accountAddressPlaceHolder = "请输入邮箱";
            this.isMainPage = false;
            this.isBindEmailSetAddressPage = true;
        },
        toBindPhone: function() {
            this.cutTitle = "添加登录手机号"
            this.toSetAddressLabel = "请添加用于登录的手机号";
            this.accountAddress = "";
            this.accountAddressPlaceHolder = "请输入手机号";
            this.isMainPage = false;
            this.isBindPhoneSetNumPage = true;
        },
        timer() {
            if (this.time > 1) {
                    this.time--;
                    this.reSend = "重新发送(" + this.time + "s)";
                    setTimeout(this.timer, 1000);
            } else{
                this.time = 0;
                this.reSend = "发送";
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    .AccountManagerBG {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .accountManagerDlg{
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 0px 20px 20px 20px;
        width: 440px;
        height: 260px;
        background: #FFFFFF;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
    }
    
    .accountManagerHeader {
        width: 100%;
        height: 56px;
    }

    .accountManagerTitle {
        display: inline-block;
        width: 142px;
        height: 22px;
        font-size: 16px;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
        letter-spacing: 2px;
        float: left;
        margin: 18px 0px 18px 0px;
        font-family: SCPingFang-Medium;
    }

    .el-icon-close {
        display: inline-block;
        padding: 18px 0px 18px 18px;
        float: right;
    }

    .accountManagerContentPage {
        width: 440px;
        height: 204px;
        background: #FFFFFF;
        border: 1px solid rgba(221,221,221,1);
        border-radius: 4px;
    }

    .accountManagerContentPageBind {
        width: 440px;
        height: 150px;
        background: #FFFFFF;
        border: 1px solid rgba(221,221,221,1);
        border-radius: 4px;
        margin-bottom: 20px;
    }

    .phoneBind {
        width: 100%;
        height: 90px;
    }

    .phoneBindImg {
        width: 40px;
        height: 40px;
        float: left;
        padding: 25px 0 25px 0;
    }

    .phoneBindLabel {
        width: 100px;
        height: 20px;
        font-size:14px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:20px;
        letter-spacing:1px;
        float: left;
        padding: 35px 0 35px 0;
        font-family: PingFangSC-Regular;
    }

    .phoneBindBtn {
        width: 100px;
        height: 20px;
        font-size:14px;
        font-weight:400;
        color:aqua;
        line-height:20px;
        letter-spacing:1px;
        float: right;
        padding: 35px 0 35px 0;
        font-family: PingFangSC-Regular;
    }

    .emailBind {
        width: 100%;
        height: 90px;
    }
    
    .emailBindImg {
        width: 40px;
        height: 40px;
        float: left;
        padding: 25px 0 25px 0;
    }

    .emailBindLabel {
        width: 100px;
        height: 20px;
        font-size:14px;
        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:20px;
        letter-spacing:1px;
        float: left;
        padding: 35px 0 35px 0;
        font-family: PingFangSC-Regular;
    }

    .emailBindBtn {
        width: 100px;
        height: 20px;
        font-size:14px;
        font-weight:400;
        color:aqua;
        line-height:20px;
        letter-spacing:1px;
        float: right;
        padding: 35px 0 35px 0;
        font-family: PingFangSC-Regular;
    }

    .toSetAddressLabel {
        width: calc(100% - 28px);
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 1px;
        float: left;
        margin: 14px 14px 5px 14px;
    }

    .toSetAddressLabelState {
        width: calc(100% - 28px);
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 1px;
        float: left;
        margin: 14px 14px 5px 14px;
    }

    .toSetAddressInput {
        width: calc(100% - 28px);
        height: 32px;
        background: #FFFFFF;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 0px 13px 0px 13px;
    }

    .reSendBtn {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: white;
        border:0px;
        color: rgba(36, 179, 107, 1);
        font-family: PingFangSC-Regular;
    }

    .reSendBtn:disabled {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: white;
        border:0px;
        color: #DDDDDD;
        font-family: PingFangSC-Regular;
    }

    .accountManagerFotter {
        width: 100%;
        height: 40px;
        text-align: center;
    }

    .accountManagerConfirmButton {
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
 
    .accountManagerConfirmButton:hover {
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

    .accountManagerConfirmButton:disabled {
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

    .accountManagerCancleButton {
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
