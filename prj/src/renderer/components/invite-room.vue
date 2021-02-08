<template>
    <el-container>
        <el-header height="56px" class="contact-header">
            <p class="contact-header-title">群聊</p>
        </el-header>
        <el-main  style="overflow: hidden">
            <el-container class="bottom-container" id="contact-main-container">
                <div class="contact-view">
                    <ul class="managers-list" :key = 'updateRoomList'>
                        <li class="manager"
                            v-for="(item, index) in roomList"
                            :key="index"
                            @contextmenu="rightBtnClick(item)">
                            <img ondragstart="return false" class="manager-icon"  :src="item.avatar_url"
                            @click = 'roomMenuItemClicked(item)'>
                            <div class="department-info" @click = 'roomMenuItemClicked(item)'>
                                <p class="group-name">{{ item.name }}</p>
                                <p class="group-content-invite">{{ item.inviteName }}</p>
                            </div>  
                            <div v-if = 'item.roomState == 0' class = 'invite-room-button-div'>
                                <button  class="invite-room-disable-button" @click="HandleReject(item)">拒绝</button>
                                <button class="invite-room-button" @click="HandleAccept(item)">接受</button>
                            </div>
                            <p v-else-if = 'item.roomState == 1' class = 'invite-room-context'>已拒绝</p>
                            <p v-else-if = 'item.roomState == 2' class = 'invite-room-context'>已接受</p>
                        </li>
                    </ul>
                </div>
            </el-container>
        </el-main>
    </el-container>
</template>
<script>

import {ComponentUtil} from '../script/component-util.js';
import "../style/contact-list.css"
import log from 'electron-log'
import {remote} from 'electron'
import * as Rooms from "../../packages/data/Rooms";
const {Menu, MenuItem} = remote;

