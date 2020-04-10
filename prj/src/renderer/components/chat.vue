<template>
    <div class="chat-page">
        <div class="chat-title">
            <p class="chat-label">{{chat.group.groupName}}</p>
            <div class="chat-tools">
                <div class="chat-tool-more" @click="More()">
                    <i class="el-icon-more"></i>
                </div>
                <div class="chat-tool-call" @click="Call()">
                    <i class="el-icon-phone"></i>
                </div>
            </div>
        </div>
        <div class="chat-main">
            <div class="chat-main-message" id="message-show">
                <ul class="msg-list">
                    <li v-for="(item, index) in messageListShow"
                        :class="ChatLeftOrRightClassName(item)">
                        <div class="msg-info-time" v-show="showTimeOrNot(item, messageListShow[index-1])">{{MsgTime(item)}}</div>
                        <div class="chat-notice" v-show="showNoticeOrNot(item)">{{NoticeContent(item)}}</div>
                        <imessage :msg="item" v-show="showMessageOrNot(item)"></imessage>
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
                <input type="file" id="fileInput" style="display:none" @change="handleFiles()">
                <div class="text-input">
                    <quillEditor
                        ref="chatQuillEditor"
                        :options="editorOption"
                        @blur="onEditorBlur($event)"
                        @focus="onEditorFocus($event)"
                        @change="onEditorChange($event)">
                    </quillEditor>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.bubble.css'
import {quillEditor} from 'vue-quill-editor'
import * as Quill from 'quill'

import {APITransaction} from '../../packages/data/transaction.js'
import Faces from './faces.vue';
import {generalGuid, Appendzero, FileUtil, findKey, pathDeal} from '../server/Utils.js'
import imessage from './message.vue'

const InlineBlot = Quill.import('blots/block/embed')
class FileBlot extends InlineBlot {
    static create(data) {
        console.log("FileBlot create data is ", data);
        const node = super.create(data);
        node.setAttribute('local-path', data.local_path);
        node.setAttribute('src', data.src);
        node.setAttribute('type', data.file_type);
        node.setAttribute('height', 60);

        return node;
    }
    static value(domNode) {
        var tmp = {};
        tmp["local_path"] = domNode.getAttribute('local-path');
        tmp["type"] = domNode.getAttribute('type');
        tmp["src"] = domNode.getAttribute('src');
        return tmp;
    }
}
FileBlot.blotName = 'fileBlot';
FileBlot.className = 'file-blot';
FileBlot.tagName = 'img';
Quill.register(FileBlot);

