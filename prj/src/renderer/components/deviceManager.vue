<template>
    <div class="DeviceManagerBG">
        <div class="DeviceManagerDlg">
            <div class="DeviceManagerHeader">
                <p class="DeviceManagerTitle">会话管理</p>
                <i class="el-icon-close" @click="Close()"></i>
            </div>
            <ul class="DeviceManagerContentPage">
                <li class="session-loading" v-show="isRefresh">
                    <i class="el-icon-loading"></i>
                </li>
                <li class="sessionItem" v-for="(item, index) in devices">
                    <div class="sessionInfo">
                        <div class="sessionNameDiv">
                            <div class="sessionName" :id="item.device_id" contenteditable="true" spellcheck="false" @keydown="changeSessionName($event, item)">{{(item.display_name == null ? item.device_id : item.display_name)}}</div>
                            <label class="sessionTab" v-show="item.device_id == ownDeviceId">当前会话</label>
                            <img class="sessionNameEdit" src="../../../static/Img/Setup/edit20px@2x.png"/>
                        </div>
                        <label class="sessionId">{{item.device_id}}</label>
                        <label class="sessionTime">{{DealTime(item.last_seen_ts)}}</label>
                    </div>
                    <div class="sessionOperate" v-show="item.device_id != ownDeviceId">
                        <label class="sessionRemove" @click="removeSession(item)">移除</label>
                    </div>
                </li>
            </ul>
        </div>
        <!-- <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="AlertConfirm" :width="alertWidth" :height="alertHeight" :contentLeft="alertContentLeft" :iconType="iconType"/> -->
        <AuthDlg v-show="showAuthPwd" @closeAuthDlg="closeAuthDlg" @canDeleteSession="canDeleteSession"></AuthDlg>
    </div>
</template>

