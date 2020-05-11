<template>
    <div class="chat-page">
        <div class="chat-title">
            <p class="chat-name" id="chat-group-name"></p>
            <div class="chat-tools">
                <div class="chat-tool-more" @click="More()">
                    <i class="el-icon-more"></i>
                </div>
                <div class="chat-tool-call" @click="Call()" v-show=false>
                    <i class="el-icon-phone"></i>
                </div>
            </div>
        </div>
        <div class="chat-main">
            <div class="chat-main-message" id="message-show">
                <ul class="msg-list" id="message-show-list">
                    <li v-for="(item, index) in messageListShow"
                        :class="ChatLeftOrRightClassName(item)">
                        <div class="msg-info-time" v-show="showTimeOrNot(item, messageListShow[index-1])">{{MsgTime(item)}}</div>
                        <div class="chat-notice" v-show="showNoticeOrNot(item)">{{NoticeContent(item)}}</div>
                        <imessage :msg="item" v-show="showMessageOrNot(item)" @showImageOfMessage="showImageOfMessage" @openUserInfoTip="openUserInfoTip"></imessage>
                    </li>
                </ul>
            </div>
            <div class="chat-input">
                <div class="chat-input-operate">
                    <div class="chat-input-tool">
                        <Faces v-show="showFace"  @click="showFace = true" class="faces-box" @insertFace="insertFace"></Faces>
                        <div class="chat-input-expression" @click="showExpression()">
                            <img class="el-icon-emoji" src="/static/Img/Chat/emoji@3x.png">
                        </div>
                        <div class="chat-input-picture" @click="insertPic()">
                            <img class="el-icon-picture" src="/static/Img/Chat/pic@3x.png">
                        </div>
                        <div class="chat-input-file" @click="insertFiles()">
                            <img class="el-icon-files" src="/static/Img/Chat/file@3x.png">
                        </div>
                        <div class="chat-input-more" @click="ShowMore()">
                            <img class="el-icon-more" src="/static/Img/Chat/chat_more@3x.png">
                        </div>
                    </div>
                    <div class="chat-send" @click="sendMsg()">
                        <i class="el-icon-s-promotion"></i>
                    </div>
                </div>
                <input type="file" id="fileInput" style="display:none" @change="handleFiles()" multiple>
                <div class="text-input" @keyup="keyHandle($event)">
                    <quillEditor
                        ref="chatQuillEditor"
                        :options="editorOption">
                    </quillEditor>
                </div>
            </div>
        </div>
        <userInfoTip v-show="showUserInfoTips" :tipInfos="tipInfos"></userInfoTip>
    </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.bubble.css'
import {quillEditor} from 'vue-quill-editor'
import * as Quill from 'quill'
import {ipcRenderer} from 'electron'

