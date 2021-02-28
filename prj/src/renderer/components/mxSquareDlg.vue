<template>
    <div class="wrap-layer" @click.self.stop="close('close')">
        <div class="mx-create-room-dialog" v-if="matrixSync">
            <div class="mxCreaterHeader">
                <div class="mxCreaterHeaderTitle">发现群聊</div>
                <img ondragstart="return false" class="mxCreaterClose" src="../../../static/Img/Main/xincaca.png" @click.self.stop="close('close')">
            </div>
            <div class="xieFrame">
                <div class="search-field">
                    <div class="search-logo">
                        <img style="height:20px; width:20px;" src="../../../static/Img/Main/xinsousuo.png">
                    </div>
                    <input @contextmenu.prevent="openBaseMenu" @input="searchRoom" v-model="roomText" class="search-input" type="text" placeholder="搜索">
                    <img style="height:20px; width:20px;" v-show = 'bShowDelIco' @click="clearSearch" src="../../../static/Img/SearchDlg/clear-20px.png">
                </div>
                <div class="room-list-loading" v-if="this.fetching">
                    数据加载中...
                </div>
                <div class="room-list" else>
                    <div v-for="item in publicRooms" :key="item.room_id" class="room-item">
                        <img class="room-img" :src="item.distUrl" onerror="this.src = './static/Img/User/group-40px@2x.png'"/>
                        <div class="room-xie">
                            <div class="room-xie1" v-if="item.name" v-html="searchKeyHightLight((item.name + '(' + item.num_joined_members + ')'))">{{item.name + '(' + item.num_joined_members + ')'}}</div>
                            <div class="room-xie2" v-if="item.canonical_alias">{{item.canonical_alias}}</div>
                            <!-- <div class="room-xie2">{{item.roomId}}</div> -->
                            <div class="room-xie2" v-if="item.topic">{{item.topic}}</div>
                        </div>
                        <!-- <div class="room-xie4" v-if="!item.joined">
                            <div class="room-join" @click.stop="joinRoom(item)">
                                <span>加入</span>
                            </div>
                        </div>
                        <div class="room-xie4" v-else>
                            <div class="room-join" @click.stop="checkRoom(item)">查看</div>
                        </div> -->
                        <div class="room-join" @click.stop="joinRoom(item)" v-if="!item.joined">
                            <!-- <img src="../../../static/Img/Main/baicaca.png" class="baicaca"/> -->
                            <span>加入</span>
                        </div>
                        <div class="room-join" @click.stop="checkRoom(item)" v-else>查看</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const E2EE_WK_KEY = "io.element.e2ee";
