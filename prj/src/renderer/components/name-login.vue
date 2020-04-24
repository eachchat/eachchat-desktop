<template>
    <div class="login">
        <div class="login-panel" style="-webkit-app-region: no-drag">
            <div class="title">
                <div class="title-ico">
                    <img class="login-logo" src="../assets/Logo_Big.png">
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
import {services} from '../../packages/data/index.js'
export default {
    name: 'login',
    data () {
        return {
            loginState: '',
            username: '',
            password: '',
            host: '',
            port: '',
            services: null
        }
    },
    methods: {
        clickUser () {
            location.reload()
        },
        login:async function() {
            let config = {
                hostname: "139.198.15.253",
                apiPort: 8888,
                username: this.username,
                password: this.password
            };
            services.common.init(config);
            
            let response = await services.common.login();
            await services.common.InitServiceData();
            console.log(response)
            var ret_data = response;
            if(response){
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
            await services.common.listAllGroup();
            console.log(services.common.GetAllGroups);
            let loginModel = await services.common.GetLoginModel();
            let userModel = await services.common.GetSelfUserModel();

            // console.log("the login model is ", loginModel)
            // console.log("the login model token is ", loginModel.refresh_token)
            // console.log("the user model is ", userModel)
            
            this.$store.commit("setRefreshToken", loginModel.refresh_token);
            this.$store.commit("setAccessToken", loginModel.access_token);
            this.$store.commit("setUserAccount", this.username);
            this.$store.commit("setUserPwd", this.password);
            this.$store.commit("setUserId", loginModel.user_id);
            // this.$store.commit("setUserInfo", userModel);

            const ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.send('showMainPageWindow');
        }
    },
    created: function () {
    }
}
</script>

<style lang="scss" scoped>
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
