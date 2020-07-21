<template>
    <div class="login">
        <!-- <div class="welcome-panel" v-if="isCheckToken()">
            <p class="welcome-zh-line1">您好，</p><p class="welcome-zh-line2">欢迎使用易企聊!</p>
            <p class="welcome-en">Hello, welcome to user EachChat!</p>
            <div class="welcome-loading">
                <i class="el-icon-loading"></i><p class="welcome-loading-text">{{loadingProcess}}，请稍后...</p>
            </div>
            <p class="copy-right">版权所有 2019-2020 workly.ai 保留所有权利</p>
        </div> -->
        <!-- <div class="login-panel" v-else style="-webkit-app-region: no-drag"> -->
            <div class="windowHeader" style="-webkit-app-region: drag">
                <mac-window-header class="macWindowHeader" @Close="Close()" @Min="Min()" @Max="Max()" :showMax="false"></mac-window-header>
            </div>
            <div class="win-header">
                <winHeaderBar @Close="Close()" @Min="Min()" @Max="Max()"></winHeaderBar>
            </div>
        <div class="login-panel" v-show="showLoginView">
            <div class="organization-content" v-show="showOrganizationView">
                <div class="title">
                    <div class="title-ico">
                        <img class="login-logo" src="../../../static/Img/Login/logo@2x.png">
                    </div><div class="tltle-content">
                        易企聊
                    </div>
                </div>
                <div class="item-organization">
                    <p class="organizaiton-title">
                        加入您的组织
                    </p>
                    <input prefix="ios-contact-outline" v-model="organizationAddress" placeholder="请输入组织ID" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()" @keyup.enter="organizationConfirmButtonClicked()"/>
                    <p class="organization-input-label">.each.chat</p>
                </div>
                <div class="organizationLogin-state">
                    <p class="state-title" id="organizationLoginStateLabel">{{loginState}}</p>
                </div>
                <div class="btn-item">
                    <Button type="success"  @click="organizationConfirmButtonClicked()">确定</Button>
                </div>
                <div class="organization-finder-tip">
                    <p class="forget-title">忘记了你的组织ID?</p><p
                    class="finder-title" @click="organizationFinderClicked()">点击找回</p>
                </div>
                <!-- <div class="login-footer">
                    <p class="server-setting" @click="serverSettingClicked()">服务器设置</p>
                </div> -->
            </div>
            <div class="account-content" v-show="!showOrganizationView">
                <div class="title">
                    <div class="title-ico">
                        <img class="login-logo" src="../../../static/Img/Login/logo@2x.png">
                    </div><div class="tltle-content">
                        易企聊
                    </div>
                </div>

            <div class="item-account">
                <p class="account-title">
                    用户名
                </p>
                <input prefix="ios-contact-outline" v-model="username" placeholder="请输入用户名" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()"/>
            </div>
            <div class="item-pwd">
                <p class="password-title">
                    密码
                </p>
                <input prefix="ios-lock-outline" type="password" v-model="password" placeholder="请输入密码" class="item-input" @input="resetLoginStateTitle()" @keyup.delete="resetLoginStateTitle()" @keyup.enter="login()"/>
            </div>
            <div class="accountLogin-state">
                    <p class="state-title" id="accountLoginStateLabel">{{loginState}}</p>
            </div>
            <div class="btn item">
                <Button type="success" id="loginButton" @click="login()">{{ loginButtonValue }}</Button>
            </div>
            <div class="login-footer" @click="organizationFinderBackToLoginClicked()">
                    <img class="back-image" src="../../../static/Img/Login/back-20px@2x.png">
                    <p class="back-title">返回</p>
            </div>
            </div>

        </div>
        <!-- <div class="serverSetting-panel" v-show="showServerSettingView">
            <div class="setting-header">
                <p class="header-title">服务器设置</p>
                <p class="header-tip">修改保存后，请清空进程再次重启应用</p>
            </div>
            <div class="setting-body">
                <div class="item-server">
                    <p class="server-title">
                        服务器地址
                    </p>
                    <input class="item-server-input" prefix="ios-contact-outline" v-model="hostName" placeholder="服务器地址" />
                </div>
                <div class="btn-item">
                    <Button class="server-confirm-button" type="success"  @click="serverSettingConfirmClicked()">确定</Button>
                    <Button class="server-cancel-button" type="success" @click="serverSettingCancelClicked()">取消</Button>
                </div>
            </div>
            <div class="setting-footer" @click="serverSettingBackToLoginClicked()">
                    <img class="back-image" src="../../../static/Img/Login/back-20px@2x.png">
                    <p class="back-title">返回</p>
                
            </div>
        </div> -->
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
                    <input class="item-server-input" prefix="ios-contact-outline" v-model="emialAddress" placeholder="请输入邮箱" />
                </div>
                <div class="btn-item">
                    <Button class="server-confirm-button" type="success"  @click="serverSettingConfirmClicked()">继续</Button>
                </div>
            </div>
            <div class="setting-footer" @click="organizationFinderBackToLoginClicked()">
                    <img class="back-image" src="../../../static/Img/Login/back-20px@2x.png">
                    <p class="back-title">返回</p>
            </div>
        </div>
        <div class="loginLoading-view" v-show="showLoadingView">
            <img class="loading-img" src="../../../static/Img/Login/loading.gif">
            <p class="loading-title">数据加载中</p>
        </div>
    </div>