const E2EE_WK_KEY_DEPRECATED = "im.vector.riot.e2ee";
import {getAddressType} from "../../utils/UserAddress";
import { mapState, mapActions } from 'vuex';
import { common } from '../../packages/data/services.js';
import { openBaseMenu } from '../../utils/commonFuncs'
const OPTS = {
    limit: 200,
};
export default {
    name: 'mxCreateRoomDlg',
    props: {
        
    },
    data () {
        return {
            name:'',
            isPublic:false,
            commu: false,
            isEncrypted: false,
            alias: '',
            roomText: '',
            publicRooms: [],
            loading: false,
            bShowDelIco: false,
            fetching: false
        }
    },
    timer: null,
    methods: {
        openBaseMenu,
        searchKeyHightLight(content){
            return content.replace(this.roomText, function(item) {
                return '<span style="color:rgba(0, 169, 113, 1);">' + item + "</span>"; 
            })
        },
        checkRoom(room) {
            this.close(room);
        }, 
        joinRoom: function(room) {
            const client = window.mxMatrixClientPeg.matrixClient;
            let publicRooms = this.publicRooms;
            console.log('>>>>>room', room);
            let serverName = room.room_id.split(':')[1];
            let opts = {viaServers:[serverName]}
            client.joinRoom(room.room_id, opts).then(obj => {
                console.log('--加入成功--', obj) //obj.roomId
                publicRooms = publicRooms.map(p => {
                    if (p.room_id == obj.roomId) {
                        p.joined = true;
                    }
                    return p;
                })
                this.publicRooms = [...publicRooms];
                this.close('close');
            })
        },
        getMoreRooms: async function(obj, cover) {
            console.log('--obj--', obj);
            console.log('cover', cover);
            const xie = obj || {limit: 200};
            const client = window.mxMatrixClientPeg.matrixClient;
            const my_filter_string = this.filterString//this.state.filterString;
            const my_server = window.mxMatrixClientPeg.getHomeserverName(); //this.state.roomServer;
            //remember the next batch token when we sent the request
            //too. If it's changed, appending to the list will corrupt it.
            const my_next_batch = this.nextBatch;
            const opts = {limit: 20};
            // if (my_server != window.mxMatrixClientPeg.getHomeserverName()) {
            //     console.log('服务器不匹配？？')
            //     opts.server = my_server;
            // }
            if (this.instanceId === "ALL_ROOMS") {
                opts.include_all_networks = true;
            } else if (this.instanceId) {
                opts.third_party_instance_id = this.instanceId;
            }
            if (this.nextBatch) opts.since = this.nextBatch;
            if (my_filter_string) opts.filter = { generic_search_term: my_filter_string };
            console.log('xie', xie)
            const selfId = client.getUserId();
            console.log('this.serverList >>>>', this.serverList)
            let d = selfId.split(':')[1];
            console.log('selfId >>>>>', selfId)
            console.log('d >>>>>>', d)
            let serverList = [d];
            if (cover) {
                serverList = [...this.serverList]
            }
            if (serverList.length) {
                let arr = [];
                this.fetching = true;
                // if (cover) this.publicRooms = [];
                let publicRooms = [];
                this.publicRooms = [];
                for(let i=0; i<serverList.length; i++) {
                    let xie2 = {...xie, server:serverList[i].serverName}
                    console.log('xie2>>>>', xie2)
                    let data = await client.publicRooms(xie2).catch((e)=>{
                        console.log('+++++error serverName+++++', serverList[i].serverName)
                        this.fetching = false;
                    })
                    this.fetching = false;
                    console.log('data~~~~~~~', data);
                    if (data && data.chunk) {
                        let chunk = data.chunk;
                        let rooms = client.getRooms();
                        console.log('---rooms----', rooms)
                        chunk = chunk.map(c => {
                            let r = client.getRoom(c.room_id)
                            console.log('-------rrrrr-----', r)
                            if (r) {
                                if (r.currentState.members[selfId].membership === 'join') c.joined = true;
                            }
                            c.roomId = c.room_id;
                            c.distUrl = './static/Img/User/group-40px@2x.png';
                            c.distUrl = c.avatar_url ? client.mxcUrlToHttp(c.avatar_url) : './static/Img/User/group-40px@2x.png';
                            return c;
                        })
                        publicRooms = [...publicRooms, ...chunk];
                    }
                }

                this.publicRooms = [...publicRooms];

                return;

                serverList.forEach(s => {
                    if (s.serverName) {
                        let xie2 = {...xie, server:s.serverName}
                        console.log('xie2>>>>', xie2)
                        arr.push(client.publicRooms(xie2).catch((e)=>{console.log('+++++error serverName+++++', s.serverName)}))
                    }
                })
                if (arr.length) {
                    Promise.all(arr).then((resultList) => {
                        let chunk = [];
                        resultList.forEach( (s) => {
                            if (s && s.chunk) {
                                chunk = [...chunk, ...s.chunk]
                            }
                        })
                        let rooms = client.getRooms();
                        console.log('---rooms----', rooms)
                        chunk = chunk.map(c => {
                            let r = client.getRoom(c.room_id)
                            console.log('-------rrrrr-----', r)
                            if (r) {
                                if (r.currentState.members[selfId].membership === 'join') c.joined = true;
                            }
                            c.roomId = c.room_id;
                            c.distUrl = './static/Img/User/group-40px@2x.png';
                            return c;
                        })
                        if (cover) return this.publicRooms = [...chunk];
                        this.publicRooms.push(...chunk);
                        console.log('---查看数据---', this.publicRooms)
                    })
                }
            }
            // return client.publicRooms(xie).then((data) => {
            //     // if (
            //     //     my_filter_string != this.state.filterString ||
            //     //     my_server != this.state.roomServer ||
            //     //     my_next_batch != this.nextBatch) {
            //     //     // if the filter or server has changed since this request was sent,
            //     //     // throw away the result (don't even clear the busy flag
            //     //     // since we must still have a request in flight)
            //     //     return;
            //     // }

            //     // if (this._unmounted) {
            //     //     // if we've been unmounted, we don't care either.
            //     //     return;
            //     // }
            //     console.log('>>>>>check data>>>>>>', data);
            //     this.nextBatch = data.next_batch;
            //     let chunk = data.chunk;
            //     let rooms = client.getRooms();
            //     console.log('---rooms----', rooms)
            //     chunk = chunk.map(c => {
            //         let r = client.getRoom(c.room_id)
            //         console.log('-------rrrrr-----', r)
            //         if (r) {
            //             if (r.currentState.members[selfId].membership === 'join') c.joined = true;
            //         }
            //         c.roomId = c.room_id;
            //         c.distUrl = './static/Img/User/group-40px@2x.png';
            //         return c;
            //     })
            //     if (cover) return this.publicRooms = [...chunk];
            //     this.publicRooms.push(...chunk);
            //     console.log('---查看数据---', this.publicRooms)
            //     // this.setState((s) => {
            //     //     s.publicRooms.push(...(data.chunk || []));
            //     //     s.loading = false;
            //     //     return s;
            //     // });
            //     // return Boolean(data.next_batch);
            // }, (err) => {
            //     // if (
            //     //     my_filter_string != this.state.filterString ||
            //     //     my_server != this.state.roomServer ||
            //     //     my_next_batch != this.nextBatch) {
            //     //     // as above: we don't care about errors for old
            //     //     // requests either
            //     //     return;
            //     // }

            //     // if (this._unmounted) {
            //     //     // if we've been unmounted, we don't care either.
            //     //     return;
            //     // }

            //     console.error("Failed to get publicRooms: %s", JSON.stringify(err));
            //     // track('Failed to get public room list');
            //     // const brand = SdkConfig.get().brand;
            //     // this.setState({
            //     //     loading: false,
            //     //     error: (
            //     //         _t('%(brand)s failed to get the public room list.', { brand }) +
            //     //         (err && err.message) ? err.message : _t('The homeserver may be unavailable or overloaded.')
            //     //     ),
            //     // });
            // });
        },
        clearSearch(){
            this.bShowDelIco = false;
            this.roomText = '';
            this.searchRoom();
        },

        searchRoom: function() {
            const roomText = this.roomText;
            let cover = false;
            if(roomText.length == 0) {
                this.bShowDelIco = false;
            } else {
                this.bShowDelIco = true;
                cover = true;
            }
            if (this.timer) clearTimeout(this.timer);
            console.log('-----roomText----', roomText.length);

            this.timer = setTimeout(()=>{
                console.log('---opts---', OPTS)
                if (OPTS.filter) delete OPTS.filter;
                if (roomText) OPTS.filter = {generic_search_term: roomText};
                this.getMoreRooms(OPTS, cover)
            },320)
        },
        close: function(room) {
            let obj = 'close';
            if (room && room != 'close') obj = {data: room, handler: 'viewRoom'};
            this.$emit('close', obj);
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
        _roomCreateOptions: function() {
            const opts = {};
            const createOpts = opts.createOpts = {};
            createOpts.name = this.name;
            if (this.isPublic) {
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
            if (this.noFederate) {
                createOpts.creation_content = {'m.federate': false};
            }

            if (!this.isPublic) {
                if (this.canChangeEncryption) {
                    opts.encryption = this.isEncrypted;
                } else {
                    // the server should automatically do this for us, but for safety
                    // we'll demand it too.
                    opts.encryption = true;
                }
            }

            // if (CommunityPrototypeStore.instance.getSelectedCommunityId()) { //无此设置
            //     opts.associatedWithCommunity = CommunityPrototypeStore.instance.getSelectedCommunityId();
            // }

            return opts;
        },
        createRoom: function() {
            let opts = this._roomCreateOptions();
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
            return client.createRoom(createOpts).then((res) => {
                console.log('create success!!', res);
                this.$emit('nextStep', res);
            })

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
    async created() {
        console.log('localStorage.getItem >>>>> ', localStorage.getItem('Domain'))
        let value = localStorage.getItem('Domain') || '';
        let filter = [{"operator":"eq","value":value,"logic":1,"field":"tenantName"}];
        const res = await common.gmsHomeServers(filter);
        console.log('+++++域名信息++++++', res);
        if (res.data && res.data.results) {
            this.serverList = res.data.results;
            this.getMoreRooms();
        }
    },
    mounted() {
    },
    // watch: {
    //     matrixSync: {
    //         handler: function(val, oldVal) {
    //             console.log(1113, val);
    //             const vtx = this;
    //             if (val) {
    //                 console.log(222);
    //                 const client = window.mxMatrixClientPeg.matrixClient;
    //                 vtx.isEncrypted = vtx.privateShouldBeEncrypted()
    //                 client.doesServerForceEncryptionForPreset("private")
    //                     .then(isForced => vtx.canChangeEncryption = !isForced);
    //                 console.log(333, window.mxMatrixClientPeg.getHomeserverName())
    //                 vtx.getMoreRooms();
    //             }
    //         },
    //         immediate: true
    //     }
    // },
    computed: {
        ...mapState({
            matrixSync: state => state.common.matrixSync
        }),
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-input-placeholder {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
    }
    ::-webkit-scrollbar {
        /*隐藏滚轮*/
        display: none;
    }
    input:focus{
        outline:none;
    }
    .baicaca {
        height: 20px;
        width: 20px;
        margin-right: 4px;
    }
    .xieFrame {
        height: 380px;
        margin-left: 32px;
        margin-right: 32px;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        display: flex;
        flex-direction: column;
    }
    .room-list {
        flex: 1;
        box-sizing: border-box;
        overflow-y: scroll;
        margin-left: 16px;
        margin-right: 16px;
    }
    .room-list-loading {
        flex: 1;
        box-sizing: border-box;
        overflow-y: scroll;
        margin-left: 16px;
        margin-right: 16px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
    }
    .search-logo {
        height: 20px;
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
    }
    .search-input {
        flex: 1;
        height: 30px;
        box-sizing: border-box;
        border: none;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
    }
    .search-field {
        display: flex;
        height: 32px;
        padding: 4px 8px;
        background-color: #fff;
        margin: 12px 16px;
        border: 1px solid #DDD;
        border-radius: 2px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
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
        width: 624px;
        height: 468px;
        display: block;
        background: #fff;
        top: 50%;
        left: 50%;
        margin-top: -234px;
        margin-left: -312px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
    }

    .mxCreaterHeader {
        height: 56px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left:32px;
        padding-right:32px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .mxCreaterHeaderTitle {
        width: 64px;
        height: 22px;
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #000000;
        line-height: 22px;
    }

    .mxCreaterClose {
        width: 20px;
        height: 20px;
    }

    .mxChatCreaterContent {
        padding: 48px;
        padding-top: 0px;
    }

    .mxTransmitFotter {
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        position: absolute;
        bottom: 32px;
        right: 32px;
}

    .mxTransmitCancleButton {
        border-radius:4px;
        width: 100px;
        height: 28px;
        box-sizing: border-box;
        border:1px solid rgba(221,221,221,1);
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        margin-left: 28px;
        border-radius: 4px;
        font-family: PingFangSC-Regular;
    }

    .mxTransmitConfirmButton {
        border-radius:4px;
        width: 100px;
        height: 28px;
        box-sizing: border-box;
        background-color: #459ad0;
        border:1px solid #459ad0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        margin-left: 28px;
        border-radius: 4px;
        color: #fff;
        font-family: PingFangSC-Regular;
    }

    .setting-field {
        margin-top: 28px;
        height: 40px;
        border-bottom:1px solid rgba(221,221,221,1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 80%;
    }

    .groupSettingSlienceSwitch {
        padding-top: 14px;
        padding-bottom: 14px;
        height: 20px;
        width: 32px;
    }

    .field-left {
        height: 100%;
    }

    .setting-title {
        line-height: 16px;
        height: 1px;
    }
    .setting-tip {
        line-height: 58px;
        font-size: 12px;
        height: 1px;
    }
    .room-name {
        height: 80%;
        border: none;
        width: 40%;
    }
    .room-item {
        height: 78px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background-color: #fff;
        border-bottom: 1px solid #EEEEEE;
        position: relative;
    }
    .room-img {
        height: 40px;
        width: 40px;
        margin-right: 12px;
        border-radius: 50%;
    }
    .room-info {
        margin-right: 24px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: 80px;
    }
    .room-xie1 {
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        line-height: 20px;
        width: 300px; 
        text-overflow:ellipsis; 
        overflow:hidden; 
        white-space:nowrap; 
        display:block;
    }
    .room-xie2 {
        height: 18px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
        line-height: 18px;
        width: 300px; 
        text-overflow:ellipsis; 
        overflow:hidden; 
        white-space:nowrap; 
        display:block;
    }
    .room-xie4 {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
    }
    .room-join {
        width: 72px;
        height: 28px;
        background: #00A971;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        background-color: #24B36B;   
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #FFFFFF;
        position: absolute;
        right: 0;
        top: 25px;
    }
</style>
