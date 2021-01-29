<template>
    <div class="chat-page">
        <mxHistoryPage class="mxHistoryPage" v-show="isSerach" :distRoomId="HistorySearchRoomId" :initSearchKey="initSearchKey" @searchClose="CloseSearchPage" @jumpToEvent="jumpToEvent"/>
        <mxFilePage class="mxFilePage" v-show="isFileList" :distRoom="curChat" :distRoomId="FilelistSearchRoomId" @fileListClose="CloseFileListPage" @showImageOfMessage="showImageOfMessage"/>
        <AlertDlg :AlertContnts="alertContnets" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="clearCache"/>
        <div class="chat-title">
            <div class="chatInfo">
                <img class="chat-img" id="chat-group-img" src="../../../static/Img/User/group-40px@2x.png" onerror = "this.src = './static/Img/User/user-40px@2x.png'"/>
                <img class="encrypt-chat-img" src="../../../static/Img/Chat/encrypt-chat-title@2x.png" v-show="isSecret"/>
                <p class="chat-name" id="chat-group-name">{{curChat.name}}</p>
                <p class="chat-group-content-num" id="chat-group-content-num"></p>
                <img class="chat-state-img" src="../../../static/Img/Chat/slience@2x.png" v-show="groupIsSlience()"/>
            </div>
            <div class="chat-tools">
                <div class="chat-tool-more-div" @click.stop="More()">
                </div>
                <!-- <div class="chat-tool-invite-div" @click.stop="createAnother"></div>  -->
                <!-- @click="showAddMembersPrepare()" -->
                <div class="chat-tool-call" @click="Call()" v-show=false>
                    <i class="el-icon-phone"></i>
                </div>
            </div>
        </div>
        <div class="chat-main" id="chat-main" v-show="!isSerach && !isFileList">
            <Invite class="chat-invite" :inviter="inviterInfo" @joinRoom="joinRoom" @rejectRoom="rejectRoom" v-show="isInvite"></Invite>
            <div class="chat-main-message" id="message-show" v-show="!isInvite">
                <!-- <ul class="msg-list" id="message-show-list"> -->
                <transition-group name="msg-list" class="msg-list" id="message-show-list" tag="ul">
                    <li class="msg-loading" v-show="isRefreshing" v-bind:key="123">
                        <i class="el-icon-loading"></i>
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
                            <imessage :msg="item" :playingMsgId="playingMsgId" :updateMsg="updateMsg" :updateUser="updateUser" :updateMsgStatus="updatemsgStatus" :updateMsgContent="updateMsgContent" :isGroup="isGroup" v-show="showMessageOrNot(item)" @showImageOfMessage="showImageOfMessage" @openUserInfoTip="openUserInfoTip" @playAudioOfMessage="playAudioOfMessage" @sendAgain="sendAgain" @showImportE2EKey="showImportE2EKey"></imessage>
                        </div>
                    </li>
                <!-- </ul> -->
                </transition-group>
            </div>
            <div class="uploadingProc" v-show="showUploadProgress">
                <label class="uploadingName">{{UploadingName}}</label>
                <el-progress class="upload-file-progress" :percentage="curPercent" color="#11b067" :show-text="false" :width="70"></el-progress>
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
                    <div class="chat-send" v-show="false">
                        <i class="el-icon-s-promotion"></i>
                    </div>
                </div>
                <input type="file" id="fileInput" style="display:none" @change="handleFiles()" multiple>
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
                    <div class="multiSelectTransmitTogetherDiv" v-show="false">
                        <div class="multiSelectTransmitTogether" @click="multTtransMitTogether"></div>
                        <div class="multiSelectTransmitTogetherText">合并转发</div>
                    </div>
                    <div class="multiSelectFavDiv">
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
        <transmitDlg  v-show="showTransmitDlg" @closeTransmitDlg="closeTransmitDlg" :curChat="curChat" :transmitTogether="transmitTogether" :transmitMessages="selectedMsgs" :imageViewerImageInfo="imageViewerImageInfo" :transmitImageViewer="transmitImageViewer" :key="transmitKey">
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
            @updateChatGroupNotice="updateChatGroupNotice" 
            @showOwnerTransferDlg="showOwnerTransferDlg"
            @openSetting="mxRoomSetting"
            @openChatInfoDlg="mxChatInfoDlgSetting"
            @closeGroupInfo="closeGroupInfo"
        >
        </groupInfoTip> <!--todo html-->
        <noticeEditDlg :noticeInfo="groupNoticeInfo" @closeNoticeDlg="closeNoticeDlg" v-show="noticeDialogVisible"/>
        <ownerTransferDlg :GroupInfo="this.ownerTransferchat" @closeOwnerTransferDlg="closeOwnerTransferDlg" v-show="ownerTransferDialogVisible"/>
        <chatMemberDlg :GroupInfo="this.chatMemberDlgchat" :showPosition="cursorPosition" :chatMemberSearchKey="chatMemberSearchKey" @atMember="atMember" :selectClicked="toSelect" v-show="chatMemberDlgVisible"/>
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
import confservice from '../../packages/data/conf_service'
// import { ImageDrop } from 'quill-image-drop-module'
import {ipcRenderer, remote} from 'electron'
import { get as getProperty } from 'lodash'

