<template>
    <div class="trayNotice" id="trayNoticeId" v-on:mouseover="mousein" v-on:mouseout="mouseout">
      <div class="trayNoticeTitle" v-on:mouseover="mousein" v-on:mouseout="mouseout">{{unreadLabel}}</div>
      <div class="noticeListDiv">
        <ul class="noticeList" v-show="!hasVoIP">
          <li class="noticeItem" v-for="noticeItem in noticeList" v-on:click="jumpToDistChat(noticeItem)" v-on:mouseover="mousein" v-on:mouseout="mouseout">
            <img class="noticeItemIcon" :src="noticeItem.imgUrl" v-on:mouseover="mousein" v-on:mouseout="mouseout">
            <div class="noticeItemName" v-on:mouseover="mousein" v-on:mouseout="mouseout">{{noticeItem.chatName}}</div>
            <p :class="getUnreadClass(noticeItem.unreadCount)" v-on:mouseover="mousein" v-on:mouseout="mouseout">{{noticeItem.unreadCount}}</p>
          </li>
        </ul>
        <ul class="noticeVoIPList" v-show="hasVoIP" v-on:mouseover="mousein">
          <li class="noticeVoIP" v-for="voIPNoticeItem in voIPNoticeList" v-on:mouseover="mousein">
            <div class="noticeItem" v-on:mouseover="mousein">
              <img class="noticeItemIcon" :src="voIPNoticeItem.imgUrl" v-on:mouseover="mousein">
              <div class="voIPNoticeItemName" v-on:mouseover="mousein">{{voIPNoticeItem.showContent}}</div>
            </div>
            <div class="noticeVoIPControl" v-on:mouseover="mousein">
              <img class="noticeVoIPControlHangup" src="../../../static/Img/VoIP/noticeHangup@2x.png" @click="Hangup(voIPNoticeItem)" v-on:mouseover="mousein">
              <img class="noticeVoIPControlAnswer" src="../../../static/Img/VoIP/noticeAnswer@2x.png" @click="Answer(voIPNoticeItem)" v-on:mouseover="mousein">
            </div>
          </li>
        </ul>
      </div>
      <div class="cleanAll" v-on:click="clearAll" v-show="!hasVoIP" v-on:mouseover="mousein" v-on:mouseout="mouseout">忽略全部</div>
    </div>
