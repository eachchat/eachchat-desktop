<template>
    <div class="VoIPVoiceDiv">
        <div class="VoIPVoicePage">
            <div class="VoIpVoiceInfo">
                <img class="VoIPVoiceImg" :src="userImage">
                <label class="VoIPVoiceName">{{userName}}</label>
                <label class="VoIPVoiceState">{{curState}}</label>
            </div>
            <div class="VoIPControl">
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
        </div>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'
import {mxVoIP} from "../../packages/data/mxVoIP.js";
import macImageWinHeadbar from './macImageWindowHeader.vue';
import winHeaderBar from './win-header-login.vue';
export default {
    name: "VoIPVoice",
    components:{
        macImageWinHeadbar,
        winHeaderBar,
    },
    props: {
        curState: {
            type: String,
            default: "正在接通中"
        }
    },
    data(){
        return{
            userImage: "./static/Img/User/user-40px@2x.png",
            userName: "wangxin",
        }
    },
    methods:{
        mute: function() {
            mxVoIP.mute(this.roomId);
        },
        hangUp: function() {
            console.log("====to hang up");
            mxVoIP.hangUp(this.roomId);
        },
        updageVoipInfo: async function(event, windowInfo) {
            const voipInfo = windowInfo.voipInfo;
            console.log("updatevoip info is ", voipInfo);
            this.roomId = voipInfo.roomId;
            if(this.roomId.length == 0) return;
            this.userImage = voipInfo.voipShowInfo.userImg;
            this.userName = voipInfo.voipShowInfo.userName;
            console.log("global.mxMatrixClientPeg.homeserve ", global.mxMatrixClientPeg.homeserve);

            mxVoIP.voiceCall(this.roomId, this.hangUpCallback, this.voiceCallErrorCallback, this.stateCallback);
        },
        hangUpCallback: function() {
            console.log("hangup");
            ipcRenderer.send("close");
        },
        voiceCallErrorCallback: function(err) {
            console.log("err is ", err);
        },
        stateCallback: function(state) {
            if (state === mxVoIP.CHATTING) {
                this.curState = "通话中";
                // _setCallState(call, call.roomId, "ringing");
                // pause("ringbackAudio");
            }
            else if (state === mxVoIP.CALLING) {
                this.curState = "正在接通中";
                // _setCallState(call, call.roomId, "ringing");
                // pause("ringbackAudio");
            } else if (state === mxVoIP.INVITE_SENT) {
                this.curState = "正在呼叫";
                // _setCallState(call, call.roomId, "ringback");
                // play("ringbackAudio");
            } else if (state === mxVoIP.ENDED) {
                console.log("finished and emit close");
                this.curState = "通话结束";
                ipcRenderer.emit("close");
                // _setCallState(undefined, call.roomId, "ended");
                // pause("ringbackAudio");
                // play("callendAudio");
            } else if (state === mxVoIP.BUSY) {
                this.curState = "对方正忙";
                ipcRenderer.emit("close");
                // _setCallState(call, call.roomId, "busy");
                // pause("ringbackAudio");
                // play("busyAudio");
                this.$toastMessage({message:"对方未能接听", time: 2000, type:'success', showWidth:'280px', showHeight:"100px"});
                ipcRenderer.emit("close");
            } else {
                console.log("final state is ", state);
                this.curState = "通话中";
            }
            
        }
    },
    async mounted(){
        let ret = await mxVoIP.createMatrix();
        ipcRenderer.on("childwindowArgs", this.updageVoipInfo);
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

    .VoIPControl {
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

</style>