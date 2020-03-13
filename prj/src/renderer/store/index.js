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
  },
  mutations: {
    setChatGroup(state, chatGroupList) {
      function compare(){
        return function(a, b)
        {
          var value1 = a.message.timestamp;
          var value2 = b.message.timestamp;
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
    }
  },
  getters: {
    getChatGroup: state => state.chatGroup,
  },
  modules,
  plugins: [
    createPersistedState(),
    //createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
