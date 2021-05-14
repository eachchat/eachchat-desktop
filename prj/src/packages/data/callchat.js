

class CallChat{
    constructor(){
        this.matrixClient = null;
    }

    createMatrix(){
        global.mxMatrixClientPeg.restoreFromLocalStorage().then(async (ret) => {
            console.log(ret)
        })
    }

    placeCall(call) {
        console.log(call)
        call.on("hangup", function() {
            console.log("hangup")
        });
        call.on("error", function(err) {
            console.log("error", err)
        });
    }

    createVideoChat(){
        console.log(this.chat);
        let client = global.mxMatrixClientPeg.matrixClient;
        let bSupportVoip = client.supportsVoip();
        console.log("support voip", bSupportVoip)
        const call = Matrix.createNewMatrixCall(client, this.chat.roomId);
        this.placeCall(call);
        call.placeVideoCall(
            document.getElementById("message-show-list"),
            document.getElementById("chatQuillEditorId")
        );
    }
}

export{
    CallChat
}