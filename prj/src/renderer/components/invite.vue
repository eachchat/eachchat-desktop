<template>
    <div class="Invite">
        <div class="InviteContent" id="InviteContentId">
            <div class="InviteTitle">{{$t("inviteTitle")}}</div>
            <div class="InviterImageDiv">
                <img class="InviterImage" id="InviterImageId" src="../../../static/Img/User/user-40px@2x.png">
            </div>
            <div class="InviterInfo" id="InviterInfoId"></div>
            <button class="InviteConfirmButton" @click="Confirm()">{{$t("confirm")}}</button>
            <button class="InviteCancleButton" @click="Close()">{{$t("cancel")}}</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Invite',
    props: {
        inviter: {
            type: Object,
            default: undefined
        }
    },
    watch: {
        inviter: async function() {
            if(this.inviter == undefined) return;
            console.log("=============this inviter is ",this.inviter);
            if(this.imgElement == undefined) {
                this.imgElement = document.getElementById("InviterImageId");
            }
            if(this.inviterInfoElement == undefined) {
                this.inviterInfoElement = document.getElementById("InviterInfoId");
            }
            this.inviterInfoElement.innerHTML = this.inviter.name + '(' + this.inviter.userId + ')';
            
            var userUrl = await this.inviter.getAvatarUrl(global.mxMatrixClientPeg.matrixClient.getHomeserverUrl(), null, null, undefined, false, false);
            console.log("=========this.inviter url is ", userUrl);
            if(userUrl != '' && userUrl != null && userUrl != undefined) {
                this.imgElement.setAttribute("src", userUrl);
            }
        }
    },
    date() {
        return {
            imgElement: undefined,
            inviterInfoElement: undefined,
        }
    },
    methods: {
        Confirm() {
            this.$emit("joinRoom");
        },
        Close() {
            this.$emit("rejectRoom");
        }
    }
}
</script>

<style lang="scss" scoped>
    .Invite {
        width: 100%;
        height: 100%;
        position: relative;
    }

    .InviteContent {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 20px 20px 20px 20px;
        width: 300px;
        height: 200px;
        background: #dddddd;
        text-align: center;
    }

    .InviteTitle {
        width: 100%;
    }

    .InviterImageDiv {
        width: 100%
    }

    .InviterImage {
        width: 40px;
        height: 40px;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .InviterInfo {
        width: 100%;
        font-family: PingFangSC-Regular;
        text-overflow: ellipsis;
        letter-spacing: 0px;
        font-weight: 400;
        font-size: 13px;
        color: #999999;
        margin-top: 10px;
        margin-bottom: 40px;
    }

    .InviteConfirmButton {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: rgba(36, 179, 107, 1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
        border:none;
    }
 
    .InviteConfirmButton:hover {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: white;
        border-radius:4px;
        background: rgba(36, 179, 107, 1);
        font-family: PingFangSC-Regular;
        border:none;
    }

    .InviteCancleButton {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }
</style>