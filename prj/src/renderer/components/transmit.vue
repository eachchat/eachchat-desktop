<template>
    <div class="transmit-dlg" id="transmitDlgId">
        <div class="transmit-content">
            <div class="list-content">
                <ul class="group-list">
                    <li class="group">
                        <img class="create-group-ico" src="../../../static/Img/Chat/add-20px.png"/>
                        <p class="create-group-name">创建新的聊天</p>
                    </li>
                    <li class="group"
                        v-for="(chatGroupItem, index) in groupList"
                        >
                        <!-- <listItem @groupInfo="chatGroupItem"/> -->
                        <img class="group-ico" :id="getChatElementId(chatGroupItem)" src="../../../static/Img/User/user-40px@2x.png"/>
                        <p class="group-name">{{getShowGroupName(chatGroupItem)}}</p>
                        <input type="checkBox" class="user-checkBox" @change="selectChanged(chatGroupItem)" :checked="isChecked(chatGroupItem)">
                    </li>
                </ul>
            </div>
            <div class="selected-list-content">
                <ul class="selected-group-list">
                    <li class="selected-group">
                        <p class="select-result-label">分别转发给：</p>
                        <p class="select-result">{{selectedChat.length == 0 ? "未选择聊天" : "已选择 " + selectedChat.length + " 个聊天"}}</p>
                    </li>
                    <li class="selected-group"
                        v-for="(chatGroupItem, index) in selectedChat">
                    <img class="group-ico" :id="getSelectedChatElementId(chatGroupItem)" src="../../../static/Img/User/user-40px@2x.png"/>
                    <p class="group-name">{{getShowGroupName(chatGroupItem)}}</p>
                    <img class="disSelected" @click="disSelected(chatGroupItem)" src="../../../static/Img/Navigate/close-20px.png">
                    </li>
                </ul>
            </div>
        </div>
        <div class="transmitConfirm">
            <Button class="transmit-cancle-button" @click="Cancle()">取消</Button>
            <Button class="transmit-confirm-button" @click="Transmit()">发送</Button>
        </div>
    </div>
</template>

