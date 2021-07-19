import store from '../../renderer/store';
import * as Matrix from 'matrix-js-sdk';

class roomTimeLineHandler {
    constructor() {
        this._curChat = null;
        this._timelineSet = null;
        this._timelineWindow = null;
        this._lastTimelineNum = null;
        this._needInitTimelineWindow = true;
    }

    static shareInstance() {
        if(!global.mxMatrixClientPeg.roomTimeLineHandler) global.mxMatrixClientPeg.roomTimeLineHandler = new roomTimeLineHandler();
        return global.mxMatrixClientPeg.roomTimeLineHandler;
    }

    /**
     * To check the will show timeline is outdated
     * @param {Array} timelines to checked timeline
     * @returns Boolean
     */
    _isTimelineOutDated(timelines) {
        if(timelines) {
            if(timelines[0] && timelines[0].event.room_id != this._curChat.roomId) return true;
            else return false;
        }
        else {
            return false;
        }
    }

    /**
     * to check cur operate is outdated for the _curChat is a new one
     * @param {String} roomId 
     * @returns Boolean
     */
    _isOperateOutDated(roomId) {
        if(this._curChat && this._curChat.roomId != roomId) return true;
        else return false;
    }

    async _pageUp(num) {
        this._lastTimelineNum = this._curChat.timeline.length;
        console.log("++++ this._lastTimelineNum is ", this._lastTimelineNum);
        await this._timelineWindow.paginate("b", num);
    }

    async _pageDown(num) {
        this._lastTimelineNum = this._timelineWindow.getEvents().length;
        console.log("++++ this._lastTimelineNum is ", this._lastTimelineNum);
        await this._timelineWindow.paginate("f", num);
    }

    messageFilter(event){
        if(['m.room.message', 'm.room.encrypted', 'm.room.create', 'm.call.hangup'].indexOf((event.event && event.event.type) ? event.event.type : event.getType()) >= 0) return true;
        return false;
    }

    /**
     * The room who wants to get timeline must init the timeline window and load first 
     */
    _initTimeline() {
        this._timelineSet = this._curChat.getUnfilteredTimelineSet();
        this._timelineWindow = new Matrix.TimelineWindow(
            global.mxMatrixClientPeg.matrixClient, 
            this._timelineSet,
            {windowLimit:Number.MAX_VALUE},
        );
        this._timelineWindow.load(undefined, this._curChat.timeline.length);
        
        this._lastTimelineNum = this._curChat.timeline.length;
    }

    _initRoomTimelineWindow() {
        if(this._needInitTimelineWindow){
            this._initTimeline();
            this._needInitTimelineWindow = false;
        }
        return;
    }

    canLoadMore(distRoomId, direction) {
        if(this._isOperateOutDated(distRoomId)) return false;
        this._initRoomTimelineWindow();
        return this._timelineWindow.canPaginate(direction);
    }

    async getDistTimeLine(distChat, distEventId) {
        let distEvent = null;
        this._curChat = distChat;
        this._needInitTimelineWindow = true;
        this._initRoomTimelineWindow();
        await this._timelineWindow.load(distEventId, 1);
        distEvent = this._timelineWindow.getEvents();
        this._lastTimelineNum = 1;
        return distEvent;
    }

    async showPageUp(distRoomId, num) {
        if(this._isOperateOutDated(distRoomId)) return null;
        this._initRoomTimelineWindow();
        let messageList = [];
        while((messageList.length == 0 || messageList.length < num) && this._timelineWindow.canPaginate('b')) {
            let newTimeline = [];
            await this._pageUp(20);
            this._timelineWindow.getEvents();
            for(let i = 0; i < (this._curChat.timeline.length - this._lastTimelineNum); i++){
                if(this.messageFilter(this._curChat.timeline[i])){
                    newTimeline.push(this._curChat.timeline[i]);
                }
            }
            messageList = [...newTimeline, ...messageList];
        }
        if(this._isTimelineOutDated(messageList)) return null;
        return messageList;
    }

    async showPageDown(distRoomId, num) {
        if(this._isOperateOutDated(distRoomId)) return null;
        this._initRoomTimelineWindow();
        let messageList = [];
        while((messageList.length == 0 || messageList.length < num) && this._timelineWindow.canPaginate('f')) {
            let newTimeline = [];
            await this._pageDown(20);
            let allEvents = this._timelineWindow.getEvents();
            console.log("showPageDown this._lastTimelinnum is ", this._lastTimelineNum);
            for(let i = this._lastTimelineNum; i < allEvents.length; i++){
                if(this.messageFilter(allEvents[i])){
                    newTimeline.unshift(allEvents[i]);
                }
            }
            messageList = [...messageList, ...newTimeline];
            console.log("the messagelist is ", messageList.length);
        }
        if(this._isTimelineOutDated(messageList)) return null;
        return messageList;
    }
    async getRoomShowTimeline(distChat) {
        this._needInitTimelineWindow = true;
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
            if(this._isTimelineOutDated(messageList)) {
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
            if(this._isTimelineOutDated(messageList)) {
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