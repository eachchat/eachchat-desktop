<template>
    <div class="wrap-layer" @click.self.stop="close('close')">
        <div class="mx-create-room-dialog" v-if="matrixSync">
            <div class="mxCreaterHeader">
                <div class="mxCreaterHeaderTitle">发起聊天</div>
                <img ondragstart="return false" class="mxCreaterClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click.self.stop="close('close')">
            </div>
            <div class="kuangti">
                <div class="search-field">
                    <div class="search-logo">
                        <i class="el-icon-search"></i>
                    </div>
                    <input @input="searchMember" v-model="memText" class="search-input" type="text" placeholder="搜索...">
                </div>
                <div class="crumbs" v-show="crumbs.length > 1">
                    <div 
                        :class="{crumbsItem:(idx !== crumbs.length-1), crumbsItemActive:(idx === crumbs.length-1)}" 
                        v-for="(item, idx) in crumbs"
                        :key="item.department_id"
                    >
                        <span v-show="idx!==0" style="margin-left:4px; margin-right:4px;">/</span>
                        <span>{{item.name}}</span>
                    </div>
                </div>
                <div class="room-list" v-if="!isSearch">
                    <div 
                        v-for="(item, idx) in totalList" 
                        :key="idx"
                    >   
                        <div 
                            v-if="item.type === 'dep'"
                            class="room-item room-item-dep"
                            @click.self.stop="changeLayer(item)"
                        >   
                            <div style="display:flex; align-items:center;">
                                <img class="room-img" src="../../../static/Img/Main/zzjg.png"/> <!-- src="../../../static/Img/Main/yjt.png" -->
                                <div class="user-info">
                                    <span class="room-info">{{item.display_name}}</span>
                                </div>
                            </div>
                            <img style="height:20px; width:20px;" src="../../../static/Img/Main/yjt.png">
                        </div>
                        <div v-else-if="item.dvd" class="dvd">{{item.txt}}</div>
                        <div 
                            class="room-item"
                            @click.stop="choose(item, idx)"
                            :style="{'background': item.choosen ? '#A7E0C4':'#fff'}" 
                            v-else
                        >
                            <img class="room-img" :src="item.avatar_url"/>
                            <div class="user-info">
                                <span class="room-info">{{item.display_name}}</span>
                                <span class="room-info" style="font-size:12px; color:#999999">{{item.user_id}}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="room-list" v-else>
                    <div 
                        v-for="(item, idx) in searchedMembers" 
                        :key="idx"
                    >   
                        <div v-if="item.dvd" class="dvd">{{item.txt}}</div>
                        <div 
                            class="room-item"
                            @click.stop="choose(item, idx)"
                            :style="{'background': item.choosen ? '#A7E0C4':'#fff'}" 
                            v-else
                        >
                            <img class="room-img" :src="item.avatar_url"/>
                            <div class="user-info">
                                <span class="room-info">{{item.display_name}}</span>
                                <span class="room-info" style="font-size:12px; color:#999999">{{item.user_id}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="submit-field">
                <div class="cancel-button" @click.self.stop="close('close')">取消</div>
                <!-- <div class="submit-button" 
                    :style="{'background': (loading || !choosenMembers || !choosenMembers.length) ? '#A7E0C4' : '#24B36B'}" 
                    @click.stop="createDm">创建</div> -->
                <div 
                    class="submit-button"
                    style="background:#A7E0C4"
                    v-if="loading || !choosenMembers || !choosenMembers.length"
                >创建</div>
                <div 
                    class="submit-button" 
                    style="background:#24B36B"
                    @click.self.stop="createDm"
                    v-else
                >创建</div>
            </div>
        </div>
    </div>
</template>

<script>
const E2EE_WK_KEY = "io.element.e2ee";
const E2EE_WK_KEY_DEPRECATED = "im.vector.riot.e2ee";
import DMRoomMap from '../../packages/data/DMRoomMap.js';
import { mapState, mapActions } from 'vuex';
import * as Rooms from "../../packages/data/Rooms";
import * as RoomUtil from '../script/room-util';
import {Contact, Department, UserInfo} from '../../packages/data/sqliteutil.js';

const OPTS = {
    limit: 200,
};
export default {
    name: 'mxDmDlg',
    props: {
        
    },
    data() {
        return {
            name:'',
            isPublic:false,
            commu: false,
            isEncrypted: false,
            alias: '',
            roomText: '',
            publicRooms: [],
            loading: false,

            searchedMembers: [],
            memText:'',
            choosenMembers: [],
            crumbs: [],
            totalList: [],
            isSearch: false
        }
    },
    timer: null,
    methods: {
        createDm: function() {
            if (this.loading) return;
            if (!this.choosenMembers || !this.choosenMembers.length) return;
            this.loading = true;
            const client = window.mxMatrixClientPeg.matrixClient;
            console.log('检查非matrix用户')
            const targetIds = this.choosenMembers.map(t => t.user_id);
            const existingRoom = DMRoomMap.shared().getDMRoomForIdentifiers(targetIds);
            console.log('------existingRoom------', existingRoom);
            if (existingRoom) {
                existingRoom.room_id = existingRoom.roomId
                const obj = {data: existingRoom, handler: 'viewRoom'};
                this.$emit('close', obj);
                return;
            }

            const createRoomOptions = {inlineErrors: true};
            //TODO 加密处理

            let createRoomPromise = Promise.resolve();
            const isSelf = targetIds.length === 1 && targetIds[0] === client.getUserId();
            if (targetIds.length === 1 && !isSelf) {
                createRoomOptions.dmUserId = targetIds[0];
                createRoomPromise = this.createRoom(createRoomOptions);
            } else if (isSelf) {
                createRoomPromise = this.createRoom(createRoomOptions);
            } else {
                console.log('后续增加更多人选');
                //TODO
                // // Create a boring room and try to invite the targets manually.
                // createRoomPromise = createRoom(createRoomOptions).then(roomId => {
                //     return inviteMultipleToRoom(roomId, targetIds);
                // }).then(result => {
                //     if (this._shouldAbortAfterInviteError(result)) {
                //         return true; // abort
                //     }
                // });
            }


        },
        _shouldAbortAfterInviteError(result) {
            const failedUsers = Object.keys(result.states).filter(a => result.states[a] === 'error');
            if (failedUsers.length > 0) {
                // console.log("Failed to invite users: ", result);
                // this.setState({
                //     busy: false,
                //     errorText: _t("Failed to invite the following users to chat: %(csvUsers)s", {
                //         csvUsers: failedUsers.join(", "),
                //     }),
                // });
                alert("Failed to invite users: ", result);
                return true; // abort
            }
            return false;
        },
        choose: function(member, idx) {
            console.log('idxxxxx', idx)
            const searchedMembers = this.searchedMembers;
            searchedMembers.forEach(m => {if (m.choosen) m.choosen = false});
            searchedMembers[idx].choosen = true;
            this.searchedMembers = [...searchedMembers];
            this.choosenMembers = [member];
        },
        joinRoom: function(room) {
            const client = window.mxMatrixClientPeg.matrixClient;
            let publicRooms = this.publicRooms;
            client.joinRoom(room.room_id).then(obj => {
                console.log('--加入成功--', obj) //obj.roomId
                publicRooms = publicRooms.map(p => {
                    if (p.room_id == obj.roomId) {
                        p.joined = true;
                    }
                    return p;
                })
                this.close(room);
                this.publicRooms = [...publicRooms];
            })
        },
        getMoreRooms: function(obj, cover) {
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
            return client.publicRooms(xie).then((data) => {
                // if (
                //     my_filter_string != this.state.filterString ||
                //     my_server != this.state.roomServer ||
                //     my_next_batch != this.nextBatch) {
                //     // if the filter or server has changed since this request was sent,
                //     // throw away the result (don't even clear the busy flag
                //     // since we must still have a request in flight)
                //     return;
                // }

                // if (this._unmounted) {
                //     // if we've been unmounted, we don't care either.
                //     return;
                // }
                console.log('>>>>>check data>>>>>>', data);
                this.nextBatch = data.next_batch;
                let chunk = data.chunk;
                let rooms = client.getRooms();
                console.log('---rooms----', rooms)
                chunk = chunk.map(c => {
                    let r = client.getRoom(c.room_id)
                    if (r) c.joined = true;
                    return c;
                })
                if (cover) return this.publicRooms = [...chunk];
                this.publicRooms.push(...chunk);
                // this.setState((s) => {
                //     s.publicRooms.push(...(data.chunk || []));
                //     s.loading = false;
                //     return s;
                // });
                // return Boolean(data.next_batch);
            }, (err) => {
                // if (
                //     my_filter_string != this.state.filterString ||
                //     my_server != this.state.roomServer ||
                //     my_next_batch != this.nextBatch) {
                //     // as above: we don't care about errors for old
                //     // requests either
                //     return;
                // }

                // if (this._unmounted) {
                //     // if we've been unmounted, we don't care either.
                //     return;
                // }

                console.error("Failed to get publicRooms: %s", JSON.stringify(err));
                // track('Failed to get public room list');
                // const brand = SdkConfig.get().brand;
                // this.setState({
                //     loading: false,
                //     error: (
                //         _t('%(brand)s failed to get the public room list.', { brand }) +
                //         (err && err.message) ? err.message : _t('The homeserver may be unavailable or overloaded.')
                //     ),
                // });
            });
        },
        searchMember: function() {
            const term = this.memText;
            const client = window.mxMatrixClientPeg.matrixClient;
            if (this.timer) clearTimeout(this.timer);
            if (!term) {
                this.searchedMembers = [];
                this.isSearch = false;
                return
            }
            this.timer = setTimeout(async ()=>{
                const searchUsers = await UserInfo.SearchByNameKey(term).catch(e => console.log('组织人员搜索异常', e));
                const searchContacts = await Contact.SearchByNameKey(term).catch(e => console.log('联系人搜索异常', e));
                const res = await client.searchUserDirectory({term}).catch(e => console.log('域用户搜索失败', e));
                // console.log('----searchUsers----', searchUsers);
                // console.log('----searchContacts----', searchContacts);
                // console.log('----res----', res);
                let sus = [];
                sus.push({dvd:true, txt:'组织人员'})
                searchUsers.forEach(c => {
                    //avatar_url
                    //display_name
                    //user_id
                    let u = {}
                    u.avatar_url = c.avatar_o_url || '../../../static/Img/User/user-40px@2x.png';
                    u.display_name =  c.display_name || c.user_name || '';
                    u.user_id = c.matrix_id || '';
                    c.choosen = false;
                    sus.push(u);
                })
                let scs = [];
                scs.push({dvd:true, txt:'我的联系人'})
                searchContacts.forEach(c => {
                    let u = {}
                    u.avatar_url = c.avatar_o_url || '../../../static/Img/User/user-40px@2x.png';
                    u.display_name =  c.display_name || c.user_name || '';
                    u.user_id = c.matrix_id || '';
                    c.choosen = false;
                    scs.push(u);
                })
                let mxs = [];
                mxs.push({dvd:true, txt:'其他联系人'})
                let results = res.results || [];
                results.forEach(c => {
                    c.choosen = false; 
                    c.avatar_url = client.mxcUrlToHttp(res.avatar_url) || '../../../static/Img/User/user-40px@2x.png';
                    mxs.push(c);
                })
                const totalArray = [...sus, ...scs, ...mxs];
                console.log('----totalArray----', totalArray);
                this.isSearch = true;
                this.searchedMembers = [...totalArray];
                // client.searchUserDirectory({term}).then(r => {
                //     console.log('searchUserDirectory', r)
                //     if (r.results) {
                //         const results = r.results.map(res => {
                //             res.choosen = false; 
                //             res.avatar_url = client.mxcUrlToHttp(res.avatar_url) || '../../../static/Img/User/user-40px@2x.png';
                //             return res
                //         })
                //         this.searchedMembers = [...results];
                //     }
                // }).catch(e => {
                //     alert('服务异常');
                //     console.error('异常', e);
                // })
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
        createRoom: function(opts) {
            return RoomUtil.CreateRoom(opts).then((res) => {
                console.log('--create success!!--', res);
                let roomId = res.room_id;
                if(roomId)
                    Rooms.setDMRoom(roomId, opts.dmUserId);
                const obj = {data: res, handler: 'viewRoom'};
                this.$emit('close', obj);
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
        },
        async changeLayer(obj) {
            console.log('caonimao', this.crumbs)
            let department_id = obj.department_id;
            if (false) {
                const rootDep = await Department.GetRoot();
                const dvd = {dvd:true, txt:'我的联系人'};
                const contactUsers = await Contact.GetAllContact();
                rootDep.type = 'dep';
                let totalArray = [rootDep, dvd, ...contactUsers];
                totalArray.forEach(t => t.choosen = false);
                this.totalList = [...totalArray];
                this.crumbs[0].choosen = true;
                this.crumbs = [this.crumbs[0]];
            } else {
                let crumbs = this.crumbs;
                const len = crumbs.length;
                let newCrumbs = []
                for(let i=0; i<len; i++) {
                    newCrumbs.push(crumbs[i]);
                    if (crumbs[i].department_id === department_id) {
                        break;
                    }
                    if (i === len-1) {
                        let layer = {name:obj.display_name, department_id:obj.department_id}
                        newCrumbs.push(layer);
                    }
                }
                newCrumbs[newCrumbs.length-1].choosen = true;
                console.log('>>>>>', newCrumbs)
                this.crumbs = [...newCrumbs];
                const subDep = await Department.GetSubDepartment(department_id);
                const subUsers = await UserInfo.GetSubUserinfo(department_id);
                subDep.forEach(s=>s.type = 'dep')
                subUsers.forEach(s=>s.display_name = s.user_display_name || s.user_name)
                let totalArray = [...subDep, ...subUsers];
                totalArray.forEach(t => t.choose = false)
                this.totalList = [...totalArray];   
            }
        },
    },
    components: {
    },
    async created() {
        const rootDep = await Department.GetRoot();
        rootDep.type = 'dep';
        
        const contactUsers = await Contact.GetAllContact();
        console.log('contactUsers', contactUsers);
        const dvd = {dvd:true, txt:'我的联系人'};
        const layer = {name:rootDep.display_name, department_id:rootDep.department_id, choosen: true}
        let totalArray = [rootDep, dvd, ...contactUsers];
        totalArray.forEach(t => t.choosen = false)
        this.totalList = [...totalArray];
        this.crumbs = [layer];



        console.log('rootDep', rootDep);
        console.log('contactUsers', contactUsers);
        const subDep = await Department.GetSubDepartment("0a59d5bd13cb476698fee9d58599e37e");
        const subUsers = await UserInfo.GetSubUserinfo("0a59d5bd13cb476698fee9d58599e37e");
        console.log('subDep', subDep);
        console.log('subUsers', subUsers);
    },
    
    mounted() {
    },
    watch: {
        matrixSync: {
            handler: function(val, oldVal) {
                console.log(1113, val);
                const vtx = this;
                if (val) {
                    console.log(222);
                    const client = window.mxMatrixClientPeg.matrixClient;
                    vtx.isEncrypted = vtx.privateShouldBeEncrypted()
                    client.doesServerForceEncryptionForPreset("private")
                        .then(isForced => vtx.canChangeEncryption = !isForced);
                    console.log(333, window.mxMatrixClientPeg.getHomeserverName())
                    vtx.getMoreRooms();
                }
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
    .kuangti {
        border: 1px solid #DDDDDD;
        border-radius: 4px;
        margin:32px;
        margin-top: 0;
        background-color: #fff;
        flex: 1;
        margin-bottom: 0;
        overflow-y: scroll;
    }
    .room-list {
        flex: 1;
        margin: 12px 0;
        box-sizing: border-box;
        overflow-y: scroll;
        background-color: transparent;
        margin-top: 0;
    }
    .search-logo {
        height: 32px;
        width: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
    }
    .search-input {
        flex: 1;
        height: 32px;
        box-sizing: border-box;
        border: none;
    }
    .search-field {
        display: flex;
        height: 32px;
        padding: 4px 8px;
        background-color: #fff;
        margin: 12px 16px;
        border-radius: 2px;
        border: 1px solid #DDDDDD;
        margin-bottom: 0;
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
        height: 468px;
        display: block;
        background: #fff;
        top: 50%;
        left: 50%;
        margin-top: -312px;
        margin-left: -220px;
        border-radius: 4px;
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
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }

    .mxCreaterHeaderTitle {
        font-size: 14px;
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
        font-family: PingFangSC-Regular;
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
    }

    .mxTransmitConfirmButton {
        border-radius:4px;
        font-family: PingFangSC-Regular;
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
        height: 48px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background-color: #fff;
        // width: 100%;
        box-sizing: border-box;
        margin-left: 16px;
        margin-right: 16px;
        border-bottom: 1px solid #DDD;
        
    }
     .room-item-dep {
         justify-content: space-between;
     }
    .dvd {
        font-size: 12px;
        height: 32px;
        color: #666666;
        background-color: #F7F8FA;
        box-sizing: border-box;
        padding: 0 16px;
        margin-top: 16px;
        line-height: 32px;
    }
    .room-img {
        height: 32px;
        width: 32px;
        margin-right: 16px;
    }
    .room-info {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        /* width: 80px; */
        font-size: 14px;
        height: 16px;
        line-height: 16px;
    }
    .room-join {
        height: 24px;
        width: 60px;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        background-color: #459ad0;   
        margin-left: 160px;
        font-size: 12px;
    }
    .user-info {
        display: flex;
        flex-direction: column;
    }
    .submit-field {
        height: 72px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .submit-button {
        box-sizing: border-box;
        width: 100px;
        height: 32px;
        background: #24B36B;
        border-radius: 4px;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .cancel-button {
        box-sizing: border-box;
        width: 100px;
        height: 32px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        color: #000;
        margin-right: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .crumbs {
        height: 40px;
        display: flex;
        align-items: center;
        margin-left: 16px;
        font-size: 12px;
    }
    .crumbsItem {
        color: #24B36B
    }
    .crumbsItemActive {
        color: #000;
    }
</style>