<script>
import { services } from '../../packages/data/index.js';
import * as path from 'path'
import * as fs from 'fs-extra'
import {ipcRenderer} from 'electron'
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil } from '../../packages/core/Utils.js'
export default {
    name: 'transmit-group',
    data () {
        return {
            selectedChat: [],
            groupList: [],
            transDlgElement: null,
            ImgLayersElement: null,
        }
    },
    props: ["showTransmit", "distMsgs", 'curChat', 'transmitTogether'],
    watch: {
        showTransmit: function() {
            this.groupList = this.$store.getters.getGroupList();
            console.log("this.grouplist is ", this.groupList)

            if(this.ImgLayersElement == null) {
                this.ImgLayersElement = document.getElementById("chat-panel-id");
            }
            
            if(this.transDlgElement == null) {
                this.transDlgElement = document.getElementById("transmitDlgId");
            }
            console.log("skdjlfjskdlfkj ", this.ImgLayersElement.offsetWidth);
            
            var showScreenHeight = this.ImgLayersElement.offsetHeight;
            var showScreenWidth = this.ImgLayersElement.offsetWidth + 64;
            console.log("showScreenWidth ", showScreenWidth);
            var left = 100;
            var top = 100;
            if(showScreenWidth > 600) {
                left = (showScreenWidth - 600) / 2;
            }
            else {
                left = showScreenWidth / 2;
            }
            if(showScreenHeight > 500) {
                top = (showScreenHeight - 500) / 2;
            }
            else {
                top = showScreenHeight / 2;
            }

            this.transDlgElement.style.left = "-100" + "px";
            this.transDlgElement.style.top = top.toString() + "px";
            this.$nextTick(() => {
                this.showGroupIcon();
            })
        },
        selectedChat:function() {
            this.$emit('getChatSelected', this.selectedChat);
        },
        distMsgs: function() {
            console.log("dist msg is ", this.distMsgs);
        },
        curChat: function() {
            console.log("curchat is ", this.curChat);
        },
        transmitTogether: function() {
            console.log("transmitTogether is ", this.transmitTogether);
        }
    },
    computed: {
    },
    methods: {
        Transmit:async function() {
            console.log("---------")
            await this.sendMsg(this.selectedChat, this.distMsgs);
            for(var i=0;i<this.groupList.length;i++) {
                this.groupList[i].checkState = false;
            }
            this.selectedChat = [];
            this.$emit("closeTransmitDlg");
        },
        Cancle: function() {
            for(var i=0;i<this.groupList.length;i++) {
                this.groupList[i].checkState = false;
            }
            this.selectedChat = [];
            this.$emit("closeTransmitDlg");
        },
        isChecked: function(curChat) {
            if(curChat == null) {
                return false;
            }
            return curChat.checkState;
        },
        updateGroupImg(e, arg) {
            var state = arg[0];
            var stateInfo = arg[1];
            var id = arg[2];
            var localPath = arg[3];

            for(var i=0;i<this.groupList.length;i++) {
                if(this.groupList[i].group_id == id) {
                    let elementId = this.getChatElementId(this.groupList[i]);
                    let elementImg = document.getElementById(elementId);
                    console.log("element img is ", elementImg)
                    if(elementImg == undefined) {
                        return;
                    }
                    elementImg.setAttribute("src", localPath);
                    break;
                }
            }
        },
        showGroupIcon: async function(e, arg) {
            for(var i=0;i<this.groupList.length;i++) {
                let elementId = this.getChatElementId(this.groupList[i]);
                // console.log("elememt id is ", elementId)
                let elementImg = document.getElementById(elementId);
                console.log("element img is ", elementImg)
                if(elementImg == undefined) {
                    return;
                }
                // console.log("elementImg is ", elementImg)
                // console.log("groupavatar is ", this.showGroupList[i].group_avarar);
                var targetPath = "";
                if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.groupList[i].group_avarar, this.groupList[i].group_id))){
                    var showfu = new FileUtil(targetPath);
                    let showfileObj = showfu.GetUploadfileobj();
                    let reader = new FileReader();
                    reader.readAsDataURL(showfileObj);
                    reader.onloadend = () => {
                        elementImg.setAttribute("src", reader.result);
                    }
                }
            }
        },
        showSelectedGroupIcon: async function(e, arg) {
            for(var i=0;i<this.selectedChat.length;i++) {
                let elementId = this.getSelectedChatElementId(this.selectedChat[i]);
                console.log("elememt id is ", elementId)
                let elementImg = document.getElementById(elementId);
                console.log("elementImg is ", elementImg)
                // console.log("groupavatar is ", this.showGroupList[i].group_avarar);
                var targetPath = "";
                if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.selectedChat[i].group_avarar, this.selectedChat[i].group_id))){
                    var showfu = new FileUtil(targetPath);
                    let showfileObj = showfu.GetUploadfileobj();
                    let reader = new FileReader();
                    reader.readAsDataURL(showfileObj);
                    reader.onloadend = () => {
                        elementImg.setAttribute("src", reader.result);
                    }
                }
            }
        },
        selectChanged: function(curChat) {
            if(curChat == null){
                return false;
            }
            console.log("chr chat is ", curChat);
            curChat.checkState = !curChat.checkState;
            if(curChat.checkState) {
                this.selectedChat.push(curChat);
            }
            else {
                this.disSelected(curChat);
            }
            console.log("selectedChat is ", this.selectedChat);
            this.$nextTick(() => {
                this.showSelectedGroupIcon();
            })
            return curChat.checkState;
        },
        getChatElementId: function(curChat) {
            return "transmit-" + curChat.group_id;
        },
        getSelectedChatElementId: function(curChat) {
            return "transmit-" + curChat.group_id + "-selected";
        },
        selectChat: function(item) {
            for(var i=0;i<this.groupList.length;i++) {
                if(this.groupList[i].group_id == item.group_id) {
                    console.log("update-------")
                    this.groupList[i].checkState = true;
                    this.selectedChat.push(this.groupList[i]);
                    break;
                }
            }
            this.$nextTick(() => {
                this.showSelectedGroupIcon();
            })
        },
        disSelected: function(item) {
            console.log("disselected is ", item);
            var groupListTmp = this.groupList;
            for(let i=0;i<groupListTmp.length;i++) {
                if(groupListTmp[i].group_id == item.group_id) {
                    groupListTmp[i].checkState = false;
                    console.log("state is ", groupListTmp[i].checkState);
                    break;
                }
                this.groupList.push(groupListTmp[i]);
            }
            for(let i=0;i<this.selectedChat.length;i++) {
                if(this.selectedChat[i].group_id == item.group_id) {
                    this.selectedChat.splice(i, 1);
                    break;
                }
            }
        },
        getShowGroupName: function(chatGroupItem) {
            async function getUserNameFromDb(distUid) {
                var nameTemp = '';
                var userInfos = await services.common.GetDistUserinfo(distUid);
                console.log("var userinfo si ", userInfos)
                if(userInfos.length == 0) {
                    return nameTemp;
                }
                var distUserInfo = userInfos[0];
                if(distUserInfo != undefined){
                    nameTemp = distUserInfo.user_display_name;
                }
                console.log("nameTemp si ", nameTemp)
                return nameTemp;
            }
            if(chatGroupItem === null){
                return "";
            }
            var groupName = chatGroupItem.group_name;
            if(groupName.length == 0) {
                var aboutUids = chatGroupItem.contain_user_ids.split(",");
                var groupUidNameList = [];
                for(var i=0;i<aboutUids.length;i++) {
                    var nameTemp = '';
                    nameTemp = getUserNameFromDb(aboutUids[i]);
                    console.log("transmit get show gorup name si ", nameTemp)
                    if(nameTemp.length != 0){
                    // let nameTmp = this.$store.getters.getChatUserName(aboutUids[i]);
                        groupUidNameList.unshift(nameTemp);
                    }
                    if(i > 3) {
                        break;
                    }
                }
                groupName = groupUidNameList.join(",");
            }
            return groupName
        },
        getMsgContent: async function(msg) {
            if(this.msg === null) {
                return '';
            }
            var messageContent = '';
            let chatGroupMsgType = msg.message_type;
            var chatGroupMsgContent = strMsgContentToJson(msg.message_content);

            var nameTemp = '';
            var userInfos = await services.common.GetDistUserinfo(msg.message_from_id);
            var distUserInfo = userInfos[0];
            if(distUserInfo != undefined){
                nameTemp = distUserInfo.user_display_name;
            }

            console.log("chatGroupMsgContent is ", nameTemp)
            // console.log("this. msg is ", this.msg)
            // 数据库缺省type = 0 
            if(chatGroupMsgType === 101 || chatGroupMsgType ==0)
            {
                messageContent = nameTemp + ":" + chatGroupMsgContent.text;
                console.log("aboutUserName ",nameTemp);
                console.log("getMsgContent ",messageContent);
                return messageContent;
            }
            else if(chatGroupMsgType === 102)
            {
                messageContent = nameTemp + ":" + "[图片]:" + chatGroupMsgContent.fileName;
                return messageContent;
            }
            else if(chatGroupMsgType === 103)
            {
                messageContent = nameTemp + ":" + "[文件}:" + chatGroupMsgContent.fileName;   
                return messageContent;
            }
            else if(chatGroupMsgType === 106)
            {
                return messageContent = chatGroupMsgContent.title + ":" + "的聊天记录";
            }
            else {
                return messageContent = "不支持的消息类型，请升级客户端。"
            }
        },
        getTogetherMsgContent: async function(msgs) {
            var contentTitle = "";
            var contentText = "";
            var groupId = this.curChat.group_id;
            var msgIds = [];
            var fromId = this.curUserInfo.id;
            console.log("this.curchat is ", this.curChat.group_type);
            if(this.curChat.group_type == 102) {

                var nameTemp = '';
                var userInfos = await services.common.GetDistUserinfo(this.curChat.uid);
                var distUserInfo = userInfos[0];
                if(distUserInfo != undefined){
                    nameTemp = distUserInfo.user_display_name;
                }

                contentTitle = this.curUserInfo.name + "与" + nameTemp + "的聊天记录";
            }
            else {
                contentTitle = this.curChat.group_name;
            }
            for(let i=0;i<msgs.length;i++) {
                if(i < 4) {
                    if(i == 3) {
                        contentText = contentText + await this.getMsgContent(msgs[i]);
                    }
                    else {
                        contentText = contentText + await this.getMsgContent(msgs[i]) + "\n";
                    }
                }
                msgIds.push(msgs[i].time_line_id);
            }
            console.log("contentText is ", contentText);

            var togetherMsgContent = {
                "title": contentTitle,
                "text": contentText,
                "groupId": groupId,
                "msgIds": msgIds,
                "fromId": fromId,
            };

            return togetherMsgContent;
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
        sendTogetherMsg: async function(distGroups, msgs) {
            var msgContent = await this.getTogetherMsgContent(msgs);
            console.log("varcontent is ", msgContent);
            for(var i=0;i<distGroups.length;i++){
                var uid = this.getDistUidThroughUids(distGroups[i].contain_user_ids);
                var groupId = distGroups[i].group_id == null ? '' : distGroups[i].group_id;
                let curTimeSeconds = new Date().getTime();
                
                let sendingMsgContentType = 106;
                let willSendMsgContent = msgContent;
                let guid = generalGuid();

                services.common.sendNewMessage(
                        guid, 
                        sendingMsgContentType, 
                        this.curUserInfo.id, 
                        groupId, 
                        uid, 
                        curTimeSeconds, 
                        willSendMsgContent)
                    .then((ret) => {
                        console.log("sendNewMessage ret is ", strMsgContentToJson(ret.message_content));
                    })
            }
        },
        sendSingleMsg: function(distGroups, msgs) {
            for(var i=0;i<distGroups.length;i++){
                for(var j=0;j<msgs.length;j++) {
                    var curMsg = msgs[j];
                    var curMsgContent = strMsgContentToJson(curMsg.message_content);
                    console.log("curMsgCintent is ", curMsgContent);

                    var uid = this.getDistUidThroughUids(distGroups[i].contain_user_ids);
                    var groupId = distGroups[i].group_id == null ? '' : distGroups[i].group_id;
                    let curTimeSeconds = new Date().getTime();
                    
                    let sendingMsgContentType = curMsg.message_type;
                    let willSendMsgContent = curMsgContent;
                    let guid = generalGuid();

                    services.common.sendNewMessage(
                            guid, 
                            sendingMsgContentType, 
                            this.curUserInfo.id, 
                            groupId, 
                            uid, 
                            curTimeSeconds, 
                            willSendMsgContent)
                        .then((ret) => {
                            console.log("sendNewMessage ret is ", strMsgContentToJson(ret.message_content));
                        })
                }
            }
        },
        sendMsg: async function(distGroups, msgs) {
            if(this.transmitTogether) {
                await this.sendTogetherMsg(distGroups, msgs);
            }
            else {
                await this.sendSingleMsg(distGroups, msgs);
            }
        },
    },
    mounted: async function() {
        setTimeout(() => {
            this.$nextTick(() => {
                ipcRenderer.on('updateGroupImg', this.updateGroupImg);
            })
        }, 0)
    },
    created: async function() {
        this.loginInfo = await services.common.GetLoginModel();
        this.curUserInfo = await services.common.GetSelfUserModel();

    },
    components: {
    }
}
</script>
<style lang="scss" scoped>
  ::-webkit-scrollbar-track-piece {
    background-color: #F1F1F1;
    border-radius: 5px;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 12px;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: #C1C1C1;
    border-radius: 5px;
    outline: none;
  }

  ::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #A8A8A8;
    border-radius: 5px;
  }

  .transmit-dlg {
    position: absolute;
    height: 500px;
    width: 600px;
    background: rgba(255, 255, 255, 1);
    box-shadow:0px 0px 3px 3px rgb(216, 228, 241);
    overflow: hidden;
    font-size: 0px;
  }

  .transmit-content{
    margin-top: 20px;
    margin-left: 0px;
    margin-bottom: 20px;
    margin-right: 0px;
    position: absolute;
    height: 435px;
    width: 600px;
    background: rgba(255, 255, 255, 1);
    overflow: hidden;
  }

  .list-content {
    display: inline-block;
    margin-top: 0px;
    margin-left: 0px;
    margin-bottom: 0px;
    margin-right: 0px;
    height: 100%;
    width: 300px;
    overflow-y: scroll;
    overflow-x: hidden;
    
    ::-webkit-scrollbar-track {
      border-radius: 10px;
    }
  }

  .selected-list-content {
    display: inline-block;
    margin-top: 0px;
    margin-left: 0px;
    margin-bottom: 0px;
    margin-right: 0px;
    width: 300px;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    
    ::-webkit-scrollbar-track {
      border-radius: 10px;
    }
  }

  .group-list {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0;
    border-right: 1px solid rgb(242, 242, 246);
  }

  .selected-group-list {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0;
    border-right: 1px solid rgb(242, 242, 246);
  }

  .group {
    position: relative;
    height: 50px;
    white-space: nowrap;
  }

  .group:hover {
    position: relative;
    height: 50px;
    background-color: rgba(221, 221, 221, 1);
  }

  .group.active {
    position: relative;
    height: 50px;
    background-color: rgba(221, 221, 221, 1);
  }

  .selected-group {
    position: relative;
    height: 50px;
    white-space: nowrap;
  }

  .selected-group:hover {
    position: relative;
    height: 50px;
    background-color: rgba(221, 221, 221, 1);
  }

  .selected-group.active {
    position: relative;
    height: 50px;
    background-color: rgba(221, 221, 221, 1);
  }

  .group-ico {
    position: absolute;
    top: 0px;
    left: 0px;
    display: inline-block;
    width: 30px;
    height: 30px;
    margin-left: 20px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
  }

  .create-group-ico {
    position: absolute;
    top: 0px;
    left: 0px;
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-left: 20px;
    margin-top: 15px;
    margin-right: 0px;
    margin-bottom: 15px;
  }

  .group-name {
    position: absolute;
    top: 0px;
    left: 60px;
    display: inline-block;
    width: 139px;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    font-weight: medium;
    font-family:PingFangSC-Regular;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  
  .create-group-name {
    position: absolute;
    top: 0px;
    left: 45px;
    display: inline-block;
    width: 139px;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    font-weight: medium;
    font-family:PingFangSC-Regular;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

 .select-result-label {
    position: absolute;
    top: 0px;
    left: 10px;
    display: inline-block;
    width: 90px;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    font-weight: medium;
    font-family:PingFangSC-Regular;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
 }

 
 .select-result {
    position: absolute;
    top: 0px;
    left: 100px;
    display: inline-block;
    width: 90px;
    height: 50px;
    line-height: 50px;
    font-size: 12px;
    font-weight: medium;
    font-family:PingFangSC-Regular;
    color: rgba(0, 0, 0, 1);
    overflow: hidden;
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
 }

  .user-checkBox {
    position: absolute;
    top: 0px;
    right: 0px;
    display: inline-block;
    width: 20px;
    height: 100%;
    float: right;
  }

  .disSelected {
    position: absolute;
    top: 0px;
    right: 0px;
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-top: 15px;
    margin-bottom: 15px;
    margin-right: 0px;
    margin-left: 0px;
    float: right;
  }

  .transmitConfirm {
    position: absolute;
    top: 455px;
    left: 0px;
      width: 100%;
      height: 50px;
  }

    .transmit-confirm-button {
        margin: 0;
        padding: 0;
        width:70px;
        height: 30px;
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 10px;
        margin-right: 10px;
        float: right;
    }

    .transmit-cancle-button {
        margin: 0;
        padding: 0;
        width:70px;
        height: 30px;
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 10px;
        margin-right: 30px;
        float: right;
    }
</style>