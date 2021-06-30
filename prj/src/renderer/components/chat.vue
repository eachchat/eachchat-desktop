<template>
    <div class="chat-page">
        <mxHistoryPage class="mxHistoryPage" v-show="isSerach" :distRoomId="HistorySearchRoomId" :initSearchKey="initSearchKey" @searchClose="CloseSearchPage" @jumpToEvent="jumpToEvent"/>
        <mxFilePage class="mxFilePage" v-show="isFileList" :distRoom="curChat" :distRoomId="FilelistSearchRoomId" @fileListClose="CloseFileListPage" @showImageOfMessage="showImageOfMessage"/>
        <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="clearCache"/>
        <div class="toBottom" v-show="haveNewMsg">
            <img class="toBottomImg" src="../../../static/Img/Chat/toBottomIco@2x.png" @click="goToBottom">
            <div class="toBottomText" @click="goToBottom">{{newMsgNum}}条新消息</div>
            <img class="toBottomClose" src="../../../static/Img/Chat/toBottomClose@2x.png" @click="closeToBottom">
        </div>
        <div class="chat-title">
            <div class="chatInfo">
                <img class="chat-img" id="chat-group-img" src="../../../static/Img/User/group-40px@2x.png" onerror = "this.src = './static/Img/User/user-40px@2x.png'"/>
                <img class="encrypt-chat-img" src="../../../static/Img/Chat/encrypt-chat-title@2x.png" v-show="isSecret"/>
                <p class="chat-name">{{getShowGroupName()}}</p>
                <p class="chat-group-content-num" id="chat-group-content-num"></p>
                <img class="chat-state-img" src="../../../static/Img/Chat/slience@2x.png" v-show="isMute"/>
            </div>
            <div class="chat-tools">
                <div class="chat-tool-more-div" @click.stop="More()">
                </div>
                <div class="chat-tool-call" @click="voiceCall()" v-show=false>
                    <i class="el-icon-phone"></i>
                </div>
            </div>
        </div>
        <div class="chat-main" id="chat-main" v-show="!isSerach && !isFileList">
            <Invite class="chat-invite" :inviter="inviterInfo" @joinRoom="joinRoom" @rejectRoom="rejectRoom" v-show="isInvite"></Invite>
            <div class="chat-main-message" id="message-show" v-show="!isInvite">
                <!-- <ul class="msg-list" id="message-show-list"> -->
                <transition-group name="msg-list" class="msg-list" id="message-show-list" tag="ul">
                    <li class="msg-loading" v-bind:key="123">
                        <i class="el-icon-loading" v-show="isRefreshing"></i>
                    </li>
                    <li v-for="(item, index) in messageListShow"
                        :class="ChatLeftOrRightClassName(item)"
                        @contextmenu="rightClick($event, item)"
                        v-bind:key="ChatMessageId(item)"
                        v-show="!isDeleted(item)"
                        :id="chatMsgDivId(item._txnId ? item._txnId : item.event.event_id)">
                        <div class="msg-info-time" v-show="showTimeOrNot(item, messageListShow[index-1])">{{MsgTime(item)}}</div>
                        <div class="chat-notice" v-show="showNoticeOrNot(item)">{{NoticeContent(item)}}</div>
                        <div class="msgContent">
                            <input class="multiSelectCheckbox" :id="msgCheckBoxId(item)" type="checkbox" v-show="showCheckboxOrNot(item)" @change="selectChanged(item)">
                            <imessage :ref = "item.event.event_id"  :msg="item" :playingMsgId="playingMsgId" :updateMsg="updateMsg" :updateUser="updateUser" :updateMsgStatus="updatemsgStatus" :updateMsgContent="updateMsgContent" :isGroup="!isDm" v-show="showMessageOrNot(item)" @showImageOfMessage="showImageOfMessage" @openUserInfoTip="openUserInfoTip" @playAudioOfMessage="playAudioOfMessage" @sendAgain="sendAgain" @showImportE2EKey="showImportE2EKey"></imessage>
                        </div>
                    </li>
                <!-- </ul> -->
                </transition-group>
            </div>
            <div class="chat-input" id="chat-input-id" v-show="!multiSelect && !isInvite">
                <div class="chat-input-operate">
                    <div class="chat-input-tool">
                        <Faces v-show="showFace" id="face-box-id" @click="showFace = true" class="faces-box" @insertFace="insertFace"></Faces>
                        <div class="chat-input-expression" @click="showExpression()">
                        </div>
                        <div class="chat-input-file" @click="insertFiles()">
                        </div>
                        <div class="chat-input-history" id="chat-input-history-id" @click="showMsgHistoryOperate()" v-show="!isSecret">
                        </div>
                        <div class="chat-input-more" @click="ShowMore()" style="display:none">
                            <img class="el-icon-more" src="../../../static/Img/Chat/chat_more@3x.png">
                        </div>
                    </div>
                    <div class="chat-send" v-show="false" @click="sendMsg()">
                        <i class="el-icon-s-promotion"></i>
                    </div>
                    <div class="video-chat" @click="creatVideoChat()" v-show="!isSecret && isDm">
                    </div>
                    <div class="voice-chat" @click="creatVoiceChat()" v-show="!isSecret && isDm">
                    </div>
                </div>
                <div class="text-input" @keydown="keyHandle($event)" @keyup="keyUpHandle($event)">
                    <quillEditor
                        id="chatQuillEditorId"
                        ref="chatQuillEditor"
                        v-model="content"
                        :options="editorOption"
                        @change="inputChanged"
                        v-show="!isInvite">
                    </quillEditor>
                </div>
            </div>
            <div class="multiSelectTools" v-show="multiSelect">
                <div class="multiSelectToolsDiv">
                    <div class="multiSelectTransmitDiv">
                        <div class="multiSelectTransmit" @click="multiTransMit"></div>
                        <div class="multiSelectTransmitText">逐条转发</div>
                    </div>
                    <div class="multiSelectTransmitTogetherDiv">
                        <div class="multiSelectTransmitTogether" @click="multTtransMitTogether"></div>
                        <div class="multiSelectTransmitTogetherText">合并转发</div>
                    </div>
                    <div class="multiSelectFavDiv" id="multiSelectFavDivId">
                        <div class="multiSelectFav" @click="multiFav"></div>
                        <div class="multiSelectFavText">收藏</div>
                    </div>
                    <div class="multiSelectDelDiv" id="multiSelectDelDivId">
                        <div class="multiSelectDel" @click="toMultiDel"></div>
                        <div class="multiSelectDelText">删除</div>
                    </div>
                </div>
                <div class="multiSelectToolCloseDiv">
                    <img class="multiSelectToolClose" src="../../../static/Img/Chat/toolCancel-24px@2x.png" @click="multiToolsClose">
                </div>
            </div>
        </div>
        <transmitDlg  v-show="showTransmitDlg" @closeTransmitDlg="closeTransmitDlg" :curChat="curChat" :transmitTogether="transmitTogether" :transmitMessages="selectedMsgs" :imageViewerImageInfo="imageViewerImageInfo" :transmitImageViewer="transmitImageViewer" :transmitMergeInfo="transmitMergeInfo" :key="transmitKey">
        </transmitDlg>
        <div id="complextype" class="edit-file-blot" style="display:none;">
            <span class="complex" spellcheck="false" contenteditable="false"></span>
        </div>
        <groupInfoTip 
            v-if="showGroupInfoTips"
            :showGroupInfoTips="showGroupInfoTips"
            :showGroupInfo="groupInfo" 
            :cleanCache="cleanCache" 
            @showAddMembers="showAddMembers"
            @openUserInfoTip="openUserInfoTip" 
            @leaveGroup="leaveGroup" 
            @updateChatGroupStatus="updateChatGroupStatus" 
            @openSetting="mxRoomSetting"
            @openChatInfoDlg="mxChatInfoDlgSetting"
            @openChatTopicDlg="mxChatTopicDlgSetting"
            @closeGroupInfo="closeGroupInfo"
        >
        </groupInfoTip> <!--todo html-->
        <chatMemberDlg :GroupInfo="this.chatMemberDlgchat" :showPosition="cursorPosition" :chatMemberSearchKey="chatMemberSearchKey" @clickAtMember="clickAtMember" @atMember="atMember" :selectClicked="toSelect" v-show="chatMemberDlgVisible"/>
        <userInfoContent 
            :userInfo="userInfo" 
            :isOwn="isOwn" 
            :originPosition="userInfoPosition" 
            v-if="showUserInfoTips" 
            @JumpToDistRoom="JumpToDistRoom" 
            :key="userInfoTipKey"
            @close="closeUserInfoTipChat"
        >
        </userInfoContent> 
        <SendFileDlg v-show="showSendFileDlg" :sendInfos="sendFileInfos" @closeSendFileDlg="closeSendFileDlg" @SendFiles="SendFiles"></SendFileDlg>
        <div class="history-dropdown-content" id="history-dropdown-content-id">
            <div class="history-msg" @click="showHistoryMsgList()">
                <img class="history-msg-img" src="../../../static/Img/Chat/chatHistoryMsg-20px@2x.png">
                <span class="history-msg-label">聊天记录</span>
            </div>
            <div class="history-file" @click="showFileList()">
                <img class="history-msg-img" src="../../../static/Img/Chat/chatHistoryFiles-20px@2x.png">
                <span class="history-file-label">文件</span>
            </div>
        </div>
        <mxSettingDialog v-if="mxRoomDlg" @close="mxRoomSetting" :roomId="curChat.roomId"></mxSettingDialog>
        <mxChatInfoDlg v-if="mxChat" @close="mxChatInfoDlgSetting" :roomId="curChat.roomId"></mxChatInfoDlg>
        <mxChatTopicDlg v-if="mxChatTopic" @close="mxChatTopicDlgSetting" :roomId="curChat.roomId"></mxChatTopicDlg>
        <!-- <mxMemberSelectDlg 
            v-if="mxSelectMemberOpen" 
            @close="mxSelectMember"
            :roomId="chat.roomId"
            :isDm="isDm"
        >
        </mxMemberSelectDlg> -->
    </div>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.bubble.css'
import {quillEditor} from 'vue-quill-editor'
import * as Quill from 'quill'
import {ipcRenderer, remote, shell} from 'electron'
import { get as getProperty } from 'lodash'
import Faces from './faces.vue';
import {makeFlieNameForConflict, getFileSizeNum, generalGuid, fileMIMEFromType, Appendzero, FileUtil, findKey, pathDeal, changeStr, fileTypeFromMIME, getIconPath, uncodeUtf16, strMsgContentToJson, JsonMsgContentToString, sliceReturnsOfString, getFileNameInPath, insertStr, getFileSize, FileToContentType, FilenameToContentType, GetFileType, getFileBlob} from '../../packages/core/Utils.js'
import imessage from './message.vue'
import groupInfoTip from './group-info.vue'
import chatMemberDlg from './chatMemberList.vue'
import transmitDlg from './transmitDlg.vue'
import SendFileDlg from './send-file-dlg.vue'
import { Group, Message, Department, UserInfo, sqliteutil, Contact } from '../../packages/data/sqliteutil.js'
import userInfoContent from './user-info';
import mxSettingDialog from './mxSettingDialog';
import mxChatInfoDlg from './mxChatInfoDlg';
import mxChatTopicDlg from './mxChatTopicDlg'
import {Filter} from 'matrix-js-sdk';
import * as Matrix from 'matrix-js-sdk';
import Invite from './invite.vue';
import encrypt from 'browser-encrypt-attachment';
import {ComponentUtil} from '../script/component-util';
import mxHistoryPage from './mxHistoryMsg.vue';
import mxFilePage from "./mxFileList.vue";
import mxMemberSelectDlg from './mxMemberSelectDlg.vue'
import AlertDlg from './alert-dlg.vue'
import { getRoomNotifsState, setRoomNotifsState, MUTE, ALL_MESSAGES } from "../../packages/data/RoomNotifs.js"
import { openRemoteMenu, getImgUrlByEvent, copyImgToClipboard } from '../../utils/commonFuncs'
import deleteIcon from '../../../static/Img/Chat/quote-delete.png'
import { roomTimeLineHandler } from '../../packages/data/roomTimelineHandler'
const {Menu, MenuItem, nativeImage} = remote;
const { clipboard } = require('electron')
var isEnter = false;
var canNewLine = false;
// Quill.register('modules/imageDrop', ImageDrop);
// Quill.register('modules/resizeImage', resizeImage);

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

function extend(target, base) {
    console.log("base is ", base);
  for (var prop in base) {
    target[prop] = base[prop];
  }
}
//https://stackoverflow.com/questions/37796409/is-it-possible-to-create-a-custom-format-blot-with-complex-substructure
(function(Embed) {
  'use strict';

    function Span() {
        Object.getPrototypeOf(Embed).apply(this, arguments);
    }
  Span.prototype = Object.create(Embed && Embed.prototype);
  Span.prototype.constructor = Span;
  extend(Span, Embed);

  Span.create = function create(value) {
    //   console.log("value is ", value);
    //   console.log("attributes value is ", value.attributes);
    //   console.log("embed value is ", value.style);
        return value; // expects a domNode as value
  };

  Span.value = function value(domNode) {
    return domNode;
  };

  Span.blotName = 'span';
  Span.tagName = 'SPAN';
  Span.className = 'complex';

  Quill.register(Span, true);
})(Quill.import('blots/embed')); // import the embed blot. This is important as this is being extended

const InlineBlot = Quill.import('formats/image')
const Delta = Quill.import('delta')
class FileBlot extends InlineBlot {
    static create(data) {
        console.log("FileBlot create data is ", data);
        const node = super.create(data);
        node.setAttribute('localPath', data.localPath);
        node.setAttribute('src', data.src);
        node.setAttribute('type', data.fileType);
        node.setAttribute('height', data.fileHeight);
        node.setAttribute('style', data.style);
        node.setAttribute('size', data.fileSize);

        return node;
    }
    static value(domNode) {
        var tmp = {};
        tmp["localPath"] = domNode.getAttribute('localPath');
        tmp["type"] = domNode.getAttribute('type');
        tmp["src"] = domNode.getAttribute('src');
        tmp["fileSeight"] = domNode.getAttribute('height');
        tmp["fileSize"] = domNode.getAttribute('size');
        return tmp;
    }
}
FileBlot.blotName = 'fileBlot';
FileBlot.className = 'file-blot';
FileBlot.tagName = 'img';
Quill.register({ 'formats/imageBlot': FileBlot });