import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import Faces from './faces.vue';
import userInfoTip from './userinfo-tip.vue'
import {generalGuid, Appendzero, FileUtil, findKey, pathDeal, fileTypeFromMIME, getIconPath, uncodeUtf16, strMsgContentToJson, JsonMsgContentToString, sliceReturnsOfString, getFileNameInPath} from '../../packages/core/Utils.js'
import imessage from './message.vue'

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
    },
    props: ['chat'],
    methods: {
        keyHandle(event) {
            if(event.code == "Enter" && !event.ctrlKey) {
                this.sendMsg();
            }
            else if(event.code == "Enter" && event.ctrlKey) {
                var range = this.editor.getSelection();
                var curIndex = range == null ? 0 : range.index;
                this.editor.insertText(curIndex, '\n');
            }
        },
        showImageOfMessage(imgSrcInfo) {
            this.$emit('showImageOfMessage', imgSrcInfo);
        },
        openUserInfoTip(tipInfos) {
            this.tipInfos = tipInfos;
            this.showUserInfoTips = true;
        },
        closeUserInfoTip(){
            this.tipInfos = {};
            this.showUserInfoTips = false;
        },
        showExpression: function() {
            this.showFace = !this.showFace;
        },
        showGroupName(chatGroupItem) {
            var groupNameElement = document.getElementById("chat-group-name");
            if(chatGroupItem === null){
                return "";
            }
            console.log("getShowGroupName is ", chatGroupItem.group_id)
            var groupName = chatGroupItem.group_name;
            if(groupName.length == 0) {
                var aboutUids = chatGroupItem.contain_user_ids;
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
            // this.fileInput.click();
            ipcRenderer.send('open-directory-dialog', 'openFile');
            ipcRenderer.on('selectedItem', this.nHandleFiles);
        },
        insertFiles: function() {
            // this.fileInput.click();
            ipcRenderer.send('open-directory-dialog', 'openFile');
            ipcRenderer.on('selectedItem', this.nHandleFiles);
        },
        nHandleFiles: function(e, paths) {
            // Select Same File Failed.
            var fileList = paths;
            console.log("======", fileList)
            if(fileList === null || fileList.length === 0) {
                alert("请选择一个文件/文件夹。");
            }
            else {
                for(var i=0;i<fileList.length;i++) {
                    var curPath = fileList[i]
                    console.log("filelist[i] = ", fileList[i])
                    if(this.waitForSendingFiles.indexOf(fileList[i] != -1)) {
                        var range = this.editor.getSelection();
                        console.log("this. editor is ", this.editor)
                        var curIndex = range==null ? 0 : range.index;

                        var showfu = new FileUtil(fileList[i]);
                        var showfileObj = showfu.GetUploadfileobj();
                        var fileType = showfu.GetMimename();
                        var fileExt = showfu.GetExtname();

                        if(fileType.split("/")[0] == "image"){
                            // Image
                            let reader = new FileReader();
                            reader.readAsDataURL(showfileObj);
                            reader.onloadend = () => {
                                var img = new Image();
                                img.src = reader.result;
                                img.onload = function(){
                                    let srcHeight = img.height;
                                    console.log("this.editor is ", this.editor)
                                }
                                this.editor.insertEmbed(curIndex, 'fileBlot', {localPath: curPath, src: reader.result, fileType: "image", fileHeight: 46});
                                this.editor.setSelection(this.editor.selection.savedRange.index + 1);
                            }
                        }
                        else {
                            // File
                            var iconPath = getIconPath(fileExt);
                            var showfu = new FileUtil(iconPath);
                            let showfileObj = showfu.GetUploadfileobj();
                            let reader = new FileReader();
                            reader.readAsDataURL(showfileObj);
                            reader.onloadend = () => {
                                this.editor.insertEmbed(curIndex, 'fileBlot', {localPath: curPath, src: reader.result, fileType: "file", fileHeight: 46, fileSize: 123, style:"vertical-align:middle;"})
                                this.editor.setSelection(this.editor.selection.savedRange.index + 1);
                            }
                        }
                    }
                    console.log("finished")
                }
            }
        },
        updateChatList: function() {
            this.$store.state.chatGroup[0].message = this.messageList[-1];
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
            // Send Test Interface
            let varcontent = this.editor.getContents();
            if(varcontent == null || varcontent.length == 0) {
                // toDo To Deal The \n
                alert("不能发送空白信息。")
            }
            else{
                var ingnor = varcontent.ops[varcontent.ops.length-1]
                var ingnor_split = ingnor.insert.split('\n')
                if(ingnor_split.length == 2 && ingnor_split[0].trim().length == 0 && ingnor_split[1].trim() == 0){
                    console.log("Yes you are right.")
                }
                console.log("the length is ", varcontent.ops.length)
                for(var i=0;i<varcontent.ops.length;i++){
                    let curMsgItem = varcontent.ops[i].insert;
                    let curTimeSeconds = new Date().getTime();
                    if(curMsgItem.hasOwnProperty("fileBlot")){
                        if(curMsgItem.fileBlot.type == "image"){
                            let sendingMsgContentType = 102;
                            let picUrl = curMsgItem.fileBlot.src;
                            let filePath = curMsgItem.fileBlot.localPath;
                            let ext = filePath.split(".").pop();
                            let fileSize = curMsgItem.fileBlot.fileSize;
                            let fileName = getFileNameInPath(filePath);
                            let willSendMsgContent = {
                                "ext":ext,
                                "fileName":fileName,
                                "url":"",
                                "middleImage":"",
                                "thumbnailImage": picUrl,
                                "imgWidth": "",
                                "imgHeight": "",
                                "fileSize": fileSize
                            }
                            let guid = generalGuid();
                            let willSendMsg = {
                                "content": willSendMsgContent,
                                "fromId": this.$store.state.userInfo.id,
                                "groupId": this.chat.group.groupId,
                                "timestamp": curTimeSeconds,
                                "msgContentType": sendingMsgContentType,
                                "msgId": guid,
                                };
                            this.cleanEditor();
                        }
                        else{
                            let sendingMsgContentType = 103;
                            let picUrl = curMsgItem.fileBlot.src;
                            let filePath = curMsgItem.fileBlot.localPath;
                            let fileSize = curMsgItem.fileBlot.fileSize;
                            let fileName = getFileNameInPath(filePath);
                            let ext = filePath.split(".").pop();
                            let willSendMsgContent = {
                                "ext":ext,
                                "fileName":fileName,
                                "url":"",
                                "fileSize": fileSize
                            }
                            let guid = generalGuid();
                            let willSendMsg = {
                                "content": willSendMsgContent,
                                "fromId": this.$store.state.userInfo.id,
                                "groupId": this.chat.group.groupId,
                                "timestamp": curTimeSeconds,
                                "msgContentType": sendingMsgContentType,
                                "msgId": guid,
                                };
                            this.cleanEditor();
                        }
                    }
                    else{
                        // Text
                        let sendingMsgContentType = 101;
                        let msgContent = varcontent.ops[i].insert;
                        let willSendMsgContent = {"text": msgContent};
                        let guid = generalGuid();
                        let willSendMsg = {
                            "content": willSendMsgContent,
                            "fromId": this.$store.state.userInfo.id,
                            "groupId": this.chat.group.groupId,
                            "timestamp": curTimeSeconds,
                            "msgContentType": sendingMsgContentType,
                            "msgId": guid,
                            };
                        this.cleanEditor();
                    }
                }
            }
        },
        sendMsg: function() {
            let varcontent = this.editor.getContents();
            if(varcontent == null || varcontent.length == 0) {
                // toDo To Deal The \n
                alert("不能发送空白信息。")
            }
            else{
                var uid = this.getDistUidThroughUids(this.chat.contain_user_ids);
                var gorupId = this.chat.group_id == null ? '' : this.chat.group_id;
                for(var i=0;i<varcontent.ops.length;i++){
                    let curMsgItem = varcontent.ops[i].insert;
                    let curTimeSeconds = new Date().getTime();
                    
                    if(curMsgItem.hasOwnProperty("fileBlot")){
                        if(curMsgItem.fileBlot.type == "image"){
                            let sendingMsgContentType = 102;
                            let picUrl = curMsgItem.fileBlot.src;
                            let filePath = curMsgItem.fileBlot.localPath;
                            let fileHeight = curMsgItem.fileBlot.fileHeight;
                            let fileSize = curMsgItem.fileBlot.fileSize;
                            let fileName = getFileNameInPath(filePath);
                            let ext = filePath.split(".").pop();
                            let willShowMsgContent = JsonMsgContentToString({
                                "ext":ext,
                                "fileName":fileName,
                                "url":"",
                                "middleImage":"",
                                "thumbnailImage": filePath,
                                "imgWidth": "",
                                "imgHeight": fileHeight,
                                "fileSize": fileSize
                            });
                            var guid = generalGuid();
                            let willSendMsg = {
                                "message_content": willShowMsgContent,
                                "message_from_id": this.curUserInfo.id,
                                "group_id": gorupId,
                                "message_timestamp": curTimeSeconds,
                                "message_type": sendingMsgContentType,
                                "message_id": guid,
                                };
                            this.messageList.push(willSendMsg);

                            let div = document.getElementById("message-show");
                            setTimeout(() => {
                                if(div) {
                                    this.$nextTick(() => {
                                        div.scrollTop = div.scrollHeight;
                                    })
                                }
                            }, 0)
                            
                            this.sendingMsgIdList.push(willSendMsg);
                            this.cleanEditor();

                            // this.serverapi.uploadFile(this.$store.state.accesstoken, pathDeal(filePath))
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

                                    // this.serverapi.sendNewMessage(this.$store.state.accesstoken, guid, sendingMsgContentType, this.$store.state.userInfo.id, this.chat.group.groupId, this.$store.state.userId, curTimeSeconds, willSendMsgContent)
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
                                                this.$emit('updateChatList', ret);
                                            }
                                        })
                                })
                        }
                        else{
                            let sendingMsgContentType = 103;
                            let picUrl = curMsgItem.fileBlot.src;
                            let filePath = curMsgItem.fileBlot.localPath;
                            let fileSize = curMsgItem.fileBlot.fileSize;
                            let fileName = getFileNameInPath(filePath);
                            console.log("chat file name is ", fileName)
                            let ext = filePath.split(".").pop();
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
                                };
                            this.messageList.push(willSendMsg);

                            let div = document.getElementById("message-show");
                            setTimeout(() => {
                                if(div) {
                                    this.$nextTick(() => {
                                        div.scrollTop = div.scrollHeight;
                                    })
                                }
                            }, 0)
                            
                            this.sendingMsgIdList.push(guid);
                            this.cleanEditor();

                            // this.serverapi.uploadFile(this.$store.state.accesstoken, pathDeal(filePath))
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

                                    // this.serverapi.sendNewMessage(this.$store.state.accesstoken, guid, sendingMsgContentType, this.$store.state.userInfo.id, this.chat.group.groupId, this.$store.state.userId, curTimeSeconds, willSendMsgContent)
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
                            return;
                        }
                        let sendingMsgContentType = 101;
                        let msgContent = curMsgItem;
                        var msgContentJson = {
                            "text": msgContent
                        };
                        var willShowMsgContent = JsonMsgContentToString(msgContentJson);
                        let willSendMsgContent = {"text": msgContent};
                        console.log("will send msg content ", willSendMsgContent)
                        console.log("will send msg uid ", uid)
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
                        
                        let div = document.getElementById("message-show");
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
                        console.log("willSendMsg is ", willSendMsg);

                        // this.serverapi.sendNewMessage(this.loginInfo.access_token, guid, sendingMsgContentType, this.$store.state.userId, this.chat.group.group_id, this.$store.state.userId, curTimeSeconds, willSendMsgContent)
                        services.common.sendNewMessage(
                                guid, 
                                sendingMsgContentType, 
                                this.curUserInfo.id, 
                                gorupId, 
                                uid, 
                                curTimeSeconds, 
                                willSendMsgContent)
                            .then((ret) => {
                                console.log("sendNewMessage ret is ", ret);

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
                    var inviteeNames = "";
                    for(var i=0;i<invitees.length;i++) {
                        inviteeNames = inviteeNames + "、" + invitees[i].userName
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
                    var bybyer = chatGroupMsgContent.userInfos.userName;
                    return owner + " 将 " + bybyer + " 移出了群聊";
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
            if(curMsg.message_from_id === this.$store.state.userId) {
                return "message-right";
            }
            else {
                return "message-left";
            }
        },
        Call: function() {
            console.log("make a call");
        },
        More: function() {
            console.log("show more");
        },
        compare: function(){
            return function(a, b)
            {
                var value1 = a.sequence_id;
                var value2 = b.sequence_id;
                return value1 - value2;
            }
        },
        handleScroll: function() {
            let uldiv = document.getElementById("message-show-list");
            if(uldiv) {
                if(uldiv.scrollTop < 100){
                    var curTime = new Date().getTime();
                    if(curTime - this.lastRefreshTime > 0.5 * 1000 && !this.isRefreshing){
                        let lastScrollHeight = uldiv.scrollHeight;
                        this.isRefreshing = true;
                        this.lastRefreshTime = new Date().getTime();
                        let lastSequenceId = this.messageList[0].sequence_id;
                        services.common.historyMessage(this.chat.group_id, lastSequenceId, 20)
                            .then((ret) => {
                                this.isRefreshing = false;
                                var messageListTmp = ret;
                                for(var i=0;i<messageListTmp.length;i++){
                                    if(this.existingMsgId.indexOf(messageListTmp[i].message_id) == -1) {
                                        console.log("+============= push")
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
                    console.log("getHistoryMessage historyMessage ret is ", ret)
                    var messageListTmp = ret;
                    this.messageList = [];
                    
                    for(var i=0;i<messageListTmp.length;i++){
                        if(this.existingMsgId.indexOf(messageListTmp.message_id) == -1) {
                            this.messageList.unshift(messageListTmp[i]);
                            this.existingMsgId.push(messageListTmp[i].message_id);
                        }
                    }
                    if(messageListTmp.length !=0){
                        if(messageListTmp[0].sequence_id != this.chat.sequence_id){
                            let messageFromGroup = {};
                            messageFromGroup.message_type = this.chat.message_content_type;
                            messageFromGroup.message_content = this.chat.message_content;
                            messageFromGroup.message_from_id = this.chat.message_from_id;
                            messageFromGroup.message_timestamp = this.chat.last_message_time;
                            messageFromGroup.sequence_id = this.chat.sequence_id;
                            messageFromGroup.message_id = this.chat.message_id;
                            if(this.existingMsgId.indexOf(messageFromGroup.message_id) == -1) {
                                this.messageList.push(messageFromGroup);
                                this.existingMsgId.push(messageFromGroup.message_id);
                            }
                        }
                    }
                    else{
                        if(this.chat.message_content != null){
                            console.log("this.chat.message_content is ", this.chat.message_content)
                            let messageFromGroup = {};
                            messageFromGroup.message_type = this.chat.message_content_type;
                            messageFromGroup.message_content = this.chat.message_content;
                            messageFromGroup.message_from_id = this.chat.message_from_id;
                            messageFromGroup.message_timestamp = this.chat.last_message_time;
                            messageFromGroup.sequence_id = this.chat.sequence_id;
                            messageFromGroup.message_id = this.chat.message_id;
                            if(this.existingMsgId.indexOf(messageFromGroup.message_id) == -1) {
                                this.messageList.push(messageFromGroup);
                                this.existingMsgId.push(messageFromGroup.message_id);
                            }
                        }
                        console.log("this.messagelist is ", this.messageList)
                    }
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
                    }, 100)
                })
        },
        callback(msg) {
            // console.log("chat callback msg is ", msg);
            console.log("chat callback msg content is ", strMsgContentToJson(msg.message_content));
            if(msg.group_id == this.chat.group_id) {
                if(this.existingMsgId.indexOf(msg.message_id) == -1){
                    this.messageList.push(msg);
                    this.existingMsgId.push(msg.message_id);
                    console.log("emit updatechatlist");
                    this.$emit('updateChatList', msg);
                    let div = document.getElementById("message-show-list");
                    if(div) {
                        this.$nextTick(() => {
                            div.scrollTop = div.scrollHeight;
                        })
                    }
                }
            }
        }
    },
    data() {
        return {
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
                }
            },
            showFace: false,
            lastRefreshTime: 0,
            // When watch finished set isRefreshing to false
            isRefreshing: true,
            showUserInfoTips: false,
            tipInfos: {},
            existingMsgId: [],
        }
    },
    mounted: function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        setTimeout(() => {
            this.$nextTick(() => {
                this.editor = this.$refs.chatQuillEditor.quill;
                console.log(this.$refs.chatQuillEditor);
                this.$refs.chatQuillEditor.$el.style.height='150px';
                // this.$refs.chatQuillEditor
                this.fileInput = document.getElementById("fileInput");
                this.showGroupName(this.chat);
            })
        }, 0)
    },
    created: async function() {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
        this.loginInfo = await services.common.GetLoginModel();
        this.curUserInfo = await services.common.GetSelfUserModel();

        services.common.initmqtt();
        services.common.handlemessage(this.callback);

        document.addEventListener('click',function(e){
            if(e.target.className!='userInfo-view' && e.target.className!='userInfo-Top' & e.target.className!='msg-info-user-img'){
                // console.log("cur class  is ", e.target.className);
                // console.log("showUserInfoTips is ", this.showUserInfoTips);
                this.tipInfos = {};
                this.showUserInfoTips = false;
            }
        })
    },
    computed: {
        messageListShow: {
            get: function() {
                return this.messageList;
            }
        }
    },
    watch: {
        chat: function() {
            if(this.curGroupId != this.chat.group_id) {
                this.curGroupId = this.chat.group_id;
                var curSequenceId = this.chat.sequence_id;
                
                this.getHistoryMessage();
                this.showGroupName(this.chat);
            }
        }
    }
}
</script>

