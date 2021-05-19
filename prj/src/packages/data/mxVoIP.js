import { ipcRenderer } from 'electron';
import Matrix from 'matrix-js-sdk';

class mxVoIP{
    constructor(){
        CALLING ='calling';
        CONNECTED = 'connected';
        CHATTING = 'chatting';
        INVITING = 'inviting';
        INVITE_SENT = 'invite_sent';
        ENDED = 'ended';
        BUSY = 'busy';
        callList = {
            //roomId: call
        },
        errorShow = null;
        stateShow = null;
        hangupShow = null;
    }
    
    _addCall(roomId, call) {
        this.callList[roomId] = call;
    }

    _removeCall(roomId) {
        try{
            delete this.callList[roomId];
        }
        catch(e) {

        }
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
            console.log("the calllist is ", this.callList);
            console.log("the call is ", this.callList[room_id]);
            if (!this.callList[room_id]) {
                return; // no call to hangup
            }
            this.callList[room_id].hangup();
        }
        catch(e) {
            console.log("to hang up err ", e);
        }
        this._removeCall(room_id);
        ipcRenderer.emit("close");
    }

    mute(room_id) {
        const distCall = this.callList[room_id];
        if(distCall != null) {
            distCall.setLocalVideoMuted(true);
        }
    }

    unMuted(room_id) {
        const distCall = this.callList[room_id];
        if(distCall != null) {
            distCall.setLocalVideoMuted(false);
        }
    }

    isMuted(room_id) {
        let isMuted = false;
        const distCall = this.callList[room_id];
        if(distCall != null) {
            isMuted = distCall.isLocalVideoMuted();
        }
        return isMuted;
    }

    voiceCall(room_id, hangUpCallback, errCallback, stateCallback){
        if(Object.keys(this.callList).indexOf(room_id) >= 0) {
            stateCallback(this.CHATTING);
        }
        const room = global.mxMatrixClientPeg.matrixClient.getRoom(room_id);
        if(!room) {
            console.log("err: voice call room not exist");
            return;
        }
        const call = Matrix.createNewMatrixCall(global.mxMatrixClientPeg.matrixClient, room_id);
        this._addCall(room_id, call);
        this.errorShow = errCallback;
        this.hangupShow = hangUpCallback;
        this.stateShow = stateCallback;
        this._callListeners(call);
        call.placeVoiceCall();
    }

    _callListeners(call){
        call.on("error", err => {
            this.errorShow(err);
        });
        call.on("hangup", () => {
            this.hangupShow();
        });
        call.on("state", (newState, oldState) => {
            console.log("update state new state is ", newState, " old state is ", oldState);
            if (newState === this.CHATTING) {
                this.stateShow(this.CHATTING);
            }
            else if (newState === this.CALLING) {
                this.stateShow(this.CALLING);
            } else if (newState === this.INVITE_SENT) {
                this.stateShow(this.INVITE_SENT);
            } else if (newState === this.ENDED && oldState === this.CONNECTED) {
                this.stateShow(this.ENDED);
            } else if (newState === this.ENDED && oldState === this.INVITE_SENT &&
                    (call.hangupParty === "remote" ||
                    (call.hangupParty === "local" && call.hangupReason === "invite_timeout")
                    )) {
                this.stateShow(this.BUSY);
            } else if (oldState === this.INVITE_SENT) {
                this.stateShow(this.CALLING);
            } else if (oldState === "ringing") {
                this.stateShow(this.CALLING);
            } else if (newState === "connected") {
                this.stateShow(this.CHATTING);
            } else {
                console.log("Final undeal state");
                // this.stateShow(this.CHATTING);
            }
        });
    }
}


export{
    mxVoIP
}