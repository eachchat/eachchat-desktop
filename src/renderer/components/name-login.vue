<template>
    <div class="login">
        <div class="login-panel" style="-webkit-app-region: no-drag">
            <div class="title">
                <div class="title-ico">
                    <img class="login-logo" src="../assets/Logo_Big.png"></img>
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
import {Login, InitServerAPI} from '../server/serverapi.js'
export default {
  name: 'login',
  data () {
    return {
        loginState: '',
        username: '',
        password: '',
        host: '',
        port: ''
    }
  },
  methods: {
    clickUser () {
      location.reload()
    },
    login: async function() {
      let ret = await Login(this.username, this.password)   
      console.log(ret)
      if(ret.length == 0)
        this.loginState = "登录成功"
      else
        this.loginState = ret  
    }
  },
  created: function () {
    InitServerAPI('http', '139.198.15.253', 8081)
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
