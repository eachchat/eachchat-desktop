<template>
    <div class="chat-wind">
      <div class="chat-panel" id="chat-panel-id">
        <div class="win-header">
          <winHeaderBar @getCreateGroupInfo="getCreateGroupInfo" @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
        </div>
        <div class="chat-list">
          <div class="list-header">
            <listHeader :cleanSearchKey="cleanSearchKey" @getCreateGroupInfo="getCreateGroupInfo" @toSearch="toSearch"/>
          </div>
          <p class="chat-label">普通</p>
          <div class="list-content" id="list-content-id" v-show="!isSearch" :key="needUpdate">
            <ul class="group-list">
              <li :class="groupOrTopClassName(chatGroupItem, index)"
                  v-for="(chatGroupItem, index) in dealShowGroupList"
                  @click="showChat(chatGroupItem, index)"
                  @contextmenu="rightClick($event, chatGroupItem)"
                  >
                  <!-- <listItem @groupInfo="chatGroupItem"/> -->
                <div class="group-img">
                  <img class="group-ico" :id="getChatElementId(chatGroupItem.group_id, chatGroupItem.user_id)" src="../../../static/Img/User/user-40px@2x.png"/>
                  <p :class="getUnreadClass(chatGroupItem.un_read_count, index===curindex)">{{getUnReadCount(chatGroupItem.un_read_count, index)}}</p>
                </div>
                <div class="group-info">
                  <p class="group-name" :id="getChatGroupNameElementId(chatGroupItem.group_id, chatGroupItem.user_id)">{{getShowGroupName(chatGroupItem)}}</p>
                  <p class="group-content">{{getShowMsgContent(chatGroupItem)}}</p>
                </div>
                <div class="group-notice">
                  <p class="group-time">{{getMsgLastMsgTime(chatGroupItem)}}</p>
                  <p class="group-slience" v-show="groupIsSlience(chatGroupItem)"></p>
                </div>
              </li>
            </ul>
          </div>
          <div class="search-list-content" id="search-list-content-id" v-show="isSearch">
            <div class="search-list-content-people" id="search-list-content-people-id" v-show="showSearchPeople">
              <div class="search-list-content-label">联系人</div>
              <div class="search-list-content-content">
                <ul class="search-list-content-list">
                  <li class="search-item"
                      v-for="searchPeopleItem in searchPeopleItems"
                      @click="showPeopleInfo(searchPeopleItem)"
                      >
                    <div class="search-item-img-div">
                      <img class="search-item-img-ico" :id="getSearchItemElementId(searchPeopleItem.id)" src="../../../static/Img/User/user-40px@2x.png"/>
                    </div>
                    <div class="search-item-info">
                      <p class="search-item-name">{{searchPeopleItem.displayName}}</p>
                      <p class="search-item-position">{{searchPeopleItem.department.name}}</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="search-list-content-more-div" @click="showAllSearchUsers">查看全部 >></div>
            </div>
            <div class="search-list-content-message" id="search-list-content-message-id" v-show="showSearchMessage">
              <div class="search-list-content-label">聊天记录</div>
              <div class="search-list-content-content">
                <ul class="search-list-content-list">
                  <li class="search-item"
                      v-for="searchMessageItem in searchMessageItems"
                      >
                    <div class="search-item-img-div">
                      <img class="search-item-img-ico" :id="getSearchItemElementId(searchMessageItem.groupId)" src="../../../static/Img/User/user-40px@2x.png"/>
                    </div>
                    <div class="search-item-info">
                      <p class="search-item-name">{{searchMessageItem.groupName}}</p>
                      <p class="search-item-position">包含{{searchMessageItem.count}}条相关聊天记录</p>
                    </div>
                  </li>
                  <li class="search-item">
                    <div class="search-item-img-div">
                      <img class="search-item-img-ico" src="../../../static/Img/User/user-40px@2x.png"/>
                    </div>
                    <div class="search-item-info-more" @click="showAllSearchMessages">
                      <p class="search-item-name">搜索更多聊天记录</p>
                      <p class="search-item-position">关于{{searchKey}}的本地聊天记录</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="search-list-content-file" id="search-list-content-file-id" v-show="showSearchFile">
              <div class="search-list-content-label">文件</div>
              <div class="search-list-content-content">
                <ul class="search-list-content-list">
                  <li class="search-item"
                      v-for="searchFileItem in searchFileItems"
                      @click="showFileInfo(searchFileItem)"
                      >
                    <div class="search-item-img-div">
                      <img class="search-item-img-ico" :id="getSearchItemElementId(searchFileItem.timelineId)" src="../../../static/Img/User/user-40px@2x.png"/>
                    </div>
                    <div class="search-item-info">
                      <p class="search-item-name">{{searchFileItem.content.fileName}}</p>
                      <p class="search-item-position" :id="getFileNameItemElementId(searchFileItem.timelineId)">{{searchFileItem.position}}</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="search-list-content-more-div">
                <div class="search-list-content-more-label" @click="showAllSearchFiles">查看全部 >></div>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-empty" v-show="isEmpty">
          <img class="chat-empty-bg" src="../../../static/Img/Chat/empyt2@2x.png">
        </div>
        <div class="chat" v-show="!isEmpty">
          <ChatPage :chat="curChat" :newMsg="newMsg" @showImageOfMessage="showImageOfMessage" @getCreateGroupInfo="getCreateGroupInfo" @leaveGroup="leaveGroup" @updateChatGroupStatus="updateChatGroupStatus"></ChatPage>
        </div>
      </div>
      <searchSenderSelecterDlg v-show="showSearchSelectedSenderDlg" @closeSearchSenderSelectDlg="closeSearchSenderSelectDlg" :rootDepartments="searchSelectedSenderDialogRootDepartments" :selectedUsers="searchSelectedSenders" :dialogTitle="searchSelectedSenderDialogTitle" :key="searchAddSenderKey">
      </searchSenderSelecterDlg>
      <searchChatSelecterDlg  v-show="showSearchSelecterDlg" @closeSearchChatFilterDlg="closeSearchChatFilterDlg" :searchSelectedGroupIds="searchSelectedGroupIds" :recentGroups="recentGroups" :key="searchSelectedGroupKey">
      </searchChatSelecterDlg>
      <imageLayer :imgSrcInfo="imageLayersSrcInfo" v-show="showImageLayers" @closeImageOfMessage="closeImageOfMessage"/>
    </div>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {APITransaction} from '../../packages/data/transaction.js'
import {services, environment} from '../../packages/data/index.js'
import ChatPage from './chat.vue'
import winHeaderBar from './win-header.vue'
import imageLayer from './image-layers.vue'
import listHeader from './listheader'
import {ipcRenderer, remote} from 'electron'
import searchChatSelecterDlg from './searchChatSelecter.vue'
import searchSenderSelecterDlg from './searchSenderSelect.vue'
// import listItem from './list-item.vue'
import {downloadGroupAvatar, Appendzero, strMsgContentToJson, JsonMsgContentToString, FileUtil, changeStr, getIconPath} from '../../packages/core/Utils.js'
import { Group, UserInfo, Department, Message } from '../../packages/data/sqliteutil'
import BenzAMRRecorder from 'benz-amr-recorder'
const {Menu, MenuItem, clipboard, nativeImage} = remote;

