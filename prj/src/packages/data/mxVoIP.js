import { ipcRenderer } from 'electron';
import Matrix from 'matrix-js-sdk';

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
        console.error("Call error:", err);
    });
    call.on("hangup", function() {
        _setCallState(undefined, call.roomId, "ended");
    });
    // map web rtc states to dummy UI state
    // ringing|ringback|connected|ended|busy|stop_ringback|stop_ringing
    call.on("state", function(newState, oldState) {
        console.log(newState, oldState)
        if (newState === "ringing") {
            _setCallState(call, call.roomId, "ringing");
            pause("ringbackAudio");
        } else if (newState === "invite_sent") {
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
            videoCall.showSmallWindow();
            videoCall.hideStateText();
            pause("ringbackAudio");
        }
    });
}

class mxVoIP{
    constructor(){
        this.CALLING ='calling';
        this.CONNECTED = 'connected';
        this.CHATTING = 'chatting';
        this.INVITING = 'inviting';
        this.INVITE_SENT = 'invite_sent';
        this.ENDED = 'ended';
        this.BUSY = 'busy';
        this.errorShow = null;
        this.stateShow = null;
        this.hangupShow = null;
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
        this.callListeners(call);
        call.placeVoiceCall();
        let largeWindow = document.getElementById("large-window");
        let smallWindow = document.getElementById("small-window");
        let remoteAudio = document.getElementById("remoteAudio");
        call.setLocalVideoElement(smallWindow);
        call.setRemoteVideoElement(largeWindow);
        call.setRemoteAudioElement(remoteAudio);
    }

    setVoiceCallback(hangUpCallback, errCallback, stateCallback) {
        this.errorShow = errCallback;
        this.hangupShow = hangUpCallback;
        this.stateShow = stateCallback;
    }

    callListeners(call){
        call.on("error", err => {
            this.errorShow(err);
        });
        call.on("hangup", () => {
            console.log("call is ", call);
            console.log("====to hangup and call state is ", call.call_state);
            this.hangupShow();
        });
        call.on("state", (newState, oldState) => {
            console.log("update state new state is ", newState, " old state is ", oldState);
            if (newState === this.CHATTING) {
                // this.stateShow(this.CHATTING);
            }
            else if (newState === this.CALLING) {
                console.log("====to this.CALLING and call state is ", call.call_state);
                this.stateShow(this.CALLING);
                pause("ringbackAudio");
            } else if (newState === this.INVITE_SENT) {
                console.log("====to this.INVITE_SENT and call state is ", call.call_state);
                this.stateShow(this.INVITE_SENT);
                play("ringbackAudio");
            } else if (newState === this.ENDED && oldState === this.CONNECTED) {
                console.log("====to this.ENDED and CONNECTED and call state is ", call.call_state);
                this.stateShow(this.ENDED);
                global.mxMatrixClientPeg.removeCall(room_id);
                pause("ringbackAudio");
                play("callendAudio");
            } else if (newState === this.ENDED && oldState === this.INVITE_SENT &&
                    (call.hangupParty === "remote" ||
                    (call.hangupParty === "local" && call.hangupReason === "invite_timeout")
                    )) {
                console.log("====to this.hanguped and call state is ", call.call_state);
                this.stateShow(this.BUSY);
                global.mxMatrixClientPeg.removeCall(room_id);
                pause("ringbackAudio");
                play("busyAudio");
            } else if (oldState === this.INVITE_SENT) {
                this.stateShow(this.CALLING);
                pause("ringbackAudio");
            } else if (oldState === "ringing") {
                this.stateShow(this.CALLING);
                pause("ringbackAudio");
            } else if (newState === "connected") {
                this.stateShow(this.CHATTING);
                pause("ringbackAudio");
            } else {
                console.log("Final undeal state");
                // this.stateShow(this.CHATTING);
            }
        });
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
}

export{
    mxVoIP
}