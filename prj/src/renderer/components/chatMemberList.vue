<template>
    <div class="atDlg" id="atDlgId">
        <div class="atList-view">
            <ul class="atList">
                <li v-for="(item, index) in memberListShow" class="memberItem" @click="atMember(item)">
                    <div class="groupMemberInfoDiv">
                        <img :id="getIdThroughMemberUid(item.user_id)" class="groupMemberInfoImage" src="../../../static/Img/User/user-40px@2x.png">
                        <label class="groupMemberInfoLabel">{{item.user_display_name}}</label>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {services} from '../../packages/data/index.js'
import {downloadGroupAvatar, FileUtil, sliceReturnsOfString} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {ipcRenderer, remote} from 'electron'
import {getElementTop, getElementLeft, pathDeal} from '../../packages/core/Utils.js'
export default {
    name: 'atDlg',
    data() {
        return {
            memberListShow: [],
            memberListShowOriginal: [],
            absoluteTop: 0,
            absoluteLeft: 0,
            imgHeight: 200,
            imgWidth: 200,
            groupId: '',
            ownerId: '',
            atDlgElement: null,
            searchId: 0,
            memberIdList:[],
        }
    },
    components: {
    },
    props: ["GroupInfo", "showPosition", "chatMemberSearchKey"],
    computed: {
    },
    methods: {
        atMember: function(memberInfo) {
            this.memberListShowOriginal = [];
            this.memberListShow = [];
            this.memberIdList = [];
            this.$emit("atMember", memberInfo);
        },
        Close: function() {
            this.memberListShowOriginal = [];
            this.memberListShow = [];
            this.memberIdList = [];
            this.$emit("closeChatMemberDlg");
        },
        getClassNameThroughMemberUid: function(memberUid) {
            return "member-img-class-" + memberUid;
        },
        getIdThroughMemberUid: function(memberUid) {
            return "member-img-id-" + memberUid;
        },
        getDeleteIdThroughMemberUid: function(memberUid) {
            return "delete-member-id-" + memberUid;
        },
        getUidThroughElementId: function(elementId) {
            var uid = elementId.slice("member-img-div-id-".length, elementId.length);
            return uid;
        },
        getMemberImage: async function() {
            for(var i=0; i < this.memberListShow.length; i++) {
                var distUserInfo = this.memberListShow[i];
                // console.log("distuserinfo.uid ", distUserInfo.user_id);
                var targetPath = '';
                if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(distUserInfo.avatar_t_url, distUserInfo.user_id))){
                    var distElement = document.getElementById(this.getIdThroughMemberUid(distUserInfo.user_id));
                    distElement.setAttribute("src", targetPath);
                }
            }
        },
        updateUserImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            console.log("group info updateuserimage args ", args)

            var distElement = document.getElementById(this.getIdThroughMemberUid(id));
            distElement.setAttribute("src", localPath);
        },
    },
    async created () {
        await services.common.init();
        this.loginInfo = await services.common.GetLoginModel();
        console.log("userinfo-tip login info is ", this.loginInfo);
        this.curUserInfo = await services.common.GetSelfUserModel();
    },
    mounted() {
    },
    watch: {
        GroupInfo: async function() {
            this.memberListShow = [];
            this.memberListShowOriginal = [];
            this.memberIdList = [];

            // console.log("GroupInfo is ", this.GroupInfo);
            if(this.atDlgElement == null) {
                this.atDlgElement = document.getElementById("atDlgId");
            }
            if(this.GroupInfo.group_id == undefined) {
                return;
            }
            
            this.memberIdList = this.GroupInfo.contain_user_ids.split(",");
            // console.log("this member list is ", this.memberIdList);
            
            for(var i=0;i<this.memberIdList.length;i++) {
                let memberInfoTmp = await services.common.GetDistUserinfo(this.memberIdList[i]);
                if(memberInfoTmp.length != 0) {
                    memberInfoTmp[0].checkState = false;
                    this.memberListShow.push(memberInfoTmp[0]);
                    this.memberListShowOriginal.push(memberInfoTmp[0]);
                }

                if(i == 6){
                    break;
                }
            }

            this.$nextTick(() => {
                this.getMemberImage();
            })

            if(this.showPosition.length != 0) {
                setTimeout(() => {
                    this.$nextTick(() => {
                        this.atDlgElement.style.left = this.showPosition.left.toString() + "px";
                        this.atDlgElement.style.top = (this.showPosition.top - this.atDlgElement.clientHeight).toString() + "px";
                    })
                }, 0)
            }

            for(var i=0;i<this.memberIdList.length;i++) {
                let memberInfoTmp = await services.common.GetDistUserinfo(this.memberIdList[i]);
                console.log("memgerinfotmep is ", memberInfoTmp)
                if(memberInfoTmp.length != 0) {
                    if(this.memberListShow.indexOf(memberInfoTmp[0]) == -1) {
                        memberInfoTmp[0].checkState = false;
                        this.memberListShow.push(memberInfoTmp[0]);
                        this.memberListShowOriginal.push(memberInfoTmp[0]);
                    }
                }
            }

            this.$nextTick(() => {
                this.getMemberImage();
            })

            this.ownerId = this.GroupInfo.owner;
            this.groupId = this.GroupInfo.group_id; 
        },
        showPosition: function() {
            // console.log("this showposition is ", this.showPosition)
        },
        chatMemberSearchKey: function() {
            this.memberListShow = [];
            if((this.chatMemberSearchKey != null && this.chatMemberSearchKey.length == 0) || this.chatMemberSearchKey == null) {
                console.log("toall ========")
                this.memberListShow = this.memberListShowOriginal;
                this.getMemberImage();
                
                if(this.showPosition.length != 0) {
                    setTimeout(() => {
                        this.$nextTick(() => {
                            this.atDlgElement.style.left = this.showPosition.left.toString() + "px";
                            this.atDlgElement.style.top = (this.showPosition.top - this.atDlgElement.clientHeight).toString() + "px";
                        })
                    }, 0)
                }
                return
            }
            var curSearchId = new Date().getTime();
            this.chatMemberSearchKey = sliceReturnsOfString(this.chatMemberSearchKey);
            console.log("chatMemberSearchKey is ", this.chatMemberSearchKey);
            var searchResult = {
                "id": curSearchId,
                "searchList": []
            };
            console.log("this.memberListShowOriginal.length is ", this.memberListShowOriginal.length);

            this.searchId = curSearchId;
            for(var i=0;i<this.memberListShowOriginal.length;i++) {
                console.log("searchResult is ", this.memberListShowOriginal[i].user_display_name.indexOf(this.chatMemberSearchKey));
                if(this.memberListShowOriginal[i].user_display_name.indexOf(this.chatMemberSearchKey) != -1) {
                    if(searchResult.searchList.indexOf(this.memberListShowOriginal[i]) == -1) {
                        searchResult.searchList.push(this.memberListShowOriginal[i]);
                    }
                }
            }

            console.log("searchResult ", searchResult);
            if(searchResult.id == this.searchId) {
                this.memberListShow = searchResult.searchList;
                this.getMemberImage();
            }

            if(this.showPosition.length != 0) {
                setTimeout(() => {
                    this.$nextTick(() => {
                        this.atDlgElement.style.left = this.showPosition.left.toString() + "px";
                        this.atDlgElement.style.top = (this.showPosition.top - this.atDlgElement.clientHeight).toString() + "px";
                    })
                }, 0)
            }
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

    .atDlg {
        position: absolute;
        max-height: 200px;
        width: 200px;
        background: rgba(255, 255, 255, 1);
        box-shadow:0px 0px 30px 0px rgba(103,103,103,0.24);
        overflow: hidden;
        font-size: 0px;
    }

    .atList-view {
        max-height: 200px;
        width: 100%;
        padding: 0px;
        border: 0px;
        background: rgba(255, 255, 255, 1);
        cursor: default;
        border-bottom: 1 solid rgba(221, 221, 221, 1);
    }

    .atList {
        list-style: none;
        max-height: 200px;
        margin: 0;
        padding: 0;
        display: block;
        list-style: none;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .memberItem {
        width: 184px;
        height: 40px;
        padding-left: 16px;
        padding-right: 0px;
    }

    .memberItem:hover {
        width: 184px;
        height: 40px;
        padding-left: 16px;
        padding-right: 0px;
        background-color: rgb(17, 180, 105);
    }

    .groupMemberInfoDiv {
        width: 100%;
        height: 40px;
        margin: 0px;
        display: inline-block;
    }

    .groupMemberInfoImage {
        display: inline-block;
        padding-top: 8px;
        padding-bottom: 8px;
        width: 24px;
        height: 24px;
        border-radius:4px;
    }

    .groupMemberInfoLabel {
        display: inline-block;
        width: calc(100% - 68px);
        height: 40px;
        line-height: 40px;
        vertical-align: top;
        font-size: 14px;
        font-family:Microsoft Yahei;
        padding-left: 8px;
    }

</style>