<template>
    <div class="wrap-layer" @click.self.stop="close('close')">
        <div class="xuanzekuang" v-if="anf">
            <div class="xuanzekuangShang">
                <img class="que6" :src="que.avatar_url" onerror="this.src = './static/Img/User/user-40px@2x.png'"/>
                <div class="que1">
                    <div class="que2">
                        <div class="que4">{{que.display_name}}</div>
                        <div class="que5">{{que.secdis}}</div>
                    </div>
                    <div class="que3">邀请你加入聊天</div>
                </div>
            </div>
            <div class="xuanzekuangXia">
                <div class="submit-button" @click.stop="ToJoinRoom">接受</div>
                <div class="cancel-button" @click.stop="RejectRoom">拒绝</div>
            </div>
        </div>
        <div class="mx-create-room-dialog" v-else-if="matrixSync && !anf">
            <div class="mxCreaterHeader">
                <div class="mxCreaterHeaderTitle">选择联系人</div>
                <img 
                    ondragstart="return false" 
                    class="mxCreaterClose" 
                    src="../../../static/Img/Main/xincaca.png"
                    @click.self.stop="close('close')">
            </div>
            <div class="kuangti">
                <div class="search-field">
                    <div class="search-logo">
                        <!-- <i class="el-icon-search"></i> -->
                        <img style="height:20px; width:20px;" src="../../../static/Img/Main/xinsousuo.png">
                    </div>
                    <input @input="searchMember" v-model="memText" class="search-input" type="text" placeholder="搜索">
                </div>
                <!-- <div class="crumbs" v-show="crumbs.length > 1">
                    <div 
                        :class="{crumbsItem:(idx !== crumbs.length-1), crumbsItemActive:(idx === crumbs.length-1)}" 
                        v-for="(item, idx) in crumbs"
                        :key="item.department_id"
                        @click.stop="changeLayerByCrumb(item)"
                    >
                        <span v-show="idx!==0" >/</span>
                        <span>{{item.name}}</span>
                    </div>
                </div> -->
                <div class="room-list">
                    <div class="crumbs" v-show="crumbs.length > 1">
                        <div 
                            :class="{crumbsItem:(idx !== crumbs.length-1), crumbsItemActive:(idx === crumbs.length-1)}" 
                            v-for="(item, idx) in crumbs"
                            :key="item.department_id"
                            @click.stop="changeLayerByCrumb(item)"
                        >
                            <span v-show="idx!==0" >/</span>
                            <span>{{item.name}}</span>
                        </div>
                    </div>
                    <div 
                        v-for="(item, idx) in totalList" 
                        :key="idx"
                    >   
                        <div 
                            v-if="item.type === 'dep'"
                            class="room-item room-item-dep"
                            @click.stop="changeLayer(item)"
                        >   
                            <div style="display:flex; align-items:center;">
                                <img class="room-img" style="margin-right:2px;" 
                                    :src="item.avatar"
                                /> <!-- src="../../../static/Img/Main/yjt.png" -->
                                <div class="user-info">
                                    <div class="room-info" v-html="searchKeyHightLight(item.display_name)">{{item.display_name}}</div>
                                </div>
                            </div>
                            <img style="height:20px; width:20px;" src="../../../static/Img/Main/yjt.png">
                        </div>
                        <div v-else-if="item.dvd" class="dvd">{{item.txt}}</div>
                        <div 
                            class="room-item"
                            @click.stop="chooseT(item, idx)"
                            :style="{'background': item.choosen ? '#EEEEEE':'#fff'}" 
                            v-else
                        >
                            <img class="room-img" :src="item.avatar_url" onerror="this.src = './static/Img/User/user-40px@2x.png'"/>
                            <div class="user-info">
                                <div class="room-info" v-html="searchKeyHightLight(item.display_name)">{{item.display_name}}</div>
                                <div class="room-info2">{{item.secdis || item.matrix_id || item.user_id}}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- <div class="room-list" v-else>
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
                                <span class="room-info" style="font-size:12px; color:#999999">{{item.matrix_id || item.user_id}}</span>
                            </div>
                        </div>
                    </div>
                </div> -->
            </div>
            <div class="submit-field">
                <div class="cancel-button" @click.stop="close('close')">取消</div>
                <!-- <div class="submit-button" 
                    :style="{'background': (loading || !choosenMembers || !choosenMembers.length) ? '#A7E0C4' : '#24B36B'}" 
                    @click.stop="createDm">确认</div> -->
                <div 
                    class="submit-button"
                    style="background:#A7E0C4"
                    v-if="loading || !choosenMembers || !choosenMembers.length"
                >确认</div>
                <div 
                    class="submit-button" 
                    style="background:#24B36B"
                    @click.stop="createDm"
                    v-else
                >确认</div>
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
import {getAddressType} from "../../utils/UserAddress";
import {ComponentUtil} from '../script/component-util';