<script>
import AlertDlg from './alert-dlg.vue'
import {Appendzero} from '../../packages/core/Utils.js'
import AuthDlg from './AuthPwd.vue'
export default {
    name: 'DeviceManager',
    props: {
    },
    components: {
        AlertDlg,
        AuthDlg
    },
    data () {
        return {
            showAuthPwd: false,
            ownDeviceId: '',
            iconType: "alert",
            alertWidth: 0,
            alertHeight: 0,
            alertContentLeft: 0,
            showAlertDlg: false,
            alertContnets: {},
            devices: [],
            isRefresh: false,
            toDeleteItem: null,
            session: null,
        }
    },
    methods: {
        closeAuthDlg: function() {
            this.showAuthPwd = false;
        },
        canDeleteSession: function(pwd) {
            this.deleteSession(pwd);
            this.showAuthPwd = false;
        },
        removeSession: async function(deviceItem) {
            this.toDeleteItem = deviceItem;
            try{
                var firstRet = await this._makeDeleteRequest(undefined);
                console.log("====== first ret is ", firstRet);
                if(e.httpStatus !== 401 || !e.data || !e.data.flows) {
                    this.toSetAddressLabelState = "auth认证异常";
                    return;
                }
                this.session = firstRet.data.session;
            }
            catch(e) {
                if(e.httpStatus !== 401 || !e.data || !e.data.flows) {
                    this.toSetAddressLabelState = "auth认证异常";
                    return;
                }
                this.session = e.data.session;
            }
            this.showAuthPwd = true;
        },
        _makeDeleteRequest(auth) {
            return global.mxMatrixClientPeg.matrixClient.deleteMultipleDevices(this.toDeleteItem, auth).then(
                () => {
                    this.getDeviceList();
                },
            );
        },
        deleteSession: async function(pwd) {
            var auth = {
                session: this.session,
                password: pwd,
                type: "m.login.password",
                user: global.mxMatrixClientPeg.matrixClient.getUserId(),
            }
            try{
                var ret = await this._makeDeleteRequest(auth);
                this.getDeviceList();
                this.devices.splice(this.devices.indexOf(this.toDeleteItem), 1);
                this.toDeleteItem = null;
            }
            catch(e) {
                if (e.httpStatus !== 401 || !e.data || !e.data.flows) {
                    // doesn't look like an interactive-auth failure
                    this.$toastMessage({message:"会话失败", time: 2000, type:'error'});
                    return;
                }
            }
        },
        Close: function() {
            this.$emit("deviceMgrDlgClose");
        },
        changeSessionName: function(e, deviceItem) {
            if(event.keyCode == 13) {
                var distElement = document.getElementById(deviceItem.device_id);
                var newName = distElement.innerHTML;
                global.mxMatrixClientPeg.matrixClient.setDeviceDetails(deviceItem.device_id, {
                    display_name: newName,
                })
                .then((ret) => {
                    this.getDeviceList();
                    distElement.blur();
                })
                .catch((e) => {
                    console.log("Error setting session display name", e);
                    throw new Error(_t("Failed to set display name"));
                });
                e.preventDefault();
                return false;
            }
        },
        getSessionName: function(deviceItem) {
            return deviceItem.display_name == null ? deviceItem.device_id : deviceItem.display_name;
        },
        DealTime: function(oririnalTime) {
            let distdate = new Date(oririnalTime);
            let y = distdate.getFullYear();
            let mon = distdate.getMonth() + 1;
            let d = distdate.getDate();
            let h = distdate.getHours();
            let m = distdate.getMinutes();
            let s = distdate.getSeconds();

            return y + "/" + Appendzero(mon) + "/" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m);
        },
        _deviceCompare(a, b) {
            // return < 0 if a comes before b, > 0 if a comes after b.
            const lastSeenDelta =
                (b.last_seen_ts || 0) - (a.last_seen_ts || 0);

            if (lastSeenDelta !== 0) { return lastSeenDelta; }

            const idA = a.device_id;
            const idB = b.device_id;
            return (idA < idB) ? -1 : (idA > idB) ? 1 : 0;
        },
        async getDeviceList() {
            global.mxMatrixClientPeg.matrixClient.getDevices().then(
                (resp) => {
                    this.isRefresh = false;
                    var devicesList = resp.devices || [];
                    this.devices = devicesList.sort(this._deviceCompare);
                    console.log("=========== this.devices is ", this.devices);
                },
                (error) => {
                    this.isRefresh = false;
                    let errtxt;
                    if (error.httpStatus == 404) {
                        // 404 probably means the HS doesn't yet support the API.
                        errtxt = "您所在的homeserver不支持会话管理";
                    } else {
                        console.log("Error loading sessions:", error);
                        errtxt = "获取session失败";
                    }
                },
            );
        }
    },
    mounted: function() {
      try{
        this.ownDeviceId = global.mxMatrixClientPeg.matrixClient.getDeviceId();
        this.isRefresh = true;
        this.getDeviceList();
      }
      catch(error) {
          console.log("get threed pids exception ", error)
      }
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar-track-piece {
        background-color: #F1F1F1;
        border-radius: 10px;
    }

    ::-webkit-scrollbar {
        width: 7px;
        height: 12px;
        display: none;
    }

    ::-webkit-scrollbar-thumb {
        height: 50px;
        background-color: #C1C1C1;
        border-radius: 10px;
        outline: none;
    }

    ::-webkit-scrollbar-thumb:hover {
        height: 50px;
        background-color: #A8A8A8;
        border-radius: 10px;
    }
    
    .DeviceManagerBG {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .DeviceManagerDlg{
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 0px 32px 20px 32px;
        width: 600px;
        height: 374px;
        background: #FFFFFF;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
    }
    
    .DeviceManagerHeader {
        width: 100%;
        height: 56px;
    }

    .DeviceManagerTitle {
        display: inline-block;
        width: 142px;
        height: 22px;
        font-family: SCPingFang-Medium;
        font-size: 16px;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
        letter-spacing: 0px;
        float: left;
        margin: 18px 0px 18px 0px;
    }

    .el-icon-close {
        display: inline-block;
        padding: 18px 0px 18px 18px;
        float: right;
    }

    .DeviceManagerContentPage {
        width: calc(100% - 12px);
        height: 298px;
        background: #FFFFFF;
        border: 0px solid rgba(221,221,221,1);
        border-radius: 4px;
        list-style: none;
        margin-left: 12px;
        margin-top: 0px;
        padding-left: 0px;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .sessionItem {
        width: 100%;
        height: 60px;
        padding: 7px 0px 7px 0px;
        border-bottom: 1px solid rgba(238, 238, 238, 1);
    }

    .sessionInfo {
        display: inline-block;
        width: 79%;
        height: 100%;

        .sessionNameEdit {
            display: none;
            width: 20px;
            height: 20px;
            vertical-align: middle;
        }
    }

    .sessionInfo:hover {
        display: inline-block;
        width: 79%;
        height: 100%;

        .sessionNameEdit {
            display: inline-block;
            width: 20px;
            height: 20px;
            vertical-align: middle;
        }
    }

    .sessionNameDiv {
        max-width: 100%;
        height: 20px;
    }

    .sessionName {
        display: inline-block;
        max-width: 80%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: SCPingFang-Regular;
        font-weight: 400;
    }

    .sessionName:focus {
        display: inline-block;
        max-width: 80%;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: SCPingFang-Regular;
        font-weight: 400;
        border: 1px solid rgba(153, 153, 153, 1);
    }

    .sessionTab {
        display: inline-block;
        width: 52px;
        background-color: rgba(0, 169, 113, 1);
        color: white;
        border-radius: 4px;
        height: 16px;
        font-size: 10px;
        font-family: SCPingFang-Regular;
        font-weight: 400;
        line-height: 16px;
        text-align: center;
        vertical-align: middle;
    }

    .sessionId {
        display: inline-block;
        width: 100%;
        height: 18px;
        color: rgba(153, 153, 153, 1);
        font-size: 12px;
        font-family: SCPingFang-Regular;
        font-weight: 400;
        line-height: 18px;
    }

    .sessionTime {
        display: inline-block;
        width: 100%;
        height: 18px;
        color: rgba(153, 153, 153, 1);
        font-size: 12px;
        font-family: SCPingFang-Regular;
        font-weight: 400;
        line-height: 18px;
    }

    .sessionOperate {
        display: inline-block;
        width: 20%;
        height: 100%;
        vertical-align: top;
        margin: 16px 0 16px 0;
        text-align: right;
    }

    .sessionRemove {
        width: 92px;
        height: 28px;
        color: black;
        border: 1px solid #DDDDDD;
        background-color: white;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 400;
        font-family: SCPingFang-Regular;
        line-height: 28px;
        letter-spacing: 0px;
        padding: 4px 16px 4px 16px;
    }

    .session-loading {
        width: 100%;
        margin: 5px 0 5px 0;
        text-align: center;
    }

</style>
