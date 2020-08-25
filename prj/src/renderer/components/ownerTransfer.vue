<template>
    <div class="OwnerTransferLayers" id="OwnerTransferLayersId">
        <div class="OwnerTransferDlg" id="OwnerTransferDlgId">
            <div class="OwnerTransferHeader">
                <div class="OwnerTransferHeaderTitle">转让群主</div>
                <img class="OwnerTransferClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="Close">
            </div>
            <div class="OwnerTransferContent">
                <div class="search">
                    <input class="ownertransfer-search-input" placeholder="搜索..." v-model="searchKey" @input="search" @keyup.enter="search">
                    <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" @click="search">
                </div>
                <ul class="groupMember-list">
                    <li v-for="(item, index) in memberListShow" class="memberItem">
                        <input type="checkbox" class="user-checkBox" @click="selectChanged(item)" :checked="isChecked(item)">
                        <img :id="getIdThroughMemberUid(item.user_id)" class="groupMemberInfoImage" @click="showUserInfoTip">
                        <label class="groupMemberInfoLabel">{{item.user_display_name}}</label>
                    </li>
                </ul>
            </div>
            <div class="OwnerTransferFotter">
                <button class="OwnerTransferCancleButton" @click="Close()">取消</button>
                <button class="OwnerTransferConfirmButton" @click="TransferOwner()" :disabled="selectedUserId.length==0">确认</button>
            </div>
        </div>
    </div>
</template>

