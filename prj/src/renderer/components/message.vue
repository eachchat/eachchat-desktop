<template>
    <div class="message">
        <div class="chat-msg-body">
            <div class="msg-info-mine" v-if="MsgIsMine()">
                <div class="msgState" v-if="MsgIsSending()">
                    <i class="el-icon-loading"></i>
                </div>
                <div class="msgState" v-else-if="MsgIsFailed()">
                    <i class="el-icon-warning"></i>
                </div>
                <div class="msgState" v-else>
                </div>
                <div class="about-msg">
                    <div class="each-msg-info-time" v-show=false>{{MsgTime()}}</div>
                    <div class="msg-info-username-mine" v-show=false>{{MsgBelongUserName()}}</div>
                    <div class="chat-msg-content-mine-file"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <quillEditor
                            disabled="disabled"
                            v-model="messageContent"
                            ref="msgQuillEditorMine"
                            :options="editorOption">
                        </quillEditor>
                    </div>
                    <div class="chat-msg-content-mine-txt" v-else>
                        <quillEditor
                            disabled="disabled"
                            v-model="messageContent"
                            ref="msgQuillEditorMine"
                            :options="editorOption">
                        </quillEditor>
                    </div>
                </div>
                <img class="msg-info-img" :src="MsgBelongUserImg()" alt="头像">
            </div>
            <div class="msg-info-others" v-else>
                <img class="msg-info-img" :src="MsgBelongUserImg()" alt="头像">
                <div class="about-msg">
                    <div class="msg-info-username-others" v-show=false>{{MsgBelongUserName()}}</div>
                    <div class="each-msg-info-time" v-show=false>{{MsgTime()}}</div>
                    <div class="chat-msg-content-others-file"
                        v-on:click="ShowFile()" v-if="MsgIsImage()">
                        <quillEditor
                            disabled="disabled"
                            v-model="messageContent"
                            ref="msgQuillEditorOthers"
                            :options="editorOption">
                        </quillEditor>
                    </div>
                    <div class="chat-msg-content-others-txt" v-else>
                        <quillEditor
                            disabled="disabled"
                            v-model="messageContent"
                            ref="msgQuillEditorOthers"
                            :options="editorOption">
                        </quillEditor>
                    </div>
                </div>
                <div class="msgState" v-if="MsgIsSending()">
                    <i class="el-icon-loading"></i>
                </div>
                <div class="msgState" v-else-if="MsgIsFailed()">
                    <i class="el-icon-warning"></i>
                </div>
                <div class="msgState" v-else>
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
import * as path from 'path'
import * as fs from 'fs-extra'
import {shell} from 'electron'

import {APITransaction} from '../../packages/data/transaction.js'
import {generalGuid, Appendzero, FileUtil, confservice, getIconPath} from '../server/Utils.js'

