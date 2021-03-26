<template>
    <div class="setup-wind">
      <div class="setup-panel" id="setup-panel-id">
        <div class="setup-list">
          <div class="setup-list-item" @click="jumpToGeneralSetup">
            <img class="setupGeneralImage" src="../../../static/Img/Setup/general-20px@2x.png">
            <label class="setupGeneralLabel">通用</label>
          </div>
          <div class="setup-list-item" @click="jumpToNoticeSetup">
            <img class="setupNoticeImage" src="../../../static/Img/Setup/notice-20px@2x.png">
            <label class="setupNoticeLabel">通知</label>
          </div>
          <div class="setup-list-item" @click="jumpToSecurity">
            <img class="setupSecurityImage" src="../../../static/Img/Setup/security-nor-20px@2x.png">
            <label class="setupSecurityLabel">安全</label>
          </div>
          <div class="setup-list-item" @click="jumpToSecurity">
            <img class="setupSecurityImage" src="../../../static/Img/Setup/sys-20px@2x.png">
            <label class="setupSecurityLabel">系统</label>
          </div>
          <div class="setup-list-item" @click="jumpToUpdateSetup" v-show="false">
            <img class="setupUpdateImage" src="../../../static/Img/Setup/update-20px@2x.png">
            <label class="setupUpdateLabel">升级</label>
          </div>
          <div class="setup-list-item" @click="jumpToAboutSetup">
            <img class="setupAboutImage" src="../../../static/Img/Setup/about-20px@2x.png">
            <label class="setupAboutLabel">关于</label>
          </div>
        </div>
        <div class="setup-details" id="setup-details-id">
            <label class="setup-title" id="setup-details-general-id">通用</label>
            <div class="setup-array">
                <label class="setup-array-label">我的信息</label>
                <img class="setup-array-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showOwnerInfo">
            </div>
            <div class="setup-with-drop-down" v-show="false">
                <label class="setup-with-drop-down-label">多语言</label>
                <div class="setup-with-drop-down-div" @click="showLanguage">
                  <label class="setup-with-drop-down-div-label" @click="showLanguage">{{curLanguage}}</label>
                  <div class="setup-with-drop-down-div-ico" @click="showLanguage">
                      <img class="icon-folder" src="../../../static/Img/Setup/arrowDown-20px@2x.png" @click="showLanguage">
                  </div>
                </div>
            </div>
            <div class="setup-title" id="setup-details-notice-id">通知</div>
            <div class="setup-with-switch" v-show="isWindows()">
                <label class="setup-with-switch-label">消息提示音</label>
                <el-switch class="setup-with-switch-switch" v-model="soundNotice" @change="autoSoundNoticeStateChange(soundNotice)" :active-color="'#24B36B'">
                </el-switch>
            </div>
            <div class="setup-with-switch">
                <label class="with-switch">新消息通知</label>
                <el-switch class="setup-with-switch-switch" v-model="flashNotice" @change="autoFlashNoticeStateChange(flashNotice)" :active-color="'#24B36B'">
                </el-switch>
            </div>
            <div class="setup-title">安全</div>
            <div class="setup-array-with-label" v-show="false">
                <label class="setup-array-with-label-label">导出密钥</label>
                <label class="setup-array-with-label-label2" id="setup-security-export-keys-label2-id">导出密钥到本地文件</label>
                <img class="setup-array-with-label-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="exportSecurityKey">
            </div>
            <div class="setup-array-with-label" v-show="false">
                <label class="setup-array-with-label-label">导入密钥</label>
                <label class="setup-array-with-label-label2" id="setup-security-import-keys-label2-id">从本地文件导入密钥</label>
                <img class="setup-array-with-label-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="importSecurityKey">
            </div>
            <div class="setup-array" v-show="canChangePwd">
                <label class="setup-array-label">修改密码</label>
                <img class="setup-array-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="changePassword">
            </div>
            <div class="setup-array-with-label">
                <label class="setup-array-with-label-label">会话管理</label>
                <label class="setup-array-with-label-label2" id="setup-security-devict-list-label2-id"></label>
                <img class="setup-array-with-label-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showDeviceList">
            </div>
            <div class="setup-array-with-label">
                <label class="setup-array-with-label-label">账号管理</label>
                <label class="setup-array-with-label-label2" id="setup-security-account-manager-label2-id"></label>
                <img class="setup-array-with-label-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="accountManager">
            </div>
            <label class="setup-title" id="setup-details-sys-id">系统</label>
            <div class="setup-with-switch">
                <label class="setup-with-switch-label">开机自启动亿洽</label>
                <el-switch class="setup-with-switch-switch" v-model="autoRun" @change="autoRunStateChange(autoRun)" :active-color="'#24B36B'">
                </el-switch>
            </div>
            <div class="setup-with-input">
                <label class="setup-with-input-label">文件保存位置</label>
                <div class="setup-with-input-input-div">
                  <input class="setup-with-input-input" v-model="localStorePath" readonly="readonly" @click="openLocalStorageDir">
                  <div class="setup-with-input-input-folder-ico">
                      <img class="icon-folder" src="../../../static/Img/Setup/store-folder-20px@2x.png"   @click="changeLocalStorageDir">
                  </div>
                </div>
            </div>
            <div class="setup-array-only-label">
                <label class="setup-array-only-label-label-cache">缓存</label>
                <label class="setup-array-only-label-label2-cache" id="setup-general-clear-cache-label2-id">--M</label>
                <div class="setup-clear-cache-btn" @click="showAlert">清除缓存</div>
            </div>
            <div class="setup-title" id="setup-update-notice-id" v-show="false">升级</div>
            <div class="setup-array-with-label" v-show="false">
                <label class="setup-array-with-label-label">当前版本</label>
                <label class="setup-array-with-label-label2">{{lVersion}}</label>
                <img class="setup-array-with-label-ico" src="../../../static/Img/Setup/arrow-20px@2x.png">
            </div>
            <div class="setup-with-switch" v-show="false">
                <label class="setup-with-switch-label">自动更新</label>
                <el-switch class="setup-with-switch-switch" :active-color="'#24B36B'">
                </el-switch>
            </div>
            <div class="setup-title" id="setup-about-id">关于</div>
            <div class="setup-array-only-label">
                <label class="setup-array-only-label-label">当前版本</label>
                <label class="setup-array-only-label-label2">{{lVersion}}</label>
                <div class="setup-clear-cache-btn" @click="CheckUpdate">检查更新</div>
            </div>
            <div class="setup-array" v-show="false">
                <label class="setup-array-label">功能介绍</label>
                <img class="setup-array-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showAbout">
            </div>
            <div class="setup-array">
                <label class="setup-array-label">软件用户协议</label>
                <img class="setup-array-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showAgreement">
            </div>
            <div class="setup-array">
                <label class="setup-array-label">软件隐私政策</label>
                <img class="setup-array-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showPrivacy">
            </div>
            <div class="setup-logout" @click="logout()">退出</div>
        </div>
      </div>
      <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="clearCache"/>
      <AnnouncementDlg v-show="showAnnouncementDlg" :contentType="contentType" :dialogTitle="dialogTitle"  @closeAnnouncementDlg="closeAnnouncementDlg"/>
      <div class="win-header">
        <winHeaderBar @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
      </div>
      <div class="certficationBorder" v-show="showCertification">
        <certification :backupInfo="backupInfo" :isLogin="false" id="setupCertificationId" @cancelRecovery="cancelRecovery"></certification>
      </div>
      <div class="certficationBorder" v-show="showGeneralRecoveryKeyPage">
        <generalSecureBackUpPage @CanLogout="CanLogout"></generalSecureBackUpPage>
      </div>
      <div class="certficationBorder" v-show="showImportE2EKeyPage">
        <ImportE2EKeypage @closeE2EImportPage="closeE2EImportPage"></ImportE2EKeypage>
      </div>
      <div class="certficationBorder" v-show="showExportE2EKeyPage">
        <ExportE2EKeyPage @closeE2EExportPage="closeE2EExportPage" :needLogout="needLogout" :toUpdateExport="toUpdateExport" @CanLogout="CanLogout"></ExportE2EKeyPage>
      </div>
      <!-- <generalSecureBackUpPage  v-show="showGeneralPage"></generalSecureBackUpPage> -->
      <ChangePassword v-show="showChangePassword" @CloseChangePassword="CloseChangePassword"></ChangePassword>
      <AccountManager v-show="showAccountMgr" :needUpdate="needUpdate" @accountMgrDlgClose="accountMgrDlgClose"></AccountManager>
      <DeviceManager v-show="showDeviceMgr" @deviceMgrDlgClose="deviceMgrDlgClose"></DeviceManager>
      <OwnerDlg v-show="showOwnerDlg" :updateOwnerInfo="updateOwnerInfo" @CloseownerInfo="CloseownerInfo"></OwnerDlg>
      <UpdateAlertDlg v-show="showUpgradeAlertDlg" :showUpgradeAlertDlg = "showUpgradeAlertDlg" @closeUpgradeDlg="closeUpgradeAlertDlg" :upgradeInfo="upgradeInfo"/>
    </div>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {APITransaction} from '../../packages/data/transaction.js'