export default {
  components: {
    ChatPage,
    listHeader,
    winHeaderBar,
    imageLayer,
    searchChatSelecterDlg,
    searchSenderSelecterDlg,
    // listItem
  },
  props: {
    distUserId: {
      type: String,
      default: ""
    },
    distGroupId: {
      type: String,
      default: ""
    },
    updateImg: {
      type: Boolean,
      default: false
    }
    //['distUserId', 'distGroupId'],
  },
  watch: {
    distUserId: async function() {
      console.log("in chat content distuserid is ", this.distUserId);
      if(this.distUserId.length != 0) {
        var groupUserIds = [];
        groupUserIds.push(this.distUserId);
        groupUserIds.push(this.curUserInfo.id);
        var groupItem = {};
        var userInfos = await services.common.GetDistUserinfo(this.distUserId);
        console.log("userInfos is ", userInfos);
        var chatUserInfo = userInfos[0];
        var chatAvater = chatUserInfo.avatar_t_url;
        var chatName = chatUserInfo.user_display_name;
        var groupCheck = await services.common.GetGroupByName(chatName);
        console.log("groupCheck is ", groupCheck)

        if(groupCheck.length == 0) {
            groupItem["contain_user_ids"] = groupUserIds;
            groupItem["group_avarar"] = chatAvater;
            groupItem["group_name"] = chatName;
            groupItem["group_type"] = 102;
            groupItem["last_message_time"] = 0;
            groupItem["message_content"] = null;
            groupItem["message_content_type"] = 101;
            groupItem["message_from_id"] = this.curUserInfo.id;
            groupItem["message_id"] = '';
            groupItem["owner"] = null;
            groupItem["sequence_id"] = 0;
            groupItem["status"] = "00000000";
            groupItem["un_read_count"] = 0;
            groupItem["updatetime"] = new Date().getTime();
            groupItem["user_id"] = this.distUserId;
        }
        else {
            groupItem = groupCheck[0];
        }

        this.getCreateGroupInfo(groupItem)
      }
    },
    distGroupId: async function() {
      console.log("in chat content distGroupId is ", this.distGroupId);
      if(this.distGroupId.length != 0) {
        var distInfo = await Group.FindItemFromGroupByGroupID(this.distGroupId);
        if(distInfo != undefined) {
          this.getCreateGroupInfo(distInfo);
        }
      }
    },
    updateImg: function() {
      this.showGroupIcon();
    }
  },
  computed: {
    dealShowGroupList: function() {
      if(this.originalGroupList.length == 0) {
        return;
      }
      this.showGroupList = [];
      var topGroupVar = [];
      for(let i=0;i<this.originalGroupList.length;i++) {
        if(this.groupIsTop(this.originalGroupList[i])) {
          topGroupVar.push(this.originalGroupList[i]);
        }
        else {
          this.showGroupList.push(this.originalGroupList[i]);
        }
      }
      topGroupVar = topGroupVar.sort(this.compare());
      console.log("topgroupvar is ", topGroupVar)
      this.showGroupList = this.showGroupList.sort(this.compare());
      console.log("chatGroupVar is ", this.showGroupList)
      this.showGroupList = topGroupVar.concat(this.showGroupList);
      for(let i=0;i<this.showGroupList.length;i++) {
        if(this.showGroupList[i].group_type == this.curChat.group_type && this.showGroupList[i].group_id == this.curChat.group_id && this.showGroupList[i].group_name == this.curChat.group_name) {
          this.curindex = i;
          break;
        }
      }
      if(this.needScroll) {
        this.scrollToDistPosition()
      }
      
      // this.$store.commit("setShowGroupList", this.showGroupList);
      return this.showGroupList
    }
  },
  data() {
    return {
      //需要展示的用户群组
      amr: null,
      unreadCount: 0,
      cleanSearchKey: false,
      dealedMsgSequenceId:[],
      searchSelectedSenderDialogRootDepartments: [],
      searchSelectedSenderDialogTitle: "",
      searchSelectedSenders: [],
      searchAddSenderKey: 199,
      recentGroups: [],
      searchSelectedGroupKey: 99,
      searchSelectedGroupIds:[],
      showSearchSelectedSenderDlg: false,
      showSearchSelecterDlg: false,
      showSearchMessage: true,
      showSearchFile: true,
      showSearchPeople: true,
      searchPeopleItems: [],
      searchFileItems: [],
      searchMessageItems: [],
      needScroll: false,
      isSearch: false,
      curChat: {},
      needUpdate: 1,
      curindex: -1,
      searchKey: '',
      normalGroupList: [],
      encryptGroupList: [],
      originalGroupList: [],
      showGroupList: [],
      showImageLayers: false,
      imageLayersSrcInfo: '',
      clickedGroupList: [],
      isEmpty: true,
      groupListElement: null,
      newMsg: {},
      mqttGroupVar: [],
      searchId: 0,
    };
  },
  methods: {
    closeSearchChatFilterDlg() {
        this.showSearchSelecterDlg = false;
        this.searchSelectedGroupIds = [];
    },
    closeSearchSenderSelectDlg() {
      this.showSearchSelectedSenderDlg = false;
      this.searchSelectedSenders = [];
    },
    async SearchAddGroup(event, selectedIds) {
        console.log("SearchAddGroup ", selectedIds);
        this.searchSelectedGroupIds = selectedIds;
        
        this.recentGroups = await Group.GetGroupByTime();
        this.searchSelectedGroupKey ++;
        this.showSearchSelecterDlg = true;
    },
    async searchAddSenders(event, selectedSenderIds) {
      console.log("selectedSenderIds ", selectedSenderIds);
        for(let i=0;i<selectedSenderIds.length;i++) {
          let selectedSenderVar = await UserInfo.GetUserInfo(selectedSenderIds[i]);
          if(selectedSenderVar != undefined) {
            this.searchSelectedSenders.push(selectedSenderVar);
          }
        }
        var root = await Department.GetRoot();
        var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
        var temp = [];
        for(let i = 0; i < rootDepartmentModels.length; i ++) {
            var department = rootDepartmentModels[i];
            temp[department.show_order] = department;
        }
        this.searchSelectedSenderDialogRootDepartments =  temp;
       
        this.searchAddSenderKey ++;
        this.showSearchSelectedSenderDlg = true;
        this.searchSelectedSenderDialogTitle = "指定发送人";
    },
    getSearchItemElementId: function(itemId) {
      return "all-search-" + itemId;
    },
    getFileNameItemElementId: function(itemId) {
      return "file-name-element-" + itemId;
    },
    showFileInfo: function(fileInfo) {

    },
    showPeopleInfo: function(peopleInfo) {

    },
    Close: function() {
      ipcRenderer.send("win-close");
    },
    Min: function() {
      ipcRenderer.send("win-min");
    },
    Max: function() {
      ipcRenderer.send("win-max");
    },
    scrollToDistPosition(index) {
      if(this.groupListElement == null) {
        this.groupListElement = document.getElementById("list-content-id");
      }
      this.groupListElement.scrollTop = index == undefined ? this.curindex*60 : index*60;
      this.needScroll = false;
    },
    showScrollBar: function(e) {
      if(this.groupListElement == null) {
        this.groupListElement = document.getElementById("list-content-id");
      }
      this.groupListElement.style.overflowY = "overlay"
    },
    hideScrollBar: function(e) {
      if(this.groupListElement == null) {
        this.groupListElement = document.getElementById("list-content-id");
      }
      this.groupListElement.style.overflowY = "hidden"
    },
    groupOrTopClassName(item, index) {
      if(index == this.curindex) {
        return "group active";
      }
      if(this.groupIsTop(item)) {
        return "group-top";
      }
      else {
        return "group";
      }
    },
    isWindows() {
      return environment.os.isWindows;
    },
    rightClick(e, groupItem) {
        console.log("groupItem is ", groupItem)
        console.log("e.target is ", e.target.className)
        // let distElement = document.getElementById(msgItem.message_id);
        // console.log("distElement is ", distElement.className);
        // if(this.checkClassName.indexOf(e.target.className) == -1) {
        //     return;
        // }
        this.menu = new Menu();
        this.unreadCount -= groupItem.un_read_count;
        ipcRenderer.send("updateUnreadCount", this.unreadCount);
        if(groupItem.un_read_count != 0) {
          this.menu.append(new MenuItem({
              label: "标记已读",
              click: () => {
                  this.clesrUnread(groupItem)
              }
          }));
        }
        if(this.groupIsSlience(groupItem)) {
          this.menu.append(new MenuItem({
              label: "允许消息通知",
              click: () => {
                  this.setUnSlience(groupItem)
              }
          }));
        }
        else {
          this.menu.append(new MenuItem({
              label: "消息免打扰",
              click: () => {
                  this.setSlience(groupItem)
              }
          }));
        }
        if(this.groupIsInFavourite(groupItem)) {
          this.menu.append(new MenuItem({
              label: "取消收藏",
              click: () => {
                  this.unFavouriteIt(groupItem)
              }
          }));
        }
        else {
          this.menu.append(new MenuItem({
              label: "收藏",
              click: () => {
                  this.favouriteIt(groupItem)
              }
          }));
        }
        this.menu.append(new MenuItem({
            label: "删除",
            click: () => {
                this.deleteGroup(groupItem)
            }
        }));
        this.menu.popup(remote.getCurrentWindow());
    },
    deleteGroup(groupItem) {
      services.common.DeleteGroup(groupItem.group_id);
      this.leaveGroup(groupItem.group_id);
    },
    favouriteIt: function(groupItem){
        services.common.CollectGroup(groupItem.group_id)
            .then((ret) => {
              this.updateChatGroupFavStatus(groupItem.group_id, true);
            })
    },
    unFavouriteIt: function(groupItem){
      console.log("unfavouriteid groupitem is ", groupItem)
        services.common.DeleteCollectionGroup(groupItem.group_id)
            .then((ret) => {
              this.updateChatGroupFavStatus(groupItem.group_id, false);
                console.log("DeleteCollectionGroup ", ret);
            })
    },
    setSlience: async function(groupItem){
      var groupIsTop = this.groupIsTop(groupItem);
      services.common.GroupStatus(groupItem.group_id, groupIsTop, true)
          .then((ret) => {
              this.updateChatGroupStatus(groupItem.group_id, ret, "slience");
              console.log("slienceStateChange ", ret);
          })
    },
    setUnSlience: async function(groupItem){
      var groupIsTop = this.groupIsTop(groupItem);
      services.common.GroupStatus(groupItem.group_id, groupIsTop, false)
          .then((ret) => {
              this.updateChatGroupStatus(groupItem.group_id, ret, "slience");
              console.log("slienceStateChange ", ret);
          })
    },
    clesrUnread(groupItem) {
      this.isEmpty = false;
      services.common.MessageRead(groupItem.group_id, groupItem.sequence_id);
      this.unreadCount -= groupItem.un_read_count;
      ipcRenderer.send("updateUnreadCount", this.unreadCount);
      groupItem.un_read_count = 0;
    },
    // Download thumb and show in dist id element
    async updateGroupImg(e, arg) {
      console.log("=======================updateGroupImg", arg)
      var state = arg[0];
      var stateInfo = arg[1];
      var id = arg[2];
      var localPath = arg[3];

      var groupInfoTmp = await Group.FindItemFromGroupByGroupID(id);
      if(groupInfoTmp == undefined) {
        return;
      }
      console.log("groupinfotmp is ", groupInfoTmp)

      var distId = this.getChatElementId(id, groupInfoTmp.user_id);
      console.log("updateGroupImg dist id ", distId);
      let elementImg = document.getElementById(distId);

      elementImg.setAttribute("src", "");
      var showfu = new FileUtil(localPath);
      let showfileObj = showfu.GetUploadfileobj();
      var reader = new FileReader();
      reader.readAsDataURL(showfileObj);
      reader.onloadend = () => {
          elementImg.setAttribute("src", reader.result);
      }
    },
    getUidFromUids(groupInfo) {
      var containUids = groupInfo.contain_user_ids;
      var containUidsList = containUids.split(",");
      var distUid = "";
      for(let i=0;i<containUidsList.length;i++) {
        if(containUidsList[i] != this.curUserInfo.id) {
          distUid = containUidsList[i];
        }
      }
      return distUid;
    },
    showGroupIcon: async function() {
      setTimeout(async () => {
        console.log("=======================showGroupIcon", this)
        for(var i=0;i<this.showGroupList.length;i++) {
          if(this.showGroupList[i].group_name == "武汉测试") {
            console.log("this.showGroupList[i] is ", this.showGroupList[i]);
          }
          var distId = this.getChatElementId(this.showGroupList[i].group_id, this.showGroupList[i].user_id);
          let elementImg = document.getElementById(distId);
          // console.log("elementImg src is ", elementImg.src)
          var targetPath = "";
          if(this.showGroupList[i].group_id == undefined || this.showGroupList[i].group_id.length == 0 || this.showGroupList[i].group_type == 102) {
            if(this.showGroupList[i].user_id.length == 0) {
              this.showGroupList[i].user_id = this.getUidFromUids(this.showGroupList[i]);
            }
            var distUserInfo = await UserInfo.GetUserInfo(this.showGroupList[i].user_id);
            // console.log("distUserInfo is ", distUserInfo);
            if(distUserInfo != undefined) {
              if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(distUserInfo.avatar_t_url, this.showGroupList[i].user_id))){
                  elementImg.setAttribute("src", targetPath);
                  if(this.showGroupList[i].group_name == "武汉测试") {
                    console.log("showGroupIcon targetPath is ", targetPath);
                  }
              }
            }
            else {
              if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.showGroupList[i].group_avarar, this.showGroupList[i].group_id))){
                  var showfu = new FileUtil(targetPath);
                  let showfileObj = showfu.GetUploadfileobj();
                  let reader = new FileReader();
                  reader.readAsDataURL(showfileObj);
                  reader.onloadend = () => {
                      elementImg.setAttribute("src", reader.result);
                  }
              }
            }
          }
          else {
            if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.showGroupList[i].group_avarar, this.showGroupList[i].group_id))){
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
            }
            // else {
            //   var showfu = new FileUtil("../../../static/Img/User/user-40px@2x.png");
            //   let showfileObj = showfu.GetUploadfileobj();
            //   let reader = new FileReader();
            //   reader.readAsDataURL(showfileObj);
            //   reader.onloadend = () => {
            //       elementImg.setAttribute("src", reader.result);
            //   }
            // }
          }
        }
      }, 500)
    },
    groupIsInFavourite(groupInfo) {
        if(groupInfo.status.substr(4, 1) == "1") {
            return true;
        }
        return false;
    },
    groupIsSlience(groupInfo) {
      if(groupInfo.status.substr(7, 1) == "1") {
          return true;
      }
      return false;
    },
    groupIsTop(groupInfo) {
      if(groupInfo.status.substr(6, 1) == "1") {
          return true;
      }
      return false;
    },
    async toSearch(searchKey) {
      if(searchKey.trim().length != 0) {
        this.searchKey = searchKey;
        var curSearchId = new Date().getTime();
        // console.log("searchkey is ", this.searchKey);
        var searchResult = {
            "id": curSearchId,
            "searchList": []
        };
        this.searchId = curSearchId;
        var searcheRet = await services.common.SearchAll(searchKey);
        console.log("searhret ", searcheRet);
        // console.log("searchResult.id is ", searchResult.id);
        // console.log("this.searchId is ", this.searchId);
        if(searchResult.id == this.searchId) {
          for(let i=0;i<searcheRet.length;i++) {
            if(searcheRet[i].groups != undefined) {
              this.searchMessageItems = searcheRet[i].groups.slice(0, 3);
              if(this.searchMessageItems.length == 0) {
                this.showSearchMessage = false;
              }
              else {
                this.showSearchMessage = true;
              }
            }
            if(searcheRet[i].files != undefined) {
              this.searchFileItems = searcheRet[i].files.slice(0, 3);
              if(this.searchFileItems.length == 0) {
                this.showSearchFile = false;
              }
              else {
                this.showSearchFile = true;
              }
            }
            if(searcheRet[i].persons != undefined) {
              this.searchPeopleItems = searcheRet[i].persons.slice(0, 3);
              if(this.searchPeopleItems.length == 0) {
                this.showSearchPeople = false;
              }
              else {
                this.showSearchPeople = true;
              }
            }
          }
        }
        this.$nextTick(() => {
          setTimeout(() => {
            this.showSearchResultIcon();
          })
        })
        this.isSearch = true;
      }
      else{
        this.isSearch = false;
      }
    },
    showSearchResultIcon: async function() {
      console.log("=======================showGroupIcon")
      for(let i=0;i<this.searchPeopleItems.length;i++) {
        var distId = this.getSearchItemElementId(this.searchPeopleItems[i].id);
        let elementImg = document.getElementById(distId);
        // console.log("groupavatar is ", elementImg);
        var targetPath = "";
        if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(this.searchPeopleItems[i].avatarTUrl, this.searchPeopleItems[i].id))){
            elementImg.setAttribute("src", targetPath);
        }
      }
      for(let i=0;i<this.searchMessageItems.length;i++) {
        var distId = this.getSearchItemElementId(this.searchMessageItems[i].groupId);
        let elementImg = document.getElementById(distId);
        // console.log("groupavatar is ", elementImg);
        var targetPath = "";
        if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.searchMessageItems[i].groupAvatar, this.searchMessageItems[i].groupId))){
            elementImg.setAttribute("src", targetPath);
        }
      }
      for(let i=0;i<this.searchFileItems.length;i++) {
        var distId = this.getSearchItemElementId(this.searchFileItems[i].timelineId);
        let elementImg = document.getElementById(distId);
        // console.log("groupavatar is ", elementImg);
        var targetPath = "";

        var fileDetailElementId = this.getFileNameItemElementId(this.searchFileItems[i].timelineId);
        let fileDetailElement = document.getElementById(fileDetailElementId);
        if(fileDetailElement != undefined) {
          var fileSize = (this.searchFileItems[i].content.fileSize /(1024*1024)).toFixed(2) + "K";
          var fileOwnerInfo = await UserInfo.GetUserInfo(this.searchFileItems[i].fromId);
          var fileOwnerName = fileOwnerInfo.user_display_name;
          var fileTime = this.formatTimeFilter(this.searchFileItems[i].timestamp);
          fileDetailElement.innerHTML = fileSize + " " + fileOwnerName + " " + fileTime;
        }
        
        var iconPath = this.getFileIconThroughExt(this.searchFileItems[i].content.ext);
        elementImg.setAttribute("src", iconPath);
        elementImg.setAttribute("height", 32);

        if(fs.existsSync(targetPath = await services.common.downloadFile(this.searchFileItems[i].time_line_id, this.searchFileItems[i].timestamp, this.searchFileItems[i].content.fileName, false))){
            elementImg.setAttribute("src", targetPath);
        }
      }
    },
    showAllSearchUsers: function() {
        this.$router.push(
            {
                name: 'organization', 
                params: {
                    searchKey: this.searchKey
                }
            })

        this.cleanSearchKey = !this.cleanSearchKey;
        this.toSearch("");
    },
    showAllSearchFiles: function() {
      ipcRenderer.send("showAnotherWindow", "", "searchFilesList");
      this.cleanSearchKey = !this.cleanSearchKey;
      this.toSearch("");
    },
    showAllSearchMessages: function() {
      ipcRenderer.send("showAnotherWindow", "", "searchMessageList");
      this.cleanSearchKey = !this.cleanSearchKey;
      this.toSearch("");
    },
    getFileIconThroughExt: function(ext) {
        var iconPath = getIconPath(ext);
        return iconPath;
    },
    getCreateGroupInfo(groupInfo) {
      this.needScroll = true;
      console.log("Created Info is ", groupInfo)
      
      var groupIndex = -1;
      for(var i=0;i<this.showGroupList.length;i++) {
        if(this.showGroupList[i].group_id != undefined && this.showGroupList[i].group_id === groupInfo.group_id) {
          console.log("this.originalgorulliset is ", this.showGroupList[i]);
          groupIndex = i;
          this.scrollToDistPosition(groupIndex);
          break;
        }
      }
      if(groupIndex == -1) {
        if(groupInfo.group_type != 102) {
          this.mqttGroupVar.push(groupInfo);
          return;
        }
        else {
          this.originalGroupList.unshift(groupInfo);
          console.log("this.curchat is ", groupInfo);
          this.curChat = this.originalGroupList[0];
          this.curindex = 0;
          this.isEmpty = false;
          setTimeout(() => {
            this.$nextTick(() => {
              this.showGroupIcon();
            })
          }, 1000)
        }
      }
      else {
        setTimeout(() => {
          this.$nextTick(() => {
            this.showChat(this.showGroupList[groupIndex], groupIndex);
          })
        }, 500)
      }
      // ++this.needUpdate;
    },
    showImageOfMessage(imgSrcInfo) {
      console.log("showImageOfMessage and imgSrcInfo is ", imgSrcInfo)
      this.imageLayersSrcInfo = imgSrcInfo;
      this.showImageLayers = true;
    },
    closeImageOfMessage() {
      this.imageLayersSrc = '';
      this.showImageLayers = false;
    },
    leaveGroup(groupId) {
      console.log("leage group groupid is ", groupId);
      for(let i=0;i<this.originalGroupList.length;i++) {
        if(this.originalGroupList[i].group_id == groupId) {
            var dist = this.originalGroupList.splice(i, 1);
            console.log("slice this ", dist);
            break;
          }
        }
      this.curindex = -1;
      this.isEmpty = true;
      this.showGroupIcon();
    },
    updateChatGroupStatus(groupId, groupStatus, updateType) {
      // ++this.needUpdate;
      if(updateType == "top" || updateType == "slience") {
        console.log("updatechatgroupstatus ", groupStatus);
        var groupListTmp = this.showGroupList;
        for(var i=0;i<groupListTmp.length;i++) {
          if(groupListTmp[i].group_id === groupId) {
            groupListTmp[i].status = groupStatus;
            break;
          }
        }
        if(updateType == "top") {
          console.log("top")
          this.showGroupList = groupListTmp;
          this.$nextTick(() => {
            this.showGroupIcon()
          })
        }
      }
      else {
        this.updateChatGroupFavStatus(groupId, groupStatus)
      }
      // ++this.needUpdate;
    },
    updateChatGroupFavStatus(groupId, toFavourete) {
      // ++this.needUpdate;
      console.log("isFavourete ", toFavourete);
      for(var i=0;i<this.showGroupList.length;i++) {
        if(this.showGroupList[i].group_id === groupId) {
          if(toFavourete) {
            this.showGroupList[i].status = changeStr(this.showGroupList[i].status, 4, "1");
            console.log("this.showgourlist statues ", this.showGroupList[i].status);
          }
          else {
            this.showGroupList[i].status = changeStr(this.showGroupList[i].status, 4, "0");
          }
          break;
        }
      }
    },
    getUnreadClass(unReadCount, selected) {
      var endPoint = "-unselected";
      if(selected) {
        endPoint = "-selected";
      }
      if(unReadCount === 0) return "group-readall" + endPoint;
      else return "group-unread";
    },
    getUnReadCount(unReadCount) {
      if(unReadCount === 0) return "";
      else return unReadCount;
    },
    formatTimeFilter(secondsTime) {
      let curDate = new Date();
      let curDateSecond = curDate.getTime();
      let cutTime = curDateSecond - secondsTime;
      let curYeat = curDate.getUTCFullYear();
      let curMonth = curDate.getUTCMonth() + 1;
      let curDay = curDate.getDate();

      let distdate = new Date(secondsTime);
      let y = distdate.getUTCFullYear();
      let mon = distdate.getMonth() + 1;
      let d = distdate.getDate();
      let h = distdate.getHours();
      let m = distdate.getMinutes();
      let s = distdate.getSeconds();

      // console.log(distdate)
      // console.log(cutTime)
      // console.log(y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m) + ":" + Appendzero(s))

      if(cutTime < 24 * 3600 * 1000)
      {
        if(curDay - d === 0){
          return Appendzero(h) + ":" + Appendzero(m);
        }
        else{
          return "昨天 " + Appendzero(h) + ":" + Appendzero(m);
        }
      }
      else if((cutTime >= 24 * 3600 * 1000 && cutTime < 48 * 3600 * 1000))
      {
        if(curDay - d === 1){
          return "昨天 " + Appendzero(h) + ":" + Appendzero(m);
        }
        else{
          return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
        }
      }
      else
      {
        return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
      }
    },
    getMsgLastMsgTime(chatGroupItem) {
      var formatTime = ""
      var timesecond = Number(chatGroupItem.last_message_time) == 0 ? Number(chatGroupItem.updatetime) : Number(chatGroupItem.last_message_time);

      if(timesecond.length == 0) {
        return formatTime;
      }

      formatTime = this.formatTimeFilter(timesecond);
      return formatTime;
    },
    getIdThroughId(groupInfo) {
      return groupInfo.groupId;
    },
    // To get group_id uesed as current chat group's element id
    getChatElementId: function(groupId, uid) {
      // console.log("groupid ",groupId)
      // console.log("uid ",uid)
      if(groupId != undefined && uid != undefined) {
        if(uid.length == 0) {
          return "chat-groupList-" + groupId;
        }
        else {
          return "chat-groupList-" + groupId + "-" + uid;
        }
      }
      else if(groupId == undefined) {
        return "chat-groupList-" + uid;
      }
      else if(uid == undefined) {
        return "chat-groupList-" + groupId;
      }
    },
    getChatGroupNameElementId: function(groupId, uid) {
      if(groupId != undefined && uid != undefined) {
        return "chat-groupList-name-" + groupId + "-" + uid;
      }
      else if(groupId == undefined) {
        return "chat-groupList-name-" + uid;
      }
      else if(uid == undefined) {
        return "chat-groupList-name-" + groupId;
      }
    },
    getShowGroupName(chatGroupItem) {

      async function getUserNameFromDb(distUid) {
        var nameTemp = '';
        var userInfos = await services.common.GetDistUserinfo(distUid);
        if(userInfos.length == 0) {
          return nameTemp;
        }
        var distUserInfo = userInfos[0];
        if(distUserInfo != undefined){
          nameTemp = distUserInfo.user_display_name;
        }
        return nameTemp;
      }

      if(chatGroupItem === null){
        return "";
      }
      var groupName = chatGroupItem.group_name;
      if(groupName.length == 0) {
        var aboutUids = chatGroupItem.contain_user_ids.split(",");
        var groupUidNameList = [];
        for(var i=0;i<aboutUids.length;i++) {
          var userName = getUserNameFromDb(aboutUids[i]);
          userName.then((ret) => {
            if(ret.length != 0){
              // let nameTmp = this.$store.getters.getChatUserName(aboutUids[i]);
              groupName = groupName + "," + ret;
              // groupUidNameList.unshift(ret);
            }
          })
          if(i > 3) {
            break;
          }
        }
        groupName = groupUidNameList.toString();
      }
      return groupName
    },
    getShowMsgContent(chatGroupItem) {
      // console.log("getShowMsgContent is ", chatGroupItem)
      if(chatGroupItem === null){
        return "";
      }
      var chatGroupMsgContent = strMsgContentToJson(chatGroupItem.message_content);

      var chatGroupMsgType = chatGroupItem.message_content_type != undefined ? chatGroupItem.message_content_type : chatGroupItem.message_type;
      if(chatGroupMsgContent === null) {
        return "";
      }
      if(chatGroupMsgType === 101)
      {
        return chatGroupMsgContent.text;
      }
      else if(chatGroupMsgType === 102)
      {
        return "[图片]:" + chatGroupMsgContent.fileName;
      }
      else if(chatGroupMsgType === 103)
      {
        return "[文件]:" + chatGroupMsgContent.fileName;
      }
      else if(chatGroupMsgType === 104)
      {
        if(chatGroupMsgContent.type === "invitation")
        {
          var invitees = chatGroupMsgContent.userInfos;
          var inviteeNameList = [];
          var inviteeNames = "";
          if(invitees.length == 1){
              inviteeNames = invitees[0].userName
          }
          else{
              for(var i=0;i<invitees.length;i++) {
                  inviteeNameList.push(invitees[i].userName);
              }
              inviteeNames = inviteeNameList.join("、");
          }
          var inviter = chatGroupMsgContent.userName;
          return inviter + " 邀请 " + inviteeNames + " 加入群聊";
        }
        else if(chatGroupMsgContent.type === "notice")
        {
          var owner = chatGroupMsgContent.userName;
          return owner + " 发布群公告";
        }
        else if(chatGroupMsgContent.type === "updateGroupName")
        {
          var owner = chatGroupMsgContent.userName;
          var distName = chatGroupMsgContent.text;
          return owner + " 修改群名称为 " + distName;
        }
        else if(chatGroupMsgContent.type === "deleteGroupUser")
        {
            var owner = chatGroupMsgContent.userName;
            var deletedNames = "";
            var deletedUsers = chatGroupMsgContent.userInfos;
            if(deletedUsers.length == 1){
                deletedNames = deletedUsers[0].userName
            }
            else{
                for(var i=0;i<deletedUsers.length;i++) {
                    deletedNames = deletedNames + "、" + deletedUsers[i].userName
                }
            }
            return owner + " 将 " + deletedNames + " 移出了群聊";
        }
        else if(chatGroupMsgContent.type == "groupTransfer") {
            var originalOwner = chatGroupMsgContent.fromUserName;
            var newOwner = chatGroupMsgContent.toUserName;
            console.log("get return is ", originalOwner + " 将群主转让给 " + newOwner)
            return originalOwner + " 将群主转让给 " + newOwner;
        }
        else
        {
          return "您收到一条短消息";
        }
      }
      else if(chatGroupMsgType === 105)
      {
        return "[语音]";
      }
      else if(chatGroupMsgType === 106)
      {
        return "[聊天记录]";
      }
      return "收到一条短消息";
    },
    showChat: function(chatGroup, index) {
      this.isEmpty = false;
      this.unreadCount -= this.curChat.un_read_count;
      ipcRenderer.send("updateUnreadCount", this.unreadCount);
      services.common.MessageRead(this.curChat.group_id, this.curChat.sequence_id);
      this.curChat = chatGroup;
      this.curindex = index;
      this.unreadCount -= this.curChat.un_read_count;
      ipcRenderer.send("updateUnreadCount", this.unreadCount);
      services.common.MessageRead(this.curChat.group_id, this.curChat.sequence_id);
      this.curChat.un_read_count = 0;
    },
    getGroupList: async function(updateCurPage=false) {
        var ret = await services.common.GetAllGroups()
        console.log("sql getGroupList is ", ret)
        for(let i=0;i<ret.length;i++) {
          if(ret[i].contain_user_ids.length == 0 && ret[i].group_name.length ==0 && ret[i].owner.length == 0){
            continue;
          }
          this.originalGroupList.push(ret[i]);
          this.unreadCount += ret[i].un_read_count;
        }
        // this.originalGroupList = ret;
        console.log("length is ", ret)
        // if(updateCurPage){
        //   let chatGroupVar = [];
        //   chatGroupVar = this.showGroupList.sort(this.compare());
        //   let curGroup = chatGroupVar[0];
        //   console.log("getgrouplist the cur group is ", curGroup)
        //   // this.showChat(curGroup, 0);
        // }
    },
    compare: function() {
      return function(a, b)
      {
        var value1 = a.last_message_time == 0 ? a.updatetime : a.last_message_time;
        var value2 = b.last_message_time == 0 ? b.updatetime : b.last_message_time;;
        return value2 - value1;
      }
    },
    async callback(msg) {
      // console.log("chat callback msg is ", msg);
      console.log("chat callback msg content is ", msg.message_content);
      console.log("chat callback msg is ", msg)
      var msgContent = strMsgContentToJson(msg.message_content);
      if(msg.sequence_id != undefined && msg.sequence_id.length != 0) {
        var msgExist = await Message.FindMessageBySequenceID(msg.sequence_id);
        console.log("msg exist is ", msgExist);
        if(this.dealedMsgSequenceId.indexOf(msg.sequence_id) == -1) {
          this.dealedMsgSequenceId.push(msg.sequence_id);
        }
        else if(await Message.FindMessageBySequenceID(msg.sequence_id)) {
          console.log("return it ")
          return;
        }
        else {
          return;
        }
      }
      if(msgContent.type == undefined && msg.group_avarar != undefined) {
        this.mqttGroupVar.push(msg);
        return;
      }
      if(msg.statues != undefined && msg.status[6] == 1) {
        return;
      }
      if(msg.message_from_id != undefined && msg.message_from_id != this.curUserInfo.id){
        // console.log("process.platfrom is ", this.isWindows())
        var fromName = "收到一条新短消息";
        console.log("msg.messagefromid ", msg.message_from_id);
        var fromUserInfo = await UserInfo.GetUserInfo(msg.message_from_id);
        console.log("fromUserInfo ", fromUserInfo);
        if(fromUserInfo != undefined) {
          fromName = fromUserInfo.user_display_name;
        }
        var notificateContent = this.getShowMsgContent(msg);
        if(this.isWindows()) {
          ipcRenderer.send("flashIcon", fromName, notificateContent);
          this.amr.play();
        }
      }
      var groupExist = false;
      for(let i=0;i<this.showGroupList.length;i++) {
        if((this.showGroupList[i].group_id === msg.group_id)) {
          console.log("exit group is ", this.showGroupList[i])
          if(msgContent.type != undefined && msgContent.type == "invitation") {
            if(msgContent.userInfos != undefined) {
              let addUsers = msgContent.userInfos;
              for(let j=0;j<addUsers.length;j++) {
                let newUserId = addUsers[j].userId;
                if(this.showGroupList[i].contain_user_ids.indexOf(newUserId) == -1) {
                  this.showGroupList[i].contain_user_ids = this.showGroupList[i].contain_user_ids + "," + newUserId;
                }
              }
            }
          }
          if(msgContent.type != undefined && msgContent.type == "groupTransfer") {
            if(msgContent.toUserId != undefined) {
              let distUserId = msgContent.toUserId;
              this.showGroupList[i].owner = distUserId;
            }
          }
          if(msgContent.type != undefined && msgContent.type == "notice") {
            if(msgContent.text != undefined) {
              this.showGroupList[i].group_notice = msgContent.text;
            }
          }
          if(msgContent.type != undefined && msgContent.type == "deleteGroupUser") {
            if(msgContent.userInfos != undefined) {
              let deleteUsers = msgContent.userInfos;
              for(let j=0;j<deleteUsers.length;j++) {
                var deletedUserId = deleteUsers[j].userId;
                var idsList = this.showGroupList[i].contain_user_ids.split(",");
                var deleteIndex = idsList.indexOf(deletedUserId);
                if(deleteIndex != -1) {
                  idsList.splice(deleteIndex, 1);
                }
                this.showGroupList[i].contain_user_ids = idsList.join(",");
              }
            }
          }
          if(msg.message_from_id != this.curUserInfo.id && msg.group_id != this.curChat.group_id) {
            let groupInfo = await Group.FindItemFromGroupByGroupID(msg.group_id);
            if(!this.groupIsSlience(groupInfo)) {
              this.showGroupList[i].un_read_count += 1;
              this.unreadCount += 1;
              ipcRenderer.send("updateUnreadCount", this.unreadCount);
            }
          }
          this.showGroupList[i].last_message_time = msg.message_timestamp;
          this.showGroupList[i].message_content = msg.message_content;
          this.showGroupList[i].message_content_type = msg.message_type != undefined ? msg.message_type : msg.message_content_type;
          this.showGroupList[i].message_from_id = msg.message_from_id;
          this.showGroupList[i].message_id = msg.message_id;
          this.showGroupList[i].sequence_id = msg.sequence_id;
          if(this.showGroupList[i].group_type == 102) {
            this.showGroupList[i].group_id = msg.group_id;
          }
          if(msg.group_id == this.curChat.group_id) {
            if(msgContent.type == "updateGroupName") {
              this.showGroupList[i].group_name = msgContent.text;
              let groupInfo = await Group.FindItemFromGroupByGroupID(msg.group_id);
              var distElementId = this.getChatGroupNameElementId(msg.group_id, groupInfo.user_id);
              var distElement = document.getElementById(distElementId);
              if(distElement != undefined) {
                distElement.innerHTML = msgContent.text;
              }
              this.newMsg = msg;
            }
            else{
              this.curChat = this.showGroupList[i];
              this.newMsg = msg;
            }
          }
          if(msgContent.type != undefined && msgContent.type == "deleteGroupUser") {
              let distUsers = msgContent.userInfos;
              let distUserIds = [];
              for(let i=0;i<distUsers.length;i++) {
                distUserIds.push(distUsers[i].userId);
              }
              if(distUserIds.indexOf(this.curUserInfo.id) != -1) {
                for(let i=0;i<this.showGroupList.length;i++) {
                  if(this.showGroupList[i].group_id == msg.group_id) {
                      this.showGroupList.slice(i, 1);

                      var owner = msgContent.userName;
                      var alertContent = "您被 " + owner + " 移出了群聊";

                      alert(alertContent);
                      break;
                    }
                  }
              }
          }
          if(msg.message_from_id != undefined && msg.message_from_id == this.curUserInfo.id) {
            this.curindex = i;
          }
          groupExist = true;
          break;
        }
        if((this.showGroupList[i].group_id == undefined || this.showGroupList[i].group_id.length == 0) && this.showGroupList[i].group_type == 102 && msgContent.type != "invitation") {
          console.log("no group id item is ", this.showGroupList[i]);
          console.log("cur msg is ", msg);
          // var distFromName = await Group.SearchByNameKey(this.showGroupList[i].group_name);
          var distFromName = await services.common.GetGroupByName(this.showGroupList[i].group_name);
          console.log("distFromName is ", distFromName)
          for(let j=0;j<distFromName.length;j++) {
            let distGroup = distFromName[j];
            console.log("distGroup is ", distGroup)
            console.log("this.showGroupList[i].group_name ", this.showGroupList[i].group_name);
            if(distGroup.group_name == this.showGroupList[i].group_name && distGroup.group_type == 102) {
              console.log("find dist grou pis ", distGroup);
              this.showGroupList[i].group_id = distGroup.group_id;
              this.showGroupList[i].group_avarar = distGroup.group_avarar;
              // if(distGroup.last_message_time > msg.message_timestamp) {
              //   this.showGroupList[i].last_message_time = distGroup.last_message_time;
              //   this.showGroupList[i].message_content = distGroup.message_content;
              //   this.showGroupList[i].message_content_type = distGroup.message_content_type;
              //   this.showGroupList[i].message_from_id = distGroup.message_from_id;
              //   this.showGroupList[i].message_id = distGroup.message_id;
              //   this.showGroupList[i].sequence_id = distGroup.sequence_id;
              // }
              // else {
                this.showGroupList[i].last_message_time = msg.message_timestamp;
                this.showGroupList[i].message_content = msg.message_content;
                this.showGroupList[i].message_content_type = msg.message_type;
                this.showGroupList[i].message_from_id = msg.message_from_id;
                this.showGroupList[i].message_id = msg.message_id;
                this.showGroupList[i].sequence_id = msg.sequence_id;
                this.showGroupList[i].time_line_id = msg.time_line_id;
              // }
              this.showGroupList[i].owner = distGroup.owner;
              let tmp = distGroup.un_read_count - this.showGroupList[i].un_read_count;
              this.showGroupList[i].un_read_count = distGroup.un_read_count;
              this.unreadCount += tmp;
              ipcRenderer.send("updateUnreadCount", this.unreadCount);
              groupExist = true;
              this.needUpdate ++;
              break;
            }
          }
          if(msg.message_from_id != undefined && msg.message_from_id == this.curUserInfo.id) {
            this.curindex = i;
          }
          groupExist = true;
        }
      }
      if(!groupExist) {
          let groupInfo = await Group.FindItemFromGroupByGroupID(msg.group_id);
          console.log("groupinfo is ", groupInfo);
          console.log("this.mqttGroupVar is ", this.mqttGroupVar);
          if(groupInfo == undefined) {
            console.log("groupInfo is undefined");
            console.log("this.mqttGroupVar.length is ", this.mqttGroupVar.length);
            for(let i=0;i<this.mqttGroupVar.length;i++) {
              if(this.mqttGroupVar[i].group_id == msg.group_id) {
                console.log("this.mqttGroupVar[i] is ", this.mqttGroupVar[i]);
                var groupTmp = {
                  "contain_user_ids": this.mqttGroupVar[i].contain_user_ids,
                  "group_avarar": this.mqttGroupVar[i].group_avarar,
                  "group_id": this.mqttGroupVar[i].group_id,
                  "group_name": this.mqttGroupVar[i].group_name,
                  "group_notice": this.mqttGroupVar[i].group_notice,
                  "group_type": this.mqttGroupVar[i].group_type,
                  "owner": this.mqttGroupVar[i].owner,
                  "status": this.mqttGroupVar[i].status,
                  "updatetime": this.mqttGroupVar[i].updatetime,
                  "un_read_count": this.mqttGroupVar[i].un_read_count,
                  "message_content": msg.message_content,
                  "message_content_type": msg.message_type,
                  "message_from_id": msg.message_from_id,
                  "message_id": msg.message_id,
                  "last_message_time": msg.message_timestamp,
                  "sequence_id": msg.sequence_id,
                  "time_line_id": msg.time_line_id,
                }
                console.log("groupTmp is ", groupTmp);
                this.showGroupList.unshift(groupTmp);
                console.log("update show group list ", this.showGroupList);
                this.mqttGroupVar.slice(i, 1);
                this.unreadCount += this.mqttGroupVar[i].un_read_count;
                ipcRenderer.send("updateUnreadCount", this.unreadCount);
                break;
              }
            }
            // needUpdate ++;
          }
          else {
            console.log("update groupInfo ", groupInfo);
            var groupTmp = {
              "contain_user_ids": groupInfo.contain_user_ids,
              "group_avarar": groupInfo.group_avarar,
              "group_id": groupInfo.group_id,
              "group_name": groupInfo.group_name,
              "group_notice": groupInfo.group_notice,
              "group_type": groupInfo.group_type,
              "owner": groupInfo.owner,
              "status": groupInfo.status,
              "updatetime": groupInfo.updatetime,
              "un_read_count": groupInfo.un_read_count,
              "message_content": msg.message_content,
              "message_content_type": msg.message_type,
              "message_from_id": msg.message_from_id,
              "message_id": msg.message_id,
              "last_message_time": msg.message_timestamp,
              "sequence_id": msg.sequence_id,
              "time_line_id": msg.time_line_id,
            }
            console.log("groupTmp is ", groupTmp);
            this.originalGroupList.unshift(groupTmp);
            this.unreadCount += groupInfo.un_read_count;
            ipcRenderer.send("updateUnreadCount", this.unreadCount);
            console.log("update show group list ", this.showGroupList);
            // needUpdate ++;
          }
      }
      this.showGroupIcon();
    },
    delayCallback: function(msg) {
      setTimeout(() => {
        this.callback(msg);
      }, 100)
    }
  },
  mounted: async function() {
    console.log("chat content mounted");
      // When Mounting Can Not Get The Element. Here Need SetTimeout
      await this.getGroupList(false);
      console.log("this.originalgrouplsit count is ", this.originalGroupList.length)
      // for(let i=0;i<this.originalGroupList.length;i++) {
      //   if(this.originalGroupList[i].group_name == "武汉测试") {
      //     console.log("this.originalkjflkajlsdjfl;j  ", this.originalGroupList[i]);
      //   }
      //   this.unreadCount += this.originalGroupList[i].un_read_count;
      // }
      console.log("this.unreadCount ", this.unreadCount);
      ipcRenderer.send("updateUnreadCount", this.unreadCount);
      setTimeout(() => {
          this.$nextTick(() => {
            ipcRenderer.on('updateGroupImg', this.updateGroupImg);
            this.showGroupIcon();
          })
      }, 0)
      
        ipcRenderer.on('SearchAddGroup', this.SearchAddGroup)
        ipcRenderer.on('SearchAddSenders', this.searchAddSenders)
  },
  created: async function() {
    await services.common.init();
    this.curUserInfo = await services.common.GetSelfUserModel();
    await services.common.initmqtt();
    services.common.handlemessage(this.delayCallback);
    if(this.amr == null){
        this.amr = new BenzAMRRecorder();
        console.log("=========================")
        console.log(path.join(__dirname, "../../../static/sound.wav"))
        this.amr.initWithUrl(path.join(__dirname, "../../../static/sound.wav"))
    }
  }
};
</script>