export default {
    components: {
        quillEditor
    },
    props: ['msg'],
    methods: {
        ShowFile: function() {
            console.log("open image proxy ", this.msg)
            let chatGroupMsgType = this.msg.msgContentType;
            let chatGroupMsgContent = this.msg.content;
            if(chatGroupMsgType === 102)
            {
                shell.openExternal("C:\\Users\\wangx\\Pictures\\1-1Z919202U1519.jpg");
            }
            else if(chatGroupMsgType === 103)
            {
                shell.openExternal("C:\\Users\\wangx\\Downloads\\服务端API文档.docx");
            }
        },
        MsgIsFailed: function() {
        },
        MsgIsSending: function() {
        },
        saveFile: function(data) {
            confservice.getFilePath()
        },
        saveThumbImage: function(file_name, data) {
            var dist_path = path.join(confservice.getThumbImagePath(this.$store.state.userInfo.id), file_name);
            this.msg["thumb_local_path"] = dist_path;
            try{
                fs.writeFileSync(dist_path, data);
                this.$store.commit("updateImgMessageThumbLocalPath", this.msg);
            }
            catch(err){
                console.log("Save Thumb Failed And Err is ",err);
            }
        },
        saveMImage: function(data) {
            confservice.getMImagePath()
        },
        saveImage: function(data) {
            confservice.getImagePath()
        },
        getFileIconThroughExt: function(ext) {
            var iconPath = getIconPath(ext);
            return iconPath;
        },
        MsgIsImage: function() {
            let chatGroupMsgType = this.msg.msgContentType;
            if(chatGroupMsgType == 102){
                return true;
            }
            else{
                return false;
            }
        },
        MsgContent: function(is_mine=false) {
            if(this.msg === null) {
                return '';
            }
            let chatGroupMsgType = this.msg.msgContentType;
            let chatGroupMsgContent = this.msg.content;
            if(chatGroupMsgType === 101)
            {
                this.messageContent = '<p>' + chatGroupMsgContent.text + '</p>'
            }
            else if(chatGroupMsgType === 102)
            {
                // var sldn = this.$store.getters.getImgMessageThumbLocalPath(this.msg);
                if(this.msg.thumb_local_path == undefined){
                    this.serverapi.downloadTumbnail(this.$store.state.accesstoken, "T", this.msg.timelineId)
                        .then((ret) => {
                            let reader = new FileReader();
                            reader.readAsDataURL(ret.data);
                            reader.onloadend = () => {
                                let imageHeight = 100;
                                if(chatGroupMsgContent.imgHeight < 100){
                                    imageHeight = chatGroupMsgContent.imgHeight;
                                }
                                this.messageContent = '<p><img src=' + reader.result + ' height=' + imageHeight + '></img></P>'
                                // this.saveThumbImage(chatGroupMsgContent.fileName, reader.result);
                            }
                        })
                }
                else{
                    var thumb_local_path = this.msg.thumb_local_path;
                    var showfu = new FileUtil(thumb_local_path);
                    let showfileObj = showfu.GetUploadfileobj();
                    let reader = new FileReader();
                    reader.readAsDataURL(showfileObj);
                    reader.onloadend = () => {
                        let imageHeight = 100;
                        if(chatGroupMsgContent.imgHeight < 100){
                            imageHeight = chatGroupMsgContent.imgHeight;
                        }
                        this.messageContent = '<p><img src=' + reader.result + ' align=left height=' + imageHeight + '></img><span>' + this.msg.content.fileName + '</span></p>'
                    }
                }
            }
            else if(chatGroupMsgType === 103)
            {
                var iconPath = this.getFileIconThroughExt(this.msg.content.ext);
                var showfu = new FileUtil(iconPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    this.messageContent = '<p><img src=' + reader.result + ' height=70></img><span>' + this.msg.content.fileName + '</span></p>'
                }
            }
            else if(chatGroupMsgType === 104)
            {
                if(chatGroupMsgContent.type === "invitation")
                {
                    var invitee = chatGroupMsgContent.userInfos.userName;
                    var inviter = chatGroupMsgContent.userName;
                    return inviter + " 邀请 " + invitee + " 加入群聊";
                }
                else if(chatGroupMsgContent.type === "notice")
                {
                    var owner = chatGroupMsgContent.userName;
                    return owner + " 发布群公告";
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
                    return "您收到一条短消息";
                }
            }
            else if(chatGroupMsgType === 105)
            {
                return "[语音]";
            }
            else if(chatGroupMsgType === 106)
            {
                return "[聊天记录]";
            }
        },
        MsgTime: function() {
            if(this.msg === null){
                return "";
            }
            let curDate = new Date();
            let curDateSecond = curDate.getTime();
            let cutTime = curDateSecond - this.msg.timestamp;
            let curYeat = curDate.getFullYear();
            let curMonth = curDate.getMonth();
            let curDay = curDate.getDay();

            let distdate = new Date(this.msg.timestamp);
            let y = distdate.getFullYear();
            let mon = distdate.getUTCMonth() + 1;
            let d = distdate.getDate();
            let h = distdate.getHours();
            let m = distdate.getMinutes();
            let s = distdate.getSeconds();

            if(cutTime > 0 && cutTime < 24 * 3600 * 1000)
            {
                return h + ":" + m;
            }
            else if(cutTime >= 24 * 3600 * 1000 && cutTime < 48 * 3600 * 1000)
            {
                return "昨天";
            }
            else
            {
                return y + "-" + Appendzero(mon) + "-" + Appendzero(d);
            }
        },
        MsgBelongUserName: function() {
            var UserName = '';
            if(this.msg === null) {
                return '';
            }
            else {
                var res = this.$store.getters.getChatUserName(this.msg.fromId);
                return res;
            }
        },
        MsgIsMine:function() {
            if(this.msg.fromId === this.$store.state.userInfo.id) {
                return true;
            }
            else {
                return false;
            }
        },
        MsgBelongUserImg: function () {
            if(this.msg === null) {
                return '/static/Img/User/user.jpeg';
            }
            else {
                var res = this.$store.getters.getChatUserIcon(this.msg.fromId, false);
                return res;
            }
        },
        compare: function(){
            return function(a, b)
            {
                var value1 = a.sequenceId;
                var value2 = b.sequenceId;
                return value2 - value1;
            }
        }
    },
    data() {
        return {
            messageContent: '<p></p>',
            fileIcon: '',
            editorOption : {
                placeholder: "",
                theme:'bubble',
            },
            mineRefresh: true,
            otherRefresh: true,
        }
    },
    mounted: function() {
        // When Mounting Can Not Get The Element. Here Need SetTimeout
        setTimeout(() => {
            this.$nextTick(() => {
                if(this.MsgIsMine()) {
                    if(this.msgContentMine == null) {
                        this.msgContentMine = this.$refs.msgQuillEditorMine.quill;
                    }
                }
                else {
                    if(this.msgContentOthers == null) {
                        this.msgContentOthers = this.$refs.msgQuillEditorOthers.quill;
                    }
                }
            })
        }, 0)

    },
    created: function() {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
        this.serverapi.m_accesstoken = this.$store.state.accesstoken;
    },
    watch: {
        msg: function() {
            if(this.MsgIsMine()) {
                this.mineRefresh = false;
                this.otherRefresh = true;
            }
            else{
                this.otherRefresh = false;
                this.mineRefresh = true;
            }
            this.$nextTick(() => {
                if(this.MsgIsMine()) {
                    this.mineRefresh = true;
                }
                else{
                    this.otherRefresh = true;
                }
                setTimeout(() => {
                    this.$nextTick(() => {
                        if(this.MsgIsMine()) {
                            if(this.msgContentMine == null) {
                                this.msgContentMine = this.$refs.msgQuillEditorMine.quill;
                            }
                            this.MsgContent(true);
                        }
                        else {
                            if(this.msgContentOthers == null) {
                                this.msgContentOthers = this.$refs.msgQuillEditorOthers.quill;
                            }
                            this.MsgContent(false);
                        }
                    })
                }, 0)
            })
        }
    }
}
</script>

