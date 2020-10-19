<template>
    <div class="chat-page">
        <div class="chat-title">
            <div class="chatInfo">
                <img class="chat-img" id="chat-group-img">
                <img class="encrypt-chat-img" src="../../../static/Img/Chat/encrypt-chat-title@2x.png" v-show="isSecret">
                <p class="chat-name" id="chat-group-name"></p>
                <p class="chat-group-content-num" id="chat-group-content-num"></p>
                <p class="chat-name-state" id="chat-group-state"></p>
            </div>
            <div class="chat-tools">
                <div class="chat-tool-more-div" @click="More()">
                </div>
                <div class="chat-tool-invite-div" @click="showAddMembersPrepare()" v-show="!isSecret">
                </div>
                <div class="chat-tool-call" @click="Call()" v-show=false>
                    <i class="el-icon-phone"></i>
                </div>
            </div>
        </div>
        <div class="chat-main" id="chat-main">
            <div class="chat-main-message" id="message-show">
                <!-- <ul class="msg-list" id="message-show-list"> -->
                <transition-group name="msg-list" class="msg-list" id="message-show-list" tag="ul">
                    <li class="msg-loading" v-show="isRefreshing" v-bind:key="123">
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
                <!-- </ul> -->
                </transition-group>
            </div>
            <div class="chat-input" id="chat-input-id" v-show="!multiSelect">
                <div class="chat-input-operate">
                    <div class="chat-input-tool">
                        <Faces v-show="showFace" id="face-box-id" @click="showFace = true" class="faces-box" @insertFace="insertFace"></Faces>
                        <div class="chat-input-expression" @click="showExpression()">
                        </div>
                        <div class="chat-input-picture" @click="insertPic()">
                        </div>
                        <div class="chat-input-file" @click="insertFiles()">
                        </div>
                        <div class="chat-input-history" id="chat-input-history-id" @click="showMsgHistoryOperate()">
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
                <div class="text-input" @keydown="keyHandle($event)">
                    <quillEditor
                        ref="chatQuillEditor"
                        v-model="content"
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
        <transmitDlg  v-show="showTransmitDlg" @updateChatList="updateChatList" @closeTransmitDlg="closeTransmitDlg" :curChat="chat" :transmitTogether="transmitTogether" :recentGroups="recentGroups" :transmitMessages="selectedMsgs" :transmitCollection="false" :key="transmitKey">
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
import {makeFlieNameForConflict, getFileSizeNum, generalGuid, fileMIMEFromType, Appendzero, FileUtil, findKey, pathDeal, changeStr, fileTypeFromMIME, getIconPath, uncodeUtf16, strMsgContentToJson, JsonMsgContentToString, sliceReturnsOfString, getFileNameInPath, insertStr, getFileSize, FileToContentType, FilenameToContentType} from '../../packages/core/Utils.js'
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
import { Group, Message, Department, UserInfo, sqliteutil } from '../../packages/data/sqliteutil.js'
import userInfoContent from './user-info';

