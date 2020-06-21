<template>
    <div class="TransmitLayers" id="TransmitLayersId">
        <div :style="dlgPosition" class="TransmitDlg" id="TransmitDlgId">
            <div class="TransmitHeader">
                <div class="TransmitHeaderTitle">转发</div>
                <img class="TransmitClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            <el-container class="TransmitContent">
                <el-aside class="ListView" width="280px">
                    <div class="search">
                        <input class="search-input" placeholder="搜索..." >
                        <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" >
                    </div>
                    <div class="NewChatView">
                        <img class="icon-chat-more" src="../../../static/Img/Chat/chat_more@2x.png" >
                        <div class="createNewChatInfo">
                        <p class="createNewChatTitle">创建新聊天</p>
                        </div>
                    </div>
                    <div class="RecentChatHeader">
                        最近聊天
                    </div>
                    <div class="RecentChatView">
                            <ul class="recentChatList">
                                <li class="recentChat" v-for="(group, index) in recentGroups" :key="index">
                                    <input type="checkBox" class="group-checkBox" :checked="groupChecked(group)" @click="groupCheckBoxClicked(group)">
                                    <img class="group-icon" :id="group.group_id" src="../../../static/Img/User/user.jpeg">
                                    <div class="group-info">
                                        <p class="group-name">{{ group.group_name }}</p>
                                    </div>
                                </li>
                            </ul>
                    </div>
                </el-aside>
                <el-main class="selectedView">
                    <div class="selectedHeader">
                        已选:{{ selectedGroups.length }}
                    </div>
                    <div class="selectedContentView">
                        <ul class="selectedGroupList">
                            <li class="selectedGroup" v-for="(group,index) in selectedGroups" :key="index">
                                <img class="group-icon" :src="group.group_avarar">
                                <div class="group-info">
                                    <p class="group-name">{{ group.group_name }}</p>
                                </div>
                                <img class="group-delete-icon" src="../../../static/Img/Chat/delete-20px@2x.png" @click="deleteGroupFromSelectedGeoups(group)">
                            </li>
                        </ul>
                    </div>
                </el-main>
            </el-container>
            <div class="TransmitFotter">
                <button class="TransmitCancleButton" @click="closeDialog()">取消</button>
                <button class="TransmitConfirmButton" @click="confirmTransmitButtonClicked()">确认</button>
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
import { object } from '../../packages/core/types'
import confservice from '../../packages/data/conf_service';
import * as path from 'path'
export default {
    name: 'TransmitDlg',
    props: {
        collectionInfo: {
            type: Object,
            default: function(){
                return {};
            }
        },
        recentGroups: {
            type: Array,
            default: function () { 
                return [];
            }
        }

    },
    computed: {
        groupChecked() {
            return function(group) {
                if (this.selectedGroups.indexOf(group) != -1){
                    return true;
                }
                else{
                    return false;
                }
            }
        }
    },
    data () {
        return {
            TransmitDlgElement: null,
            TransmitLayersElement: null,
            imgHeight: 468,
            imgWidth: 624,
            ipcInited: false,
            TransmitContent: "",
            groupId: "",
            dlgPosition:{},
            selectedGroups: [],
        }
    },
    methods: {
        confirmTransmitButtonClicked(){
            services.common.sendNewMessage()
        },
        closeDialog() {
            this.display = false;
            this.$emit("closeTransmitDlg", "");
            this.$message('这是一条消息提示');
        },
        deleteGroupFromSelectedGeoups(group){
            var index = this.selectedGroups.indexOf(group);
            this.selectedGroups.splice(index, 1);
        },
        groupCheckBoxClicked(group){
            if(this.selectedGroups.indexOf(group) != -1){
                var index = this.selectedGroups.indexOf(group);
                this.selectedGroups.splice(index, 1);
            }
            else{
                this.selectedGroups.push(group);
            }
        },
        selectedGroupImageId(id) {
            return "selected" + id;
        },
        // UpdateTransmit: function() {
        //     if(this.TransmitContent.length == 0){
        //         alert("公告内容不能为空");
        //         return;
        //     }
        //     services.common.UpdateGroupTransmit(this.groupId, this.TransmitContent)
        //         .then((ret) => {
        //             console.log("ret ", ret)
        //             this.$emit("closeTransmitDlg", this.TransmitContent);
        //         })
        // },
        getGroupAvatarContent:async function(group) {
            var targetDir = confservice.getUserThumbHeadPath();
            var targetPath = path.join(targetDir, group.group_id + '.png');
            var groupAvatarElement = document.getElementById(group.group_id);
            if(groupAvatarElement == null) {
                return;
            }
            if(fs.existsSync(targetPath)) {
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    groupAvatarElement.setAttribute("src", reader.result);
                }
            }
            else{
                console.log("download group avatar", group);
                await services.common.downloadGroupAvatar(group.group_avarar, group.group_id);
                //await this.getGroupAvatarContent(group);
            }

        },
        calcImgPosition: function() {

            // console.log("remote.b")
            //console.log(document.documentElement.clientHeight);
            var showScreenHeight = document.documentElement.clientHeight;
            var showScreenWidth = document.documentElement.clientWidth;
            //console.log("showScreenHeight ", showScreenHeight)
            //console.log("showScreenWidth ", showScreenWidth)
            var left = (showScreenWidth - this.imgWidth) / 2;
            var top = (showScreenHeight - this.imgHeight) / 2;
            var ret = {
                "left": left,
                "top": top
            }

            return ret;
        },
    },
    components: {
    },
    created() {
        this.serverapi = new APITransaction('139.198.15.253', 8888);
        
            var showPosition = this.calcImgPosition();
            console.log(showPosition);
            this.dlgPosition.left = showPosition.left.toString() + "px";
            this.dlgPosition.top = showPosition.top.toString() + "px";
            console.log(this.recentGroups);
            this.$nextTick(function(){
                for(var i = 0; i < this.recentGroups.length; i ++){
                    this.getGroupAvatarContent(this.recentGroups[i]);
                }
            });
    },
    mounted: function() {
    },
    
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
    .TransmitLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
    }

    .TransmitDlg {
        position: absolute;
        width: 624px;
        height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .TransmitHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .TransmitHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
    }

    .TransmitClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }
    .TransmitBody {
        width: 560px;
        height: 340x;
    }
    .TransmitContent {
        width: 560px;
        height: 340x;
        margin: 0;
        margin-left: 32px;
        border-radius: 4px;
        border: 1px solid rgba(221,221,221,1);
        background:rgba(255,255,255,1);
        .ListView {
            overflow: hidden;
            height: 100%;
            width: 280px;
            border-right: 1px solid rgba(221,221,221,1);
            .NewChatView {
                height: 48px;
                width: calc(100% - 32px);
                padding-left: 16px;
                vertical-align: top;
                .icon-chat-more {
                    width: 24px;
                    height: 24px;
                    display: inline-block;
                    margin-top: 12px;
                }
                .createNewChatInfo{
                    height: 48px;
                    width: 100px;
                    display: inline-block;
                    vertical-align: top;
                }
                .createNewChatTitle{
                    
                    width:100px;
                    height:20px;
                    margin: 0px;
                    margin-top: 14px;
                    margin-bottom: 14px;
                    font-size:14px;
                    font-weight:400;
                    color:rgba(0,0,0,1);
                    line-height:20px;
                    letter-spacing:1px;
                }
            }
            .RecentChatHeader {
                padding-left: 16px;
                width:52px;
                height:18px;
                font-size:12px;
                font-weight:400;
                color:rgba(153,153,153,1);
                line-height:18px;
                letter-spacing:1px;
            }
            .RecentChatView {
                height: 214px;
                overflow: scroll;
                .recentChatList{
                    list-style: none;
                    margin: 0px;
                    padding-left: 16px;
                    .recentChat{
                        width: 248px;
                        height: 48px;
                        vertical-align: top;
                        .group-checkBox{
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            margin-top: 14px;
                            margin-bottom: 14px;
                        }
                        .group-icon{
                            margin-top: 8px;
                            margin-left: 6px;
                            margin-bottom: 8px;
                            width: 32px;
                            height: 32px;
                            display: inline-block;
                            border-radius: 4px;

                        }
                        .group-info{
                            display: inline-block;
                            height: 48px;
                        }
                        .group-name{
                            width:160px;
                            height:20px;
                            font-size:14px;
                            margin-top: 14px;
                            margin-bottom: 14px;
                            font-weight:400;
                            color:rgba(0,0,0,1);
                            line-height:20px;
                            letter-spacing:1px;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            padding-left: 12px;
                            text-align: left;
                        }

                    }
                }
                
            }
        }
        .selectedView {
            
            height: 340px;
            width: 50%;
            padding: 0px;
            overflow: hidden;
            .selectedHeader{
                width: 100%;
                height: 48px;

            }
            .selectedContentView {
                height: 292px;
                width: 100%;
            }
            .selectedGroupList{
                height: 100%;
                padding: 0px;
                padding-left: 16px;
                margin: 0px;
                list-style: none;
                overflow: scroll;
                .selectedGroup {
                    height: 48px;
                    vertical-align: top;
                    .group-icon{
                            width: 32px;
                            height: 32px;
                            display: inline-block;
                            border-radius: 4px;
                            margin-top: 8px;
                            margin-bottom: 8px;
                        }
                        .group-info{
                            display: inline-block;
                            height: 48px;
                        }
                        .group-name{
                            width:156px;
                            height:20px;
                            font-size:14px;
                            margin-top: 14px;
                            margin-bottom: 14px;
                            font-weight:400;
                            color:rgba(0,0,0,1);
                            line-height:20px;
                            letter-spacing:1px;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            padding-left: 12px;
                            text-align: left;
                        }
                        .group-delete-icon {
                            width: 20px;
                            height: 20px;
                            display: inline-block;
                            margin-top: 14px;
                            
                            margin-bottom: 14px;
                        }
                }
            }
        }
        
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
    
    .search-input {
        display: inline-block;
        position: absolute;
        text-indent: 10px;
        width: 248px;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: 'Microsoft YaHei';
        font-size: 12px;
        color: rgb(102, 102, 102);
        background-color: rgba(1, 1, 1, 0);
    }
    

    // .TransmitTextArea {
    //     width: calc(100% - 96px);
    //     height: calc(100% - 32px);
    //     background:rgba(255,255,255,1);
    //     border-radius:4px 0px 0px 4px;
    //     border:1px solid rgba(221,221,221,1);
    //     margin-left: 32px;
    //     margin-right: 32px;
    //     padding: 0px;
    //     font-size: 14px;
    //     text-indent: 4px;
    //     color: rgba(153, 153, 153, 1);
    //     letter-spacing:1px;
    //     font-weight:400;
    //     font-family:Microsoft Yahei;
    //     line-height:20px;
    //     padding: 16px;
    // }

    // .TransmitTextArea:focus {
    //     width: calc(100% - 96px);
    //     height: calc(100% - 32px);
    //     background:rgba(255,255,255,1);
    //     border-radius:4px 0px 0px 4px;
    //     border:1px solid rgba(221,221,221,1);
    //     margin-left: 32px;
    //     margin-right: 32px;
    //     padding: 0px;
    //     font-size: 14px;
    //     text-indent: 4px;
    //     color: rgba(153, 153, 153, 1);
    //     letter-spacing:1px;
    //     font-weight:400;
    //     font-family:Microsoft Yahei;
    //     line-height:20px;
    //     padding: 16px;
    //     outline: none;
    // }

    .TransmitFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }

    .TransmitConfirmButton {
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
    }
 
    .TransmitCancleButton {
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
