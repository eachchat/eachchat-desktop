<template>
    <div class="mx-setting-dialog">
        <div class="inner-wrap">
            <div class="title">编辑群信息</div>
            <div class="close" @click.stop="close">x</div>
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
                <div class="button">确定</div>
                <div class="button" @click.stop="close">取消</div>
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
            roomTopic:''
        }
    },
    props: ['roomId'],
    puborprtTimer: null,
    methods: {
        close: function() {
            this.$emit('close', 'close')
        },
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
    .mx-setting-dialog {
        position: fixed;
        left: 50%;
        top: 20px;
        margin-left: -200px;
        background-color: #f2f2f2;
        padding: 26px;
        border-radius: 16px;
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
            }
            .close {
                position: absolute;
                top: 26px;
                right: 26px;
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
                }
                .desc-text {
                    height: 120px;
                    width: 100%;
                    box-sizing: border-box;
                    resize: none;
                }
                .input-tip {
                    color:rgb(118, 118, 118);
                    font-size: 14px;
                }
            }
            .submit-field {
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                .button {
                    width: 100px;
                    height: 28px;
                    box-sizing: border-box;
                    border: .5px solid #000;
                    background-color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    margin-left: 28px;
                    border-radius: 4px;
                }
            }
        }
    }
</style>