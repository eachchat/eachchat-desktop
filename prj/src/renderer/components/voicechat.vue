<template>
    <div class="VoIPVoiceDiv">
        <div class="VoIPVoicePage">
            <div class="VoIpVoiceInfo">
                <img class="VoIPVoiceImg" :src="userImage">
                <label class="VoIPVoiceName">{{userName}}</label>
                <label class="VoIPVoiceState">{{curState}}</label>
            </div>
            <div class="VoIPCallControl" v-show="!beCalled">
                <div class="VoIPMicphoneControl">
                    <img class="VoIpMicphoneImg" src="../../../static/Img/VoIP/muteMicphone@2x.png" @click="mute">
                    <label class="VoIPMicphoneLabel">静音</label>
                </div>
                <div class="VoIPHangUp" @click="hangUp">
                    <img class="VoIpHangUpImg" src="../../../static/Img/VoIP/hangup@2x.png" @click="hangUp">
                    <label class="VoIPHangUpLabel">挂断</label>
                </div>
                <div class="VoIPVolumeControl">
                    <img class="VoIpVolumeImg" src="../../../static/Img/VoIP/handsFree@2x.png">
                    <label class="VoIPVolumeLabel">音量</label>
                </div>
            </div>
            <div class="VoIPBeCalledControl" v-show="beCalled">
                <div class="VoIPBeCalledHangUp" @click="hangUp">
                    <img class="VoIpBeCalledHangUpImg" src="../../../static/Img/VoIP/hangup@2x.png" @click="hangUp">
                    <label class="VoIPBeCalledHangUpLabel">挂断</label>
                </div>
                <div class="VoIPAnswerControl">
                    <img class="VoIpAnswerImg" src="../../../static/Img/VoIP/answer@2x.png" @click="answer">
                    <label class="VoIPAnswerLabel">接听</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'
