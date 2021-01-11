<template>
    <div class="wrap-layer" @click.self.stop="close">
        <div class="mx-create-room-dialog" v-if="matrixSync">
            <div class="mxCreaterHeader">
                <div class="mxCreaterHeaderTitle">发起群聊</div>
                <img ondragstart="return false" class="mxCreaterClose" src="../../../static/Img/Main/xincaca.png" @click.self.stop="close">
            </div>
            <div class="mxChatCreaterContent">
                <div class="qlmcField">
                    <div class="setting-title">群聊名称</div>
                    <input 
                        type="text"
                        class="room-name" 
                        placeholder="请输入群聊名称" 
                        maxlength="24"
                        v-model="name"
                    />
                </div>
                <div class="qllx">群聊类型</div>
                <div class="qllxXuanxiang">
                    <img class="imgGouxuan" v-if="isPublic == 'y'" src="../../../static/Img/Main/xgg.png">
                    <img class="imgGouxuan" v-else src="../../../static/Img/Main/wxgg.png" @click.stop="sgk">
                    <input class="gkrdo" type="radio" id="gongkai" value="y" v-model="isPublic">
                    <label class="qllxZi" for="gongkai">公共 - 任何人可以加入</label>
                </div>
                <div class="qllxXuanxiang">
                    <img class="imgGouxuan" v-if="isPublic == 'n'" src="../../../static/Img/Main/xgg.png">
                    <img class="imgGouxuan" v-else src="../../../static/Img/Main/wxgg.png" @click.stop="ssr">
                    <input class="gkrdo" type="radio" id="siren" value="n" v-model="isPublic">
                    <label class="qllxZi" for="siren">私人 - 需要邀请加入</label>
                </div>
                <!-- <div class="setting-field">
                    <div class="field-left">
                        <div class="setting-title">群聊类型</div>
                        <div class="setting-tip">公共-任何人可以加入</div>
                    </div>
                    <el-switch 
                        class="groupSettingSlienceSwitch" 
                        v-model="isPublic"
                        :active-color="'#24B36B'"
                    >
                    </el-switch>
                </div> -->
                <div class="setting-field" v-show="isPublic == 'y'">
                    <div class="field-left">
                        <div class="setting-title">群聊广场</div>
                        <div class="setting-tip">将群聊发布到群聊广场中</div>
                    </div>
                    <el-switch 
                        class="groupSettingSlienceSwitch" 
                        v-model="commu" 
                        :active-color="'#24B36B'"
                    >
                    </el-switch>
                </div>
                <!-- <div class="setting-field" >
                    <div class="field-left">
                        <div class="setting-title">端到端加密</div>
                        <div class="setting-tip">一旦开启端到端加密，将无法撤销</div>
                    </div>
                    <el-switch 
                        class="groupSettingSlienceSwitch" 
                        v-model="isEncrypted"
                        :active-color="'#24B36B'"
                    >
                    </el-switch>
                </div> -->
            </div>
            <div class="mxTransmitFotter" v-if="loading">
                <div class="mxTransmitConfirmButtonDisable">确认</div>
                <div class="mxTransmitCancleButton" @click.self.stop="preStep">上一步</div>
            </div>
            <div class="mxTransmitFotter" v-else>
                <div class="mxTransmitConfirmButton" @click.self.stop="confirm">确认</div>
                <div class="mxTransmitCancleButton" @click.self.stop="preStep">上一步</div>
            </div>
        </div>
    </div>
</template>

<script>
const E2EE_WK_KEY = "io.element.e2ee";
const E2EE_WK_KEY_DEPRECATED = "im.vector.riot.e2ee";
import {getAddressType} from "../../utils/UserAddress";
import { mapState, mapActions } from 'vuex';
import {ComponentUtil} from '../script/component-util';

