<template>
    <div class="chat-wind">
      <div class="chat-panel" id="chat-panel-id">
        <div class="chat-list">
          <div class="list-header">
            <listHeader 
              :cleanSearchKey="cleanSearchKey" 
              @getCreateGroupInfo="getCreateGroupInfo" 
              @toSearch="toSearch"
              @viewRoom="viewRoom"
            />
          </div>
          <p class="chat-label">普通</p>
          <div class="list-content" id="list-content-id" v-show="!isSearch" :key="needUpdate">
            <!-- <ul class="group-list"> -->
            <transition-group class="group-list" name="group-list" tag="ul">
              <li :class="groupOrTopClassName(chatGroupItem, index)"
                  v-for="(chatGroupItem, index) in dealShowGroupList"
                  @click="showChat(chatGroupItem, index)"
                  @contextmenu="rightClick($event, chatGroupItem)"
                  v-bind:key="ChatGroupId(chatGroupItem)"
                  >
                <div :class="groupDivOrTopClassName(chatGroupItem, index)">
                  <!-- <listItem @groupInfo="chatGroupItem"/> -->
                  <div class="group-img">
                    <!-- <avatar-block :ownerName="chatGroupItem.name"></avatar-block> -->
                    <img class="group-ico" :id="chatGroupItem.roomId" src="../../../static/Img/User/group-40px@2x.png"/>
                    <p :class="getUnreadClass(chatGroupItem, index===curindex, chatGroupItem.status)">{{getShowUnReadCount(chatGroupItem.un_read_count)}}</p>
                    <img class="secret-flag" src="../../../static/Img/Chat/secretFlag.png" v-show="isSecret(chatGroupItem)">
                  </div>
                  <div class="group-info">
                    <p class="group-name" :id="getChatGroupNameElementId(chatGroupItem.group_id, chatGroupItem.user_id)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-content">{{getShowMsgContent(chatGroupItem)}}</p>
                  </div>
                  <div class="group-notice">
                    <p class="group-time">{{getMsgLastMsgTime(chatGroupItem)}}</p>
                    <p class="group-slience" v-show="groupIsSlience(chatGroupItem)"></p>
                  </div>
                </div>
              </li>
            <!-- </ul> -->
            </transition-group>
          </div>
          <div class="search-list-content" id="search-list-content-id" v-show="isSearch">
            <div class="search-list-content-people" id="search-list-content-people-id" v-show="showSearchPeople">
              <div class="search-list-content-label">联系人</div>
              <div class="search-list-content-content">
                <ul class="search-list-content-list">
                  <li class="search-item"
                      v-for="searchPeopleItem in searchPeopleItems"
                      @click="showPeopleInfo($event, searchPeopleItem)"
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
              <div class="search-list-content-more-div" @click="showAllSearchUsers" v-show="showSearchAllMember">查看全部 >></div>
            </div>
            <div class="search-list-content-message" id="search-list-content-message-id" v-show="showSearchMessage">
              <div class="search-list-content-label">聊天记录</div>
              <div class="search-list-content-content">
                <ul class="search-list-content-list">
                  <li class="search-item"
                      v-for="searchMessageItem in searchMessageItems"
                      @click="showGroup(searchMessageItem)"
                      >
                    <div class="search-item-img-div">
                      <img class="search-item-img-ico" :id="getSearchItemElementId(searchMessageItem.groupId)" src="../../../static/Img/User/user-40px@2x.png"/>
                    </div>
                    <div class="search-item-info">
                      <p class="search-item-name">{{searchMessageItem.groupName}}</p>
                      <p class="search-item-position">包含{{searchMessageItem.count}}条相关聊天记录</p>
                    </div>
                  </li>
                  <li class="search-item" v-show="showSearchAllChat">
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
              <div class="search-list-content-more-div" v-show="showsearchAllFile">
                <div class="search-list-content-more-label" @click="showAllSearchFiles">查看全部 >></div>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-empty" v-show="isEmpty">
          <div class="win-header">
            <winHeaderBar @getCreateGroupInfo="getCreateGroupInfo" @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
          </div>
          <img class="chat-empty-bg" src="../../../static/Img/Chat/empyt2@2x.png">
        </div>
        <div class="chat" v-show="!isEmpty">
          <div class="win-header">
            <winHeaderBar @getCreateGroupInfo="getCreateGroupInfo" @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
          </div>
          <ChatPage :chat="curChat" :newMsg="newMsg" :toBottom="toBottom" @updateChatList="updateChatList" @showImageOfMessage="showImageOfMessage" @getCreateGroupInfo="getCreateGroupInfo" @leaveGroup="leaveGroup" @updateChatGroupStatus="updateChatGroupStatus" @closeUserInfoTip="closeUserInfoTip" @forceUpdateGroupList="forceUpdateGroupList"></ChatPage>
        </div>
      </div>
      <searchSenderSelecterDlg v-show="showSearchSelectedSenderDlg" @closeSearchSenderSelectDlg="closeSearchSenderSelectDlg" :rootDepartments="searchSelectedSenderDialogRootDepartments" :selectedUsers="searchSelectedSenders" :dialogTitle="searchSelectedSenderDialogTitle" :key="searchAddSenderKey">
      </searchSenderSelecterDlg>
      <searchChatSelecterDlg  v-show="showSearchSelecterDlg" @closeSearchChatFilterDlg="closeSearchChatFilterDlg" :searchSelectedGroupIds="searchSelectedGroupIds" :recentGroups="recentGroups" :key="searchSelectedGroupKey">
      </searchChatSelecterDlg>
      <imageLayer :imgSrcInfo="imageLayersSrcInfo" v-show="showImageLayers" @closeImageOfMessage="closeImageOfMessage"/>
      <userInfoContent id="userInfoId" :userInfo="userInfo" :isOwn="isOwn" :originPosition="userInfoPosition" v-show="showUserInfoTips" @getCreateGroupInfo="getCreateGroupInfo" :key="userInfoTipKey"></userInfoContent> 
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
import userInfoContent from './user-info';
// import avatarBlock from './avatar.vue';
import {shell} from 'electron'
import confservice from '../../packages/data/conf_service.js'
import log from 'electron-log';
const {Menu, MenuItem, clipboard, nativeImage} = remote;
import {mapState} from 'vuex';

