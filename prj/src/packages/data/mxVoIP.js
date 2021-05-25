import { ipcRenderer } from 'electron';
import Matrix from 'matrix-js-sdk';
import {ComponentUtil} from '../../renderer/script/component-util.js';


const audioPromises = {};

function play(audioId) {
    // TODO: Attach an invisible element for this instead
    // which listens?
    const audio = document.getElementById(audioId);
    if (audio) {
        const playAudio = async () => {
            try {
                // This still causes the chrome debugger to break on promise rejection if
                // the promise is rejected, even though we're catching the exception.
                await audio.play();
            } catch (e) {
                // This is usually because the user hasn't interacted with the document,
                // or chrome doesn't think so and is denying the request. Not sure what
                // we can really do here...
                // https://github.com/vector-im/element-web/issues/7657
                console.log("Unable to play audio clip", e);
            }
        };
        if (audioPromises[audioId]) {
            audioPromises[audioId] = audioPromises[audioId].then(()=>{
                audio.load();
                return playAudio();
            });
        } else {
            audioPromises[audioId] = playAudio();
        }
    }
}

function pause(audioId) {
    // TODO: Attach an invisible element for this instead
    // which listens?
    const audio = document.getElementById(audioId);
    if (audio) {
        if (audioPromises[audioId]) {
            audioPromises[audioId] = audioPromises[audioId].then(()=>audio.pause());
        } else {
            // pause doesn't actually return a promise, but might as well do this for symmetry with play();
            audioPromises[audioId] = audio.pause();
        }
    }
}


function _setCallState(call, roomId, status) {
    console.log(
        `Call state in ${roomId} changed to ${status} (${call ? call.call_state : "-"})`,
    );
    global.mxMatrixClientPeg.addCall(roomId, call);

    if (status === "ringing") {
        play("ringAudio");
    } else if (call && call.call_state === "ringing") {
        pause("ringAudio");
    }

    if (call) {
        call.call_state = status;
    }
}

function _setVideoCallListeners(call, videoCall) {
    call.on("error", function(err) {
        if(call.type === "video"){
            console.error("Call error:", err);
        }  
        else{
            videoCall.voiceCallErrorCallback(err);
        }
    });
    call.on("hangup", function() {
        if(call.type === "video"){
            _setCallState(undefined, call.roomId, "ended");
            videoCall.afterCallState();
        }
        else{
            console.log("call is ", call);
            console.log("====to hangup and call state is ", call.call_state);
            videoCall.afterCallState();
        }
    });
    // map web rtc states to dummy UI state
    // ringing|ringback|connected|ended|busy|stop_ringback|stop_ringing
    call.on("state", function(newState, oldState) {
        console.log(newState, oldState)
        if (newState === "ringing") {
            _setCallState(call, call.roomId, "ringing");
            pause("ringbackAudio");
        } 
        else if (newState === "invite_sent") {
            _setCallState(call, call.roomId, "ringback");
            play("ringbackAudio");
            
        } else if (newState === "ended" && oldState === "connected") {
            _setCallState(undefined, call.roomId, "ended");
            pause("ringbackAudio");
            play("callendAudio");
            
        } else if (newState === "ended" && oldState === "invite_sent" &&
                (call.hangupParty === "remote" ||
                (call.hangupParty === "local" && call.hangupReason === "invite_timeout")
                )) {
            _setCallState(call, call.roomId, "busy");
            pause("ringbackAudio");
            play("busyAudio");
            console.error("The remote side failed to pick up");
        } else if (oldState === "invite_sent") {
            _setCallState(call, call.roomId, "stop_ringback");
            pause("ringbackAudio");    
        } else if (oldState === "ringing") {
            _setCallState(call, call.roomId, "stop_ringing");
            pause("ringbackAudio");
        } else if (newState === "connected") {
            _setCallState(call, call.roomId, "connected");
            videoCall.connectedState();
            pause("ringbackAudio");
        }else {
            console.log("Final undeal state");
        }
    });
}

