<template>
    <div class="ownerInfoBG">
        <div class="ownerInfoDlg">
            <div class="ownerInfoHead">
                <p class="ownerInfoTitle">我的信息</p>
                <i class="el-icon-close" @click="Close()"></i>
            </div>
            <div class="ownerInfoTipLabel">个人信息</div>
            <div class="ownerInfoBaseBox">
                <div class="ownerInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">头像</label>
                    <img class="ownerInfoImage" id="ownerInfoImageId" src="../../../static/Img/User/user-40px@2x.png"/>
                    <label class="ownerInfoImageChange" @click="changeIconClicked">点击上传</label>
                </div>
                <div class="ownerDisplayInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">昵称</label>
                    <label class="ownerDisplayInfoBaseLabel2" contenteditable="true" spellcheck="false" id="ownerInfoDisplayNameId" @keydown="changeDisplayName($event)">{{ownerDisplayName}}</label>
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
                <div class="ownerInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">手机</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgPhoneId">{{ownerPhone}}</label>
                </div>
                <div class="ownerInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">座机</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgCallId">{{ownerCall}}</label>
                </div>
                <div class="ownerInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">邮箱</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgMailId">{{ownerMail}}</label>
                </div>
                <div class="ownerInfoBaseDiv">
                    <label class="ownerInfoBaseLabel">部门</label>
                    <label class="ownerInfoBaseLabel2" id="ownerInfoOrgDepartId">{{ownerDepartment}}</label>
                </div>
                <div class="ownerInfoBaseDiv">
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
            console.log("*** updateOwnerInfo ");
            let ownerInfo = global.mxMatrixClientPeg.matrixClient.getUser(global.mxMatrixClientPeg.matrixClient.getUserId());
            console.log("*** ownerInfo is ", ownerInfo);

            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(ownerInfo.userId);
            if(!profileInfo)
                return;
            var distImgElement = document.getElementById("ownerInfoImageId");
            var avatarTUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
            if(distImgElement && avatarTUrl) {
                distImgElement.src = avatarTUrl;
            }
            let department = await Department.GetDepartmentInfoByMatrixID(ownerInfo.userId);
            console.log("*** department ", department);

            var email = await UserInfo.GetUserEmailByUserID(ownerInfo.userId);
            console.log("*** email ", email);
            if(email && email.length == 0) {
                try{
                    global.mxMatrixClientPeg.matrixClient.getThreePids()
                        .then((ret) => {
                            console.log("threepdis is ", ret);
                            var threePids = ret.threepids;
                            var emainObj = threePids.filter((a) => a.medium === 'email');
                            var phoneObj = threePids.filter((a) => a.medium === 'msisdn');
                            console.log("e,ainmlson ", emainObj)
                            this.ownerMail = emainObj.length == 0 ? '--' : emainObj[0].address;
                            this.ownerPhone = phoneObj.length == 0 ? "--" : phoneObj[0].address;
                        })
                }
                catch(error) {
                    console.log("get threed pids exception ", error)
                }
            }
            //get phone
            var phone = await UserInfo.GetUserPhoneByUserID(ownerInfo.userId);
            console.log("*** phone ", phone);

            var user = await UserInfo.GetUserInfoByMatrixID(ownerInfo.userId);
            this.ownerId = ownerInfo.userId;
            this.ownerAccount = await ComponentUtil.GetDisplayName("", ownerInfo.userId);
            this.ownerDisplayName = await ComponentUtil.GetDisplayNameByMatrixID(ownerInfo.userId);
            this.ownerPosition = user.user_title;
            this.ownerDepartment = department.display_name;
            console.log("*** ownerPosition ", user);
        }
    },
    data() {
        return {
            ownerPhone: '--',
            ownerPosition: '--',
            ownerDepartment: '--',
            ownerMail: '--',
            ownerCall: '--',
            ownerId: '',
            ownerAccount: '',
            ownerDisplayName: '',
        }
    },
    methods: {
        Close () {
            this.$emit("CloseownerInfo");
        },
        changeDisplayName(e) {
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
        height: 490px;
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
        letter-spacing: 2px;
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
        letter-spacing: 2px;
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
            width: 60px;
            height: 40px;
            color: rgba(0, 0, 0, 1);
            font-size: 14px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
            line-height: 40px;
            vertical-align: top;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin: 0 0 0 20px;
        }

        .ownerInfoEditIcon {
            width: 20px;
            height: 20px;
            margin: 10px 0 10px 0;
            display: none;
        }
    }

    .ownerDisplayInfoBaseDiv:hover {
        width: 100%;
        height: 40px;

        .ownerDisplayInfoBaseLabel2 {
            width: 60px;
            height: 40px;
            color: rgba(0, 0, 0, 1);
            font-size: 14px;
            font-family: PingFangSC-Regular;
            font-weight: 400;
            line-height: 40px;
            vertical-align: top;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin: 0 0 0 20px;
            border: 0px solid rgba(153, 153, 153, 1);
        }

        .ownerInfoEditIcon {
            width: 20px;
            height: 20px;
            margin: 10px 0 10px 0;
            display: inline-block;
        }
    }

</style>