<template>
    <div class="ownerInfoBG">
        <div class="ownerInfoDlg" id = "ownerDlg">
            <div class="ownerInfoHead">
                <p class="ownerInfoTitle">我的信息</p>
                <i class="el-icon-close" @click="Close()"></i>
            </div>
            <div class="ownerInfoTipLabel">个人信息</div>
            <div class="ownerInfoBaseBox">
                <div class="ownerInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">头像</label>
                    <div style="position:relative;">
                        <img class="ownerInfoImage" id="ownerInfoImageId" src="../../../static/Img/User/user-40px@2x.png"/>
                        <img ondragstart="return false" class="personalCenter-cameraIcon" src="../../../static/Img/personalCenter/changeAvatar.png" @click="changeIconClicked">
                    </div>
                </div>
                <div class="ownerDisplayInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">昵称</label>
                    <input required type = 'text' class="ownerDisplayInfoBaseLabel2" id="ownerInfoDisplayNameId" v-model = "ownerDisplayName" maxLength = 32
                    placeholder="请输入昵称" @change="displayNameChange()">
                    <img class="ownerInfoEditIcon" src="../../../static/Img/Setup/edit20px@2x.png"/>
                </div>
                <div class="ownerInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">用户名</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoAccountId">{{ownerAccount}}</label>
                </div>
                <div class="ownerInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">Matrix ID</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOwnerIdId">{{ownerId}}</label>
                </div>
            </div>
            <div class="ownerInfoTipLabel">工作信息</div>
            <div class="ownerInfoOrgBox">
                <div class="ownerInfoBaseDiv" v-show = "ownerPhone && ownerPhone.length != 0">
                    <label class="ownerInfoBaseLabel">手机</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgPhoneId">{{ownerPhone}}</label>
                </div>
                <div class="ownerInfoBaseDiv" v-show = "ownerCall && ownerCall.length != 0">
                    <label class="ownerInfoBaseLabel">座机</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgCallId">{{ownerCall}}</label>
                </div>
                <div class="ownerInfoBaseDiv" v-show = 'ownerMail && ownerMail.length != 0'>
                    <label class="ownerInfoBaseLabel">邮箱</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgMailId">{{ownerMail}}</label>
                </div>
                <div class="ownerInfoBaseDiv" v-show = 'ownerDepartment && ownerDepartment.length != 0'>
                    <label class="ownerInfoBaseLabel">部门</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgDepartId">{{ownerDepartment}}</label>
                </div>
                <div class="ownerInfoBaseDiv" v-show = 'ownerPosition && ownerPosition.length != 0'>
                    <label class="ownerInfoBaseLabel">职位</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgPositionId">{{ownerPosition}}</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {ComponentUtil} from '../script/component-util';
