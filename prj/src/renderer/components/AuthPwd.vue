<template>
    <div class="AuthPwdBG">
        <div class="AuthPwdDlg">
            <div class="AuthPwdHeader">
                <p class="AuthPwdTitle">{{cutTitle}}</p>
                <i class="el-icon-close" @click="Close()"></i>
            </div>
            <div class="AuthPwdContentPageBind">
                <label class="toSetAddressLabel1">{{toSetPwdLabel1}}</label>
                <label class="toSetAddressLabel2">{{toSetPwdLabel2}}</label>
                <input type="password" v-model="password" class="toSetAddressInput"/>
            </div>
            <div class="AuthPwdFotter">
                <button class="AuthPwdCancleButton" @click="Close()">{{$t("cancel")}}</button>
                <button class="AuthPwdConfirmButton" @click="Confirm()">提交</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AuthPwd',
    props: {
        clearPwd: {
            type: Number,
            default: 0
        }
    },
    watch: {
        clearPwd: function() {
            this.password = "";
        }
    },
    data () {
        return {
            password: '',
            toSetPwdLabel1: '移除会话操作需要额外的身份认证。',
            toSetPwdLabel2: '请输入您的登录密码',
            cutTitle: '身份认证',
        }
    },
    methods: {
        Close: function() {
            this.password = "";
            this.$emit("closeAuthDlg");
        },
        Confirm: async function() {
            this.$emit('canDeleteSession', this.password);
        },
    }
}
</script>

<style lang="scss" scoped>
    .AuthPwdBG {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .AuthPwdDlg{
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        width: 440px;
        height: 236px;
        background: #FFFFFF;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
    }
    
    .AuthPwdHeader {
        width: 100%;
        height: 56px;
    }

    .AuthPwdTitle {
        display: inline-block;
        width: 142px;
        height: 22px;
        font-family: PingFangSC-Medium;
        font-size: 16px;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
        letter-spacing: 0px;
        float: left;
        margin: 18px 0px 18px 32px;
    }

    .el-icon-close {
        display: inline-block;
        padding: 18px 20px 18px 18px;
        float: right;
    }

    .AuthPwdContentPageBind {
        width: 360px;
        height: 125px;
        background: #FFFFFF;
        border: 0px solid rgba(221,221,221,1);
        border-radius: 4px;
        list-style: none;
        margin-left: 40px;
        padding-left: 0px;
    }

    .toSetAddressLabel1 {
        width: 92%;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        font-family: PingFangSC-Regular;
        color: #333333;
        line-height: 20px;
        letter-spacing: 0px;
        float: left;
        margin: 0px 14px 4px 0px;
    }

    .toSetAddressLabel2 {
        width: 92%;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        font-family: PingFangSC-Regular;
        color: #333333;
        line-height: 20px;
        letter-spacing: 0px;
        float: left;
        margin: 0px 14px 4px 0px;
    }

    .toSetAddressLabelState {
        width: calc(100% - 28px);
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 0px;
        float: left;
        margin: 14px 14px 5px 14px;
    }

    .toSetAddressInput {
        width: 360px;
        height: 32px;
        background: #FFFFFF;
        color: rgba(153, 153, 153, 1);
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin: 5px 13px 0px 0px;
        padding-left: 8px;
    }

    .AuthPwdFotter {
        width: 100%;
        height: 40px;
        text-align: center;
    }

    .AuthPwdConfirmButton {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: rgba(36, 179, 107, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
    }
 
    .AuthPwdConfirmButton:hover {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: white;
        border-radius:4px;
        background: rgba(36, 179, 107, 1);
    }

    .AuthPwdConfirmButton:disabled {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: white;
        border-radius:4px;
        background: rgba(167, 224, 196, 1);
    }

    .AuthPwdCancleButton {
        display: inline-block;
        width: 100px;
        height: 32px;
        top: 20px;
        margin: auto;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
    }
</style>
