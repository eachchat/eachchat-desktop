<template>
    <div class="chat-msg-transmit" v-on:click="ShowMergeDetails()" :id="transmitMsgId()">
        <div class="transmit-title">{{transmitMsgTitle}}</div>
        <ul class="transmit-content">
            <li class="transmit-event" v-for="transmitEventContent in transmitEvents">{{transmitEventContent}}</li>
        </ul>
    </div>
</template>

<script>
import { ComponentUtil } from '../script/component-util.js';
import { ipcRenderer } from 'electron';
import { Message } from '../../packages/data/sqliteutil.js';
import { remote } from 'electron';
export default {
    name: 'Transmit',
    props: {
        Timeline: {
            type: Object,
            default: null
        },
    },
    data () {
        return {
            transmitMsgTitle: "",
            transmitEvents: [],
        }
    },
    methods: {
        ShowMergeDetails: async function(){
            var chatGroupMsgContent = this.Timeline.event.content ? this.Timeline.event.content : this.Timeline.getContent();
            var MsgList = chatGroupMsgContent.events;
            let showMsgList = await this.mergeDetails(MsgList);
            console.log("=====to show showMsgList ", showMsgList);
            let showMsgInfo = {
                title: this.transmitMsgTitle,
                list: showMsgList
            };
            let width = 615;
            let height = 508;
            if(remote.process.platform == "darwin") {
                height = 470;
                width = 600;
            }
            ipcRenderer.send("createChildWindow", 
                {
                    type: "TransmitMsgList",
                    size:
                        {
                            width:width,
                            height: height
                        },
                    transMsgInfo: showMsgInfo
                }
            )
        },
        mergeDetails: async function(Events) {
            let getDetails = [];
            for(let i = 0; i < Events.length; i++) {
                let curEvent = Events[i];
                let chatGroupMsgType = curEvent.type;
                let chatGroupMsgContent = curEvent.content;
                let curInfo = {};

                var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender);
                var userUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);

                if(chatGroupMsgType == "m.room.message") {
                    if(chatGroupMsgContent.msgtype == "m.image") {
                        let maxSize = 390;
                        let info = {
                            w: maxSize,
                            h: maxSize
                        };
                        if(chatGroupMsgContent.info)
                            info = chatGroupMsgContent.info
                        if(!info.h)
                            info.h = maxSize;
                        if(!info.w)
                            info.w = maxSize;

                        curInfo = {
                            msgtype: "m.image",
                            url: global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url),
                            event_id: curEvent.event_id,
                            info: info,
                            body: chatGroupMsgContent.body,
                            sender: (curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender,
                            senderName: await ComponentUtil.GetDisplayNameByMatrixID((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender),
                            senderUrl: userUrl,
                            origin_server_ts: curEvent.origin_server_ts
                        }
                    }
                    else if(chatGroupMsgContent.msgtype == "m.text") {
                        curInfo = {
                            msgtype: "m.text",
                            event_id: curEvent.event_id,
                            body: chatGroupMsgContent.body,
                            sender: (curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender,
                            senderName: await ComponentUtil.GetDisplayNameByMatrixID((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender),
                            senderUrl: userUrl,
                            origin_server_ts: curEvent.origin_server_ts
                        }
                    }
                    else if(chatGroupMsgContent.msgtype == "m.file") {
                        let msgs = await Message.FindMessageByMesssageID(curEvent.event_id);
                        let exitPath = "";
                        console.log(msgs)
                        if(msgs.length != 0 && msgs[0].file_local_path != "")
                            exitPath = msgs[0].file_local_path;
                        curInfo = {
                            exitPath: exitPath,
                            msgtype: "m.file",
                            url: global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url),
                            event_id: curEvent.event_id,
                            info: chatGroupMsgContent.info,
                            body: chatGroupMsgContent.body,
                            sender: (curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender,
                            senderName: await ComponentUtil.GetDisplayNameByMatrixID((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender),
                            senderUrl: userUrl,
                            origin_server_ts: curEvent.origin_server_ts
                        }
                    }
                    else if(chatGroupMsgContent.msgtype == "each.chat.merge") {
                        let mergeEvents = chatGroupMsgContent.events;
                        let showMergeEvents = await this.mergeDetails(mergeEvents);
                        curInfo = {
                            msgtype: "each.chat.merge",
                            event_id: curEvent.event_id,
                            events: showMergeEvents,
                            from_room_display_name: chatGroupMsgContent.from_room_display_name,
                            body: chatGroupMsgContent.body,
                            sender: (curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender,
                            senderName: await ComponentUtil.GetDisplayNameByMatrixID((curEvent.sender && curEvent.sender.userId) ? curEvent.sender.userId : curEvent.sender),
                            senderUrl: userUrl,
                            origin_server_ts: curEvent.origin_server_ts
                        }
                    }
                }
                getDetails.push(curInfo);
            }
            return getDetails;
        },
        getTransmitTitle: async function(chatGroupMsgContent) {
            console.log("getTransmitTitle chatGroupMsgContent ", chatGroupMsgContent);
            let fromRoomid = chatGroupMsgContent.from_room_id;
            let fromRoomDisplayName = chatGroupMsgContent.from_room_display_name;
            let fromUserId1 = chatGroupMsgContent.from_matrix_ids ? chatGroupMsgContent.from_matrix_ids[0] : undefined;
            let fromUserId2 = chatGroupMsgContent.from_matrix_ids ? chatGroupMsgContent.from_matrix_ids[1] : undefined;
            let fromRoom = global.mxMatrixClientPeg.matrixClient.getRoom(fromRoomid);
            if(fromRoom && global.mxMatrixClientPeg.DMCheck(fromRoom) && fromUserId1 && fromUserId2) {
                let fromUserName1 = await ComponentUtil.GetDisplayNameByMatrixID(fromUserId1);
                let fromUserName2 = await ComponentUtil.GetDisplayNameByMatrixID(fromUserId2);
                this.transmitMsgTitle = fromUserName1 + "与" + fromUserName2 + "的聊天记录";
            }
            else {
                this.transmitMsgTitle = "群聊的聊天记录";//fromRoomDisplayName;
            }
        },
        getTransmitContent: async function(events) {
            for(let i=0;i<events.length;i++) {
                let chatGroupMsgType = events[i].type;
                var chatGroupMsgContent = events[i].content ? events[i].content : events[i].getContent();
                var fromUserName = await ComponentUtil.GetDisplayNameByMatrixID(((events[i].sender && events[i].sender.userId) ? events[i].sender.userId : events[i].sender));
                if(chatGroupMsgType === "m.room.message")
                {
                    if(chatGroupMsgContent.msgtype == 'm.file'){
                        let content = fromUserName + ":[文件]";
                        this.transmitEvents.push(content);
                    }
                    else if(chatGroupMsgContent.msgtype == 'm.text'){
                        let content = fromUserName + ":" + chatGroupMsgContent.body;
                        this.transmitEvents.push(content);
                    }
                    else if(chatGroupMsgContent.msgtype == 'm.image'){
                        let content = fromUserName + ":[图片]";
                        this.transmitEvents.push(content);
                    }
                    else if(chatGroupMsgContent.msgtype == 'm.audio'){
                        let content = fromUserName + ":[语音]";
                        this.transmitEvents.push(content);
                    }
                    else if(chatGroupMsgContent.msgtype == "each.chat.merge") {
                        let content = fromUserName + ":[聊天记录]";
                        this.transmitEvents.push(content);
                    }
                    else {
                        let content = fromUserName + ":[无法识别的消息类型]";
                        this.transmitEvents.push(content);
                    }
                }
                if(i == 3) {
                    break;
                }
            }

        },
        transmitMsgId: function() {
            if(!this.Timeline) return "";
            return "message-transmit-" + this.Timeline.event.event_id;
        },
    },
    watch: {
        Timeline: async function() {
            if(!this.Timeline) return;
            setTimeout(() => {
                this.$nextTick(() => {
                    let chatGroupMsgContent = this.Timeline.event.content ? this.Timeline.event.content : this.Timeline.getContent();
                    let events = chatGroupMsgContent.events;
                    let distElement = document.getElementById(this.transmitMsgId());
                    if(events.length >= 4) {
                        distElement.style.height = "97px";
                    }
                    else if(events.length == 3) {
                        distElement.style.height = "85px";
                    }
                    else if(events.length == 2) {
                        distElement.style.height = "73px";
                    }
                    else if(events.length == 1) {
                        distElement.style.height = "61px";
                    }
                    this.getTransmitTitle(chatGroupMsgContent);
                    this.getTransmitContent(events);
                })
            }, 0);
        }
    }
}
</script>

<style lang="scss" scoped>
    .chat-msg-transmi {
        float:left;
        background-color: rgba(255, 255, 255, 1);
        width: 243px;
        height: 97px;
        border-radius: 5px;
        padding: 7px 12px 7px 12px;
        font-size: 14px;
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .transmit-title {
        display: block;
        background-color: rgba(255, 255, 255, 1);
        max-width: 260px;
        min-width: 20px;
        border: 0px solid rgba(221, 221, 221, 1);
        padding-bottom: 3px;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        font-weight: 400;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    
    .transmit-content {
        display: block;
        background-color: rgba(255, 255, 255, 1);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding-top: 3px;
        padding-left: 0;
        font-size: 12px;
        font-weight: 400;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        letter-spacing: 0px;
        line-height: 18px;
        color:rgba(153, 153, 153, 1);
    }

    .transmit-event {
        display: block;
        background-color: rgba(255, 255, 255, 1);
        width: 100%;
        height: 18px;
        border-radius: 5px;
        font-size: 12px;
        font-weight: 400;
        font-family: 'PingFangSC-Regular';
        text-align: left;
        margin: 0px;
        white-space: nowrap;
        text-overflow: ellipsis;
        letter-spacing: 0px;
        line-height: 18px;
        overflow: hidden;
        color:rgba(153, 153, 153, 1);
    }
</style>