import {mxVoIP} from "../../packages/data/mxVoIP.js";
import macImageWinHeadbar from './macImageWindowHeader.vue';
import winHeaderBar from './win-header-login.vue';
import {ComponentUtil} from '../script/component-util.js';
import {mapState} from 'vuex';
export default {
    name: "VoIPVoice",
    components:{
        macImageWinHeadbar,
        winHeaderBar,
    },
    computed: {
        ...mapState({
            matrixSync: state => state.common.matrixSync
        }),
    },
    props: {
        curState: {
            type: String,
            default: "正在接通中"
        },
        voipInfo: {
            type: Object,
            default: {}
        },

    },
    data(){
        return{
            userImage: "./static/Img/User/user-40px@2x.png",
            userName: "",
            beCalled: false,
        }
    },
    methods:{
        mute: function() {
            this.voiceChat.mute(this.roomId);
        },
        hangUp: function(event, roomId) {
            console.log("====to hang up");
            this.voiceChat.hangUp(this.roomId);
            ipcRenderer.send("hideVoiceChat");
        },
        showVoIPPage: async function(event, roomId) {
            console.log("=======show voip page room id is ", roomId);
            let call = global.mxMatrixClientPeg.getCall(roomId);

            let checkRoom = global.mxMatrixClientPeg.matrixClient.getRoom(roomId);
            const distUserId = global.mxMatrixClientPeg.getDMMemberId(checkRoom);
            
            let profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(distUserId);
            let distUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
            console.log("=====dist url is ", distUrl)
            if(distUrl && distUrl == '') {
                distUrl = "../../../static/Img/User/user-40px@2x.png";
            }
            console.log("=====dist url is ", distUrl)
            
            let showName = this.$store.getters.getShowName(distUserId);
            if(showName.length == 0) {
                showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
            }

            ipcRenderer.send("createChildWindow", {type: "voiceChatWindow",
            size:{width:300,height: 480},
            voipInfo: {
                voipType: call.type,
                voipFrame: "webRtc",
                roomId: roomId,
                voipShowInfo: {
                    userImg: distUrl,
                    userName: showName
                }
            }})
            console.log("to show voip of ", roomId);
        },
        answer: function(event, roomId) {
            this.voiceChat.voiceAnswer(this.roomId);
        },
        hangUpCallback: function() {
            console.log("hangup");
            ipcRenderer.send("hideVoiceChat");
        },
        voiceCallErrorCallback: function(err) {
            console.log("err is ", err);
        },
        stateCallback: function(state) {
            if (state === this.voiceChat.CHATTING) {
                this.curState = "通话中";
                this.beCalled = true;
                // _setCallState(call, call.roomId, "ringing");
                // pause("ringbackAudio");
            }
            else if (state === this.voiceChat.CALLING) {
                this.curState = "正在接通中";
                // _setCallState(call, call.roomId, "ringing");
                // pause("ringbackAudio");
            } else if (state === this.voiceChat.INVITE_SENT) {
                this.curState = "正在呼叫";
                // _setCallState(call, call.roomId, "ringback");
                // play("ringbackAudio");
            } else if (state === this.voiceChat.ENDED) {
                console.log("finished and emit close");
                this.curState = "通话结束";
                ipcRenderer.send("hideVoiceChat");
                // _setCallState(undefined, call.roomId, "ended");
                // pause("ringbackAudio");
                // play("callendAudio");
            } else if (state === this.voiceChat.BUSY) {
                this.curState = "对方正忙";
                // _setCallState(call, call.roomId, "busy");
                // pause("ringbackAudio");
                // play("busyAudio");
                this.$toastMessage({message:"对方未能接听", time: 2000, type:'success', showWidth:'280px', showHeight:"100px"});
                ipcRenderer.send("hideVoiceChat");
            } else {
                console.log("final state is ", state);
                this.curState = "通话中";
            }
        },
        initMxClientCallback() {
            global.mxMatrixClientPeg.matrixClient.on("Call.incoming", this.handleComingCall);
        },
        async getUserImg(roomId) {
            let checkRoom = global.mxMatrixClientPeg.matrixClient.getRoom(roomId);
            const distUserId = global.mxMatrixClientPeg.getDMMemberId(checkRoom);
            
            let profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(distUserId);
            let distUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
            console.log("=====dist url is ", distUrl)
            if(!distUrl || (distUrl && distUrl == '')) {
                console.log("=====dist url is ", distUrl)
                distUrl = "../../../static/Img/User/user-40px@2x.png";
            }
            return distUrl;
        },
        async getUserShowName(roomId) {
            let checkRoom = global.mxMatrixClientPeg.matrixClient.getRoom(roomId);
            const distUserId = global.mxMatrixClientPeg.getDMMemberId(checkRoom);
            
            let showName = this.$store.getters.getShowName(distUserId);
            if(showName.length == 0) {
                try {
                    showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
                }
                catch(e) {
                    console.log(" get name exception ", e);
                }
            }
            return showName;
        },
        async handleComingCall(call) {
            console.log("coming call call is ", call);
            console.log("coming call call state is ", call.state);
            let isCalling = false;
            let exitCalls = global.mxMatrixClientPeg.getCall();
            for(let i = 0; i < exitCalls.length; i++) {
                let checkCall = exitCalls[i];
                if(checkCall.state == ENDED) {
                    global.mxMatrixClientPeg.removeCall(checkCall.roomId);
                }
                else {
                    isCalling = true;
                }
            }
            if(isCalling) {
                // I am busy now.
                call.hangup(call.roomId);
                return;
            }
            this.voiceChat.callListeners(call);
            global.mxMatrixClientPeg.addCall(call.roomId, call);
            let noticeType = "voice";
            if(call && call.type == "video") {
                noticeType = "video";
            }

            let checkRoom = global.mxMatrixClientPeg.matrixClient.getRoom(call.roomId);
            const distUserId = global.mxMatrixClientPeg.getDMMemberId(checkRoom);
            
            let profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(distUserId);
            let distUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
            console.log("=====dist url is ", distUrl instanceof String)
            console.log("=====dist url is ", !distUrl)
            if(!distUrl || (distUrl && distUrl == '')) {
                console.log("=====dist url is ", distUrl)
                distUrl = "./static/Img/User/user-40px@2x.png";
            }
            console.log("=====dist url is ", distUrl)
            
            let showName = this.$store.getters.getShowName(distUserId);
            if(showName.length == 0) {
                try {
                    showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
                }
                catch(e) {
                    console.log(" get name exception ", e);
                }
            }

            let trayNoticeObj = {
                unreadCount:0,
                imgUrl: distUrl,
                chatName: showName,
                roomId: checkRoom.roomId,
                notictType: noticeType,
            }   
            let trayNoticeInfo = [];
            trayNoticeInfo[checkRoom.roomId + ":VoIP"] = trayNoticeObj;
            console.log("====ru show notice ");
            ipcRenderer.send("updateVoIPTrayNotice", trayNoticeInfo);
        },
    },
    watch: {
        voipInfo: async function() {
            const voipInfo = this.voipInfo;
            console.log("updatevoip info is ", voipInfo);
            this.roomId = voipInfo.roomId;
            if(this.roomId.length == 0) return;
            this.userImage = voipInfo.voipShowInfo.userImg;
            this.userName = voipInfo.voipShowInfo.userName;
            console.log("===========this.userImage ", this.userImage);
            if(!this.userImage || (this.userImage && this.userImage == "")) {
                this.userImage = await this.getUserImg(this.roomId);
                console.log("===========this.userImage ", this.userImage);
            }
            if(!this.userName || (this.userName && this.userName == "")) {
                this.userName = await this.getUserShowName(this.roomId);
            }
            // console.log("====global.mxMatrixClientPeg.getCall(this.roomId) is ", global.mxMatrixClientPeg.getCall(this.roomId));
            // console.log("====global.mxMatrixClientPeg.getCall(this.roomId) state is ", global.mxMatrixClientPeg.getCall(this.roomId).state);
            if(global.mxMatrixClientPeg.getCall(this.roomId)) {
                this.beCalled = true;
            }
            else {
                this.beCalled = false;
                this.voiceChat.voiceCall(this.roomId);
            }
        },
        matrixSync: function() {
            console.log("==== prepared and and ");
            this.initMxClientCallback();
        }
    },
    async mounted(){
        let now = new Date();
        console.log("cur time is ", ComponentUtil.formatTimeFilter(now.getTime()));
        this.voiceChat = new mxVoIP();
        this.voiceChat.setVoiceCallback(this.hangUpCallback, this.voiceCallErrorCallback, this.stateCallback);
        await global.services.common.login();
        await this.voiceChat.createMatrix();
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
              break;
            default:
              break;
          }
        })
        // ipcRenderer.on('AnswerVoIP', this.answer)
        ipcRenderer.on('showVoIPPage', this.showVoIPPage)
        // ipcRenderer.on('HangupVoIP', this.HangupVoIP)
    }
}
</script>

