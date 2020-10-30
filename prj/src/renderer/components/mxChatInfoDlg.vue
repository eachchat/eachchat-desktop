<template>
    <div class="mx-setting-dialog">
        <div class="inner-wrap">
            <div class="title">编辑群信息</div>
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
            joinRule: '',
            guestAccess: '',
            history: '',
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
        const state = window.mxMatrixClientPeg.matrixClient.getRoom(roomId).currentState;
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
            }
        }
    }
</style>