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
            <!-- <el-link :underline="false" @click="InvitesClick()" icon='el-icon-caret-bottom'>邀请</el-link> -->
            <!-- <div class = "grid-content">邀请</div> -->
            <!-- <transition-group class="group-list" name="group-list" tag="ul"> -->
            <ul class="group-list" name="group-list">
              <li class = 'group'
                  v-for="(chatGroupItem, index) in showInviteGroupList"
                  @contextmenu="rightClick($event, chatGroupItem)"
                  v-bind:key="ChatGroupId(chatGroupItem)"
                  :id="ChatGroupId(chatGroupItem)"
                  v-show='bInvites'>
                <div class = 'group-div' :id='ChatGroupDivId(chatGroupItem)'>
                  <!-- <listItem @groupInfo="chatGroupItem"/> -->
                  <div class="group-img">
                    <!-- <avatar-block :ownerName="chatGroupItem.name"></avatar-block> -->
                    <img class="group-ico" :id="chatGroupItem.roomId" src="../../../static/Img/User/group-40px@2x.png"/>
                    <!-- <p :class="getUnreadClass(chatGroupItem, index===curindex, chatGroupItem.status)">1</p> -->
                  </div>
                  <div class="group-info">
                    <img class="secret-flag" src="../../../static/Img/Chat/secretFlag@2x.png" v-show="isSecret(chatGroupItem)">
                    <p class="group-name-secret" v-if="isSecret(chatGroupItem)" :id="getChatGroupNameElementId(chatGroupItem.roomId, undefined)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-name" v-else :id="getChatGroupNameElementId(chatGroupItem.roomId, undefined)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-content" :id="getInviteChatContentElementId(chatGroupItem.roomId)">{{getShowInviteMsgContent(chatGroupItem)}}</p>
                  </div>
                  <img class="accept-invite" src="../../../static/Img/Chat/join-roomm@2x.png" @click="ToJoinRoom(chatGroupItem.roomId)"/>
                  <img class="reject-invite" src="../../../static/Img/Chat/reject-room@2x.png" @click="RejectRoom(chatGroupItem.roomId)"/>
                </div>
              </li>
            <!-- </transition-group> -->
            </ul>
            <!-- <ul class="group-list"> -->
            <!-- <el-link :underline="false" @click="CollectionRoomClick()" icon='el-icon-caret-bottom'><span class = "grid-content" >置顶</span></el-link> -->
            <!-- <div class = "grid-content">置顶</div> -->
            <!-- <transition-group class="group-list" name="group-list" tag="ul"> -->
            <ul class="group-list" name="group-list">
              <li class = 'group'
                  v-for="(chatGroupItem, index) in showFavouriteRooms"
                  @click="showChat(chatGroupItem, index)"
                  @contextmenu="rightClick($event, chatGroupItem)"
                  v-bind:key="ChatGroupId(chatGroupItem)"
                  :id="ChatGroupId(chatGroupItem)"
                  v-show='bCollections'>
                <div class = 'group-div' :id='ChatGroupDivId(chatGroupItem)'>
                  <!-- <listItem @groupInfo="chatGroupItem"/> -->
                  <div class="group-img">
                    <!-- <avatar-block :ownerName="chatGroupItem.name"></avatar-block> -->
                    <img class="group-ico" :id="chatGroupItem.roomId" src="../../../static/Img/User/group-40px@2x.png"/>
                    <p :class="getUnreadClass(chatGroupItem, index===curindex)" :id="getShowUnreadCountId(chatGroupItem)">{{getShowUnReadCount(chatGroupItem)}}</p>
                  </div>
                  <div class="group-info">
                    <img class="secret-flag" src="../../../static/Img/Chat/secretFlag@2x.png" v-show="isSecret(chatGroupItem)">
                    <p class="group-name-secret" v-if="isSecret(chatGroupItem)" :id="getChatGroupNameElementId(chatGroupItem.roomId, undefined)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-name" v-else :id="getChatGroupNameElementId(chatGroupItem.roomId, undefined)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-content" :id="getChatContentElementId(chatGroupItem.roomId)"></p>
                  </div>
                  <div class="group-notice">
                    <p class="group-time" :id="getChatGroupTimeElementId(chatGroupItem.roomId)"></p>
                    <p class="group-slience" v-show="groupIsSlience(chatGroupItem)"></p>
                  </div>
                </div>
              </li>
            </ul>
            <!-- </transition-group> -->
            <!-- <el-link :underline="false" @click="RoomsClick()" icon='el-icon-caret-bottom'>聊天列表</el-link> -->
            <!-- <div class = "grid-content">聊天</div> -->
            <ul class="group-list" name="group-list">
            <!-- <transition-group class="group-list" name="group-list" tag="ul"> -->
              <li class = 'group'
                  v-for="(chatGroupItem, index) in showDealGroupList"
                  @click="showChat(chatGroupItem, index)"
                  @contextmenu="rightClick($event, chatGroupItem)"
                  v-bind:key="ChatGroupId(chatGroupItem)"
                  :id="ChatGroupId(chatGroupItem)"
                  v-show='bRooms'>
                <div class = 'group-div' :id='ChatGroupDivId(chatGroupItem)'>
                  <!-- <listItem @groupInfo="chatGroupItem"/> -->
                  <div class="group-img">
                    <!-- <avatar-block :ownerName="chatGroupItem.name"></avatar-block> -->
                    <img class="group-ico" :id="chatGroupItem.roomId" src="../../../static/Img/User/group-40px@2x.png"/>
                    <p :class="getUnreadClass(chatGroupItem, index===curindex)" :id="getShowUnreadCountId(chatGroupItem)">{{getShowUnReadCount(chatGroupItem)}}</p>
                  </div>
                  <div class="group-info">
                    <img class="secret-flag" src="../../../static/Img/Chat/secretFlag@2x.png" v-show="isSecret(chatGroupItem)">
                    <p class="group-name-secret" v-if="isSecret(chatGroupItem)" :id="getChatGroupNameElementId(chatGroupItem.roomId, undefined)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-name" v-else :id="getChatGroupNameElementId(chatGroupItem.roomId, undefined)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-content" :id="getChatContentElementId(chatGroupItem.roomId)"></p>
                  </div>
                  <div class="group-notice">
                    <p class="group-time" :id="getChatGroupTimeElementId(chatGroupItem.roomId)"></p>
                    <p class="group-slience" v-show="groupIsSlience(chatGroupItem)"></p>
                  </div>
                </div>
              </li>
            </ul>
            <!-- </transition-group> -->
            <ul class="group-list" name="group-list">
            <!-- <transition-group class="group-list" name="group-list" tag="ul"> -->
              <li class = 'group'
                  v-for="(chatGroupItem, index) in showLowPriorityGroupList"
                  @click="showChat(chatGroupItem, index)"
                  @contextmenu="rightClick($event, chatGroupItem)"
                  v-bind:key="ChatGroupId(chatGroupItem)"
                  :id="ChatGroupId(chatGroupItem)"
                  v-show='bRooms'>
                <div class = 'group-div' :id='ChatGroupDivId(chatGroupItem)'>
                  <!-- <listItem @groupInfo="chatGroupItem"/> -->
                  <div class="group-img">
                    <!-- <avatar-block :ownerName="chatGroupItem.name"></avatar-block> -->
                    <img class="group-ico" :id="chatGroupItem.roomId" src="../../../static/Img/User/group-40px@2x.png"/>
                    <p :class="getUnreadClass(chatGroupItem, index===curindex)" :id="getShowUnreadCountId(chatGroupItem)">{{getShowUnReadCount(chatGroupItem)}}</p>
                  </div>
                  <div class="group-info">
                    <img class="secret-flag" src="../../../static/Img/Chat/secretFlag@2x.png" v-show="isSecret(chatGroupItem)">
                    <p class="group-name-secret" v-show="isSecret(chatGroupItem)" :id="getChatGroupNameElementId(chatGroupItem.roomId, chatGroupItem.user_id)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-name" v-show="!isSecret(chatGroupItem)" :id="getChatGroupNameElementId(chatGroupItem.roomId, chatGroupItem.user_id)">{{getShowGroupName(chatGroupItem)}}</p>
                    <p class="group-content" :id="getChatContentElementId(chatGroupItem.roomId)"></p>
                  </div>
                  <div class="group-notice">
                    <p class="group-time" :id="getChatGroupTimeElementId(chatGroupItem.roomId)"></p>
                    <p class="group-slience" v-show="groupIsSlience(chatGroupItem)"></p>
                  </div>
                </div>
              </li>
            </ul>
            <!-- </transition-group> -->
          </div>
          <div class="search-list-content" id="search-list-content-id" v-show="isSearch">
            <div class="search-list-content-people" id="search-list-content-people-id" v-show="showSearchPeople && false">
              <div class="search-list-content-label">联系人</div>
              <div class="search-list-content-content">
                <ul class="search-list-content-list">
                  <li class="search-item"
                      v-for="searchPeopleItem in searchPeopleItems"
                      @click="showPeopleInfo($event, searchPeopleItem)"
                      >
                    <div class="search-item-img-div">
                      <img class="search-item-img-ico" :id="getSearchItemPeopleImgElementId(searchPeopleItem.matrix_id)" src="../../../static/Img/User/user-40px@2x.png"/>
                    </div>
                    <div class="search-item-info">
                      <p class="search-item-name" :id="getSearchItemPeopleNameElementId(searchPeopleItem.matrix_id)">{{searchPeopleItem.user_display_name}}</p>
                      <p class="search-item-position">{{searchPeopleItem.user_title}}</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="search-list-content-more-div" @click="showAllSearchUsers" v-show="showSearchAllMember">查看全部 >></div>
            </div>
            <div class="search-list-chat-message" id="search-list-chat-message-id" v-show="showSearchAllChat">
              <div class="search-list-chat-label">聊天</div>
              <div class="search-list-chat-content">
                <ul class="search-list-chat-list">
                  <li class="search-item"
                      v-for="searchChatItem in searchChatItems"
                      @click="toShowDistChat(searchChatItem)"
                      >
                    <div class="search-list-chat-list-div">
                      <div class="search-item-img-div">
                        <img class="search-item-img-ico" :id="getSearchChatItemImgElementId(searchChatItem.roomId)" src="../../../static/Img/User/group-40px@2x.png"/>
                      </div>
                      <div class="search-item-info">
                        <p class="search-item-name" :id="getSearchChatItemNameElementId(searchChatItem.roomId)"></p>
                        <p class="search-item-position"></p>
                      </div>
                    </div>
                  </li>
                    <li class="search-more-item" v-show="showAllSearchAllChat">
                      <div class="search-item-img-div" v-show="false">
                        <img class="search-item-img-ico" src="../../../static/Img/User/user-40px@2x.png"/>
                      </div>
                      <div class="search-item-info-more" @click="showAllSearchChats">
                        <p class="search-more-item-name">更多群组</p>
                        <img class="search-item-name-more-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showAllSearchChats">
                        <p class="search-item-position" v-html="heightLightSth()" v-show="false"></p>
                      </div>
                    </li>
                </ul>
              </div>
            </div>
            <div class="search-list-content-message" id="search-list-content-message-id" v-show="showSearchMessage">
              <div class="search-list-content-label">聊天记录</div>
              <div class="search-list-content-content">
                <ul class="search-list-content-list">
                  <li class="search-item"
                      v-for="searchMessageItem in searchMessageItems"
                      @click="showGroup(searchMessageItem)"
                      >
                    <div class="search-list-content-list-div">
                      <div class="search-item-img-div">
                        <img class="search-item-img-ico" :id="getSearchChatMsgItemImgElementId(searchMessageItem.room_id)" src="../../../static/Img/User/group-40px@2x.png"/>
                      </div>
                      <div class="search-item-info">
                        <p class="search-item-name" :id="getSearchChatMsgItemNameElementId(searchMessageItem.room_id)"></p>
                        <p class="search-item-position" :id="getSearchChatMsgItemContentElementId(searchMessageItem.room_id)" v-html="fileNameHeightLight(searchMessageItem)"></p>
                      </div>
                    </div>
                  </li>
                    <li class="search-more-item" v-show="showSearchAllChatMsg">
                      <div class="search-item-img-div" v-show="false">
                        <img class="search-item-img-ico" src="../../../static/Img/User/user-40px@2x.png"/>
                      </div>
                      <div class="search-item-info-more" @click="showAllSearchMessages">
                        <p class="search-more-item-name">更多聊天记录</p>
                        <img class="search-item-name-more-ico" src="../../../static/Img/Setup/arrow-20px@2x.png" @click="showAllSearchMessages">
                        <p class="search-item-position" v-html="heightLightSth()" v-show="false"></p>
                      </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="search-list-content-file" id="search-list-content-file-id" v-show="showSearchFile && false">
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
          <div class="win-header-white">
            <winHeaderBarWhite @getCreateGroupInfo="getCreateGroupInfo" @Close="Close" @Min="Min" @Max="Max"></winHeaderBarWhite>
          </div>
          <img class="chat-empty-bg" v-show="isEmpty" src="../../../static/Img/Chat/empyt2@2x.png">
        </div>
        <div class="chat" id="chat-page-id" v-show="!isEmpty">
          <div class="win-header" v-show="!isMsgSearch">
            <winHeaderBar @getCreateGroupInfo="getCreateGroupInfo" @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
          </div>
          <div class="win-header-white" v-show="isMsgSearch">
            <winHeaderBarWhite @getCreateGroupInfo="getCreateGroupInfo" @Close="Close" @Min="Min" @Max="Max"></winHeaderBarWhite>
          </div>
          <ChatPage ref="chatPageRef" :chat="curChat" :newMsg="newMsg" :searchKeyFromList="searchKeyFromList" :searchChat="searchChat" :toBottom="toBottom" @updateChatList="updateChatList" @showImageOfMessage="showImageOfMessage" @getCreateGroupInfo="getCreateGroupInfo" @leaveGroup="leaveGroup" @updateChatGroupStatus="updateChatGroupStatus" @closeUserInfoTip="closeUserInfoTip" @DeleteGroup="DeleteGroup" @JoinRoom="JoinRoom" @isSearching="isSearching" @showImportE2EKey="showImportE2EKey" @JumpToDistRoom="JumpToDistRoom"></ChatPage>
        </div>
      </div>
      <searchSenderSelecterDlg v-show="showSearchSelectedSenderDlg" @closeSearchSenderSelectDlg="closeSearchSenderSelectDlg" :rootDepartments="searchSelectedSenderDialogRootDepartments" :selectedUsers="searchSelectedSenders" :dialogTitle="searchSelectedSenderDialogTitle" :key="searchAddSenderKey">
      </searchSenderSelecterDlg>
      <searchChatSelecterDlg  v-show="showSearchSelecterDlg" @closeSearchChatFilterDlg="closeSearchChatFilterDlg" :searchSelectedGroupIds="searchSelectedGroupIds" :recentGroups="recentGroups" :key="searchSelectedGroupKey">
      </searchChatSelecterDlg>
      <imageLayer :imgSrcInfo="imageLayersSrcInfo" v-show="showImageLayers" @closeImageOfMessage="closeImageOfMessage"/>
      <div class="TheBorder" v-show="showImportE2EKeyPage">
          <ImportE2EKeypage @closeE2EImportPage="closeE2EImportPage"></ImportE2EKeypage>
      </div>
      <userInfoContent 
        id="userInfoId" 
        :userInfo="userInfo" 
        :isOwn="isOwn" 
        :originPosition="userInfoPosition" 
        v-if="showUserInfoTips" 
        @JumpToDistRoom="JumpToDistRoom" 
        :key="userInfoTipKey"
        @close="closeUserInfoTip"
      >
      </userInfoContent> 
    </div>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {APITransaction} from '../../packages/data/transaction.js'