import {services, environment} from '../../packages/data/index.js'
import winHeaderBar from './win-header-login.vue'
import {ipcRenderer, remote} from 'electron'
import confservice from '../../packages/data/conf_service.js'
// import listItem from './list-item.vue'
import {formatCryptoKey, downloadGroupAvatar, Appendzero, strMsgContentToJson, JsonMsgContentToString, FileUtil, getdirsize, deleteall, getFileSizeByNumber} from '../../packages/core/Utils.js'
import {shell} from 'electron'
import AlertDlg from './alert-dlg.vue'
import AnnouncementDlg from './announcement.vue'
import { Config } from '../../packages/data/sqliteutil.js'
import certification from './Certificate.vue';
import ChangePassword from './changePassword.vue';
import AccountManager from "./accountManager.vue";
import generalSecureBackUpPage from './generalRecoveryCode.vue';
import ExportE2EKeyPage from './expore-e2e-key.vue';
import ImportE2EKeypage from './importE2E.vue';
import DeviceManager from './deviceManager.vue';
import OwnerDlg from './ownerDlg.vue';
import UpdateAlertDlg from './update-alert-dlg.vue'
import {ComponentUtil} from '../script/component-util';

export default {
  components: {
    UpdateAlertDlg,
    winHeaderBar,
    AlertDlg,
    AnnouncementDlg,
    certification,
    ChangePassword,
    AccountManager,
    generalSecureBackUpPage,
    ExportE2EKeyPage,
    ImportE2EKeypage,
    DeviceManager,
    OwnerDlg
    // listItem
  },
  props: [],
  watch: {
  },
  computed: {
  },
  data() {
    return {
      // showGeneralPage: true,
      showUpgradeAlertDlg: false,
      upgradeInfo: {},
      needUpdate: false,
      canChangePwd: false,
      updateOwnerInfo: false,
      showOwnerDlg: false,
      lVersion: '--',
      curLanguage: '',
      showDeviceMgr: false,
      needLogout: false,
      toUpdateExport: false,
      showExportE2EKeyPage: false,
      showImportE2EKeyPage: false,
      curEmail: "",
      showAccountMgr: false,
      backupInfo: {},
      showCertification: false,
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
      contentType: '',
      ipcPicInited: false,
      canSelecteFile: true,
      showChangePassword: false,
      showGeneralRecoveryKeyPage: false,
    };
  },
  methods: {
    closeUpgradeAlertDlg: function() {
        this.showUpgradeAlertDlg = false;
        this.upgradeInfo = {};
    },
    clearCache: function() {
        this.showUpgradeAlertDlg = false;
        this.upgradeInfo = {};
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
                let sDescription = "1.功能更新-托盘增加注销\r\n2.功能更新-聊天列表宽度可拖拽调整\r\n3.功能更新-当前聊天页面增加新消息提示\r\n4.功能更新-增加撤回功r\n5.功能更新-增加群组删除功能\n6.功能更新-群描述增加邮箱识别\n7.修复-聊天页面搜索，搜索i可搜出来，搜索io搜不出来\n8.修复-消息防止xss注入代码\n9.修复-重新安装登录后，群组列表最新一条消息发送者未显示组织或联系人内容\n10.修复- @用户有时候会无效的bug\n11.修复-群组头像查看打开大图\n12.修复- 群组成员编辑菜单位置自适应\n13.修复 - 群成员信息隐藏公司信息\n14.UI -整体ui中所有确认与取消的按钮间距调整"
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

                var packageFile = require("../../../package.json");
                var lVersion = packageFile.version;

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
                let sProductName = sUrl.split("/").pop();
                var sForceUpdate = newVersion.forceUpdate;
                var needUpdate = false;

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
                        self.upgradeInfo = {
                            "downloadUrl": sUrl,
                            "description": sDescription,
                            "verName": sVerName,
                            "verId": sId,
                        };
                        self.showUpgradeAlertDlg = true;
                    }
                }
                else {
                    if(needUpdate) {
                        self.upgradeInfo = {
                            "downloadUrl": sUrl,
                            "description": sDescription,
                            "verName": sVerName,
                            "productName": sProductName,
                            "verId": sId,
                        };
                        self.showUpgradeAlertDlg = true;
                    }
                }
            }
        }
        checkUpgrade(this);
        setInterval(() => {
            checkUpgrade(this);
        }, 1000 * 3600)
    },
    CloseownerInfo() {
      this.showOwnerDlg = false;
    },
    showLanguage() {

    },
    showOwnerInfo() {
      this.showOwnerDlg = true;
      this.updateOwnerInfo = !this.updateOwnerInfo;
    },
    closeE2EExportPage() {
      this.showExportE2EKeyPage = false;
    },
    closeE2EImportPage() {
      this.showImportE2EKeyPage = false;
    },
    generalCheck: function() {
      this.showGeneralPage = true;
    },
    deviceMgrDlgClose: function() {
      this.showDeviceMgr = false;
    },
    accountMgrDlgClose: function() {
      this.showAccountMgr = false;
    },
    CloseChangePassword: function() {
      this.showChangePassword = false;
    },
    changePassword: function() {
      console.log("=============changepassword")
      this.showChangePassword = true;
    },
    cancelRecovery: function() {
      this.showCertification = false;
    },
    bindEmail: function() {
      this.needUpdate = !this.needUpdate;
      this.showAccountMgr = true;
    },
    accountManager: async function() {
      this.needUpdate = !this.needUpdate;
      console.log("=============")
      this.showAccountMgr = true;
    },
    importSecurityKey: async function() {
      this.showImportE2EKeyPage = true;
    },
    showDeviceList: async function() {
      this.showDeviceMgr = true;
    },
    exportSecurityKey: async function() {
      this.needLogout = false;
      this.showExportE2EKeyPage = true;
    },
    autoSoundNoticeStateChange: async function(state) {
      if(state == true) {
        global.localStorage.setItem("message_sound", true);
      }
      else {
        global.localStorage.setItem("message_sound", false);
      }
    },
    autoFlashNoticeStateChange: async function(state) {
      if(state == true) {
        global.localStorage.setItem("message_notice", true);
      }
      else {
        global.localStorage.setItem("message_notice", false);
      }
    },
    autoRunStateChange: async function(state){
      if(state == true) {
        global.localStorage.setItem("autoStart", true);
      }
      else {
        global.localStorage.setItem("autoStart", false);
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

    CheckUpdate(){
      this.startCheckUpgrade();
    },

    closeAlertDlg() {
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
      try{
        shell.openItem(this.localStorePath);
      }
      catch(error) {
        shell.openPath(this.localStorePath);
      }
    },

    changeLocalStorageDir(){
      ipcRenderer.send("change-save-file-path", "change-file-path");
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
        var distElement = document.getElementById("setup-details-general-id");
        if(distElement) {
          this.ulDiv.scrollTo({ top:distElement.offsetTop, behavior: 'smooth' })
        }
    },
    jumpToNoticeSetup: function() {
        if(this.ulDiv == undefined) {
          this.ulDiv = document.getElementById("setup-details-id");
        }
        
        var distElement = document.getElementById("setup-details-notice-id");
        if(distElement) {
          this.ulDiv.scrollTo({ top:distElement.offsetTop, behavior: 'smooth' })
        }
    },
    jumpToUpdateSetup: function() {
        if(this.ulDiv == undefined) {
          this.ulDiv = document.getElementById("setup-details-id");
        }
        
        var distElement = document.getElementById("setup-update-notice-id");
        if(distElement) {
          this.ulDiv.scrollTo({ top:distElement.offsetTop, behavior: 'smooth' })
        }
    },
    jumpToSecurity: function() {
        if(this.ulDiv == undefined) {
          this.ulDiv = document.getElementById("setup-details-id");
        }
        
        var distElement = document.getElementById("setup-update-notice-id");
        if(distElement) {
          this.ulDiv.scrollTo({ top:distElement.offsetTop, behavior: 'smooth' })
        }
    },
    jumpToAboutSetup: function() {
        if(this.ulDiv == undefined) {
          this.ulDiv = document.getElementById("setup-details-id");
        }

        var distElement = document.getElementById("setup-about-id");
        if(distElement) {
          this.ulDiv.scrollTo({ top:distElement.offsetTop, behavior: 'smooth' })
        }
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
    CanLogout: async function(force) {
      if(force) {
        await global.mxMatrixClientPeg.logout();
        await global.services.common.logout();
        ipcRenderer.send("showLoginPageWindow");
      }
      else {
        this.showExportE2EKeyPage = false;
      }
    },
    logout: async function() {
      await global.mxMatrixClientPeg.logout();
      await global.services.common.logout();
      ipcRenderer.send("showLoginPageWindow");
      // this.toUpdateExport = !this.toUpdateExport;
      // this.needLogout = true;
      // this.showExportE2EKeyPage = true;
    },
    async _checkKeyBackupStatus() {
        try {
            const {backupInfo, trustInfo} = await global.mxMatrixClientPeg.matrixClient.checkKeyBackup();
            const backupKeyStored = Boolean(await global.mxMatrixClientPeg.matrixClient.isKeyBackupKeyStored());
            this.backupInfo = backupInfo;
            this.backupSigStatus = trustInfo;
            this.backupKeyStored = backupKeyStored;
        } catch (e) {
            console.log("Unable to fetch check backup status", e);
        }
    },
  },
  mounted: async function() {
  },
  created: async function() {
    // this.loginInfo = await services.common.GetLoginModel();
    // this.curUserInfo = await services.common.GetSelfUserModel();
    var message_sound = global.localStorage.getItem("message_sound");
    var message_notice = global.localStorage.getItem("message_notice");
    var autoStart = global.localStorage.getItem("autoStart");
    var language = global.mxMatrixClientPeg.getStorageLocale();
    var defaultIdentity = global.localStorage.getItem("authType");
    var threeAuthType = global.localStorage.getItem("threeAuthType");
    if(defaultIdentity == "three" && threeAuthType == "ldap") {
      this.canChangePwd = false;
    }
    else {
      this.canChangePwd = true;
    }
    if(language == "zh") {
      this.curLanguage = "简体中文";
    }
    else {
      this.curLanguage = "English";
    }
    // var config = await Config.GetValue();
    // var autoStart = await Config.GetAutoStart();
    // console.log("=====get config is ", config)
    console.log("=====autoStart is ", autoStart)
    if(autoStart == null || autoStart == "true") {
      ipcRenderer.send("setAutoRun", true);
      global.localStorage.setItem("autoStart", true);
      this.autoRun = true;
    }
    else {
      ipcRenderer.send("setAutoRun", false);
      global.localStorage.setItem("autoStart", false);
      this.autoRun = false;
    }
    if(message_sound == null || message_sound == "true") {
      global.localStorage.setItem("message_sound", true);
      this.soundNotice = true;
    }
    else {
      global.localStorage.setItem("message_sound", false);
      this.soundNotice = false;
    }
    if(message_notice == null || message_notice == "true") {
      global.localStorage.setItem("message_notice", true);
      this.flashNotice = true;
    }
    else {
      global.localStorage.setItem("message_notice", false);
      this.flashNotice = false;
    }

    ipcRenderer.on("selected-save-file-path", (event, args) => {
      if(args && !args.canceled){
        let path = args.filePaths[0];
        global.localStorage.setItem("savefile_path", path);
        this.localStorePath = path;
      }
    })
  },
  activated: async function() {
    // this.recentDevice = await services.common.GetRecentDevice();
    this.localStorePath = global.localStorage.getItem("savefile_path");
    if(!this.localStorePath) this.localStorePath = await confservice.getCurFilesDir();
    console.log("this.recentdeivce ", this.recentDevice);
    // console.log("this.localStorePath ", this.localStorePath);
    getdirsize(this.localStorePath, this.updateCacheSize);
    var language = global.mxMatrixClientPeg.getStorageLocale();
    if(language == "zh") {
      this.curLanguage = "简体中文";
    }
    else {
      this.curLanguage = "English";
    }
    this.lVersion = "Version " + remote.app.getVersion();
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
    background-color: rgba(255,255,255,1);
    -webkit-app-region: drag;
    * {
        -webkit-app-region: no-drag;
    }
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
      letter-spacing:0px;
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
      letter-spacing:0px;
      vertical-align: top;
  }

  .setupSecurityImage {
    width: 20px;
    height: 20px;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 12px;
    margin-bottom: 12px;
  }
  
  .setupSecurityLabel {
      width: calc(100% - 50px);
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      letter-spacing:0px;
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
      letter-spacing:0px;
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
      letter-spacing:0px;
      vertical-align: top;
  }

  .setup-details {
    width:100%;
    height: 99%;
    background-color: white;
    position: relative;
    margin-bottom: 10px;
    margin-top: 10px;
    margin-left: 16px;
    overflow-y: scroll;
    overflow-x: hidden;
    -webkit-app-region: drag;
    * {
        -webkit-app-region: no-drag;
    }
  }

  .setup-with-switch-label {
    width:calc(100% - 88px);
    height:48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing:0px;
    font-size: 14px;
    display: inline-block;
  }

  .setup-with-switch-switch {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 40px;
    float: right;
    padding-right: 14px;
    display: inline-block;
  }

  .setup-with-drop-down {
    width:100%;
    height:48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing: 0px;
  }

  .setup-with-drop-down-label {
    width:calc(100% - 221px);
    height:48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing:0px;
    font-size: 14px;
    display: inline-block;
    letter-spacing: 0px;
    vertical-align: top;
  }

  .setup-with-drop-down-div {
      height: 32px;
      width: 200px;
      margin-top: 8px;
      margin-bottom: 8px;
      border: 1px solid rgb(221, 221, 221);
      border-radius: 2px;
      display: inline-block;
  }

  .setup-with-drop-down-div-label {
      position: absolute;
      display: inline-block;
      height: 32px;
      line-height: 32px;
      width: 288px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      color: rgba(51, 51, 51, 1);
      font-weight: 400;
      letter-spacing:0px;
      padding: 0px;
      border: 0px;
      cursor: pointer;
      background-color: rgba(1, 1, 1, 0);
      text-indent: 6px;
      padding-left: 6px;
  }

  .setup-with-drop-down-div-label:hover {
      position: absolute;
      display: inline-block;
      height: 32px;
      line-height: 32px;
      width: 288px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      color: rgba(51, 51, 51, 1);
      font-weight: 400;
      letter-spacing:0px;
      padding: 0px;
      border: 0px;
      cursor: pointer;
      background-color: rgba(1, 1, 1, 0);
      text-indent: 6px;
      padding-left: 6px;
  }

  .setup-with-drop-down-div-ico {
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

  .setup-with-drop-down-div-ico:hover {
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

  .setup-with-input {
    width:100%;
    height:48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing: 0px;
  }

  .setup-with-input-label {
    width:calc(100% - 341px);
    height:48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing:0px;
    font-size: 14px;
    display: inline-block;
    letter-spacing: 0px;
    vertical-align: top;
  }

  .setup-with-input-input-div {
      height: 32px;
      width: 320px;
      margin-top: 8px;
      margin-bottom: 8px;
      border: 1px solid rgb(221, 221, 221);
      border-radius: 2px;
      display: inline-block;
  }

  .setup-with-input-input {
      position: absolute;
      display: inline-block;
      height: 32px;
      line-height: 24px;
      width: 288px;
      font-size: 12px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      letter-spacing:0px;
      padding: 0px;
      border: 0px;
      cursor: pointer;
      background-color: rgba(1, 1, 1, 0);
      text-indent: 6px;
  }

  .setup-with-input-input-folder-ico {
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

  .setup-with-input-input-folder-ico:hover {
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

  .setup-array-with-label {
    width:100%;
    height:48px;
    font-size: 14px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing: 0px;
  }

  .setup-array-with-label-label {
    width:calc(100% - 120px);
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing: 0px;
    vertical-align: top;
  }

  .setup-array-with-label-label2 {
    width:75px;
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing:0px;
    vertical-align: top;
    color: rgba(153,153,153,1);
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align:right;
  }

  .setup-array-with-label-ico {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    margin-top: 14px;
    margin-right: 0px;
    margin-bottom: 14px;
    display: inline-block;
    cursor: pointer;
  }

  .setup-array-only-label {
    width:100%;
    height:48px;
    font-size: 14px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing: 0px;
  }

  .setup-array-only-label-label {
    width:calc(100% - 212px);
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing: 0px;
    vertical-align: top;
  }

  .setup-array-only-label-label-cache {
    width:calc(100% - 212px);
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing: 0px;
    vertical-align: top;
  }

  .setup-array-only-label-label2-cache {
    width:94px;
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing: 0px;
    vertical-align: top;
    color: rgba(153,153,153,1);
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align:right;
  }
  
  .setup-clear-cache-btn {
    width: 84px;
    height: 28px;
    background-color: rgba(0, 169, 113, 1);
    border-radius: 4px;
    line-height: 28px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color:rgba(255, 255, 255, 1);
    margin: 5px 0px 5px 12px;
    display: inline-block;
    text-align: center;
  }

  .setup-clear-cache-btn:hover {
    width: 84px;
    height: 28px;
    background-color: rgba(0, 169, 113, 1);
    border-radius: 4px;
    line-height: 28px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color:rgba(255, 255, 255, 1);
    margin: 5px 0px 5px 12px;
    display: inline-block;
    text-align: center;
    cursor: pointer;
  }

  .setup-array-only-label-label2 {
    width:94px;
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing: 0px;
    vertical-align: top;
    color: rgba(153,153,153,1);
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align:right;
  }

  .setup-with-switch {
    width:100%;
    height:48px;
    line-height: 48px;
    font-size: 14px;
    font-family: "PingFangSC-Regular";
    background:rgba(255,255,255,1);
    display: block;
    letter-spacing: 0px;
  }

  .setup-array {
    width:100%;
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing: 0px;
    vertical-align: top;
  }

  .setup-array-label {
    width:calc(100% - 36px);
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing: 0px;
    vertical-align: top;
  }

  .setup-array-label2 {
    width:140px;
    height:48px;
    line-height: 48px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    display: inline-block;
    font-size:14px;
    font-weight:400;
    letter-spacing: 0px;
    vertical-align: top;
    color: rgba(153,153,153,1);
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align:right;
  }

  .setup-array-ico {
    width: 20px;
    height: 20px;
    margin-left: 0px;
    margin-top: 14px;
    margin-right: 0px;
    margin-bottom: 14px;
    display: inline-block;
    cursor: pointer;
  }

  .setup-title {
    width: 100%;
    height: 48px;
    line-height: 48px;
    background:rgba(255,255,255,1);
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing:0px;
    font-size: 16px;
    font-weight: bold
  }

  .setup-logout {
    width:280px;
    height:40px;
    line-height: 40px;
    background:rgba(36,179,107,1);
    border-radius:4px;
    font-family: PingFangSC-Medium;
    letter-spacing:0px;
    text-align:center;
    margin: 10px auto;
    color: rgba(255,255,255,1);
  }

  .certficationBorder {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index:3;
  }

</style>
