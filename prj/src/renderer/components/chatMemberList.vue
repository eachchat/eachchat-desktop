<template>
    <div class="atDlg" id="atDlgId">
        <div class="atList-view">
            <ul class="atList" id="atListId">
                <li v-for="(item, index) in memberListShow" class="memberItem" @click="atMember(item)">
                    <div class="groupMemberInfoDiv">
                        <img :id="getIdThroughMemberUid(item.userId)" class="groupMemberInfoImage" src="../../../static/Img/User/user-40px@2x.png">
                        <label class="groupMemberInfoLabel" :id="getNameIdThroughMemberUid(item.userId)">{{item.name}}</label>
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
import { nextTick } from 'process'
import {ComponentUtil} from '../script/component-util'
import axios from "axios";
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
            searchId: 0
        }
    },
    components: {
    },
    props: ["GroupInfo", "showPosition", "chatMemberSearchKey", "selectClicked"],
    computed: {
    },
    methods: {
        atMember: function(memberInfo) {
            this.memberListShowOriginal = [];
            this.memberListShow = [];
            this.$emit("atMember", memberInfo);
        },
        Close: function() {
            this.memberListShowOriginal = [];
            this.memberListShow = [];
            this.$emit("closeChatMemberDlg");
        },
        getClassNameThroughMemberUid: function(memberUid) {
            return "member-img-class-" + memberUid;
        },
        getIdThroughMemberUid: function(memberUid) {
            return "member-img-id-" + memberUid;
        },
        getNameIdThroughMemberUid: function(memberUid) {
            return "member-name-id-" + memberUid;
        },
        getDeleteIdThroughMemberUid: function(memberUid) {
            return "delete-member-id-" + memberUid;
        },
        getUidThroughElementId: function(elementId) {
            var uid = elementId.slice("member-img-div-id-".length, elementId.length);
            return uid;
        },
        getMemberInfo: async function() {
            this.memberListShow.forEach(async (item)=>{
                var fromUserName = await ComponentUtil.GetDisplayNameByMatrixID(item.userId);
                item.displayName = fromUserName;

                var distNameElement = document.getElementById(this.getNameIdThroughMemberUid(item.userId));
                if(distNameElement) {
                    distNameElement.innerHTML = fromUserName;
                }

                var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(item.userId);
                if(!item)
                    return;
                var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
                if(avaterUrl == '')
                    return;
                var distElement = document.getElementById(this.getIdThroughMemberUid(item.userId));
                if(!distElement)
                    return;
                try{
                    var response = await axios.get(avaterUrl);
                }
                catch(e) {
                    return;
                }
                distElement.setAttribute("src", avaterUrl);
            })
        },
        getMemberName: async function() {
            var fromUserName = await ComponentUtil.GetDisplayNameByMatrixID(this.msg.sender.userId);

            if(userNameElement != undefined) {
                userNameElement.innerHTML = fromUserName;
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
    watch: {
        GroupInfo: async function() {
            if(!this.GroupInfo.currentState)
                return;
            this.memberListShow = this.GroupInfo.currentState.getMembers();
            for(var i=0;i<this.memberListShow.length;i++) {
                if(this.memberListShow[i].userId == this.$store.state.userId) {
                    this.memberListShow.splice(i, 1);
                    break;
                }
            }
            console.log("*** this.memberListShow ", this.memberListShow);
            this.memberListShowOriginal = this.memberListShow;

            // console.log("GroupInfo is ", this.GroupInfo);
            if(this.atDlgElement == null) {
                this.atDlgElement = document.getElementById("atDlgId");
            }

            this.$nextTick(() => {
                this.getMemberInfo();
            })

            if(this.showPosition.length != 0) {
                setTimeout(() => {
                    this.$nextTick(() => {
                        this.atDlgElement.style.left = this.showPosition.left.toString() + "px";
                        this.atDlgElement.style.top = (this.showPosition.top - this.atDlgElement.clientHeight).toString() + "px";
                    })
                }, 0)
            }
            this.ownerId = this.GroupInfo.owner;
            this.groupId = this.GroupInfo.roomId; 
            
        },
        selectClicked: function() {
            this.$nextTick(() => {
                var ulDiv = document.getElementById("atListId");
                var selectedIndex = -1;
                for(var i=0;i<ulDiv.children.length;i++) {
                    if(ulDiv.children[i].style.backgroundColor == "rgba(243, 244, 247, 1)") {
                        selectedIndex = i;
                        break;
                    }
                }
                if(selectedIndex != -1) {
                    var memberInfo = this.memberListShow[i];
                    this.memberListShowOriginal = [];
                    this.memberListShow = [];
                    this.$emit("atMember", memberInfo);
                }
            })
        },
        showPosition: function() {
            // console.log("this showposition is ", this.showPosition)
        },
        chatMemberSearchKey: function() {
            nextTick(() => {
                this.memberListShow = [];
                if((this.chatMemberSearchKey != null && this.chatMemberSearchKey.length == 0) || this.chatMemberSearchKey == null) {
                    console.log("toall ========")
                    for(var i=0;i<this.memberListShowOriginal.length;i++) {
                        if(this.memberListShow.indexOf(this.memberListShowOriginal[i]) == -1 && this.memberListShowOriginal[i].userId != this.$store.state.userId) {
                            this.memberListShow.push(this.memberListShowOriginal[i]);
                        }
                    }
                    
                    this.getMemberInfo();
                    
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
                    var checkName = this.memberListShowOriginal[i].displayName ? this.memberListShowOriginal[i].displayName : this.memberListShowOriginal[i].name;
                    console.log("searchResult is ", checkName.indexOf(this.chatMemberSearchKey));
                    if(checkName.indexOf(this.chatMemberSearchKey) != -1 && this.memberListShowOriginal[i].userId != this.$store.state.userId) {
                        if(searchResult.searchList.indexOf(this.memberListShowOriginal[i]) == -1) {
                            searchResult.searchList.push(this.memberListShowOriginal[i]);
                        }
                    }
                }

                console.log("searchResult ", searchResult);
                if(searchResult.id == this.searchId) {
                    this.memberListShow = searchResult.searchList;
                    this.getMemberInfo();
                }

                if(this.showPosition.length != 0) {
                    setTimeout(() => {
                        this.$nextTick(() => {
                            this.atDlgElement.style.left = this.showPosition.left.toString() + "px";
                            this.atDlgElement.style.top = (this.showPosition.top - this.atDlgElement.clientHeight).toString() + "px";
                        })
                    }, 0)
                }
            })
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
        background-color: rgba(243, 244, 247, 1);
    }

    .groupMemberInfoDiv {
        width: 100%;
        height: 40px;
        margin: 0px;
        display: inline-block;
    }

    .groupMemberInfoImage {
        display: inline-block;
        margin-top: 8px;
        margin-bottom: 8px;
        width: 24px;
        height: 24px;
        border-radius:50px;
    }

    .groupMemberInfoLabel {
        display: inline-block;
        width: calc(100% - 68px);
        height: 40px;
        line-height: 40px;
        vertical-align: top;
        font-size: 14px;
        font-family:PingFangSC-Regular;
        font-weight: 400;
        letter-spacing: 0px;
        padding-left: 8px;
    }

</style>