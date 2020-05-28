<template>
    <el-container class="mainpage">
        <el-aside class="navigate-panel" width="64px">
            <div class="User">
                <img class="login-logo" id="userHead">
            </div>
            <el-menu
                class="nav-menu">
                <el-menu-item
                    class="nav-item"
                    v-for="(tabitem, index) in Navigate"
                    v-bind:key="index"
                    @click="menuClicked(index, tabitem.name, tabitem.link, tabitem.view)"
                    :class="{active: index===curindex}"
                    >
                    <i :class="getCurNavIcon(index)"></i>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main class="tabcontainer">
            <component :is="curView"></component>
        </el-main>
    </el-container>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import organization from './organization.vue'
import ChatContent from './chat-content.vue'
import favourite from './favourite.vue'
import {services} from '../../packages/data/index.js'
import {ServerApi} from '../server/serverapi.js'
import {downloadGroupAvatar} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {ipcRenderer} from 'electron'
import {FileUtil} from '../../packages/core/Utils.js'

export default {
    name: 'mainpage',
    data () {
        return {
            curindex: 0,
            curView: 'ChatContent',
            serverapi: new ServerApi('http', '139.198.15.253'),
            Navigate:[
                {    
                    text: "聊天",
                    name: "chat",
                    link: "/chat",
                    view: "ChatContent"
                },
                {
                    text: "组织",
                    name: "contact list",
                    link: "/organization",
                    view: "organization"   
                },
                {
                    text: "收藏",
                    name: "favourite",
                    link: "/favourite",
                    view: "favourite"
                },
                // {
                //     text: "更多",
                //     name: "contact list",
                //     link: "/organization",
                //     view: "organization"
                // }
            ],
            elementImg: null,
            ipcInited: false,
        }
    },
    methods: {
        getAppBaseData:async function() {
            // Init services
            let config = {
                hostname: "139.198.15.253",
                apiPort: 8888,
            };
            services.common.init(config);
            // Set accessToken in services
            this.loginInfo = await services.common.GetLoginModel();
            this.curUserInfo = await services.common.GetSelfUserModel();
            this.$store.commit("setUserId", this.curUserInfo.id);
            confservice.init(this.curUserInfo.id);
            console.log("lognInfo is ", this.loginInfo);
            // Get data from server and set in database
            // UserInfo
            // await services.common.AllUserinfo();
            // var userInfos = await services.common.GetAllUserinfo();
            // for (var i = 0; i < userInfos.length; i++) {
            //     console.log(userInfos[i].user_name);
            // }
            
            // DepartmentInfo
            // await services.common.AllDepartmentInfo();
            // var departmentInfos = await services.common.GetAllDepartmentsModel();
            // for (var i = 0; i < departmentInfos.length; i++) {
            //     console.log(departmentInfos[i].displayName);
            // }

        },
        menuClicked (cur_index, cur_name, cur_link, cur_view) {
            this.curindex = cur_index;
            this.curView = cur_view;
            console.log(cur_index);
            console.log(cur_name);
            console.log(cur_link);
        },
        getCurNavIcon (cur_index) {
            var endding = " active"
            if(cur_index != this.curindex) {
                endding = ""
            }
            if(cur_index === 0)
            {
                return "el-icon-s-comment" + endding
            }
            else if(cur_index === 1)
            {
                return "el-icon-share" + endding
                
            } else if (cur_index === 2) {
                return "el-icon-star-off" + endding
            }
            else{
                return "el-icon-more-outline" + endding
            }
        },
        checkAndLoadUserImage: function(distPath) {
            var checkingPath = distPath;
            var elementImg = document.getElementById("userHead");
            
            var checking = function () {
                setTimeout(function () {
                    if(fs.existsSync(checkingPath)){
                        var showfu = new FileUtil(checkingPath);
                        let showfileObj = showfu.GetUploadfileobj();
                        let reader = new FileReader();
                        reader.readAsDataURL(showfileObj);
                        reader.onloadend = () => {
                            console.log("checkAndLoadUserImage this is ", this)
                            elementImg.setAttribute("src", reader.result);
                        }
                        return;
                    }
                    checking();
                }, 200)
            }
            checking();
        },
        updateUserImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            // console.log("=============================")
            var elementImg = document.getElementById("userHead");
            var showfu = new FileUtil(localPath);
            let showfileObj = showfu.GetUploadfileobj();
            let reader = new FileReader();
            reader.readAsDataURL(showfileObj);
            reader.onloadend = () => {
                elementImg.setAttribute("src", reader.result);
            }
        },
        showCurUserIcon: async function() {
            var elementImg = document.getElementById("userHead");
            // downloadGroupAvatar(this.curUserInfo.avatar_minimal, this.loginInfo.access_token)

            var targetPath = "";
            // console.log("===========this.curUserInfo.avatar_minimal ", this.curUserInfo.avatar_minimal)
            if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(this.curUserInfo.avatar_minimal, this.selfUserInfo.id))) {
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
                return;
            }
            else {
                if(!this.ipcInited) {
                    // console.log("===========this.ipcInited ", this.ipcInited)
                    ipcRenderer.on('updateUserImage', this.updateUserImage);
                    this.ipcInited = true;
                }
            }
            // var targetDir = confservice.getFilePath();
            // var targetFileName = this.selfUserInfo.id + ".png";
            // var targetPath = path.join(targetDir, targetFileName);
            // console.log("targetPath is ", targetPath);
            // if(fs.existsSync(targetPath)){
            //     //thumbnailImage为本地路径，该消息为自己发送的消息，读取本地图片显示
            //     var showfu = new FileUtil(targetPath);
            //     let showfileObj = showfu.GetUploadfileobj();
            //     let reader = new FileReader();
            //     reader.readAsDataURL(showfileObj);
            //     reader.onloadend = () => {
            //         elementImg.setAttribute("src", reader.result);
            //     }
            // }
            // else{
            //     // ipcRenderer.send('download-image', [this.msg.time_line_id, this.loginInfo.access_token, services.common.config.hostname, services.common.config.apiPort, targetPath, "T", false]);
            //     console.log("message downloag group avatar target path is ", this.curUserInfo.avatar_minimal);
            //     services.common.downloadGroupAvatar(this.curUserInfo.avatar_minimal, targetPath);
            //     this.checkAndLoadUserImage(targetPath);
            // }
        }
    },
    components: {
        organization,
        ChatContent,
        favourite
    },
    mounted: async function() {
        await services.common.GetLoginModel();
        this.selfUserInfo = await services.common.GetSelfUserModel();
        this.$nextTick(() => {
            this.showCurUserIcon();
        })
    },
    created: async function () {
        await this.getAppBaseData();
    },
}
</script>

