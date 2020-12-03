<template>
    <div class="setting-wrap" @click.self.stop="close">
        <div class="mx-setting-dialog">
            <div class="inner-wrap">
                <div class="title">群聊设置</div>
                <img class="close" @click.self.stop="close" src="../../../static/Img/Main/xincaca.png">
                <div class="setting-field">
                    <div class="filed-title">群聊类型</div>
                    <div class="xiaomiaoshu"><input @change="setJoinRule" id="puborprt0" type="radio" value="public" v-model="joinRule"><label for="puborprt0"  >公共群聊-任何人可以加入</label></div>
                    <div class="xiaomiaoshu"><input @change="setJoinRule" id="puborprt1" type="radio" value="invite" v-model="joinRule"><label for="puborprt1"  >私人群聊-受邀请才能加入</label></div>
                </div>
                <div class="setting-field">
                    <div class="filed-title">设置群聊地址</div>
                    <div class="xiaomiaoshu tipdesc">任何服务器上的任何人都可以使用发布的群聊地址加入您的聊天室。如果要发布群聊地址，需要先设置为群聊地址。</div>
                    <div class="xiaomiaoshu serverRow">
                        <div class="serverFrame">
                            <div class="serverFrameStart">#</div>
                            <input 
                                type="text" 
                                class="serverInput"
                                v-model="serverAddress"
                            >
                            <div class="serverFrameEnd">:matrix.each.chat</div>
                        </div>
                        <div 
                            class="serverBtn" 
                            :class="{'serverBtnSubmit': !loading, 'serverBtnLoading': loading}"
                            @click.self.stop="setServerAddress"
                        >添加</div>
                    </div>
                </div>
                <div class="setting-field">
                    <div class="filed-title">谁可以查看聊天历史？</div>
                    <div class="xiaomiaoshu tipdesc">对谁可以阅读历史记录的更改仅适用于此群聊中将来的消息。现有聊天历史的可见性将保持不变。</div>
                    <div class="xiaomiaoshu"><input @change="setHistory" type="radio" id="histcheck0" value="invited" v-model="history"><label for="histcheck0">只有群成员(从群成员被邀请时 )</label></div>
                    <div class="xiaomiaoshu"><input @change="setHistory" type="radio" id="histcheck1" value="joined" v-model="history"><label for="histcheck1">只有群成员(从群成员加入群聊时 )</label></div>
                    <div class="xiaomiaoshu"><input @change="setHistory" type="radio" id="histcheck2" value="shared" v-model="history"><label for="histcheck2">只有群成员（从此选项被选中的那一时刻)</label></div>
                </div>
                <div class="setting-field">
                    <div class="filed-title">谁可以加入此群聊</div>
                    <div class="xiaomiaoshu"><input @change="setGuestAccess" type="radio" id="whocanjoin0" value="forbidden" v-model="guestAccess"><label for="whocanjoin0">任何知道群聊链接的人，不包括用户所在域外的来宾用户</label></div>
                    <div class="xiaomiaoshu"><input @change="setGuestAccess" type="radio" id="whocanjoin1" value="can_join" v-model="guestAccess"><label for="whocanjoin1">任何知道群聊链接的人，包括用户所在域外的来宾用户</label></div>
                </div>
                <div class="encryption-field">
                    <label class="groupSettingSlienceLabel">端到端加密</label>
                    <el-switch 
                        class="groupSettingSlienceSwitch" 
                        v-model="mxEncryption" 
                        @change="setMxEncryption"
                        :active-color="'#24B36B'"
                        :disabled="mxEncryption"
                    >
                    </el-switch>
                </div>
                <encryWarn 
                    v-if="encryptionWarning"
                    @close="closeEncryWarn"
                    :room="currentRoom"
                />
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
import encryWarn from './encryptionWarning.vue'
export default {
    name: 'mxSettingDialog',
    data () {
        return {
            joinRule: '',
            guestAccess: '',
            history: '',
            loading: false,
            serverAddress: '',
            mxEncryption: false,
            encryptionWarning: false,
            currentRoom: undefined
        }
    },
    props: ['roomId'],
    puborprtTimer: null,
    methods: {
        closeEncryWarn(mxEncryption) {
            this.encryptionWarning = false;
            if (mxEncryption) this.mxEncryption = true;
        },
        setMxEncryption() {
             console.log('----setMxEncryption----', this.mxEncryption)
            if (this.mxEncryption) {
                this.mxEncryption = !this.mxEncryption;
                this.encryptionWarning = true;
            }
        },
        setServerAddress() {
            if (this.loading) return;
            this.loading = true;
            const roomId = this.roomId;
            const address = '#' + this.serverAddress + ':matrix.each.chat';
            window.mxMatrixClientPeg.matrixClient.createAlias(address, roomId).then(()=>{
                this.loading = false;
                console.log('success!!@')
            }).catch((e) => {
                this.loading = false;
                console.error(e);
            });
        },
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
        encryWarn
    },
    created: function () {
        const client = window.mxMatrixClientPeg.matrixClient;
        const roomId = this.roomId;
        const vtx = this;
        const currentRoom = client.getRoom(roomId);
        const state =currentRoom.currentState;
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
        this.currentRoom = currentRoom;
        let mxEncryption = client.isRoomEncrypted(roomId);
        this.mxEncryption = mxEncryption;
        client.roomState(roomId).then(stateArr => {
            console.log('---stateArr---', stateArr)

            stateArr.forEach(r => {
                if (r.type === 'm.room.join_rules') {
                    vtx.joinRule =  r.content.join_rule;
                }
            })
        });
    },
    mounted: function() {
        const client = window.mxMatrixClientPeg.matrixClient;
        let room = client.getRoom(this.roomId);
        console.log('++++current room++++', room);
        let currentState = room.currentState.getStateEvents('m.room.power_levels','');
        let xie = room.currentState.maySendStateEvent('m.room.canonical_alias', client.getUserId());
        if (!currentState) return;
        const powerLevels = currentState.getContent();
        console.log('++++powerLevels++++', powerLevels);

    },
    watch: {}
}
</script>

