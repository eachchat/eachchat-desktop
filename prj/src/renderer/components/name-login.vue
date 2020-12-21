<template>
    <div class="login" data-vector-indexeddb-worker-script="../../packages/data/IndexeddbWorker.js">
        <!-- <div class="welcome-panel" v-if="isCheckToken()">
            <p class="welcome-zh-line1">您好，</p><p class="welcome-zh-line2">欢迎使用易企聊!</p>
            <p class="welcome-en">Hello, welcome to user EachChat!</p>
            <div class="welcome-loading">
                <i class="el-icon-loading"></i><p class="welcome-loading-text">{{loadingProcess}}，请稍后...</p>
            </div>
            <p class="copy-right">版权所有 2019-2020 workly.ai 保留所有权利</p>
        </div> -->
        <!-- <div class="login-panel" v-else style="-webkit-app-region: no-drag"> -->
        <div class="windowHeader">
            <mac-window-header class="macWindowHeader" @Close="Close()" @Min="Min()" @Max="Max()" :showMax="false"></mac-window-header>
            <winHeaderBar @Close="Close()" @Min="Min()" @Max="Max()" :showMax="false"></winHeaderBar>
        </div>
        <!-- <certification v-show="showCertification" :backupInfo="backupInfo"></certification>
        <generalSecureBackUpPage v-show="showGeneralRecoveryKeyPage"></generalSecureBackUpPage> -->
        <div class="login-panel" v-show="showLoginView">
            <div class="organization-content" v-show="showOrganizationView" @keydown="keyHandle($event)">
                <div class="host-title" v-if="showOrganizationViewHost">
                    服务器设置
                </div>
                <div class="title" v-else>
                    <div class="title-ico">
                        <img ondragstart="return false" class="login-logo" src="../../../static/Img/Login/logo@2x.png">
                    </div><div class="tltle-content">
                        {{$t("appName")}}
                    </div>
                </div>
                <div class="item-organization" id="item-organization-id">
                    <p class="organizaiton-title">
                        {{organizationOrHost}}
                    </p>
                    <input prefix="ios-contact-outline"  id="organizationInput" v-model="organizationAddress" placeholder="组织名称" class="item-input" @input="toDected()" @keyup.delete="resetLoginStateTitle()"/>
                    <p class="organization-input-label" v-show="false">{{eachChatEndPoint}}</p>
                    <input prefix="ios-contact-outline" v-model="addressPort" placeholder="" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()" v-show="false"/>
                </div>
                <div class="organizationLogin-state">
                    <p class="state-title" id="organizationLoginStateLabel">{{loginState}}</p>
                    <i class="el-icon-loading" v-show="isLoading"></i>
                </div>
                <div class="btn-item">
                    <Button type="success" v-show="showOrganizationViewHost" @click="hostConfirmButtonClicked()">确定</Button>
                    <Button class="hostCancle" type="cancel" v-show="showOrganizationViewHost" @click="hostCancelButtonClicked()">取消</Button>
                    <Button class="organizationConfirm" type="success" v-show="showOrganizationViewOrganization" :disabled="organizationButtonDisabled" @click="organizationConfirmButtonClicked()">{{$t("confirm")}}</Button>
                </div>
                <div class="organization-finder-tip" v-show="false">
                    <p class="forget-title">{{$t("forgetOrganization")}}</p><p
                    class="finder-title" @click="organizationFinderClicked()">{{$t("retrieveOrganization")}}</p>
                </div>
                <div class="login-footer" v-show="showOrganizationViewHost" @click="organizationFinderBackToLoginClicked()">
                        <img ondragstart="return false" class="back-image" src="../../../static/Img/Login/back-20px@2x.png">
                        <p class="back-title">返回</p>
                </div>
            </div>
            <div class="account-content" v-show="!showOrganizationView">
                <div class="username-content" v-show="showUsernameLoginView">
                    <div class="title">
                            {{loginPageTitle}}
                    </div>
                    <div class="item-account">
                        <p class="account-title">
                            {{loginPageAccountLabel}}
                        </p>
                        <input prefix="ios-contact-outline" id="accountInputId" v-model="username" :placeholder="loginPageAccountPlaceholder" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()"/>
                    </div>
                    <div class="item-pwd">
                        <p class="password-title">
                            {{loginPagePwdLabel}}
                        </p>
                        <div class="inputDiv" id="inputDivId">
                            <input prefix="ios-lock-outline" type="password" id="passwordInputId" v-model="password" :placeholder="loginPagePwdPlaceholder" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()" @keyup.enter="login()"/>
                            <img class="el-icon-view" @click="toShowPwd" v-show="!showPwd" src="../../../static/Img/Login/hide-pwd@2x.png">
                            <img class="el-icon-moon" @click="toShowPwd" v-show="showPwd" src="../../../static/Img/Login/view-pwd@2x.png">
                        </div>
                    </div>
                    <div class="accountLogin-state" v-show="false">
                            <p class="state-title" id="accountLoginStateLabel">{{loginState}}</p>
                            <i class="el-icon-loading" v-show="isLoading"></i>
                    </div>
                    <div class="forget-password" @click="toResetPwd" :disabled="forgetPwdButtonDisabled">{{forgetPasswordContent}}</div>
                    <div class="btn item">
                        <Button :disabled="loginButtonDisabled" type="success" id="loginButton" @click="login()">{{LoginBtnText}}</Button>
                    </div>
                    <div class="otherlogin" v-show="true">
                        <div class="userphone-login" @click="userPhoneLoginClicked()" v-show="supportUserPhoneLogin && false">
                            {{$t("loginThroughSMS")}}
                        </div><div class="useremail-login" @click="userEmailLoginClicked()" v-show="supportEmailLogin && false">
                            {{$t("loginThroughEmail")}}
                            </div>
                    </div>
                    <div class="login-footer" @click="organizationFinderBackToLoginClicked()">
                            <img ondragstart="return false" class="back-image" src="../../../static/Img/Login/back-20px@2x.png">
                            <p class="back-title">{{$t("goBack")}}</p>
                    </div>
                </div>
                <div class="userphone-content" v-show="showUserphoneLoginView">
                    <div class="title">
                        手机验证码登录
                    </div>
                    <div class="item-account">
                        <p class="account-title">
                            +86
                        </p>
                        <div class="account-separate">
                        </div>
                        <input prefix="ios-contact-outline" v-model="username" placeholder="请输入手机号" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()"/>
                    </div>
                    <div class="item-pwd">

                        <input prefix="ios-lock-outline"  v-model="password" placeholder="请输入验证码" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()" @keyup.enter="login()"/>
                        <p class="password-title" :style="{'color': userPhoneSendColor}" @click="userPhoneSendCodeClicked()">
                            {{ userPhoneSendCodeValue }}
                        </p>
                    </div>
                    <div class="accountLogin-state">
                            <p class="state-title" id="accountLoginStateLabel">{{loginState}}</p>
                            <i class="el-icon-loading" v-show="isLoading"></i>
                    </div>
                    <div class="btn item">
                        <Button type="success" id="loginButton" @click="login()">登录</Button>
                    </div>
                    <div class="otherlogin">
                        <div class="userphone-login" @click="userNameLoginClicked()">
                            用户名密码登录
                        </div><div class="useremail-login" @click="userEmailLoginClicked()">
                            邮箱验证码登录
                            </div>
                    </div>
                    <div class="login-footer" @click="organizationFinderBackToLoginClicked()">
                            <img ondragstart="return false" class="back-image" src="../../../static/Img/Login/back-20px@2x.png">
                            <p class="back-title">返回</p>
                    </div>
                </div>
                <div class="useremail-content" v-show="showUseremailLoginView">
                    <div class="title">
                        邮箱验证码登录
                    </div>
                    <div class="item-account">
                        <input prefix="ios-contact-outline" v-model="username" placeholder="请输入邮箱账号" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()"/>
                    </div>
                    <div class="item-pwd">
                        <input prefix="ios-lock-outline"  v-model="password" placeholder="请输入验证码" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()" @keyup.enter="login()"/>
                        <p class="password-title" :style="{'color': userEmailSendColor}" @click="userEmailSendCodeClicked()">
                            {{ userEmailSendCodeValue }}
                        </p>
                    </div>
                    <div class="accountLogin-state">
                            <p class="state-title" id="accountLoginStateLabel">{{loginState}}</p>
                            <i class="el-icon-loading" v-show="isLoading"></i>
                    </div>
                    <div class="btn item">
                        <Button type="success" id="loginButton" @click="login()">登录</Button>
                    </div>
                    <div class="otherlogin">
                        <div class="userphone-login" @click="userNameLoginClicked()">
                            用户名密码登录
                        </div><div class="useremail-login" @click="userPhoneLoginClicked()">
                            手机验证码登录
                            </div>
                    </div>
                    <div class="login-footer" @click="organizationFinderBackToLoginClicked()">
                            <img ondragstart="return false" class="back-image" src="../../../static/Img/Login/back-20px@2x.png">
                            <p class="back-title">返回</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="organizationFinder-panel" v-show="showOrganizationFinderView">
            <div class="finder-header">
                <p class="header-title">找回组织ID</p>
                <p class="header-tip">通过邮箱查找您的组织ID</p>
            </div>
            <div class="finder-body">
                <div class="item-server">
                    <p class="server-title">
                        邮箱
                    </p>
                    <input class="item-server-input" prefix="ios-contact-outline" :disabled="organizationButtonDisabled" v-model="emialAddress" placeholder="请输入邮箱" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()" @keyup.enter="organizationFinderConfirmClicked()"/>
                </div>
                <div class="organizationFinder-state">
                    <p class="state-title" id="accountLoginStateLabel">{{loginState}}</p>
                    <i class="el-icon-loading" v-show="isLoading"></i>
                </div>
                <div class="btn-item">
                    <Button class="server-confirm-button" type="success" :disabled="emialAddressButtonDisabled" @click="organizationFinderConfirmClicked()" >{{ emailSendButtonValue }}</Button>
                </div>
            </div>
            <div class="setting-footer" @click="organizationFinderBackToLoginClicked()">
                    <img ondragstart="return false" class="back-image" src="../../../static/Img/Login/back-20px@2x.png">
                    <p class="back-title">返回</p>
            </div>
        </div>
        <div class="loginLoading-view" v-show="showLoadingView">
            <img ondragstart="return false" class="loading-img" src="../../../static/Img/Login/loading.gif">
            <p class="loading-title">{{ loadingProcess }}</p>
        </div>
        <div class="server-setting-div" v-show="showOrganizationView && showOrganizationViewOrganization && false">
            <div class="server-setting" @click="serverSettingClicked()" v-show="showOrganizationView && showOrganizationViewOrganization">{{$t("homeServerAddress")}}</div>
            <i class="el-icon-caret-bottom" v-show="showOrganizationView && showOrganizationViewOrganization"></i>
        </div>
        <div class="domain-dropdown-content" id="domain-dropdown-content-id" v-show="showDomListView">
            <ul class="domain-list" id="domain-list-id">
                <li class="domain-item" v-for="domainItem in DomainList" @click="selectDomain(domainItem)" v-html="msgContentHeightLight(domainItem)">
                </li>
            </ul>
        </div>
        <el-dropdown class="language" size="small" @command="handleCommand" v-show="showOrganizationView && false">
            <span class="login-setup-language-label" id="login-language-label">
                简体中文
            </span>
            <i class="el-icon-caret-bottom"></i>
            <el-dropdown-menu>
                <el-dropdown-item command="zh">简体中文</el-dropdown-item>
                <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="AlertConfirm" :width="alertWidth" :height="alertHeight" :contentLeft="alertContentLeft" :iconType="iconType"/>
    </div>
