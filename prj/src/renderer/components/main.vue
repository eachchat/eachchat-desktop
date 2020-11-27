<template>
    <el-container class="mainpage">
        <el-aside class="navigate-panel" width="64px">
            <mac-window-header class="macWindowHeader" @Close="Close()" @Min="Min()" @Max="Max()"></mac-window-header>
            <div class="User">
                <img class="login-logo" id="userHead" src="../../../static/Img/User/user-40px@2x.png" @click="personalCenterClicked()"/>
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
            <p :class="getUnreadClass(this.unReadCount)" v-show="false">{{getUnReadCount(this.unReadCount)}}</p>
        </el-aside>
        <el-main class="tabcontainer">
            <!-- <component :is="curView"></component> -->
            <keep-alive>
                <router-view :distUserId="distUserId" :distGroupId="distGroupId" :receiveSearchKey="searchKey" :updateImg="updateImg"/>
            </keep-alive>
        </el-main>
        <personalCenter v-show="showPersonalCenter" :key="personalCenterKey"></personalCenter>
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
import {ipcRenderer, remote} from 'electron'
import {FileUtil} from '../../packages/core/Utils.js'
import {environment} from '../../packages/data/environment.js'
import personalCenter from './personalCenter.vue'
import {UserInfo} from '../../packages/data/sqliteutil.js';
import UpdateAlertDlg from './update-alert-dlg.vue'
import { setInterval } from 'timers';
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
                this.updateImg = !this.updateImg;
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
            unReadCount: 0,
            updateImg: false,
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
            
            showPersonalCenter:false,
            personalCenterKey: 0
        }
    },
    methods: {
        getUnReadCount(unReadCount) {
            return '';
            if(unReadCount === 0) return "";
            else return unReadCount > 99 ? "···" : unReadCount;
        },
        getUnreadClass(unReadCount) {
            var endPoint = "-unselected";
            if(unReadCount === 0) {
                if(remote.process.platform == 'darwin') {
                    return "mac-nav-readall" + endPoint;
                }
                else {
                    return "nav-readall" + endPoint;
                }
            }
            else {
                if(remote.process.platform == 'darwin') {
                    if(this.curindex == 0) {
                        return "mac-nav-unread";
                    }
                    else {
                        return "mac-nav-unread-no-focuse";
                    }
                }
                else {
                    if(this.curindex == 0) {
                        return "nav-unread";
                    }
                    else {
                        return "nav-unread-no-focuse";
                    }
                }
                return "nav-unread";
            }
        },
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
            const userId = window.localStorage.getItem("mx_user_id");
            confservice.init(userId);
            this.$store.commit("setUserId", userId)
            this.$router.push("/main/ChatContent");
            
            this.curindex = 0;
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
            return;
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
            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(global.mxMatrixClientPeg.matrixClient.getUserId());
            var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url, 40, 40);
            if(avaterUrl != "") {
                elementImg.setAttribute("src", avaterUrl);
            }
        },
        personalCenterClicked:async function(){
            if(this.showPersonalCenter){
                this.showPersonalCenter = false;
            }
            console.log("this.showpersonalcenter is ", this.showPersonalCenter);
            this.showPersonalCenter = true;
            this.personalCenterKey ++;
        },
        startCheckUpgrade: function() {
            async function checkUpgrade(self) {
                var newVersion = await global.services.common.GetNewVersion();
                console.log("newversion is ", newVersion);
                if(newVersion == undefined || newVersion == false)
                {
                    return;
                }
                else {
                    var sOsType = newVersion.osType;
                    var sUrl = newVersion.downloadUrl;
                    var sDescription = newVersion.description;
                    var smd5Hash = newVersion.md5Hash;
                    var sId = newVersion.id;
                    var sUpdateTime = newVersion.updateTime;
                    var sVerCode = newVersion.verCode;
                    try{
                        var sVerCodeSplit = sVerCode.split('.');
                    }
                    catch(err) {
                        return;
                    }
                    var sMajor_Version_Number = undefined;
                    var sMinor_Version_Number = undefined;
                    var sRevision_Number = undefined;
                    if(sVerCodeSplit.length >= 3) {
                        sMajor_Version_Number = sVerCodeSplit[0];
                        sMinor_Version_Number = sVerCodeSplit[1];
                        sRevision_Number = sVerCodeSplit[2];
                    }
                    else if(sVerCodeSplit.length == 2) {
                        sMajor_Version_Number = sVerCodeSplit[0];
                        sMinor_Version_Number = sVerCodeSplit[1];
                    }
                    else if(sVerCodeSplit.length == 1) {
                        sMajor_Version_Number = sVerCodeSplit[0];
                    }
                    else {
                        return;
                    }

                    var lVersion = remote.app.getVersion();
                    console.log("lVersion is ", lVersion)
                    var lVerCodeSplit = lVersion.split('.');
                    var lMajor_Version_Number = undefined;
                    var lMinor_Version_Number = undefined;
                    var lRevision_Number = undefined;
                    if(lVerCodeSplit.length >= 3) {
                        lMajor_Version_Number = lVerCodeSplit[0];
                        lMinor_Version_Number = lVerCodeSplit[1];
                        lRevision_Number = lVerCodeSplit[2];
                    }
                    else if(lVerCodeSplit.length == 2) {
                        lMajor_Version_Number = lVerCodeSplit[0];
                        lMinor_Version_Number = lVerCodeSplit[1];
                    }
                    else if(lVerCodeSplit.length == 1) {
                        lMajor_Version_Number = lVerCodeSplit[0];
                    }
                    else {
                        return;
                    }
                    console.log("localversion ", lMajor_Version_Number, " ", lMinor_Version_Number, " ", lRevision_Number);
                    console.log("serverversion ", sMajor_Version_Number, " ", sMinor_Version_Number, " ", sRevision_Number);
                    var sVerName = newVersion.verName;
                    var sForceUpdate = newVersion.forceUpdate;
                    var needUpdate = false;
                    if(sOsType != undefined && sOsType != "windows") {
                        return;
                    }
                    if(lMajor_Version_Number != undefined && sMajor_Version_Number != undefined) {
                        if(Number.parseInt(lMajor_Version_Number) > Number.parseInt(sMajor_Version_Number)) {
                            return;
                        }
                        else if(Number.parseInt(lMajor_Version_Number) == Number.parseInt(sMajor_Version_Number)) {
                            if(lMinor_Version_Number != undefined && sMinor_Version_Number != undefined) {
                                if(Number.parseInt(lMinor_Version_Number) > Number.parseInt(sMinor_Version_Number)) {
                                    return;
                                }
                                else if(Number.parseInt(lMinor_Version_Number) == Number.parseInt(sMinor_Version_Number)) {
                                    if(lRevision_Number != undefined && sRevision_Number != undefined) {
                                        if(Number.parseInt(lRevision_Number) >= Number.parseInt(sRevision_Number)) {
                                            return;
                                        }
                                        else {
                                            needUpdate = true;
                                        }
                                    }
                                }
                                else {
                                    needUpdate = true;
                                }
                            }
                        }
                        else {
                            needUpdate = true;
                        }
                    }
                    if(sForceUpdate != undefined && sForceUpdate){
                        if(needUpdate) {
                            self.showUpgradeAlertDlg = true;
                            self.upgradeCanCancel = false;
                            self.upgradeInfo = {
                                "downloadUrl": sUrl,
                                "description": sDescription,
                                "verName": sVerName,
                                "verId": sId
                            };
                        }
                    }
                    else {
                        if(needUpdate) {
                            self.showUpgradeAlertDlg = true;
                            self.upgradeCanCancel = true;
                            self.upgradeInfo = {
                                "downloadUrl": sUrl,
                                "description": sDescription,
                                "verName": sVerName,
                                "verId": sId
                            };
                        }
                    }
                }
            }
            checkUpgrade(this);
            setInterval(() => {
                checkUpgrade(this);
            }, 1000 * 3600)
        },
        startRefreshToken: function() {
            async function refreshToken(self) {
               
            }
            setTimeout(() => {
                refreshToken(this);
            }, 1000 * 3600 * 3.5)
        },
        softLogout: function(errObj) {
            if (global.mxMatrixClientPeg.isLoggingOut()) return;

            if (errObj != undefined && errObj.httpStatus === 401 && errObj.data && errObj.data['soft_logout']) {
                console.warn("Soft logout issued by server - avoiding data deletion");
                global.mxMatrixClientPeg.softLogout();
                global.mxMatrixClientPeg.logout();
                ipcRenderer.send("showLoginPageWindow");
                return;
            }
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
        if(global.mxMatrixClientPeg.homeserve == '') {
            var host = window.localStorage.getItem("mx_hs_url") == null ? "https://matrix.each.chat" : window.localStorage.getItem("mx_hs_url");
            var flows = await global.mxMatrixClientPeg.checkHomeServer(host)
            console.log("matrix get flows is ", flows)
            this.supportedIdentity = flows;
            for (let i = 0; i < flows.length; i++ ) {
                var appServerInfo = await global.mxMatrixClientPeg.getAppServerInfo();
                global.services.common.setGmsConfiguration(appServerInfo.data);
                break;
            }
            
            this.loginState = this.$t("invalidServerAddress");
            this.organizationButtonDisabled = false;

            await global
            var ret = await global.mxMatrixClientPeg.restoreFromLocalStorage();
            console.log("========= ret ", ret)
                if(ret == undefined) {
                    global.mxMatrixClientPeg.logout();
                    ipcRenderer.send("showLoginPageWindow");
                    return;
                }
                if(ret.language) {
                    this.$i18n.locale = ret.language;
                    console.log("=======language is ", ret.language)
                }
                console.log("the matrix client is ", global.mxMatrixClientPeg)
                this.matrixClient = global.mxMatrixClientPeg.matrixClient;
        }
        await global.services.common.login()
        await global.mxMatrixClientPeg.matrixClient.startClient();
        

        const ctx = this;
        global.mxMatrixClientPeg.matrixClient.on("sync", (state, prevState, data)=>{
          switch(state){
            case "PREPARED":
            //   console.clear();
            //   ctx.matrixSync = true;
                global.mxMatrixClientPeg.matrixClient.setGlobalErrorOnUnknownDevices(false);
              this.$store.dispatch('syncPrepare');
              console.log('matrix sync prepared.');
              break;
            default:
              break;
          }
        })
        global.mxMatrixClientPeg.matrixClient.on("Session.logged_out", this.softLogout)

        await global.services.common.login()
        global.services.common.InitDbData();
        //global.services.common.initmqtt();
        this.$nextTick(() => {
            this.showCurUserIcon();
        }) 
        var _this = this;
        document.addEventListener('click',function(e){
            console.log("e.target.classname is ", e.target.className)
            if(e.target.className.indexOf('personalCenter') == -1 && e.target.className.indexOf('login-logo') == -1){
                if(e.target.className.indexOf('cropper') == -1){
                    console.log("============")
                    _this.showPersonalCenter = false;
                }

            }
        });
        ipcRenderer.on('setUnreadCount', (e, count) => {
            this.unReadCount = count;
        })
    },
    created: async function () {
        ipcRenderer.on('updateUserImage', this.updateSelfImage);
        ipcRenderer.on('toLogout', this.softLogout);
        console.log("In Main Page The MatrixSdk is ", global.mxMatrixClientPeg)
        await this.getAppBaseData();
        this.startCheckUpgrade();
        // this.startRefreshToken();
    },
}
</script>

