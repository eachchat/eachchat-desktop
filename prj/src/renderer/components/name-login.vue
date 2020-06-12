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
import {sqliteutil} from '../../packages/data/index.js'

import {generalGuid} from '../../packages/core/Utils.js'
import * as path from 'path'
import { Base64 } from 'js-base64';
//var sqlite3 = require('sqlite3');


//const ref = require('ref')

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
        }
    },
    methods: {
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

        callback: function(msg){
            console.log("mqtt:" + msg)
        },
        login:async function() {   
            /*
            var db = new sqlite3.Database('./test.db')
            db.serialize(() => {
                db.run("PRAGMA KEY = 'secret'")
                db.run("PRAGMA CIPHER = 'aes-128-cbc'");
                
                db.run("CREATE TABLE messages(id INTEGER, user VARCHAR, msg TEXT)")
                db.run("INSERT INTO messages(id, user, msg) VALUES (1, 'coolaj86', 'this is test message number one')")
                
            })
            db.get("SELECT * FROM messages", (err, data) => {
                    if (err) {
                    console.error(err)
                    return
                    }
                    console.log(data)
                })
            return;
            */
            /*
            const ffi = require('ffi')
            var dllPath = path.join(__dirname, '/sqlciphercpp.dll');
            const Dll =new ffi.Library(dllPath, {
                    // 第一个参数为返回值,第二个参数是参数
                add: ['int', ['int','int']]
            })
            console.log(Dll.add);
            console.log(Dll.add(1, 2));
            console.log("login end")
            
            return;
            */
        
            let config = {
                hostname: '139.198.15.253',
                apiPort: '8888',
                username: 'chengfang.ai@yunify.com',
                password: '12345678',
                identityType: "password"
            }
            services.common.init(config)
            //console.log(await services.common.GetLoginModel())
            //console.log(await services.common.GetSelfUserModel())
            //await services.common.downloadGroupAvatar()
            if(1){
                let ret = await services.common.login()
                await services.common.InitServiceData();
            }
            else{
                await services.common.InitDbData()  
            }
            //await services.common.ListAllCollections();
            return;
            
            //await services.common.logout()
            //await services.common.refreshToken()
            
            //await services.common.dumpEncryptDB();

            
            //await services.common.CreateGroup("20200416test", ["e17423b05165a418614129254342fc17", "6cd80044ede9a6cd9bdad27480642fe1"])
            
            //let users = await services.common.GetGroupByName("程旺");
            //console.log(users)
            //let msgs = await services.common.historyMessage("5dd63d380a504164c80f081f", "27833", 10);
            //console.log(msgs)

            //let history;
            //history = await services.common.historyMessage("5e815b92cc101019c46c2eea", "441995121408884740", 20) 
            return;
    
            services.common.initmqtt()
            await services.common.handlemessage(this.callback)
            //await services.common.UpdateGroupName("5ec4fda7cc101002783bcb77", "77777777777")
            
            //await services.common.AddGroupUsers("5ec4fda7cc101002783bcb77", ["82dcc316dfc2a4992ac53ea884c9a3ac","d8501305b15cf84e2bb0260b7b1e3034, 568cd6fa3f7460e08d6fb6a9ff870d5e"])
            
            //await services.common.DeleteGroupUsers("5ec4fda7cc101002783bcb77", ["82dcc316dfc2a4992ac53ea884c9a3ac","d8501305b15cf84e2bb0260b7b1e3034, 568cd6fa3f7460e08d6fb6a9ff870d5e"])
            
            //await services.common.DeleteHistoryMessage("5ec4fda7cc101002783bcb77", "460862595424337900");           
            //await services.common.DeleteGroup("5ec4fda7cc101002783bcb77");           
            //await services.common.DeleteGroup("5ec62bfccc101002783bcc0c");           
            //await services.common.UpdateGroupNotice("5ec4fda7cc101002783bcb77", ".).(}");           
            //await services.common.UpdateGroupAvatar("5ec4fda7cc101002783bcb77", "D:\\文档\\anybox文档\\QingStor Box Desktop (PC App)\\preview\\page-1-setting_sync-copy.png")
            //await services.common.GroupStatus("5ec4fda7cc101002783bcb77", undefined, "true", "true");

            //await services.common.MessageRead("5e9ea897cc10101597c8959f", "451063225132793860");           
            

            //await services.common.CreateGroup("groupNameValue", ["8a93c2debb75bc4204f03c88c9dc11b1"])
           // await services.common.CreateGroup("groupNameValue", ["eb69c200e11801906322203ad59ff885", "8a93c2debb75bc4204f03c88c9dc11b1"])
            
            //let groups = await services.common.GetGroupByName("测试员101")
            //console.log(groups)
            /*            
            let guid = generalGuid();
            let time = new Date()
            let content = {
                text: "测试："+ time
            }
            
            services.common.sendNewMessage(guid, 
                                            102, 
                                            "25d4cb78d54840dfa70df0dfa847c024",
                                            "",
                                            "c17a0ac328a927d14ea9ee354692b496",
                                            time,
                                            content)
            */
            //services.common.ReveiveNewMessage("410244358794133500", 0)
            //services.common.CollectMessage(["5dd77ca60a50413b93e8d380", "5dd77ca00a50413b93e8d37b"]);
            //services.common.CollectMessage(["5dd77ca60a50413b93e8d380"]);

            //services.common.CollectGroup("5da072f20a50410ad607f33c");
            //services.common.DeleteCollectionMessage("5eb50ee4cc101041736820df");
            //services.common.DeleteCollectionGroup("5e9ea897cc10101597c8959f");


            
            return
            console.log(response);
        }
    },
    created: function () {
    },
    beforeCreate: async function() {
        return;
        console.log("before create ")
        let config = {
                hostname: '139.198.15.253',
                apiPort: '8888',
                username: 'chengfang.ai@yunify.com',
                password: '12345678'
            }
        services.common.init(config)
        var ret = await services.common.refreshToken();
        if(ret == undefined) {
            console.log("failed")
        }
        else{
            return;
            console.log("check token success ")
            await services.common.InitDbData();
            const ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.send('showMainPageWindow');
        }
        
        console.log("go out create ")
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
