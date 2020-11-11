<template>
    <div class="setup-wind">
      <div class="setup-panel" id="setup-panel-id">
        <div class="setup-list">
          <div class="setup-list-item" @click="jumpToGeneralSetup">
            <img class="setupGeneralImage" src="../../../static/Img/Setup/general-20px@2x.png">
            <label class="setupGeneralLabel">通用设置</label>
          </div>
          <div class="setup-list-item" @click="jumpToNoticeSetup">
            <img class="setupNoticeImage" src="../../../static/Img/Setup/notice-20px@2x.png">
            <label class="setupNoticeLabel">通知设置</label>
          </div>
          <div class="setup-list-item" @click="jumpToUpdateSetup" v-show="false">
            <img class="setupUpdateImage" src="../../../static/Img/Setup/update-20px@2x.png">
            <label class="setupUpdateLabel" >软件升级</label>
          </div>
          <div class="setup-list-item" @click="jumpToAboutSetup">
            <img class="setupAboutImage" src="../../../static/Img/Setup/about-20px@2x.png">
            <label class="setupAboutLabel">关于应用</label>
          </div>
        </div>
        <div class="setup-details" id="setup-details-id">
            <label class="setup-general-title">通用设置</label>
            <!-- <div class="setup-language" v-show="false">
                <label class="setup-language-label"></label>
                <el-dropdown>
                    <span class="el-dropdown-link"></span>
                </el-dropdown>
            </div> -->
            <div class="setup-general-autorun">
                <label class="setup-general-autorun-label">电脑开机时，自动启动亿洽</label>
                <el-switch class="setup-general-autorun-switch" v-model="autoRun" @change="autoRunStateChange(autoRun)">
                </el-switch>
            </div>
            <label class="setup-general-device-manager-label">设备管理</label>
            <ul class="setup-general-device-list">
                <li class="device-info" v-for="(deviceItem, index) in recentDevice">
                    <label class="device-one-name">{{deviceItem.model}}</label>
                    <label class="device-one-os">系统：{{deviceItem.desktopType}}</label>
                    <label class="device-one-last-login-time">时间：{{timeDeal(deviceItem.loginTime)}}</label>
                </li>
            </ul>
            <div class="setup-general-file-location">
                <label class="setup-general-file-location-label">文件保存位置</label>
                <div class="setup-general-file-location-input-div" @click="openLocalStorageDir">
                  <input class="setup-general-file-location-input" v-model="localStorePath" disabled="disabled" @click="openLocalStorageDir">
                  <div class="setup-general-file-location-input-folder-ico">
                      <img class="icon-folder" src="../../../static/Img/Setup/store-folder-20px@2x.png">
                  </div>
                </div>
            </div>
            <div class="setup-general-clear-cache">
                <label class="setup-general-clear-cache-label">清理缓存</label>
                <label class="setup-general-clear-cache-label2" id="setup-general-clear-cache-label2-id">--M</label>
                <img class="setup-general-clear-cache-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showAlert">
            </div>
            <div class="setup-notice-title">通知设置</div>
            <div class="setup-notice-message-notice">
                <label class="setup-notice-message-notice-label">消息提示音</label>
                <el-switch class="setup-notice-message-notice-switch" v-model="soundNotice" @change="autoSoundNoticeStateChange(soundNotice)">
                </el-switch>
            </div>
            <div class="setup-notice-desktop-notice">
                <label class="setup-notice-desktop-notice-label">消息桌面通知</label>
                <el-switch class="setup-notice-desktop-notice-switch" v-model="flashNotice" @change="autoFlashNoticeStateChange(flashNotice)">
                </el-switch>
            </div>
            <div class="setup-update-title" v-show="false">软件升级</div>
            <div class="setup-update-cur-version" v-show="false">
                <label class="setup-update-cur-version-label">当前版本</label>
                <label class="setup-update-cur-version-label2">--</label>
                <img class="setup-update-cur-version-ico" src="../../../static/Img/Setup/arrow-20px@2x.png">
            </div>
            <div class="setup-update-auto-update" v-show="false">
                <label class="setup-update-auto-update-label">自动更新</label>
                <el-switch class="setup-update-auto-update-switch">
                </el-switch>
            </div>
            <div class="setup-about-title">关于应用</div>
            <div class="setup-about-introduce" v-show="false">
                <label class="setup-about-introduce-label">功能介绍</label>
                <img class="setup-about-introduce-label-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showAbout">
            </div>
            <div class="setup-about-agreement">
                <label class="setup-about-agreement-label">软件用户协议</label>
                <img class="setup-about-agreement-label-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showAgreement">
            </div>
            <div class="setup-about-privacy">
                <label class="setup-about-privacy-label">软件隐私政策</label>
                <img class="setup-about-privacy-label-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showPrivacy">
            </div>
            <div class="setup-logout" @click="logout()">退出登录</div>
        </div>
      </div>
      <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="clearCache"/>
      <AnnouncementDlg v-show="showAnnouncementDlg" :contentType="contentType" :dialogTitle="dialogTitle"  @closeAnnouncementDlg="closeAnnouncementDlg"/>
      <div class="win-header">
        <winHeaderBar @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
      </div>
    </div>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {APITransaction} from '../../packages/data/transaction.js'
