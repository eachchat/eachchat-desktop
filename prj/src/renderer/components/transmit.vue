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
                        <img class="group-ico" :id="getChatElementId(chatGroupItem)" src="../../../static/Img/User/user.jpeg"/>
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
                    <img class="group-ico" :id="getChatElementId(chatGroupItem)" src="../../../static/Img/User/user.jpeg"/>
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
import { strMsgContentToJson, sliceReturnsOfString, generalGuid } from '../../packages/core/Utils.js'
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
        },
        selectedChat:function() {
            this.$emit('getChatSelected', this.selectedChat);
        },
        distMsgs: function() {
            console.log("dist msg is ", this.distMsgs);
            console.log("dist msg content is ", strMsgContentToJson(this.distMsgs[0].message_content));
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
            return curChat.checkState;
        },
        getChatElementId: function(curChat) {
            return "transmit-" + curChat.group_id;
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
        getShowGroupName(chatGroupItem) {
            if(chatGroupItem === null){
                return "";
            }
            var groupName = chatGroupItem.group_name;
            if(groupName.length == 0) {
                var aboutUids = chatGroupItem.contain_user_ids.split(",");
                var groupUidNameList = [];
                for(var i=0;i<aboutUids.length;i++) {
                var userName = this.getUserNameFromDb(aboutUids[i]);
                userName.then((ret) => {
                    if(ret.length != 0){
                    // let nameTmp = this.$store.getters.getChatUserName(aboutUids[i]);
                    groupUidNameList.unshift(ret);
                    }
                })
                if(i > 3) {
                    break;
                }
                }
                groupName = groupUidNameList.join("、");
            }
            return groupName
        },
        getUserNameFromDb: async function(distUid) {
            var nameTemp = '';
            var userInfos = await services.common.GetDistUserinfo(distUid);
            if(userInfos.length == 0) {
                return nameTemp;
            }
            var distUserInfo = userInfos[0];
            if(distUserInfo != undefined){
                nameTemp = distUserInfo.user_display_name;
            }
            return nameTemp;
        },
        getMsgContent: async function(msg) {
            if(this.msg === null) {
                return '';
            }
            var messageContent = '';
            let chatGroupMsgType = msg.message_type;
            var chatGroupMsgContent = strMsgContentToJson(msg.message_content);
            var aboutUserName = await this.getUserNameFromDb(msg.message_from_id);
            // console.log("chatGroupMsgContent is ", chatGroupMsgContent)
            // console.log("this. msg is ", this.msg)
            // 数据库缺省type = 0 
            if(chatGroupMsgType === 101 || chatGroupMsgType ==0)
            {
                messageContent = aboutUserName + ":" + chatGroupMsgContent.text;
                return messageContent;
            }
            else if(chatGroupMsgType === 102)
            {
                messageContent = aboutUserName + ":" + "[图片]:" + chatGroupMsgContent.fileName;
                return messageContent;
            }
            else if(chatGroupMsgType === 103)
            {
                messageContent = aboutUserName + ":" + "[文件}:" + chatGroupMsgContent.fileName;   
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
            var gorupId = this.curChat.group_id;
            var msgIds = [];
            var fromId = this.curUserInfo.id;
            if(this.curChat.group_type == 101) {
                let distUser = this.getUserNameFromDb(this.curChat.user_id)
                contentTitle = this.curUserInfo.name + "与" + distUser[0].user_display_name + "的聊天记录";
            }
            for(let i=0;i<msgs.length;i++) {
                if(i < 4) {
                    if(i == 3) {
                        contentText = contentText + getMsgContent(msgs[i]);
                    }
                    else {
                        contentText = contentText + getMsgContent(msgs[i]) + "\n";
                    }
                }
                msgIds.push(msgs[i].time_line_id);
            }

            var togetherMsgContent = {
                "title": contentTitle,
                "text": contentText,
                "gorupId": groupId,
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
            var msgContent = this.getTogetherMsgContent(msgs);
            console.log("varcontent is ", varcontent);
            for(var i=0;i<distGroups.length;i++){
                var uid = this.getDistUidThroughUids(distGroups[i].contain_user_ids);
                var gorupId = distGroups[i].group_id == null ? '' : distGroups[i].group_id;
                let curTimeSeconds = new Date().getTime();
                
                let sendingMsgContentType = 106;
                let willSendMsgContent = msgContent;
                let guid = generalGuid();

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
                    var gorupId = distGroups[i].group_id == null ? '' : distGroups[i].group_id;
                    let curTimeSeconds = new Date().getTime();
                    
                    let sendingMsgContentType = curMsg.message_type;
                    let willSendMsgContent = curMsgContent;
                    let guid = generalGuid();

                    services.common.sendNewMessage(
                            guid, 
                            sendingMsgContentType, 
                            this.curUserInfo.id, 
                            gorupId, 
                            uid, 
                            curTimeSeconds, 
                            willSendMsgContent)
                        .then((ret) => {
                            console.log("sendNewMessage ret is ", strMsgContentToJson(ret.message_content));
                        })
                }
            }
        },
        sendMsg: function(distGroups, msgs) {
            if(this.transmitTogether) {
                this.sendTogetherMsg(distGroups, msgs);
            }
            else {
                this.sendSingleMsg(distGroups, msgs);
            }
        },
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
    font-family:Microsoft Yahei;
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
    font-family:Microsoft Yahei;
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
    font-family:Microsoft Yahei;
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
    font-family:Microsoft Yahei;
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