<script>
import {strMsgContentToJson, FileUtil} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import {APITransaction} from '../../packages/data/transaction.js'
import * as fs from 'fs-extra'
import {ipcRenderer, remote} from 'electron'
export default {
    name: 'OwnerTransferLayers',
    props: ['GroupInfo'],
    data () {
        return {
            OwnerTransferDlgElement: null,
            OwnerTransferLayersElement: null,
            imgHeight: 408,
            imgWidth: 468,
            ipcInited: false,
            ownerId: "",
            groupId: "",
            memberIdList: [],
            memberListShow: [],
            memberListShowOriginal: [],
            searchKey: '',
            selectedUserId: "",
        }
    },
    methods: {
        showUserInfoTip: function() {

        },
        search: function() {
            if(this.searchKey.length == 0) {
                this.memberListShow = this.memberListShowOriginal;
                this.getMemberImage();
            }
            var curSearchId = new Date().getTime();
            console.log("searchkey is ", this.searchKey);
            var searchResult = {
                "id": curSearchId,
                "searchList": []
            };
            this.searchId = curSearchId;
            for(let i=0;i<this.memberListShowOriginal.length;i++) {
                if(this.memberListShowOriginal[i].user_display_name.indexOf(this.searchKey) != -1) {
                    searchResult.searchList.push(this.memberListShowOriginal[i]);
                }
            }

            if(searchResult.id == this.searchId) {
                this.memberListShow = searchResult.searchList;
                this.getMemberImage();
            }
        },
        Close: function() {
            this.memberListShow = [];
            this.memberListShowOriginal = [];
            this.$emit("closeOwnerTransferDlg", "");
        },
        TransferOwner: function() {
            console.log("transfer owner ", this.selectedUserId);
            services.common.TransferGroup(this.groupId, this.selectedUserId);
            this.$emit("closeOwnerTransferDlg", "");
        },
        calcImgPosition: function() {
            if(this.OwnerTransferDlgElement == null) {
                this.OwnerTransferDlgElement = document.getElementById("OwnerTransferDlgId");
            }
            if(this.OwnerTransferLayersElement == null) {
                this.OwnerTransferLayersElement = document.getElementById("OwnerTransferLayersId");
            }
            // console.log("remote.b")
            var showScreenHeight = this.OwnerTransferLayersElement.offsetHeight;
            var showScreenWidth = this.OwnerTransferLayersElement.offsetWidth;
            console.log("showScreenHeight ", showScreenHeight)
            console.log("showScreenWidth ", showScreenWidth)
            var left = (showScreenWidth - this.imgWidth) / 2;
            var top = (showScreenHeight - this.imgHeight) / 2;

            console.log("left ", left)
            console.log("top ", top)
            var ret = {
                "left": left,
                "top": top
            }

            return ret;
        },
        getIdThroughMemberUid: function(memberUid) {
            return "ownertransfer_member-img-id-" + memberUid;
        },
        isChecked: function(curUser) {
            if(curUser == null) {
                return false;
            }
            return curUser.checkState;
        },
        selectChanged: function(curUser) {
            if(curUser == null){
                return false;
            }
            console.log("chr chat is ", curUser);
            curUser.checkState = !curUser.checkState;
            if(curUser.checkState) {
                this.selectedUserId = curUser.user_id;
                for(let i=0;i<this.memberListShowOriginal.length;i++) {
                    if(this.memberListShowOriginal[i].user_id != curUser.user_id) {
                        this.memberListShowOriginal[i].checkState = false;
                    }
                }
                for(let i=0;i<this.memberListShow.length;i++) {
                    if(this.memberListShow[i].user_id != curUser.user_id) {
                        this.memberListShow[i].checkState = false;
                    }
                }
            }
            console.log("selectedUserId is ", this.selectedUserId);
            return curUser.checkState;
        },
        getMemberImage: async function() {
            for(var i=0; i < this.memberListShow.length; i++) {
                var distUserInfo = this.memberListShow[i];
                console.log("distuserinfo.uid ", distUserInfo.user_id);
                var targetPath = '';
                if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(distUserInfo.avatar_t_url, distUserInfo.user_id))){
                    var distElement = document.getElementById(this.getIdThroughMemberUid(distUserInfo.user_id));
                    distElement.setAttribute("src", targetPath);
                }
            }
        },
    },
    components: {
    },
    created: async function () {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
    },
    mounted: function() {
    },
    watch: {
        GroupInfo: async function() {
            if(this.OwnerTransferDlgElement == null) {
                this.OwnerTransferDlgElement = document.getElementById("OwnerTransferDlgId");
            }
            if(this.OwnerTransferLayersElement == null) {
                this.OwnerTransferLayersElement = document.getElementById("OwnerTransferLayersId");
            }
            if(this.GroupInfo.group_id == undefined) {
                return;
            }
            var showPosition = this.calcImgPosition();
            console.log("showPositon is ", showPosition)
            this.OwnerTransferDlgElement.style.left = showPosition.left.toString() + "px";
            this.OwnerTransferDlgElement.style.top = showPosition.top.toString() + "px";
            
            this.memberIdList = [];
            this.memberIdList = this.GroupInfo.contain_user_ids.split(",");
            console.log("this member list is ", this.memberIdList);
            
            for(var i=0;i<this.memberIdList.length;i++) {
                if(this.memberIdList[i] == this.GroupInfo.owner) {
                    continue;
                }
                let memberInfoTmp = await services.common.GetDistUserinfo(this.memberIdList[i]);
                memberInfoTmp[0].checkState = false;
                this.memberListShow.push(memberInfoTmp[0]);
                this.memberListShowOriginal.push(memberInfoTmp[0]);
            }

            this.$nextTick(() => {
                this.getMemberImage();
            })

            this.ownerId = this.GroupInfo.owner;
            this.groupId = this.GroupInfo.group_id; 

        }
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar {
        width: 7px;
        height: 12px;
        display: none;
    }

    .OwnerTransferLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 3;
    }

    .OwnerTransferDlg {
        position: absolute;
        width: 440px;
        height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .OwnerTransferHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .OwnerTransferHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 2px;
    }

    .OwnerTransferClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }

    .OwnerTransferContent {
        width: calc(100% - 32px);
        height: 340px;
        margin: 0 16px 0 16px;
        border: 1px solid rgba(221, 221, 221, 1);
    }

    .search {
        margin: 12px 16px 12px 16px;
        text-align: left;
        width: calc(100% - 32px);
        height: 32px;
        border: 1px solid rgb(221, 221, 221);
        border-radius: 2px;
    }

    .icon-search {
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin: 6px 10px 6px 10px;
        color: rgb(51, 51, 51);
    }
    
    .icon-search:hover {
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin: 6px 10px 6px 10px;
        color: rgb(255,204,102);
    }
    
    .ownertransfer-search-input {
        display: inline-block;
        position: absolute;
        text-indent: 10px;
        width: 90%;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        font-size: 12px;
        color: rgb(102, 102, 102);
        background-color: rgba(1, 1, 1, 0);
    }

    .groupMember-list {
        list-style: none;
        max-height: calc(100% - 62px);
        margin: 0 16px 0 16px;
        padding: 0;
        display: block;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .memberItem {
        width: 100%;
        height: 48px;
        border-bottom: 1px solid rgb(221, 221, 221);
    }

    .user-checkBox {
        display: inline-block;
	    position:relative;
        width: 20px;
        height: 20px;
        background-color: rgba(255, 255, 255, 1);
        border: 1px solid rgb(221,221,221);
        border-radius: 4px;
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
        outline: none;
    }

    .user-checkBox:checked {
        background-color: rgb(36, 179, 107);
        cursor: pointer;
        outline: none;
    }

    .user-checkBox:indeterminate {
        background-color: rgb(36, 179, 107);
        cursor: pointer;
        outline: none;
    }
    .user-checkBox:indeterminate::after{
        content:'';
        top:7px;
        left:4px;
        font-size: 10px;
        position: absolute;
        background:transparent;
        border:#fff solid 2px;
        border-top:none;
        border-right:none;
        border-left: none;
        height:1px;
        width:10px;
        // -moz-transform:rotate(-45deg);
        // -ms-transform:rotate(-45deg);
        // -webkit-transform:rotate(-45deg);
        // transform:rotate(-45deg);
        outline: none;
    }

    .user-checkBox:checked::after {
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
    }

    .groupMemberInfoImage {
        display: inline-block;
        margin: 0 0 0 4px;
        padding-top: 8px;
        padding-bottom: 8px;
        width: 32px;
        height: 32px;
        border-radius:4px;
    }

    .groupMemberInfoLabel {
        display: inline-block;
        width: calc(100% - 128px);
        height: 48px;
        line-height: 48px;
        vertical-align: top;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 1px;
        padding-left: 8px;
    }

    .OwnerTransferFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }

    .OwnerTransferConfirmButton {
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }

    .OwnerTransferConfirmButton:disabled{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(167, 224, 196, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }
 
    .OwnerTransferConfirmButton:hover {
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(36,179,107,1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }
 
    .OwnerTransferCancleButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 110px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
    }
 
</style>
