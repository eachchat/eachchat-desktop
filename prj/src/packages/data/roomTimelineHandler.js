import store from '../../renderer/store';
import * as Matrix from 'matrix-js-sdk';

class roomTimeLineHandler {
    constructor() {
        this._curChat = null;
        this._timelineSet = null;
        this._timelineWindow = null;
        this._lastTimelineNum = null;
    }

    static shareInstance() {
        if(!global.mxMatrixClientPeg.roomTimeLineHandler) global.mxMatrixClientPeg.roomTimeLineHandler = new roomTimeLineHandler();
        return global.mxMatrixClientPeg.roomTimeLineHandler;
    }

    isTimelineInvalid(timelines) {
        if(timelines[0] && timelines[0].event.room_id != this._curChat.roomId) {
            return true;
        }
        else {
            return false;
        }
    }

    async pageUp(distRoomId, num) {
        await this._timelineWindow.paginate("b", num);
        
        this._lastTimelineNum = this._curChat.timeline.length;
    }

    async pageDown(distRoomId, num) {
        await this._timelineWindow.paginate("f", num);
        
        this._lastTimelineNum = this._curChat.timeline.length;
    }

    async showPageUp(distRoomId, num) {
        let messageList = [];
        while((messageList.length == 0 || messageList.length < num) && this._timelineWindow.canPaginate('b')) {
            let newTimeline = [];
            await this.pageUp(distRoomId, 20);

            if(this.isTimelineInvalid(this._curChat.timeline)) {
                return null;
            }
            for(let i = 0; i < this._lastTimelineNum.length; i++){
                if(this.messageFilter(this._curChat.timeline[i])){
                    newTimeline.push(this._curChat.timeline[i]);
                }
            }
            messageList = [...newTimeline, ...messageList];
        }
        return messageList;
    }

    async showPageDown(distRoomId, num) {
        if(this._curChat && this._curChat.roomId != distRoomId) {
            return null;
        }
        let messageList = [];
        while(messageList.length == 0 && this._timelineWindow.canPaginate('f')) {
            let newTimeline = [];
            await this.pageDown(distRoomId, 20);

            if(this.isTimelineInvalid(this._curChat.timeline)) {
                return null;
            }

            for(let i = 0; i < this._lastTimelineNum.length; i++){
                if(this.messageFilter(this._curChat.timeline[i])){
                    newTimeline.push(this._curChat.timeline[i]);
                }
            }
            messageList = [...newTimeline, ...messageList];
        }
        return messageList;
    }

    messageFilter(event){
        if(['m.room.message', 'm.room.encrypted', 'm.room.create', 'm.call.hangup'].indexOf((event.event && event.event.type) ? event.event.type : event.getType()) >= 0) return true;
        return false;
    }

    /**
     * The room who wants to get timeline must init the timeline window and load first 
     */
    async _initTimeline() {
        this._timelineSet = this._curChat.getUnfilteredTimelineSet();
        this._timelineWindow = new Matrix.TimelineWindow(
            global.mxMatrixClientPeg.matrixClient, 
            this._timelineSet,
            {windowLimit:Number.MAX_VALUE},
        );
        this._timelineWindow.load(undefined, this._curChat.timeline.length);
        
        this._lastTimelineNum = this._curChat.timeline.length;
    }

    initRoomTimelineWindow(distRoomId) {
        this._curChat = global.mxMatrixClientPeg.matrixClient.getRoom(distRoomId);
        return this._initTimeline();
    }

    async getRoomShowTimeline(distChat) {
        console.log("getRoomShowTimeline ", distChat);
        this._curChat = distChat;
        let messageList = [];
        let sendingTxIds = store.getters.getSendingEventsTxnIds(this._curChat.roomId);
        
        for(let i = 0; i < this._curChat.timeline.length; i++){
            let exitEventIndex = this._curChat.timeline[i]._txnId ? sendingTxIds.indexOf(this._curChat.timeline[i]._txnId) : -1;
            if(exitEventIndex >= 0) {
                store.commit('removeSendingEvents', this._curChat.timeline[i]);
            }
            if(this.messageFilter(this._curChat.timeline[i])){
                messageList.push(this._curChat.timeline[i]);
            }
        }
        let sendingList = store.getters.getSendingEvents(this._curChat.roomId);
        for(let i=sendingList.length - 1; i > 0; i--){
            messageList.unshift(sendingList[i]);
        }
        if(messageList.length > 0) {
            console.log("messagelist is ", messageList);
            if(this.isTimelineInvalid(messageList)) {
                console.log("is valid");
                return null;
            }
            else {
                return messageList;
            }
        }
        else {
            //messageList is []
            console.log("1111111111");
            messageList = await this.showPageUp(10);
            if(!messageList) return null;
            if(this.isTimelineInvalid(messageList)) {
                return null;
            }
            else {
                return messageList;
            }
        }
    }
}


export{
    roomTimeLineHandler
}