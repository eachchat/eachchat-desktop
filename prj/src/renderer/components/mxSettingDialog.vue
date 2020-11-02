<template>
    <div class="mx-setting-dialog">
        <div class="inner-wrap">
            <div class="title">群聊设置</div>
            <div class="close" @click.stop="close">x</div>
            <div class="setting-field">
                <div class="filed-title">群聊类型</div>
                <div><input @change="setJoinRule" id="puborprt0" type="radio" value="public" v-model="joinRule"><label for="puborprt0"  >公共群聊-任何人可以加入</label></div>
                <div><input @change="setJoinRule" id="puborprt1" type="radio" value="invite" v-model="joinRule"><label for="puborprt1"  >私人群聊-受邀请才能加入</label></div>
            </div>
            <div class="setting-field">
                <div class="filed-title">设置群聊地址</div>
                <div>任何服务器上的任何人都可以使用发布的群聊地址加入您的聊天室。如果要发布群聊地址，需要先设置为群聊地址。</div>
                <div><input type="text" ></div>
            </div>
            <div class="setting-field">
                <div class="filed-title">谁可以查看聊天历史？</div>
                <div>对谁可以阅读历史记录的更改仅适用于此群聊中将来的消息。现有聊天历史的可见性将保持不变。</div>
                <div><input @change="setHistory" type="radio" id="histcheck0" value="invited" v-model="history"><label for="histcheck0">只有群成员(从群成员被邀请时 )</label></div>
                <div><input @change="setHistory" type="radio" id="histcheck1" value="joined" v-model="history"><label for="histcheck1">只有群成员(从群成员加入群聊时 )</label></div>
                <div><input @change="setHistory" type="radio" id="histcheck2" value="shared" v-model="history"><label for="histcheck2">只有群成员（从此选项被选中的那一时刻)</label></div>
            </div>
            <div class="setting-field">
                <div class="filed-title">谁可以加入此群聊</div>
                <div><input @change="setGuestAccess" type="radio" id="whocanjoin0" value="forbidden" v-model="guestAccess"><label for="whocanjoin0">任何知道群聊链接的人，不包括用户所在域外的来宾用户</label></div>
                <div><input @change="setGuestAccess" type="radio" id="whocanjoin1" value="can_join" v-model="guestAccess"><label for="whocanjoin1">任何知道群聊链接的人，包括用户所在域外的来宾用户</label></div>
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
    name: 'mxSettingDialog',
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
        setJoinRule: function(e) {
            const joinRule = e.target.value;
            console.log('joinRule', joinRule)
            const roomId = this.roomId;
            window.mxMatrixClientPeg.matrixClient.sendStateEvent(roomId, "m.room.join_rules", {join_rule: joinRule}, "").catch((e) => {
                console.error(e);
            });
        },
        setGuestAccess: function(e) {
            const guestAccess = e.target.value;
            console.log('guestAccess', guestAccess)
            const roomId = this.roomId;
            window.mxMatrixClientPeg.matrixClient.sendStateEvent(roomId, "m.room.guest_access", {guest_access: guestAccess}, "").catch((e) => {
                console.error(e);
            });
        },
        setHistory: function(e) {
            const history = e.target.value;
            console.log('guestAccess', history)
            const roomId = this.roomId;
            window.mxMatrixClientPeg.matrixClient.sendStateEvent(roomId, "m.room.history_visibility", {history_visibility: history}, "").catch((e) => {
                console.error(e);
            });
        },
        _pullContentPropertyFromEvent: function(event, key, defaultValue) {
            if (!event || !event.getContent()) return defaultValue;
            return event.getContent()[key] || defaultValue;
        }
    },
    components: {
    },
    created: function () {
        const roomId = this.roomId;
        const vtx = this;
        const state = window.mxMatrixClientPeg.matrixClient.getRoom(roomId).currentState;
        const joinRule = this._pullContentPropertyFromEvent(
            state.getStateEvents("m.room.join_rules", ""),
            'join_rule',
            'invite',
        );
        const guestAccess = this._pullContentPropertyFromEvent(
            state.getStateEvents("m.room.guest_access", ""),
            'guest_access',
            'forbidden',
        );
        const history = this._pullContentPropertyFromEvent(
            state.getStateEvents("m.room.history_visibility", ""),
            'history_visibility',
            'shared',
        );
        this.joinRule = joinRule;
        this.guestAccess = guestAccess;
        this.history = history;
        console.log('--joinRule--', joinRule)
        console.log('--guestAccess--', guestAccess)
        console.log('--history--', history)
        window.mxMatrixClientPeg.matrixClient.roomState(roomId).then(stateArr => {
            console.log('---stateArr---', stateArr)
            stateArr.forEach(r => {
                if (r.type === 'm.room.join_rules') {
                    vtx.joinRule =  r.content.join_rule;
                }
            })
        });
    },
    mounted: function() {
    },
    watch: {}
}
</script>

<style lang="scss" scoped>
    html {
        z-index: 0;
    }
    .mx-setting-dialog {
        position: fixed;
        left: 50%;
        top: 20px;
        margin-left: -200px;
        background-color: #f2f2f2;
        padding: 26px;
        border-radius: 16px;
        width: 400px;
        height: 600px;
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