export default {
    name: 'Chat',
    components: {
        AlertDlg,
        quillEditor,
        imessage,
        Faces,
        groupInfoTip,
        chatMemberDlg,
        transmitDlg,
        userInfoContent,
        SendFileDlg,
        mxSettingDialog,
        mxChatInfoDlg,
        mxChatTopicDlg,
        Invite,
        mxHistoryPage,
        mxFilePage,
        mxMemberSelectDlg,
    },
    methods: {
        closeToBottom() {
            this.newMsgNum = 0;
            this.haveNewMsg = false;
        },
        goToBottom() {
            this.newMsgNum = 0;
            this.SetToBottom();
            this.haveNewMsg = false;
        },
        checkIsEmptyRoom() {
            let checkMxMember = [];
            for(let key in this.curChat.currentState.members) {
                let o = this.curChat.currentState.members[key];
                if (o.membership != 'leave') checkMxMember.push(o);
            }
            if(checkMxMember.length == 1) {
                var distMember = checkMxMember[0];
                if((distMember.userId ? distMember.userId : distMember.user.userId) == global.mxMatrixClientPeg.matrixClient.getUserId()) {
                    return true;
                }
            }
            if(checkMxMember.length == 0) {
                return true;
            }
        },
        getShowGroupName() {
            if(this.curChat && this.curChat.name && this.curChat.name.startsWith("Empty room")) {
                if(this.checkIsEmptyRoom(this.curChat)) {
                    return "空聊天室";
                }
            }
            return this.curChat.contactName ? this.curChat.contactName : this.curChat.name;
        },
        clearCache: function() {
            console.log("*** this.curOperate is ", this.curOperate);
            if(this.curOperate == "Trans") {
                this.transmitNeedAlert = false;
                this.curOperate == "";
                this.showAlertDlg = false;
                this.multiTransMit();
            }
            else if(this.curOperate == "Del") {
                this.curOperate == "";
                this.showAlertDlg = false;
                this.multiDel();
            }
            else if(this.curOperate == "multTrans") {
                this.transmitNeedAlert = false;
                this.curOperate == "";
                this.showAlertDlg = false;
                this.multTtransMitTogether();
            }
            this.closeAlertDlg();
        },
        closeAlertDlg: function() {
            console.log("*** close curoperate is empty");
            this.curOperate = "";
            this.showAlertDlg = false;
        },
        groupIsSlience() {
            if(this.curChat.roomId) {
                const state = getRoomNotifsState(this.curChat.roomId);
                if(state == MUTE) {
                    this.isMute = true;
                }
                else {
                    this.isMute = false;
                }
            }
        },
        JumpToDistRoom(roomId) {
            this.$emit("JoinRoom", roomId);
        },
        mxSelectMember() {

        },
        
        showImportE2EKey() {
            this.$emit("showImportE2EKey");
        },
        closeUserInfoTipChat() {
            this.showUserInfoTips = false;
            console.log('chat 中的userInfo模版');
        },
        chatMsgDivId: function(eventId) {
            return "chatMsgDivId_" + eventId;
        },
        isDeleted: function(msgItem) {
            if(!msgItem.event.event_id) {
                return false;
            }
            return msgItem.isRedacted() || msgItem.getType() == "m.room.redaction" || (!this.showNoticeOrNot(msgItem) && !this.showMessageOrNot(msgItem));
        },
        joinRoom: function() {
            global.mxMatrixClientPeg.matrixClient.joinRoom(this.curChat.roomId, {inviteSignUrl: undefined, viaServers: undefined})
                .then(() => {
                    this.isInvite = false;
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
                    }
                })
        },
        rejectRoom: function() {
            global.mxMatrixClientPeg.matrixClient.leave(this.curChat.roomId);
            setTimeout(() => {
                this.$emit('DeleteGroup', this.curChat.roomId);
            }, 0)
        },
        mxChatInfoDlgSetting: function(close) {
            if (close) {
                return this.mxChat = false;
            }
            this.closeGroupInfo();
            this.mxChat = true;
        },
        mxChatTopicDlgSetting: function(close) {
            if (close) {
                return this.mxChatTopic = false;
            }
            this.closeGroupInfo();
            this.mxChatTopic = true;
        },
        mxRoomSetting: function(close, serverAddress) {
            if (close) {
                return this.mxRoomDlg = false;
            }
            this.closeGroupInfo();
            this.mxRoomDlg = true;
        },
        closeGroupInfo() {
            this.showGroupInfoTips = false;
        },
        handleCustomMatcher(node, Delta) {
            let ops = []
            Delta.ops.forEach(op => {
                if (op.insert && typeof op.insert === 'string') {
                ops.push({
                    insert: op.insert,
                })
                }
            })
            Delta.ops = ops
            return Delta
        },
        updateChatList: function(ret) {
            this.$emit("updateChatList", ret, false);
        },
        openUserInfoTip:async function(tipInfos) {
            if(this.showUserInfoTips && tipInfos.userInfo == undefined) {
                this.showUserInfoTips = false;
                return;
            }
            var distUserInfo = tipInfos.userInfo;
            var isMine = tipInfos.isMine;
            // var iconElement = document.getElementById(id);
            this.userInfoPosition.left = tipInfos.absoluteLeft;
            this.userInfoPosition.top = tipInfos.absoluteTop;
            if(isMine) {
                this.userInfoPosition.left = this.userInfoPosition.left - 280 - 45;
                console.log("isown is ",this.isOwn);
                this.isOwn = true;
            }
            else {
                if(tipInfos.showLeft) {
                    this.userInfoPosition.left = this.userInfoPosition.left - 280 - 45;
                }
                this.isOwn = false;
            }
            // console.log(iconElement.getBoundingClientRect());
            var tempUserInfo = {};
            //get userinfo

            let user = await Contact.GetContactInfo(distUserInfo.matrix_id);
            if(user){
                tempUserInfo = await ComponentUtil.ShowContactInfo(distUserInfo.matrix_id)
            }
            else{
                tempUserInfo = await ComponentUtil.ShowOrgInfoByMatrixID(distUserInfo.matrix_id)
            }
            if(!tempUserInfo)
                return;

            this.userInfo = tempUserInfo;
            this.userInfoTipKey ++;
            this.showUserInfoTips = true;
        },
        CloseFileListDlg: function() {
            ipcRenderer.send("fileListDlg-close");
        },
        MinFileListDlg: function() {
            ipcRenderer.send("fileListDlg-min");
        },
        showHistoryMsgList: function() {
            var chatElement = document.getElementById("chat-page-id");
            if(!chatElement) return;
            chatElement.style.backgroundColor = "rgba(255, 255, 255, 1)";
            this.$emit("isSearching", true);
            this.isSerach = true;
            this.newMsgNum = 0;
            this.haveNewMsg = false;
            this.HistorySearchRoomId = this.searchChat.roomId;
        },
        CloseSearchPage: function() {
            var chatElement = document.getElementById("chat-page-id");
            if(!chatElement) return;
            chatElement.style.backgroundColor = "rgba(241, 241, 241, 1)";
            this.$emit("isSearching", false);
            this.isSerach = false;
            if(this.searchKeyFromList.length != 0) {
                this.HistorySearchRoomId = "";
                this.$emit("CloseSearchPage")
            }
        },
        showFileList: function() {
            var chatElement = document.getElementById("chat-page-id");
            if(!chatElement) return;
            chatElement.style.backgroundColor = "rgba(255, 255, 255, 1)";
            this.$emit("isSearching", true);
            this.isFileList = true;
            this.newMsgNum = 0;
            this.haveNewMsg = false;
            this.isScroll = true;
            this.FilelistSearchRoomId = this.curChat.roomId;
        },
        CloseFileListPage: function() {
            var chatElement = document.getElementById("chat-page-id");
            if(!chatElement) return;
            chatElement.style.backgroundColor = "rgba(241, 241, 241, 1)";
            this.$emit("isSearching", false);
            this.isFileList = false;
            this.isScroll = false;
            this.FilelistSearchRoomId = "";
        },
        showMsgHistoryOperate: function() {
            var msgHistoryBtnElement = document.getElementById("chat-input-history-id");
            var msgHistoryMenuElement = document.getElementById("history-dropdown-content-id");
            var top = msgHistoryBtnElement.offsetTop + msgHistoryBtnElement.offsetHeight - 11;
            var left = msgHistoryBtnElement.offsetLeft + 11;
            msgHistoryMenuElement.style.display = "block";
            msgHistoryMenuElement.style.top = top + "px";
            msgHistoryMenuElement.style.left = left + "px";
        },
        
        creatVoiceChat: async function() {
            const distUserId = global.mxMatrixClientPeg.getDMMemberId(this.curChat);
            let distUrl = this.$store.getters.getAvater(distUserId);
            let showName = this.$store.getters.getShowName(distUserId);
            if(showName.length == 0) {
                showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
            }
            ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
                size:{width:300,height: 480},
                        roomInfo: { roomID: this.curChat.roomId,
                                    name: showName,
                                    url:distUrl,
                                    voipType: "voice",
                                    action: "call"}});
        },
        creatVideoChat: async function(){
            const distUserId = global.mxMatrixClientPeg.getDMMemberId(this.curChat);
            let distUrl = this.$store.getters.getAvater(distUserId);
            let showName = this.$store.getters.getShowName(distUserId);
            if(showName.length == 0) {
                showName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
            }
            ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
                size:{width:300,height: 480},
                        roomInfo: { roomID: this.curChat.roomId,
                                    name: showName,
                                    voipType: "video",
                                    url:distUrl,
                                    action: "call"}});
        },
        canRedact: function(curEvent) {
            const cli = global.mxMatrixClientPeg.matrixClient;

            const canRedact = this.curChat.currentState.maySendRedactionForEvent(curEvent, cli.credentials.userId);

            return canRedact;
        },
        async rightClick(e, msgItem) {
            console.log("msg is ", msgItem);
            console.log("*** e.target.className ", e.target.className);
            var showRedact = this.canRedact(msgItem);
            var senderId = msgItem.sender.userId ? msgItem.sender.userId : msgItem.event.sender;
            var showName = await ComponentUtil.GetDisplayNameByMatrixID(senderId);
            if(this.checkClassName.indexOf(e.target.className) == -1) {
                return;
            }
            if(this.multiSelect) {
                return;
            }
            if(e.target.className == "msg-info-user-img-with-name") {
                if(global.mxMatrixClientPeg.DMCheck(this.curChat)) {
                    return;
                }
                this.menu = new Menu();
                this.menu.append(new MenuItem({
                    label: "@" + showName,
                    click: () => {
                        this.atSomeOne(msgItem)
                    }
                }));
            }
            else {
                var content = msgItem.getContent();
                this.menu = new Menu();
                if(content.msgtype == 'm.text') {
                    this.menu.append(new MenuItem({
                        label: "复制",
                        click: () => {
                            this.menuCopy(msgItem)
                        }
                    }));
                    if(!this.isSecret) {
                        this.menu.append(new MenuItem({
                            label: "转发",
                            click: () => {
                                this.transMit(msgItem)
                            }
                        }));
                        this.menu.append(new MenuItem({
                            label: "收藏",
                            click: () => {
                                this.menuFav(msgItem)
                            }
                        }));
                    }
                    if(showRedact) {
                        console.log('查看当前信息', msgItem);
                        let text = '删除';
                        let timeLimit = 2 * 60 * 1000;
                        const myUserId = this.curChat.myUserId;
                        const currentState = this.curChat.currentState.getStateEvents('m.room.power_levels','');
                        const members = this.curChat.currentState.members;
                        const userLevel = members[myUserId].powerLevel;
                        let redact = 50;
                        if (currentState) {
                            let levelObj = currentState.getContent();
                            redact = levelObj.redact || redact;
                        }
                        console.log('redact Number>>>>>', redact)
                        console.log('userLevel Number>>>>', userLevel)
                        if (msgItem.event.sender === myUserId) {
                            if (Date.now() - msgItem.event.origin_server_ts < timeLimit) text = '撤回';
                            this.menu.append(new MenuItem({
                                label: text,
                                click: () => {
                                    this.menuDelete(msgItem, text)
                                }
                            }));
                        } else if (userLevel >= redact) {
                            this.menu.append(new MenuItem({
                                label: text,
                                click: () => {
                                    this.menuDelete(msgItem, text)
                                }
                            }));
                        }
                    }
                    if(!this.isSecret) {
                        this.menu.append(new MenuItem({
                            label: "多选",
                            click: () => {
                                this.msgMultiSelect(msgItem);
                            }
                        }));
                    }
                    this.menu.append(new MenuItem({
                        label: "引用",
                        click: () => {
                            this.menuQuote(msgItem)
                        }
                    }));
                }
                else if(content.msgtype == "m.file" || content.msgtype == "m.image") {
                    if(!this.isSecret) {
                        this.menu.append(new MenuItem({
                            label: "转发",
                            click: () => {
                                this.transMit(msgItem)
                            }
                        }));
                    }
                    if(!this.isSecret) {
                        this.menu.append(new MenuItem({
                            label: "收藏",
                            click: () => {
                                this.menuFav(msgItem)
                            }
                        }));
                    }
                    if(showRedact) {
                        this.menu.append(new MenuItem({
                            label: "删除",
                            click: () => {
                                this.menuDelete(msgItem)
                            }
                        }));
                    }
                    if(!this.isSecret) {
                        this.menu.append(new MenuItem({
                            label: "多选",
                            click: () => {
                                this.msgMultiSelect(msgItem);
                            }
                        }));
                    }
                    this.menu.append(new MenuItem({
                        label: "另存为",
                        click: () => {
                            this.downloadFile(msgItem);
                        }
                    }));
                    if (content.msgtype == "m.image"){
                        this.menu.append(new MenuItem({
                            label: "引用",
                            click: () => {
                                this.quoteImg(msgItem);
                            }
                        }));
                        this.menu.append(new MenuItem({
                            label: "复制",
                            click: () => {
                               copyImgToClipboard(getImgUrlByEvent(msgItem.event))
                            }
                        }));
                    }

                }
                else if(content.msgtype == "m.audio") {
                    if(showRedact) {
                        this.menu.append(new MenuItem({
                            label: "删除",
                            click: () => {
                                this.menuDelete(msgItem)
                            }
                        }));
                    }
                }
                else if(content.msgtype == "each.chat.merge") {
                    this.menu.append(new MenuItem({
                        label: "转发",
                        click: () => {
                            this.transMit(msgItem)
                        }
                    }));
                    if(showRedact) {
                        this.menu.append(new MenuItem({
                            label: "删除",
                            click: () => {
                                this.menuDelete(msgItem)
                            }
                        }));
                    }
                    if(!this.isSecret) {
                        this.menu.append(new MenuItem({
                            label: "多选",
                            click: () => {
                                this.msgMultiSelect(msgItem);
                            }
                        }));
                    }
                }
            }
            this.menu.popup(remote.getCurrentWindow());
        },
        menuDelete(msg, text='删除') {
            this.curOperate = "Del";
            this.selectedMsgs.push(msg);
            if (text === '撤回') {
                //todo recall
                let des = msg.event.content.body;
                for(let i=0;i<this.selectedMsgs.length;i++) {
                    global.mxMatrixClientPeg.matrixClient.redactEvent(this.curChat.roomId, this.selectedMsgs[i].event.event_id);
                }
                console.log('msg xieeeee', des);
                // this.editor.insertText(this.content.length, des);
            } else {
                this.alertContnets = {
                    "Details": `是否${text}聊天记录？`,
                    "Abstrace": `${text}删除聊天记录`
                }
                this.showAlertDlg = true;
                // global.mxMatrixClientPeg.matrixClient.redactEvent(this.curChat.roomId, msg.event.event_id)
                // .catch((error) => {
                //     console.log("menuDelete ", error);
                //     this.$toastMessage({message:'删除成功', time:1500, type:'success'});
                //     this.multiToolsClose();
                // })
            }
        },
        async menuQuote(msg) {
            this.editor.setSelection(this.editor.selection.savedRange.index)
            var dom = document.getElementById('quote-img')
            const exist = !!dom
            if (!exist) {
                dom = document.createElement('div')
            }
            dom.setAttribute('class', 'quote-content')
            dom.setAttribute('id', 'quote-text')
            dom.setAttribute('data-roomid', this.curChat.roomId)
            dom.setAttribute('contenteditable', false)
            this.$store.state.quoteMsgMap[this.curChat.roomId] = msg
            const userName = await ComponentUtil.GetDisplayNameByMatrixID(msg.event.sender)
            var msgContent = msg.getContent();
            var text = msgContent.body;
            dom.innerHTML=`
                <div class="quote-content-text" >${userName} :${text}</div>
                <img class="quote-img-delete" id="quote-img-delete" src="${deleteIcon}" />
            `
            if (!exist) {
                this.editor.insertText(this.editor.selection.savedRange.index,' ')
                this.editor.insertEmbed(this.editor.selection.savedRange.index, 'span', dom)
                this.editor.insertText(this.editor.selection.savedRange.index + 1,' ')
                this.editor.setSelection(this.editor.selection.savedRange.index - 1)
            }
            const deleteBtn = document.getElementById('quote-img-delete')
            const handler = () => {
                if (dom && dom.parentNode){
                    dom.parentNode.removeChild(dom)
                }
            }
            deleteBtn.addEventListener('click', handler, true) 
        },

        getQuoteImgMsg(){
            const dom = document.getElementById('quote-img')
            return this.$store.state.quoteMsgMap[(dom && dom.getAttribute('data-roomid')) || '']
        },

        getQuoteTextMsg(){
            const dom = document.getElementById('quote-text')
            return this.$store.state.quoteMsgMap[(dom && dom.getAttribute('data-roomid')) || '']
        },

        async quoteImg(msg) {
            this.editor.setSelection(this.editor.selection.savedRange.index)
            var dom = document.getElementById('quote-img')
            const exist = !!dom
            if (!exist) {
                dom = document.createElement('div')
            }
            dom.setAttribute('class', 'quote-content')
            dom.setAttribute('id', 'quote-img')
            dom.setAttribute('data-roomid', this.curChat.roomId)
            dom.setAttribute('contenteditable', false)
            this.$store.state.quoteMsgMap[this.curChat.roomId] = msg
            const userName = await ComponentUtil.GetDisplayNameByMatrixID(msg.event.sender)
            dom.innerHTML=`
                <span class="quote-content-span">${userName} : </span>
                <div class="quote-content-img" style="background-image:url(${getImgUrlByEvent(msg.event)})">
                </div>
                <img class="quote-img-delete" id="quote-img-delete" src="${deleteIcon}" />
            `
            if (!exist) {
                this.editor.insertText(this.editor.selection.savedRange.index,' ')
                this.editor.insertEmbed(this.editor.selection.savedRange.index, 'span', dom)
                this.editor.insertText(this.editor.selection.savedRange.index + 1,' ')
                this.editor.setSelection(this.editor.selection.savedRange.index - 1)
            }
            const deleteBtn = document.getElementById('quote-img-delete')
            const handler = () => {
                if (dom && dom.parentNode){
                    dom.parentNode.removeChild(dom)
                }
            }
            deleteBtn.addEventListener('click', handler, true)
        },
        menuCopy(msg) {
            var msgContent = msg.getContent();
            console.log("msgContent is ", msgContent.body)
            var selectedTxt = window.getSelection ? window.getSelection():document.selection.createRange().text;
            console.log("selectedTxt ", selectedTxt);
            if(selectedTxt!=null&&selectedTxt!=""&&msgContent.body.indexOf(selectedTxt) >= 0) {
                clipboard.writeText(selectedTxt.toString());
            }
            else {
                clipboard.writeText(msgContent.body);
            }
        },
        async transmitFromSoloDlg(e, args) {
            var transmitInfoStr = args;
            var transmitInfo = strMsgContentToJson(transmitInfoStr);
            console.log("transmitfromsolodlg ", transmitInfo);
            // var distMsg = await Message.FindMessageBySequenceID(transmitInfo.sequence_id);
            // if(distMsg.length == 0) {
            //     distMsg = transmitInfoStr;
            // }
            // console.log("transmitfromsolodlg ", distMsg);
            this.transMit(transmitInfo);
        },
        async transMit(msg) {
            this.transmitKey ++;
            this.showTransmitDlg = true;
            this.selectedMsgs.push(msg);
            this.transmitTogether = false;
        },
        async multTtransMitTogether() {
            this.curOperate = "multTrans";
            if(this.transmitNeedAlert) {
                this.alertContnets = {
                    "Details": "你选择的消息中包含语音或音视频不支持转发，是否继续？",
                    "Abstrace": "提示"
                }
                this.showAlertDlg = true;
            }
            else{
                this.curOperate = "";
                this.transmitMergeInfo.from_room_id = this.curChat.roomId;
                this.transmitMergeInfo.from_room_display_name = this.getShowGroupName();
                this.transmitMergeInfo.from_matrix_ids = [];
                if(global.mxMatrixClientPeg.DMCheck(this.curChat)) {
                    const cli = window.mxMatrixClientPeg.matrixClient;
                    const xie1 = cli.getRoom(this.curChat.roomId);
                    await xie1.loadMembersIfNeeded();
                    for(let key in xie1.currentState.members) {
                        // let isAdmin = xie1.currentState.members[key].powerLevel == 100; 
                        let o = xie1.currentState.members[key];
                        let obj = {...o}
                        if (obj.membership != 'leave') this.transmitMergeInfo.from_matrix_ids.push(obj.userId);
                    }
                }
                this.transmitKey ++;
                this.showTransmitDlg = true;
                this.transmitTogether = true;
            }
        },
        async multiTransMit() {
            this.curOperate = "Trans";
            if(this.transmitNeedAlert) {
                this.alertContnets = {
                    "Details": "你选择的消息中包含语音不能转发，是否继续？",
                    "Abstrace": "提示"
                }
                this.showAlertDlg = true;
            }
            else{
                console.log("**** transmit");
                this.curOperate = "";
                this.transmitKey ++;
                this.showTransmitDlg = true;
                this.transmitTogether = false;
            }
        },
        
        closeChatCreaterDlg(content) {
            this.showChatCreaterDlg = false;
            this.createNewChat = false;
            this.chatCreaterDisableUsers = [];
        },
        showAddMembers: async function(existedMembers){

        },
        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        },

        async menuFav(msg) {
            console.log("fav msg is ", msg);
            console.log("cointent is ", strMsgContentToJson(msg.message_content));
            if(!msg.event || !msg.event.event_id)
                return;
            let event_id = msg.event.event_id;
            let content = msg.event.content;
            if(msg.sender && msg.sender.userId)
                content.fromMatrixId = msg.sender.userId;
            if(msg.event.origin_server_ts)
                content.fromTimestamp = msg.event.origin_server_ts;
            global.services.common.CollectMessage(event_id, content).then((ret) => {
                if(ret == true) {
                    this.$toastMessage({message:"收藏成功", time: 2000, type:'success'});
                }
                else {
                    this.$toastMessage({message:"收藏失败", time: 2000, type:'error'});
                }
            })
        },
        async imageViewerFav(event, imageInfo) {
            let event_id = imageInfo.imageEventId;
            let content = {
                msgtype: 'm.image',
                body: imageInfo.body,
                url: imageInfo.url,
                info:imageInfo.info,
            }
            if(imageInfo.sender)
                content.fromMatrixId = imageInfo.sender;
            if(imageInfo.origin_server_ts)
                content.fromTimestamp = imageInfo.origin_server_ts;
            global.services.common.CollectMessage(event_id, content);
        },
        async imageViewerTransmit(event, imageInfo) {
            console.log("*** imageViewerTransmit imageInfo is ", imageInfo);
            this.transmitImageViewer = true;
            this.imageViewerImageInfo = imageInfo;
            this.transmitKey ++;
            this.showTransmitDlg = true;
            this.transmitTogether = false;
        },
        async multiFav() {
            var toFavMsgIds = [];
            for(let i=0;i<this.selectedMsgs.length;i++) {
                if(!this.selectedMsgs[i].event || !this.selectedMsgs[i].event.event_id)
                    return;
                toFavMsgIds.push(this.selectedMsgs[i]);
                let event_id = this.selectedMsgs[i].event.event_id;
                let content = this.selectedMsgs[i].event.content;
                if(this.selectedMsgs[i].sender && this.selectedMsgs[i].sender.userId)
                    content.fromMatrixId = this.selectedMsgs[i].sender.userId;
                if(this.selectedMsgs[i].event.origin_server_ts)
                    content.fromTimestamp = this.selectedMsgs[i].event.origin_server_ts;
                global.services.common.CollectMessage(event_id, content);
            }
            this.$toastMessage({message:'收藏成功', time:1500, type:'success'});
            this.multiToolsClose();
        },
        toMultiDel() {
            this.curOperate = "Del";
            this.alertContnets = {
                "Details": "是否删除聊天记录？",
                "Abstrace": "删除聊天记录"
            }
            this.showAlertDlg = true;
        },
        multiDel() {
            console.log("this.selectedMsgs is ", this.selectedMsgs);
            for(let i=0;i<this.selectedMsgs.length;i++) {
                global.mxMatrixClientPeg.matrixClient.redactEvent(this.curChat.roomId, this.selectedMsgs[i].event.event_id);
            }
            // this.$toastMessage({message:'删除成功', time:1500, type:'success'});
            this.multiToolsClose();
        },
        multiToolsClose() {
            this.multiSelect = false;
            this.cleanSelected();
            this.selectedMsgs = [];
        },
        showCheckboxOrNot(curMsg) {
            if(this.multiSelect && !this.showNoticeOrNot(curMsg)) {
                return true;
            }
            return false;
        },
        msgMultiSelect(msg) {
            console.log("multitransmit msg is ", msg);
            this.multiSelect = true;
            var elementTmp = document.getElementById(this.msgCheckBoxId(msg));
            if(elementTmp != undefined) {
                elementTmp.checked = true;
            }
            this.selectChanged(msg);
        },
        downloadFile(msg){
            let paths = ipcRenderer.sendSync("get_save_filepath");
            let folders = paths.filePaths;
            if(folders.length == 0) return;
            let folder = folders[0];
            console.log(folder)
            let msgElements = this.$refs[msg.event.event_id];
            if(msgElements.length === 0) return;
            let msgElement = msgElements[0];
            var chatGroupMsgContent = msg.event.content ? msg.event.content : msg.getContent();
            msgElement.SaveFile(chatGroupMsgContent, path.join(folder, chatGroupMsgContent.body), msg.event.event_id, false);
        },

        cleanSelected() {
            for(let i=0;i<this.selectedMsgs.length;i++) {
                var elementTmp = document.getElementById(this.msgCheckBoxId(this.selectedMsgs[i]));
                if(elementTmp != undefined) {
                    elementTmp.checked = false;
                }
            }
        },
        selectChanged: function(curMsg) {
            if(curMsg == null){
                return false;
            }
            var hasSelected = false;
            for(let i=0;i<this.selectedMsgs.length;i++) {
                if(this.selectedMsgs[i].event.event_id == curMsg.event.event_id) {
                    this.selectedMsgs.splice(i, 1);
                    hasSelected = true;
                    break;
                }
            }
            if(!hasSelected) {
                this.selectedMsgs.push(curMsg);
            }
            var canShowDelete = true;
            var canShowFav = true;
            this.selectedMsgs.forEach(k => {
                if(!this.canRedact(k)) {
                    canShowDelete = false;
                }
                if(this.MsgIsVoice(k) || this.MsgIsVoipCall(k)) {
                    this.transmitNeedAlert = true;
                }
                if(this.MsgIsTransmit(k)) {
                    canShowFav = false;
                }
            })
            var deleteElement = document.getElementById("multiSelectDelDivId");
            if(!canShowDelete) {
                deleteElement.style.display = 'None';
            }
            else {
                deleteElement.style.display = 'inline-block';
            }
            var favElement = document.getElementById("multiSelectFavDivId");
            if(!canShowFav) {
                favElement.style.display = 'None';
            }
            else {
                favElement.style.display = 'inline-block';
            }
        },
        MsgIsTransmit: function(msg) {
            let msgContent = msg.event.content ? msg.event.content : msg.getContent();
            let chatGroupMsgType = msg.event.content.msgtype == undefined ? msgContent.msgtype : msg.event.content.msgtype;
            if(chatGroupMsgType == 'each.chat.merge'){
                return true;
            }
            else if(chatGroupMsgType == "m.bad.encrypted") {
                return false;
            }
            else{
                return false;
            }
        },
        MsgIsVoipCall: function(msg) {
            if(msg.event.type.indexOf("m.call") >= 0) return true;
            else return false;
        },
        MsgIsVoice: function(msg) {
            let chatGroupMsgType = msg.event.content.msgtype == undefined ? msg.getContent().msgtype : msg.event.content.msgtype;
            if(chatGroupMsgType == 'm.audio'){
                return true;
            }
            else if(chatGroupMsgType == "m.bad.encrypted") {
                return false;
            }
            else{
                return false;
            }
        },
        closeTransmitDlg() {
            this.showTransmitDlg = false;
            this.transmitMergeInfo = {};
            this.transmitImageViewer = false;
            this.cleanSelected();
            this.selectedMsgs = [];
            this.multiSelect = false;
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
        },
        getAtNum(string = '') {
            return (string.match(/@/g)|| '').length
        },
        inputChanged(content) {
            var range = this.editor.getSelection();
            var curInputIndexTmp = 0;
            // console.log("this.curContent is ", this.curContent);
            if(range == null) {
                curInputIndexTmp = 0;
            }
            else {
                curInputIndexTmp = range.index;
            }
            if(range != null) {
                // console.log("range.index is ", range.index);
            }
            // console.log("atIndex is ", atIndex);
            // console.log("this.curInputIndex is ", curInputIndexTmp);        
            if(this.chatMemberDlgVisible) {
                const curText = content.text || ''
                if (content && this.getAtNum(curText) - this.getAtNum(this.curContent) === 1 ){
                    this.chatMemberSearchKey = ''
                }else{
                    var atIndex = curText.lastIndexOf("@");
                    var getSearchKey = curText.substring(atIndex + 1, curInputIndexTmp + 1).trim();
                    this.chatMemberSearchKey = getSearchKey;
                }
                // console.log("inputchange this.chatmembersearchkey is ", this.chatMemberSearchKey);
                // console.log("inputchange this.chatmembersearchkey.length is ", this.chatMemberSearchKey.length);
                // @ Dlg visialbe need update position.
                var editorElement = document.getElementsByClassName("ql-editor")[0];
                var parentElement = document.getElementById("chat-input-id");
                var editorChild = editorElement.children;
                var distItem = editorChild[editorChild.length - 1];
                let curIndex = this.editor.getSelection();
                let bounds = this.editor.getBounds(curIndex)
                var clientOffLeft = bounds.left;

                var clientOffSet = bounds.top;
                if(clientOffSet > 108) clientOffSet = 108;//108 is input message absolate height
                let inputEditTotalWidth = distItem.clientWidth;
                var offsetTop = parentElement.offsetTop + 40 + distItem.offsetTop + clientOffSet;

               
                let leftWidth = clientOffLeft % inputEditTotalWidth;
                //200 is show at user dlg width
                if(inputEditTotalWidth - leftWidth < 200){
                    clientOffLeft = inputEditTotalWidth - 200;
                    offsetTop -= 18;// 18 is input edit per width
                }

                console.log("top--- ", offsetTop)
                console.log("left-- ", clientOffLeft);
                this.cursorPosition = {};
                this.cursorPosition = {
                    "top": offsetTop,
                    "left": clientOffLeft
                }
            }
            else {
                this.chatMemberSearchKey = null;
            }
            if(content == undefined) {
                this.curContent = this.content;
            }
            else {
                this.curContent = content.text;
            }
            if(this.curContent.indexOf("@") == -1) {
                this.chatMemberDlgVisible = false;
                this.chatMemberSearchKey = null;
                this.chatMemberDlgchat = {};
                canNewLine = true;
            }
        },
        deleteDistContent() {
            var content = this.editor.getContents();
            var index = 0;
            var distContent = "@";
            var range = this.editor.getSelection();
            var content = this.editor.getContents();
            // console.log("this.chatMembersearchkey ", this.chatMemberSearchKey);
            if(this.chatMemberSearchKey != null) {
                distContent = distContent + this.chatMemberSearchKey;
            }
            distContent = distContent.trim();
            if(range == null) {
                this.curInputIndex = 0;
            }
            else {
                this.curInputIndex = range.index;
            }
            for(var i=0;i<content.ops.length;i++) {
                if(content.ops[i].insert.span == undefined) {
                    // console.log("content.ops[i].insert ", content.ops[i].insert);
                    // console.log("distContent ", distContent);
                    if(content.ops[i].insert.indexOf(distContent) != -1) {
                        // console.log("curInputIndex is ", this.curInputIndex);
                        content.ops[i].insert = content.ops[i].insert.replace(distContent, "");
                        // console.log("curInputIndex is ", this.curInputIndex);
                        // console.log("content ", content);
                        this.editor.setContents(content);
                        // this.editor.setSelection(500);
                        // console.log("curInputIndex is ", this.curInputIndex);
                        // console.log("distContent.length is ", distContent.length);
                        this.curInputIndex = this.curInputIndex > distContent.length ? this.curInputIndex - distContent.length : 0;
                        break;
                    }
                }
            }
        },
        keyUpHandle(event) {
            // console.log("handle up event ", event)
            var range = this.editor.getSelection();
            // console.log("handle up event range is ", range.index);

            if(event.code == "ArrowUp") {
                console.log("handle up this.chatMemberDlgVisible ", this.chatMemberDlgVisible)
                if(!this.chatMemberDlgVisible) {
                    return;
                }
                
                console.log("handle up event range is ", range);
                if(range == null) {
                    this.editor.setSelection(0);
                }
                else {
                    console.log("to set 1");
                    this.editor.setSelection(range.index + 1);
                }
            }
        },
        checkNeedScroll(checkItem) {
            if(this.ulElement == undefined) {
                this.ulElement = document.getElementById("atListId");
            }
            if(this.ulElement && checkItem) {
                if(this.ulElement.scrollTop > checkItem.offsetTop || (this.ulElement.scrollTop + this.ulElement.clientHeight < checkItem.offsetTop)) {
                    console.log("*** need Scroll");
                    return true;
                }
                else {
                    console.log("*** do not need Scroll");
                    return false;
                }
            }
            else {
                return false;
            }
        },
        keyHandle(event) {
            // console.log("event ", event)
            // console.log("clipboard ", clipboard.readImage())
            var range = this.editor.getSelection();
            // console.log("handle down event range is ", range.index);
            var content = this.editor.getContents();

            if(event.code == "Enter" && !event.ctrlKey) {
                if(this.chatMemberDlgVisible) {
                    this.toSelect = !this.toSelect;
                    isEnter = false;
                }
                else if(isEnter) {
                    this.sendMsg();
                    // console.log("sendmsg");
                    isEnter = false;
                    canNewLine = true;
                }
            }
            else if(event.code == "Escape") {
                if(this.chatMemberDlgVisible) {
                    this.chatMemberDlgVisible = false;
                    this.charMemberDlgChat = {};
                    this.chatMemberSearchKey = null;
                    canNewLine = true;
                }
            }
            else if(event.code == "ArrowDown" || event.code == "ArrowUp") {
                if(!this.chatMemberDlgVisible) {
                    return;
                }
                
                // if(range == null) {
                //     this.editor.setSelection(0);
                // }
                // else if(range.index > 0) {
                //     this.editor.setSelection(0);
                // }
                
                if(this.ulElement == undefined) {
                    this.ulElement = document.getElementById("atListId");
                }
                console.log(this.ulElement.children);
                switch(event.keyCode) {
                    case 38: {
                        console.log("=======up ", this.curSelectedIndex);
                        if(this.curSelectedIndex == 0) {
                            this.curSelectedIndex = this.ulElement.children.length - 1;
                            this.ulElement.children[0].style.backgroundColor = "rgba(255, 255, 255, 1)";
                            this.ulElement.children[0].style.color = "rgb(0, 0, 0)";
                            if(this.checkNeedScroll(this.ulElement.children[this.curSelectedIndex])) {
                                this.ulElement.scrollTo({ top:this.ulElement.children[this.curSelectedIndex].offsetTop, behavior: 'smooth' });
                            }
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgba(243, 244, 247, 1)";
                            // this.ulElement.children[this.curSelectedIndex].style.color = "rgb(255, 255, 255)";
                        }
                        else if(this.curSelectedIndex > 0 && this.curSelectedIndex < this.ulElement.children.length) {
                            this.curSelectedIndex--;
                            if(this.checkNeedScroll(this.ulElement.children[this.curSelectedIndex])) {
                                this.ulElement.scrollTo({ top:this.ulElement.children[this.curSelectedIndex].offsetTop, behavior: 'smooth' });
                            }
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgba(243, 244, 247, 1)";
                            // this.ulElement.children[this.curSelectedIndex].style.color = "rgb(255, 255, 255)";
                            this.ulElement.children[this.curSelectedIndex+1].style.backgroundColor = "rgba(255, 255, 255, 1)";
                            this.ulElement.children[this.curSelectedIndex+1].style.color = "rgb(0, 0, 0)";
                        }
                        else if(this.curSelectedIndex == this.ulElement.children.length) {
                            this.curSelectedIndex--;
                            this.ulElement.children[0].style.backgroundColor = "rgba(243, 244, 247, 1)";
                            // this.ulElement.children[0].style.color = "rgb(255, 255, 255)";
                            this.ulElement.scrollTo({ top:this.ulElement.children[0].offsetTop, behavior: 'smooth' });
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgba(255, 255, 255, 1)";
                            this.ulElement.children[this.curSelectedIndex].style.color = "rgba(0, 0, 0, 1)";
                        }
                        break;
                    }
                    case 40: {
                        console.log("=======down", this.curSelectedIndex);
                        if(this.curSelectedIndex == this.ulElement.children.length) {
                            this.ulElement.children[this.curSelectedIndex-1].style.backgroundColor = "rgba(255, 255, 255, 1)";
                            this.ulElement.children[this.curSelectedIndex-1].style.color = "rgba(0, 0, 0, 1)";
                            this.ulElement.scrollTo({ top:0, behavior: 'smooth' });
                            this.ulElement.children[0].style.backgroundColor = "rgba(243, 244, 247, 1)";
                            // this.ulElement.children[0].style.color = "rgb(255, 255, 255)";
                            this.curSelectedIndex = 0;
                        }
                        else if(this.curSelectedIndex < this.ulElement.children.length) {
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgba(243, 244, 247, 1)";
                            // this.ulElement.children[this.curSelectedIndex].style.color = "rgb(255, 255, 255)";
                            if(this.ulElement.children[this.curSelectedIndex-1]){
                                this.ulElement.children[this.curSelectedIndex-1].style.backgroundColor = "rgba(255, 255, 255, 1)";
                                this.ulElement.children[this.curSelectedIndex-1].style.color = "rgba(0, 0, 0, 1)";
                            }
                            this.curSelectedIndex++;
                            if(this.checkNeedScroll(this.ulElement.children[this.curSelectedIndex])) {
                                this.ulElement.scrollTo({ top:this.ulElement.children[this.curSelectedIndex].offsetTop, behavior: 'smooth' });
                            }
                        }
                        break;
                    }
                }
            }
            else if(event.code == "Enter" && event.ctrlKey) {
                var range = this.editor.getSelection();
                var curIndex = range == null ? 0 : range.index;
                this.editor.insertText(curIndex, '\n');
            }
            else if(event.code == "Backspace") {
                var content = this.editor.getContents();
                if(content.ops.length >= 2) {
                    // console.log("content.ops[content.ops.length-2].insert.span ", content.ops[content.ops.length-2].insert.span);
                    // console.log("content.ops[content.ops.length-1].insert.span ", content.ops[content.ops.length-1].insert);
                     if(content.ops[content.ops.length-2].insert.span != undefined && content.ops[content.ops.length-1].insert == '\n') {
                        //  console.log("========================")
                        content.ops.splice(content.ops.length-2, 2);
                        //  console.log("final content is ", content)
                        this.editor.setContents(content);
                        this.editor.setSelection(500);
                     }
                     else if(content.ops[content.ops.length-1].insert.span != undefined) {
                        content.ops.splice(content.ops.length-1, 1);
                        // console.log("insert content is ", content);
                        this.editor.setContents(content);
                        this.editor.setSelection(500);
                     }
                }
                return true;
            }
            else if(event.code == "Digit2" && event.shiftKey == true) {
                if(global.mxMatrixClientPeg.DMCheck(this.curChat)) {
                    return;
                }
                this.chatMemberSearchKey = null;
                this.chatMemberDlgVisible = true;
                this.chatMemberDlgchat = this.curChat;
                canNewLine = false;
            }
            else if (event.code == "PageUp"){
                event.preventDefault();
            }
        },
        atSomeOne(msgItem) {
            var senderId = msgItem.sender.userId ? msgItem.sender.userId : msgItem.event.sender;
            var userInfo = global.mxMatrixClientPeg.matrixClient.getUser(senderId);
            this.atMember(userInfo);
        },
        async clickAtMember(atMemberInfo) {
            // File
            console.log("atmemberinfo is ", atMemberInfo);
            var iconPath = "";
            this.deleteDistContent();
            var complexSpan = document.getElementById('complextype').firstElementChild.cloneNode(true);
            complexSpan.id = generalGuid();

            var distName = ComponentUtil.GetDisplayName("", atMemberInfo.userId);
            let userInfo = await UserInfo.GetUserInfoByMatrixID(atMemberInfo.userId);
            if(userInfo && userInfo.user_display_name.length != 0)
                distName = userInfo.user_display_name;

            complexSpan.innerHTML = "@" + distName;// + ":";
            var distStyle = this.atConstStyle
            // 'display:inline-block;outline:none;border: 0px;font-size:14px;',
            // console.log("diststyle is ", distStyle);
            complexSpan.style = distStyle;
            let msgInfo = {
                "path": "",
                "type": "at",
                "height": 0,
                "width": 0,
                "atUid": atMemberInfo.userId,
                "atName": distName,
            };
            this.idToPath[complexSpan.id] = msgInfo;
            var startIndex = this.editor.selection.savedRange.index;
            startIndex = startIndex - 1;
            console.log("admember this.curinputindex is ", this.curInputIndex);
            this.editor.insertEmbed(startIndex, 'span', complexSpan);
            console.log("this.editor.selection.savedRange.index is ", this.editor.selection.savedRange.index);
            startIndex = startIndex + 1;
            this.editor.setSelection(startIndex);
            this.editor.insertText(startIndex, " ");

            this.chatMemberDlgVisible = false;
            this.charMemberDlgChat = {};
            this.chatMemberSearchKey = null;
            canNewLine = true;
        },
        async atMember(atMemberInfo) {
            // File
            console.log("atmemberinfo is ", atMemberInfo);
            var iconPath = "";
            this.deleteDistContent();
            var complexSpan = document.getElementById('complextype').firstElementChild.cloneNode(true);
            complexSpan.id = generalGuid();

            var distName = ComponentUtil.GetDisplayName("", atMemberInfo.userId);
            let userInfo = await UserInfo.GetUserInfoByMatrixID(atMemberInfo.userId);
            if(userInfo && userInfo.user_display_name.length != 0)
                distName = userInfo.user_display_name;

            complexSpan.innerHTML = "@" + distName;// + ":";
            var distStyle = this.atConstStyle
            // 'display:inline-block;outline:none;border: 0px;font-size:14px;',
            // console.log("diststyle is ", distStyle);
            complexSpan.style = distStyle;
            let msgInfo = {
                "path": "",
                "type": "at",
                "height": 0,
                "width": 0,
                "atUid": atMemberInfo.userId,
                "atName": distName,
            };
            this.idToPath[complexSpan.id] = msgInfo;
            console.log("admember this.curinputindex is ", this.curInputIndex);
            this.editor.insertEmbed(this.curInputIndex, 'span', complexSpan);
            this.curInputIndex = this.curInputIndex + 1;
            console.log("this.editor.selection.savedRange.index is ", this.editor.selection.savedRange.index);
            this.editor.setSelection(this.curInputIndex);
            this.editor.insertText(this.curInputIndex, " ");

            this.chatMemberDlgVisible = false;
            this.charMemberDlgChat = {};
            this.chatMemberSearchKey = null;
            canNewLine = true;
        },
        getCreateGroupInfo(groupInfo) {
            console.log("chat get create group info is ", groupInfo);
            this.$emit('getCreateGroupInfo', groupInfo);
            this.showUserInfoTips = false;
        },
        async toGetShowImage(distRoom) {
            return distRoom.timeline;
        },
        async getFileExist(id) {
            let msgs = await Message.FindMessageByMesssageID(id);
            console.log(msgs)
            if(msgs.length != 0 && msgs[0].file_local_path != "")
                return msgs[0].file_local_path;
            return '';
        },
        async showImageOfMessage(distEvent) {
            var showImageInfoList = [];
            var distImageInfo = {};
            var imgMsgList = await this.toGetShowImage(this.curChat);
            imgMsgList.forEach(async curEvent => {
                let event = curEvent.event;
                let localPath = await this.getFileExist(event.event_id);
                let chatGroupMsgType = event.type;
                let chatGroupMsgContent = curEvent.getContent();
                if(chatGroupMsgType == "m.room.message" && chatGroupMsgContent.msgtype == "m.image" && !this.isDeleted(curEvent)) {
                    let maxSize = 390;
                    var curUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url);
        
                    let info = {
                        w: maxSize,
                        h: maxSize
                    };
                    console.log("*** image info is ", chatGroupMsgContent.info);
                    if(chatGroupMsgContent.info)
                        info = chatGroupMsgContent.info
                    if(!info.h)
                        info.h = maxSize;
                    if(!info.w)
                        info.w = maxSize;

                    var curImageInfo = {
                        imageUrl: curUrl,
                        localPath: localPath,
                        url: chatGroupMsgContent.url,
                        imageEventId: event.event_id,
                        info: info,
                        body: chatGroupMsgContent.body,
                        sender: curEvent.sender ? curEvent.sender.userId : curEvent.event.sender,
                        origin_server_ts: curEvent.event.origin_server_ts
                    }
                    if(distEvent.event.event_id == event.event_id) {
                        distImageInfo = {
                            imageUrl: curUrl,
                            localPath: localPath,
                            url: chatGroupMsgContent.url,
                            imageEventId: event.event_id,
                            info: info,
                            body: chatGroupMsgContent.body,
                            sender: curEvent.sender ? curEvent.sender.userId : curEvent.event.sender,
                            origin_server_ts: curEvent.event.origin_server_ts
                        }
                    }
                    showImageInfoList.unshift(curImageInfo);
                }
            });
            if(!distImageInfo.imageUrl) {
                let event = distEvent.event;
                let localPath = await this.getFileExist(event.event_id);
                let chatGroupMsgContent = event.content;
                
                let maxSize = 390;
                var curUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url);
    
                let info = {
                    w: maxSize,
                    h: maxSize
                };
                console.log("*** image info is ", chatGroupMsgContent.info);
                if(chatGroupMsgContent.info)
                    info = chatGroupMsgContent.info
                if(!info.h)
                    info.h = maxSize;
                if(!info.w)
                    info.w = maxSize;
                    
                distImageInfo = {
                    imageUrl: curUrl,
                    localPath: localPath,
                    url: chatGroupMsgContent.url,
                    imageEventId: event.event_id,
                    info: info,
                    body: chatGroupMsgContent.body,
                    sender: (distEvent.sender && distEvent.sender.userId) ? distEvent.sender.userId : distEvent.event.sender,
                    origin_server_ts: distEvent.event.origin_server_ts
                }
            }
            ipcRenderer.send('showImageViewWindow', showImageInfoList, distImageInfo);
        },
        playAudioOfMessage(audioMsgId) {
            this.playingMsgId = audioMsgId;
        },
        // openUserInfoTip(tipInfos) {
        //     console.log("tip inso if ", tipInfos);
        //     this.showUserInfoTips = true;
        // },
        closeInfoTip(e){
            // console.log('ccccccccccc')
            var userInfoTipElement = document.getElementById("userInfoTipId");
            if(userInfoTipElement != null && !userInfoTipElement.contains(e.target) && e.target.className != "msg-info-user-img" && e.target.className != "groupMemberInfoImage" && e.target.className != "groupMemberInfoLabel"){
                this.showUserInfoTips = false;
            }
            var userInfoElement = document.getElementById("userInfoId");
            if(userInfoElement != null && !userInfoElement.contains(e.target) && e.target.className != "msg-info-user-img" && e.target.className != "groupMemberInfoImage" && e.target.className != "groupMemberInfoLabel"){
                this.$emit("closeUserInfoTip");
            }
            var groupInfoElement = document.getElementById("groupInfoTipId");
            if(groupInfoElement != null && !groupInfoElement.contains(e.target) && e.target.className != "chat-tool-more-div" && e.target.className != "chat-tool-more-img" && e.target.className != "groupMemberSearchImage" && e.target.className != "searchMemberCancel") {
                this.showGroupInfoTips = false;
                this.cleanCache = true;
                this.groupInfo = {};
            }
            var chatMemberListElement = document.getElementById("atDlgId");
            if(chatMemberListElement != null && !chatMemberListElement.contains(e.target) && e.target.className != "memberItem"){
                this.chatMemberDlgVisible = false;
                this.chatMemberSearchKey = null;
                this.chatMemberDlgchat = {};
                canNewLine = true;
            }
            
            var msgHistoryMenuElement = document.getElementById("history-dropdown-content-id");
            if(msgHistoryMenuElement != undefined && e.target.className != "chat-input-history" && e.target.className != "el-icon-historys") {
                msgHistoryMenuElement.style.display = "none";
            }

            var secretOptionMenuElement = document.getElementById("secretTypeDropdownContentId");
            if(secretOptionMenuElement != undefined && e.target.className != "secretType" && e.target.className != "secretTypeButton" && e.target.className != "secretGroupDiv") {
                secretOptionMenuElement.style.display = "none";
            }

            // console.log("e.target.classname ", e.target.className)
            if(e.target.className.indexOf('userInfo') == -1 && e.target.id != 'user-info-save'){
                this.showUserInfoTips = false;
            }

            var faceElement = document.getElementById("face-box-id");
            if(faceElement != null && !faceElement.contains(e.target) && e.target.className != "chat-input-expression"){
                this.showFace = false;
            }
        },
        showExpression: function() {
            this.showFace = !this.showFace;
        },
        mxGetMembers: async function() {
            const roomId = this.curChat.roomId;
            const cli = window.mxMatrixClientPeg.matrixClient;
            const xie1 = cli.getRoom(roomId);
            await xie1.loadMembersIfNeeded();
            const mxMembers = [];
            for(let key in xie1.currentState.members) {
                // let isAdmin = xie1.currentState.members[key].powerLevel == 100; 
                let o = xie1.currentState.members[key];
                let obj = {...o, choosen:false}
                if (obj.membership != 'leave' && obj.membership != 'invite') mxMembers.push(obj);
            }
            return mxMembers.length;
        },
        insertFace: function(item) {
            var curIndex = getProperty(this.editor, 'selection.lastRange.index') || 
            getProperty(this.editor, 'selection.savedRange.index', 0) 
            this.editor.insertText(curIndex, uncodeUtf16(item));
            this.editor.setSelection(this.editor.selection.savedRange.index + 2);
            this.showFace = false;
        },
        cleanEditor: function() {
            this.editor.container.getElementsByClassName("ql-editor")[0].innerHTML = "";
        },
        insertPic: function() {
            // File
            if(this.canSelecteFile) {
                this.canSelecteFile = false;
                ipcRenderer.send('open-image-dialog', 'openFile');
            }
            if(!this.ipcPicInited){
                this.ipcPicInited = true;
                ipcRenderer.on('selectedImageItem', this.nHandleFiles);
            }
        },
        insertFiles: function() {
            if(this.canSelecteFile) {
                this.canSelecteFile = false;
                ipcRenderer.send('open-directory-dialog', 'openFile');
            }
            if(!this.ipcInited){
                this.ipcInited = true;
                ipcRenderer.on('selectedItem', this.nHandleFiles);
            }
        },
        nHandleFiles: async function(e, paths) {
            // Select Same File Failed.
            this.canSelecteFile = true;
            var fileList = paths.filePaths;
            // console.log("======", fileList)
            if(fileList === null || fileList.length === 0) {
                // this.$toastMessage({message:'请选择最少一个文件', time: 2000, type:'success'});
                return;
            }
            else if(this.curChat.roomId == undefined) {
                    this.$toastMessage({message:'请选择一个群组', time: 2000, type:'success'});
                    return;
                }
            else {
                this.sendFileInfos = {
                    paths: [],
                    distGroupInfo: undefined
                };
                var varTmp = [];
                for(let i=0;i<fileList.length;i++) {
                    let fileinfo = {};
                    let fileSize = await getFileSizeNum(fileList[i]);
                    fileinfo.path = fileList[i];
                    fileinfo.size = fileSize;
                    fileinfo.name = path.basename(fileList[i])

                    var limitSize = 50 * 1024 *1024;
                    if(global.mxMatrixClientPeg.mediaConfig != null) {
                        limitSize = global.mxMatrixClientPeg.mediaConfig["m.upload.size"] ? global.mxMatrixClientPeg.mediaConfig["m.upload.size"] : (50 * 1024 *1024);
                    }
                    if(fileSize > limitSize) {
                        this.$toastMessage({message:"不支持大于" + limitSize/(1024*1024) + "M的文件发送。", time: 3000, type:'error', showWidth:'340px'});
                        continue
                    }
                    varTmp.push(fileinfo);
                }
                if(true) {
                    this.SendFiles(varTmp);
                }
                else {
                    this.showSendFileDlg = true;
                    this.sendFileInfos = {
                        paths: varTmp,
                        distGroupInfo: this.curChat
                    }
                }
            }
        },
        getDistUidThroughUids: function(uids) {
            if(uids.length > 2) {
                return "";
            }
            else if(uids.length == 1) {
                return uids[0];
            }
            else {
                if(uids[0] == this.curUserInfo.id) {
                    return uids[1];
                }
                else {
                    return uids[0];
                }
            }
        },
        sendAgain: async function(retryMsg) {
            var sendBody = retryMsg.event.content.body;
            try{
                global.mxMatrixClientPeg.matrixClient.sendMessage(this.curChat.roomId, sendBody, retryMsg._txnId)
            }
            catch(error) {
                console.log("error is ", error);
            }
        },
        SendFiles: function(fileinfos) {
            for(let i=0;i<fileinfos.length;i++) {
                this.newSendFile(fileinfos[i]);
            }
            this.closeSendFileDlg();
        },
        newSendFile: async function(fileinfo) {
            var showfileObj = undefined;
            if(!fs.existsSync(fileinfo.path)) {
                showfileObj = this.path2File[fileinfo.path];
            }
            else {
                var showfu = new FileUtil(fileinfo.path);
                showfileObj = showfu.GetUploadfileobj();
            }
            
            let r = null;
            try{
                r = await this.loadImageElement(showfileObj);
            }
            catch(e) {
                console.log("******** ", e);
            }

            const content = {
                body: fileinfo.name || 'Attachment',
                info: {
                    size: showfileObj.size,
                },
                msgtype: "", // set later
            };
            if(r && r.width && r.height) {
                content.info.w = r.width;
                content.info.h = r.height;
            }
            // extend(content.info, showfileObj);
            var reader = new FileReader();
            reader.readAsDataURL(showfileObj);
            reader.onload = () => {
                let type = GetFileType(reader.result);
                // content.info.mimetype = fileinfo.type;
                let fileResult = reader.result;
                let curTimeSeconds = new Date().getTime();
                var eventTmp = {
                    event: {
                        content: content,
                        origin_server_ts: curTimeSeconds,
                        room_id: this.curChat.roomId,
                        sender: this.$store.state.userId,
                        type: "m.room.message",
                        user_id: this.$store.state.userId,
                    },
                    sender: {
                        userId: this.$store.state.userId
                    },
                    _txnId: curTimeSeconds,
                    message_status: 1,
                    path: fileinfo.path,
                    fileObj: showfileObj,
                };

                if(type == 'm.image'){
                    const objectUrl = URL.createObjectURL(showfileObj);
                    eventTmp.event.content.msgtype = "m.image";
                    eventTmp.event.content.url = objectUrl;
                }
                else{
                    eventTmp.event.content.msgtype = "m.file";
                }
                this.$store.commit("saveSendingEvents", eventTmp);
                this.sendingList.push(eventTmp);
                this.messageList.push(eventTmp);
                setTimeout(() => {
                    this.$nextTick(() => {
                        var div = this.getMsgListElement();
                        if(div) {
                            div.scrollTo({ top:div.scrollHeight, behavior: 'smooth' })
                        }
                    })
                }, 100)
            }
        },
        /**
         * Load a file into a newly created image element.
         *
         * @param {File} imageFile The file to load in an image element.
         * @return {Promise} A promise that resolves with the html image element.
         */
        async loadImageElement(imageFile) {
            // Load the file into an html element
            const img = document.createElement("img");
            const objectUrl = URL.createObjectURL(imageFile);
            const imgPromise = new Promise((resolve, reject) => {
                img.onload = function() {
                    URL.revokeObjectURL(objectUrl);
                    resolve(img);
                };
                img.onerror = function(e) {
                    reject(e);
                };
            });
            img.src = objectUrl;
            // const [hidpi] = await Promise.all([parsePromise, imgPromise]);
            const [hidpi] = await Promise.all([imgPromise]);
            const width = hidpi ? (img.width >> 1) : img.width;
            const height = hidpi ? (img.height >> 1) : img.height;
            return {width, height, img};
        },
        SendText: function(sendBody, varcontent){
            const quoteImgMsg = this.getQuoteImgMsg()
            if (quoteImgMsg) {
                sendBody.quote_event = quoteImgMsg
            }

            const quatoTextMsg = this.getQuoteTextMsg()
            if(quatoTextMsg){
                sendBody.quote_event = quatoTextMsg
            }

            this.cleanEditor();
            let curTimeSeconds = new Date().getTime();
            var eventTmp = {
                event: {
                    content: sendBody,
                    origin_server_ts: curTimeSeconds,
                    room_id: this.curChat.roomId,
                    sender: this.$store.state.userId,
                    type: "m.room.message",
                    user_id: this.$store.state.userId,
                },
                sender: {
                    userId: this.$store.state.userId
                },
                _txnId: curTimeSeconds,
                message_status: 1,
            };
            this.$store.commit("saveSendingEvents", eventTmp);
            this.sendingList.push(eventTmp);
            this.messageList.push(eventTmp);
            setTimeout(() => {
                this.$nextTick(() => {
                    var div = this.getMsgListElement();
                    if(div) {
                        div.scrollTo({ top:div.scrollHeight, behavior: 'smooth' })
                    }
                })
            }, 100)
        },

        sendMsg: async function() {
            // console.log("this.curChat is ", this.curChat);
            if(this.curChat.roomId == undefined) {
                alert("请选择一个房间。")
                return;
            }
            let varcontent = this.editor.getContents();
            if(varcontent == null || varcontent.length == 0) {
                // toDo To Deal The \n
                alert("不能发送空白信息。")
                return;
            }
            let sendText = '';
            let sendBody = {
                msgtype: "m.text",
                body: sendText
            }
            for(var i=0;i<varcontent.ops.length;i++){
                // console.log("i is ", i);
                let curMsgItem = varcontent.ops[i].insert;
                
                if(curMsgItem.hasOwnProperty("span")) {
                    if (curMsgItem.span.id !== 'quote-img' && curMsgItem.span.id !== 'quote-text') {    
                        var fileSpan = curMsgItem.span;
                        var pathId = fileSpan.id;
                        var msgInfo = this.idToPath[pathId];
                        var fileType = msgInfo.type;
                        if(fileType == "at") {
                            sendText += ("@" + msgInfo.atName + " ");
                            sendBody.format = "org.matrix.custom.html";
                        }
                    }
                }
                else{
                    curMsgItem = sliceReturnsOfString(curMsgItem);
                    sendText += curMsgItem;
                }
            }
            if(sendText.length != 0)
            {
                sendBody.body = sendText.trim();
                this.SendText(sendBody, varcontent);
            }
        },
        // If message is notice set visible
        showNoticeOrNot: function(curMsg) {
            var showNotice = true;
            if(!curMsg.event.event_id) {
                return false;
            }
            if(curMsg.isState()) {
                return false;
                switch (curMsg.getType()) {
                    case "m.room.canonical_alias":
                        console.log("canonical_alias")
                        showNotice = false;
                        break;
                    case "m.room.third_party_invite":
                        console.log("third_party_invite")
                        showNotice = false;
                        break;
                    case "m.room.history_visibility":
                        showNotice = false;
                    case "m.room.power_levels":
                        showNotice = false;
                    case "m.room.pinned_events":
                        // console.log("pinned_events")
                        break;
                    case "m.room.server_acl":
                        showNotice = false;
                        break;
                    case "m.room.tombstone":
                        showNotice = false;
                        break;
                    case "m.room.join_rules":
                        showNotice = false;
                        break;
                    case "m.room.guest_access":
                        showNotice = false;
                        break;
                    case "m.room.related_groups":
                        showNotice = false;
                        break;
                    case "im.vector.modular.widgets":
                        showNotice = false;
                        break;
                }
            }
            else{
                showNotice = false;
            }
            return showNotice;
        },
        // Notice show difference with message.
        showMessageOrNot: function(curMsg) {  
            if(!curMsg.event.event_id) {
                return true;
            }
            return !curMsg.isState();
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
            //type = 0 
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
            if(!curMsg.event.event_id) {
                return false;
            }
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
        // Show time when time between messages over 1 min
        showTimeOrNot(curMsg, lastMsg) {
            if(lastMsg === undefined) {
                return true;
            }
            
            let cutTime = curMsg.event.origin_server_ts - lastMsg.event.origin_server_ts;

            if(cutTime > 1000 * 1 * 60) {
                return true;
            }
            else {
                return false;
            }
        },
        // Get formate message time
        MsgTime(curMsg) {
            if(curMsg === null) {
                return "";
            }
            var secondsTime = curMsg.event.origin_server_ts;
            return ComponentUtil.formatTimeFilter(secondsTime);
        },
        // Difference in css. Left of Right
        ChatLeftOrRightClassName: function (curMsg) {
            if((curMsg.sender ? curMsg.sender.userId : curMsg.event.sender) === this.userID) {
                return "message-right";
            }
            else {
                return "message-left";
            }
        },
        ChatMessageId: function (curMsg) {
            var _TxnId = null;
            try{
                _TxnId = curMsg._txnId ? curMsg._txnId : curMsg.event.event_id;
            }
            catch(e) {
                console.log("*** get txnid exception ", curMsg);
            }
            return "message-" + _TxnId;
        },
        msgCheckBoxId: function(curMsg) {
            return "message-checkbox-" + curMsg.event.event_id;
        },
        msgCanNotCheck(curMsg) {
            var content = curMsg.getContent();
            if(content.msgtype == "m.audio") {
                return true;
            }
            return false;
        },
        msgSelectOrNotClassName: function(curMsg) {
            //class="msgContent"
            var hasSelected = false;
            for(let i=0;i<this.selectedMsgs.length;i++) {
                if(this.selectedMsgs[i].curMsg.event.event_id == curMsg.event.event_id) {
                    this.selectedMsgs.splice(i, 1);
                    hasSelected = true;
                    break;
                }
            }
            if(hasSelected) {
                return "msgContentActive";
            }
            else {
                return "msgContent";
            }
        },
        groupIsInFavourite(groupInfo) {
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
        groupIsTop(groupInfo) {
            // console.log("groupInfo.status ", groupInfo.status)
            // console.log("groupInfo.status.substring(6, 1) = ", groupInfo.status.substr(6, 1))
            // console.log("groupInfo.status.substring(6, 1) == 1 ", groupInfo.status.substr(6, 1) == 1)
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
        More: async function() {
            console.log('check chat', this.curChat);
            this.groupInfo = {};
            var isGroup = this.curChat.group_type == 101 ? true : false;
            var idsList = []
            // try{
            //     idsList = this.curChat.contain_user_ids.split(",");
            // }
            // catch(error) {
            //     idsList = this.curChat.contain_user_ids;
            // }
            const myUserId = this.curChat.myUserId;
            const members = this.curChat.currentState.members;
            // var isOwner = (this.curChat.owner == this.curUserInfo.id);
            console.log('aaaa', myUserId);
            console.log('bbbb', members);
            console.log('cccc', myUserId);
            console.log('dddd', members[myUserId]);
            const isOwner = members[myUserId].powerLevel === 100; //owner`s powerLevel is 100?
            let ownerId;
            for(let key in members) {
                console.log('1111', key);
                console.log('2222', members);
                console.log('3333', members[key]);
                if (members[key].powerLevel === 100) ownerId = key;
            }
            console.log("this.curChat ", this.curChat);
            // console.log("this.isTop ", this.groupIsTop(this.curChat))
            // console.log("this.isSlience ", this.groupIsSlience(this.curChat))
            // console.log("this.isFav ", this.groupIsInFavourite(this.curChat))
            idsList = Object.keys(this.curChat.currentState.members);
            console.log('isOwner!!!!!!', isOwner);
            const topicEvent = this.curChat.currentState.getStateEvents("m.room.topic", "");
            const topic = topicEvent && topicEvent.getContent() ? topicEvent.getContent()['topic'] : '';

            const nameEvent = this.curChat.currentState.getStateEvents('m.room.name', '');
            const name = nameEvent && nameEvent.getContent() ? nameEvent.getContent()['name'] : '';
            const currentState = this.curChat.currentState.getStateEvents('m.room.power_levels','');
            let canInvite = 50;
            let canKick = 50;
            let canAvatar = 50;
            let canEncryption = 100;
            let canHistory = 100;
            let canServer = 100;
            let canName = 50;
            let canBan = 50;
            if (currentState) {
                let levelObj = currentState.getContent();
                let events = levelObj.events;
                console.log('......levelObj', levelObj);
                console.log('.....enents', events);
                if (levelObj) canBan = levelObj.ban;
                if (events) canName = events['m.room.name'];
                if (events) canServer = events['m.room.server_acl'];
                if (events) canHistory = events['history_visibility'];
                if (events) canEncryption = events['m.room.encryption'];
                if (events) canAvatar = events['m.room.avatar'];
                if (levelObj) canKick = levelObj.kick;
                if (levelObj) canInvite = levelObj.invite;

            }
            const totalLevels = {canInvite, canKick, canAvatar, canEncryption, canHistory, canServer, canName, canBan};
            const userLevel = members[myUserId].powerLevel;
            var groupInfoObj = {
                "memberList": idsList,
                "groupName": name, //this.curChat.group_name,
                "groupTopic": topic,
                "groupAvarar": this.chatIconUrl, //this.curChat.group_avarar,
                "groupNotice": this.curChat.group_notice != undefined ? this.curChat.group_notice : '',
                "groupId": this.curChat.roomId, //this.curChat.group_id,
                "isGroup": true, //isGroup,
                "isOwner": isOwner,
                "isTop": false, //this.groupIsTop(this.curChat),
                "isSlience": false, //this.groupIsSlience(this.curChat),
                "isFav": false, //this.groupIsInFavourite(this.curChat),
                "ownerId": ownerId, //this.curChat.owner,
                "groupType": 100, //this.curChat.group_type,
                "isSecret": false, // (this.curChat.group_type == 102 && this.curChat.key_id != undefined && this.curChat.key_id.length != 0)
                "room": this.curChat,
                "totalLevels": totalLevels,
                "myUserId": myUserId,
                "userLevel": userLevel
            }
            console.log('======weihemeiyou', groupInfoObj)
            this.groupInfo = groupInfoObj;
            // console.log("more more more ", this.curChat.contain_user_ids.split(","))
            // var idsList = this.curChat.contain_user_ids.split(",");
            // this.groupContainUserIds = idsList;
            // console.log("this.curChat.group_name is ", this.curChat.group_name);
            this.showGroupInfoTips = true; //todo tips
            this.cleanCache = false;
            console.log("more more more ", this.groupInfo)
        },
        compareMsg: function(){
            return function(a, b)
            {
                var value1 = a.sequence_id;
                var value2 = b.sequence_id;
                return value2 - value1;
            }
        },
        jumpToEvent: function(eventId, distChat) {
            let div = this.getMsgListElement();
            div.removeEventListener('scroll', this.handleScroll);
            this.existingMsgId = [];
            this.distEventId = eventId;
            var chatElement = document.getElementById("chat-page-id");
            chatElement.style.backgroundColor = "rgba(241, 241, 241, 1)";
            this.$emit("isSearching", false);
            this.isSerach = false;
            this.isJumpPage = true;
            this.messageList = [];
            this.sendingList = this.$store.getters.getSendingEvents(this.curChat.roomId);
            // this.curChat.resetLiveTimeline();
            this.curChat = distChat;
            roomTimeLineHandler.shareInstance().getDistTimeLine(distChat, eventId)
                .then((distEvent) => {
                    this.isRefreshing = false;
                    this.messageList = distEvent;
                    console.log("*** this.messageList is ", this.messageList);
                    setTimeout(() => {
                        this.$nextTick(() => {
                            this.scrollToDistMsg(eventId);
                            let uldiv = this.getMsgListElement();
                            console.log("uldiv.clientHeight ", uldiv.clientHeight, " uldiv.offsetHeight ", uldiv.offsetHeight)
                            if(uldiv.clientHeight < uldiv.offsetHeight) {
                                roomTimeLineHandler.shareInstance().showPageDown(this.curChat.roomId, 10)
                                    .then((ret) => {
                                        for(let i=ret.length - 1;i>0;i--){
                                            this.messageList.push(ret[i]);
                                        }
                                    })
                            }
                            div.addEventListener('scroll', this.handleScroll);
                        })
                    }, 500);
                })
            this.isSecret = global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(distChat.roomId);
            this.existingMsgId = [];
            this.initDraft();
        },
        getTxnIdFromEventId: function(eventId) {
            for(var i=0;i<this.messageList.length;i++) {
                if(this.messageList[i].event.event_id == eventId) {
                    return this.messageList[i]._txnId ? this.messageList[i]._txnId : this.messageList[i].getTxnId();
                }
            }
        },
        scrollToDistMsg: function(eventId) {
            var ulDiv = this.getMsgListElement();
            var distMsgDiv = document.getElementById(this.chatMsgDivId(eventId));
            if(!distMsgDiv) {
                var distTxnId = this.getTxnIdFromEventId(eventId);
                if(!distTxnId) {
                    return;
                }
                distMsgDiv = document.getElementById(this.chatMsgDivId(distTxnId));
            }
            if(ulDiv != undefined && distMsgDiv != undefined) {
                console.log("ths uldiv scrollTop is ", ulDiv.scrollTop);
                console.log("ths uldiv scrollHeight is ", ulDiv.scrollHeight);
                console.log("ths distMsgDiv offsetTop is ", distMsgDiv.offsetTop);
                // ulDiv.scrollTop = distMsgDiv.offsetTop - 80;
                if(ulDiv.scrollTop > distMsgDiv.offsetTop) {
                    console.log("***scroll")
                    ulDiv.scrollTo({top: distMsgDiv.offsetTop - 40, behavior: 'smooth'})
                }
                else {
                    ulDiv.scrollTo({top: ulDiv.scrollTop - 40, behavior: 'smooth'})
                }
                this.flashDistMessage();
            }
        },
        flashDistMessage: function() {
            if(this.distEventId.length != 0) {
                var distMsgDiv = document.getElementById(this.chatMsgDivId(this.distEventId));
                if(!distMsgDiv) {
                    var distTxnId = this.getTxnIdFromEventId(this.distEventId);
                    if(!distTxnId) {
                        return;
                    }
                    distMsgDiv = document.getElementById(this.chatMsgDivId(distTxnId));
                }
                if(distMsgDiv) {
                    distMsgDiv.style.backgroundColor = 'rgba(235, 235, 235, 1)';
                    setTimeout(() => {
                        this.resumeDistMessage();
                    }, 2000)
                }
            }
        },
        resumeDistMessage: function() {
            if(this.distEventId.length != 0) {
                var distMsgDiv = document.getElementById(this.chatMsgDivId(this.distEventId));
                if(!distMsgDiv) {
                    var distTxnId = this.getTxnIdFromEventId(this.distEventId);
                    if(!distTxnId) {
                        return;
                    }
                    distMsgDiv = document.getElementById(this.chatMsgDivId(distTxnId));
                }
                if(distMsgDiv) {
                    distMsgDiv.style.backgroundColor = 'rgba(255, 255, 255, 0';
                    this.distEventId = "";
                }
            }
        },

        IsBottom: function(){
            let uldiv = this.getMsgListElement();
            let client = document.getElementById("message-show");
            // console.log("======IsBottom uldiv.scrollHeight - uldiv.scrollTop - client.clientHeight ", uldiv.scrollHeight - uldiv.scrollTop - client.clientHeight)
            if(uldiv && client && Math.abs(uldiv.scrollHeight - uldiv.scrollTop - client.clientHeight) < 150)
                return true;
            return false;
        },

        SetToBottom: function(){
            let div = this.getMsgListElement();
            if(div) {
                this.$nextTick(() => {
                    div.scrollTo({ top:div.scrollHeight, behavior: 'smooth' });
                })
            }
        },
        handleScroll: function(toBottom=false) {
            let uldiv = this.getMsgListElement();
            if(!uldiv)
                return;
            let client = document.getElementById("message-show");
            // console.log("=====client.clientHeight is ", client.clientHeight);
            // console.log("=====uldiv.scrollHeight - uldiv.scrollTop is ", uldiv.scrollHeight - uldiv.scrollTop);
            // console.log("=====uldiv.scrollHeight is ", uldiv.scrollHeight);
            // console.log("=====uldiv.scrollTop is ", uldiv.scrollTop);
            // console.log("=====isRefreshing is ", this.isRefreshing);
        
            if(this.IsBottom()) {
                this.haveNewMsg = false;
            }
            if(uldiv.scrollTop == 0){
                console.log("to update msg")
                var curTime = new Date().getTime();
                if(!roomTimeLineHandler.shareInstance().canLoadMore(this.curChat.roomId, "b")) {
                    this.isRefreshing = false;
                    return;
                }
                // console.log("curTime - this.lastRefreshTime ", curTime - this.lastRefreshTime)
                if(curTime - this.lastRefreshTime > 0.5 * 1000 && !this.isRefreshing){
                    this.isScroll = true;
                    this.lastScrollHeight = uldiv.scrollHeight;
                    this.isRefreshing = true;
                    this.lastRefreshTime = new Date().getTime();
                    let curNum = this.messageList.length;
                    roomTimeLineHandler.shareInstance().showPageUp(this.curChat.roomId, 10)
                        .then((ret) => {
                            console.log("++++++++++ ", ret);
                            
                            for(let i=ret.length - 1;i>0;i--){
                                this.messageList.unshift(ret[i]);
                            }
                            
                            // this.messageList = ret.concat(this.sendingList);
                            setTimeout(() => {
                                this.$nextTick(() => {
                                    console.log("---------update croll top is ", uldiv.scrollHeight);
                                    console.log("*** toBottom is ", toBottom)
                                    if(toBottom === true) {
                                        uldiv.scrollTop = uldiv.scrollHeight + 52;
                                        this.isRefreshing = false;
                                    }
                                    else {
                                        uldiv.scrollTop = uldiv.scrollHeight - this.lastScrollHeight;
                                        this.isRefreshing = false;
                                    }
                                    this.isScroll = false;
                                })
                            }, 0);
                        })
                    }
            }
            else if(uldiv.scrollHeight - uldiv.scrollTop < client.clientHeight) {
                console.log("=======wo bottom");
                var curTime = new Date().getTime();
                if(!roomTimeLineHandler.shareInstance().canLoadMore(this.curChat.roomId, "f")) {
                    this.isRefreshing = false;
                    return;
                }
                if(curTime - this.lastRefreshTime > 0.5 * 1000 && !this.isRefreshing) {
                    this.isScroll = true;
                    this.lastScrollTop = uldiv.scrollTop;
                    console.log("---------update uldiv.scrollTop is ", uldiv.scrollTop);
                    this.lastRefreshTime = new Date().getTime();
                    let curNum = this.messageList.length;
                    roomTimeLineHandler.shareInstance().showPageDown(this.curChat.roomId, 10)
                        .then((ret) => {
                            for(let i=ret.length - 1;i>0;i--){
                                this.messageList.push(ret[i]);
                            }
                            this.isRefreshing = false;
                            setTimeout(() => {
                                this.$nextTick(() => {
                                    // console.log("---------update croll top is ", uldiv.scrollHeight);
                                    uldiv.scrollTop = this.lastScrollTop;
                                    this.isScroll = false;
                                    // console.log("---------update uldiv.scrollTop is ", uldiv.scrollTop);
                                    // uldiv.scrollTop = uldiv.scrollHeight - this.lastScrollHeight - 30;
                                })
                            }, 0)
                            this.needToBottom = false;
                        })
                }
            }
            
        },
        updateChatGroupStatus(roomId, groupStatus) {
            if(groupStatus == MUTE) {
                this.isMute = true;
            }
            else {
                this.isMute = false;
            }
            console.log("======== groupStatus ", groupStatus);
            this.$emit("updateChatGroupStatus", roomId, groupStatus);
            // this.groupIsSlience();
        },
        leaveGroup(roomId) {
            this.$emit("leaveGroup", roomId);
        },
        updateMsgFile(e, localPath, eventId, needOpen) {
            console.log("updateMsgfile ", localPath, eventId);
            var myPackage = [localPath, eventId, needOpen];
            this.updateMsg = myPackage;
        },
        setFocuse(e) {
            if(this.editor == undefined) {
                this.editor = this.$refs.chatQuillEditor.quill;
            }
            this.editor.setSelection(this.editor.selection.savedRange.index);
            this.showFace = false;
        },
        closeSendFileDlg() {
            this.showSendFileDlg = false;
            this.sendFileInfos = {
                paths: [],
                distGroupInfo: undefined
            };
        },
        async dealDrop(e) {
            console.log("------ ", this.$route.name)
            e.preventDefault();
            if(this.$route.name != "ChatContent" || this.isSerach || this.isFileList) {
                return;
            }
            if(this.curChat.roomId == undefined) {
                this.$toastMessage({message:'请选择一个房间', time: 2000, type:'success'});
                return;
            }

            this.sendFileInfos = {
                paths: [],
                distGroupInfo: undefined
            };
            var varTmp = [];

            var files = e.dataTransfer.files;
            for(let i=0;i<files.length;i++) {
                let fileinfo = {};
                fileinfo.path = files[i].path;
                fileinfo.size = files[i].size;
                fileinfo.name = files[i].name;
                
                var limitSize = 50 * 1024 * 1024;
                if(global.mxMatrixClientPeg.mediaConfig != null) {
                    limitSize = global.mxMatrixClientPeg.mediaConfig["m.upload.size"] ? global.mxMatrixClientPeg.mediaConfig["m.upload.size"] : (50 * 1024 *1024);
                }
                if(files[i].size > limitSize) {
                    this.$toastMessage({message:"不支持大于" + limitSize/(1024*1024) + "M的文件发送。", time: 3000, type:'error', showWidth:'340px'});
                    continue
                }
                
                varTmp.push(fileinfo);
            }
            
            console.log("files is ", files);
            if(files.length == 0)
                return;
            if(true) {
                this.SendFiles(varTmp);
            }
            else{
                this.showSendFileDlg = true;
                this.sendFileInfos = {
                    distGroupInfo: this.curChat,
                    paths: varTmp
                }
            }
        },
        checkClipboard(e) {
            //const strBuffer = clipboard.readRTF()
            //console.log(strBuffer)
            console.log("e is ", e.clipboardData);
            if ( !(e.clipboardData && e.clipboardData.items) ) {
                console.log("HAHHHAHHAHHA")
                return ;
            }
            if(this.$route.name != "ChatContent" || this.isSerach || this.isFileList) {
                return;
            }
            for(let i=0;i<e.clipboardData.items.length; i++) {
                var item = e.clipboardData.items[i];
                if(item.kind == "string") {
                    console.log("tmd is zifuchuan ");
                }
                else {
                    this.sendFileInfos = {
                        paths: [],
                        distGroupInfo: undefined
                    };
                    var blod = item.getAsFile();
                    var fileObj = new window.File([blod], blod.name, {type: blod.type});
                    let fileinfo = {};
                    console.log("((( the fileInfo is ", fileObj);
                    fileinfo.path = URL.createObjectURL(fileObj);
                    fileinfo.size = blod.size;
                    fileinfo.name = blod.name;
                    this.path2File[fileinfo.path] = blod;
                    if(false) {
                        this.SendFiles([fileinfo]);
                    }
                    else {
                        this.showSendFileDlg = true;
                        this.sendFileInfos = {
                            distGroupInfo: this.curChat,
                            paths: [fileinfo]
                        }
                    }
                }
            }
        },
        getMsgListElement: function() {
            if(!this.msgListDivElement) this.msgListDivElement = document.getElementById("message-show-list");
            return this.msgListDivElement;
        },
        setShowSearch: function() {
            this.isSerach = true;
        },
        initPage: function() {
            this.CloseFileListPage();
            this.multiToolsClose();
            this.updateGroupIcon();
            this.updateGroupName();
        },
        updateGroupIcon: function() {
            if(!this.groupIconElement) {
                this.groupIconElement = document.getElementById("chat-group-img");
                if(!this.groupIcoElement) return;
            }

            console.log("=================distUrl ", this.chatIconUrl);
            if(!this.chatIconUrl || this.chatIconUrl == '') {
                if(this.isDm)
                    this.chatIconUrl = "./static/Img/User/user-40px@2x.png";
                else
                    this.chatIconUrl = "./static/Img/User/group-40px@2x.png";
            }
            if(this.chatIconUrl) {
              this.groupIconElement.setAttribute("src", this.chatIconUrl);
            }
        },
        updateGroupName: function() {
            if(!this.groupContentNumElement) {
                this.groupContentNumElement = document.getElementById("chat-group-content-num");
                if(!this.groupContentNumElement) return;
            }
            if(this.isDm) {
                this.groupContentNumElement.innerHTML = "";
            }
            else {
                this.mxGetMembers()
                    .then((totalMemberCount) => {
                        this.groupContentNumElement.innerHTML = " (" + totalMemberCount + ")";
                    })
            }
        },
        initDraft: function() {
            if(!this.editor) {
                this.editor = this.$refs.chatQuillEditor.quill;
            }
            var content = this.$store.getters.getDraft(this.curChat.roomId);
            this.editor.setContents(content);
            this.editor.setSelection(this.content.length + 1);
        },
        initData: function() {
            if(global.mxMatrixClientPeg.DMCheck(this.curChat)) {
                this.isDm = true;
            }
            else{
                this.isDm = false;
            }
            this.newMsgNum = 0;
            this.inviterInfo = undefined;
            this.isInvite = false;
            this.initSearchKey = '';
            this.haveNewMsg = false;
            this.isJumpPage = false;
            this.curGroupId = this.curChat.roomId;
            this.isSecret = global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(this.curChat.roomId);
            this.chatIconUrl = global.mxMatrixClientPeg.getRoomAvatar(this.curChat);
            this.dmUserId = global.mxMatrixClientPeg.getDMMemberId(this.curChat);
            if(!global.mxMatrixClientPeg.mediaConfig) {
                global.mxMatrixClientPeg.ensureMediaConfigFetched();
            }
            this.needToBottom = false;
            this.existingMsgId = [];
        },
        initMessage: function() {
            this.messageList = [];
            roomTimeLineHandler.shareInstance().getRoomShowTimeline(this.curChat)
                .then((messageList) => {
                    console.log("==========", messageList);
                    if(!messageList) return;
                    for(let i=messageList.length - 1;i>0;i--){
                        this.messageList.unshift(messageList[i]);
                        setTimeout(() => {
                            this.$nextTick(() => {
                                let div = this.getMsgListElement();
                                if(div) {
                                    div.scrollTop = div.scrollHeight;
                                }
                            })
                        }, 90)
                    }
                })
        }
    },
    data() {
        return {
            dmUserId: undefined,
            groupIconElement: undefined,
            groupContentNumElement: undefined,
            msgListDivElement: undefined,
            newMsgNum: 0,
            haveNewMsg: false,
            sendingList: [],
            isMute: false,
            transmitNeedAlert: false,
            curOperate: "",
            imgTimeLineSet: undefined,
            _imgTimelineWindow: undefined,
            alertContnets: {},
            showAlertDlg: false,
            contentType: '',
            curChat: {},
            imageViewerImageInfo: {},
            transmitImageViewer: false,
            options: {
                filter (image) {
                    if(image.className == "msg-image") {
                        return image;
                    }
                }
            },
            isScroll: false,
            toSelect: false,
            ulElement: undefined,
            curSelectedIndex: 0,
            path2File: {},
            distEventId: '',
            timeLineSet: undefined,
            isJumpPage: false,
            HistorySearchRoomId: '',
            FilelistSearchRoomId: '',
            isSerach: false,
            isFileList: false,
            isInvite: false,
            inviterInfo: undefined,
            content: '',
            isSecret: false,
            canSelecteFile: true,
            isGroup: true,
            updatemsgStatus: {
                "id": ""
            },
            updateMsgContent: {
                "id": "",
            },
            needToBottom: false,
            isOwn: false,
            createNewChat: false,
            addMemberGroupType: 101,
            userInfo: {},
            userInfoPosition: {},
            userInfoTipKey: 1,
            chatCreaterDialogTitle: '',
            showChatCreaterDlg: false,
            showSendFileDlg: false,
            sendFileInfos: {},
            chatCreaterDialogRootDepartments:[],
            chatCreaterKey:99,
            lastScrollHeight: 0,
            fileListGroupInfo: {},
            showFileListInfo: false,
            messageListElement: null,
            checkClassName: ["emojiDiv", "emoji", "chat-msg-content-mine-linkify", "chat-msg-content-others-linkify", "linkify", "msg-info-user-img-with-name", "file-info", "msg-link-txt", "msg-link-url", "chat-msg-content-others-txt", "transmit-title", "transmit-content", "chat-msg-content-mine-transmit", "chat-msg-content-others-voice", "chat-msg-content-mine-voice", "chat-msg-content-others-txt-div", "chat-msg-content-mine-txt-div", "chat-msg-content-mine-txt", "msg-image", "chat-msg-content-others-file", "chat-msg-content-mine-file", "file-name", "file-image", "voice-info", "file-size", "voice-image"],
            groupCreaterTitle: '发起群聊',
            updateUser: 1,
            updateMsg: {},
            menu: null,
            cleanCache: false,
            playingMsgId: '',
            multiSelect: false,
            dialogVisible: false,
            chatMemberDlgVisible: false,
            chatMemberSearchKey: null,
            canCheckChatMemberSearch: false,
            curInputIndex: 0,
            curContent: '',
            cursorPosition: {},
            chatMemberDlgchat: {},
            ownerTransferchat: {},
            chatCreaterDisableUsers: [],
            groupInfo: {},
            groupContainUserIds: [],
            ipcInited: false,
            ipcPicInited: false,
            showGroupInfoTips: false,
            showTransmitDlg: false,
            transmitKey:199,
            transmitTogether: false,
            transmitMergeInfo: {},
            selectedMsgs: [],
            editor:null,
            messageList: [],
            curGroupId: '',
            editorOption : {
                placeholder: "",
                theme:'bubble',
                modules: {
                    toolbar: false,
                     clipboard: {
                        matchers: [[Node.ELEMENT_NODE, this.handleCustomMatcher]],
                    },
                    // imageDrop: true,
                    // resizeImage: true,
                    keyboard: {
                        bindings: {
                            linebreak: {
                                key: 13,
                                ctrlKey: false,
                                handler: function (range) {
                                    isEnter = true;
                                    if(canNewLine) {
                                        return false;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                            },
                            up: {
                                key: 38,
                                ctrlKey: false,
                                handler: function (range) {
                                    return false;
                                }
                            },
                            down: {
                                key: 40,
                                ctrlKey: false,
                                handler: function (range) {
                                    return false;
                                }
                            },
                            indent: {
                                key: 9,
                                ctrlKey: false,
                                handler: function (range) {
                                    return true;
                                }
                            },
                            'list autofill': {
                                key: 32,
                                ctrlKey: false,
                                handler: function (range) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            },
            showFace: false,
            lastRefreshTime: 0,
            // When watch finished set isRefreshing to false
            isRefreshing: true,
            showUserInfoTips: false,
            tipInfos: {},
            existingMsgId: [],
            idToPath: {},
            constStyle: 'display:inline-block;outline:none;border-radius: 2px;border: 1px solid rgb(218,218,221);height: 46px;background-repeat: no-repeat;background-position:center left;background-image: url();background-size: auto 90%;line-height: 46px;',
            imgConstStyle: 'display:inline-block;outline:none;border: 0px;width: ;height: 46px;background-repeat: no-repeat;background-position:center left;background-image: url();background-size: auto 90%;line-height: 46px;text-indent:50px;',
            atConstStyle: 'display:inline-block;outline:none;border: 0px;width: ;font-size:14px;font-family:PingFangSC-Regular',
            //matrix data
            matrixClient: undefined,
            mxRoomDlg: false,
            mxChat: false,
            mxChatTopic: false,
            services: null,
            mxSelectMemberOpen: false,
            isDm: false,
            initSearchKey: '',
        }
    },
    destroyed: function() {
        if(this.msgListDivElement) this.msgListDivElement.removeEventListener('scroll', this.handleScroll);
    },
    mounted: function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        setTimeout(() => {
            this.$nextTick(() => {
                this.groupIconElement = document.getElementById("chat-group-img");
                // var groupStateElement = document.getElementById("chat-group-state");
                this.groupContentNumElement = document.getElementById("chat-group-content-num");
                this.msgListDivElement = document.getElementById("message-show-list");
                this.msgListDivElement.addEventListener('scroll', this.handleScroll);
                // console.log("==============ipc on")
                ipcRenderer.on('SAVED_FILE', this.updateMsgFile);
                ipcRenderer.on('transmitFromSoloDlg', this.transmitFromSoloDlg);
                ipcRenderer.on('setFocuse', this.setFocuse);
                ipcRenderer.on('checkClipBoard', this.checkClipboard);
                ipcRenderer.on('toFavImageViewer', this.imageViewerFav);
                ipcRenderer.on('toTransmitImageViewer', this.imageViewerTransmit);
                this.editor = this.$refs.chatQuillEditor.quill;
                console.log(this.$refs.chatQuillEditor);
                this.$refs.chatQuillEditor.$el.style.height='150px';
                // this.$refs.chatQuillEditor
                // this.dropWrapper = document.getElementById('chat-main');
                // this.dropWrapper.addEventListener('drop', this.dealDrop);
                const editorEle = this.editor.container.getElementsByClassName("ql-editor")[0]
                editorEle && editorEle.addEventListener('contextmenu', () => {
                    openRemoteMenu('copy', 'cut', 'paste')
                })
                this.newMsgNum = 0;
            })
        }, 0)
        document.addEventListener('click',this.closeInfoTip);
        document.addEventListener('paste', this.checkClipboard);
        document.addEventListener('drop', this.dealDrop);
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    },
    created: async function() {
        this.loginInfo = undefined;
        this.curUserInfo = undefined;
        this.userID = window.localStorage.getItem("mx_user_id");
        this.matrixClient = window.mxMatrixClientPeg.matrixClient;
        this.services = global.services.common;
    },
    computed: {
        messageListShow: {
            get: function() {
                // var final = this.messageList;//.sort(this.mxEvCompare());
                // console.log("final msglist is ", final);
                return this.messageList;
            }
        }
    },
    props: {
        chat: {
            type: Object,
            default: null
        },
        newMsg: {
            type: Object,
            default: null
        },
        toBottom: {
            type: Boolean,
            default: false
        },
        searchKeyFromList: {
            type: String,
            default: ''
        },
        searchChat: {
            type: Object,
            default: null
        },
        updateImg: {
            type: Number,
            default: 0
        },
        updateRoomStata: {
            type: Number,
            default: 0
        }
    },
    // props: ['chat', 'newMsg', 'toBottom', 'searchKeyFromList', 'searchChat', 'updateImg', 'updateRoomStata'],
    watch: {
        updateRoomStata: function() {
            this.groupIsSlience();
        },
        updateImg: function() {
            this.updateUser++;
        },
        chat: function() {
            if(!this.chat || (this.chat && !this.chat.roomId)) {
                return;
            }
            this.curChat = this.chat;
            console.log("***1 chat")
            console.log("chat ============", this.chat);
            if(!global.mxMatrixClientPeg.mediaConfig) {
                global.mxMatrixClientPeg.ensureMediaConfigFetched();
            }
            this.initDraft();
            this.initData();
            this.initPage();
            this.initMessage();

            this.groupIsSlience();
            setTimeout(() => {
                this.$nextTick(() => {
                    let div = document.getElementById("message-show-list");
                    if(div) {
                        div.scrollTop = div.scrollHeight;
                        // setTimeout(() => {
                        //     this.initMessage();
                        // }, 500)
                    }
                })
            }, 90)
            
        },
        searchKeyFromList: function() {
            if(this.searchKeyFromList != '') {
                console.log("***1 searchKeyFromList")
                
                this.initSearchKey = this.searchKeyFromList;
                this.showHistoryMsgList();
            }
        },
        searchChat: function() {
            if(this.searchKeyFromList != '') {
                this.initSearchKey = this.searchKeyFromList;
                this.showHistoryMsgList();
            }
            else {
                this.initDraft();
                this.initData();
                this.initPage();
                this.initMessage();
            }
        },
        toBottom: function() {
            console.log("***** this.toBottom is ", this.curChat)
            if(!this.curChat || (this.curChat && !this.curChat.roomId)) {
                return;
            }
            if(this.toBottom == true) {
                let div = this.getMsgListElement();
                if(div) {
                    this.$nextTick(() => {
                        div.scrollTop = div.scrollHeight;
                    })
                }
                if(this.editor == undefined) {
                    this.editor = this.$refs.chatQuillEditor.quill;
                }
                this.editor.setSelection(this.editor.selection.savedRange.index);
            }
                
            this.initData();
            this.initPage();
            this.initMessage();
            this.updateUser++;
        },
        newMsg: async function() {
            console.log("*** newMsg ", this.newMsg)
            if(this.newMsg == null) {
                return;
            }
            if(this.newMsg.event.room_id != this.curChat.roomId) return;
            
            if(((this.newMsg.sender ? this.newMsg.sender.userId : this.newMsg.event.sender) != this.$store.state.userId) || !this.newMsg._txnId) {
                this.messageList.push(this.newMsg);
            }
            let toBottom = false;

            if(this.IsBottom()) {
                console.log("======IsBottom========")
                toBottom = true;
            }
            else {
            }
            setTimeout(() => {
                this.$nextTick(() => {
                    var div = this.getMsgListElement();
                    if(toBottom) {
                        if(div) {
                            div.scrollTo({ top:div.scrollHeight, behavior: 'smooth' })
                        }
                    }
                    else{
                        if(((this.newMsg.sender ? this.newMsg.sender.userId : this.newMsg.event.sender) != this.$store.state.userId) && 
                            (['m.room.message', 'm.room.encrypted', 'm.call.hangup'].indexOf((this.newMsg.event && this.newMsg.event.type) ? this.newMsg.event.type : this.newMsg.getType()) >= 0)) {
                            this.newMsgNum += 1;
                            this.haveNewMsg = true;
                        }
                    }
                    // div.addEventListener('scroll', this.handleScroll);
                })
            }, 100)
        }
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar-track-piece {
        background-color: #f1f1f1;
        border-radius: 10px;
    }

    ::-webkit-scrollbar {
        width: 7px;
        height: 12px;
    }

    ::-webkit-scrollbar-thumb {
        height: 50px;
        background-color: #C1C1C1;
        border-radius: 10px;
        outline: none;
    }

    ::-webkit-scrollbar-thumb:hover {
        height: 50px;
        background-color: #A8A8A8;
        border-radius: 10px;
    }
    
    // .complex {
    //     display: inline-block;
    //     border-radius: 5px;
    //     border: 1px solid rgb(218,218,221);
    //     width: 200px;
    //     height: 46px;
    //     background-repeat: no-repeat;
    //     background-image: url("/static/Img/Chat/doc@2x.png");
    //     background-size: contain;
    //     line-height: 46px;
    // }
    
    .chat-page {
        width: 100%;
        height: 100%;
        background: rgba(241, 241, 241, 1);
    }

    .chat-title {
        display: float;
        width: 100%;
        height: 32px;
        background: rgba(241, 241, 241, 1);
        border-bottom: 0px solid rgba(221, 221, 221, 1);
        margin-bottom: 9px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .encrypt-chat-img {
        height: 20px;
        width: 20px;
        margin:6px 0px 6px 0px;
        float: left;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .chat-name {
        height: 32px;
        max-width: 250px;
        line-height: 32px;
        margin:0px 0px 0px 0px;
        float: left;
        font-size: 14px;
        font-family: 'PingFangSC-Medium';
        font-weight: 500;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        letter-spacing: 0px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .chatInfo{
        margin:0;
        float: left;
        height: 100%;
        width: calc(100% - 250px);
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .chat-img {
        margin:0px 8px 0px 16px;
        height: 32px;
        width: 32px;
        float: left;
        border: 0px solid rgba(0, 0, 0, 0);
        border-radius: 50%;
        object-fit:cover;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }
    
    .chat-name-state {
        height: 32px;
        line-height: 32px;
        margin:0px 0px 0px 8px;
        max-width: 100px;
        float: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 12px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        color: rgba(153, 153, 153, 1);
        letter-spacing: 0px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .chat-group-content-num {
        height: 32px;
        max-width: 150px;
        line-height: 32px;
        margin:0px 0px 0px 0px;
        float: left;
        font-size: 14px;
        font-family: 'PingFangSC-Medium';
        font-weight: 500;
        overflow: hidden;
        letter-spacing: 0px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .chat-state-img {
        width: 16px;
        height: 16px;
        margin: 8px 4px 8px 4px;
        display: inline-block;
    }

    .chat-tools {
        margin:0;
        float: right;
        height: 100%;
        width: 200px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .chat-tool-more-div {
        display: inline-block;
        float: right;
        width: 24px;
        height: 24px;
        line-height: 100%;
        margin: 4px 16px 0px 6px;
        background-image: url("../../../static/Img/Chat/chat-set@2x.png");
        background-size: contain;
    }

    .chat-tool-more-div:hover {
        display: inline-block;
        float: right;
        width: 24px;
        height: 24px;
        line-height: 100%;
        margin: 4px 16px 0px 6px;
        background-image: url("../../../static/Img/Chat/chat-set@2x-hover.png");
        background-size: contain;
    }

    .chat-tool-more-img {
        width: 24px;
        height: 24px;
        margin: 4px 0px 4px 0px;
        padding: 0px;
    }

    .chat-tool-invite-div {
        display: inline-block;
        float: right;
        width: 24px;
        height: 24px;
        line-height: 100%;
        margin: 4px 6px 0px 6px;
        background-image: url("../../../static/Img/Chat/addMember@2x.png");
        background-size: contain;
    }

    .chat-tool-invite-div:hover {
        display: inline-block;
        float: right;
        width: 24px;
        height: 24px;
        line-height: 100%;
        margin: 4px 6px 0px 6px;
        background-image: url("../../../static/Img/Chat/addMember@2x-hover.png");
        background-size: contain;
    }

    .chat-tool-invite-img {
        width: 24px;
        height: 24px;
        margin: 4px 0px 4px 0px;
        padding: 0px;
    }

    .chat-tool-call {
        display: inline-block;
        float: right;
        width: 40px;
        line-height: 100%;
        padding: 12px 0px 22px 0px;
        margin: 0px;
    }

    .mxHistoryPage {
        display: block;
        width: 100%;
        height: 100%;
        font-size: 18px;
        margin-top: 0px;
    }

    .mxFilePage {
        display: block;
        width: 100%;
        height: 100%;
        font-size: 18px;
        margin-top: 0px;
    }

    .chat-main {
        display: block;
        width: 100%;
        height: calc(100% - 60px);
        font-size: 18px;
        margin-top: 0px;
    }

    .chat-main-message {
        width: 100%;
        height: calc(100% - 150px);
        border-top: 1px solid rgb(238, 238, 238);
        display: flex;
        flex-direction: column;
        list-style: none;
        overflow-y: hidden;
        overflow-x: hidden;
    }
    
    .msg-list {
        min-height: 99%;
        background: rgba(241, 241, 241, 1);
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        list-style: none;
        // height: 100%;
        overflow-y: hidden;
        overflow-x: hidden;
        border-bottom: 1px solid rgba(221, 221, 221, 1);
        border-top: 1px solid rgba(221, 221, 221, 1);
        li {
            list-style-type: none;
        }
    }

    
    .msg-list:hover {
        min-height: 99%;
        background: rgba(241, 241, 241, 1);
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        list-style: none;
        // height: 100%;
        overflow-y: overlay;
        overflow-x: hidden;
        border-bottom: 1px solid rgba(221, 221, 221, 1);
        border-top: 1px solid rgba(221, 221, 221, 1);
        li {
            list-style-type: none;
        }
    }

    .msg-list-enter-active, .msg-list-leave-active {
        transition: all .05s;
    }

    .msg-list-enter, .msg-list-leave-to {
        opacity: 0;
        transform: translateX(0px);
    }

    .msg-loading {
        width: 100%;
        margin: 5px 0 5px 0;
        text-align: center;
    }
    .msg-info {
        width: 100%;
        margin: 5px 0 5px 0;
    }

    .msg-info-time {
        width: 100%;
        text-align: center;
        font-size: 12px;
        font-family: 'PingFangSC-Regular';
        color: rgba(187, 187, 187, 1);
        margin: 5px 10px 5px 10px;
        font-weight:400;
    }

    .chat-notice {
        width: 100%;
        text-align: center;
        font-size: 12px;
        font-family: 'PingFangSC-Regular';
        color: rgba(153, 153, 153, 1);
        margin: 10px 10px 10px 10px;
        letter-spacing: 0px;
    }

    .message-right {
        width: 100%;
        float:right;
        margin-top: 8px;
        margin-bottom: 8px;
    }

    .message-left {
        width: 100%;
        float: left;
        margin-top: 8px;
        margin-bottom: 8px;
    }

    .msgContent {
        width: 100%;
        height: auto;
    }

    .msgContentActive {
        width: 100%;
        background: rgba(221, 221, 221, 1);
    }

    .multiSelectCheckbox {
        display: inline-block;
	    position:relative;
        width: 20px;
        height: 20px;
        background-color: rgba(255, 255, 255, 1);
        border: 1px solid rgb(221,221,221);
        border-radius: 50%;
        font-size: 10px;
        margin-top: 6px;
        margin-bottom: 14px;
        vertical-align:top;
        cursor: pointer;
        -webkit-appearance:none;
        -webkit-user-select:none;
        user-select:none;
        -webkit-transition:background-color ease 0.1s;
        transition:background-color ease 0.1s;
        float: left;
        outline: none;
    }

    .multiSelectCheckbox:checked {
        background-color: rgb(36, 179, 107);
        cursor: pointer;
        outline: none;
    }

    .multiSelectCheckbox:disabled {
        background-color: rgba(36, 179, 107, 0.5);
        cursor: pointer;
        outline: none;
    }

    .multiSelectCheckbox:checked::after {
        content:'';
        top:3px;
        left:3px;
        font-size: 10px;
        position: absolute;
        background:transparent;
        border:#fff solid 2px;
        border-top:none;
        border-right:none;
        height:6px;
        width:10px;
        -moz-transform:rotate(-45deg);
        -ms-transform:rotate(-45deg);
        -webkit-transform:rotate(-45deg);
        transform:rotate(-45deg);
        outline: none;
    }

    .multiSelectTools {
        width: 100%;
        height: 170px;
        font-family: 'PingFangSC-Regular';
        color: rgba(153, 153, 153, 1);
        letter-spacing: 0px;
        font-size: 12px;
    }

    .multiSelectToolsDiv {
        margin: 0 auto;
        width: 100%;
        text-align: center;
        display: inline-block;

    }

    .chat-input {
        width: 100%;
        height: 170px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        font-size: 14px;
        letter-spacing: 0px;
    }

    .multiSelectTransmitDiv {
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 20px;
        margin-right: 27px;
        display: inline-block;
    }

    .multiSelectTransmit {
        width: 44px;
        height: 44px;
        margin-bottom: 8px;
        margin-left: 8px;
        margin-right: 8px;
        background-image: url("../../../static/Img/Chat/transmit-44px@2x.png");
        background-size: contain;
    }

    .multiSelectTransmit:hover {
        width: 44px;
        height: 44px;
        margin-bottom: 8px;
        margin-left: 8px;
        margin-right: 8px;
        background-image: url("../../../static/Img/Chat/transmit-hover-44px@2x.png");
        background-size: contain;
    }

    .multiSelectTransmitText {
        width: 60px;
        text-align: center;
    }

    .multiSelectTransmitTogetherDiv {
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 27px;
        margin-right: 27px;
        display: inline-block;
    }

    .multiSelectTransmitTogether {
        width: 44px;
        height: 44px;
        margin-bottom: 8px;
        margin-left: 8px;
        margin-right: 8px;
        background-image: url("../../../static/Img/Chat/transmitTogether-44px@2x.png");
        background-size: contain;
    }

    .multiSelectTransmitTogether:hover {
        width: 44px;
        height: 44px;
        margin-bottom: 8px;
        margin-left: 8px;
        margin-right: 8px;
        background-image: url("../../../static/Img/Chat/transmitTogether-hover-44px@2x.png");
        background-size: contain;
    }

    .multiSelectTransmitTogetherText {
        width: 60px;
        text-align: center;
    }

    .multiSelectFavDiv {
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 27px;
        margin-right: 27px;
        display: inline-block;
    }

    .multiSelectFav {
        width: 44px;
        height: 44px;
        margin-bottom: 8px;
        margin-left: 8px;
        margin-right: 8px;
        display: block;
        background-image: url("../../../static/Img/Chat/favourite-44px@2x.png");
        background-size: contain;
    }

    .multiSelectFav:hover {
        width: 44px;
        height: 44px;
        margin-bottom: 8px;
        margin-left: 8px;
        margin-right: 8px;
        display: block;
        background-image: url("../../../static/Img/Chat/favourite-hover-44px@2x.png");
        background-size: contain;
    }

    .multiSelectFavText {
        width: 60px;
        text-align: center;
    }

    .multiSelectDelDiv {
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 27px;
        margin-right: 27px;
        display: inline-block;
    }

    .multiSelectDel {
        width: 44px;
        height: 44px;
        margin-bottom: 8px;
        margin-left: 8px;
        margin-right: 8px;
        background-image: url("../../../static/Img/Chat/delete-44px@2x.png");
        background-size: contain;
    }

    .multiSelectDel:hover {
        width: 44px;
        height: 44px;
        margin-bottom: 8px;
        margin-left: 8px;
        margin-right: 8px;
        background-image: url("../../../static/Img/Chat/delete-hover-44px@2x.png");
        background-size: contain;
    }

    .multiSelectDelText {
        width: 60px;
        text-align: center;
    }

    .multiSelectToolCloseDiv {
        width: 24px;
        height: 24px;
        margin-top: 70px;
        margin-bottom: 70px;
        margin-left: 40px;
        margin-right: 40px;
        display: inline-block;
        position: fixed;
        right: 0px;
        bottom: 4px;
    }

    .multiSelectToolClose {
        width: 24px;
        height: 24px;
        margin-bottom: 31px;
    }

    .chat-input-operate {
        width: 100%;
        height: 40px;
    }

    .chat-input-tool {
        display: inline-block;
        background: rgba(241, 241, 241, 1);
        width: calc(100%-50px);
        height: 40px;
    }

    .faces-box {
        border: 0.5px solid rgb(211, 211, 211);
        position: absolute;
        bottom: 170px;
        left:-130px;
        box-shadow: 2px 2px 5px rgb(219,219,219);
        background-color: white;
        border-radius:4px;
        width: 338px;
    }

    .chat-input-expression {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 16px;
        background-image: url("../../../static/Img/Chat/emoji@2x.png");
        background-size: contain;
    }

    .chat-input-expression:hover {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 16px;
        background-image: url("../../../static/Img/Chat/emoji@2x-hover.png");
        background-size: contain;
    }

    .chat-input-more {
        display: inline-block;
        padding: 10px 11px 10px 11px;
    }

    .el-icon-more {
        width: 32px;
        height: 32px;
        margin: 0px;
        padding: 0px;
    }

    .chat-input-picture {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 6px;
        background-image: url("../../../static/Img/Chat/pic@2x.png");
        background-size: contain;
    }

    .chat-input-picture:hover {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 6px;
        background-image: url("../../../static/Img/Chat/pic@2x-hover.png");
        background-size: contain;
    }

    .chat-input-file {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 6px;
        background-image: url("../../../static/Img/Chat/file@2x.png");
        background-size: contain;
    }

    .chat-input-file:hover {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 6px;
        background-image: url("../../../static/Img/Chat/file@2x-hover.png");
        background-size: contain;
    }

    .chat-input-history {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 6px;
        background-image: url("../../../static/Img/Chat/chatHistory-24px@2x.png");
        background-size: contain;
    }

    .chat-input-history:hover {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 6px;
        background-image: url("../../../static/Img/Chat/chatHistory-24px@2x-hover.png");
        background-size: contain;
    }

    .video-chat {
        float: right;
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 16px 8px 6px;
        background-image: url("../../../static/Img/Chat/VoIPVideoBtn@2x.png");
        background-size: contain;
    }

    .video-chat:hover {
        float: right;
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 16px 8px 6px;
        background-image: url("../../../static/Img/Chat/VoIPVideoBtn-hover@2x.png");
        background-size: contain;
    }

    .voice-chat {
        float: right;
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 6px;
        background-image: url("../../../static/Img/Chat/VoIPVoiceBtn@2x.png");
        background-size: contain;
    }
    .voice-chat:hover {
        float: right;
        display: inline-block;
        width: 24px;
        height: 24px;
        margin: 8px 6px 8px 6px;
        background-image: url("../../../static/Img/Chat/VoIPVoiceBtn@2x-hover.png");
        background-size: contain;
    }

    .el-icon-historys {
        width: 24px;
        height: 24px;
        margin: 0px;
        padding: 0px;
    }

    .history-dropdown-content {
        display: none;
        position: absolute;
        background-color: rgba(255, 255, 255, 1);
        width: 128px;
        height: 80px;
        border-radius: 4px;
        box-shadow:0px 0px 12px 0px rgba(103,103,103,0.14);
        border:1px solid rgba(221,221,221,1);
    }

    .history-dropdown-content div:hover {
        background-color: rgba(221, 221, 221, 1);
        cursor: pointer;
    }

    .history-msg {
        display: block;
        width: 128px;
        height: 40px;
    }

    .history-msg-img {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 10px 8px 10px 16px;
        background-color: rgba(0, 0, 0, 0);
    }
    
    .history-msg-label {
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        letter-spacing: 0px;
        vertical-align: top;
        background-color: rgba(0, 0, 0, 0);
    }

    .history-file {
        display: block;
        width: 128px;
        height: 40px;
    }

    .history-file-img {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 10px 8px 10px 16px;
        background-color: rgba(0, 0, 0, 0);
    }

    .history-file-label {
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        letter-spacing: 0px;
        vertical-align: top;
        background-color: rgba(0, 0, 0, 0);
    }

    .chat-send {
        display: inline-block;
        width: 40px;
        float:right;
        margin: 0;
        padding: 11px 11px 11px 11px;
    }

    .quill-editor {
        margin: 0px;
        padding: 0px;
        height: 150px;
        width: 100%;
    }

    // .ql-bubble .ql-editor{
    .ql-bubble{
        height: 100%;
        margin: 0px;
        padding: 0px;
        font-size: 13px;
        font-family: 'PingFangSC-Regular';
    }

    // .ql-editor{
    //     cursor: text;
    // }

    .text-input {
        border: 0px;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        height: 150px;
        max-height: 150px;
        width: 100%;
        overflow-y: hidden;
        overflow-x: hidden;

    }

    .text-input:focus {
        outline: none;
        height: 150px;
        max-height: 150px;
        width: 100%;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .el-dialog__body {
        padding-top: 0px;
        padding-left: 32px;
        padding-right: 32px;
        padding-bottom: 0px;
    }

    .notice-dialog-footer {
        text-align: center;
    }

    .dialog-confirm-button {
        width: 100px;
        height: 32px;
    }

    .dialog-cancle-button {
        width: 100px;
        height: 32px;
    }

    .el-dialog {
        height: 400px;
        overflow: none;
    }

    .el-container {
        width: auto;
        height: 100%; 
        border:1px solid #eee;   
        background-color: white; 
        .el-aside {
            width: 150px;
            overflow: hidden;
            border-right: 1px solid rgb(221, 221, 221);
        }
        .right-container {
            width: 100%;
            height: 100%;  
            background-color: white; 
            border: hidden;
        }
    }
    .el-dialog-content {
        height: 300px;
        width: 600px;
        overflow: hidden;
    }

    .toBottom {
        width: 142px;
        height: 36px;
        position: absolute;
        right: calc(50% - 71px);
        bottom: 180px;
        background: rgba(146, 146, 146, 1);
        border-radius: 18px;
        font-size:0
    }
    
    .toBottom:hover {
        width: 142px;
        height: 36px;
        position: absolute;
        right: calc(50% - 71px);
        bottom: 180px;
        background: rgba(146, 146, 146, 1);
        border-radius: 18px;
        font-size:0;
        cursor: pointer;
    }
    
    .toBottomImg {
        display: inline-block;
        width: 16px;
        height: 16px;
        margin: 10px 5px 10px 13px;
    }
    
    .toBottomText {
        vertical-align: top;
        display: inline-block;
        width: 74px;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-family: 'PingFangSC-Regular';
        font-weight: 500;
        color: #FFFFFF;
        margin: 8px 0px 8px 0px;
        text-align: center;
    }

    .toBottomClose {
        display: inline-block;
        width: 16px;
        height: 16px;
        margin: 10px 13px 10px 5px;
    }
    
</style>