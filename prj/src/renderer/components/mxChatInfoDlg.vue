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
                    placeholder="请输入群名称" 
                    class="title-input"
                    maxlength="24"
                    v-model="roomName"
                />
                <div class="filed-title">群描述</div>
                <textarea 
                    placeholder="请输入群描述" 
                    class="desc-text"
                    maxlength="100"
                    v-model="roomTopic"
                ></textarea>
                <div class="submit-field">
                    <div class="button button-close" @click.stop="close">取消</div>
                    <div :class="{button:true, buttonConfirm:!loading, buttonConfirmLoading:loading}" @click.stop="updateInfo">确定</div>
                </div>
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
    name: 'mxChatInfoDlg',
    data () {
        return {
            roomName:'',
            roomTopic:'',
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
            const roomId = this.roomId;
            const name = this.roomName;
            const topic = this.roomTopic;
            const client = window.mxMatrixClientPeg.matrixClient;
            let promises = [];
            let namePromise = client.setRoomName(this.roomId, name).catch((e)=>{console.error('群名称设置失败',e); vtx.loading = false;});
            let topicPromise = client.setRoomTopic(this.roomId, topic).catch((e)=>{console.error('群描述设置失败',e); vtx.loading = false;});
            promises = [namePromise, topicPromise];
            Promise.all(promises).then(()=>{
                vtx.loading = false;
                vtx.$emit('close', 'close')
            })

        }
    },
    components: {
    },
    created: function () {
        const roomId = this.roomId;
        const vtx = this;
        const room = window.mxMatrixClientPeg.matrixClient.getRoom(roomId);
        const topicEvent = room.currentState.getStateEvents("m.room.topic", "");
        const topic = topicEvent && topicEvent.getContent() ? topicEvent.getContent()['topic'] : '';
        const nameEvent = room.currentState.getStateEvents('m.room.name', '');
        const name = nameEvent && nameEvent.getContent() ? nameEvent.getContent()['name'] : '';
        this.roomName = name;
        this.roomTopic = topic;
        
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
        height: 342px;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
        .title {
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
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
            height: 32px;
            width: 360px;
            box-sizing: border-box;
            border: 1px solid #DDDDDD;
            outline: none;
            border-radius: 4px;
            margin-left: 40px;
            margin-bottom: 20px;
            margin-top: 8px;
            padding-left: 10px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000000;

        }
        .desc-text {
            box-sizing: border-box;
            outline: none;
            width: 360px;
            height: 80px;
            background: #FFFFFF;
            border-radius: 4px;
            border: 1px solid #DDDDDD;
            margin-left: 40px;
            margin-top: 8px;
            margin-bottom: 30px;
            resize: none;
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
                font-family: PingFangSC-Medium, PingFang SC;
                font-weight: 500;
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