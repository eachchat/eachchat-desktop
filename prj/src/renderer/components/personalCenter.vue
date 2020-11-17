<template>
    <div class="personalCenter-view" :style="pagePosition">
        <div class="personalCenterBaseInfo-view">
            <div class="personalCenter-iconView" @click="personalCenterIconClicked()">
                <img ondragstart="return false" class="personalCenter-icon" src="../../../static/Img/User/user-40px@2x.png">
                <div class="personalCenter-changeIcon">
                    <img ondragstart="return false" class="personalCenter-cameraIcon" src="../../../static/Img/personalCenter/changeAvatar-24px@2x.png">
                </div>
            </div>
            <div class="personalCenter-baseInfo">
                <p class="personalCenter-name" id="personalCenter-namd-id"></p>
                <p class="personalCenter-userId" id="personalCenter-userId-id"></p>
            </div>
        </div>
        <div class="personalCenter-state">
            <img ondragstart="return false" class="personalCenter-stateImg" id="personalCenter-stateImg-id" src="../../../static/Img/personalCenter/online-20px@2x.png"> 
            <input class="personalCenter-stateInput" v-model="stateInput" @keyup.enter="stateChangeConfirm()" @input="checkStateInputLength()">
            <img ondragstart="return false" class="personalCenter-stateSelectArrow"  @click="stateListArrowClicked()" src="../../../static/Img/personalCenter/statusArrow-20px@2x.png">
        </div>
        <div class="personalCenter-stateSelectListView" v-show="showStateList">
            <ul class="personalCenter-stateSelectList">
                <li class="personalCenter-stateSelect" v-for="(state, index) in stateList" @click="stateItemClicked(state, index)" :key="index">
                    <img ondragstart="return false" class="personalCenter-stateImg" :id="state.state"> 
                    <p class="personalCenter-stateSelectTitle">{{ state.state }}</p>
                    <img ondragstart="return false" class="personalCenter-stateSelectCheck" v-show="state.check" src="../../../static/Img/personalCenter/selected-20px@2x.png">
                </li>
            </ul>
        </div>
        <div class="personalCenter-workDescription">
            <img ondragstart="return false" class="personalCenter-descriptionIcon" src="../../../static/Img/personalCenter/workDescription-20px@2x.png">
            <input class="personalCenter-descriptionInput" placeholder="设置工作状态" v-model="workDescriptionInput" @input="checkDescriptionInputLength()" @keyup.enter="workDescriptionChangeConfirm()">
        </div>
        <image-cropper v-if="showImageCropper" :imageSource="selectImageSource" @closeCropperDlg="closeCropperDlg"></image-cropper>
    </div>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
