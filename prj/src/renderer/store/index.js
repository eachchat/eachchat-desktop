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
      state.chatGroup = chatGroupList.slice()
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
