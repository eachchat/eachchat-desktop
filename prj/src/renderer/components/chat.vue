<template>
    <div class="chat-page">
        <div class="chat-title">
            <div class="chatInfo">
                <img class="chat-img" id="chat-group-img">
                <p class="chat-name" id="chat-group-name"></p>
                <p class="chat-group-content-num" id="chat-group-content-num"></p>
                <p class="chat-name-state" id="chat-group-state"></p>
            </div>
            <div class="chat-tools">
                <div class="chat-tool-more-div" @click="More()">
                    <img class="chat-tool-more-img" src="../../../static/Img/Chat/more@2x.png">
                </div>
                <div class="chat-tool-invite-div" @click="showAddMembersPrepare()">
                    <img class="chat-tool-invite-img" src="../../../static/Img/Chat/addMember@2x.png">
                </div>
                <div class="chat-tool-call" @click="Call()" v-show=false>
                    <i class="el-icon-phone"></i>
                </div>
            </div>
        </div>
        <div class="chat-main" id="chat-main">
            <div class="chat-main-message" id="message-show">
                <ul class="msg-list" id="message-show-list">
                    <li class="msg-loading" v-show="isRefreshing">
                        <i class="el-icon-loading"></i>
                    </li>
                    <li v-for="(item, index) in messageListShow"
                        :class="ChatLeftOrRightClassName(item)"
                        @contextmenu="rightClick($event, item)"
                        v-bind:key="ChatMessageId(item)">
                        <div class="msg-info-time" v-show="showTimeOrNot(item, messageListShow[index-1])">{{MsgTime(item)}}</div>
                        <div class="chat-notice" v-show="showNoticeOrNot(item)">{{NoticeContent(item)}}</div>
                        <div class="msgContent">
                            <input class="multiSelectCheckbox" :id="msgCheckBoxId(item)" type="checkbox" v-show="showCheckboxOrNot(item)" @change="selectChanged(item)">
                            <imessage :msg="item" :playingMsgId="playingMsgId" :updateMsg="updateMsg" :updateUser="updateUser" :updateMsgStatus="updatemsgStatus" :isGroup="isGroup" v-show="showMessageOrNot(item)" @showImageOfMessage="showImageOfMessage" @openUserInfoTip="openUserInfoTip" @playAudioOfMessage="playAudioOfMessage" @sendAgain="sendAgain"></imessage>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="chat-input" id="chat-input-id" v-show="!multiSelect">
                <div class="chat-input-operate">
                    <div class="chat-input-tool">
                        <Faces v-show="showFace" id="face-box-id" @click="showFace = true" class="faces-box" @insertFace="insertFace"></Faces>
                        <div class="chat-input-expression" @click="showExpression()">
                            <img class="el-icon-emoji" src="../../../static/Img/Chat/emoji@2x.png">
                        </div>
                        <div class="chat-input-picture" @click="insertPic()">
                            <img class="el-icon-picture" src="../../../static/Img/Chat/pic@2x.png">
                        </div>
                        <div class="chat-input-file" @click="insertFiles()">
                            <img class="el-icon-files" src="../../../static/Img/Chat/file@2x.png">
                        </div>
                        <div class="chat-input-history" id="chat-input-history-id" @click="showMsgHistoryOperate()">
                            <img class="el-icon-historys" src="../../../static/Img/Chat/chatHistory-24px@2x.png">
                        </div>
                        <div class="chat-input-more" @click="ShowMore()" style="display:none">
                            <img class="el-icon-more" src="../../../static/Img/Chat/chat_more@3x.png">
                        </div>
                    </div>
                    <div class="chat-send" @click="sendMsg()" v-show="false">
                        <i class="el-icon-s-promotion"></i>
                    </div>
                </div>
                <input type="file" id="fileInput" style="display:none" @change="handleFiles()" multiple>
                <div class="text-input" @keyup="keyHandle($event)">
                    <quillEditor
                        ref="chatQuillEditor"
                        :options="editorOption"
                        @change="inputChanged">
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
                    <div class="multiSelectFavDiv">
                        <div class="multiSelectFav" @click="multiFav"></div>
                        <div class="multiSelectFavText">收藏</div>
                    </div>
                    <div class="multiSelectDelDiv">
                        <div class="multiSelectDel" @click="multiDel"></div>
                        <div class="multiSelectDelText">删除</div>
                    </div>
                    <div class="multiSelectToolCloseDiv">
                        <img class="multiSelectToolClose" src="../../../static/Img/Chat/toolCancel-24px@2x.png" @click="multiToolsClose">
                    </div>
                </div>
            </div>
        </div>
        <transmitDlg  v-show="showTransmitDlg" @closeTransmitDlg="closeTransmitDlg" :curChat="chat" :transmitTogether="transmitTogether" :recentGroups="recentGroups" :transmitMessages="selectedMsgs" :transmitCollection="false" :key="transmitKey">
        </transmitDlg>
        <div id="complextype" class="edit-file-blot" style="display:none;">
            <span class="complex" spellcheck="false" contenteditable="false"></span>
        </div>
        <groupInfoTip v-show="showGroupInfoTips" :showGroupInfo="groupInfo" :updateUser="updateUser" :cleanCache="cleanCache" @showAddMembers="showAddMembers" @openUserInfoTip="openUserInfoTip" @leaveGroup="leaveGroup" @updateChatGroupStatus="updateChatGroupStatus" @updateChatGroupNotice="updateChatGroupNotice" @showOwnerTransferDlg="showOwnerTransferDlg"></groupInfoTip>
        <noticeEditDlg :noticeInfo="groupNoticeInfo" @closeNoticeDlg="closeNoticeDlg" v-show="noticeDialogVisible"/>
        <ownerTransferDlg :GroupInfo="this.ownerTransferchat" @closeOwnerTransferDlg="closeOwnerTransferDlg" v-show="ownerTransferDialogVisible"/>
        <chatMemberDlg :GroupInfo="this.chatMemberDlgchat" :showPosition="cursorPosition" :chatMemberSearchKey="chatMemberSearchKey" @atMember="atMember" v-show="chatMemberDlgVisible"/>
        <userInfoContent :userInfo="userInfo" :isOwn="isOwn" :originPosition="userInfoPosition" v-show="showUserInfoTips" @getCreateGroupInfo="getCreateGroupInfo" :key="userInfoTipKey"></userInfoContent> 
        <chatCreaterDlg v-show="showChatCreaterDlg" :addMemberGroupType="addMemberGroupType" :createNewChat="createNewChat" :addMemberGroupId="chat.group_id" @closeChatCreaterDlg="closeChatCreaterDlg" @getCreateGroupInfo="getCreateGroupInfo" :rootDepartments="chatCreaterDialogRootDepartments" :disableUsers="chatCreaterDisableUsers" :dialogTitle="chatCreaterDialogTitle" :key="chatCreaterKey">
        </chatCreaterDlg>
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

import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import Faces from './faces.vue';
import userInfoTip from './userinfo-tip.vue'
import {makeFlieNameForConflict, getFileSizeNum, generalGuid, Appendzero, FileUtil, findKey, pathDeal, changeStr, fileTypeFromMIME, getIconPath, uncodeUtf16, strMsgContentToJson, JsonMsgContentToString, sliceReturnsOfString, getFileNameInPath, insertStr, getFileSize} from '../../packages/core/Utils.js'
import imessage from './message.vue'
import groupInfoTip from './group-info.vue'
import chatGroupCreater from './chatgroup-creater'
import transmit from './transmit.vue'
import noticeEditDlg from './noticeEditDlg.vue'
import ownerTransferDlg from './ownerTransfer.vue'
import chatMemberDlg from './chatMemberList.vue'
import transmitDlg from './transmitDlg.vue'
import chatCreaterDlg from './chatCreaterDlg.vue'
import { Group, Message, Department, UserInfo } from '../../packages/data/sqliteutil.js'
import userInfoContent from './user-info';

const {Menu, MenuItem, clipboard, nativeImage} = remote;

