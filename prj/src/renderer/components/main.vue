<template>
    <el-container class="mainpage">
        <el-aside class="navigate-panel" width="64px">
            <mac-window-header class="macWindowHeader" @Close="Close()" @Min="Min()" @Max="Max()"></mac-window-header>
            <div class="User">
                <img class="login-logo" id="userHead" @click="personalCenterClicked()">
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
                    <p :class="getCurNavIcon(index)"></p>
                    <!-- <i :class="getCurNavIcon(index)"></i> -->
                </el-menu-item>
            </el-menu>
            <div class="NavSetUp" @click="showSetUpPage">
                <div class="NavSetUpImg" :class="{active: 3===curindex}"></div>
            </div>
        </el-aside>
        <el-main class="tabcontainer">
            <!-- <component :is="curView"></component> -->
            <keep-alive>
                <router-view :distUserId="distUserId" :distGroupId="distGroupId" :receiveSearchKey="searchKey"/>
            </keep-alive>
        </el-main>
        <personalCenter v-show="showPersonalCenter" :userInfo="selfUserInfo" :key="personalCenterKey"></personalCenter>
        <UpdateAlertDlg v-show="showUpgradeAlertDlg" @closeUpgradeDlg="closeUpgradeAlertDlg" :upgradeInfo="upgradeInfo" :canCancel="upgradeCanCancel"/>
    </el-container>
</template>

<script>
import os from 'os';
import * as path from 'path'
import * as fs from 'fs-extra'
import macWindowHeader from './macWindowHeader.vue'
import organization from './organization.vue'
import ChatContent from './chat-content.vue'
import favourite from './favourite.vue'
import {services} from '../../packages/data/index.js'
//import {ServerApi} from '../server/serverapi.js'
import {downloadGroupAvatar} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {ipcRenderer} from 'electron'
import {FileUtil} from '../../packages/core/Utils.js'
import {environment} from '../../packages/data/environment.js'
import personalCenter from './personalCenter.vue'
import {UserInfo} from '../../packages/data/sqliteutil.js';
import UpdateAlertDlg from './update-alert-dlg.vue'
export default {
    name: 'mainpage',
    watch: {
        '$route'(to, from){
            console.log("========== to.params.user_id is ", to);
            console.log("========== to.params.user_id is ", from);
            if(to.name == "ChatContent") {
                if(to.params.user_id != undefined) {
                    this.distUserId = to.params.user_id;
                }
                else if(to.params.group_id != undefined) {
                    this.distGroupId = to.params.group_id;
                }
                else {
                    this.distUserId = '';
                    this.distGroupId = '';
                }
                this.curindex = 0;
            }
            else if(to.name == "organization") {
                if(to.params.searchKey != undefined) {
                    this.searchKey = to.params.searchKey;
                }
                this.curindex = 1;
            }
        }
    },
    data () {
        return {
            upgradeInfo: {},
            upgradeCanCancel: true,
            showUpgradeAlertDlg:false,
            searchKey: '',
            distGroupId: '',
            distUserId: '',
            curindex: -1,
            curView: 'ChatContent',
            //serverapi: new ServerApi('http', '139.198.15.253'),
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
                //     text: "设置",
                //     name: "setUp",
                //     link: "/setUp",
                //     view: "setUp"
                // }
            ],
            elementImg: null,
            ipcInited: false,
            
            selfUserInfo:{},
            showPersonalCenter:false,
            personalCenterKey: 0,
        }
    },
    methods: {
        closeUpgradeAlertDlg: function() {
            this.showUpgradeAlertDlg = false;
        },
        clearCache: function() {
            this.showUpgradeAlertDlg = false;
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
        showSetUpPage: function() {
            this.curindex = 3;
            this.$router.push("/main/setup")
        },
        getAppBaseData:async function() {
            // Init services
            // let config = {
            //     hostname: "139.198.15.253",
            //     apiPort: 8888,
            // };
            // services.common.init(config);
            // Set accessToken in services
            await services.common.init();
            this.loginInfo = await services.common.GetLoginModel();
            this.curUserInfo = await services.common.GetSelfUserModel();
            // console.log("11111111111111111111111111")
            // services.common.AllUserinfo();
            // console.log("22222222222222222222222222")
            console.log("the init user id is ,", this.curUserInfo.id)
            confservice.init(this.curUserInfo.id);
            this.$store.commit("setUserId", this.curUserInfo.id)
            console.log("lognInfo is ", this.loginInfo);
            this.$router.push("/main/ChatContent");
            
            this.curindex = 0;
            this.showCurUserIcon();
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
        async menuClicked (cur_index, cur_name, cur_link, cur_view) {
            this.curindex = cur_index;
            // this.curView = cur_view;
            console.log(cur_index);
            console.log(cur_name);
            console.log(cur_link);
            if(cur_name == "chat") {
                this.$router.push("/main/ChatContent")
            }
            else if(cur_name == "contact list") {
                this.$router.push("/main/organization")
            }
            else if(cur_name == "favourite") {
                this.$router.push("/main/favourite")
            }
        },
        getCurNavIcon (cur_index) {
            var endding = " active"
            if(cur_index != this.curindex) {
                endding = ""
            }
            if(cur_index === 0)
            {
                return "NavChatting" + endding;
            }
            else if(cur_index === 1)
            {
                return "NavOrganization" + endding;
                
            } else if (cur_index === 2) {
                return "NavFavourite" + endding;
            } else if (cur_index === 3) {
                return "NavSetUp" + endding;
            }
            else{
                return "NavMore";
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
        updateSelfImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var elementImg = document.getElementById("userHead");
            if(id != this.curUserInfo.id) {
                return;
            }
            if(elementImg != null){
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
                
            }
        },
        showCurUserIcon: async function() {
            var elementImg = document.getElementById("userHead");
            // downloadGroupAvatar(this.curUserInfo.avatar_minimal, this.loginInfo.access_token)

            var targetPath = "";
            // console.log("===========this.curUserInfo.avatar_minimal ", this.curUserInfo.avatar_minimal)
            // targetPath = path.join(confservice.getEachChatFilesDir(), this.curUserInfo.id);
            if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(this.curUserInfo.avatar_minimal, this.curUserInfo.id, targetPath))) {
                elementImg.setAttribute("src", targetPath);
            }
        },
        personalCenterClicked:async function(){
            if(this.showPersonalCenter){
                this.showPersonalCenter = false;
            }
            var self = await services.common.GetSelfUserModel();
            this.selfUserInfo = await UserInfo.GetUserInfo(self.id);
            this.showPersonalCenter = true;
            this.personalCenterKey ++;
        },
        startCheckUpgrade: function() {
            async function checkUpgrade(self) {
                var newVersion = await services.common.GetNewVersion();
                console.log("newversion is ", newVersion);
                if(newVersion == undefined)
                {
                    return;
                }
                if(newVersion.osType != undefined && newVersion.osType != "windows") {
                    return;
                }
                if(newVersion.forceUpdate != undefined && newVersion.forceUpdate){
                    return;
                    self.showUpgradeAlertDlg = true;
                    self.upgradeCanCancel = false;
                    self.upgradeInfo = newVersion;
                }
                else {
                    return;
                    self.showUpgradeAlertDlg = true;
                    self.upgradeInfo = newVersion;
                }
            }
            checkUpgrade(this);
            setTimeout(() => {
                checkUpgrade(this);
            }, 1000 * 3600)
        }
    },
    components: {
        organization,
        ChatContent,
        favourite,
        macWindowHeader,
        personalCenter,
        UpdateAlertDlg,
    },
    mounted: async function() {
        await services.common.GetLoginModel();
        this.selfUserInfo = await services.common.GetSelfUserModel();
        //await services.common.AllUserinfo();
        this.$nextTick(() => {
            // this.showCurUserIcon();
        }) 
        var _this = this;
        document.addEventListener('click',function(e){
            if(e.target.className.indexOf('personalCenter') == -1){
                _this.showPersonalCenter = false;
            }
        });
    },
    created: async function () {
        ipcRenderer.on('updateUserImage', this.updateSelfImage);
        await this.getAppBaseData();
        this.startCheckUpgrade();

    },
}
</script>

