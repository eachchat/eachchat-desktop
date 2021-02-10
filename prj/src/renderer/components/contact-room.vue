<template>
    <el-container>
        <el-header height="56px" class="contact-header">
            <p class="contact-header-title">群聊</p>
        </el-header>
        <el-main  style="overflow: hidden">
            <el-container class="bottom-container" id="contact-main-container">
                <div class="contact-view">
                    <ul class="managers-list">
                        <li class="manager"
                            v-for="(item, index) in roomList"
                            @click="roomMenuItemClicked(item.room_id)"
                            :key="index">
                            <img ondragstart="return false" class="manager-icon"  :src="item.avatar_url">
                            <div class="department-info">
                                <p class="department-name">{{ item.name }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </el-container>
        </el-main>
    </el-container>
</template>
<script>

import {ContactRoom} from '../../packages/data/sqliteutil.js'; 
import "../style/contact-list.css"
import log from 'electron-log'


export default {
    name: 'roomList',
    components: {
    },
    data () {
        return {
            headerTitle: '',
            roomList: [],
            userInfo: {},
            showUserInfoTips: false,
            userInfoTipKey: 1,
            userInfoPosition: {},
            showChatContactDlg: false,
            showInputContactDlg: false,
            nMouseIndex: -1,
            showAlertDlg: false,
            alertContents : null,
            deleteContact: null,
            contactType: 'contact'
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
        roomList: function(){
 
        }
    },

    methods: {
        roomMenuItemClicked:function(roomId) {
            this.$router.push(
                {
                    name: 'ChatContent', 
                    params: {
                        group_id: roomId
                    }
                })
        },
        
        getAppBaseData:async function() {
            await this.services.getAllContactRooms();
            this.roomList = await ContactRoom.GetAllRooms();
            for(let i = 0; i < this.roomList.length; i++){
                let item = this.roomList[i];
                let room = this.matrixClient.getRoom(item.room_id);
                if(!room || room.getMyMembership() != 'join'){
                    this.roomList.splice(i, 1);
                    i--;
                    continue;
                } 
                console.log('room', room);
                item.name = room.name;
                var RoomAvatar = room.getAvatarUrl(this.matrixClient.getHomeserverUrl(), null, null, undefined, false);
         
                if(!RoomAvatar) 
                    item.avatar_url = './static/Img/User/group-40px@2x.png';
                else 
                    item.avatar_url = RoomAvatar;
            }
        },

    },
    created: async function() {
        this.services = global.services.common;
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
        await this.getAppBaseData();
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
    width: calc(100% - 99px);
}
.department-name {
    text-align: left;
    height: 20px;
    width: 180px;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    display: flex;
    place-items: center;
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
    object-fit:cover;
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

.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 92px);
}
.department-name {
    display: flex;
    place-items: center;
    text-align: left;
    height: 20px;
    width: 70%;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
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

</style>