export default {
    name: 'mxCreateRoomDlg',
    props: {
        mxInvite: {
            type: Array,
            default: []
        },
    },
    data () {
        return {
            name:'',
            isPublic: 'n',
            commu: false,
            isEncrypted: false,
            alias: '',
            loading: false
        }
    },
    methods: {
        preStep() {
            this.$emit('preStep');
        },
        ssr() {
            this.isPublic = 'n';
        },
        sgk() {
            this.isPublic = 'y';
        },
        close: function() {
            this.$emit('close', 'close');
        },
        confirm: function() {
            this.createRoom();
        },
        privateShouldBeEncrypted: function() {
            const e2eeWellKnown = this.getE2EEWellKnown();
            if (e2eeWellKnown) {
                const defaultDisabled = e2eeWellKnown["default"] === false;
                return !defaultDisabled;
            }
            return true;
        },
        getE2EEWellKnown: function() {
            const client = window.mxMatrixClientPeg.matrixClient;
            const clientWellKnown = client.getClientWellKnown();
            if (clientWellKnown && clientWellKnown[E2EE_WK_KEY]) {
                return clientWellKnown[E2EE_WK_KEY];
            }
            if (clientWellKnown && clientWellKnown[E2EE_WK_KEY_DEPRECATED]) {
                return clientWellKnown[E2EE_WK_KEY_DEPRECATED]
            }
            return null;
        },
        _roomCreateOptions: async function() {
            const client = window.mxMatrixClientPeg.matrixClient;
            const selfId = client.getUserId();
            const opts = {};
            const createOpts = opts.createOpts = {};
            const invite = this.mxInvite.map(m => m.id);
            createOpts.invite = invite;
            // createOpts.name = this.name;
            const dspName = await ComponentUtil.GetDisplayNameByMatrixID(selfId);
            if (this.name) {
                createOpts.name = this.name;
            } else {
                let name = dspName + ',';
                for(let i = 0; i<2; i++) {
                    let end = ', ';
                    if (this.mxInvite[i].length === 1) {
                        end = ''
                    } else if (i === 1){
                        end = '...'
                    }
                    if (this.mxInvite[i]) name = name + this.mxInvite[i].name + end;     
                }
                createOpts.name = name;
            }
            if (this.isPublic === 'y') {
                createOpts.visibility = "public";
                createOpts.preset = "public_chat";
                opts.guestAccess = false;
                // const {alias} = this.state;
                // const localPart = alias.substr(1, alias.indexOf(":") - 1);
                // createOpts['room_alias_name'] = localPart;  //无此设置
            }
            if (this.topic) {
                createOpts.topic = this.topic;
            }
            // if (this.noFederate) {
            //     createOpts.creation_content = {'m.federate': false};
            // }

            // if (!this.isPublic) { 
            //     if (this.canChangeEncryption) {
            //         opts.encryption = this.isEncrypted;
            //     } else {
            //         // the server should automatically do this for us, but for safety
            //         // we'll demand it too.
            //         opts.encryption = true;
            //     }
            // }

            // if (CommunityPrototypeStore.instance.getSelectedCommunityId()) { //无此设置
            //     opts.associatedWithCommunity = CommunityPrototypeStore.instance.getSelectedCommunityId();
            // }

            if (this.isEncrypted) {
                opts.encryption = true;
            }

            return opts;
        },
        createRoom: async function() {
            if (this.loading) return;
            this.loading = true;
            let opts = await this._roomCreateOptions();
            const vtx = this;
            if (opts.spinner === undefined) opts.spinner = true;
            if (opts.guestAccess === undefined) opts.guestAccess = true;
            if (opts.encryption === undefined) opts.encryption = false;

            // const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
            // const Loader = sdk.getComponent("elements.Spinner");

            const client = window.mxMatrixClientPeg.matrixClient;
            // if (client.isGuest()) {
            //     // dis.dispatch({action: 'require_registration'});
            //     return Promise.resolve(null);
            // }

            const defaultPreset = opts.dmUserId ? "trusted_private_chat" : "private_chat";

            // set some defaults for the creation
            const createOpts = opts.createOpts || {};
            createOpts.preset = createOpts.preset || defaultPreset;
            createOpts.visibility = createOpts.visibility || "private";
            if (opts.dmUserId && createOpts.invite === undefined) {
                switch (getAddressType(opts.dmUserId)) {
                    case 'mx-user-id':
                        createOpts.invite = [opts.dmUserId];
                        break;
                    case 'email':
                        createOpts.invite_3pid = [{
                            id_server: client.getIdentityServerUrl(true),
                            medium: 'email',
                            address: opts.dmUserId,
                        }];
                }
            }
            if (opts.dmUserId && createOpts.is_direct === undefined) {
                createOpts.is_direct = true;
            }

            // By default, view the room after creating it
            if (opts.andView === undefined) {
                opts.andView = true;
            }

            createOpts.initial_state = createOpts.initial_state || [];

            // Allow guests by default since the room is private and they'd
            // need an invite. This means clicking on a 3pid invite email can
            // actually drop you right in to a chat.
            if (opts.guestAccess) {
                createOpts.initial_state.push({
                    type: 'm.room.guest_access',
                    state_key: '',
                    content: {
                        guest_access: 'can_join',
                    },
                });
            }

            if (opts.encryption) {
                createOpts.initial_state.push({
                    type: 'm.room.encryption',
                    state_key: '',
                    content: {
                        algorithm: 'm.megolm.v1.aes-sha2',
                    },
                });
            }

            console.log('---createOpts---', createOpts);
            const commu = this.commu;
            let roomInfo = {
                createOpts: createOpts,
                commu: commu
            }
            return client.createRoom(createOpts).then((res) => {
                console.log('create success!!', res);
                client.setRoomDirectoryVisibility(
                    res.room_id,
                    commu ? 'public' : 'private',
                ).then(()=>{
                    this.loading = false;
                    this.close();
                })
            })
            // console.log('----roomInfo----', roomInfo);
            // this.$emit('nextStep', roomInfo);

            // let modal;
            // if (opts.spinner) modal = Modal.createDialog(Loader, null, 'mx_Dialog_spinner');

            // let roomId;
            // return client.createRoom(createOpts).finally(function() {
            //     if (modal) modal.close();
            // }).then(function(res) {
            //     roomId = res.room_id;
            //     if (opts.dmUserId) {
            //         return Rooms.setDMRoom(roomId, opts.dmUserId);
            //     } else {
            //         return Promise.resolve();
            //     }
            // }).then(() => {
            //     if (opts.associatedWithCommunity) {
            //         return GroupStore.addRoomToGroup(opts.associatedWithCommunity, roomId, false);
            //     }
            // }).then(function() {
            //     // NB createRoom doesn't block on the client seeing the echo that the
            //     // room has been created, so we race here with the client knowing that
            //     // the room exists, causing things like
            //     // https://github.com/vector-im/vector-web/issues/1813
            //     if (opts.andView) {
            //         dis.dispatch({
            //             action: 'view_room',
            //             room_id: roomId,
            //             should_peek: false,
            //             // Creating a room will have joined us to the room,
            //             // so we are expecting the room to come down the sync
            //             // stream, if it hasn't already.
            //             joining: true,
            //         });
            //     }
            //     return roomId;
            // }, function(err) {
            //     // Raise the error if the caller requested that we do so.
            //     if (opts.inlineErrors) throw err;

            //     // We also failed to join the room (this sets joining to false in RoomViewStore)
            //     dis.dispatch({
            //         action: 'join_room_error',
            //     });
            //     console.error("Failed to create room " + roomId + " " + err);
            //     let description = _t("Server may be unavailable, overloaded, or you hit a bug.");
            //     if (err.errcode === "M_UNSUPPORTED_ROOM_VERSION") {
            //         // Technically not possible with the UI as of April 2019 because there's no
            //         // options for the user to change this. However, it's not a bad thing to report
            //         // the error to the user for if/when the UI is available.
            //         description = _t("The server does not support the room version specified.");
            //     }
            //     Modal.createTrackedDialog('Failure to create room', '', ErrorDialog, {
            //         title: _t("Failure to create room"),
            //         description,
            //     });
            //     return null;
            // });
        }
    },
    components: {
    },
    created() {
        console.log('mxInvite++++', this.mxInvite)
    },
    mounted() {
    },
    watch: {
        matrixSync: {
            handler: function(val, oldVal) {
                console.log(1113, val);
                const vtx = this;
                // if (val) {
                //     console.log(222);
                //     const client = window.mxMatrixClientPeg.matrixClient;
                //     vtx.isEncrypted = vtx.privateShouldBeEncrypted()
                //     client.doesServerForceEncryptionForPreset("private")
                //         .then(isForced => vtx.canChangeEncryption = !isForced);
                //     console.log(333)
                // }
            },
            immediate: true
        }
    },
    computed: {
        ...mapState({
            matrixSync: state => state.common.matrixSync
        }),
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar {
        /*隐藏滚轮*/
        display: none;
    }
    input:focus{
        outline:none;
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

    .mx-create-room-dialog {
        position: absolute;
        width: 440px;  
        height: 366px;
        display: block;
        background: #FFFFFF;
        top: 50%;
        left: 50%;
        margin-top: -183px;
        margin-left: -220px;
        border-radius: 4px;
    }

    .mxCreaterHeader {
        height: 56px;
        background: #FFFFFF;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 32px;
        padding-right: 20px;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }

    .mxCreaterHeaderTitle {
        width: 72px;
        height: 22px;
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
        letter-spacing: 2px;
    }

    .mxCreaterClose {
        width: 20px;
        height: 20px;
    }

    .mxChatCreaterContent {
        padding: 40px;
        padding-top: 0px;
        padding-bottom: 30px;
    }

    .mxTransmitFotter {
        display: flex;
        flex-direction: row-reverse;
        justify-content: center;
}

    .mxTransmitCancleButton {
        border-radius:4px;
        width: 100px;
        height: 32px;
        box-sizing: border-box;
        border:1px solid #DDD;
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #000000;
        letter-spacing: 1px;
    }

    .mxTransmitConfirmButton {
        border-radius:4px;
        font-family: PingFangSC-Regular;
        width: 100px;
        height: 32px;
        box-sizing: border-box;
        background-color: #24B36B;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #fff;
        margin-left: 20px;
    }

    .mxTransmitConfirmButtonDisable {
        border-radius:4px;
        font-family: PingFangSC-Regular;
        width: 100px;
        height: 32px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #fff;
        margin-left: 20px;
        background-color:#A7E0C4;
    }

    .setting-field {
        margin-top: 20px;
        // border-bottom:1px solid rgba(221,221,221,1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .groupSettingSlienceSwitch {
        padding-top: 14px;
        padding-bottom: 14px;
        height: 20px;
        width: 32px;
    }

    .field-left {
        // height: 100%;
    }

    .setting-title {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 1px;
    }
    .setting-tip {
        height: 20px;
        font-size: 13px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
        line-height: 20px;
    }
    .room-name {
        width: 100%;
        border-radius: 4px;
        border: 1px solid #ddd;
        height: 32px;
        margin-top: 8px;
    }
    .qllx {
        width: 60px;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 1px;
        margin-top: 20px;
        margin-bottom: 8px;
    }
    .qllxXuanxiang {
        height: 20px;
        display: flex;
        align-items: center;
    }
    .qllxZi {
        width: 145px;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        letter-spacing: 1px;
        flex: 1
    }

    .gkrdo {
        display: none;
        margin-right: 4px;
    }
    .imgGouxuan {
        height: 20px;
        width: 20px;
        margin-right: 4px;
    }
</style>