const OPTS = {
    limit: 200,
};
export default {
    name: 'mxDmDlg',
    props: {
        erpDm: {
            type: Boolean,
            default: false
        }, 
        roomId: {
            type: String,
            default: ''
        }
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
            isSearch: false,
            rootDepId: '',
            selfId: '',
            que: {},
            anf: false
        }
    },
    timer: null,
    methods: {
        RejectRoom: function() {
            const roomId = this.queRoomId;
            global.mxMatrixClientPeg.matrixClient.leave(roomId);
            this.$store.commit("updateInviteState", {roomID : roomId, roomState : 1});
            this.anf = false;
        },
        ToJoinRoom: function() {
            if (this.loading) return;
            this.loading = true;
            const roomId = this.queRoomId;
            try{
                var distRoom = global.mxMatrixClientPeg.matrixClient.getRoom(roomId);
                if(global.mxMatrixClientPeg.isDMInvite(distRoom)) {
                    Rooms.setDMRoom(roomId, global.mxMatrixClientPeg.matrixClient.getUserId());
                }
                global.mxMatrixClientPeg.matrixClient.joinRoom(roomId, {inviteSignUrl: undefined, viaServers: undefined})
                .then(() => {
                    setTimeout(() => {
                        this.loading = false;
                        const obj = {data: distRoom, handler: 'viewRoom'};
                        console.log('通过emit, 向上层组件触发viewRoom');
                        this.$store.commit("updateInviteState", {roomID : roomId, roomState : 2});
                        this.$emit('close', obj);
                    }, 500)
                })
                .catch((error) => {
                    console.log("========join failed and err is ", error.error);
                    this.loading = false;
                    if(error.httpStatus == 403) {
                        this.$toastMessage({message:"您没有权限进入该房间", time: 2000, type:'error', showHeight: '80px'});
                    }
                    else if(error.httpStatus == 429) {
                        this.$toastMessage({message:"您的请求次数过多，请稍后再试", time: 2000, type:'error', showHeight: '80px'});
                    }
                    else if(error.httpStatus == 404) {
                        this.$toastMessage({message:"该邀请人已退出群组，不可加入", time: 2000, type:'error', showHeight: '80px'});
                        this.RejectRoom(roomId);
                    }
                })
            }
            catch(e){
                console.log(e)
            }    
        },
        searchKeyHightLight(content){
            return content.replace(this.memText, function(item) {
                return '<span style="color:rgba(0, 169, 113, 1);">' + item + "</span>"; 
            })
        },
        inviteConduct: async function(roomId, addr, ignoreProfile) {
            console.log('---get addr----', addr);
            const addrType = getAddressType(addr);
            const client = window.mxMatrixClientPeg.matrixClient;
            if (addrType === 'email') {
                return client.inviteByEmail(roomId, addr);
            } else if (addrType === 'mx-user-id') {
                const room = client.getRoom(roomId);
                if (!room) throw new Error("Room not found");

                const member = room.getMember(addr);
                if (member && ['join', 'invite'].includes(member.membership)) {
                    throw {errcode: "RIOT.ALREADY_IN_ROOM", error: "Member already invited"};
                }


                //todo  更精确的权限控制
                // if (!ignoreProfile && SettingsStore.getValue("promptBeforeInviteUnknownUsers", this.roomId)) {
                //     try {
                //         const profile = await MatrixClientPeg.get().getProfileInfo(addr);
                //         if (!profile) {
                //             // noinspection ExceptionCaughtLocallyJS
                //             throw new Error("User has no profile");
                //         }
                //     } catch (e) {
                //         throw {
                //             errcode: "RIOT.USER_NOT_FOUND",
                //             error: "User does not have a profile or does not exist."
                //         };
                //     }
                // }  

                return client.invite(roomId, addr);
            } else {
                throw new Error('Unsupported address');
            }

        },
        invite() { //TODO
            if (this.loading) return;
            this.loading = true;
            const targetIds = this.choosenMembers.map(t => t.matrix_id || t.user_id);
            const vtx = this;
            const client = window.mxMatrixClientPeg.matrixClient;
            const roomId = this.roomId;
            const room = client.getRoom(roomId);
            console.log('---hendiaoibi---', room);
            const membersMap = room.currentState.members;
            for (let id in membersMap) {
                if (id === targetIds[0] && membersMap[id].membership !== 'leave') {
                    this.loading = false;
                    return alert('该用户已存在');
                }
            }
            // if (!room) {
            //     console.error('no room')
            //     return alert('无此房间');
            // }
            let promises = [];
            targetIds.forEach(id => {

                promises.push(vtx.inviteConduct(roomId, id));
            })

            Promise.all(promises).then(() => {
                vtx.loading = false;
                // const obj = {};
                // obj.data = {room_id: roomId};
                // obj.handler = 'viewRoom';
                vtx.close({room_id: roomId, xieId: targetIds[0]});
            }).catch((e)=>{
                console.log(e)

            });
        },
        existInInviteRoom(userMatrixID){
            let inviteRooms = this.$store.state.inviteRooms;
            for(let itemroom of inviteRooms){
                let room = global.mxMatrixClientPeg.matrixClient.getRoom(itemroom.roomID)
                if(!room) continue;
                if(global.mxMatrixClientPeg.isDMInvite(room)){
                    var myMember = global.mxMatrixClientPeg.getMyMember(room);
                    let directMember = myMember.getDMInviter();
                    if(directMember == userMatrixID)
                        return itemroom.roomID;
                } 
            }
            return;
        },
        createDm: function() {
            if (this.roomId) return this.invite();
            if (this.loading) return;
            if (!this.choosenMembers || !this.choosenMembers.length) return;
            this.loading = true;
            const client = window.mxMatrixClientPeg.matrixClient;
            console.log('检查非matrix用户')
            const targetIds = this.choosenMembers.map(t => t.matrix_id || t.user_id);
            const existingRoom = DMRoomMap.shared().getDMRoomForIdentifiersEachChart(targetIds);
            console.log('------existingRoom------', existingRoom);
            let goRoom;
            const erpDm = this.erpDm;
            existingRoom.forEach(r => {
                if (erpDm && r.currentState.getStateEvents('m.room.encryption', '')) {
                    goRoom = r;
                }
                if (!erpDm && !r.currentState.getStateEvents('m.room.encryption', '')) {
                    goRoom = r;
                }

            })
            
            if (goRoom) {
                existingRoom.room_id = goRoom.roomId
                const obj = {data: goRoom, handler: 'viewRoom'};
                console.log('通过emit, 向上层组件触发viewRoom')
                this.$emit('close', obj);
                return;
            }

            const goOut = this.existInInviteRoom(targetIds[0]);
            if (goOut) {
                // alert('该用户已给您发送过邀请，请在邀请列表查看');
                this.loading = false;
                this.que = this.choosenMembers[0];
                this.anf = true;
                this.queRoomId = goOut;
                return
            }

            const createRoomOptions = {inlineErrors: true};
            //加密处理
            if (this.erpDm) {
                console.log('走了加密')
                createRoomOptions.encryption = true;
            }

            let createRoomPromise = Promise.resolve();
            const isSelf = targetIds.length === 1 && targetIds[0] === client.getUserId();
            console.log('脱出，直接靠RoomMembership触发')
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
        chooseT: function(member, idx) {
            console.log('idxxxxx', idx)
            const totalList = this.totalList;
            totalList.forEach(m => {if (m.choosen) m.choosen = false});
            totalList[idx].choosen = true;
            this.totalList = [...totalList];
            this.choosenMembers = [member];
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
        searchMember: async function() {
            const term = this.memText;
            const client = window.mxMatrixClientPeg.matrixClient;
            if (this.timer) clearTimeout(this.timer);
            if (!term) {
                this.searchedMembers = [];
                this.isSearch = false;
                await this.originStatus();
                return;
            }
            this.timer = setTimeout(async ()=>{
                const searchUsers = await UserInfo.SearchByNameKey(term, this.selfId).catch(e => console.log('组织人员搜索异常', e));
                const searchContacts = await Contact.SearchByNameKey(term, this.selfId).catch(e => console.log('联系人搜索异常', e));
                const searchDeps = await Department.SearchByNameKey(term).catch(e => console.log('部门搜索异常', e));
                const res = await client.searchUserDirectory({term}).catch(e => console.log('域用户搜索失败', e));
                console.log('----searchUsers----', searchUsers);
                console.log('----searchContacts----', searchContacts);
                console.log('----searchDeps----', searchDeps);
                console.log('----res----', res);
                let sds = [];
                if (searchDeps.length > 0) sds.push({dvd:true, txt:'部门'});
                searchDeps.forEach(s => {
                    s.type = 'dep';
                    s.avatar = s.department_id === this.rootDepId ? './static/Img/Main/primdep.png' : './static/Img/Main/secdep.png';
                    sds.push(s);
                })
                let sus = [];
                if (searchUsers.length > 0) sus.push({dvd:true, txt:'组织'});
                searchUsers.forEach(c => {
                    //avatar_url
                    //display_name
                    //user_id
                    let u = {}
                    u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    u.display_name =  c.user_display_name || c.display_name || c.user_name || '';
                    u.user_id = c.matrix_id || '';
                    u.secdis = c.user_title || c.matrix_id;
                    u.choosen = false;
                    sus.push(u);
                })
                let scs = [];
                if (searchContacts.length > 0) scs.push({dvd:true, txt:'联系人'});
                searchContacts.forEach(c => {
                    let u = {}
                    u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    u.display_name =  c.display_name || c.user_name || '';
                    u.user_id = c.matrix_id || '';
                    u.secdis = c.title || c.matrix_id;
                    u.choosen = false;
                    scs.push(u);
                })
                let mxs = [];
                let results = res.results || [];
                if (results.length >0) mxs.push({dvd:true, txt:'其他联系人'});
                results.forEach(c => {
                    c.choosen = false; 
                    c.avatar_url = client.mxcUrlToHttp(res.avatar_url) || './static/Img/User/user-40px@2x.png';
                    mxs.push(c);
                })
                const totalArray = [...scs, ...sus, ...sds, ...mxs];
                console.log('----totalArray----', totalArray);
                this.isSearch = true;
                // this.searchedMembers = [...totalArray];
                this.crumbs = [];
                this.totalList = [...totalArray];
                // client.searchUserDirectory({term}).then(r => {
                //     console.log('searchUserDirectory', r)
                //     if (r.results) {
                //         const results = r.results.map(res => {
                //             res.choosen = false; 
                //             res.avatar_url = client.mxcUrlToHttp(res.avatar_url) || './static/Img/User/user-40px@2x.png';
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
            return RoomUtil.CreateRoom(opts).then(async (res) => {
                console.log('--create success!!--', res);
                let roomId = res.room_id;
                if(roomId) Rooms.setDMRoom(roomId, opts.dmUserId);
                var senderName = await ComponentUtil.GetDisplayNameByMatrixID(opts.dmUserId);
                var roomNameInfo = [roomId, senderName];
                this.$store.commit("setIdToName", roomNameInfo);
                // const obj = {data: res, handler: 'viewRoom'};
                this.$emit('close', 'close'); // 新创建时可以靠上层组件中的监听跳跳转，无需传obj
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
        async changeLayerByCrumb(obj) {
            console.log('caonimao', this.crumbs)
            const client = window.mxMatrixClientPeg.matrixClient;
            let department_id = obj.department_id;
            if (department_id === 'lxr') {
                await this.originStatus();
            } else {
                await this.changeLayer(obj);
            }
        },
        async changeLayer(obj) {
            const client = window.mxMatrixClientPeg.matrixClient;
            let department_id = obj.department_id;
            let crumbs = this.crumbs;
            const len = crumbs.length;
            let newCrumbs = []
            if (len) {
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
            } else {
                newCrumbs.push({name:obj.display_name, department_id:obj.department_id});
            }
            newCrumbs[newCrumbs.length-1].choosen = true;
            console.log('>>>>>', newCrumbs)
            if (!this.isSearch) newCrumbs[1].name = '组织';
            if (obj.department_id === 'contact') newCrumbs[1].name = '我的联系人';
            this.crumbs = [...newCrumbs];
            if (obj.department_id === 'contact') {
                const contactUsers = await Contact.GetAllContact(this.selfId);
                console.log('contactUsers', contactUsers);
                contactUsers.forEach(c => {
                    console.log('----kanha----', client.getUser(c.matrix_id));
                    c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    c.secdis = c.title || c.matrix_id;
                })
                let totalArray = [...contactUsers];
                totalArray.forEach(t => t.choosen = false)
                this.totalList = [...totalArray];
            } else {
                const subDep = await Department.GetSubDepartment(department_id);
                const subUsers = await UserInfo.GetSubUserinfo(department_id, this.selfId);
                console.log('-----subDep-----', subDep)
                console.log('-----subUsers-----', subUsers)
                subDep.forEach(s => {
                    s.type = 'dep';
                    s.avatar = department_id === this.rootDepId ? './static/Img/Main/primdep.png' : './static/Img/Main/secdep.png';
                })
                subUsers.forEach(c=>{
                    console.log('----kanha----', client.getUser(c.matrix_id));
                    c.display_name = c.user_display_name || c.user_name;
                    c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    c.secdis = c.user_title || c.matrix_id;
                })
                let totalArray = [...subDep, ...subUsers];
                totalArray.forEach(t => t.choose = false)
                this.totalList = [...totalArray];   

            }
        },
        async originStatus() {
            const client = window.mxMatrixClientPeg.matrixClient;
            const rootDep = await Department.GetRoot();
            rootDep.type = 'dep';
            rootDep.display_name = '组织';
            rootDep.avatar = './static/Img/Main/xinzuzhi.png';
            const contactUsers = await Contact.GetAllContact(this.selfId);
            console.log('contactUsers', contactUsers);
            const cts = contactUsers.map(c => {
                let u = {}
                u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                u.display_name =  c.display_name || c.user_name || '';
                u.user_id = c.matrix_id || '';
                u.secdis = c.title || c.matrix_id;
                u.choosen = false;
                return u;
            })
            const layer = {name:'联系人', department_id:'lxr', choosen: false}
            // const dvd = {dvd:true, txt:'我的联系人'};
            // let myContact = {
            //     type: 'dep',
            //     display_name: '我的联系人',
            //     department_id: 'contact',
            //     avatar: './static/Img/Main/xincontact.png'
            // }
            this.rootDepId = rootDep.department_id;
            let totalArray = [rootDep, ...cts];
            totalArray.forEach(t => t.choosen = false)
            this.totalList = [...totalArray];
            this.crumbs = [layer];
        },
    },
    components: {
    },
    async created() {
        const client = window.mxMatrixClientPeg.matrixClient;
        this.selfId = client.getUserId();
        await this.originStatus();
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
    .xuanzekuang {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 440px;
        height: 160px;
        margin-left: -220px;
        margin-top: -80px;
        background: #FFFFFF;
        box-shadow: 0px 0px 30px 0px rgba(103, 103, 103, 0.24);
        border-radius: 4px;
        box-sizing: border-box;
        padding: 32px 20px 20px 32px;
    }
    .xuanzekuangShang {
        height: 48px;
        display: flex;
        align-items: center;
    }
    .xuanzekuangXia {
        display: flex;
        margin-top: 28px;
        flex-flow: row-reverse;
    }
    .que1 {
        height: 48px;
    }
    .que2 {
        display: flex;
        align-items: center;
        height: 22px;
    }
    .que4 {
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #000000;
        height: 22px;
        line-height: 22px;
        margin-right: 4px;
    }
    .que5 {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
        height: 20px;
        line-height: 20px;
    }
    .que3 {
        margin-top: 4px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        height: 20px;
        line-height: 20px;
    }
    .que6 {
        height: 48px;
        width: 48px;
        margin-right: 12px;
        border-radius: 50%;
    }
    .kuangti {
        border: 1px solid #DDDDDD;
        border-radius: 4px;
        margin:32px;
        margin-top: 0;
        background-color: #fff;
        flex: 1;
        margin-bottom: 0;
        overflow-y: hidden;
        display: flex;
        flex-direction: column;
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
        box-sizing: border-box;
        align-items: center;
        margin-bottom: 12px;
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
        margin-top: -234px;
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
        margin-right: 12px;
        border-radius: 50%;
    }
    .room-info {
        width: 280px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        line-height: 20px;
    }
    .room-info2 {
        height: 18px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
        line-height: 18px;
        width: 280px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
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
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #FFFFFF;
        line-height: 20px;
        letter-spacing: 0px;
    }
    .cancel-button {
        box-sizing: border-box;
        width: 100px;
        height: 32px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        margin-right: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #000000;
        line-height: 20px;
        letter-spacing: 0px;
    }
    .crumbs {
        margin-top:12px;
        margin-bottom:12px;
        display: flex;
        flex-wrap: wrap;
        margin-left: 16px;
        margin-right: 16px;
    }
    .crumbsItem {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #24B36B;
        line-height: 20px;
        letter-spacing: 0px;
        cursor: pointer;
        margin-right: 4px;
        height: 20px;
    }
    .crumbsItemActive {
        color: #000;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        line-height: 20px;
        letter-spacing: 0px;
        cursor: pointer;
        margin-right: 4px;
        height: 20px;
    }
    input::-webkit-input-placeholder{
        height: 18px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
        line-height: 18px;
    }
</style>