<style lang="scss" scoped>
    .mainpage {
        cursor: default;
        margin: 0 0 0 0;
        width: 100%;
        height: 100%;
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
        border-radius:4px;
    }

    .login-logo {
        width: 40px;
        height: 40px;
        border-radius:4px;
    }

    .nav-unread {
        position: absolute;
        top: 124px;
        left: 36px;
        font-size: 10px;
        font-family: PingFangSC-Medium;
        float: right;
        color: rgb(255, 255, 255);
        margin: 0px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 14px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 1);
        // z-index:-1;
    }

    .nav-unread-no-focuse {
        position: absolute;
        top: 124px;
        left: 36px;
        font-size: 10px;
        font-family: PingFangSC-Medium;
        float: right;
        color: rgba(255, 255, 255, 0.5);
        margin: 0px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 14px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 0.7);
    }

    .mac-nav-unread {
        position: absolute;
        top: 136px;
        left: 36px;
        font-size: 10px;
        font-family: PingFangSC-Medium;
        float: right;
        color: rgb(255, 255, 255);
        margin: 0px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 14px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 1);
        // z-index:-1;
    }

    .mac-nav-unread-no-focuse {
        position: absolute;
        top: 136px;
        left: 36px;
        font-size: 10px;
        font-family: PingFangSC-Medium;
        float: right;
        color: rgba(255, 255, 255, 0.5);
        margin: 0px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 14px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 0.7);
    }

    .nav-readall-unselected {
        position: absolute;
        top: 124px;
        left: 36px;
        font-size: 10px;
        font-family:PingFangSC-Medium;
        float: right;
        color: rgb(255, 255, 255);
        margin: 0px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 14px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 0);
    }

    .mac-nav-readall-unselected {
        position: absolute;
        top: 136px;
        left: 36px;
        font-size: 10px;
        font-family:PingFangSC-Medium;
        float: right;
        color: rgb(255, 255, 255);
        margin: 0px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 14px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 0);
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