<style lang="scss" scoped>
    .VoIPVoiceDiv {
        width: 300px;
        height: 480px;
        background: rgba(74, 76, 91, 1);
        user-select:none;
        box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.17);
        border-radius: 4px;
    }

    .VoIPVoicePage {
        width: 100%;
        height: 100%;
        background: rgba(74, 76, 91, 1);
        user-select:none;
    }

    .VoIpVoiceInfo {
        height: 60%;
        width: 100%;
        background: rgba(255, 255, 255, 0);
    }

    .VoIPVoiceImg {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        padding: 120px 120px 6px 120px;
        display: block;
    }

    .VoIPVoiceName {
        width: 100%;
        height: 22px;
        padding: 6px 0px 6px 0px;
        color: rgba(255, 255, 255, 1);
        text-align: center;
        line-height: 22px;
        font-weight: 400;
        font-size: 16px;
        font-family: 'PingFangSC-Regular';
        white-space: pre-wrap;
        word-wrap: break-word;
        display: block;
    }

    .VoIPVoiceState {
        width: 100%;
        height: 18px;
        padding: 6px 0px 6px 0px;
        text-align: center;
        color: rgba(153, 153, 153, 1);
        line-height: 18px;
        font-weight: 400;
        font-size: 12px;
        font-family: 'PingFangSC-Regular';
        white-space: pre-wrap;
        word-wrap: break-word;
        display: block;
    }

    .VoIPCallControl {
        height: 40%;
        width: 100%;
        background: rgba(255, 255, 255, 0);
    }

    .VoIPMicphoneControl {
        width: 44px;
        height: 100%;
        display: inline-block;
        margin: 0px 20px 0px 39px;
        text-align: center;
        position: relative;
        vertical-align: top;
    }

    .VoIpMicphoneImg {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 0px;
        bottom: 32px;
    }

    .VoIpMicphoneImg:hover {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 0px;
        bottom: 32px;
        cursor: pointer;
    }

    .VoIPMicphoneLabel {
        width: 20px;
        height: 12px;
        font-size: 10px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        line-height: 12px;
        position: absolute;
        left: 12px;
        bottom: 12px;
    }

    .VoIPHangUp {
        width: 44px;
        height: 100%;
        display: inline-block;
        margin: 0px 20px 0px 20px;
        text-align: center;
        position: relative;
        vertical-align: top;
    }

    .VoIpHangUpImg {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 0px;
        bottom: 32px;
    }

    .VoIpHangUpImg:hover {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 0px;
        bottom: 32px;
        cursor: pointer;
    }

    .VoIPHangUpLabel {
        width: 20px;
        height: 12px;
        font-size: 10px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        line-height: 12px;
        position: absolute;
        left: 12px;
        bottom: 12px;
    }

    .VoIPVolumeControl {
        width: 44px;
        height: 100%;
        display: inline-block;
        margin: 0px 39px 0px 20px;
        text-align: center;
        position: relative;
        vertical-align: top;
    }

    .VoIpVolumeImg {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 0px;
        bottom: 32px;
    }

    .VoIpVolumeImg:hover {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 0px;
        bottom: 32px;
        cursor: pointer;
    }

    .VoIPVolumeLabel {
        width: 20px;
        height: 12px;
        font-size: 10px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        line-height: 12px;
        position: absolute;
        left: 12px;
        bottom: 12px;
    }

    .VoIPBeCalledControl {
        height: 40%;
        width: 100%;
        background: rgba(255, 255, 255, 0);
    }

    .VoIPBeCalledHangUp {
        width: 66px;
        height: 100%;
        display: inline-block;
        margin: 0px 39px 0px 49px;
        text-align: center;
        position: relative;
        vertical-align: top;
    }

    .VoIpBeCalledHangUpImg {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 11px;
        bottom: 32px;
    }

    .VoIpBeCalledHangUpImg:hover {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 11px;
        bottom: 32px;
        cursor: pointer;
    }

    .VoIPBeCalledHangUpLabel {
        width: 20px;
        height: 12px;
        font-size: 10px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        line-height: 12px;
        position: absolute;
        left: 23px;
        bottom: 12px;
    }

    .VoIPAnswerControl {
        width: 66px;
        height: 100%;
        display: inline-block;
        margin: 0px 49px 0px 20px;
        text-align: center;
        position: relative;
        vertical-align: top;
    }

    .VoIpAnswerImg {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 11px;
        bottom: 32px;
    }

    .VoIpAnswerImg:hover {
        width: 44px;
        height: 44px;
        position: absolute;
        left: 11px;
        bottom: 32px;
        cursor: pointer;
    }

    .VoIPAnswerLabel {
        width: 20px;
        height: 12px;
        font-size: 10px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        line-height: 12px;
        position: absolute;
        left: 23px;
        bottom: 12px;
    }

</style>