//import { services } from '../../packages/data'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {services} from '../../packages/data/index.js';
import imageCropper from './imageCropper.vue'
export default {
    name: 'user-info',
    data() {
        return {
            pagePosition: {},
            stateInput:'',
            workDescriptionInput:'',
            stateList:[],
            showStateList: false,
            showImageCropper:false,
            selectImageSource: '',
            curStateImgElement: undefined,
        }
    },
    components:{
        imageCropper,
    },
    computed: {

    },
    methods: {
        statueImg(statue) {
            if(statue.state == "online") {
                return "/static/Img/personalCenter/online-20px@2x.png"
            }
            else if(statue.state == "offline") {
                return "/static/Img/personalCenter/offline-20px@2x.png"
            }
            else if(statue.state == "unavailable") {
                return "/static/Img/personalCenter/unavailable-20px@2x.png"
            }
        },
        closeCropperDlg(){
            this.showImageCropper = false;
        },
        personalCenterIconClicked(){
            const ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.send('open-image-dialog-avatar', 'openFile');
            ipcRenderer.on('selectedAvatarImageItem', this.nHandleFiles);
            
        },
        nHandleFiles:async function(e, paths) {
            // Select Same File Failed.
            var fileList = paths;
            // console.log("======", fileList)
            if(fileList === null || fileList.length === 0) {
                alert("请选择一个图片文件");
            }
            this.showImageCropper = true;
            this.selectImageSource = fileList[0];
            //await services.common.UpdateUserAvatar(fileList[0]);
            
        },
        stateListArrowClicked(){
            if(this.showStateList){
                this.showStateList = false;
            }
            else{
                this.showStateList = true;
            
                var onlineElement = document.getElementById('online');
                if(onlineElement != undefined) {
                    onlineElement.setAttribute("src", '../../../static/Img/personalCenter/online-20px@2x.png')
                }

                var offlineElement = document.getElementById('offline');
                if(offlineElement != undefined) {
                    offlineElement.setAttribute("src", '../../../static/Img/personalCenter/offline-20px@2x.png')
                }
            }
        },
        stateItemClicked:async function(state, index){
            var temp = this.stateList;
            var checkIndex = 0;
            for(var i = 0; i < this.stateList.length; i ++){
                if(this.stateList[i].check){
                    checkIndex = i;
                    break;
                }
            }
            temp[checkIndex].check = false;
            temp[index].check = true;
            this.stateInput = state.state;
            this.stateList = temp;
            this.showStateList = false;
            if(this.curStateImgElement == undefined) {
                this.curStateImgElement = document.getElementById("personalCenter-stateImg-id");
            }
            var curStateImg = "../../../static/Img/personalCenter/unavailable-20px@2x.png";
            if(this.stateInput == 'online') {
                curStateImg = "../../../static/Img/personalCenter/online-20px@2x.png";
            }
            else if(this.stateInput == 'offline') {
                curStateImg = "../../../static/Img/personalCenter/offline-20px@2x.png";
            }
            else if(this.stateInput == 'unavailable') {
                curStateImg = "../../../static/Img/personalCenter/unavailable-20px@2x.png";
            }
            if(this.curStateImgElement != undefined) {
                this.curStateImgElement.setAttribute('src', curStateImg);
            }
            await this.stateChangeConfirm();
        },
        checkStateInputLength: function(){
            if(this.stateInput.length > 15){
                this.$toastMessage({message:'最多15字符', time:1500, type:'error'});
                this.stateInput = this.stateInput.substring(0, 15);
            }
        },
        checkDescriptionInputLength:function(){
            if(this.workDescriptionInput.length > 30){
                this.$toastMessage({message:'最多30字符', time:1500, type:'error'});
                this.workDescriptionInput = this.workDescriptionInput.substring(0, 30);
            }
        },
        stateChangeConfirm:async function(){
            console.log("the stateinput is ", this.stateInput);
            var response = await global.mxMatrixClientPeg.matrixClient.setPresence(this.stateInput)
                // .then((ret) => {
                //     console.log("ret is ", ret);
                // })
            // var response = await global.mxMatrixClientPeg.matrixClient.getUser(this.userId);
            // var response = await services.common.updateUserStatusDescription(this.stateInput);
            console.log("=========response is ", response)
            if(response){
                this.$toastMessage({message:'状态修改成功', time:1500, type:'success'});
            }else{
                this.$toastMessage({message:'状态修改失败', time:1500, type:'error'});
            }
            console.log("stateChangeConfirm============== ", global.mxMatrixClientPeg.matrixClient.getUser(this.userId));
        },
        workDescriptionChangeConfirm:async function(){
            if(this.workDescriptionInput == this.userInfo.work_description){
                return;
            }
            console.log("the workdescreition is ", this.workDescriptionInput);
            var response = await global.mxMatrixClientPeg.matrixClient._unstable_setStatusMessage(this.workDescriptionInput);
            // var response = await services.common.updateUserWorkDescription(this.workDescriptionInput);
            if(response){
                this.$toastMessage({message:'描述修改成功', time:1500, type:'success'});
            }else{
                this.$toastMessage({message:'描述修改失败', time:1500, type:'error'});
            }
            console.log("workDescriptionChangeConfirm============== ", global.mxMatrixClientPeg.matrixClient.getUser(this.userId));
        },
        isEmpty(obj){
            if(typeof obj == "undefined" || obj == null || obj == ""){
                return true;
            }else{
                return false;
            }
        },
        getUserInfo: async function (uId){
            //console.log("userinfo-tip getuserimg this.userInfo ", this.userInfo);
            if(uId == '') {
                return "";
            }
            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(uId);
            var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url, 40, 40);
            var displayName = profileInfo.displayname;
            // console.log("==========showcurusericon ", avaterUrl == "");
            // if(avaterUrl == "") {
            //     avaterUrl = "../../../static/Img/User/user-40px@2x.png"
            // }
            let userIconElement = document.getElementsByClassName('personalCenter-icon')[0];
            if(avaterUrl != '') {
                userIconElement.setAttribute("src", avaterUrl);
            }

            var userNameElement = document.getElementById("personalCenter-namd-id");
            if(userNameElement != undefined) {
                userNameElement.innerHTML = displayName;
            }

            var userIdElement = document.getElementById("personalCenter-userId-id");
            if(userIdElement != undefined) {
                userIdElement.innerHTML = uId;
            }

        },
        updateSelfImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            if(id != this.userInfo.user_id){
                return;
            }
            var elementImg = document.getElementsByClassName('personalCenter-icon')[0];
            if(elementImg != null){
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
                
            }
        },
    },
    created () {
        var leftPosition = 64;
        var topPosition = 32;
        
        this.userId = global.mxMatrixClientPeg.matrixClient.getUserId();
        this.userInfo = global.mxMatrixClientPeg.matrixClient.getUser(this.userId);
        console.log("this.userinfo is ", this.userInfo);
        this.pagePosition.left = leftPosition.toString() + "px";
        this.pagePosition.top = topPosition.toString() + "px";
        this.stateInput = this.userInfo.presence;        
        this.workDescriptionInput = this.userInfo._unstable_statusMessage;
        var stateArray = ['online', 'offline'];
        var temp = [];
        for(var i = 0; i < stateArray.length; i ++){
            var state = {};
            state.state = stateArray[i];
            
            if(this.userInfo.status_description == stateArray[i]){
                state.check = true;
            }
            temp.push(state);
        }
        this.stateList = temp;
        var _this = this;
        document.addEventListener('click',function(e){
            if(e.target.className.indexOf('personalCenter-stateSelect') == -1){
                _this.showStateList = false;
            }
        });
        this.$nextTick(function(){
            this.getUserInfo(this.userId);
        });
        const ipcRenderer = require('electron').ipcRenderer;
        ipcRenderer.on('updateUserImage', this.updateSelfImage);

    }
}
</script>
<style lang="scss" scoped>
.personalCenter-view {
    height: 134px;
    width: 260px;
    padding: 0px;
    //border: 1px solid rgb(242, 242, 246);
    box-shadow:0px 0px 30px 0px rgba(103,103,103,0.24);
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    position: absolute;
    cursor: default;
    overflow: visible;
}
.personalCenterBaseInfo-view {
    height: 48px;
    width: calc(100% - 40px);
    margin: 0px;
    margin-top: 20px;
    margin-left: 20px;
}
.personalCenter-iconView{
    padding: 0px;
    width: 48px;
    height: 48px;
    display: inline-block;
    margin: 0px;

    .personalCenter-icon {
        width: 48px;
        height: 48px;
        position: absolute;
        border-radius: 4px;
        display: inline-block;
        cursor: pointer;
}
.personalCenter-changeIcon{
    display: none;
    width: 48px;
    height: 48px;
    position: absolute;
    border-radius: 4px;
    z-index: 3;
    background-color: rgba(0,0,0,0.4);;
    .personalCenter-cameraIcon{
        width: 24px;
        height: 24px;
        position: absolute;
        left: 12px;
        top: 12px;
    }
}
}