export default {
    components: {
        quillEditor,
        imessage,
        Faces,
    },
    props: ['chat'],
    methods: {
        showExpression: function() {
            this.showFace = !this.showFace;
        },
        insertFace: function(item) {
            this.messageContent = this.messageContent + 'face' + item;
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
                        console.log("Insert Image range is ", range);
                        var reader = new FileReader();
                        var curPath = fileList[i].path;
                        var curIndex = range==null ? 0 : range.index;
                        var fileType = fileList[i].type;
                        if(fileType.split("/")[0] == "image"){
                            // Image
                            reader.readAsDataURL(fileList[i]);
                            reader.onloadend = () => {
                                // this.editor.insertEmbed(curIndex, "image", reader.result);
                                this.editor.insertEmbed(curIndex, 'fileBlot', {local_path: curPath, src: reader.result, file_type: "image"})
                                this.editor.setSelection(this.editor.selection.savedRange.index + 1);
                            }
                        }
                        else {
                            // File
                            var showfu = new FileUtil('D:\\workgit\\YiQiLiao-Desktop\\prj\\static\\Img\\Chat\\pdf@3x.png');
                            let showfileObj = showfu.GetUploadfileobj();
                            reader.readAsDataURL(showfileObj);
                            reader.onloadend = () => {
                                // this.editor.insertEmbed(curIndex, "image", reader.result);
                                this.editor.insertEmbed(curIndex, 'fileBlot', {local_path: curPath, src: reader.result, file_type: "file"})
                                this.editor.setSelection(this.editor.selection.savedRange.index + 1);
                            }
                        }
                    }
                }
            }
        },
        onEditorBlur: function(editor) {

        },
        onEditorFocus: function(editor) {

        },
        onEditorChange: function(editor) {

        },
        cleanEditor: function() {
            this.editor.container.getElementsByClassName("ql-editor")[0].innerHTML = "";
        },
        insertPic: function() {
            this.fileInput.click();
        },
        insertFiles: function() {
            this.fileInput.click();
        },
        updateChatList: function() {
            this.$store.state.chatGroup[0].message = this.messageList[-1];
        },
        getUserId: function() {
            if(this.chat.group.groupType === 101)
            {
                return '';
            }
            else
            {
                return this.chat.group.userIds.pop(this.$store.state.userInfo.id)[0];
            }
        },
        MsgIsSending: function(curMsg) {
            if(this.sendingMsgIdList.indexOf(curMsg.msgId) > -1){
                return true;
            }
            else{
                return false;
            }
        },
        MsgIsFailed: function(curMsg) {
            if(this.failedList.indexOf(curMsg.msgId) > -1) {
                return true;
            }
            else {
                return false;
            }
        },
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
                            let filePath = curMsgItem.fileBlot.local_path;
                            let ext = filePath.split(".").pop();
                            let willSendMsgContent = {
                                "ext":ext,
                                "fileName":'',
                                "url":"",
                                "middleImage":"",
                                "thumbnailImage": picUrl,
                                "imgWidth": "",
                                "imgHeight": "",
                                "fileSize": ""
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
                            let filePath = curMsgItem.fileBlot.local_path;
                            let ext = filePath.split(".").pop();
                            let willSendMsgContent = {
                                "ext":ext,
                                "fileName":'',
                                "url":"",
                                "fileSize": ""
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
                for(var i=0;i<varcontent.ops.length;i++){
                    let curMsgItem = varcontent.ops[i].insert;
                    let curTimeSeconds = new Date().getTime();
                    
                    if(curMsgItem.hasOwnProperty("fileBlot")){
                        if(curMsgItem.fileBlot.type == "image"){
                            let sendingMsgContentType = 102;
                            let picUrl = curMsgItem.fileBlot.src;
                            let filePath = curMsgItem.fileBlot.local_path;
                            let ext = filePath.split(".").pop();
                            let willSendMsgContent = {
                                "ext":ext,
                                "fileName":'',
                                "url":"",
                                "middleImage":"",
                                "thumbnailImage": picUrl,
                                "imgWidth": "",
                                "imgHeight": "",
                                "fileSize": ""
                            }
                            var guid = generalGuid();
                            let willSendMsg = {
                                "content": willSendMsgContent,
                                "fromId": this.$store.state.userInfo.id,
                                "groupId": this.chat.group.groupId,
                                "timestamp": curTimeSeconds,
                                "msgContentType": sendingMsgContentType,
                                "msgId": guid,
                                };
                            this.messageList.push(willSendMsg);
                            this.sendingMsgIdList.push(willSendMsg);
                            this.cleanEditor();

                            this.serverapi.uploadFile(this.$store.state.accesstoken, pathDeal(filePath))
                                .then((ret) => {
                                    // ToDo Failed List
                                    console.log("UploadFile response ", ret);
                                    var uploadRetData = ret.data.obj;
                                    willSendMsgContent.ext = uploadRetData.ext;
                                    willSendMsgContent.fileName = uploadRetData.fileName;
                                    willSendMsgContent.url = uploadRetData.url;
                                    willSendMsgContent.middleImage = uploadRetData.middleImage;
                                    willSendMsgContent.thumbnailImage = uploadRetData.thumbnailImage;
                                    willSendMsgContent.imgWidth = uploadRetData.imgWidth;
                                    willSendMsgContent.imgHeight = uploadRetData.imgHeight;
                                    willSendMsgContent.fileSize = uploadRetData.fileSize;

                                    this.serverapi.sendNewMessage(this.$store.state.accesstoken, guid, sendingMsgContentType, this.$store.state.userInfo.id, this.chat.group.groupId, this.getUserId, curTimeSeconds, willSendMsgContent)
                                        .then((ret) => {
                                            console.log("send img message ret ", ret)
                                            var ret_data = ret.data;
                                            var code = ret_data.code;
                                            var obj = ret_data.obj;
                                            if(code != 200) {
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
                                                    if(this.sendingMsgIdList[i].guid == guid){
                                                        this.sendingMsgIdList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                for(var i=0;i<this.failedList.length;i++){
                                                    if(this.failedList[i].guid == guid){
                                                        this.failedList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                for(var i=0;i<this.messageList.length;i++){
                                                    if(this.messageList[i].guid == guid){
                                                        this.messageList[i] = obj.message;
                                                        break;
                                                    }
                                                }
                                                console.log("Send Image msg list is ", this.messageList)
                                                this.$store.commit("updateChatGroup", obj.message);
                                                this.$emit('updateChatList', obj.message);
                                                let div = document.getElementById("message-show");
                                                if(div) {
                                                    div.scrollTop = div.scrollHeight;
                                                }
                                            }
                                        })
                                })
                        }
                        else{
                            let sendingMsgContentType = 103;
                            let picUrl = curMsgItem.fileBlot.src;
                            let filePath = curMsgItem.fileBlot.local_path;
                            let ext = filePath.split(".").pop();
                            let willSendMsgContent = {
                                "ext":ext,
                                "fileName":'',
                                "url":"",
                                "fileSize": ""
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
                            this.messageList.push(willSendMsg);
                            this.sendingMsgIdList.push(guid);
                            this.cleanEditor();

                            this.serverapi.uploadFile(this.$store.state.accesstoken, pathDeal(filePath))
                                .then((ret) => {
                                    // ToDo Failed List
                                    console.log("UploadFile response ", ret);
                                    var uploadRetData = ret.data.obj;
                                    willSendMsgContent.ext = uploadRetData.ext;
                                    willSendMsgContent.fileName = uploadRetData.fileName;
                                    willSendMsgContent.url = uploadRetData.url;
                                    willSendMsgContent.fileSize = uploadRetData.fileSize;

                                    this.serverapi.sendNewMessage(this.$store.state.accesstoken, guid, sendingMsgContentType, this.$store.state.userInfo.id, this.chat.group.groupId, this.getUserId, curTimeSeconds, willSendMsgContent)
                                        .then((ret) => {
                                            console.log("send img message ret ", ret)
                                            var ret_data = ret.data;
                                            var code = ret_data.code;
                                            var obj = ret_data.obj;
                                            if(code != 200) {
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
                                                    if(this.sendingMsgIdList[i].guid == guid){
                                                        this.sendingMsgIdList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                for(var i=0;i<this.failedList.length;i++){
                                                    if(this.failedList[i].guid == guid){
                                                        this.failedList.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                for(var i=0;i<this.messageList.length;i++){
                                                    if(this.messageList[i].guid == guid){
                                                        this.messageList[i] = obj.message;
                                                        break;
                                                    }
                                                }
                                                this.$store.commit("updateChatGroup", obj.message);
                                                this.$emit('updateChatList', obj.message);

                                                let div = document.getElementById("message-show");
                                                if(div) {
                                                    div.scrollTop = div.scrollHeight;
                                                }
                                            }
                                        })
                                })
                        }
                    }
                    else{
                        // Text
                        // quill中插入图片会在末尾加入一个↵，发送出去是空，这里处理掉
                        var curMsgItem_split = curMsgItem.split('\n')
                        if(curMsgItem_split.length == 2 && curMsgItem_split[0].trim().length == 0 && curMsgItem_split[1].trim() == 0){
                            continue
                        }
                        let sendingMsgContentType = 101;
                        let msgContent = curMsgItem;
                        let willSendMsgContent = {"text": msgContent};
                        console.log("will send msg content ", willSendMsgContent)
                        let guid = generalGuid();
                        let willSendMsg = {
                            "content": willSendMsgContent,
                            "fromId": this.$store.state.userInfo.id,
                            "groupId": this.chat.group.groupId,
                            "timestamp": curTimeSeconds,
                            "msgContentType": sendingMsgContentType,
                            "msgId": guid,
                            };
                        this.messageList.push(willSendMsg);
                        this.sendingMsgIdList.push(guid);
                        this.cleanEditor();

                        this.serverapi.sendNewMessage(this.$store.state.accesstoken, guid, sendingMsgContentType, this.$store.state.userInfo.id, this.chat.group.groupId, this.getUserId, curTimeSeconds, willSendMsgContent)
                            .then((ret) => {
                                var ret_data = ret.data;
                                var code = ret_data.code;
                                var obj = ret_data.obj;
                                if(code != 200) {
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
                                        if(this.sendingMsgIdList[i].guid == guid){
                                            this.sendingMsgIdList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    for(var i=0;i<this.failedList.length;i++){
                                        if(this.failedList[i].guid == guid){
                                            this.failedList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    for(var i=0;i<this.messageList.length;i++){
                                        if(this.messageList[i].guid == guid){
                                            this.messageList[i] = obj.message;
                                            break;
                                        }
                                    }
                                    this.$store.commit("updateChatGroup", obj.message);
                                    this.$emit('updateChatList', obj.message);

                                    let div = document.getElementById("message-show");
                                    if(div) {
                                        div.scrollTop = div.scrollHeight;
                                    }
                                }
                            })
                    }
                }
            }
        },
        showNoticeOrNot: function(curMsg) {
            if(curMsg === null) {
                return false;
            }
            let chatGroupMsgType = curMsg.msgContentType;
            let chatGroupMsgContent = curMsg.content;
            if(chatGroupMsgType === 104)
            {
                return true;
            }
            else {
                return false;
            }
        },
        showMessageOrNot: function(curMsg) {
            if(curMsg === null) {
                return false;
            }
            let chatGroupMsgType = curMsg.msgContentType;
            let chatGroupMsgContent = curMsg.content;
            if(chatGroupMsgType === 104)
            {
                return false;
            }
            else {
                return true;
            }
        },
        NoticeContent: function(curMsg) {
            if(curMsg === null) {
                return '';
            }
            let chatGroupMsgType = curMsg.msgContentType;
            let chatGroupMsgContent = curMsg.content;
            if(chatGroupMsgType === 104)
            {
                if(chatGroupMsgContent.type === "invitation")
                {
                    console.log(chatGroupMsgContent)
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
        showTimeOrNot(curMsg, lastMsg) {
            if(lastMsg === undefined) {
                return true;
            }
            let chatGroupMsgType = curMsg.msgContentType;
            if(chatGroupMsgType == 104){
                return true;
            }
            let cutTime = curMsg.timestamp - lastMsg.timestamp;

            if(cutTime > 1000 * 1 * 60) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgTime(curMsg) {
            if(curMsg === null) {
                return "";
            }
            var secondsTime = curMsg.timestamp;
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let cutTime = curDateSecond - secondsTime;
            let curYeat = curDate.getFullYear();
            let curMonth = curDate.getMonth();
            let curDay = curDate.getDay();

            let distdate = new Date(secondsTime);
            let y = distdate.getFullYear();
            let mon = distdate.getMonth();
            let d = distdate.getDay();
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
        ChatLeftOrRightClassName: function (curMsg) {
            if(curMsg.fromId === this.$store.state.userInfo.id) {
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
                var value1 = a.sequenceId;
                var value2 = b.sequenceId;
                return value1 - value2;
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
            },
            showFace: false,
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
            })
        }, 0)
    },
    created: function() {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
        this.serverapi.m_accesstoken = this.$store.state.accesstoken;
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
            if(this.curGroupId != this.chat.group.groupId) {
                var messageListTmp = this.$store.getters.getChatMsgHistory(this.chat.group.groupId);
                this.messageList = [];
                console.log("the chat message is ", this.chat.message)
                for(var i=0;i<messageListTmp.length;i++){
                    this.messageList.unshift(messageListTmp[i]);
                }
                if(messageListTmp.length !=0){
                    if(messageListTmp[0].sequenceId != this.chat.message.sequenceId){
                        this.messageList.push(this.chat.message);
                        console.log("Push Last Msg")
                    }
                }
                else{
                    this.messageList.push(this.chat.message);
                }
                console.log("Get From store msg list is ", this.messageList);
                this.$nextTick(() => {
                    let div = document.getElementById("message-show");
                    if(div) {
                        div.scrollTop = div.scrollHeight;
                    }
                })
                this.curGroupId = this.chat.group.groupId;
                var curSequenceId = this.chat.message.sequenceId;
                this.serverapi.historyMessage(this.$store.state.accesstoken, this.chat.group.groupId, curSequenceId)
                    .then((responer) => {
                        var theList = responer.data.results;
                        // 后端返回的历史消息 list[0] 为最新
                        // 实际显示需要 list[-1] 为最新，显示前将list倒序，放入绑定的list中
                        console.log("HistoryMessage is ", theList)
                        for(var i=0;i<theList.length;i++) {
                            theList[i]["SendSuccess"] = true;
                        }

                        if(theList.length !=0){
                            if(theList[0].sequenceId != this.chat.message.sequenceId){
                                theList.unshift(this.chat.message);
                                console.log("unshift Last Msg")
                            }
                        }
                        else{
                            theList.unshift(this.chat.message);
                        }

                        this.$store.commit("setMessageLists", theList, false);

                        var messageListTmp = this.$store.getters.getChatMsgHistory(this.chat.group.groupId);
                        this.messageList = [];
                        for(var i=0;i<messageListTmp.length;i++){
                            this.messageList.unshift(messageListTmp[i]);
                        }
                    })
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

    .chat-label {
        margin:10px 30px 20px 30px;
        float: left;
        white-space: nowrap;
        text-overflow: ellipsis;
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
        height: calc(100% - 160px);
        border-bottom: 1px solid rgb(242, 242, 246);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .msg-list {
        list-style: none;
        padding: 0;
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
        margin: 5px 50px 5px 50px;
    }

    .chat-notice {
        width: 100%;
        text-align: center;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        color: rgb(153, 153, 153);
        margin: 10px 50px 10px 50px;
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
        margin: 0px;
        padding: 0px;
    }

    .text-input {
        border: 0px;
        width: 100%;
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