</template>
<script>
import {ipcRenderer} from 'electron'
export default {
    name: 'trayNotice',
    data() {
        return {
          MsgUnreadCount: 0,
          VoIPUnreadCount: 0,
          trayNoticeElement: undefined,
          noticeList: [],
          voIPNoticeList: [],
          hideInterval: null,
          hasVoIP: false,
          hasMsg: false,
          voIPRoomId: "",
          forceHide: false,
          unreadLabel: "新消息",
        }
    },
    methods: {
      Hangup(item) {
        ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
            size:{width:300,height: 480},
                    roomInfo: { roomID: item.roomId,
                                name: item.chatName,
                                url:item.imgUrl,
                                voipType: item.notictType,
                                direction: "from",
                                action: "hangup"}});

        for(let i = 0; i < this.voIPNoticeList.length; i++) {
          if(this.voIPNoticeList[i].roomID == item.roomID) {
            this.voIPNoticeList.splice(i, 1);
            break;
          }
        }
        this.VoIPUnreadCount = this.voIPNoticeList.length;
        this.toHideTrayWindow(true);
      },
      Answer(item) {
        ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
            size:{width:300,height: 480},
                    roomInfo: { roomID: item.roomId,
                                name: item.chatName,
                                url:item.imgUrl,
                                voipType: item.notictType,
                                direction: "from",
                                action: "answer"}});

        for(let i = 0; i < this.voIPNoticeList.length; i++) {
          if(this.voIPNoticeList[i].roomID == item.roomID) {
            this.voIPNoticeList.splice(i, 1);
            break;
          }
        }
        this.VoIPUnreadCount = this.voIPNoticeList.length;
        this.toHideTrayWindow(true);
      },
      async showVoIPPage(item) {
        ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
            size:{width:300,height: 480},
                    roomInfo: { roomID: item.roomId,
                                name: item.chatName,
                                url:item.imgUrl,
                                voipType: item.notictType,
                                direction: "from",
                                action: "show"}});

        for(let i = 0; i < this.voIPNoticeList.length; i++) {
          if(this.voIPNoticeList[i].roomID == item.roomID) {
            this.voIPNoticeList.splice(i, 1);
            break;
          }
        }
        this.VoIPUnreadCount = this.voIPNoticeList.length;
        this.toHideTrayWindow();
      },
      clearAll() {
        let toClearRoomIds = [];
        for(let i=0;i<this.noticeList.length;i++){
          toClearRoomIds.push(this.noticeList[i].roomId);
        }
        ipcRenderer.send("checkClick", "ClearAll", toClearRoomIds);
        this.toHideTrayWindow(true);
      },
      jumpToDistChat(item) {
        ipcRenderer.send("checkClick", "JumpToDistChat", [item.roomId]);
        this.toHideTrayWindow(true);
      },
      toShowTrayWindow() {
        if(this.forceHide) return;
        clearInterval(this.hideInterval)
        ipcRenderer.send('trayNoticeShowOrNot', true);
      },
      toHideTrayWindow(force=false) {
        if(force) {
          ipcRenderer.send('trayNoticeShowOrNot', false);
        }
        this.forceHide = force;
        setTimeout(() => {
          this.forceHide = false;
        }, 500)
        if(this.hideInterval) {
          clearInterval(this.hideInterval)
        }
        this.hideInterval = setInterval(() => {
          ipcRenderer.send('trayNoticeShowOrNot', false);
          clearInterval(this.hideInterval)
        }, 300);
      },
      mousein(e) {
        if(!this.hasVoIP && !this.hasMsg){
          return;
        }
        this.toShowTrayWindow();
      },
      mouseout(e) {
        if(this.hasVoIP) return;
        this.toHideTrayWindow();
      },
      updateVoIPNoticeContent(event, VoIPNoticeContent) {
        console.log("==== updateVoIPNoticeContent ", VoIPNoticeContent);
        this.voIPNoticeList = [];
        this.VoIPUnreadCount = 0;
        for(let id in VoIPNoticeContent){
          let item = VoIPNoticeContent[id];
          if(item["notictType"] == "voice") {
            item["showContent"] = item["chatName"] + "邀请你语音通话";
            this.voIPRoomId = item["roomId"];
            this.voIPNoticeList.push(item);
          }
          else if(item["notictType"] == "video") {
            item["showContent"] = item["chatName"] + "邀请你视频通话";
            this.voIPRoomId = item["roomId"];
            this.voIPNoticeList.push(item);
          }
          this.VoIPUnreadCount +=1 ;
        }
        this.unreadLabel = "新消息" + (Number(this.MsgUnreadCount + this.VoIPUnreadCount) != 0 ? "（" + Number(this.MsgUnreadCount + this.VoIPUnreadCount) + "）" : "");
      },
      updateNoticeContent(event, NoticeContent) {
        // let trayNoticeObj = {
        //       unreadCount: this.getUnReadCount(room),
        //       imgUrl: distUrl,
        //       chatName: distName,
        //       roomId: room.roomId,
        //     }
        console.log("NoticeContent ", NoticeContent);
        this.MsgUnreadCount = 0;
        this.noticeList = [];
        for(let id in NoticeContent){
          let item = NoticeContent[id];
          this.noticeList.push(item);
          this.MsgUnreadCount += item['unreadCount'];
        }
        if(!this.hasMsg && !this.hasVoIP) {
          ipcRenderer.send('trayNoticeShowOrNot', false);
        }
        this.unreadLabel = "新消息" + (Number(this.MsgUnreadCount + this.VoIPUnreadCount) != 0 ? "（" + Number(this.MsgUnreadCount + this.VoIPUnreadCount) + "）" : "");
      },
      getUnreadClass(num) {
        if(num > 99) {
          return "notice-unread-99";
        }
        else {
          return "notice-unread";
        }
      },
    },
    mounted() {
      ipcRenderer.on('updateTrayNotice', this.updateNoticeContent);
      ipcRenderer.on('updateVoIPTrayNotice', this.updateVoIPNoticeContent);
    },
    watch: {
      voIPNoticeList: function() {
        if(this.voIPNoticeList.length == 0) {
          this.hasVoIP = false;
        }
        else {
          
          this.hasVoIP = true;
        }
        this.unreadLabel = "新消息" + (Number(this.MsgUnreadCount + this.VoIPUnreadCount) != 0 ? "（" + Number(this.MsgUnreadCount + this.VoIPUnreadCount) + "）" : "");
      },
      noticeList: function() {
        if(this.noticeList.length == 0) {
          this.hasMsg = false;
        }
        else {
          this.hasMsg = true;
        }
        this.unreadLabel = "新消息" + (Number(this.MsgUnreadCount + this.VoIPUnreadCount) != 0 ? "（" + Number(this.MsgUnreadCount + this.VoIPUnreadCount) + "）" : "");
      }
    }
}
</script>

