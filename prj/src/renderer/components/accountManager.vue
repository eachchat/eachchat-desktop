<template>
    <div class="AccountManagerBG">
        <div class="accountManagerDlg" id="accountManagerDlgId">
            <div class="accountManagerHeader">
                <p class="accountManagerTitle">{{cutTitle}}</p>
                <i class="el-icon-close" @click="Close()"></i>
            </div>
            <ul class="accountManagerContentPage" v-show="isMainPage">
                <li class="accountInfo">
                    <img class="accountInfoImg" src="../../../static/Img/Setup/account@2x.png">
                    <label class="accountInfoLabel">用户名</label>
                    <label class="accountInfoLabel1">{{ownerAccount}}</label>
                </li>
                <li class="phoneBind" v-show="false">
                    <img class="phoneBindImg" src="../../../static/Img/Setup/Phone@2x.png">
                    <label class="phoneBindLabel">手机号</label>
                    <label class="phoneBindBtn" @click="toBindPhone" v-show="phoneNum.length == 0">绑定</label>
                    <img class="phoneBindedDel" src="../../../static/Img/Setup/del@2x.png" v-show="phoneNum.length != 0" @click="unBindPhone">
                    <label class="phoneBinded" v-show="phoneNum.length != 0">{{phoneNum}}</label>
                </li>
                <li class="emailBind">
                    <img class="emailBindImg" src="../../../static/Img/Setup/mail@2x.png">
                    <label class="emailBindLabel">邮箱</label>
                    <label class="emailBindBtn" @click="toBindEmail" v-show="emailAddress.length == 0">绑定</label>
                    <img class="emailBindedDel" src="../../../static/Img/Setup/del@2x.png" v-show="emailAddress.length != 0" @click="unBindEmail">
                    <label class="emailBinded" v-show="emailAddress.length != 0">{{emailAddress}}</label>
                </li>
                <li class="emailBind">
                    <img class="emailBindImg" src="../../../static/Img/Setup/wechat.png">
                    <label class="emailBindLabel">微信</label>
                    <label class="emailBindBtn" @click="toBindWechat" v-show="!bWechat">绑定</label>
                    <img class="emailBindedDel" src="../../../static/Img/Setup/del@2x.png" v-show="bWechat" @click="unBindWechat">
                    <label class="emailBinded" v-show="bWechat">已绑定</label>
                </li>
                <li class="emailBind">
                    <img class="emailBindImg" src="../../../static/Img/Setup/alipay.png">
                    <label class="emailBindLabel">支付宝</label>
                    <label class="emailBindBtn" @click="toBindAlipay" v-show="!bAlipay">绑定</label>
                    <img class="emailBindedDel" src="../../../static/Img/Setup/del@2x.png" v-show="bAlipay" @click="unBindAlipay">
                    <label class="emailBinded" v-show="bAlipay">已绑定</label>
                </li>
            </ul>
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
            </div>
            <div class="accountManagerContentPageBind" v-show="isBindEmailCheckPage">
                <label class="toSetAddressLabel">{{toSetAddressLabel}}</label>
            </div>
            <div class="accountManagerFotter">
                <button class="accountManagerCancleButton" @click="Close()" v-show="!isMainPage">{{$t("cancel")}}</button>
                <button class="accountManagerConfirmButton" :disabled="disableConfirm" @click="Confirm()" v-show="!isMainPage">{{confirmText}}</button>
            </div>
        </div>
        <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="AlertConfirm" :width="alertWidth" :height="alertHeight" :contentLeft="alertContentLeft" :iconType="iconType"/>
    </div>
</template>