export default {
    name: 'roomList',
    components: {
    },
    data () {
        return {
            roomList: [],
            updateRoomList: 0,
            showAlertDlg: false,
            alertContents : null,
            deleteContact: null,
        }
    },
    props:{
        parentInfo: {
            type:Object
        }
    },
    computed: {                      

    },

    watch:{
        '$store.state.inviteRoomsNum': function () {
            this.updateRoomInfo();
        },
        '$store.state.nUpdateInviteRoom': function () {
            this.roomList.length = 0;
            this.createRoomInfo();
        }  
    },

    methods: {
        rightBtnClick(room){
            if(room.roomState === 0)
                return;
            this.menu = new Menu();
            this.menu.append(new MenuItem({
                label: "删除",
                click: () => {
                    this.deleteRoom(room)
                }
            })); 
            this.menu.popup(remote.getCurrentWindow());
        },

        deleteRoom(room){
            for(let index in this.roomList){
                if(room.roomID == this.roomList[index].roomID){
                    this.roomList.splice(index, 1);
                    this.$store.commit('deleteInviteRooms', room.roomID);
                    return;
                }
            }
        },

        ToJoinRoom: function(roomId) {
            try{
                var distRoom = global.mxMatrixClientPeg.matrixClient.getRoom(roomId);
                if(global.mxMatrixClientPeg.isDMInvite(distRoom)) {
                    Rooms.setDMRoom(roomId, global.mxMatrixClientPeg.matrixClient.getUserId());
                }
                global.mxMatrixClientPeg.matrixClient.joinRoom(roomId, {inviteSignUrl: undefined, viaServers: undefined})
                .then(() => {
                    // this.isRefreshing = true;
                    setTimeout(() => {
                        //this.JoinRoom(roomId);
                    }, 500)
                })
                .catch((error) => {
                    console.log("========join failed and err is ", error.error);
                    if(error.httpStatus == 403) {
                        this.$toastMessage({message:"您没有权限进入该房间", time: 2000, type:'error', showHeight: '80px'});
                    }
                    else if(error.httpStatus == 429) {
                        this.$toastMessage({message:"您的请求次数过多，请稍后再试", time: 2000, type:'error', showHeight: '80px'});
                    }
                    else if(error.httpStatus == 404) {
                        this.$toastMessage({message:"该邀请人已退出群组，不可加入", time: 2000, type:'error', showHeight: '80px'});
                        this.RejectRoom(roomId);
                    }
                })
            }
            catch(e){
                console.log(e)
            }    
        },
        RejectRoom: function(roomId) {
            global.mxMatrixClientPeg.matrixClient.leave(roomId);
        },
        HandleReject(room){
            this.UpdateRoomState(room.roomID, 1);
            this.RejectRoom(room.roomID);
        },

        HandleAccept(room){
            this.UpdateRoomState(room.roomID, 2)
            this.ToJoinRoom(room.roomID);
        },

        UpdateRoomState(roomID, state){
            this.$store.commit("updateInviteState", {roomID : roomID, roomState : state});
            for(let index in this.roomList){
                if(this.roomList[index].roomID == roomID){
                    this.roomList[index].roomState = state;
                    return;
                } 
            }
        },

        roomMenuItemClicked:function(room) {
            if(room.roomState != 2)
                return
            this.$router.push(
                {
                    name: 'ChatContent', 
                    params: {
                        group_id: room.roomID
                    }
                })
        },

        async getShowInviteMsgContent(chatGroupItem) {
            if(chatGroupItem.timeline && chatGroupItem.timeline.length == 0){
                if(chatGroupItem.getMyMembership() == "invite") {
                    var inviteMemer = this._getInviteMember(chatGroupItem);
                    if(global.mxMatrixClientPeg.isDMInvite(chatGroupItem)) {
                        return "";//inviteMemer.userId;
                    }
                    else {
                        return "由" + await ComponentUtil.GetDisplayNameByMatrixID(inviteMemer.userId)  + "邀请";
                    }
                }
            };
        },

        _getInviteMember: function(chatGroupItem) {
            if (!chatGroupItem) {
                return;
            }
            const myUserId = global.mxMatrixClientPeg.matrixClient.getUserId();
            const inviteEvent = chatGroupItem.currentState.getMember(myUserId);
            if (!inviteEvent) {
                return;
            }
            const inviterUserId = inviteEvent.events.member.getSender();
            // var inviterName = ComponentUtil.GetDisplayNameByMatrixID(inviterUserId);
            return chatGroupItem.currentState.getMember(inviterUserId);
        },

        async updateRoomInfo(){
            for(let item of this.$store.state.inviteRooms){
                let roomInfo = await this.getRoomInfo(item);
                if(!roomInfo) continue;
                if(roomInfo.roomState === 0 && this.roomList.every(curitem => curitem.roomID != item.roomID)){
                    console.log('roomList', roomInfo)
                    this.roomList.unshift(roomInfo);
                    this.updateRoomList++;
                } 
            }
        },

        async getRoomInfo(item){
            let roomInfo = {};
            let room = this.matrixClient.getRoom(item.roomID);
            if(!room || room.getMyMembership() == 'leave'){
                return;
            } 
            roomInfo.roomID = item.roomID;
            roomInfo.roomState = item.roomState;
            roomInfo.name = room.name;
            var RoomAvatar = room.getAvatarUrl(this.matrixClient.getHomeserverUrl(), null, null, undefined, false);
            log.info('invite-room RoomAvatar', RoomAvatar);
            if(!RoomAvatar) 
                roomInfo.avatar_url = './static/Img/User/group-40px@2x.png';
            else 
                roomInfo.avatar_url = RoomAvatar;
            roomInfo.inviteName = await this.getShowInviteMsgContent(room);
            
            if(global.mxMatrixClientPeg.isDMInvite(room) || global.mxMatrixClientPeg.DMCheck(room)){
                roomInfo.avatar_url = './static/Img/User/user-40px@2x.png';
                var myMember = global.mxMatrixClientPeg.getMyMember(room);
                let directMember = myMember.getDMInviter();
                roomInfo.name = await ComponentUtil.GetDisplayNameByMatrixID(directMember)
            }
            return roomInfo;
        },

        async createRoomInfo(){
            for(let item of this.$store.state.inviteRooms){
                let roomInfo = await this.getRoomInfo(item)
                if(roomInfo) this.roomList.push(roomInfo);
            } 
        }
    },
    created: function() {
        this.services = global.services.common;
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
        this.myUserId = window.localStorage.getItem("mx_user_id");
        this.createRoomInfo();
    }
}
</script>
<style lang="scss" scoped>
    ::-webkit-scrollbar-track-piece {
        background-color: #F1F1F1;
        border-radius: 10px;
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-thumb {
        height: 50px;
        background-color: #C1C1C1;
        border-radius: 10px;
        outline: none;
    }

    ::-webkit-scrollbar-thumb:hover {
        height: 50px;
        background-color: #A8A8A8;
        border-radius: 10px;
    }

.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    margin-left: 12px;
}