import {services, environment} from '../../packages/data/index.js'
import ChatPage from './chat.vue'
import winHeaderBar from './win-header.vue'
import winHeaderBarWhite from './win-header-login.vue'
import imageLayer from './image-layers.vue'
import listHeader from './listheader'
import {ipcRenderer, remote} from 'electron'
import searchChatSelecterDlg from './searchChatSelecter.vue'
import searchSenderSelecterDlg from './searchSenderSelect.vue'
// import listItem from './list-item.vue'
import {downloadGroupAvatar, Appendzero, strMsgContentToJson, JsonMsgContentToString, FileUtil, changeStr, getIconPath} from '../../packages/core/Utils.js'
import { Group, UserInfo, Department, Message, Contact  } from '../../packages/data/sqliteutil'
import BenzAMRRecorder from 'benz-amr-recorder'
import userInfoContent from './user-info';
// import avatarBlock from './avatar.vue';
import {shell} from 'electron'
import confservice from '../../packages/data/conf_service.js'
import DMRoomMap from '../../packages/data/DMRoomMap.js'
import log from 'electron-log';
import {Filter} from 'matrix-js-sdk';
import * as Matrix from 'matrix-js-sdk';
const {Menu, MenuItem, clipboard, nativeImage} = remote;
import {mapState} from 'vuex';
import * as RoomUtil from '../script/room-util';
import ImportE2EKeypage from './importE2E.vue';
import {ComponentUtil} from '../script/component-util.js';
import { getRoomNotifsState, setRoomNotifsState, MUTE, ALL_MESSAGES } from "../../packages/data/RoomNotifs.js"
export default {
  components: {
    ChatPage,
    listHeader,
    winHeaderBar,
    winHeaderBarWhite,
    imageLayer,
    searchChatSelecterDlg,
    searchSenderSelecterDlg,
    userInfoContent,
    ImportE2EKeypage,
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
    scrollToRecentUnread: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    scrollToRecentUnread: function() {
      var distItem = this.getDistUnreadItem();
      console.log("*** scrollToRecentUnread distItem ", distItem);
      // if(this.checkNeedScroll(distItem)) {
        this.scrollToDistPosition(distItem);
      // }
    },
    inviteGroupsList: function(){
      if(this.searchKey == '')
        this.showInviteGroupList = this.inviteGroupsList;
    },

    dealShowGroupList: function(){
      if(this.searchKey == '')
        this.showDealGroupList = this.dealShowGroupList;
    },

    favouriteRooms:function(){
      if(this.searchKey == '')
        this.showFavouriteRooms = this.favouriteRooms;
    },

    lowPriorityGroupList: function(){
      if(this.searchKey == '')
        this.showLowPriorityGroupList = this.lowPriorityGroupList;
    },

    distUserId: async function() {
      console.log("in chat content distuserid is ", this.distUserId);
      if(this.distUserId.length != 0) {
        const existingRoom = DMRoomMap.shared().getDMRoomForIdentifiers([this.distUserId]);
        if(existingRoom){
          this.getCreateGroupInfo(existingRoom)
        }
        else{
          const createRoomOptions = {inlineErrors: true};
          createRoomOptions.dmUserId = targetIds[0];
          RoomUtil.CreateRoom(createRoomOptions).then((res)=>{
            let roomId = res.room_id;
            if(roomId)
                Rooms.setDMRoom(roomId, targetIds[0]);
            const existingRoom = DMRoomMap.shared().getDMRoomForIdentifiers([targetIds[0]]);
            if(existingRoom){
              this.getCreateGroupInfo(existingRoom)
            }
          });
        }
      }
    },
    distGroupId: async function() {
      console.log("in chat content distGroupId is ", this.distGroupId);
      let room = global.mxMatrixClientPeg.matrixClient.getRoom(this.distGroupId);
      if(room) {
        console.log('------distGroupId------');
        this.viewRoom(room);
      }
    },
    updateImg: async function() {
      // console.log("in chat content updateImg ");
      this.showGroupIconName();
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
        this.showGroupList.length = 0;
        global.mxMatrixClientPeg.matrixClient.getRooms().forEach((r) => {
          // console.log("this is ", r);
          // console.log("r.getMyMembership() ", r.getMyMembership());
          // console.log("roomname ", r.name)
          if(r.getMyMembership() != "leave") {
            this.showGroupList.push(r);
          }
        })
        this.ShowAllGroup();
        if(this.showGroupList.length != 0)
          this.curChat = this.showGroupList[0];
        this.$nextTick(() => {
          this.showGroupIconName();
        })
        
        global.mxMatrixClientPeg.matrixClient.on('RoomMember.membership', (event, member) => {
            console.log('chat-content membership member is ', member);
            const currentUserId = global.mxMatrixClientPeg.matrixClient.getUserId();
            setTimeout(async ()=>{
              if (member.userId == currentUserId) {
                console.log("event is ", event);
                console.log("member is ", member);
                console.log("membership ", member.membership)
                //join leave invite
                let newRoom = global.mxMatrixClientPeg.matrixClient.getRoom(member.roomId);
                if (member.membership == 'invite') {
                  for(let item of this.inviteGroupsList){
                    if(item.roomId == member.roomId){
                      return;
                    }
                  }
                  this.inviteGroupsList.unshift(newRoom);
                  this.$nextTick(() => {
                    this.showGroupIconName(newRoom);
                  })
                  var fromName = await this.getNoticeShowGroupName(newRoom);
                  const myUserId = global.mxMatrixClientPeg.matrixClient.getUserId();
                  const inviteEvent = newRoom.currentState.getMember(myUserId);
                  if (!inviteEvent) {
                      return;
                  }
                  const inviterUserId = inviteEvent.events.member.getSender();
                  var inviterName = await ComponentUtil.GetDisplayNameByMatrixID(inviterUserId);
                  this.showNotice(fromName, inviterName + "邀请你加入群聊");
                }
                else if(member.membership == "join"){
                  console.log('JoinRoom!!!')
                  this.JoinRoom(member.roomId);
                }
                else{
                  this.leaveGroup(member.roomId);
                }
              }
              else {
                this.UpdateRoomListPassive(member);
              }
            },320)
        })
        
        global.mxMatrixClientPeg.matrixClient.on("Room.tags", this.handleRoomTags)
        global.mxMatrixClientPeg.matrixClient.on("Room.timeline", this.onRoomTimeline);
      }
    }
  },
  computed: {
    ...mapState({
      matrixSync: state => state.common.matrixSync
    }),
  },
  data() {
    return {
      //需要展示的用户群组
      dealingEventIds: [],
      searchChat: undefined,
      searchKeyFromList: '',
      selfUserId: undefined,
      isFirstLogin: true,
      showImportE2EKeyPage: false,
      toBottom: false,  //聊天页面是否滚动到最底部
      showAllSearchAllChat: false,   //复合搜索中是否显示  显示所有聊天相关
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
      showSearchAllChat: true,
      showSearchAllChatMsg: true,
      showSearchFile: true,      //复合搜索内容是否包含文件相关
      showSearchPeople: true,      //复合搜索内容是否包含人员相关
      searchPeopleItems: [],      //复合搜索人员条目
      searchFileItems: [],      //复合搜索文件条目
      searchMessageItems: [],      //复合搜索聊天条目
      searchChatItems: [],
      needScroll: false,      //群组是否滚动
      isSearch: false,      //展示是否是复合搜索
      isMsgSearch: false,
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
      newMsg: false,      //转发之类的消息信息
      mqttGroupVar: [],      //一些不完整的group的临时存储
      searchId: 0,      //复合搜索,
      matrixClient: undefined,
      roomToUser: null,
      bInvites: true,
      bCollections: true,
      bRooms: true,
      favouriteRooms: [],//置顶列表
      showFavouriteRooms: [],//显示置顶列表
      inviteGroupsList:[],//邀请列表
      showInviteGroupList:[],
      dealShowGroupList:[],//聊天列表
      showDealGroupList:[],
      lowPriorityGroupList: [],
      showLowPriorityGroupList:[],
      oldElementGroupItem: null,
      oldElementGroupDiv: null,
      unreadIndex: -1,
      hasUnreadItems: [],
    };
  },
  methods: {
    getShowUnreadCountId(chatGroupItem) {
      return "unread-count-element-id-" + chatGroupItem.roomId;
    },
    heightLightSth() {
      let splitValue = ["关于 ", " 的更多聊天记录"];
      let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
      return newInnerHtml;
    },
    fileNameHeightLight(searchChatItem) {
      if(searchChatItem.firstChat.body == undefined) {
        return "";
      }
      
      var fileName = searchChatItem.firstChat.body;
      // showContent = showContent + ' ';
      if(this.searchKey.length == 0) {
          return ""
      }
      if(fileName.indexOf(this.searchKey) != -1) {
          let splitValue = fileName.split(this.searchKey);
          let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
          return newInnerHtml;
      }
    },
    JumpToDistRoom(distUserId) {
      console.log("in chat content distGroupId is ", this.distGroupId);
      let room = global.mxMatrixClientPeg.matrixClient.getRoom(distGroupId);
      if(room) {
        console.log('------distGroupId------');
        this.viewRoom(room);
      }
    },
    getDistUnreadItem() {
      console.log("*** getDistUnreadItem unreadIndex ", this.unreadIndex);
      console.log("*** getDistUnreadItem hasUnreadItems ", this.hasUnreadItems);
      if(this.unreadIndex >= this.hasUnreadItems.length - 1) {
        this.unreadIndex = 0;
      }
      else {
        this.unreadIndex += 1;
      }
      return this.hasUnreadItems[this.unreadIndex];
    },
    DMCheck(curRoomItem) {
        const client = window.mxMatrixClientPeg.matrixClient;
        const mDirectEvent = client.getAccountData('m.direct');
        let dmRoomMap = {};
        if (mDirectEvent !== undefined) dmRoomMap = mDirectEvent.getContent();
        let currentRoom = curRoomItem;
        let dmRoomIdArr = [];
        const roomId = currentRoom.roomId;
        const userId = client.getUserId();
        Object.keys(dmRoomMap).forEach(k=>{
            let arr = dmRoomMap[k];
            arr.forEach(a=>dmRoomIdArr.push(a))
        })
        if (dmRoomIdArr.includes(roomId)) {
            return true;
        } else {return false;}
    },
    isSearching(isMsgSearch) {
        this.isMsgSearch = isMsgSearch;
    },
    closeE2EImportPage() {
        this.showImportE2EKeyPage = false;
    },
    showImportE2EKey() {
        this.showImportE2EKeyPage = true;
    },
    checkUnreadCount: function() {
      this.unreadCount = 0;
      this.hasUnreadItems = [];
      this.showGroupList.forEach((item)=>{
        if(item.getMyMembership() == "invite") {
          // this.unreadCount += 1;
        }
        else{
          this.updateItemUnreadState(item);
          const notificationCount = item.getUnreadNotificationCount();
          if(notificationCount) {
            this.hasUnreadItems.unshift(item);
            this.unreadCount += notificationCount;
          }
        }
      })
      ipcRenderer.send("updateUnreadCount", this.unreadCount);
    },
    updateItemUnreadState(item) {
      if(item) {
        if(this.groupIsSlience(item)) {
          if(global.mxMatrixClientPeg.getChatUnreadState(item.roomId)) {
            var unreadCountelement = document.getElementById(this.getShowUnreadCountId(item));
            if(unreadCountelement) {
              unreadCountelement.style.display = "block";
            }
          }
          else {
            var unreadCountelement = document.getElementById(this.getShowUnreadCountId(item));
            if(unreadCountelement) {
              unreadCountelement.style.display = "none";
            }
          }
        }
        else {
            var unreadCountelement = document.getElementById(this.getShowUnreadCountId(item));
            if(unreadCountelement) {
              unreadCountelement.style.display = "block";
            }
        }
      }
      else {
        this.showGroupList.forEach((item)=>{
          if(item.getMyMembership() == "invite") {
            // this.unreadCount += 1;
          }
          else{
            if(this.groupIsSlience(item)) {
              if(global.mxMatrixClientPeg.getChatUnreadState(item.roomId)) {
                var unreadCountelement = document.getElementById(this.getShowUnreadCountId(item));
                if(unreadCountelement) {
                  unreadCountelement.style.display = "block";
                }
              }
              else {
                var unreadCountelement = document.getElementById(this.getShowUnreadCountId(item));
                if(unreadCountelement) {
                  unreadCountelement.style.display = "none";
                }
              }
            }
            else {
                var unreadCountelement = document.getElementById(this.getShowUnreadCountId(item));
                if(unreadCountelement) {
                  unreadCountelement.style.display = "block";
                }
            }
          }
        })
      }
    },
    ShowAllGroup: function(){
      this.unreadCount = 0;
      this.inviteGroupsList.length = 0;
      this.favouriteRooms.length = 0;
      this.dealShowGroupList.length = 0;
      this.lowPriorityGroupList.length = 0;
      this.hasUnreadItems = [];
      this.showGroupList.forEach((item)=>{
        if(item.getMyMembership() == "invite") {
          // this.unreadCount += 1;
          this.inviteGroupsList.push(item);
        }
        else{
          const notificationCount = item.getUnreadNotificationCount();
          if(notificationCount) {
            this.hasUnreadItems.unshift(item);
            this.unreadCount += notificationCount;
          }
          let tags = item.tags;
          if(tags && tags['m.favourite']){
            this.favouriteRooms.push(item)
          }
          else if(tags && tags['m.lowpriority']){
            this.lowPriorityGroupList.push(item)
          }
          else{
            this.dealShowGroupList.push(item);
          }
        }
      })
      if(this.favouriteRooms.length !=0){
        this.favouriteRooms.sort(this.SortGroupByTimeLine);
      }
      if(this.dealShowGroupList.length != 0)
        this.dealShowGroupList.sort(this.SortGroupByTimeLine);
      if(this.lowPriorityGroupList.length != 0)
        this.lowPriorityGroupList.sort(this.SortGroupByTimeLine);
      setTimeout(() => {
        this.$nextTick(() => {
          this.updateItemUnreadState();
        })
      })
      ipcRenderer.send("updateUnreadCount", this.unreadCount);
    },
    
    SortGroupByTimeLine(item1, item2){
      let timeline1 = 0;
      let timeline2 = 0;
      if(item1.timeline.length != 0){
        let msg1 = this.GetLastShowMessage(item1);
        if(msg1 && msg1.event){
          timeline1 = msg1.event.origin_server_ts;
        }
        else{
          timeline1 = 0;
        }
      }
      if(item2.timeline.length != 0){
        let msg2 = this.GetLastShowMessage(item2);
        if(msg2 && msg2.event){
          timeline2 = msg2.event.origin_server_ts;
        }
        else{
          timeline2 = 0;
        }
      }
      return timeline2 - timeline1;
    },

    handleRoomTags(event, roomTagsEvent, room){
      console.log("room ", room)
      console.log("roomname ", room.name)
      console.log("roomtag", room.tags)
      if(room.tags['m.favourite']){
        this.DeleteFromGroups(this.dealShowGroupList, room.roomId);
        this.DeleteFromGroups(this.lowPriorityGroupList, room.roomId);
        if(this.favouriteRooms.every(item=>{
          return item.roomId != room.roomId
        }))
        this.favouriteRooms.unshift(room);    
      }
      else if(room.tags['m.lowpriority']){
        this.DeleteFromGroups(this.dealShowGroupList, room.roomId);
        this.DeleteFromGroups(this.favouriteRooms, room.roomId);
        if(this.lowPriorityGroupList.every(item=>{
          return item.roomId != room.roomId
        }))
        this.lowPriorityGroupList.unshift(room); 
      }
      else{
        this.DeleteFromGroups(this.favouriteRooms, room.roomId);
        this.DeleteFromGroups(this.lowPriorityGroupList, room.roomId);
        if(this.dealShowGroupList.every(item=>{
          return item.roomId != room.roomId
        })){
          this.dealShowGroupList.unshift(room);
        }
      }
      setTimeout(() => {
        this.$nextTick(() => {
          this.showGroupIconName(room);
          this.sortGroup();
        })
      }, 0)
    },

    InvitesClick(){
      this.bInvites = !this.bInvites;
    },

    CollectionRoomClick(){
      this.bCollections = !this.bCollections;
    },

    RoomsClick(){
      this.bRooms = !this.bRooms;
    },

    viewRoom(room) {
      console.log('---viewRoom new rooms---',  room);
      const newRooms = global.mxMatrixClientPeg.matrixClient.getRooms();
      for(let i=0; i<newRooms.length; i++) {
        console.log('xie1--', newRooms[i].roomId);
        console.log('xie2--', room);
        if (newRooms[i].roomId === room.room_id || newRooms[i].roomId === room.roomId) {
          console.log('---to show---');
          if(this.checkNeedScroll(room)) {
            this.scrollToDistPosition(room);
          }
          return this.showChat(newRooms[i], i);
        }
      }
      console.log('chongxinchaxun')
      setTimeout(()=>{this.viewRoom(room)}, 160);
    },
    isSecret(item) {
      return global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(item.roomId);
    },
    ChatGroupId(item) {
      return "chat-v-bind-" + item.roomId;
    },

    ChatGroupDivId(item){
      return 'chat-group-div-' + item.roomId;
    },
    async getNotificationContent(msg) {
      let event = msg.event;
      console.log("*** notification event ", event);
      if(event.sender == global.mxMatrixClientPeg.matrixClient.getUserId()) {
        return;
      }
      let senderInfo = global.mxMatrixClientPeg.matrixClient.getUser(event.sender)
      // console.log("*** senderInfo ", senderInfo);
      let chatGroupMsgType = event.type;
      var chatGroupMsgContent = msg.getContent();
      var sender = await ComponentUtil.GetDisplayNameByMatrixID(senderInfo.userId);
      if(chatGroupMsgType === "m.room.message")
      {
          if(chatGroupMsgContent.msgtype == 'm.file'){
            return sender + "：[文件]" + chatGroupMsgContent.body;
          }
          else if(chatGroupMsgContent.msgtype == 'm.text'){
            var content = chatGroupMsgContent.body;
            return sender + "：" + content;
          }
          else if(chatGroupMsgContent.msgtype == 'm.image'){
            return sender + "：[图片]";
          } 
      }
      else if(chatGroupMsgType === "m.room.encrypted") {
          // chatGroupMsgContent = this.msg.getContent();
          return "收到一条加密消息";
          if(chatGroupMsgContent.msgtype == 'm.file'){
            return "[文件]:" + chatGroupMsgContent.body;
          }
          else if(chatGroupMsgContent.msgtype == 'm.text'){
            var sender = event.sender.name;
            var content = chatGroupMsgContent.body;
            return sender + ":" + content;
          } 
          else if(chatGroupMsgContent.msgtype == 'm.image'){
            return "[图片]";
          }
          else if(chatGroupMsgContent.msgtype == "m.bad.encrypted") {
             return this.messageContent = chatGroupMsgContent.body;
          }
      }
        return "收到一条短消息";

    },
    sortFavourete() {
      if(this.favouriteRooms.length != 0)
        this.favouriteRooms.sort(this.SortGroupByTimeLine);
    },
    sortLowPriority() {
      if(this.lowPriorityGroupList.length != 0)
        this.lowPriorityGroupList.sort(this.SortGroupByTimeLine);
    },
    sortGroup(){
      if(this.favouriteRooms.length != 0)
        this.favouriteRooms.sort(this.SortGroupByTimeLine);
      
      if(this.dealShowGroupList.length != 0)
        this.dealShowGroupList.sort(this.SortGroupByTimeLine);

      if(this.lowPriorityGroupList.length != 0)
        this.lowPriorityGroupList.sort(this.SortGroupByTimeLine);

      if(this.hasUnreadItems.length != 0) {
        this.hasUnreadItems.sort(this.SortGroupByTimeLine);
      }
    },

    async getNoticeShowGroupName(groupInfo) {
      if(groupInfo != undefined) {
        if(global.mxMatrixClientPeg.DMCheck(groupInfo)) {
          var distUserId = global.mxMatrixClientPeg.getDMMemberId(groupInfo);
          if(!distUserId) {
            return groupInfo.name;
          }
          else {
            var fromName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
            return fromName
          }
        }
      }
    },
    onRoomTimeline(ev, room, toStartOfTimeline, removed, data) {
      // console.log("*** data ", data);
      // console.log("*** room ", room);
      // console.log("*** this.curChat ", this.curChat);
      // console.log("**********************************");
      if(this.dealingEventIds.indexOf(ev.event.event_id) >=0) {
        return;
      }
      else {
        this.dealingEventIds.push(ev.event.event_id);
      }
      if(this.isFirstLogin) {
        var curTime = new Date().getTime();
        if(curTime - ev.event.origin_server_ts > 1000 * 60) {
          return;
        }
      }
      if(data.liveEvent) {
        if(room.roomId == this.curChat.roomId && !this.isFirstLogin) {
          this.newMsg = !this.newMsg;
        }
        this.updateChatList(ev);
      }
      
      if(this.dealingEventIds.length > 20) {
          this.dealingEventIds.splice(19, this.dealingEventIds.length - 20);
      }
        // if(!this.isScroll) {
        //     console.log("onRoomTimeline ", ev)
        //     this.$emit("updateChatList", ev);
        // }
        // //this.UpdateUserAvater(ev);
        
        // if (data.timeline.getTimelineSet() !== this.timeLineSet) return;
        
        // // let bottom = this.IsBottom();
        // // this._timelineWindow.paginate("f", 1, false).then(() => {
        // //     this.messageList = this._getEvents();
        // // })
        // if(!this.isScroll) {
        //     setTimeout(() => {
        //         this.$nextTick(() => {
        //             var div = document.getElementById("message-show-list");
        //             if(div) {
        //                     // console.log("div scrolltop is ", div.scrollHeight)
        //                     // div.scrollTop = div.scrollHeight;
        //                     div.scrollTo({ top:div.scrollHeight, behavior: 'smooth' })
        //                 }
        //         })
        //     }, 100)
        // }
    },
    async updateChatList(newMsg) {
      if(newMsg.isState()) {
        return;
      }
      var groupInfo = await global.mxMatrixClientPeg.matrixClient.getRoom(newMsg.event.room_id);
      this.updateGroupMsgContent([groupInfo]);
      this.sortGroup();
      var fromName = "";
      var fromUserName = "";
      // console.log("msg.messagefromid ", msg.message_from_id);
      var fromUserInfo = newMsg.sender ? newMsg.sender.name : newMsg.event.sender;
      // console.log("*** newMsg is ", newMsg);
      if(newMsg.event.room_id == this.curChat.roomId && !this.isFirstLogin) {
        console.log("*** updateChatList SetRoomReader");
        this.SetRoomReader(this.curChat);
        setTimeout(() => {
          if(this.checkNeedScroll(this.curChat)) {
            this.scrollToDistPosition(this.curChat);
          }
        }, 100)
        return;
      }
      if(newMsg.event.sender == global.mxMatrixClientPeg.matrixClient.getUserId()) {
        return;
      }
      var notificateContent = await this.getNotificationContent(newMsg);
      // console.log("fromUserInfo ", fromUserInfo);
      fromName = await this.getNoticeShowGroupName(groupInfo);
      // console.log("*** title is ", notificateContent)
      // console.log("*** fromName is ", fromName)
      if(!this.groupIsSlience(groupInfo)) {
        this.showNotice(fromName, notificateContent);
      }
      else {
        var unreadInfo = [groupInfo.roomId, true];
        global.mxMatrixClientPeg.updageChatUnreadState(unreadInfo);
      }
      this.checkUnreadCount();
    },
    checkNeedScroll(checkItem) {
      if(this.isFirstLogin && !checkItem) {
        return false;
      }
      var distGroupItem = document.getElementById(this.getChatGroupNameElementId(checkItem ? checkItem.roomId : this.curChat.roomId));
      if(this.groupListElement == null) {
        this.groupListElement = document.getElementById("list-content-id");
      }
      if(this.groupListElement && distGroupItem) {
        if(this.groupListElement.scrollTop > distGroupItem.offsetTop || (this.groupListElement.scrollTop + this.groupListElement.clientHeight < distGroupItem.offsetTop)) {
          console.log("*** need Scroll");
          return true;
        }
        else {
          console.log("*** do not need Scroll");
          return false;
        }
        this.groupListElement.scrollTo({top: distGroupItem.offsetTop - 120, behavior: 'instant'});
      }
      else {
        return false;
      }
    },
    showNotice(fromName, notificateContent) {
      if(this.isWindows()) {
        if(global.localStorage.getItem("message_notice") == undefined || global.localStorage.getItem("message_notice") == "true") {
          ipcRenderer.send("flashIcon", fromName, notificateContent);
        }
        try{
          if(global.localStorage.getItem("message_sound")) {
            // this.amr.play();
          }
        }
        catch(e) {
          
        }
      }
      else {
        if(global.localStorage.getItem("message_notice") == undefined || global.localStorage.getItem("message_notice") == "true") {
          ipcRenderer.send("showNotice", fromName, notificateContent);
        }
      }
    },
    eventUpdateChatList(event, newMsg) {
      // ++this.needUpdate;
      if(this.curChat.group_type == 102 && (this.curChat.roomId == undefined || this.curChat.roomId.length == 0)) {
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
    getSearchChatItemImgElementId: function(itemId) {
      return "all-search-chat-img-" + itemId;
    },
    getSearchChatMsgItemImgElementId: function(itemId) {
      return "all-search-chat-msg-img-" + itemId;
    },
    getSearchItemElementId: function(itemId) {
      return "all-search-" + itemId;
    },
    getSearchItemPeopleImgElementId: function(itemId) {
      return "all-search-people-img-" + itemId;
    },
    getSearchItemPeopleNameElementId: function(itemId) {
      return "all-search-people-name-" + itemId;
    },
    getSearchChatItemNameElementId: function(itemId) {
      return "all-search-chat-name-" + itemId;
    },
    getSearchChatMsgItemNameElementId: function(itemId) {
      return "all-search-chat-msg-name-" + itemId;
    },
    getSearchChatMsgItemContentElementId: function(itemId) {
      return "all-search-chat-msg-content-" + itemId;
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
      console.log('chat-content中的userInfo模版', this.showUserInfoTips)
    },
    toShowDistChat: function(groupInfo) {
      this.needScroll = true;
      console.log("Created Info is ", groupInfo)
      var searchKey = "";
      this.cleanSearchKey = !this.cleanSearchKey;
      this.toSearch("");
      this.showUserInfoTips = false;
      
      setTimeout(() => {
        this.$nextTick(() => {
          for(let i in this.dealShowGroupList){
            if(this.dealShowGroupList[i].roomId == groupInfo.roomId) {
              this.showChat(groupInfo, 0, this.searchKey);
              if(this.checkNeedScroll(groupInfo)) {
                this.scrollToDistPosition(groupInfo);
              }
              return;
            } 
          }
        })
      }, 0)
    },
    showGroup: async function(groupInfo) {
      console.log("in chat content distGroupId is ", groupInfo);
      if(groupInfo.room_id.length != 0) {
        var distInfo = global.mxMatrixClientPeg.matrixClient.getRoom(groupInfo.room_id);
        if(distInfo != undefined) {
          this.showChat(distInfo, 0, this.searchKey);
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
    scrollToDistPosition(distGroup) {
      var distGroupItem = document.getElementById(this.getChatGroupNameElementId(distGroup.roomId));
      console.log("*** dist room element client top is ", distGroupItem.offsetTop);
      if(this.groupListElement == null) {
        this.groupListElement = document.getElementById("list-content-id");
      }
      if(this.groupListElement && distGroupItem) {
        this.groupListElement.scrollTo({top: distGroupItem.offsetTop - 70, behavior: 'instant'})
      }
      // this.needScroll = false;
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

    isWindows() {
      return environment.os.isWindows;
    },
    rightClick(e, groupItem) {
        console.log("groupItem is ", groupItem)
        console.log("e.target is ", e.target.className)
        if(this.groupIsInvite(groupItem)) return;
        // let distElement = document.getElementById(msgItem.message_id);
        // console.log("distElement is ", distElement.className);
        // if(this.checkClassName.indexOf(e.target.className) == -1) {
        //     return;
        // }
        var isSecret = false;

        this.menu = new Menu();
        let unread = groupItem.getUnreadNotificationCount();
        if(unread != 0){
          this.menu.append(new MenuItem({
            label: "标记已读",
            click: () => {
                this.SetRoomReader(groupItem)
            }
          })); 
        }
        
        /*
        if(this.groupIsSlience(groupItem)) {
          this.menu.append(new MenuItem({
              label: "允许消息通知",
              click: () => {
                  this.setUnSlience(groupItem)
              }
          }));
        }
        else {
          if(this.groupIsInFavourite(groupItem) || this.groupIsInGroups(groupItem))
          {
            this.menu.append(new MenuItem({
                label: "消息免打扰",
                click: () => {
                    this.setSlience(groupItem)
                }
            }));  
          }
        }
        */
        if(this.groupIsInFavourite(groupItem)) {
          this.menu.append(new MenuItem({
              label: "取消置顶",
              click: () => {
                  this.unFavouriteIt(groupItem)
              }
          }));
        }
        else if(this.groupIsInGroups(groupItem) || this.groupIsInLowPriority(groupItem)){
          this.menu.append(new MenuItem({
              label: "置顶聊天",
              click: () => {
                  this.favouriteIt(groupItem)
              }
          }));
        }

        if(this.groupIsInLowPriority(groupItem)){
          this.menu.append(new MenuItem({
            label: "取消置底",
            click: () => {
                this.DelRoomLowpriority(groupItem)
            }
          }));
        }
        else if(this.groupIsInFavourite(groupItem) || this.groupIsInGroups(groupItem)){
          this.menu.append(new MenuItem({
            label: "置底聊天",
            click: () => {
                this.SetRoomLowpriority(groupItem)
            }
          }));
        }
      
       /*
        this.menu.append(new MenuItem({
            label: "退出",
            click: () => {
                this.deleteGroup(groupItem)
            }
        }));   
        */
        this.menu.popup(remote.getCurrentWindow());
    },
    SetRoomLowpriority(groupItem){
      let metaData = {};
      global.mxMatrixClientPeg.matrixClient.setRoomTag(groupItem.roomId, "m.lowpriority", metaData);
      this.unFavouriteIt(groupItem);
    },

    DelRoomLowpriority(groupItem){
	    global.mxMatrixClientPeg.matrixClient.deleteRoomTag(groupItem.roomId, "m.lowpriority");
    },

    deleteGroup(groupItem) {
      this.leaveGroup(groupItem.roomId);
    },
    favouriteIt: function(groupItem){
      let metaData = {};
      global.mxMatrixClientPeg.matrixClient.setRoomTag(groupItem.roomId, "m.favourite", metaData);
      this.DelRoomLowpriority(groupItem);
    },
    unFavouriteIt: function(groupItem){
      global.mxMatrixClientPeg.matrixClient.deleteRoomTag(groupItem.roomId, "m.favourite");
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

    UpdateGroupImage: function(distGroup){
        var elementImg = document.getElementById(distGroup.roomId);
        var distUrl = global.mxMatrixClientPeg.getRoomAvatar(distGroup);
        if(!distUrl || distUrl == '') {
            let defaultGroupIcon;
            if(global.mxMatrixClientPeg.DMCheck(distGroup))
                defaultGroupIcon = "./static/Img/User/user-40px@2x.png";
            else
                defaultGroupIcon = "./static/Img/User/group-40px@2x.png";
            elementImg.setAttribute("src", defaultGroupIcon); 
        }
        if(elementImg != undefined && distUrl) {
          elementImg.setAttribute("src", distUrl);
        }
    },

    updageGroupName: async function(distGroup) {
      var elementGroupName = document.getElementById(this.getChatGroupNameElementId(distGroup.roomId));
      if(global.mxMatrixClientPeg.DMCheck(distGroup)) {
        var distUserId = global.mxMatrixClientPeg.getDMMemberId(distGroup);
        if(!distUserId) {
          // elementGroupName.innerHTML = distGroup.name;
          return;
        }
        var displayName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
        elementGroupName.innerHTML = displayName;//distGroup.name = displayName;
      }
    },

    UpdateGroupsImageAndName: function(groups){
      for(let item of groups){
        this.updateGroupContent(item);
        this.UpdateGroupImage(item);
        this.updageGroupName(item);
      }
    },

    updateInviteChatContent: async function(groups) {
      for(let item of groups) {
        var distElement = document.getElementById(this.getInviteChatContentElementId(item.roomId));
        if(distElement) {
          if(item.timeline && item.timeline.length == 0){
            if(item.getMyMembership() == "invite") {
              if (!item) {
                  return;
              }
              const myUserId = global.mxMatrixClientPeg.matrixClient.getUserId();
              const inviteEvent = item.currentState.getMember(myUserId);
              if (!inviteEvent) {
                  return;
              }
              const inviterUserId = inviteEvent.events.member.getSender();
              var inviterName = await ComponentUtil.GetDisplayNameByMatrixID(inviterUserId);
              if(global.mxMatrixClientPeg.DMCheck(item)) {
                distElement.innerHTML = inviterUserId;
              }
              else {
                distElement.innerHTML = "由 " + inviterName + " 邀请";
              }
            }
          };
        }
      }
    },
    updateGroupContent: async function(item) {
      if(this.selfUserId == undefined && global.mxMatrixClientPeg.matrixClient) {
        this.selfUserId = global.mxMatrixClientPeg.matrixClient.getUserId();
      }
      var distContentElement = document.getElementById(this.getChatContentElementId(item.roomId));
      var distTimeElement = document.getElementById(this.getChatGroupTimeElementId(item.roomId));
      if(distContentElement) {
        var distTimeLine = this.GetLastShowMessage(item);
        if(distTimeLine == undefined) {
          this.toUpdateTimeLine(item);
          // distElement.innerHTML = "";
          // this.showGroupIconName(item);
          // return;
          return;
        }
        item.distTimeLine = distTimeLine;
        var event = distTimeLine.event;
        var chatGroupMsgType = event.type;
        var chatGroupMsgContent = distTimeLine.getContent();

        if(chatGroupMsgType === "m.room.message")
        {
            var sender = distTimeLine.sender ? distTimeLine.sender : distTimeLine.event.sender;
            if(sender.userId) {
              sender = sender.userId;
            }
            // console.log("*** sender ", sender);
            if(sender != this.selfUserId && !global.mxMatrixClientPeg.DMCheck(item)) {
              var senderName = await ComponentUtil.GetDisplayNameByMatrixID(sender);
              if(chatGroupMsgContent.msgtype == 'm.file'){
                distContentElement.innerHTML =  senderName + "：" + "[文件]" + chatGroupMsgContent.body;
              }
              else if(chatGroupMsgContent.msgtype == 'm.text'){
                distContentElement.innerHTML = senderName + "：" + chatGroupMsgContent.body;
              }
              else if(chatGroupMsgContent.msgtype == 'm.image'){
                distContentElement.innerHTML = senderName + "：" + "[图片]";// + chatGroupMsgContent.body;
              } 
              else if(chatGroupMsgContent.msgtype == "m.audio") {
                distContentElement.innerHTML = senderName + ":" + "[语音]";
              }
            }
            else {
              if(chatGroupMsgContent.msgtype == 'm.file'){
                distContentElement.innerHTML =  "[文件]" + chatGroupMsgContent.body;
              }
              else if(chatGroupMsgContent.msgtype == 'm.text'){
                distContentElement.innerHTML = chatGroupMsgContent.body;
              }
              else if(chatGroupMsgContent.msgtype == 'm.image'){
                distContentElement.innerHTML = "[图片]";// + chatGroupMsgContent.body;
              } 
              else if(chatGroupMsgContent.msgtype == "m.audio") {
                distContentElement.innerHTML = "[语音]";
              }
            }
        }
        else if(chatGroupMsgType === "m.room.encrypted") {
            distContentElement.innerHTML = "收到一条加密消息";
        }
      }
      if(distTimeElement) {
        var formatTime = ""
        var timesecond = Number(event ? event.origin_server_ts : '');

        if(timesecond.length == 0) {
          return;
        }

        formatTime = this.formatTimeFilter(timesecond);
        distTimeElement.innerHTML = formatTime;
      }
    },
    updateGroupMsgContent: async function(groups) {
      if(this.selfUserId == undefined && global.mxMatrixClientPeg.matrixClient) {
        this.selfUserId = global.mxMatrixClientPeg.matrixClient.getUserId();
      }
      for(let item of groups) {
        this.updateGroupContent(item);
      }
    },

    showGroupIconName: async function(distGroup=undefined) {
      // setTimeout(async () => {
      if(distGroup){
        this.updateGroupContent(distGroup);
        this.UpdateGroupImage(distGroup);
        this.updageGroupName(distGroup);
      }
      else{
          this.UpdateGroupsImageAndName(this.showFavouriteRooms);
          // this.updateGroupMsgContent(this.showFavouriteRooms);
          this.UpdateGroupsImageAndName(this.showInviteGroupList);
          this.updateInviteChatContent(this.showInviteGroupList);
          this.UpdateGroupsImageAndName(this.showDealGroupList);
          // this.updateGroupMsgContent(this.showDealGroupList);
          this.UpdateGroupsImageAndName(this.showLowPriorityGroupList);
          // this.updateGroupMsgContent(this.showLowPriorityGroupList);
      }
    },

    groupIsInvite(groupInfo){
      return this.inviteGroupsList.some(item => item.roomId == groupInfo.roomId)
    },

    groupIsInLowPriority(groupInfo){
      if(this.lowPriorityGroupList.indexOf(groupInfo) == -1) {
        return false;
      }
      return true;
    },

    groupIsInFavourite(groupInfo) {
      if(this.favouriteRooms.indexOf(groupInfo) == -1) {
        return false;
      }
      return true;
    },
    groupIsInGroups(groupInfo){
      if(this.dealShowGroupList.indexOf(groupInfo) == -1)
        return false;
      return true;
    },

    groupIsSlience(groupInfo) {
      const state = getRoomNotifsState(groupInfo.roomId);
      if(state == MUTE) {
        return true;
      }
      else {
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
    async searchRoom(groups, searchKey) {
      var searchResult = [];
      // console.log("search key is ", searchKey);
      for(var i=0;i<groups.length;i++) {
        // console.log("the room name is ", this.showGroupList[i].name.indexOf(searchKey));
        if(global.mxMatrixClientPeg.DMCheck(groups[i])) {
          var distUserId = global.mxMatrixClientPeg.getDMMemberId(groups[i]);
          if(!distUserId) {
            continue;
          }
          var displayName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
          if(displayName.indexOf(searchKey) >= 0) {
            // console.log("inininin put ");
            searchResult.push(groups[i]);
          }
        }
        else{
          if(groups[i].name.indexOf(searchKey) >= 0) {
            // console.log("inininin put ");
            searchResult.push(groups[i]);
          }
        }
      }
      return searchResult;
    },
    async toSearch(searchKey) {
      // console.log("searchkey is ", searchKey);
      // console.log("searchkey is ", searchKey.trim());
      this.searchKey = searchKey.trim();
      console.log("searchkey is ", this.searchKey);
      
      if(this.searchKey.length != 0) {
        var showFavouriteRooms = await this.searchRoom(this.favouriteRooms, searchKey);
        var showDealGroupList = await this.searchRoom(this.dealShowGroupList, searchKey);
        var showLowPriorityGroupList = await this.searchRoom(this.lowPriorityGroupList, searchKey);
        var concatSearchChatItems = [].concat(showFavouriteRooms, showDealGroupList, showLowPriorityGroupList);
        if(concatSearchChatItems.length > 3) {
          this.showSearchAllChatMsg = true; 
        }
        this.searchChatItems = concatSearchChatItems.splice(0, 3);
        // console.log("*** searchChatItems ", this.searchChatItems);
        
        var curSearchId = new Date().getTime();
        var searchResult = {
            "id": curSearchId,
            "searchList": []
        };
        this.searchId = curSearchId;
        var searchUsers = await UserInfo.SearchByNameKey(this.searchKey);
        console.log("*** searchUsers is ", searchUsers);
        var searchChat = await global.services.common.searchAllChat(searchKey, 3);
        if(searchResult.id == this.searchId) {
          if(searchChat.rooms.results.length != 0) {
            this.searchMessageItems = searchChat.rooms.results;
            this.showSearchMessage = true;
            if(searchChat.rooms.more) {
              this.showAllSearchAllChat = true;
            }
            else {
              this.showAllSearchAllChat = false;
            }
          }
          else {
            this.showSearchMessage = false;
          }
          if(false) {
            this.searchFileItems = searcheRet[i].files.slice(0, 3);
            if(this.searchFileItems.length == 0) {
              this.showSearchFile = false;
            }
            else {
              this.showSearchFile = true;
            }
            if(searcheRet[i].files.length > 3) {
              this.showsearchAllFile = true;
            }
            else {
              this.showsearchAllFile = false;
            }
          }
          if(searchUsers.length != 0) {
            this.searchPeopleItems = searchUsers.slice(0, 3);
            this.showSearchPeople = true;
            if(searchUsers.length > 3) {
              this.showSearchAllMember = true;
            }
            else {
              this.showSearchAllMember = false;
            }
          }
          else {
              this.showSearchPeople = false;
          }
        }
        setTimeout(() => {
          this.$nextTick(() => {
              this.showSearchResultIcon();
          })
        }, 0)
        if(this.searchKey.length == 0) {
          this.isSearch = false;
          this.showSearchAllChat = true;
          this.showSearchMessage = true;
          this.searchPeopleItems = [];
          this.searchMessageItems = [];
          console.log("this.issearch = ", this.isSearch)
        }
        else {
          this.isSearch = true;
          console.log("this.issearch = ", this.isSearch)
        }
      }
      else{
        this.isSearch = false;
        this.showSearchAllChat = true;
        this.searchPeopleItems = [];
        this.searchMessageItems = [];
      }
    },
    showSearchResultIcon: async function() {
      /*
      for(let i=0;i<this.searchPeopleItems.length;i++) {
        var curSearchPeopleItem = this.searchPeopleItems[i];
        if(curSearchPeopleItem.matrix_id.length != 0) {
          var searchPeopleImgId = this.getSearchItemPeopleImgElementId(curSearchPeopleItem.matrix_id);
          var searchPeopleNameId = this.getSearchItemPeopleNameElementId(curSearchPeopleItem.matrix_id);
          var searchPeopleImgElement = document.getElementById(searchPeopleImgId);
          var searchPeopleNameElement = document.getElementById(searchPeopleNameId);
          var profileInfo = await mxMatrixClientPeg.matrixClient.getProfileInfo(curSearchPeopleItem.matrix_id)
          var validUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
          console.log('*** 1111 ', validUrl);
          var showName = await ComponentUtil.GetDisplayNameByMatrixID(curSearchPeopleItem.matrix_id);
          console.log('*** 2222 ', showName);
          searchPeopleNameElement.innerHTML = showName;
          if(!validUrl || validUrl == '') {
            searchPeopleImgElement.setAttribute("src", './static/Img/User/user-40px@2x.png');
          }
          else {
            searchPeopleImgElement.setAttribute("src", validUrl);
          }
        }
      }
      */
      for(let i=0;i<this.searchChatItems.length;i++) {
        var curSearchChatItem = this.searchChatItems[i];
        var searchChatImgId = this.getSearchChatItemImgElementId(curSearchChatItem.roomId);
        var searchChatNameId = this.getSearchChatItemNameElementId(curSearchChatItem.roomId);
        var searchChatImgElement = document.getElementById(searchChatImgId);
        // console.log('*** showSearchResultIcon ', searchChatNameId);
        var searchChatNameElement = document.getElementById(searchChatNameId);
        
        var curRoom = global.mxMatrixClientPeg.matrixClient.getRoom(curSearchChatItem.roomId);
        if(global.mxMatrixClientPeg.DMCheck(curRoom)) {
          var distUserId = global.mxMatrixClientPeg.getDMMemberId(curRoom);
          if(!distUserId) {
            continue;
          }
          var displayName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
          searchChatNameElement.innerHTML = displayName;
        }
        else{
          searchChatNameElement.innerHTML = curRoom.name;
        }

        var distUrl = global.mxMatrixClientPeg.getRoomAvatar(curRoom);
        if(!distUrl || distUrl == '') {
            let defaultGroupIcon;
            if(global.mxMatrixClientPeg.DMCheck(curRoom))
                defaultGroupIcon = "./static/Img/User/user-40px@2x.png";
            else
                defaultGroupIcon = "./static/Img/User/group-40px@2x.png";
            searchChatImgElement.setAttribute("src", defaultGroupIcon); 
        }
        if(searchChatImgElement != undefined && distUrl) {
          searchChatImgElement.setAttribute("src", distUrl);
        }
      }
      for(let i=0;i<this.searchMessageItems.length;i++) {
        var curSearchChatItem = this.searchMessageItems[i];
        var searchChatMsgImgId = this.getSearchChatMsgItemImgElementId(curSearchChatItem.room_id);
        var searchChatMsgNameId = this.getSearchChatMsgItemNameElementId(curSearchChatItem.room_id);
        var searchChatMsgContentId = this.getSearchChatMsgItemContentElementId(curSearchChatItem.room_id);
        var searchChatImgMsgElement = document.getElementById(searchChatMsgImgId);
        var searchChatMsgNameElement = document.getElementById(searchChatMsgNameId);
        var searchChatMsgContentElement = document.getElementById(searchChatMsgContentId);
        
        var curRoom = global.mxMatrixClientPeg.matrixClient.getRoom(curSearchChatItem.room_id);
        if(global.mxMatrixClientPeg.DMCheck(curRoom)) {
          var distUserId = global.mxMatrixClientPeg.getDMMemberId(curRoom);
          if(!distUserId) {
            continue;
          }
          var displayName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
          searchChatMsgNameElement.innerHTML = displayName;
        }
        else{
          searchChatMsgNameElement.innerHTML = curRoom.name;
        }

        var distUrl = global.mxMatrixClientPeg.getRoomAvatar(curRoom);
        if(!distUrl || distUrl == '') {
            let defaultGroupIcon;
            if(global.mxMatrixClientPeg.DMCheck(curRoom))
                defaultGroupIcon = "./static/Img/User/user-40px@2x.png";
            else
                defaultGroupIcon = "./static/Img/User/group-40px@2x.png";
            searchChatImgMsgElement.setAttribute("src", defaultGroupIcon); 
        }
        if(searchChatImgMsgElement != undefined && distUrl) {
          searchChatImgMsgElement.setAttribute("src", distUrl);
        }

        if(curSearchChatItem.keywordCount > 1 || curSearchChatItem.firstChat.body == undefined) {
          searchChatMsgContentElement.innerHTML = "包含" + curSearchChatItem.keywordCount + "条相关聊天记录";
        }
      }
      /*
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
      */
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
    showAllSearchChats: async function() {
      this.showSearchAllChat = true;
      this.showSearchMessage = false;
      var showFavouriteRooms = await this.searchRoom(this.favouriteRooms, this.searchKey);
      var showDealGroupList = await this.searchRoom(this.dealShowGroupList, this.searchKey);
      var showLowPriorityGroupList = await this.searchRoom(this.lowPriorityGroupList, this.searchKey);
      var concatSearchChatItems = [].concat(showFavouriteRooms, showDealGroupList, showLowPriorityGroupList);
      this.searchChatItems = concatSearchChatItems;
      setTimeout(() => {
        this.$nextTick(() => {
            this.showSearchResultIcon();
        })
      }, 0)
    },
    showAllSearchMessages: async function() {
      this.showSearchAllChat = false;
      this.showSearchMessage = true;
      
      var searchChat = await global.services.common.searchAllChat(this.searchKey, 0);
      console.log("*** searchChat ", searchChat);
      if(searchChat.rooms.results.length != 0) {
        this.searchMessageItems = searchChat.rooms.results;
        this.showSearchAllChatMsg = false;
      }
      setTimeout(() => {
        this.$nextTick(() => {
            this.showSearchResultIcon();
        })
      }, 0)
      // ipcRenderer.send("showAnotherWindow", this.searchKey, "searchMessageList");
      // this.cleanSearchKey = !this.cleanSearchKey;
      // this.toSearch("");
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
            this.scrollToDistPosition(this.showGroupList[i]);
            break;
          }
        }
        
        setTimeout(() => {
          this.$nextTick(() => {
            this.scrollToDistPosition(this.showGroupList[groupIndex]);
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
    leaveGroup(roomId) {
      if(this.curChat && roomId == this.curChat.roomId)
      {
        this.isEmpty = true;
        this.curChat = undefined;
      }
      global.mxMatrixClientPeg.matrixClient.leave(roomId);
      this.DeleteGroup(roomId);
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
            this.showGroupIconName()
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
        if(this.showGroupList[i].roomId === groupId) {
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
    getUnreadClass(chatItem, selected) {
      var endPoint = "-unselected";
      if(selected) {
        endPoint = "-selected";
      }
      if(this.groupIsSlience(chatItem)) {
        return "group-unread-slience"
      }
      else {
        if(this.getUnReadCount(chatItem) === '') {
          return "group-readall" + endPoint;
        }
        else {
          return "group-unread";
        }
      }
    },
    getUnReadCount(chatItem) {
      const notificationCount = chatItem.getUnreadNotificationCount();

      return notificationCount == 0 ? '' : notificationCount;
    },
    getShowUnReadCount(roomItem) {
      var unreadCount = roomItem.getUnreadNotificationCount();

      // console.log(" *** unreadcount of " + roomItem.name + " unreadCount is " + unreadCount);
      
      if(unreadCount == undefined || (unreadCount != undefined && unreadCount == 0)) return '';
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
      return ComponentUtil.formatTimeFilter(secondsTime);
    },
    getMsgLastMsgTime(chatGroupItem) {
      var distTimeLine = this.GetLastShowMessage(chatGroupItem);
      if(distTimeLine == undefined) {
        return ;
      }
      
      let event = distTimeLine.event;

      var formatTime = ""
      var timesecond = Number(event ? event.origin_server_ts : '');

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
    getInviteChatContentElementId: function(roomId) {
      return "inviteList-" + roomId;
    },
    getChatContentElementId: function(roomId) {
      return "chatList-" + roomId;
    },
    getChatGroupTimeElementId: function(roomId) {
      return "chatList-Time-" + roomId;
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
      // if(!global.mxMatrixClientPeg.DMCheck(chatGroupItem)) {
        return chatGroupItem.name;
      // }
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
    GetLastShowMessage(chatGroupItem){
      if(chatGroupItem.timeline) {
        for(var i=chatGroupItem.timeline.length-1;i>=0;i--) {
          var timeLineTmp = chatGroupItem.timeline[i];
          if(['m.room.message', 'm.room.encrypted', 'm.room.create'].indexOf(timeLineTmp.getType()) >= 0) {
            return timeLineTmp;
          }
  /*
          else
          {
            console.log('----------')
            console.log(timeLineTmp.getType()) 
          }
  */
          if(chatGroupItem.distTimeLine) {
            return chatGroupItem.distTimeLine;
          }
          else {
            return undefined
          }
        }
      }
      else {
        if(chatGroupItem.distTimeLine) {
          return chatGroupItem.distTimeLine;
        }
        else {
          return undefined
        }
      }
    },
    getShowInviteMsgContent(chatGroupItem) {
      if(chatGroupItem.timeline && chatGroupItem.timeline.length == 0){
        if(chatGroupItem.getMyMembership() == "invite") {
          var inviteMemer = this._getInviteMember(chatGroupItem);
          if(global.mxMatrixClientPeg.DMCheck(chatGroupItem)) {
            return inviteMemer.userId;
          }
          else {
            return "由" + inviteMemer.userId + "邀请";
          }
        }
      };
    },
    async updateTimelineSet(room) {
        const client = global.mxMatrixClientPeg.matrixClient;
        
        if (room) {
            let timelineSet;

            try {
                timelineSet = await this.fetchFileEventsServer(room);
            } catch (error) {
                console.error("Failed to get or create file panel filter", error);
            }
            return timelineSet;
        } else {
            console.error("Failed to add filtered timelineSet for FilePanel as no room!");
        }
    },
    async fetchFileEventsServer(room) {
        const client = global.mxMatrixClientPeg.matrixClient;

        const filter = new Filter(client.credentials.userId);
        filter.setDefinition(
            {
                "room": {
                    "timeline": {
                        "types": [
                            "m.room.message",
                            "m.room.create"
                        ],
                    },
                },
            },
        );

        const filterId = await client.getOrCreateFilter("FILTER_LAST_MSG_" + client.credentials.userId, filter);
        filter.filterId = filterId;
        const timelineSet = room.getOrCreateFilteredTimelineSet(filter);

        return timelineSet;
    },
    async toUpdateTimeLine(chatGroupItem) {
      if(this.selfUserId == undefined && global.mxMatrixClientPeg.matrixClient) {
        this.selfUserId = global.mxMatrixClientPeg.matrixClient.getUserId();
      }
      var distElement = document.getElementById(this.getChatContentElementId(chatGroupItem.roomId));
      var distTimeElement = document.getElementById(this.getChatGroupTimeElementId(chatGroupItem.roomId));
      var timeLineSet = await this.updateTimelineSet(chatGroupItem);
      // var timeLineSet = await chatGroupItem.getUnfilteredTimelineSet();
      var _timelineWindow = new Matrix.TimelineWindow(
          global.mxMatrixClientPeg.matrixClient, 
          timeLineSet,
          {windowLimit:Number.MAX_VALUE},
      )
      await _timelineWindow.load(undefined, 20);
      var fileListInfo = _timelineWindow.getEvents();
      while(fileListInfo.length == 0 && _timelineWindow.canPaginate('b')) {
        await _timelineWindow.paginate("b", 20);
        fileListInfo = await _timelineWindow.getEvents();
      }
      if(fileListInfo.length == 0) {
        return;
      }
      var distTimeLine = undefined;
      for(var i=fileListInfo.length - 1;i>=0;i--) {
        if(!fileListInfo[i].isRedacted()) {
          distTimeLine = fileListInfo[i];
          break;
        }
      }
      if(distTimeLine == undefined) return;
      // distTimeLine = fileListInfo[fileListInfo.length - 1];
      chatGroupItem.distTimeLine = distTimeLine;
      let event = distTimeLine.event;
      let chatGroupMsgType = event.type;
      var chatGroupMsgContent = distTimeLine.getContent();

      if(chatGroupMsgType === "m.room.message")
      {
          var sender = distTimeLine.sender ? distTimeLine.sender : distTimeLine.event.sender;
          if(sender.userId) {
            sender = sender.userId;
          }
          if(sender != this.selfUserId && !global.mxMatrixClientPeg.DMCheck(chatGroupItem)) {
            var senderName = await ComponentUtil.GetDisplayNameByMatrixID(sender);
            // console.log("*** sender ", sender);
            if(chatGroupMsgContent.msgtype == 'm.file'){
              distElement.innerHTML =  senderName + "：" + "[文件]" + chatGroupMsgContent.body;
            }
            else if(chatGroupMsgContent.msgtype == 'm.text'){
              distElement.innerHTML = senderName + ":" + chatGroupMsgContent.body;
            }
            else if(chatGroupMsgContent.msgtype == 'm.image'){
              distElement.innerHTML = senderName + "：" + "[图片]";// + chatGroupMsgContent.body;
            } 
            else if(chatGroupMsgContent.msgtype == "m.audio") {
              distElement.innerHTML = senderName + ":" + "[语音]";
            }
          }
          else {
            if(chatGroupMsgContent.msgtype == 'm.file'){
              distElement.innerHTML =  "[文件]" + chatGroupMsgContent.body;
            }
            else if(chatGroupMsgContent.msgtype == 'm.text'){
              distElement.innerHTML = chatGroupMsgContent.body;
            }
            else if(chatGroupMsgContent.msgtype == 'm.image'){
              distElement.innerHTML = "[图片]";// + chatGroupMsgContent.body;
            } 
            else if(chatGroupMsgContent.msgtype == "m.audio") {
              distElement.innerHTML = "[语音]";
            }
          }
      }
      else if(chatGroupMsgType === "m.room.encrypted") {
          distElement.innerHTML = "收到一条加密消息";
      }
      if(distTimeElement) {
        var formatTime = ""
        var timesecond = Number(event ? event.origin_server_ts : "");

        if(timesecond.length == 0) {
          return;
        }

        formatTime = this.formatTimeFilter(timesecond);
        distTimeElement.innerHTML = formatTime;
      }
      this.sortGroup();
    },
    getShowMsgContent(chatGroupItem) {
      // console.log("cur chat group is ", chatGroupItem);
      var distTimeLine = this.GetLastShowMessage(chatGroupItem);
      console.log("*** getShowMsgContent ", distTimeLine);
      if(distTimeLine == undefined) {
        this.toUpdateTimeLine(chatGroupItem);
        return "";
      }
      var ret = this.NoticeContent(distTimeLine);
      // console.log("ret is ===== ", ret == '');
      if(ret != '') {
        return ret;
      }
      let event = distTimeLine.event;
      let chatGroupMsgType = event.type;
      var chatGroupMsgContent = distTimeLine.getContent();

      if(chatGroupMsgType === "m.room.message")
      {
          if(chatGroupMsgContent.msgtype == 'm.file'){
            return "[文件]" + chatGroupMsgContent.body;
          }
          else if(chatGroupMsgContent.msgtype == 'm.text'){
            var sender = distTimeLine.sender.name;
            var content = chatGroupMsgContent.body;
            return content;
          }
          else if(chatGroupMsgContent.msgtype == 'm.image'){
            return "[图片]";
          } 
      }
      else if(chatGroupMsgType === "m.room.encrypted") {
          return "收到一条加密消息";
          // chatGroupMsgContent = this.msg.getContent();
          if(chatGroupMsgContent.msgtype == 'm.file'){
            return "[文件]" + chatGroupMsgContent.body;
          }
          else if(chatGroupMsgContent.msgtype == 'm.text'){
            var sender = distTimeLine.sender.name;
            var content = chatGroupMsgContent.body;
            return content;
          } 
          else if(chatGroupMsgContent.msgtype == 'm.image'){
            return "[图片]";
          }
          else if(chatGroupMsgContent.msgtype == "m.bad.encrypted") {
              this.messageContent = chatGroupMsgContent.body;
          }
      }

      return "";
    },

    SetGroupItemGround(id){
      let tmpElement = document.getElementById(id)
      if(tmpElement){
        tmpElement.style.backgroundColor = "#dddddd";
        tmpElement.onmouseout = function () {
              this.style.backgroundColor = "#dddddd";
          };
        tmpElement.onmouseover = function () {
              this.style.backgroundColor = "#dddddd";
          };
      }
      return function(oldElement){
        if(oldElement == tmpElement)
          return oldElement;
        if(oldElement){
          oldElement.onmouseover =  function () {
            this.style.backgroundColor = "#f7f8fa";
          }
          oldElement.onmouseout = function () {
              this.style.backgroundColor = "#ffffff";
          };
          oldElement.style.backgroundColor = "#ffffff";
        }
        return tmpElement;
      }
    },

    SetRoomReader(room){
      if(!room.timeline)
        return;
      let lasttimeLine = room.timeline[room.timeline.length - 1];
      if(!lasttimeLine && !lasttimeLine.event)
        return;
      let eventId = lasttimeLine.event.event_id;
      //return lasttimeLine;
      var oriRoomUnreadCount = room.getUnreadNotificationCount();
      global.mxMatrixClientPeg.matrixClient.setRoomReadMarkers(room.roomId, eventId, lasttimeLine, {hidden: false}).catch((e) => {
        console.log(e)
      });
      room.setUnreadNotificationCount('total', 0);
      room.setUnreadNotificationCount('highlight', 0);
      this.checkUnreadCount();
    },

    showChat: function(chatGroup, index, searchKey="") {
      this.isFirstLogin = false;
      this.isMsgSearch = searchKey.length == 0 ? false : true;
      if(this.isMsgSearch) {
        this.isEmpty = false;
        var isSecret = false;
        this.searchKeyFromList = searchKey;
        this.searchChat = chatGroup;
        // this.curindex = index;
        this.showGroupIconName();
      }
      else {
        this.searchKeyFromList = "";
        let groupItemElementID = this.ChatGroupId(chatGroup);
        let SaveChatGroupElement = this.SetGroupItemGround(groupItemElementID);
        this.oldElementGroupItem = SaveChatGroupElement(this.oldElementGroupItem);

        let groupDivElementID = this.ChatGroupDivId(chatGroup);
        let SaveCharGroupDivElement = this.SetGroupItemGround(groupDivElementID);
        this.oldElementGroupDiv = SaveCharGroupDivElement(this.oldElementGroupDiv);

        this.isEmpty = false;
        var isSecret = false;

        if(this.curChat != undefined && this.curChat.roomId != undefined) {
          var charRef = this.$refs.chatPageRef;
          var editor = charRef.editor;
          var content = editor.getContents();
          this.$store.commit("setDraft", [this.curChat.roomId, content]);
        }
        var unreadInfo = [];
        if(this.curChat != undefined && this.curChat.timeline.length != 0) {
          console.log("*** showChat SetRoomReader");
          unreadInfo = [this.curChat.roomId, false];
          global.mxMatrixClientPeg.updageChatUnreadState(unreadInfo);
          this.SetRoomReader(this.curChat);
          this.showGroupIconName(this.curChat);
        }

        console.log("*** showChat SetRoomReader");
        unreadInfo = [chatGroup.roomId, false];
        global.mxMatrixClientPeg.updageChatUnreadState(unreadInfo);
        this.SetRoomReader(chatGroup);
        
        console.log("*** ", searchKey, " *** ", index);
        this.curChat = chatGroup;
        this.searchChat = chatGroup;

        ipcRenderer.send("stopFlash");

        this.curindex = index;
        isSecret = false;
        if(this.curChat.key_id != undefined && this.curChat.key_id.length != 0 && this.curChat.group_type == 102) {
          isSecret = true;
        }
        this.showGroupIconName(this.curChat);
      }
    },
    ToJoinRoom: function(roomId) {
      try{
          global.mxMatrixClientPeg.matrixClient.joinRoom(roomId, {inviteSignUrl: undefined, viaServers: undefined})
          .then(() => {
              // this.isRefreshing = true;
              setTimeout(() => {
                this.JoinRoom(roomId);
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
      setTimeout(() => {
          this.DeleteGroup(roomId);
          this.checkUnreadCount();
      }, 0)
    },
    reCountUnreadCount: function() {
      this.checkUnreadCount();
    },
    UpdateRoomListPassive: function(member) {
      //join leave invite
      this.unreadCount = 0;
      this.hasUnreadItems = [];
      this.showGroupList.forEach((item)=>{
        if(item.getMyMembership() == "invite") {
          if(this.inviteGroupsList.indexOf(item) < 0) {
            // this.unreadCount += 1;
            this.inviteGroupsList.push(item);
          }
        }
        else{
          if(this.inviteGroupsList.indexOf(item) >= 0) {
            this.inviteGroupsList.splice(this.inviteGroupsList.indexOf(item), 1);
          }
          const notificationCount = item.getUnreadNotificationCount();
          console.log("notification is ", notificationCount);
          if(notificationCount) {
            this.hasUnreadItems.unshift(item);
            this.unreadCount += notificationCount;
          }
          let tags = item.tags;
          if(tags && tags['m.favourite']){
            if(this.favouriteRooms.indexOf(item) < 0) {
              this.favouriteRooms.push(item)
            }
          }
          else{
            if(this.dealShowGroupList.indexOf(item) < 0) {
              this.dealShowGroupList.push(item);
            }
          }
        }
      })
      if(this.favouriteRooms.length !=0){
        this.favouriteRooms.sort(this.SortGroupByTimeLine);
      }
      if(this.dealShowGroupList.length != 0)
        this.dealShowGroupList.sort(this.SortGroupByTimeLine);
      
      // console.log("this.unreadCount is ", this.unreadCount);
      if(isNaN(this.unreadCount)) {
        this.$nextTick(() => {
          this.checkUnreadCount();
        })
      }
      else {
        ipcRenderer.send("updateUnreadCount", this.unreadCount);
      }
    },
    JoinRoom: function(roomID){
      let newRoom = global.mxMatrixClientPeg.matrixClient.getRoom(roomID);
      for(let i in this.inviteGroupsList){
        if(this.inviteGroupsList[i].roomId == roomID) {
          this.inviteGroupsList.splice(i, 1);
          break;
        } 
      }
      for(let i in this.dealShowGroupList){
        if(this.dealShowGroupList[i].roomId == roomID) {
          this.showChat(newRoom, i);
          if(this.checkNeedScroll(newRoom)) {
            this.scrollToDistPosition(newRoom);
          }
          return;
        } 
      }

      this.dealShowGroupList.unshift(newRoom);
      this.$nextTick(async () => {
        await newRoom.loadMembersIfNeeded();
        this.showChat(newRoom, 0);
        setTimeout(() => {
          if(this.checkNeedScroll(newRoom)) {
            this.showGroupIconName(newRoom);
            this.scrollToDistPosition(newRoom);
          }
        }, 1000)
      })
    },
  
    DeleteFromGroups(groups, groupID){
      if(groups.some(item=>{
        return item.roomId == groupID
      })){
            for(var i = 0; i < groups.length; i++) {
              if(groups[i].roomId == groupID) {
                groups.splice(i, 1);
              } 
            }
          }
    },

    DeleteGroup: function(distGroupId) {
      this.DeleteFromGroups(this.inviteGroupsList, distGroupId);
      this.DeleteFromGroups(this.dealShowGroupList, distGroupId);
      this.DeleteFromGroups(this.favouriteRooms, distGroupId);
      this.DeleteFromGroups(this.lowPriorityGroupList, distGroupId);
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
      
    },
    delayCallback: function(msg) {
      setTimeout(() => {
        this.callback(msg);
      }, 100)
    }
  },

  mounted: async function() {
    console.log("chat content mounted");
    if(this.unreadCount < 0) {
      this.unreadCount = 0;
    }
    
    ipcRenderer.on('SearchAddGroup', this.SearchAddGroup)
    ipcRenderer.on('SearchAddSenders', this.searchAddSenders)
    ipcRenderer.on('transmitFromFavDlg', this.eventUpdateChatList)
  },
  created: async function() {
    //global.services.common.handlemessage(this.callback);
    // if(this.amr == null){
    //     this.amr = new BenzAMRRecorder();
    //     // console.log("=========================")
    //     // console.log(path.join(__dirname, "../../../static/sound.wav"))
    //     this.amr.initWithUrl(path.join(__dirname, "/static/sound.wav"))
    // }
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
    background-color:  rgba(255, 255, 255, 1);
    display: flex;
    justify-content: center;
    align-items: center;  
    position: relative;
  }

  .chat-empty-bg {
    width: 228px;
    height: 150px;
    background-color: rgba(255, 255, 255, 1);
  }

  .chat {
    width:calc(100% - 281px);
    background-color: rgba(255, 255, 255, 1);
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

  .search-all-chat {
    width:100%;
    background-color: rgba(241, 241, 241, 1);
    display: flex;
    flex-direction: column;
    position: relative;
    padding-top: 20px;
    -webkit-app-region: drag;
    z-index: 1;
  }

  .chat-list {
    height: 100%;
    width: 280px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgb(238, 238, 238);
    -webkit-app-region: drag;
    -webkit-user-select:none;
    background-color: rgba(255, 255, 255, 1);
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
    letter-spacing: 0px;
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

  .search-list-chat {
    height: 100%;
    overflow-y: scroll;
    scroll-behavior:smooth;
    
    ::-webkit-scrollbar-track {
      border-radius: 10px;
    }
  }

  .search-list-chat-label {
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
    letter-spacing: 0px;
  }

  .search-list-chat-content {
    width: 100%;
    height: calc(100% - 64px);
    padding: 0;
    margin: 0;
    display: block;
    overflow: hidden;
  }

  .search-list-chat-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  .search-item {
    height: 60px;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }
  
  .search-item:hover {
    height: 60px;
    background-color: #f7f8fa;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .search-more-item {
    height: 32px;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }
  
  .search-more-item:hover {
    height: 32px;
    background-color: #f7f8fa;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .search-item-img-div {
    position:relative;
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
    vertical-align: top;
  }

  .search-item-img-ico {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 40px;
    height: 40px;
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    border-radius: 50px;
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
    width: calc(100% - 16px);
    margin-left: 16px;
    cursor: pointer;
  }

  .search-item-info-more:hover {
    display: inline-block;
    background-color:  #f7f8fa;
    height: 100%;
    width: calc(100% - 16px);
    margin-left: 16px;
    cursor: pointer;
  }

  .search-item-name {
    display: inline-block;
    max-width: 96%;
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
    letter-spacing: 0px;
  }

  .search-more-item-name {
    width: calc(100% - 42px);
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    font-weight: 400;
    font-family:PingFangSC-Regular;
    letter-spacing: 0px;
    color: rgba(91, 106, 145, 1);
    overflow: hidden;
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: inline-block;
  }

  .search-item-name-more-ico {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    margin-top: 6px;
    margin-right: 12px;
    margin-bottom: 6px;
    display: inline-block;
    cursor: pointer;
  }

  .search-item-position {
    width: 119%;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    //height: 100%;
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
    background-color: rgba(255, 255, 255, 1);
  }

  .search-list-chat-list-div {
    height: 60px;
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .search-list-chat-list-div:hover {
    height: 60px;
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
    background-color: #f7f8fa;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .search-list-content-list-div {
    height: 60px;
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .search-list-content-list-div:hover {
    height: 60px;
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
    background-color: #f7f8fa;
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
  }

  .grid-content {
    font-size: 12px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: #999999;
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
    background-color: #f7f8fa;
    border-bottom:1px solid rgba(238,238,238,1);
    margin-left: 16px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    font-size: 0px;
    box-sizing: border-box;
  }

  .group-div:active {
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
    background-color: #f7f8fa;
  }

  .group-top.active {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
  }

  .group:hover {
    height: 60px;
    background-color: rgba(247, 248, 250, 1);
  }

  .group:active {
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
    border-radius:50px;
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
    vertical-align: top;
  }
  
  .group-info {
    display: inline-block;
    height: 100%;
    width: calc(100% - 135px);
    margin-left: 12px;
  }

  .secret-flag {
    display:inline-block;
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 2px;
    margin-bottom: 0px;
    height: 20px;
    width: 20px;
    vertical-align: top;
  }

  .group-name {
    display: inline-block;
    max-width: 96%;
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
    letter-spacing: 0px;
  }

  .group-name-secret {
    display: inline-block;
    max-width: 82%;
    height: 20px;
    font-size: 14px;
    font-weight: 500;
    font-family:PingFangSC-Medium;
    color: rgba(36, 179, 107, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
    letter-spacing: 0px;
  }

  .group-content {
    width: 119%;
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
    letter-spacing: 0px;
  }

  .group-notice {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 68px;
    margin-right: 5px;
  }

  .group-time {
    color: rgba(187, 187, 187, 1);
    margin-left: 0px;
    margin-top: 11px;
    font-family:PingFangSC-Regular;
    font-size: 12px;
    margin-right: 0px;
    margin-bottom: 2px;
    font-weight:400;
    height: 17px;
    line-height:17px;
    text-align: right;
  }

  .group-unread-slience {
    position: absolute;
    top: -0px;
    right: -0px;
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

  .group-unread {
    position: absolute;
    top: -3px;
    right: -3px;
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
    height: 16px;
    width: 16px;
    margin-left: 0px;
    margin-top: 3px;
    margin-right: 0px;
    margin-bottom: 10px;
    background-color: rgba(228, 49, 43, 0);
    background-image: url("../../../static/Img/Chat/slience@2x.png");
    background-size: contain;
  }

  .TheBorder {
      position: absolute;
      left: 0px;
      top: 0px;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index:3;
  }

  .accept-invite{
      display: inline-block;
      width: 20px;
      height: 20px;
      border: solid 0px #009933;
      margin-top: 19px;
      margin-left: 15px;
      vertical-align: top;
  }

  .reject-invite {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: solid 0px rgba(221, 221, 221, 1);
      margin-right: 18px;
      margin-top: 19px;
      vertical-align: top;
      float: right;
  }
</style>
