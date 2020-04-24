import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

import modules from './modules'
import { ChatGroupItemMessageContent, ChatGroupItemMessageId, ChatGroupItem, InvitationUserInfo } from './module'

import {APITransaction} from '../../packages/data/transaction.js'
const serverapi = new APITransaction('139.198.15.253', 8888)

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    chatGroup: [],
    refreshtoken: "",
    accesstoken: "",
    userAccount: "",
    userPwd:"",
    userId: "",
    userInfo:{},
    usersInfo:[],
    messageLists:{},
    uploadingList:[],
    latestSequenceId: "",
    earliestSequenceId: "",
    Services: null,
  },
  mutations: {
    setLatestSequenceId(state, sequenceId) {
      state.latestSequenceId = sequenceId;
    },
    setUserId(state, uid) {
      state.userId = uid;
    },
    setServices(state, services) {
      state.Services = services;
    },
    setUploadFile(state, filePaths) {
      for(var i=0;i<filePaths.length;i++) {
        if(state.uploadingList.indexOf(filePaths[i]) != -1) {
          state.uploadingList.push(filePaths[i]);
        }
      }
    },
    removeUploadFile(state, filePaths) {
      for(var i=0;i<filePaths.length;i++) {
        var distIndex = state.uploadingList.indexOf(filePaths[i]);
        if(distIndex != -1) {
          state.uploadingList.splice(distIndex, 1);
        }
      }
    },
    setChatGroup(state, chatGroupList) {
      if(chatGroupList.length == 0) {
        return;
      }
      function compare(){
        return function(a, b)
        {
          var value1 = a.last_message_time;
          var value2 = b.last_message_time;
          return value2 - value1;
        }
      }
      var chatGroupVar = [];
      chatGroupVar = chatGroupList.sort(compare());
      if(chatGroupVar[0].sequence_id > state.latestSequenceId) {
        state.latestSequenceId = chatGroupVar[0].sequence_id;
      }
      state.chatGroup = [];
      state.chatGroup = chatGroupVar;
    },
    setLatestSequenceId(state, sequenceId) {
      if(sequenceId > state.latestSequenceId) {
        state.latestSequenceId = sequenceId;
      }
    },
    addNewChatGroup(state, newChatGroupItem) {
      state.chatGroup.unshift(newChatGroupItem);
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
          var value1 = a.last_message_time;
          var value2 = b.last_message_time;
          return value2 - value1;
        }
      }
      state.chatGroup = state.chatGroup.sort(compare());
      //console.log(state.chatGroup);
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
    setUserPwd(state, pwd) {
      state.userPwd = pwd;
    },
    setUsersInfo(state, UsersInfo) {
      state.usersInfo = UsersInfo;
    },
    setMessageLists(state, MessageList) {
      if(MessageList.length != 0) {
        var curGroupId = MessageList[0].groupId;
        state.messageLists[curGroupId] = MessageList;
      }
    },
    addMessageLists(state, MessageList) {
      if(MessageList.length != 0) {
        var curGroupId = MessageList[0].groupId;
        for(var i=0;i<MessageList.length;i++) {
          if(state.messageLists[curGroupId] == undefined) {
            console.log("undefinde ")
            state.messageLists[curGroupId] = MessageList;
          }
          else {
            console.log("unshifted ")
            state.messageLists[curGroupId].unshift(MessageList[i]);
          }
        }
      }
    },
    updateFileMessageLocalPath(state, distMsg, local_path) {
      var curGroupId = distMsg.groupId;
      var curSequenceId = distMsg.sequenceId;
      var belongMsgList = [];
      belongMsgList = state.messageLists[curGroupId];
      for(var i=0;i<belongMsgList.length;i++){
        if(belongMsgList[i].sequenceId == curSequenceId){
          belongMsgList[i]["file_local_path"] = local_path;
        }
      }
    },
    updateImgMessageThumbLocalPath(state, distMsg) {
      var curGroupId = distMsg.groupId;
      var curSequenceId = distMsg.sequenceId;
      var belongMsgList = [];
      belongMsgList = state.messageLists[curGroupId];
      for(var i=0;i<belongMsgList.length;i++){
        if(belongMsgList[i].sequenceId == curSequenceId){
          belongMsgList[i] = distMsg;
        }
      }
    },
    updateImgMessageMLocalPath(state, distMsg, local_path) {
      var curGroupId = distMsg.groupId;
      var curSequenceId = distMsg.sequenceId;
      var belongMsgList = [];
      belongMsgList = state.messageLists[curGroupId];
      for(var i=0;i<belongMsgList.length;i++){
        if(belongMsgList[i].sequenceId == curSequenceId){
          belongMsgList[i]["M_file_local_path"] = local_path;
        }
      }
    },
    updateImgMessageLocalPath(state, distMsg, local_path) {
      var curGroupId = distMsg.groupId;
      var curSequenceId = distMsg.sequenceId;
      var belongMsgList = [];
      belongMsgList = state.messageLists[curGroupId];
      for(var i=0;i<belongMsgList.length;i++){
        if(belongMsgList[i].sequenceId == curSequenceId){
          belongMsgList[i]["file_local_path"] = local_path;
        }
      }
    }
  },
  getters: {
    getServices: state => () => {
      return state.Services;
    },
    getLatestSequenceId: state => () => {
      return state.latestSequenceId;
    },
    getChatGroup: state => state.chatGroup,
    getChatGroupThroughId: state => (groupId) => {
      var distChatGroup = null;
      for(var i=0;i<state.chatGroup.length;i++) {
        if(state.chatGroup[i].group.groupId == groupId) {
          distChatGroup = state.chatGroup[i];
        }
      }
      return distChatGroup;
    },
    getUserIcon: state => (is_original=false) => {
      if(state.userInfo === null) {
        return '/static/Img/User/user.jpeg';
      }
      if(is_original) {
        return state.userInfo.avatar_minimal;
      }
      else {
        return state.userInfo.avatar;
      }
    },
    getLoginUserName: state => () => {
      return state.userAccount;
    },
    getLoginUserPwd: state => () => {
      return state.userPwd;
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
    getChatMsgHistory: state => async (groupId, sequenceId=0, needNum=20) => {
      // state.messageLists[0] is latest, as same as historyMessage response.
      if(groupId.length === 0 || groupId === null) {
        return [];
      }
      
      var distMsgList = state.messageLists[groupId];

      if(typeof(distMsgList) === "undefined") {
        return [];
      }

      console.log("state.messageLists[groupId] return ", distMsgList)
      var neededMsgList = [];
      var isStartIndex = false;
      // No msg stored.
      if(distMsgList.length == 0){
        let ret = await serverapi.historyMessage(state.accesstoken, groupId, sequenceId);
        let msgListTmp = ret.data.results;
        console.log("distMsgList.length == 0 await serverapi.historyMessage(state.accesstoken, groupId, sequenceId) return ", msgListTmp)
        state.messageLists[groupId] = msgListTmp;
        neededMsgList = msgListTmp.slice(0, (needNum-1 < msgListTmp.length) ? needNum - 1 : msgListTmp.length);
        console.log("distMsgList.length == 0 return neededMsgList ", neededMsgList)
      }
      // No dist msg sequenceid in list.
      else if(sequenceId < distMsgList[distMsgList.length-1].sequenceId){
        let ret = await serverapi.historyMessage(state.accesstoken, groupId, sequenceId);
        console.log("sequenceId < distMsgList[distMsgList.length-1].sequenceId await serverapi.historyMessage(state.accesstoken, groupId, sequenceId) ret ", ret)
        let msgListTmp = ret.data.results;
        console.log("sequenceId < distMsgList[distMsgList.length-1].sequenceId await serverapi.historyMessage(state.accesstoken, groupId, sequenceId) return ", msgListTmp)
        state.messageLists[groupId].concat(msgListTmp);
        neededMsgList = msgListTmp.slice(0, (needNum-1 < msgListTmp.length) ? needNum - 1 : msgListTmp.length);
        console.log("sequenceId < distMsgList[distMsgList.length-1].sequenceId return neededMsgList ", neededMsgList)
      }
      else{
        // Try to get needed msg list
        for(var i=0;i<distMsgList.length;i++){
          if(distMsgList[i].sequenceId == sequenceId){
            isStartIndex = true;
          }
          if(isStartIndex){
            neededMsgList.push(distMsgList[i]);
          }
          if(neededMsgList.length == needNum){
            break;
          }
        }
  
        if(neededMsgList.length == 0){
          let ret = await serverapi.historyMessage(state.accesstoken, groupId, sequenceId);
          let msgListTmp = ret.data.results;
          console.log("else neededMsgList.length == 0 await serverapi.historyMessage(state.accesstoken, groupId, sequenceId) return ", msgListTmp)
          state.messageLists[groupId].concat(msgListTmp);
          neededMsgList = msgListTmp.slice(0, (needNum-1 < msgListTmp.length) ? needNum - 1 : msgListTmp.length);
          console.log("else neededMsgList.length == 0 return neededMsgList ", neededMsgList)
        }
        else if(neededMsgList.length < needNum){
          let ret = await serverapi.historyMessage(state.accesstoken, groupId, neededMsgList[neededMsgList.length - 1].sequenceId);
          let msgListTmp = ret.data.results;
          console.log("else neededMsgList.length < needNum await serverapi.historyMessage(state.accesstoken, groupId, sequenceId) return ", msgListTmp)
          state.messageLists[groupId].concat(msgListTmp);
          neededMsgList = msgListTmp.slice(0, (needNum - 1 - neededMsgList.length < msgListTmp.length) ? needNum - 1 - neededMsgList.length : msgListTmp.length);
          console.log("else neededMsgList.length < needNum return neededMsgList ", neededMsgList)
        }
      }
      console.log("final return need msg list is ", neededMsgList);
      return neededMsgList;
    },
    getImgMessageThumbLocalPath: state => (checkMsg) => {
      var curGroupId = checkMsg.groupId;
      var curSequenceId = checkMsg.sequenceId;
      var belongMsgList = [];
      var distMsg = null;
      belongMsgList = state.messageLists[curGroupId];
      for(var i=0;i<belongMsgList.length;i++){
        if(belongMsgList[i].sequenceId == curSequenceId){
          distMsg = belongMsgList[i];
          console.log("in get dist msg is ", distMsg)
        }
      }
      if(distMsg == null){
        return "";
      }
      else{
        var distPath = distMsg.thumb_local_path;
        console.log("in get dist path is ", distPath)
        if(distPath == undefined){
          return "";
        }
        else{
          return distPath;
        }
      }
    }

  },
  modules,
  plugins: [
    createPersistedState(),
    //createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