.group-name {
    display: inline-block;
    height: 20px;
    font-size: 14px;
    font-weight: 500;
    font-family:PingFangSC-Medium;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 11px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.group-content-invite {
    font-size: 12px;
    font-weight:400;
    color: rgba(153, 153, 153, 1);
    overflow: hidden;
    font-family:PingFangSC-Regular;
    margin-top: -1px;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 18px;
}


.chat-tool-invite-div {
    display: inline-block;
    text-align:center;
    vertical-align:middle;
    margin-top: 25px;
    float: right;
    width: 50px;
    height: 30px;
}

.contact-header {
    display: float;
    width: 100%;
    height: 56px;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(238, 238, 238);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
    //-webkit-app-region: drag;
    // * {            
    //     -webkit-app-region: no-drag;
    // }
    
}

.show-contact-list-info{
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 105px);
}

.contact-header-title{
    display: inline-block;
    float: left;
    width:50%;
    height:20px;
    font-size:14px;
    font-weight:500;
    color:rgba(0,0,0,1);
    line-height:20px;
    padding-left: 16px;
    margin-top: 18px;
    margin-bottom: 18px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
}
.contact-list {
    overflow: scroll;
    list-style: none;
    height: 100%;
    width: 100%;
    padding: 0px;
    margin: 0px;
    .contact {
        display: inline-block;
        width: 280px;
        padding: 0px;
    }
}

.contact-view {
    width: 100%;
    height: 100%;
    //display: flex;
    flex-direction: column;
    border-left: 0.5px solid rgb(221, 221, 221);
    //border-right: 1px solid rgb(221, 221, 221);
    overflow-y: scroll;
    overflow-x: hidden;
    // ::-webkit-scrollbar-track {
    //     border-radius: 10px;
    // }
    margin: 0px;
    cursor: pointer;
}


.managers-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
}
.departments-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    //border-top: 1px solid rgb(221, 221, 221);
}
.department {
    height: 60px;
    //border-bottom: 1px solid rgb(221, 221, 221);
    
}
.department:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}
.manager {
    height: 60px;
}
.manager:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}

.manager-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
    border-radius: 4px;
    border-radius: 50%;
}

.delete-button{
    display: inline-block;
    margin-top: 10px;
    margin-bottom: 10px;
    vertical-align: top;
    background: white;
    border-radius:4px;
    border:1px solid rgba(221,221,221,1);
    font-family: PingFangSC-Regular;
}

.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 6.5px;
    margin-top: 23.5px;
    margin-bottom: 23.5px;
    margin-right: 0px;
    margin-bottom: 0px;
    width: 7px;
    height: 13px;
}

.el-container {
    width: 100%;
    height: 100%;
    border: hidden;
    .el-header {
        padding: 0px;
    }
    .el-breadcrumb {
        display: block;
        margin-left: 16px;
        padding-top: 16px;
        font-size: 14px;
        line-height: 20px;
        padding-left: 0px;
    } 
    .el-main {
        width: auto;
        height: 100%;
        overflow: scroll;
        padding: 0px;
    }
    .avatarTUrl {
        width:40px;
        height: 40px;
    }
}

.invite-room-button-div{
    display: inline-block;
    margin-top: 15px;
    margin-right: 16px;
    vertical-align: top;
    float: right;
}


.invite-room-button{
    display: inline-block;
    width: 72px;
    height: 28px;
    background: rgba(0, 169, 113, 1); 
    color: #FFFFFF;
    border-radius:4px;
    border:1px solid rgba(221,221,221,1);
    font-family: PingFangSC-Regular;
}

.invite-room-disable-button{
    display: inline-block;
    width: 72px;
    height: 28px;
    background: #D2D7DE; 
    color: #FFFFFF;
    border-radius:4px;
    border:1px solid rgba(221,221,221,1);
    font-family: PingFangSC-Regular;
}

.invite-room-context{
    margin-right: 16px;
    float: right;
    margin-top: 20px;
    vertical-align: top;
    display: inline-block;
    height: 18px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #999999;
    line-height: 18px;
}

</style>