<style lang="scss" scoped>
  ::-webkit-scrollbar-track-piece {
    background-color: #F1F1F1;
    border-radius: 5px;
  }

  ::-webkit-scrollbar {
    width: 7px;
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

  .chat-wind {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin: 0px;
  }

  .chat-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    margin: 0px;
  }

  .chat-empty {
    width:100%;
    margin-top: 20px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;  
    position: relative;
    // -webkit-app-region: drag;
  }
  // * {
      
  //     -webkit-app-region: no-drag;
  // }

  .chat-empty-bg {
    width: 168px;
    height: 168px;
    background-color: white;
  }

  .chat {
    width:100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    position: relative;
    margin-top: 20px;
    -webkit-app-region: drag;
  }
  * {
      
      -webkit-app-region: no-drag;
  }

  .chat-list {
    height: 100%;
    width: 280px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgb(221, 221, 221);
    -webkit-app-region: drag;
  }

  .list-header {
    width: 100%;
    height: 41px;
    line-height: 41px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    margin: 0px 0px 0px 0px;
    display: block;
    margin-top: 20px;
  }

  .chat-label {
    float: left;
    font-size: 13px;
    height: 35px;
    line-height: 35px;
    padding: 0px 0px 0px 20px;
    margin: 0px;
    display: none;
    background-color: rgb(239,240,241);
  }

  .search-list-content {
    height: 100%;
    overflow-y: scroll;
    
    ::-webkit-scrollbar-track {
      border-radius: 10px;
    }
  }

  .search-list-content-people {
    width: 100%;
    max-height: 220px;
    padding: 0;
    margin: 0;
    display: block;
  }

  .search-list-content-label {
    width: calc(100%-32px);
    height: 32px;
    line-height: 32px;
    color: rgba(102, 102, 102, 1);
    font-size: 12px;
    padding-left: 16px;
    margin: 0;
    background-color: rgba(247, 248, 250, 1);
    display: block;
  }

  .search-list-content-content {
    width: 100%;
    height: calc(100% - 64px);
    padding: 0;
    margin: 0;
    display: block;
    overflow: hidden;
  }

  .search-list-content-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  .search-item {
    height: 52px;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }
  
  .search-item:hover {
    height: 52px;
    background-color: rgba(221, 221, 221, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .search-item-img-div {
    position:relative;
    width: 32px;
    height: 32px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
    vertical-align: top;
  }

  .search-item-img-ico {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 32px;
    height: 32px;
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
  }

  .search-item-info {
    display: inline-block;
    height: 100%;
    width: calc(100% - 70px);
    margin-left: 10px;
  }

  .search-item-info-more {
    display: inline-block;
    height: 100%;
    width: calc(100% - 70px);
    margin-left: 10px;
    cursor: pointer;
  }

  .search-item-name {
    width: 100%;
    height: 20px;
    font-size: 14px;
    font-weight: medium;
    font-family:Microsoft Yahei;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 7px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .search-item-position {
    width: 100%;
    font-size: 13px;
    color: rgba(153, 153, 153, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 2px;
    margin-right: 0px;
    margin-bottom: 7px;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 18px;
  }

  .search-list-content-more-div {
    width: calc(100%-32px);
    height: 24px;
    line-height: 24px;
    color: rgba(36, 179, 107, 1);
    font-size: 12px;
    padding-left: 16px;
    margin: 0;
    background-color: rgba(255, 255, 255, 1);
    display: block;
    cursor: pointer;
  }

  .search-list-content-message {
    width: 100%;
    max-height: 268px;
    padding: 0;
    margin: 0;
    display: block;
  }
 
  .search-list-content-message-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  .search-list-file-content {
    width: 100%;
    height: 260px;
    padding: 0;
    margin: 0;
  }

  .search-list-content-file {
    width: 100%;
    height: 220;
    padding: 0;
    margin: 0;
    display: block;
  }

  .list-content {
    height: 100%;
    overflow: scroll;
    
    ::-webkit-scrollbar-track {
      border-radius: 10px;
    }
  }

  .group-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  .group {
    height: 60px;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group-top {
    height: 60px;
    background-color: rgba(243, 244, 247, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group-top:hover {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group-top.active {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group:hover {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group.active {
    height: 60px;
    background-color: rgba(221, 221, 221, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .group-ico {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 40px;
    height: 40px;
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    // z-index:-1;
  }

  .group-img {
    position:relative;
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
  }
  
  .group-info {
    display: inline-block;
    height: 100%;
    width: calc(100% - 140px);
    margin-left: 10px;;
  }

  .group-name {
    width: 100%;
    height: 20px;
    font-size: 14px;
    font-weight: medium;
    font-family:Microsoft Yahei;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .group-content {
    width: 100%;
    font-size: 13px;
    color: rgba(153, 153, 153, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 2px;
    margin-right: 0px;
    margin-bottom: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 18px;
  }

  .group-notice {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 56px;
    padding-right: 8px;
  }

  .group-time {
    font-size: 12px;
    color: rgba(187, 187, 187, 1);
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 2px;
    height: 18px;
    text-align: right;
  }

  .group-unread {
    position: absolute;
    top: -7px;
    right: -7px;
    font-size: 10px;
    font-family:Microsoft Yahei;
    float: right;
    color: rgb(255, 255, 255);
    margin: 0px;
    text-align: center;
    height: 14px;
    width: 14px;
    line-height: 14px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 1);
    // z-index:-1;
  }

  .group-readall-selected {
    position: absolute;
    top: 7px;
    right: 7px;
    font-size: 10px;
    font-family:Microsoft Yahei;
    float: right;
    color: rgb(255, 255, 255);
    margin: 0px;
    text-align: center;
    height: 14px;
    width: 14px;
    line-height: 14px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 0);
  }
  
  .group-readall-unselected {
    position: absolute;
    top: 7px;
    right: 7px;
    font-size: 10px;
    font-family:Microsoft Yahei;
    float: right;
    color: rgb(255, 255, 255);
    margin: 0px;
    text-align: center;
    height: 14px;
    width: 14px;
    line-height: 14px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 0);
  }

  .group-slience {
    float: right;
    color: rgb(255, 255, 255);
    height: 20px;
    width: 20px;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 10px;
    background-color: rgba(228, 49, 43, 0);
    background-image: url("../../../static/Img/Chat/slience-20px.png");
  }
</style>