export default {
  components: {
    ChatPage,
    listHeader,
    winHeaderBar,
    imageLayer,
    searchChatSelecterDlg,
    searchSenderSelecterDlg,
    userInfoContent,
    // avatarBlock,
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
    },
    // matrixSync: {
    //   type: Boolean,
    //   default: false
    // }
    //['distUserId', 'distGroupId'],
  },
  watch: {
    distUserId: async function() {
      console.log("in chat content distuserid is ", this.distUserId);
      if(this.distUserId.length != 0) {
        const existingRoom = this.getDMRoomForIdentifiers([this.distUserId]);
        if(existingRoom){
          this.getCreateGroupInfo(existingRoom)
        }
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
    updateImg: async function() {
      // console.log("in chat content updateImg ");
      this.showGroupIcon();
      if(this.distGroupId.length != 0) {
        var distInfo = await Group.FindItemFromGroupByGroupID(this.distGroupId);
        if(distInfo != undefined) {
          this.getCreateGroupInfo(distInfo);
        }
      }
      else {
        this.toBottom = true;
        this.$nextTick(() => {
          this.toBottom = false;
        })
      }
    },
    matrixSync: function() {
      if (this.matrixSync) {
        global.mxMatrixClientPeg.matrixClient.getRooms().forEach((r) => {
          console.log("this is ", r);
          console.log("r.getMyMembership() ", r.getMyMembership());
          if(r.getMyMembership() != "LEAVE") {
            this.showGroupList.push(r);
          }
        })
        this.$nextTick(() => {
          this.showGroupIcon();
        })
        global.mxMatrixClientPeg.matrixClient.on('RoomMember.membership', async (event, member) => {
            console.log("join room:" + member.roomId);
            console.log("event is ", event);
            console.log("member is ", member);
            setTimeout(() => {
              this.showGroupList = [];
              console.log('rooms again', global.mxMatrixClientPeg.matrixClient.getRooms());
              global.mxMatrixClientPeg.matrixClient.getRooms().forEach((r) => {
                if(r.getMyMembership() != "LEAVE") {
                  this.showGroupList.push(r);
                }
              })
              this.$nextTick(() => {
                this.showGroupIcon();
              })
            }, 1600)
        })
      }
    }
  },
  computed: {
    ...mapState({
      matrixSync: state => state.common.matrixSync
    }),
    dealShowGroupList: function() {
      return this.showGroupList
    }
  },
  data() {
    return {
      //需要展示的用户群组
      toBottom: false,  //聊天页面是否滚动到最底部
      showSearchAllChat: false,   //复合搜索中是否显示  显示所有聊天相关
      showSearchAllMember: false,   //复合搜索中是是否显示  显示所有联系人相关
      showsearchAllFile: false,   //复合搜索中是否是否显示  显示所有文件相关
      showUserInfoTips: false,   //聊天窗口显示用户信息弹窗
      isOwn: false,   //用户信息弹窗是否展示的自己的信息
      userInfo: {},   //用户信息弹窗获取用户信息
      userInfoPosition: {},   //用户信息弹窗位置
      userInfoTipKey: 1,   //用户信息弹窗强制更新
      amr: null,    //播放语音信息控件初始化
      unreadCount: 0,   //未读消息数
      cleanSearchKey: false,   //复合搜索是否清理搜索关键字
      dealedMsgSequenceId:[],   //callback中对已处理过的消息做记录
      searchSelectedSenderDialogRootDepartments: [],      //聊天记录搜索页面聊天群组过滤信息界面需要的部门信息
      searchSelectedSenderDialogTitle: "",   //聊天记录搜索页面聊天群组过滤界面title
      searchSelectedSenders: [],      //聊天记录搜索页面聊天群组过滤界面结果
      searchAddSenderKey: 199,      //聊天记录搜索页面聊天群组过滤界面强制更新
      recentGroups: [],      //聊天记录搜索页面发送者过滤界面内容
      searchSelectedGroupKey: 99,      //聊天记录搜索页面发送者过滤界面强制更新
      searchSelectedGroupIds:[],      //聊天记录搜索页面发送者过滤界面用户id
      showSearchSelectedSenderDlg: false,      //是否显示聊天记录搜索页面发送者过滤界面
      showSearchSelecterDlg: false,      //是否显示聊天记录搜索页面聊天群组过滤界面内容
      showSearchMessage: true,      //复合搜索内容是否包含消息相关
      showSearchFile: true,      //复合搜索内容是否包含文件相关
      showSearchPeople: true,      //复合搜索内容是否包含人员相关
      searchPeopleItems: [],      //复合搜索人员条目
      searchFileItems: [],      //复合搜索文件条目
      searchMessageItems: [],      //复合搜索聊天条目
      needScroll: false,      //群组是否滚动
      isSearch: false,      //展示是否是复合搜索
      curChat: {},      //当前chat
      needUpdate: 1,      //页面强制更新（好像没用到）
      curindex: -1,      //当前索引
      searchKey: '',      //复合搜索关键字
      normalGroupList: [],      //没用到
      encryptGroupList: [],      //没用到
      showGroupList: [],      //存储获取到的grouplist信息  *重要 群组列总数据
      topGroupVar: [],      //指定的group信息
      showImageLayers: false,      //打开图片
      imageLayersSrcInfo: '',      //打开图片信息
      clickedGroupList: [],      //没用到
      isEmpty: true,      //没有群组选中时候右侧占位图片
      groupListElement: null,      //dom
      newMsg: {},      //转发之类的消息信息
      mqttGroupVar: [],      //一些不完整的group的临时存储
      searchId: 0,      //复合搜索,
      matrixClient: undefined,
      roomToUser: null,
    };
  },
  methods: {
    getDMRoomForIdentifiers(ids) {
        const client = window.mxMatrixClientPeg.matrixClient;
        // TODO: [Canonical DMs] Handle lookups for email addresses.
        // For now we'll pretend we only get user IDs and end up returning nothing for email addresses
        let commonRooms = global.mxMatrixClientPeg.getDMRoomsForUserId(ids[0]);
        console.log('---commonRooms ids---', ids);
        console.log('---commonRooms---', commonRooms);
        for (let i = 1; i < ids.length; i++) {
            const userRooms = global.mxMatrixClientPeg.getDMRoomsForUserId(ids[i]);
            commonRooms = commonRooms.filter(r => userRooms.includes(r));
        }
        console.log('---commonRooms 222222222', commonRooms);
        commonRooms.forEach(c => {
            console.log('ccccc', c);
            const room = global.mxMatrixClientPeg.matrixClient.getRoom(c);
            console.log('叉叉叉', room);

        })
        const joinedRooms = commonRooms.map(r => global.mxMatrixClientPeg.matrixClient.getRoom(r))
            .filter(r => r && r.getMyMembership() === 'join');
        console.log('---joinedRooms---', joinedRooms);   
        return joinedRooms[0];
    },
    viewRoom(room) {
      console.log('---new rooms---',  newRooms);
      const newRooms = global.mxMatrixClientPeg.matrixClient.getRooms();
      for(let i=0; i<newRooms.length; i++) {
        console.log('xie1--', newRooms[i].roomId);
        console.log('xie2--', room.room_id);
        if (newRooms[i].roomId === room.room_id) {
          console.log('---to show---');
          return this.showChat(newRooms[i], i);
        }
      }
      setTimeout(()=>{this.viewRoom(room)}, 160);
    },
    isSecret(item) {
      return global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(item.roomId);
    },
    ChatGroupId(item) {
      return "chat-v-bind-" + item.roomId;
    },
    updateChatList(newMsg, needScroll=true) {
      // ++this.needUpdate;
      this.needScroll = needScroll;
      if(this.curChat.group_type == 102 && (this.curChat.group_id == undefined || this.curChat.group_id.length == 0)) {
        this.callback(newMsg, true);
      }
      else{
        this.callback(newMsg, false);
      }
    },
    eventUpdateChatList(event, newMsg) {
      console.log("updateChatList newMsg ", newMsg);
      // ++this.needUpdate;
      if(this.curChat.group_type == 102 && (this.curChat.group_id == undefined || this.curChat.group_id.length == 0)) {
        this.callback(newMsg, true);
      }
      else{
        this.callback(newMsg, false);
      }
    },
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
    showFileInfo: async function(fileInfo) {
      console.log("showfileINfo file info is ", fileInfo);
      var targetPath = await services.common.GetFilePath(fileInfo.msgId);
      var chatGroupMsgContent = fileInfo.content;
      var targetFileName = chatGroupMsgContent.fileName;
      var theExt = path.extname(targetFileName);
      if(!fs.existsSync(targetPath)) {
        var targetDir = confservice.getFilePath(fileInfo.timestamp);
        var targetPath = path.join(targetDir, targetFileName);
      }
      var needOpen = false;
      console.log("targetPath is ", targetPath)
      if(!fs.existsSync(targetPath)){
        // console.log("this.msg.timelineid is ", fileInfo.timelineId)
        // console.log("targetfilename is ", targetFileName);
        
        services.common.downloadFile(fileInfo.timelineId, fileInfo.timestamp, targetFileName, true, chatGroupMsgContent.fileSize);
        this.$toastMessage({message:'文件正在下载，请稍后', time:1500, type:'success'});
      }
      else {
        shell.openItem(targetPath);
      }
    },
    closeUserInfoTip: function() {
      this.showUserInfoTips = false;
    },
    showGroup: async function(groupInfo) {
      // console.log("in chat content distGroupId is ", groupInfo);
      if(groupInfo.groupId.length != 0) {
        var distInfo = await Group.FindItemFromGroupByGroupID(groupInfo.groupId);
        if(distInfo != undefined) {
          this.getCreateGroupInfo(distInfo);
        }
      }
    },
    showPeopleInfo: async function(event, tipInfos) {
      // console.log("event is ", event);
      // console.log("tip inso if ", tipInfos);
      if(tipInfos == undefined) {
          this.showUserInfoTips = false;
          return;
      }
      var distUserInfo = tipInfos;
      // var iconElement = document.getElementById(id);
      this.userInfoPosition.left = event.clientX;
      this.userInfoPosition.top = event.clientY;
      // console.log(iconElement.getBoundingClientRect());
      var tempUserInfo = {};
      //get userinfo
      var user = await UserInfo.GetUserInfo(distUserInfo.id);
      tempUserInfo.id = user.user_id;
      tempUserInfo.avatarTUrl = user.avatar_t_url;
      tempUserInfo.displayName = user.user_display_name;
      tempUserInfo.title = user.user_title;
      tempUserInfo.statusDescription = user.status_description;
      tempUserInfo.workDescription = user.work_description;
      tempUserInfo.managerId = user.manager_id;
      tempUserInfo.departmentId = user.belong_to_department_id;
      
      //get department
      var department = await Department.GetDepartmentInfoByUserID(distUserInfo.id);
      tempUserInfo.department = department;
      //get email
      var email = await UserInfo.GetUserEmailByUserID(distUserInfo.id);
      tempUserInfo.email = email;
      //get phone
      var phone = await UserInfo.GetUserPhoneByUserID(distUserInfo.id);
      var tempPhone = {};
      for (var i = 0; i < phone.length; i ++){
          var temp = phone[i];
          if(temp.phone_type == 'mobile'){
              tempPhone.mobile = temp.phone_value;
          }else{
              tempPhone.work = temp.phone_value;
          }
      }
      tempUserInfo.phone = tempPhone;
      var leaders = await UserInfo.GetLeaders(distUserInfo.id);
      tempUserInfo.leaders = leaders;
      console.log("tetempUserInfo is ", tempUserInfo);

      this.userInfo = tempUserInfo;
      this.userInfoTipKey ++;
      this.showUserInfoTips = true;
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
      // console.log("this.curindex is ", this.curindex);
      // console.log("cur index is ", index);
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
    groupDivOrTopClassName(item, index) {
      if(index == this.curindex) {
        return "group-div active";
      }
      if(this.groupIsTop(item)) {
        return "group-div-top";
      }
      else {
        return "group-div";
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
        var isSecret = false;
        if(groupItem.key_id != undefined && groupItem.key_id.length != 0 && groupItem.group_type == 102) {
          isSecret = true;
        }
        this.menu = new Menu();
        // console.log("this.unreadCount ", this.unreadCount)
        // console.log("groupItem.un_read_count ", groupItem.un_read_count)
        // this.unreadCount = this.unreadCount - groupItem.un_read_count;
        // console.log("rightClick ", this.unReadCount);
        // ipcRenderer.send("updateUnreadCount", this.unreadCount);
        if(groupItem.un_read_count != 0) {
          this.menu.append(new MenuItem({
              label: "标记已读",
              click: () => {
                  this.clesrUnread(groupItem)
              }
          }));
        }
        if(!isSecret) {
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
              this.unreadCount = this.unreadCount - groupItem.un_read_count;
              if(this.unreadCount < 0) {
                this.unreadCount = 0;
              }
              ipcRenderer.send("updateUnreadCount", this.unreadCount);
          })
    },
    setUnSlience: async function(groupItem){
      var groupIsTop = this.groupIsTop(groupItem);
      services.common.GroupStatus(groupItem.group_id, groupIsTop, false)
          .then((ret) => {
              this.updateChatGroupStatus(groupItem.group_id, ret, "slience");
              this.unreadCount = this.unreadCount + groupItem.un_read_count;
              if(this.unreadCount < 0) {
                this.unreadCount = 0;
              }
              ipcRenderer.send("updateUnreadCount", this.unreadCount);
              console.log("slienceStateChange ", ret);
          })
    },
    clesrUnread(groupItem) {
      // this.isEmpty = false;
      var isSecret = false;
      if(groupItem.key_id != undefined && groupItem.key_id.length != 0 && groupItem.group_type == 102) {
        isSecret = true;
      }
      services.common.MessageRead(groupItem.group_id, groupItem.sequence_id, isSecret);
      this.unreadCount = this.unreadCount - groupItem.un_read_count;
      // console.log("clesrUnread ", this.unreadCount);
      // console.log("groupItem ", groupItem);
      // console.log("groupItem.un_read_count ", groupItem.un_read_count);
      if(this.unreadCount < 0) {
        this.unreadCount = 0;
      }
      ipcRenderer.send("updateUnreadCount", this.unreadCount);
      groupItem.un_read_count = 0;
    },
    // Download thumb and show in dist id element
    async updateGroupImg(e, arg) {
      // console.log("=======================updateGroupImg", arg)
      var state = arg[0];
      var stateInfo = arg[1];
      var id = arg[2];
      var localPath = arg[3];

      var groupInfoTmp = await Group.FindItemFromGroupByGroupID(id);
      if(groupInfoTmp == undefined) {
        return;
      }
      // console.log("groupinfotmp is ", groupInfoTmp)

      var distId = this.getChatElementId(id, groupInfoTmp.user_id);
      // console.log("updateGroupImg dist id ", distId);
      var elementImg = document.getElementById(distId);

      if(elementImg == undefined) {
        distId = this.getChatElementId(id, this.curChat.user_id);
        // console.log("updateGroupImg dist id ", distId);
        elementImg = document.getElementById(distId);
      }

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
      if(groupInfo.group_name == "微信") {
        // console.log("containUidsList ", containUidsList);
        // console.log("this.curUserInfo.id ", this.curUserInfo.id);
      }
      for(let i=0;i<containUidsList.length;i++) {
        if(containUidsList[i] != this.curUserInfo.id && containUidsList[i].length != 0) {
          distUid = containUidsList[i];
        }
      }
      return distUid;
    },
    showGroupIcon: async function(distGroup=undefined) {
      // setTimeout(async () => {
        if(distGroup == undefined) {
          for(var i=0;i<this.showGroupList.length;i++) {
            var distId = this.showGroupList[i].roomId;
            var elementImg = document.getElementById(distId);
            var distUrl = global.mxMatrixClientPeg.getRoomAvatar(this.showGroupList[i]);
            if(elementImg != undefined && distUrl) {
              elementImg.setAttribute("src", distUrl);
            }
          }
        }
    },
    groupIsInFavourite(groupInfo) {
      if(groupInfo.status == undefined) {
        return false;
      }
      if(groupInfo.status == 0) {
        return false;
      }
      else {
        if(groupInfo.status.substr(4, 1) == "1") {
            return true;
        }
        return false;
      }
    },
    groupIsSlience(groupInfo) {
      if(groupInfo.status == undefined) {
        return false;
      }
      if(groupInfo.status == 0) {
        return false;
      }
      else {
        if(groupInfo.status.substr(7, 1) == "1") {
            return true;
        }
        return false;
      }
    },
    groupIsTop(groupInfo) {
      if(groupInfo.status == undefined) {
        return false;
      }
      // console.log("groupInfo is ", groupInfo)
      if(groupInfo.status == 0) {
        return false;
      }
      else {
        if(groupInfo.status.substr(6, 1) == "1") {
            return true;
        }
        return false;
      }
    },
    showOriginal() {
      this.showGroupList = [];
        global.mxMatrixClientPeg.matrixClient.getRooms().forEach((r) => {
          // console.log("this is ", r);
          // console.log("r.getMyMembership() ", r.getMyMembership());
          if(r.getMyMembership() != "LEAVE") {
            this.showGroupList.push(r);
          }
        })
        this.$nextTick(() => {
          this.showGroupIcon();
          for(var i=0;i<this.showGroupList.length;i++) {
            if(this.showGroupList[i].roomId == this.curChat.roomId) {
              // this.showChat(this.showGroupList[i], i);
              this.curindex = i;
            }
          }
        })
        setTimeout(() => {
          console.log("this.curChat room id ", this.curChat.roomId);
          for(var i=0;i<this.showGroupList.length;i++) {
            console.log("============= ", this.showGroupList[i].roomId == this.curChat.roomId)
            if(this.showGroupList[i].roomId == this.curChat.roomId) {
              // this.showChat(this.showGroupList[i], i);
              console.log("===========set index to ", i);
              this.curindex = i;
            }
          }
        }, 500)
    },
    searchRoom(searchKey) {
      var searchResult = [];
      // console.log("search key is ", searchKey);
      for(var i=0;i<this.showGroupList.length;i++) {
        // console.log("the room name is ", this.showGroupList[i].name.indexOf(searchKey));
        if(this.showGroupList[i].name.indexOf(searchKey) >= 0) {
          // console.log("inininin put ");
          searchResult.push(this.showGroupList[i]);
        }
      }
      return searchResult;
    },
    async toSearch(searchKey) {
      // console.log("searchkey is ", searchKey);
      // console.log("searchkey is ", searchKey.trim());
      this.searchKey = searchKey.trim();
      if(this.searchKey.length != 0) {
        var curSearchId = new Date().getTime();
        var searchResult = {
            "id": curSearchId,
            "searchList": []
        };
        this.searchId = curSearchId;
        var searcheRet = this.searchRoom(searchKey);
        console.log("searhret ", searcheRet);
        // console.log("searchResult.id is ", searchResult.id);
        // console.log("this.searchId is ", this.searchId);
        if(searchResult.id == this.searchId) {
          this.showGroupList = searcheRet;
        }
        if(this.searchKey.length == 0) {
          this.showOriginal();
          console.log("this.issearch = ", this.isSearch)
        }
        else {
          // this.isSearch = true;
          console.log("this.issearch = ", this.isSearch)
        }
      }
      else{
        this.showOriginal();
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

        var targetDir = confservice.getFilePath(this.searchFileItems[i].timestamp);
        var targetPath = path.join(targetDir, this.searchFileItems[i].content.fileName);
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
      ipcRenderer.send("showAnotherWindow", this.searchKey, "searchFilesList");
      this.cleanSearchKey = !this.cleanSearchKey;
      this.toSearch("");
    },
    showAllSearchMessages: function() {
      ipcRenderer.send("showAnotherWindow", this.searchKey, "searchMessageList");
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

      this.cleanSearchKey = !this.cleanSearchKey;
      this.toSearch("");
      this.showUserInfoTips = false;
      
      this.$nextTick(() => {
        var groupIndex = -1;
        for(var i=0;i<this.showGroupList.length;i++) {
          if(this.showGroupList[i].roomId == groupInfo.roomId) {
            // console.log("this.originalgorulliset is ", this.showGroupList[i]);
            groupIndex = i;
            this.scrollToDistPosition(groupIndex);
            break;
          }
        }
        
        setTimeout(() => {
          this.$nextTick(() => {
            this.showChat(this.showGroupList[groupIndex], groupIndex);
          })
        }, 500)
      })
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
      for(let i=0;i<this.showGroupList.length;i++) {
        if(this.showGroupList[i].group_id == groupId) {
            var dist = this.showGroupList.splice(i, 1);
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
    getUnreadClass(chatItem, selected, status) {
      var endPoint = "-unselected";
      if(selected) {
        endPoint = "-selected";
      }
      if(this.getUnReadCount(chatItem) === '') {
        return "group-readall" + endPoint;
      }
      else {
        if(status != undefined && status.substr(7, 1) == "1") {
          return "group-unread-slience"
        }
        else {
          return "group-unread";
        }
      }
    },
    getUnReadCount(chatItem) {
      // const roomNotifState = this.getRoomNotifsState(chatItem.roomId);
      const highlight = chatItem.getUnreadNotificationCount('highlight');// > 0;
      const notificationCount = chatItem.getUnreadNotificationCount();

      const notifBadges = notificationCount;// > 0 && shouldShowNotifBadge(roomNotifState);
      const mentionBadges = highlight;// && shouldShowMentionBadge(roomNotifState);
      if(notifBadges == undefined){
        if(chatItem.getMyMembership() == "invite") {
          chatItem.un_read_count = 1;
        }
      }
      else {
        chatItem.un_read_count = notifBadges == 0 ? '' : notifBadges;// || mentionBadges;
      }
      return chatItem.un_read_count;
    },
    getShowUnReadCount(unreadCount) {
      if(unreadCount == undefined || (undefined != undefined && unreadCount == 0)) return '';
      return unreadCount;
    },
    findOverrideMuteRule(roomId) {
        if (!global.mxMatrixClientPeg.matrixClient.pushRules ||
            !global.mxMatrixClientPeg.matrixClient.pushRules['global'] ||
            !global.mxMatrixClientPeg.matrixClient.pushRules['global'].override) {
            return null;
        }
        for (const rule of global.mxMatrixClientPeg.matrixClient.pushRules['global'].override) {
            if (isRuleForRoom(roomId, rule)) {
                if (isMuteRule(rule) && rule.enabled) {
                    return rule;
                }
            }
        }
        return null;
    },
    isRuleForRoom(roomId, rule) {
        if (rule.conditions.length !== 1) {
            return false;
        }
        const cond = rule.conditions[0];
        return (cond.kind === 'event_match' && cond.key === 'room_id' && cond.pattern === roomId);
    },
    isMuteRule(rule) {
        return (rule.actions.length === 1 && rule.actions[0] === 'dont_notify');
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
          return y + "/" + Appendzero(mon) + "/" + Appendzero(d);
        }
      }
      else
      {
        return y + "/" + Appendzero(mon) + "/" + Appendzero(d);
      }
    },
    getMsgLastMsgTime(chatGroupItem) {
      if(chatGroupItem.timeline.length == 0) return;
      var distTimeLine = chatGroupItem.timeline[chatGroupItem.timeline.length-1];
      
      let event = distTimeLine.event;

      var formatTime = ""
      var timesecond = Number(event.origin_server_ts);

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
      return chatGroupItem.name;
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
        return chatGroupItem.currentState.getMember(inviterUserId);
    },
    _getMyMember(chatItem) {
      return chatItem.getMember(global.mxMatrixClientPeg.matrixClient.getUserId());
    },
    _isDMInvite(chatItem) {
      var myMember = this._getMyMember(chatItem);
      if(!myMember) return false;
      var memberEvent = myMember.events.member;
      var memberContent = memberEvent.getContent();
      return memberContent.membership == "invite" && memberContent.is_direct;
    },
    textForJoinRulesEvent(ev) {
        const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
        switch (ev.getContent().join_rule) {
            case "public":
                return this.$t('madeRoomPublic', {senderDisplayName});
            case "invite":
                return this.$t('madeRoomInviteOnly', {senderDisplayName});
            default:
                // The spec supports "knock" and "private", however nothing implements these.
                return this.$t('changeRoomRules', {
                    senderDisplayName,
                    rule: ev.getContent().join_rule,
                });
        }
    },
    textForMemberEvent(ev) {
        // XXX: SYJS-16 "sender is sometimes null for join messages"
        const senderName = ev.sender ? ev.sender.name : ev.getSender();
        const targetName = ev.target ? ev.target.name : ev.getStateKey();
        const prevContent = ev.getPrevContent();
        const content = ev.getContent();

        const ConferenceHandler = null;//CallHandler.getConferenceHandler();
        const reason = content.reason ? (this.$t('reason') + ': ' + content.reason) : '';
        switch (content.membership) {
            case 'invite': {
                const threePidContent = content.third_party_invite;
                if (threePidContent) {
                    if (threePidContent.display_name) {
                        return this.$t('acceptOthersInvite', {
                            targetName,
                            displayName: threePidContent.display_name,
                        });
                    } else {
                        return this.$t('hasAcceptOthersInvite', {targetName});
                    }
                } else {
                    if (ConferenceHandler && ConferenceHandler.isConferenceUser(ev.getStateKey())) {
                        return this.$t('requestVoIpConference', {senderName});
                    } else {
                        return this.$t('someoneinviteSomeone', {senderName, targetName});
                    }
                }
            }
            case 'ban':
                return this.$t('someoneBannedSomeone', {senderName, targetName}) + ' ' + reason;
            case 'join':
                if (prevContent && prevContent.membership === 'join') {
                    if (prevContent.displayname && content.displayname && prevContent.displayname !== content.displayname) {
                        return this.$t('changeTheirDisplayNameTo', {
                            oldDisplayName: prevContent.displayname,
                            displayName: content.displayname,
                        });
                    } else if (!prevContent.displayname && content.displayname) {
                        return this.$t('someoneChangeDisplayNameTo', {
                            senderName: ev.getSender(),
                            displayName: content.displayname,
                        });
                    } else if (prevContent.displayname && !content.displayname) {
                        return this.$t('removeTheirDisplayName', {
                            senderName,
                            oldDisplayName: prevContent.displayname,
                        });
                    } else if (prevContent.avatar_url && !content.avatar_url) {
                        return this.$t('removeProfilePic', {senderName});
                    } else if (prevContent.avatar_url && content.avatar_url &&
                        prevContent.avatar_url !== content.avatar_url) {
                        return this.$t('changeProfilePic', {senderName});
                    } else if (!prevContent.avatar_url && content.avatar_url) {
                        return this.$t('setProfilePic', {senderName});
                    } else if (SettingsStore.getValue("showHiddenEventsInTimeline")) {
                        // This is a null rejoin, it will only be visible if the Labs option is enabled
                        return this.$t('noChange', {senderName});
                    } else {
                        return "";
                    }
                } else {
                    if (!ev.target) console.warn("Join message has no target! -- " + ev.getContent().state_key);
                    if (ConferenceHandler && ConferenceHandler.isConferenceUser(ev.getStateKey())) {
                        return this.$t('startVoIp');
                    } else {
                        return this.$t('hasJoinedRoom', {targetName});
                    }
                }
            case 'leave':
                if (ev.getSender() === ev.getStateKey()) {
                    if (ConferenceHandler && ConferenceHandler.isConferenceUser(ev.getStateKey())) {
                        return this.$t('finishedVoIP');
                    } else if (prevContent.membership === "invite") {
                        return this.$t('rejectInvite', {targetName});
                    } else {
                        return this.$t('leftRoom', {targetName});
                    }
                } else if (prevContent.membership === "ban") {
                    return this.$t('unbannedSomeone', {senderName, targetName});
                } else if (prevContent.membership === "invite") {
                    return this.$t('withdrewInvitation', {
                        senderName,
                        targetName,
                    }) + ' ' + reason;
                } else {
                    // sender is not target and made the target leave, if not from invite/ban then this is a kick
                    return this.$t('kickedSomeone', {senderName, targetName}) + ' ' + reason;
                }
        }
    },
    textForTopicEvent(ev) {
        const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
        return this.$t('changeTopicTo', {
            senderDisplayName,
            topic: ev.getContent().topic,
        });
    },
    textForRoomNameEvent(ev) {
        const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

        if (!ev.getContent().name || ev.getContent().name.trim().length === 0) {
            return this.$t('removeRoomName', {senderDisplayName});
        }
        if (ev.getPrevContent().name) {
            return this.$t('changeRoomNameFromTo', {
                senderDisplayName,
                oldRoomName: ev.getPrevContent().name,
                newRoomName: ev.getContent().name,
            });
        }
        return this.$t('changeRoomNameTo', {
            senderDisplayName,
            roomName: ev.getContent().name,
        });
    },
    textForGuestAccessEvent(ev) {
        const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
        switch (ev.getContent().guest_access) {
            case "can_join":
                return this.$t('allowGuests', {senderDisplayName});
            case "forbidden":
                return this.$t('preventGuest', {senderDisplayName});
            default:
                // There's no other options we can expect, however just for safety's sake we'll do this.
                return this.$t('changeGuestRule', {
                    senderDisplayName,
                    rule: ev.getContent().guest_access,
                });
        }
    },
    textForHistoryVisibilityEvent(event) {
        const senderName = event.sender ? event.sender.name : event.getSender();
        switch (event.getContent().history_visibility) {
            case 'invited':
                return this.$t('historyVisibleToAllFromInvited', {senderName});
            case 'joined':
                return this.$t('historyVisibleToAllFromJoined', {senderName});
            case 'shared':
                return this.$t('historyVisibleToAll', {senderName});
            case 'world_readable':
                return this.$t('setHistoryVisibleToAnyone', {senderName});
            default:
                return this.$t('setHistoryVisibleToUnknow', {
                    senderName,
                    visibility: event.getContent().history_visibility,
                });
        }
    },
    // Notice content
    NoticeContent: function(curMsg) {
        if(curMsg === null) {
            return '';
        }
        let event = curMsg.event;
        let chatGroupMsgType = event.type;
        var chatGroupMsgContent = event.content;
        // 数据库缺省type = 0 
        /*
            // src/TextForEvent.js
            'm.room.canonical_alias': textForCanonicalAliasEvent,
            'm.room.name': textForRoomNameEvent,
            'm.room.topic': textForTopicEvent,
            'm.room.member': textForMemberEvent,
            'm.room.third_party_invite': textForThreePidInviteEvent,
            'm.room.history_visibility': textForHistoryVisibilityEvent,
            'm.room.power_levels': textForPowerEvent,
            'm.room.pinned_events': textForPinnedEvent,
            'm.room.server_acl': textForServerACLEvent,
            'm.room.tombstone': textForTombstoneEvent,
            'm.room.join_rules': textForJoinRulesEvent,
            'm.room.guest_access': textForGuestAccessEvent,
            'm.room.related_groups': textForRelatedGroupsEvent,

            // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
            'im.vector.modular.widgets': textForWidgetEvent,
        */
        if(curMsg.isState()) {
            switch (curMsg.getType()) {
                case "m.room.canonical_alias":
                    console.log("canonical_alias")
                    break;
                case "m.room.name":
                    return this.textForRoomNameEvent(curMsg);
                case "m.room.topic":
                    return this.textForTopicEvent(curMsg);
                case "m.room.member":
                    return this.textForMemberEvent(curMsg);
                case "m.room.third_party_invite":
                    console.log("third_party_invite")
                    break;
                case "m.room.history_visibility":
                    return this.textForHistoryVisibilityEvent(curMsg);
                case "m.room.power_levels":
                    return '';
                case "m.room.pinned_events":
                    console.log("pinned_events")
                    break;
                case "m.room.server_acl":
                    console.log("server_acl")
                    break;
                case "m.room.tombstone":
                    console.log("tombstone")
                    break;
                case "m.room.join_rules":
                    return this.textForJoinRulesEvent(curMsg);
                case "m.room.guest_access":
                    return this.textForGuestAccessEvent(curMsg);
                case "m.room.related_groups":
                    console.log("related_groups")
                    break;
                case "im.vector.modular.widgets":
                    break;
            }
        }
        if(chatGroupMsgType === 'm.room.member')
        {
            if(chatGroupMsgContent.membership === 'invite')
            {
                var invitees = chatGroupMsgContent.displayname;
                var inviter = curMsg.sender.name;
                return inviter + " 邀请 " + invitees + " 加入群聊";
            }
            else if(chatGroupMsgContent.membership === "join")
            {
                var owner = chatGroupMsgContent.displayname;
                return owner + " 加入房间";
            }
            else if(chatGroupMsgContent.membership === "leave")
            {
                var owner = chatGroupMsgContent.displayname;
                return owner + " 离开房间";
            }
            else if(chatGroupMsgContent.type === "notice")
            {
                var owner = chatGroupMsgContent.userName;
                return owner + " 发布群公告: " + chatGroupMsgContent.text;
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
                        deletedNames = deletedNames + "," + deletedUsers[i].userName
                    }
                }
                return owner + " 将 " + deletedNames + " 移出了群聊";
            }
            else if(chatGroupMsgContent.type == "groupTransfer") {
                var originalOwner = chatGroupMsgContent.fromUserName;
                var newOwner = chatGroupMsgContent.toUserName;
                // console.log("get return is ", originalOwner + " 将群主转让给 " + newOwner)
                return originalOwner + " 将群主转让给 " + newOwner;
            }
            else
            {
                return "";
            }
        }
        else if(chatGroupMsgType == 'm.room.name'){
            var inviter = curMsg.sender.name;
            return inviter + " 修改房间名称为：" + chatGroupMsgContent.name;
        }
        return "";
    },
    getShowMsgContent(chatGroupItem) {
      if(chatGroupItem.timeline.length == 0){
        if(chatGroupItem.getMyMembership() == "invite") {
          var inviteMemer = this._getInviteMember(chatGroupItem);
          return "[邀请]：" + inviteMemer.rawDisplayName;
        }
      };
      console.log("cur chat group is ", chatGroupItem);
      var distTimeLine = undefined;
      for(var i=chatGroupItem.timeline.length-1;i>=0;i--) {
        var timeLineTmp = chatGroupItem.timeline[i];
        if(['m.room.name', 'm.room.topic', 'm.room.member', 'm.room.history_visibility', 'm.room.join_rules', 'm.room.guest_access', 'm.room.message', 'm.room.encrypted'].indexOf(timeLineTmp.getType()) > 0) {
          distTimeLine = timeLineTmp;
          break;
        }
      }
      if(distTimeLine == undefined) {
        return "收到一条短消息";
      }
      var ret = this.NoticeContent(distTimeLine);
      console.log("ret is ===== ", ret == '');
      if(ret != '') {
        return ret;
      }
      let event = distTimeLine.event;
      let chatGroupMsgType = event.type;
      var chatGroupMsgContent = distTimeLine.getContent();

      if(chatGroupMsgType === "m.room.message")
      {
          if(chatGroupMsgContent.msgtype == 'm.file'){
            return "[文件]:" + chatGroupMsgContent.body;
          }
          else if(chatGroupMsgContent.msgtype == 'm.text'){
            var sender = distTimeLine.sender.name;
            var content = chatGroupMsgContent.body;
            return sender + ":" + content;
          }
          else if(chatGroupMsgContent.msgtype == 'm.image'){
            return "[图片]";
          } 
      }
      else if(chatGroupMsgType === "m.room.encrypted") {
          // chatGroupMsgContent = this.msg.getContent();
          if(chatGroupMsgContent.msgtype == 'm.file'){
            return "[文件]:" + chatGroupMsgContent.body;
          }
          else if(chatGroupMsgContent.msgtype == 'm.text'){
            var sender = distTimeLine.sender.name;
            var content = chatGroupMsgContent.body;
            return sender + ":" + content;
          } 
          else if(chatGroupMsgContent.msgtype == 'm.image'){
            return "[图片]";
          }
          else if(chatGroupMsgContent.msgtype == "m.bad.encrypted") {
              this.messageContent = chatGroupMsgContent.body;
          }
      }

      return "收到一条短消息";
    },
    showChat: function(chatGroup, index) {
      // this.cleanSearchKey = !this.cleanSearchKey;
      this.isEmpty = false;
      // console.log("this.unreadcount is ", this.unreadCount);
      // console.log("this.curChat.un_read_count is ", chatGroup.un_read_count);
      var isSecret = false;
      if(this.curChat.key_id != undefined && this.curChat.key_id.length != 0 && this.curChat.group_type == 102) {
        isSecret = true;
      }

      if(this.curChat.roomId != undefined) {
        this.unreadCount = this.unreadCount - this.curChat.un_read_count;
        // console.log("showchat this.unreadCount ", this.unreadCount)
        if(this.unreadCount < 0) {
          this.unreadCount = 0;
        }
        ipcRenderer.send("updateUnreadCount", this.unreadCount);
        this.curChat.setUnreadNotificationCount("total", 0);
        this.curChat.un_read_count = 0;
        //services.common.MessageRead(this.curChat.group_id, this.curChat.sequence_id, isSecret);
      }
      this.curChat = chatGroup;
     
      if(this.curChat.un_read_count != undefined && this.curChat.un_read_count != 0) {
        ipcRenderer.send("stopFlash");
      }
      this.curindex = index;
      this.unreadCount = this.unreadCount - chatGroup.un_read_count;
      // console.log("showchat this.unreadCount ", this.unreadCount)
      if(this.unreadCount < 0) {
        this.unreadCount = 0;
      }
      ipcRenderer.send("updateUnreadCount", this.unreadCount);
      isSecret = false;
      if(this.curChat.key_id != undefined && this.curChat.key_id.length != 0 && this.curChat.group_type == 102) {
        isSecret = true;
      }
      this.curChat.setUnreadNotificationCount("total", 0);
      //services.common.MessageRead(this.curChat.group_id, this.curChat.sequence_id, isSecret);
      this.curChat.un_read_count = 0;
    },
    forceUpdateGroupList: function(distGroupId) {
      console.log("dist id ", distGroupId);
      for(var i=0;i<this.showGroupList.length;i++) {
        console.log("this.showid ", this.showGroupList[i].roomId);
        if(this.showGroupList[i].roomId == distGroupId) {
          console.log("delete some one");
          this.showGroupList.splice(i, 1);
          this.isEmpty = true;
        }
      }
      this.$nextTick(() => {
        this.showGroupIcon();
      })
    },
    updateGroupList: async function() {
      for(var i=0;i<this.showGroupList.length;i++) {
        console.log("this is ", this.showGroupList[i]);
        console.log("this.showGroupList[i].getMyMembership() ", this.showGroupList[i].getMyMembership());
        if(this.showGroupList[i].getMyMembership() == "LEAVE") {
          this.showGroupList.splice(i, 1);
        }
      }
      this.$nextTick(() => {
        this.showGroupIcon();
      })
    },
    compare: function() {
      return function(a, b)
      {
        var value1 = a.last_message_time == 0 ? a.updatetime : a.last_message_time;
        var value2 = b.last_message_time == 0 ? b.updatetime : b.last_message_time;;
        return value2 - value1;
      }
    },
    async callback(msg, isUpdate=false) {
      console.log("chat callback msg is ", msg);
      // console.log("chat callback msg content is ", msg.message_content);
      // console.log("chat callback msg is ", msg)
      var msgContent = strMsgContentToJson(msg.message_content);
      var groupInfo = await Group.FindItemFromGroupByGroupID(msg.group_id);
      if(groupInfo != undefined && groupInfo.group_type == 101 && groupInfo.status.substr(5, 1) == "1") {
        return;
      }
      if(groupInfo != undefined && groupInfo.group_type == 102 && groupInfo.status.substr(5, 1) == "1") {
        console.log("update status")
        services.common.UpdateGroupStatus(msg.group_id, "00000000");
      }
      if(msg.sequence_id != undefined && msg.sequence_id.length != 0) {
        var msgExist = await Message.ExistMessageBySequenceID(msg.sequence_id);
        // console.log("msg exist is ", msgExist);
        if(this.dealedMsgSequenceId.indexOf(msg.sequence_id) == -1) {
          // if(isUpdate) {
          //   console.log("111111111111111")
          //   this.showGroupIcon();
          // }
          this.dealedMsgSequenceId.push(msg.sequence_id);
        }
        else if(msgExist) {
          // console.log("return it ")
          if(isUpdate) {
            this.showGroupIcon();
          }
          return;
        }
        else {
          if(isUpdate) {
            this.showGroupIcon();
          }
          return;
        }
      }
      if(msgContent.type == undefined && msg.group_avarar != undefined) {
        this.mqttGroupVar.push(msg);
        return;
      }
      // if(msg.statues != undefined && msg.status[6] == 1) {
      //   return;
      // }
      if(msg.message_from_id != undefined && msg.message_from_id != this.curUserInfo.id){
        // console.log("process.platfrom is ", this.isWindows())
        var fromName = "";
        var fromUserName = "";
        // console.log("msg.messagefromid ", msg.message_from_id);
        var fromUserInfo = await UserInfo.GetUserInfo(msg.message_from_id);
        // var groupInfo = await Group.FindItemFromGroupByGroupID(msg.group_id);
        var notificateContent = this.getShowMsgContent(msg);
        console.log("fromUserInfo ", fromUserInfo);
        if(fromUserInfo != undefined) {
          fromName = fromUserInfo.user_display_name;
        }
        if(groupInfo != undefined) {
          if(groupInfo.group_type == 101) {
            fromUserName = fromName;
            fromName = groupInfo.group_name;
            if(fromUserName.length == 0) {
              notificateContent = notificateContent;
            }
            else{
              notificateContent = fromUserName + ":" + notificateContent;
            }
          }
        }
        var groupInfo = await Group.FindItemFromGroupByGroupID(msg.group_id);
        if(this.isWindows()) {
          if(this.$store.getters.flashNotice()) {
            if(!this.groupIsSlience(groupInfo)) {
              ipcRenderer.send("flashIcon", fromName, notificateContent);
            }
          }
          try{
            if(this.$store.getters.soundNotice()) {
              if(!this.groupIsSlience(groupInfo)) {
                this.amr.play();
              }
            }
          }
          catch(e) {
            
          }
        }
        else {
          if(this.$store.getters.flashNotice()) {
            if(!this.groupIsSlience(groupInfo)) {
              ipcRenderer.send("showNotice", fromName, notificateContent);
            }
          }
        }
      }
      var groupExist = false;
      for(let i=0;i<this.showGroupList.length;i++) {
        if((this.showGroupList[i].group_id === msg.group_id)) {
          console.log("exit group is ", this.showGroupList[i], "and i is ", i)
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
              this.showGroupList[i].un_read_count += 1;
              if(!this.groupIsSlience(groupInfo)) {
                this.unreadCount += 1;
                if(this.unreadCount < 0) {
                  this.unreadCount = 0;
                }
              }
              // console.log("callback this.unreadCount ", this.unreadCount)
            if(!this.groupIsSlience(groupInfo)) {
              ipcRenderer.send("updateUnreadCount", this.unreadCount);
            }
          }
          this.showGroupList[i].last_message_time = msg.message_timestamp;
          this.showGroupList[i].message_content_type = msg.message_type != undefined ? msg.message_type : msg.message_content_type;
          this.showGroupList[i].message_from_id = msg.sequence_id > this.showGroupList[i].sequence_id ? msg.message_from_id : this.showGroupList[i].message_from_id;
          this.showGroupList[i].message_id = msg.sequence_id > this.showGroupList[i].sequence_id ? msg.message_id : this.showGroupList[i].message_id;
          this.showGroupList[i].message_content = msg.message_content;
          this.showGroupList[i].sequence_id = msg.sequence_id > this.showGroupList[i].sequence_id ? msg.sequence_id : this.showGroupList[i].sequence_id;
          this.showGroupList[i].key_id = msg.key_id == undefined ? "" : msg.key_id;
          if(this.showGroupList[i].group_type == 102) {
            this.showGroupList[i].group_id = msg.group_id;
          }
          // this.showGroupList[i].status = "00000000";
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
          // console.log("cur msg is ", msg);
          // var distFromName = await Group.SearchByNameKey(this.showGroupList[i].group_name);
          var distFromName = [];
          var isSecretTmp = false;
          if(msg.key_id != undefined && msg.key_id.length != 0) {
            if(this.showGroupList[i].key_id != undefined && this.showGroupList[i].key_id.length != 0) {
              distFromName = await Group.SearchSecretByNameKey(this.showGroupList[i].group_name)
              isSecretTmp = true;
            }
            else {
              continue;
            }
          }
          else {
            if(this.showGroupList[i].key_id == undefined || (this.showGroupList[i].key_id != undefined && this.showGroupList[i].key_id.length == 0)) {
              distFromName = await Group.SearchChatByNameKey(this.showGroupList[i].group_name)
            }
            else {
              continue;
            }
          }
          // var distFromName = await services.common.GetGroupByName(this.showGroupList[i].group_name);
          // console.log("distFromName is ", distFromName)
          var isBreak = false;
          for(let j=0;j<distFromName.length;j++) {
            let distGroup = distFromName[j];
            // console.log("distGroup is ", distGroup)
            // console.log("this.showGroupList[i].group_name ", this.showGroupList[i].group_name);
            if(distGroup.group_name == this.showGroupList[i].group_name && distGroup.group_type == 102) {
              // if((isSecretTmp && (distGroup.key_id != undefined && distGroup.key_id.length != 0)) || 
              //   (!isSecretTmp && (distGroup.key_id == undefined || (distGroup.key_id == undefined && distGroup.key_id.length == 0)))) {
                console.log("find dist grou pis ", distGroup);
                // console.log("distGroup.key_id is ", distGroup.key_id);
                // console.log("msg.key_id is ", msg.key_id);
                this.showGroupList[i].group_id = distGroup.group_id;
                this.showGroupList[i].group_avarar = distGroup.group_avarar;
                this.showGroupList[i].last_message_time = msg.message_timestamp;
                this.showGroupList[i].message_content = msg.message_content;
                this.showGroupList[i].message_content_type = msg.message_type;
                this.showGroupList[i].message_from_id = msg.message_from_id;
                this.showGroupList[i].message_id = msg.message_id;
                this.showGroupList[i].sequence_id = msg.sequence_id;
                this.showGroupList[i].time_line_id = msg.time_line_id;
                this.showGroupList[i].key_id = msg.key_id == undefined ? "" : msg.key_id;
                this.showGroupList[i].owner = distGroup.owner;
                let tmp = distGroup.un_read_count - this.showGroupList[i].un_read_count;
                this.showGroupList[i].un_read_count = distGroup.un_read_count;
                this.unreadCount += tmp;
                // console.log("callback this.unreadCount ", this.unreadCount)
                if(this.unreadCount < 0) {
                  this.unreadCount = 0;
                }
                ipcRenderer.send("updateUnreadCount", this.unreadCount);
                groupExist = true;
                // this.needUpdate ++;
                // console.log("44444444444444444444")
                this.showGroupIcon();
                isBreak = true;
                break;
              // }
            }
          }
          if(msg.message_from_id != undefined && msg.message_from_id == this.curUserInfo.id) {
            this.curindex = i;
          }
          groupExist = true;
          if(isBreak) {
            break;
          }
        }
      }
      if(!groupExist) {
          let groupInfo = await Group.FindItemFromGroupByGroupID(msg.group_id);
          console.log("groupinfo is ", groupInfo);
          // console.log("this.mqttGroupVar is ", this.mqttGroupVar);
          if(groupInfo == undefined) {
            // console.log("groupInfo is undefined");
            // console.log("this.mqttGroupVar.length is ", this.mqttGroupVar.length);
            for(let i=0;i<this.mqttGroupVar.length;i++) {
              if(this.mqttGroupVar[i].group_id == msg.group_id) {
                // console.log("this.mqttGroupVar[i] is ", this.mqttGroupVar[i]);
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
                  "key_id": msg.key_id == undefined ? "" : msg.key_id
                }
                // console.log("groupTmp is ", groupTmp);
                this.showGroupList.unshift(groupTmp);
                // console.log("update show group list ", this.showGroupList);
                this.mqttGroupVar.slice(i, 1);
                this.unreadCount += this.mqttGroupVar[i].un_read_count;
                if(this.unreadCount < 0) {
                  this.unreadCount = 0;
                }
                ipcRenderer.send("updateUnreadCount", this.unreadCount);
                break;
              }
            }
            // needUpdate ++;
          }
          else {
            // console.log("update groupInfo ", groupInfo);
            var groupTmpExist = false;
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
              "key_id": msg.key_id == undefined ? "" : msg.key_id
            }
            // console.log("groupTmp is ", groupTmp);
            for(let i=0;i<this.showGroupList.length;i++) {
              if(this.showGroupList[i].group_id == groupInfo.group_id) {
                groupTmpExist = true;
                this.showGroupList[i].message_content = msg.message_content;
                this.showGroupList[i].message_content_type = msg.message_type;
                this.showGroupList[i].message_from_id = msg.message_from_id;
                this.showGroupList[i].message_id = msg.message_id;
                this.showGroupList[i].last_message_time = msg.message_timestamp;
                this.showGroupList[i].sequence_id = msg.sequence_id;
                this.showGroupList[i].time_line_id = msg.time_line_id;
                this.showGroupList[i].key_id = msg.key_id == undefined ? "" : msg.key_id;
              }
            }
            if(!groupTmpExist) {
              this.showGroupList.unshift(groupTmp);
            }
            this.unreadCount += groupInfo.un_read_count;
            if(this.unreadCount < 0) {
              this.unreadCount = 0;
            }
            ipcRenderer.send("updateUnreadCount", this.unreadCount);
            // console.log("update show group list ", this.showGroupList);
            // needUpdate ++;
          }
        this.$nextTick(() => {
          this.showGroupIcon();
        })
      }
    },
    delayCallback: function(msg) {
      setTimeout(() => {
        this.callback(msg);
      }, 100)
    }
  },

  mounted: async function() {
    log.info("chat content mounted");
    global.mxMatrixClientPeg.restoreFromLocalStorage().then(async (ret) => {
        if(ret == undefined) {
            global.mxMatrixClientPeg.logout();
            ipcRenderer.send("showLoginPageWindow");
            return;
        }
        if(ret.language) {
          this.$i18n.locale = ret.language;
        }
        console.log("the matrix client is ", global.mxMatrixClientPeg)
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
    })

    if(this.unreadCount < 0) {
      this.unreadCount = 0;
    }
    ipcRenderer.send("updateUnreadCount", this.unreadCount);
    setTimeout(() => {
        this.$nextTick(() => {
          ipcRenderer.on('updateGroupImg', this.updateGroupImg);
          // this.showGroupIcon();
        })
    }, 0)
    
    ipcRenderer.on('SearchAddGroup', this.SearchAddGroup)
    ipcRenderer.on('SearchAddSenders', this.searchAddSenders)
    ipcRenderer.on('updateGroupList', this.updateGroupList)
    ipcRenderer.on('transmitFromFavDlg', this.eventUpdateChatList)
  },
  created: async function() {
    // await services.common.initmqtt();
    // services.common.handlemessage(this.callback);
    if(this.amr == null){
        this.amr = new BenzAMRRecorder();
        // console.log("=========================")
        // console.log(path.join(__dirname, "../../../static/sound.wav"))
        this.amr.initWithUrl(path.join(__dirname, "/static/sound.wav"))
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
    padding-top: 20px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;  
    position: relative;
  }

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
    padding-top: 20px;
    -webkit-app-region: drag;
    z-index: 1;
  }
  * {
      
      -webkit-app-region: no-drag;
  }

  .chat-list {
    height: 100%;
    width: 280px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgb(238, 238, 238);
    -webkit-app-region: drag;
  }

  .list-header {
    width: 100%;
    height: 41px;
    line-height: 41px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    display: block;
    margin-top: 12.5px;
    margin-bottom: 7.5px;
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
    scroll-behavior:smooth;
    
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
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
    font-weight: 400;
    font-family:PingFangSC-Regular;
    letter-spacing: 1px;
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
    font-size: 12px;
    color: rgba(153, 153, 153, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 7px;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 18px;
    font-family:PingFangSC-Regular;
    letter-spacing: 1px;
    font-weight: 400;
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
    font-family:PingFangSC-Regular;
    letter-spacing: 1px;
    font-weight: 400;
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
    scroll-behavior:smooth;
    
    ::-webkit-scrollbar-track {
      border-radius: 10px;
    }
  }

  .group-list-move {
    transition: transform .5s;
  }

  .group-list-enter-active {
    transition: all .5s;
  }

  .group-list-leave-active {
    transition: all .2s;
  }

  .group-list-enter {
    opacity: 0;
    transform: translateX(-5px);
  }

  .group-list-leave-to  {
    opacity: 0;
    transform: translateX(5px);
  }

  .group-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    scroll-behavior:smooth;
  }

  .group-div {
    height: 60px;
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
  }

  .group-div-top {
    height: 60px;
    background-color: rgba(243, 244, 247, 1);
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
  }

  .group-div-top:hover {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
  }

  .group-div-top.active {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
  }

  .group-div:hover {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
  }

  .group-div.active {
    height: 60px;
    background-color: rgba(221, 221, 221, 1);
    border-bottom:1px solid rgba(221, 221, 221, 1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
  }

  ////////////////////////////////////
  .group {
    height: 60px;
  }

  .group-top {
    height: 60px;
    background-color: rgba(243, 244, 247, 1);
  }

  .group-top:hover {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
  }

  .group-top.active {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
  }

  .group:hover {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
  }

  .group.active {
    height: 60px;
    background-color: rgba(221, 221, 221, 1);
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
    border-radius:4px;
    // z-index:-1;
  }

  .group-img {
    position:relative;
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
  }
  
  .group-info {
    display: inline-block;
    height: 100%;
    width: calc(100% - 130px);
    margin-left: 12px;
  }

  .group-name {
    width: 100%;
    height: 20px;
    font-size: 14px;
    font-weight: 500;
    font-family:PingFangSC-Medium;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
    letter-spacing:1px;
  }

  .group-content {
    width: 100%;
    font-size: 13px;
    font-weight:400;
    color: rgba(153, 153, 153, 1);
    overflow: hidden;
    font-family:PingFangSC-Regular;
    margin-left: 0px;
    margin-top: 2px;
    margin-right: 0px;
    margin-bottom: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 18px;
    letter-spacing:1px;
  }

  .group-notice {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 63px;
    margin-right: 5px;
  }

  .group-time {
    color: rgba(187, 187, 187, 1);
    margin-left: 0px;
    margin-top: 10px;
    font-family:PingFangSC-Regular;
    font-size: 11px;
    margin-right: 0px;
    margin-bottom: 2px;
    font-weight:400;
    height: 18px;
    line-height:18px;
    text-align: right;
  }

  .group-unread-slience {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 0px;
    font-family:PingFangSC-Medium;
    float: right;
    color: rgb(255, 255, 255);
    margin: 0px;
    text-align: center;
    height: 8px;
    width: 8px;
    line-height: 8px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 1);
    // z-index:-1;
  }

  .secret-flag {
    position: absolute;
    bottom: -5px;
    right: -8px;
    float: right;
    margin: 0px;
    height: 16px;
    width: 16px;
  }

  .group-unread {
    position: absolute;
    top: -7px;
    right: -7px;
    font-size: 10px;
    font-family: PingFangSC-Medium;
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
    font-family:PingFangSC-Medium;
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
    font-family:PingFangSC-Medium;
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
    background-image: url("../../../static/Img/Chat/slience-20px@2x.png");
    background-size: contain;
  }
</style>
