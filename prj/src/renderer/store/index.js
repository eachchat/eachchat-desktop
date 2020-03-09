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
  },
  mutations: {
    setChatGroup(state, chatGroupList) {
      state.chatGroup = []
      function compare(){
        return function(a, b)
        {
          var value1 = a.message.timestamp
          var value2 = b.message.timestamp
          return value2 - value1
        }
      }
      state.chatGroup = chatGroupList.sort(compare()).slice()
    },
    setRefreshToken(state, refreshtoken) {
      state.refreshtoken = refreshtoken
    },
    setAccessToken(state, accesstoken) {
      state.accesstoken = accesstoken
    },
    setUserAccount(state, account) {
      state.userAccount = account
    }
  },
  getters: {
    getChatGroup: state => state.chatGroup
  },
  modules,
  plugins: [
    createPersistedState(),
    //createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