.personalCenter-iconView:hover{
    .personalCenter-changeIcon{
        display: inline-block;
    }

}
.personalCenter-baseInfo {
    display: inline-block;
    height: 48px;
    width: 100px;
    vertical-align: top;
    margin-left: 12px;

    .personalCenter-userId {
        height: 18px;
        margin: 0px;

        width: 140%;
        text-align: left;
        font-size: 12px;
        font-weight:400;
        color:#999999;
        line-height:18px;
        margin-top: 2px;
        font-family: PingFangSC-Regular;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
    
}
.personalCenter-name {
    height: 22px;
    margin: 0px;

    width: 100%;
    text-align: left;
    font-size: 16px;
    font-weight:500;
    color:rgba(0,0,0,1);
    line-height:22px;
    letter-spacing:2px;
    margin-top: 2px;
    font-family: PingFangSC-Medium;
}

.personalCenter-state{
    margin-top: 8px;
    margin-left: 20px;
    height: 22px;
    width: calc(100% - 40px);
    border: 0px;
    background:rgba(255,255,255,1);

    .personalCenter-stateInput{
        display: inline-block;
        position: absolute;
        //text-indent: 4px;
        width: 42px;
        padding: 0;
        margin: 0px;
        height: 18px;
        outline:none;
        border: 0px;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        margin-top: 2px;
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color: rgb(153, 153, 153);
        line-height:18px;
        letter-spacing:1px;
    }
    .personalCenter-stateSelectArrow{
        width: 20px;
        height: 20px;
        padding: 0px;
        margin-left: 42px;
    }
    .personalCenter-stateImg {
        width: 20px;
        height: 20px;
        padding: 0px;
        margin: 0px;
    }
}

.personalCenter-stateSelectListView{
    position: absolute;
    left: 23px;
    top: 101px;
    width:130px;
    height:66px;
    background:rgba(255,255,255,1);
    box-shadow:0px 0px 12px 0px rgba(103,103,103,0.14);
    border-radius:4px;
    border:1px solid rgba(221,221,221,1);
    padding: 0px;
    z-index: 3;
    .personalCenter-stateSelectList{
        width: 100%;
        height: 100%;
        padding: 0px;
        margin: 0px;
        //padding-left: 12px;
        list-style: none;
        .personalCenter-stateSelect:hover{
            background:rgba(243,244,247,1);
        }   

        .personalCenter-stateSelect{
            width: 100%;
            height: 32px;
            vertical-align: top;
            .personalCenter-stateSelectTitle{
                margin-left: 0px;
                width: 40px;
                padding: 0px;
                margin-top: 7px;
                margin-bottom: 7px;
                font-size:12px;
                font-weight:400;
                color:rgba(51,51,51,1);
                line-height:18px;
                letter-spacing:1px;
                display: inline-block;
                font-family: PingFangSC-Regular;
                vertical-align: top;
            }
            .personalCenter-stateSelectCheck{
                width: 20px;
                height: 20px;
                margin-top: 6px;
                margin-left: 4px;
                vertical-align: top;
                display: inline-block;
            }
            .personalCenter-stateImg {
                width: 20px;
                height: 20px;
                padding: 0px;
                margin: 6px 6px 6px 6px;
            }
        }
    }
}
.personalCenter-workDescription{
    width: calc(100% - 40px);
    height: 20px;
    margin-left: 20px;
    border: none;
    margin-top: 8px;
    .personalCenter-descriptionIcon{
        width: 20px;
        height: 20px;
        display: inline-block;
        margin-left: 0px;
    }
    .personalCenter-descriptionInput{
            display: inline-block;
            position: absolute;
            text-indent: 4px;
            width: 200px;
            padding: 0px;
            margin: 0px;
            height: 18px;
            outline:none;
            border: 0px;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            border: none;
            background-color: rgba(1, 1, 1, 0);

            font-weight:400;
            color: rgb(153, 153, 153);
            line-height:18px;
            letter-spacing:1px;
    }
}
.personalCenter-workDescription:hover{
    .personalCenter-descriptionInput{
            color: black;

    }
}


</style>