<style lang="scss" scoped>
  ::-webkit-scrollbar-track-piece {
    background-color: #F1F1F1;
    border-radius: 5px;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 12px;
    display: none;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: #C1C1C1;
    border-radius: 5px;
    outline: none;
  }

  ::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #A8A8A8;
    border-radius: 5px;
  }

  .trayNotice {
    width: 240px;
    overflow: hidden;
  }

  .trayNoticeTitle {
    width: 240px;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 500;
    margin-left: 16px;
  }

  .noticeListDiv {
    width: 240px;
  }

  .noticeList {
    padding: 0;
    margin: 0;
  }

  .noticeItem {
    width: 206px;
    height: 40px;
    line-height: 40px;
    font-size: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 500;
    padding-left: 16px;
    padding-right: 18px;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .noticeVoIPList {
    padding: 0;
    margin: 0;
  }

  .noticeVoIP {
    width: 240px;
    height: 96px;
    padding-left: 0px;
    padding-right: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
  }

  .noticeVoIPControl {
    width: 240px;
    height: 44px;
  }

  .noticeVoIPControlHangup {
    width: 28px;
    height: 28px;
    margin-top: 8px;
    margin-bottom: 8px;
    margin-left: 8px;
    margin-right: 8px;
    float: right;
    display: inline-block;
  }

  .noticeVoIPControlAnswer {
    width: 28px;
    height: 28px;
    margin-top: 8px;
    margin-bottom: 8px;
    margin-left: 8px;
    margin-right: 8px;
    float: right;
    display: inline-block;
  }

  .cleanAll {
    width: 100%;
    float: right;
    height: 32px;
    padding-right: 16px;
    text-align: right;
    line-height: 32px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: rgba(0, 169, 113, 1);
  }

  .cleanAll:hover {
    width: 60px;
    float: right;
    height: 32px;
    padding-right: 16px;
    text-align: right;
    line-height: 32px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: rgba(0, 169, 113, 1);
    cursor: pointer;
  }

  .noticeItemIcon {
    vertical-align: middle;
    width: 36px;
    height: 36px;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 6px;
    margin-bottom: 0px;
    border-radius:50px;
    object-fit:cover;
    display: inline-block;
  }

  .noticeItemName {
    display: inline-block;
    vertical-align: middle;
    width: calc(100% - 70px);
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 500;
    margin-left: 6px;
    margin-right: 0px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .noticeItemName:hover {
    display: inline-block;
    vertical-align: middle;
    width: calc(100% - 70px);
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 500;
    margin-left: 6px;
    margin-right: 0px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .voIPNoticeItemName {
    display: inline-block;
    vertical-align: middle;
    width: calc(100% - 50px);
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 500;
    margin-left: 6px;
    margin-right: 0px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .notice-unread {
    vertical-align: middle;
    display: inline-block;
    font-size: 12px;
    font-family: PingFangSC-Regular;
    float: right;
    color: rgb(255, 255, 255);
    margin: 11px 0 11px 0;
    text-align: center;
    height: 18px;
    width: 18px;
    line-height: 18px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 1);
    // z-index:-1;
  }

  .notice-unread-99 {
    display: inline-block;
    font-size: 12px;
    font-family: PingFangSC-Regular;
    float: right;
    color: rgb(255, 255, 255);
    margin: 11px 0 11px 0;
    text-align: center;
    height: 18px;
    width: 18px;
    line-height: 11px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 1);
    // z-index:-1;
  }

</style>