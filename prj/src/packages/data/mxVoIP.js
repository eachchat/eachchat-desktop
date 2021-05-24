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
        }
        else{
            console.log("call is ", call);
            console.log("====to hangup and call state is ", call.call_state);
            videoCall.hangUpCallback();
        }
    });
    // map web rtc states to dummy UI state
    // ringing|ringback|connected|ended|busy|stop_ringback|stop_ringing
    call.on("state", function(newState, oldState) {
        console.log(newState, oldState)
        if (newState === "ringing") {
            _setCallState(call, call.roomId, "ringing");
            pause("ringbackAudio");
        } else if (newState === "calling") {
            console.log("====to this.CALLING and call state is ", call.call_state);
            videoCall.stateCallback("calling");
            pause("ringbackAudio");
        } 
        else if (newState === "invite_sent") {
            if(call.type === "video"){
                _setCallState(call, call.roomId, "ringback");
            }
            else{
                videoCall.stateCallback("invite_sent");
            }
            play("ringbackAudio");
            
        } else if (newState === "ended" && oldState === "connected") {
            if(call.type === "video"){
                _setCallState(undefined, call.roomId, "ended");
            }
            else{
                console.log("====to this.ENDED and CONNECTED and call state is ", call.call_state);
                videoCall.stateCallback("ended");
                global.mxMatrixClientPeg.removeCall(room_id);
            }
            pause("ringbackAudio");
            play("callendAudio");
            
        } else if (newState === "ended" && oldState === "invite_sent" &&
                (call.hangupParty === "remote" ||
                (call.hangupParty === "local" && call.hangupReason === "invite_timeout")
                )) {
            if(call.type === "video"){
                _setCallState(call, call.roomId, "busy");
            }
            else{
                console.log("====to this.hanguped and call state is ", call.call_state);
                videoCall.stateCallback("busy");
                global.mxMatrixClientPeg.removeCall(room_id);
            }
            pause("ringbackAudio");
            play("busyAudio");
            
            console.error("The remote side failed to pick up");
        } else if (oldState === "invite_sent") {
            if(call.type === "video"){
                _setCallState(call, call.roomId, "stop_ringback");
            }
            else{
                videoCall.stateCallback("calling");
            }
            pause("ringbackAudio");    
        } else if (oldState === "ringing") {
            if(call.type === "video"){
                _setCallState(call, call.roomId, "stop_ringing");
            }
            else{
                videoCall.stateCallback("calling");
            }
            pause("ringbackAudio");
        } else if (newState === "connected") {
            if(call.type === "video"){
                _setCallState(call, call.roomId, "connected");
                videoCall.showSmallWindow();
                videoCall.hideStateText();
            }
            else{
                videoCall.stateCallback("chatting");
            }
            pause("ringbackAudio");
        }else {
            console.log("Final undeal state");
        }
    });
}

class mxVoIP{
    constructor(){
        this.CALLING ='calling';
        this.CONNECTED = 'connected';
        this.CHATTING = 'chatting';
        this.INVITING = 'inviting';
        this.ENDED = 'ended';
        this.BUSY = 'busy';
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
            ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
                size:{width:300,height: 480},
                        roomInfo: { roomID: call.roomId,
                                    name: showName,
                                    url:distUrl,
                                    voipType: "video",
                                    direction: "from"}});
        }
        else{
            _setVideoCallListeners(call, global.viopChat.voicechat);
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
    }

    mute(room_id) {
        let distCall = global.mxMatrixClientPeg.getCall(room_id);
        if (distCall) {
            distCall.setLocalVideoMuted(true);
        }
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

    unMuted(room_id) {
        let distCall = global.mxMatrixClientPeg.getCall(room_id);
        if (distCall) {
            distCall.setLocalVideoMuted(false);
        }
    }

    isMuted(room_id) {
        let isMuted = false;
        let distCall = global.mxMatrixClientPeg.getCall(room_id);
        if (distCall) {
            isMuted = distCall.isLocalVideoMuted();
        }
        return isMuted;
    }

    voiceAnswer(room_id) {
        if(global.mxMatrixClientPeg.getCall(room_id)) {
            console.log("====to answer and call is ", global.mxMatrixClientPeg.getCall(room_id));
            let call = global.mxMatrixClientPeg.getCall(room_id);
            call.answer();
            let largeWindow = document.getElementById("large-window");
            let smallWindow = document.getElementById("small-window");
            let remoteAudio = document.getElementById("remoteAudio");
            call.setLocalVideoElement(smallWindow);
            call.setRemoteVideoElement(largeWindow);
            call.setRemoteAudioElement(remoteAudio);
            console.log("====to answer and call state is ", global.mxMatrixClientPeg.getCall(room_id).call_state);
        }
    }

    voiceCall(room_id){
        if(global.mxMatrixClientPeg.getCall(room_id)) {
            stateCallback(this.CHATTING);
            return;
        }
        const room = global.mxMatrixClientPeg.matrixClient.getRoom(room_id);
        if(!room) {
            console.log("err: voice call room not exist");
            return;
        }
        const call = Matrix.createNewMatrixCall(global.mxMatrixClientPeg.matrixClient, room_id);
        console.log("====to create call is ", call);
        console.log("====to create call state is ", call.state);
        global.mxMatrixClientPeg.addCall(room_id, call);
        _setVideoCallListeners(call, global.viopChat.voicechat),
        call.placeVoiceCall();
        let largeWindow = document.getElementById("large-window");
        let smallWindow = document.getElementById("small-window");
        let remoteAudio = document.getElementById("remoteAudio");
        call.setLocalVideoElement(smallWindow);
        call.setRemoteVideoElement(largeWindow);
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
    }
}

export{
    mxVoIP
}