<style lang="scss" scoped>
    .mainpage {
        cursor: default;
        margin: 0 0 0 0;
        width: 100%;
        height: 100%;
        -webkit-user-select:none;
    }

    .nav-menu {
        width: 64px;
        height: 100%;
        padding: 0px;
        margin-top: 36px;
        background: rgba(74, 76, 91, 1);
    }

    .navigate-panel {
        height: 100%;
        width: 100%;
        background: rgba(74, 76, 91, 1);
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
        margin: 40px 0px 10px 0px;
    }

    .login-logo {
        width: 40px;
        height: 40px;
    }

    .nav-item {
        height: 50px;
        text-align: center;
        line-height: 50px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .nav-item.active {
        height: 50px;
        text-align: center;
        color: rgba(255, 255, 255, 1);
        line-height: 50px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .nav-item:hover {
        height: 50px;
        text-align: center;
        line-height: 50px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .NavChatting {
        border: 1px red;
        background-image: url("../../../static/Img/Navigate/chat-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavChatting:hover {
        border: 0px;
        background-image: url("../../../static/Img/Navigate/chathover-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavChatting.active {
        border: 0px;
        background-image: url("../../../static/Img/Navigate/chatselected-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavOrganization {
        border: 1px red;
        background-image: url("../../../static/Img/Navigate/org-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavOrganization:hover {
        border: 0px;
        background-image: url("../../../static/Img/Navigate/orghover-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavOrganization.active {
        border: 0px;
        background-image: url("../../../static/Img/Navigate/orgselected-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavFavourite {
        border: 1px red;
        background-image: url("../../../static/Img/Navigate/fav-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavFavourite:hover {
        border: 0px;
        background-image: url("../../../static/Img/Navigate/favhover-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavFavourite.active {
        border: 0px;
        background-image: url("../../../static/Img/Navigate/favselected-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavSetUp {
        position: absolute;
        bottom: 20px;
        left: 20px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .NavSetUp.active {
        position: absolute;
        bottom: 20px;
        left: 20px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .NavSetUp:hover {
        position: absolute;
        bottom: 20px;
        left: 20px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .NavSetUpImg {
        border: 1px red;
        background-image: url("../../../static/Img/Navigate/setup-nor-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavSetUpImg:hover {
        border: 0px;
        background-image: url("../../../static/Img/Navigate/setup-hover-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    .NavSetUpImg.active {
        border: 0px;
        background-image: url("../../../static/Img/Navigate/setupsel-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
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
.macWindowHeader {
    padding: 0px;
    margin: 0px;
    width: 64px;
}
</style>
