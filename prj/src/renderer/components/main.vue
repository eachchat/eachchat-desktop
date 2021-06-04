<template>
    <el-container class="mainpage">
        <el-aside class="navigate-panel" width="64px">
            <mac-window-header class="macWindowHeader" @Close="Close()" @Min="Min()" @Max="Max()" :isNormal="isNormal" v-show="!isFullScreen"></mac-window-header>
            <div class="User">
                <img class="login-logo img-disable-drag" id="userHead" src="../../../static/Img/User/user-40px@2x.png" @click="personalCenterClicked()" onerror = "this.src = './static/Img/User/user-40px@2x.png'"/>
            </div>
            <el-menu
                class="nav-menu">
                <el-menu-item 
                    :disabled = 'navEnable || dataIsLoading || dbDataNotFinished'
                    class="nav-item"
                    v-for="(tabitem, index) in Navigate"
                    v-bind:key="index"
                    @click="menuClicked(index, tabitem.name, tabitem.link, tabitem.view)"
                    :class="{active: index===curindex}"
                    >
                    <p :class="getCurNavIcon(index)"></p>
                    <span class="tooltiptext">{{getToolTipContent(index)}}</span>
                    <p id = 'main-invitenum' v-show = 'index == 1 && getInviteNum() != 0' :class = 'getInviteNumClass()'>{{getInviteNum()}}</p>
                </el-menu-item>
            </el-menu>
            <div class="NavSetUp" @click="showSetUpPage">
                <div class="NavSetUpImg" :class="{active: 3===curindex}"></div>
                <span class="tooltiptext">{{getToolTipContent(index)}}</span>
                <div v-show = "bshowNewversionDot" class = "newversiondot"></div>
            </div>
            <p :class="getUnreadClass(this.unReadCount)">{{getUnReadCount(this.unReadCount)}}</p>
        </el-aside>
        <el-main class="tabcontainer" v-show="!navEnable && !dataIsLoading" >
            <!-- <component :is="curView"></component> -->
            <keep-alive>
                <router-view :distUserId="distUserId" :distGroupId="distGroupId" :setToRealAll="setToRealAll" :receiveSearchKey="searchKey" :updateImg="updateImg" :scrollToRecentUnread="scrollToRecentUnread" @matrixSyncEnd = "matrixSyncEnd"
                :organizationClick = "organizationClick" :toSaveDraft="toSaveDraft" :toUpdateTrayNotice="toUpdateTrayNotice" @toDataOk="toDataOk"/>
            </keep-alive>
        </el-main>
        <div class="loadingDiv" v-show="navEnable || dataIsLoading">
            <div class="loadingInfo">
                <img class="isLoading" id="isLoadingId" src="../../../static/Img/Main/mainLoading@2x.png">
                <div class="loadingText">正在加载数据</div>
            </div>
        </div>
        <personalCenter v-if="showPersonalCenter" :key="personalCenterKey" @showPersonalInfoHanlder="showPersonalInfoHanlder"></personalCenter>
        <userInfoContent :userInfo="userInfo" :originPosition="pagePosition" v-if="showPersonalInfo" :key="userInfoTipKey"  :userType="userType" :isOwn="isOwn"></userInfoContent>
        <UpdateAlertDlg v-show="showUpgradeAlertDlg" :showUpgradeAlertDlg = "showUpgradeAlertDlg" @closeUpgradeDlg="closeUpgradeAlertDlg" :upgradeInfo="upgradeInfo"/>
        <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="toChangePassword" :haveBG="true"/>
        <ChangePassword v-show="showChangePassword" @CloseChangePassword="CloseChangePassword"></ChangePassword>
    </el-container>
</template>

<script>
import * as fs from 'fs-extra'
import macWindowHeader from './macWindowHeader.vue'
import organization from './organization.vue'
import ChatContent from './chat-content.vue'
import favourite from './favourite.vue'
import confservice from '../../packages/data/conf_service.js'
import {ipcRenderer, remote} from 'electron'
import {FileUtil} from '../../packages/core/Utils.js'
import personalCenter from './personalCenter.vue'
import {Message, Config, sqliteutil} from '../../packages/data/sqliteutil.js';
import { models } from '../../packages/data/models.js';
import userInfoContent from './user-info';
import {ComponentUtil} from '../script/component-util.js'
import AlertDlg from './alert-dlg.vue'
import ChangePassword from './changePassword.vue'
import axios from "axios";

