import { ipcRenderer } from 'electron';
import Matrix from 'matrix-js-sdk';
import {ComponentUtil} from '../../renderer/script/component-util.js';
import log from 'electron-log';


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
    // console.log(
    //     `Call state in ${roomId} changed to ${status} (${call ? call.call_state : "-"})`,
    // );
    console.log("======= add call ", roomId);
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

async function updateTrayNotice() {
    let calls = global.mxMatrixClientPeg.getCall();
    let trayNoticeInfo = {};

    console.log("===== calls is ", calls);
    for(var k in calls) {
        let checkCall = calls[k];
        console.log("updateTrayNotice ", checkCall);
        if(checkCall && checkCall.state && checkCall.state == "ringing") {
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
                notictType: noticeType,
                callStat: checkCall.state
            }   
            trayNoticeInfo[checkRoom.roomId + ":VoIP"] = trayNoticeObj;
        }
    }
    ipcRenderer.send("updateVoIPTrayNotice", trayNoticeInfo);
}

function _setVideoCallListeners(call, videoCall) {
    call.on("error", function(err) {
        console.error("Call error:", err);
        log.info("Call error:", err)
    });
    call.on("hangup", function() {
        console.log("======= hangup ", updateTrayNotice);
        log.info("======= hangup callid:", call.roomId)
        updateTrayNotice();
        videoCall.afterCallState();
        _setCallState(undefined, call.roomId, "ended");
    });
    // map web rtc states to dummy UI state
    // ringing|ringback|connected|ended|busy|stop_ringback|stop_ringing
    call.on("state", function(newState, oldState) {
        console.log("=========== callId is ", call.roomId, " newstate is ", newState, " oldstate is ", oldState)
        log.info("=========== callId is ", call.roomId, " newstate is ", newState, " oldstate is ", oldState)
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
            videoCall.connectedState(call.type);
            pause("ringbackAudio");
            console.log("================connected ", updateTrayNotice);
            updateTrayNotice();
        }else {
            console.log("Final undeal state");
        }
    });
}

class mxVoIP{
    constructor(){
        this.videochat = null;
    }

    setVideoChat(videochat){
        this.videochat = videochat;
    }

    async createMatrix(){
        let checkHomeServer = async (domain, gmshost) => {
            if(domain == "") {
                backToLogin();
            }
            
            var gmsRet = await global.services.common.newGmsConfiguration(domain, gmshost);
            var host = window.localStorage.getItem("mx_hs_url");
            if(host == null) {
                backToLogin();
            }
            await global.mxMatrixClientPeg.getAppServerInfo(host);;
            var appserver = window.localStorage.getItem("app_server");
            var loginSettingRet = await global.services.common.getLoginConfig(appserver);

        }
        
        var domain = window.localStorage.getItem("Domain");
        let gmsHost = window.localStorage.getItem("gms_host");

        await checkHomeServer(domain, gmsHost);
        
        await global.mxMatrixClientPeg.restoreFromLocalStorage();
        
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
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
        console.log("=======inconing call ", call);
        let isCalling = false;

        let calls = global.mxMatrixClientPeg.getCall();

        for(var k in calls) {
            let checkCall = calls[k];
            console.log("updateTrayNotice ", checkCall);
            if(checkCall && checkCall.state && checkCall.state != "ended") {
                isCalling = true;
                break;
            }
        }
        
        if(isCalling) {
            // I am busy now.
            console.log("to hangup call room id ", call.roomId);
            call.hangup(call.roomId);
            console.log("hanguped ", call.roomId);
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
        if(!distUrl || (distUrl && distUrl == '')) {
            distUrl = "./static/Img/User/user-40px@2x.png";
        }
        let showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);

        if(noticeType === 'video'){
            _setVideoCallListeners(call, global.viopChat.videochat);
            _setCallState(call, call.roomId, "ringing");
            let trayNoticeObj = {
                unreadCount:0,
                imgUrl: distUrl,
                chatName: showName,
                roomId: checkRoom.roomId,
                notictType: noticeType
            }   
            let trayNoticeInfo = {};
            trayNoticeInfo[checkRoom.roomId + ":VoIP"] = trayNoticeObj;
            console.log("====ru show notice ");
            ipcRenderer.send("updateVoIPTrayNotice", trayNoticeInfo);
        }
        else{
            _setVideoCallListeners(call, global.viopChat.videochat);
            _setCallState(call, call.roomId, "ringing");
            let trayNoticeObj = {
                unreadCount:0,
                imgUrl: distUrl,
                chatName: showName,
                roomId: checkRoom.roomId,
                notictType: noticeType
            }   
            let trayNoticeInfo = {};
            trayNoticeInfo[checkRoom.roomId + ":VoIP"] = trayNoticeObj;
            console.log("====ru show notice ");
            ipcRenderer.send("updateVoIPTrayNotice", trayNoticeInfo);
        }
    }

    hangUp(room_id, time) {
        if (room_id && global.mxMatrixClientPeg.getCall(room_id)) {
            console.log("====to hangup and call is ", global.mxMatrixClientPeg.getCall(room_id));
            global.mxMatrixClientPeg.getCall(room_id).setDurationTime(time);
            global.mxMatrixClientPeg.getCall(room_id).hangup();
            global.mxMatrixClientPeg.removeCall(room_id);
        }
        ipcRenderer.emit("close");
        updateTrayNotice();
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
        _setVideoCallListeners(call, global.viopChat.videochat);
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
        updateTrayNotice();
    }

    answerVoiceChat(room_id) {
        let call = global.mxMatrixClientPeg.getCall(room_id);
        if(call) {
            call.answer();
            let largeWindow = document.getElementById("large-window");
            let smallWindow = document.getElementById("small-window");
            let remoteAudio = document.getElementById("remoteAudio");
            call.setLocalVideoElement(smallWindow);
            call.setRemoteVideoElement(largeWindow);
            call.setRemoteAudioElement(remoteAudio);
            updateTrayNotice();
        }
    }

}

export{
    mxVoIP
}