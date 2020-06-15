<template>
    <div class="chat-page">
        <div class="chat-title">
            <div class="chatInfo">
                <img class="chat-img" id="chat-group-img">
                <p class="chat-name" id="chat-group-name"></p>
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
                    <li v-for="(item, index) in messageListShow"
                        :class="ChatLeftOrRightClassName(item)"
                        @contextmenu="rightClick($event, item)">
                        <div class="msg-info-time" v-show="showTimeOrNot(item, messageListShow[index-1])">{{MsgTime(item)}}</div>
                        <div class="chat-notice" v-show="showNoticeOrNot(item)">{{NoticeContent(item)}}</div>
                        <div class="msgContent">
                            <input class="multiSelectCheckbox" type="checkbox" v-show="showCheckboxOrNot(item)" @change="selectChanged(item)">
                            <imessage :msg="item" :playingMsgId="playingMsgId" :updateMsg="updateMsg" :updateUser="updateUser" v-show="showMessageOrNot(item)" @showImageOfMessage="showImageOfMessage" @openUserInfoTip="openUserInfoTip" @playAudioOfMessage="playAudioOfMessage"></imessage>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="chat-input" id="chat-input-id" v-show="!multiSelect">
                <div class="chat-input-operate">
                    <div class="chat-input-tool">
                        <Faces v-show="showFace"  @click="showFace = true" class="faces-box" @insertFace="insertFace"></Faces>
                        <div class="chat-input-expression" @click="showExpression()">
                            <img class="el-icon-emoji" src="../../../static/Img/Chat/emoji@2x.png">
                        </div>
                        <div class="chat-input-picture" @click="insertPic()">
                            <img class="el-icon-picture" src="../../../static/Img/Chat/pic@2x.png">
                        </div>
                        <div class="chat-input-file" @click="insertFiles()">
                            <img class="el-icon-files" src="../../../static/Img/Chat/file@2x.png">
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
                <img class="multiSelectTransmit" src="../../../static/Img/Chat/transmit-44px.png" @click="multiTransMit">
                <img class="multiSelectTransmitTogether" src="../../../static/Img/Chat/transmitTogether-44px.png" @click="multTtransMitTogether">
                <img class="multiSelectFav" src="../../../static/Img/Chat/favourite-44px.png" @click="multiFav">
                <img class="multiSelectDel" src="../../../static/Img/Chat/delete-44px.png" @click="multiDel">
                <img class="multiSelectToolClose" src="../../../static/Img/Chat/toolCancel-24px.png" @click="multiToolsClose">
            </div>
        </div>
        <transmit v-show="showTransmitDlg" :showTransmit="updateTransmit" :curChat="chat" :transmitTogether="transmitTogether" :distMsgs="selectedMsgs" @closeTransmitDlg="closeTransmitDlg"></transmit>
        <userInfoTip v-show="showUserInfoTips" :tipInfos="tipInfos" @getCreateGroupInfo="getCreateGroupInfo"></userInfoTip>
        <div id="complextype" class="edit-file-blot" style="display:none;">
            <span class="complex" spellcheck="false" contenteditable="false"></span>
        </div>
        <groupInfoTip v-show="showGroupInfoTips" :showGroupInfo="groupInfo" :updateUser="updateUser" :updateNotice="updateNotice" :cleanCache="cleanCache" @showAddMembers="showAddMembers" @openUserInfoTip="openUserInfoTip" @updateChatGroupStatus="updateChatGroupStatus" @updateChatGroupNotice="updateChatGroupNotice" @showOwnerTransferDlg="showOwnerTransferDlg"></groupInfoTip>
        <el-dialog :title="groupCreaterTitle" :visible.sync="dialogVisible" width="70%" @close="handleDialogClose()">
            <div class="el-dialog-content">
                <chatGroupCreater ref="chatGroupCreater" :disableUsers="disabledusers" @getCreateGroupUsersSelected="getUsersSelected">
                </chatGroupCreater>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button class="dialog-confirm-button" type="primary" @click="AddNewMembers()">确 定</el-button>
            </span>
        </el-dialog>
        <noticeEditDlg :noticeInfo="groupNoticeInfo" @closeNoticeDlg="closeNoticeDlg" v-show="noticeDialogVisible"/>
        <ownerTransferDlg :GroupInfo="this.ownerTransferchat" @closeOwnerTransferDlg="closeOwnerTransferDlg" v-show="ownerTransferDialogVisible"/>
        <chatMemberDlg :GroupInfo="this.chatMemberDlgchat" :showPosition="cursorPosition" :chatMemberSearchKey="chatMemberSearchKey" @atMember="atMember" v-show="chatMemberDlgVisible"/>
    </div>
</template>

<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.bubble.css'
import {quillEditor} from 'vue-quill-editor'
import * as Quill from 'quill'
// import { ImageDrop } from 'quill-image-drop-module'
import {ipcRenderer, remote} from 'electron'

