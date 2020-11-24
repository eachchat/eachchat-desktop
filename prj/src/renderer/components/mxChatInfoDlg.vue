<template>
    <div class="wrap-layer" @click.self.stop="close">
        <div class="mx-setting-dialog">
            <div class="inner-wrap">
                <div class="title">
                    <span>编辑群资料</span>
                    <img class="close" @click.stop="close" src="../../../static/Img/Main/xincaca.png">
                </div>
                <div class="setting-field">
                    <div class="filed-title">群名称</div>
                    <input 
                        type="text" 
                        placeholder="请输入群名称" 
                        class="title-input"
                        maxlength="24"
                        v-model="roomName"
                    />
                    <div class="input-tip">*限制24个字符</div>
                </div>
                <div class="setting-field">
                    <div class="filed-title">群名称</div>
                    <textarea 
                        placeholder="请输入群描述" 
                        class="desc-text"
                        maxlength="100"
                        v-model="roomTopic"
                    ></textarea>
                    <div class="input-tip">*限制100个字符</div>
                </div>
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
        top: 20px;
        margin-left: -200px;
        background-color: #fff;
        padding: 24px;
        border-radius: 4px;
        width: 400px;
        height: 400px;
        z-index: 99999;
        .inner-wrap {
            height: 100%;
            overflow-y: scroll;
            .title {
                font-size: 16px;
                font-weight: bolder;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .close {
                height: 20px;
                width: 20px;
            }
            .setting-field {
                margin-bottom: 20px;
                font-size: 12px;
                .filed-title {
                    font-size: 16px;
                    margin-bottom: 12px;
                }
                .title-input {
                    height: 40px;
                    width: 100%;
                    box-sizing: border-box;
                    border: 1px solid #DDDDDD;
                    outline: none;
                    border-radius: 4px;
                }
                .desc-text {
                    height: 120px;
                    width: 100%;
                    box-sizing: border-box;
                    resize: none;
                    border: 1px solid #DDDDDD;
                    outline: none;
                    border-radius: 4px;
                }
                .input-tip {
                    color:rgb(118, 118, 118);
                    font-size: 14px;
                }
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
    }
</style>