<style lang="scss" scoped>
    .mainpage {
        margin: 0 0 0 0;
        width: 100%;
        height: 100%;
    }

    .nav-menu {
        width: 64px;
        height: 100%;
        padding: 0px;
        margin: 0px;
        background: rgb(61, 62, 73);
    }

    .navigate-panel {
        height: 100%;
        background: rgb(61, 62, 73);
        overflow: hidden;
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
    }

    .User {
        width: calc(100%-6px);
        height: 40px;
        text-align: center;
        line-height: 40px;
        margin: 20px 0px 10px 0px;
    }

    .login-logo {
        width: 40px;
        height: 40px;
    }

    .nav-item {
        height: 60px;
        text-align: center;
        line-height: 60px;
        background-color: rgb(61, 62, 73);
    }

    .nav-item.active {
        height: 60px;
        text-align: center;
        color: rgba(255, 255, 255, 1);
        line-height: 60px;
        background-color: rgb(61, 62, 73);
    }

    .nav-item:hover {
        height: 60px;
        text-align: center;
        line-height: 60px;
        background-color: rgb(61, 62, 73);
    }

    .el-icon-s-comment.active {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-s-comment:hover {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-s-comment {
        color:rgba(255, 255, 255, 0.3);
    }

    .el-icon-share {
        color:rgba(255, 255, 255, 0.3);
    }

    .el-icon-share.active {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-share:hover {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-more-outline {
        color:rgba(255, 255, 255, 0.3);
    }

    .el-icon-more-outline:hover {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-more-outline.active {
        color:rgba(255, 255, 255, 1);
    }

    .tabcontainer {
        padding: 0px;
        width: calc(100% - 70px);
        height: 100%;
        vertical-align: top;
        margin: 0px;
        overflow-y:hidden;
        overflow-x: hidden;
    }

</style>