import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import Faces from './faces.vue';
import userInfoTip from './userinfo-tip.vue'
import {generalGuid, Appendzero, FileUtil, findKey, pathDeal, fileTypeFromMIME, getIconPath, uncodeUtf16, strMsgContentToJson, JsonMsgContentToString, sliceReturnsOfString, getFileNameInPath, insertStr} from '../../packages/core/Utils.js'
import imessage from './message.vue'
import groupInfoTip from './group-info.vue'
import chatGroupCreater from './chatgroup-creater'
import transmit from './transmit.vue'
import noticeEditDlg from './noticeEditDlg.vue'
import ownerTransferDlg from './ownerTransfer.vue'
import chatMemberDlg from './chatMemberList.vue'

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
      console.log("value is ", value);
      console.log("attributes value is ", value.attributes);
      console.log("embed value is ", value.style);
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
        chatMemberDlg
    },
    props: ['chat'],
    methods: {
        handleDialogClose() {
            this.$refs.chatGroupCreater.initData();
        },
        updateGroupImg: function(e, args) {
            console.log("argsd is ", args);
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            if(id != this.chat.group_id) {
                return;
            }
            let elementImg = document.getElementById("chat-group-img");
            elementImg.setAttribute("src", "");
            var showfu = new FileUtil(localPath);
            let showfileObj = showfu.GetUploadfileobj();
            var reader = new FileReader();
            reader.readAsDataURL(showfileObj);
            reader.onloadend = () => {
                elementImg.setAttribute("src", reader.result);
            }
        },
        rightClick(e, msgItem) {
            console.log("e.target is ", e.target.className)
            let distElement = document.getElementById(msgItem.message_id);
            console.log("distElement is ", distElement.className);
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
        transMit(msg) {
            this.showTransmitDlg = true;
            this.updateTransmit = !this.updateTransmit;
            this.selectedMsgs.push(msg);
            this.transmitTogether = false;
        },
        multTtransMitTogether() {
            this.showTransmitDlg = true;
            this.updateTransmit = !this.updateTransmit;
            this.transmitTogether = true;
        },
        multiTransMit() {
            this.showTransmitDlg = true;
            this.updateTransmit = !this.updateTransmit;
            this.transmitTogether = false;
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
        multiFav() {

        },
        multiDel() {

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
            this.selectedMsgs = [];
            this.multiSelect = false;
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
        },
        showAddMembersPrepare: function() {
            var memeberList = this.chat.contain_user_ids.split(",");
            this.showAddMembers(memeberList);
        },
        showAddMembers: function(existedMembers){
            this.groupCreaterTitle = "添加成员"
            console.log("showaddmembers is ", this.disabledusers)
            this.disabledusers = existedMembers;
            console.log("showaddmembers is ", this.disabledusers)
            this.dialogVisible = true;
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
        inputChanged(content) {
            this.curContent = content.text;
            var atIndex = this.curContent.lastIndexOf("@", this.curInputIndex);
            if(this.chatMemberDlgVisible) {
                var getSearchKey = this.curContent.substring(atIndex + 1, this.curInputIndex + 1);
                this.chatMemberSearchKey = getSearchKey;
                console.log("inputchange this.chatmembersearchkey is ", this.chatMemberSearchKey);
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

                console.log("top ", offsetTop)
                console.log("left ", clientOffLeft);
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
            var distContent = "@" + this.chatMemberSearchKey;
            for(var i=0;i<content.ops.length;i++) {
                if(content.ops[i].insert.span == undefined) {
                    console.log("content.ops[i].insert ", content.ops[i].insert);
                    console.log("distContent ", distContent);
                    content.ops[i].insert = content.ops[i].insert.replace(distContent, "");
                    console.log("content.ops[i].insert ", content.ops[i].insert);
                    this.editor.setContents(content);
                    // this.editor.setSelection(500);
                    console.log("curInputIndex is ", this.curInputIndex);
                    console.log("cursor index is ", this.curInputIndex - distContent.length);
                    this.curInputIndex = this.curInputIndex - distContent.length;
                    break;
                }
            }
        },
        keyHandle(event) {
            // console.log("event ", event)
            // console.log("clipboard ", clipboard.readImage())
            var range = this.editor.getSelection();
            this.curInputIndex = range==null ? 0 : range.index;
            console.log("this.curInputIndex is ", this.curInputIndex);

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
            else if(event.code == "Digit2") {
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
            var iconPath = "";
            this.deleteDistContent();
            var complexSpan = document.getElementById('complextype').firstElementChild.cloneNode(true);
            complexSpan.id = generalGuid();
            complexSpan.innerHTML = "@" + atMemberInfo.user_display_name;
            var distStyle = this.atConstStyle
            // 'display:inline-block;outline:none;border: 0px;font-size:14px;font-family:Microsoft YaHei',
            console.log("diststyle is ", distStyle);
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
        openUserInfoTip(tipInfos) {
            console.log("tip inso if ", tipInfos);
            this.tipInfos = tipInfos;
            this.showUserInfoTips = true;
        },
        closeUserInfoTip(e){
            var userInfoTipElement = document.getElementById("userInfoTipId");
            if(userInfoTipElement != null && !userInfoTipElement.contains(e.target) && e.target.className != "msg-info-user-img"){
                this.showUserInfoTips = false;
            }
            var groupInfoElement = document.getElementById("groupInfoTipId");
            // console.log("e.target.classname ", e.target.className)
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
        },
        showExpression: function() {
            this.showFace = !this.showFace;
        },
        showGroupName: async function(chatGroupItem) {
            if(chatGroupItem.group_id == null || chatGroupItem.group_id == undefined){
                return "";
            }
            var groupNameElement = document.getElementById("chat-group-name");
            var groupIcoElement = document.getElementById("chat-group-img");
            var groupStateElement = document.getElementById("chat-group-state");
            console.log("getShowGroupName is ", chatGroupItem.group_id)
            var groupName = chatGroupItem.group_name;
            if(groupName.length == 0) {
                var aboutUids = chatGroupItem.contain_user_ids.split(",");
                var groupUidNameList = [];
                for(var i=0;i<aboutUids.length;i++) {
                    let nameTmp = this.$store.getters.getChatUserName(aboutUids[i]);
                    groupUidNameList.unshift(nameTmp);
                    if(i > 3) {
                            break;
                        }
                }
                groupName = groupUidNameList.join(",");
            }
            groupNameElement.innerHTML = groupName;
            
            var targetPath = "";
            if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(chatGroupItem.group_avarar, chatGroupItem.group_id))){
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
                console.log("================")
                var ownerInfo = await services.common.GetDistUserinfo(chatGroupItem.owner);
                groupState = ownerInfo[0].status_description;
                console.log("================ ", ownerInfo)
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
                        var fileName = getFileNameInPath(fileList[i].path)
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
            ipcRenderer.send('open-directory-dialog', 'openFile');
            if(!this.ipcInited){
                this.ipcInited = true;
                ipcRenderer.on('selectedItem', this.nHandleFiles);
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
                    console.log("filelist[i] = ", fileList[i])
                    if(this.waitForSendingFiles.indexOf(fileList[i] != -1)) {
                        var range = this.editor.getSelection();
                        var curIndex = range==null ? 0 : range.index;

                        var showfu = new FileUtil(fileList[i]);
                        var showfileObj = showfu.GetUploadfileobj();
                        var imgurl = URL.createObjectURL(showfileObj)
                        var fileType = showfu.GetMimename();
                        var fileExt = showfu.GetExtname();
                        var fileName = showfu.GetFilename()

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
                            console.log("iconpath is ", iconPath)
                            var range = this.editor.getSelection();
                            var curIndex = range==null ? 0 : range.index;
                            var complexSpan = document.getElementById('complextype').firstElementChild.cloneNode(true);
                            complexSpan.id = generalGuid();
                            complexSpan.innerHTML = "            " + fileName;
                            var indexTemp = this.constStyle.indexOf("background-image: url(") + "background-image: url(".length;
                            var distStyle = insertStr(this.constStyle, indexTemp, iconPath);
                            // 'display:inline-block;border-radius: 5px;border: 1px solid rgb(218,218,221);width: 200px;height: 46px;background-repeat: no-repeat;background-image: url("/static/Img/Chat/doc@2x.png");background-size: contain;line-height: 46px;text-indent:40px;'
                            console.log("diststyle is ", distStyle);
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
                    console.log("finished")
                }
            }
        },
        // Sending message need to show sending circle.
        MsgIsSending: function(curMsg) {
            if(this.sendingMsgIdList.indexOf(curMsg.message_id) > -1){
                return true;
            }
            else{
                return false;
            }
        },
        // Check message send successfully or failed.
        MsgIsFailed: function(curMsg) {
            if(this.failedList.indexOf(curMsg.message_id) > -1) {
                return true;
            }
            else {
                return false;
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
        sendMsg: async function() {
            if(this.chat.group_id == undefined) {
                alert("请选择一个群组。")
                return;
            }
            let varcontent = this.editor.getContents();
            if(varcontent == null || varcontent.length == 0) {
                // toDo To Deal The \n
                alert("不能发送空白信息。")
            }
            else{
                console.log("varcontent is ", varcontent);
                var uid = this.getDistUidThroughUids(this.chat.contain_user_ids);
                var gorupId = this.chat.group_id == null ? '' : this.chat.group_id;
                for(var i=0;i<varcontent.ops.length;i++){
                    let curMsgItem = varcontent.ops[i].insert;
                    let curTimeSeconds = new Date().getTime();
                    
                    if(curMsgItem.hasOwnProperty("span")) {
                        var fileSpan = curMsgItem.span;
                        var pathId = fileSpan.id;
                        var msgInfo = this.idToPath[pathId];
                        console.log("this.idToPath is ", this.idToPath)
                        var filePath = msgInfo.path;
                        var fileType = msgInfo.type;
                        if(fileType == "file"){
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
                                "file_local_path": filePath
                                };
                            this.messageList.push(willSendMsg);
                            console.log("willsendmsg is ", willSendMsg);
                            this.existingMsgId.push(willSendMsg.message_id);

                            let div = document.getElementById("message-show-list");
                            setTimeout(() => {
                                if(div) {
                                    this.$nextTick(() => {
                                        div.scrollTop = div.scrollHeight;
                                    })
                                }
                            }, 0)
                            
                            this.sendingMsgIdList.push(guid);
                            this.cleanEditor();

                            services.common.uploadFile(pathDeal(filePath))
                                .then((ret) => {
                                    // ToDo Failed List
                                    console.log("UploadFile response ", ret);
                                    var uploadRetData = ret.data.obj;
                                    let willSendMsgContent = {};
                                    willSendMsgContent.ext = uploadRetData.ext;
                                    willSendMsgContent.fileName = uploadRetData.fileName;
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
                                        .then((ret) => {
                                            console.log("send img message ret ", ret)
                                            if(ret == undefined) {
                                                for(var i=0;i<this.sendingMsgIdList.length;i++){
                                                    if(this.sendingMsgIdList[i].guid == guid){
                                                        this.sendingMsgIdList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                this.failedList.push(willSendMsg);
                                            }
                                            else {
                                                for(var i=0;i<this.sendingMsgIdList.length;i++){
                                                    if(this.sendingMsgIdList[i].message_id == guid){
                                                        this.sendingMsgIdList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                for(var i=0;i<this.failedList.length;i++){
                                                    if(this.failedList[i].message_id == guid){
                                                        this.failedList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                for(var i=0;i<this.messageList.length;i++){
                                                    if(this.messageList[i].message_id == guid){
                                                        this.messageList[i] = ret;
                                                        break;
                                                    }
                                                }
                                                // this.$store.commit("updateChatGroup", obj.message);
                                                this.$emit('updateChatList', ret, false);

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
                                console.log("====== varcontent j ", j)
                                let nextMsgItem = varcontent.ops[j].insert;
                                if(nextMsgItem.hasOwnProperty("span")) {
                                    var nextFileSpan = nextMsgItem.span;
                                    var nextPathId = nextFileSpan.id;
                                    var nextMsgInfo = this.idToPath[nextPathId];
                                    console.log("this.idToPath is ", this.idToPath)
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
                                    console.log("nextMsgItem is ", nextMsgItem);
                                    willSendMsgContent.text = willSendMsgContent.text + nextMsgItem;
                                    i += 1;
                                }
                            }
                            // @
                            let willShowMsgContent = JsonMsgContentToString(willSendMsgContent);
                            console.log("will send msg content ", willSendMsgContent)
                            // console.log("will send msg uid ", uid)
                            let guid = generalGuid();
                            let willSendMsg = {
                                "message_content": willShowMsgContent,
                                "message_from_id": this.curUserInfo.id,
                                "group_id": gorupId,
                                "message_timestamp": curTimeSeconds,
                                "message_type": sendingMsgContentType,
                                "message_id": guid,
                                };
                            this.messageList.push(willSendMsg);
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
                            
                            this.sendingMsgIdList.push(guid);
                            this.cleanEditor();
                            willSendMsg.content = willSendMsgContent;
                            // console.log("willSendMsg is ", willSendMsg);

                            services.common.sendNewMessage(
                                    guid, 
                                    sendingMsgContentType, 
                                    this.curUserInfo.id, 
                                    gorupId, 
                                    uid, 
                                    curTimeSeconds, 
                                    willSendMsgContent)
                                .then((ret) => {
                                    // console.log("sendNewMessage ret is ", ret);

                                    if(ret == undefined) {
                                        for(var i=0;i<this.sendingMsgIdList.length;i++){
                                            if(this.sendingMsgIdList[i].message_id == guid){
                                                this.sendingMsgIdList.splice(i, 1);
                                                break;
                                            }
                                        }
                                        this.failedList.push(willSendMsg);
                                    }
                                    else {
                                        for(var i=0;i<this.sendingMsgIdList.length;i++){
                                            if(this.sendingMsgIdList[i].message_id == guid){
                                                this.sendingMsgIdList.splice(i, 1);
                                                break;
                                            }
                                        }
                                        for(var i=0;i<this.failedList.length;i++){
                                            if(this.failedList[i].message_id == guid){
                                                this.failedList.splice(i, 1);
                                                break;
                                            }
                                        }
                                        for(var i=0;i<this.messageList.length;i++){
                                            if(this.messageList[i].message_id == guid){
                                                this.messageList[i] = ret;
                                                if(this.existingMsgId.indexOf(ret.message_id) == -1) {
                                                    this.existingMsgId.push(ret.message_id);
                                                }
                                                break;
                                            }
                                        }
                                        // this.$store.commit("updateChatGroup", obj.message);
                                        this.$emit('updateChatList', ret, false);

                                    }
                                })
                        }
                        else {
                            let sendingMsgContentType = 102;
                            let fileHeight = msgInfo.height;
                            let fileWidth = msgInfo.width;
                            let ext = filePath.split(".").pop();
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
                                "file_local_path": filePath
                                };
                            this.messageList.push(willSendMsg);
                            this.existingMsgId.push(willSendMsg.message_id);

                            let div = document.getElementById("message-show-list");
                            setTimeout(() => {
                                if(div) {
                                    this.$nextTick(() => {
                                        div.scrollTop = div.scrollHeight;
                                    })
                                }
                            }, 0)
                            
                            this.sendingMsgIdList.push(willSendMsg);
                            this.cleanEditor();

                            services.common.uploadFile(pathDeal(filePath))
                                .then((ret) => {
                                    // ToDo Failed List
                                    console.log("UploadFile response ", ret);
                                    var uploadRetData = ret.data.obj;
                                    let willSendMsgContent = {};
                                    willSendMsgContent.ext = uploadRetData.ext;
                                    willSendMsgContent.fileName = uploadRetData.fileName;
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
                                        .then((ret) => {
                                            // console.log("send img message ret ", ret)
                                            if(ret == undefined) {
                                                for(var i=0;i<this.sendingMsgIdList.length;i++){
                                                    if(this.sendingMsgIdList[i].message_id == guid){
                                                        this.sendingMsgIdList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                this.failedList.push(willSendMsg);
                                            }
                                            else {
                                                for(var i=0;i<this.sendingMsgIdList.length;i++){
                                                    if(this.sendingMsgIdList[i].message_id == guid){
                                                        this.sendingMsgIdList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                for(var i=0;i<this.failedList.length;i++){
                                                    if(this.failedList[i].message_id == guid){
                                                        this.failedList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                for(var i=0;i<this.messageList.length;i++){
                                                    // console.log("cur guie is ", guid)
                                                    // console.log("the messagelist guid is ", this.messageList[i].message_id)
                                                    if(this.messageList[i].message_id == guid){
                                                        console.log("update ret")
                                                        this.messageList[i] = ret;
                                                        break;
                                                    }
                                                }
                                                // console.log("Send Image msg list is ", this.messageList)
                                                // console.log("Send Image msg list content is ", strMsgContentToJson(this.messageList.message_content))
                                                // this.$store.commit("updateChatGroup", obj.message);
                                                this.$emit('updateChatList', ret, false);
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
                        let sendingMsgContentType = 101;
                        
                        let msgContent = curMsgItem;
                        var msgContentJson = {
                            "text": msgContent
                        };
                        // console.log("final cur msg item is ", msgContent.length)
                        let willSendMsgContent = {"text": msgContent};
                        // console.log("will send msg content ", willSendMsgContent)
                        // console.log("will send msg uid ", uid)
                        let guid = generalGuid();
                        // next is @
                        for(let j=i+1;j<varcontent.ops.length;j++) {
                            console.log("====== varcontent j ", j)
                            let nextMsgItem = varcontent.ops[j].insert;
                            if(nextMsgItem.hasOwnProperty("span")) {
                                var nextFileSpan = nextMsgItem.span;
                                var nextPathId = nextFileSpan.id;
                                var nextMsgInfo = this.idToPath[nextPathId];
                                console.log("this.idToPath is ", this.idToPath)
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
                            }
                            else {
                                willSendMsgContent.text = willSendMsgContent.text + " " + nextMsgItem;
                                i += 1;
                            }
                        }
                        
                        var willShowMsgContent = JsonMsgContentToString(willSendMsgContent);
                        let willSendMsg = {
                            "message_content": willShowMsgContent,
                            "message_from_id": this.curUserInfo.id,
                            "group_id": gorupId,
                            "message_timestamp": curTimeSeconds,
                            "message_type": sendingMsgContentType,
                            "message_id": guid,
                            };

                        this.messageList.push(willSendMsg);
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
                        
                        this.sendingMsgIdList.push(guid);
                        this.cleanEditor();
                        willSendMsg.content = willSendMsgContent;
                        // console.log("willSendMsg is ", willSendMsg);

                        services.common.sendNewMessage(
                                guid, 
                                sendingMsgContentType, 
                                this.curUserInfo.id, 
                                gorupId, 
                                uid, 
                                curTimeSeconds, 
                                willSendMsgContent)
                            .then((ret) => {
                                // console.log("sendNewMessage ret is ", ret);

                                if(ret == undefined) {
                                    for(var i=0;i<this.sendingMsgIdList.length;i++){
                                        if(this.sendingMsgIdList[i].message_id == guid){
                                            this.sendingMsgIdList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    this.failedList.push(willSendMsg);
                                }
                                else {
                                    for(var i=0;i<this.sendingMsgIdList.length;i++){
                                        if(this.sendingMsgIdList[i].message_id == guid){
                                            this.sendingMsgIdList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    for(var i=0;i<this.failedList.length;i++){
                                        if(this.failedList[i].message_id == guid){
                                            this.failedList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    for(var i=0;i<this.messageList.length;i++){
                                        if(this.messageList[i].message_id == guid){
                                            this.messageList[i] = ret;
                                            if(this.existingMsgId.indexOf(ret.message_id) == -1) {
                                                this.existingMsgId.push(ret.message_id);
                                            }
                                            break;
                                        }
                                    }
                                    // this.$store.commit("updateChatGroup", obj.message);
                                    this.$emit('updateChatList', ret, false);

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
                        inviteeNames = inviteeNameList.join("、");
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
                            deletedNames = deletedNames + "、" + deletedUsers[i].userName
                        }
                    }
                    return owner + " 将 " + deletedNames + " 移出了群聊";
                }
                else if(chatGroupMsgContent.type == "groupTransfer") {
                    var originalOwner = chatGroupMsgContent.fromUserName;
                    var newOwner = chatGroupMsgContent.toUserName;
                    console.log("get return is ", originalOwner + " 将群主转让给 " + newOwner)
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
            // console.log("========groupIsInFavourite status ", (groupInfo.status))
            // console.log("========groupIsInFavourite ", (Number(groupInfo.status) & Number("00000001")) != 0)
            if((Number(groupInfo.status) & Number("00001000")) != 0) {
                // console.log("groupIsInFavourite grou name is ", groupInfo.group_name)
                // console.log("group state is ", groupInfo.status)
                return true;
            }
            return false;
        },
        groupIsSlience(groupInfo) {
            // console.log("========groupIsSlience status ", (groupInfo.status))
            // console.log("========groupIsSlience ", (Number(groupInfo.status) & Number("00000001")) != 0)
            if((Number(groupInfo.status) & Number("00000001")) != 0) {
                // console.log("groupIsSlience grou name is ", groupInfo.group_name)
                // console.log("group state is ", groupInfo.status)
                return true;
            }
            return false;
        },
        groupIsTop(groupInfo) {
            // console.log("========groupIsTop status ", groupInfo.status)
            console.log("========groupIsTop ", (Number(groupInfo.status) & Number("00000010"))!= 0)
            if((Number(groupInfo.status) & Number("00000010")) != 0) {
                // console.log("top grou name is ", groupInfo.group_name)
                // console.log("group state is ", groupInfo.status)
                return true;
            }
            return false;
        },
        More: async function() {
            var isGroup = this.chat.group_type == 101 ? true : false;
            var idsList = this.chat.contain_user_ids.split(",");
            var isOwner = (this.chat.owner == this.curUserInfo.id ? true : false);
            console.log("this.chat ", this.chat);
            console.log("this.isTop ", this.groupIsTop(this.chat))
            console.log("this.isSlience ", this.groupIsSlience(this.chat))
            console.log("this.isFav ", this.groupIsInFavourite(this.chat))
            var groupInfoObj = {
                "memberList": idsList,
                "groupName": this.chat.group_name,
                "groupAvarar": this.chat.group_avarar,
                "groupNotice": this.chat.group_notice,
                "groupId": this.chat.group_id,
                "isGroup": isGroup,
                "isOwner": isOwner,
                "isTop": this.groupIsTop(this.chat),
                "isSlience": this.groupIsSlience(this.chat),
                "isFav": this.groupIsInFavourite(this.chat),
                "ownerId": this.chat.owner,
            }
            this.updateNotice = this.chat.group_notice;
            this.groupInfo = groupInfoObj;
            // console.log("more more more ", this.chat.contain_user_ids.split(","))
            // var idsList = this.chat.contain_user_ids.split(",");
            // this.groupContainUserIds = idsList;
            // console.log("this.chat.group_name is ", this.chat.group_name);
            this.showGroupInfoTips = true;
            this.cleanCache = false;
            console.log("more more more ", this.showGroupInfoTips)
        },
        compare: function(){
            return function(a, b)
            {
                var value1 = a.sequence_id;
                var value2 = b.sequence_id;
                return value2 - value1;
            }
        },
        handleScroll: function() {
            let uldiv = document.getElementById("message-show-list");
            if(uldiv) {
                if(uldiv.scrollTop < 100){
                    var curTime = new Date().getTime();
                    // console.log("curTime - this.lastRefreshTime ", curTime - this.lastRefreshTime)
                    if(curTime - this.lastRefreshTime > 0.5 * 1000 && !this.isRefreshing){
                        let lastScrollHeight = uldiv.scrollHeight;
                        this.isRefreshing = true;
                        this.lastRefreshTime = new Date().getTime();
                        let lastSequenceId = this.messageList[0].sequence_id;
                        services.common.historyMessage(this.chat.group_id, lastSequenceId, 20)
                            .then((ret) => {
                                this.isRefreshing = false;
                                var messageListTmp = ret.sort(this.compare());
                                for(var i=0;i<messageListTmp.length;i++){
                                    console.log("to get history ", this.existingMsgId.indexOf(messageListTmp[i].message_id))
                                    if(this.existingMsgId.indexOf(messageListTmp[i].message_id) == -1) {
                                        this.messageList.unshift(messageListTmp[i]);
                                        this.existingMsgId.push(messageListTmp[i].message_id);
                                    }
                                }
                                this.$nextTick(() => {
                                    uldiv.scrollTop = uldiv.scrollHeight - lastScrollHeight;
                                })
                            })
                    }
                }
            }
        },
        getHistoryMessage: function() {
            services.common.historyMessage(this.chat.group_id, this.chat.sequence_id, 20)
                .then((ret) => {
                    var messageListTmp = ret.sort(this.compare());
                    this.messageList = [];
                    for(var i=0;i<messageListTmp.length;i++){
                        // console.log("this.chat.sequence_id is ", this.chat.sequence_id);
                        var chatGroupMsgContent = strMsgContentToJson(messageListTmp[i].message_content);
                        // console.log("chatGroupMsgContent is ", chatGroupMsgContent)
                        // console.log("getHistoryMessage messageListTmp [i] is ", messageListTmp[i].sequence_id);
                        if(this.existingMsgId.indexOf(messageListTmp.message_id) == -1) {
                            this.messageList.unshift(messageListTmp[i]);
                            this.existingMsgId.push(messageListTmp[i].message_id);
                        }
                    }
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
                        this.$nextTick(() => {
                            let div = document.getElementById("message-show-list");
                            if(div) {
                                div.scrollTop = div.scrollHeight;
                                // The left msg get through scroll event
                                div.addEventListener('scroll', this.handleScroll);
                            }
                            this.isRefreshing = false;
                        })
                    }, 1000)
                })
        },
        updateChatGroupStatus(groupId, groupStatus, updateType) {
            console.log("======== ");
            this.$emit("updateChatGroupStatus", groupId, groupStatus, updateType);
        },
        updateChatGroupNotice(groupId, originalNotice) {
            console.log("==========")
            this.noticeDialogVisible = true;
            this.groupNoticeInfo = {};
            this.groupNoticeInfo.originalNotice = originalNotice;
            this.groupNoticeInfo.groupId = groupId;
        },
        closeNoticeDlg(content) {
            if(content.length == 0) {
                this.noticeDialogVisible = false;
                this.groupNoticeInfo = {};
            }
            else {
                this.noticeDialogVisible = false;
                this.updateNotice = content;
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
            this.$emit('updateChatList', msg, forceUpdate);
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
            checkClassName: ["chat-msg-content-others-txt", "transmit-title", "transmit-content", "chat-msg-content-mine-transmit", "chat-msg-content-others-voice", "chat-msg-content-mine-voice", "chat-msg-content-others-txt-div", "chat-msg-content-mine-txt-div", "chat-msg-content-mine-txt", "msg-image", "chat-msg-content-others-file", "chat-msg-content-mine-file", "file-name", "file-image", "voice-info", "file-size", "voice-image"],
            groupCreaterTitle: '发起群聊',
            groupNoticeInfo: {},
            updateUser:[],
            updateNotice: "",
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
            disabledusers: [],
            groupInfo: {},
            groupContainUserIds: [],
            ipcInited: false,
            showGroupInfoTips: false,
            showTransmitDlg: false,
            updateTransmit: false,
            transmitTogether: false,
            selectedMsgs: [],
            editor:null,
            messageList: [],
            sendingMsgIdList: [],
            waitForSendingFiles: [],
            failedList: [],
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
            constStyle: 'display:inline-block;outline:none;border-radius: 2px;border: 1px solid rgb(218,218,221);width: 200px;height: 46px;background-repeat: no-repeat;background-position:center left;background-image: url();background-size: auto 90%;line-height: 46px;',
            imgConstStyle: 'display:inline-block;outline:none;border: 0px;width: ;height: 46px;background-repeat: no-repeat;background-position:center left;background-image: url();background-size: auto 90%;line-height: 46px;text-indent:50px;',
            atConstStyle: 'display:inline-block;outline:none;border: 0px;width: ;font-size:14px;font-family:Microsoft YaHei',
        }
    },
    mounted: function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        setTimeout(() => {
            this.$nextTick(() => {
                console.log("==============ipc on")
                ipcRenderer.on('updateMsgFile', this.updateMsgFile);
                ipcRenderer.on('updateUserImage', this.updateUserImage);
                this.editor = this.$refs.chatQuillEditor.quill;
                console.log(this.$refs.chatQuillEditor);
                this.$refs.chatQuillEditor.$el.style.height='150px';
                // this.$refs.chatQuillEditor
                this.fileInput = document.getElementById("fileInput");
                this.showGroupName(this.chat);
                ipcRenderer.on('updateGroupImg', this.updateGroupImg);
            })
        }, 0)
        document.addEventListener('click',this.closeUserInfoTip)
    },
    created: async function() {
        this.loginInfo = await services.common.GetLoginModel();
        this.curUserInfo = await services.common.GetSelfUserModel();
        console.log("===============mqttinit")
        services.common.initmqtt();
        services.common.handlemessage(this.callback);

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
    watch: {
        chat: function() {
            if(this.chat == undefined) {
                return;
            }
            if(this.curGroupId != this.chat.group_id) {
                this.curGroupId = this.chat.group_id;
                var curSequenceId = this.chat.sequence_id;

                this.existingMsgId = [];
                
                this.getHistoryMessage();
                this.showGroupName(this.chat);
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
        width: 8px;
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
        margin-bottom: 12px;
        -webkit-app-region: drag;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .chat-name {
        height: 32px;
        line-height: 32px;
        margin:0px 12px 0px 0px;
        float: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        font-weight: 590;
    }

    .chat-img {
        margin:0px 8px 0px 16px;
        height: 32px;
        width: 32px;
        float: left;
        border: 0px solid rgba(0, 0, 0, 0);
    }
    
    .chat-name-state {
        height: 32px;
        line-height: 32px;
        margin:0px 12px 0px 0px;
        max-width: 100px;
        float: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 12px;
        font-family: 'Microsoft YaHei';
        font-weight: 590;
        color: rgba(153, 153, 153, 1);
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
        border-bottom: 0px solid rgb(242, 242, 246);
        display: flex;
        flex-direction: column;
        list-style: none;
        overflow-y: hidden;
        overflow-x: hidden;
    }

    .msg-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        list-style: none;
        // height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;

        li {
            list-style-type: none;
        }
    }

    .msg-info {
        width: 100%;
        margin: 5px 0 5px 0;
    }

    .msg-info-time {
        width: 100%;
        text-align: center;
        font-size: 12px;
        font-family: 'Microsoft YaHei';
        color: rgba(187, 187, 187, 1);
        margin: 5px 10px 5px 10px;
    }

    .chat-notice {
        width: 100%;
        text-align: center;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        color: rgba(187, 187, 187, 1);
        margin: 10px 10px 10px 10px;
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
        margin-top: 14px;
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
        font-family: 'Microsoft YaHei';
        font-size: 14px;
    }

    .chat-input {
        width: 100%;
        height: 170px;
        font-family: 'Microsoft YaHei';
        font-size: 14px;
    }

    .multiSelectTools {
        width: 100%;
        height: 170px;
        text-align: center;
    }

    .multiSelectTransmit {
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 130px;
        margin-right: 15px;
    }

    .multiSelectTransmitTogether {
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 15px;
        margin-right: 15px;
    }

    .multiSelectFav {
        width: 44px;
        height: 44px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 15px;
        margin-right: 15px;
    }

    .multiSelectDel {
        width: 40px;
        height: 40px;
        margin-top: 60px;
        margin-bottom: 60px;
        margin-left: 15px;
        margin-right: 15px;
    }

    .multiSelectToolClose {
        width: 24px;
        height: 24px;
        margin-top: 68px;
        margin-bottom: 68px;
        margin-left: 15px;
        margin-right: 58px;
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
        bottom: 155px;
        left:5px;
        box-shadow: 2px 2px 5px rgb(219,219,219);
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
        font-family: 'Microsoft YaHei';
    }

    // .ql-editor{
    //     cursor: text;
    // }

    .text-input {
        border: 0px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
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
        font-family: 'Microsoft YaHei';
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .el-dialog__body {
        padding-top: 0px;
        padding-left: 32px;
        padding-right: 32px;
        padding-bottom: 0px;
    }

    .groupNotice {
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-indent: 10px;
        width:376px;
        height:280px;
        background:rgba(255,255,255,1);
        border-radius:4px 0px 0px 4px;
        border:1px solid rgba(221,221,221,1);
        color: rgba(153, 153, 153, 1);
    }

    .groupNotice:focus {
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-indent: 10px;
        width:376px;
        height:280px;
        background:rgba(255,255,255,1);
        border-radius:4px 0px 0px 4px;
        border:1px solid rgba(221,221,221,1);
        color: rgba(153, 153, 153, 1);
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