<style lang="scss">
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

    .chat-page {
        width: 100%;
        height: 100%;
    }

    .chat-title {
        display: float;
        width: 100%;
        height: 42px;
        background-color: rgb(255, 255, 255);
        border-bottom: 1px solid rgb(242, 242, 246);
        -webkit-app-region: drag;
        * {
            
            -webkit-app-region: no-drag;
        }
    }

    .chat-name {
        margin:10px 30px 20px 30px;
        float: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 16px;
        font-family: 'Microsoft YaHei';
        font-weight: 590;
    }

    .chat-tools {
        margin:0;
        float: right;
        height: 100%;
        width: 200px;
    }

    .chat-tool-more {
        display: inline-block;
        float: right;
        width: 40px;
        line-height: 100%;
        padding: 12px 0px 22px 0px;
        margin: 0px;
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
        margin-top: -2px;
    }

    .chat-main-message {
        width: 100%;
        height: calc(100% - 150px);
        border-bottom: 1px solid rgb(242, 242, 246);
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
        color: rgb(153, 153, 153);
        margin: 5px 10px 5px 10px;
    }

    .chat-notice {
        width: 100%;
        text-align: center;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        color: rgb(153, 153, 153);
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

    .chat-input {
        width: 100%;
        height: 170px;
        font-family: 'Microsoft YaHei';
        font-size: 14px;
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
        width: 18px;
        height: 18px;
        margin: 0px;
        padding: 0px;
    }

    .chat-input-more {
        display: inline-block;
        padding: 10px 11px 10px 11px;
    }

    .el-icon-more {
        width: 18px;
        height: 18px;
        margin: 0px;
        padding: 0px;
    }

    .chat-input-picture {
        display: inline-block;
        margin: 0;
        padding: 11px 11px 11px 11px;
    }

    .el-icon-picture {
        width: 20px;
        height: 16px;
        margin: 0px;
        padding: 0px;
    }

    .chat-input-file {
        display: inline-block;
        margin: 0;
        padding: 11px 11px 11px 11px;
    }

    .el-icon-files {
        width: 20px;
        height: 16px;
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

    // .quill-editor {
    //     margin: 0px;
    //     padding: 0px;
    // }

    .ql-bubble .ql-editor{
        height: 100%;
        margin: 0px;
        padding: 0px;
        font-size: 13px;
        font-family: 'Microsoft YaHei';
    }

    .text-input {
        border: 0px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        height: 150px;
    }

    .text-input:focus {
        outline: none;
        width: 100%;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        height: 55px;
    }
</style>