import {services, environment} from '../../packages/data/index.js'
import winHeaderBar from './win-header.vue'
import {ipcRenderer, remote} from 'electron'
import confservice from '../../packages/data/conf_service.js'
// import listItem from './list-item.vue'
import {downloadGroupAvatar, Appendzero, strMsgContentToJson, JsonMsgContentToString, FileUtil, getdirsize, deleteall, getFileSizeByNumber} from '../../packages/core/Utils.js'
import {shell} from 'electron'
import AlertDlg from './alert-dlg.vue'
import AnnouncementDlg from './announcement.vue'
import { Config } from '../../packages/data/sqliteutil.js'

export default {
  components: {
    winHeaderBar,
    AlertDlg,
    AnnouncementDlg,
    // listItem
  },
  props: [],
  watch: {
  },
  computed: {
  },
  data() {
    return {
      soundNotice: true,
      flashNotice: true,
      autoRun: true,
      showAnnouncementDlg: false,
      dialogTitle: '',
      announcementContnts: '',
      recentDevice: [],
      ulDiv: undefined,
      localStorePath: '',
      cacheStoreSize: '0M',
      alertContnets: {},
      showAlertDlg: false,
      contentType: ''
    };
  },
  methods: {
    autoSoundNoticeStateChange: async function(state) {
      if(state == true) {
        Config.SetMessageSound(1);
        this.$store.commit("setSoundNotice", true);
      }
      else {
        Config.SetMessageSound(2);
        this.$store.commit("setSoundNotice", false);
      }
    },
    autoFlashNoticeStateChange: async function(state) {
      if(state == true) {
        Config.SetMessageNotice(1);
        this.$store.commit("setFlashNotice", true);
      }
      else {
        Config.SetMessageNotice(2);
        this.$store.commit("setFlashNotice", false);
      }
    },
    autoRunStateChange: async function(state){
      if(state == true) {
        Config.SetAutoStart(1);
      }
      else {
        Config.SetAutoStart(0);
      }
      ipcRenderer.send("setAutoRun", state);
    },
    closeAnnouncementDlg: function() {
      this.showAnnouncementDlg = false;
    },
    showAbout: function() {
      this.dialogTitle = '功能介绍'
      this.contentType = ''
      this.showAnnouncementDlg = true;
    },
    showAgreement: function() {
      this.dialogTitle = '软件用户协议'
      this.contentType = 'agreement'
      this.showAnnouncementDlg = true;
    },
    showPrivacy: function() {
      this.dialogTitle = '软件隐私政策'
      this.contentType = 'privacy'
      this.showAnnouncementDlg = true;
    },
    showAlert: function() {
      this.alertContnets = {
        "Details": "本地缓存的图片、视频等将被删除（云端仍将保留原始文件）",
        "Abstrace": "确定清除缓存？"
      };
      this.showAlertDlg = true;
    },
    closeAlertDlg: function() {
      this.showAlertDlg = false;
    },
    clearCache: function() {
      try{
        deleteall(this.localStorePath);
        getdirsize(this.localStorePath, this.updateCacheSize);
      }
      catch(error) {
        this.updateCacheSize('', 0);
        console.log("clear cache exception ", error);
      }
      this.showAlertDlg = false;
    },
    openLocalStorageDir: function() {
      shell.openItem(this.localStorePath);
    },
    timeDeal(timeOriginal) {
      var timeFormate = timeOriginal.replace("-", "/");
      var timeFormateSplit = timeFormate.split(":");
      timeFormateSplit = timeFormateSplit.splice(0, timeFormateSplit.length - 1);
      timeFormate = timeFormateSplit.join(":");
      return timeFormate;
    },
    isWindows() {
      return environment.os.isWindows;
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

    jumpToGeneralSetup: function() {
        if(this.ulDiv == undefined) {
          this.ulDiv = document.getElementById("setup-details-id");
        }
        
        this.ulDiv.scrollTop = 0;
    },
    jumpToNoticeSetup: function() {
        if(this.ulDiv == undefined) {
          this.ulDiv = document.getElementById("setup-details-id");
        }
        
        this.ulDiv.scrollTop = this.ulDiv.scrollHeight;
    },
    jumpToUpdateSetup: function() {
        if(this.ulDiv == undefined) {
          this.ulDiv = document.getElementById("setup-details-id");
        }
        
        this.ulDiv.scrollTop = this.ulDiv.scrollHeight;
    },
    jumpToAboutSetup: function() {
        if(this.ulDiv == undefined) {
          this.ulDiv = document.getElementById("setup-details-id");
        }
        
        this.ulDiv.scrollTop = this.ulDiv.scrollHeight;
    },
    updateCacheSize: function(err, size) {
      // console.log("err is ", err);
      // console.log("size is ", size);
      var strSize = getFileSizeByNumber(size);
      var cacheStoreElement = document.getElementById("setup-general-clear-cache-label2-id");
      if(cacheStoreElement != null) {
        cacheStoreElement.innerHTML = strSize;
      }
    },
    logout: function() {
      // services.common.closemqtt();
      // services.common.logout();
      global.mxMatrixClientPeg.logout();
      ipcRenderer.send("showLoginPageWindow");
    }
  },
  mounted: async function() {
  },
  created: async function() {
    this.loginInfo = await services.common.GetLoginModel();
    this.curUserInfo = await services.common.GetSelfUserModel();
    var config = await Config.GetValue();
    var autoStart = await Config.GetAutoStart();
    console.log("=====get config is ", config)
    console.log("=====autoStart is ", autoStart)
    if(config != undefined) {
      this.autoRun = autoStart == 0 ? false : true;
      this.soundNotice = (config.message_sound == 0 || config.message_sound == 1) ? true : false;
      if(this.soundNotice) {
        this.$store.commit("setSoundNotice", true);
      }
      else {
        this.$store.commit("setSoundNotice", false);
      }
      this.flashNotice = (config.message_notice == 0 || config.message_notice == 1) ? true : false;
      if(this.flashNotice) {
        this.$store.commit("setFlashNotice", true);
      }
      else {
        this.$store.commit("setFlashNotice", false);
      }
    }
  },
  activated: async function() {
    this.recentDevice = await services.common.GetRecentDevice();
    this.localStorePath = await confservice.getCurFilesDir();
    console.log("this.recentdeivce ", this.recentDevice);
    // console.log("this.localStorePath ", this.localStorePath);
    getdirsize(this.localStorePath, this.updateCacheSize);
  }
};
</script>

<style lang="scss" scoped>
  ::-webkit-scrollbar-track-piece {
    background-color: #F1F1F1;
    border-radius: 5px;
  }

  ::-webkit-scrollbar {
    width: 7px;
    height: 12px;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: #C1C1C1;
    border-radius: 5px;
    outline: none;
  }

  ::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #A8A8A8;
    border-radius: 5px;
  }

  .setup-wind {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin: 0px;
  }

  .setup-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    overflow-y: hidden;
    -webkit-app-region: drag;
    z-index: 0;
  }

  * {
      
      -webkit-app-region: no-drag;
  }
  .setup-list {
    height: 100%;
    width: 280px;
    display: flex;
    padding-top: 10px;
    flex-direction: column;
    border-right: 1px solid rgb(242, 242, 246);
  }

  .list-content {
    height: 100%;
    overflow: hidden;
    
    ::-webkit-scrollbar-track {
      border-radius: 10px;
    }
  }

  .setup-list-item {
    height: 44px;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .setup-list-item:hover {
    height: 44px;
    background-color: rgba(221, 221, 221, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .setup-list-item.active {
    height: 44px;
    background-color: rgba(221, 221, 221, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .setupGeneralImage {
    width: 20px;
    height: 20px;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 12px;
    margin-bottom: 12px;
  }

  .setupGeneralLabel {
      width: calc(100% - 50px);
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      letter-spacing: 1px;
      vertical-align: top;
  }

  .setupNoticeImage {
    width: 20px;
    height: 20px;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 12px;
    margin-bottom: 12px;
  }

  .setupNoticeLabel {
      width: calc(100% - 50px);
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      letter-spacing: 1px;
      vertical-align: top;
  }

  .setupUpdateImage {
    width: 20px;
    height: 20px;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 12px;
    margin-bottom: 12px;
  }

  .setupUpdateLabel {
      width: calc(100% - 50px);
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      letter-spacing: 1px;
      vertical-align: top;
  }

  .setupAboutImage {
    width: 20px;
    height: 20px;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 12px;
    margin-bottom: 12px;
  }

  .setupAboutLabel {
      width: calc(100% - 50px);
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      letter-spacing: 1px;
      vertical-align: top;
  }

  .setup-details {
    width:100%;
    height: 99%;
    background-color: white;
    position: relative;
    margin-left: 16px;
    margin-bottom: 10px;
    padding-left: 0px;
    margin-top: 10px;
    padding-right: 20px;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .setup-general-title {
    width: 100%;
    height: 48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing: 2px;
    font-size: 16px;
  }

  .setup-language {
    width:100%;
    height:48px;
    background:rgba(255,255,255,1);
    display: block;
    line-height: 48px;
    font-size: 14px;
  }
  
  .setup-language-label {
    width:100%;
    height:48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    display: inline-block;
  }

  .setup-general-autorun {
    width:100%;
    line-height: 48px;
    height:48px;
    background:rgba(255,255,255,1);
    font-size: 14px;
  }

  .setup-general-autorun-label {
    width:calc(100% - 88px);
    height:48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    display: inline-block;
  }

  .setup-general-autorun-switch {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 40px;
    float: right;
    padding-right: 14px;
    display: inline-block;
  }

  .setup-general-device-manager-label {
    width:100%;
    height:48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    display: block;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
  }

  .setup-general-device-list {
    width:100%;
    height:100px;
    background:rgba(255,255,255,1);
    display: block;
    padding: 0;
  }

  .device-info {
    width:180px;
    height:88px;
    background:rgba(255,255,255,1);
    border-radius:4px;
    border:1px solid rgba(221,221,221,1);
    display: inline-block;
    margin-right: 12px;
  }

  .device-one-name {
    padding-left: 12px;
    padding-top: 10px;
    padding-right: 4px;
    padding-bottom: 4px;
    width:164px;
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .device-one-os {
    padding-left: 12px;
    padding-top: 4px;
    padding-right: 4px;
    padding-bottom: 4px;;
    width:164px;
    height: 18px;
    line-height: 18px;
    font-size: 12px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing:1px;
    color:rgba(153,153,153,1);
    letter-spacing:1px;
    display: block;
  }

  .device-one-last-login-time {
    padding-left: 12px;
    padding-top: 4px;
    padding-right: 4px;
    padding-bottom: 4px;;
    width:164px;
    height: 18px;
    line-height: 18px;
    font-size: 12px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing:1px;
    color:rgba(153,153,153,1);
    letter-spacing:1px;
  }
  
  .setup-general-file-location {
    width:100%;
    height:48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing:1px;
  }

  .setup-general-file-location-label {
    width:calc(100% - 350px);
    height:48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    display: inline-block;
    letter-spacing:1px;
    vertical-align: top;
  }

  .setup-general-file-location-input-div {
      height: 32px;
      width: 320px;
      margin-top: 8px;
      margin-bottom: 8px;
      border: 1px solid rgb(221, 221, 221);
      border-radius: 2px;
      display: inline-block;
  }

  .setup-general-file-location-input {
      position: absolute;
      display: inline-block;
      height: 32px;
      line-height: 24px;
      width: 288px;
      font-size: 12px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      letter-spacing: 1px;
      padding: 0px;
      border: 0px;
      cursor: pointer;
      background-color: rgba(1, 1, 1, 0);
      text-indent: 6px;
  }

  .setup-general-file-location-input:focus {
      position: absolute;
      display: inline-block;
      height: 24px;
      line-height: 24px;
      margin-top: 12px;
      margin-bottom: 12px;
      width: 288px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      letter-spacing: 1px;
      padding: 0px;
      border: 0px;
      outline: none;
      cursor: pointer;
      background-color: rgba(1, 1, 1, 0);
      text-indent: 6px;
  }

  .setup-general-file-location-input-folder-ico {
      display: inline-block;
      padding-right: 6px;
      height: 20px;
      margin-top: 6px;
      margin-bottom: 6px;
      width: 20px;
      line-height: 48px;
      float: right;
      font-size: 14px;
      cursor: pointer;
      color: rgba(153, 153, 153, 1);
  }

  .setup-general-file-location-input-folder-ico:hover {
      display: inline-block;
      padding-right: 6px;
      height: 20px;
      margin-top: 6px;
      margin-bottom: 6px;
      width: 20px;
      line-height: 48px;
      float: right;
      font-size: 14px;
      cursor: pointer;
      color: rgba(36, 179, 107, 1);
  }

  .icon-folder {
    width: 100%;
    height: 20px;
    display: inline-block;
      vertical-align: top;
  }

  .setup-general-clear-cache {
    width:100%;
    height:48px;
    font-size: 14px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing:1px;
  }

  .setup-general-clear-cache-label {
    width:calc(100% - 120px);
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing:1px;
    vertical-align: top;
  }

  .setup-general-clear-cache-label2 {
    width:65px;
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing:1px;
    vertical-align: top;
    color: rgba(153,153,153,1);
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .setup-general-clear-cache-ico {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    margin-top: 14px;
    margin-right: 0px;
    margin-bottom: 14px;
    display: inline-block;
    cursor: pointer;
  }

  .setup-notice-title {
    width: 100%;
    height: 48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing: 2px;
    font-size: 16px;
  }

  .setup-notice-message-notice {
    width:100%;
    height:48px;
    line-height: 48px;
    font-size: 14px;
    font-family: "PingFangSC-Regular";
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing:1px;
  }

  .setup-notice-message-notice-label {
    width:calc(100% - 68px);
    height:48px;
    line-height: 48px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    background:rgba(255,255,255,1);
    display: inline-block;
    letter-spacing:1px;
  }

  .setup-notice-message-notice-switch {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 40px;
    float: right;
    padding-right: 14px;
    display: inline-block;
  }

  .setup-notice-desktop-notice {
    width:100%;
    height:48px;
    line-height: 48px;
    font-size: 14px;
    font-family: "PingFangSC-Regular";
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing:1px;
  }

  .setup-notice-desktop-notice-label {
    width:calc(100% - 68px);
    height:48px;
    line-height: 48px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    background:rgba(255,255,255,1);
    display: inline-block;
    letter-spacing:1px;
  }

  .setup-notice-desktop-notice-switch {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 40px;
    float: right;
    padding-right: 14px;
    display: inline-block;
  }

  .setup-update-title {
    width: 100%;
    height: 48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing: 2px;
    font-size: 16px;
  }

  .setup-update-cur-version {
    width:100%;
    height:48px;
    line-height: 48px;
    font-size: 14px;
    font-family: "PingFangSC-Regular";
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing:1px;
  }

  .setup-update-cur-version-label {
    width:calc(100% - 160px);
    height:48px;
    line-height: 48px;
    font-size: 14px;
    letter-spacing:1px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    background:rgba(255,255,255,1);
    display: inline-block;
    vertical-align: top;
  }

  .setup-update-cur-version-label2 {
    width:110px;
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing:1px;
    vertical-align: top;
    color: rgba(153,153,153,1);
  }

  .setup-update-cur-version-ico {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    margin-top: 14px;
    margin-right: 0px;
    margin-bottom: 14px;
    display: inline-block;
  }

  .setup-update-auto-update {
    width:100%;
    height:48px;
    line-height: 48px;
    font-size: 14px;
    font-family: "PingFangSC-Regular";
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing:1px;
  }

  .setup-update-auto-update-label {
    width:calc(100% - 40px);
    height:48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    display: inline-block;
    vertical-align: top;
  }

  .setup-update-auto-update-switch {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 40px;
    float: right;
    padding-right: 14px;
    display: inline-block;
  }

  .setup-about-title {
    width: 100%;
    height: 48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing: 2px;
    font-size: 16px;
    font-weight: bold
  }

  .setup-about-introduce {
    width:100%;
    height:48px;
    line-height: 48px;
    font-size: 14px;
    letter-spacing:1px;
    font-family: "PingFangSC-Regular";
    background:rgba(255,255,255,1);
    display: block;
  }

  .setup-about-introduce-label {
    width:calc(100% - 40px);
    height:48px;
    line-height: 48px;
    font-size: 14px;
    letter-spacing:1px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    background:rgba(255,255,255,1);
    display: inline-block;
    vertical-align: top;
  }

  .setup-about-introduce-label-ico {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    margin-top: 14px;
    margin-right: 0px;
    margin-bottom: 14px;
    display: inline-block;
    cursor: pointer;
  }

  .setup-about-agreement {
    width:100%;
    height:48px;
    line-height: 48px;
    font-size: 14px;
    letter-spacing:1px;
    font-family: "PingFangSC-Regular";
    background:rgba(255,255,255,1);
    display: block;
  }

  .setup-about-agreement-label {
    width:calc(100% - 40px);
    height:48px;
    line-height: 48px;
    font-size: 14px;
    letter-spacing:1px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    background:rgba(255,255,255,1);
    display: inline-block;
    vertical-align: top;
  }

  .setup-about-agreement-label-ico {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    margin-top: 14px;
    margin-right: 0px;
    margin-bottom: 14px;
    display: inline-block;
    cursor: pointer;
  }

  .setup-about-privacy {
    width:100%;
    height:48px;
    line-height: 48px;
    font-size: 14px;
    letter-spacing:1px;
    font-family: "PingFangSC-Regular";
    background:rgba(255,255,255,1);
    display: block;
  }

  .setup-about-privacy-label {
    width:calc(100% - 40px);
    height:48px;
    line-height: 48px;
    font-size: 14px;
    letter-spacing:1px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    background:rgba(255,255,255,1);
    display: inline-block;
    vertical-align: top;
  }

  .setup-about-privacy-label-ico {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    margin-top: 14px;
    margin-right: 0px;
    margin-bottom: 14px;
    display: inline-block;
    cursor: pointer;
  }

  .setup-logout {
    width:280px;
    height:40px;
    line-height: 40px;
    background:rgba(36,179,107,1);
    border-radius:4px;
    font-family: PingFangSC-Medium;
    letter-spacing: 1px;
    text-align:center;
    margin: 10px auto;
    color: rgba(255,255,255,1);
  }

</style>
