<template>
    <div class="wrap-layer" @click.self.stop="close">
        <div class="mx-setting-dialog">
            <div class="inner-wrap">
                <div class="title">
                    <span class="titlespan">修改群聊信息</span>
                    <img class="close" @click.stop="close" src="../../../static/Img/Main/xincaca.png">
                </div>
                <div class="filed-title">群聊名称</div>
                <input 
                    type="text" 
                    @contextmenu.prevent="openMenu"
                    placeholder="请输入群名称" 
                    class="title-input"
                    maxlength="24"
                    v-model="roomName"
                />
                <div class="submit-field">
                    <div class="button button-close" @click.stop="close">取消</div>
                    <div :class="{button:true, buttonConfirm:!loading, buttonConfirmLoading:loading}" @click.stop="updateInfo">确定</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { openBaseMenu } from '../../utils/commonFuncs'
export default {
    name: 'mxChatInfoDlg',
    data () {
        return {
            roomName:'',
            loading: false
        }
    },
    props: ['roomId'],
    puborprtTimer: null,
    methods: {
        close: function() {
            this.$emit('close', 'close')
        },
        updateInfo() {
            if (this.loading) return;
            this.loading = true;
            const vtx = this;
            const name = this.roomName;
            const client = window.mxMatrixClientPeg.matrixClient;
            let namePromise = client.setRoomName(this.roomId, name).catch((e)=>{console.error('群名称设置失败',e); vtx.loading = false;});
            namePromise.then(()=>{
                vtx.loading = false;
                vtx.$emit('close', 'close')
            })
        },
        openMenu:() => {
            openBaseMenu()
        }
    },
    components: {
    },
    created: function () {
        const roomId = this.roomId;
        const room = window.mxMatrixClientPeg.matrixClient.getRoom(roomId);
        const nameEvent = room.currentState.getStateEvents('m.room.name', '');
        const name = nameEvent && nameEvent.getContent() ? nameEvent.getContent()['name'] : '';
        this.roomName = name;
        
    },
    mounted: function() {
    },
    watch: {}
}
</script>

<style lang="scss" scoped>
    ::-webkit-input-placeholder {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
    }
    .wrap-layer {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }
    .mx-setting-dialog {
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -200px;
        margin-top: -171px;
        background-color: #fff;
        z-index: 99999;
        width: 440px;
        height: 204px;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
        .title {
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-left: 32px;
            padding-right: 20px;
        }
        .titlespan {
            height: 22px;
            font-size: 16px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #000000;
            line-height: 22px;
        }
        .close {
            height: 20px;
            width: 20px;
        }
        .filed-title {
            height: 20px;
            font-size: 13px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #666666;
            line-height: 20px;
            margin-left: 40px;

        }
        .title-input {
            height: 36px;
            width: 360px;
            box-sizing: border-box;
            border: 1px solid #DDDDDD;
            outline: none;
            border-radius: 4px;
            margin-left: 40px;
            margin-bottom: 24px;
            margin-top: 8px;
            padding-left: 10px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000000;

        }
        .input-tip {
            color:rgb(118, 118, 118);
            font-size: 14px;
        }
        .submit-field {
            display: flex;
            justify-content: center;
            align-items: center;
            .button {
                width: 100px;
                height: 32px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                border-radius: 4px;
                font-family: PingFangSC-Regular;
                font-weight: 400;
                line-height: 20px;
            }
            .button-close {
                border: 1px solid #DDD;
                background-color: #fff;
                color: #000;
            }
            .buttonConfirmLoading {
                margin-left: 20px;
                border: 1px solid #A7E0C4;
                background-color: #A7E0C4;
                color: #fff;
            }
            .buttonConfirm {
                margin-left: 20px;
                border: 1px solid #24B36B;
                background-color: #24B36B;
                color: #fff;
            }
        }

    }
</style>