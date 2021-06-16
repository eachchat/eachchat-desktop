const callingState = {
    state : "",

    setCallingState(args){
        this.state = args;
        console.log("setCallingState", this.state);
    },

    calling(){
        console.log("getCallingState", this.state);
        return this.state === 'busy'
    }
}


export{
    callingState
}