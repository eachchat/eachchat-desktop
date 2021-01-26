<template>
    <div class="wrap-layer" @click.self.stop="close('close')">
        <div class="mx-create-room-dialog" v-if="matrixSync">
            <div class="mxCreaterHeader">
                <div class="mxCreaterHeaderTitle">选择联系人</div>
                <img 
                    ondragstart="return false" 
                    class="mxCreaterClose" 
                    src="../../../static/Img/Main/xincaca.png"
                    @click.self.stop="close('close')">
            </div>
            <div class="kuangti">
                <div class="kuangtiZuo">
                    <div class="search-field">
                        <div class="search-logo">
                            <!-- <i class="el-icon-search"></i> -->
                            <img style="height:20px; width:20px;" src="../../../static/Img/Main/xinsousuo.png">
                        </div>
                        <input @input="searchMember" v-model="memText" class="search-input" type="text" placeholder="搜索">
                    </div>
                    <!-- <div class="crumbsxie" v-show="crumbs.length > 1">
                        <span
                            v-for="(ele, idx) in crumbs" 
                            :key="idx"
                            class="crumbsxieItem"
                            :style="{color:(idx === crumbs.length-1 ? '#000000' : '#24B36B')}"
                            @click.stop="caonima2(ele)"
                        >{{idx === crumbs.length-1 ? ele.name : ele.name + ' /'}}</span>
                    </div> -->
                    <div class="totalListXie">
                        <div class="crumbsxie" v-show="crumbs.length > 1">
                            <span
                                v-for="(ele, idx) in crumbs" 
                                :key="idx"
                                class="crumbsxieItem"
                                :style="{color:(idx === crumbs.length-1 ? '#000000' : '#24B36B')}"
                                @click.stop="changeLayerByCrumb(ele)"
                            >{{idx === crumbs.length-1 ? ele.name : ele.name + ' /'}}</span>
                        </div>
                        <!-- <div class="totalListXieItem" v-if="crumbs.length > 1">
                            <img
                                v-if="totalChoosen"
                                style="height:20px; width:20px; margin-right:8px;"
                                src="../../../static/Img/Main/lg.png"
                                @click.stop="quanxuan(false)"
                            >
                            <img
                                v-else
                                style="height:20px; width:20px; margin-right:8px;"
                                src="../../../static/Img/Main/ljh.png"
                                @click.stop="quanxuan(true)"
                            >
                            <div class="itemF">全选</div>
                            <div 
                                class="youjiantouField"
                            >
                                {{'已选'+tn+'人'}}
                            </div>
                        </div> -->
                        <!-- <div 
                            v-for="(ele, idx) in totalList" 
                            :key="ele.id"
                            class="totalListXieItem"
                        >
                            <img 
                                v-if="crumbs.length === 1" 
                                style="height:32px; width:32px; margin-right:4px;" 
                                src="../../../static/Img/Main/xinzuzhi.png"
                            >
                            <img
                                v-else-if="ele.choosen"
                                style="height:20px; width:20px; margin-right:8px;"
                                src="../../../static/Img/Main/lg.png"
                                @click.stop="caonima1(ele, false)"
                            >
                            <img
                                v-else
                                style="height:20px; width:20px; margin-right:8px;"
                                src="../../../static/Img/Main/tmk.png"
                                @click.stop="caonima1(ele, true)"
                            >
                            <div v-if="crumbs.length === 1" class="itemF" @click.stop="caonima2(ele)">{{ele.name}}</div>
                            <div v-else-if="ele.type === 'dep'" class="itemF" @click.stop="caonima1(ele, !ele.choosen)">{{ele.name}}</div>
                            <div v-else @click.stop="caonima1(ele, !ele.choosen)" style="display:flex; align-items:center; user-select:none;">
                                <img class="shun1" :src="ele.avatar">
                                <div class="shun2">
                                    <div class="shun3">{{ele.name}}</div>
                                    <div class="shun4">{{ele.id}}</div>
                                </div>
                            </div>
                            <div 
                                class="youjiantouField"
                                @click.stop="caonima2(ele)"
                                v-if="ele.type === 'dep'"
                            >
                                <img 
                                    src="../../../static/Img/Main/yjt.png" 
                                    style="height:20px; width:20px;"
                                >
                            </div>
                        </div> -->
                        <div class="totalListXieItem" v-if="isSearch ? crumbs.length >= 1 : crumbs.length > 1 ">
                            <img
                                style="height:20px; width:20px; margin-right:8px;"
                                :src="qx === 3 ? '../../../static/Img/Main/lg.png' : (qx === 2 ? '../../../static/Img/Main/ljh.png' : '../../../static/Img/Main/tmk.png')"
                                @click.stop="setQuanxuan()"
                            >
                            <div class="itemF">全选</div>
                            <div 
                                class="youjiantouField"
                            >
                                {{'已选'+choosenMembers.length+'人'}}
                            </div>
                        </div>
                        <div 
                            v-for="(item, idx) in totalList" 
                            :key="idx"
                        >   
                            <div 
                                v-if="item.type === 'dep'"
                                class="room-item room-item-dep"
                            >   
                                <div style="display:flex; align-items:center;" @click.stop="checkWrap(item)">
                                    <img
                                        v-if="isSearch ? true : crumbs.length > 1"
                                        style="height:20px; width:20px; margin-right:8px;"
                                        :src="item.choosen === 3 ? '../../../static/Img/Main/lg.png' : (item.choosen === 2 ? '../../../static/Img/Main/ljh.png' : '../../../static/Img/Main/tmk.png')"
                                    >
                                    <img class="room-img" 
                                         style="margin-right:2px;" 
                                         :src="item.avatar"
                                    /> <!-- src="../../../static/Img/Main/yjt.png" -->
                                    <div class="user-info">
                                        <span class="room-info">{{item.display_name}}</span>
                                    </div>
                                </div>
                                <img style="height:20px; width:20px;" src="../../../static/Img/Main/yjt.png" @click.stop="changeLayer(item)">
                            </div>
                            <div v-else-if="item.dvd" class="dvd">{{item.txt}}</div>
                            <div 
                                v-else
                                class="room-item"
                                @click.stop="checkWrap(item)"
                            >
                                <img
                                    style="height:20px; width:20px; margin-right:8px;"
                                    :src="item.choosen === 3 ? '../../../static/Img/Main/lg.png' : (item.choosen === 2 ? '../../../static/Img/Main/ljh.png' : '../../../static/Img/Main/tmk.png')"
                                >
                                <img class="room-img" :src="item.avatar_url"/>
                                <div class="user-info">
                                    <span class="room-info">{{item.display_name}}</span>
                                    <span class="room-info" style="font-size:12px; color:#999999">{{item.secdis || item.matrix_id || item.user_id}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="kuangtiYou">
                    <div class="xuanzhonglie">
                        <div class="yxField">
                            <span style="margin-right:8px;">已选:</span>
                            <span>{{choosenMembers.length}}</span>
                        </div>
                        <div 
                            class="totalListXieItem"
                            v-for="(ele, idx) in choosenMembers"
                            :key="ele.name+idx"
                        >
                            <img class="shun1" :src="ele.avatar_url">
                            <div class="shun2">
                                <div class="shun3">{{ele.display_name}}</div>
                                <div class="shun4">{{ele.secdis}}</div>
                            </div>
                            <div class="shun5">
                                <img 
                                    class="shun6" 
                                    src="../../../static/Img/Chat/delete-20px@2x.png"
                                    @click.stop="checkWrap(ele, 1)"
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="submit-field">
                <div class="cancel-button" @click.stop="close('close')">取消</div>
                <!-- <div class="submit-button" 
                    :style="{'background': (loading || !choosenMembers || !choosenMembers.length) ? '#A7E0C4' : '#24B36B'}" 
                    @click.stop="createDm">创建</div> -->
                <div 
                    class="submit-button"
                    style="background:#A7E0C4"
                    v-if="loading || !choosenMembers || !choosenMembers.length"
                >确定</div>
                <div 
                    class="submit-button" 
                    style="background:#24B36B"
                    @click.stop="createXie"
                    v-else
                >确定</div>
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
import {ComponentUtil} from '../script/component-util';
let gtn = 0;
let gChoosenMembers = [];
let mxMap = {};
const OPTS = {
    limit: 200,
};
export default {
    name: 'mxXxr',
    props: {
        erpDm: {
            type: Boolean,
            default: false
        },
        roomInfo: {
            type: Object,
            default: undefined
        },
        creDir: {
            type: Boolean,
            default: false 
        },
        dmMember: {
            type: Object,
            default:()=>{}
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
            choosenMembers: [], //
            crumbs: [],
            totalList: [],
            isSearch: false,
            mxTree: undefined,
            tn: 0,
            mxMemMap: {},
            mxDepMap: {},
            qx: 1
        }
    },
    timer: null,
    methods: {
        async createXie() {
            // if (this.loading) return;
            // this.loading = true;
            // if (this.roomInfo) { //走创建
            //     let {createOpts, commu} = this.roomInfo;
            //     const client = window.mxMatrixClientPeg.matrixClient;
            //     const selfId = client.getUserId();
            //     if (!createOpts.name) {
            //         let name = '';
            //         for(let i = 0; i<this.choosenMembers.length; i++) {
            //             let end = (i === 3 || i === this.choosenMembers.length - 1) ? '...' : ','
            //             name = name + this.choosenMembers[i].name + end;
            //         }
            //         createOpts.name = name;
            //     }
            //     let invite = [];
            //     this.choosenMembers.map(c => {
            //         if (c.id && c.id !== selfId) invite.push(c.id);
            //     })
            //     createOpts.invite = invite;
            //     console.log('----post createOpts----', createOpts)
            //     return client.createRoom(createOpts).then((res) => {
            //         console.log('create success!!', res);
            //         client.setRoomDirectoryVisibility(
            //             res.room_id,
            //             commu ? 'public' : 'private',
            //         ).then(()=>{
            //             this.loading = false;
            //             this.$emit('close');
            //             console.log('广场设置完成');
            //         })
            //     }).catch((e)=>{this.loading = false;})
            // } else { //走添加
            //     //暂无此模版添加需求
            //     this.loading = false;
            // }

            //////////
            const client = window.mxMatrixClientPeg.matrixClient;
            const selfId = client.getUserId();
            let invite = [];
            if (this.loading) return;
            this.loading = true;
            this.choosenMembers.map(c => {
                if (c.user_id && c.user_id !== selfId) invite.push(c);
            })
            invite = invite.map( c => {
                let o = {
                    id: c.user_id,
                    name: c.display_name
                }
                return o;
            })
            if (this.creDir) {
                let createOpts = {};
                const dspName = await ComponentUtil.GetDisplayNameByMatrixID(selfId);
                let name = dspName + '、';
                let dmUser = {
                    id: this.dmMember.userId,
                    name: this.dmMember.dspName || this.dmMember.name
                };
                let xie = 0;
                invite.forEach(inv => {
                    if (inv.id === this.dmMember.userId) xie = 1;
                })
                if (!xie) invite.unshift(dmUser);
                for(let i = 0; i<2; i++) {
                    let end = '、';
                    if (i === 0 && invite.length === 1) end = '';
                    if (i === 1 && invite.length === 2) end = '';
                    if (i === 1 && invite.length > 2) end = '...';
                    if (invite[i]) name = name + invite[i].name + end;
                }
                createOpts.name = name;
                createOpts.invite = invite.map(m => m.id);

                console.log('----post createOpts----', createOpts)
                return client.createRoom(createOpts).then((res) => {
                    this.$emit('close', 'closeRight');
                    this.loading = false;
                }).catch((e)=>{
                    console.log('???', e)
                    this.loading = false;
                })
            } else {
                return this.$emit('close', {invite});     
            }     
        },
        mxTreeWalk(obj) {
            // console.log('-----mxTreeWalk----', obj)
            if (obj.type === 'user' && obj.choosen) {
                // console.log('加了没有')
                // if (obj.choosen) { gtn += 1; this.choosenMembers = [...this.choosenMembers, obj];}
                // if (!obj.choosen) { this.choosenMembers = this.choosenMembers.filter(c => c.id !== obj.id)}
                gtn += 1;
                gChoosenMembers.push(obj);
            }
            if (obj.czs) {
                obj.czs.forEach(o => {
                    this.mxTreeWalk(o);
                })
            }
        },
        suansuoyou() {
            gtn = 0;
            gChoosenMembers = [];
            this.tn = gtn;
            // console.log('suansuoyou', this.mxTree);
            this.choosenMembers = [...gChoosenMembers];
            this.mxTreeWalk(this.mxTree);
            // console.log('gtn', gtn);
            this.tn = gtn;
            this.choosenMembers = [...gChoosenMembers];
            return this.tn;
        },
        async caonima4(ele) { //向下迭代状态  只针对dep类型
            const client = window.mxMatrixClientPeg.matrixClient;
            let xie = ele.choosen;
            if (ele.czs && ele.czs.length) {
                let len = ele.czs.length;
                for(let i = 0; i <len; i++) {
                    ele.czs[i].choosen = xie;
                    if (ele.czs[i].type === 'dep') await this.caonima4(ele.czs[i]);
                }
            } else {
                let subDeps = await Department.GetSubDepartment(ele.id);
                let subUsers = await UserInfo.GetSubUserinfo(ele.id);
                subDeps = subDeps.map(s => {
                    let o = {
                        id: s.department_id, 
                        type: 'dep', 
                        data: s, 
                        parent: ele, 
                        czs:[],
                        choosen: xie,
                        name: s.display_name
                    }
                    return o;
                })
                subUsers = subUsers.map(s => {
                    s.avatar_url = (client.getUser(s.matrix_id) ? client.mxcUrlToHttp(client.getUser(s.matrix_id).avatarUrl || client.getUser(s.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    let o = {
                        id: s.matrix_id, 
                        type: 'user', 
                        data: s, 
                        parent: ele,
                        choosen: xie,
                        name: s.user_display_name || s.display_name || s.user_name,
                        avatar: s.avatar_url
                    }
                    return o;
                })
                ele.czs = [...subDeps, ...subUsers];
                let len = ele.czs.length;
                for(let i = 0; i <len; i++) {
                    ele.czs[i].choosen = xie;
                    if (ele.czs[i].type === 'dep') await this.caonima4(ele.czs[i]);
                }
            }
        },
        async caonima3(ele) { //向上迭代状态
            if (ele.parent) {
                let xie = true;
                ele.parent.czs.forEach(c => {
                    if (!c.choosen) xie = false;
                })
                ele.parent.choosen = xie;
                await this.caonima3(ele.parent);
            }
        },
        async caonima1(ele, choosen) {  //用于勾选
            ele.choosen = choosen;
            // if (ele.type === 'user') {
            //     if (ele.choosen) {
            //         this.tn += 1;
            //         this.choosenMembers.push(ele);
            //     }
            //     if (!ele.choosen) {
            //         this.tn -= 1;
            //         this.choosenMembers = this.choosenMembers.filter(c => c.id !== ele.id);
            //     }
            // }
            if (ele.type === 'dep') { //选中或反选 部门
                await this.caonima3(ele)
                await this.caonima4(ele)
            } else { //选中或反选 成员
                await this.caonima3(ele)
            }
            // this.choosenMembers = this.choosenMembers.filter(c => c.id !== ele.id);
            this.mxTree = {...this.mxTree}
        },
        async caonima2(ele) { //用于列表中dep点击转换层级 以及 crumbs点击层级转换 只针对dep类型
            const client = window.mxMatrixClientPeg.matrixClient;
            if (ele.czs && ele.czs.length) {
                let crumbs = this.crumbs;
                const len = crumbs.length;
                let newCrumbs = [];
                for(let i=0; i<len; i++) {
                    newCrumbs.push(crumbs[i]);
                    if (crumbs[i].id === ele.id) {
                        break;
                    }
                    if (i === len-1) {
                        newCrumbs.push(ele);
                    }
                }
                this.crumbs = [...newCrumbs];
                this.totalList = [...ele.czs];
                return;
            }
            let subDeps = await Department.GetSubDepartment(ele.id);
            let subUsers = await UserInfo.GetSubUserinfo(ele.id);
            subDeps = subDeps.map(s => {
                let o = {
                    id: s.department_id, 
                    type: 'dep', 
                    data: s, 
                    parent: ele, 
                    czs:[],
                    choosen: false,
                    name: s.display_name,
                }
                return o;
            })
            subUsers = subUsers.map(s => {
                console.log('-----kankan-----', client.getUser(s.matrix_id))
                s.avatar_url = (client.getUser(s.matrix_id) ? client.mxcUrlToHttp(client.getUser(s.matrix_id).avatarUrl || client.getUser(s.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                let o = {
                    id: s.matrix_id, 
                    type: 'user', 
                    data: s, 
                    parent: ele,
                    choosen: false,
                    name: s.user_display_name || s.display_name || s.user_name,
                    avatar: s.avatar_url
                }
                return o;
            })
            this.crumbs.push(ele);
            ele.czs = [...subDeps, ...subUsers];
            this.totalList = [...ele.czs];
            this.mxTree = {...this.mxTree}
        },
        createDm: function() {
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
        // searchMember: function() {
        //     const term = this.memText;
        //     const client = window.mxMatrixClientPeg.matrixClient;
        //     if (this.timer) clearTimeout(this.timer);
        //     if (!term) {
        //         this.searchedMembers = [];
        //         this.isSearch = false;
        //         return
        //     }
        //     this.timer = setTimeout(async ()=>{
        //         const searchUsers = await UserInfo.SearchByNameKey(term).catch(e => console.log('组织人员搜索异常', e));
        //         const searchContacts = await Contact.SearchByNameKey(term).catch(e => console.log('联系人搜索异常', e));
        //         const res = await client.searchUserDirectory({term}).catch(e => console.log('域用户搜索失败', e));
        //         console.log('----searchUsers----', searchUsers);
        //         console.log('----searchContacts----', searchContacts);
        //         console.log('----res----', res);
        //         let sus = [];
        //         // sus.push({dvd:true, txt:'组织人员'})
        //         searchUsers.forEach(c => {
        //             //avatar_url
        //             //display_name
        //             //user_id
        //             let u = {}
        //             u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
        //             u.display_name =  c.user_display_name || c.display_name || c.user_name || '';
        //             u.user_id = c.matrix_id || '';
        //             c.choosen = false;
        //             sus.push(u);
        //         })
        //         let scs = [];
        //         // scs.push({dvd:true, txt:'我的联系人'})
        //         searchContacts.forEach(c => {
        //             let u = {}
        //             u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
        //             u.display_name =  c.display_name || c.user_name || '';
        //             u.user_id = c.matrix_id || '';
        //             c.choosen = false;
        //             scs.push(u);
        //         })
        //         let mxs = [];
        //         // mxs.push({dvd:true, txt:'其他联系人'})
        //         let results = res.results || [];
        //         results.forEach(c => {
        //             c.choosen = false; 
        //             c.avatar_url = client.mxcUrlToHttp(res.avatar_url) || './static/Img/User/user-40px@2x.png';
        //             mxs.push(c);
        //         })
        //         const totalArray = [...sus, ...scs, ...mxs];
        //         console.log('----totalArray----', totalArray);
        //         this.isSearch = true;
        //         this.searchedMembers = [...totalArray];
        //     },320)
        // },
        chooseXin(item) {
            let choosenMembers = this.choosenMembers;
            let totalList = this.totalList;
            let searchedMembers = this.searchedMembers;
            if (item.checked) {
                choosenMembers.push(item);
                searchedMembers.forEach(s => {
                    if (s.user_id == item.user_id) s.checked = true;
                })
                totalList.forEach(s => {
                    if (s.user_id == item.user_id) s.checked = true;
                })
            } else {
                choosenMembers = choosenMembers.filter(c => c.user_id != item.user_id)
                searchedMembers.forEach(s => {
                    if (s.user_id == item.user_id) s.checked = false;
                })
                totalList.forEach(s => {
                    if (s.user_id == item.user_id) s.checked = false;
                })
            }
            this.choosenMembers = [...choosenMembers];
            this.totalList = [...totalList];
            this.searchedMembers = [...searchedMembers];
        },
        removeMember(item) {

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
                if(roomId) Rooms.setDMRoom(roomId, opts.dmUserId);
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
            if (department_id === this.crumbs[0].department_id) {
                const rootDep = await Department.GetRoot();
                const dvd = {dvd:true, txt:'联系人'};
                const contactUsers = await Contact.GetAllContact();
                contactUsers.forEach(c => {
                    c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                })
                rootDep.type = 'dep';
                rootDep.display_name = '组织';
                let totalArray = [rootDep, dvd, ...contactUsers];
                totalArray.forEach(t => t.choosen = false);
                this.totalList = [...totalArray];
                this.crumbs[0].choosen = true;
                this.crumbs = [this.crumbs[0]];
            } else {
                this.changeLayer(obj);
            }
        },
        async changeLayer(obj) {
            const client = window.mxMatrixClientPeg.matrixClient;
            let department_id = obj.department_id;
            let crumbs = this.crumbs;
            const len = crumbs.length;
            let mxTree = this.mxTree; 
            let newCrumbs = [];
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
            newCrumbs[0].name = '组织';
            this.crumbs = [...newCrumbs];
            const subDep = await Department.GetSubDepartment(department_id);
            const subUsers = await UserInfo.GetSubUserinfo(department_id);
            subDep.forEach(s=>s.type = 'dep')
            subUsers.forEach(c=>{
                c.display_name = c.user_display_name || c.user_name;
                c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                
            })
            let totalArray = [...subDep, ...subUsers];
            totalArray.forEach(t => t.choose = false)
            this.totalList = [...totalArray];   
        },
        quanxie(obj) {
            if (obj.choosen) this.tn += 1;
            if (obj.czs) {
                obj.czs.forEach(o => {
                    this.quanxie(o);
                })
            }
        },
        async quanxuan(choosen) {
            let len = this.crumbs.length;
            let ele = this.crumbs[len-1];
            await this.caonima1(ele, choosen)
        },



        setChoosenMembers(obj, choose) {
            const id = obj.matrix_id || obj.user_id;
            const client = window.mxMatrixClientPeg.matrixClient;  
            let choosenMembers = [...this.choosenMembers];      
            if (choose) {
                const list = []
                this.totalList.forEach(c => {
                    if(!c.dvd && c.type !== 'dep') {
                        const cid = c.matrix_id || c.user_id;
                        if (cid === id) {
                            let u = {};
                            u.avatar_url = (client.getUser(id) ? client.mxcUrlToHttp(client.getUser(id).avatarUrl || client.getUser(id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                            u.display_name =  c.user_display_name || c.display_name || c.user_name || '';
                            u.user_id = id || '';
                            u.secdis = c.user_title || id;
                            list.push(u);
                        }
                    }
                })
                let u = {}
                if (list.length) {
                    u = list[0];
                } else {
                    const c = obj
                    u.avatar_url = (client.getUser(id) ? client.mxcUrlToHttp(client.getUser(id).avatarUrl || client.getUser(id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    u.display_name =  c.user_display_name || c.display_name || c.user_name || '';
                    u.user_id = id || '';
                    u.secdis = c.user_title || id;
                }
                let you = false;
                choosenMembers.forEach(c => {
                    const cid = c.matrix_id || c.user_id;
                    if (cid === id) you = true;
                })
                if (!you) choosenMembers.push(u);
            } else {
                choosenMembers = choosenMembers.filter(c => {
                    const cid = c.matrix_id || c.user_id;
                    return cid !== id;
                })
            }
            this.choosenMembers = [...choosenMembers];
            console.log('this.choosenMembers====', this.choosenMembers)
        },
        // 重构后方法
        setQuanxuan() {
            let choose;
            if ( this.qx === 3 || this.qx === 2) {
                choose = 1;
                this.qx = 1; 
            } else {
                choose = 3
                this.qx = 3;
            };
            let totalList = [...this.totalList];
            totalList.forEach(t => {
                t.choosen = choose;
            });
            this.totalList = [...totalList];
            const crb = this.crumbs[this.crumbs.length-1];
            const obj = {type:'dep', department_id:crb.department_id};
            this.checkWrap(obj, choose);
        },
        matchQuanxuan() {
            if (this.crumbs.length) {
                const crb = this.crumbs[this.crumbs.length-1];
                const obj = {type:'dep', department_id:crb.department_id};
                this.qx = this.matchWithMap(obj);
            }
        },
        async checkWrap(obj, check) {
            let choose;
            if (check) {
                choose = check;
                // this.totalList.forEach(t => {
                //     const id = obj.matrix_id || obj.user_id;
                //     const tid = t.matrix_id || t.user_id;
                //     if (tid === id) t.choosen = choose;
                // })
            } else {
                if ( obj.choosen === 3 || obj.choosen === 2) choose = 1;
                if ( obj.choosen === 1) choose = 3;
            }
            await this.chooseOrCancel(obj, choose);
            let totalList = [...this.totalList];
            totalList.forEach((t) => {
                if (!t.dvd) t.choosen = this.matchWithMap(t);
            });
            this.totalList = [...totalList];
            this.matchQuanxuan();
        },
        async chooseOrCancel(obj, choose) {
            console.log('chooseOrCancel choose----', choose);
            console.log('chooseOrCancel choose----', obj);
            obj.choosen = choose;
            if (obj.type !== 'dep') {
                const id = obj.matrix_id || obj.user_id;
                const xie = (choose === 3) ? 1 : 0;
                this.mxMemMap[id] = xie; //更新表内该人员信息
                this.setChoosenMembers(obj, xie);
                const deps = await Department.GetBelongDepartmentsByMatrixID(id);
                const len = deps.length;
                for(let i=len-1; i>=0; i--) {
                    await this.fillDep(deps[i].department_id);
                }
            } else {
                await this.fillDepCheck(obj.department_id, choose);
                const deps = await Department.GetBelongDepartmentsByDepartmentID(obj.department_id);
                const len = deps.length;
                for(let i=len-1; i>=0; i--) {
                    await this.fillDep(deps[i].department_id);
                }
            }
        },

        async fillDepCheck(department_id, check) { //选择部门时 向下
            if (!this.mxDepMap[department_id]) {
                this.mxDepMap[department_id] = {};
                this.mxDepMap[department_id].check = check;
                const subDep = await Department.GetSubDepartment(department_id);
                const subUsers = await UserInfo.GetSubUserinfo(department_id);
                const len = subDep.length + subUsers.length;
                if (!len) {
                    //无操作
                } else {
                    const arr = [];
                    subUsers.forEach(s => {
                        const xie = (check === 3) ? 1 : 0;
                        this.mxMemMap[s.matrix_id] = xie;
                        arr.push(s.matrix_id);
                        this.setChoosenMembers(s, xie);
                    })
                    subDep.forEach( async (s) => {
                        await this.fillDepCheck(s.department_id, check);
                        arr.push(s.department_id);                   
                    })
                    this.mxDepMap[department_id].arr = arr;
                }
            } else {
                // if (department_id === "a512017BA6FC7DDNYRs0") console.log('查看', check)
                // console.log('yyyyy')
                this.mxDepMap[department_id].check = check;
                if (this.mxDepMap[department_id].arr && this.mxDepMap[department_id].arr.length) {
                    const subUsers = await UserInfo.GetSubUserinfo(department_id);
                    subUsers.forEach(s => {
                        const xie = (check === 3) ? 1 : 0;
                        this.mxMemMap[s.matrix_id] = xie;
                        this.setChoosenMembers(s, xie);
                    });
                    this.mxDepMap[department_id].arr.forEach(async (id) => {
                        if (this.mxMemMap[id] !== undefined) {
                            this.mxMemMap[id] = (check === 3) ? 1 : 0;
                        } else {
                            await this.fillDepCheck(id, check);
                        }
                    })
                }
            }
        },
        async fillDep(department_id) { //选择人员时 向上
            if (!this.mxDepMap[department_id]) {
                this.mxDepMap[department_id] = {};
                const subDep = await Department.GetSubDepartment(department_id);
                const subUsers = await UserInfo.GetSubUserinfo(department_id);
                // subUsers.forEach(s => {
                //     this.mxMemMap[s.matrix_id] = this.mxMemMap[s.matrix_id] || 0;
                // })
                // for(let i = 0; i < subDep.length; i++) {
                //     await this.fillDep(subDep[i].department_id);
                // }
                const arr = [];
                subUsers.forEach(s => {
                    arr.push(s.matrix_id);
                })
                subDep.forEach(s => {
                    arr.push(s.department_id);
                })
                if (!arr.length) {
                    this.mxDepMap[department_id].check = 1;
                } else {
                    this.mxDepMap[department_id].arr = arr;
                    const len = this.mxDepMap[department_id].arr.length;
                    let i = 0;
                    let hg = false;
                    arr.forEach(id => {
                        if (this.mxMemMap[id]) i = i+1;
                        if (this.mxDepMap[id] && this.mxDepMap[id].check === 3) i = i+1;
                        if (this.mxDepMap[id] && this.mxDepMap[id].check === 2) hg = true;
                    });
                    if (i == 0) {this.mxDepMap[department_id].check = 1;} //未选
                    if (i == 0 && hg) {this.mxDepMap[department_id].check = 2;} //横杆
                    if (i == len) {this.mxDepMap[department_id].check = 3;} //全选
                    if (i>0 && i<len) {this.mxDepMap[department_id].check = 2;} //横杠
                }
            } else {
                if (this.mxDepMap[department_id].arr && this.mxDepMap[department_id].arr.length) {
                    const arr = this.mxDepMap[department_id].arr;
                    const len = this.mxDepMap[department_id].arr.length;
                    let i = 0;
                    let hg = false;
                    arr.forEach(id => {
                        if (this.mxMemMap[id]) i = i+1;
                        if (this.mxDepMap[id] && this.mxDepMap[id].check === 3) i = i+1;
                        if (this.mxDepMap[id] && this.mxDepMap[id].check === 2) hg = true;                       
                    })
                    if (i == 0) {this.mxDepMap[department_id].check = 1;} //未选
                    if (i == 0 && hg) {this.mxDepMap[department_id].check = 2;} //横杆
                    if (i == len) {this.mxDepMap[department_id].check = 3;} //全选
                    if (i>0 && i<len) {this.mxDepMap[department_id].check = 2;} //横杠
                } else {
                    // 此时不改变
                }
            }
        },
        matchWithMap(obj) {
            // console.log('matchWithMap', obj);
            // console.log('mxMemMap', this.mxMemMap);
            // console.log('mxDepMap', this.mxDepMap);
            if (obj.type !== 'dep') {
                let id = obj.matrix_id || obj.user_id;
                console.log('id', id)
                if (this.mxMemMap[id]) return 3; //选中3
                return 1; //未选1
            }
            if (!this.mxDepMap[obj.department_id]) return 1; //部门 不在表中则为未选1
            return this.mxDepMap[obj.department_id].check; // 1未选 2横杠 3全选
            
        },
        quanxuanZhuangtai() {

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
                const contactUsers = await Contact.GetAllContact();
                console.log('contactUsers', contactUsers);
                contactUsers.forEach(c => {
                    console.log('----kanha----', client.getUser(c.matrix_id));
                    c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    c.secdis = c.title || c.matrix_id;
                })
                let totalArray = [...contactUsers];
                totalArray.forEach((t) => {
                    if (!t.dvd) t.choosen = this.matchWithMap(t);
                });
                this.totalList = [...totalArray];
            } else {
                const subDep = await Department.GetSubDepartment(department_id);
                const subUsers = await UserInfo.GetSubUserinfo(department_id);
                console.log('-----subDep-----', subDep)
                console.log('-----subUsers-----', subUsers)
                subDep.forEach(s => {
                    s.type = 'dep';
                    s.avatar = department_id === this.rootDepId ? '../../../static/Img/Main/primdep.png' : '../../../static/Img/Main/secdep.png';
                })
                subUsers.forEach(c=>{
                    console.log('----kanha----', client.getUser(c.matrix_id));
                    c.display_name = c.user_display_name || c.user_name;
                    c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    c.secdis = c.user_title || c.matrix_id;
                })
                let totalArray = [...subDep, ...subUsers];
                totalArray.forEach((t) => {
                    if (!t.dvd) t.choosen = this.matchWithMap(t);
                });
                this.totalList = [...totalArray];   

            }
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
                const searchUsers = await UserInfo.SearchByNameKey(term).catch(e => console.log('组织人员搜索异常', e));
                const searchContacts = await Contact.SearchByNameKey(term).catch(e => console.log('联系人搜索异常', e));
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
                    s.avatar = s.department_id === this.rootDepId ? '../../../static/Img/Main/primdep.png' : '../../../static/Img/Main/secdep.png';
                    s.choosen = this.matchWithMap(s);
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
                    u.choosen = this.matchWithMap(c);
                    sus.push(u);
                })
                let scs = [];
                if (searchContacts.length > 0) scs.push({dvd:true, txt:'我的联系人'});
                searchContacts.forEach(c => {
                    let u = {}
                    u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    u.display_name =  c.display_name || c.user_name || '';
                    u.user_id = c.matrix_id || '';
                    u.secdis = c.title || c.matrix_id;
                    u.choosen = this.matchWithMap(c);
                    scs.push(u);
                })
                let mxs = [];
                let results = res.results || [];
                if (results.length >0) mxs.push({dvd:true, txt:'其他联系人'});
                results.forEach(c => {
                    c.choosen = this.matchWithMap(c);
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
        async originStatus() {
            const client = window.mxMatrixClientPeg.matrixClient;
            const rootDep = await Department.GetRoot();
            rootDep.type = 'dep';
            rootDep.display_name = '组织';
            rootDep.avatar = '../../../static/Img/Main/xinzuzhi.png';
            const contactUsers = await Contact.GetAllContact();
            const cts = contactUsers.map(c => {
                let u = {}
                u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                u.display_name =  c.display_name || c.user_name || '';
                u.user_id = c.matrix_id || '';
                u.secdis = c.title || c.matrix_id;
                u.choosen = this.matchWithMap(c);
                return u;
            })

            const layer = {name:'联系人', department_id:'lxr', choosen: false}
            console.log('ctsssssss', cts)
            // const dvd = {dvd:true, txt:'我的联系人'};
            // let myContact = {
            //     type: 'dep',
            //     display_name: '我的联系人',
            //     department_id: 'contact',
            //     avatar: '../../../static/Img/Main/xincontact.png'
            // }
            this.rootDepId = rootDep.department_id;
            let totalArray = [rootDep, ...cts];
            // totalArray.forEach(t => t.choosen = false)
            this.totalList = [...totalArray];
            this.crumbs = [layer];
        }

    },
    components: {
    },
    async created() {
        await this.originStatus();
        let hh = await Department.GetBelongDepartmentsByMatrixID("@vincentliu.ai:matrix.each.chat");
        console.log('hhhhh', hh);
        return
        // 
        const client = window.mxMatrixClientPeg.matrixClient;
        const rootDep = await Department.GetRoot();
        rootDep.type = 'dep';
        rootDep.display_name = '组织';
        let root = {
            id: rootDep.department_id, 
            type: 'dep', 
            data: rootDep, 
            parent: null, 
            czs:[],
            choosen: false,
            name: rootDep.display_name

        }
        let subDeps = await Department.GetSubDepartment(root.id);
        let subUsers = await UserInfo.GetSubUserinfo(root.id);
        subDeps = subDeps.map(s => {
            let o = {
                id: s.department_id,
                type: 'dep', 
                data: s, 
                parent: root, 
                czs:[],
                choosen: false,
                name: s.display_name
            }
            return o;
        })
        subUsers = subUsers.map(s => {
            s.avatar_url = (client.getUser(s.matrix_id) ? client.mxcUrlToHttp(client.getUser(s.matrix_id).avatarUrl || client.getUser(s.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
            let o = {
                id: s.matrix_id, 
                type: 'user', 
                data: s, 
                parent: root,
                choosen: false,
                name: s.user_display_name || s.display_name || s.user_name,
                avatar: s.avatar_url
            }
            return o;
        })
        root.czs = [...subDeps, ...subUsers];
        this.crumbs = [root];
        this.mxTree = {...root};
        this.totalList = [...subDeps, ...subUsers];
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
        },
        mxTree: {
            handler: function(val) {
                const vtx = this;
                console.log('jtccc')
                this.suansuoyou()
            }
        }
    },
    computed: {
        ...mapState({
            matrixSync: state => state.common.matrixSync
        }),
        totalChoosen() {
            let xie = true;
            this.totalList.forEach(t => {
                if (!t.choosen) xie = false;
            })
            return xie;
        }
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
    .youjiantouField {
        flex: 1;
        display: flex;
        flex-direction: row-reverse;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
        
    }
    .totalListXie {
        margin-top: 12px;
        margin-bottom: 12px;
        flex: 1;
        overflow-y: scroll;
    }
    .totalListXieItem {
        height: 48px;
        display: flex;
        align-items: center;
    }
    .shun1 {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 12px;
    }
    .shun2 {
        width: 85%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .shun3 {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        letter-spacing: 0px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 20px;
        line-height: 20px;
    }
    .shun4 {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #999999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 18px;
        line-height: 18px;

    }
    .shun5 {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
    }
    .shun6 {
        height: 20px;
        width: 20px;
    }
    .itemF {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        // line-height: 20px;
        letter-spacing: 0px;
    }
    .crumbsxie {
        margin-top:12px;
        margin-bottom:12px;
        display: flex;
        flex-wrap: wrap;
    }
    .crumbsxieItem {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #24B36B;
        // line-height: 20px;
        letter-spacing: 0px;
        cursor: pointer;
        margin-right: 4px;
        height: 20px;
    }
    .yxField {
        height: 24px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        letter-spacing: 0px;
    }
    .kuangti {
        border: 1px solid #DDDDDD;
        border-radius: 4px;
        margin-left: 32px;
        margin-right: 32px;
        background-color: #fff;
        display: flex;
        height: 340px;
    }
    .kuangtiZuo {
        width: 50%;
        box-sizing: border-box;
        border-right: 1px solid #DDDDDD;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
    }
    .kuangtiYou {
        width: 50%;
        box-sizing: border-box;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
    }
    .xuanzhonglie {
        flex: 1;
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
        padding-left: 12px;
        padding-right: 12px;
        background-color: #fff;
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
        width: 704px;
        height: 468px;
        background: #fff;
        top: 50%;
        left: 50%;
        margin-top: -234px;
        margin-left: -352px;
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
        width: 80px;
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
        background-color: #fff;
        // width: 100%;
        box-sizing: border-box;
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
        border-radius: 50%;
    }
    .room-info {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        line-height: 20px;
        letter-spacing: 0px;
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
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
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
        display: flex;
        margin-left: 16px;
        font-size: 12px;
        flex-wrap: wrap;
        margin-top: 8px;
    }
    .crumbsItem {
        color: #24B36B;
        height: 20px;
    }
    .crumbsItemActive {
        color: #000;
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