</template>

<script>
import os from 'os';
import {ipcRenderer} from 'electron'
import {services} from '../../packages/data/index.js'
import {environment} from '../../packages/data/environment.js'
import macWindowHeader from './macWindowHeader.vue';
import winHeaderBar from './win-header.vue';
export default {
    name: 'login',
    components:{
        macWindowHeader,
        winHeaderBar
    },
    data () {
        return {
            loginState: '',
            username: '',
            password: '',
            host: '',
            port: '',
            services: null,
            tokenExpired: false,
            tokenRefreshing: true,
            loadingProcess: '正在验证登录信息',

            loginButtonValue:'登录',
            organizationAddress:'',
            emialAddress:'',
            showLoginView: false,
            //showServerSettingView: false,
            showOrganizationView: true,
            showOrganizationFinderView: false,
            showLoadingView: true,
        }
    },
    methods: {
        Close: function() {
            ipcRenderer.send("login-win-close");
        },
        Min: function() {
            ipcRenderer.send("login-win-min");
        },
        Max: function() {
            ipcRenderer.send("login-win-max");
        },
        resetLoginStateTitle(){
            this.loginState = "";
        },
        organizationConfirmButtonClicked:async function(){
            if (this.organizationAddress == undefined || this.organizationAddress == ""){
                this.loginState = "请输入组织ID";
                return;
            }
            var address = this.organizationAddress + ".eachchat.net";
            var result = await services.common.gmsConfiguration(address);
            console.log(result);
            if(!result){
                this.loginState = "未找到该组织";
                return;
            }
            this.resetLoginStateTitle();
            await services.common.init();
            this.showLoginView = true;
            this.showOrganizationView = false;
        },
        organizationFinderClicked:async function(){

            this.showLoginView = false;
            this.showOrganizationFinderView = true;
        },
        serverSettingClicked(){
            this.showLoginView = false;
            //this.showServerSettingView = true;
        },
        serverSettingConfirmClicked(){
            this.showLoginView = true;
            //this.showServerSettingView = false;
        },
        serverSettingCancelClicked(){
            this.showLoginView = true;
            //this.showServerSettingView = false;
            this.hostName = '';
        },
        serverSettingBackToLoginClicked(){
            this.showServerSettingView = false;
            this.showLoginView = true;
            //this.showOrganizationView = true;
            this.hostName = '';
        },
        organizationFinderBackToLoginClicked(){
            this.showLoginView = true;
            this.showOrganizationFinderView = false;
            this.showOrganizationView = true;
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
        login:async function() {
            if(this.isEmpty(this.username)&&this.isEmpty(this.password)){
                this.loginState = "请输入用户名和密码";
                return;
            }
            if(this.isEmpty(this.username)){
                this.loginState = "请输入用户名";
                return;
            }
            if(this.isEmpty(this.password)){
                this.loginState = "请输入密码";
                return;
            }
            var mac = environment.os.mac;
            var hostname = environment.os.hostName;
            // console.log("mac is ", environment.os);
            // console.log("hostname is ", hostname);
            let config = {
                username: this.username,
                password: this.password,
                identityType: 'password',
                model: hostname,
                deviceID: mac
            };
            let response = await services.common.login(config);
            console.log(response);
            var ret_data = response;
            if(response != true){
                var msg = ret_data["message"];
                var code = ret_data["code"];
                if(code != 200)
                    {
                    console.log("code != 200")
                    
                    this.loginState = msg
                    return
                }
            }
            var elementButton = document.getElementById('loginButton');
            //this.loginButtonValue = "正在加载数据";
            this.loginState = "登录成功";
            this.showLoginView = false;
            this.showLoadingView = true;
            setTimeout(async () => {
                this.tokenRefreshing = true;

                // await services.common.InitServiceData();
                //后面的这些代码可以放到主线程
                //ipcRenderer.send("firstLogin")  
                if(await services.common.GetLoginModel() == undefined)
                {
                    this.loadingProcess = "正在加载用户信息";
                    await services.common.AllUserinfo();
                    this.loadingProcess = "正在加载组织信息";
                    await services.common.AllDepartmentInfo();
                    this.loadingProcess = "正在加载群组信息";
                    await services.common.listAllGroup();
                }
                else
                {
                    this.loadingProcess = "正在加载信息";
                    await services.common.InitDbData();
                }              
                // const ipcRenderer = require('electron').ipcRenderer;
                ipcRenderer.send('showMainPageWindow', true); 
            }, 1000);
        }
    },
    mounted: async function() {
        this.tokenRefreshing = true;
        var mac = environment.os.mac;
        var hostname = environment.os.hostName;
        await services.common.init();
        setTimeout(() => {  
            this.$nextTick(async () => {
                
                if(await services.common.GetLoginModel() == undefined)//判断数据库存在登陆信息，如果不存在直接返回
                {
                    
                    this.tokenRefreshing = false;
                    this.showLoadingView = false;
                    this.showLoginView = true;
                    return;
                }
                //如果存在刷新token
                var ret = await services.common.refreshToken();
                if(!ret.state) {
                    if(ret.msg == "tokenExpired") {
                        this.loginState = "认证已过期，请重新登录。"
                    }
                    this.tokenRefreshing = false;
                    this.showLoadingView = false;
                    this.showLoginView = true;
                    return;
                }
                //这段代码可以用IPC放到主线程
                //ipcRenderer.send("notFirstLogin")
                await services.common.InitDbData();
                // const ipcRenderer = require('electron').ipcRenderer;
                ipcRenderer.send('showMainPageWindow', false);
            })

        }, 1000);
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
    //     font-family: 'Microsoft YaHei';
    // }

    // .welcome-zh-line2 {
    //     margin: 0px;
    //     padding-top: 0;
    //     padding-left: 30px;
    //     padding-bottom: 10px;
    //     font-size: 24px;
    //     font-family: 'Microsoft YaHei';
    // }

    // .welcome-en {
    //     margin: 0px;
    //     padding-left: 30px;
    //     padding-bottom: 30px;
    //     font-size: 15px;
    //     font-family: 'Microsoft YaHei';
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
    //     font-family: 'Microsoft YaHei';
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
    //     font-family: 'Microsoft YaHei';
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
.account-content{
            .title {
            height: 36px;
            width: 100%;
            padding: 0px;
            margin: 0px;
            padding-top: 34px;
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
            }
        }



        .item-account{
            margin-top: 28px;
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
            }
        }
        .accountLogin-state {
            width: 100%;
            padding-left: 50px;
            height: 17px;
            .state-title{
                text-align: left;
                margin: 0px;
                height:17px;
                font-size:12px;
                font-weight:400;
                color:rgba(228,49,43,1);
                line-height:17px;
                letter-spacing:1px;
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
                font-family: 'Microsoft Yahei';
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
            }
            
            button:hover {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: 'Microsoft Yahei';
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
            }

        }
                .login-footer{
            width: 100%;
            height: 20px;
            margin-bottom: 15px;
            margin-top: 68px;
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
            }
        }
}

    .organization-content{
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
            }
        }
        .item-organization{
            margin-top: 28px;
            width: 260px;
            margin-left: 50px;
            height: 58px;
            .organizaiton-title{
                width: 100%;
                margin: 0px;
                margin-bottom: 4px;
                font-size:12px;
                font-weight:400;
                color:rgba(102,102,102,1);
                line-height:18px;
                letter-spacing:1px;
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
            }
            .organization-input-label{
                position: absolute;
                left: 221px;
                top: 174px;
                margin: 0px;
                width:77px;
                height:20px;
                font-size:14px;
                font-weight:400;
                color:rgba(0,0,0,1);
                line-height:20px;
                letter-spacing:1px;
                text-align: right;
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
                font-family: 'Microsoft Yahei';
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
            }
            
            button:hover {
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: 'Microsoft Yahei';
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                opacity: 0.8;
            }

        }
        .organizationLogin-state {
            width: 100%;
            padding-left: 50px;
            height: 17px;
            .state-title{
                text-align: left;
                margin: 0px;
                height:17px;
                font-size:12px;
                font-weight:400;
                color:rgba(228,49,43,1);
                line-height:17px;
                letter-spacing:1px;
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
            }
        }
                .login-footer{
            width: 100%;
            height: 20px;
            margin-bottom: 15px;
            margin-top: 91px;
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
        }
    }

    }
    // .serverSetting-panel {
    //     width: 100%;
    //     margin-top: 0px;
    //     height: calc(100% - 36px);
    //     overflow: hidden;
    //     cursor: default;
    //     .setting-header{
    //         width: 100%;
    //         height: 51px;
    //         margin-top: 36px;
    //         .header-title{
    //             width: 100%;
    //             text-align: center;
    //             height:22px;
    //             font-size:16px;
    //             font-weight:500;
    //             color:rgba(0,0,0,1);
    //             line-height:22px;
    //             letter-spacing:2px;
    //             margin: 0px;
    //         }
    //         .header-tip{
    //             width: 100%;
    //             text-align: center;
    //             height:20px;
    //             font-size:14px;
    //             font-weight:400;
    //             color:rgba(0,0,0,1);
    //             line-height:20px;
    //             letter-spacing:1px;
    //             margin: 0px;
    //             margin-top: 9px;
    //         }

    //     }
    //     .setting-body{
    //         .item-server{
    //             margin-top: 31px;
    //             width: 260px;
    //             margin-left: 50px;
    //             height: 58px;
    //             .server-title{
    //             width: 100%;
    //             margin: 0px;
    //             margin-bottom: 4px;
    //             font-size:12px;
    //             font-weight:400;
    //             color:rgba(102,102,102,1);
    //             line-height:18px;
    //             letter-spacing:1px;
    //             }
    //             .item-server-input{
    //             margin-top: 4px;
    //             width:260px;
    //             height:36px;
    //             color: #76777A;
    //             margin: 0 0 0 0;
    //             box-sizing: border-box;
    //             border: 1px solid #DFE0E3;
    //             border-radius: 3px;
    //             padding-left: 10px;
    //             }
    //         }
    //         .btn-item{
    //             height: 80px;
    //             width: 100%;
    //             margin: 0px;
    //             margin-top: 24px;
    //             text-align: center;
    //             .server-confirm-button{
    //             border: 1px solid #24B36B;
    //             background:rgba(36,179,107,1);
    //             width: 260px;
    //             height: 36px;
    //             border-radius:4px;
    //             color: white;
    //             font-family: 'Microsoft Yahei';
    //             font-size:14px;
    //             font-weight:500;
    //             line-height:20px;
    //             letter-spacing:1px;
    //             }
    //             .server-confirm-button:hover{
    //                                 border: 1px solid #24B36B;
    //             background:rgba(36,179,107,1);
    //             width: 260px;
    //             height: 36px;
    //             border-radius:4px;
    //             color: white;
    //             font-family: 'Microsoft Yahei';
    //             font-size:14px;
    //             font-weight:500;
    //             line-height:20px;
    //             letter-spacing:1px;
    //             opacity: 0.8;
    //             }
    //             .server-cancel-button{
    //                 margin-top: 8px;
    //             border:1px solid rgba(221,221,221,1);
    //             background:rgba(255,255,255,1);
    //             width: 260px;
    //             height: 36px;
    //             border-radius:4px;
    //             color: black;
    //             font-family: 'Microsoft Yahei';
    //             font-size:14px;
    //             font-weight:500;
    //             line-height:20px;
    //             letter-spacing:1px;
    //             }
    //             .server-cancel-button:hover{
    //             border:1px solid rgba(221,221,221,1);
    //             background:rgba(255,255,255,1);
    //             width: 260px;
    //             height: 36px;
    //             border-radius:4px;
    //             color: black;
    //             font-family: 'Microsoft Yahei';
    //             font-size:14px;
    //             font-weight:500;
    //             line-height:20px;
    //             letter-spacing:1px;
    //             opacity: 0.8;
    //             }
    //         }
    //     }
    //     .setting-footer{
    //         width: 100%;
    //         height: 20px;
    //         margin-bottom: 20px;
    //         margin-top: 64px;
    //         .back-image{
    //             cursor: pointer;
    //             display: inline-block;
    //             width: 20px;
    //             height: 20px;
    //             margin-left: 24px;
    //         }
    //         .back-title{
    //             cursor: pointer;
    //             display: inline-block;
                
    //             height:20px;
    //             font-size:14px;
    //             margin: 0px;
    //             vertical-align: top;
    //             font-weight:500;
    //             color:rgba(0,0,0,1);
    //             line-height:20px;
    //             letter-spacing:1px;
    //         }
    //     }
    // }
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
                }
            }
            .btn-item{
                height: 80px;
                width: 100%;
                margin: 0px;
                margin-top: 24px;
                text-align: center;
                .server-confirm-button{
                border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: 'Microsoft Yahei';
                font-size:14px;
                font-weight:500;
                line-height:20px;
                letter-spacing:1px;
                }
                .server-confirm-button:hover{
                                    border: 1px solid #24B36B;
                background:rgba(36,179,107,1);
                width: 260px;
                height: 36px;
                border-radius:4px;
                color: white;
                font-family: 'Microsoft Yahei';
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
</style>