<script>
import { ComponentUtil } from '../script/component-util';
import AlertDlg from './alert-dlg.vue'
const EMAIL_ADDRESS_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export default {
    name: 'AccountManager',
    props: {
        needUpdate: {
            type: Boolean,
            default: false
        }
    },
    components: {
        AlertDlg
    },
    data () {
        return {
            ownerAccount: '',
            isUnbindEmail: false,
            isUnbindPhone: false,
            iconType: "alert",
            alertWidth: 0,
            alertHeight: 0,
            alertContentLeft: 0,
            showAlertDlg: false,
            alertContnets: {},
            session: '',
            cutTitle: "账号管理",
            confirmText: "下一步",
            reSend: "",
            time: 61,
            phoneNum: "",
            emailAddress: "",
            toSetAddressLabelState: "",
            toSetAddressLabel: "请添加用于登录的邮箱",
            accountAddress: "",
            accountAddressPlaceHolder: "请输入邮箱",
            sessionId: "",
            submitUrl: "",
            isMainPage: true,
            isBindInputPasswordPage: false,
            isBindPhoneSetNumPage: false,
            isBindPhoneCheckPage: false,
            isBindEmailSetAddressPage: false,
            isBindEmailCheckPage: false,
            disableConfirm: false,
            clientSecret: '',
            contentElement: undefined,
            dlgElement: undefined,
            bAlipay: false,
            bWechat: false
        }
    },
    methods: {
        AlertConfirm: function() {
            if(this.isUnbindEmail) {
                global.mxMatrixClientPeg.matrixClient.deleteThreePid('email', this.emailAddress).then(() => {
                    this.emailAddress = "";
                    this.isUnbindEmail = false;
                    this.closeAlertDlg();
                }).catch((err) => {
                    this.closeAlertDlg();
                    this.$toastMessage({message:(err && err.message) ? err.message : "操作失败", time: 2000, type:'error'});
                });
            }
            else if(this.isUnbindPhone) {
                global.mxMatrixClientPeg.matrixClient.deleteThreePid('msisdn', this.phoneNum).then(() => {
                    this.phoneNum = "";
                    this.isUnbindPhone = false;
                    this.closeAlertDlg();
                }).catch((err) => {
                    this.closeAlertDlg();
                    this.$toastMessage({message:(err && err.message) ? err.message : "操作失败", time: 2000, type:'error'});
                });
            }
        },
        closeAlertDlg: function() {
            this.showAlertDlg = false;
            this.alertContnets = {};
        },
        unBindEmail: function() {
            this.alertContnets = {
                "Details": "是否删除邮箱?",
                "Abstrace": "提示"
            };
            this.isUnbindEmail = true;
            this.isUnbindPhone = false;
            this.showAlertDlg = true;
        },
        unBindPhone: function() {
            this.alertContnets = {
                "Details": "是否删除手机号?",
                "Abstrace": "提示"
            };
            this.isUnbindPhone = true;
            this.isUnbindEmail = false;
            this.showAlertDlg = true;
        },
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
            if(this.dlgElement == undefined) {
                this.dlgElement = document.getElementById("accountManagerDlgId");
            }
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
                        this.$toastMessage({message:"该号码已经被使用。", time: 2000, type:'error'});
                    } else if (err.httpStatus) {
                        this.$toastMessage({message:err.message + ` (Status ${err.httpStatus})`, time: 2000, type:'error', showWidth:'380px'});
                    }
                })
            }
            else if(this.isBindPhoneCheckPage) {
                // toDo Check Empty and Check ver code
                this.isBindPhoneCheckPage = false;
                this.isBindInputPasswordPage = true;
                this.accountAddress = "";
                this.cutTitle = "身份认证";
                this.confirmText = "提交";
                this.accountAddressPlaceHolder = "请输入验登录密码";
                this.toSetAddressLabel = "添加手机号操作需要额外的身份认证，请输入您的登录密码";
            }
            else if(this.isBindEmailSetAddressPage) {
                // toDo Send ver code to email
                if(!this.looksValid(this.accountAddress)) {
                    this.toSetAddressLabelState = "邮箱格式不正确"
                    return;
                }
                this.disableConfirm = true;
                this.clientSecret = global.mxMatrixClientPeg.matrixClient.generateClientSecret();
                global.mxMatrixClientPeg.matrixClient.requestAdd3pidEmailToken(
                    this.accountAddress, this.clientSecret, 1
                ).then((ret) => {
                    this.disableConfirm = false;
                    this.sessionId = ret.sid;
                    this.isBindEmailSetAddressPage = false;
                    this.isBindEmailCheckPage = true;
                    this.emailAddress = this.accountAddress;
                    this.accountAddress = "";
                    this.cutTitle = "验证邮箱";
                    this.confirmText = "下一步";
                    this.toSetAddressLabel = "已向您的邮箱" + this.emailAddress + "发送验证邮件，请检查您的电子邮箱并点击里面包含的链接，完成时请点击下一步。";
                    if(this.time <= 0) {
                        this.time = 61;
                        this.timer();
                    }
                }).catch((err) => {
                    this.disableConfirm = false;
                    if (err.errcode === 'M_THREEPID_IN_USE') {
                        this.$toastMessage({message:"该邮箱已经被使用。", time: 2000, type:'error'});
                    } else if (err.httpStatus) {
                        this.$toastMessage({message:err.message + ` (Status ${err.httpStatus})`, time: 2000, type:'error'});
                    }
                })
            }
            else if(this.isBindEmailCheckPage) {
                // if(await global.mxMatrixClientPeg.matrixClient.doesServerSupportSeparateAddAndBind()) {

                // }
                // else {
                // }
                try{
                    var firstRet = await this._makeAddThreepidOnlyRequest(undefined);
                    console.log("====== first ret is ", firstRet);
                    if(e.httpStatus !== 401 || !e.data || !e.data.flows) {
                        this.toSetAddressLabelState = "auto认证异常";
                        return;
                    }
                    this.session = firstRet.data.session;
                }
                catch(e) {
                    if(e.httpStatus !== 401 || !e.data || !e.data.flows) {
                        this.toSetAddressLabelState = "auto认证异常";
                        return;
                    }
                    this.session = e.data.session;
                }
                this.isBindEmailCheckPage = false;
                this.isBindInputPasswordPage = true;
                this.accountAddress = "";
                this.cutTitle = "身份认证";
                this.confirmText = "提交";
                this.accountAddressPlaceHolder = "请输入验登录密码";
                this.toSetAddressLabel = "添加邮箱需要额外的身份认证，请输入您的登录密码";
            }
            else if(this.isBindInputPasswordPage) {
                // toDo Check login pwd
                console.log("ret is ", ret);
                var auth = {
                    // identifier: {
                    //     type: 'm.id.user',
                    //     user: global.mxMatrixClientPeg.matrixClient.getUserId()
                    // },
                    session: this.session,
                    password: this.accountAddress,
                    type: "m.login.password",
                    user: global.mxMatrixClientPeg.matrixClient.getUserId(),
                }
                try{
                    var ret = await this._makeAddThreepidOnlyRequest(auth);
                    console.log("=========== ret ", ret);
                }
                catch(e) {
                    console.log("=========== e ", e);
                    console.log("=========== e ", e.httpStatus);
                    console.log("=========== e ", e.data);
                    if (e.httpStatus == 401) {
                        if(e.data && e.data.errcode == "M_FORBIDDEN") {
                            this.$toastMessage({message:"登录密码不正确", time: 2000, type:'error'});
                        }
                        else if(e.data && e.data.err) {
                            this.$toastMessage({message:e.data.err, time: 2000, type:'error'});
                        }
                        return;
                    } else {
                        if(e.data && e.data.error) {
                            this.$toastMessage({message:e.data.error, time: 2000, type:'error'});
                        }
                        else {
                            this.$toastMessage({message:"邮箱绑定失败", time: 2000, type:'error'});
                        }
                        return;
                    }
                }
                this.dlgElement.style.height = "200px";
                this.isBindInputPasswordPage = false;
                this.isMainPage = true;
                this.cutTitle = "账号管理";
            }
        },
        _makeAddThreepidOnlyRequest: function(auth) {
            return global.mxMatrixClientPeg.matrixClient.addThreePidOnly({
                sid: this.sessionId,
                client_secret: this.clientSecret,
                auth,
            });
        },
        toBindEmail: function() {
            if(this.dlgElement == undefined) {
                this.dlgElement = document.getElementById("accountManagerDlgId");
            }
            this.dlgElement.style.height = "216px";
            if(this.contentElement == undefined) {
                this.contentElement = document.getElementById("")
            }
            this.cutTitle = "添加登录邮箱";
            this.toSetAddressLabel = "请添加用于登录的邮箱";
            this.accountAddress = "";
            this.accountAddressPlaceHolder = "请输入邮箱";
            this.confirmText = "下一步";
            this.isMainPage = false;
            this.isBindEmailSetAddressPage = true;
        },

        toBindAlipay: function(){

        },

        unBindAlipay: function(){

        },

        toBindWechat: function(){

        },

        unBindWechat: function(){

        },

        toBindPhone: function() {
            if(this.dlgElement == undefined) {
                this.dlgElement = document.getElementById("accountManagerDlgId");
            }
            this.dlgElement.style.height = "216px";
            this.cutTitle = "添加登录手机号"
            this.toSetAddressLabel = "请添加用于登录的手机号";
            this.confirmText = "下一步";
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
    mounted: async function() {
      try{
        global.mxMatrixClientPeg.matrixClient.getThreePids()
            .then((ret) => {
              console.log("threepdis is ", ret);
              var threePids = ret.threepids;
              var emainObj = threePids.filter((a) => a.medium === 'email');
              var phoneObj = threePids.filter((a) => a.medium === 'msisdn');
              console.log("e,ainmlson ", emainObj)
              this.emailAddress = emainObj.length == 0 ? "" : emainObj[0].address;
              this.phoneNum = phoneObj.length == 0 ? "" : phoneObj[0].address;
            })
        }
        catch(error) {
            console.log("get threed pids exception ", error)
        }
        var userId = global.mxMatrixClientPeg.matrixClient.getUserId();
        var userName = ComponentUtil.GetDisplayName("", userId);
        this.ownerAccount = userName;
    },
    watch: {
        needUpdate: async function() {
            console.log("*******");
            try{
                global.mxMatrixClientPeg.matrixClient.getThreePids()
                    .then((ret) => {
                    console.log("threepdis is ", ret);
                    var threePids = ret.threepids;
                    var emainObj = threePids.filter((a) => a.medium === 'email');
                    var phoneObj = threePids.filter((a) => a.medium === 'msisdn');
                    console.log("e,ainmlson ", emainObj)
                    this.emailAddress = emainObj.length == 0 ? "" : emainObj[0].address;
                    this.phoneNum = phoneObj.length == 0 ? "" : phoneObj[0].address;
                    })
            }
            catch(error) {
                console.log("get threed pids exception ", error)
            }
            var userId = global.mxMatrixClientPeg.matrixClient.getUserId();
            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(userId);
            this.ownerAccount = profileInfo.displayname;
        }
    }
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
        width: 440px;
        height: 294px;
        background: #FFFFFF;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
    }
    
    .accountManagerHeader {
        width: 100%;
        height: 42px;
    }

    .accountManagerTitle {
        display: inline-block;
        width: 142px;
        height: 22px;
        font-family: PingFangSC-Medium;
        font-size: 16px;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
        letter-spacing: 0px;
        float: left;
        margin: 18px 32px 18px 32px;
    }

    .el-icon-close {
        display: inline-block;
        padding: 18px 20px 18px 18px;
        float: right;
    }

    .accountManagerContentPage {
        width: 360px;
        height: 104px;
        background: #FFFFFF;
        border: 0px solid rgba(221,221,221,1);
        border-radius: 4px;
        list-style: none;
        margin-left: 40px;
        padding-left: 0px;
    }

    .accountManagerContentPageBind {
        width: 360px;
        height: 125px;
        background: #FFFFFF;
        border: 0px solid rgba(221,221,221,1);
        border-radius: 4px;
        list-style: none;
        margin-left: 40px;
        padding-left: 0px;
    }

    .phoneBind {
        width: 100%;
        height: 52px;
    }

    .phoneBindImg {
        width: 20px;
        height: 20px;
        float: left;
        padding: 15px 15px 15px 4px;
    }

    .phoneBindLabel {
        width: 100px;
        height: 20px;
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(51, 51, 51, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: left;
        padding: 15px 15px 15px 4px;
    }

    .phoneBindBtn {
        height: 20px;
        font-size:14px;
        font-weight:400;
        color: rgba(36, 179, 107, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: right;
        padding: 15px 15px 15px 15px;
    }

    .phoneBindBtn:hover {
        height: 20px;
        font-size:14px;
        font-weight:400;
        color: rgba(36, 179, 107, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: right;
        padding: 15px 15px 15px 15px;
        cursor: pointer;
    }

    .phoneBinded {
        height: 20px;
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(153, 153, 153, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: right;
        padding: 15px 15px 15px 4px;
    }

    .phoneBindedDel {
        width: 20px;
        height: 20px;
        float: right;
        padding: 15px 15px 15px 4px;
    }

    .accountInfo {
        width: 100%;
        height: 52px;
    }

    .accountInfoImg {
        width: 20px;
        height: 20px;
        float: left;
        padding: 15px 15px 15px 4px;
    }

    .accountInfoLabel {
        width: 100px;
        height: 20px;
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(51, 51, 51, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: left;
        padding: 15px 15px 15px 4px;
    }

    .accountInfoLabel1 {
        height: 20px;
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(153, 153, 153, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: right;
        padding: 15px 15px 15px 15px;
    }

    .emailBind {
        width: 100%;
        height: 52px;
    }

    .el-icon-message {
        width: 40px;
        height: 40px;
        float: left;
        padding: 0;
    }
    
    .emailBindImg {
        width: 20px;
        height: 20px;
        float: left;
        padding: 15px 15px 15px 4px;
    }

    .emailBindLabel {
        width: 50px;
        height: 20px;
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(51, 51, 51, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: left;
        padding: 15px 15px 15px 4px;
    }

    .emailBindBtn {
        height: 20px;
        font-size:14px;
        font-weight:400;
        color: rgba(36, 179, 107, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: right;
        padding: 15px 15px 15px 15px;
    }

    .emailBindBtn:hover {
        height: 20px;
        font-size:14px;
        font-weight:400;
        color: rgba(36, 179, 107, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: right;
        padding: 15px 15px 15px 15px;
        cursor: pointer;
    }

    .emailBinded {
        height: 20px;
        font-size:14px;
        font-family: PingFangSC-Regular;
        font-weight:400;
        color:rgba(153, 153, 153, 1);
        line-height:20px;
        letter-spacing: 0px;
        float: right;
        padding: 15px 15px 15px 4px;
    }

    .emailBindedDel {
        width: 20px;
        height: 20px;
        float: right;
        padding: 15px 15px 15px 4px;
    }

    .toSetAddressLabel {
        width: 92%;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        font-family: PingFangSC-Regular;
        color: #333333;
        line-height: 20px;
        letter-spacing: 0px;
        float: left;
        margin: 10px 14px 4px 0px;
    }

    .toSetAddressLabelState {
        width: calc(100% - 28px);
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 0px;
        float: left;
        margin: 14px 14px 5px 14px;
    }

    .toSetAddressInput {
        width: 360px;
        height: 32px;
        background: #FFFFFF;
        color: rgba(153, 153, 153, 1);
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 5px 13px 0px 0px;
        padding-left: 8px;
    }

    .reSendBtn {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: white;
        border:0px;
        color: rgba(36, 179, 107, 1);
    }

    .reSendBtn:disabled {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: white;
        border:0px;
        color: #DDDDDD;
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
        color: white;
        border-radius:4px;
        border: none;
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
        border: none;

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
        border: none;

    }

    .accountManagerCancleButton {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        margin-right: 20px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
    }
</style>
