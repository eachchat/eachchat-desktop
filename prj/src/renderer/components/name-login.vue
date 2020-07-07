<template>
    <div class="login">
        <div class="welcome-panel" v-if="isCheckToken()">
            <p class="welcome-zh-line1">您好，</p><p class="welcome-zh-line2">欢迎使用易企聊!</p>
            <p class="welcome-en">Hello, welcome to user EachChat!</p>
            <div class="welcome-loading">
                <i class="el-icon-loading"></i><p class="welcome-loading-text">加载中，请稍后...</p>
            </div>
            <p class="copy-right">版权所有 2019-2020 workly.ai 保留所有权利</p>
        </div>
        <div class="login-panel" v-else style="-webkit-app-region: no-drag">
            <div class="title">
                <div class="title-ico">
                    <img class="login-logo" src="../../../static/Img/Main/logo.png">
                </div>
                <div class="tltle-content">
                    登录
                </div>
            </div>
            <div class="state">
                <label>{{loginState}}</label>
            </div>
            <div class="item-account">
                <input prefix="ios-contact-outline" v-model="username" placeholder="账号" class="item-input"/>
            </div>
            <div class="item-pwd">
                <input prefix="ios-lock-outline" type="password" v-model="password" placeholder="密码"
                        class="item-input"/>
            </div>
            <div class="btn item">
                <Button type="success" @click="login()">登录</Button>
            </div>
        </div>
    </div>
</template>

<script>
import os from 'os';
import {ipcRenderer} from 'electron'
import {services} from '../../packages/data/index.js'
import {environment} from '../../packages/data/environment.js'
export default {
    name: 'login',
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
        }
    },
    methods: {
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
            console.log("mac is ", environment.os);
            console.log("hostname is ", hostname);
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
            if(!response){
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

            await services.common.InitServiceData();
            // const ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.send('showMainPageWindow');
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
    .login {
        width: 100%;
        height: 100%;
    }

    .welcome-panel {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
    }

    .welcome-zh-line1 {
        margin: 0px;
        padding-top: 10%;
        padding-left: 30px;
        padding-bottom: 10px;
        font-size: 24px;
        font-family: 'Microsoft YaHei';
    }

    .welcome-zh-line2 {
        margin: 0px;
        padding-top: 0;
        padding-left: 30px;
        padding-bottom: 10px;
        font-size: 24px;
        font-family: 'Microsoft YaHei';
    }

    .welcome-en {
        margin: 0px;
        padding-left: 30px;
        padding-bottom: 30px;
        font-size: 15px;
        font-family: 'Microsoft YaHei';
        color: rgba(60, 60, 67, 0.6);
    }
    
    .el-icon-loading {
        display: inline-block;
        margin-right: 5px;
    }

    .welcome-loading-text {
        display: inline-block;
        color:rgba(60, 60, 67, 0.9)
    }

    .welcome-loading {
        width: 100%;;
        font-size: 12px;
        font-family: 'Microsoft YaHei';
        text-align: center;
        margin: 0px;
        padding: 0px;
        position: absolute;
        bottom: 45px;
        left: 0px;
    }

    .copy-right {
        width: 100%;;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: center;
        margin: 0px;
        padding: 0px;
        position: absolute;
        bottom: 30px;
        left: 0px;
    }

    .login-panel {
        width: 480px;
        height: 210px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 2rem 3rem 5rem 3rem;
        position: absolute;
        left:0;
        right: 0;
        margin:auto;
        z-index: 2;
        align: center;
        
        .title {
            display: flex;
            justify-content: center;

            .title-ico {
                float: left;
            }

            .tltle-content {
                float: right;
                width:48px;
                height:48px;
                line-height:48px;
            }
        }

        .state {
            margin-top: 20px;
            text-align:center;
            color: #B33636;
            font-size: 9px;
        }

        .item-account{
            margin-top: 8px;
            text-align: center;        

            .item-input {
                width:260px;
                height:32px;
                color: #76777A;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border: 1px solid #DFE0E3;
                border-radius: 3px;
                padding-left: 10px;
            }
        }

        .item-pwd {
            margin-top: 16px;
            text-align: center;        

            .item-input {
                width:260px;
                height:32px;
                color: #76777A;
                margin: 0 0 0 0;
                box-sizing: border-box;
                border: 1px solid #DFE0E3;
                border-radius: 3px;
                padding-left: 10px;
            }
        }

        .btn {
            margin-top: 16px;
            text-align: center;

            button {
                border: 1px solid #24B36B;
                background-color: #24B36B;
                width: 260px;
                height: 32px;
                border-radius:2px;
                color: white;
                font-family: 'Microsoft Yahei';
            }
            
            button:hover {
                border: 1px solid #24B36B;
                background-color: #24B36B;
                width: 260px;
                height: 32px;
                border-radius:2px;
                color: white;
                font-family: 'Microsoft Yahei';
                opacity: 0.8;
            }

        }

        .title {
            font-family: 'Microsoft Yahei';
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
    }
</style>
