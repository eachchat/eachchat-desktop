<template>
    <div class="chat-msg-content-voip" :id="generalId()" v-on:click="callBack()" >
        <div class="voipWithoutTimeAndType" v-show="isVideo == -1">
            <div class="voip-notype-notime" alt="通话结束" style="vertical-align:middle">{{voipTimeLabel}}</div>
        </div>
        <div class="voipTimeZero" v-show="duration <= 0 && isVideo != -1">
            <img class="voip-icon" :src="getVoipImg()" style="vertical-align:middle">
            <div class="voip-notime" v-show="!isMine" :id="generalLabelId()" alt="已取消" style="vertical-align:middle">{{voipTimeLabel}}</div>
            <div class="voip-notime-mine" v-show="isMine" :id="generalLabelId()" alt="对方已取消" style="vertical-align:middle">{{voipTimeLabel}}</div>
        </div>
        <div class="voipTime" v-show="duration > 0 && isVideo != -1">
            <img class="voip-icon" :src="getVoipImg()" style="vertical-align:middle">
            <div class="voip-time" alt="通话结束" style="vertical-align:middle">{{voipTimeLabel + voipTime}}</div>
        </div>
    </div>
</template>

<script>
import {ComponentUtil} from '../script/component-util.js';
import {ipcRenderer} from 'electron';
export default {
    name: 'VoIP',
    props: {
        callId: {
            type: String,
            default: ''
        },
        isMine: {
            type: Boolean,
            default: false
        },
        voipInfo: {
            type: Object,
            default: {}
        },
        isVideo: {
            type: Number,
            default: -1
        },
        duration: {
            type: Number,
            default: -1
        },
        hangUpReason: {
            type: String,
            default: ""
        },
        operate_id: {
            type: String,
            default: ""
        },
        caller_id: {
            type: String,
            default: ""
        }
    },
    data () {
        return {
            voipTimeLabel: "",
            voipTime: "",
            roomId: "",
            voipType: "",
            userInfo: {},
            voipElementId: "",
            voipLabelElementId: "",
            unableClick: false,
        }
    },
    methods: {
        generalId() {
            let id = this.callId + "-" + Math.random().toString(36).slice(6);
            this.voipElementId = id;
            return id;
        },
        generalLabelId() {
            let id = "stateLabel" + this.callId + "-" + (Math.random()+1).toString(36).slice(6);
            this.voipLabelElementId = id;
            return id;
        },
        getVoipImg() {
            if(this.isVideo == 1) {
                if(this.isMine) return "./static/Img/Chat/VoIPVideoMine.svg";
                else return "./static/Img/Chat/VoIPVideoOthers.svg";
            } 
            else if(this.isVideo == 0) {
                if(this.isMine) return "./static/Img/Chat/VoIPVoiceMine.svg";
                else return "./static/Img/Chat/VoIPVoiceOthers.svg";
            }
            else {
                return "";
            }
        },
        callBack() {
            if(this.unableClick) return;
            this.unableClick = true;
            //    mxVoIP.voiceCall(this.roomId);
            let width = 300;
            let height = 480;
            if(this.isVideo == 1){
                width = 640;
                height = 320;
            }
            ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
                size:{width:width,height: height},
                roomInfo: { roomID: this.roomId,
                            name: this.userInfo.userName,
                            url:this.userInfo.userImg,
                            voipType: this.isVideo == 1 ? "video" : "voice",
                            action: "call"}});
            setTimeout(() => {
                this.unableClick = false;
            }, 1000)
        }
    },
    watch: {
        callId: function() {
            setTimeout(() => {
                this.$nextTick(() => {
                    let msgElement = document.getElementById(this.voipElementId);
                    let msgLabelElement = document.getElementById(this.voipLabelElementId);
                    if(this.isVideo == -1) {
                        this.voipTimeLabel = "通话结束";
                    }
                    else {
                        if(this.duration != 0 && this.duration != -1) {
                            let duration = Math.floor(this.duration/1000);
                            let str = ComponentUtil.numToTime(duration);
                            this.voipTimeLabel = "通话时长：";
                            this.voipTime = str;
                        }
                        else {
                            if(this.hangUpReason == "user_busy") {
                                this.voipTimeLabel = this.isMine == 1 ? "对方忙线中" : "忙线未接听";
                            }
                            else{
                                if(this.isMine) {
                                    if(this.operate_id != this.caller_id) this.voipTimeLabel = "对方已取消";
                                    else {
                                        this.voipTimeLabel = "已取消";
                                        msgLabelElement.style.width = "52px";
                                    }
                                }
                                else {
                                    console.log("this.operate is ", this.operate_id, " this.call is ", this.caller_id)
                                    if(this.operate_id != this.caller_id) {
                                        this.voipTimeLabel = "已取消";
                                        msgLabelElement.style.width = "52px";
                                    }
                                    else this.voipTimeLabel = "对方已取消";
                                }
                            }
                        }
                    }
                    if(msgElement) {
                        if(this.isMine) {
                            msgElement.style.float = "right";
                            msgElement.style.backgroundColor = "rgba(82, 172, 68, 1)";
                            msgElement.style.fontFamily = "PingFangSC-Light"
                            msgElement.style.color = "white";
                        }
                        else{
                            msgElement.style.float = "left";
                            msgElement.style.backgroundColor = "rgba(255, 255, 255, 1)";
                            msgElement.style.color = "rgba(0, 0, 0, 1)";
                            if(this.duration == 0) {
                                msgElement.style.width = ""
                            }
                        }
                    }
                })
            }, 0)
        },
        voipInfo: function() {
            this.voipType = this.voipInfo.voipType;
            this.roomId = this.voipInfo.roomId;
            this.userInfo = this.voipInfo.userInfo;
        }
    }
}
</script>

<style lang="scss" scoped>
    .chat-msg-content-voip {
        float:right;
        // background-color: rgba(82, 172, 68, 1);
        border-radius: 5px;
        text-align: left;
        font-size: 0px;
        margin: 0;
    }

    .voipTime {
        float:right;
        // background-color: rgba(82, 172, 68, 1);
        border-radius: 5px;
        text-align: left;
        font-size: 0px;
        margin: 0;
        width: 158px;
        height: 40px;
    }

    .voip-icon {
        width: 20px;
        height: 20px;
        margin: 10px 4px 10px 12px;
        display: inline-block;
    }

    .voip-time {
        width: calc(100% - 50px);
        height: 20px;
        margin: 10px 12px 10px 0px;
        display: inline-block;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        letter-spacing: 0px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        font-size: 14px;
    }

    .voip-notype-notime {
        width: 60px;
        height: 20px;
        margin: 10px 12px 10px 12px;
        display: inline-block;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        letter-spacing: 0px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        font-size: 14px;
    }

    .voip-notime {
        width: 70px;
        height: 20px;
        margin: 10px 12px 10px 4px;
        display: inline-block;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        letter-spacing: 0px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        font-size: 14px;
    }

    .voip-notime-mine {
        width: 70px;
        height: 20px;
        margin: 10px 12px 10px 4px;
        display: inline-block;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        letter-spacing: 0px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        font-size: 14px;
    }
</style>