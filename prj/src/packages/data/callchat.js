import * as Matrix from 'matrix-js-sdk';


const audioPromises = {};
const calls = {};

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
    calls[roomId] = call;

    if (status === "ringing") {
        play("ringAudio");
    } else if (call && call.call_state === "ringing") {
        pause("ringAudio");
    }

    if (call) {
        call.call_state = status;
    }
}

function _setCallListeners(call) {
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
            pause("ringbackAudio");
        }
    });
}



class CallChat{
    constructor(){
        this.matrixClient = null;
    }

    async createMatrix(){
        var host = "";
        host = window.localStorage.getItem("mx_hs_url");
        if(host.indexOf("https://") < 0 && host.indexOf("http://") < 0) {
            host = "https://" + host;
        }
        global.mxMatrixClientPeg.CreateClient(host)
        await global.mxMatrixClientPeg.restoreFromLocalStorage();
        let ops = {
        }
        ops.pendingEventOrdering = "detached";
        ops.lazyLoadMembers = true;
        return global.mxMatrixClientPeg.matrixClient.startClient(ops);
    }

    syncComplete(roomInfo){
        let bSupportVoip = this.matrixClient.supportsVoip();
        console.log("support voip", bSupportVoip)
        this.call = Matrix.createNewMatrixCall(this.matrixClient, roomInfo.roomID);
        let largeWindow = document.getElementById("large-window");
        let smallWindow = document.getElementById("small-window");
        let videoElm = document.getElementById("audio-window");
        //let largeWindow = document.getElementById("large-window");
        //let smallWindow = document.getElementById("remoteAudio");
        _setCallListeners(this.call);
        this.call.placeVideoCall(largeWindow, smallWindow);
        //this.call.setLocalVideoElement(smallWindow);
        //this.call.setRemoteVideoElement(largeWindow);
        //this.call.setRemoteAudioElement(videoElm);
        //this.call.placeVideoCall();
    }

    async createVideoChat(roomInfo){
        console.log(roomInfo);
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
        //await this.matrixClient.startClient();
        this.syncComplete(roomInfo);
    }
}

export{
    CallChat
}