import UpdateAlertDlg from './update-alert-dlg.vue'
import { setInterval } from 'timers';
export default {
    name: 'mainpage',
    watch: {
        '$route'(to, from){
            this.toSaveDraft = this.toSaveDraft + 1;
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
                setTimeout(() => {
                    this.distUserId = '';
                    this.distGroupId = '';
                }, 500);
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
            bshowNewversionDot: false,
            toUpdateTrayNotice: 0,
            setToRealAll: [],
            isNormal: true,
            isFullScreen: false,
            toSaveDraft: 0,
            navEnable: true,
            dataIsLoading: true,
            dbDataNotFinished: true, 
            scrollToRecentUnread: false,
            showChangePassword: false,
            alertContnets: {},
            showAlertDlg: false,
            displayName: '',
            userInfo: undefined,
            isOwn: true,
            userInfoTipKey: 1,   //用户信息弹窗强制更新
            pagePosition:{},
            userType: "mainUserInfo",
            unReadCount: 0,
            updateImg: false,
            upgradeInfo: {},
            showUpgradeAlertDlg:false,
            searchKey: '',
            distGroupId: '',
            distUserId: '',
            curindex: -1,
            curView: 'ChatContent',
            organizationClick: 0,
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
            ],
            elementImg: null,
            ipcInited: false,
    
            showPersonalCenter:false,
            showPersonalInfo: false,
            personalCenterKey: 0,
            loadingInterval: undefined,
            loadingElement: undefined,
            curRotate: 0,
            version: ""
        }
    },
    methods: {
        toDataOk() {
            console.log("=====================kdkdkdkkdk")
            this.dataIsLoading = false;
        },
        getInviteNumClass() {
            let count = this.getInviteNum();
            if(count > 99) {
                if(this.curindex == 1)
                    return "group-unread-99";
                else
                    return 'group-unread-99-nofocus';
            }
            else {
                if(this.curindex == 1)
                    return "group-unread";
                else 
                    return 'group-unread-nofocus';
            }
        },

        getInviteNum(){
            return this.$store.getters.getInviteRoomsNum();
        },

        matrixSyncEnd: function(ret){
            this.navEnable = !ret;
            if(this.loadingInterval) {
                clearInterval(this.loadingInterval);
            }
        },

        CloseChangePassword: function() {
            this.showChangePassword = false;
        },
        showChangePasswordAlertPage: function() {
            this.alertContnets = {
                "Details": "建议您修改登录密码",
                "Abstrace": "提示"
            };
            this.showAlertDlg = true;
        },
        closeAlertDlg: function() {
            this.showAlertDlg = false;
            this.alertContnets = {};
        },
        toChangePassword: function() {
            this.closeAlertDlg();
            this.showChangePassword = true;
        },
        showPersonalInfoHanlder: async function(value){
            if(value){
                this.personalCenterKey ++;
                const userId = window.localStorage.getItem("mx_user_id");

                let userInfo = await ComponentUtil.ShowOrgInfoByMatrixID(userId);
                if(userInfo){
                    this.showPersonalCenter = true;
                    this.showPersonalInfo = true;
                    this.userInfo = userInfo;
                    this.userInfo.displayName = this.displayName;
                }
                else{
                    alert("数据库没有找到用户信息")
                }
            }
        },
        getUnReadCount(unReadCount) {
            if(unReadCount === 0) return "";
            else return unReadCount > 99 ? "..." : unReadCount;
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
                return "nav-readall";
            }
            else {
                if(remote.process.platform == 'darwin') {
                    if(this.curindex == 0) {
                        if(unReadCount > 99) {
                            return "mac-nav-unread-99";
                        }
                        else {
                            return "mac-nav-unread";
                        }
                    }
                    else {
                        if(unReadCount > 99) {
                            return "mac-nav-unread-no-focuse-99";
                        }
                        else {
                            return "mac-nav-unread-no-focuse";
                        }
                    }
                }
                else {
                    if(this.curindex == 0) {
                        if(unReadCount > 99) {
                            return "nav-unread-99";
                        }
                        else {
                            return "nav-unread";
                        }
                    }
                    else {
                        if(unReadCount > 99) {
                            return "nav-unread-no-focuse-99";
                        }
                        else {
                            return "nav-unread-no-focuse";
                        }
                    }
                }
            }
        },
        closeUpgradeAlertDlg: function() {
            this.showUpgradeAlertDlg = false;
            Config.SetNewVersion(this.version);
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
        getAppBaseData:function() {
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
                if(this.$route.name != "ChatContent") {
                    this.$router.push("/main/ChatContent")
                }
                else {
                    if(this.unReadCount > 0) {
                        this.scrollToRecentUnread = !this.scrollToRecentUnread;
                    }
                }
            }
            else if(cur_name == "contact list") {
                this.organizationClick++;
                if(this.$route.name != "organization") {
                    this.$router.push("/main/organization")
                }
            }
            else if(cur_name == "favourite") {
                if(this.$route.name != "favourite") {
                    this.$router.push("/main/favourite")
                }
            }
        },

        getToolTipContent(index){
            if(index == 0) return "聊天";
            else if(index == 1) return "联系人";
            else if(index == 2)return "收藏";
            else return "设置";
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
        setFullScreen: function(e, isFullScreen) {
            this.isFullScreen = isFullScreen;
        },
        clearAll: function(e, roomIds) {
            this.setToRealAll = [];
            this.$nextTick(() => {
                setTimeout(() => {
                    this.setToRealAll = roomIds;
                }, 200)
            })
        },
        jumpToChat: function(e, roomId) {
            this.distGroupId = "";
            this.$nextTick(() => {
                setTimeout(() => {
                    this.distGroupId = roomId;
                }, 200)
            })
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
            var myUserId = global.mxMatrixClientPeg.matrixClient.getUserId();
            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(myUserId);
            var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
            if(avaterUrl != "") {
                elementImg.setAttribute("src", avaterUrl);
                if(this.$store.getters.getAvater(myUserId) == avaterUrl) {
                    return;
                }
                var userToAvaterInfo = [myUserId, avaterUrl];
                this.$store.commit("setAvater", userToAvaterInfo);
            }
        },
        personalCenterClicked:async function(){
            console.log("this.showpersonalcenter is ", this.showPersonalCenter);
            this.showPersonalCenter = true;
            this.showPersonalInfo = false;
            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(global.mxMatrixClientPeg.matrixClient.getUserId());
            this.displayName = profileInfo.displayname;
            this.personalCenterKey ++;
        },
        startCheckUpgrade: async function() {
            var newVersion = await global.services.common.GetNewVersion();
            console.log("newversion is ", newVersion);
            if(newVersion == undefined || newVersion == false)
            {
                return;
            }
            else {
                var packageFile = require("../../../package.json");
                var lVersion = packageFile.version;
                var sVerCode = newVersion.verCode;
                this.version = sVerCode;
                var needUpdate = ComponentUtil.needUpgradeVersion(lVersion, sVerCode)
                var sUrl = newVersion.downloadUrl;
                var sDescription = newVersion.description;
                sDescription = sDescription.replace(/\r\n/g, '<br>')
                var sId = newVersion.id;
                var sVerName = newVersion.verName;
                let sProductName = sUrl.split("/").pop();
                if(needUpdate) {
                    this.bshowNewversionDot = true;
                    let dbVersion = await Config.GetNewVersion();
                    if(dbVersion && dbVersion.new_version === sVerCode){
                        return;
                    }
                    this.showUpgradeAlertDlg = true;
                    this.upgradeInfo = {
                        "downloadUrl": sUrl,
                        "description": sDescription,
                        "verName": sVerName,
                        "productName": sProductName,
                        "verId": sId,
                    };
                }
            }
            
        },

        async logoutMenuItemClick(){
            await global.mxMatrixClientPeg.logout();
            await global.services.common.logout();
            ipcRenderer.send("showLoginPageWindow");
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
        },
        async _doBootstrapUIAuth(makeRequest) {
            let response = null;
            var checkType = global.mxMatrixClientPeg.checkType;
            var username = global.mxMatrixClientPeg.account;
            var password = global.mxMatrixClientPeg.password;
            if(checkType == "m.login.verCode.msisdn") {
                try{
                    await makeRequest({
                        type: checkType,
                        msisdn: username,
                        ver_code: password,
                        identifier: {
                            type: 'm.id.user',
                            user: global.mxMatrixClientPeg.matrixClient.getUserId(),
                        },
                    });
                }
                catch(e) {
                    console.log(e.message);
                }
            }
            else if(checkType == "m.login.verCode.email") {
                try{
                    await makeRequest({
                        type: checkType,
                        email: username,
                        ver_code: password,
                        identifier: {
                            type: 'm.id.user',
                            user: global.mxMatrixClientPeg.matrixClient.getUserId(),
                        },
                    });
                }
                catch(e) {
                    console.log(e.message);
                }
            }
            else if(checkType == "m.login.sso.ldap") {
                try{
                    await makeRequest({
                        type: checkType,
                        user: username,
                        password: password,
                        identifier: {
                            type: 'm.id.user',
                            user: global.mxMatrixClientPeg.matrixClient.getUserId(),
                        },
                    });
                }
                catch(e) {
                    console.log(e.message);
                }
            }
        },
    },

    components: {
        organization,
        ChatContent,
        favourite,
        macWindowHeader,
        personalCenter,
        UpdateAlertDlg,
        userInfoContent,
        AlertDlg,
        ChangePassword
    },
    mounted: async function() {
        this.loadingInterval = setInterval(() => {
            if(this.loadingElement == undefined) {
                this.loadingElement = document.getElementById("isLoadingId");
            }
            this.loadingElement.style.transform = 'rotate(' + (this.curRotate += 30) + 'deg)';
            this.loadingElement.style.transition = 'all 1s linear';
        }, 100);
        ipcRenderer.on('setUnreadCount', (e, count) => {
            this.unReadCount = count;
        })
        let backToLogin = () => {
            global.mxMatrixClientPeg.logout();
            ipcRenderer.send("showLoginPageWindow");
            return;
        }
        
        let getServerInfo = async (host) => {
            var appServerInfo = await global.mxMatrixClientPeg.getAppServerInfo(host);
            if(appServerInfo.status != 200) {
                backToLogin();
            }
            if(appServerInfo.data['m.identity_server'] != undefined) {
                global.localStorage.setItem("mx_is_url", appServerInfo.data['m.identity_server']['base_url']);
            }
        }
        let checkHomeServer = async (domain, gmshost) => {
            if(domain == "") {
                backToLogin();
            }
            
            var gmsRet = await global.services.common.newGmsConfiguration(domain, gmshost);
            console.log("gmsRet is ", gmsRet);
            if(!gmsRet){
                backToLogin();
            }
            var host = window.localStorage.getItem("mx_hs_url");
            if(host == null) {
                backToLogin();
            }
            await getServerInfo(host);
            var appserver = window.localStorage.getItem("app_server");
            var loginSettingRet = await global.services.common.getLoginConfig(appserver);
            if(!loginSettingRet) {
                backToLogin();
            }
        }
        await global.services.common.login();
        this.startCheckUpgrade();
        global.services.common.InitDbData().then(ret => {
            this.dbDataNotFinished = false;
        });
        
        var host = window.localStorage.getItem("mx_hs_url");
        if(host == null) {
            backToLogin();
        }
        var domain = window.localStorage.getItem("Domain");
        let gmsHost = window.localStorage.getItem("gms_host");

        if(global.mxMatrixClientPeg.homeserve == '') {
            await checkHomeServer(domain, gmsHost);
            
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
        let ops = {
        }
        ops.pendingEventOrdering = "detached";
        ops.lazyLoadMembers = true;
        await global.mxMatrixClientPeg.matrixClient.startClient(ops);

        const ctx = this;
        global.mxMatrixClientPeg.matrixClient.on('Session.logged_out', (errObj) => {
          global.mxMatrixClientPeg.logout();
          global.services.common.logout();
          ipcRenderer.send("showLoginPageWindow");
        })
        global.mxMatrixClientPeg.matrixClient.on("sync", (state, prevState, data)=>{
            console.log("state ", state);
            console.log("prevState ", prevState);
            console.log("data ", data);
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
        //await global.mxMatrixClientPeg.matrixClient.bootstrapCrossSigning({
        //    authUploadDeviceSigningKeys: this._doBootstrapUIAuth,
        //});
        // await global.mxMatrixClientPeg.matrixClient.downloadKeys([global.mxMatrixClientPeg.matrixClient.getUserId()]);

/*     global.mxMatrixClientPeg.matrixClient.getMediaConfig().then((config)=>{
            console.log(config)
        })
*/
        if(global.localStorage.getItem("neetNoticeToChangePwd") == "true") {
            this.showChangePasswordAlertPage()
        }
        setTimeout(() => {
            this.showCurUserIcon();
        }, 1000)
        var _this = this;
        document.addEventListener('click',function(e){
            // console.log("e.target.classname is ", e.target.className)
            if(e.target.className.indexOf('personalCenter') == -1 && e.target.className.indexOf('login-logo') == -1 && e.target.className.indexOf('userInfo') == -1){
                if(e.target.className.indexOf('cropper') == -1){
                    // console.log("============")
                    _this.showPersonalInfo = false;
                    
                    if(e.target.id != 'owverInfoEnditID')
                    {
                        console.log(e.target.id)
                        _this.toUpdateTrayNotice = _this.toUpdateTrayNotice + 1;
                        _this.showPersonalCenter = false;    
                    }
                        
                }

            }
        });

        ipcRenderer.on("SAVED_FILE", async (e, finalName, eventId)=>{
            let msgs = await Message.FindMessageByMesssageID(eventId);
            if(msgs.length != 0){
                msgs[0].file_local_path = finalName;
                msgs[0].save();
            }
            else{
                let msgValue = {
                    message_id: eventId,
                    file_local_path: finalName
                }
                let model = await new(await models.Message)(msgValue);
                model.save();
            }
        })
    },
    created: async function () {
        ipcRenderer.on('updateUserImage', this.updateSelfImage);
        ipcRenderer.on('toLogout', this.softLogout);
        ipcRenderer.on('LogoutMenuItemClick', this.logoutMenuItemClick);
        ipcRenderer.on('setIsFullScreen', this.setFullScreen);
        ipcRenderer.on('isNormal', (e, isNormal) => {
            this.isNormal = isNormal;
        })
        ipcRenderer.on('jumpToChat', this.jumpToChat);
        ipcRenderer.on('clearAll', this.clearAll);
        console.log("In Main Page The MatrixSdk is ", global.mxMatrixClientPeg)
        this.getAppBaseData();
    },
}
</script>
<style lang="scss" scoped>
    .group-unread {
        position: absolute;
        z-index: 1;
        display:inline-block;
        font-size: 10px;
        font-family: PingFangSC-Medium;
        color: rgb(255, 255, 255);
        margin-left: 4px;
        margin-top: -45px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 14px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 1);
    }

    .group-unread-99 {
        position: absolute;
        z-index: 1;
        display:inline-block;
        font-size: 10px;
        font-family: PingFangSC-Medium;
        color: rgb(255, 255, 255);
        margin-left: 4px;
        margin-top: -45px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 9px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 1);
    }

    .group-unread-nofocus {
        position: absolute;
        z-index: 1;
        display:inline-block;
        font-size: 10px;
        font-family: PingFangSC-Medium;
        color: rgba(255, 255, 255, 0.5);
        margin-left: 4px;
        margin-top: -45px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 14px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 0.7);
    }

    .group-unread-99-nofocus {
        position: absolute;
        z-index: 1;
        display:inline-block;
        font-size: 10px;
        font-family: PingFangSC-Medium;
        color: rgba(255, 255, 255, 0.5);
        margin-left: 4px;
        margin-top: -45px;
        text-align: center;
        height: 14px;
        width: 14px;
        line-height: 9px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 0.7);
    }

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
        margin-top: 0px;
        background: rgba(74, 76, 91, 1);
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
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
        margin: 56px 0px 20px 0px;
        border-radius:4px;
    }

    .login-logo {
        width: 40px;
        height: 40px;
        border-radius:4px;
        border-radius: 50%;
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

    .nav-unread-99 {
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
        line-height: 9px;
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

    .nav-unread-no-focuse-99 {
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
        line-height: 9px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 0.7);
    }

    .mac-nav-unread {
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

    .mac-nav-unread-99 {
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
        line-height: 9px;
        border-radius: 20px;
        background-color: rgba(228, 49, 43, 1);
        // z-index:-1;
    }

    .mac-nav-unread-no-focuse {
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

    .mac-nav-unread-no-focuse-99 {
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
        line-height: 9px;
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

    .nav-item {
        height: 48px;
        text-align: center;
        line-height: 48px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .nav-item.active {
        height: 48px;
        text-align: center;
        color: rgba(255, 255, 255, 1);
        line-height: 48px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .nav-item:hover {
        height: 48px;
        text-align: center;
        line-height: 48px;
        background-color: rgba(74, 76, 91, 1);;
    }

    .nav-item .tooltiptext {
        visibility: hidden;
        height: 13px;
        font-size: 11px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        background: #E3E3E5;
        line-height: 1;
        border-radius: 2px;
        padding-top: 4px;
        padding-right: 4px;
        padding-bottom: 0px;
        padding-left: 4px;
        margin-top: -15px;
        margin-left: 10px;
        word-wrap: break-word;
    
        position: fixed;
        z-index: 1;
    }

    .nav-item:hover .tooltiptext {
        visibility: visible;
    }

    .NavChatting {
        border: 1px red;
        background-image: url("../../../static/Img/Navigate/chat-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    // .NavChatting:hover {
    //     border: 0px;
    //     background-image: url("../../../static/Img/Navigate/chathover-24px@2x.png");
    //     background-size: contain;
    //     width: 24px;
    //     height: 24px;
    // }

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

    // .NavOrganization:hover {
    //     border: 0px;
    //     background-image: url("../../../static/Img/Navigate/orghover-24px@2x.png");
    //     background-size: contain;
    //     width: 24px;
    //     height: 24px;
    // }

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

    // .NavFavourite:hover {
    //     border: 0px;
    //     background-image: url("../../../static/Img/Navigate/favhover-24px@2x.png");
    //     background-size: contain;
    //     width: 24px;
    //     height: 24px;
    // }

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
        // background-color: rgba(74, 76, 91, 1);;
        cursor:pointer;
    }

    .NavSetUp .tooltiptext {
        visibility: hidden;
        height: 13px;
        font-size: 11px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        background: #E3E3E5;
        line-height: 1;
        border-radius: 2px;
        padding-top: 4px;
        padding-right: 4px;
        padding-bottom: 0px;
        padding-left: 4px;
        margin-top: -10px;
        margin-left: 10px;
        word-wrap: break-word;
    

        position: fixed;
        z-index: 1;
    }

    .newversiondot{
        width: 8px;
        height: 8px;
        background: #CE514F;
        position: relative;
        border-radius: 50%;
        left:20px;
        bottom: 30px;
    }

    .NavSetUp:hover .tooltiptext {
        visibility: visible;
    }

    .NavSetUpImg {
        border: 1px red;
        background-image: url("../../../static/Img/Navigate/setup-nor-24px@2x.png");
        background-size: contain;
        width: 24px;
        height: 24px;
    }

    // .NavSetUpImg:hover {
    //     border: 0px;
    //     background-image: url("../../../static/Img/Navigate/setup-hover-24px@2x.png");
    //     background-size: contain;
    //     width: 24px;
    //     height: 24px;
    // }

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

    .loadingDiv {
        padding: 0px;
        width: calc(100% - 70px);
        height: 100%;
        vertical-align: top;
        margin: 0px;
        overflow-y:hidden;
        overflow-x: hidden;
    }

    .loadingInfo {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        width: 145px;
        height: 100px;
        text-align: center;
    }

    .loadingText {
        font-size: 14px;
        font-family:PingFangSC-Regular;
        text-align: center;
        font-weight: 400;
        color: rgba(153, 153, 153, 1);
        height: 20px;
        line-height: 20px;
        margin-left: 5px;
    }

    .isLoading {
        width: 40px;
        height: 40px;
    }

    .macWindowHeader {
        padding: 0px;
        margin: 0px;
        width: 64px;
    }
</style>
