import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

import modules from './modules'
import { ChatGroupItemMessageContent, ChatGroupItemMessageId, ChatGroupItem, InvitationUserInfo } from './module'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    chatGroup: [],
    refreshtoken: "",
    accesstoken: "",
    userAccount: "",
    userInfo:{},
    usersInfo:[],
    messageLists:{},
  },
  mutations: {
    setChatGroup(state, chatGroupList) {
      function compare(){
        return function(a, b)
        {
          var value1 = a.message === null ? a.group.updateTime : a.message.timestamp;
          var value2 = b.message === null ? b.group.updateTime : b.message.timestamp;
          return value2 - value1;
        }
      }
      var chatGroupVar = [];
      chatGroupVar = chatGroupList.sort(compare());
      state.chatGroup = [];
      state.chatGroup = chatGroupVar;
    },
    updateChatGroup(state, distMsg) {
      for(var i=0;i<state.chatGroup.length;i++) {
        if(state.chatGroup[i].group.groupId === distMsg.groupId) {
          state.chatGroup[i].message = distMsg;
          break;
        }
      }
      function compare(){
        return function(a, b)
        {
          var value1 = a.message.timestamp;
          var value2 = b.message.timestamp;
          return value2 - value1;
        }
      }
      state.chatGroup = state.chatGroup.sort(compare());
      console.log(state.chatGroup);
    },
    setRefreshToken(state, refreshtoken) {
      state.refreshtoken = refreshtoken;
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
    setAccessToken(state, accesstoken) {
      state.accesstoken = accesstoken;
    },
    setUserAccount(state, account) {
      state.userAccount = account;
    },
    setUsersInfo(state, UsersInfo) {
      state.usersInfo = UsersInfo;
    },
    setMessageLists(state, MessageList, is_add=false) {
      if(MessageList.length != 0) {
        var curGroupId = MessageList[0].groupId;
        if(is_add) {
          state.messageLists[curGroupId] = state.messageLists[curGroupId].concat(MessageList);
        }
        else {
          state.messageLists[curGroupId] = MessageList;
        }
      }
    }
  },
  getters: {
    getChatGroup: state => state.chatGroup,
    getUserIcon: state => (is_original=false) => {
      if(state.userInfo === null) {
        return '/static/Img/User/user.jpeg';
      }
      if(is_original) {
        return state.userInfo.avatarTUrl;
      }
      else {
        return state.userInfo.avatarOUrl;
      }
    },
    getChatUserIcon: state => (distId, is_original=false) => {
        if(state.usersInfo === null) {
          return '/static/Img/User/user.jpeg';
        }

        var distUser = state.usersInfo.filter(function(item) {
          return item.id === distId;
        })

        if(distUser.length === 0) {
          return '/static/Img/User/user.jpeg';
        }
        else {
          if(is_original) {
            return distUser[0].avaterOUrl;
          } 
          else {
            return distUser[0].avatarTUrl;
          }
        }
    },
    getChatUserName: state => (distId) => {
      if(state.usersInfo === null) {
        return '';
      }

      var distUser = state.usersInfo.filter(function(item) {
        return item.id === distId;
      })

      if(distUser.length === 0) {
        return '';
      }
      else {
        return distUser[0].displayName;
      }
    },
    getChatMsgHistory: state => (groupId) => {
      if(groupId.length === 0 || groupId === null) {
        return[];
      }

      var distMsgList = [].concat(state.messageLists[groupId]);
      if(typeof(distMsgList) === "undefined") {
        return [];
      }
      
      return distMsgList;
    }
  },
  modules,
  plugins: [
    createPersistedState(),
    //createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