</template>

<script>
import os from 'os';
import {ipcRenderer} from 'electron'
import {environment} from '../../packages/data/environment.js'
import macWindowHeader from './macWindowHeader.vue';
import winHeaderBar from './win-header-login.vue';
import certification from './Certificate.vue';
import generalSecureBackUpPage from './generalRecoveryCode.vue'
import {getDefaultHomeServerAddr} from '../../config.js'
import log from 'electron-log';
import AlertDlg from './alert-dlg.vue'
import { windowsStore } from 'process';
import * as Matrix from 'matrix-js-sdk';
export default {
    name: 'login',
    components:{
        macWindowHeader,
        winHeaderBar,
        certification,
        generalSecureBackUpPage,
        AlertDlg
    },
    data () {
        return {
            ulElement: undefined,
            curSelectedIndex: 0,
            appServerHost: "http://139.198.18.180:8888",//"https://chat.yunify.com",
            showPwd: false,
            forgetPwdButtonDisabled: false,
            iconType: "alert",
            LoginBtnText: "登录",
            alertWidth: 0,
            alertHeight: 0,
            alertContentLeft: 0,
            alertContnets: {},
            showAlertDlg: false,
            showEmailSendPage: false,
            sessionId: '',
            identityServerDomain: null,
            clientSecret: null,
            pwdResetClient: null,
            isRecetPwd: false,
            toVerfyEmail: false,
            isLdap: false,
            isMatrixPwd: false,
            forgetPasswordContent: '',
            loginPageTitle: '',
            loginPageAccountLabel: '',
            loginPageAccountPlaceholder: '',
            loginPagePwdLabel: '',
            loginPagePwdPlaceholder: '',
            toDetect: true,
            showDomListView: false,
            DomainList: [],
            searchId: 0,
            isLoading: false,
            backupInfo: {},
            showGeneralRecoveryKeyPage: false,
            showCertification: false,
            loginState: '',
            username: '',
            password: '',
            host: '',
            port: '',
            services: null,
            tokenExpired: false,
            tokenRefreshing: true,
            loadingProcess: '正在验证登录信息',
            organizationOrHost: '',
            eachChatEndPoint: '',
            showOrganizationViewHost: false,
            showOrganizationViewOrganization: true,

            emailSendButtonValue:'发送',
            userEmailSendCodeValue:'发送验证码',
            userPhoneSendCodeValue:'发送验证码',
            userPhoneSendCodeTime: 0,
            userEmailSendCodeTime: 0,


            organizationButtonDisabled: false,
            emialAddressButtonDisabled:false,
            loginButtonDisabled: false,

            organizationFinderEmailTime:0,
            organizationAddress:'',
            addressPort: 443,
            emialAddress:'',
            showLoginView: false,
            showUsernameLoginView: true,
            defaultIdentity: '',
            threeAuthType: '',
            supportedIdentity: [],
            showUserphoneLoginView: false,
            showUseremailLoginView: false,
            showUserWeiXinView: false,
            showUserZhifubaoView: false,
            //showServerSettingView: false,
            showOrganizationView: true,
            showOrganizationFinderView: false,
            showLoadingView: true,
            backupInfo: null,
            backupSigStatus: null,
            backupKeyStored: null,
        }
    },
    computed:{
        supportUserPhoneLogin: function() {
            let supportedType = this.supportedIdentity.map(x => x['type']);
            console.log("===========supportedtype ", supportedType)
            if(supportedType.indexOf("m.login.verCode.msisdn") > 0) {
                return true;
            }
            return false;
        },
        supportEmailLogin: function() {
            let supportedType = this.supportedIdentity.map(x => x['type']);
            console.log("===========supportedtype ", supportedType)
            if(supportedType.indexOf("m.login.verCode.email") > 0) {
                return true;
            }
            return false;
        },
        userPhoneSendColor:function(){
            if(this.userPhoneSendCodeTime > 0){
                return 'rgba(153, 153, 153, 1)';
            }else{
                return 'rgba(36, 179, 107, 1)'
            }

        },
        userEmailSendColor:function(){
            if(this.userEmailSendCodeTime > 0){
                return 'rgba(153, 153, 153, 1)';
            }else{
                return 'rgba(36, 179, 107, 1)'
            }
        }
    },
    methods: {
        toShowPwd: function() {
            console.log("=============")
            this.showPwd = !this.showPwd;
            var pwdElement = document.getElementById("passwordInputId");
            if(this.showPwd) {
                pwdElement.type = "text";
            }
            else {
                pwdElement.type = "password";
            }
        },
        toResetPwd: function() {
            this.loginPageTitle = "重置密码";
            this.loginPageAccountLabel = "邮箱";
            this.loginPageAccountPlaceholder = "请输入您的邮箱";
            this.loginPagePwdLabel = "新密码";
            this.loginPagePwdPlaceholder = "请输入新密码";
            this.LoginBtnText = "确认";
            this.forgetPasswordContent = "";
            this.forgetPwdButtonDisabled = true;
            this.username = "";
            this.password = "";
            this.isLdap = false;
            this.isMatrixPwd = false;
            this.isRecetPwd = true;
            this.toVerfyEmail = false;
            var identityUrl = global.localStorage.getItem("mx_i_url");
            var homeServerUel = global.localStorage.getItem("mx_hs_url");
            this.pwdResetClient = Matrix.createClient({
                baseUrl: homeServerUel,
            });
            this.clientSecret = this.pwdResetClient.generateClientSecret();
            this.identityServerDomain = identityUrl ? identityUrl.split("://")[1] : null;
        },
        doesServerRequireIdServerParam() {
            return this.pwdResetClient.doesServerRequireIdServerParam();
        },
        resetPassword(emailAddress, newPassword) {
            this.password = newPassword;
            return this.pwdResetClient.requestPasswordEmailToken(emailAddress, this.clientSecret, 0).then((res) => {
                this.sessionId = res.sid;
                return res;
            }, function(err) {
                if (err.errcode === 'M_THREEPID_NOT_FOUND') {
                    err.message = _t('This email address was not found');
                } else if (err.httpStatus) {
                    err.message = err.message + ` (Status ${err.httpStatus})`;
                }
                throw err;
            });
        },
        async checkEmailLinkClicked() {
            const creds = {
                'sid': this.sessionId,
                'client_secret': this.clientSecret,
            };
            if (await this.doesServerRequireIdServerParam()) {
                creds.id_server = this.identityServerDomain;
            }

            try {
                var ret = await global.mxMatrixClientPeg.setPassword(this.sessionId, this.clientSecret, this.password)
                console.log("ret is ", ret);
                return;
                // await this.pwdResetClient.setPassword({
                //     // Note: Though this sounds like a login type for identity servers only, it
                //     // has a dual purpose of being used for homeservers too.
                //     type: "m.login.email.identity",
                //     // TODO: Remove `threepid_creds` once servers support proper UIA
                //     // See https://github.com/matrix-org/synapse/issues/5665
                //     // See https://github.com/matrix-org/matrix-doc/issues/2220
                //     threepid_creds: creds
                //     // threepidCreds: creds,
                // }, this.password);
            } catch (err) {
                console.log("==========err is ", err);
                if (err.httpStatus === 401) {
                    err.message = "邮箱验证失败：请确保你已点击邮件中的链接";
                } else if (err.httpStatus === 404) {
                    err.message =
                        '你似乎没有将此邮箱地址同在此主服务器上的任何一个 Matrix 账号绑定。';
                } else if (err.httpStatus) {
                    err.message += ` (Status ${err.httpStatus})`;
                }
                throw err;
            }
        },
        msgContentHeightLight: function(showContent) {
            if(this.showOrganizationView) {
                if(this.organizationAddress.length == 0) {
                    return showContent
                }
                if(showContent.indexOf(this.organizationAddress) != -1) {
                    let splitValue = showContent.split(this.organizationAddress);
                    let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.organizationAddress + "</span>");
                    return newInnerHtml;
                }
                else if(showContent.indexOf(this.organizationAddress.toLowerCase()) != -1) {
                    let splitValue = showContent.split(this.organizationAddress.toLowerCase());
                    let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.organizationAddress.toLowerCase() + "</span>");
                    return newInnerHtml;
                }
                else if(showContent.indexOf(this.organizationAddress.toUpperCase()) != -1) {
                    let splitValue = showContent.split(this.organizationAddress.toUpperCase());
                    let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.organizationAddress.toUpperCase() + "</span>");
                    return newInnerHtml;
                }
                else{
                    return showContent;
                }
            }
        },
        serverSettingClicked: function() {
            // var distElement = document.getElementById("item-organization-id");
            // if(distElement != undefined) {
            //     distElement.style.height = "78px";
            // }
            this.organizationAddress = window.localStorage.getItem("mx_hs_url") == null ? "https://matrix.each.chat" : window.localStorage.getItem("mx_hs_url");
            this.showOrganizationViewHost = true;
            this.showOrganizationViewOrganization = false;
            this.eachChatEndPoint = '';
            this.organizationOrHost = this.$t("homeServerAddress");
        },
        hostConfirmButtonClicked: async function() {
            var host = this.organizationAddress;
            if(host.endsWith("/")) {
                host = host.substring(0, host.length - 1);
            }
            if(host.indexOf("http://") < 0 && host.indexOf("https://") < 0) {
                host = "https://" + host;
            }
            var serverCheckRet = await this.getServerInfo(host);
            if(serverCheckRet) {
                this.resetLoginStateTitle();
                this.showOrganizationViewHost = false;
                this.eachChatEndPoint = '';
                this.organizationOrHost = this.$t("joinYourOrganization");
                this.organizationAddress = (window.localStorage.getItem("Domain") == undefined || window.localStorage.getItem("Domain") == "undefined") ? "" : window.localStorage.getItem("Domain");
                this.showOrganizationViewOrganization = true;
            }
        },
        getHostPortTls(BaseUrl) {
            if(BaseUrl.endsWith("/")) {
                BaseUrl = BaseUrl.substring(0, BaseUrl.length - 1);
            }
            let IHostTls = 1;
            let IHost = "";
            let IHostPort = 443;
            if(BaseUrl.toLowerCase().indexOf("https://") >= 0) {
                let IHostTmp = BaseUrl.split("https://")[1];
                if(IHostTmp.indexOf(":") >= 0) {
                    IHost = IHostTmp.split(":")[0];
                    IHostPort = IHostTmp.split(":")[1];
                }
                else {
                    IHost = IHostTmp;
                    IHostPort = 443;
                }
                IHostTls = 1;
            }
            else if(BaseUrl.toLowerCase().indexOf("http://") >= 0) {
                let IHostTmp = BaseUrl.split("http://")[1];
                if(IHostTmp.indexOf(":") >= 0) {
                    IHost = IHostTmp.split(":")[0];
                    IHostPort = IHostTmp.split(":")[1];
                }
                else {
                    IHost = IHostTmp;
                    IHostPort = 80;
                }
                IHostTls = 0;
            }
            else {
                IHost = BaseUrl;
                IHostPort = 443;
            }
            return [IHost, IHostPort, IHostTls];
        },
        getServerInfo: async function(host) {
            var appServerInfo = await global.mxMatrixClientPeg.getAppServerInfo(host);
            console.log('appServerInfo is ', appServerInfo);
            if(appServerInfo.status != 200) {
                this.$toastMessage({message:"Home Server地址不正确，请重新输入", time: 2000, type:'success', showWidth:'280px', showHeight:"100px"});
                return false;
            }
            // if(appServerInfo.data['m.homeserver'] != undefined) {
            //     global.localStorage.setItem("mx_hs_url", appServerInfo.data['m.homeserver']['base_url']);
            // }
            if(appServerInfo.data['m.identity_server'] != undefined) {
                global.localStorage.setItem("mx_i_url", appServerInfo.data['m.identity_server']['base_url']);
            }
            // if(appServerInfo.data['m.appserver'] != undefined) {
            //     var appServerHostInfo = appServerInfo.data['m.appserver']['base_url'];
                
            //     var appServerHostObj = this.getHostPortTls(appServerHostInfo);
            //     var AHost = appServerHostObj[0];
            //     var AHostPort = appServerHostObj[1];
            //     var AHostTls = appServerHostObj[2];
                
            //     localStorage.setItem("hostname", AHost);
            //     localStorage.setItem("apiPort", AHostPort);
            //     localStorage.setItem("hostTls", AHostTls);
            //     localStorage.setItem("app_server", appServerHostInfo);
            // }
            // if(appServerInfo.data['m.mqttserver'] != undefined) {
            //     var mqttHostInfo = appServerInfo.data['m.mqttserver']['base_url'];
                
            //     var mqttHostObj = this.getHostPortTls(mqttHostInfo);
            //     var mqttHost = mqttHostObj[0];
            //     var mqttHostPort = mqttHostObj[1];
            //     var mqttHostTls = mqttHostObj[2];
                
            //     localStorage.setItem("mqttHost", AHost);
            //     localStorage.setItem("mqttPort", AHostPort);
            //     localStorage.setItem("mqttTls", AHostTls);
            // }
            // if(appServerInfo.data['m.gms'] != undefined) {
            //     var gmsHostInfo = appServerInfo.data['m.gms']['base_url'];
            //     localStorage.setItem("gms_url", appServerInfo.data['m.gms']['base_url']);
            //     localStorage.setItem("gms_tid", appServerInfo.data['m.gms']['tid']);
            // }
            return true;
        },
        checkHomeServer: async function (domain){            
            var Domain = "";
            if(domain != null && domain != undefined) {
                Domain = domain;
            }
            console.log("1 Domain is ", Domain);
            if(Domain == "") {
                Domain = window.localStorage.getItem("Domain");
            }
            console.log("2 Domain is ", Domain);
            if(Domain == undefined || Domain == null || Domain == "undefined") {
                Domain = "";
            }
            console.log("4 Domain is ", Domain);
            this.organizationAddress = Domain;
            console.log("Domain is ", this.organizationAddress);
            if(Domain.length == 0) {
                return false;
            }
            
            var gmsRet = await global.services.common.newGmsConfiguration(Domain, this.appServerHost);
            console.log("gmsRet is ", gmsRet);
            if(!gmsRet){
                if(domain != undefined){
                    this.$toastMessage({message:"未找到该组织", time: 2000, type:'error', showWidth:'280px'});
                }
                this.organizationButtonDisabled = false;
                return false;
            }
            var host = window.localStorage.getItem("mx_hs_url");
            if(host == null) {
                return false;
            }
            var serverCheckRet = await this.getServerInfo(host);
            if(!serverCheckRet) {
                return false;
            }
            var loginSettingRet = await global.services.common.getLoginConfig(this.appServerHost);
            if(!loginSettingRet) {
                if(domain != undefined){
                    this.$toastMessage({message:"获取登录配置失败", time: 2000, type:'error', showWidth:'280px'});
                }
                this.organizationButtonDisabled = false;
                return false;
            }
            window.localStorage.setItem("Domain", domain);
            var host = "";
            // if(address == undefined || address == null) {
            host = window.localStorage.getItem("mx_hs_url") == null ? "https://matrix.each.chat" : window.localStorage.getItem("mx_hs_url");
            // }
            // else {
            //     host = address
            // }
            console.log("=======host si ", host);
            if(host.indexOf("https://") < 0 && host.indexOf("http://") < 0) {
                host = "https://" + host;
            }
            return global.mxMatrixClientPeg.checkHomeServer(host).then(async (flows) => {
                console.log("matrix get flows is ", flows)
                this.supportedIdentity = flows;
                for (let i = 0; i < flows.length; i++ ) {
                    this.resetLoginStateTitle();
                    if(window.localStorage.getItem("Domain") == null) {
                        return false;
                    }
                    else {
                        return true;
                    }
                    // var appServerInfo = await global.mxMatrixClientPeg.getAppServerInfo();
                    // console.log('appServerInfo is ', appServerInfo);
                    // if(appServerInfo.status != 200) {
                    //     this.loginState = this.$t("invalidServerAddress");
                    //     return false;
                    // }
                    // if(appServerInfo.data['m.gms'] != undefined) {
                    //     var gmsHost = appServerInfo.data['m.gms']['base_url'];
                    //     var gmsValue = appServerInfo.data['m.gms']['tid'];
                    //     var gmsRet = await global.services.common.gmsConfiguration(gmsValue, gmsHost);
                    //     if(!gmsRet){
                    //         this.loginState = "未找到该组织";
                    //         this.organizationButtonDisabled = false;
                    //         return false;
                    //     }
                    //     else {
                    //         this.organizationButtonDisabled = false;
                    //         return true;
                    //     }
                    // }
                    // else if(appServerInfo.data['m.appserver'] != undefined){
                    //     global.services.common.setGmsConfiguration(appServerInfo.data);
                    //     return true;
                    // }
                }
                
                this.loginState = this.$t("invalidServerAddress");
                this.organizationButtonDisabled = false;
                return false;
            },(err) => {
                this.loginState = this.$t("invalidServerAddress");
                this.organizationButtonDisabled = false;
                return false;
            })
        },
        hostCancelButtonClicked: async function() {
            var host = this.organizationAddress;
            if(host.endsWith("/")) {
                host = host.substring(0, host.length - 1);
            }
            if(host.indexOf("http://") < 0 && host.indexOf("https://") < 0) {
                host = "https://" + host;
            }
            var serverCheckRet = await this.getServerInfo(host);
            if(serverCheckRet) {
                this.resetLoginStateTitle();
                this.showOrganizationViewHost = false;
                this.eachChatEndPoint = '';
                this.organizationOrHost = this.$t("joinYourOrganization");
                this.organizationAddress = (window.localStorage.getItem("Domain") == undefined || window.localStorage.getItem("Domain") == "undefined") ? "" : window.localStorage.getItem("Domain");
                this.showOrganizationViewOrganization = true;
            }
        },
        handleCommand(command) {
            var languageElement = document.getElementById("login-language-label");
            this.$i18n.locale = command;
            global.mxMatrixClientPeg.setCurLanguage(command);
            switch(command) {
                case "zh":
                    if(languageElement) {
                        languageElement.innerHTML = "中文"
                    }
                    break;
                case "en":
                    if(languageElement) {
                        languageElement.innerHTML = "English"
                    }
                    break;
            }
        },
        Close: function() {
            ipcRenderer.send("win-close");
        },
        Min: function() {
            ipcRenderer.send("win-min");
        },
        Max: function() {
            ipcRenderer.send("win-max");
        },
        resetLoginStateTitle(){
            this.loginState = "";
            var accountInputDom = document.getElementById("accountInputId");
            accountInputDom.style.borderColor = "rgba(221,221,221,1)";
            var passwordInputDom = document.getElementById("passwordInputId");
            passwordInputDom.style.borderColor = "rgba(221,221,221,1)";
            var passwordInputDivDom = document.getElementById("inputDivId");
            passwordInputDivDom.style.borderColor = "rgba(221,221,221,1)";
            return;
        },
        keyHandle(event) {
            if(event.code == "ArrowDown" || event.code == "ArrowUp") {
                if(!this.showDomListView) {
                    return;
                }
                
                event.preventDefault();
                if(this.ulElement == undefined) {
                    this.ulElement = document.getElementById("domain-list-id");
                }
                switch(event.keyCode) {
                    case 38: {
                        console.log("=======up ", this.curSelectedIndex);
                        if(this.curSelectedIndex == 0) {
                            this.curSelectedIndex = this.ulElement.children.length - 1;
                            this.ulElement.children[0].style.backgroundColor = "rgba(255, 255, 255, 1)";
                            this.ulElement.scrollTo({ top:this.ulElement.children[this.curSelectedIndex].offsetTop, behavior: 'smooth' });
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgba(221, 221, 221, 1)";
                        }
                        else if(this.curSelectedIndex > 0 && this.curSelectedIndex < this.ulElement.children.length) {
                            this.curSelectedIndex--;
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgba(221, 221, 221, 1)";
                            this.ulElement.children[this.curSelectedIndex+1].style.backgroundColor = "rgba(255, 255, 255, 1)";
                        }
                        else if(this.curSelectedIndex == this.ulElement.children.length) {
                            this.curSelectedIndex--;
                            this.ulElement.children[0].style.backgroundColor = "rgba(221, 221, 221, 1)";
                            this.ulElement.scrollTo({ top:this.ulElement.children[0].offsetTop, behavior: 'smooth' });
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgba(255, 255, 255, 1)";
                        }
                        break;
                    }
                    case 40: {
                        console.log("=======down", this.curSelectedIndex);
                        if(this.curSelectedIndex == this.ulElement.children.length) {
                            this.ulElement.children[this.curSelectedIndex-1].style.backgroundColor = "rgba(255, 255, 255, 1)";
                            this.ulElement.scrollTo({ top:0, behavior: 'smooth' });
                            this.ulElement.children[0].style.backgroundColor = "rgba(221, 221, 221, 1)";
                            this.curSelectedIndex = 0;
                        }
                        else if(this.curSelectedIndex < this.ulElement.children.length) {
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgba(221, 221, 221, 1)";
                            if(this.ulElement.children[this.curSelectedIndex-1]){
                                this.ulElement.children[this.curSelectedIndex-1].style.backgroundColor = "rgba(255, 255, 255, 1)";
                            }
                            this.curSelectedIndex++;
                        }
                        break;
                    }
                }
            }
            else if(event.code == "Enter" && !event.ctrlKey) {
                if(this.showDomListView && this.showOrganizationView) {
                    if(this.ulElement == undefined) {
                        this.ulElement = document.getElementById("domain-list-id");
                    }
                    var selectedIndex = -1;
                    for(var i=0;i<this.ulElement.children.length;i++) {
                        if(this.ulElement.children[i].style.backgroundColor == "rgba(221, 221, 221, 1)" || this.ulElement.children[i].style.backgroundColor == "rgb(221, 221, 221)") {
                            selectedIndex = i;
                            break;
                        }
                    }
                    console.log("*** selectedIndex is ", selectedIndex);
                    if(selectedIndex != -1) {
                        var domainInfo = this.DomainList[i];
                        this.DomainList = [];
                        this.showDomListView = false;
                        this.selectDomain(domainInfo);
                    }
                }
                else if(!this.showDomListView && this.showOrganizationView) {
                    this.organizationConfirmButtonClicked();
                }
            }
        },
        toDected: function() {
            var orgInputDom = document.getElementById("organizationInput");
            orgInputDom.style.borderColor = "rgba(221,221,221,1)";
            this.organizationAddress = this.organizationAddress.trim();
            if(this.organizationAddress.length == 0 || !this.toDetect) {
                this.DomainList = [];
                this.showDomListView = false;
                return;
            }
            
            var curSearchId = new Date().getTime();
            console.log("searchkey is ", this.organizationAddress);
            var searchResult = {
                "id": curSearchId,
                "searchList": []
            };
            this.searchId = curSearchId;
            global.services.common.gmsDetector(this.organizationAddress, this.appServerHost)
                .then((ret) => {
                    console.log("gmsDetector ret is ", ret);
                    if(ret.data == undefined || ret.data.results == null) {
                        this.DomainList = [];
                        this.showDomListView = false;
                    }
                    else {
                        if(searchResult.id == this.searchId) {
                            this.DomainList = ret.data.results;
                            console.log("domainlist is ", this.DomainList);
                            if(this.DomainList != null && this.DomainList.length != 0) {
                                this.showDomainPage();
                            }
                        }
                    }
                })
        },
        selectDomain: function(item) {
            this.toDetect = false;
            this.DomainList = [];
            this.showDomListView = false;
            this.organizationAddress = item;
            this.$nextTick(() => {
                this.toDetect = true;
            })
            console.log("=============ffff ", this.showDomListView);
        },
        showDomainPage: function() {
            var domainInputElement = document.getElementById("organizationInput");
            var domainListElement = document.getElementById("domain-dropdown-content-id");
            var top = domainInputElement.offsetTop + domainInputElement.offsetHeight;
            var left = domainInputElement.offsetLeft;
            domainListElement.style.top = top + "px";
            domainListElement.style.left = left + "px";
            
            this.showDomListView = true;
            console.log("show=====showDomListView========", this.showDomListView);
        },
        organizationConfirmButtonClicked:async function(){
            this.organizationButtonDisabled = true;
            if(this.organizationAddress == "worklyai-open-dev-tools"){
                ipcRenderer.send("openDevTools");
                return;
            }
            if (this.organizationAddress == undefined || this.organizationAddress == ""){
                var orgInputDom = document.getElementById("organizationInput");
                orgInputDom.style.borderColor = "red";
                this.organizationButtonDisabled = false;
                return;
            }
            this.showDomListView = false;
            
            var domain = this.organizationAddress;// + ".each.chat";

            // var host = window.localStorage.getItem("mx_hs_url") == null ? "https://matrix.each.chat" : window.localStorage.getItem("mx_hs_url");
            // var detectorRet = await services.common.gmsDetector(address);
            console.log("domain is ", domain);
            this.checkHomeServer(domain)
                .then((result) => {
                    console.log(result);
                    if(!result){
                        this.loginState = this.$t("invalidServerAddress");
                        this.organizationButtonDisabled = false;
                        this.isLoading = false;
                        return;
                    }
                    // window.localStorage.setItem("Domain", this.organizationAddress);
                    // this.defaultIdentity = (result.defaultIdentity != undefined && result.defaultIdentity.identityType != undefined) ? result.defaultIdentity.identityType : '';
                    this.isLoading = false;
                    this.organizationButtonDisabled = false;
                    this.resetLoginStateTitle();
                    this.defaultIdentity = global.localStorage.getItem("authType");
                    this.threeAuthType = global.localStorage.getItem("threeAuthType");
                    if(this.defaultIdentity == "three" && this.threeAuthType == "ldap") {
                        this.isLdap = true;
                        this.isMatrixPwd = false;
                        this.loginPageTitle = "组织认证";
                        this.loginPageAccountLabel = "组织ID";
                        this.loginPageAccountPlaceholder = global.localStorage.getItem("userNamePlaceHolder");
                        this.loginPagePwdLabel = "密码";
                        this.loginPagePwdPlaceholder = global.localStorage.getItem("passwordPlaceHolder");
                        this.forgetPasswordContent = "";
                        this.username = "";
                        this.password = "";
                        this.showPwd = true;
                        this.toShowPwd();
                        this.forgetPwdButtonDisabled = true;
                    }
                    else {
                        this.isLdap = false;
                        this.isMatrixPwd = true;
                        this.loginPageTitle = "用户名登录";
                        this.loginPageAccountLabel = "用户名";
                        this.loginPageAccountPlaceholder = "请输入用户名";
                        this.loginPagePwdLabel = "密码";
                        this.loginPagePwdPlaceholder = "请输入密码";
                        this.forgetPasswordContent = "忘记密码";
                        this.username = "";
                        this.password = "";
                        this.showPwd = true;
                        this.toShowPwd();
                        this.forgetPwdButtonDisabled = false;
                    }
                    this.showLoginView = true;
                    this.showOrganizationView = false;
                })
            
        },
        organizationFinderClicked:async function(){
            this.resetLoginStateTitle();
            this.showLoginView = false;
            this.showOrganizationFinderView = true;
        },
        organizationFinderConfirmClicked:async function(){
            this.resetLoginStateTitle();
            if(this.emailFormatTest(this.emialAddress)){
                var result = await services.common.gmsGetUser(this.emialAddress);
                if(result){
                    this.emialAddressButtonDisabled = true;
                    this.time = 61;
                    this.$toastMessage({message:"发送成功", time: 2000, type:'success', showWidth:'280px'});
                    this.timer();
                }
                else{
                    this.loginState = "未找到匹配的组织ID";
                }
            }else{
                this.loginState = "邮箱格式不正确";
            }
        },
        emailFormatTest(email){
            var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

            return reg.test(email); 
        },
        phoneFormatTest(phone){
            var re = /^1\d{10}$/;
            return re.test(phone);
        },
        timer() {
            if (this.time > 1) {
                    this.time--;
                    this.emailSendButtonValue = "重新发送(" + this.time + "s)";
                    setTimeout(this.timer, 1000);
            } else{
                this.time = 0;
                this.emailSendButtonValue = "发送";
                this.emialAddressButtonDisabled = false;
            }
        },
        userPhoneSendCodeTimer(){
            if (this.userPhoneSendCodeTime > 1) {
                    this.userPhoneSendCodeTime --;
                    this.userPhoneSendCodeValue = "重新发送" + this.userPhoneSendCodeTime + "s";
                    setTimeout(this.userPhoneSendCodeTimer, 1000);
            } else{
                this.userPhoneSendCodeValue = "重新发送";
                this.userPhoneSendCodeTime = 0;
            }
        },
        userEmailSendCodeTimer(){
            if (this.userEmailSendCodeTime > 1) {
                    this.userEmailSendCodeTime --;
                    this.userEmailSendCodeValue = "重新发送" + this.userEmailSendCodeTime + "s";
                    setTimeout(this.userEmailSendCodeTimer, 1000);
            } else{
                this.userEmailSendCodeValue = "重新发送";
                this.userEmailSendCodeTime = 0;
            }
        },
        certificationShow() {
            this.resetLoginStateTitle();
            this.showLoginView = false;
            this.showOrganizationView = false;
            this.showOrganizationFinderView = false;
            this.showUserphoneLoginView = false;
            this.showUseremailLoginView = false;
            this.showUserWeiXinView = false;
            this.showUserZhifubaoView = false;
            this.showUsernameLoginView = false;
            this.showGeneralRecoveryKeyPage = false;

            this.showCertification = true;
        },
        generalRecoveryKeyPageShow() {
            this.resetLoginStateTitle();
            this.showLoginView = false;
            this.showOrganizationView = false;
            this.showOrganizationFinderView = false;
            this.showUserphoneLoginView = false;
            this.showUseremailLoginView = false;
            this.showUserWeiXinView = false;
            this.showUserZhifubaoView = false;
            this.showUsernameLoginView = false;
            this.showCertification = false;

            this.showGeneralRecoveryKeyPage = true;
        },
        userNameLoginClicked(){
            this.resetLoginStateTitle();
            this.username = "";
            this.password = "";
            this.showLoginView = true;
            this.showOrganizationView = false;
            this.showOrganizationFinderView = false;
            this.showUserphoneLoginView = false;
            this.showUseremailLoginView = false;
            this.showUserWeiXinView = false;
            this.showUserZhifubaoView = false;

            this.showUsernameLoginView = true;
        },
        userPhoneLoginClicked(){
            this.resetLoginStateTitle();
            this.username = "";
            this.password = "";
            this.showLoginView = true;
            this.showOrganizationView = false;
            this.showOrganizationFinderView = false;
            this.showUsernameLoginView = false;
            this.showUseremailLoginView = false;
            this.showUserWeiXinView = false;
            this.showUserZhifubaoView = false;

            this.showUserphoneLoginView = true;
        },
        userPhoneSendCodeClicked:async function(){
            if(this.userPhoneSendCodeTime > 1){
                return;
            }
            this.resetLoginStateTitle();
            if(this.isEmpty(this.username)){
                this.loginState = '请输入手机号';
                return;
            }
            if(!this.phoneFormatTest(this.username)){
                this.loginState = '手机号格式不正确';
                return;
            }
            var result = await global.mxMatrixClientPeg.GetVerCode("msisdn", this.username);
            console.log("userPhoneSendCodeClicked", result)
            if(result.status == 200){
                this.userPhoneSendCodeTime = 61;
                this.$toastMessage({message:"发送成功", time: 2000, type:'success', showWidth:'280px'});
                this.userPhoneSendCodeTimer();
            }else if(result.status == 429){
                this.loginState = result.data.error;
            }
            else {
                if(result.data.errcode == "M_TEMPORARY_NOT_BIND_MSISDN") {
                    this.loginState = "手机号未绑定";
                }
            }
            
        },

        userEmailLoginClicked(){
            this.resetLoginStateTitle();
            this.username = "";
            this.password = "";
            this.showLoginView = true;
            this.showOrganizationView = false;
            this.showOrganizationFinderView = false;
            this.showUsernameLoginView = false;
            this.showUserphoneLoginView = false;
            this.showUserWeiXinView = false;
            this.showUserZhifubaoView = false;
            
            this.showUseremailLoginView = true;
        },
        userEmailSendCodeClicked:async function(){
            if(this.userEmailSendCodeTime > 1){
                return;
            }
            this.resetLoginStateTitle();
            if(this.isEmpty(this.username)){
                this.loginState = '请输入邮箱账号';
                return;
            }
            if(!this.emailFormatTest(this.username)){
                this.loginState = '邮箱格式不正确';
                return;
            }
            var result = await global.mxMatrixClientPeg.GetVerCode("email", this.username);
            console.log("result is ", result);
            if(result.status == 200){
                this.userEmailSendCodeTime = 61;
                this.$toastMessage({message:"发送成功", time: 2000, type:'success', showWidth:'280px'});
                this.userEmailSendCodeTimer();
            }else if(result.status == 429){
                this.loginState = result.data.error;
            }
            else {
                if(result.data.errcode == "M_EMAIL_NOT_BIND") {
                    this.loginState = "邮箱未绑定";
                }
            }
        },
        async organizationFinderBackToLoginClicked(){
            if(this.isRecetPwd || this.toVerfyEmail) {
                this.loginPageTitle = "用户名登录";
                this.loginPageAccountLabel = "用户名";
                this.loginPageAccountPlaceholder = "请输入用户名";
                this.loginPagePwdLabel = "密码";
                this.loginPagePwdPlaceholder = "请输入密码";
                this.isMatrixPwd = true;
                this.forgetPasswordContent = "忘记密码";
                this.username = "";
                this.password = "";
                this.showPwd = true;
                this.toShowPwd();
                this.forgetPwdButtonDisabled = false;
                this.isRecetPwd = false;
                this.toVerfyEmail = false;
                this.isLdap = false;
                var accountInputDom = document.getElementById("accountInputId");
                if(accountInputDom) {
                    accountInputDom.disabled = false;
                    accountInputDom.style.backgroundColor = "rgba(255, 255, 255, 0)";
                }
                var passwordInputDom = document.getElementById("passwordInputId");
                if(passwordInputDom) {
                    passwordInputDom.disabled = false;
                    passwordInputDom.style.backgroundColor = "rgba(255, 255, 255, 0)";
                    passwordInputDom.type = "password";
                }
                var passwordInputDivDom = document.getElementById("inputDivId");
                if(passwordInputDivDom) {
                    passwordInputDivDom.disabled = false;
                    passwordInputDivDom.style.backgroundColor = "rgba(255, 255, 255, 0)";
                    passwordInputDivDom.type = "password";
                }
            }
            else if(this.showOrganizationViewHost) {
                var host = this.organizationAddress;
                if(host.endsWith("/")) {
                    host = host.substring(0, host.length - 1);
                }
                if(host.indexOf("http://") < 0 && host.indexOf("https://") < 0) {
                    host = "https://" + host;
                }
                var serverCheckRet = await this.getServerInfo(host);
                if(serverCheckRet) {
                    this.resetLoginStateTitle();
                    this.showOrganizationViewHost = false;
                    this.eachChatEndPoint = '';
                    this.organizationOrHost = this.$t("joinYourOrganization");
                    this.organizationAddress = (window.localStorage.getItem("Domain") == undefined || window.localStorage.getItem("Domain") == "undefined") ? "" : window.localStorage.getItem("Domain");
                    this.showOrganizationViewOrganization = true;
                }
            }
            else {
                this.resetLoginStateTitle();
                this.showLoginView = true;
                this.showOrganizationFinderView = false;
                this.showOrganizationView = true;
            }
        },
        isCheckToken() {
            return this.tokenRefreshing;
        },
        clickUser () {
            location.reload()
        },
        checkToken: async function() {
            var ret = await services.common.refreshToken();
            if(ret == undefined) {
                return false;
            }
            else {
                return true;
            }
        },
        isEmpty(obj){
            if(typeof obj == "undefined" || obj == null || obj == ""){
                return true;
            }else{
                return false;
            }
        },
        async _checkKeyBackupStatus() {
            try {
                const {backupInfo, trustInfo} = await global.mxMatrixClientPeg.matrixClient.checkKeyBackup();
                const backupKeyStored = Boolean(await global.mxMatrixClientPeg.matrixClient.isKeyBackupKeyStored());
                this.backupInfo = backupInfo;
                this.backupSigStatus = trustInfo;
                this.backupKeyStored = backupKeyStored;
            } catch (e) {
                console.log("Unable to fetch check backup status", e);
            }
        },
        getOSVersion(){
            var agent = navigator.userAgent;
            var version = '';
            if(agent.indexOf("Mac OS") != -1){
                var startIndex = agent.indexOf("Mac OS");
                var endIndex = agent.indexOf(")");
                version = agent.substring(startIndex, endIndex);
                console.log(version);
                return version;
            }
            else if(environment.os.isWindows) {
                console.log("agent is ", agent)
                var startIndex = agent.indexOf("Windows");
                var endIndex = agent.indexOf(";");
                version = agent.substring(startIndex, endIndex);
                console.log(version);
                return version;
            }
            
        },
        _onKeyBackupStatus(){
            console.log("========ttt===========")
            // This just loads the current backup status rather than forcing
            // a re-check otherwise we risk causing infinite loops
            this._loadBackupStatus();
        },
        async _loadBackupStatus() {
            console.log("==========yyy=========")
            try {
                this.backupInfo = await global.mxMatrixClientPeg.matrixClient.getKeyBackupVersion();
                this.backupSigStatus = await global.mxMatrixClientPeg.matrixClient.isKeyBackupTrusted(this.backupInfo);
                this.backupKeyStored = await global.mxMatrixClientPeg.matrixClient.isKeyBackupKeyStored();

                if(this.backupInfo) {
                    console.log("=========== bootstrapSecretStorage");
                    await global.mxMatrixClientPeg.matrixClient.bootstrapSecretStorage({});
                    this.certificationShow();
                }
                else {
                    console.log("=========== showCreateRecoveryKey");
                    this.generalRecoveryKeyPageShow();
                }
            } catch (e) {
                console.log("Unable to fetch key backup status", e);
            }
        },
        phoneLogin: async function() {
            try {
                verCodeRet = await global.mxMatrixClientPeg.LoginWithVerCode("m.login.verCode.msisdn", this.username, this.password);
                console.log("===== ", verCodeRet)
                if(verCodeRet.status == 200) {
                    client = await global.mxMatrixClientPeg.verCodeLoginMatrixClient(verCodeRet);
                }
                else if(verCodeRet.status == 429) {
                    this.loginState = verCodeRet.data.error;
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else if(verCodeRet.status == 400) {
                    this.loginState = this.$t("unboundedAccount")
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else if(verCodeRet.status == 412) {
                    this.loginState = this.$t("invalidVerCode")
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else {
                    this.loginState = this.$t("invalidVerCode")
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
            }
            catch(e) {
                this.isLoading = false;
                this.loginButtonDisabled = false;
                console.log(e)
                this.loginButtonDisabled = false;
                return;
            }
        },
        emailLogin: async function() {
            try {
                verCodeRet = await global.mxMatrixClientPeg.LoginWithVerCode("m.login.verCode.email", this.username, this.password);
                console.log("===== ", verCodeRet)
                if(verCodeRet.status == 200) {
                    client = await global.mxMatrixClientPeg.verCodeLoginMatrixClient(verCodeRet);
                }
                else if(verCodeRet.status == 429) {
                    this.loginState = verCodeRet.data.error;
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else if(verCodeRet.status == 400) {
                    this.loginState = this.$t("unboundedAccount")
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else if(verCodeRet.status == 412) {
                    this.loginState = this.$t("invalidVerCode")
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else {
                    this.loginState = this.$t("invalidVerCode")
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
            }
            catch(e) {
                this.isLoading = false;
                this.loginButtonDisabled = false;
                console.log(e)
                this.loginButtonDisabled = false;
                return;
            }
        },
        matrixPwdLogin: async function() {
            // this.loginState = "登录成功";
            if(this.isEmpty(this.username)){
                var accountInputDom = document.getElementById("accountInputId");
                accountInputDom.style.borderColor = "red";
                return;
            }
            if(this.isEmpty(this.password)){
                var passwordInputDom = document.getElementById("passwordInputId");
                passwordInputDom.style.borderColor = "red";
                return;
            }
            var reg = new RegExp(global.localStorage.getItem("initPasswordRegex"));
            if(reg.test(this.password)) {
                global.localStorage.setItem("neetNoticeToChangePwd", true);
            }
            else {
                global.localStorage.setItem("neetNoticeToChangePwd", false);
            }
            this.isLoading = true;
            this.loginButtonDisabled = true;
            var mac = environment.os.mac;
            var version = this.getOSVersion();
            var hostname = environment.os.hostName;
            // console.log("mac is ", environment.os);
            // console.log("hostname is ", hostname);

            var client = undefined;
            var verCodeRet = undefined;
            try {
                client = await global.mxMatrixClientPeg.LoginWithPassword(this.username, this.password);
                console.log("===== ", client)
                if(client == undefined || client == null) {
                    this.$toastMessage({message:"创建连接异常", time: 3000, type:'error', showWidth:'280px'});
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
            }
            catch(e) {
                // this.isLoading = false;
                this.loginButtonDisabled = false;
                if(client == undefined && e.message == "Invalid password") {
                    this.$toastMessage({message:"用户账号或密码不正确", time: 3000, type:'error', showWidth:'280px'});
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else if(client == undefined) {
                    this.$toastMessage({message:e.message, time: 3000, type:'error', showWidth:'280px'});
                    this.loginState = e.message;
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                console.log(e)
            }
            this.loginButtonDisabled = false;
            console.log(client);
            this.loginToMainPage();
            this.isLoading = false;
            this.loginButtonDisabled = false;
        },
        ldapLogin: async function() {
            if(this.isEmpty(this.username)){
                var accountInputDom = document.getElementById("accountInputId");
                accountInputDom.style.borderColor = "red";
                return;
            }
            if(this.isEmpty(this.password)){
                var passwordInputDom = document.getElementById("passwordInputId");
                passwordInputDom.style.borderColor = "red";
                return;
            }
            this.isLoading = true;
            this.loginButtonDisabled = true;
            var mac = environment.os.mac;
            var version = this.getOSVersion();
            var hostname = environment.os.hostName;
            // console.log("mac is ", environment.os);
            // console.log("hostname is ", hostname);

            var client = undefined;
            var verCodeRet = undefined;
            try {
                verCodeRet = await global.mxMatrixClientPeg.LoginWithVerCode("m.login.sso.ldap", this.username, this.password);
                console.log("===== ", verCodeRet)
                if(verCodeRet.status == 200) {
                    client = await global.mxMatrixClientPeg.verCodeLoginMatrixClient(verCodeRet);
                    console.log("===== ", client)
                    if(client == undefined || client == null) {
                        this.$toastMessage({message:"创建连接异常", time: 3000, type:'error', showWidth:'280px'});
                        this.isLoading = false;
                        this.loginButtonDisabled = false;
                        return;
                    }
                }
                else if(verCodeRet.status == 429) {
                    this.$toastMessage({message:verCodeRet.data.error, time: 3000, type:'error', showWidth:'280px'});
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    this.loginState = verCodeRet.data.error;
                    return;
                }
                else if(verCodeRet.status == 400) {
                    this.$toastMessage({message:this.$t("unboundedAccount"), time: 3000, type:'error', showWidth:'280px'});
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else if(verCodeRet.status == 412) {
                    this.$toastMessage({message:this.$t("invalidVerCode"), time: 3000, type:'error', showWidth:'280px'});
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else {
                    this.$toastMessage({message:verCodeRet.data.error, time: 3000, type:'error', showWidth:'280px'});
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
            }
            catch(e) {
                // this.isLoading = false;
                this.loginButtonDisabled = false;
                if(client == undefined && e.message == "Invalid password") {
                    this.$toastMessage({message:"用户账号或密码不正确", time: 3000, type:'error', showWidth:'280px'});
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                else if(client == undefined) {
                    this.$toastMessage({message:e.message, time: 3000, type:'error', showWidth:'280px'});
                    this.loginState = e.message;
                    this.isLoading = false;
                    this.loginButtonDisabled = false;
                    return;
                }
                console.log(e)
            }
            this.loginButtonDisabled = false;
            console.log(client);
            this.loginToMainPage();
            this.isLoading = false;
            this.loginButtonDisabled = false;
        },
        checkRecoveryKey: async function(client) {
            client.on('crypto.keyBackupStatus', this._onKeyBackupStatus);
            await client.downloadKeys([client.getUserId()]);
            await client.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing")
            if(client.isCryptoEnabled()) {
                var crossSigningIsSetUp = client.getStoredCrossSigningForUser(client.getUserId());
                console.log("var crossSigningIsSetUp ", crossSigningIsSetUp);
                if(crossSigningIsSetUp) {
                    await global.mxMatrixClientPeg.fetchKeyInfo();
                    if(global.mxMatrixClientPeg.keyInfo) {
                        //recovery page
                        console.log("certificationShow");
                        this.backupInfo = await global.mxMatrixClientPeg.matrixClient.getKeyBackupVersion();
                        if(!await global.mxMatrixClientPeg.matrixClient.hasSecretStorageKey()) {
                            console.log("=========== showCreateRecoveryKey");
                            // this.generalRecoveryKeyPageShow();
                            this.loginToMainPage();
                            //showCreateRecoveryKey
                        }
                        else {
                            console.log("=========== bootstrapSecretStorage");
                            await global.mxMatrixClientPeg.matrixClient.bootstrapSecretStorage({});
                            this.certificationShow();
                        }
                    }
                    else {
                        await this._checkKeyBackupStatus();
                        if(this.backupInfo) {
                            console.log("=========== bootstrapSecretStorage");
                            await global.mxMatrixClientPeg.matrixClient.bootstrapSecretStorage({});
                            this.certificationShow();
                        }
                        else {
                            console.log("=========== showCreateRecoveryKey");
                            // this.generalRecoveryKeyPageShow();
                            this.loginToMainPage();
                        }
                    }
                }
                else if(await client.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing")) {
                    //showCreateRecoveryKey
                    await this._checkKeyBackupStatus();
                    if(this.backupInfo) {
                        console.log("=========== bootstrapSecretStorage");
                        await global.mxMatrixClientPeg.matrixClient.bootstrapSecretStorage({});
                        this.certificationShow();
                    }
                    else {
                        console.log("=========== showCreateRecoveryKey");
                        // this.generalRecoveryKeyPageShow();
                        this.loginToMainPage();
                    }
                }
                else {
                    await this._checkKeyBackupStatus();
                    if(this.backupInfo) {
                        console.log("=========== bootstrapSecretStorage");
                        await global.mxMatrixClientPeg.matrixClient.bootstrapSecretStorage({});
                        this.certificationShow();
                    }
                    else {
                        console.log("=========== showCreateRecoveryKey");
                        // this.generalRecoveryKeyPageShow();
                        this.loginToMainPage();
                    }
                }
            }
        },
        closeAlertDlg: function() {
            this.showAlertDlg = false;
            this.alertContnets = {};
        },
        AlertConfirm: function() {
            if(this.isRecetPwd) {
                this.resetPassword(this.username, this.password).then(() => {
                    this.alertContnets = {
                        "Details": "邮件已经发送至" + this.username + "，请查收邮件并点击链接进行密码修改验证",
                        "Abstrace": "发送成功"
                    };
                    this.isRecetPwd = false;
                    this.toVerfyEmail = true;
                    this.LoginBtnText = "确认";
                    this.showAlertDlg = true;
                    this.alertWidth = 330;
                    this.alertHeight = 230;
                    this.alertContentLeft = 25;
                    this.iconType = "suc";
                    this.LoginBtnText = "我已验证邮箱";
                    var accountInputDom = document.getElementById("accountInputId");
                    if(accountInputDom) {
                        accountInputDom.disabled = true;
                        accountInputDom.style.backgroundColor = "rgba(245, 246, 249, 1)";
                    }
                    var passwordInputDom = document.getElementById("passwordInputId");
                    if(passwordInputDom) {
                        passwordInputDom.disabled = true;
                        passwordInputDom.style.backgroundColor = "rgba(245, 246, 249, 1)";
                    }
                    var passwordInputDivDom = document.getElementById("inputDivId");
                    if(passwordInputDivDom) {
                        passwordInputDivDom.disabled = true;
                        passwordInputDivDom.style.backgroundColor = "rgba(245, 246, 249, 1)";
                    }
                }, (err) => {
                    this.$toastMessage({message:"重置密码失败：" + err.message, time: 3000, type:'error'});
                });
            }
            else {
                this.showAlertDlg = false;
            }
        },
        VerfyEmail: async function() {
            try {
                await this.checkEmailLinkClicked();
                
                this.$toastMessage({message:"密码重置成功：" + err.message, time: 3000, type:'success', showWidth:'280px', showHeight:"100px"});
                this.loginPageTitle = "用户名登录";
                this.loginPageAccountLabel = "用户名";
                this.loginPageAccountPlaceholder = "请输入用户名";
                this.loginPagePwdLabel = "密码";
                this.loginPagePwdPlaceholder = "请输入密码";
                this.isMatrixPwd = true;
                this.isRecetPwd = false;
                this.toVerfyEmail = false;
                this.isLdap = false;
                var accountInputDom = document.getElementById("accountInputId");
                if(accountInputDom) {
                    accountInputDom.disabled = false;
                    accountInputDom.style.backgroundColor = "rgba(255, 255, 255, 0)";
                }
                var passwordInputDom = document.getElementById("passwordInputId");
                if(passwordInputDom) {
                    passwordInputDom.disabled = false;
                    passwordInputDom.style.backgroundColor = "rgba(255, 255, 255, 0)";
                }
                var passwordInputDivDom = document.getElementById("inputDivId");
                if(passwordInputDivDom) {
                    passwordInputDivDom.disabled = false;
                    passwordInputDivDom.style.backgroundColor = "rgba(255, 255, 255, 0)";
                }
                this.username = "";
                this.password = "";
                this.LoginBtnText = "登录";
                this.forgetPasswordContent = "忘记密码";
                this.forgetPwdButtonDisabled = false;
            } catch (err) {
                this.$toastMessage({message:"邮件认证失败：" + err.message, time: 3000, type:'error', showWidth:'280px', showHeight:"100px"});
            }
        },
        resetPwd: async function() {
            this.alertContnets = {
                "Details": "更改您的密码将会重置会话上的加密密钥，在重置密码之前，请先备份密钥或从另一个会话中导出聊天室密钥",
                "Abstrace": "提示"
            };
            this.LoginBtnText = "确认";
            this.showAlertDlg = true;
            this.alertWidth = 330;
            this.alertHeight = 230;
            this.alertContentLeft = 25;
            this.iconType = "alert";
        },
        login:async function() {
            if(this.isLdap) {
                this.ldapLogin();
            }
            else if(this.isMatrixPwd) {
                this.matrixPwdLogin();
            }
            else if(this.isRecetPwd) {
                this.resetPwd();
            }
            else if(this.toVerfyEmail) {
                this.VerfyEmail();
            }
        },
        loginToMainPage() {
            var elementButton = document.getElementById('loginButton');
            //this.loginButtonValue = "正在加载数据";
            this.$toastMessage({message:"登录成功", time: 3000, type:'success', showWidth:'280px'});
            // this.loginState = "登录成功";
            this.showLoginView = false;
            this.showLoadingView = true;
            this.tokenRefreshing = true;
            setTimeout(async () => {
                // ipcRenderer.send('showMainPageWindow', true); 
                ipcRenderer.send("showMainPageWindow")
                this.$router.push("/main")
            }, 1000);
            
            this.isLoading = false;
            this.loginButtonDisabled = false;
        },
        keyHasPassphrase(keyInfo) {
            return (
                keyInfo.passphrase &&
                keyInfo.passphrase.salt &&
                keyInfo.passphrase.iterations
            );
        },
    }, 
    // activated: async function() {
    //     this.checkHomeServer();
    // },
    mounted: async function() {
        if(window.localStorage) {
            this.organizationAddress = window.localStorage.getItem("Domain") == null ? "" : window.localStorage.getItem("Domain");
        }
        this.organizationOrHost = this.$t("joinYourOrganization");
        this.tokenRefreshing = true;
        var mac = environment.os.mac;
        var hostname = environment.os.hostName;
        
        // if(window.localStorage) {
        //     this.organizationAddress = window.localStorage.getItem("mx_hs_url") == null ? "https://matrix.each.chat" : window.localStorage.getItem("mx_hs_url");
        // }
        var host = window.localStorage.getItem("mx_hs_url");
        if(host == null) {
            this.tokenRefreshing = false;
            this.showLoadingView = false;
            this.showLoginView = true;
            return;
        }
        // this.getServerInfo(host);
        var domain = window.localStorage.getItem("mx_hs_url");
        console.log("***name-login domain from localstorage is ", domain);
        this.checkHomeServer()
            .then((ret) => {
                console.log("============= check home server ", ret);
                if(ret == false) {
                    this.tokenRefreshing = false;
                    this.showLoadingView = false;
                    this.showLoginView = true;
                    return
                }
                global.mxMatrixClientPeg.restoreFromLocalStorage().then(async (ret) => {
                    if(ret == undefined) {
                        this.tokenRefreshing = false;
                        this.showLoadingView = false;
                        this.showLoginView = true;
                        return;
                    }
                    
                    // var address = window.localStorage.getItem("Domain") == null ? "matrixdev.each.chat" : window.localStorage.getItem("Domain");
                    // var host = window.localStorage.getItem("mx_hs_url") == null ? "https://matrix.each.chat" : window.localStorage.getItem("mx_hs_url");
                    // var result = await services.common.gmsConfiguration(address, host);
                    // if(!result){
                    //     this.loginState = "未找到该组织";
                    //     this.organizationButtonDisabled = false;
                    //     return;
                    // }
                    
                    if(ret.language) {
                        this.$i18n.locale = ret.language;
                    }
                    ipcRenderer.send("showMainPageWindow")
                    this.$router.push("/main")
                })
            })
        
        ipcRenderer.on('dataJsonPort', function(event, message) { // 监听父页面定义的端口
            console.log("wo cao shou dao le ");
        });
    },
}
</script>

<style lang="scss" scoped>
.windowHeader{
    padding: 0px;
    margin: 0px;
    height: 36px;
    width: 100%; 
    -webkit-app-region: drag;
    * {
        -webkit-app-region: no-drag;
    }
}
.macWindowHeader {
    padding: 0px;
    margin: 0px;
    width: 64px;
}
    .login {
        width: 360px;
        height: 420px;
        background:rgba(255,255,255,1);
        box-shadow:0px 4px 20px 0px rgba(0,0,0,0.17);
        border-radius:4px;
        cursor: default;  
        -webkit-user-select:none;
    }

    // .welcome-panel {
    //     width: 100%;
    //     height: 100%;
    //     background: rgba(255, 255, 255, 0.2);
    // }

    // .welcome-zh-line1 {
    //     margin: 0px;
    //     padding-top: 10%;
    //     padding-left: 30px;
    //     padding-bottom: 10px;
    //     font-size: 24px;
    // }

    // .welcome-zh-line2 {
    //     margin: 0px;
    //     padding-top: 0;
    //     padding-left: 30px;
    //     padding-bottom: 10px;
    //     font-size: 24px;
    // }

    // .welcome-en {
    //     margin: 0px;
    //     padding-left: 30px;
    //     padding-bottom: 30px;
    //     font-size: 15px;
    //     color: rgba(60, 60, 67, 0.6);
    // }
    
    // .el-icon-loading {
    //     display: inline-block;
    //     margin-right: 5px;
    // }

    // .welcome-loading-text {
    //     display: inline-block;
    //     color:rgba(60, 60, 67, 0.9)
    // }

    // .welcome-loading {
    //     width: 100%;;
    //     font-size: 12px;
    //     text-align: center;
    //     margin: 0px;
    //     padding: 0px;
    //     position: absolute;
    //     bottom: 45px;
    //     left: 0px;
    // }

    // .copy-right {
    //     width: 100%;;
    //     font-size: 14px;
    //     text-align: center;
    //     margin: 0px;
    //     padding: 0px;
    //     position: absolute;
    //     bottom: 30px;
    //     left: 0px;
    // }

    .login-panel {
        width: 100%;
        margin-top: 0px;
        height: calc(100% - 36px);
        overflow: hidden;

    .item-input::placeholder {
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: rgba(153, 153, 153, 1);
    }
.account-content{
    .username-content{
            .title {
                display: inline-block;
                vertical-align: top;
                height:22px;
                font-size:16px;
                font-weight:600;
                color:rgba(39,45,52,1);
                line-height:22px;
                font-family: PingFangSC-Medium;
                font-weight: 600;
                text-align: center;
                width: 100%;
                margin-top: 36px;
        }



        .item-account{
            margin-top: 20px;
            width: 260px;
            margin-left: 50px;
            height: 58px;
            .account-title{
                width: 100%;
                margin: 0px;
                margin-bottom: 4px;
                font-size:12px;
                font-weight:400;
                color:rgba(102,102,102,1);
                line-height:18px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .item-input {
                margin-top: 4px;
                width:260px;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border:1px solid rgba(221,221,221,1);
                border-radius:4px;
                padding-left: 12px;
                font-size:14px;
                outline: none;
                font-family: PingFangSC-Regular;
            }
        }

        .item-pwd {
            margin-top: 8px;
            width: 260px;
            margin-left: 50px;
            height: 58px;
            .password-title{
                width: 100%;
                margin: 0px;
                margin-bottom: 4px;
                font-size:12px;
                font-weight:400;
                color:rgba(102,102,102,1);
                line-height:18px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .inputDiv {
                display: inline-block;
                position: absolute;
                margin-top: 4px;
                width:260px;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border:1px solid rgba(221,221,221,1);
                border-radius:4px;
                padding-left: 12px;
                font-size:14px;
                outline: none;
                font-family: PingFangSC-Regular;
                background-color: rgba(1, 1, 1, 0);
            }
            .item-input {
                display: inline-block;
                position: absolute;
                margin-top: 4px;
                width:209px;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
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
            .el-icon-view {
                display: inline-block;
                float: right;
                height: 16px;
                width: 16px;
                padding: 10px 10px 10px 10px;
                color: rgb(51, 51, 51);
                text-align: center;
            }
            .el-icon-view:hover {
                display: inline-block;
                float: right;
                height: 16px;
                width: 16px;
                padding: 10px 10px 10px 10px;
                color: rgb(51, 51, 51);
                cursor: pointer;
                text-align: center;
            }
            .el-icon-moon {
                display: inline-block;
                float: right;
                height: 16px;
                width: 16px;
                padding: 10px 10px 10px 10px;
                color: rgb(51, 51, 51);
                text-align: center;
            }
            .el-icon-moon:hover {
                display: inline-block;
                float: right;
                height: 16px;
                width: 16px;
                padding: 10px 10px 10px 10px;
                color: rgb(51, 51, 51);
                cursor: pointer;
                text-align: center;
            }
        }
        .accountLogin-state {
            width: 100%;
            padding-left: 50px;
            height: 17px;
            .state-title{
                display: inline-block;
                text-align: left;
                margin: 0px;
                height:17px;
                font-size:12px;
                font-weight:400;
                color:rgba(228,49,43,1);
                line-height:17px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .el-icon-loading{
                display: inline-block;
                margin: 0px;
            }
        } 
        .forget-password {
            height: 18px;
            width: calc(100%-50px);
            font-size: 12px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
            color: rgba(36, 179, 107, 1);
            line-height: 18px;
            letter-spacing: 1px;
            text-align: right;
            margin-top: 5px;
            margin-bottom: 12px;
            padding-right: 50px;
        }
        .forget-password:hover {
            height: 18px;
            width: calc(100%-50px);
            font-size: 12px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
            color: rgba(36, 179, 107, 1);
            line-height: 18px;
            letter-spacing: 1px;
            text-align: right;
            margin-top: 5px;
            margin-bottom: 12px;
            padding-right: 50px;
            cursor: pointer;
        }
        .btn {
            margin-top: 7px;
            text-align: center;

            button {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                outline: none;
            }
            
            button:hover {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
            }

            button:disabled {
                border: 1px solid #24B36B;
                background: rgba(167, 224, 196, 1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
            }
        }
        .otherlogin{
            width: 260px;
            height: 18px;
            margin: 0px;
            margin-left: 50px;
            margin-top: 16px;
            .userphone-login{
                display: inline-block;
                width: calc(100% - 95px);
                height: 18px;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #24B36B;
                line-height: 18px;
                letter-spacing: 1px;
                cursor: pointer;
            }
            .useremail-login{
                display: inline-block;
                width: 95px;
                height: 18px;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #24B36B;
                line-height: 18px;
                letter-spacing: 1px;
                cursor: pointer;
            }
        }
                .login-footer{
            width: 100%;
            height: 20px;
            margin-bottom: 15px;
            margin-top: 48px;
            cursor: pointer;
            .back-image{
                cursor: pointer;
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-left: 24px;
            }
            .back-title{
                cursor: pointer;
                display: inline-block;
                
                height:20px;
                font-size:14px;
                margin: 0px;
                vertical-align: top;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
        }
    }
    .userphone-content{
            .title {
                display: inline-block;
                vertical-align: top;
                height:22px;
                font-size:16px;
                font-weight:600;
                color:rgba(39,45,52,1);
                line-height:22px;
                font-family: PingFangSC-Medium;
                font-weight: 600;
                text-align: center;
                width: 100%;
                margin-top: 36px;
        }



        .item-account{
            margin-top: 42px;
            width: 260px;
            margin-left: 50px;
            height: 36px;
            .account-title{
                display: inline-block;
                position: absolute;
                top: 136px;
                left: 62px;
                width: 30px;
                height: 36px;
                line-height: 36px;
                z-index: 20;
                margin: 0px;
                font-size:14px;
                font-weight:400;
                color:rgba(0,0,0,1);
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .account-separate{
                    display: inline;
                    position: absolute;
                    width: 1px;
                    height: 18px;
                    left: 100px;
                    top: 145px;
                    z-index: 30;
                    background-color: rgba(221, 221, 221, 1);
            }
            .item-input {
                display: inline-block;
                position: absolute;
                left: 50px;
                text-indent: 61px;
                width:260px;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                margin: 0px;
                box-sizing: border-box;
                border:1px solid rgba(221,221,221,1);
                border-radius:4px;
                
                font-size:14px;
                outline: none;
                font-family: PingFangSC-Regular;
            }
        }

        .item-pwd {
            margin-top: 12px;
            width: 260px;
            margin-left: 50px;
            height: 36px;
            .password-title{
                width: 90px;
                margin: 0px;
                display: inline-block;
                position: absolute;
                left: 207px;
                top: 192px;
                height: 20px;
                line-height: 20px;
                font-size:14px;
                font-weight:400;
                color:rgba(36,179,107,1);
                line-height:20px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
                cursor: pointer;
                text-align: right;
            }
            .item-input {
                display: inline-block;
                position: absolute;
                left: 50px;
                top: 184px;
                width:260px;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border:1px solid rgba(221,221,221,1);
                border-radius:4px;
                padding-left: 12px;
                font-size:14px;
                outline: none;
                font-family: PingFangSC-Regular;
            }
        }
        .accountLogin-state {
            width: 100%;
            padding-left: 50px;
            height: 17px;
            .state-title{
                display: inline-block;
                text-align: left;
                margin: 0px;
                height:17px;
                font-size:12px;
                font-weight:400;
                color:rgba(228,49,43,1);
                line-height:17px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .el-icon-loading{
                display: inline-block;
                margin: 0px;
            }
        }
        .btn {
            margin-top: 7px;
            text-align: center;

            button {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                outline: none;
            }
            
            button:hover {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
            }

            button:disabled {
                border: 1px solid #24B36B;
                background: rgba(167, 224, 196, 1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
            }
        }
        .otherlogin{
            width: 260px;
            height: 18px;
            margin: 0px;
            margin-left: 50px;
            margin-top: 16px;
            .userphone-login{
                display: inline-block;
                width: calc(100% - 95px);
                height: 18px;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #24B36B;
                line-height: 18px;
                letter-spacing: 1px;
                cursor: pointer;
            }
            .useremail-login{
                display: inline-block;
                width: 95px;
                height: 18px;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #24B36B;
                line-height: 18px;
                letter-spacing: 1px;
                cursor: pointer;
            }
        }
                .login-footer{
            width: 100%;
            height: 20px;
            margin-bottom: 15px;
            margin-top: 66px;
            cursor: pointer;
            .back-image{
                cursor: pointer;
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-left: 24px;
            }
            .back-title{
                cursor: pointer;
                display: inline-block;
                
                height:20px;
                font-size:14px;
                margin: 0px;
                vertical-align: top;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
        }
    }
    .useremail-content{
            .title {
                display: inline-block;
                vertical-align: top;
                height:22px;
                font-size:16px;
                font-weight:600;
                color:rgba(39,45,52,1);
                line-height:22px;
                font-family: PingFangSC-Medium;
                font-weight: 600;
                text-align: center;
                width: 100%;
                margin-top: 36px;
        }



        .item-account{
            margin-top: 42px;
            width: 260px;
            margin-left: 50px;
            height: 36px;

            .item-input {
                display: inline-block;
                position: absolute;
                left: 50px;
                text-indent: 12px;
                width:260px;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                margin: 0px;
                box-sizing: border-box;
                border:1px solid rgba(221,221,221,1);
                border-radius:4px;
                
                font-size:14px;
                outline: none;
                font-family: PingFangSC-Regular;
            }
        }

        .item-pwd {
            margin-top: 12px;
            width: 260px;
            margin-left: 50px;
            height: 36px;
            .password-title{
                width: 90px;
                margin: 0px;
                display: inline-block;
                position: absolute;
                left: 207px;
                top: 192px;
                height: 20px;
                line-height: 20px;
                font-size:14px;
                font-weight:400;
                color:rgba(36,179,107,1);
                line-height:20px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
                cursor: pointer;
                text-align: right;
            }
            .item-input {
                display: inline-block;
                position: absolute;
                left: 50px;
                top: 184px;
                width:260px;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border:1px solid rgba(221,221,221,1);
                border-radius:4px;
                padding-left: 12px;
                font-size:14px;
                outline: none;
                font-family: PingFangSC-Regular;
            }
        }
        .accountLogin-state {
            width: 100%;
            padding-left: 50px;
            height: 17px;
            .state-title{
                display: inline-block;
                text-align: left;
                margin: 0px;
                height:17px;
                font-size:12px;
                font-weight:400;
                color:rgba(228,49,43,1);
                line-height:17px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .el-icon-loading{
                display: inline-block;
                margin: 0px;
            }
        }
        .btn {
            margin-top: 7px;
            text-align: center;

            button {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                outline: none;
            }
            
            button:hover {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
            }

            button:disabled {
                border: 1px solid #24B36B;
                background: rgba(167, 224, 196, 1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
            }
        }
        .otherlogin{
            width: 260px;
            height: 18px;
            margin: 0px;
            margin-left: 50px;
            margin-top: 16px;
            .userphone-login{
                display: inline-block;
                width: calc(100% - 95px);
                height: 18px;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #24B36B;
                line-height: 18px;
                letter-spacing: 1px;
                cursor: pointer;
            }
            .useremail-login{
                display: inline-block;
                width: 95px;
                height: 18px;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #24B36B;
                line-height: 18px;
                letter-spacing: 1px;
                cursor: pointer;
            }
        }
                .login-footer{
            width: 100%;
            height: 20px;
            margin-bottom: 15px;
            margin-top: 66px;
            cursor: pointer;
            .back-image{
                cursor: pointer;
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-left: 24px;
            }
            .back-title{
                cursor: pointer;
                display: inline-block;
                
                height:20px;
                font-size:14px;
                margin: 0px;
                vertical-align: top;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
        }
    }
}

    .organization-content{
        .host-title {
            height: 22px;
            width: 100%;
            padding: 0px;
            margin-bottom: 14px;
            padding-top: 44px;
            text-align: center;
            vertical-align: top;
            font-size:16px;
            font-weight:500;
            color:rgba(39,45,52,1);
            line-height:22px;
            font-family: PingFangSC-Medium;
        }
        .title {
            height: 36px;
            width: 100%;
            padding: 0px;
            margin: 0px;
            padding-top: 44px;
            //margin-top: 34px;

            .title-ico {
                display: inline-block;
                width: 36px;
                height: 36px;
                margin-left: 117px;
                padding: 0px;
                .login-logo{
                    width: 36px;
                    height: 36px;
                    margin: 0px;
                    padding: 0px;
                }
            }

            .tltle-content {
                display: inline-block;
                vertical-align: top;
                height:36px;
                font-size:24px;
                font-weight:600;
                color:rgba(39,45,52,1);
                line-height:36px;
                padding-left: 8px;
                font-family: PingFangSC-Medium;
            }
        }
        .item-organization{
            margin-top: 28px;
            width: 260px;
            margin-left: 50px;
            height: 66px;
            .organizaiton-title{
                width: 100%;
                margin: 0px;
                margin-bottom: 4px;
                font-size:12px;
                font-weight:400;
                color:rgba(102,102,102,1);
                line-height:18px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .item-input {
                margin-top: 4px;
                margin-bottom: 4px;
                width:260px;
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
            .organization-input-label{
                position: absolute;
                left: 216px;
                top: 178px;
                margin: 0px;
                width:77px;
                height:20px;
                font-size:14px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                text-align: right;
                font-family: PingFangSC-Regular;
            }
        }

        .btn-item {
            margin-top: 7px;
            text-align: center;

            button {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                outline: none;
                margin-bottom: 3px;
                margin-top: 3px;
            }
            
            button:hover {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
                margin-bottom: 3px;
                margin-top: 3px;
            }

            button:disabled {
                border: 1px solid #24B36B;
                background: rgba(167, 224, 196, 1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
            }

            .hostCancle {
                border: 1px solid rgba(221, 221, 221, 1);
                background:rgba(255,255,255,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: black;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                outline: none;
                margin-bottom: 3px;
                margin-top: 3px;
            }
            hostCancle:hover {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                outline: none;
                margin-bottom: 3px;
                margin-top: 3px;
            }

        }
        .organizationLogin-state {
            width: 100%;
            padding-left: 50px;
            height: 17px;
            .state-title{
                display: inline-block;
                text-align: left;
                margin: 0px;
                height:17px;
                font-size:12px;
                font-weight:400;
                color:rgba(228,49,43,1);
                line-height:17px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .el-icon-loading{
                display: inline-block;
                margin: 0px;
            }
        }
        .organization-finder-tip{
            height: 18px;
            width: 100%;
            padding-left: 50px;
            margin-top: 16px;
            .forget-title{
                margin: 0px;
                display: inline-block;
                height:18px;
                font-size:12px;
                font-weight:400;
                color:rgba(102,102,102,1);
                line-height:18px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .finder-title{
                margin: 0px;
                display: inline-block;
                height:18px;
                font-size:12px;
                font-weight:400;
                color:rgba(36,179,107,1);
                line-height:18px;
                letter-spacing:1px;
                cursor: pointer;
                font-family: PingFangSC-Regular;
            }
        }
                .login-footer{
            width: 100%;
            height: 20px;
            margin-bottom: 15px;
            margin-top: 82px;
            cursor: pointer;
            .server-setting{
                cursor: pointer;
                padding-left: 20px;
                margin: 0px;
                width:65px;
                height:18px;
                font-size:12px;
                font-weight:400;
                color:rgba(153,153,153,1);
                line-height:18px;
                letter-spacing:1px;
            }
            .back-image{
                cursor: pointer;
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-left: 24px;
            }
            .back-title{
                cursor: pointer;
                display: inline-block;
                
                height:20px;
                font-size:14px;
                margin: 0px;
                vertical-align: top;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
        }
    }

    }
        .organizationFinder-panel {
            -webkit-user-select:none;
        width: 100%;
        margin-top: 0px;
        height: calc(100% - 36px);
        overflow: hidden;
        cursor: default;
        .finder-header{
            width: 100%;
            height: 51px;
            margin-top: 36px;
            .header-title{
                width: 100%;
                text-align: center;
                height:22px;
                font-size:16px;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:22px;
                letter-spacing:2px;
                margin: 0px;
                font-family: PingFangSC-Medium;
            }
            .header-tip{
                width: 100%;
                text-align: center;
                height:20px;
                font-size:14px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                margin: 0px;
                margin-top: 12px;
                font-family: PingFangSC-Regular;
            }

        }
        .finder-body{
            height: 122px;
            .item-server{
                margin-top: 28px;
                width: 260px;
                margin-left: 50px;
                height: 58px;
                .server-title{
                width: 100%;
                margin: 0px;
                margin-bottom: 4px;
                font-size:12px;
                font-weight:400;
                color:rgba(102,102,102,1);
                line-height:18px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
                }
                .item-server-input{
                margin-top: 4px;
                width:260px;
                height:36px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border:1px solid rgba(221,221,221,1);
                border-radius:4px;
                padding-left: 12px;
                font-size:14px;
                outline: none;
                font-family: PingFangSC-Regular;
                }
            }
            .organizationFinder-state {
            width: 100%;
            padding-left: 50px;
            height: 17px;
            .state-title{
                display: inline-block;
                text-align: left;
                margin: 0px;
                height:17px;
                font-size:12px;
                font-weight:400;
                color:rgba(228,49,43,1);
                line-height:17px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
            .el-icon-loading{
                display: inline-block;
                margin: 0px;
            }
        }
            .btn-item{
                height: 80px;
                width: 100%;
                margin: 0px;
                margin-top: 7px;
                text-align: center;
                .server-confirm-button{
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                outline: none;
                }
                .server-confirm-button:disabled{
                    background:rgba(167,224,196,1);
                    border: 1px solid rgba(167,224,196,1);
                }
                .server-confirm-button:hover{
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: PingFangSC-Regular;
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
                }
            }
        }
        .setting-footer{
            width: 100%;
            height: 20px;
            margin-bottom: 20px;
            margin-top: 108px;
            .back-image{
                cursor: pointer;
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-left: 24px;
            }
            .back-title{
                cursor: pointer;
                display: inline-block;
                
                height:20px;
                font-size:14px;
                margin: 0px;
                vertical-align: top;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                font-family: PingFangSC-Regular;
            }
        }
    }
        .loginLoading-view {
            -webkit-user-select:none;
            width: 100%;
            margin-top: 0px;
            height: calc(100% - 36px);
            overflow: hidden;
            cursor: default;
            .loading-img{
                height: 68px;
                width: 68px;
                margin-top: 130px;
                margin-left: 146px;

            }
            .loading-title{
                width:100%;
                text-align: center;
                height:18px;
                font-size:16px;
                font-weight:400;
                color:rgba(153,153,153,1);
                line-height:18px;
                letter-spacing:2px;
                margin: 0px;
                margin-top: 20px;
            }
        }

    .server-setting-div {
        width: 40%;
        height: 18px;
        position: absolute;
        bottom: 15px;
        left: 30px;
        
        .server-setting {
            float: left;
            vertical-align: top;
            font-size: 12px;
            font-weight:400;
            font-family: PingFangSC-Regular;
            color: rgba(153, 153, 153, 1);
            line-height: 18px;
            height: 18px;
            letter-spacing: 1px;
        }

        .el-icon-caret-bottom {
            float: left;
            width: 18px;
            height: 18px;
            line-height: 18px;
        }
    }

    
    .domain-dropdown-content {
        position: absolute;
        background-color: rgba(255, 255, 255, 1);
        width:260px;
        min-height: 40px;
        border-radius: 4px;
        box-shadow:0px 0px 12px 0px rgba(103,103,103,0.14);
        border:1px solid rgba(221,221,221,1);
    }

    .domain-dropdown-content div:hover {
        background-color: rgba(221, 221, 221, 1);
        cursor: pointer;
    }

    .domain-list {
        margin: 0px;
        padding: 0px;
    }

    .domain-item {
        display: block;
        width:248px;
        height:40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        letter-spacing: 1px;
        vertical-align: top;
        margin: 0 0 0 0;
        padding-left: 12px;
        background-color: rgba(0, 0, 0, 0);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        letter-spacing:1px;
    }
    
    .domain-item:hover {
        display: block;
        width:248px;
        height:40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        letter-spacing: 1px;
        vertical-align: top;
        margin: 0 0 0 0;
        padding-left: 12px;
        background-color: rgba(221, 221, 221, 1);
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        letter-spacing:1px;
    }
    
    .domain-item-label {
        width:260px;
        height:40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        letter-spacing: 1px;
        vertical-align: top;
        background-color: rgba(0, 0, 0, 0);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        letter-spacing:1px;
    }

    .domain-item-label:hover {
        width:260px;
        height:40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        letter-spacing: 1px;
        vertical-align: top;
        background-color: rgba(221, 221, 221, 1);
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        letter-spacing:1px;
    }


    .language {
        width: 40%;
        height: 18px;
        position: absolute;
        bottom: 15px;
        right: 30px;

        .login-setup-language-label {
            float: right;
            vertical-align: top;
            font-size: 12px;
            font-weight:400;
            font-family: PingFangSC-Regular;
            color: rgba(153, 153, 153, 1);
            line-height: 18px;
            height: 18px;
            letter-spacing: 1px;
        }

        .el-icon-caret-bottom {
            float: right;
            width: 18px;
            height: 18px;
            line-height: 18px;
        }
    }
</style>