// Quill.register('modules/imageDrop', ImageDrop);
// Quill.register('modules/resizeImage', resizeImage);

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
    },
    methods: {
        openUserInfoTip:async function(tipInfos) {
            console.log("tip inso if ", tipInfos);
            if(this.showUserInfoTips && tipInfos.userInfo == undefined) {
                this.showUserInfoTips = false;
                return;
            }
            var distUserInfo = tipInfos.userInfo;
            var isMine = tipInfos.isMine;
            // var iconElement = document.getElementById(id);
            this.userInfoPosition.left = tipInfos.absoluteLeft;
            this.userInfoPosition.top = tipInfos.absoluteLeft;
            if(isMine) {
                this.userInfoPosition.left = this.userInfoPosition.left - 280 - 45;
                console.log("isown is ",this.isOwn);
                this.isOwn = true;
            }
            else {
                this.isOwn = false;
            }
            // console.log(iconElement.getBoundingClientRect());
            var tempUserInfo = {};
            //get userinfo
            var user = await UserInfo.GetUserInfo(distUserInfo.user_id);
            tempUserInfo.id = user.user_id;
            tempUserInfo.avatarTUrl = user.avatar_t_url;
            tempUserInfo.displayName = user.user_display_name;
            tempUserInfo.title = user.user_title;
            tempUserInfo.statusDescription = user.status_description;
            tempUserInfo.workDescription = user.work_description;
            tempUserInfo.managerId = user.manager_id;
            tempUserInfo.departmentId = user.belong_to_department_id;
            
            //get department
            var department = await Department.GetDepartmentInfoByUserID(distUserInfo.user_id);
            tempUserInfo.department = department;
            //get email
            var email = await UserInfo.GetUserEmailByUserID(distUserInfo.user_id);
            tempUserInfo.email = email;
            //get phone
            var phone = await UserInfo.GetUserPhoneByUserID(distUserInfo.user_id);
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


            var leaders = await UserInfo.GetLeaders(distUserInfo.user_id);
            tempUserInfo.leaders = leaders;
            console.log("tetempUserInfo is ", tempUserInfo);

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
            ipcRenderer.send("showAnotherWindow", this.chat.group_id, "historyMsgList");
        },
        showFileList: function() {
            console.log("showfilelist");
            // this.showFileListInfo = true;
            // this.fileListGroupInfo = this.chat;
            ipcRenderer.send("showAnotherWindow", this.chat.group_id, "fileList");
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
        updateGroupImg: function(e, args) {
            console.log("argsd is ", args);
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            if(id == this.chat.group_id || id == this.chat.user_id) {
                let elementImg = document.getElementById("chat-group-img");
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                var reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
            }
        },
        rightClick(e, msgItem) {
            console.log("msg is ", msgItem);
            // console.log("e.target is ", e.target.className)
            let distElement = document.getElementById(msgItem.message_id);
            // console.log("distElement is ", distElement.className);
            if(this.checkClassName.indexOf(e.target.className) == -1) {
                return;
            }
            this.menu = new Menu();
            if(msgItem.message_type == 101) {
                this.menu.append(new MenuItem({
                    label: "复制",
                    click: () => {
                        this.menuCopy(msgItem)
                    }
                }));
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
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                this.menu.append(new MenuItem({
                    label: "多选",
                    click: () => {
                        this.msgMultiSelect(msgItem);
                    }
                }));
            }
            else if(msgItem.message_type == 102) {
                this.menu.append(new MenuItem({
                    label: "复制",
                    click: () => {
                        this.menuCopy(msgItem)
                    }
                }));
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
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                this.menu.append(new MenuItem({
                    label: "多选",
                    click: () => {
                        this.msgMultiSelect(msgItem);
                    }
                }));
            }
            else if(msgItem.message_type == 103) {
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
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                this.menu.append(new MenuItem({
                    label: "多选",
                    click: () => {
                        this.msgMultiSelect(msgItem);
                    }
                }));
            }
            else if(msgItem.message_type == 105) {
                this.menu.append(new MenuItem({
                    label: "收藏",
                    click: () => {
                        this.menuFav(msgItem)
                    }
                }));
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                this.menu.append(new MenuItem({
                    label: "多选",
                    click: () => {
                        this.msgMultiSelect(msgItem);
                    }
                }));
            }
            else if(msgItem.message_type == 106) {
                this.menu.append(new MenuItem({
                    label: "转发",
                    click: () => {
                        this.transMit(msgItem)
                    }
                }));
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                this.menu.append(new MenuItem({
                    label: "多选",
                    click: () => {
                        this.msgMultiSelect(msgItem);
                    }
                }));
            }

            this.menu.popup(remote.getCurrentWindow());
        },
        menuDelete(msg) {
            Message.DeleteMessage(msg.message_id);
            for(let i=0;i<this.messageList.length;i++) {
                if(this.messageList[i].sequence_id == msg.sequence_id) {
                    this.messageList.splice(i, 1);
                    break;
                }
            }
        },
        menuCopy(msg) {
            var msgContent = strMsgContentToJson(msg.message_content);
            if(msg.message_type == 101) {
                clipboard.writeText(msgContent.text);
            }
            else if(msg.message_type == 102) {
                var div = document.getElementById(msg.message_id);
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNode(div);
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('copy');
                selection.removeAllRanges();
                // div.contentEditable = 'true';
                // var controlRange;
                // if(document.body.createControlRange) {
                //     controlRange = document.body.createControlRange();
                //     controlRange.addElement(div);
                //     console.log("controlRange is ", controlRange);
                //     controlRange.execCommand('Copy');
                // }
                // div.contentEditable = 'false';
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
            this.recentGroups = await Group.GetGroupByTime();
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
            this.recentGroups = await Group.GetGroupByTime();
            this.transmitKey ++;
            this.showTransmitDlg = true;
            this.transmitTogether = false;
        },
        showAddMembersPrepare: async function() {
            // var memeberList = this.chat.contain_user_ids.split(",");
            // this.showAddMembers(memeberList);
            ////////////////////////////////////////////////////
            var self = await services.common.GetSelfUserModel();
            console.log("self is ", self);
            this.chatCreaterDisableUsers.push(self.id);
            console.log("chatCreaterDisableUsers is ", this.chatCreaterDisableUsers);
            if(this.chat.contain_user_ids.length != 0) {
                var contain_user_ids = this.chat.contain_user_ids.split(",");
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
            var temp = [];
            for(var i = 0; i < rootDepartmentModels.length; i ++) {
                var department = rootDepartmentModels[i];
                temp[department.show_order] = department;
            }
            console.log("tempt is ", temp);
            this.chatCreaterDialogRootDepartments =  temp;
            
            this.createNewChat = false;
            this.addMemberGroupType = this.chat.group_type;
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
            this.chatCreaterDisableUsers = existedMembers;
            var self = await services.common.GetSelfUserModel();
            console.log("self is ", self);
            this.chatCreaterDisableUsers.push(self.id);
            console.log("chatCreaterDisableUsers is ", this.chatCreaterDisableUsers);
            var root = await Department.GetRoot();
            console.log("root is ", root);
            var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
            console.log("rootDepartmentModels is ", rootDepartmentModels);
            var temp = [];
            for(var i = 0; i < rootDepartmentModels.length; i ++) {
                var department = rootDepartmentModels[i];
                temp[department.show_order] = department;
            }
            console.log("tempt is ", temp);
            this.chatCreaterDialogRootDepartments =  temp;
            
            this.chatCreaterKey ++;
            this.createNewChat = false;
            this.addMemberGroupType = this.chat.group_type;
            this.showChatCreaterDlg = true;
            this.chatCreaterDialogTitle = "添加成员";
        },
        AddNewMembers: async function() {
            console.log("add member s ", this.usersSelected);
            var addUids = [];
            for(var i=0;i<this.usersSelected.length;i++) {
                addUids.push(this.usersSelected[i].id)
            }
            var ret = await services.common.AddGroupUsers(this.chat.group_id, addUids);
            console.log("AddGroupUsers ret is ", ret);
            this.dialogVisible = false;
        },
        async menuFav(msg) {
            console.log("fav msg is ", msg);
            console.log("cointent is ", strMsgContentToJson(msg.message_content));
            var ret = await services.common.CollectMessage([msg.time_line_id]);
            if(ret) {
                //
            }
            else {
                //
            }
        },
        async multiFav() {
            var toFavMsgIds = [];
            for(let i=0;i<this.selectedMsgs.length;i++) {
                toFavMsgIds.push(this.selectedMsgs[i].time_line_id);
            }
            // console.log("fav msg is ", msg);
            // console.log("cointent is ", strMsgContentToJson(msg.message_content));
            var ret = await services.common.CollectMessage(toFavMsgIds);
            if(ret) {
                //
            }
            else {
                //
            }
            this.multiToolsClose();
        },
        multiDel() {
            console.log("this.selectedMsgs is ", this.selectedMsgs);
            for(let i=0;i<this.selectedMsgs.length;i++) {
                Message.DeleteMessage(this.selectedMsgs[i].message_id);
                for(let j=0;j<this.messageList.length;j++) {
                    if(this.messageList[j].sequence_id == this.selectedMsgs[i].sequence_id) {
                        this.messageList.splice(j, 1);
                        break;
                    }
                }
            }
            this.multiToolsClose();
        },
        multiToolsClose() {
            this.multiSelect = false;
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
                if(this.selectedMsgs[i].message_id == curMsg.message_id) {
                    this.selectedMsgs.splice(i, 1);
                    hasSelected = true;
                    break;
                }
            }
            if(!hasSelected) {
                this.selectedMsgs.push(curMsg);
            }
        },
        closeTransmitDlg() {
            this.showTransmitDlg = false;
            this.cleanSelected();
            this.selectedMsgs = [];
            this.multiSelect = false;
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
        },
        inputChanged(content) {
            // console.log("content is ", content);
            this.curContent = content.text;
            // console.log("this.curContent is ", this.curContent);
            var atIndex = this.curContent.lastIndexOf("@");
            // console.log("atIndex is ", atIndex);
            if(this.chatMemberDlgVisible) {
                var getSearchKey = this.curContent.substring(atIndex + 1, this.curInputIndex).trim();
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
            }
        },
        deleteDistContent() {
            var content = this.editor.getContents();
            var index = 0;
            var distContent = "@";
            if(this.chatMemberSearchKey != null) {
                distContent = distContent + this.chatMemberSearchKey;
            }
            distContent = distContent.trim();
            for(var i=0;i<content.ops.length;i++) {
                if(content.ops[i].insert.span == undefined) {
                    // console.log("content.ops[i].insert ", content.ops[i].insert);
                    // console.log("distContent ", distContent);
                    if(content.ops[i].insert.indexOf(distContent) != -1) {
                        // console.log("curInputIndex is ", this.curInputIndex);
                        content.ops[i].insert = content.ops[i].insert.replace(distContent, "");
                        // console.log("curInputIndex is ", this.curInputIndex);
                        // console.log("content.ops[i].insert ", content.ops[i].insert);
                        this.editor.setContents(content);
                        // this.editor.setSelection(500);
                        // console.log("curInputIndex is ", this.curInputIndex);
                        // console.log("cursor index is ", this.curInputIndex - distContent.length);
                        this.curInputIndex = this.curInputIndex - distContent.length;
                        break;
                    }
                }
            }
        },
        keyHandle(event) {
            // console.log("event ", event)
            // console.log("clipboard ", clipboard.readImage())
            var range = this.editor.getSelection();
            var content = this.editor.getContents();
            this.curInputIndex = range==null ? 0 : range.index;
            // console.log("this.curInputIndex is ", this.curInputIndex);

            if(event.code == "Enter" && !event.ctrlKey) {
                this.sendMsg();
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
            else if(event.keyCode == 50 && event.key == "@") {
                if(this.chat.group_type == 102) {
                    return;
                }
                this.chatMemberDlgVisible = false;
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
                this.chatMemberDlgchat = this.chat;
            }
        },
        atMember(atMemberInfo) {
            // File
            console.log("atmemberinfo is ", atMemberInfo);
            var iconPath = "";
            this.deleteDistContent();
            var complexSpan = document.getElementById('complextype').firstElementChild.cloneNode(true);
            complexSpan.id = generalGuid();
            complexSpan.innerHTML = "@" + atMemberInfo.user_display_name;
            var distStyle = this.atConstStyle
            // 'display:inline-block;outline:none;border: 0px;font-size:14px;font-family:Microsoft YaHei',
            // console.log("diststyle is ", distStyle);
            complexSpan.style = distStyle;
            let msgInfo = {
                "path": "",
                "type": "at",
                "height": 0,
                "width": 0,
                "atUid": atMemberInfo.user_id,
                "atName": atMemberInfo.user_display_name,
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
        },
        getCreateGroupInfo(groupInfo) {
            console.log("chat get create group info is ", groupInfo);
            this.$emit('getCreateGroupInfo', groupInfo);
            this.showUserInfoTips = false;
        },
        showImageOfMessage(imgSrcInfo) {
            this.$emit('showImageOfMessage', imgSrcInfo);
        },
        playAudioOfMessage(audioMsgId) {
            this.playingMsgId = audioMsgId;
        },
        // openUserInfoTip(tipInfos) {
        //     console.log("tip inso if ", tipInfos);
        //     this.showUserInfoTips = true;
        // },
        closeInfoTip(e){
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
            }
            
            var msgHistoryMenuElement = document.getElementById("history-dropdown-content-id");
            if(msgHistoryMenuElement != undefined && e.target.className != "chat-input-history" && e.target.className != "el-icon-historys") {
                msgHistoryMenuElement.style.display = "none";
            }

            console.log("e.target.classname ", e.target.className)
            if(e.target.className.indexOf('userInfo') == -1){
                this.showUserInfoTips = false;
            }

            var faceElement = document.getElementById("face-box-id");
            if(faceElement != null && !faceElement.contains(e.target) && e.target.className != "el-icon-emoji"){
                this.showFace = false;
            }
        },
        showExpression: function() {
            this.showFace = !this.showFace;
        },
        showGroupName: async function(chatGroupItem) {
            if(chatGroupItem.group_id == undefined && chatGroupItem.user_id == undefined){
                return "";
            }
            var groupNameElement = document.getElementById("chat-group-name");
            var groupIcoElement = document.getElementById("chat-group-img");
            var groupStateElement = document.getElementById("chat-group-state");
            var groupContentNumElement = document.getElementById("chat-group-content-num");
            console.log("getShowGroupName is ", chatGroupItem)
            var groupName = chatGroupItem.group_name;
            var groupContentNum = "";
            var aboutUids = chatGroupItem.contain_user_ids.split(",");
            var groupUidNameList = [];
            if(groupName.length == 0) {
                for(var i=0;i<aboutUids.length;i++) {
                    let nameTmp = this.$store.getters.getChatUserName(aboutUids[i]);
                    groupUidNameList.unshift(nameTmp);
                    if(i > 3) {
                            break;
                        }
                }
                groupName = groupUidNameList.join(",");
            }
            if(this.chat.group_type == 101) {
                groupContentNum = '(' + aboutUids.length + ')';
            }
            groupNameElement.innerHTML = groupName;
            groupContentNumElement.innerHTML = groupContentNum;
            
            var targetPath = "";
            var distId = "";
            if(chatGroupItem.group_id != undefined && chatGroupItem.group_id.length != 0) {
                distId = chatGroupItem.group_id;
            }
            else {
                distId = chatGroupItem.user_id;
            }
            if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(chatGroupItem.group_avarar, distId))){
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    groupIcoElement.setAttribute("src", reader.result);
                }
            }

            var groupState = "";
            if(chatGroupItem.group_type == 102) {
                if(chatGroupItem.owner == null || chatGroupItem.owner == undefined) {
                    var ownerInfo = await services.common.GetDistUserinfo(chatGroupItem.user_id);
                }
                else {
                    var ownerInfo = await services.common.GetDistUserinfo(chatGroupItem.owner);
                }
                console.log("================ ownerInfo ", ownerInfo)
                groupState = ownerInfo[0].status_description;
                // console.log("================ ", ownerInfo)
            }
            groupStateElement.innerHTML = groupState;
        },
        insertFace: function(item) {
            var range = this.editor.getSelection();
            var curIndex = range==null ? 0 : range.index;
            this.editor.insertText(curIndex, uncodeUtf16(item));
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
                    if(this.waitForSendingFiles.indexOf(fileList[i] != -1)) {
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
            }
        },
        cleanEditor: function() {
            this.editor.container.getElementsByClassName("ql-editor")[0].innerHTML = "";
        },
        insertPic: function() {
            // File
            ipcRenderer.send('open-image-dialog', 'openFile');
            if(!this.ipcInited){
                this.ipcInited = true;
                ipcRenderer.on('selectedImageItem', this.nHandleFiles);
            }
        },
        insertFiles: function() {
            ipcRenderer.send('open-directory-dialog', 'openFile');
            if(!this.ipcInited){
                this.ipcInited = true;
                ipcRenderer.on('selectedItem', this.nHandleFiles);
            }
        },
        insertImg: function() {
            // console.log("============== this is ", this);
        },
        nHandleFiles: function(e, paths) {
            // Select Same File Failed.
            var fileList = paths;
            // console.log("======", fileList)
            if(fileList === null || fileList.length === 0) {
                alert("请选择一个文件/文件夹。");
            }
            else {
                for(var i=0;i<fileList.length;i++) {
                    var curPath = fileList[i]
                    // console.log("filelist[i] = ", fileList[i])
                    if(this.waitForSendingFiles.indexOf(fileList[i] != -1)) {
                        var range = this.editor.getSelection();
                        var curIndex = range==null ? 0 : range.index;

                        var showfu = new FileUtil(fileList[i]);
                        var showfileObj = showfu.GetUploadfileobj();
                        var imgurl = URL.createObjectURL(showfileObj)
                        var fileType = showfu.GetMimename();
                        if(fileType == undefined) {
                            fileType = path.extname(fileList[i]);
                        }
                        var fileExt = showfu.GetExtname();
                        var fileName = path.basename(fileList[i]);//showfu.GetFilename()

                        if(fileType.split("/")[0] == "image"){
                            // Image
                            var img = new Image();
                            img.src = fileList[i];
                            img.onload = () => {
                                var imgHeight = 46;
                                var imgWidth = img.width * (46/img.height);
                                var range = this.editor.getSelection();
                                var curIndex = range==null ? 0 : range.index;
                                var complexSpan = document.getElementById('complextype').firstElementChild.cloneNode(true);
                                complexSpan.id = generalGuid();
                                complexSpan.innerHTML = " ";
                                var indexUrl = this.imgConstStyle.indexOf("background-image: url(") + "background-image: url(".length;
                                var distStyle = insertStr(this.imgConstStyle, indexUrl, imgurl);
                                var indexWidth = this.imgConstStyle.indexOf(";width:") + ";width:".length;
                                distStyle = insertStr(distStyle, indexWidth, imgWidth.toString() + "px");
                                // 'display:inline-block;border-radius: 5px;border: 1px solid rgb(218,218,221);width: 200px;height: 46px;background-repeat: no-repeat;background-image: url("/static/Img/Chat/doc@2x.png");background-size: contain;line-height: 46px;text-indent:40px;'
                                complexSpan.style = distStyle;
                                let msgInfo = {
                                    "path": curPath,
                                    "type": "image",
                                    "height": img.height,
                                    "width": img.width
                                };
                                this.idToPath[complexSpan.id] = msgInfo;

                                this.editor.insertEmbed(curIndex, 'span', complexSpan);
                                this.editor.setSelection(this.editor.selection.savedRange.index + 1);
                                this.editor.insertText(curIndex + 1, " ");
                            }
                        }
                        else {
                            // File
                            var iconPath = getIconPath(fileExt);
                            // console.log("iconpath is ", iconPath)
                            var range = this.editor.getSelection();
                            var curIndex = range==null ? 0 : range.index;
                            var complexSpan = document.getElementById('complextype').firstElementChild.cloneNode(true);
                            complexSpan.id = generalGuid();
                            complexSpan.innerHTML = "            " + fileName;
                            var indexTemp = this.constStyle.indexOf("background-image: url(") + "background-image: url(".length;
                            var distStyle = insertStr(this.constStyle, indexTemp, iconPath);
                            // 'display:inline-block;border-radius: 5px;border: 1px solid rgb(218,218,221);width: 200px;height: 46px;background-repeat: no-repeat;background-image: url("/static/Img/Chat/doc@2x.png");background-size: contain;line-height: 46px;text-indent:40px;'
                            // console.log("diststyle is ", distStyle);
                            complexSpan.style = distStyle;
                            let msgInfo = {
                                "path": curPath,
                                "type": "file",
                                "height": 0,
                                "width": 0
                            };
                            this.idToPath[complexSpan.id] = msgInfo;

                            this.editor.insertEmbed(curIndex, 'span', complexSpan);
                            this.editor.setSelection(this.editor.selection.savedRange.index + 1);
                            this.editor.insertText(curIndex + 1, " ");
                        }
                    }
                    // console.log("finished")
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
        // Send msg demo
        ssendMsg: function() {
        },
        sendAgain: async function(retryMsg) {
            // console.log("retryMsg is ", retryMsg);
        
            var uid = this.chat.user_id;
            var gorupId = this.chat.group_id == null ? '' : this.chat.group_id;
        
            let curMsgItem = retryMsg;
            let curTimeSeconds = new Date().getTime();

            var filePath = curMsgItem.file_local_path;
            
            if(curMsgItem.message_type == 103) {
                let sendingMsgContentType = 103;
                let willShowMsgContent = curMsgItem.message_content;
                let guid = curMsgItem.message_id;
                let willSendMsg = {
                    "message_content": willShowMsgContent,
                    "message_from_id": this.curUserInfo.id,
                    "group_id": gorupId,
                    "message_timestamp": curTimeSeconds,
                    "message_type": sendingMsgContentType,
                    "message_id": guid,
                    "file_local_path": filePath,
                    "message_status": 1
                    };
                for(var i=0;i<this.messageList.length;i++){
                    if(this.messageList[i].message_id == guid){
                        this.messageList[i].message_status = 1;
                        this.updatemsgStatus = {
                            "id": guid,
                            "status": 1
                            };
                        break;
                    }
                }
                this.needToBottom = true;
                // console.log("willsendmsg is ", willSendMsg);

                let div = document.getElementById("message-show-list");
                setTimeout(() => {
                    if(div) {
                        this.$nextTick(() => {
                            div.scrollTop = div.scrollHeight;
                        })
                    }
                }, 0)
                
                this.cleanEditor();

                services.common.uploadFile(pathDeal(filePath))
                    .then((ret) => {
                        // ToDo Failed List
                        // console.log("UploadFile response ", ret);
                        if (!ret.ok || !ret.success) 
                        {
                            for(var i=0;i<this.messageList.length;i++){
                                if(this.messageList[i].message_id == guid){
                                    this.messageList[i].message_status = 2;
                                    this.updatemsgStatus = {
                                        "id": guid,
                                        "status": 2
                                    };
                                    break;
                                }
                            }
                        }
                        if (!("obj" in ret.data)) 
                        {
                            for(var i=0;i<this.messageList.length;i++){
                                if(this.messageList[i].message_id == guid){
                                    this.messageList[i].message_status = 2;
                                    this.updatemsgStatus = {
                                        "id": guid,
                                        "status": 2
                                    };
                                    break;
                                }
                            }
                        }

                        var uploadRetData = ret.data.obj;
                        let willSendMsgContent = {};
                        willSendMsgContent.ext = uploadRetData.ext;
                        willSendMsgContent.fileName = uploadRetData.fileName.indexOf('/') != -1 ? path.basename(uploadRetData.fileName) : uploadRetData.fileName;
                        willSendMsgContent.url = uploadRetData.url;
                        willSendMsgContent.fileSize = uploadRetData.fileSize;

                        services.common.sendNewMessage(
                                guid, 
                                sendingMsgContentType, 
                                this.curUserInfo.id, 
                                gorupId, 
                                uid, 
                                curTimeSeconds, 
                                willSendMsgContent)
                            .then(async (ret) => {
                                // console.log("send img message ret ", ret)
                                if(ret == undefined) {
                                    for(var i=0;i<this.messageList.length;i++){
                                        if(this.messageList[i].message_id == guid){
                                            this.messageList[i].message_status = 2;
                                            this.updatemsgStatus = {
                                                "id": guid,
                                                "status": 2
                                            };
                                            break;
                                        }
                                    }
                                    await Message.SetMessageStatus(guid, 2);
                                }
                                else {
                                    for(var i=0;i<this.messageList.length;i++){
                                        if(this.messageList[i].message_id == guid){
                                            this.messageList[i] = ret;
                                            this.updatemsgStatus = {
                                                "id": guid,
                                                "status": 0
                                            };
                                            break;
                                        }
                                    }
                                    // this.$store.commit("updateChatGroup", obj.message);
                                    this.$emit('updateChatList', ret);

                                }
                            })
                    })
            }
            else if(curMsgItem.message_type == 102) {
                let sendingMsgContentType = 102;
                let willShowMsgContent = curMsgItem.message_content;
                let guid = curMsgItem.message_id;
                let willSendMsg = {
                    "message_content": willShowMsgContent,
                    "message_from_id": this.curUserInfo.id,
                    "group_id": gorupId,
                    "message_timestamp": curTimeSeconds,
                    "message_type": sendingMsgContentType,
                    "message_id": guid,
                    "file_local_path": filePath,
                    "message_status": 1
                    };
                for(var i=0;i<this.messageList.length;i++){
                    if(this.messageList[i].message_id == guid){
                        this.messageList[i].message_status = 1;
                        this.updatemsgStatus = {
                            "id": guid,
                            "status": 1
                        };
                        break;
                    }
                }
                this.needToBottom = true;

                let div = document.getElementById("message-show-list");
                setTimeout(() => {
                    if(div) {
                        this.$nextTick(() => {
                            div.scrollTop = div.scrollHeight;
                        })
                    }
                }, 0)
                
                this.cleanEditor();

                services.common.uploadFile(pathDeal(filePath))
                    .then((ret) => {
                        if (!ret.ok || !ret.success) 
                        {
                            for(var i=0;i<this.messageList.length;i++){
                                if(this.messageList[i].message_id == guid){
                                    this.messageList[i].message_status = 2;
                                    this.updatemsgStatus = {
                                        "id": guid,
                                        "status": 2
                                    };
                                    break;
                                }
                            }
                        }
                        if (!("obj" in ret.data)) 
                        {
                            for(var i=0;i<this.messageList.length;i++){
                                if(this.messageList[i].message_id == guid){
                                    this.messageList[i].message_status = 2;
                                    this.updatemsgStatus = {
                                        "id": guid,
                                        "status": 2
                                    };
                                    break;
                                }
                            }
                        }
                        // ToDo Failed List
                        console.log("UploadFile response ", ret);
                        var uploadRetData = ret.data.obj;
                        let willSendMsgContent = {};
                        willSendMsgContent.ext = uploadRetData.ext;
                        willSendMsgContent.fileName = uploadRetData.fileName.indexOf('/') != -1 ? path.basename(uploadRetData.fileName) : uploadRetData.fileName;;
                        willSendMsgContent.url = uploadRetData.url;
                        willSendMsgContent.middleImage = uploadRetData.middleImage;
                        willSendMsgContent.thumbnailImage = uploadRetData.thumbnailImage;
                        willSendMsgContent.imgWidth = uploadRetData.imgWidth;
                        willSendMsgContent.imgHeight = uploadRetData.imgHeight;
                        willSendMsgContent.fileSize = uploadRetData.fileSize;

                        services.common.sendNewMessage(
                                guid, 
                                sendingMsgContentType, 
                                this.curUserInfo.id, 
                                gorupId, 
                                uid, 
                                curTimeSeconds, 
                                willSendMsgContent)
                            .then(async (ret) => {
                                // console.log("send img message ret ", ret)
                                if(ret == undefined) {
                                    for(var i=0;i<this.messageList.length;i++){
                                        if(this.messageList[i].message_id == guid){
                                            this.messageList[i].message_status = 2;
                                            this.updatemsgStatus = {
                                                "id": guid,
                                                "status": 2
                                            };
                                            break;
                                        }
                                    }
                                    await Message.SetMessageStatus(guid, 2);
                                }
                                else {
                                    for(var i=0;i<this.messageList.length;i++){
                                        // console.log("cur guie is ", guid)
                                        // console.log("the messagelist guid is ", this.messageList[i].message_id)
                                        if(this.messageList[i].message_id == guid){
                                            console.log("update ret")
                                            this.messageList[i] = ret;
                                            this.updatemsgStatus = {
                                                "id": guid,
                                                "status": 0
                                            };
                                            break;
                                        }
                                    }
                                    // console.log("Send Image msg list is ", this.messageList)
                                    // console.log("Send Image msg list content is ", strMsgContentToJson(this.messageList.message_content))
                                    // this.$store.commit("updateChatGroup", obj.message);
                                    this.$emit('updateChatList', ret);
                                }
                            })
                    })
            
            }
            else if(curMsgItem.message_type == 101) {
                let sendingMsgContentType = 101;
                
                let willSendMsgContent = strMsgContentToJson(curMsgItem.message_content);
                let guid = curMsgItem.message_id;
                // next is @
                var curindex = i;

                var willShowMsgContent = JsonMsgContentToString(willSendMsgContent);
                let willSendMsg = {
                    "message_content": willShowMsgContent,
                    "message_from_id": this.curUserInfo.id,
                    "group_id": gorupId,
                    "message_timestamp": curTimeSeconds,
                    "message_type": sendingMsgContentType,
                    "message_id": guid,
                    "message_status": 1
                    };

                for(var i=0;i<this.messageList.length;i++){
                    if(this.messageList[i].message_id == guid){
                        this.messageList[i].message_status = 1;
                        this.updatemsgStatus = {
                            "id": guid,
                            "status": 1
                        };
                        break;
                    }
                }
                this.needToBottom = true;
                
                let div = document.getElementById("message-show-list");
                setTimeout(() => {
                    if(div) {
                        this.$nextTick(() => {
                            console.log("div scrolltop is ", div.scrollHeight)
                            div.scrollTop = div.scrollHeight;
                        })
                    }
                }, 0)
                
                this.cleanEditor();

                services.common.sendNewMessage(
                        guid, 
                        sendingMsgContentType, 
                        this.curUserInfo.id, 
                        gorupId, 
                        uid, 
                        curTimeSeconds, 
                        willSendMsgContent)
                    .then(async (ret) => {
                        // console.log("sendNewMessage ret is ", ret);
                        console.log("guid is ", guid);
                        if(ret == undefined) {
                            for(var i=0;i<this.messageList.length;i++){
                                if(this.messageList[i].message_id == guid){
                                    this.messageList[i].message_status = 2;
                                    this.updatemsgStatus = {
                                        "id": guid,
                                        "status": 2
                                    };
                                    break;
                                }
                            }
                            await Message.SetMessageStatus(guid, 2);
                        }
                        else {
                            for(var d=0;d<this.messageList.length;d++){
                                if(this.messageList[d].message_id == guid){
                                    this.messageList[d] = ret;
                                    this.updatemsgStatus = {
                                        "id": guid,
                                        "status": 0
                                    };
                                    if(this.existingMsgId.indexOf(ret.message_id) == -1) {
                                        this.existingMsgId.push(ret.message_id);
                                    }
                                    break;
                                }
                            }
                            // this.$store.commit("updateChatGroup", obj.message);
                            this.$emit('updateChatList', ret);

                        }
                    })
            }
            else if(curMsgItem.message_type == 106) {
                let sendingMsgContentType = 106;
                
                let willSendMsgContent = strMsgContentToJson(curMsgItem.message_content);
                let guid = curMsgItem.message_id;
                // next is @
                var curindex = i;

                var willShowMsgContent = JsonMsgContentToString(willSendMsgContent);
                let willSendMsg = {
                    "message_content": willShowMsgContent,
                    "message_from_id": this.curUserInfo.id,
                    "group_id": gorupId,
                    "message_timestamp": curTimeSeconds,
                    "message_type": sendingMsgContentType,
                    "message_id": guid,
                    "message_status": 1
                    };

                for(var i=0;i<this.messageList.length;i++){
                    if(this.messageList[i].message_id == guid){
                        this.messageList[i].message_status = 1;
                        this.updatemsgStatus = {
                            "id": guid,
                            "status": 1
                        };
                        break;
                    }
                }
                this.needToBottom = true;
                
                let div = document.getElementById("message-show-list");
                setTimeout(() => {
                    if(div) {
                        this.$nextTick(() => {
                            console.log("div scrolltop is ", div.scrollHeight)
                            div.scrollTop = div.scrollHeight;
                        })
                    }
                }, 0)
                
                this.cleanEditor();

                services.common.sendNewMessage(
                        guid, 
                        sendingMsgContentType, 
                        this.curUserInfo.id, 
                        gorupId, 
                        uid, 
                        curTimeSeconds, 
                        willSendMsgContent)
                    .then(async (ret) => {
                        // console.log("sendNewMessage ret is ", ret);
                        // console.log("guid is ", guid);
                        if(ret == undefined) {
                            for(var i=0;i<this.messageList.length;i++){
                                if(this.messageList[i].message_id == guid){
                                    this.messageList[i].message_status = 2;
                                    this.updatemsgStatus = {
                                        "id": guid,
                                        "status": 2
                                    };
                                    break;
                                }
                            }
                            await Message.SetMessageStatus(guid, 2);
                        }
                        else {
                            for(var d=0;d<this.messageList.length;d++){
                                if(this.messageList[d].message_id == guid){
                                    this.messageList[d] = ret;
                                    this.updatemsgStatus = {
                                        "id": guid,
                                        "status": 0
                                    };
                                    if(this.existingMsgId.indexOf(ret.message_id) == -1) {
                                        this.existingMsgId.push(ret.message_id);
                                    }
                                    break;
                                }
                            }
                            // this.$store.commit("updateChatGroup", obj.message);
                            this.$emit('updateChatList', ret);

                        }
                    })
            }

        },
        sendMsg: async function() {
            // console.log("this.chat is ", this.chat);
            if(this.chat.group_id == undefined && this.chat.user_id == undefined) {
                alert("请选择一个群组。")
                return;
            }
            let varcontent = this.editor.getContents();
            if(varcontent == null || varcontent.length == 0) {
                // toDo To Deal The \n
                alert("不能发送空白信息。")
            }
            else{
                // console.log("varcontent is ", varcontent);
                var uid = this.chat.user_id;
                var gorupId = this.chat.group_id == null ? '' : this.chat.group_id;
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
                        if(fileType == "file"){
                            let fileName = path.basename(filePath);//getFileNameInPath(filePath);
                            let ext = filePath.split(".").pop();
                            let fileSize = await getFileSizeNum(filePath);
                            // console.log("=========filesize ", fileSize);
                            let sendingMsgContentType = 103;
                            // let ext = filePath.split(".").pop();
                            let willShowMsgContent = JsonMsgContentToString({
                                "ext":ext,
                                "fileName":fileName,
                                "url":"",
                                "fileSize": fileSize
                            })
                            let guid = generalGuid();
                            let willSendMsg = {
                                "message_content": willShowMsgContent,
                                "message_from_id": this.curUserInfo.id,
                                "group_id": gorupId,
                                "message_timestamp": curTimeSeconds,
                                "message_type": sendingMsgContentType,
                                "message_id": guid,
                                "message_status": 1
                                };
                            this.messageList.push(willSendMsg);
                            this.needToBottom = true;
                            // console.log("willsendmsg is ", willSendMsg);
                            this.existingMsgId.push(willSendMsg.message_id);

                            let div = document.getElementById("message-show-list");
                            setTimeout(() => {
                                if(div) {
                                    this.$nextTick(() => {
                                        div.scrollTop = div.scrollHeight;
                                    })
                                }
                            }, 0)
                            
                            this.cleanEditor();

                            services.common.uploadFile(pathDeal(filePath))
                                .then((ret) => {
                                    // ToDo Failed List
                                    // console.log("UploadFile response ", ret);
                                    if (!ret.ok || !ret.success) 
                                    {
                                        for(var i=0;i<this.messageList.length;i++){
                                            if(this.messageList[i].message_id == guid){
                                                this.messageList[i].message_status = 2;
                                                this.updatemsgStatus = {
                                                    "id": guid,
                                                    "status": 2
                                                };
                                                break;
                                            }
                                        }
                                    }
                                    if (!("obj" in ret.data)) 
                                    {
                                        for(var i=0;i<this.messageList.length;i++){
                                            if(this.messageList[i].message_id == guid){
                                                this.messageList[i].message_status = 2;
                                                this.updatemsgStatus = {
                                                    "id": guid,
                                                    "status": 2
                                                };
                                                break;
                                            }
                                        }
                                    }

                                    var uploadRetData = ret.data.obj;
                                    let willSendMsgContent = {};
                                    willSendMsgContent.ext = uploadRetData.ext;
                                    willSendMsgContent.fileName = uploadRetData.fileName.indexOf('/') != -1 ? path.basename(uploadRetData.fileName) : uploadRetData.fileName;
                                    willSendMsgContent.url = uploadRetData.url;
                                    willSendMsgContent.fileSize = uploadRetData.fileSize;
                                    var send_uid = "";
                                    if(gorupId.length == 0) {
                                        send_uid = uid;
                                    }
                                    services.common.sendNewMessage(
                                            guid, 
                                            sendingMsgContentType, 
                                            this.curUserInfo.id, 
                                            gorupId, 
                                            send_uid, 
                                            curTimeSeconds, 
                                            willSendMsgContent)
                                        .then(async (ret) => {
                                            console.log("send img message ret ", ret)
                                            if(ret == undefined) {
                                                for(var i=0;i<this.messageList.length;i++){
                                                    if(this.messageList[i].message_id == guid){
                                                        this.messageList[i].message_status = 2;
                                                        this.updatemsgStatus = {
                                                            "id": guid,
                                                            "status": 2
                                                        };
                                                        break;
                                                    }
                                                }
                                                await Message.SetMessageStatus(guid, 2);
                                            }
                                            else {
                                                for(var i=0;i<this.messageList.length;i++){
                                                    if(this.messageList[i].message_id == guid){
                                                        var nameTmp = ret.message.fileName;
                                                        var dirTmp = confservice.getFilePath(ret.message_timestamp);
                                                        var pathTmp = path.join(dirTmp, nameTmp);
                                                        var finalPath = await makeFlieNameForConflict(pathTmp);
                                                        try{
                                                            console.log("copy file from ", filePath, " to ", filePath);
                                                            fs.copyFileSync(filePath, finalPath);
                                                        }
                                                        catch(error) {
                                                            console.log("copyFile except ", error);
                                                        }
                                                        ret.file_local_path = finalPath;
                                                        services.common.SetFilePath(ret.message_id, finalPath);
                                                        this.messageList[i] = ret;
                                                        this.updatemsgStatus = {
                                                            "id": guid,
                                                            "status": 2
                                                        };
                                                        break;
                                                    }
                                                }
                                                // this.$store.commit("updateChatGroup", obj.message);
                                                this.$emit('updateChatList', ret);

                                            }
                                        })
                                })
                        }
                        else if(fileType == "at") {
                            let sendingMsgContentType = 101;
                            let mentionUserId = msgInfo.atUid;
                            let mentionUserName = msgInfo.atName;
                            // let ext = filePath.split(".").pop();
                            let willSendMsgContent = {
                                "type":"mention",
                                "text":"@"+mentionUserName,
                                "mentions":[mentionUserId]
                            }
                            for(let j=i+1;j<varcontent.ops.length;j++) {
                                // console.log("====== varcontent j ", j)
                                let nextMsgItem = varcontent.ops[j].insert;
                                if(nextMsgItem.hasOwnProperty("span")) {
                                    var nextFileSpan = nextMsgItem.span;
                                    var nextPathId = nextFileSpan.id;
                                    var nextMsgInfo = this.idToPath[nextPathId];
                                    // console.log("this.idToPath is ", this.idToPath)
                                    var nextFilePath = nextMsgInfo.path;
                                    var nextFileType = nextMsgInfo.type;
                                    if(nextFileType == "at") {
                                        let nextMentionUserId = nextMsgInfo.atUid;
                                        let nextMentionUserName = nextMsgInfo.atName;
                                        willSendMsgContent.text = willSendMsgContent.text + "@" + nextMentionUserName + " ";
                                        willSendMsgContent.mentions.push(nextMentionUserId);
                                        i += 1;
                                    }
                                }
                                else {
                                    if(nextMsgItem.length == 0){
                                        continue;
                                    }
                                    // console.log("nextMsgItem is ", nextMsgItem);
                                    willSendMsgContent.text = willSendMsgContent.text + nextMsgItem;
                                    i += 1;
                                }
                            }
                            // @
                            let willShowMsgContent = JsonMsgContentToString(willSendMsgContent);
                            // console.log("will send msg content ", willSendMsgContent)
                            // console.log("will send msg uid ", uid)
                            let guid = generalGuid();
                            let willSendMsg = {
                                "message_content": willShowMsgContent,
                                "message_from_id": this.curUserInfo.id,
                                "group_id": gorupId,
                                "message_timestamp": curTimeSeconds,
                                "message_type": sendingMsgContentType,
                                "message_id": guid,
                                "message_status": 1
                                };
                            this.messageList.push(willSendMsg);
                            this.needToBottom = true;
                            this.existingMsgId.push(willSendMsg.message_id);
                            
                            let div = document.getElementById("message-show-list");
                            setTimeout(() => {
                                if(div) {
                                    this.$nextTick(() => {
                                        console.log("div scrolltop is ", div.scrollHeight)
                                        div.scrollTop = div.scrollHeight;
                                    })
                                }
                            }, 0)
                            
                            this.cleanEditor();
                            willSendMsg.content = willSendMsgContent;
                            // console.log("willSendMsg is ", willSendMsg);

                            var send_uid = "";
                            if(gorupId.length == 0) {
                                send_uid = uid;
                            }
                            services.common.sendNewMessage(
                                    guid, 
                                    sendingMsgContentType, 
                                    this.curUserInfo.id, 
                                    gorupId, 
                                    send_uid, 
                                    curTimeSeconds, 
                                    willSendMsgContent)
                                .then(async (ret) => {
                                    // console.log("sendNewMessage ret is ", ret);

                                    if(ret == undefined) {
                                        for(var i=0;i<this.messageList.length;i++){
                                            if(this.messageList[i].message_id == guid){
                                                this.messageList[i].message_status = 2;
                                                this.updatemsgStatus = {
                                                    "id": guid,
                                                    "status": 2
                                                };
                                                break;
                                            }
                                        }
                                        await Message.SetMessageStatus(guid, 2);
                                    }
                                    else {
                                        for(var i=0;i<this.messageList.length;i++){
                                            if(this.messageList[i].message_id == guid){
                                                this.messageList[i] = ret;
                                                this.updatemsgStatus = {
                                                    "id": guid,
                                                    "status": 0
                                                };
                                                if(this.existingMsgId.indexOf(ret.message_id) == -1) {
                                                    this.existingMsgId.push(ret.message_id);
                                                }
                                                break;
                                            }
                                        }
                                        // this.$store.commit("updateChatGroup", obj.message);
                                        this.$emit('updateChatList', ret);

                                    }
                                })
                        }
                        else {
                            let sendingMsgContentType = 102;
                            let fileHeight = msgInfo.height;
                            let fileWidth = msgInfo.width;
                            let ext = filePath.split(".").pop();
                            let fileName = path.basename(filePath);//getFileNameInPath(filePath);
                            let willShowMsgContent = JsonMsgContentToString({
                                "ext":ext,
                                "fileName":fileName,
                                "url":"",
                                "middleImage":"",
                                "thumbnailImage": "",
                                "imgWidth": fileWidth,
                                "imgHeight": fileHeight,
                                "fileSize": 0,
                            });
                            let guid = generalGuid();
                            let willSendMsg = {
                                "message_content": willShowMsgContent,
                                "message_from_id": this.curUserInfo.id,
                                "group_id": gorupId,
                                "message_timestamp": curTimeSeconds,
                                "message_type": sendingMsgContentType,
                                "message_id": guid,
                                "file_local_path": filePath,
                                "message_status": 1
                                };
                            this.messageList.push(willSendMsg);
                            this.needToBottom = true;
                            this.existingMsgId.push(willSendMsg.message_id);

                            let div = document.getElementById("message-show-list");
                            setTimeout(() => {
                                if(div) {
                                    this.$nextTick(() => {
                                        div.scrollTop = div.scrollHeight;
                                    })
                                }
                            }, 0)
                            
                            this.cleanEditor();

                            services.common.uploadFile(pathDeal(filePath))
                                .then((ret) => {
                                    if (!ret.ok || !ret.success) 
                                    {
                                        for(var i=0;i<this.messageList.length;i++){
                                            if(this.messageList[i].message_id == guid){
                                                this.messageList[i].message_status = 2;
                                                this.updatemsgStatus = {
                                                    "id": guid,
                                                    "status": 2
                                                };
                                                break;
                                            }
                                        }
                                    }
                                    if (!("obj" in ret.data)) 
                                    {
                                        for(var i=0;i<this.messageList.length;i++){
                                            if(this.messageList[i].message_id == guid){
                                                this.messageList[i].message_status = 2;
                                                this.updatemsgStatus = {
                                                    "id": guid,
                                                    "status": 2
                                                };
                                                break;
                                            }
                                        }
                                    }
                                    // ToDo Failed List
                                    console.log("UploadFile response ", ret);
                                    var uploadRetData = ret.data.obj;
                                    let willSendMsgContent = {};
                                    willSendMsgContent.ext = uploadRetData.ext;
                                    willSendMsgContent.fileName = uploadRetData.fileName.indexOf('/') != -1 ? path.basename(uploadRetData.fileName) : uploadRetData.fileName;;
                                    willSendMsgContent.url = uploadRetData.url;
                                    willSendMsgContent.middleImage = uploadRetData.middleImage;
                                    willSendMsgContent.thumbnailImage = uploadRetData.thumbnailImage;
                                    willSendMsgContent.imgWidth = uploadRetData.imgWidth;
                                    willSendMsgContent.imgHeight = uploadRetData.imgHeight;
                                    willSendMsgContent.fileSize = uploadRetData.fileSize;

                                    var send_uid = "";
                                    if(gorupId.length == 0) {
                                        send_uid = uid;
                                    }
                                    services.common.sendNewMessage(
                                            guid, 
                                            sendingMsgContentType, 
                                            this.curUserInfo.id, 
                                            gorupId, 
                                            send_uid, 
                                            curTimeSeconds, 
                                            willSendMsgContent)
                                        .then(async (ret) => {
                                            console.log("send img message ret ", ret)
                                            if(ret == undefined) {
                                                for(var i=0;i<this.messageList.length;i++){
                                                    if(this.messageList[i].message_id == guid){
                                                        this.messageList[i].message_status = 2;
                                                        this.updatemsgStatus = {
                                                            "id": guid,
                                                            "status": 2
                                                        };
                                                        break;
                                                    }
                                                }
                                                await Message.SetMessageStatus(guid, 2);
                                            }
                                            else {
                                                for(var i=0;i<this.messageList.length;i++){
                                                    // console.log("cur guie is ", guid)
                                                    // console.log("the messagelist guid is ", this.messageList[i].message_id)
                                                    if(this.messageList[i].message_id == guid){
                                                        // console.log("update ret")
                                                        var nameTmp = ret.message.fileName;
                                                        var extTmp = path.extname(nameTmp);
                                                        // console.log("nameTmp is ", nameTmp);
                                                        var dirTmp = confservice.getThumbImagePath(ret.message_timestamp);
                                                        // console.log("dirTmp is ", dirTmp);
                                                        var finalPath = path.join(dirTmp, ret.message_id + extTmp);
                                                        // console.log("finalPath is ", finalPath);
                                                        try{
                                                            console.log("copy file from ", filePath, " to ", finalPath);
                                                            fs.copyFileSync(filePath, finalPath);
                                                        }
                                                        catch(error) {
                                                            console.log("copyFile except ", error);
                                                        }
                                                        ret.file_local_path = finalPath;

                                                        this.messageList[i] = ret;
                                                        this.updatemsgStatus = {
                                                            "id": guid,
                                                            "status": 0
                                                        };
                                                        break;
                                                    }
                                                }
                                                // console.log("Send Image msg list is ", this.messageList)
                                                // console.log("Send Image msg list content is ", strMsgContentToJson(this.messageList.message_content))
                                                // this.$store.commit("updateChatGroup", obj.message);
                                                this.$emit('updateChatList', ret);
                                            }
                                        })
                                })
                        }
                    }
                    else{
                        // Text
                        // quill中插入图片会在末尾加入一个↵，发送出去是空，这里处理掉
                        curMsgItem = sliceReturnsOfString(curMsgItem);
                        if(curMsgItem.length == 0){
                            continue;
                        }
                        var sendingMsgContentType = 101;
                        
                        var msgContent = curMsgItem;
                        var msgContentJson = {
                            "text": msgContent
                        };
                        // console.log("final cur msg item is ", msgContent.length)
                        var willSendMsgContent = {"text": msgContent};
                        // console.log("will send msg content ", willSendMsgContent)
                        // console.log("will send msg uid ", uid)
                        var guid = generalGuid();
                        // next is @
                        var curindex = i;
                        for(let j=curindex+1;j<varcontent.ops.length;j++) {
                            // console.log("====== cur i ", i)
                            // console.log("====== varcontent j ", j)
                            var nextMsgItem = varcontent.ops[j].insert;
                            // console.log("====== nextMsgItem ", nextMsgItem)
                            if(nextMsgItem.hasOwnProperty("span")) {
                                // console.log("====== nextMsgItem hasOwnProperty ")
                                var nextFileSpan = nextMsgItem.span;
                                var nextPathId = nextFileSpan.id;
                                var nextMsgInfo = this.idToPath[nextPathId];
                                // console.log("this.idToPath is ", this.idToPath)
                                var nextFilePath = nextMsgInfo.path;
                                var nextFileType = nextMsgInfo.type;
                                if(nextFileType == "at") {
                                    let nextMentionUserId = nextMsgInfo.atUid;
                                    let nextMentionUserName = nextMsgInfo.atName;
                                    willSendMsgContent.type = "mention";
                                    willSendMsgContent.text = willSendMsgContent.text + "@" + nextMentionUserName + " ";
                                    willSendMsgContent.mentions = willSendMsgContent.mentions == undefined ? [nextMentionUserId] : willSendMsgContent.mentions.push(nextMentionUserId) ;
                                    i += 1;
                                }
                                break;
                            }
                            else {
                                willSendMsgContent.text = willSendMsgContent.text + " " + nextMsgItem;
                                i += 1;
                            }
                        }
                        
                        var willShowMsgContent = JsonMsgContentToString(willSendMsgContent);
                        var willSendMsg = {
                            "message_content": willShowMsgContent,
                            "message_from_id": this.curUserInfo.id,
                            "group_id": gorupId,
                            "message_timestamp": curTimeSeconds,
                            "message_type": sendingMsgContentType,
                            "message_id": guid,
                            "message_status": 1
                            };

                        this.messageList.push(willSendMsg);
                        this.needToBottom = true;
                        this.existingMsgId.push(willSendMsg.message_id);
                        this.updatemsgStatus = {
                            "id": guid,
                            "status": 1
                        };
                        
                        var div = document.getElementById("message-show-list");
                        setTimeout(() => {
                            if(div) {
                                this.$nextTick(() => {
                                    console.log("div scrolltop is ", div.scrollHeight)
                                    div.scrollTop = div.scrollHeight;
                                })
                            }
                        }, 10)
                        
                        this.cleanEditor();
                        willSendMsg.content = willSendMsgContent;
                        // console.log("willSendMsg is ", willSendMsg);

                        var send_uid = "";
                        if(gorupId.length == 0) {
                            send_uid = uid;
                        }
                        services.common.sendNewMessage(
                                guid, 
                                sendingMsgContentType, 
                                this.curUserInfo.id, 
                                gorupId, 
                                send_uid, 
                                curTimeSeconds, 
                                willSendMsgContent)
                            .then(async (ret) => {
                                console.log("sendNewMessage ret is ", ret);
                                console.log("guid is ", guid);
                                if(ret == undefined) {
                                    for(var i=0;i<this.messageList.length;i++){
                                        if(this.messageList[i].message_id == guid){
                                            this.messageList[i].message_status = 2;
                                            this.updatemsgStatus = {
                                                "id": guid,
                                                "status": 2
                                            };
                                            break;
                                        }
                                    }
                                    await Message.SetMessageStatus(guid, 2);
                                }
                                else {
                                    for(var d=this.messageList.length-1;d>=0;d--){
                                        if(this.messageList[d].message_id == guid){
                                            this.messageList[d] = ret;
                                            this.updatemsgStatus = {
                                                "id": guid,
                                                "status": 0
                                            };
                                            if(this.existingMsgId.indexOf(ret.message_id) == -1) {
                                                this.existingMsgId.push(ret.message_id);
                                            }
                                            break;
                                        }
                                    }
                                    // this.$store.commit("updateChatGroup", obj.message);
                                    this.$emit('updateChatList', ret);

                                }
                            })
                    }
                }
            }
        },
        // If message is notice set visible
        showNoticeOrNot: function(curMsg) {
            if(curMsg === null) {
                return false;
            }
            let chatGroupMsgType = curMsg.message_type;
            let chatGroupMsgContent = curMsg.message_content;
            if(chatGroupMsgType === 104)
            {
                return true;
            }
            else {
                return false;
            }
        },
        // Notice show difference with message.
        showMessageOrNot: function(curMsg) {
            if(curMsg === null) {
                return false;
            }
            let chatGroupMsgType = curMsg.message_type;
            let chatGroupMsgContent = curMsg.message_content;
            if(chatGroupMsgType === 104)
            {
                return false;
            }
            else {
                return true;
            }
        },
        // Notice content
        NoticeContent: function(curMsg) {
            if(curMsg === null) {
                return '';
            }
            
            let chatGroupMsgType = curMsg.message_type;
            let chatGroupMsgContent = strMsgContentToJson(curMsg.message_content);

            if(chatGroupMsgType === 104)
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
                        inviteeNames = inviteeNameList.join(",");
                    }
                    var inviter = chatGroupMsgContent.userName;
                    return inviter + " 邀请 " + inviteeNames + " 加入群聊";
                }
                else if(chatGroupMsgContent.type === "notice")
                {
                    var owner = chatGroupMsgContent.userName;
                    return owner + " 发布群公告: " + chatGroupMsgContent.text;
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
            return "";
        },
        // Show time when time between messages over 1 min
        showTimeOrNot(curMsg, lastMsg) {
            if(lastMsg === undefined) {
                return true;
            }
            let chatGroupMsgType = curMsg.message_type;
            if(chatGroupMsgType == 104){
                return true;
            }
            let cutTime = curMsg.message_timestamp - lastMsg.message_timestamp;

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
            var secondsTime = Number(curMsg.message_timestamp);
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let cutTime = curDateSecond - secondsTime;
            let curYeat = curDate.getFullYear();
            let curMonth = curDate.getMonth() + 1;
            let curDay = curDate.getDate();

            let distdate = new Date(secondsTime);
            let y = distdate.getFullYear();
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
                    return y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m);
                }
            }
            else
            {
                return y + "-" + Appendzero(mon) + "-" + Appendzero(d) + " " + Appendzero(h) + ":" + Appendzero(m);
            }
        },
        // Difference in css. Left of Right
        ChatLeftOrRightClassName: function (curMsg) {
            if(curMsg.message_from_id === this.curUserInfo.id) {
                return "message-right";
            }
            else {
                return "message-left";
            }
        },
        ChatMessageId: function (curMsg) {
            return "message-" + curMsg.message_id;
        },
        msgCheckBoxId: function(curMsg) {
            return "message-checkbox-" + curMsg.message_id;
        },
        msgSelectOrNotClassName: function(curMsg) {
            //class="msgContent"
            var hasSelected = false;
            for(let i=0;i<this.selectedMsgs.length;i++) {
                if(this.selectedMsgs[i].message_id == curMsg.message_id) {
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
        groupIsSlience(groupInfo) {
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
            this.groupInfo = {};
            var isGroup = this.chat.group_type == 101 ? true : false;
            var idsList = []
            try{
                idsList = this.chat.contain_user_ids.split(",");
            }
            catch(error) {
                idsList = this.chat.contain_user_ids;
            }
            var isOwner = (this.chat.owner == this.curUserInfo.id);
            console.log("this.chat ", this.chat);
            // console.log("this.isTop ", this.groupIsTop(this.chat))
            // console.log("this.isSlience ", this.groupIsSlience(this.chat))
            // console.log("this.isFav ", this.groupIsInFavourite(this.chat))
            var groupInfoObj = {
                "memberList": idsList,
                "groupName": this.chat.group_name,
                "groupAvarar": this.chat.group_avarar,
                "groupNotice": this.chat.group_notice != undefined ? this.chat.group_notice : '',
                "groupId": this.chat.group_id,
                "isGroup": isGroup,
                "isOwner": isOwner,
                "isTop": this.groupIsTop(this.chat),
                "isSlience": this.groupIsSlience(this.chat),
                "isFav": this.groupIsInFavourite(this.chat),
                "ownerId": this.chat.owner,
                "groupType": this.chat.group_type,
            }
            this.groupInfo = groupInfoObj;
            // console.log("more more more ", this.chat.contain_user_ids.split(","))
            // var idsList = this.chat.contain_user_ids.split(",");
            // this.groupContainUserIds = idsList;
            // console.log("this.chat.group_name is ", this.chat.group_name);
            this.showGroupInfoTips = true;
            this.cleanCache = false;
            console.log("more more more ", this.groupInfoObj)
        },
        compare: function(){
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
                ret.latestSequenceId = this.chat.sequence_id;
                ret.count = this.messageList.length + 20;
            }
            return ret;
        },
        handleScroll: function() {
            let uldiv = document.getElementById("message-show-list");
            // console.log("=====scroll height is ", uldiv.scrollHeight);
            // console.log("=====uldiv.scrollTop is ", uldiv.scrollTop);
            // console.log("=====isRefreshing is ", this.isRefreshing);
            if(uldiv) {
                if(uldiv.scrollTop == 0){
                    console.log("to update msg")
                    var curTime = new Date().getTime();
                    // console.log("curTime - this.lastRefreshTime ", curTime - this.lastRefreshTime)
                    if(curTime - this.lastRefreshTime > 0.5 * 1000 && !this.isRefreshing && this.needScrollTop){
                        this.lastScrollHeight = uldiv.scrollHeight;
                        this.isRefreshing = true;
                        this.lastRefreshTime = new Date().getTime();
                        let latestSequenceIdAndCount = this.getLatestMessageSequenceIdAndCount();
                        // services.common.historyMessage(this.chat.group_id, latestSequenceIdAndCount.latestSequenceId, latestSequenceIdAndCount.count)
                        services.common.ListAllMessage(this.chat.group_id, latestSequenceIdAndCount.latestSequenceId)
                            .then((ret) => {
                                console.log("=========ret is ", ret);
                                ret = ret.before;
                                if(ret[0].group_id != this.chat.group_id) {
                                    this.isRefreshing = false;
                                    return;
                                }
                                this.needScroll = true;
                                if(ret.length < 20) {
                                    this.needScroll = false;
                                }
                                this.needToBottom = false;
                                var messageListTmp = ret.sort(this.compare());
                                for(var i=0;i<messageListTmp.length;i++){
                                    console.log("to get history ", this.existingMsgId.indexOf(messageListTmp[i].message_id))
                                    if(this.existingMsgId.indexOf(messageListTmp[i].message_id) == -1) {
                                        this.messageList.unshift(messageListTmp[i]);
                                        this.existingMsgId.push(messageListTmp[i].message_id);
                                    }
                                    this.$nextTick(() => {
                                        console.log("---------update croll top is ", uldiv.scrollHeight);
                                        uldiv.scrollTop = uldiv.scrollHeight - this.lastScrollHeight - 30;
                                    })
                                }
                                this.isRefreshing = false;
                            })
                    }
                }
            }
        },
        checkResize: function() {
            console.log("++++++++++++++====")
            let uldiv = document.getElementById("message-show-list");
            // console.log("++++++++scroll height is ", uldiv.scrollHeight);
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
        getHistoryMessage: function() {
            // console.log("this chat is ", this.chat);
            // console.log("this groupid is ", this.chat.group_id);
            // console.log("this sequence_id is ", this.chat.sequence_id);
            // console.log("this.router is ", this.$route.name)
            // services.common.historyMessage(this.chat.group_id, this.chat.sequence_id, 20)
            services.common.ListAllMessage(this.chat.group_id, this.chat.sequence_id)
                .then(async (ret) => {
                    console.log("oririnal ret is ", ret);
                    var retBefore = ret.before;
                    var retAfter = ret.after;
                    if(retBefore == undefined || retBefore.length == 0) {
                        this.needScrollTop = false;
                        this.messageList = [];
                        this.isRefreshing = false;
                        return;
                    }
                    if(retBefore[0].group_id != this.chat.group_id) {
                        this.isRefreshing = false;
                        return;
                    }
                    this.needScrollTop = true;
                    if(retBefore.length < 20) {
                        this.needScrollTop = false;
                    }
                    var messageListTmp = retBefore.sort(this.compare());
                    this.messageList = [];
                    for(var i=0;i<messageListTmp.length;i++){
                        // console.log("this.chat.sequence_id is ", this.chat.sequence_id);
                        // var chatGroupMsgContent = strMsgContentToJson(messageListTmp[i].message_content);
                        // console.log("chatGroupMsgContent is ", chatGroupMsgContent)
                        // console.log("getHistoryMessage messageListTmp [i] is ", messageListTmp[i].sequence_id);
                        if(this.existingMsgId.indexOf(messageListTmp.message_id) == -1) {
                            this.messageList.unshift(messageListTmp[i]);
                            this.existingMsgId.push(messageListTmp[i].message_id);
                        }
                    }
                    if(this.chat.message_content != null){
                        console.log("this.chat.message_content is ", this.chat.message_content)
                        let messagesFromDB = await Message.FindMessageBySequenceID(this.chat.sequence_id);
                        let messageFromGroup = {};
                        messageFromGroup = messagesFromDB[0];
                        if(messageFromGroup == undefined) {
                            // console.log("this.chat.message_content is ", this.chat.message_content)
                            let messageFromGroup = {};
                            messageFromGroup.message_type = this.chat.message_content_type;
                            messageFromGroup.message_content = this.chat.message_content;
                            messageFromGroup.message_from_id = this.chat.message_from_id;
                            messageFromGroup.message_timestamp = this.chat.last_message_time;
                            messageFromGroup.sequence_id = this.chat.sequence_id;
                            messageFromGroup.message_id = this.chat.message_id;
                            if(this.existingMsgId.indexOf(messageFromGroup.message_id) == -1) {
                                this.messageList.unshift(messageFromGroup);
                                this.existingMsgId.push(messageFromGroup.message_id);
                            }
                        }
                        else {
                            console.log("message from group is ", messageFromGroup)
                            if(this.existingMsgId.indexOf(messageFromGroup.message_id) == -1) {
                                // console.log("========push mes ")
                                this.messageList.push(messageFromGroup);
                                this.existingMsgId.push(messageFromGroup.message_id);
                            }
                        }
                    }
                    // console.log("this.messageList is ", this.messageList);
                    
                    // console.log("this.messageList is ", this.messageList);
                    // if(messageListTmp.length !=0){
                    //     if(messageListTmp[0].sequence_id != this.chat.sequence_id){
                    //         let messageFromGroup = {};
                    //         messageFromGroup.message_type = this.chat.message_content_type;
                    //         messageFromGroup.message_content = this.chat.message_content;
                    //         messageFromGroup.message_from_id = this.chat.message_from_id;
                    //         messageFromGroup.message_timestamp = this.chat.last_message_time;
                    //         messageFromGroup.sequence_id = this.chat.sequence_id;
                    //         messageFromGroup.message_id = this.chat.message_id;
                    //         if(this.existingMsgId.indexOf(messageFromGroup.message_id) == -1) {
                    //             this.messageList.unshift(messageFromGroup);
                    //             this.existingMsgId.push(messageFromGroup.message_id);
                    //         }
                    //     }
                    // }
                    // else{
                    //     if(this.chat.message_content != null){
                    //         // console.log("this.chat.message_content is ", this.chat.message_content)
                    //         let messageFromGroup = {};
                    //         messageFromGroup.message_type = this.chat.message_content_type;
                    //         messageFromGroup.message_content = this.chat.message_content;
                    //         messageFromGroup.message_from_id = this.chat.message_from_id;
                    //         messageFromGroup.message_timestamp = this.chat.last_message_time;
                    //         messageFromGroup.sequence_id = this.chat.sequence_id;
                    //         messageFromGroup.message_id = this.chat.message_id;
                    //         if(this.existingMsgId.indexOf(messageFromGroup.message_id) == -1) {
                    //             this.messageList.unshift(messageFromGroup);
                    //             this.existingMsgId.push(messageFromGroup.message_id);
                    //         }
                    //     }
                    //     // console.log("this.messagelist is ", this.messageList)
                    // }
                    setTimeout(() => {
                        this.needToBottom = true;
                        this.$nextTick(() => {
                            let div = document.getElementById("message-show-list");
                            if(div) {
                                div.scrollTop = div.scrollHeight - div.clientHeight;
                                // The left msg get through scroll event
                                div.addEventListener('scroll', this.handleScroll);
                                // div.addEventListener('onresize', this.checkResize);
                            }
                            this.isRefreshing = false;
                        })
                    }, 300)
                })
        },
        updateChatGroupStatus(groupId, groupStatus, updateType) {
            // console.log("======== ");
            this.$emit("updateChatGroupStatus", groupId, groupStatus, updateType);
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
            this.ownerTransferchat = this.chat;
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

            if(msg.group_id == this.chat.group_id) {
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
            // this.$emit('updateChatList', msg, forceUpdate);
        },
        updateMsgFile(e, args) {
            console.log("updateMsgfile ", args);
            this.updateMsg = args;
        },
        updateUserImage(e, args) {
            console.log("updateUserImage ", args);
            this.updateUser = args;
        },
    },
    data() {
        return {
            isGroup: true,
            updatemsgStatus: {
                "id": ""
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
            chatCreaterDialogRootDepartments:[],
            chatCreaterKey:99,
            lastScrollHeight: 0,
            fileListGroupInfo: {},
            showFileListInfo: false,
            messageListElement: null,
            checkClassName: ["chat-msg-content-others-txt", "transmit-title", "transmit-content", "chat-msg-content-mine-transmit", "chat-msg-content-others-voice", "chat-msg-content-mine-voice", "chat-msg-content-others-txt-div", "chat-msg-content-mine-txt-div", "chat-msg-content-mine-txt", "msg-image", "chat-msg-content-others-file", "chat-msg-content-mine-file", "file-name", "file-image", "voice-info", "file-size", "voice-image"],
            groupCreaterTitle: '发起群聊',
            groupNoticeInfo: {},
            updateUser:[],
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
            showGroupInfoTips: false,
            showTransmitDlg: false,
            transmitKey:199,
            recentGroups:[],
            transmitTogether: false,
            selectedMsgs: [],
            editor:null,
            messageList: [],
            waitForSendingFiles: [],
            curGroupId: '',
            editorOption : {
                placeholder: "",
                theme:'bubble',
                modules: {
                    toolbar: false,
                    // imageDrop: true,
                    // resizeImage: true,
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
        }
    },
    mounted: function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        setTimeout(() => {
            this.$nextTick(() => {
                // console.log("==============ipc on")
                ipcRenderer.on('updateMsgFile', this.updateMsgFile);
                ipcRenderer.on('updateUserImage', this.updateUserImage);
                ipcRenderer.on('transmitFromSoloDlg', this.transmitFromSoloDlg);
                this.editor = this.$refs.chatQuillEditor.quill;
                console.log(this.$refs.chatQuillEditor);
                this.$refs.chatQuillEditor.$el.style.height='150px';
                // this.$refs.chatQuillEditor
                this.fileInput = document.getElementById("fileInput");
                this.showGroupName(this.chat);
                ipcRenderer.on('updateGroupImg', this.updateGroupImg);
            })
        }, 0)
        document.addEventListener('click',this.closeInfoTip)
        
    },
    created: async function() {
        await services.common.init();
        this.loginInfo = await services.common.GetLoginModel();
        this.curUserInfo = await services.common.GetSelfUserModel();
        // console.log("===============mqttinit")
        // services.common.initmqtt();
        // services.common.handlemessage(this.callback);

    },
    computed: {
        messageListShow: {
            get: function() {
                var final = this.messageList;
                // console.log("final msglist is ", final);
                return final;
            }
        }
    },
    props: ['chat', 'newMsg'],
    watch: {
        chat: function() {
            console.log("chat ============", this.chat);
            console.log("this.curGroupId is ", this.curGroupId);
            if(this.chat == undefined || (this.curGroupId != undefined && this.curGroupId == this.chat.group_id)) {
                return;
            }
            if((this.chat.group_id != undefined && this.curGroupId != this.chat.group_id) || (this.chat.group_id == undefined && this.chat.user_id != undefined)) {
                this.curGroupId = this.chat.group_id;
                var curSequenceId = this.chat.sequence_id;
                this.needScrollTop = true;
                this.needScrollBottom = true;

                this.existingMsgId = [];
                
                this.getHistoryMessage();
                this.showGroupName(this.chat);
                this.isGroup = this.chat.group_type == 101 ? true : false;
            }
        },
        newMsg: function() {
            if(this.existingMsgId.indexOf(this.newMsg.message_id) == -1) {
                var newMsgContent = strMsgContentToJson(this.newMsg.message_content);
                if(newMsgContent.type != undefined && newMsgContent.type == "updateGroupName") {
                    this.chat.group_name = newMsgContent.text;
                    var groupNameElement = document.getElementById("chat-group-name");
                    groupNameElement.innerHTML = newMsgContent.text;
                }
                if(newMsgContent.type != undefined && newMsgContent.type == "invitation") {
                    if(newMsgContent.userInfos != undefined) {
                        let addUsers = newMsgContent.userInfos;
                        for(let j=0;j<addUsers.length;j++) {
                            let newUserId = addUsers[j].userId;
                            if(this.chat.contain_user_ids.indexOf(newUserId) == -1) {
                                this.chat.contain_user_ids + "," + newUserId;
                                console.log("Add new member in ", newUserId);
                            }
                        }
                    }
                }
                this.messageList.push(this.newMsg);
                this.existingMsgId.push(this.newMsg.message_id);
                let div = document.getElementById("message-show-list");
                if(div) {
                    this.$nextTick(() => {
                        div.scrollTop = div.scrollHeight;
                    })
                }
            }
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
    }

    .chat-title {
        display: float;
        width: 100%;
        height: 32px;
        background-color: rgb(255, 255, 255);
        border-bottom: 0px solid rgb(242, 242, 246);
        margin-bottom: 9px;
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
        letter-spacing:1px;
    }

    .chatInfo{
        margin:0;
        float: left;
        height: 100%;
        width: calc(100% - 250px);
    }

    .chat-img {
        margin:0px 8px 0px 16px;
        height: 32px;
        width: 32px;
        float: left;
        border: 0px solid rgba(0, 0, 0, 0);
        border-radius:4px;
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
        letter-spacing:1px;
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
        letter-spacing:1px;
    }

    .chat-tools {
        margin:0;
        float: right;
        height: 100%;
        width: 200px;
    }

    .chat-tool-more-div {
        display: inline-block;
        float: right;
        width: 32px;
        height: 32px;
        line-height: 100%;
        padding: 0px 6px 0px 6px;
        margin: 0px;
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
        width: 32px;
        height: 32px;
        line-height: 100%;
        padding: 0px 6px 0px 6px;
        margin: 0px;
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
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        list-style: none;
        // height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        border-bottom: 1px solid rgba(238,238,238,1);
        li {
            list-style-type: none;
        }
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
        letter-spacing:1px;
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
        letter-spacing: 1px;
        font-size: 12px;
    }

    .multiSelectToolsDiv {
        margin: 0 auto;
        width: 540px;
    }

    .chat-input {
        width: 100%;
        height: 170px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        font-size: 14px;
        letter-spacing: 1px;
    }

    .multiSelectTransmitDiv {
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 30px;
        margin-right: 30px;
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
        margin-left: 30px;
        margin-right: 30px;
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
        margin-left: 30px;
        margin-right: 30px;
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
        margin-left: 30px;
        margin-right: 30px;
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
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 30px;
        margin-right: 30px;
        display: inline-block;
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
        background-color: white;
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
        margin: 0;
        padding: 11px 11px 11px 11px;
    }

    .el-icon-emoji {
        width: 24px;
        height: 24px;
        margin: 0px;
        padding: 0px;
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
        margin: 0;
        padding: 11px 11px 11px 11px;
    }

    .el-icon-picture {
        width: 24px;
        height: 24px;
        margin: 0px;
        padding: 0px;
    }

    .chat-input-file {
        display: inline-block;
        margin: 0;
        padding: 11px 11px 11px 11px;
    }

    .el-icon-files {
        width: 24px;
        height: 24px;
        margin: 0px;
        padding: 0px;
    }
    
    .chat-input-history {
        display: inline-block;
        margin: 0;
        padding: 11px 11px 11px 11px;
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
        background-color: rgba(0, 0, 0, 0);
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
        letter-spacing: 1px;
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
        letter-spacing: 1px;
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

</style>