<style lang="scss" scoped>
    html {
        z-index: 0;
    }
    ::-webkit-scrollbar {
        /*隐藏滚轮*/
        display: none;
    }
    input:focus{
        outline:none;
    }
    .setting-wrap {
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
        margin-left: -220px;
        background-color: #fff;
        padding: 26px;
        border-radius: 4px;
        width: 440px;
        height: 600px;
        z-index: 99999;
    }
    .inner-wrap {
        height: 100%;
        overflow-y: scroll;
    }
    .title {
        font-size: 16px;
        font-weight: bolder;
        margin-bottom: 20px;
    }
    .close {
        position: absolute;
        top: 26px;
        right: 26px;
        height: 20px;
        width: 20px;
    }
    .setting-field {
        margin-bottom: 20px;
        font-size: 12px;
    }
    .filed-title {
        height: 20px;
        font-size: 14px;
        margin-bottom: 12px;
    }
    .xiaomiaoshu {
        font-size: 14px;
        margin-bottom: 8px;
    }
    .tipdesc {
        color: #999999;
    }
    .serverRow {
        display: flex;
        align-items: center;
    }
    .serverFrame {
        width: 75%;
        height: 32px;
        display: flex;
        align-items: center;
        background: #FFFFFF;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        box-sizing: border-box;
    }
    .serverFrameStart {
        margin-left: 12px;
        height: 100%;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .serverFrameEnd {
        height: 100%;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

    }
    .serverInput {
        width: 160px;
        height: 28px;
        border: none;
        margin-left: 8px;
        margin-right: 8px;
    }
    .serverBtn {
        margin-left: 20px;
        box-sizing: border-box;
        height: 32px;
        width: 60px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 14px;
    }
    .serverBtnSubmit {
        background: #24B36B;
        border: 1px solid #24B36B;
    }
    .serverBtnLoading {
        background: #A7E0C4;
        border: 1px solid #A7E0C4;
    }
    .encryption-field {
        display: flex;
        align-items: center;
    }
    .groupSettingSlienceLabel {
        font-size: 14px;
    }
    .groupSettingSlienceSwitch {
        margin-left: 40px;
    }
</style>