class mxVoIP{
    constructor(){
        this.videochat = null;
        this.voicechat = null;
    }

    setVideoChat(videochat){
        this.videochat = videochat;
    }

    setVoiceChat(voicechat){
        this.voicechat = voicechat;
    }

    async createMatrix(){
        var host = window.localStorage.getItem("mx_hs_url") == null ? "https://matrix.each.chat" : window.localStorage.getItem("mx_hs_url");
        var flows = await global.mxMatrixClientPeg.checkHomeServer(host)
        this.supportedIdentity = flows;
        for (let i = 0; i < flows.length; i++ ) {
            var appServerInfo = await global.mxMatrixClientPeg.getAppServerInfo(host);
            global.services.common.setGmsConfiguration(appServerInfo.data);
            break;
        }
        var ret = await global.mxMatrixClientPeg.restoreFromLocalStorage();
        console.log("========= ret ", ret)
        if(ret == undefined) {
            return false;
        }
        console.log("the matrix client is ", global.mxMatrixClientPeg)

        let ops = {
        }
        ops.pendingEventOrdering = "detached";
        ops.lazyLoadMembers = true;
        await global.mxMatrixClientPeg.matrixClient.startClient(ops);
        await global.services.common.login();
        this.onMatrixSync();
    }

    onMatrixSync(){
        global.mxMatrixClientPeg.matrixClient.on("sync", (state, prevState, data) => {
            console.log("state ", state);
            console.log("prevState ", prevState);
            console.log("data ", data);
          switch(state){
            case "PREPARED":
                global.mxMatrixClientPeg.matrixClient.setGlobalErrorOnUnknownDevices(false);
                global.mxMatrixClientPeg.matrixClient.on("Call.incoming", this.handleComingVoip);
              break;
            default:
              break;
          }
        })
    }