import { Department, UserInfo, Contact } from '../../packages/data/sqliteutil.js'
import * as utils from '../../packages/core/Utils.js'
export default {
    name: "ownerInfo",
    props: {
        updateOwnerInfo: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        updateOwnerInfo: async function() {
            this.ownerId = global.mxMatrixClientPeg.matrixClient.getUserId();
            let ownerInfo = global.mxMatrixClientPeg.matrixClient.getUser(this.ownerId);
            this.ownerAccount = await ComponentUtil.GetDisplayName("", ownerInfo.userId);
            this.ownerDisplayName = ownerInfo.displayName;
            var distImgElement = document.getElementById("ownerInfoImageId");
            var avatarTUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(ownerInfo.avatarUrl);
            if(distImgElement && avatarTUrl) {
                distImgElement.src = avatarTUrl;
            }
            let user = await ComponentUtil.ShowOrgInfoByMatrixID(this.ownerId)
            this.ownerPhone = user.phone.mobile;

            let height = 290;
            if(this.ownerPhone && this.ownerPhone.length != 0)  height += 40;

            this.ownerCall = user.phone.telephone;
            if(this.ownerCall && this.ownerCall.length != 0)  height += 40;

            if(user.email && user.email.length != 0)
                this.ownerMail = user.email[0].email_value;
            if(this.ownerMail && this.ownerMail.length != 0)  height += 40;

            this.ownerPosition = user.title;
            if(this.ownerPosition && this.ownerPosition.length != 0)  height += 40;

            this.ownerDepartment = user.department.display_name;
            if(this.ownerDepartment && this.ownerDepartment.length != 0)  height += 40;

            
            height += 'px'
            let windowElement = document.getElementById('ownerDlg');
            windowElement.style.height = height;
            console.log("*** ownerPosition ", user);
        }
    },
    data() {
        return {
            ownerPhone: '',
            ownerPosition: '',
            ownerDepartment: '',
            ownerMail: '',
            ownerCall: '',
            ownerId: '',
            ownerAccount: '',
            ownerDisplayName: '',
        }
    },
    methods: {
        autoSetInputWidth(){
            let inputElement = document.getElementById('ownerInfoDisplayNameId');
            inputElement.style.width = height;
            console.log("*** ownerPosition ", user);

            console.log(this.ownerDisplayName)
        },

        displayNameChange(){
            if(this.ownerDisplayName.length == 0) return;
            global.mxMatrixClientPeg.matrixClient.setDisplayName(this.ownerDisplayName);
        },

        Close () {
            this.$emit("CloseownerInfo");
        },

        changeDisplayName(event) {
            console.log(event)
            if(event.keyCode == 13) {
                var distElement = document.getElementById('ownerInfoDisplayNameId');
                var newName = distElement.innerHTML;
                global.mxMatrixClientPeg.matrixClient.setDisplayName(newName)
                .then((ret) => {
                    console.log("*** setdisplayname ");
                    distElement.blur();
                })
                .catch((e) => {
                    console.log("Error setting own display name", e);
                    throw new Error(_t("Failed to set display name"));
                });
                e.preventDefault();
                return false;
            }
        },
        changeIconClicked(){
            const ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.send('open-image-dialog-avatar', 'openFile');
            ipcRenderer.on('selectedAvatarImageItem', this.nHandleFiles);
        },
        nHandleFiles:async function(e, paths) {
            // Select Same File Failed.
            var fileList = paths;
            // console.log("======", fileList)
            if(fileList.filePaths.length === 0) {
                alert("请选择一个图片文件");
            }
            //this.showImageCropper = true;
            this.selectImageSource = fileList.filePaths[0];
            var showfu = new utils.FileUtil(this.selectImageSource);
            var stream = showfu.ReadfileSync(this.selectImageSource);
            let uploadFile = showfu.GetUploadfileobj();
            let matrixClient = global.mxMatrixClientPeg.matrixClient;
            const httpPromise = matrixClient.uploadContent(uploadFile).then((url)=> {
                    var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(url);
                    let userIconElement = document.getElementById('ownerInfoImageId');
                    if(avaterUrl != '') {
                        userIconElement.setAttribute("src", avaterUrl);
                    }
                    matrixClient.setAvatarUrl(url);
                    var elementImg = document.getElementById("userHead");
                    elementImg.setAttribute("src", avaterUrl);

                    elementImg = document.getElementsByClassName('personalCenter-icon')[0];
                    if(elementImg)
                        elementImg.setAttribute("src", avaterUrl);
            });       
        },

    }
}
</script>

<style lang="scss" scoped>
    .ownerInfoBG {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .ownerInfoDlg {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 0px 20px 20px 20px;
        width: 440px;
        height: 290px;
        background: #FFFFFF;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
    }

    .ownerInfoHead {
        width: 94%;
        height: 56px;
        margin-left: 12px;
    }

    .ownerInfoTitle {
        display: inline-block;
        width: 72px;
        height: 22px;
        font-size: 16px;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
        letter-spacing: 0px;
        float: left;
        margin: 18px 0px 18px 0px;
    }

    .el-icon-close {
        display: inline-block;
        padding: 18px 0px 18px 18px;
        float: right;
    }

    .ownerInfoTipLabel {
        display: block;
        width: 100%;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: #000000;
        line-height: 20px;
        letter-spacing: 0px;
        margin: 12px;
        text-align: left;
    }

    .ownerInfoBaseBox {
        display: block;
        width: 100%;
        height: 155px;
    }

    .ownerInfoBaseDiv {
        width: 100%;
        height: 40px;
    }

    .ownerInfoBaseLabel {
        width: 60px;
        height: 40px;
        color: rgba(187, 187, 187, 1);
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 500;
        line-height: 40px;
        text-align: right;
        float: left;
        margin: 0 22px 0 15px;
        vertical-align: top;
        display: inline-block;
    }

    .ownerInfoImage {
        width: 40px;
        height: 40px;
        border-radius: 50px;
        display: inline-block;
        margin: 0 14px 0 20px;
        z-index: 1;
        position:absolute; 
    }
    .personalCenter-cameraIcon{
        position: absolute;
        margin-left: 45px;
        margin-top: 20px;
        z-index: 2;
    }

    .ownerInfoImageChange {
        width: 56px;
        height: 40px;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        line-height: 40px;
        color:rgba(0, 169, 113, 1);
        vertical-align: top;
        display: inline-block;
    }

    .ownerInfoBaseLabel2 {
        width: 40px;
        height: 40px;
        color: rgba(0, 0, 0, 1);
        font-size: 14px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        line-height: 40px;
        vertical-align: top;
        margin: 0 34px 0 20px;
    }

    .ownerDisplayInfoBaseDiv {
        width: 100%;
        height: 40px;

        .ownerDisplayInfoBaseLabel2 {
            width: 100px;
            height: 20px;
            color: rgba(0, 0, 0, 1);
            font-size: 14px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
            line-height: 20px;
            vertical-align: top;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin: 10px 0 0 20px;
            border: 0;
        }

        .ownerInfoEditIcon {
            width: 20px;
            height: 20px;
            margin: 10px 0 10px 0;
        }
    }

</style>