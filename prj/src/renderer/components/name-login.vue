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
                <mac-window-header class="macWindowHeader" ></mac-window-header>
            </div>
        <div class="login-panel" >
            <div class="title">
                <div class="title-ico">
                    <img class="login-logo" src="../../../static/Img/Main/logo.png">
                </div><div class="tltle-content">
                    易企聊
                </div>
            </div>
            <div class="content">
                <!-- <div class="state">
                    <label>{{loginState}}</label>
                </div> -->
            <div class="item-account">
                <p class="account-title">
                    用户名
                </p>
                <input prefix="ios-contact-outline" v-model="username" placeholder="请输入用户名" class="item-input"/>
            </div>
            <div class="item-pwd">
                <p class="password-title">
                    密码
                </p>
                <input prefix="ios-lock-outline" type="password" v-model="password" placeholder="请输入密码"
                        class="item-input"/>
            </div>
            <div class="btn item">
                <Button type="success" @click="login()">登录</Button>
            </div>
            </div>
            <div class="login-footer">
                <p class="server-setting" @click="serverSettingClicked()">服务器设置</p>
            </div>
        </div>
    </div>
</template>

<script>
import os from 'os';
import {ipcRenderer} from 'electron'
import {services} from '../../packages/data/index.js'
import {environment} from '../../packages/data/environment.js'
import macWindowHeader from './macWindowHeader.vue';
export default {
    name: 'login',
    components:{
        macWindowHeader,
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
        }
    },
    methods: {
        serverSettingClicked(){

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
        login:async function() {
            var mac = environment.os.mac;
            var hostname = environment.os.hostName;
            // console.log("mac is ", environment.os);
            // console.log("hostname is ", hostname);
            let config = {
                hostname: "139.198.15.253",
                apiPort: 8888,
                username: this.username,
                password: this.password,
                model: hostname,
                deviceID: mac
            };
            services.common.init(config);
            
            let response = await services.common.login();
            console.log(response)
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
            
            this.loginState = "登录成功"

            setTimeout(async () => {
                this.tokenRefreshing = true;

                // await services.common.InitServiceData();
                
                this.loadingProcess = "正在加载用户信息";
                await services.common.AllUserinfo();
                this.loadingProcess = "正在加载组织信息";
                await services.common.AllDepartmentInfo();
                this.loadingProcess = "正在加载群组信息";
                await services.common.listAllGroup();
                // const ipcRenderer = require('electron').ipcRenderer;
                ipcRenderer.send('showMainPageWindow');
            }, 1000)
        }
    },
    mounted: function() {
        this.tokenRefreshing = true;
        var mac = environment.os.mac;
        var hostname = environment.os.hostName;
        // console.log("mac is ", mac);
        // console.log("hostname is ", hostname);
        let config = {
            hostname: "139.198.15.253",
            apiPort: 8888,
            username: "",
            password: "",
            model: hostname,
            deviceID: mac
        };
        setTimeout(() => {
            this.$nextTick(async () => {
                services.common.init(config);
                try{
                    await services.common.InitDbData();
                }
                catch(error){

                }
                var ret = await services.common.refreshToken();
                if(ret.state) {
                    // const ipcRenderer = require('electron').ipcRenderer;
                    ipcRenderer.send('showMainPageWindow');
                }
                else{
                    if(ret.msg == "tokenExpired") {
                        this.loginState = "认证已过期，请重新登录。"
                    }
                    this.tokenRefreshing = false;
                }
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

        .state {
            margin-top: 20px;
            text-align:center;
            color: #B33636;
            font-size: 9px;
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
                color: #76777A;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border: 1px solid #DFE0E3;
                border-radius: 3px;
                padding-left: 10px;
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
                color: #76777A;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border: 1px solid #DFE0E3;
                border-radius: 3px;
                padding-left: 10px;
            }
        }

        .btn {
            margin-top: 24px;
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
    }
    .login-footer{
        width: 100%;
        height: 20px;
        margin-bottom: 15px;
        margin-top: 68px;
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
</style>