<style lang="scss">
    .message {
        font-size: 15px;
    }

    .chat-msg-body {
        font-size: 15px;
        max-width: 100%;
        margin-right: 0;
    }

    .msg-info-mine {
        width: 60%;
        float: right;
        display: block;
    }

    .msg-info-others {
        width: 60%;
        float: left;
        display: block;
        margin-left: 8px;
    }

    .msg-info-img {
        display: inline-block;
        vertical-align: top;
        width: 40px;
        height: 40px;
    }

    .about-msg {
        display: inline-block;
        margin: 0px 10px 5px 10px;
        width: calc(100% - 95px);
    }

    .msgState {
        display: inline-block;
        width: 20px;
        height: 20px;
    }

    .each-msg-info-time {
        height: 15px;
        font-size: 10px;
    }

    .msg-info-username-mine {
        display: block;
        font-size: 10px;
        color: rgb(153, 153, 153);
        text-align: right;
        
    }

    .msg-info-username-others {
        display: block;
        font-size: 10px;
        color: rgb(153, 153, 153);
    }
    
    .chat-msg-content-others-txt {
        float: left;
        background-color: rgb(245,246,247);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0 12px 12px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-others-txt:hover {
        float: left;
        background-color: rgb(233,234,235);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0 12px 12px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-others-file {
        float: left;
        background-color: white;
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }

    .chat-msg-content-mine-txt {
        float:right;
        background-color: rgb(220,244,233);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0 12px 12px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-mine-txt:hover{
        float:right;
        background-color: rgb(209,232,221);
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        padding: 0 12px 12px 12px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .chat-msg-content-mine-file {
        float:right;
        background-color: white;
        max-width: 260px;
        min-width: 20px;
        border-radius: 5px;
        font-size: 14px;
        font-family: 'Microsoft YaHei';
        text-align: left;
        margin: 0px;
        cursor: pointer;
    }
    
    .imageTip {
        text-align: center;
    }
</style>