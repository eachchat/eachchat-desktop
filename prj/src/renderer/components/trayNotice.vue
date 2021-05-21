<template>
    <div class="trayNotice" id="trayNoticeId" v-on:mouseover="setToShow" v-on:mouseout="setToHide">
      <div class="trayNoticeTitle" v-on:mouseover="setToShow" v-on:mouseout="setToHide">新消息（{{totalUnreadCount}}）</div>
      <div class="noticeListDiv">
        <ul class="noticeList" v-show="!hasVoIP">
          <li class="noticeItem" v-for="noticeItem in noticeList" v-on:click="jumpToDistChat(noticeItem)" v-on:mouseover="setToShow" v-on:mouseout="setToHide">
            <img class="noticeItemIcon" :src="noticeItem.imgUrl" v-on:mouseover="setToShow" v-on:mouseout="setToHide">
            <div class="noticeItemName" v-on:mouseover="setToShow" v-on:mouseout="setToHide">{{noticeItem.chatName}}</div>
            <p :class="getUnreadClass(noticeItem.unreadCount)" v-on:mouseover="setToShow" v-on:mouseout="setToHide">{{noticeItem.unreadCount}}</p>
          </li>
        </ul>
        <ul class="noticeVoIPList" v-show="hasVoIP">
          <li class="noticeVoIP" v-for="voIPNoticeItem in voIPNoticeList">
            <div class="noticeItem" @click="showVoIPPage(voIPNoticeItem)">
              <img class="noticeItemIcon" :src="voIPNoticeItem.imgUrl">
              <div class="noticeItemName" >{{voIPNoticeItem.showContent}}</div>
            </div>
            <div class="noticeVoIPControl">
              <img class="noticeVoIPControlHangup" src="../../../static/Img/VoIP/noticeHangup@2x.png" @click="Hangup(voIPNoticeItem)">
              <img class="noticeVoIPControlAnswer" src="../../../static/Img/VoIP/noticeAnswer@2x.png" @click="Answer(voIPNoticeItem)">
            </div>
          </li>
        </ul>
      </div>
      <div class="cleanAll" v-on:click="clearAll" v-show="!hasVoIP" v-on:mouseover="setToShow" v-on:mouseout="setToHide">忽略全部</div>
    </div>
</template>
<script>
import {ipcRenderer} from 'electron'
export default {
    name: 'trayNotice',
    data() {
        return {
          totalUnreadCount: 0,
          trayNoticeElement: undefined,
          OpacityElement: undefined,
          noticeList: [],
          voIPNoticeList: [],
          hideInterval: null,
          hasVoIP: false,
          voIPShowInfo: "",
          voIPRoomId: "",
        }
    },
    methods: {
      Hangup() {
        ipcRenderer.send("checkClick", "HangupVoIP", this.voIPRoomId);
      },
      Answer() {
        ipcRenderer.send("checkClick", "AnswerVoIP", this.voIPRoomId);
      },
      async showVoIPPage() {
        ipcRenderer.send("createChildWindow", {type: "voiceChatWindow",
        size:{width:300,height: 480},
        voipInfo: {
            voipType: "",
            voipFrame: "webRtc",
            roomId: this.voIPRoomId,
            voipShowInfo: {
                userImg: "",
                userName: ""
            }
        }})
        console.log("to show voip of ", this.voIPRoomId);
        this.voIPNoticeList = [];
        this.hasVoIP = false;
      },
      clearAll() {
        let toClearRoomIds = [];
        for(let i=0;i<this.noticeList.length;i++){
          toClearRoomIds.push(this.noticeList[i].roomId);
        }
        ipcRenderer.send("checkClick", "ClearAll", toClearRoomIds);
      },
      jumpToDistChat(item) {
        ipcRenderer.send("checkClick", "JumpToDistChat", [item.roomId]);
      },
      setToShow() {
        clearInterval(this.hideInterval)
        ipcRenderer.send('trayNoticeShowOrNot', true);
      },
      setToHide() {
        if(this.hideInterval) {
          clearInterval(this.hideInterval)
        }
        this.hideInterval = setInterval(() => {
          ipcRenderer.send('trayNoticeShowOrNot', false);
          clearInterval(this.hideInterval)
        }, 500);
      },
      updateVoIPNoticeContent(event, VoIPNoticeContent) {
        console.log("==== updateVoIPNoticeContent ", VoIPNoticeContent);
        this.voIPNoticeList = [];
        this.hasVoIP = false;
        for(let id in VoIPNoticeContent){
          console.log("id is ", id);
          let item = VoIPNoticeContent[id];
          console.log("item is ", item);
          if(item["notictType"] == "voice") {
            item["showContent"] = item["chatName"] + "邀请你语音通话";
            this.voIPRoomId = item["roomId"];
            this.hasVoIP = true;
            this.voIPNoticeList.push(item);
          }
          else if(item["noticeType"] == "video") {
            item["showContent"] = item["chatName"] + "邀请你视频通话";
            this.voIPRoomId = item["roomId"];
            this.hasVoIP = true;
            this.voIPNoticeList.push(item);
          }
        }
        if(!this.hasVoIP) {
          this.voIPRoomId = "";
          this.setToHide();
        }
        else this.setToShow();
      },
      updateNoticeContent(event, NoticeContent) {
        // let trayNoticeObj = {
        //       unreadCount: this.getUnReadCount(room),
        //       imgUrl: distUrl,
        //       chatName: distName,
        //       roomId: room.roomId,
        //     }
        console.log("==== NoticeContent ", NoticeContent);
        this.totalUnreadCount = 0;
        this.noticeList = [];
        for(let id in NoticeContent){
          console.log("id is ", id);
          let item = NoticeContent[id];
          console.log("item is ", item);
          this.noticeList.push(item);
          this.totalUnreadCount += item['unreadCount'];
        }
        if(this.totalUnreadCount == 0) {
          ipcRenderer.send('trayNoticeShowOrNot', false);
        }
        // this.toUpdateCurWindowInfo();
      },
      toUpdateCurWindowInfo() {
        if(!this.trayNoticeElement) {
          this.trayNoticeElement = document.getElementById('trayNoticeId');
        }
        let trayNoticeWindowInfo = {
          width: this.trayNoticeElement ? this.trayNoticeElement.offsetWidth : 0,
          height: this.trayNoticeElement ? this.trayNoticeElement.offsetHeight : 0,
          totalUnreadCount: this.totalUnreadCount,
        }
        ipcRenderer.send('updateTrayNoticeWindowInfo', trayNoticeWindowInfo);
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

  .noticeItem:hover {
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
    background-color: rgba(247, 248, 250, 1);;
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