import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import Faces from './faces.vue';
import userInfoTip from './userinfo-tip.vue'
import {makeFlieNameForConflict, getFileSizeNum, generalGuid, fileMIMEFromType, Appendzero, FileUtil, findKey, pathDeal, changeStr, fileTypeFromMIME, getIconPath, uncodeUtf16, strMsgContentToJson, JsonMsgContentToString, sliceReturnsOfString, getFileNameInPath, insertStr, getFileSize, FileToContentType, FilenameToContentType, GetFileType, getFileBlob} from '../../packages/core/Utils.js'
import imessage from './message.vue'
import groupInfoTip from './group-info.vue'
import chatGroupCreater from './chatgroup-creater'
import transmit from './transmit.vue'
import noticeEditDlg from './noticeEditDlg.vue'
import ownerTransferDlg from './ownerTransfer.vue'
import chatMemberDlg from './chatMemberList.vue'
import transmitDlg from './transmitDlg.vue'
import chatCreaterDlg from './chatCreaterDlg.vue'
import SendFileDlg from './send-file-dlg.vue'
import { Group, Message, Department, UserInfo, sqliteutil, Contact } from '../../packages/data/sqliteutil.js'
import userInfoContent from './user-info';
import mxSettingDialog from './mxSettingDialog';
import mxChatInfoDlg from './mxChatInfoDlg';
import {EventTimeline} from "matrix-js-sdk";
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
import { models } from '../../packages/data/models.js';

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
        userInfoTip,
        groupInfoTip,
        chatGroupCreater,
        transmit,
        noticeEditDlg,
        ownerTransferDlg,
        chatMemberDlg,
        transmitDlg,
        chatCreaterDlg,
        userInfoContent,
        SendFileDlg,
        mxSettingDialog,
        mxChatInfoDlg,
        Invite,
        mxHistoryPage,
        mxFilePage,
        mxMemberSelectDlg,
    },
    methods: {
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
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        JumpToDistRoom(roomId) {
            this.$emit("JoinRoom", roomId);
        },
        mxSelectMember() {

        },
        createAnother() {
            console.log('this.curChat', this.curChat)
            const client = window.mxMatrixClientPeg.matrixClient;
            const mDirectEvent = client.getAccountData('m.direct');
            let dmRoomMap = {};
            if (mDirectEvent !== undefined) dmRoomMap = mDirectEvent.getContent();
            let currentRoom = this.curChat;
            let dmRoomIdArr = [];
            const roomId = currentRoom.roomId;
            const userId = client.getUserId();
            Object.keys(dmRoomMap).forEach(k=>{
                let arr = dmRoomMap[k];
                arr.forEach(a=>dmRoomIdArr.push(a))
            })
            if (dmRoomIdArr.includes(roomId)) {
                this.isDm = true;
                console.log('这是一个单聊', currentRoom);
                Object.keys(currentRoom.currentState.members).forEach(id => {
                    if (id != userId) {
                        let dmMember = currentRoom.currentState.members[id];
                        console.log( 'dmMember', dmMember)
                        console.log( 'dmMember.user', dmMember.user)
                        if (!dmMember.user) dmMember.user = {};
                        dmMember.user.avatarUrl = dmMember.user.avatarUrl ? client.mxcUrlToHttp(dmMember.user.avatarUrl) : "../../../static/Img/User/user-40px@2x.png";
                        this.dmMember = dmMember;
                    }
                })
            } else {this.isDm = false;}
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
                    // this.isRefreshing = true;
                    setTimeout(() => {
                        this.$emit('JoinRoom', this.curChat.roomId);
                    }, 500)
                    setTimeout(() => {
                        this._loadTimeline(undefined, undefined, undefined)
                            .then((ret) => {
                                console.log("join room chat is ", this.curChat);
                                this.isRefreshing = false;
                                this.messageList = this._getEvents();
                                
                                setTimeout(() => {
                                    this.$nextTick(() => {
                                        this.needToBottom = true;
                                        
                                        let div = document.getElementById("message-show-list");
                                        div.scrollTop = div.scrollHeight;
                                        if(div) {
                                            div.addEventListener('scroll', this.handleScroll);
                                            this.showScrollBar();
                                        }
                                    })
                                }, 100)
                            })
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
                console.log('close ccccc')
            }
            this.closeGroupInfo();
            this.mxChat = true;
        },
        mxRoomSetting: function(close) {
            if (close) {
                return this.mxRoomDlg = false;
                console.log('closeeeeeeee')
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
                if (op.insert && typeof op.insert === 'string') {// 如果粘贴了图片，这里会是一个对象，所以可以这样处理
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
            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(distUserInfo.matrix_id);
            if(!profileInfo)
                return;
            tempUserInfo.avatarTUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);

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
            // ipcRenderer.send("showAnotherWindow", this.curChat.roomId, "historyMsgList");
            var chatElement = document.getElementById("chat-page-id");
            chatElement.style.backgroundColor = "rgba(255, 255, 255, 1)";
            this.$emit("isSearching", true);
            this.isSerach = true;
            this.HistorySearchRoomId = this.searchChat.roomId;
        },
        CloseSearchPage: function() {
            var chatElement = document.getElementById("chat-page-id");
            chatElement.style.backgroundColor = "rgba(241, 241, 241, 1)";
            this.$emit("isSearching", false);
            this.isSerach = false;
            console.log("*** close search page this.messageList ", this.messageListShow);
            if(this.searchKeyFromList.length != 0) {
                this.HistorySearchRoomId = "";
                // this.initMessage();
            }
        },
        showFileList: function() {
            // ipcRenderer.send("showAnotherWindow", this.curChat.roomId, "historyMsgList");
            var chatElement = document.getElementById("chat-page-id");
            chatElement.style.backgroundColor = "rgba(255, 255, 255, 1)";
            this.$emit("isSearching", true);
            this.isFileList = true;
            this.isScroll = true;
            this.FilelistSearchRoomId = this.curChat.roomId;
        },
        CloseFileListPage: function() {
            var chatElement = document.getElementById("chat-page-id");
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
        showScrollBar: function(e) {
            if(this.messageListElement == null) {
                this.messageListElement = document.getElementById("message-show-list");
            }
            this.messageListElement.style.overflowY = "overlay"
        },
        hideScrollBar: function(e) {
            if(this.messageListElement == null) {
                this.messageListElement = document.getElementById("message-show-list");
            }
            this.messageListElement.style.overflowY = "hidden"
        },
        handleDialogClose() {
            this.$refs.chatGroupCreater.initData();
        },
        canRedact: function(curEvent) {
            const cli = global.mxMatrixClientPeg.matrixClient;

            const canRedact = this.curChat.currentState.maySendRedactionForEvent(curEvent, cli.credentials.userId);

            return canRedact;
        },
        rightClick(e, msgItem) {
            console.log("msg is ", msgItem);
            console.log("*** e.target.className ", e.target.className);
            var showRedact = this.canRedact(msgItem);
            if(this.checkClassName.indexOf(e.target.className) == -1) {
                return;
            }
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

            this.menu.popup(remote.getCurrentWindow());
        },
        menuDelete(msg) {
            this.curOperate = "Del";
            this.selectedMsgs.push(msg);
            this.alertContnets = {
                "Details": "是否删除聊天记录？",
                "Abstrace": "删除聊天记录"
            }
            this.showAlertDlg = true;
            // global.mxMatrixClientPeg.matrixClient.redactEvent(this.curChat.roomId, msg.event.event_id)
            // .catch((error) => {
            //     console.log("menuDelete ", error);
            //     this.$toastMessage({message:'删除成功', time:1500, type:'success'});
            //     this.multiToolsClose();
            // })
        },
        menuQuote(msg) {
            var msgContent = msg.getContent();
            var text = msgContent.body;
            var sender = msg.sender.name;
            var quoteText = '「' + sender + ':' + text + '」' + "<br>- - - - - - - - - - - - - - -";
            this.content = quoteText + this.content;
            console.log("this.curontent is ", this.content);
            this.editor.setContents(this.content);
            this.$nextTick(() => {
                this.editor.insertText(this.content.length, '\n');
                this.editor.setSelection(this.content.length + 1);
            })
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
            this.recentGroups = await Group.GetGroupByTime();
            this.transmitKey ++;
            this.showTransmitDlg = true;
            this.transmitTogether = true;
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
                this.recentGroups = await Group.GetGroupByTime();
                this.transmitKey ++;
                this.showTransmitDlg = true;
                this.transmitTogether = false;
            }
        },
        showAddMembersPrepare: async function() {
            // var memeberList = this.curChat.contain_user_ids.split(",");
            // this.showAddMembers(memeberList);
            ////////////////////////////////////////////////////
            var self = await services.common.GetSelfUserModel();
            console.log("self is ", self);
            this.chatCreaterDisableUsers.push(self.id);
            console.log("chatCreaterDisableUsers is ", this.chatCreaterDisableUsers);
            if(this.curChat.contain_user_ids.length != 0) {
                var contain_user_ids = this.curChat.contain_user_ids.split(",");
                for(var i=0;i<contain_user_ids.length;i++) {
                    if(this.chatCreaterDisableUsers.indexOf(contain_user_ids[i]) == -1) {
                        this.chatCreaterDisableUsers.push(contain_user_ids[i]);
                    }
                }
            }
            var root = await Department.GetRoot();
            console.log("root is ", root);
            var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
            console.log("rootDepartmentModels is ", rootDepartmentModels);
            var temp = rootDepartmentModels;
            this.chatCreaterDialogRootDepartments =  temp.sort(this.compare("show_order"));
            
            this.createNewChat = false;
            this.addMemberGroupType = this.curChat.group_type;
            this.chatCreaterKey ++;
            this.showChatCreaterDlg = true;
            this.chatCreaterDialogTitle = "添加成员";
        },
        closeChatCreaterDlg(content) {
            this.showChatCreaterDlg = false;
            this.createNewChat = false;
            this.chatCreaterDisableUsers = [];
        },
        showAddMembers: async function(existedMembers){
            // this.chatCreaterDisableUsers = existedMembers;
            // var self = await services.common.GetSelfUserModel();
            // console.log("self is ", self);
            // this.chatCreaterDisableUsers.push(self.id);
            // console.log("chatCreaterDisableUsers is ", this.chatCreaterDisableUsers);
            // var root = await Department.GetRoot();
            // console.log("root is ", root);
            // var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
            // console.log("rootDepartmentModels is ", rootDepartmentModels);
            // var temp = rootDepartmentModels;
            // this.chatCreaterDialogRootDepartments =  temp.sort(this.compare("show_order"));
            
            // this.chatCreaterKey ++;
            // this.createNewChat = false;
            // this.addMemberGroupType = this.curChat.group_type;
            // this.showChatCreaterDlg = true;
            // this.chatCreaterDialogTitle = "添加成员";
        },
        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        },
        AddNewMembers: async function() {
            console.log("add member s ", this.usersSelected);
            var addUids = [];
            for(var i=0;i<this.usersSelected.length;i++) {
                addUids.push(this.usersSelected[i].id)
            }
            var ret = await services.common.AddGroupUsers(this.curChat.group_id, addUids);
            console.log("AddGroupUsers ret is ", ret);
            this.dialogVisible = false;
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
            this.selectedMsgs.push(msg);
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
            var chatGroupMsgContent = msg.getContent();
            getFileBlob(chatGroupMsgContent.info, global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(chatGroupMsgContent.url))
                .then((blob) => {
                    let reader = new FileReader();
                    reader.onload = function() {
                        if(reader.readyState == 2) {
                            let a = document.createElement('a');
                            a.href = window.URL.createObjectURL(blob);
                            a.download = chatGroupMsgContent.body;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                    }
                    reader.readAsArrayBuffer(blob);
                })
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
            this.selectedMsgs.forEach(k => {
                if(!this.canRedact(k)) {
                    canShowDelete = false;
                }
                if(this.MsgIsVoice(k)) {
                    this.transmitNeedAlert = true;
                }
            })
            var deleteElement = document.getElementById("multiSelectDelDivId");
            if(!canShowDelete) {
                deleteElement.style.display = 'None';
            }
            else {
                deleteElement.style.display = 'inline-block';
            }
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
            this.transmitImageViewer = false;
            this.cleanSelected();
            this.selectedMsgs = [];
            this.multiSelect = false;
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
        },
        inputChanged(content) {
            // console.log("content is ", content);
            if(content == undefined) {
                this.curContent = this.content;
            }
            else {
                this.curContent = content.text;
            }
            var range = this.editor.getSelection();
            var content = this.editor.getContents();
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
            var atIndex = this.curContent.lastIndexOf("@");
            // console.log("atIndex is ", atIndex);
            // console.log("this.curInputIndex is ", curInputIndexTmp);
            if(this.chatMemberDlgVisible) {
                var getSearchKey = this.curContent.substring(atIndex + 1, curInputIndexTmp + 1).trim();
                this.chatMemberSearchKey = getSearchKey;
                // console.log("inputchange this.chatmembersearchkey is ", this.chatMemberSearchKey);
                // console.log("inputchange this.chatmembersearchkey.length is ", this.chatMemberSearchKey.length);
                // @ Dlg visialbe need update position.
                var editorElement = document.getElementsByClassName("ql-editor")[0];
                var parentElement = document.getElementById("chat-input-id");
                var editorChild = editorElement.children;
                var distItem = editorChild[editorChild.length - 1];
                var distItemChild = distItem.childNodes;
                var clientOffSet = distItem.clientHeight;
                var offsetTop = parentElement.offsetTop + 40 + distItem.offsetTop + clientOffSet;

                var clientOffLeft = distItem.offsetLeft;
                for(let i=0;i<distItemChild.length;i++) {
                    // console.log("distItemChild[i].text ", distItemChild[i].text);
                    // console.log("distItemChild[i].clientWidth ", distItemChild[i].clientWidth);
                    if(distItemChild[i].length != undefined) {
                        clientOffLeft += distItemChild[i].length * 14;
                    }
                    else if(distItemChild[i].clientWidth != undefined) {
                        clientOffLeft += distItemChild[i].clientWidth;
                    }
                }

                // console.log("top ", offsetTop)
                // console.log("left ", clientOffLeft);
                this.cursorPosition = {};
                this.cursorPosition = {
                    "top": offsetTop,
                    "left": clientOffLeft
                }
            }
            else {
                this.chatMemberSearchKey = null;
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
                            this.ulElement.scrollTo({ top:this.ulElement.children[this.curSelectedIndex].offsetTop, behavior: 'smooth' });
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgb(17, 180, 105)";
                            this.ulElement.children[this.curSelectedIndex].style.color = "rgb(255, 255, 255)";
                        }
                        else if(this.curSelectedIndex > 0 && this.curSelectedIndex < this.ulElement.children.length) {
                            this.curSelectedIndex--;
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgb(17, 180, 105)";
                            this.ulElement.children[this.curSelectedIndex].style.color = "rgb(255, 255, 255)";
                            this.ulElement.children[this.curSelectedIndex+1].style.backgroundColor = "rgba(255, 255, 255, 1)";
                            this.ulElement.children[this.curSelectedIndex+1].style.color = "rgb(0, 0, 0)";
                        }
                        else if(this.curSelectedIndex == this.ulElement.children.length) {
                            this.curSelectedIndex--;
                            this.ulElement.children[0].style.backgroundColor = "rgb(17, 180, 105)";
                            this.ulElement.children[0].style.color = "rgb(255, 255, 255)";
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
                            this.ulElement.children[0].style.backgroundColor = "rgb(17, 180, 105)";
                            this.ulElement.children[0].style.color = "rgb(255, 255, 255)";
                            this.curSelectedIndex = 0;
                        }
                        else if(this.curSelectedIndex < this.ulElement.children.length) {
                            this.ulElement.children[this.curSelectedIndex].style.backgroundColor = "rgb(17, 180, 105)";
                            this.ulElement.children[this.curSelectedIndex].style.color = "rgb(255, 255, 255)";
                            if(this.ulElement.children[this.curSelectedIndex-1]){
                                this.ulElement.children[this.curSelectedIndex-1].style.backgroundColor = "rgba(255, 255, 255, 1)";
                                this.ulElement.children[this.curSelectedIndex-1].style.color = "rgba(0, 0, 0, 1)";
                            }
                            this.curSelectedIndex++;
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
                if(this.curChat.group_type == 102) {
                    return;
                }
                //this.chatMemberDlgVisible = false;
                // this.chatMemberDlgchat = {};
                this.chatMemberSearchKey = null;

                var editorElement = document.getElementsByClassName("ql-editor")[0];
                var parentElement = document.getElementById("chat-input-id");
                var editorChild = editorElement.children;
                var distItem = editorChild[editorChild.length - 1];
                var distItemChild = distItem.childNodes;
                var clientOffSet = distItem.clientHeight;
                var offsetTop = parentElement.offsetTop + 40 + distItem.offsetTop + clientOffSet;

                var clientOffLeft = distItem.offsetLeft;
                for(let i=0;i<distItemChild.length;i++) {
                    // console.log("distItemChild[i].text ", distItemChild[i].text);
                    // console.log("distItemChild[i].clientWidth ", distItemChild[i].clientWidth);
                    if(distItemChild[i].length != undefined) {
                        clientOffLeft += distItemChild[i].length * 14;
                    }
                    else if(distItemChild[i].clientWidth != undefined) {
                        clientOffLeft += distItemChild[i].clientWidth;
                    }
                }

                console.log("top ", offsetTop)
                console.log("left ", clientOffLeft);

                this.cursorPosition = {
                    "top": offsetTop,
                    "left": clientOffLeft
                }
                
                this.chatMemberDlgVisible = true;
                this.chatMemberDlgchat = this.curChat;
                canNewLine = false;
            }
        },
        atMember(atMemberInfo) {
            // File
            console.log("atmemberinfo is ", atMemberInfo);
            var iconPath = "";
            this.deleteDistContent();
            var complexSpan = document.getElementById('complextype').firstElementChild.cloneNode(true);
            complexSpan.id = generalGuid();
            complexSpan.innerHTML = "@" + atMemberInfo.name;// + ":";
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
                "atName": atMemberInfo.name,
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
        async updateImgTimelineSet(room) {
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
                            "contains_url": true,
                            "types": [
                                "m.room.message"
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
        async toGetShowImage(distRoom) {
            var curTimeLineSetRoomId = this.imgTimeLineSet ? this.imgTimeLineSet.room.roomId : undefined;
            if(distRoom.roomId == curTimeLineSetRoomId) {
                var fileListInfo = this._imgTimelineWindow.getEvents();
                var thresholdNum = fileListInfo.length;
                while(fileListInfo.length == thresholdNum && this._imgTimelineWindow.canPaginate('b')) {
                    await this._imgTimelineWindow.paginate("b", 20);
                    fileListInfo = await this._imgTimelineWindow.getEvents();
                }
                return fileListInfo;
            }
            else {
                this.imgTimeLineSet = await this.updateImgTimelineSet(distRoom);
                console.log("*** imgTimeLineSet ", this.imgTimeLineSet);
                // var timeLineSet = await chatGroupItem.getUnfilteredTimelineSet();
                this._imgTimelineWindow = new Matrix.TimelineWindow(
                    global.mxMatrixClientPeg.matrixClient, 
                    this.imgTimeLineSet,
                    {windowLimit:Number.MAX_VALUE},
                )
                await this._imgTimelineWindow.load(undefined, 20);
                var fileListInfo = this._imgTimelineWindow.getEvents();
                while(fileListInfo.length == 0 && this._imgTimelineWindow.canPaginate('b')) {
                    await this._imgTimelineWindow.paginate("b", 20);
                    fileListInfo = await this._imgTimelineWindow.getEvents();
                }
                return fileListInfo;
            }
        },
        async showImageOfMessage(distEvent) {
            var showImageInfoList = [];
            var distImageInfo = {};
            var imgMsgList = await this.toGetShowImage(this.curChat);
            imgMsgList.forEach(curEvent => {
                let event = curEvent.event;
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
                        url: chatGroupMsgContent.url,
                        imageEventId: event.event_id,
                        info: info,
                        body: chatGroupMsgContent.body,
                        sender: curEvent.sender ? curEvent.sender.userId : curEvent.sender,
                        origin_server_ts: curEvent.event.origin_server_ts
                    }
                    if(distEvent.event.event_id == event.event_id) {
                        distImageInfo = {
                            imageUrl: curUrl,
                            url: chatGroupMsgContent.url,
                            imageEventId: event.event_id,
                            info: info,
                            body: chatGroupMsgContent.body,
                            sender: curEvent.sender ? curEvent.sender.userId : curEvent.sender,
                            origin_server_ts: curEvent.event.origin_server_ts
                        }
                    }
                    showImageInfoList.unshift(curImageInfo);
                }
            });
            if(!distImageInfo.imageUrl) {
                let event = distEvent.event;
                let chatGroupMsgContent = distEvent.getContent();

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
                    url: chatGroupMsgContent.url,
                    imageEventId: event.event_id,
                    info: info,
                    body: chatGroupMsgContent.body,
                    sender: distEvent.sender ? distEvent.sender.userId : distEvent.sender,
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
            if(e.target.className.indexOf('userInfo') == -1){
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
        mxGetMembers: function() {
            var userId = global.mxMatrixClientPeg.matrixClient.getUserId();
            const roomId = this.curChat.roomId;
            const cli = window.mxMatrixClientPeg.matrixClient;
            const xie1 = cli.getRoom(roomId);
            const xie2 = cli.getRoomPushRule("global", roomId);
            const mxMembers = [];
            for(let key in xie1.currentState.members) {
                // let isAdmin = xie1.currentState.members[key].powerLevel == 100; 
                let obj = {...xie1.currentState.members[key], choosen:false}
                if (obj.membership != 'leave') mxMembers.push(obj);
            }
            console.log('mxMembers', mxMembers);
            console.log('----mxMembers[userId]----', userId)
            
            return mxMembers.length;
        },
        showGroupName: async function(chatGroupItem) {
            if(chatGroupItem.roomId == undefined && chatGroupItem.myUserId == undefined){
                return "";
            }
            var groupIcoElement = document.getElementById("chat-group-img");
            // var groupStateElement = document.getElementById("chat-group-state");
            var groupContentNumElement = document.getElementById("chat-group-content-num");
            var groupNameElement = document.getElementById("chat-group-name");
            console.log("getShowGroupName is ", chatGroupItem)
            if(global.mxMatrixClientPeg.DMCheck(chatGroupItem)) {
                var distUserId = global.mxMatrixClientPeg.getDMMemberId(chatGroupItem);
                if(!distUserId) {
                    groupNameElement.innerHTML = chatGroupItem.name;
                    return;
                }
                var displayName = await ComponentUtil.GetDisplayNameByMatrixID(distUserId);
                if(groupNameElement) {
                    groupNameElement.innerHTML = displayName;
                }
            }
            else {
                if(groupNameElement) {
                    groupNameElement.innerHTML = chatGroupItem.name;
                }
            }
            var totalMemberCount = this.mxGetMembers();
            if(totalMemberCount > 2) {
                if(groupContentNumElement) {
                    groupContentNumElement.innerHTML = "(" + totalMemberCount + ")";
                }
            }
            else {
                if(groupContentNumElement) {
                    groupContentNumElement.innerHTML = "";
                }
            }

            this.distUrl = global.mxMatrixClientPeg.getRoomAvatar(this.curChat);
            console.log("=================distUrl ", this.distUrl);
            if(!this.distUrl || this.distUrl == '') {
                let defaultGroupIcon;
                if(global.mxMatrixClientPeg.DMCheck(this.curChat))
                    this.distUrl = "./static/Img/User/user-40px@2x.png";
                else
                    this.distUrl = "./static/Img/User/group-40px@2x.png";
                if(groupIcoElement) {
                    groupIcoElement.setAttribute("src", this.distUrl); 
                }
            }
            if(groupIcoElement != undefined && this.distUrl) {
              groupIcoElement.setAttribute("src", this.distUrl);
            }
        },
        insertFace: function(item) {
            var curIndex = getProperty(this.editor, 'selection.lastRange.index') || 
            getProperty(this.editor, 'selection.savedRange.index', 0) 
            this.editor.insertText(curIndex, uncodeUtf16(item));
            this.editor.setSelection(this.editor.selection.savedRange.index + 2);
            this.showFace = false;
        },
        handleFiles: function() {
            // Select Same File Failed.
            var fileList = this.fileInput.files;
            console.log(fileList)
            if(fileList === null || fileList.length === 0) {
                alert("请选择一个文件/文件夹。");
            }
            else {
                for(var i=0;i<fileList.length;i++) {
                    var range = this.editor.getSelection();
                    var curIndex = range==null ? 0 : range.index;
                    var reader = new FileReader();
                    var curPath = fileList[i].path;
                    var fileType = fileList[i].type;
                    var fileSize = fileList[i].size;
                    var fileName = path.basename(fileList[i]);//getFileNameInPath(fileList[i].path)
                    if(fileType.split("/")[0] == "image"){
                        // Image
                        reader.readAsDataURL(fileList[i]);
                        reader.onloadend = () => {
                            var img = new Image();
                            img.src = reader.result;
                            img.onload = function(){
                                let srcHeight = img.height;
                                this.editor.insertEmbed(curIndex, 'fileBlot', {localPath: curPath, src: reader.result, fileType: "image", height: srcHeight});
                                this.editor.setSelection(this.editor.selection.savedRange.index + 1);
                            }
                        }
                    }
                    else {
                        // File
                        var fileExt = fileTypeFromMIME(fileType);
                        var iconPath = getIconPath(fileExt);
                        var showfu = new FileUtil(iconPath);
                        let showfileObj = showfu.GetUploadfileobj();
                        reader.readAsDataURL(showfileObj);
                        reader.onloadend = () => {
                            this.editor.insertEmbed(curIndex, 'fileBlot', {localPath: curPath, src: reader.result, fileType: "file", fileHeight: 46, fileSize: fileSize, style:"vertical-align:middle;"})
                            this.editor.setSelection(this.editor.selection.savedRange.index + 1);
                        }
                    }
                }
            }
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
        insertImg: function() {
            // console.log("============== this is ", this);
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
                    this.curTotal += fileSize;
                    this.needUpdatefilesNum += 1;
                    fileinfo.path = fileList[i];
                    fileinfo.size = fileSize;
                    fileinfo.name = path.basename(fileList[i])
                    if(fileSize > 50 * 1024 * 1024) {
                        this.$toastMessage({message:"不支持大于50M的文件发送。", time: 3000, type:'success'});
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
            
        },
        SendFiles: function(fileinfos) {
            for(let i=0;i<fileinfos.length;i++) {
                this.sendFile(fileinfos[i]);
            }
            this.closeSendFileDlg();
        },
        myArrayBuffer(theFile) {
            // this: File or Blob
            return new Promise((resolve) => {
                let fr = new FileReader();
                fr.onload = () => {
                    resolve(fr.result);
                };
                fr.readAsArrayBuffer(theFile);
            })
        },
        onUploadProgress(ev) {
            console.log("=========== ",ev);
            this.sendLength = ev.loaded + this.curProcess;
            this.contentLength = this.curTotal != 0 ? this.curTotal : ev.total;
            console.log("=========== contentLength ",this.contentLength);
            var curPercent = parseInt(this.sendLength*100/Number(this.contentLength));
            if(curPercent > this.lastPercent) {
                this.lastPercent = curPercent;
                this.curPercent = curPercent;
            }
            if(this.sendLength >= this.contentLength) {
                console.log("*** onProgerss hide upload progerss");
                this.showUploadProgress = false;
                this.curTotal = 0;
                this.lastPercent = 0.01;
                this.curPercent = 0.01;
            }
        },
        sendFile: async function(fileinfo) {
            console.log("fileinfo is ", fileinfo);
            const content = {
                body: fileinfo.name || 'Attachment',
                info: {
                    size: fileinfo.size,
                },
                msgtype: "", // set later
            };
            var showfileObj = undefined;
            var stream = "";
            var encryptInfo;
            var uploadPromise;
            if(!fs.existsSync(fileinfo.path)) {
                showfileObj = this.path2File[fileinfo.path];
                var arrayBuf = await this.myArrayBuffer(showfileObj);
                stream = Buffer.from(arrayBuf);
            }
            else {
                var showfu = new FileUtil(fileinfo.path);
                showfileObj = showfu.GetUploadfileobj();
                stream = showfu.ReadfileSync(fileinfo.path);
            }
            var reader = new FileReader();
            reader.readAsDataURL(showfileObj);

            reader.onload = () => {
                let type = GetFileType(reader.result);
                // content.info.mimetype = fileinfo.type;
                let fileResult = reader.result;
                this.showUploadProgress = true;
                this.UploadingName = fileinfo.name;
                let filename = fileinfo.name;
                var roomID = this.curChat.roomId;
                if(type == 'm.image'){
                    content.msgtype = 'm.image';
                    // this.SendImage(showfileObj, fileResult, stream)
                    this.infoForImageFile(this.curChat.roomId, showfileObj).then((imageInfo) => {
                        extend(content.info, imageInfo);
                        this.uploadFile(this.curChat.roomId, showfileObj, this.onUploadProgress).then((ret) => {
                            if(this.curUpdateFilesNum >= this.needUpdatefilesNum - 1) {
                                this.showUploadProgress = false;
                                this.curUpdateFilesNum = 0;
                                this.needUpdatefilesNum = 0;
                                this.curProcess = 1;
                            }
                            else {
                                this.curProcess = this.sendLength;
                                this.curUpdateFilesNum += 1;
                            }
                            content.file = ret.file;
                            content.url = ret.url;
                            global.mxMatrixClientPeg.matrixClient.sendMessage(roomID, content);
                        })
                    }, (e) => {
                        console.log("**** getInfoForImageFile Exception ", e);
                    })
                }
                else{
                    if(global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(this.curChat.roomId)) {
                        var prom = this.readFileAsArrayBuffer(showfileObj).then((data) => {
                            return encrypt.encryptAttachment(data);
                        }).then((encryptResult) => {
                            encryptInfo = encryptResult.info;
                            var blob = new Blob([encryptResult.data]);
                            global.mxMatrixClientPeg.matrixClient.uploadContent(
                                    blob,
                                    {includeFilename: false,
                                    progressHandler: this.onUploadProgress}
                                ).then((url)=>{
                                    encryptInfo.url = url;
                                    encryptInfo.mimetype = fileinfo.type;
                                    var content = {
                                        msgtype: 'm.file',
                                        body: filename,
                                        file: encryptInfo,
                                        url: url,
                                        info:{
                                            size: fileinfo.size,
                                            mimetype: fileinfo.type
                                        }
                                    };
                                    uploadPromise = global.mxMatrixClientPeg.matrixClient.sendMessage(roomID, content);
                                    this.showUploadProgress = false;
                                });
                        })
                    }
                    else {
                        let filename = fileinfo.name;
                        this.uploadFile(this.curChat.roomId, showfileObj, this.onUploadProgress).then((ret) => {
                        // global.mxMatrixClientPeg.matrixClient.uploadContent(showfileObj, {
                        //     name: filename,
                        //     progressHandler: this.onUploadProgress
                        // }).then((ret)=>{
                            if(this.curUpdateFilesNum >= this.needUpdatefilesNum - 1) {
                                this.showUploadProgress = false;
                                this.curUpdateFilesNum = 0;
                                this.needUpdatefilesNum = 0;
                                this.curProcess = 1;
                            }
                            else {
                                this.curProcess = this.sendLength;
                                this.curUpdateFilesNum += 1;
                            }
                            content.msgtype = 'm.file';
                            content.file = ret.file;
                            content.url = ret.url;
                            console.log("*** name is ", filename);
                            console.log("*** path.extname(filename) is ", path.extname(filename));
                            content.info.mimetype = fileMIMEFromType(path.extname(filename).split('.')[1]);
                            console.log("***fileMIMEFromType(path.extname(filename) is ", fileMIMEFromType(path.extname(filename).split('.')[1]));
                            console.log("***content is ", content);
                            // var content = {
                            //     msgtype: 'm.file',
                            //     body: filename,
                            //     url: url,
                            //     info:{
                            //         size: fileinfo.size,
                            //         mimetype: fileinfo.type
                            //     }
                            // };
                            global.mxMatrixClientPeg.matrixClient.sendMessage(roomID, content).then(async (ret) => {
                                console.log("*** ret is ", ret);
                                console.log("*** filePath is ", fileinfo.path);
                                if(fs.existsSync(fileinfo.path)) {
                                    console.log("*** filePath is exist");
                                    let msgs = await Message.FindMessageByMesssageID(ret.event_id);
                                    if(msgs.length != 0){
                                        msgs[0].file_local_path = fileinfo.path;
                                        msgs[0].save();
                                    }
                                    else{
                                        let msgValue = {
                                            message_id: ret.event_id,
                                            file_local_path: fileinfo.path
                                        }
                                        let model = await new(await models.Message)(msgValue);
                                        model.save();
                                    }
                                }
                            })
                        });
                    }
                }
                
            }
        },
        readFileAsArrayBuffer(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
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

            // // check for hi-dpi PNGs and fudge display resolution as needed.
            // // this is mainly needed for macOS screencaps
            // let parsePromise;
            // if (imageFile.type === "image/png") {
            //     // in practice macOS happens to order the chunks so they fall in
            //     // the first 0x1000 bytes (thanks to a massive ICC header).
            //     // Thus we could slice the file down to only sniff the first 0x1000
            //     // bytes (but this makes extractPngChunks choke on the corrupt file)
            //     const headers = imageFile; //.slice(0, 0x1000);
            //     parsePromise = readFileAsArrayBuffer(headers).then(arrayBuffer => {
            //         const buffer = new Uint8Array(arrayBuffer);
            //         const chunks = extractPngChunks(buffer);
            //         for (const chunk of chunks) {
            //             if (chunk.name === 'pHYs') {
            //                 if (chunk.data.byteLength !== PHYS_HIDPI.length) return;
            //                 return chunk.data.every((val, i) => val === PHYS_HIDPI[i]);
            //             }
            //         }
            //         return false;
            //     });
            // }

            // const [hidpi] = await Promise.all([parsePromise, imgPromise]);
            const [hidpi] = await Promise.all([imgPromise]);
            const width = hidpi ? (img.width >> 1) : img.width;
            const height = hidpi ? (img.height >> 1) : img.height;
            return {width, height, img};
        },
        /**
         * Read the metadata for an image file and create and upload a thumbnail of the image.
         *
         * @param {MatrixClient} matrixClient A matrixClient to upload the thumbnail with.
         * @param {String} roomId The ID of the room the image will be uploaded in.
         * @param {File} imageFile The image to read and thumbnail.
         * @return {Promise} A promise that resolves with the attachment info.
         */
        infoForImageFile(roomId, imageFile) {
            let thumbnailType = "image/png";
            if (imageFile.type === "image/jpeg") {
                thumbnailType = "image/jpeg";
            }

            let imageInfo;
            return this.loadImageElement(imageFile).then((r) => {
                return this.createThumbnail(r.img, r.width, r.height, thumbnailType);
            }).then((result) => {
                imageInfo = result.info;
                return this.uploadFile(roomId, result.thumbnail);
            }).then((result) => {
                imageInfo.thumbnail_url = result.url;
                imageInfo.thumbnail_file = result.file;
                return imageInfo;
            });
        },
        /**
         * Upload the file to the content repository.
         * If the room is encrypted then encrypt the file before uploading.
         *
         * @param {MatrixClient} matrixClient The matrix client to upload the file with.
         * @param {String} roomId The ID of the room being uploaded to.
         * @param {File} file The file to upload.
         * @param {Function?} progressHandler optional callback to be called when a chunk of
         *    data is uploaded.
         * @return {Promise} A promise that resolves with an object.
         *  If the file is unencrypted then the object will have a "url" key.
         *  If the file is encrypted then the object will have a "file" key.
         */
        uploadFile(roomId, file) {
            let canceled = false;
            if (global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(roomId)) {
                // If the room is encrypted then encrypt the file before uploading it.
                // First read the file into memory.
                let uploadPromise;
                let encryptInfo;
                const prom = readFileAsArrayBuffer(file).then((data) => {
                    return encrypt.encryptAttachment(data);
                }).then((encryptResult) => {
                    // Record the information needed to decrypt the attachment.
                    encryptInfo = encryptResult.info;
                    // Pass the encrypted data as a Blob to the uploader.
                    const blob = new Blob([encryptResult.data]);
                    uploadPromise = global.mxMatrixClientPeg.matrixClient.uploadContent(blob, {
                        progressHandler: this.onUploadProgress,
                        includeFilename: false,
                    });
                    return uploadPromise;
                }).then((url) => {
                    // If the attachment is encrypted then bundle the URL along
                    // with the information needed to decrypt the attachment and
                    // add it under a file key.
                    encryptInfo.url = url;
                    if (file.type) {
                        encryptInfo.mimetype = file.type;
                    }
                    return {"file": encryptInfo};
                });
            } else {
                const basePromise = global.mxMatrixClientPeg.matrixClient.uploadContent(file, {
                    progressHandler: this.onUploadProgress,
                });
                const promise1 = basePromise.then((url) => {
                    // If the attachment isn't encrypted then include the URL directly.
                    return {"url": url};
                });
                return promise1;
            }
        },
        createThumbnail(element, inputWidth, inputHeight, mimeType) {
            return new Promise((resolve) => {
                let targetWidth = inputWidth;
                let targetHeight = inputHeight;
                if (targetHeight > MAX_HEIGHT) {
                    targetWidth = Math.floor(targetWidth * (MAX_HEIGHT / targetHeight));
                    targetHeight = MAX_HEIGHT;
                }
                if (targetWidth > MAX_WIDTH) {
                    targetHeight = Math.floor(targetHeight * (MAX_WIDTH / targetWidth));
                    targetWidth = MAX_WIDTH;
                }

                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                canvas.getContext("2d").drawImage(element, 0, 0, targetWidth, targetHeight);
                canvas.toBlob((thumbnail) => {
                    resolve({
                        info: {
                            thumbnail_info: {
                                w: targetWidth,
                                h: targetHeight,
                                mimetype: thumbnail.type,
                                size: thumbnail.size,
                            },
                            w: inputWidth,
                            h: inputHeight,
                        },
                        thumbnail: thumbnail,
                    });
                }, mimeType);
            });
        },
        SendImage: function(fileinfo, fileResult, stream){
                var img = new Image();
                img.src = fileResult;
                var encryptInfo;
                var uploadPromise;
                this.showUploadProgress = true;
                this.UploadingName = fileinfo.name;
                //let tt1 = fileResult.substring(fileResult.indexOf("\,") + 1)
                //let tt0 = Buffer.from(tt1, "base64");
                img.onload = ()=>{
                    var roomID = this.curChat.roomId;
                    let filename = fileinfo.name;
                    if(global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(this.curChat.roomId)) {
                        var prom = this.readFileAsArrayBuffer(fileinfo).then((data) => {
                            return encrypt.encryptAttachment(data);
                        }).then((encryptResult) => {
                            encryptInfo = encryptResult.info;
                            var blob = new Blob([encryptResult.data]);
                            global.mxMatrixClientPeg.matrixClient.uploadContent(
                                    blob,
                                    {includeFilename: false,
                                    progressHandler: this.onUploadProgress}
                                ).then((url)=>{
                                    encryptInfo.url = url;
                                    encryptInfo.mimetype = fileinfo.type;
                                    var content = {
                                        msgtype: 'm.image',
                                        body: filename,
                                        file: encryptInfo,
                                        url: url,
                                        info:{
                                            size: fileinfo.size,
                                            w: img.width,
                                            h: img.height,
                                            mimetype: fileinfo.type,
                                            thumbnail_url: encryptInfo.url,
                                            thumbnail_file: encryptInfo,
                                        }
                                    };
                                    uploadPromise = global.mxMatrixClientPeg.matrixClient.sendMessage(roomID, content);
                                    this.showUploadProgress = false;
                                    return uploadPromise;
                                });
                        })
                    }
                    else {
                        global.mxMatrixClientPeg.matrixClient.uploadContent({
                            stream: stream,
                            name: filename,
                            progressHandler: this.onUploadProgress
                        }).then((url)=>{
                            if(this.curUpdateFilesNum >= this.needUpdatefilesNum - 1) {
                                this.showUploadProgress = false;
                                this.curUpdateFilesNum = 0;
                                this.needUpdatefilesNum = 0;
                                this.curProcess = 1;
                            }
                            else {
                                this.curProcess = this.sendLength;
                                this.curUpdateFilesNum += 1;
                            }
                            var content = {
                                msgtype: 'm.image',
                                body: filename,
                                url: url,
                                info:{
                                    size: fileinfo.size,
                                    w: img.width,
                                    h: img.height,
                                    mimetype: fileinfo.type,
                                }
                            };
                            global.mxMatrixClientPeg.matrixClient.sendMessage(roomID, content);
                        });
                    }
                }
        },

        SendText: function(sendBody, varcontent){
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
            this.messageList.push(eventTmp);
            setTimeout(() => {
                this.$nextTick(() => {
                    var div = document.getElementById("message-show-list");
                    if(div) {
                        div.scrollTo({ top:div.scrollHeight, behavior: 'smooth' })
                    }
                })
            }, 100)
            try{
                global.mxMatrixClientPeg.matrixClient.sendMessage(this.curChat.roomId, sendBody, curTimeSeconds)
            }
            catch(error) {
                console.log("error is ", error);
            }
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
            // console.log("varcontent is ", varcontent);
            var uid = this.curChat.user_id;
            var gorupId = this.curChat.group_id == null ? '' : this.curChat.group_id;
            let sendText = '';
            let exsitAt = false;
            let sendBody = {
                msgtype: "m.text",
                body: sendText
            }
            for(var i=0;i<varcontent.ops.length;i++){
                // console.log("i is ", i);
                let curMsgItem = varcontent.ops[i].insert;
                let curTimeSeconds = new Date().getTime();
                
                if(curMsgItem.hasOwnProperty("span")) {
                    var fileSpan = curMsgItem.span;
                    var pathId = fileSpan.id;
                    var msgInfo = this.idToPath[pathId];
                    // console.log("this.idToPath is ", this.idToPath)
                    var filePath = msgInfo.path;
                    var fileType = msgInfo.type;
                    if(fileType == "at") {
                        sendText += msgInfo.atName;
                        sendText = "@" + sendText + " ";
                        // sendText += ":"
                        sendBody.format = "org.matrix.custom.html";
                    }
                }
                else{
                    curMsgItem = sliceReturnsOfString(curMsgItem);
                    sendText += curMsgItem;
                }
            }
            
            if(sendText.length != 0)
            {
                sendBody.body = sendText;
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
        Call: function() {
            console.log("make a call");
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
                if (levelObj.ban) canBan = levelObj.ban;
                if (events && events['m.room.name']) canName = events['m.room.name'];
                if (events && events['m.room.server_acl']) canServer = events['m.room.server_acl'];
                if (events && events['m.room.history_visibility']) canHistory = events['history_visibility'];
                if (events && events['m.room.encryption']) canEncryption = events['m.room.encryption'];
                if (events && events['m.room.avatar']) canAvatar = events['m.room.avatar'];
                if (levelObj.kick) canKick = levelObj.kick;
                if (levelObj.invite) canInvite = levelObj.invite;

            }
            const totalLevels = {canInvite, canKick, canAvatar, canEncryption, canHistory, canServer, canName, canBan};
            const userLevel = members[myUserId].powerLevel;
            var groupInfoObj = {
                "memberList": idsList,
                "groupName": name, //this.curChat.group_name,
                "groupTopic": topic,
                "groupAvarar": this.distUrl, //this.curChat.group_avarar,
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
        getLatestMessageSequenceIdAndCount: function() {
            var ret = {
                "latestSequenceId": "",
                "count": 20
            };
            for(var i=0;i<this.messageList.length;i++) {
                if(this.messageList[i].sequence_id.length != 0) {
                    ret.latestSequenceId = this.messageList[i].sequence_id;
                    break;
                }
            }
            if(ret.latestSequenceId.length == 0) {
                ret.latestSequenceId = this.curChat.sequence_id;
                ret.count = this.messageList.length + 20;
            }
            return ret;
        },
        _loadTimeline: function(eventId, pixelOffset, offsetBase, distChat=this.curChat, num=20) {
            this.timeLineSet = distChat.getUnfilteredTimelineSet();
            this._timelineWindow = new Matrix.TimelineWindow(
                global.mxMatrixClientPeg.matrixClient, 
                this.timeLineSet,
                {windowLimit:Number.MAX_VALUE},
            )
            return this._timelineWindow.load(eventId, num);
        },
        _getEvents() {
            var events = this._timelineWindow.getEvents();
            // console.log("========== getEvent ", events);
            return events;
        },
        jumpToEvent: function(eventId, distChat) {
            let div = document.getElementById("message-show-list");
            div.removeEventListener('scroll', this.handleScroll);
            this.existingMsgId = [];
            this.distEventId = eventId;
            var chatElement = document.getElementById("chat-page-id");
            chatElement.style.backgroundColor = "rgba(241, 241, 241, 1)";
            this.$emit("isSearching", false);
            this.isSerach = false;
            this.isJumpPage = true;
            this.messageList = [];
            // this.curChat.resetLiveTimeline();
            this._loadTimeline(eventId, undefined, undefined, distChat, 1).then(() => {
                this.messageList = this._getEvents();
                console.log("*** this.messageList is ", this.messageList);
                setTimeout(() => {
                    this.$nextTick(() => {
                        this.scrollToDistMsg(eventId);
                        let uldiv = document.getElementById("message-show-list");
                        if(uldiv.clientHeight < uldiv.offsetHeight) {
                            this.paginageForwork();
                        }
                        div.addEventListener('scroll', this.handleScroll);
                    })
                }, 500);
            })
            this.isSecret = global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(distChat.roomId);
            this.needScrollTop = true;
            this.needScrollBottom = true;
            this.existingMsgId = [];
            this.showGroupName(distChat);
            if(this.editor == undefined) {
                this.editor = this.$refs.chatQuillEditor.quill;
            }
            var content = this.$store.getters.getDraft(distChat.roomId);
            this.editor.setContents(content);
            this.editor.setSelection(this.content.length + 1);
            setTimeout(() => {
                this.showGroupName(distChat);
            }, 1000);
            this.$store.commit("setCurChatId", distChat.roomId);
        },
        getTxnIdFromEventId: function(eventId) {
            for(var i=0;i<this.messageList.length;i++) {
                if(this.messageList[i].event.event_id == eventId) {
                    return this.messageList[i]._txnId ? this.messageList[i]._txnId : this.messageList[i].getTxnId();
                }
            }
        },
        scrollToDistMsg: function(eventId) {
            var ulDiv = document.getElementById("message-show-list");
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
        UpdateUserAvater(ev){
            if(ev.getType() === 'm.room.member' && ev.getSender() === this.userID){
                if(ev.event && ev.event.content){
                    let content = ev.event.content;
                    if(content.is_direct)
                        return;
                    if(content.membership != 'join')
                        return;
                    let url = content.avatar_url;
                    var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(url, null, null);
                    var elementImg = document.getElementById("userHead");
                    if(elementImg){
                        if(avaterUrl == ''){
                            elementImg.setAttribute('src', '../../../static/Img/User/user-40px@2x.png');
                        }
                        else
                            elementImg.setAttribute('src', avaterUrl);
                    }
                }
            }
        },

        IsBottom: function(){
            let uldiv = document.getElementById("message-show-list");
            let client = document.getElementById("message-show");
            if(uldiv && client && Math.abs(uldiv.scrollHeight - uldiv.scrollTop - client.clientHeight) < 5)
                return true;
            return false;
        },

        SetToBottom: function(){
            let uldiv = document.getElementById("message-show-list");
            uldiv.scrollTop = uldiv.scrollHeight;
        },

        messageFilter(event){
            if(['m.room.message', 'm.room.encrypted', 'm.room.create'].indexOf(event.getType()) >= 0) return true;
            return false;
        },

        async getShowMessage(msgFileter, num, type)
        {
            let msgList = [];
            while(this._timelineWindow.canPaginate(type)){
                //获取历史消息
                await this._timelineWindow.paginate(type, 20);
                let tmpList = this._getEvents();
                let index = 0;
                msgList.length = 0;
                tmpList.forEach(item => {
                    // if(msgFileter(item) && item.event.content){
                    if(item.event.content){
                        msgList.push(item);
                        index++;
                    } 
                })
                if(index > num) break;
            }
            return msgList;
        },
        paginageForwork: function() {
            let uldiv = document.getElementById("message-show-list");
            if(!uldiv)
                return;
            var canForwardPaginate = this._timelineWindow.canPaginate("f");
            if(!canForwardPaginate) {
                this.isRefreshing = false;
                return;
            }
            this.isScroll = true;
            this.lastScrollTop = uldiv.scrollTop;
            console.log("---------update uldiv.scrollTop is ", uldiv.scrollTop);
            // let latestSequenceIdAndCount = this.getLatestMessageSequenceIdAndCount();
            this.getShowMessage(this.messageFilter, 10, 'f')
                .then((ret) => {
                    this.messageList = ret
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
        },
        handleScroll: function(toBottom=false) {
            let uldiv = document.getElementById("message-show-list");
            if(!uldiv)
                return;
            let client = document.getElementById("message-show");
            // console.log("=====client.clientHeight is ", client.clientHeight);
            // console.log("=====uldiv.scrollHeight - uldiv.scrollTop is ", uldiv.scrollHeight - uldiv.scrollTop);
            // console.log("=====uldiv.scrollHeight is ", uldiv.scrollHeight);
            // console.log("=====uldiv.scrollTop is ", uldiv.scrollTop);
            // console.log("=====isRefreshing is ", this.isRefreshing);
        
            if(uldiv.scrollTop == 0){
                console.log("to update msg")
                var curTime = new Date().getTime();
                var canBackPaginate = this._timelineWindow.canPaginate("b");
                if(!canBackPaginate) {
                    this.isRefreshing = false;
                    return;
                }
                // console.log("curTime - this.lastRefreshTime ", curTime - this.lastRefreshTime)
                if(curTime - this.lastRefreshTime > 0.5 * 1000 && !this.isRefreshing && this.needScrollTop){
                    this.isScroll = true;
                    this.lastScrollHeight = uldiv.scrollHeight;
                    this.isRefreshing = true;
                    this.lastRefreshTime = new Date().getTime();
                    // let latestSequenceIdAndCount = this.getLatestMessageSequenceIdAndCount();
                    this.getShowMessage(this.messageFilter, 10, 'b')
                        .then((ret) => {
                            this.messageList = ret;
                            this.isRefreshing = false;
                            setTimeout(() => {
                                this.$nextTick(() => {
                                    console.log("---------update croll top is ", uldiv.scrollHeight);
                                    console.log("*** toBottom is ", toBottom)
                                    if(toBottom === true) {
                                        uldiv.scrollTop = uldiv.scrollHeight + 52;
                                    }
                                    else {
                                        uldiv.scrollTop = uldiv.scrollHeight - this.lastScrollHeight - 32;
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
                var canForwardPaginate = this._timelineWindow.canPaginate("f");
                if(!canForwardPaginate) {
                    this.isRefreshing = false;
                    return;
                }
                if(curTime - this.lastRefreshTime > 0.5 * 1000 && !this.isRefreshing) {
                    this.isScroll = true;
                    this.lastScrollTop = uldiv.scrollTop;
                    console.log("---------update uldiv.scrollTop is ", uldiv.scrollTop);
                    this.lastRefreshTime = new Date().getTime();
                    // let latestSequenceIdAndCount = this.getLatestMessageSequenceIdAndCount();
                    this.getShowMessage(this.messageFilter, 10, 'f')
                        .then((ret) => {
                            this.messageList = ret
                            let index = 0;
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
        copyDom: function() {
            let distUlElement = document.getElementById("message-show-list");
            let hideUlElement = document.getElementById("message-show-list-hide");
            let startIndex = distUlElement.childNodes.length - 1;
            console.log("hideUlElement.childNodes is ", hideUlElement.childNodes);
            console.log("distUlElement.childNodes is ", distUlElement.childNodes);
            for(let i=startIndex;i<hideUlElement.childNodes.length;i++) {
                // console.log("i is ", i);
                distUlElement.insertBefore(hideUlElement.childNodes[i], distUlElement[2]);
            }
        },
        updateChatGroupStatus(roomId, groupStatus) {
            // console.log("======== ");
            this.$emit("updateChatGroupStatus", roomId, groupStatus);
            // this.groupIsSlience();
        },
        leaveGroup(groupId) {
            this.$emit("leaveGroup", groupId);
            this.showGroupInfoTips = false;
        },
        updateChatGroupNotice(groupId, originalNotice, isOwner) {
            // console.log("==========")
            this.noticeDialogVisible = true;
            this.groupNoticeInfo = {};
            this.groupNoticeInfo.originalNotice = originalNotice;
            this.groupNoticeInfo.groupId = groupId;
            this.groupNoticeInfo.isOwner = isOwner;
        },
        closeNoticeDlg(content) {
            if(content.length == 0) {
                this.noticeDialogVisible = false;
                this.groupNoticeInfo = {};
            }
            else {
                this.noticeDialogVisible = false;
            }
        },
        showOwnerTransferDlg() {
            this.ownerTransferDialogVisible = true;
            this.ownerTransferchat = this.curChat;
        },
        closeOwnerTransferDlg() {
            this.ownerTransferDialogVisible = false;
            this.ownerTransferchat = {};
        },
        callback(msg) {
            // console.log("chat callback msg is ", msg);
            console.log("chat callback msg content is ", strMsgContentToJson(msg.message_content));
            console.log("chat callback msg is ", msg)
            var msgContent = strMsgContentToJson(msg.message_content);
            var forceUpdate = true;
            ipcRenderer.send("flashIcon");

            if(msg.group_id == this.curChat.group_id) {
                if(this.existingMsgId.indexOf(msg.message_id) == -1) {
                    forceUpdate = false;
                    this.messageList.push(msg);
                    this.existingMsgId.push(msg.message_id);
                    let div = document.getElementById("message-show-list");
                    if(div) {
                        this.$nextTick(() => {
                            div.scrollTop = div.scrollHeight;
                        })
                    }
                }
            }
        },
        updateMsgFile(e, localPath, eventId) {
            console.log("updateMsgfile ", localPath, eventId);
            var myPackage = [localPath, eventId];
            this.updateMsg = myPackage;
            this.curTotal = 0;
            this.lastPercent = 0.01;
            this.curPercent = 0.01;
        },
        updateUserImage(e, args) {
            console.log("updateUserImage ", args);
            // this.updateUser = args;
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
            if(this.$route.name != "ChatContent") {
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
                this.curTotal += fileinfo.size;
                this.needUpdatefilesNum += 1;
                
                if(files[i].size > 50 * 1024 * 1024) {
                    this.$toastMessage({message:"不支持大于50M的文件发送。", time: 3000, type:'success'});
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
        onEventDecrypted(e) {
            this.updateMsgContent = {
                "id" : e.event.event_id
            };
        },
        checkClipboard(e) {
            //const strBuffer = clipboard.readRTF()
            //console.log(strBuffer)
            console.log("e is ", e.clipboardData);
            if ( !(e.clipboardData && e.clipboardData.items) ) {
                console.log("HAHHHAHHAHHA")
                return ;
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
                    if(true) {
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
                                "m.room.message"
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
        async toGetShowMessage() {
            this.timeLineSet = await this.updateTimelineSet(this.curChat);
            this._timelineWindow = new Matrix.TimelineWindow(
                global.mxMatrixClientPeg.matrixClient, 
                this.timeLineSet,
                {windowLimit:Number.MAX_VALUE},
            )
            await this._timelineWindow.load(undefined, 20);
            var fileListInfo = this._timelineWindow.getEvents();
            while(fileListInfo.length < 10 && this._timelineWindow.canPaginate('b')) {
                await this._timelineWindow.paginate("b", 20);
                fileListInfo = await this._timelineWindow.getEvents();
            }
            return fileListInfo;
        },
        initMessage: function() {
            // global.mxMatrixClientPeg.matrixClient.on("Event.decrypted", this.onEventDecrypted);
            if(this.curChat.getMyMembership() == "invite") {
                this.isRefreshing = false;
                this.inviterInfo = global.mxMatrixClientPeg.getInviteMember(this.curChat);
                this.isInvite = true;
            }
            else {
                // this._loadTimeline(undefined, undefined, undefined)
                console.log("*** initMessage 。。。。 ");
                this.toGetShowMessage()
                    .then((ret) => {
                        this.isRefreshing = false;
                        this.messageList = this._getEvents();
                        setTimeout(() => {
                            this.$nextTick(() => {
                                this.needToBottom = true;

                                let div = document.getElementById("message-show-list");
                                if(div) {
                                    div.scrollTop = div.scrollHeight + 52;
                                    div.addEventListener('scroll', this.handleScroll);
                                    this.showScrollBar();
                                }

                                let uldiv = document.getElementById("message-show-list");
                                if(uldiv.clientHeight < uldiv.offsetHeight) {
                                    this.handleScroll(true);
                                }
                                
                            })
                        }, 100)
                    })
            }
            this.isSecret = global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(this.curChat.roomId);
            this.needScrollTop = true;
            this.needScrollBottom = true;
            this.existingMsgId = [];
            this.showGroupName(this.curChat);
            if(this.editor == undefined) {
                this.editor = this.$refs.chatQuillEditor.quill;
            }
            var content = this.$store.getters.getDraft(this.curChat.roomId);
            this.editor.setContents(content);
            this.editor.setSelection(this.content.length + 1);
            setTimeout(() => {
                this.showGroupName(this.curChat);
            }, 1000);
        }
    },
    data() {
        return {
            txnId2EventId: {},
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
            UploadingName: '',
            showUploadProgress: false,
            curPercent: 0.01,
            lastPercent: 0.01,
            curTotal: 0,
            curProcess: 1,
            needUpdatefilesNum: 0,
            curUpdateFilesNum: 0,
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
            needScrollTop: true,
            needScrollBottom: true,
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
            checkClassName: ["file-info", "msg-link-txt", "msg-link-url", "chat-msg-content-others-txt", "transmit-title", "transmit-content", "chat-msg-content-mine-transmit", "chat-msg-content-others-voice", "chat-msg-content-mine-voice", "chat-msg-content-others-txt-div", "chat-msg-content-mine-txt-div", "chat-msg-content-mine-txt", "msg-image", "chat-msg-content-others-file", "chat-msg-content-mine-file", "file-name", "file-image", "voice-info", "file-size", "voice-image"],
            groupCreaterTitle: '发起群聊',
            groupNoticeInfo: {},
            updateUser: 1,
            updateMsg: {},
            menu: null,
            cleanCache: false,
            playingMsgId: '',
            multiSelect: false,
            dialogVisible: false,
            noticeDialogVisible: false,
            ownerTransferDialogVisible: false,
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
            recentGroups:[],
            transmitTogether: false,
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
                        // 粘贴版，处理粘贴时候带图片
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
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
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
            services: null,
            mxSelectMemberOpen: false,
            isDm: false,
            initSearchKey: '',
        }
    },
    mounted: function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        setTimeout(() => {
            this.$nextTick(() => {
                // console.log("==============ipc on")
                ipcRenderer.on('SAVED_FILE', this.updateMsgFile);
                ipcRenderer.on('updateUserImage', this.updateUserImage);
                ipcRenderer.on('transmitFromSoloDlg', this.transmitFromSoloDlg);
                ipcRenderer.on('setFocuse', this.setFocuse);
                ipcRenderer.on('checkClipBoard', this.checkClipboard);
                ipcRenderer.on('toFavImageViewer', this.imageViewerFav);
                ipcRenderer.on('toTransmitImageViewer', this.imageViewerTransmit);
                this.editor = this.$refs.chatQuillEditor.quill;
                console.log(this.$refs.chatQuillEditor);
                this.$refs.chatQuillEditor.$el.style.height='150px';
                // this.$refs.chatQuillEditor
                this.fileInput = document.getElementById("fileInput");
                this.showGroupName(this.curChat);
                // this.dropWrapper = document.getElementById('chat-main');
                // this.dropWrapper.addEventListener('drop', this.dealDrop);
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
        this.loginInfo = undefined;//await services.common.GetLoginModel();
        this.curUserInfo = undefined;//await services.common.GetSelfUserModel();
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
    props: ['chat', 'newMsg', 'toBottom', 'searchKeyFromList', 'searchChat'],
    watch: {
        chat: function() {
            if(this.chat == null) {
                return;
            }
            this.curChat = this.chat;
            this.initSearchKey = '';
            this.inviterInfo = undefined;
            this.isInvite = false;
            this.isJumpPage = false;
            this.curGroupId = this.chat.roomId;
            console.log("***1 chat")
            this.CloseSearchPage();
            this.CloseFileListPage();
            this.multiToolsClose();
            console.log("chat ============", this.chat);
            console.log("this.curGroupId is ", this.curGroupId);
            
            this.initMessage();
        },
        searchKeyFromList: function() {
            if(this.searchKeyFromList != '') {
                this.inviterInfo = undefined;
                this.isInvite = false;
                this.isJumpPage = false;
                this.curGroupId = this.curChat.roomId;
                console.log("***1 searchKeyFromList")
                this.CloseSearchPage();
                this.CloseFileListPage();
                this.multiToolsClose();
                this.needScrollTop = true;
                this.needScrollBottom = true;
                this.existingMsgId = [];
                
                this.initSearchKey = this.searchKeyFromList;
                this.showHistoryMsgList();
            }
            else {
                this.initSearchKey = '';
                this.inviterInfo = undefined;
                this.isInvite = false;
                this.isJumpPage = false;
                this.curGroupId = this.curChat.roomId;
                console.log("***2 searchKeyFromList")
                this.CloseSearchPage();
                this.CloseFileListPage();
                this.multiToolsClose();
                console.log("chat ============", this.curChat);
                console.log("this.curGroupId is ", this.curGroupId);
                
                this.initMessage();
            }
        },
        searchChat: function() {
            if(this.searchKeyFromList != '') {
                this.inviterInfo = undefined;
                this.isInvite = false;
                this.isJumpPage = false;
                this.curGroupId = this.curChat.roomId;
                console.log("***1 searchChat")
                this.CloseSearchPage();
                this.CloseFileListPage();
                this.multiToolsClose();
                this.needScrollTop = true;
                this.needScrollBottom = true;
                this.existingMsgId = [];
                
                this.initSearchKey = this.searchKeyFromList;
                this.showHistoryMsgList();
            }
            else {
                this.initSearchKey = '';
                this.inviterInfo = undefined;
                this.isInvite = false;
                this.isJumpPage = false;
                this.curGroupId = this.curChat.roomId;
                console.log("***2 searchChat")
                this.CloseSearchPage();
                this.CloseFileListPage();
                this.multiToolsClose();
                console.log("chat ============", this.curChat);
                console.log("this.curGroupId is ", this.curGroupId);
                
                this.initMessage();
            }
        },
        toBottom: function() {
            if(this.toBottom == true) {
                let div = document.getElementById("message-show-list");
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
            this.initMessage();
            this.updateUser++;
        },
        newMsg: function() {
            console.log("*** newMsg ", this.newMsg)
            if(this.newMsg == null) {
                return;
            }
            if(!this._timelineWindow) {
                return;
            }
            this.showGroupName(this.curChat);
            this._timelineWindow.paginate("f", 10).then(() => {
                var senderId = this.newMsg.sender ? this.newMsg.sender.userId : this.newMsg.event.sender;
                var msgType = this.newMsg.getContent().msgtype;
                if(senderId = this.$store.state.userId && msgType == "m.text") {
                    var getMessageList = this._getEvents();
                    for(let i=0;i<getMessageList.length;i++) {
                        for(let j=this.messageList.length-1;j>= 0;j--) {
                            if(this.messageList[j]._txnId == getMessageList[i].getTxnId() && !this.messageList[j].event.event_id) {
                                console.log("*** this.messageList[j] ", this.messageList[j]);
                                this.messageList[j].message_status = 0;
                                this.messageList[j] = getMessageList[i];
                                this.updatemsgStatus = {
                                    "id": this.messageList[j]._txnId ? this.messageList[j]._txnId : this.messageList[j].event.event_id,
                                    "status": 0
                                };
                                
                                break;
                            }
                        }
                    }
                }
                else {
                    this.messageList = this._getEvents();
                }
                console.log("*** to get new message ", this.messageList);
            })
            setTimeout(() => {
                this.$nextTick(() => {
                    var div = document.getElementById("message-show-list");
                    if(div) {
                        div.scrollTo({ top:div.scrollHeight, behavior: 'smooth' })
                    }
                })
            }, 100)
        }
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar-track-piece {
        background-color: #F1F1F1;
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
        max-width: 150px;
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
        overflow-y: scroll;
        overflow-x: hidden;
        border-bottom: 1px solid rgba(221, 221, 221, 1);
        border-top: 1px solid rgba(221, 221, 221, 1);
        li {
            list-style-type: none;
        }
    }

    .msg-list-enter-active, .msg-list-leave-active {
        transition: all .1s;
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
        margin-left: 56px;
        margin-right: 56px;
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
        margin-left: 56px;
        margin-right: 56px;
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
        margin-left: 56px;
        margin-right: 56px;
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
        margin-left: 56px;
        margin-right: 56px;
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
        width: 324px;
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

    .uploadingProc{
        display: block;
        width: 100%;
        float: right;
        height: 18px;
    }

    .upload-file-progress {
        display: inline-block;
        width: 90%;
        float: left;
        margin-top: 6px;
        margin-bottom: 6px;
    }

    .uploadingName {
        display: inline-block;
        width: 10%;
        font-size: 12px;
        height: 18px;
        line-height: 18px;
        font-family: 'PingFangSC-Regular';
        float: left;
        color: rgba(221, 221, 221, 1);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
</style>