<template>
    <div class="trayNotice" id="trayNoticeId" v-on:mouseover="setToShow" v-on:mouseout="setToHide">
      <div class="trayNoticeTitle" v-on:mouseover="setToShow" v-on:mouseout="setToHide">新消息（{{totalUnreadCount}}）</div>
      <div class="noticeListDiv">
        <ul class="noticeList">
          <li class="noticeItem" v-for="noticeItem in noticeList" v-on:click="jumpToDistChat(noticeItem)" v-on:mouseover="setToShow" v-on:mouseout="setToHide">
            <img class="noticeItemIcon" :src="noticeItem.imgUrl" v-on:mouseover="setToShow" v-on:mouseout="setToHide">
            <div class="noticeItemName" v-on:mouseover="setToShow" v-on:mouseout="setToHide">{{noticeItem.chatName}}</div>
            <p :class="getUnreadClass(noticeItem.unreadCount)" v-on:mouseover="setToShow" v-on:mouseout="setToHide">{{noticeItem.unreadCount}}</p>
          </li>
        </ul>
      </div>
      <div class="cleanAll" v-on:click="clearAll" v-on:mouseover="setToShow" v-on:mouseout="setToHide">忽略全部</div>
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
          hideInterval: null,
        }
    },
    methods: {
      clearAll() {
        let toClearRoomIds = [];
        for(let i=0;i<this.noticeList.length;i++){
          toClearRoomIds.push(this.noticeList[i].roomId);
        }
        ipcRenderer.send("checkClick", toClearRoomIds);
      },
      jumpToDistChat(item) {
        ipcRenderer.send("checkClick", [item.roomId]);
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
          this.totalUnreadCount += item['unreadCount'];
          this.noticeList.push(item);
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