const {Menu, MenuItem, nativeImage} = remote;
const { clipboard } = require('electron')
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
        SendFileDlg,
    },
    methods: {
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
                if(tipInfos.showLeft) {
                    this.userInfoPosition.left = this.userInfoPosition.left - 280 - 45;
                }
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
            var isSecret = false;
            if(msgItem.key_id != undefined && msgItem.key_id.length != 0) {
                isSecret = true;
            }
            this.menu = new Menu();
            if(msgItem.message_type == 101) {
                this.menu.append(new MenuItem({
                    label: "复制",
                    click: () => {
                        this.menuCopy(msgItem)
                    }
                }));
                if(!isSecret) {
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
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                if(!isSecret) {
                    this.menu.append(new MenuItem({
                        label: "多选",
                        click: () => {
                            this.msgMultiSelect(msgItem);
                        }
                    }));
                }
            }
            else if(msgItem.message_type == 102) {
                // this.menu.append(new MenuItem({
                //     label: "复制",
                //     click: () => {
                //         this.menuCopy(msgItem)
                //     }
                // }));
                if(!isSecret) {
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
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                if(!isSecret) {
                    this.menu.append(new MenuItem({
                        label: "多选",
                        click: () => {
                            this.msgMultiSelect(msgItem);
                        }
                    }));
                }
            }
            else if(msgItem.message_type == 103) {
                if(!isSecret) {
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
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                if(!isSecret) {
                    this.menu.append(new MenuItem({
                        label: "多选",
                        click: () => {
                            this.msgMultiSelect(msgItem);
                        }
                    }));
                }
            }
            else if(msgItem.message_type == 105) {
                if(!isSecret) {
                    this.menu.append(new MenuItem({
                        label: "收藏",
                        click: () => {
                            this.menuFav(msgItem)
                        }
                    }));
                }
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                if(!isSecret) {
                    this.menu.append(new MenuItem({
                        label: "多选",
                        click: () => {
                            this.msgMultiSelect(msgItem);
                        }
                    }));
                }
            }
            else if(msgItem.message_type == 106) {
                if(!isSecret) {
                    this.menu.append(new MenuItem({
                        label: "转发",
                        click: () => {
                            this.transMit(msgItem)
                        }
                    }));
                }
                this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.menuDelete(msgItem)
                    }
                }));
                if(!isSecret) {
                    this.menu.append(new MenuItem({
                        label: "多选",
                        click: () => {
                            this.msgMultiSelect(msgItem);
                        }
                    }));
                }
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
            var temp = rootDepartmentModels;
            this.chatCreaterDialogRootDepartments =  temp.sort(this.compare("show_order"));
            
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
            var temp = rootDepartmentModels;
            this.chatCreaterDialogRootDepartments =  temp.sort(this.compare("show_order"));
            
            this.chatCreaterKey ++;
            this.createNewChat = false;
            this.addMemberGroupType = this.chat.group_type;
            this.showChatCreaterDlg = true;
            this.chatCreaterDialogTitle = "添加成员";
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
                console.log("range.index is ", range.index);
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
        keyHandle(event) {
            // console.log("event ", event)
            // console.log("clipboard ", clipboard.readImage())
            var range = this.editor.getSelection();
            var content = this.editor.getContents();

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
            else if(event.code == "Digit2" && event.shiftKey == true) {
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

            var secretOptionMenuElement = document.getElementById("secretTypeDropdownContentId");
            if(secretOptionMenuElement != undefined && e.target.className != "secretType" && e.target.className != "secretTypeButton" && e.target.className != "secretGroupDiv") {
                secretOptionMenuElement.style.display = "none";
            }

            console.log("e.target.classname ", e.target.className)
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
            this.editor.setSelection(this.editor.selection.savedRange.index + 1);
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
            else if(this.chat.roomId == undefined) {
                    this.$toastMessage({message:'请选择一个群组', time: 2000, type:'success'});
                    return;
                }
            else {
                this.sendFileInfos = {
                    paths: [],
                    distGroupInfo: {}
                };
                this.showSendFileDlg = true;
                var varTmp = [];
                for(let i=0;i<fileList.length;i++) {
                    let fileinfo = {};
                    let fileSize = await getFileSizeNum(fileList[i]);
                    fileinfo.path = fileList[i];
                    fileinfo.size = fileSize;
                    fileinfo.name = path.basename(fileList[i])
                    if(fileSize > 100 * 1024 * 1024) {
                        this.$toastMessage({message:"不支持大于100M的文件发送。", time: 3000, type:'success'});
                        continue
                    }
                    varTmp.push(fileinfo);
                }
                this.sendFileInfos.distGroupInfo = this.chat;
                this.sendFileInfos.paths = varTmp;
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
                    "message_status": 1,
                    "sequence_id": curMsgItem.sequence_id,
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
                if(div) {
                    this.$nextTick(() => {
                        div.scrollTop = div.scrollHeight;
                    })
                }
                
                this.cleanEditor();

                services.common.uploadFile(pathDeal(filePath), willSendMsg)
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
                                willSendMsgContent,
                                filePath,
                                this.isSecret)
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
                    "message_status": 1,
                    "sequence_id": curMsgItem.sequence_id,
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
                if(div) {
                    this.$nextTick(() => {
                        div.scrollTop = div.scrollHeight;
                    })
                }
                
                this.cleanEditor();

                services.common.uploadFile(pathDeal(filePath), willSendMsg)
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
                                willSendMsgContent,
                                filePath,
                                this.isSecret)
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
                if(div) {
                    this.$nextTick(() => {
                        console.log("div scrolltop is ", div.scrollHeight)
                        div.scrollTop = div.scrollHeight;
                    })
                }
                
                this.cleanEditor();

                services.common.sendNewMessage(
                        guid, 
                        sendingMsgContentType, 
                        this.curUserInfo.id, 
                        gorupId, 
                        uid, 
                        curTimeSeconds, 
                        willSendMsgContent,
                        '',
                        this.isSecret)
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
                if(div) {
                    this.$nextTick(() => {
                        console.log("div scrolltop is ", div.scrollHeight)
                        div.scrollTop = div.scrollHeight;
                    })
                }
                
                this.cleanEditor();

                services.common.sendNewMessage(
                        guid, 
                        sendingMsgContentType, 
                        this.curUserInfo.id, 
                        gorupId, 
                        uid, 
                        curTimeSeconds, 
                        willSendMsgContent,
                        '',
                        this.isSecret)
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
        SendFiles: function(fileinfos) {
            for(let i=0;i<fileinfos.length;i++) {
                this.sendFile(fileinfos[i]);
            }
            this.closeSendFileDlg();
        },
        sendFile: async function(fileinfo) {
            var roomID = this.chat.roomId;
            var stream = fs.readFileSync(fileinfo.path);
            let filename = fileinfo.name;
            let type = fileinfo.type;
            if(type)
                type = FileToContentType(fileinfo.type);
            else
                type = FilenameToContentType(fileinfo.name);

            this.matrixClient.uploadContent({
                stream: stream,
                name: filename
            }).then((url)=>{
                var content = {
                    msgtype: type,
                    body: filename,
                    url: url,
                    info:{
                        size: fileinfo.size
                    }
                };
                this.matrixClient.sendMessage(roomID, content).then((ret)=>{
                    //this.$emit('updateChatList', ret);
                });
            });
        },

        SendText: function(curMsgItem, varcontent){
            // Text
            // quill中插入图片会在末尾加入一个↵，发送出去是空，这里处理掉
            curMsgItem = sliceReturnsOfString(curMsgItem);
            if(curMsgItem.length == 0){
                return;
            }
            var div = document.getElementById("message-show-list");
            if(div) {
                this.$nextTick(() => {
                    console.log("div scrolltop is ", div.scrollHeight)
                    div.scrollTop = div.scrollHeight;
                })
            }
            
            this.cleanEditor();
            this.matrixClient.sendTextMessage(this.chat.roomId, curMsgItem).then((eventID)=>{
                //this.$emit('updateChatList', eventID);
            });
        },
        sendMsg: async function() {
            // console.log("this.chat is ", this.chat);
            if(this.chat.roomId == undefined) {
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
                    
                    if(fileType == "at") {
                        
                    }
                }
                else{
                    this.SendText(curMsgItem, varcontent)
                }
            }
        },
        // If message is notice set visible
        showNoticeOrNot: function(curMsg) {
            if(curMsg === null) {
                return false;
            }
            let event = curMsg.event;
            let chatGroupMsgType = event.type;
            var chatGroupMsgContent = event.content;
            let index = ['m.room.encrypted', 'm.room.message'].indexOf(chatGroupMsgType);
            if(['m.room.encrypted', 'm.room.message'].indexOf(chatGroupMsgType) == -1)
                return true;
            return false;
s        },
        // Notice show difference with message.
        showMessageOrNot: function(curMsg) {
            if(curMsg === null) {
                return false;
            }
            let event = curMsg.event;
            let chatGroupMsgType = event.type;
            var chatGroupMsgContent = event.content;
            let index = ['m.room.encrypted', 'm.room.message'].indexOf(chatGroupMsgType);

            if(['m.room.encrypted', 'm.room.message'].indexOf(chatGroupMsgType) == -1)
                return false;
            return true;
        },
        // Notice content
        NoticeContent: function(curMsg) {
            if(curMsg === null) {
                return '';
            }
            let event = curMsg.event;
            let chatGroupMsgType = event.type;
            var chatGroupMsgContent = event.content;
            // console.log("chatGroupMsgContent is ", chatGroupMsgContent)
            // console.log("this. msg is ", this.msg)
            // 数据库缺省type = 0 
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
                "isSecret": (this.chat.group_type == 102 && this.chat.key_id != undefined && this.chat.key_id.length != 0)
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
                ret.latestSequenceId = this.chat.sequence_id;
                ret.count = this.messageList.length + 20;
            }
            return ret;
        },
        handleScroll: function() {
            return;
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
                                var messageListTmp = ret.sort(this.compareMsg());
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
            this.messageList = this.chat.timeline;

            this.$nextTick(() => {
                this.needToBottom = true;
                
                let div = document.getElementById("message-show-list");
                if(div) {
                    div.scrollTop = div.scrollHeight - div.clientHeight;
                    // The left msg get through scroll event
                    div.addEventListener('scroll', this.handleScroll);
                    // div.addEventListener('onresize', this.checkResize);
                    this.showScrollBar();
                }
                this.isRefreshing = false;
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
                distGroupInfo: {}
            };
        },
        async dealDrop(e) {
            console.log("------ ", this.$route.name)
            e.preventDefault();
            if(this.$route.name != "ChatContent") {
                return;
            }
            if(this.chat.roomId == undefined) {
                this.$toastMessage({message:'请选择一个房间', time: 2000, type:'success'});
                return;
            }

            var files = e.dataTransfer.files;
            for(let i=0;i<files.length;i++) {
                if(files[i].size > 100 * 1024 * 1024) {
                    this.$toastMessage({message:"不支持大于100M的文件发送。", time: 3000, type:'success'});
                    continue
                }
            }
 
            this.showSendFileDlg = true;
            this.sendFileInfos = {
                distGroupInfo: this.chat,
                paths: files
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
            for(let i=0;i<e.clipboardData.items.length; i++) {
                var item = e.clipboardData.items[i];
                if(item.kind == "string") {
                    console.log("tmd is zifuchuan ");
                }
                else {
                    var blod = item.getAsFile();
                    var reader = new FileReader();
                    reader.onload = (event)=> {
                        this.matrixClient.uploadContent({
                            stream: event.target.result,
                            name: blod.name
                        }).then((url)=>{
                            var content = {
                                msgtype: FileToContentType(blod.type),
                                body: blod.name,
                                url: url,
                                info:{
                                    size: blod.size
                                }
                            };
                            this.matrixClient.sendMessage(this.chat.roomId, content).then((ret)=>{
                                //this.$emit('updateChatList', ret);
                            });
                        });
                    }
                    reader.readAsDataURL(blod);
                }
            }
            /*
            for(let i=0;i<e.clipboardData.files.length;i++) {
                var item = e.clipboardData.files[i];
                console.log("item is ", item);
                if(item.kind == "string") {
                    console.log("tmd is zifuchuan")
                }
                else if(item.kind == "file") {
                    console.log("tmd is file");
                    var pasteFile = item.getAsFile();
                }
            }
            */
        }
    },
    data() {
        return {
            content: '',
            isSecret: false,
            canSelecteFile: true,
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
            showSendFileDlg: false,
            sendFileInfos: {},
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
                    }
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
            matrixClient: undefined
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
                ipcRenderer.on('setFocuse', this.setFocuse);
                ipcRenderer.on('checkClipBoard', this.checkClipboard);
                this.editor = this.$refs.chatQuillEditor.quill;
                console.log(this.$refs.chatQuillEditor);
                this.$refs.chatQuillEditor.$el.style.height='150px';
                // this.$refs.chatQuillEditor
                this.fileInput = document.getElementById("fileInput");
                this.showGroupName(this.chat);
                ipcRenderer.on('updateGroupImg', this.updateGroupImg);
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
        await services.common.init();
        this.loginInfo = await services.common.GetLoginModel();
        this.curUserInfo = await services.common.GetSelfUserModel();
        this.matrixClient = window.mxMatrixClientPeg.matrixClient;
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
    props: ['chat', 'newMsg', 'toBottom'],
    watch: {
        chat: function() {
            this.curGroupId = this.chat.roomId;
            console.log("chat ============", this.chat);
            console.log("this.curGroupId is ", this.curGroupId);
            this.isSecret = false;
            this.needScrollTop = true;
            this.needScrollBottom = true;
            this.existingMsgId = [];
            this.getHistoryMessage();
            this.showGroupName(this.chat);
            if(this.editor == undefined) {
                this.editor = this.$refs.chatQuillEditor.quill;
            }
            this.editor.setSelection(this.editor.selection.savedRange.index);
            /*
            if(this.chat == undefined || (this.curGroupId != undefined && this.curGroupId == this.chat.group_id)) {
                return;
            }
            if((this.chat.group_id != undefined && this.curGroupId != this.chat.group_id) || (this.chat.group_id == undefined && this.chat.user_id != undefined)) {
                this.isSecret = (this.chat.key_id != undefined && this.chat.key_id.length != 0 && this.chat.group_type == 102);
                this.hideScrollBar();
                this.curGroupId = this.chat.group_id;
                var curSequenceId = this.chat.sequence_id;
                this.needScrollTop = true;
                this.needScrollBottom = true;

                this.existingMsgId = [];
                
                this.getHistoryMessage();
                this.showGroupName(this.chat);
                if(this.editor == undefined) {
                    this.editor = this.$refs.chatQuillEditor.quill;
                }
                this.editor.setSelection(this.editor.selection.savedRange.index);
            }
            */
        },
        messageList: function() {
            let div = document.getElementById("message-show-list");
            if(div) {
                this.$nextTick(() => {
                    div.scrollTop = div.scrollHeight;
                })
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
        letter-spacing:1px;
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
        border-radius:4px;
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
        letter-spacing:1px;
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
        letter-spacing:1px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
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