    async handleComingVoip(call) {
        console.log("coming call call is ", call);
        console.log("coming call call state is ", call.state);
        let isCalling = false;
        let exitCalls = global.mxMatrixClientPeg.getCall();
        for(let i = 0; i < exitCalls.length; i++) {
            let checkCall = exitCalls[i];
            if(checkCall.state == "ended") {
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

        if(call.state == "ended") return;
        
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
        let showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);

        if(noticeType === 'video'){
            _setVideoCallListeners(call, global.viopChat.videochat);
            let trayNoticeObj = {
                unreadCount:0,
                imgUrl: distUrl,
                chatName: showName,
                roomId: checkRoom.roomId,
                notictType: noticeType
            }   
            let trayNoticeInfo = [];
            trayNoticeInfo[checkRoom.roomId + ":VoIP"] = trayNoticeObj;
            console.log("====ru show notice ");
            ipcRenderer.send("updateVoIPTrayNotice", trayNoticeInfo);
        }
        else{
            _setVideoCallListeners(call, global.viopChat.videochat);
            let trayNoticeObj = {
                unreadCount:0,
                imgUrl: distUrl,
                chatName: showName,
                roomId: checkRoom.roomId,
                notictType: noticeType
            }   
            let trayNoticeInfo = [];
            trayNoticeInfo[checkRoom.roomId + ":VoIP"] = trayNoticeObj;
            console.log("====ru show notice ");
            ipcRenderer.send("updateVoIPTrayNotice", trayNoticeInfo);
        }
    }

    hangUp(room_id) {
        try{
            if (global.mxMatrixClientPeg.getCall(room_id)) {
                console.log("====to hangup and call is ", global.mxMatrixClientPeg.getCall(room_id));
                global.mxMatrixClientPeg.getCall(room_id).hangup();
                
                console.log("====to hangup and call state is ", global.mxMatrixClientPeg.getCall(room_id).call_state);
            }
        }
        catch(e) {
            console.log("to hang up err ", e);
        }
        global.mxMatrixClientPeg.removeCall(room_id);
        ipcRenderer.emit("close");
        this.updateTrayNotice();
    }

    muteVoice(room_id){
        let distCall = global.mxMatrixClientPeg.getCall(room_id);
        if (distCall) {
            distCall.setMicrophoneMuted(true);
        }
    }

    unMuteVoice(room_id){
        let distCall = global.mxMatrixClientPeg.getCall(room_id);
        if (distCall) {
            distCall.setMicrophoneMuted(false);
        }
    }

    voiceCall(room_id){
        const room = global.mxMatrixClientPeg.matrixClient.getRoom(room_id);
        if(!room) {
            console.log("err: voice call room not exist");
            return;
        }
        const call = Matrix.createNewMatrixCall(global.mxMatrixClientPeg.matrixClient, room_id);
        console.log("====to create call is ", call);
        console.log("====to create call state is ", call.state);
        global.mxMatrixClientPeg.addCall(room_id, call);
        _setVideoCallListeners(call, global.viopChat.videochat),
        call.placeVoiceCall();
        let remoteAudio = document.getElementById("remoteAudio");
        call.setRemoteAudioElement(remoteAudio);
    }

    videoCall(roomInfo, videochat){
        let bSupportVoip = global.mxMatrixClientPeg.matrixClient.supportsVoip();
        console.log("support voip", bSupportVoip)
        let call = Matrix.createNewMatrixCall(global.mxMatrixClientPeg.matrixClient, roomInfo.roomID);
        let largeWindow = document.getElementById("large-window");
        let smallWindow = document.getElementById("small-window");
        let remoteAudio = document.getElementById("remoteAudio");
        _setVideoCallListeners(call, videochat);
        call.placeVideoCall();
        call.setLocalVideoElement(smallWindow);
        call.setRemoteVideoElement(largeWindow);
        call.setRemoteAudioElement(remoteAudio);
    }

    answerVideoChat(room_id, videochat){
        let call = global.mxMatrixClientPeg.getCall(room_id);
        call.answer();
        let largeWindow = document.getElementById("large-window");
        let smallWindow = document.getElementById("small-window");
        let remoteAudio = document.getElementById("remoteAudio");
        call.setLocalVideoElement(smallWindow);
        call.setRemoteVideoElement(largeWindow);
        call.setRemoteAudioElement(remoteAudio);
        this.updateTrayNotice();
    }

    async updateTrayNotice() {
        let calls = global.mxMatrixClientPeg.getCall();
        let trayNoticeInfo = [];
        for(let i = 0; i < calls.length; i++) {
            let checkCall = calls[i];
            if(checkCall.state == "ringing") {
                let noticeType = "voice";
                if(checkCall && checkCall.type == "video") {
                    noticeType = "video";
                }
        
                let checkRoom = global.mxMatrixClientPeg.matrixClient.getRoom(checkCall.roomId);
                const distUserId = global.mxMatrixClientPeg.getDMMemberId(checkRoom);
                
                let profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(distUserId);
                let distUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
                if(!distUrl || (distUrl && distUrl == '')) {
                    distUrl = "./static/Img/User/user-40px@2x.png";
                }
                let showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
        
                let trayNoticeObj = {
                    unreadCount: 0,
                    imgUrl: distUrl,
                    chatName: showName,
                    roomId: checkRoom.roomId,
                    notictType: noticeType
                }   
                trayNoticeInfo[checkRoom.roomId + ":VoIP"] = trayNoticeObj;
            }
        }
        ipcRenderer.send("updateVoIPTrayNotice", trayNoticeInfo);
    }

    answerVoiceChat(room_id) {
        let call = global.mxMatrixClientPeg.getCall(room_id);
        if(call) {
            call.answer();
            let remoteAudio = document.getElementById("remoteAudio");
            call.setRemoteAudioElement(remoteAudio);
            this.updateTrayNotice();
        }
    }

}

export{
    mxVoIP
}